"""
Shared Governance Service
========================

Advanced shared governance service providing unified compliance workflows, collaboration systems,
and governance policies across all 6 data governance groups (Data Sources, Advanced Catalog,
Classifications, Compliance Rule, Scan Rule Sets, Scan Logic).

This service eliminates duplicate implementations and ensures all groups share the same
enterprise-grade governance capabilities while maintaining group-specific customizations.

Features:
- Unified compliance workflow management
- Cross-group collaboration orchestration  
- Shared policy enforcement
- Governance analytics and reporting
- Regulatory framework compliance
- Audit trail coordination
- Risk assessment and mitigation
- Approval workflows and escalation
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union, Tuple
from enum import Enum
from dataclasses import dataclass, asdict
from sqlmodel import Session, select
import json
import logging
from uuid import uuid4

# Database and models
from app.db_session import get_session

# Services integration
from app.services.unified_rbac_service import UnifiedRBACService
from app.services.audit_service import AuditService, ComplianceFramework
from app.services.telemetry_service import TelemetryService

# Configure logging
logger = logging.getLogger(__name__)

# ===============================================================================
# SHARED GOVERNANCE DATA MODELS
# ===============================================================================

class WorkflowType(str, Enum):
    """Types of governance workflows"""
    COMPLIANCE_REVIEW = "compliance_review"
    DATA_APPROVAL = "data_approval"
    CLASSIFICATION_VALIDATION = "classification_validation"
    POLICY_ENFORCEMENT = "policy_enforcement"
    RISK_ASSESSMENT = "risk_assessment"
    AUDIT_INVESTIGATION = "audit_investigation"
    ACCESS_REQUEST = "access_request"
    DATA_SHARING = "data_sharing"
    QUALITY_CERTIFICATION = "quality_certification"
    RETENTION_REVIEW = "retention_review"

class WorkflowStatus(str, Enum):
    """Workflow execution status"""
    DRAFT = "draft"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ParticipantRole(str, Enum):
    """Participant roles in workflows"""
    INITIATOR = "initiator"
    REVIEWER = "reviewer"
    APPROVER = "approver"
    COLLABORATOR = "collaborator"
    OBSERVER = "observer"
    ESCALATION_CONTACT = "escalation_contact"

class PolicyScope(str, Enum):
    """Policy application scope"""
    GLOBAL = "global"
    GROUP_SPECIFIC = "group_specific"
    RESOURCE_SPECIFIC = "resource_specific"
    USER_SPECIFIC = "user_specific"

@dataclass
class WorkflowDefinition:
    """Definition of a governance workflow"""
    workflow_id: str
    name: str
    description: str
    workflow_type: WorkflowType
    applicable_groups: List[str]
    compliance_frameworks: List[ComplianceFramework]
    steps: List[Dict[str, Any]]
    approval_levels: int
    auto_escalation_hours: int
    required_participants: List[Dict[str, Any]]
    conditions: Dict[str, Any]
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: datetime

@dataclass
class WorkflowInstance:
    """Instance of an executing workflow"""
    instance_id: str
    workflow_id: str
    title: str
    description: str
    status: WorkflowStatus
    current_step: int
    total_steps: int
    priority: str
    group: str
    resource_type: str
    resource_id: str
    initiated_by: int
    assigned_to: Optional[int]
    participants: List[Dict[str, Any]]
    data: Dict[str, Any]
    decisions: List[Dict[str, Any]]
    comments: List[Dict[str, Any]]
    due_date: Optional[datetime]
    escalation_date: Optional[datetime]
    started_at: datetime
    completed_at: Optional[datetime]
    metadata: Dict[str, Any]

@dataclass
class CollaborationWorkspace:
    """Shared collaboration workspace"""
    workspace_id: str
    name: str
    description: str
    workspace_type: str
    groups: List[str]
    participants: List[Dict[str, Any]]
    resources: List[Dict[str, Any]]
    discussions: List[Dict[str, Any]]
    shared_documents: List[Dict[str, Any]]
    permissions: Dict[str, Any]
    is_active: bool
    created_by: int
    created_at: datetime
    last_activity: datetime

@dataclass
class PolicyDefinition:
    """Governance policy definition"""
    policy_id: str
    name: str
    description: str
    policy_type: str
    scope: PolicyScope
    applicable_groups: List[str]
    rules: List[Dict[str, Any]]
    enforcement_level: str  # advisory, warning, blocking
    compliance_frameworks: List[ComplianceFramework]
    exceptions: List[Dict[str, Any]]
    is_active: bool
    version: str
    created_by: int
    created_at: datetime
    effective_date: datetime
    expiry_date: Optional[datetime]

# ===============================================================================
# SHARED GOVERNANCE SERVICE
# ===============================================================================

class SharedGovernanceService:
    """
    Comprehensive shared governance service providing unified compliance,
    collaboration, and policy management across all data governance groups
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.rbac_service = UnifiedRBACService(db_session)
        self.audit_service = AuditService()
        self.telemetry_service = TelemetryService()
        
        # In-memory caches for performance
        self.workflow_cache = {}
        self.policy_cache = {}
        self.workspace_cache = {}
        
        # Workflow processors by type
        self.workflow_processors = self._initialize_workflow_processors()
        
        # Policy enforcers by type
        self.policy_enforcers = self._initialize_policy_enforcers()
        
        logger.info("Shared Governance Service initialized")
    
    def _initialize_workflow_processors(self) -> Dict[WorkflowType, callable]:
        """Initialize workflow type processors"""
        return {
            WorkflowType.COMPLIANCE_REVIEW: self._process_compliance_review,
            WorkflowType.DATA_APPROVAL: self._process_data_approval,
            WorkflowType.CLASSIFICATION_VALIDATION: self._process_classification_validation,
            WorkflowType.POLICY_ENFORCEMENT: self._process_policy_enforcement,
            WorkflowType.RISK_ASSESSMENT: self._process_risk_assessment,
            WorkflowType.ACCESS_REQUEST: self._process_access_request,
            WorkflowType.DATA_SHARING: self._process_data_sharing,
            WorkflowType.QUALITY_CERTIFICATION: self._process_quality_certification
        }
    
    def _initialize_policy_enforcers(self) -> Dict[str, callable]:
        """Initialize policy enforcement handlers"""
        return {
            "data_access": self._enforce_data_access_policy,
            "classification": self._enforce_classification_policy,
            "retention": self._enforce_retention_policy,
            "sharing": self._enforce_sharing_policy,
            "quality": self._enforce_quality_policy,
            "security": self._enforce_security_policy
        }
    
    # ===============================================================================
    # WORKFLOW MANAGEMENT
    # ===============================================================================
    
    async def create_workflow_definition(
        self,
        name: str,
        description: str,
        workflow_type: WorkflowType,
        applicable_groups: List[str],
        steps: List[Dict[str, Any]],
        approval_levels: int = 1,
        auto_escalation_hours: int = 24,
        required_participants: List[Dict[str, Any]] = None,
        conditions: Dict[str, Any] = None,
        compliance_frameworks: List[ComplianceFramework] = None,
        created_by: int = None
    ) -> WorkflowDefinition:
        """Create a new workflow definition"""
        try:
            workflow_definition = WorkflowDefinition(
                workflow_id=str(uuid4()),
                name=name,
                description=description,
                workflow_type=workflow_type,
                applicable_groups=applicable_groups,
                compliance_frameworks=compliance_frameworks or [],
                steps=steps,
                approval_levels=approval_levels,
                auto_escalation_hours=auto_escalation_hours,
                required_participants=required_participants or [],
                conditions=conditions or {},
                is_active=True,
                created_by=created_by,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Cache the workflow definition
            self.workflow_cache[workflow_definition.workflow_id] = workflow_definition
            
            # Audit log
            await self.audit_service.log_data_access(
                user_id=created_by,
                resource_type="workflow_definition",
                resource_id=workflow_definition.workflow_id,
                action="create",
                group="shared_governance",
                details={"workflow_type": workflow_type.value, "groups": applicable_groups}
            )
            
            logger.info(f"Created workflow definition: {name} ({workflow_definition.workflow_id})")
            return workflow_definition
            
        except Exception as e:
            logger.error(f"Error creating workflow definition: {e}")
            raise
    
    async def start_workflow(
        self,
        workflow_id: str,
        title: str,
        description: str,
        group: str,
        resource_type: str,
        resource_id: str,
        initiated_by: int,
        data: Dict[str, Any] = None,
        priority: str = "medium"
    ) -> WorkflowInstance:
        """Start a new workflow instance"""
        try:
            # Get workflow definition
            workflow_def = await self._get_workflow_definition(workflow_id)
            if not workflow_def or not workflow_def.is_active:
                raise ValueError(f"Workflow definition not found or inactive: {workflow_id}")
            
            # Verify group applicability
            if group not in workflow_def.applicable_groups:
                raise ValueError(f"Workflow not applicable to group: {group}")
            
            # Check permissions
            can_initiate, reason = self.rbac_service.evaluate_permission(
                user_id=initiated_by,
                action="initiate_workflow",
                resource_type="workflow",
                context={"workflow_type": workflow_def.workflow_type.value}
            )
            
            if not can_initiate:
                raise PermissionError(f"Permission denied: {reason}")
            
            # Create workflow instance
            instance = WorkflowInstance(
                instance_id=str(uuid4()),
                workflow_id=workflow_id,
                title=title,
                description=description,
                status=WorkflowStatus.PENDING,
                current_step=0,
                total_steps=len(workflow_def.steps),
                priority=priority,
                group=group,
                resource_type=resource_type,
                resource_id=resource_id,
                initiated_by=initiated_by,
                assigned_to=None,
                participants=self._initialize_participants(workflow_def, initiated_by),
                data=data or {},
                decisions=[],
                comments=[],
                due_date=self._calculate_due_date(workflow_def),
                escalation_date=self._calculate_escalation_date(workflow_def),
                started_at=datetime.utcnow(),
                completed_at=None,
                metadata={}
            )
            
            # Start processing
            await self._advance_workflow(instance)
            
            # Audit log
            await self.audit_service.log_data_access(
                user_id=initiated_by,
                resource_type="workflow_instance",
                resource_id=instance.instance_id,
                action="start",
                group=group,
                details={
                    "workflow_type": workflow_def.workflow_type.value,
                    "resource_type": resource_type,
                    "resource_id": resource_id
                }
            )
            
            logger.info(f"Started workflow instance: {title} ({instance.instance_id})")
            return instance
            
        except Exception as e:
            logger.error(f"Error starting workflow: {e}")
            raise
    
    async def advance_workflow(
        self,
        instance_id: str,
        user_id: int,
        decision: str,
        comments: str = None,
        data: Dict[str, Any] = None
    ) -> WorkflowInstance:
        """Advance a workflow to the next step"""
        try:
            instance = await self._get_workflow_instance(instance_id)
            if not instance:
                raise ValueError(f"Workflow instance not found: {instance_id}")
            
            # Verify user can advance this workflow
            can_advance = await self._can_user_advance_workflow(instance, user_id)
            if not can_advance:
                raise PermissionError("User not authorized to advance this workflow")
            
            # Record decision
            decision_record = {
                "step": instance.current_step,
                "user_id": user_id,
                "decision": decision,
                "comments": comments,
                "timestamp": datetime.utcnow().isoformat(),
                "data": data or {}
            }
            instance.decisions.append(decision_record)
            
            # Add comments if provided
            if comments:
                comment_record = {
                    "user_id": user_id,
                    "comment": comments,
                    "timestamp": datetime.utcnow().isoformat(),
                    "step": instance.current_step
                }
                instance.comments.append(comment_record)
            
            # Process decision and advance
            await self._process_workflow_decision(instance, decision, user_id, data)
            
            # Audit log
            await self.audit_service.log_data_access(
                user_id=user_id,
                resource_type="workflow_instance",
                resource_id=instance_id,
                action="advance",
                group=instance.group,
                details={
                    "step": instance.current_step,
                    "decision": decision,
                    "status": instance.status.value
                }
            )
            
            return instance
            
        except Exception as e:
            logger.error(f"Error advancing workflow {instance_id}: {e}")
            raise
    
    async def get_user_workflows(
        self,
        user_id: int,
        status: Optional[WorkflowStatus] = None,
        group: Optional[str] = None,
        role: Optional[ParticipantRole] = None
    ) -> List[WorkflowInstance]:
        """Get workflows assigned to or involving a user"""
        try:
            # This would query the database in production
            # For now, returning empty list as placeholder
            workflows = []
            
            # Filter by criteria
            if status:
                workflows = [w for w in workflows if w.status == status]
            if group:
                workflows = [w for w in workflows if w.group == group]
            
            return workflows
            
        except Exception as e:
            logger.error(f"Error retrieving user workflows: {e}")
            raise
    
    # ===============================================================================
    # COLLABORATION WORKSPACES
    # ===============================================================================
    
    async def create_collaboration_workspace(
        self,
        name: str,
        description: str,
        workspace_type: str,
        groups: List[str],
        participants: List[Dict[str, Any]],
        created_by: int,
        permissions: Dict[str, Any] = None
    ) -> CollaborationWorkspace:
        """Create a new collaboration workspace"""
        try:
            workspace = CollaborationWorkspace(
                workspace_id=str(uuid4()),
                name=name,
                description=description,
                workspace_type=workspace_type,
                groups=groups,
                participants=participants,
                resources=[],
                discussions=[],
                shared_documents=[],
                permissions=permissions or {},
                is_active=True,
                created_by=created_by,
                created_at=datetime.utcnow(),
                last_activity=datetime.utcnow()
            )
            
            # Cache workspace
            self.workspace_cache[workspace.workspace_id] = workspace
            
            # Audit log
            await self.audit_service.log_data_access(
                user_id=created_by,
                resource_type="collaboration_workspace",
                resource_id=workspace.workspace_id,
                action="create",
                group="shared_governance",
                details={"groups": groups, "participants": len(participants)}
            )
            
            logger.info(f"Created collaboration workspace: {name} ({workspace.workspace_id})")
            return workspace
            
        except Exception as e:
            logger.error(f"Error creating collaboration workspace: {e}")
            raise
    
    async def add_workspace_participant(
        self,
        workspace_id: str,
        user_id: int,
        role: ParticipantRole,
        added_by: int,
        permissions: List[str] = None
    ) -> bool:
        """Add a participant to a collaboration workspace"""
        try:
            workspace = await self._get_collaboration_workspace(workspace_id)
            if not workspace:
                raise ValueError(f"Workspace not found: {workspace_id}")
            
            # Check if user can add participants
            can_add = await self._can_manage_workspace(workspace, added_by)
            if not can_add:
                raise PermissionError("Not authorized to add participants")
            
            # Add participant
            participant = {
                "user_id": user_id,
                "role": role.value,
                "permissions": permissions or [],
                "added_by": added_by,
                "added_at": datetime.utcnow().isoformat(),
                "is_active": True
            }
            
            workspace.participants.append(participant)
            workspace.last_activity = datetime.utcnow()
            
            # Update cache
            self.workspace_cache[workspace_id] = workspace
            
            logger.info(f"Added participant {user_id} to workspace {workspace_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding workspace participant: {e}")
            raise
    
    # ===============================================================================
    # POLICY MANAGEMENT
    # ===============================================================================
    
    async def create_policy(
        self,
        name: str,
        description: str,
        policy_type: str,
        scope: PolicyScope,
        applicable_groups: List[str],
        rules: List[Dict[str, Any]],
        enforcement_level: str = "warning",
        compliance_frameworks: List[ComplianceFramework] = None,
        created_by: int = None,
        effective_date: datetime = None
    ) -> PolicyDefinition:
        """Create a new governance policy"""
        try:
            policy = PolicyDefinition(
                policy_id=str(uuid4()),
                name=name,
                description=description,
                policy_type=policy_type,
                scope=scope,
                applicable_groups=applicable_groups,
                rules=rules,
                enforcement_level=enforcement_level,
                compliance_frameworks=compliance_frameworks or [],
                exceptions=[],
                is_active=True,
                version="1.0",
                created_by=created_by,
                created_at=datetime.utcnow(),
                effective_date=effective_date or datetime.utcnow(),
                expiry_date=None
            )
            
            # Cache policy
            self.policy_cache[policy.policy_id] = policy
            
            # Audit log
            await self.audit_service.log_data_access(
                user_id=created_by,
                resource_type="governance_policy",
                resource_id=policy.policy_id,
                action="create",
                group="shared_governance",
                details={
                    "policy_type": policy_type,
                    "scope": scope.value,
                    "groups": applicable_groups
                }
            )
            
            logger.info(f"Created governance policy: {name} ({policy.policy_id})")
            return policy
            
        except Exception as e:
            logger.error(f"Error creating policy: {e}")
            raise
    
    async def enforce_policy(
        self,
        policy_id: str,
        group: str,
        resource_type: str,
        resource_id: str,
        action: str,
        user_id: int,
        context: Dict[str, Any] = None
    ) -> Tuple[bool, str, List[str]]:
        """Enforce a governance policy"""
        try:
            policy = await self._get_policy(policy_id)
            if not policy or not policy.is_active:
                return True, "Policy not found or inactive", []
            
            # Check if policy applies
            if group not in policy.applicable_groups:
                return True, "Policy not applicable to group", []
            
            # Get appropriate enforcer
            enforcer = self.policy_enforcers.get(policy.policy_type)
            if not enforcer:
                logger.warning(f"No enforcer found for policy type: {policy.policy_type}")
                return True, "No enforcer available", []
            
            # Execute enforcement
            result = await enforcer(
                policy, group, resource_type, resource_id, action, user_id, context or {}
            )
            
            # Audit policy enforcement
            await self.audit_service.log_data_access(
                user_id=user_id,
                resource_type="policy_enforcement",
                resource_id=policy_id,
                action="enforce",
                group=group,
                details={
                    "policy_type": policy.policy_type,
                    "action": action,
                    "result": result[0],
                    "reason": result[1]
                }
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error enforcing policy {policy_id}: {e}")
            return False, f"Policy enforcement error: {str(e)}", []
    
    # ===============================================================================
    # WORKFLOW PROCESSORS (Implementation stubs for different workflow types)
    # ===============================================================================
    
    async def _process_compliance_review(self, instance: WorkflowInstance, step_data: Dict[str, Any]):
        """Process compliance review workflow step"""
        # Implementation would handle compliance-specific logic
        pass
    
    async def _process_data_approval(self, instance: WorkflowInstance, step_data: Dict[str, Any]):
        """Process data approval workflow step"""
        # Implementation would handle data approval logic
        pass
    
    async def _process_classification_validation(self, instance: WorkflowInstance, step_data: Dict[str, Any]):
        """Process classification validation workflow step"""
        # Implementation would handle classification logic
        pass
    
    async def _process_policy_enforcement(self, instance: WorkflowInstance, step_data: Dict[str, Any]):
        """Process policy enforcement workflow step"""
        # Implementation would handle policy enforcement logic
        pass
    
    async def _process_risk_assessment(self, instance: WorkflowInstance, step_data: Dict[str, Any]):
        """Process risk assessment workflow step"""
        # Implementation would handle risk assessment logic
        pass
    
    async def _process_access_request(self, instance: WorkflowInstance, step_data: Dict[str, Any]):
        """Process access request workflow step"""
        # Implementation would handle access request logic
        pass
    
    async def _process_data_sharing(self, instance: WorkflowInstance, step_data: Dict[str, Any]):
        """Process data sharing workflow step"""
        # Implementation would handle data sharing logic
        pass
    
    async def _process_quality_certification(self, instance: WorkflowInstance, step_data: Dict[str, Any]):
        """Process quality certification workflow step"""
        # Implementation would handle quality certification logic
        pass
    
    # ===============================================================================
    # POLICY ENFORCERS (Implementation stubs for different policy types)
    # ===============================================================================
    
    async def _enforce_data_access_policy(
        self, policy: PolicyDefinition, group: str, resource_type: str, 
        resource_id: str, action: str, user_id: int, context: Dict[str, Any]
    ) -> Tuple[bool, str, List[str]]:
        """Enforce data access policy"""
        # Implementation would check data access rules
        return True, "Access allowed", []
    
    async def _enforce_classification_policy(
        self, policy: PolicyDefinition, group: str, resource_type: str,
        resource_id: str, action: str, user_id: int, context: Dict[str, Any]
    ) -> Tuple[bool, str, List[str]]:
        """Enforce classification policy"""
        # Implementation would check classification rules
        return True, "Classification policy satisfied", []
    
    async def _enforce_retention_policy(
        self, policy: PolicyDefinition, group: str, resource_type: str,
        resource_id: str, action: str, user_id: int, context: Dict[str, Any]
    ) -> Tuple[bool, str, List[str]]:
        """Enforce retention policy"""
        # Implementation would check retention rules
        return True, "Retention policy satisfied", []
    
    async def _enforce_sharing_policy(
        self, policy: PolicyDefinition, group: str, resource_type: str,
        resource_id: str, action: str, user_id: int, context: Dict[str, Any]
    ) -> Tuple[bool, str, List[str]]:
        """Enforce sharing policy"""
        # Implementation would check sharing rules
        return True, "Sharing policy satisfied", []
    
    async def _enforce_quality_policy(
        self, policy: PolicyDefinition, group: str, resource_type: str,
        resource_id: str, action: str, user_id: int, context: Dict[str, Any]
    ) -> Tuple[bool, str, List[str]]:
        """Enforce quality policy"""
        # Implementation would check quality rules
        return True, "Quality policy satisfied", []
    
    async def _enforce_security_policy(
        self, policy: PolicyDefinition, group: str, resource_type: str,
        resource_id: str, action: str, user_id: int, context: Dict[str, Any]
    ) -> Tuple[bool, str, List[str]]:
        """Enforce security policy"""
        # Implementation would check security rules
        return True, "Security policy satisfied", []
    
    # ===============================================================================
    # HELPER METHODS
    # ===============================================================================
    
    async def _get_workflow_definition(self, workflow_id: str) -> Optional[WorkflowDefinition]:
        """Get workflow definition from cache or database"""
        if workflow_id in self.workflow_cache:
            return self.workflow_cache[workflow_id]
        
        # In production, this would query the database
        return None
    
    async def _get_workflow_instance(self, instance_id: str) -> Optional[WorkflowInstance]:
        """Get workflow instance from cache or database"""
        # In production, this would query the database
        return None
    
    async def _get_collaboration_workspace(self, workspace_id: str) -> Optional[CollaborationWorkspace]:
        """Get collaboration workspace from cache or database"""
        if workspace_id in self.workspace_cache:
            return self.workspace_cache[workspace_id]
        
        # In production, this would query the database
        return None
    
    async def _get_policy(self, policy_id: str) -> Optional[PolicyDefinition]:
        """Get policy from cache or database"""
        if policy_id in self.policy_cache:
            return self.policy_cache[policy_id]
        
        # In production, this would query the database
        return None
    
    def _initialize_participants(self, workflow_def: WorkflowDefinition, initiated_by: int) -> List[Dict[str, Any]]:
        """Initialize workflow participants"""
        participants = []
        
        # Add initiator
        participants.append({
            "user_id": initiated_by,
            "role": ParticipantRole.INITIATOR.value,
            "added_at": datetime.utcnow().isoformat(),
            "is_active": True
        })
        
        # Add required participants from definition
        for req_participant in workflow_def.required_participants:
            participants.append({
                **req_participant,
                "added_at": datetime.utcnow().isoformat(),
                "is_active": True
            })
        
        return participants
    
    def _calculate_due_date(self, workflow_def: WorkflowDefinition) -> datetime:
        """Calculate workflow due date"""
        # Default: 7 days from now
        return datetime.utcnow() + timedelta(days=7)
    
    def _calculate_escalation_date(self, workflow_def: WorkflowDefinition) -> datetime:
        """Calculate workflow escalation date"""
        return datetime.utcnow() + timedelta(hours=workflow_def.auto_escalation_hours)
    
    async def _advance_workflow(self, instance: WorkflowInstance):
        """Advance workflow to next step"""
        # Implementation would process workflow advancement
        instance.status = WorkflowStatus.IN_PROGRESS
    
    async def _can_user_advance_workflow(self, instance: WorkflowInstance, user_id: int) -> bool:
        """Check if user can advance workflow"""
        # Implementation would check user permissions and assignments
        return True
    
    async def _process_workflow_decision(self, instance: WorkflowInstance, decision: str, user_id: int, data: Dict[str, Any]):
        """Process workflow decision and advance to next step"""
        # Implementation would process the decision and advance workflow
        pass
    
    async def _can_manage_workspace(self, workspace: CollaborationWorkspace, user_id: int) -> bool:
        """Check if user can manage workspace"""
        # Implementation would check workspace permissions
        return workspace.created_by == user_id

# ===============================================================================
# GLOBAL INSTANCE AND DEPENDENCY
# ===============================================================================

_shared_governance_service = None

def get_shared_governance_service(db_session: Session = None) -> SharedGovernanceService:
    """Get or create the global shared governance service instance"""
    global _shared_governance_service
    if _shared_governance_service is None:
        if db_session is None:
            from app.db_session import get_session
            db_session = next(get_session())
        _shared_governance_service = SharedGovernanceService(db_session)
    return _shared_governance_service

# FastAPI dependency
async def get_shared_governance_dependency(db: Session = None) -> SharedGovernanceService:
    """FastAPI dependency for shared governance service"""
    return get_shared_governance_service(db)

# Export
__all__ = [
    "SharedGovernanceService",
    "WorkflowType",
    "WorkflowStatus", 
    "ParticipantRole",
    "PolicyScope",
    "WorkflowDefinition",
    "WorkflowInstance",
    "CollaborationWorkspace",
    "PolicyDefinition",
    "get_shared_governance_service",
    "get_shared_governance_dependency"
]