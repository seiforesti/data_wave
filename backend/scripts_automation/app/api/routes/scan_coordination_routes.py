from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import asyncio
from datetime import datetime, timedelta

from app.core.deps import get_db_session, get_current_user
from app.services.enterprise_scan_orchestrator import EnterpriseScanOrchestrator
from app.services.scan_orchestration_service import ScanOrchestrationService
from app.services.intelligent_pattern_service import IntelligentPatternService
from app.models.scan_orchestration_models import ScanWorkflow, ScanCoordination, WorkflowExecution
from app.models.scan_models import DataSource, ScanResult
from app.models.auth_models import User

router = APIRouter(prefix="/scan-coordination", tags=["Scan Coordination"])

# Pydantic Models for API
class CoordinatedScanRequest(BaseModel):
    data_source_ids: List[int]
    scan_types: Optional[List[str]] = ["schema", "content", "quality", "compliance"]
    coordination_strategy: Optional[str] = "intelligent"  # sequential, parallel, intelligent, adaptive
    resource_limits: Optional[Dict[str, Any]] = {}
    priority_rules: Optional[Dict[str, Any]] = {}
    notification_settings: Optional[Dict[str, Any]] = {}
    schedule_settings: Optional[Dict[str, Any]] = {}

class WorkflowExecutionRequest(BaseModel):
    workflow_id: str
    execution_parameters: Optional[Dict[str, Any]] = {}
    override_settings: Optional[Dict[str, Any]] = {}
    dry_run: Optional[bool] = False
    notification_channels: Optional[List[str]] = []

class ScanDependencyRequest(BaseModel):
    source_asset_ids: List[int]
    dependency_analysis_depth: Optional[int] = 5
    include_cross_source: Optional[bool] = True
    include_external_dependencies: Optional[bool] = False
    optimization_strategy: Optional[str] = "efficiency"  # efficiency, thoroughness, balanced

class ResourceOptimizationRequest(BaseModel):
    scan_requests: List[Dict[str, Any]]
    resource_constraints: Optional[Dict[str, Any]] = {}
    optimization_goals: Optional[List[str]] = ["time", "quality", "cost"]
    scheduling_window: Optional[str] = "24h"
    allow_preemption: Optional[bool] = False

