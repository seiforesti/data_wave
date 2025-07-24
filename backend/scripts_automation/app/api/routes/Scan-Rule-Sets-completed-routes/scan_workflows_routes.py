"""
Scan Workflows API Routes

Provides comprehensive API endpoints for workflow management as specified
in the ADVANCED_ENTERPRISE_FRONTEND_ARCHITECTURE_PLAN.md document.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
import uuid
import asyncio

from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select, and_, or_, func, desc
from pydantic import BaseModel

# Core imports
from app.core.database import get_session
from app.api.security.rbac import require_permission, get_current_user
from app.utils.rate_limiter import check_rate_limit
from app.utils.cache import cache_get, cache_set, cache_delete
from app.core.logging_config import get_logger

# Service imports
from app.services.Scan-Rule-Sets-completed-services.enterprise_orchestration_service import EnterpriseOrchestrationService
from app.services.scan_workflow_engine import ScanWorkflowEngine

# Model imports
from app.models.Scan-Rule-Sets-completed-models.orchestration_models import (
    OrchestrationJobRequest, OrchestrationJobResponse, WorkflowTemplate,
    ExecutionPipeline, JobExecutionStatusResponse, ExecutionStrategy
)

# RBAC Permissions
PERMISSION_WORKFLOW_VIEW = "workflow:view"
PERMISSION_WORKFLOW_CREATE = "workflow:create"
PERMISSION_WORKFLOW_EXECUTE = "workflow:execute"
PERMISSION_WORKFLOW_ADMIN = "workflow:admin"

# Initialize logger and services
logger = get_logger(__name__)
router = APIRouter(prefix="/scan-workflows", tags=["Scan Workflows"])

orchestration_service = EnterpriseOrchestrationService()
workflow_engine = ScanWorkflowEngine()

# ===================================
# REQUEST/RESPONSE MODELS
# ===================================

class WorkflowCreationRequest(BaseModel):
    """Request model for creating workflows."""
    name: str
    description: Optional[str] = None
    template_id: Optional[int] = None
    workflow_definition: Dict[str, Any]
    execution_strategy: str = "sequential"
    resource_requirements: Dict[str, Any] = {}
    schedule_config: Optional[Dict[str, Any]] = None
    notification_settings: Dict[str, Any] = {}

class WorkflowExecutionRequest(BaseModel):
    """Request model for executing workflows."""
    workflow_id: int
    execution_mode: str = "test"  # test, production, validation
    execution_parameters: Dict[str, Any] = {}
    priority: str = "normal"  # low, normal, high, critical
    dependency_override: bool = False

class WorkflowSchedulingRequest(BaseModel):
    """Request model for workflow scheduling."""
    workflow_id: int
    schedule_type: str = "cron"  # cron, interval, event
    schedule_config: Dict[str, Any]
    timezone: str = "UTC"
    max_concurrent_executions: int = 1

class DependencyRequest(BaseModel):
    """Request model for dependency management."""
    workflow_id: int
    dependency_type: str = "sequential"  # sequential, parallel, conditional
    dependency_config: Dict[str, Any]

class RecoveryRequest(BaseModel):
    """Request model for recovery operations."""
    execution_id: str
    recovery_type: str = "restart"  # restart, resume, skip, abort
    recovery_parameters: Dict[str, Any] = {}

class StandardResponse(BaseModel):
    """Standard API response model."""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

# ===================================
# WORKFLOW TEMPLATE MANAGEMENT
# ===================================

@router.get("/templates", response_model=StandardResponse)
async def get_workflow_templates(
    category: Optional[str] = None,
    complexity: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
):
    """
    Get workflow templates with filtering and pagination.
    
    Features:
    - Category-based filtering
    - Complexity filtering
    - Template recommendations
    - Usage statistics
    """
    try:
        await check_rate_limit(f"workflow_templates:{current_user['user_id']}", max_requests=100, window_seconds=3600)
        
        # Check cache first
        cache_key = f"workflow_templates:{category}:{complexity}:{limit}:{offset}"
        cached_result = await cache_get(cache_key)
        if cached_result:
            return StandardResponse(
                success=True,
                message="Workflow templates retrieved from cache",
                data=cached_result
            )
        
        # Build query
        query = select(WorkflowTemplate)
        
        if category:
            query = query.where(WorkflowTemplate.category == category)
        if complexity:
            query = query.where(WorkflowTemplate.complexity_level == complexity)
        
        query = query.offset(offset).limit(limit).order_by(desc(WorkflowTemplate.created_at))
        
        templates = session.exec(query).all()
        
        # Get template analytics
        template_data = []
        for template in templates:
            template_info = {
                "id": template.id,
                "name": template.name,
                "description": template.description,
                "category": template.category,
                "complexity_level": template.complexity_level,
                "estimated_duration": template.estimated_duration,
                "usage_count": template.usage_count,
                "success_rate": template.success_rate,
                "template_definition": template.template_definition,
                "created_at": template.created_at,
                "updated_at": template.updated_at
            }
            template_data.append(template_info)
        
        result = {
            "templates": template_data,
            "total_count": len(template_data),
            "has_more": len(template_data) == limit
        }
        
        # Cache the result
        await cache_set(cache_key, result, ttl=300)  # 5 minutes
        
        return StandardResponse(
            success=True,
            message=f"Retrieved {len(template_data)} workflow templates",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error retrieving workflow templates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve workflow templates: {str(e)}"
        )

# ===================================
# WORKFLOW CREATION AND MANAGEMENT
# ===================================

@router.post("/create", response_model=StandardResponse)
async def create_workflow(
    request: WorkflowCreationRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_CREATE))
):
    """
    Create a new workflow with intelligent validation and optimization.
    
    Features:
    - Template-based creation
    - Automatic validation
    - Resource requirement analysis
    - Schedule configuration
    """
    try:
        await check_rate_limit(f"create_workflow:{current_user['user_id']}", max_requests=20, window_seconds=3600)
        
        # Create workflow through orchestration service
        workflow_result = await orchestration_service.create_workflow(
            name=request.name,
            description=request.description,
            workflow_definition=request.workflow_definition,
            execution_strategy=request.execution_strategy,
            resource_requirements=request.resource_requirements,
            schedule_config=request.schedule_config,
            created_by=current_user["username"]
        )
        
        # Validate workflow
        validation_result = await workflow_engine.validate_workflow(workflow_result["workflow_id"])
        
        # Analyze resource requirements
        resource_analysis = await orchestration_service.analyze_resource_requirements(
            workflow_result["workflow_id"]
        )
        
        result = {
            "workflow_id": workflow_result["workflow_id"],
            "workflow_name": request.name,
            "validation_status": validation_result["status"],
            "validation_issues": validation_result.get("issues", []),
            "resource_analysis": resource_analysis,
            "estimated_duration": workflow_result.get("estimated_duration"),
            "created_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Workflow created successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workflow: {str(e)}"
        )

# ===================================
# WORKFLOW EXECUTION
# ===================================

@router.put("/{workflow_id}/execute", response_model=StandardResponse)
async def execute_workflow(
    workflow_id: int = Path(..., description="Workflow ID"),
    request: WorkflowExecutionRequest = Body(...),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_EXECUTE))
):
    """
    Execute a workflow with comprehensive monitoring and control.
    
    Features:
    - Multiple execution modes
    - Priority management
    - Dependency handling
    - Real-time monitoring
    """
    try:
        await check_rate_limit(f"execute_workflow:{current_user['user_id']}", max_requests=50, window_seconds=3600)
        
        # Execute workflow
        execution_result = await orchestration_service.execute_workflow(
            workflow_id=workflow_id,
            execution_mode=request.execution_mode,
            execution_parameters=request.execution_parameters,
            priority=request.priority,
            dependency_override=request.dependency_override,
            executed_by=current_user["username"]
        )
        
        result = {
            "execution_id": execution_result["execution_id"],
            "workflow_id": workflow_id,
            "execution_status": execution_result["status"],
            "execution_mode": request.execution_mode,
            "priority": request.priority,
            "estimated_completion": execution_result.get("estimated_completion"),
            "monitoring_url": f"/scan-workflows/{workflow_id}/status?execution_id={execution_result['execution_id']}",
            "started_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Workflow execution started successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error executing workflow {workflow_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute workflow: {str(e)}"
        )

# ===================================
# WORKFLOW STATUS AND MONITORING
# ===================================

@router.get("/{workflow_id}/status", response_model=StandardResponse)
async def get_workflow_status(
    workflow_id: int = Path(..., description="Workflow ID"),
    execution_id: Optional[str] = Query(None, description="Specific execution ID"),
    include_details: bool = Query(False, description="Include detailed execution information"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
):
    """
    Get workflow execution status with detailed monitoring information.
    
    Features:
    - Real-time status updates
    - Detailed execution information
    - Performance metrics
    - Error tracking
    """
    try:
        await check_rate_limit(f"workflow_status:{current_user['user_id']}", max_requests=200, window_seconds=3600)
        
        # Get workflow status
        status_result = await orchestration_service.get_workflow_status(
            workflow_id=workflow_id,
            execution_id=execution_id,
            include_details=include_details
        )
        
        result = {
            "workflow_id": workflow_id,
            "execution_id": execution_id,
            "current_status": status_result["status"],
            "progress_percentage": status_result.get("progress", 0),
            "execution_details": status_result.get("details", {}),
            "performance_metrics": status_result.get("metrics", {}),
            "error_information": status_result.get("errors", []),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Workflow status retrieved successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting workflow status for {workflow_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflow status: {str(e)}"
        )

# ===================================
# DEPENDENCY MANAGEMENT
# ===================================

@router.get("/dependencies", response_model=StandardResponse)
async def get_workflow_dependencies(
    workflow_id: Optional[int] = Query(None, description="Specific workflow ID"),
    dependency_type: Optional[str] = Query(None, description="Dependency type filter"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
):
    """
    Get workflow dependencies and dependency chains.
    
    Features:
    - Dependency visualization
    - Circular dependency detection
    - Impact analysis
    - Dependency optimization suggestions
    """
    try:
        await check_rate_limit(f"workflow_dependencies:{current_user['user_id']}", max_requests=100, window_seconds=3600)
        
        # Get dependencies
        dependencies_result = await orchestration_service.get_workflow_dependencies(
            workflow_id=workflow_id,
            dependency_type=dependency_type
        )
        
        result = {
            "workflow_id": workflow_id,
            "dependencies": dependencies_result["dependencies"],
            "dependency_chains": dependencies_result.get("chains", []),
            "circular_dependencies": dependencies_result.get("circular", []),
            "optimization_suggestions": dependencies_result.get("suggestions", []),
            "dependency_graph": dependencies_result.get("graph", {})
        }
        
        return StandardResponse(
            success=True,
            message="Workflow dependencies retrieved successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting workflow dependencies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflow dependencies: {str(e)}"
        )

# ===================================
# WORKFLOW SCHEDULING
# ===================================

@router.post("/schedule", response_model=StandardResponse)
async def schedule_workflow(
    request: WorkflowSchedulingRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_CREATE))
):
    """
    Schedule workflow execution with advanced scheduling options.
    
    Features:
    - Cron-based scheduling
    - Interval-based scheduling
    - Event-driven scheduling
    - Timezone support
    """
    try:
        await check_rate_limit(f"schedule_workflow:{current_user['user_id']}", max_requests=20, window_seconds=3600)
        
        # Schedule workflow
        schedule_result = await orchestration_service.schedule_workflow(
            workflow_id=request.workflow_id,
            schedule_type=request.schedule_type,
            schedule_config=request.schedule_config,
            timezone=request.timezone,
            max_concurrent_executions=request.max_concurrent_executions,
            scheduled_by=current_user["username"]
        )
        
        result = {
            "workflow_id": request.workflow_id,
            "schedule_id": schedule_result["schedule_id"],
            "schedule_type": request.schedule_type,
            "next_execution": schedule_result.get("next_execution"),
            "schedule_status": schedule_result["status"],
            "created_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Workflow scheduled successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error scheduling workflow: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule workflow: {str(e)}"
        )

# ===================================
# MONITORING AND ANALYTICS
# ===================================

@router.get("/monitoring", response_model=StandardResponse)
async def get_workflow_monitoring(
    workflow_ids: Optional[List[int]] = Query(None, description="Specific workflow IDs"),
    time_range: str = Query("24h", description="Time range for monitoring data"),
    metric_types: Optional[List[str]] = Query(None, description="Metric types to include"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_VIEW))
):
    """
    Get comprehensive workflow monitoring data.
    
    Features:
    - Real-time performance metrics
    - Resource utilization tracking
    - Error analysis
    - Trend analysis
    """
    try:
        await check_rate_limit(f"workflow_monitoring:{current_user['user_id']}", max_requests=100, window_seconds=3600)
        
        # Get monitoring data
        monitoring_result = await orchestration_service.get_workflow_monitoring(
            workflow_ids=workflow_ids,
            time_range=time_range,
            metric_types=metric_types
        )
        
        result = {
            "monitoring_data": monitoring_result["data"],
            "performance_metrics": monitoring_result.get("metrics", {}),
            "resource_utilization": monitoring_result.get("resources", {}),
            "error_analysis": monitoring_result.get("errors", {}),
            "trend_analysis": monitoring_result.get("trends", {}),
            "time_range": time_range,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Workflow monitoring data retrieved successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting workflow monitoring data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflow monitoring data: {str(e)}"
        )

# ===================================
# RECOVERY OPERATIONS
# ===================================

@router.post("/recovery", response_model=StandardResponse)
async def workflow_recovery_operation(
    request: RecoveryRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_WORKFLOW_EXECUTE))
):
    """
    Perform workflow recovery operations for failed or stuck executions.
    
    Features:
    - Restart failed workflows
    - Resume from checkpoint
    - Skip failed steps
    - Abort execution
    """
    try:
        await check_rate_limit(f"workflow_recovery:{current_user['user_id']}", max_requests=20, window_seconds=3600)
        
        # Perform recovery operation
        recovery_result = await orchestration_service.perform_recovery_operation(
            execution_id=request.execution_id,
            recovery_type=request.recovery_type,
            recovery_parameters=request.recovery_parameters,
            initiated_by=current_user["username"]
        )
        
        result = {
            "execution_id": request.execution_id,
            "recovery_type": request.recovery_type,
            "recovery_status": recovery_result["status"],
            "recovery_details": recovery_result.get("details", {}),
            "new_execution_id": recovery_result.get("new_execution_id"),
            "initiated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message=f"Recovery operation '{request.recovery_type}' completed successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error performing recovery operation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform recovery operation: {str(e)}"
        )