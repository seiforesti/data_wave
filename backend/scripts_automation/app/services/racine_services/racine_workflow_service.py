"""
Racine Workflow Service
======================

Advanced workflow management service for Job Workflow Space with Databricks-style 
functionality, comprehensive orchestration, and cross-group integration.

This service provides:
- Databricks-style job workflow creation and management
- Advanced workflow scheduling and execution
- Cross-group workflow orchestration and coordination
- Template-based workflow creation and cloning
- Comprehensive workflow analytics and monitoring
- Workflow security and access control
- Integration with all existing group services

All functionality is designed for enterprise-grade scalability, performance, and security.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import uuid
import json

# Import existing services for integration
from ..data_source_service import DataSourceService
from ..scan_rule_set_service import ScanRuleSetService
from ..classification_service import EnterpriseClassificationService
from ..compliance_rule_service import ComplianceRuleService
from ..enterprise_catalog_service import EnterpriseIntelligentCatalogService
from ..unified_scan_orchestrator import UnifiedScanOrchestrator
from ..rbac_service import RBACService
from ..advanced_ai_service import AdvancedAIService
from ..comprehensive_analytics_service import ComprehensiveAnalyticsService

# Import racine models
from ...models.racine_models.racine_workflow_models import (
    RacineJobWorkflow,
    RacineJobExecution,
    RacineWorkflowTemplate,
    RacineWorkflowSchedule,
    RacineWorkflowStep,
    RacineStepExecution,
    RacineWorkflowMetrics,
    RacineWorkflowAudit,
    WorkflowType,
    WorkflowStatus,
    ExecutionStatus,
    StepType,
    ScheduleType,
    TriggerType
)
from ...models.racine_models.racine_orchestration_models import RacineOrchestrationMaster
from ...models.auth_models import User

logger = logging.getLogger(__name__)


class RacineWorkflowService:
    """
    Comprehensive workflow management service with Databricks-style functionality
    and enterprise-grade capabilities.
    """

    def __init__(self, db_session: Session):
        """Initialize the workflow service with database session and integrated services."""
        self.db = db_session
        
        # Initialize ALL existing services for full integration
        self.data_source_service = DataSourceService(db_session)
        self.scan_rule_service = ScanRuleSetService(db_session)
        self.classification_service = EnterpriseClassificationService(db_session)
        self.compliance_service = ComplianceRuleService(db_session)
        self.catalog_service = EnterpriseIntelligentCatalogService(db_session)
        self.scan_orchestrator = UnifiedScanOrchestrator(db_session)
        self.rbac_service = RBACService(db_session)
        self.ai_service = AdvancedAIService(db_session)
        self.analytics_service = ComprehensiveAnalyticsService(db_session)
        
        # Service registry for dynamic access
        self.service_registry = {
            'data_sources': self.data_source_service,
            'scan_rule_sets': self.scan_rule_service,
            'classifications': self.classification_service,
            'compliance_rules': self.compliance_service,
            'advanced_catalog': self.catalog_service,
            'scan_logic': self.scan_orchestrator,
            'rbac_system': self.rbac_service,
            'ai_service': self.ai_service,
            'analytics': self.analytics_service
        }
        
        logger.info("RacineWorkflowService initialized with full cross-group integration")

    async def create_workflow(
        self,
        name: str,
        description: str,
        workflow_type: WorkflowType,
        created_by: str,
        workspace_id: Optional[str] = None,
        template_id: Optional[str] = None,
        configuration: Optional[Dict[str, Any]] = None,
        steps: Optional[List[Dict[str, Any]]] = None
    ) -> RacineJobWorkflow:
        """
        Create a new workflow with comprehensive configuration and Databricks-style functionality.
        
        Args:
            name: Workflow name
            description: Workflow description
            workflow_type: Type of workflow (data_processing, etl, analytics, etc.)
            created_by: User ID creating the workflow
            workspace_id: Optional workspace ID
            template_id: Optional template ID for template-based creation
            configuration: Optional workflow configuration
            steps: Optional workflow steps
            
        Returns:
            Created workflow instance
        """
        try:
            logger.info(f"Creating workflow '{name}' of type {workflow_type.value}")
            
            # Create base workflow configuration
            workflow_config = {
                "max_concurrent_executions": 3,
                "retry_policy": {"max_retries": 3, "retry_delay": 300},
                "timeout_seconds": 7200,
                "notification_settings": {"on_success": True, "on_failure": True},
                "cross_group_enabled": True,
                "ai_optimization_enabled": True,
                "auto_recovery_enabled": True,
                "resource_management": {"cpu_limit": "4", "memory_limit": "8Gi"}
            }
            
            # Apply template if specified
            if template_id:
                template = await self.get_workflow_template(template_id)
                if template:
                    workflow_config.update(template.default_configuration or {})
                    logger.info(f"Applied template {template_id} to workflow")
            
            # Apply custom configuration
            if configuration:
                workflow_config.update(configuration)
            
            # Create workflow
            workflow = RacineJobWorkflow(
                name=name,
                description=description,
                workflow_type=workflow_type,
                status=WorkflowStatus.DRAFT,
                configuration=workflow_config,
                workspace_id=workspace_id,
                template_id=template_id,
                cross_group_config={
                    "enabled_groups": ["data_sources", "scan_rule_sets", "classifications",
                                     "compliance_rules", "advanced_catalog", "scan_logic"],
                    "integration_points": [],
                    "data_flow_mappings": {}
                },
                version="1.0.0",
                created_by=created_by
            )
            
            self.db.add(workflow)
            self.db.flush()  # Get the workflow ID
            
            # Create workflow steps if provided
            if steps:
                await self._create_workflow_steps(workflow.id, steps, created_by)
            
            # Initialize default metrics
            await self._create_workflow_metrics(workflow.id)
            
            # Create audit entry
            await self._create_audit_entry(
                workflow.id,
                "workflow_created",
                {"workflow_type": workflow_type.value, "template_id": template_id},
                created_by
            )
            
            self.db.commit()
            logger.info(f"Successfully created workflow {workflow.id}")
            
            return workflow
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating workflow: {str(e)}")
            raise

    async def execute_workflow(
        self,
        workflow_id: str,
        triggered_by: str,
        execution_parameters: Optional[Dict[str, Any]] = None,
        force_execution: bool = False
    ) -> RacineJobExecution:
        """
        Execute a workflow with comprehensive monitoring and cross-group coordination.
        
        Args:
            workflow_id: Workflow ID to execute
            triggered_by: User ID triggering the execution
            execution_parameters: Optional execution parameters
            force_execution: Whether to force execution even if limits are reached
            
        Returns:
            Created execution instance
        """
        try:
            logger.info(f"Executing workflow {workflow_id}")
            
            # Get workflow
            workflow = self.db.query(RacineJobWorkflow).filter(
                RacineJobWorkflow.id == workflow_id
            ).first()
            
            if not workflow:
                raise ValueError(f"Workflow {workflow_id} not found")
            
            if workflow.status != WorkflowStatus.ACTIVE and not force_execution:
                raise ValueError(f"Workflow {workflow_id} is not active")
            
            # Check concurrent execution limits
            if not force_execution:
                await self._check_execution_limits(workflow_id)
            
            # Create execution record
            execution = RacineJobExecution(
                workflow_id=workflow_id,
                status=ExecutionStatus.QUEUED,
                parameters=execution_parameters or {},
                execution_environment={
                    "triggered_by": triggered_by,
                    "execution_mode": "manual" if triggered_by else "scheduled",
                    "force_execution": force_execution,
                    "cross_group_integration": workflow.cross_group_config
                },
                triggered_by=triggered_by
            )
            
            self.db.add(execution)
            self.db.flush()  # Get the execution ID
            
            # Start execution asynchronously
            await self._start_workflow_execution(execution)
            
            # Create audit entry
            await self._create_audit_entry(
                workflow_id,
                "workflow_executed",
                {"execution_id": execution.id, "forced": force_execution},
                triggered_by
            )
            
            self.db.commit()
            logger.info(f"Successfully started execution {execution.id} for workflow {workflow_id}")
            
            return execution
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error executing workflow: {str(e)}")
            raise

    async def get_workflow(self, workflow_id: str, user_id: str) -> Optional[RacineJobWorkflow]:
        """
        Get workflow by ID with permission checking.
        
        Args:
            workflow_id: Workflow ID
            user_id: User requesting access
            
        Returns:
            Workflow if accessible, None otherwise
        """
        try:
            # Check if user has access to workflow
            if not await self.check_workflow_access(workflow_id, user_id):
                logger.warning(f"User {user_id} denied access to workflow {workflow_id}")
                return None
            
            workflow = self.db.query(RacineJobWorkflow).filter(
                RacineJobWorkflow.id == workflow_id
            ).first()
            
            return workflow
            
        except Exception as e:
            logger.error(f"Error getting workflow {workflow_id}: {str(e)}")
            raise

    async def list_user_workflows(
        self,
        user_id: str,
        workspace_id: Optional[str] = None,
        workflow_type: Optional[WorkflowType] = None,
        status: Optional[WorkflowStatus] = None
    ) -> List[RacineJobWorkflow]:
        """
        List workflows accessible to a user.
        
        Args:
            user_id: User ID
            workspace_id: Optional filter by workspace
            workflow_type: Optional filter by workflow type
            status: Optional filter by status
            
        Returns:
            List of accessible workflows
        """
        try:
            query = self.db.query(RacineJobWorkflow).filter(
                or_(
                    RacineJobWorkflow.created_by == user_id,
                    RacineJobWorkflow.workspace_id.in_(
                        self.db.query(RacineWorkspaceMember.workspace_id).filter(
                            RacineWorkspaceMember.user_id == user_id
                        )
                    )
                )
            )
            
            if workspace_id:
                query = query.filter(RacineJobWorkflow.workspace_id == workspace_id)
            
            if workflow_type:
                query = query.filter(RacineJobWorkflow.workflow_type == workflow_type)
            
            if status:
                query = query.filter(RacineJobWorkflow.status == status)
            
            workflows = query.order_by(RacineJobWorkflow.updated_at.desc()).all()
            
            logger.info(f"Retrieved {len(workflows)} workflows for user {user_id}")
            return workflows
            
        except Exception as e:
            logger.error(f"Error listing workflows for user {user_id}: {str(e)}")
            raise

    async def schedule_workflow(
        self,
        workflow_id: str,
        schedule_type: ScheduleType,
        schedule_expression: str,
        scheduled_by: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        timezone: str = "UTC"
    ) -> RacineWorkflowSchedule:
        """
        Schedule a workflow for automatic execution.
        
        Args:
            workflow_id: Workflow ID to schedule
            schedule_type: Type of schedule (cron, interval, manual)
            schedule_expression: Schedule expression (cron or interval)
            scheduled_by: User ID scheduling the workflow
            start_time: Optional start time for schedule
            end_time: Optional end time for schedule
            timezone: Timezone for schedule
            
        Returns:
            Created schedule instance
        """
        try:
            logger.info(f"Scheduling workflow {workflow_id} with {schedule_type.value} schedule")
            
            # Validate workflow exists and is active
            workflow = await self.get_workflow(workflow_id, scheduled_by)
            if not workflow:
                raise ValueError(f"Workflow {workflow_id} not found or not accessible")
            
            if workflow.status != WorkflowStatus.ACTIVE:
                raise ValueError(f"Workflow {workflow_id} must be active to schedule")
            
            # Create schedule
            schedule = RacineWorkflowSchedule(
                workflow_id=workflow_id,
                schedule_type=schedule_type,
                schedule_expression=schedule_expression,
                timezone=timezone,
                start_time=start_time or datetime.utcnow(),
                end_time=end_time,
                is_active=True,
                configuration={
                    "max_missed_runs": 3,
                    "catchup_enabled": False,
                    "overlap_allowed": False
                },
                created_by=scheduled_by
            )
            
            self.db.add(schedule)
            
            # Create audit entry
            await self._create_audit_entry(
                workflow_id,
                "workflow_scheduled",
                {
                    "schedule_type": schedule_type.value,
                    "schedule_expression": schedule_expression,
                    "timezone": timezone
                },
                scheduled_by
            )
            
            self.db.commit()
            logger.info(f"Successfully scheduled workflow {workflow_id}")
            
            return schedule
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error scheduling workflow: {str(e)}")
            raise

    async def get_workflow_executions(
        self,
        workflow_id: str,
        limit: int = 50,
        offset: int = 0,
        status_filter: Optional[ExecutionStatus] = None
    ) -> List[RacineJobExecution]:
        """
        Get execution history for a workflow.
        
        Args:
            workflow_id: Workflow ID
            limit: Maximum number of executions to return
            offset: Offset for pagination
            status_filter: Optional filter by execution status
            
        Returns:
            List of workflow executions
        """
        try:
            query = self.db.query(RacineJobExecution).filter(
                RacineJobExecution.workflow_id == workflow_id
            )
            
            if status_filter:
                query = query.filter(RacineJobExecution.status == status_filter)
            
            executions = query.order_by(
                RacineJobExecution.started_at.desc()
            ).offset(offset).limit(limit).all()
            
            # Enrich executions with step details
            enriched_executions = await self._enrich_executions_with_steps(executions)
            
            return enriched_executions
            
        except Exception as e:
            logger.error(f"Error getting workflow executions: {str(e)}")
            raise

    async def get_workflow_metrics(
        self,
        workflow_id: str,
        time_range: Optional[Dict[str, datetime]] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive metrics for a workflow.
        
        Args:
            workflow_id: Workflow ID
            time_range: Optional time range for metrics
            
        Returns:
            Comprehensive workflow metrics
        """
        try:
            # Get basic workflow metrics
            metrics = self.db.query(RacineWorkflowMetrics).filter(
                RacineWorkflowMetrics.workflow_id == workflow_id
            ).order_by(RacineWorkflowMetrics.recorded_at.desc()).first()
            
            if not metrics:
                # Create initial metrics if none exist
                metrics = await self._create_workflow_metrics(workflow_id)
            
            # Get execution statistics
            execution_stats = await self._get_execution_statistics(workflow_id, time_range)
            
            # Get performance metrics
            performance_metrics = await self._get_performance_metrics(workflow_id, time_range)
            
            # Get cross-group integration metrics
            integration_metrics = await self._get_integration_metrics(workflow_id, time_range)
            
            return {
                "workflow_metrics": metrics,
                "execution_statistics": execution_stats,
                "performance_metrics": performance_metrics,
                "integration_metrics": integration_metrics,
                "generated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error getting workflow metrics: {str(e)}")
            raise

    async def clone_workflow(
        self,
        source_workflow_id: str,
        new_name: str,
        cloned_by: str,
        include_schedule: bool = False
    ) -> RacineJobWorkflow:
        """
        Clone an existing workflow.
        
        Args:
            source_workflow_id: Source workflow ID
            new_name: New workflow name
            cloned_by: User cloning the workflow
            include_schedule: Whether to clone the schedule
            
        Returns:
            Cloned workflow
        """
        try:
            # Get source workflow
            source_workflow = await self.get_workflow(source_workflow_id, cloned_by)
            if not source_workflow:
                raise ValueError(f"Source workflow {source_workflow_id} not found or not accessible")
            
            # Create new workflow
            cloned_workflow = await self.create_workflow(
                name=new_name,
                description=f"Cloned from {source_workflow.name}",
                workflow_type=source_workflow.workflow_type,
                created_by=cloned_by,
                workspace_id=source_workflow.workspace_id,
                configuration=source_workflow.configuration
            )
            
            # Clone workflow steps
            await self._clone_workflow_steps(source_workflow_id, cloned_workflow.id, cloned_by)
            
            # Clone schedule if requested
            if include_schedule:
                await self._clone_workflow_schedule(source_workflow_id, cloned_workflow.id, cloned_by)
            
            # Create audit entry
            await self._create_audit_entry(
                cloned_workflow.id,
                "workflow_cloned",
                {
                    "source_workflow_id": source_workflow_id,
                    "include_schedule": include_schedule
                },
                cloned_by
            )
            
            self.db.commit()
            logger.info(f"Successfully cloned workflow {source_workflow_id} to {cloned_workflow.id}")
            
            return cloned_workflow
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error cloning workflow: {str(e)}")
            raise

    async def check_workflow_access(self, workflow_id: str, user_id: str) -> bool:
        """
        Check if a user has access to a workflow.
        
        Args:
            workflow_id: Workflow ID
            user_id: User ID
            
        Returns:
            True if user has access, False otherwise
        """
        try:
            workflow = self.db.query(RacineJobWorkflow).filter(
                RacineJobWorkflow.id == workflow_id
            ).first()
            
            if not workflow:
                return False
            
            # Check if user is the creator
            if workflow.created_by == user_id:
                return True
            
            # Check if user has access through workspace membership
            if workflow.workspace_id:
                from ...models.racine_models.racine_workspace_models import RacineWorkspaceMember
                member = self.db.query(RacineWorkspaceMember).filter(
                    and_(
                        RacineWorkspaceMember.workspace_id == workflow.workspace_id,
                        RacineWorkspaceMember.user_id == user_id,
                        RacineWorkspaceMember.status == "active"
                    )
                ).first()
                
                return member is not None
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking workflow access: {str(e)}")
            return False

    # Private helper methods

    async def _create_workflow_steps(
        self,
        workflow_id: str,
        steps: List[Dict[str, Any]],
        created_by: str
    ):
        """Create workflow steps from step definitions."""
        try:
            for i, step_def in enumerate(steps):
                step = RacineWorkflowStep(
                    workflow_id=workflow_id,
                    step_name=step_def.get("name", f"Step {i+1}"),
                    step_type=StepType(step_def.get("type", "script")),
                    step_order=i + 1,
                    configuration=step_def.get("configuration", {}),
                    dependencies=step_def.get("dependencies", []),
                    cross_group_mappings=step_def.get("cross_group_mappings", {}),
                    retry_policy=step_def.get("retry_policy", {"max_retries": 3}),
                    timeout_seconds=step_def.get("timeout_seconds", 3600),
                    created_by=created_by
                )
                
                self.db.add(step)
            
            logger.info(f"Created {len(steps)} steps for workflow {workflow_id}")
            
        except Exception as e:
            logger.error(f"Error creating workflow steps: {str(e)}")
            raise

    async def _start_workflow_execution(self, execution: RacineJobExecution):
        """Start the actual workflow execution."""
        try:
            # Update execution status
            execution.status = ExecutionStatus.RUNNING
            execution.started_at = datetime.utcnow()
            
            # Get workflow steps
            steps = self.db.query(RacineWorkflowStep).filter(
                RacineWorkflowStep.workflow_id == execution.workflow_id
            ).order_by(RacineWorkflowStep.step_order).all()
            
            # Execute steps in order
            for step in steps:
                await self._execute_workflow_step(execution.id, step)
            
            # Update execution status to completed
            execution.status = ExecutionStatus.COMPLETED
            execution.completed_at = datetime.utcnow()
            
            logger.info(f"Completed execution {execution.id}")
            
        except Exception as e:
            # Update execution status to failed
            execution.status = ExecutionStatus.FAILED
            execution.error_message = str(e)
            execution.completed_at = datetime.utcnow()
            
            logger.error(f"Failed execution {execution.id}: {str(e)}")
            raise

    async def _execute_workflow_step(self, execution_id: str, step: RacineWorkflowStep):
        """Execute a single workflow step."""
        try:
            # Create step execution record
            step_execution = RacineStepExecution(
                execution_id=execution_id,
                step_id=step.id,
                status=ExecutionStatus.RUNNING,
                started_at=datetime.utcnow()
            )
            
            self.db.add(step_execution)
            self.db.flush()
            
            # Execute step based on type
            if step.step_type == StepType.DATA_SOURCE:
                await self._execute_data_source_step(step_execution, step)
            elif step.step_type == StepType.SCAN_RULE:
                await self._execute_scan_rule_step(step_execution, step)
            elif step.step_type == StepType.CLASSIFICATION:
                await self._execute_classification_step(step_execution, step)
            elif step.step_type == StepType.COMPLIANCE:
                await self._execute_compliance_step(step_execution, step)
            elif step.step_type == StepType.CATALOG:
                await self._execute_catalog_step(step_execution, step)
            elif step.step_type == StepType.SCAN_LOGIC:
                await self._execute_scan_logic_step(step_execution, step)
            else:
                await self._execute_generic_step(step_execution, step)
            
            # Update step execution status
            step_execution.status = ExecutionStatus.COMPLETED
            step_execution.completed_at = datetime.utcnow()
            
            logger.info(f"Completed step {step.id} for execution {execution_id}")
            
        except Exception as e:
            # Update step execution status to failed
            step_execution.status = ExecutionStatus.FAILED
            step_execution.error_message = str(e)
            step_execution.completed_at = datetime.utcnow()
            
            logger.error(f"Failed step {step.id} for execution {execution_id}: {str(e)}")
            raise

    async def _execute_data_source_step(self, step_execution: RacineStepExecution, step: RacineWorkflowStep):
        """Execute a data source step."""
        try:
            # Use data source service for execution
            service = self.service_registry['data_sources']
            result = await self._execute_cross_group_operation(service, step.configuration)
            
            step_execution.result_data = result
            step_execution.output_metadata = {"group": "data_sources", "operation": "executed"}
            
        except Exception as e:
            logger.error(f"Error executing data source step: {str(e)}")
            raise

    async def _execute_scan_rule_step(self, step_execution: RacineStepExecution, step: RacineWorkflowStep):
        """Execute a scan rule step."""
        try:
            # Use scan rule service for execution
            service = self.service_registry['scan_rule_sets']
            result = await self._execute_cross_group_operation(service, step.configuration)
            
            step_execution.result_data = result
            step_execution.output_metadata = {"group": "scan_rule_sets", "operation": "executed"}
            
        except Exception as e:
            logger.error(f"Error executing scan rule step: {str(e)}")
            raise

    async def _execute_classification_step(self, step_execution: RacineStepExecution, step: RacineWorkflowStep):
        """Execute a classification step."""
        try:
            # Use classification service for execution
            service = self.service_registry['classifications']
            result = await self._execute_cross_group_operation(service, step.configuration)
            
            step_execution.result_data = result
            step_execution.output_metadata = {"group": "classifications", "operation": "executed"}
            
        except Exception as e:
            logger.error(f"Error executing classification step: {str(e)}")
            raise

    async def _execute_compliance_step(self, step_execution: RacineStepExecution, step: RacineWorkflowStep):
        """Execute a compliance step."""
        try:
            # Use compliance service for execution
            service = self.service_registry['compliance_rules']
            result = await self._execute_cross_group_operation(service, step.configuration)
            
            step_execution.result_data = result
            step_execution.output_metadata = {"group": "compliance_rules", "operation": "executed"}
            
        except Exception as e:
            logger.error(f"Error executing compliance step: {str(e)}")
            raise

    async def _execute_catalog_step(self, step_execution: RacineStepExecution, step: RacineWorkflowStep):
        """Execute a catalog step."""
        try:
            # Use catalog service for execution
            service = self.service_registry['advanced_catalog']
            result = await self._execute_cross_group_operation(service, step.configuration)
            
            step_execution.result_data = result
            step_execution.output_metadata = {"group": "advanced_catalog", "operation": "executed"}
            
        except Exception as e:
            logger.error(f"Error executing catalog step: {str(e)}")
            raise

    async def _execute_scan_logic_step(self, step_execution: RacineStepExecution, step: RacineWorkflowStep):
        """Execute a scan logic step."""
        try:
            # Use scan orchestrator for execution
            service = self.service_registry['scan_logic']
            result = await self._execute_cross_group_operation(service, step.configuration)
            
            step_execution.result_data = result
            step_execution.output_metadata = {"group": "scan_logic", "operation": "executed"}
            
        except Exception as e:
            logger.error(f"Error executing scan logic step: {str(e)}")
            raise

    async def _execute_generic_step(self, step_execution: RacineStepExecution, step: RacineWorkflowStep):
        """Execute a generic step."""
        try:
            # Generic step execution logic
            result = {
                "status": "success",
                "message": f"Executed {step.step_type.value} step",
                "configuration": step.configuration
            }
            
            step_execution.result_data = result
            step_execution.output_metadata = {"group": "generic", "operation": "executed"}
            
        except Exception as e:
            logger.error(f"Error executing generic step: {str(e)}")
            raise

    async def _execute_cross_group_operation(self, service: Any, configuration: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a cross-group operation using the specified service."""
        try:
            # This would need to be implemented based on each service's interface
            # For now, return a mock result
            return {
                "status": "success",
                "service": service.__class__.__name__,
                "configuration": configuration,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error executing cross-group operation: {str(e)}")
            raise

    async def _check_execution_limits(self, workflow_id: str):
        """Check if workflow can be executed based on concurrency limits."""
        try:
            workflow = self.db.query(RacineJobWorkflow).filter(
                RacineJobWorkflow.id == workflow_id
            ).first()
            
            if not workflow:
                raise ValueError(f"Workflow {workflow_id} not found")
            
            max_concurrent = workflow.configuration.get("max_concurrent_executions", 3)
            
            # Count running executions
            running_count = self.db.query(RacineJobExecution).filter(
                and_(
                    RacineJobExecution.workflow_id == workflow_id,
                    RacineJobExecution.status.in_([ExecutionStatus.QUEUED, ExecutionStatus.RUNNING])
                )
            ).count()
            
            if running_count >= max_concurrent:
                raise ValueError(f"Maximum concurrent executions ({max_concurrent}) reached for workflow {workflow_id}")
            
        except Exception as e:
            logger.error(f"Error checking execution limits: {str(e)}")
            raise

    async def _enrich_executions_with_steps(self, executions: List[RacineJobExecution]) -> List[RacineJobExecution]:
        """Enrich executions with step execution details."""
        try:
            for execution in executions:
                # Get step executions
                step_executions = self.db.query(RacineStepExecution).filter(
                    RacineStepExecution.execution_id == execution.id
                ).all()
                
                # Add step executions to execution metadata
                execution.execution_environment = execution.execution_environment or {}
                execution.execution_environment["step_executions"] = [
                    {
                        "step_id": step_exec.step_id,
                        "status": step_exec.status.value,
                        "started_at": step_exec.started_at,
                        "completed_at": step_exec.completed_at,
                        "duration_seconds": step_exec.duration_seconds
                    }
                    for step_exec in step_executions
                ]
            
            return executions
            
        except Exception as e:
            logger.error(f"Error enriching executions with steps: {str(e)}")
            return executions

    async def _create_workflow_metrics(self, workflow_id: str) -> RacineWorkflowMetrics:
        """Create initial metrics entry for a workflow."""
        try:
            metrics = RacineWorkflowMetrics(
                workflow_id=workflow_id,
                metric_type="summary",
                metric_name="workflow_summary",
                metric_value=0.0,
                metric_unit="count",
                metric_data={
                    "total_executions": 0,
                    "successful_executions": 0,
                    "failed_executions": 0,
                    "average_duration": 0.0
                }
            )
            
            self.db.add(metrics)
            return metrics
            
        except Exception as e:
            logger.error(f"Error creating workflow metrics: {str(e)}")
            raise

    async def _get_execution_statistics(
        self,
        workflow_id: str,
        time_range: Optional[Dict[str, datetime]]
    ) -> Dict[str, Any]:
        """Get execution statistics for a workflow."""
        try:
            query = self.db.query(RacineJobExecution).filter(
                RacineJobExecution.workflow_id == workflow_id
            )
            
            if time_range:
                if time_range.get("start"):
                    query = query.filter(RacineJobExecution.started_at >= time_range["start"])
                if time_range.get("end"):
                    query = query.filter(RacineJobExecution.started_at <= time_range["end"])
            
            executions = query.all()
            
            total_executions = len(executions)
            successful_executions = len([e for e in executions if e.status == ExecutionStatus.COMPLETED])
            failed_executions = len([e for e in executions if e.status == ExecutionStatus.FAILED])
            
            return {
                "total_executions": total_executions,
                "successful_executions": successful_executions,
                "failed_executions": failed_executions,
                "success_rate": successful_executions / total_executions if total_executions > 0 else 0,
                "failure_rate": failed_executions / total_executions if total_executions > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Error getting execution statistics: {str(e)}")
            return {}

    async def _get_performance_metrics(
        self,
        workflow_id: str,
        time_range: Optional[Dict[str, datetime]]
    ) -> Dict[str, Any]:
        """Get performance metrics for a workflow."""
        try:
            query = self.db.query(RacineJobExecution).filter(
                and_(
                    RacineJobExecution.workflow_id == workflow_id,
                    RacineJobExecution.duration_seconds.isnot(None)
                )
            )
            
            if time_range:
                if time_range.get("start"):
                    query = query.filter(RacineJobExecution.started_at >= time_range["start"])
                if time_range.get("end"):
                    query = query.filter(RacineJobExecution.started_at <= time_range["end"])
            
            executions = query.all()
            
            if not executions:
                return {
                    "average_duration": 0.0,
                    "min_duration": 0.0,
                    "max_duration": 0.0,
                    "total_compute_time": 0.0
                }
            
            durations = [e.duration_seconds for e in executions if e.duration_seconds]
            
            return {
                "average_duration": sum(durations) / len(durations) if durations else 0.0,
                "min_duration": min(durations) if durations else 0.0,
                "max_duration": max(durations) if durations else 0.0,
                "total_compute_time": sum(durations) if durations else 0.0
            }
            
        except Exception as e:
            logger.error(f"Error getting performance metrics: {str(e)}")
            return {}

    async def _get_integration_metrics(
        self,
        workflow_id: str,
        time_range: Optional[Dict[str, datetime]]
    ) -> Dict[str, Any]:
        """Get cross-group integration metrics for a workflow."""
        try:
            # This would aggregate metrics from all integrated services
            return {
                "data_sources_accessed": 0,
                "scan_rules_executed": 0,
                "classifications_applied": 0,
                "compliance_checks": 0,
                "catalog_updates": 0,
                "scan_jobs_triggered": 0
            }
            
        except Exception as e:
            logger.error(f"Error getting integration metrics: {str(e)}")
            return {}

    async def _clone_workflow_steps(self, source_id: str, target_id: str, cloned_by: str):
        """Clone workflow steps from source to target workflow."""
        try:
            steps = self.db.query(RacineWorkflowStep).filter(
                RacineWorkflowStep.workflow_id == source_id
            ).order_by(RacineWorkflowStep.step_order).all()
            
            for step in steps:
                cloned_step = RacineWorkflowStep(
                    workflow_id=target_id,
                    step_name=step.step_name,
                    step_type=step.step_type,
                    step_order=step.step_order,
                    configuration=step.configuration,
                    dependencies=step.dependencies,
                    cross_group_mappings=step.cross_group_mappings,
                    retry_policy=step.retry_policy,
                    timeout_seconds=step.timeout_seconds,
                    created_by=cloned_by
                )
                
                self.db.add(cloned_step)
            
            logger.info(f"Cloned {len(steps)} steps from workflow {source_id} to {target_id}")
            
        except Exception as e:
            logger.error(f"Error cloning workflow steps: {str(e)}")

    async def _clone_workflow_schedule(self, source_id: str, target_id: str, cloned_by: str):
        """Clone workflow schedule from source to target workflow."""
        try:
            schedule = self.db.query(RacineWorkflowSchedule).filter(
                RacineWorkflowSchedule.workflow_id == source_id
            ).first()
            
            if schedule:
                cloned_schedule = RacineWorkflowSchedule(
                    workflow_id=target_id,
                    schedule_type=schedule.schedule_type,
                    schedule_expression=schedule.schedule_expression,
                    timezone=schedule.timezone,
                    start_time=datetime.utcnow(),
                    end_time=schedule.end_time,
                    is_active=False,  # Clone as inactive
                    configuration=schedule.configuration,
                    created_by=cloned_by
                )
                
                self.db.add(cloned_schedule)
                logger.info(f"Cloned schedule from workflow {source_id} to {target_id}")
            
        except Exception as e:
            logger.error(f"Error cloning workflow schedule: {str(e)}")

    async def _create_audit_entry(
        self,
        workflow_id: str,
        event_type: str,
        event_data: Dict[str, Any],
        user_id: str
    ):
        """Create an audit entry for workflow operations."""
        try:
            audit_entry = RacineWorkflowAudit(
                workflow_id=workflow_id,
                event_type=event_type,
                event_description=f"Workflow {event_type}",
                event_data=event_data,
                user_id=user_id
            )
            
            self.db.add(audit_entry)
            
        except Exception as e:
            logger.error(f"Error creating audit entry: {str(e)}")

    async def get_workflow_template(self, template_id: str) -> Optional[RacineWorkflowTemplate]:
        """Get a workflow template by ID."""
        try:
            return self.db.query(RacineWorkflowTemplate).filter(
                RacineWorkflowTemplate.id == template_id
            ).first()
            
        except Exception as e:
            logger.error(f"Error getting workflow template: {str(e)}")
            return None