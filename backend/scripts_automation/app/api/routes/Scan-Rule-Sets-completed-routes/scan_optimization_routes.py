"""
Scan Optimization API Routes

Provides comprehensive API endpoints for scan optimization as specified
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
from app.services.rule_optimization_service import RuleOptimizationService
from app.services.scan_performance_optimizer import ScanPerformanceOptimizer
from app.services.Scan-Rule-Sets-completed-services.ai_pattern_detection_service import ai_pattern_service

# Model imports
from app.models.scan_performance_models import (
    PerformanceMetric, ResourceUtilization, OptimizationRecommendation,
    PerformanceBaseline, PerformanceTrend
)

# RBAC Permissions
PERMISSION_OPTIMIZATION_VIEW = "optimization:view"
PERMISSION_OPTIMIZATION_EXECUTE = "optimization:execute"
PERMISSION_OPTIMIZATION_ADMIN = "optimization:admin"

# Initialize logger and services
logger = get_logger(__name__)
router = APIRouter(prefix="/scan-optimization", tags=["Scan Optimization"])

optimization_service = RuleOptimizationService()
performance_optimizer = ScanPerformanceOptimizer()

# ===================================
# REQUEST/RESPONSE MODELS
# ===================================

class PerformanceAnalysisRequest(BaseModel):
    """Request model for performance analysis."""
    rule_ids: Optional[List[int]] = None
    data_source_ids: Optional[List[int]] = None
    time_range: str = "24h"  # 1h, 24h, 7d, 30d
    analysis_type: str = "comprehensive"  # quick, comprehensive, deep
    include_recommendations: bool = True
    benchmark_comparison: bool = True

class OptimizationRequest(BaseModel):
    """Request model for applying optimizations."""
    target_type: str = "rule"  # rule, data_source, system
    target_ids: List[int]
    optimization_strategies: List[str] = []
    optimization_level: str = "balanced"  # conservative, balanced, aggressive
    apply_immediately: bool = False
    rollback_plan: bool = True

class MLTuningRequest(BaseModel):
    """Request model for ML-based tuning."""
    rule_id: int
    tuning_objective: str = "performance"  # performance, accuracy, cost
    training_data_period: str = "30d"
    validation_split: float = 0.2
    hyperparameter_space: Dict[str, Any] = {}
    max_iterations: int = 100

class BenchmarkRequest(BaseModel):
    """Request model for benchmark operations."""
    benchmark_type: str = "performance"  # performance, accuracy, cost
    baseline_period: str = "30d"
    comparison_period: str = "7d"
    target_metrics: List[str] = []

class RollbackRequest(BaseModel):
    """Request model for rollback operations."""
    optimization_id: str
    rollback_type: str = "full"  # full, partial, selective
    rollback_reason: Optional[str] = None

class StandardResponse(BaseModel):
    """Standard API response model."""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

# ===================================
# PERFORMANCE ANALYSIS
# ===================================

@router.post("/analyze", response_model=StandardResponse)
async def analyze_performance(
    request: PerformanceAnalysisRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_OPTIMIZATION_VIEW))
):
    """
    Perform comprehensive performance analysis with AI-powered insights.
    
    Features:
    - Multi-dimensional performance analysis
    - AI-powered pattern detection
    - Bottleneck identification
    - Resource utilization analysis
    """
    try:
        await check_rate_limit(f"analyze_performance:{current_user['user_id']}", max_requests=50, window_seconds=3600)
        
        # Check cache for recent analysis
        cache_key = f"performance_analysis:{hash(str(request.dict()))}"
        cached_result = await cache_get(cache_key)
        if cached_result and request.analysis_type != "deep":
            return StandardResponse(
                success=True,
                message="Performance analysis retrieved from cache",
                data=cached_result
            )
        
        # Perform performance analysis
        analysis_result = await performance_optimizer.analyze_performance(
            rule_ids=request.rule_ids,
            data_source_ids=request.data_source_ids,
            time_range=request.time_range,
            analysis_type=request.analysis_type,
            include_recommendations=request.include_recommendations,
            benchmark_comparison=request.benchmark_comparison
        )
        
        # Get AI-powered insights
        ai_insights = await ai_pattern_service.analyze_performance_patterns(
            analysis_data=analysis_result["raw_data"],
            context={
                "rule_ids": request.rule_ids,
                "data_source_ids": request.data_source_ids,
                "time_range": request.time_range
            }
        )
        
        result = {
            "analysis_id": str(uuid.uuid4()),
            "analysis_summary": analysis_result["summary"],
            "performance_metrics": analysis_result["metrics"],
            "bottlenecks_identified": analysis_result["bottlenecks"],
            "resource_utilization": analysis_result["resource_usage"],
            "ai_insights": ai_insights,
            "recommendations": analysis_result.get("recommendations", []),
            "benchmark_comparison": analysis_result.get("benchmark", {}),
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
        # Cache the result (except for deep analysis)
        if request.analysis_type != "deep":
            await cache_set(cache_key, result, ttl=1800)  # 30 minutes
        
        return StandardResponse(
            success=True,
            message="Performance analysis completed successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error performing performance analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform performance analysis: {str(e)}"
        )

# ===================================
# OPTIMIZATION RECOMMENDATIONS
# ===================================

@router.get("/recommendations", response_model=StandardResponse)
async def get_optimization_recommendations(
    target_type: str = Query("rule", description="Target type for recommendations"),
    target_ids: Optional[List[int]] = Query(None, description="Specific target IDs"),
    priority: Optional[str] = Query(None, description="Priority filter"),
    category: Optional[str] = Query(None, description="Category filter"),
    limit: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_OPTIMIZATION_VIEW))
):
    """
    Get AI-powered optimization recommendations.
    
    Features:
    - Intelligent recommendation engine
    - Priority-based filtering
    - Impact assessment
    - Implementation guidance
    """
    try:
        await check_rate_limit(f"optimization_recommendations:{current_user['user_id']}", max_requests=100, window_seconds=3600)
        
        # Get recommendations from optimization service
        recommendations_result = await optimization_service.get_recommendations(
            target_type=target_type,
            target_ids=target_ids,
            priority=priority,
            category=category,
            limit=limit
        )
        
        # Enhance recommendations with AI insights
        enhanced_recommendations = []
        for rec in recommendations_result["recommendations"]:
            ai_enhancement = await ai_pattern_service.enhance_recommendation(
                recommendation=rec,
                context={"user_id": current_user["user_id"]}
            )
            
            enhanced_rec = {
                **rec,
                "ai_confidence": ai_enhancement.get("confidence", 0.0),
                "implementation_complexity": ai_enhancement.get("complexity", "medium"),
                "estimated_impact": ai_enhancement.get("impact", {}),
                "risk_assessment": ai_enhancement.get("risks", []),
                "implementation_steps": ai_enhancement.get("steps", [])
            }
            enhanced_recommendations.append(enhanced_rec)
        
        result = {
            "recommendations": enhanced_recommendations,
            "total_count": len(enhanced_recommendations),
            "summary_statistics": recommendations_result.get("statistics", {}),
            "recommendation_categories": recommendations_result.get("categories", []),
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message=f"Retrieved {len(enhanced_recommendations)} optimization recommendations",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting optimization recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get optimization recommendations: {str(e)}"
        )

# ===================================
# OPTIMIZATION APPLICATION
# ===================================

@router.put("/apply", response_model=StandardResponse)
async def apply_optimizations(
    request: OptimizationRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_OPTIMIZATION_EXECUTE))
):
    """
    Apply optimization strategies with rollback capabilities.
    
    Features:
    - Multiple optimization strategies
    - Gradual deployment options
    - Automatic rollback on failure
    - Impact monitoring
    """
    try:
        await check_rate_limit(f"apply_optimizations:{current_user['user_id']}", max_requests=20, window_seconds=3600)
        
        # Validate optimization request
        validation_result = await optimization_service.validate_optimization_request(request)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid optimization request: {validation_result['errors']}"
            )
        
        # Apply optimizations
        optimization_result = await optimization_service.apply_optimizations(
            target_type=request.target_type,
            target_ids=request.target_ids,
            optimization_strategies=request.optimization_strategies,
            optimization_level=request.optimization_level,
            apply_immediately=request.apply_immediately,
            rollback_plan=request.rollback_plan,
            applied_by=current_user["username"]
        )
        
        result = {
            "optimization_id": optimization_result["optimization_id"],
            "optimization_status": optimization_result["status"],
            "applied_strategies": optimization_result["applied_strategies"],
            "target_summary": optimization_result["target_summary"],
            "rollback_plan_id": optimization_result.get("rollback_plan_id"),
            "monitoring_url": f"/scan-optimization/status/{optimization_result['optimization_id']}",
            "estimated_completion": optimization_result.get("estimated_completion"),
            "applied_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Optimizations applied successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error applying optimizations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply optimizations: {str(e)}"
        )

# ===================================
# BENCHMARK DATA
# ===================================

@router.get("/benchmarks", response_model=StandardResponse)
async def get_benchmark_data(
    benchmark_type: str = Query("performance", description="Benchmark type"),
    target_type: str = Query("rule", description="Target type"),
    target_ids: Optional[List[int]] = Query(None, description="Specific target IDs"),
    time_range: str = Query("30d", description="Time range for benchmark"),
    include_trends: bool = Query(True, description="Include trend analysis"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_OPTIMIZATION_VIEW))
):
    """
    Get comprehensive benchmark data with trend analysis.
    
    Features:
    - Historical performance baselines
    - Trend analysis
    - Comparative benchmarking
    - Industry standards comparison
    """
    try:
        await check_rate_limit(f"benchmark_data:{current_user['user_id']}", max_requests=100, window_seconds=3600)
        
        # Get benchmark data
        benchmark_result = await optimization_service.get_benchmark_data(
            benchmark_type=benchmark_type,
            target_type=target_type,
            target_ids=target_ids,
            time_range=time_range,
            include_trends=include_trends
        )
        
        # Get trend analysis if requested
        trend_analysis = {}
        if include_trends:
            trend_analysis = await performance_optimizer.analyze_performance_trends(
                benchmark_data=benchmark_result["data"],
                time_range=time_range
            )
        
        result = {
            "benchmark_data": benchmark_result["data"],
            "benchmark_summary": benchmark_result["summary"],
            "baseline_metrics": benchmark_result["baselines"],
            "trend_analysis": trend_analysis,
            "industry_comparison": benchmark_result.get("industry", {}),
            "recommendations": benchmark_result.get("recommendations", []),
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Benchmark data retrieved successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting benchmark data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get benchmark data: {str(e)}"
        )

# ===================================
# ML-BASED TUNING
# ===================================

@router.post("/ml-tune", response_model=StandardResponse)
async def ml_based_tuning(
    request: MLTuningRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_OPTIMIZATION_EXECUTE))
):
    """
    Perform ML-based parameter tuning with automated optimization.
    
    Features:
    - Automated hyperparameter tuning
    - Multi-objective optimization
    - Cross-validation
    - A/B testing integration
    """
    try:
        await check_rate_limit(f"ml_tuning:{current_user['user_id']}", max_requests=10, window_seconds=3600)
        
        # Start ML tuning process
        tuning_result = await optimization_service.start_ml_tuning(
            rule_id=request.rule_id,
            tuning_objective=request.tuning_objective,
            training_data_period=request.training_data_period,
            validation_split=request.validation_split,
            hyperparameter_space=request.hyperparameter_space,
            max_iterations=request.max_iterations,
            initiated_by=current_user["username"]
        )
        
        result = {
            "tuning_job_id": tuning_result["job_id"],
            "rule_id": request.rule_id,
            "tuning_status": tuning_result["status"],
            "optimization_objective": request.tuning_objective,
            "estimated_duration": tuning_result.get("estimated_duration"),
            "progress_monitoring_url": f"/scan-optimization/ml-tune/status/{tuning_result['job_id']}",
            "started_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="ML tuning job started successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error starting ML tuning: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start ML tuning: {str(e)}"
        )

# ===================================
# OPTIMIZATION METRICS
# ===================================

@router.get("/metrics", response_model=StandardResponse)
async def get_optimization_metrics(
    metric_types: Optional[List[str]] = Query(None, description="Metric types to include"),
    target_type: str = Query("rule", description="Target type"),
    target_ids: Optional[List[int]] = Query(None, description="Specific target IDs"),
    time_range: str = Query("24h", description="Time range for metrics"),
    aggregation: str = Query("average", description="Aggregation method"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_OPTIMIZATION_VIEW))
):
    """
    Get comprehensive optimization metrics and KPIs.
    
    Features:
    - Real-time performance metrics
    - Optimization impact tracking
    - ROI calculations
    - Trend analysis
    """
    try:
        await check_rate_limit(f"optimization_metrics:{current_user['user_id']}", max_requests=100, window_seconds=3600)
        
        # Get optimization metrics
        metrics_result = await optimization_service.get_optimization_metrics(
            metric_types=metric_types,
            target_type=target_type,
            target_ids=target_ids,
            time_range=time_range,
            aggregation=aggregation
        )
        
        # Calculate ROI and impact metrics
        roi_analysis = await optimization_service.calculate_optimization_roi(
            metrics_data=metrics_result["data"],
            time_range=time_range
        )
        
        result = {
            "optimization_metrics": metrics_result["data"],
            "metrics_summary": metrics_result["summary"],
            "roi_analysis": roi_analysis,
            "performance_trends": metrics_result.get("trends", {}),
            "comparison_baseline": metrics_result.get("baseline", {}),
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Optimization metrics retrieved successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting optimization metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get optimization metrics: {str(e)}"
        )

# ===================================
# OPTIMIZATION HISTORY
# ===================================

@router.get("/history", response_model=StandardResponse)
async def get_optimization_history(
    target_type: Optional[str] = Query(None, description="Target type filter"),
    target_ids: Optional[List[int]] = Query(None, description="Specific target IDs"),
    optimization_type: Optional[str] = Query(None, description="Optimization type filter"),
    status: Optional[str] = Query(None, description="Status filter"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_OPTIMIZATION_VIEW))
):
    """
    Get optimization history with detailed analysis.
    
    Features:
    - Complete optimization history
    - Success/failure analysis
    - Impact tracking
    - Pattern analysis
    """
    try:
        await check_rate_limit(f"optimization_history:{current_user['user_id']}", max_requests=100, window_seconds=3600)
        
        # Get optimization history
        history_result = await optimization_service.get_optimization_history(
            target_type=target_type,
            target_ids=target_ids,
            optimization_type=optimization_type,
            status=status,
            limit=limit,
            offset=offset
        )
        
        # Analyze patterns in optimization history
        pattern_analysis = await ai_pattern_service.analyze_optimization_patterns(
            history_data=history_result["data"]
        )
        
        result = {
            "optimization_history": history_result["data"],
            "total_count": history_result["total_count"],
            "success_rate": history_result["success_rate"],
            "pattern_analysis": pattern_analysis,
            "summary_statistics": history_result["statistics"],
            "has_more": len(history_result["data"]) == limit
        }
        
        return StandardResponse(
            success=True,
            message=f"Retrieved {len(history_result['data'])} optimization history records",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting optimization history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get optimization history: {str(e)}"
        )

# ===================================
# ROLLBACK OPERATIONS
# ===================================

@router.post("/rollback", response_model=StandardResponse)
async def rollback_optimization(
    request: RollbackRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_OPTIMIZATION_EXECUTE))
):
    """
    Rollback optimization changes with comprehensive recovery.
    
    Features:
    - Full and partial rollback
    - State verification
    - Impact assessment
    - Recovery validation
    """
    try:
        await check_rate_limit(f"rollback_optimization:{current_user['user_id']}", max_requests=10, window_seconds=3600)
        
        # Perform rollback operation
        rollback_result = await optimization_service.rollback_optimization(
            optimization_id=request.optimization_id,
            rollback_type=request.rollback_type,
            rollback_reason=request.rollback_reason,
            initiated_by=current_user["username"]
        )
        
        result = {
            "rollback_id": rollback_result["rollback_id"],
            "optimization_id": request.optimization_id,
            "rollback_status": rollback_result["status"],
            "rollback_type": request.rollback_type,
            "rollback_summary": rollback_result["summary"],
            "verification_results": rollback_result.get("verification", {}),
            "recovery_actions": rollback_result.get("recovery_actions", []),
            "completed_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Optimization rollback completed successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error performing optimization rollback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform optimization rollback: {str(e)}"
        )