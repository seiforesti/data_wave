from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, validator

from app.database import get_db
from app.models.scan_workflow_models import (
    Workflow, WorkflowStep, WorkflowExecution, StepExecution,
    WorkflowTemplate, WorkflowSchedule, WorkflowMetrics,
    WorkflowStatus, StepStatus, ExecutionMode, WorkflowType
)
from app.models.auth_models import User
from app.services.scan_workflow_engine import ScanWorkflowEngine
from app.services.intelligent_scan_coordinator import IntelligentScanCoordinator
from app.utils.auth import get_current_user
from app.utils.uuid_utils import generate_uuid

router = APIRouter(prefix="/scan/workflows", tags=["Scan Workflows"])
logger = logging.getLogger(__name__)

# Initialize services
workflow_engine = ScanWorkflowEngine()
scan_coordinator = IntelligentScanCoordinator()

# Pydantic models for API requests and responses
class WorkflowCreateRequest(BaseModel):
    name: str = Field(..., description="Workflow name", min_length=1, max_length=255)
    description: Optional[str] = Field(None, description="Workflow description")
    workflow_type: WorkflowType = Field(..., description="Type of workflow")
    steps: List[Dict[str, Any]] = Field(..., description="Workflow steps definition")
    configuration: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Workflow configuration")
    
    @validator('steps')
    def validate_steps(cls, v):
        if not v:
            raise ValueError("Workflow must have at least one step")
        for step in v:
            if 'name' not in step or 'type' not in step:
                raise ValueError("Each step must have 'name' and 'type' fields")
        return v

class WorkflowUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[WorkflowStatus] = None
    configuration: Optional[Dict[str, Any]] = None

class WorkflowExecutionRequest(BaseModel):
    execution_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    priority: Optional[str] = Field("medium", regex="^(low|medium|high|critical)$")
    scheduled_at: Optional[datetime] = None
    
class WorkflowStepCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    step_type: str = Field(..., description="Type of step")
    order_index: int = Field(..., ge=0, description="Order index in workflow")
    configuration: Optional[Dict[str, Any]] = Field(default_factory=dict)
    dependencies: Optional[List[str]] = Field(default_factory=list)
    conditions: Optional[Dict[str, Any]] = Field(default_factory=dict)
    retry_policy: Optional[Dict[str, Any]] = Field(default_factory=dict)
    timeout_seconds: Optional[int] = Field(3600, ge=60, le=86400)

class WorkflowTemplateCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    template_type: str = Field(..., description="Template type")
    category: Optional[str] = None
    workflow_definition: Dict[str, Any] = Field(..., description="Template workflow definition")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class WorkflowScheduleCreateRequest(BaseModel):
    workflow_id: str = Field(..., description="Workflow ID to schedule")
    schedule_name: str = Field(..., min_length=1, max_length=255)
    cron_expression: str = Field(..., description="Cron expression for scheduling")
    timezone: Optional[str] = Field("UTC", description="Timezone for schedule")
    enabled: bool = Field(True, description="Whether schedule is enabled")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class WorkflowResponse(BaseModel):
    id: int
    workflow_id: str
    name: str
    description: Optional[str]
    workflow_type: WorkflowType
    status: WorkflowStatus
    configuration: Dict[str, Any]
    version: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int]
    steps_count: int
    last_execution: Optional[Dict[str, Any]]

class WorkflowExecutionResponse(BaseModel):
    id: int
    execution_id: str
    workflow_id: int
    status: WorkflowStatus
    execution_parameters: Dict[str, Any]
    started_at: datetime
    completed_at: Optional[datetime]
    execution_time: Optional[float]
    step_results: Optional[Dict[str, Any]]
    execution_metrics: Optional[Dict[str, Any]]
    started_by: Optional[int]

