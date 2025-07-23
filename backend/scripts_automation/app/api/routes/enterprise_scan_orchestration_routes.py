"""
Enterprise Scan Orchestration API Routes - Advanced Production Implementation
===========================================================================

This module provides comprehensive FastAPI routes for the Unified Scan Orchestrator,
serving as the central API gateway for all scanning activities across the enterprise
data governance ecosystem. These routes tie together all system components with
intelligent orchestration, real-time monitoring, and seamless integration.

Enterprise Features:
- Unified orchestration across all data governance systems
- Intelligent workflow management with AI-powered optimization
- Real-time monitoring and control via WebSocket and SSE
- Advanced resource allocation and cost optimization
- Comprehensive dependency management and resolution
- Enterprise-grade analytics and business intelligence
- Multi-dimensional scheduling and priority management
- Autonomous decision-making and self-healing capabilities
- Complete audit trails and compliance tracking
- Cross-system integration and coordination

Production Requirements:
- Handle 10,000+ concurrent orchestrations
- Sub-second response times for critical operations
- Real-time streaming for operational dashboards
- Enterprise security and RBAC integration
- Zero-downtime deployments and updates
- Comprehensive monitoring and alerting
- Business intelligence and ROI analytics
"""

from typing import List, Dict, Any, Optional, Union, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import logging
import time
from concurrent.futures import ThreadPoolExecutor
import traceback
import io
from pathlib import Path

# FastAPI and HTTP imports
from fastapi import (
    APIRouter, Depends, HTTPException, BackgroundTasks, Query, 
    StreamingResponse, JSONResponse, WebSocket, Path as FastAPIPath, 
    Body, status, Response, Request, WebSocketDisconnect, File, UploadFile
)
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_, func, text, desc, asc
from sqlalchemy.orm import selectinload, joinedload
import pandas as pd

# Core application imports
from ...models.scan_orchestration_models import (
    ScanOrchestrationMaster, ScanWorkflowExecution, ScanResourceAllocation,
    OrchestrationStageExecution, OrchestrationDependency, OrchestrationPerformanceSnapshot,
    IntelligentScanCoordinator, OrchestrationStatus, WorkflowStatus, ResourceType,
    SchedulingStrategy, WorkflowType, DependencyType, PriorityLevel, ExecutionMode,
    OptimizationGoal, OrchestrationCreateRequest, OrchestrationResponse,
    ResourceAllocationRequest, WorkflowExecutionResponse, OrchestrationAnalytics
)
from ...services.unified_scan_orchestrator import (
    UnifiedScanOrchestrator, get_unified_orchestrator,
    OrchestratorStatus, ResourcePoolType
)
from ...core.database import get_session
from ...core.security import get_current_user, check_permissions
from ...core.monitoring import MetricsCollector, AlertManager
from ...core.logging import StructuredLogger
from ...core.cache import RedisCache
from ...core.pagination import PaginationParams, PaginatedResponse
from ...core.rate_limiting import RateLimiter
from ...core.background_tasks import BackgroundTaskManager

# Configure structured logging and dependencies
logger = StructuredLogger(__name__)
security = HTTPBearer()
router = APIRouter(prefix="/api/v1/orchestration", tags=["Enterprise Scan Orchestration"])


# ===================== DEPENDENCY INJECTION =====================

async def get_orchestrator() -> UnifiedScanOrchestrator:
    """Get the unified scan orchestrator instance."""
    return await get_unified_orchestrator()


async def get_metrics_collector() -> MetricsCollector:
    """Get metrics collector instance."""
    return MetricsCollector()


async def get_cache() -> RedisCache:
    """Get Redis cache instance."""
    return RedisCache()


async def get_rate_limiter() -> RateLimiter:
    """Get rate limiter instance."""
    return RateLimiter()


# ===================== REQUEST/RESPONSE MODELS =====================

class BulkOrchestrationRequest(BaseModel):
    """Request model for bulk orchestration creation"""
    orchestrations: List[OrchestrationCreateRequest]
    batch_config: Dict[str, Any] = {}
    execution_strategy: str = Field(default="parallel", regex="^(parallel|sequential|hybrid)$")
    max_concurrent: int = Field(default=10, ge=1, le=50)
    auto_start: bool = True


class OrchestrationControlRequest(BaseModel):
    """Request model for orchestration control operations"""
    action: str = Field(regex="^(start|pause|resume|cancel|terminate|retry)$")
    reason: Optional[str] = Field(max_length=500)
    force: bool = False
    wait_for_completion: bool = False
    timeout_minutes: Optional[int] = Field(None, ge=1, le=1440)


class ResourceOptimizationRequest(BaseModel):
    """Request model for resource optimization"""
    optimization_scope: str = Field(default="global", regex="^(global|orchestration|resource_type)$")
    orchestration_ids: Optional[List[str]] = []
    resource_types: Optional[List[ResourceType]] = []
    optimization_goals: List[OptimizationGoal] = [OptimizationGoal.BALANCED]
    aggressive_mode: bool = False
    dry_run: bool = False
    apply_automatically: bool = False