@router.post("/coordinate-scan", response_model=Dict[str, Any])
async def coordinate_scan_execution(
    request: CoordinatedScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Coordinate intelligent scan execution across multiple data sources
    """
    try:
        # Validate data sources
        data_sources = db.query(DataSource).filter(
            DataSource.id.in_(request.data_source_ids)
        ).all()
        
        if len(data_sources) != len(request.data_source_ids):
            raise HTTPException(status_code=404, detail="Some data sources not found")

        # Analyze scan coordination requirements
        coordination_analysis = await ScanOrchestrationService.analyze_coordination_requirements(
            db=db,
            data_source_ids=request.data_source_ids,
            scan_types=request.scan_types,
            coordination_strategy=request.coordination_strategy
        )

        # Create coordination plan
        coordination_plan = await ScanOrchestrationService.create_coordination_plan(
            db=db,
            data_source_ids=request.data_source_ids,
            scan_types=request.scan_types,
            coordination_strategy=request.coordination_strategy,
            resource_limits=request.resource_limits,
            priority_rules=request.priority_rules,
            analysis=coordination_analysis,
            user_id=current_user.id
        )

        # Start coordinated scan execution
        execution_task = await EnterpriseScanOrchestrator.start_coordinated_execution(
            db=db,
            coordination_plan=coordination_plan,
            notification_settings=request.notification_settings,
            schedule_settings=request.schedule_settings,
            user_id=current_user.id
        )

        # Execute coordination in background
        background_tasks.add_task(
            ScanOrchestrationService.execute_coordination_plan,
            db=db,
            plan_id=coordination_plan["id"],
            execution_task_id=execution_task["id"]
        )

        # Get execution estimates
        execution_estimates = await ScanOrchestrationService.estimate_execution_time(
            db=db,
            coordination_plan=coordination_plan,
            data_sources=data_sources
        )

        return {
            "success": True,
            "coordination_id": coordination_plan["id"],
            "execution_task_id": execution_task["id"],
            "coordination_strategy": request.coordination_strategy,
            "data_sources_count": len(request.data_source_ids),
            "scan_types": request.scan_types,
            "coordination_analysis": coordination_analysis,
            "execution_estimates": execution_estimates,
            "status": "coordinating",
            "message": "Coordinated scan execution started",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan coordination failed: {str(e)}")

@router.get("/coordination/{coordination_id}/status", response_model=Dict[str, Any])
async def get_coordination_status(
    coordination_id: str,
    include_details: bool = Query(True, description="Include detailed progress information"),
    include_metrics: bool = Query(True, description="Include performance metrics"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get the status and progress of a coordinated scan execution
    """
    try:
        # Get coordination status
        coordination_status = await ScanOrchestrationService.get_coordination_status(
            db=db,
            coordination_id=coordination_id,
            user_id=current_user.id
        )

        if not coordination_status:
            raise HTTPException(status_code=404, detail="Coordination not found")

        # Get detailed progress if requested
        progress_details = {}
        if include_details:
            progress_details = await ScanOrchestrationService.get_coordination_progress_details(
                db=db,
                coordination_id=coordination_id
            )

        # Get performance metrics if requested
        performance_metrics = {}
        if include_metrics:
            performance_metrics = await ScanOrchestrationService.get_coordination_metrics(
                db=db,
                coordination_id=coordination_id
            )

        # Get resource utilization
        resource_utilization = await ScanOrchestrationService.get_resource_utilization(
            db=db,
            coordination_id=coordination_id
        )

        # Get any issues or alerts
        issues_and_alerts = await ScanOrchestrationService.get_coordination_issues(
            db=db,
            coordination_id=coordination_id
        )

        return {
            "success": True,
            "coordination_id": coordination_id,
            "status": coordination_status["status"],
            "progress": coordination_status["progress"],
            "progress_details": progress_details,
            "performance_metrics": performance_metrics,
            "resource_utilization": resource_utilization,
            "issues_and_alerts": issues_and_alerts,
            "started_at": coordination_status["started_at"],
            "estimated_completion": coordination_status.get("estimated_completion"),
            "completed_at": coordination_status.get("completed_at"),
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get coordination status: {str(e)}")

@router.post("/workflow/execute", response_model=Dict[str, Any])
async def execute_scan_workflow(
    request: WorkflowExecutionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Execute a predefined scan workflow with intelligent orchestration
    """
    try:
        # Validate workflow
        workflow = await ScanOrchestrationService.get_workflow(
            db=db,
            workflow_id=request.workflow_id,
            user_id=current_user.id
        )
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        # Prepare execution context
        execution_context = await ScanOrchestrationService.prepare_execution_context(
            db=db,
            workflow=workflow,
            execution_parameters=request.execution_parameters,
            override_settings=request.override_settings,
            user_id=current_user.id
        )

        # Validate execution context
        validation_result = await ScanOrchestrationService.validate_execution_context(
            db=db,
            workflow=workflow,
            execution_context=execution_context
        )

        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Execution validation failed: {validation_result['errors']}"
            )

        # Create workflow execution
        workflow_execution = await ScanOrchestrationService.create_workflow_execution(
            db=db,
            workflow_id=request.workflow_id,
            execution_context=execution_context,
            dry_run=request.dry_run,
            notification_channels=request.notification_channels,
            user_id=current_user.id
        )

        # Start workflow execution
        if not request.dry_run:
            background_tasks.add_task(
                EnterpriseScanOrchestrator.execute_workflow,
                db=db,
                workflow_execution_id=workflow_execution["id"],
                execution_context=execution_context
            )

        # Get execution estimates
        execution_estimates = await ScanOrchestrationService.estimate_workflow_execution(
            db=db,
            workflow=workflow,
            execution_context=execution_context
        )

        return {
            "success": True,
            "workflow_id": request.workflow_id,
            "execution_id": workflow_execution["id"],
            "workflow_name": workflow["name"],
            "dry_run": request.dry_run,
            "execution_context": execution_context,
            "validation_result": validation_result,
            "execution_estimates": execution_estimates,
            "status": "dry_run_completed" if request.dry_run else "executing",
            "message": "Workflow execution completed (dry run)" if request.dry_run else "Workflow execution started",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")

@router.post("/dependency-analysis", response_model=Dict[str, Any])
async def analyze_scan_dependencies(
    request: ScanDependencyRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze scan dependencies and create optimized execution order
    """
    try:
        # Validate source assets
        source_assets = db.query(DataSource).filter(
            DataSource.id.in_(request.source_asset_ids)
        ).all()
        
        if len(source_assets) != len(request.source_asset_ids):
            raise HTTPException(status_code=404, detail="Some source assets not found")

        # Analyze dependencies
        dependency_analysis = await ScanOrchestrationService.analyze_scan_dependencies(
            db=db,
            source_asset_ids=request.source_asset_ids,
            analysis_depth=request.dependency_analysis_depth,
            include_cross_source=request.include_cross_source,
            include_external_dependencies=request.include_external_dependencies,
            user_id=current_user.id
        )

        # Create dependency graph
        dependency_graph = await ScanOrchestrationService.create_dependency_graph(
            db=db,
            dependencies=dependency_analysis,
            source_asset_ids=request.source_asset_ids
        )

        # Generate optimized execution order
        execution_order = await ScanOrchestrationService.optimize_execution_order(
            db=db,
            dependency_graph=dependency_graph,
            optimization_strategy=request.optimization_strategy
        )

        # Calculate execution metrics
        execution_metrics = await ScanOrchestrationService.calculate_execution_metrics(
            db=db,
            execution_order=execution_order,
            dependency_analysis=dependency_analysis
        )

        # Generate optimization recommendations
        optimization_recommendations = await ScanOrchestrationService.generate_optimization_recommendations(
            db=db,
            dependency_analysis=dependency_analysis,
            execution_order=execution_order,
            metrics=execution_metrics
        )

        return {
            "success": True,
            "source_assets_count": len(request.source_asset_ids),
            "optimization_strategy": request.optimization_strategy,
            "dependency_analysis": dependency_analysis,
            "dependency_graph": dependency_graph,
            "execution_order": execution_order,
            "execution_metrics": execution_metrics,
            "optimization_recommendations": optimization_recommendations,
            "analysis_summary": {
                "total_dependencies": dependency_analysis.get("total_dependencies", 0),
                "critical_path_length": execution_metrics.get("critical_path_length", 0),
                "parallelization_opportunities": execution_metrics.get("parallelization_opportunities", 0),
                "estimated_time_savings": execution_metrics.get("estimated_time_savings", "0%")
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dependency analysis failed: {str(e)}")

@router.post("/resource-optimization", response_model=Dict[str, Any])
async def optimize_scan_resources(
    request: ResourceOptimizationRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Optimize scan resource allocation and scheduling
    """
    try:
        # Analyze resource requirements
        resource_analysis = await ScanOrchestrationService.analyze_resource_requirements(
            db=db,
            scan_requests=request.scan_requests,
            resource_constraints=request.resource_constraints,
            optimization_goals=request.optimization_goals
        )

        # Create resource allocation plan
        allocation_plan = await ScanOrchestrationService.create_resource_allocation_plan(
            db=db,
            resource_analysis=resource_analysis,
            scan_requests=request.scan_requests,
            scheduling_window=request.scheduling_window,
            allow_preemption=request.allow_preemption,
            user_id=current_user.id
        )

        # Optimize scheduling
        optimized_schedule = await ScanOrchestrationService.optimize_scan_scheduling(
            db=db,
            allocation_plan=allocation_plan,
            optimization_goals=request.optimization_goals,
            scheduling_window=request.scheduling_window
        )

        # Calculate optimization benefits
        optimization_benefits = await ScanOrchestrationService.calculate_optimization_benefits(
            db=db,
            original_requests=request.scan_requests,
            optimized_schedule=optimized_schedule,
            resource_analysis=resource_analysis
        )

        # Generate resource recommendations
        resource_recommendations = await ScanOrchestrationService.generate_resource_recommendations(
            db=db,
            resource_analysis=resource_analysis,
            allocation_plan=allocation_plan,
            optimization_benefits=optimization_benefits
        )

        return {
            "success": True,
            "scan_requests_count": len(request.scan_requests),
            "optimization_goals": request.optimization_goals,
            "scheduling_window": request.scheduling_window,
            "resource_analysis": resource_analysis,
            "allocation_plan": allocation_plan,
            "optimized_schedule": optimized_schedule,
            "optimization_benefits": optimization_benefits,
            "resource_recommendations": resource_recommendations,
            "optimization_summary": {
                "total_scans_scheduled": len(optimized_schedule.get("scheduled_scans", [])),
                "resource_utilization_improvement": optimization_benefits.get("resource_utilization_improvement", "0%"),
                "estimated_time_reduction": optimization_benefits.get("estimated_time_reduction", "0%"),
                "cost_savings": optimization_benefits.get("cost_savings", "0%")
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resource optimization failed: {str(e)}")

@router.get("/patterns/analysis", response_model=Dict[str, Any])
async def analyze_scan_patterns(
    time_range: str = Query("30d", description="Time range for pattern analysis"),
    pattern_types: str = Query("execution,performance,resource", description="Comma-separated pattern types"),
    include_predictions: bool = Query(True, description="Include predictive patterns"),
    include_anomalies: bool = Query(True, description="Include anomaly detection"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze scan execution patterns and generate insights
    """
    try:
        pattern_type_list = [p.strip() for p in pattern_types.split(",")]

        # Analyze scan patterns
        pattern_analysis = await IntelligentPatternService.analyze_scan_patterns(
            db=db,
            time_range=time_range,
            pattern_types=pattern_type_list,
            user_id=current_user.id
        )

        # Generate pattern insights
        pattern_insights = await IntelligentPatternService.generate_pattern_insights(
            db=db,
            pattern_analysis=pattern_analysis,
            time_range=time_range
        )

        # Predictive patterns if requested
        predictive_patterns = {}
        if include_predictions:
            predictive_patterns = await IntelligentPatternService.generate_predictive_patterns(
                db=db,
                historical_patterns=pattern_analysis,
                time_range=time_range
            )

        # Anomaly detection if requested
        anomalies = []
        if include_anomalies:
            anomalies = await IntelligentPatternService.detect_scan_anomalies(
                db=db,
                pattern_analysis=pattern_analysis,
                time_range=time_range
            )

        # Generate recommendations
        pattern_recommendations = await IntelligentPatternService.generate_pattern_recommendations(
            db=db,
            pattern_analysis=pattern_analysis,
            insights=pattern_insights,
            anomalies=anomalies
        )

        return {
            "success": True,
            "time_range": time_range,
            "pattern_types": pattern_type_list,
            "pattern_analysis": pattern_analysis,
            "pattern_insights": pattern_insights,
            "predictive_patterns": predictive_patterns,
            "anomalies": anomalies,
            "pattern_recommendations": pattern_recommendations,
            "analysis_summary": {
                "patterns_identified": len(pattern_analysis.get("patterns", [])),
                "insights_generated": len(pattern_insights),
                "anomalies_detected": len(anomalies),
                "recommendations_count": len(pattern_recommendations)
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pattern analysis failed: {str(e)}")

@router.get("/coordination/health", response_model=Dict[str, Any])
async def get_coordination_health(
    include_metrics: bool = Query(True, description="Include health metrics"),
    include_alerts: bool = Query(True, description="Include active alerts"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get scan coordination system health and status
    """
    try:
        # Get system health overview
        health_overview = await ScanOrchestrationService.get_system_health_overview(db=db)

        # Get health metrics if requested
        health_metrics = {}
        if include_metrics:
            health_metrics = await ScanOrchestrationService.get_detailed_health_metrics(db=db)

        # Get active alerts if requested
        active_alerts = []
        if include_alerts:
            active_alerts = await ScanOrchestrationService.get_active_system_alerts(db=db)

        # Get resource status
        resource_status = await ScanOrchestrationService.get_resource_status(db=db)

        # Get coordination statistics
        coordination_stats = await ScanOrchestrationService.get_coordination_statistics(
            db=db,
            time_range="24h"
        )

        return {
            "success": True,
            "system_status": health_overview.get("overall_status", "unknown"),
            "health_overview": health_overview,
            "health_metrics": health_metrics,
            "active_alerts": active_alerts,
            "resource_status": resource_status,
            "coordination_statistics": coordination_stats,
            "health_summary": {
                "overall_health_score": health_overview.get("health_score", 0),
                "active_coordinations": coordination_stats.get("active_coordinations", 0),
                "system_alerts": len(active_alerts),
                "resource_utilization": resource_status.get("overall_utilization", "0%")
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get coordination health: {str(e)}")

@router.post("/coordination/{coordination_id}/pause", response_model=Dict[str, Any])
async def pause_coordination(
    coordination_id: str,
    reason: Optional[str] = Query(None, description="Reason for pausing"),
    preserve_state: bool = Query(True, description="Preserve execution state"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Pause a running scan coordination
    """
    try:
        # Pause the coordination
        pause_result = await ScanOrchestrationService.pause_coordination(
            db=db,
            coordination_id=coordination_id,
            user_id=current_user.id,
            reason=reason,
            preserve_state=preserve_state
        )

        if not pause_result["success"]:
            raise HTTPException(status_code=400, detail=pause_result["message"])

        return {
            "success": True,
            "coordination_id": coordination_id,
            "status": "paused",
            "reason": reason,
            "preserve_state": preserve_state,
            "pause_details": pause_result,
            "message": "Coordination paused successfully",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to pause coordination: {str(e)}")

@router.post("/coordination/{coordination_id}/resume", response_model=Dict[str, Any])
async def resume_coordination(
    coordination_id: str,
    background_tasks: BackgroundTasks,
    resume_from_checkpoint: bool = Query(True, description="Resume from last checkpoint"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Resume a paused scan coordination
    """
    try:
        # Resume the coordination
        resume_result = await ScanOrchestrationService.resume_coordination(
            db=db,
            coordination_id=coordination_id,
            user_id=current_user.id,
            resume_from_checkpoint=resume_from_checkpoint
        )

        if not resume_result["success"]:
            raise HTTPException(status_code=400, detail=resume_result["message"])

        # Continue execution in background
        background_tasks.add_task(
            ScanOrchestrationService.continue_coordination_execution,
            db=db,
            coordination_id=coordination_id,
            resume_context=resume_result["resume_context"]
        )

        return {
            "success": True,
            "coordination_id": coordination_id,
            "status": "resumed",
            "resume_from_checkpoint": resume_from_checkpoint,
            "resume_details": resume_result,
            "message": "Coordination resumed successfully",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resume coordination: {str(e)}")

@router.get("/workflows", response_model=Dict[str, Any])
async def list_scan_workflows(
    workflow_type: Optional[str] = Query(None, description="Filter by workflow type"),
    status: Optional[str] = Query(None, description="Filter by workflow status"),
    limit: int = Query(20, description="Maximum workflows to return"),
    offset: int = Query(0, description="Pagination offset"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    List available scan workflows with filtering and pagination
    """
    try:
        # Get workflows
        workflows = await ScanOrchestrationService.list_workflows(
            db=db,
            user_id=current_user.id if not current_user.is_admin else None,
            workflow_type=workflow_type,
            status=status,
            limit=limit,
            offset=offset
        )

        # Get workflow statistics
        workflow_stats = await ScanOrchestrationService.get_workflow_statistics(
            db=db,
            user_id=current_user.id if not current_user.is_admin else None
        )

        return {
            "success": True,
            "workflows": workflows,
            "workflow_statistics": workflow_stats,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": workflow_stats.get("total_workflows", 0),
                "has_more": len(workflows) == limit
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list workflows: {str(e)}")