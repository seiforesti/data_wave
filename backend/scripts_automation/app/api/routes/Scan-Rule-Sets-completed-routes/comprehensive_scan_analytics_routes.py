"""
Comprehensive Scan Analytics API Routes

Provides comprehensive API endpoints for scan analytics as specified
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
from app.services.Scan-Rule-Sets-completed-services.usage_analytics_service import UsageAnalyticsService
from app.services.scan_performance_optimizer import ScanPerformanceOptimizer

# Model imports
from app.models.Scan-Rule-Sets-completed-models.analytics_reporting_models import (
    UsageAnalytics, TrendAnalysis, ROIMetrics, ComplianceIntegration, PerformanceAlert
)

# RBAC Permissions
PERMISSION_ANALYTICS_VIEW = "analytics:view"
PERMISSION_ANALYTICS_EXPORT = "analytics:export"
PERMISSION_ANALYTICS_ADMIN = "analytics:admin"

# Initialize logger and services
logger = get_logger(__name__)
router = APIRouter(prefix="/scan-analytics", tags=["Scan Analytics"])

analytics_service = UsageAnalyticsService()
performance_optimizer = ScanPerformanceOptimizer()

# ===================================
# REQUEST/RESPONSE MODELS
# ===================================

class PerformanceAnalyticsRequest(BaseModel):
    """Request model for performance analytics."""
    time_range: str = "24h"  # 1h, 24h, 7d, 30d, 90d
    metric_types: List[str] = ["throughput", "latency", "errors", "resources"]
    aggregation_level: str = "hourly"  # minute, hourly, daily
    data_source_ids: Optional[List[int]] = None
    rule_ids: Optional[List[int]] = None
    include_predictions: bool = True

class UsageAnalyticsRequest(BaseModel):
    """Request model for usage analytics."""
    time_range: str = "7d"
    user_segments: Optional[List[str]] = None
    feature_categories: Optional[List[str]] = None
    include_user_journey: bool = True
    include_adoption_metrics: bool = True

class TrendAnalysisRequest(BaseModel):
    """Request model for trend analysis."""
    metric_types: List[str] = ["performance", "usage", "quality"]
    time_range: str = "30d"
    trend_algorithms: List[str] = ["linear", "seasonal", "ml_forecast"]
    confidence_interval: float = 0.95
    forecast_horizon: str = "7d"

class ComplianceAnalyticsRequest(BaseModel):
    """Request model for compliance analytics."""
    compliance_frameworks: List[str] = []
    audit_period: str = "30d"
    include_violations: bool = True
    include_remediation: bool = True
    severity_levels: Optional[List[str]] = None

class ROIAnalysisRequest(BaseModel):
    """Request model for ROI analysis."""
    analysis_period: str = "90d"
    cost_categories: List[str] = ["infrastructure", "personnel", "licenses"]
    benefit_categories: List[str] = ["productivity", "risk_reduction", "automation"]
    include_projections: bool = True

class CustomAnalyticsRequest(BaseModel):
    """Request model for custom analytics."""
    analysis_name: str
    metrics: List[Dict[str, Any]]
    dimensions: List[str]
    filters: Dict[str, Any] = {}
    time_range: str = "7d"
    visualization_type: str = "dashboard"

class StandardResponse(BaseModel):
    """Standard API response model."""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

# ===================================
# PERFORMANCE ANALYTICS
# ===================================

@router.get("/performance", response_model=StandardResponse)
async def get_performance_analytics(
    time_range: str = Query("24h", description="Time range for analytics"),
    metric_types: List[str] = Query(["throughput", "latency"], description="Metric types"),
    aggregation_level: str = Query("hourly", description="Aggregation level"),
    data_source_ids: Optional[List[int]] = Query(None, description="Specific data source IDs"),
    rule_ids: Optional[List[int]] = Query(None, description="Specific rule IDs"),
    include_predictions: bool = Query(True, description="Include predictive analytics"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Get comprehensive performance analytics with AI-powered insights.
    
    Features:
    - Multi-dimensional performance metrics
    - Real-time performance monitoring
    - Predictive performance analytics
    - Bottleneck identification
    """
    try:
        await check_rate_limit(f"performance_analytics:{current_user['user_id']}", max_requests=100, window_seconds=3600)
        
        # Check cache for recent analytics
        cache_key = f"performance_analytics:{time_range}:{aggregation_level}:{hash(str(metric_types))}"
        cached_result = await cache_get(cache_key)
        if cached_result:
            return StandardResponse(
                success=True,
                message="Performance analytics retrieved from cache",
                data=cached_result
            )
        
        # Get performance analytics
        analytics_result = await analytics_service.get_performance_analytics(
            time_range=time_range,
            metric_types=metric_types,
            aggregation_level=aggregation_level,
            data_source_ids=data_source_ids,
            rule_ids=rule_ids,
            include_predictions=include_predictions
        )
        
        # Get performance optimization insights
        optimization_insights = await performance_optimizer.get_performance_insights(
            analytics_data=analytics_result["data"],
            context={"time_range": time_range}
        )
        
        result = {
            "performance_metrics": analytics_result["data"],
            "performance_summary": analytics_result["summary"],
            "optimization_insights": optimization_insights,
            "bottlenecks_identified": analytics_result.get("bottlenecks", []),
            "performance_trends": analytics_result.get("trends", {}),
            "predictions": analytics_result.get("predictions", []) if include_predictions else [],
            "alerts": analytics_result.get("alerts", []),
            "analytics_metadata": {
                "time_range": time_range,
                "aggregation_level": aggregation_level,
                "metric_types": metric_types,
                "data_points": len(analytics_result["data"])
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # Cache the result
        await cache_set(cache_key, result, ttl=900)  # 15 minutes
        
        return StandardResponse(
            success=True,
            message="Performance analytics retrieved successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting performance analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance analytics: {str(e)}"
        )

# ===================================
# USAGE ANALYTICS
# ===================================

@router.get("/usage", response_model=StandardResponse)
async def get_usage_analytics(
    time_range: str = Query("7d", description="Time range for usage analytics"),
    user_segments: Optional[List[str]] = Query(None, description="User segment filters"),
    feature_categories: Optional[List[str]] = Query(None, description="Feature category filters"),
    include_user_journey: bool = Query(True, description="Include user journey analysis"),
    include_adoption_metrics: bool = Query(True, description="Include adoption metrics"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Get comprehensive usage analytics with user behavior insights.
    
    Features:
    - User behavior analysis
    - Feature adoption metrics
    - User journey mapping
    - Engagement analytics
    """
    try:
        await check_rate_limit(f"usage_analytics:{current_user['user_id']}", max_requests=100, window_seconds=3600)
        
        # Get usage analytics
        usage_result = await analytics_service.get_usage_analytics(
            time_range=time_range,
            user_segments=user_segments,
            feature_categories=feature_categories,
            include_user_journey=include_user_journey,
            include_adoption_metrics=include_adoption_metrics
        )
        
        # Get user segmentation analysis
        segmentation_analysis = await analytics_service.analyze_user_segmentation(
            usage_data=usage_result["data"],
            time_range=time_range
        )
        
        result = {
            "usage_metrics": usage_result["data"],
            "usage_summary": usage_result["summary"],
            "user_segmentation": segmentation_analysis,
            "adoption_metrics": usage_result.get("adoption", {}) if include_adoption_metrics else {},
            "user_journey": usage_result.get("journey", {}) if include_user_journey else {},
            "engagement_analytics": usage_result.get("engagement", {}),
            "feature_analytics": usage_result.get("features", {}),
            "analytics_metadata": {
                "time_range": time_range,
                "user_segments_analyzed": user_segments or "all",
                "feature_categories": feature_categories or "all",
                "total_users": usage_result.get("total_users", 0)
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Usage analytics retrieved successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting usage analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get usage analytics: {str(e)}"
        )

# ===================================
# TREND ANALYSIS
# ===================================

@router.get("/trends", response_model=StandardResponse)
async def get_trend_analysis(
    metric_types: List[str] = Query(["performance", "usage"], description="Metric types for trend analysis"),
    time_range: str = Query("30d", description="Time range for trend analysis"),
    trend_algorithms: List[str] = Query(["linear", "seasonal"], description="Trend algorithms"),
    confidence_interval: float = Query(0.95, description="Confidence interval"),
    forecast_horizon: str = Query("7d", description="Forecast horizon"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Get comprehensive trend analysis with predictive forecasting.
    
    Features:
    - Multi-algorithm trend detection
    - Seasonal pattern analysis
    - Predictive forecasting
    - Anomaly trend detection
    """
    try:
        await check_rate_limit(f"trend_analysis:{current_user['user_id']}", max_requests=50, window_seconds=3600)
        
        # Perform trend analysis
        trend_result = await analytics_service.perform_trend_analysis(
            metric_types=metric_types,
            time_range=time_range,
            trend_algorithms=trend_algorithms,
            confidence_interval=confidence_interval,
            forecast_horizon=forecast_horizon
        )
        
        # Get trend insights
        trend_insights = await analytics_service.generate_trend_insights(
            trend_data=trend_result["data"],
            algorithms_used=trend_algorithms
        )
        
        result = {
            "trend_analysis": trend_result["data"],
            "trend_summary": trend_result["summary"],
            "trend_insights": trend_insights,
            "forecasts": trend_result.get("forecasts", []),
            "seasonal_patterns": trend_result.get("seasonal", {}),
            "anomaly_trends": trend_result.get("anomalies", []),
            "confidence_metrics": trend_result.get("confidence", {}),
            "analysis_metadata": {
                "metric_types": metric_types,
                "time_range": time_range,
                "algorithms_used": trend_algorithms,
                "confidence_interval": confidence_interval,
                "forecast_horizon": forecast_horizon
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Trend analysis completed successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error performing trend analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform trend analysis: {str(e)}"
        )

# ===================================
# COMPLIANCE ANALYTICS
# ===================================

@router.get("/compliance", response_model=StandardResponse)
async def get_compliance_analytics(
    compliance_frameworks: List[str] = Query([], description="Compliance frameworks"),
    audit_period: str = Query("30d", description="Audit period"),
    include_violations: bool = Query(True, description="Include violation analysis"),
    include_remediation: bool = Query(True, description="Include remediation tracking"),
    severity_levels: Optional[List[str]] = Query(None, description="Severity level filters"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Get comprehensive compliance analytics and audit reporting.
    
    Features:
    - Multi-framework compliance tracking
    - Violation analysis and trending
    - Remediation tracking
    - Risk assessment
    """
    try:
        await check_rate_limit(f"compliance_analytics:{current_user['user_id']}", max_requests=50, window_seconds=3600)
        
        # Get compliance analytics
        compliance_result = await analytics_service.get_compliance_analytics(
            compliance_frameworks=compliance_frameworks,
            audit_period=audit_period,
            include_violations=include_violations,
            include_remediation=include_remediation,
            severity_levels=severity_levels
        )
        
        # Get compliance insights
        compliance_insights = await analytics_service.generate_compliance_insights(
            compliance_data=compliance_result["data"],
            frameworks=compliance_frameworks
        )
        
        result = {
            "compliance_metrics": compliance_result["data"],
            "compliance_summary": compliance_result["summary"],
            "compliance_insights": compliance_insights,
            "violations": compliance_result.get("violations", []) if include_violations else [],
            "remediation_tracking": compliance_result.get("remediation", {}) if include_remediation else {},
            "risk_assessment": compliance_result.get("risk", {}),
            "compliance_trends": compliance_result.get("trends", {}),
            "analytics_metadata": {
                "compliance_frameworks": compliance_frameworks or "all",
                "audit_period": audit_period,
                "severity_levels": severity_levels or "all",
                "total_checks": compliance_result.get("total_checks", 0)
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Compliance analytics retrieved successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting compliance analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get compliance analytics: {str(e)}"
        )

# ===================================
# ROI ANALYSIS
# ===================================

@router.get("/roi", response_model=StandardResponse)
async def get_roi_analysis(
    analysis_period: str = Query("90d", description="Analysis period"),
    cost_categories: List[str] = Query(["infrastructure", "personnel"], description="Cost categories"),
    benefit_categories: List[str] = Query(["productivity", "risk_reduction"], description="Benefit categories"),
    include_projections: bool = Query(True, description="Include ROI projections"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Get comprehensive ROI analysis with financial impact assessment.
    
    Features:
    - Multi-category cost analysis
    - Benefit quantification
    - ROI projections
    - Business impact assessment
    """
    try:
        await check_rate_limit(f"roi_analysis:{current_user['user_id']}", max_requests=20, window_seconds=3600)
        
        # Perform ROI analysis
        roi_result = await analytics_service.perform_roi_analysis(
            analysis_period=analysis_period,
            cost_categories=cost_categories,
            benefit_categories=benefit_categories,
            include_projections=include_projections
        )
        
        # Get business impact insights
        business_insights = await analytics_service.generate_business_impact_insights(
            roi_data=roi_result["data"],
            analysis_period=analysis_period
        )
        
        result = {
            "roi_metrics": roi_result["data"],
            "roi_summary": roi_result["summary"],
            "business_insights": business_insights,
            "cost_analysis": roi_result.get("costs", {}),
            "benefit_analysis": roi_result.get("benefits", {}),
            "roi_projections": roi_result.get("projections", []) if include_projections else [],
            "payback_analysis": roi_result.get("payback", {}),
            "analytics_metadata": {
                "analysis_period": analysis_period,
                "cost_categories": cost_categories,
                "benefit_categories": benefit_categories,
                "total_investment": roi_result.get("total_investment", 0),
                "total_returns": roi_result.get("total_returns", 0)
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="ROI analysis completed successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error performing ROI analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform ROI analysis: {str(e)}"
        )

# ===================================
# EXECUTIVE DASHBOARDS
# ===================================

@router.get("/executive", response_model=StandardResponse)
async def get_executive_dashboard(
    dashboard_type: str = Query("overview", description="Dashboard type"),
    time_range: str = Query("30d", description="Time range for dashboard"),
    include_kpis: bool = Query(True, description="Include KPI metrics"),
    include_alerts: bool = Query(True, description="Include system alerts"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Get executive dashboard with high-level KPIs and insights.
    
    Features:
    - Executive-level KPIs
    - Strategic insights
    - Alert summaries
    - Business impact metrics
    """
    try:
        await check_rate_limit(f"executive_dashboard:{current_user['user_id']}", max_requests=50, window_seconds=3600)
        
        # Get executive dashboard data
        dashboard_result = await analytics_service.get_executive_dashboard(
            dashboard_type=dashboard_type,
            time_range=time_range,
            include_kpis=include_kpis,
            include_alerts=include_alerts
        )
        
        # Get strategic insights
        strategic_insights = await analytics_service.generate_strategic_insights(
            dashboard_data=dashboard_result["data"],
            time_range=time_range
        )
        
        result = {
            "dashboard_data": dashboard_result["data"],
            "dashboard_summary": dashboard_result["summary"],
            "strategic_insights": strategic_insights,
            "kpi_metrics": dashboard_result.get("kpis", {}) if include_kpis else {},
            "system_alerts": dashboard_result.get("alerts", []) if include_alerts else [],
            "business_metrics": dashboard_result.get("business", {}),
            "performance_overview": dashboard_result.get("performance", {}),
            "dashboard_metadata": {
                "dashboard_type": dashboard_type,
                "time_range": time_range,
                "last_updated": dashboard_result.get("last_updated"),
                "data_freshness": dashboard_result.get("freshness")
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Executive dashboard retrieved successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error getting executive dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get executive dashboard: {str(e)}"
        )

# ===================================
# CUSTOM ANALYTICS
# ===================================

@router.post("/custom", response_model=StandardResponse)
async def create_custom_analytics(
    request: CustomAnalyticsRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Create custom analytics with user-defined metrics and dimensions.
    
    Features:
    - Custom metric definitions
    - Flexible dimension analysis
    - Dynamic visualization
    - Scheduled reporting
    """
    try:
        await check_rate_limit(f"custom_analytics:{current_user['user_id']}", max_requests=20, window_seconds=3600)
        
        # Create custom analytics
        analytics_result = await analytics_service.create_custom_analytics(
            analysis_name=request.analysis_name,
            metrics=request.metrics,
            dimensions=request.dimensions,
            filters=request.filters,
            time_range=request.time_range,
            visualization_type=request.visualization_type,
            created_by=current_user["username"]
        )
        
        result = {
            "analytics_id": analytics_result["analytics_id"],
            "analysis_name": request.analysis_name,
            "custom_data": analytics_result["data"],
            "analytics_summary": analytics_result["summary"],
            "visualization_config": analytics_result.get("visualization", {}),
            "metrics_analysis": analytics_result.get("metrics_analysis", {}),
            "dimension_breakdown": analytics_result.get("dimensions", {}),
            "analytics_metadata": {
                "metrics_count": len(request.metrics),
                "dimensions_count": len(request.dimensions),
                "time_range": request.time_range,
                "visualization_type": request.visualization_type,
                "filters_applied": len(request.filters)
            },
            "created_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Custom analytics created successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error creating custom analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create custom analytics: {str(e)}"
        )

# ===================================
# DATA EXPORT
# ===================================

@router.get("/export", response_model=StandardResponse)
async def export_analytics_data(
    export_type: str = Query("csv", description="Export format"),
    analytics_types: List[str] = Query(["performance", "usage"], description="Analytics types to export"),
    time_range: str = Query("7d", description="Time range for export"),
    include_metadata: bool = Query(True, description="Include metadata"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_EXPORT))
):
    """
    Export analytics data in various formats.
    
    Features:
    - Multiple export formats
    - Selective data export
    - Metadata inclusion
    - Scheduled exports
    """
    try:
        await check_rate_limit(f"export_analytics:{current_user['user_id']}", max_requests=10, window_seconds=3600)
        
        # Export analytics data
        export_result = await analytics_service.export_analytics_data(
            export_type=export_type,
            analytics_types=analytics_types,
            time_range=time_range,
            include_metadata=include_metadata,
            exported_by=current_user["username"]
        )
        
        result = {
            "export_id": export_result["export_id"],
            "export_status": export_result["status"],
            "export_url": export_result.get("download_url"),
            "file_size": export_result.get("file_size"),
            "record_count": export_result.get("record_count"),
            "export_metadata": {
                "export_type": export_type,
                "analytics_types": analytics_types,
                "time_range": time_range,
                "include_metadata": include_metadata,
                "compression": export_result.get("compression")
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return StandardResponse(
            success=True,
            message="Analytics data export completed successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error exporting analytics data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export analytics data: {str(e)}"
        )