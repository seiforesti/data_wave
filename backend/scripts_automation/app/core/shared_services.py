"""
Shared Services Coordinator - Cross-Group Interconnection System

This module provides shared functionality across all 6 data governance groups:
- Data Sources
- Compliance 
- Classifications
- Scan Rule Sets
- Catalog
- Scan Logic

Ensures cohesive workflows, compliance checks, and collaboration.
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional, Set, Callable
from dataclasses import dataclass
from enum import Enum
import json
import logging
from datetime import datetime, timedelta
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Import models from all groups
from app.models.auth_models import User, RbacAuditLog
from app.models.compliance_models import ComplianceFramework, ComplianceRule
from app.models.workflow_models import Workflow, WorkflowStep
from app.models.collaboration_models import WorkspaceCollaboration, UserWorkspace
from app.core.unified_rbac import UnifiedRBACEngine, check_unified_permission

logger = logging.getLogger(__name__)

class ResourceType(Enum):
    """Resource types across all groups"""
    DATA_SOURCE = "data_source"
    SCAN = "scan"
    SCAN_RULE_SET = "scan_rule_set"
    CLASSIFICATION = "classification"
    COMPLIANCE_RULE = "compliance_rule"
    CATALOG_ITEM = "catalog_item"
    WORKFLOW = "workflow"
    REPORT = "report"

class ActivityType(Enum):
    """Cross-group activity types"""
    CREATED = "created"
    UPDATED = "updated"
    DELETED = "deleted"
    DEPLOYED = "deployed"
    COMPLIANCE_CHECK = "compliance_check"
    WORKFLOW_INITIATED = "workflow_initiated"
    COLLABORATION_INVITED = "collaboration_invited"
    SCAN_COMPLETED = "scan_completed"
    CLASSIFICATION_ASSIGNED = "classification_assigned"

class ComplianceStatus(Enum):
    """Unified compliance status across groups"""
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PENDING_REVIEW = "pending_review"
    VIOLATION = "violation"
    UNKNOWN = "unknown"

@dataclass
class SharedResourceContext:
    """Context for shared resources across groups"""
    resource_id: str
    resource_type: ResourceType
    group_source: str
    metadata: Dict[str, Any]
    compliance_status: ComplianceStatus
    active_workflows: List[str]
    collaborators: List[int]
    created_by: int
    created_at: datetime
    last_modified: datetime

@dataclass
class CrossGroupActivity:
    """Activity that affects multiple groups"""
    activity_id: str
    activity_type: ActivityType
    source_group: str
    target_groups: List[str]
    resource_context: SharedResourceContext
    initiated_by: int
    payload: Dict[str, Any]
    timestamp: datetime

class SharedServicesCoordinator:
    """
    Coordinates shared functionality across all 6 groups to ensure cohesive operation.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.rbac_engine = UnifiedRBACEngine(db)
        self.executor = ThreadPoolExecutor(max_workers=10)
        
        # Group service mappings
        self.group_services = {
            "data_sources": "app.services.data_source_service",
            "scan_rule_sets": "app.services.scan_rule_set_service", 
            "classifications": "app.services.classification_service",
            "compliance": "app.services.compliance_rule_service",
            "catalog": "app.services.catalog_service",
            "scan_logic": "app.services.scan_service"
        }
        
        # Cross-group compliance frameworks
        self.compliance_frameworks = {
            "GDPR": ["data_sources", "classifications", "catalog", "compliance"],
            "HIPAA": ["data_sources", "classifications", "scan_rule_sets", "compliance"],
            "SOX": ["data_sources", "catalog", "compliance", "scan_logic"],
            "CCPA": ["data_sources", "classifications", "compliance"],
            "PCI_DSS": ["data_sources", "scan_rule_sets", "compliance", "scan_logic"]
        }
    
    def get_compliance_status_for_resource(
        self, 
        resource_type: str, 
        resource_id: str,
        user_id: int
    ) -> Dict[str, Any]:
        """
        Get comprehensive compliance status for any resource across all applicable frameworks.
        """
        try:
            # Check permission to view compliance status
            if not check_unified_permission(self.db, user_id, "view", "compliance", resource_id):
                return {"error": "Insufficient permissions to view compliance status"}
            
            compliance_status = {
                "resource_id": resource_id,
                "resource_type": resource_type,
                "overall_status": ComplianceStatus.UNKNOWN.value,
                "framework_statuses": {},
                "violations": [],
                "recommendations": [],
                "last_checked": datetime.utcnow().isoformat()
            }
            
            # Check against all applicable frameworks
            for framework, applicable_groups in self.compliance_frameworks.items():
                group_type = self._map_resource_type_to_group(resource_type)
                if group_type in applicable_groups:
                    framework_status = self._check_framework_compliance(
                        framework, resource_type, resource_id, user_id
                    )
                    compliance_status["framework_statuses"][framework] = framework_status
            
            # Determine overall status
            compliance_status["overall_status"] = self._calculate_overall_compliance_status(
                compliance_status["framework_statuses"]
            )
            
            return compliance_status
            
        except Exception as e:
            logger.error(f"Error getting compliance status for {resource_type}:{resource_id}: {str(e)}")
            return {"error": f"Failed to get compliance status: {str(e)}"}
    
    def create_workflow_for_action(
        self, 
        action_type: str, 
        initiator_id: int, 
        resource_data: Dict[str, Any],
        approval_required: bool = True
    ) -> Dict[str, Any]:
        """
        Create workflow for actions that require approval or cross-group coordination.
        """
        try:
            # Check permission to initiate workflows
            if not check_unified_permission(self.db, initiator_id, "create", "workflow"):
                return {"error": "Insufficient permissions to create workflow"}
            
            workflow_id = f"wf_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{initiator_id}"
            
            # Determine workflow steps based on action type and resource
            workflow_steps = self._generate_workflow_steps(action_type, resource_data, approval_required)
            
            # Create workflow record
            workflow = Workflow(
                id=workflow_id,
                type=action_type,
                status="pending",
                initiated_by=initiator_id,
                resource_type=resource_data.get("resource_type"),
                resource_id=resource_data.get("resource_id"),
                steps=json.dumps(workflow_steps),
                created_at=datetime.utcnow()
            )
            
            self.db.add(workflow)
            self.db.commit()
            
            # Notify relevant stakeholders
            self._notify_workflow_stakeholders(workflow_id, workflow_steps, initiator_id)
            
            return {
                "workflow_id": workflow_id,
                "status": "created",
                "steps": workflow_steps,
                "estimated_completion": self._estimate_workflow_completion(workflow_steps)
            }
            
        except Exception as e:
            logger.error(f"Error creating workflow for {action_type}: {str(e)}")
            return {"error": f"Failed to create workflow: {str(e)}"}
    
    def log_cross_group_activity(
        self, 
        source_group: str, 
        target_groups: List[str], 
        activity: Dict[str, Any]
    ):
        """
        Log activities that affect multiple groups for audit and coordination.
        """
        try:
            activity_log = CrossGroupActivity(
                activity_id=f"cga_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                activity_type=ActivityType(activity["type"]),
                source_group=source_group,
                target_groups=target_groups,
                resource_context=SharedResourceContext(**activity["resource_context"]),
                initiated_by=activity["initiated_by"],
                payload=activity.get("payload", {}),
                timestamp=datetime.utcnow()
            )
            
            # Store in audit log
            audit_log = RbacAuditLog(
                action="cross_group_activity",
                performed_by=str(activity["initiated_by"]),
                entity_type="cross_group",
                entity_id=activity_log.activity_id,
                before_state=None,
                after_state=json.dumps({
                    "source_group": source_group,
                    "target_groups": target_groups,
                    "activity_type": activity["type"],
                    "resource_context": activity["resource_context"]
                }),
                timestamp=datetime.utcnow(),
                extra_metadata=json.dumps(activity.get("payload", {}))
            )
            
            self.db.add(audit_log)
            self.db.commit()
            
            # Trigger event handlers for target groups
            self._trigger_cross_group_event_handlers(activity_log)
            
        except Exception as e:
            logger.error(f"Error logging cross-group activity: {str(e)}")
    
    def get_shared_workspace_context(self, user_id: int) -> Dict[str, Any]:
        """
        Get shared workspace context across all groups for collaborative features.
        """
        try:
            # Get user workspaces
            user_workspaces = self.db.query(UserWorkspace).filter(
                UserWorkspace.user_id == user_id
            ).all()
            
            workspace_context = {
                "user_id": user_id,
                "workspaces": [],
                "recent_activities": [],
                "pending_approvals": [],
                "collaboration_invites": []
            }
            
            for workspace in user_workspaces:
                # Get workspace details with cross-group data
                workspace_data = {
                    "workspace_id": workspace.workspace_id,
                    "name": workspace.workspace_name,
                    "role": workspace.role,
                    "groups_involved": self._get_workspace_groups(workspace.workspace_id),
                    "recent_activities": self._get_workspace_recent_activities(workspace.workspace_id),
                    "compliance_status": self._get_workspace_compliance_status(workspace.workspace_id)
                }
                workspace_context["workspaces"].append(workspace_data)
            
            # Get pending approvals across all groups
            workspace_context["pending_approvals"] = self._get_user_pending_approvals(user_id)
            
            # Get collaboration invites
            workspace_context["collaboration_invites"] = self._get_user_collaboration_invites(user_id)
            
            return workspace_context
            
        except Exception as e:
            logger.error(f"Error getting shared workspace context for user {user_id}: {str(e)}")
            return {"error": f"Failed to get workspace context: {str(e)}"}
    
    def synchronize_group_data(self, source_group: str, target_groups: List[str], sync_type: str):
        """
        Synchronize data between groups to maintain consistency.
        """
        try:
            sync_operations = {
                "classification_update": self._sync_classification_data,
                "compliance_status_change": self._sync_compliance_data,
                "data_source_change": self._sync_data_source_data,
                "scan_results_update": self._sync_scan_results_data
            }
            
            if sync_type in sync_operations:
                operation = sync_operations[sync_type]
                
                # Execute synchronization in parallel for multiple target groups
                futures = []
                for target_group in target_groups:
                    future = self.executor.submit(operation, source_group, target_group)
                    futures.append(future)
                
                # Wait for all synchronizations to complete
                results = [future.result() for future in futures]
                
                return {
                    "success": True,
                    "sync_type": sync_type,
                    "source_group": source_group,
                    "target_groups": target_groups,
                    "results": results
                }
            else:
                return {"error": f"Unknown sync type: {sync_type}"}
                
        except Exception as e:
            logger.error(f"Error synchronizing data from {source_group} to {target_groups}: {str(e)}")
            return {"error": f"Synchronization failed: {str(e)}"}
    
    def _check_framework_compliance(
        self, 
        framework: str, 
        resource_type: str, 
        resource_id: str,
        user_id: int
    ) -> Dict[str, Any]:
        """Check compliance against a specific framework"""
        try:
            # Get framework rules from database
            framework_rules = self.db.query(ComplianceRule).filter(
                ComplianceRule.framework == framework,
                ComplianceRule.resource_type == resource_type
            ).all()
            
            compliance_result = {
                "framework": framework,
                "status": ComplianceStatus.COMPLIANT.value,
                "violations": [],
                "score": 100,
                "last_checked": datetime.utcnow().isoformat()
            }
            
            # Check each rule
            for rule in framework_rules:
                rule_result = self._evaluate_compliance_rule(rule, resource_id, user_id)
                if not rule_result["compliant"]:
                    compliance_result["violations"].append(rule_result)
                    compliance_result["status"] = ComplianceStatus.NON_COMPLIANT.value
                    compliance_result["score"] -= rule_result.get("severity_weight", 10)
            
            compliance_result["score"] = max(0, compliance_result["score"])
            
            return compliance_result
            
        except Exception as e:
            logger.error(f"Error checking {framework} compliance: {str(e)}")
            return {
                "framework": framework,
                "status": ComplianceStatus.UNKNOWN.value,
                "error": str(e)
            }
    
    def _evaluate_compliance_rule(self, rule: ComplianceRule, resource_id: str, user_id: int) -> Dict[str, Any]:
        """Evaluate a specific compliance rule against a resource"""
        try:
            # This is a simplified implementation - in reality, this would involve
            # complex rule evaluation engines for different compliance frameworks
            
            rule_result = {
                "rule_id": rule.id,
                "rule_name": rule.name,
                "compliant": True,
                "severity": rule.severity,
                "severity_weight": {"high": 20, "medium": 10, "low": 5}.get(rule.severity, 10),
                "message": "Compliant with rule requirements"
            }
            
            # Example rule evaluation logic (to be expanded based on actual requirements)
            if rule.rule_type == "data_encryption" and rule.resource_type == "data_source":
                # Check if data source has encryption enabled
                # This would call the actual data source service
                rule_result["compliant"] = True  # Placeholder
            elif rule.rule_type == "access_control" and rule.resource_type == "scan":
                # Check if proper access controls are in place
                rule_result["compliant"] = True  # Placeholder
            
            return rule_result
            
        except Exception as e:
            logger.error(f"Error evaluating compliance rule {rule.id}: {str(e)}")
            return {
                "rule_id": rule.id,
                "compliant": False,
                "error": str(e)
            }
    
    def _generate_workflow_steps(self, action_type: str, resource_data: Dict[str, Any], approval_required: bool) -> List[Dict[str, Any]]:
        """Generate workflow steps based on action type and resource"""
        steps = []
        
        if approval_required:
            steps.append({
                "step_id": "approval_required",
                "type": "approval",
                "assignee_role": "data_steward",
                "estimated_duration": "24h",
                "status": "pending"
            })
        
        # Add resource-specific steps
        resource_type = resource_data.get("resource_type")
        if resource_type == "data_source":
            if action_type == "create":
                steps.extend([
                    {"step_id": "security_review", "type": "review", "assignee_role": "security_admin"},
                    {"step_id": "compliance_check", "type": "validation", "assignee_role": "compliance_officer"},
                    {"step_id": "deploy", "type": "deployment", "assignee_role": "data_engineer"}
                ])
        elif resource_type == "scan_rule_set":
            if action_type == "deploy":
                steps.extend([
                    {"step_id": "rule_validation", "type": "validation", "assignee_role": "rule_reviewer"},
                    {"step_id": "impact_assessment", "type": "assessment", "assignee_role": "data_steward"},
                    {"step_id": "deployment", "type": "deployment", "assignee_role": "scan_operator"}
                ])
        
        return steps
    
    def _map_resource_type_to_group(self, resource_type: str) -> str:
        """Map resource type to group name"""
        mapping = {
            "data_source": "data_sources",
            "scan": "scan_logic",
            "scan_rule_set": "scan_rule_sets",
            "classification": "classifications",
            "compliance_rule": "compliance",
            "catalog_item": "catalog"
        }
        return mapping.get(resource_type, "unknown")
    
    def _calculate_overall_compliance_status(self, framework_statuses: Dict[str, Any]) -> str:
        """Calculate overall compliance status from framework statuses"""
        if not framework_statuses:
            return ComplianceStatus.UNKNOWN.value
        
        statuses = [status["status"] for status in framework_statuses.values()]
        
        if ComplianceStatus.VIOLATION.value in statuses:
            return ComplianceStatus.VIOLATION.value
        elif ComplianceStatus.NON_COMPLIANT.value in statuses:
            return ComplianceStatus.NON_COMPLIANT.value
        elif ComplianceStatus.PENDING_REVIEW.value in statuses:
            return ComplianceStatus.PENDING_REVIEW.value
        elif all(status == ComplianceStatus.COMPLIANT.value for status in statuses):
            return ComplianceStatus.COMPLIANT.value
        else:
            return ComplianceStatus.UNKNOWN.value
    
    def _notify_workflow_stakeholders(self, workflow_id: str, workflow_steps: List[Dict[str, Any]], initiator_id: int):
        """Notify stakeholders about workflow creation"""
        try:
            # This would integrate with notification service
            # For now, just log the notification
            logger.info(f"Workflow {workflow_id} created by user {initiator_id} with {len(workflow_steps)} steps")
        except Exception as e:
            logger.error(f"Error notifying workflow stakeholders: {str(e)}")
    
    def _estimate_workflow_completion(self, workflow_steps: List[Dict[str, Any]]) -> str:
        """Estimate workflow completion time"""
        try:
            total_hours = 0
            for step in workflow_steps:
                duration_str = step.get("estimated_duration", "24h")
                hours = int(duration_str.replace("h", ""))
                total_hours += hours
            
            completion_time = datetime.utcnow() + timedelta(hours=total_hours)
            return completion_time.isoformat()
        except Exception:
            return (datetime.utcnow() + timedelta(days=3)).isoformat()
    
    def _trigger_cross_group_event_handlers(self, activity: CrossGroupActivity):
        """Trigger event handlers for cross-group activities"""
        try:
            # This would integrate with event bus system
            logger.info(f"Cross-group activity {activity.activity_id} triggered for groups {activity.target_groups}")
        except Exception as e:
            logger.error(f"Error triggering cross-group event handlers: {str(e)}")
    
    def _get_workspace_groups(self, workspace_id: str) -> List[str]:
        """Get groups involved in a workspace"""
        # Placeholder - would query actual workspace data
        return ["data_sources", "compliance", "catalog"]
    
    def _get_workspace_recent_activities(self, workspace_id: str) -> List[Dict[str, Any]]:
        """Get recent activities in a workspace"""
        # Placeholder - would query actual activity data
        return []
    
    def _get_workspace_compliance_status(self, workspace_id: str) -> Dict[str, Any]:
        """Get compliance status for a workspace"""
        # Placeholder - would calculate actual compliance status
        return {"status": "compliant", "score": 95}
    
    def _get_user_pending_approvals(self, user_id: int) -> List[Dict[str, Any]]:
        """Get pending approvals for a user"""
        # Placeholder - would query actual approval data
        return []
    
    def _get_user_collaboration_invites(self, user_id: int) -> List[Dict[str, Any]]:
        """Get collaboration invites for a user"""
        # Placeholder - would query actual collaboration data
        return []
    
    def _sync_classification_data(self, source_group: str, target_group: str) -> Dict[str, Any]:
        """Synchronize classification data between groups"""
        # Placeholder for actual sync logic
        return {"synced": True, "items": 0}
    
    def _sync_compliance_data(self, source_group: str, target_group: str) -> Dict[str, Any]:
        """Synchronize compliance data between groups"""
        # Placeholder for actual sync logic
        return {"synced": True, "items": 0}
    
    def _sync_data_source_data(self, source_group: str, target_group: str) -> Dict[str, Any]:
        """Synchronize data source data between groups"""
        # Placeholder for actual sync logic
        return {"synced": True, "items": 0}
    
    def _sync_scan_results_data(self, source_group: str, target_group: str) -> Dict[str, Any]:
        """Synchronize scan results data between groups"""
        # Placeholder for actual sync logic
        return {"synced": True, "items": 0}

# Convenience functions for shared services
def get_shared_compliance_status(db: Session, resource_type: str, resource_id: str, user_id: int) -> Dict[str, Any]:
    """Convenience function for getting compliance status"""
    coordinator = SharedServicesCoordinator(db)
    return coordinator.get_compliance_status_for_resource(resource_type, resource_id, user_id)

def create_shared_workflow(db: Session, action_type: str, initiator_id: int, resource_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convenience function for creating workflows"""
    coordinator = SharedServicesCoordinator(db)
    return coordinator.create_workflow_for_action(action_type, initiator_id, resource_data)

def log_shared_activity(db: Session, source_group: str, target_groups: List[str], activity: Dict[str, Any]):
    """Convenience function for logging cross-group activities"""
    coordinator = SharedServicesCoordinator(db)
    coordinator.log_cross_group_activity(source_group, target_groups, activity)