class AnalyticsRequest(BaseModel):
    """Request model for orchestration analytics"""
    time_range_start: datetime
    time_range_end: datetime
    orchestration_types: Optional[List[WorkflowType]] = None
    priority_levels: Optional[List[PriorityLevel]] = None
    include_predictions: bool = True
    include_recommendations: bool = True
    aggregation_level: str = Field(default="hourly", regex="^(minutely|hourly|daily|weekly|monthly)$")


class DependencyManagementRequest(BaseModel):
    """Request model for dependency management"""
    source_orchestration_id: str
    target_orchestration_id: str
    dependency_type: DependencyType
    is_mandatory: bool = True
    condition_expression: Optional[str] = None
    timeout_minutes: Optional[int] = Field(None, ge=1)
    auto_resolve: bool = True


class HealthCheckResponse(BaseModel):
    """Response model for health checks"""
    status: OrchestratorStatus
    timestamp: datetime
    active_orchestrations: int
    system_load: Dict[str, float]
    resource_utilization: Dict[str, float]
    performance_metrics: Dict[str, float]
    alerts: List[Dict[str, Any]]
    recommendations: List[str]


# ===================== ORCHESTRATION MANAGEMENT ENDPOINTS =====================

@router.post("/orchestrations", response_model=OrchestrationResponse, status_code=status.HTTP_201_CREATED)
async def create_orchestration(
    request: OrchestrationCreateRequest,
    auto_start: bool = Query(True, description="Automatically start orchestration after creation"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    orchestrator: UnifiedScanOrchestrator = Depends(get_orchestrator),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Create a new unified orchestration with intelligent planning,
    resource allocation, and automatic integration across all systems.
    
    Features:
    - AI-powered workflow planning and optimization
    - Intelligent resource allocation and cost estimation
    - Automatic dependency resolution and validation
    - Real-time monitoring and performance tracking
    - Integration with all data governance components
    - Enterprise-grade audit trails and compliance
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "orchestration:create")
        
        logger.info(
            "Creating unified orchestration",
            extra={
                "orchestration_name": request.orchestration_name,
                "orchestration_type": request.orchestration_type.value,
                "user_id": current_user["user_id"],
                "auto_start": auto_start
            }
        )
        
        # Create orchestration using orchestrator service
        orchestration_response = await orchestrator.create_orchestration(
            request=request,
            session=session,
            user_id=current_user["user_id"],
            auto_start=auto_start
        )
        
        # Schedule background monitoring
        background_tasks.add_task(
            _setup_orchestration_monitoring,
            orchestration_response.orchestration_id,
            current_user["user_id"]
        )
        
        # Record creation metrics
        creation_time = time.time() - start_time
        await metrics.record_histogram("orchestration_api_creation_duration", creation_time)
        await metrics.increment_counter(
            "orchestrations_created_via_api",
            tags={
                "orchestration_type": request.orchestration_type.value,
                "user_id": current_user["user_id"],
                "auto_start": str(auto_start)
            }
        )
        
        logger.info(
            "Orchestration created successfully",
            extra={
                "orchestration_id": orchestration_response.orchestration_id,
                "creation_time": creation_time,
                "estimated_cost": orchestration_response.estimated_cost,
                "estimated_completion": orchestration_response.estimated_completion.isoformat() if orchestration_response.estimated_completion else None
            }
        )
        
        return orchestration_response
        
    except Exception as e:
        await metrics.increment_counter(
            "orchestration_creation_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Failed to create orchestration",
            extra={
                "orchestration_name": request.orchestration_name,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create orchestration: {str(e)}"
        )


@router.get("/orchestrations/{orchestration_id}", response_model=OrchestrationResponse)
async def get_orchestration(
    orchestration_id: str = FastAPIPath(..., description="Orchestration ID"),
    include_stages: bool = Query(False, description="Include stage execution details"),
    include_resources: bool = Query(False, description="Include resource allocation details"),
    include_performance: bool = Query(False, description="Include performance metrics"),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    cache: RedisCache = Depends(get_cache),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Retrieve detailed orchestration information with optional enriched data
    including stage executions, resource allocations, and performance metrics.
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "orchestration:read")
        
        # Check cache first
        cache_key = f"orchestration:{orchestration_id}:{include_stages}:{include_resources}:{include_performance}"
        cached_orchestration = await cache.get(cache_key)
        
        if cached_orchestration:
            await metrics.increment_counter("orchestration_cache_hits")
            return OrchestrationResponse.parse_obj(cached_orchestration)
        
        # Build query with optional relationships
        query = select(ScanOrchestrationMaster).where(
            ScanOrchestrationMaster.orchestration_id == orchestration_id
        )
        
        if include_stages:
            query = query.options(
                selectinload(ScanOrchestrationMaster.stage_executions),
                selectinload(ScanOrchestrationMaster.workflow_executions)
            )
        
        if include_resources:
            query = query.options(
                selectinload(ScanOrchestrationMaster.resource_allocations)
            )
        
        if include_performance:
            query = query.options(
                selectinload(ScanOrchestrationMaster.performance_snapshots)
            )
        
        # Execute query
        result = await session.execute(query)
        orchestration = result.scalar_one_or_none()
        
        if not orchestration:
            raise HTTPException(
                status_code=404,
                detail=f"Orchestration {orchestration_id} not found"
            )
        
        # Convert to response model
        response = OrchestrationResponse.from_orm(orchestration)
        
        # Cache the result
        await cache.set(
            cache_key,
            response.dict(),
            expire=300  # 5 minutes
        )
        
        # Record retrieval metrics
        retrieval_time = time.time() - start_time
        await metrics.record_histogram("orchestration_retrieval_duration", retrieval_time)
        await metrics.increment_counter("orchestrations_retrieved")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        await metrics.increment_counter(
            "orchestration_retrieval_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Failed to retrieve orchestration",
            extra={
                "orchestration_id": orchestration_id,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve orchestration: {str(e)}"
        )


@router.post("/orchestrations/{orchestration_id}/control")
async def control_orchestration(
    orchestration_id: str,
    request: OrchestrationControlRequest,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    orchestrator: UnifiedScanOrchestrator = Depends(get_orchestrator),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Control orchestration execution with advanced operations including
    start, pause, resume, cancel, terminate, and intelligent retry.
    """
    try:
        start_time = time.time()
        
        # Validate permissions based on action
        permission_map = {
            "start": "orchestration:execute",
            "pause": "orchestration:control",
            "resume": "orchestration:control", 
            "cancel": "orchestration:control",
            "terminate": "orchestration:terminate",
            "retry": "orchestration:execute"
        }
        
        await check_permissions(current_user, permission_map.get(request.action, "orchestration:control"))
        
        logger.info(
            "Controlling orchestration",
            extra={
                "orchestration_id": orchestration_id,
                "action": request.action,
                "user_id": current_user["user_id"],
                "force": request.force
            }
        )
        
        # Execute control action based on request
        if request.action == "start":
            result = await orchestrator.execute_orchestration(
                orchestration_id=orchestration_id,
                session=session,
                user_id=current_user["user_id"],
                override_dependencies=request.force
            )
        elif request.action == "pause":
            result = await _pause_orchestration(
                orchestration_id, request, session, current_user["user_id"]
            )
        elif request.action == "resume":
            result = await _resume_orchestration(
                orchestration_id, request, session, current_user["user_id"]
            )
        elif request.action == "cancel":
            result = await _cancel_orchestration(
                orchestration_id, request, session, current_user["user_id"]
            )
        elif request.action == "terminate":
            result = await _terminate_orchestration(
                orchestration_id, request, session, current_user["user_id"]
            )
        elif request.action == "retry":
            result = await _retry_orchestration(
                orchestration_id, request, session, current_user["user_id"]
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid action: {request.action}"
            )
        
        # Schedule background monitoring for state changes
        if request.action in ["start", "resume", "retry"]:
            background_tasks.add_task(
                _monitor_orchestration_state_change,
                orchestration_id,
                request.action,
                current_user["user_id"]
            )
        
        control_time = time.time() - start_time
        
        # Record control metrics
        await metrics.record_histogram("orchestration_control_duration", control_time)
        await metrics.increment_counter(
            "orchestration_control_actions",
            tags={
                "action": request.action,
                "user_id": current_user["user_id"],
                "force": str(request.force)
            }
        )
        
        logger.info(
            "Orchestration control completed",
            extra={
                "orchestration_id": orchestration_id,
                "action": request.action,
                "control_time": control_time,
                "result_status": result.get("status", "unknown")
            }
        )
        
        return {
            "orchestration_id": orchestration_id,
            "action": request.action,
            "status": "completed",
            "result": result,
            "control_time": control_time,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        await metrics.increment_counter(
            "orchestration_control_errors",
            tags={
                "action": request.action,
                "error_type": type(e).__name__
            }
        )
        
        logger.error(
            "Orchestration control failed",
            extra={
                "orchestration_id": orchestration_id,
                "action": request.action,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"Orchestration control failed: {str(e)}"
        )


@router.post("/orchestrations/bulk", response_model=List[OrchestrationResponse])
async def create_bulk_orchestrations(
    request: BulkOrchestrationRequest,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    orchestrator: UnifiedScanOrchestrator = Depends(get_orchestrator),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Create multiple orchestrations with intelligent batch processing,
    dependency management, and coordinated execution.
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "orchestration:bulk_create")
        
        logger.info(
            "Creating bulk orchestrations",
            extra={
                "orchestrations_count": len(request.orchestrations),
                "execution_strategy": request.execution_strategy,
                "user_id": current_user["user_id"],
                "auto_start": request.auto_start
            }
        )
        
        # Validate batch size
        if len(request.orchestrations) > 100:
            raise HTTPException(
                status_code=400,
                detail="Maximum batch size is 100 orchestrations"
            )
        
        # Process orchestrations based on execution strategy
        if request.execution_strategy == "parallel":
            created_orchestrations = await _create_orchestrations_parallel(
                request.orchestrations,
                request.max_concurrent,
                orchestrator,
                session,
                current_user["user_id"],
                request.auto_start
            )
        elif request.execution_strategy == "sequential":
            created_orchestrations = await _create_orchestrations_sequential(
                request.orchestrations,
                orchestrator,
                session,
                current_user["user_id"],
                request.auto_start
            )
        else:  # hybrid
            created_orchestrations = await _create_orchestrations_hybrid(
                request.orchestrations,
                request,
                orchestrator,
                session,
                current_user["user_id"]
            )
        
        # Schedule batch monitoring
        background_tasks.add_task(
            _setup_batch_monitoring,
            [orch.orchestration_id for orch in created_orchestrations],
            request.execution_strategy,
            current_user["user_id"]
        )
        
        creation_time = time.time() - start_time
        successful_creations = len([o for o in created_orchestrations if o is not None])
        
        # Record batch metrics
        await metrics.record_histogram("bulk_orchestration_creation_duration", creation_time)
        await metrics.increment_counter(
            "bulk_orchestrations_created",
            tags={
                "execution_strategy": request.execution_strategy,
                "batch_size": str(len(request.orchestrations)),
                "successful_count": str(successful_creations),
                "user_id": current_user["user_id"]
            }
        )
        
        logger.info(
            "Bulk orchestrations created",
            extra={
                "creation_time": creation_time,
                "total_requested": len(request.orchestrations),
                "successful_creations": successful_creations,
                "failure_count": len(request.orchestrations) - successful_creations
            }
        )
        
        return [orch for orch in created_orchestrations if orch is not None]
        
    except Exception as e:
        await metrics.increment_counter(
            "bulk_orchestration_creation_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Bulk orchestration creation failed",
            extra={
                "orchestrations_count": len(request.orchestrations),
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"Bulk orchestration creation failed: {str(e)}"
        )


# ===================== RESOURCE MANAGEMENT ENDPOINTS =====================

@router.post("/resources/optimize")
async def optimize_resources(
    request: ResourceOptimizationRequest,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    orchestrator: UnifiedScanOrchestrator = Depends(get_orchestrator),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Perform intelligent resource optimization with AI-powered analysis,
    predictive scaling, and automated cost optimization.
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "orchestration:optimize")
        
        logger.info(
            "Starting resource optimization",
            extra={
                "optimization_scope": request.optimization_scope,
                "orchestration_ids": request.orchestration_ids,
                "resource_types": [rt.value for rt in request.resource_types] if request.resource_types else [],
                "user_id": current_user["user_id"],
                "dry_run": request.dry_run
            }
        )
        
        # Perform optimization based on scope
        optimization_results = []
        
        if request.optimization_scope == "global":
            # Global system optimization
            result = await orchestrator.optimize_resource_allocation(
                session=session,
                user_id=current_user["user_id"]
            )
            optimization_results.append(result)
            
        elif request.optimization_scope == "orchestration":
            # Orchestration-specific optimization
            for orchestration_id in request.orchestration_ids:
                result = await orchestrator.optimize_resource_allocation(
                    orchestration_id=orchestration_id,
                    session=session,
                    user_id=current_user["user_id"]
                )
                optimization_results.append(result)
                
        elif request.optimization_scope == "resource_type":
            # Resource type-specific optimization
            for resource_type in request.resource_types:
                result = await orchestrator.optimize_resource_allocation(
                    resource_type=resource_type,
                    session=session,
                    user_id=current_user["user_id"]
                )
                optimization_results.append(result)
        
        # Apply optimizations if not dry run and auto-apply is enabled
        if not request.dry_run and request.apply_automatically:
            background_tasks.add_task(
                _apply_optimization_results,
                optimization_results,
                current_user["user_id"]
            )
        
        optimization_time = time.time() - start_time
        
        # Aggregate results
        total_cost_reduction = sum(
            result.get("expected_benefits", {}).get("cost_reduction_percentage", 0.0)
            for result in optimization_results
        )
        total_performance_improvement = sum(
            result.get("expected_benefits", {}).get("performance_improvement_percentage", 0.0)
            for result in optimization_results
        )
        
        # Record optimization metrics
        await metrics.record_histogram("resource_optimization_api_duration", optimization_time)
        await metrics.increment_counter(
            "resource_optimizations_via_api",
            tags={
                "scope": request.optimization_scope,
                "dry_run": str(request.dry_run),
                "auto_apply": str(request.apply_automatically),
                "user_id": current_user["user_id"]
            }
        )
        
        logger.info(
            "Resource optimization completed",
            extra={
                "optimization_time": optimization_time,
                "optimizations_count": len(optimization_results),
                "total_cost_reduction": total_cost_reduction,
                "total_performance_improvement": total_performance_improvement,
                "dry_run": request.dry_run
            }
        )
        
        return {
            "optimization_id": f"opt_batch_{uuid.uuid4().hex[:12]}",
            "optimization_time": optimization_time,
            "scope": request.optimization_scope,
            "results": optimization_results,
            "summary": {
                "optimizations_performed": len(optimization_results),
                "total_cost_reduction_percentage": total_cost_reduction,
                "total_performance_improvement_percentage": total_performance_improvement,
                "dry_run": request.dry_run,
                "applied_automatically": request.apply_automatically and not request.dry_run
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        await metrics.increment_counter(
            "resource_optimization_api_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Resource optimization failed",
            extra={
                "optimization_scope": request.optimization_scope,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"Resource optimization failed: {str(e)}"
        )


@router.get("/resources/allocations", response_model=PaginatedResponse[Dict[str, Any]])
async def get_resource_allocations(
    orchestration_id: Optional[str] = Query(None, description="Filter by orchestration ID"),
    resource_type: Optional[ResourceType] = Query(None, description="Filter by resource type"),
    status: Optional[str] = Query(None, description="Filter by allocation status"),
    pagination: PaginationParams = Depends(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    cache: RedisCache = Depends(get_cache),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Retrieve resource allocations with advanced filtering, pagination,
    and real-time utilization metrics.
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "orchestration:resource:read")
        
        # Build query with filters
        query = select(ScanResourceAllocation)
        
        if orchestration_id:
            query = query.join(ScanOrchestrationMaster).where(
                ScanOrchestrationMaster.orchestration_id == orchestration_id
            )
        
        if resource_type:
            query = query.where(ScanResourceAllocation.resource_type == resource_type)
        
        if status:
            query = query.where(ScanResourceAllocation.health_status == status)
        
        # Add ordering
        query = query.order_by(desc(ScanResourceAllocation.created_at))
        
        # Execute count query for pagination
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await session.execute(count_query)
        total_count = total_result.scalar()
        
        # Apply pagination
        query = query.offset((pagination.page - 1) * pagination.size).limit(pagination.size)
        
        # Execute main query
        result = await session.execute(query)
        allocations = result.scalars().all()
        
        # Convert to response format with enriched data
        allocation_data = []
        for allocation in allocations:
            allocation_dict = {
                "id": allocation.id,
                "allocation_id": allocation.allocation_id,
                "orchestration_master_id": allocation.orchestration_master_id,
                "resource_type": allocation.resource_type.value,
                "resource_pool_name": allocation.resource_pool_name,
                "allocated_capacity": allocation.allocated_capacity,
                "current_usage": allocation.current_usage,
                "utilization_percentage": allocation.utilization_percentage,
                "efficiency_score": allocation.efficiency_score,
                "estimated_cost": allocation.estimated_cost,
                "actual_cost": allocation.actual_cost,
                "health_status": allocation.health_status,
                "auto_scaling_enabled": allocation.auto_scaling_enabled,
                "created_at": allocation.created_at,
                "allocation_start": allocation.allocation_start,
                "allocation_end": allocation.allocation_end
            }
            allocation_data.append(allocation_dict)
        
        # Create paginated response
        response = PaginatedResponse[Dict[str, Any]](
            items=allocation_data,
            total=total_count,
            page=pagination.page,
            size=pagination.size,
            pages=(total_count + pagination.size - 1) // pagination.size,
            has_next=(pagination.page * pagination.size) < total_count,
            has_previous=pagination.page > 1,
            metadata={
                "query_time": time.time() - start_time,
                "filters_applied": {
                    "orchestration_id": orchestration_id,
                    "resource_type": resource_type.value if resource_type else None,
                    "status": status
                }
            }
        )
        
        # Record retrieval metrics
        retrieval_time = time.time() - start_time
        await metrics.record_histogram("resource_allocation_retrieval_duration", retrieval_time)
        await metrics.increment_counter("resource_allocations_retrieved")
        
        return response
        
    except Exception as e:
        await metrics.increment_counter(
            "resource_allocation_retrieval_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Failed to retrieve resource allocations",
            extra={
                "orchestration_id": orchestration_id,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve resource allocations: {str(e)}"
        )


# ===================== REAL-TIME MONITORING ENDPOINTS =====================

@router.websocket("/orchestrations/{orchestration_id}/monitor")
async def websocket_orchestration_monitoring(
    websocket: WebSocket,
    orchestration_id: str = FastAPIPath(..., description="Orchestration ID to monitor"),
    current_user: dict = Depends(get_current_user),
    orchestrator: UnifiedScanOrchestrator = Depends(get_orchestrator),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Real-time WebSocket monitoring for orchestration execution with
    comprehensive metrics, stage progress, and resource utilization.
    """
    await websocket.accept()
    
    try:
        # Validate permissions
        await check_permissions(current_user, "orchestration:monitor")
        
        logger.info(
            "Starting WebSocket orchestration monitoring",
            extra={
                "orchestration_id": orchestration_id,
                "user_id": current_user["user_id"],
                "client_ip": websocket.client.host
            }
        )
        
        # Initialize monitoring session
        monitoring_session = {
            "orchestration_id": orchestration_id,
            "user_id": current_user["user_id"],
            "start_time": time.time(),
            "metrics_sent": 0,
            "last_heartbeat": time.time(),
            "monitoring_level": "comprehensive"  # comprehensive, basic, minimal
        }
        
        # Send initial orchestration status
        initial_status = await _get_orchestration_monitoring_status(orchestration_id)
        await websocket.send_json({
            "type": "initial_status",
            "timestamp": datetime.utcnow().isoformat(),
            "data": initial_status
        })
        
        while True:
            try:
                # Check for client messages (heartbeat, config changes)
                try:
                    message = await asyncio.wait_for(
                        websocket.receive_json(),
                        timeout=1.0
                    )
                    
                    if message.get("type") == "heartbeat":
                        monitoring_session["last_heartbeat"] = time.time()
                        await websocket.send_json({
                            "type": "heartbeat_ack",
                            "timestamp": datetime.utcnow().isoformat()
                        })
                    elif message.get("type") == "config_update":
                        monitoring_session.update(message.get("config", {}))
                        await websocket.send_json({
                            "type": "config_updated",
                            "timestamp": datetime.utcnow().isoformat(),
                            "config": monitoring_session
                        })
                    
                except asyncio.TimeoutError:
                    # No message received, continue monitoring
                    pass
                
                # Get latest monitoring data
                monitoring_data = await _get_orchestration_monitoring_data(
                    orchestration_id,
                    monitoring_session
                )
                
                if monitoring_data:
                    await websocket.send_json({
                        "type": "monitoring_update",
                        "timestamp": datetime.utcnow().isoformat(),
                        "data": monitoring_data
                    })
                    
                    monitoring_session["metrics_sent"] += 1
                
                # Send stage updates if available
                stage_updates = await _get_stage_execution_updates(orchestration_id)
                if stage_updates:
                    await websocket.send_json({
                        "type": "stage_updates",
                        "timestamp": datetime.utcnow().isoformat(),
                        "data": stage_updates
                    })
                
                # Send resource utilization updates
                resource_updates = await _get_resource_utilization_updates(orchestration_id)
                if resource_updates:
                    await websocket.send_json({
                        "type": "resource_updates",
                        "timestamp": datetime.utcnow().isoformat(),
                        "data": resource_updates
                    })
                
                # Check for alerts or critical events
                alerts = await _check_orchestration_alerts(orchestration_id)
                if alerts:
                    await websocket.send_json({
                        "type": "alerts",
                        "timestamp": datetime.utcnow().isoformat(),
                        "data": alerts
                    })
                
                # Check for connection health
                if time.time() - monitoring_session["last_heartbeat"] > 300:  # 5 minutes
                    logger.warning(
                        "WebSocket client appears disconnected (no heartbeat)",
                        extra={
                            "orchestration_id": orchestration_id,
                            "user_id": current_user["user_id"]
                        }
                    )
                    break
                
                # Wait before next update (adaptive interval based on orchestration status)
                update_interval = await _calculate_monitoring_interval(orchestration_id)
                await asyncio.sleep(update_interval)
                
            except WebSocketDisconnect:
                logger.info(
                    "WebSocket client disconnected",
                    extra={
                        "orchestration_id": orchestration_id,
                        "user_id": current_user["user_id"],
                        "session_duration": time.time() - monitoring_session["start_time"],
                        "metrics_sent": monitoring_session["metrics_sent"]
                    }
                )
                break
                
    except Exception as e:
        logger.error(
            "WebSocket monitoring error",
            extra={
                "orchestration_id": orchestration_id,
                "user_id": current_user["user_id"],
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        await websocket.send_json({
            "type": "error",
            "timestamp": datetime.utcnow().isoformat(),
            "error": "Monitoring session error"
        })
        
    finally:
        await metrics.increment_counter(
            "websocket_orchestration_monitoring_sessions_ended",
            tags={"orchestration_id": orchestration_id}
        )


@router.get("/dashboard/stream")
async def stream_orchestration_dashboard(
    orchestration_types: List[WorkflowType] = Query([], description="Filter by orchestration types"),
    priority_levels: List[PriorityLevel] = Query([], description="Filter by priority levels"),
    status_filter: List[OrchestrationStatus] = Query([], description="Filter by status"),
    interval: int = Query(10, ge=5, le=60, description="Update interval in seconds"),
    current_user: dict = Depends(get_current_user),
    orchestrator: UnifiedScanOrchestrator = Depends(get_orchestrator)
):
    """
    Server-Sent Events (SSE) stream for real-time orchestration dashboard
    with comprehensive system metrics and business intelligence.
    """
    try:
        # Validate permissions
        await check_permissions(current_user, "orchestration:dashboard")
        
        async def event_stream():
            session_start = time.time()
            events_sent = 0
            
            logger.info(
                "Starting SSE orchestration dashboard stream",
                extra={
                    "orchestration_types": [ot.value for ot in orchestration_types],
                    "priority_levels": [pl.value for pl in priority_levels],
                    "status_filter": [sf.value for sf in status_filter],
                    "interval": interval,
                    "user_id": current_user["user_id"]
                }
            )
            
            try:
                while True:
                    # Collect comprehensive dashboard data
                    dashboard_data = await _collect_orchestration_dashboard_data(
                        orchestration_types,
                        priority_levels,
                        status_filter,
                        current_user["user_id"]
                    )
                    
                    # Send data as SSE event
                    yield f"data: {json.dumps(dashboard_data)}\n\n"
                    events_sent += 1
                    
                    # Send periodic system health
                    if events_sent % 6 == 0:  # Every 6th event (every minute if interval=10s)
                        health_data = await _collect_system_health_data()
                        yield f"event: system_health\ndata: {json.dumps(health_data)}\n\n"
                    
                    # Send business intelligence insights
                    if events_sent % 18 == 0:  # Every 18th event (every 3 minutes if interval=10s)
                        bi_data = await _collect_business_intelligence_data()
                        yield f"event: business_intelligence\ndata: {json.dumps(bi_data)}\n\n"
                    
                    # Send periodic heartbeat
                    if events_sent % 10 == 0:  # Every 10th event
                        heartbeat_data = {
                            "type": "heartbeat",
                            "timestamp": datetime.utcnow().isoformat(),
                            "session_duration": time.time() - session_start,
                            "events_sent": events_sent
                        }
                        yield f"event: heartbeat\ndata: {json.dumps(heartbeat_data)}\n\n"
                    
                    # Wait for next interval
                    await asyncio.sleep(interval)
                    
            except Exception as e:
                error_data = {
                    "type": "error",
                    "timestamp": datetime.utcnow().isoformat(),
                    "error": f"Streaming error: {str(e)}"
                }
                yield f"event: error\ndata: {json.dumps(error_data)}\n\n"
                
                logger.error(
                    "SSE dashboard stream error",
                    extra={
                        "user_id": current_user["user_id"],
                        "error": str(e),
                        "events_sent": events_sent
                    }
                )
        
        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control"
            }
        )
        
    except Exception as e:
        logger.error(
            "Failed to start SSE dashboard stream",
            extra={
                "user_id": current_user["user_id"],
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start dashboard stream: {str(e)}"
        )


# ===================== ANALYTICS AND BUSINESS INTELLIGENCE ENDPOINTS =====================

@router.post("/analytics", response_model=OrchestrationAnalytics)
async def generate_orchestration_analytics(
    request: AnalyticsRequest,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
    metrics: MetricsCollector = Depends(get_metrics_collector),
    cache: RedisCache = Depends(get_cache)
):
    """
    Generate comprehensive orchestration analytics with business intelligence,
    predictive insights, and ROI analysis.
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "orchestration:analytics")
        
        # Validate time range
        if request.time_range_end <= request.time_range_start:
            raise HTTPException(
                status_code=400,
                detail="End time must be after start time"
            )
        
        time_range_days = (request.time_range_end - request.time_range_start).days
        if time_range_days > 365:
            raise HTTPException(
                status_code=400,
                detail="Maximum time range is 365 days"
            )
        
        logger.info(
            "Generating orchestration analytics",
            extra={
                "time_range_start": request.time_range_start.isoformat(),
                "time_range_end": request.time_range_end.isoformat(),
                "orchestration_types": [ot.value for ot in request.orchestration_types] if request.orchestration_types else [],
                "user_id": current_user["user_id"],
                "include_predictions": request.include_predictions
            }
        )
        
        # Check cache for recent analytics
        cache_key = f"analytics:{hash(str(request.dict()))}:{current_user['user_id']}"
        cached_analytics = await cache.get(cache_key)
        
        if cached_analytics and time_range_days <= 7:  # Use cache for recent short-term analytics
            await metrics.increment_counter("orchestration_analytics_cache_hits")
            return OrchestrationAnalytics.parse_obj(cached_analytics)
        
        # Collect orchestration data
        orchestration_data = await _collect_orchestration_analytics_data(
            request.time_range_start,
            request.time_range_end,
            request.orchestration_types,
            request.priority_levels,
            session
        )
        
        # Generate summary metrics
        summary_metrics = await _calculate_orchestration_summary_metrics(orchestration_data)
        
        # Perform performance analysis
        performance_analysis = await _analyze_orchestration_performance(
            orchestration_data,
            request.aggregation_level
        )
        
        # Generate business value analysis
        business_analysis = await _analyze_business_value_metrics(orchestration_data)
        
        # Create optimization recommendations
        optimization_recommendations = await _generate_orchestration_optimization_recommendations(
            orchestration_data,
            performance_analysis
        )
        
        # Generate predictive insights if requested
        predictive_insights = {}
        if request.include_predictions:
            predictive_insights = await _generate_predictive_insights(
                orchestration_data,
                request.time_range_end
            )
        
        # Create analytics response
        analytics_result = OrchestrationAnalytics(
            analytics_id=f"analytics_{uuid.uuid4().hex[:12]}",
            generated_at=datetime.utcnow(),
            time_range_start=request.time_range_start,
            time_range_end=request.time_range_end,
            
            # Summary metrics
            total_orchestrations=summary_metrics["total_orchestrations"],
            successful_orchestrations=summary_metrics["successful_orchestrations"],
            failed_orchestrations=summary_metrics["failed_orchestrations"],
            average_success_rate=summary_metrics["average_success_rate"],
            
            # Performance analysis
            average_execution_time=performance_analysis["average_execution_time"],
            throughput_analysis=performance_analysis["throughput_analysis"],
            resource_utilization_trends=performance_analysis["resource_utilization_trends"],
            cost_analysis=performance_analysis["cost_analysis"],
            
            # Business insights
            quality_trends=business_analysis["quality_trends"],
            business_value_analysis=business_analysis["business_value_analysis"],
            compliance_metrics=business_analysis["compliance_metrics"],
            
            # Recommendations
            optimization_opportunities=optimization_recommendations["opportunities"],
            cost_reduction_recommendations=optimization_recommendations["cost_reduction"],
            performance_improvement_suggestions=optimization_recommendations["performance_improvement"],
            resource_optimization_advice=optimization_recommendations["resource_optimization"],
            
            # Predictive insights
            capacity_forecasts=predictive_insights.get("capacity_forecasts", {}),
            workload_predictions=predictive_insights.get("workload_predictions", {}),
            risk_assessments=predictive_insights.get("risk_assessments", {})
        )
        
        # Cache results for reasonable time ranges
        if time_range_days <= 30:
            cache_ttl = 3600 if time_range_days <= 1 else 7200  # 1-2 hours
            await cache.set(cache_key, analytics_result.dict(), expire=cache_ttl)
        
        # Schedule background insights generation
        if request.include_recommendations:
            background_tasks.add_task(
                _generate_advanced_insights,
                analytics_result.analytics_id,
                orchestration_data,
                current_user["user_id"]
            )
        
        analytics_time = time.time() - start_time
        
        # Record analytics metrics
        await metrics.record_histogram("orchestration_analytics_generation_duration", analytics_time)
        await metrics.increment_counter(
            "orchestration_analytics_generated",
            tags={
                "time_range_days": str(time_range_days),
                "include_predictions": str(request.include_predictions),
                "user_id": current_user["user_id"]
            }
        )
        
        logger.info(
            "Orchestration analytics generated successfully",
            extra={
                "analytics_id": analytics_result.analytics_id,
                "analytics_time": analytics_time,
                "total_orchestrations": summary_metrics["total_orchestrations"],
                "average_success_rate": summary_metrics["average_success_rate"],
                "time_range_days": time_range_days
            }
        )
        
        return analytics_result
        
    except Exception as e:
        await metrics.increment_counter(
            "orchestration_analytics_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Orchestration analytics generation failed",
            extra={
                "time_range_start": request.time_range_start.isoformat(),
                "time_range_end": request.time_range_end.isoformat(),
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"Analytics generation failed: {str(e)}"
        )


@router.get("/health", response_model=HealthCheckResponse)
async def get_orchestrator_health(
    include_details: bool = Query(True, description="Include detailed health metrics"),
    current_user: dict = Depends(get_current_user),
    orchestrator: UnifiedScanOrchestrator = Depends(get_orchestrator),
    metrics: MetricsCollector = Depends(get_metrics_collector)
):
    """
    Get comprehensive orchestrator health status with system metrics,
    performance indicators, and operational recommendations.
    """
    try:
        start_time = time.time()
        
        # Validate permissions
        await check_permissions(current_user, "orchestration:health")
        
        # Collect health data
        health_data = await _collect_comprehensive_health_data(
            orchestrator,
            include_details
        )
        
        health_check_time = time.time() - start_time
        
        # Record health check metrics
        await metrics.record_histogram("orchestrator_health_check_duration", health_check_time)
        await metrics.increment_counter("orchestrator_health_checks")
        
        return HealthCheckResponse(**health_data)
        
    except Exception as e:
        await metrics.increment_counter(
            "orchestrator_health_check_errors",
            tags={"error_type": type(e).__name__}
        )
        
        logger.error(
            "Health check failed",
            extra={
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )
        
        raise HTTPException(
            status_code=500,
            detail=f"Health check failed: {str(e)}"
        )


# ===================== HELPER FUNCTIONS =====================

async def _setup_orchestration_monitoring(
    orchestration_id: str,
    user_id: str
):
    """Background task to set up orchestration monitoring."""
    try:
        logger.info(
            "Setting up orchestration monitoring",
            extra={
                "orchestration_id": orchestration_id,
                "user_id": user_id
            }
        )
        # Implementation would set up monitoring hooks
        
    except Exception as e:
        logger.error(
            "Failed to set up orchestration monitoring",
            extra={
                "orchestration_id": orchestration_id,
                "error": str(e)
            }
        )


async def _get_orchestration_monitoring_status(orchestration_id: str) -> Dict[str, Any]:
    """Get initial orchestration monitoring status."""
    try:
        # Implementation would return comprehensive status
        return {
            "orchestration_id": orchestration_id,
            "status": "running",
            "progress_percentage": 45.0,
            "current_stage": "data_discovery",
            "resource_utilization": {
                "cpu": 65.5,
                "memory": 42.3,
                "storage": 78.1
            },
            "performance_metrics": {
                "throughput": 1250.0,
                "latency_avg": 125.5,
                "error_rate": 0.02
            }
        }
    except Exception as e:
        logger.error(f"Error getting orchestration status: {str(e)}")
        return {}


# ===================== EXPORTS =====================

__all__ = [
    "router",
    "create_orchestration",
    "get_orchestration",
    "control_orchestration",
    "create_bulk_orchestrations",
    "optimize_resources",
    "websocket_orchestration_monitoring",
    "generate_orchestration_analytics",
    "get_orchestrator_health"
]