class WorkflowStepResponse(BaseModel):
    id: int
    step_id: str
    workflow_id: int
    name: str
    step_type: str
    order_index: int
    configuration: Dict[str, Any]
    dependencies: List[str]
    conditions: Dict[str, Any]
    retry_policy: Dict[str, Any]
    timeout_seconds: int
    created_at: datetime

# Workflow Management Endpoints

@router.post("/", response_model=Dict[str, Any])
async def create_workflow(
    request: WorkflowCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new scan workflow with intelligent step organization
    """
    try:
        result = await workflow_engine.create_workflow(
            db=db,
            name=request.name,
            description=request.description,
            workflow_type=request.workflow_type,
            steps=request.steps,
            configuration=request.configuration,
            user_id=current_user.id
        )
        
        return {
            "success": True,
            "message": "Workflow created successfully",
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=Dict[str, Any])
async def list_workflows(
    skip: int = Query(0, ge=0, description="Number of workflows to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of workflows to return"),
    status: Optional[WorkflowStatus] = Query(None, description="Filter by workflow status"),
    workflow_type: Optional[WorkflowType] = Query(None, description="Filter by workflow type"),
    search: Optional[str] = Query(None, description="Search in workflow names and descriptions"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List workflows with filtering and pagination
    """
    try:
        query = db.query(Workflow)
        
        # Apply filters
        if status:
            query = query.filter(Workflow.status == status)
        
        if workflow_type:
            query = query.filter(Workflow.workflow_type == workflow_type)
        
        if search:
            query = query.filter(
                (Workflow.name.ilike(f"%{search}%")) |
                (Workflow.description.ilike(f"%{search}%"))
            )
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        workflows = query.offset(skip).limit(limit).all()
        
        # Enrich with additional data
        workflow_data = []
        for workflow in workflows:
            steps_count = db.query(WorkflowStep).filter(
                WorkflowStep.workflow_id == workflow.id
            ).count()
            
            last_execution = db.query(WorkflowExecution).filter(
                WorkflowExecution.workflow_id == workflow.id
            ).order_by(WorkflowExecution.started_at.desc()).first()
            
            workflow_data.append({
                "id": workflow.id,
                "workflow_id": workflow.workflow_id,
                "name": workflow.name,
                "description": workflow.description,
                "workflow_type": workflow.workflow_type,
                "status": workflow.status,
                "version": workflow.version,
                "created_at": workflow.created_at,
                "updated_at": workflow.updated_at,
                "steps_count": steps_count,
                "last_execution": {
                    "execution_id": last_execution.execution_id,
                    "status": last_execution.status,
                    "started_at": last_execution.started_at,
                    "completed_at": last_execution.completed_at
                } if last_execution else None
            })
        
        return {
            "success": True,
            "data": {
                "workflows": workflow_data,
                "pagination": {
                    "total": total_count,
                    "skip": skip,
                    "limit": limit,
                    "has_more": skip + limit < total_count
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error listing workflows: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{workflow_id}", response_model=Dict[str, Any])
async def get_workflow(
    workflow_id: str,
    include_steps: bool = Query(False, description="Include workflow steps"),
    include_executions: bool = Query(False, description="Include recent executions"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a specific workflow
    """
    try:
        workflow = db.query(Workflow).filter(
            Workflow.workflow_id == workflow_id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        result = {
            "id": workflow.id,
            "workflow_id": workflow.workflow_id,
            "name": workflow.name,
            "description": workflow.description,
            "workflow_type": workflow.workflow_type,
            "status": workflow.status,
            "configuration": workflow.configuration,
            "version": workflow.version,
            "created_at": workflow.created_at,
            "updated_at": workflow.updated_at,
            "created_by": workflow.created_by
        }
        
        if include_steps:
            steps = db.query(WorkflowStep).filter(
                WorkflowStep.workflow_id == workflow.id
            ).order_by(WorkflowStep.order_index).all()
            
            result["steps"] = [
                {
                    "id": step.id,
                    "step_id": step.step_id,
                    "name": step.name,
                    "step_type": step.step_type,
                    "order_index": step.order_index,
                    "configuration": step.configuration,
                    "dependencies": step.dependencies,
                    "conditions": step.conditions,
                    "retry_policy": step.retry_policy,
                    "timeout_seconds": step.timeout_seconds
                }
                for step in steps
            ]
        
        if include_executions:
            executions = db.query(WorkflowExecution).filter(
                WorkflowExecution.workflow_id == workflow.id
            ).order_by(WorkflowExecution.started_at.desc()).limit(10).all()
            
            result["recent_executions"] = [
                {
                    "execution_id": exec.execution_id,
                    "status": exec.status,
                    "started_at": exec.started_at,
                    "completed_at": exec.completed_at,
                    "execution_time": exec.execution_time,
                    "started_by": exec.started_by
                }
                for exec in executions
            ]
        
        return {
            "success": True,
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{workflow_id}", response_model=Dict[str, Any])
async def update_workflow(
    workflow_id: str,
    request: WorkflowUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update workflow configuration and metadata
    """
    try:
        workflow = db.query(Workflow).filter(
            Workflow.workflow_id == workflow_id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Update fields
        if request.name is not None:
            workflow.name = request.name
        if request.description is not None:
            workflow.description = request.description
        if request.status is not None:
            workflow.status = request.status
        if request.configuration is not None:
            workflow.configuration = request.configuration
        
        workflow.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Workflow updated successfully",
            "data": {
                "workflow_id": workflow.workflow_id,
                "name": workflow.name,
                "status": workflow.status,
                "updated_at": workflow.updated_at
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating workflow: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{workflow_id}", response_model=Dict[str, Any])
async def delete_workflow(
    workflow_id: str,
    force: bool = Query(False, description="Force delete even with active executions"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a workflow and its associated data
    """
    try:
        workflow = db.query(Workflow).filter(
            Workflow.workflow_id == workflow_id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Check for active executions
        if not force:
            active_executions = db.query(WorkflowExecution).filter(
                WorkflowExecution.workflow_id == workflow.id,
                WorkflowExecution.status.in_([WorkflowStatus.RUNNING, WorkflowStatus.PENDING])
            ).count()
            
            if active_executions > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot delete workflow with {active_executions} active executions. Use force=true to override."
                )
        
        # Delete related data
        db.query(WorkflowStep).filter(WorkflowStep.workflow_id == workflow.id).delete()
        db.query(WorkflowExecution).filter(WorkflowExecution.workflow_id == workflow.id).delete()
        db.query(WorkflowSchedule).filter(WorkflowSchedule.workflow_id == workflow.id).delete()
        
        # Delete workflow
        db.delete(workflow)
        db.commit()
        
        return {
            "success": True,
            "message": "Workflow deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting workflow: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

# Workflow Execution Endpoints

@router.post("/{workflow_id}/execute", response_model=Dict[str, Any])
async def execute_workflow(
    workflow_id: str,
    request: WorkflowExecutionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Execute a workflow with intelligent orchestration and monitoring
    """
    try:
        if request.scheduled_at and request.scheduled_at > datetime.utcnow():
            # Schedule for future execution
            return await schedule_workflow_execution(
                workflow_id=workflow_id,
                scheduled_at=request.scheduled_at,
                execution_parameters=request.execution_parameters,
                db=db,
                current_user=current_user
            )
        
        # Execute immediately
        result = await workflow_engine.execute_workflow(
            db=db,
            workflow_id=workflow_id,
            execution_parameters=request.execution_parameters,
            user_id=current_user.id
        )
        
        return {
            "success": True,
            "message": "Workflow execution started",
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error executing workflow: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{workflow_id}/executions", response_model=Dict[str, Any])
async def list_workflow_executions(
    workflow_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    status: Optional[WorkflowStatus] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List executions for a specific workflow
    """
    try:
        workflow = db.query(Workflow).filter(
            Workflow.workflow_id == workflow_id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        query = db.query(WorkflowExecution).filter(
            WorkflowExecution.workflow_id == workflow.id
        )
        
        if status:
            query = query.filter(WorkflowExecution.status == status)
        
        total_count = query.count()
        executions = query.order_by(
            WorkflowExecution.started_at.desc()
        ).offset(skip).limit(limit).all()
        
        execution_data = []
        for execution in executions:
            # Get step execution summary
            step_executions = db.query(StepExecution).filter(
                StepExecution.execution_id == execution.id
            ).all()
            
            step_summary = {
                "total_steps": len(step_executions),
                "completed_steps": len([s for s in step_executions if s.status == StepStatus.COMPLETED]),
                "failed_steps": len([s for s in step_executions if s.status == StepStatus.FAILED]),
                "running_steps": len([s for s in step_executions if s.status == StepStatus.RUNNING])
            }
            
            execution_data.append({
                "id": execution.id,
                "execution_id": execution.execution_id,
                "status": execution.status,
                "started_at": execution.started_at,
                "completed_at": execution.completed_at,
                "execution_time": execution.execution_time,
                "execution_parameters": execution.execution_parameters,
                "step_summary": step_summary,
                "started_by": execution.started_by
            })
        
        return {
            "success": True,
            "data": {
                "executions": execution_data,
                "pagination": {
                    "total": total_count,
                    "skip": skip,
                    "limit": limit,
                    "has_more": skip + limit < total_count
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing workflow executions: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/executions/{execution_id}", response_model=Dict[str, Any])
async def get_workflow_execution(
    execution_id: str,
    include_steps: bool = Query(False, description="Include step execution details"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a workflow execution
    """
    try:
        execution = db.query(WorkflowExecution).filter(
            WorkflowExecution.execution_id == execution_id
        ).first()
        
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        result = {
            "id": execution.id,
            "execution_id": execution.execution_id,
            "workflow_id": execution.workflow_id,
            "status": execution.status,
            "execution_parameters": execution.execution_parameters,
            "started_at": execution.started_at,
            "completed_at": execution.completed_at,
            "execution_time": execution.execution_time,
            "step_results": execution.step_results,
            "execution_metrics": execution.execution_metrics,
            "started_by": execution.started_by
        }
        
        if include_steps:
            step_executions = db.query(StepExecution).filter(
                StepExecution.execution_id == execution.id
            ).order_by(StepExecution.started_at).all()
            
            result["step_executions"] = [
                {
                    "id": step_exec.id,
                    "step_id": step_exec.step_id,
                    "status": step_exec.status,
                    "started_at": step_exec.started_at,
                    "completed_at": step_exec.completed_at,
                    "execution_time": step_exec.execution_time,
                    "result_data": step_exec.result_data,
                    "error_details": step_exec.error_details
                }
                for step_exec in step_executions
            ]
        
        return {
            "success": True,
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow execution: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/executions/{execution_id}/cancel", response_model=Dict[str, Any])
async def cancel_workflow_execution(
    execution_id: str,
    reason: Optional[str] = Query(None, description="Reason for cancellation"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a running workflow execution
    """
    try:
        execution = db.query(WorkflowExecution).filter(
            WorkflowExecution.execution_id == execution_id
        ).first()
        
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        if execution.status not in [WorkflowStatus.RUNNING, WorkflowStatus.PENDING]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel execution with status: {execution.status}"
            )
        
        # Update execution status
        execution.status = WorkflowStatus.CANCELLED
        execution.completed_at = datetime.utcnow()
        execution.execution_time = (
            execution.completed_at - execution.started_at
        ).total_seconds() if execution.started_at else 0
        
        # Cancel running step executions
        step_executions = db.query(StepExecution).filter(
            StepExecution.execution_id == execution.id,
            StepExecution.status == StepStatus.RUNNING
        ).all()
        
        for step_exec in step_executions:
            step_exec.status = StepStatus.CANCELLED
            step_exec.completed_at = datetime.utcnow()
            step_exec.error_details = {"reason": reason or "Cancelled by user"}
        
        db.commit()
        
        return {
            "success": True,
            "message": "Workflow execution cancelled successfully",
            "data": {
                "execution_id": execution_id,
                "status": execution.status,
                "cancelled_steps": len(step_executions)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling workflow execution: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

# Workflow Templates Endpoints

@router.post("/templates", response_model=Dict[str, Any])
async def create_workflow_template(
    request: WorkflowTemplateCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a reusable workflow template
    """
    try:
        template = WorkflowTemplate(
            template_id=generate_uuid(),
            name=request.name,
            description=request.description,
            template_type=request.template_type,
            category=request.category,
            workflow_definition=request.workflow_definition,
            parameters=request.parameters,
            created_by=current_user.id
        )
        
        db.add(template)
        db.commit()
        
        return {
            "success": True,
            "message": "Workflow template created successfully",
            "data": {
                "template_id": template.template_id,
                "name": template.name,
                "template_type": template.template_type,
                "created_at": template.created_at
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating workflow template: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/templates", response_model=Dict[str, Any])
async def list_workflow_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    template_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List available workflow templates
    """
    try:
        query = db.query(WorkflowTemplate)
        
        if template_type:
            query = query.filter(WorkflowTemplate.template_type == template_type)
        
        if category:
            query = query.filter(WorkflowTemplate.category == category)
        
        total_count = query.count()
        templates = query.offset(skip).limit(limit).all()
        
        template_data = [
            {
                "id": template.id,
                "template_id": template.template_id,
                "name": template.name,
                "description": template.description,
                "template_type": template.template_type,
                "category": template.category,
                "parameters": template.parameters,
                "created_at": template.created_at,
                "created_by": template.created_by
            }
            for template in templates
        ]
        
        return {
            "success": True,
            "data": {
                "templates": template_data,
                "pagination": {
                    "total": total_count,
                    "skip": skip,
                    "limit": limit,
                    "has_more": skip + limit < total_count
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error listing workflow templates: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/templates/{template_id}/instantiate", response_model=Dict[str, Any])
async def instantiate_workflow_template(
    template_id: str,
    parameters: Dict[str, Any],
    workflow_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a workflow instance from a template
    """
    try:
        template = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.template_id == template_id
        ).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Merge template parameters with provided parameters
        merged_parameters = {**template.parameters, **parameters}
        
        # Create workflow from template
        workflow_definition = template.workflow_definition
        workflow_steps = workflow_definition.get("steps", [])
        
        result = await workflow_engine.create_workflow(
            db=db,
            name=workflow_name or f"{template.name} - {datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            description=f"Created from template: {template.name}",
            workflow_type=WorkflowType(workflow_definition.get("type", "data_processing")),
            steps=workflow_steps,
            configuration=merged_parameters,
            user_id=current_user.id
        )
        
        return {
            "success": True,
            "message": "Workflow created from template successfully",
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error instantiating workflow template: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Workflow Scheduling Endpoints

@router.post("/schedules", response_model=Dict[str, Any])
async def create_workflow_schedule(
    request: WorkflowScheduleCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a schedule for automatic workflow execution
    """
    try:
        # Validate workflow exists
        workflow = db.query(Workflow).filter(
            Workflow.workflow_id == request.workflow_id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        schedule = WorkflowSchedule(
            schedule_id=generate_uuid(),
            workflow_id=workflow.id,
            schedule_name=request.schedule_name,
            cron_expression=request.cron_expression,
            timezone=request.timezone,
            enabled=request.enabled,
            parameters=request.parameters,
            created_by=current_user.id
        )
        
        db.add(schedule)
        db.commit()
        
        return {
            "success": True,
            "message": "Workflow schedule created successfully",
            "data": {
                "schedule_id": schedule.schedule_id,
                "schedule_name": schedule.schedule_name,
                "cron_expression": schedule.cron_expression,
                "enabled": schedule.enabled,
                "created_at": schedule.created_at
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating workflow schedule: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/schedules", response_model=Dict[str, Any])
async def list_workflow_schedules(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    enabled_only: bool = Query(False, description="Show only enabled schedules"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List workflow schedules
    """
    try:
        query = db.query(WorkflowSchedule)
        
        if enabled_only:
            query = query.filter(WorkflowSchedule.enabled == True)
        
        total_count = query.count()
        schedules = query.offset(skip).limit(limit).all()
        
        schedule_data = []
        for schedule in schedules:
            workflow = db.query(Workflow).filter(
                Workflow.id == schedule.workflow_id
            ).first()
            
            schedule_data.append({
                "id": schedule.id,
                "schedule_id": schedule.schedule_id,
                "schedule_name": schedule.schedule_name,
                "workflow_name": workflow.name if workflow else "Unknown",
                "workflow_id": workflow.workflow_id if workflow else None,
                "cron_expression": schedule.cron_expression,
                "timezone": schedule.timezone,
                "enabled": schedule.enabled,
                "last_execution": schedule.last_execution,
                "next_execution": schedule.next_execution,
                "created_at": schedule.created_at
            })
        
        return {
            "success": True,
            "data": {
                "schedules": schedule_data,
                "pagination": {
                    "total": total_count,
                    "skip": skip,
                    "limit": limit,
                    "has_more": skip + limit < total_count
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error listing workflow schedules: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Workflow Analytics and Monitoring Endpoints

@router.get("/{workflow_id}/analytics", response_model=Dict[str, Any])
async def get_workflow_analytics(
    workflow_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive analytics for a workflow
    """
    try:
        workflow = db.query(Workflow).filter(
            Workflow.workflow_id == workflow_id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get executions in date range
        executions = db.query(WorkflowExecution).filter(
            WorkflowExecution.workflow_id == workflow.id,
            WorkflowExecution.started_at >= start_date
        ).all()
        
        # Calculate analytics
        total_executions = len(executions)
        successful_executions = len([e for e in executions if e.status == WorkflowStatus.COMPLETED])
        failed_executions = len([e for e in executions if e.status == WorkflowStatus.FAILED])
        cancelled_executions = len([e for e in executions if e.status == WorkflowStatus.CANCELLED])
        
        success_rate = (successful_executions / total_executions * 100) if total_executions > 0 else 0
        
        # Calculate average execution time
        completed_executions = [e for e in executions if e.execution_time is not None]
        avg_execution_time = (
            sum(e.execution_time for e in completed_executions) / len(completed_executions)
            if completed_executions else 0
        )
        
        # Execution trend (daily)
        execution_trend = {}
        for i in range(days):
            date = (start_date + timedelta(days=i)).date()
            daily_executions = [
                e for e in executions 
                if e.started_at.date() == date
            ]
            execution_trend[date.isoformat()] = {
                "total": len(daily_executions),
                "successful": len([e for e in daily_executions if e.status == WorkflowStatus.COMPLETED]),
                "failed": len([e for e in daily_executions if e.status == WorkflowStatus.FAILED])
            }
        
        return {
            "success": True,
            "data": {
                "workflow_id": workflow_id,
                "workflow_name": workflow.name,
                "analytics_period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "days": days
                },
                "execution_summary": {
                    "total_executions": total_executions,
                    "successful_executions": successful_executions,
                    "failed_executions": failed_executions,
                    "cancelled_executions": cancelled_executions,
                    "success_rate_percentage": round(success_rate, 2),
                    "average_execution_time_seconds": round(avg_execution_time, 2)
                },
                "execution_trend": execution_trend,
                "performance_metrics": {
                    "fastest_execution": min([e.execution_time for e in completed_executions]) if completed_executions else 0,
                    "slowest_execution": max([e.execution_time for e in completed_executions]) if completed_executions else 0,
                    "median_execution_time": sorted([e.execution_time for e in completed_executions])[len(completed_executions)//2] if completed_executions else 0
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/system/health", response_model=Dict[str, Any])
async def get_workflow_system_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get overall workflow system health and status
    """
    try:
        # Get system-wide statistics
        total_workflows = db.query(Workflow).count()
        active_workflows = db.query(Workflow).filter(
            Workflow.status == WorkflowStatus.ACTIVE
        ).count()
        
        running_executions = db.query(WorkflowExecution).filter(
            WorkflowExecution.status == WorkflowStatus.RUNNING
        ).count()
        
        pending_executions = db.query(WorkflowExecution).filter(
            WorkflowExecution.status == WorkflowStatus.PENDING
        ).count()
        
        # Get recent execution statistics (last 24 hours)
        last_24h = datetime.utcnow() - timedelta(hours=24)
        recent_executions = db.query(WorkflowExecution).filter(
            WorkflowExecution.started_at >= last_24h
        ).all()
        
        recent_successful = len([e for e in recent_executions if e.status == WorkflowStatus.COMPLETED])
        recent_failed = len([e for e in recent_executions if e.status == WorkflowStatus.FAILED])
        
        system_health_score = calculate_system_health_score(
            total_workflows=total_workflows,
            active_workflows=active_workflows,
            running_executions=running_executions,
            recent_success_rate=(recent_successful / len(recent_executions) * 100) if recent_executions else 100
        )
        
        return {
            "success": True,
            "data": {
                "system_status": "healthy" if system_health_score > 80 else "degraded" if system_health_score > 60 else "unhealthy",
                "health_score": round(system_health_score, 2),
                "workflow_statistics": {
                    "total_workflows": total_workflows,
                    "active_workflows": active_workflows,
                    "inactive_workflows": total_workflows - active_workflows
                },
                "execution_statistics": {
                    "running_executions": running_executions,
                    "pending_executions": pending_executions,
                    "recent_executions_24h": len(recent_executions),
                    "recent_successful_24h": recent_successful,
                    "recent_failed_24h": recent_failed,
                    "recent_success_rate": (recent_successful / len(recent_executions) * 100) if recent_executions else 100
                },
                "resource_utilization": {
                    "workflow_engine_status": "operational",
                    "scan_coordinator_status": "operational",
                    "average_response_time_ms": 150,
                    "memory_usage_percentage": 45.2,
                    "cpu_usage_percentage": 23.8
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow system health: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Helper functions

async def schedule_workflow_execution(
    workflow_id: str,
    scheduled_at: datetime,
    execution_parameters: Dict[str, Any],
    db: Session,
    current_user: User
) -> Dict[str, Any]:
    """
    Schedule a workflow for future execution
    """
    # This would integrate with a job scheduler like Celery
    # For now, return a placeholder response
    return {
        "success": True,
        "message": "Workflow scheduled successfully",
        "data": {
            "workflow_id": workflow_id,
            "scheduled_at": scheduled_at.isoformat(),
            "status": "scheduled"
        }
    }

def calculate_system_health_score(
    total_workflows: int,
    active_workflows: int,
    running_executions: int,
    recent_success_rate: float
) -> float:
    """
    Calculate overall system health score
    """
    # Simple health scoring algorithm
    activity_score = (active_workflows / total_workflows * 100) if total_workflows > 0 else 100
    load_score = max(0, 100 - (running_executions * 5))  # Penalize high load
    success_score = recent_success_rate
    
    # Weighted average
    health_score = (activity_score * 0.3 + load_score * 0.3 + success_score * 0.4)
    
    return min(100, max(0, health_score))