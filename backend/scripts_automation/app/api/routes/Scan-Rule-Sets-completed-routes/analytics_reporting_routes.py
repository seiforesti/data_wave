"""
🔧 Advanced Analytics & Reporting Routes for Scan-Rule-Sets Group
=================================================================

This module provides comprehensive API endpoints for analytics and reporting,
including usage analytics, trend analysis, ROI calculation, and compliance integration.

Key Features:
- Advanced usage analytics with ML insights
- Comprehensive trend analysis and forecasting
- ROI calculation and business value metrics
- Compliance integration and reporting
- Performance analytics and optimization insights
- User segmentation and behavior analysis
- Executive dashboards and KPIs
- Real-time monitoring and alerting
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlmodel import Session, select
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from enum import Enum

from app.core.database import get_session
from app.api.security.rbac import require_permission, get_current_user
from app.utils.rate_limiter import check_rate_limit
from app.core.logging_config import get_logger
from app.models.Scan-Rule-Sets-completed-models.analytics_reporting_models import (
    UsageAnalytics, TrendAnalysis, ROIMetrics, ComplianceIntegration,
    PerformanceAlert, UsageAnalyticsCreate, TrendAnalysisRequest,
    ROICalculationRequest, ComplianceReportRequest, AnalyticsRequest,
    AnalyticsResponse, TrendAnalysisResponse, ROIMetricsResponse,
    ComplianceReportResponse, PerformanceAlertResponse
)
from app.services.Scan-Rule-Sets-completed-services.usage_analytics_service import UsageAnalyticsService
from app.models.response_models import StandardResponse

# Initialize router and logger
router = APIRouter(prefix="/analytics-reporting", tags=["Analytics & Reporting"])
logger = get_logger(__name__)

# Permission constants
PERMISSION_ANALYTICS_VIEW = "analytics:view"
PERMISSION_ANALYTICS_ADMIN = "analytics:admin"
PERMISSION_REPORTS_GENERATE = "reports:generate"
PERMISSION_TRENDS_ANALYZE = "trends:analyze"
PERMISSION_ROI_CALCULATE = "roi:calculate"
PERMISSION_COMPLIANCE_VIEW = "compliance:view"
PERMISSION_PERFORMANCE_MONITOR = "performance:monitor"


class ReportFormat(str, Enum):
    """Supported report formats"""
    JSON = "json"
    PDF = "pdf"
    EXCEL = "excel"
    CSV = "csv"


class TimeRange(str, Enum):
    """Predefined time ranges for analytics"""
    LAST_24H = "last_24h"
    LAST_7D = "last_7d"
    LAST_30D = "last_30d"
    LAST_90D = "last_90d"
    LAST_YEAR = "last_year"
    CUSTOM = "custom"


# ===============================
# USAGE ANALYTICS ENDPOINTS
# ===============================

@router.get("/usage/overview", response_model=AnalyticsResponse)
async def get_usage_overview(
    time_range: TimeRange = Query(default=TimeRange.LAST_30D),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    rule_ids: Optional[List[int]] = Query(default=None),
    user_segments: Optional[List[str]] = Query(default=None),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Get comprehensive usage analytics overview with key metrics
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Calculate date range
        if time_range == TimeRange.CUSTOM:
            if not start_date or not end_date:
                raise HTTPException(status_code=400, detail="Custom time range requires start_date and end_date")
        else:
            start_date, end_date = analytics_service.get_predefined_date_range(time_range)
        
        # Get usage overview
        overview = await analytics_service.get_usage_overview(
            session=session,
            start_date=start_date,
            end_date=end_date,
            rule_ids=rule_ids,
            user_segments=user_segments
        )
        
        return AnalyticsResponse(
            success=True,
            data=overview,
            metadata={
                "time_range": time_range,
                "start_date": start_date,
                "end_date": end_date,
                "generated_at": datetime.now(),
                "user_context": current_user.get("username", "system")
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get usage overview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve usage analytics")


@router.get("/usage/detailed/{rule_id}", response_model=AnalyticsResponse)
async def get_detailed_rule_usage(
    rule_id: int,
    time_range: TimeRange = Query(default=TimeRange.LAST_30D),
    include_user_breakdown: bool = Query(default=True),
    include_performance_metrics: bool = Query(default=True),
    include_error_analysis: bool = Query(default=True),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Get detailed usage analytics for a specific rule
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Get detailed usage analytics
        detailed_usage = await analytics_service.get_detailed_rule_usage(
            session=session,
            rule_id=rule_id,
            time_range=time_range,
            include_user_breakdown=include_user_breakdown,
            include_performance_metrics=include_performance_metrics,
            include_error_analysis=include_error_analysis
        )
        
        if not detailed_usage:
            raise HTTPException(status_code=404, detail="Rule not found or no usage data available")
        
        return AnalyticsResponse(
            success=True,
            data=detailed_usage,
            metadata={
                "rule_id": rule_id,
                "time_range": time_range,
                "generated_at": datetime.now()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get detailed usage for rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve detailed usage")


@router.post("/usage/track", response_model=StandardResponse)
async def track_usage_event(
    usage_data: UsageAnalyticsCreate,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Track a new usage event for analytics
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Track usage event
        usage_event = await analytics_service.track_usage_event(
            session=session,
            rule_id=usage_data.rule_id,
            user_id=usage_data.user_id or current_user.get("id"),
            event_type=usage_data.event_type,
            event_data=usage_data.event_data,
            context=usage_data.context
        )
        
        return StandardResponse(
            success=True,
            message="Usage event tracked successfully",
            data={
                "event_id": usage_event.id,
                "rule_id": usage_event.rule_id,
                "timestamp": usage_event.timestamp
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to track usage event: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track usage event")


@router.get("/usage/user-segments", response_model=Dict[str, Any])
async def get_user_segmentation_analysis(
    time_range: TimeRange = Query(default=TimeRange.LAST_30D),
    segment_type: str = Query(default="behavior", description="Segmentation type"),
    min_segment_size: int = Query(default=5, description="Minimum users per segment"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Get user segmentation analysis with ML-based clustering
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Get user segmentation
        segmentation = await analytics_service.get_user_segmentation(
            session=session,
            time_range=time_range,
            segment_type=segment_type,
            min_segment_size=min_segment_size
        )
        
        return {
            "success": True,
            "data": segmentation,
            "metadata": {
                "time_range": time_range,
                "segment_type": segment_type,
                "segments_found": len(segmentation.get("segments", [])),
                "generated_at": datetime.now()
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get user segmentation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user segmentation")


# ===============================
# TREND ANALYSIS ENDPOINTS
# ===============================

@router.post("/trends/analyze", response_model=TrendAnalysisResponse)
async def analyze_trends(
    trend_request: TrendAnalysisRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_TRENDS_ANALYZE))
):
    """
    Perform comprehensive trend analysis with ML-powered forecasting
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Perform trend analysis
        trend_analysis = await analytics_service.analyze_trends(
            session=session,
            metrics=trend_request.metrics,
            time_horizon=trend_request.time_horizon,
            granularity=trend_request.granularity,
            filters=trend_request.filters,
            include_forecasting=trend_request.include_forecasting,
            confidence_level=trend_request.confidence_level
        )
        
        # Background task for detailed ML analysis
        background_tasks.add_task(
            analytics_service.enhance_trend_analysis,
            session, trend_analysis.id
        )
        
        return TrendAnalysisResponse(
            analysis_id=trend_analysis.id,
            metrics_analyzed=trend_analysis.metrics_analyzed,
            time_period=trend_analysis.time_period,
            trends_detected=trend_analysis.trends_detected,
            forecasts=trend_analysis.forecasts,
            statistical_significance=trend_analysis.statistical_significance,
            insights=trend_analysis.insights,
            recommendations=trend_analysis.recommendations,
            confidence_scores=trend_analysis.confidence_scores
        )
        
    except Exception as e:
        logger.error(f"Failed to analyze trends: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to perform trend analysis")


@router.get("/trends/predictions/{analysis_id}", response_model=Dict[str, Any])
async def get_trend_predictions(
    analysis_id: int,
    prediction_horizon: int = Query(default=30, description="Days to predict"),
    include_confidence_intervals: bool = Query(default=True),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_TRENDS_ANALYZE))
):
    """
    Get detailed predictions from a trend analysis
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Get predictions
        predictions = await analytics_service.get_trend_predictions(
            session=session,
            analysis_id=analysis_id,
            prediction_horizon=prediction_horizon,
            include_confidence_intervals=include_confidence_intervals
        )
        
        if not predictions:
            raise HTTPException(status_code=404, detail="Trend analysis not found")
        
        return {
            "success": True,
            "data": predictions,
            "metadata": {
                "analysis_id": analysis_id,
                "prediction_horizon": prediction_horizon,
                "generated_at": datetime.now()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get predictions for analysis {analysis_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve predictions")


# ===============================
# ROI CALCULATION ENDPOINTS
# ===============================

@router.post("/roi/calculate", response_model=ROIMetricsResponse)
async def calculate_roi_metrics(
    roi_request: ROICalculationRequest,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ROI_CALCULATE))
):
    """
    Calculate comprehensive ROI metrics with business value analysis
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Calculate ROI metrics
        roi_metrics = await analytics_service.calculate_roi_metrics(
            session=session,
            rule_ids=roi_request.rule_ids,
            calculation_period=roi_request.calculation_period,
            cost_factors=roi_request.cost_factors,
            benefit_factors=roi_request.benefit_factors,
            include_projections=roi_request.include_projections
        )
        
        return ROIMetricsResponse(
            calculation_id=roi_metrics.id,
            total_roi_percentage=roi_metrics.total_roi_percentage,
            net_present_value=roi_metrics.net_present_value,
            payback_period_months=roi_metrics.payback_period_months,
            total_costs=roi_metrics.total_costs,
            total_benefits=roi_metrics.total_benefits,
            cost_breakdown=roi_metrics.cost_breakdown,
            benefit_breakdown=roi_metrics.benefit_breakdown,
            risk_factors=roi_metrics.risk_factors,
            sensitivity_analysis=roi_metrics.sensitivity_analysis,
            projections=roi_metrics.projections,
            business_impact=roi_metrics.business_impact
        )
        
    except Exception as e:
        logger.error(f"Failed to calculate ROI metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to calculate ROI")


@router.get("/roi/comparison", response_model=Dict[str, Any])
async def compare_roi_metrics(
    rule_ids: List[int] = Query(description="Rule IDs to compare"),
    comparison_period: int = Query(default=90, description="Days for comparison"),
    normalize_by_usage: bool = Query(default=True, description="Normalize by usage volume"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ROI_CALCULATE))
):
    """
    Compare ROI metrics across multiple rules
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Compare ROI metrics
        comparison = await analytics_service.compare_roi_metrics(
            session=session,
            rule_ids=rule_ids,
            comparison_period=comparison_period,
            normalize_by_usage=normalize_by_usage
        )
        
        return {
            "success": True,
            "data": comparison,
            "metadata": {
                "rules_compared": len(rule_ids),
                "comparison_period": comparison_period,
                "generated_at": datetime.now()
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to compare ROI metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to compare ROI")


# ===============================
# COMPLIANCE REPORTING ENDPOINTS
# ===============================

@router.post("/compliance/generate-report", response_model=ComplianceReportResponse)
async def generate_compliance_report(
    compliance_request: ComplianceReportRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_VIEW))
):
    """
    Generate comprehensive compliance report with regulatory analysis
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Generate compliance report
        compliance_report = await analytics_service.generate_compliance_report(
            session=session,
            compliance_frameworks=compliance_request.compliance_frameworks,
            reporting_period=compliance_request.reporting_period,
            rule_scope=compliance_request.rule_scope,
            include_evidence=compliance_request.include_evidence,
            include_remediation=compliance_request.include_remediation
        )
        
        # Background task for detailed compliance analysis
        background_tasks.add_task(
            analytics_service.enhance_compliance_analysis,
            session, compliance_report.id
        )
        
        return ComplianceReportResponse(
            report_id=compliance_report.id,
            compliance_score=compliance_report.compliance_score,
            frameworks_assessed=compliance_report.frameworks_assessed,
            violations_found=compliance_report.violations_found,
            remediation_items=compliance_report.remediation_items,
            evidence_collected=compliance_report.evidence_collected,
            risk_assessment=compliance_report.risk_assessment,
            recommendations=compliance_report.recommendations,
            executive_summary=compliance_report.executive_summary
        )
        
    except Exception as e:
        logger.error(f"Failed to generate compliance report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate compliance report")


@router.get("/compliance/status", response_model=Dict[str, Any])
async def get_compliance_status(
    frameworks: Optional[List[str]] = Query(default=None, description="Compliance frameworks"),
    include_details: bool = Query(default=False, description="Include detailed status"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_COMPLIANCE_VIEW))
):
    """
    Get current compliance status across all frameworks
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Get compliance status
        status = await analytics_service.get_compliance_status(
            session=session,
            frameworks=frameworks,
            include_details=include_details
        )
        
        return {
            "success": True,
            "data": status,
            "metadata": {
                "frameworks_checked": len(status.get("frameworks", {})),
                "generated_at": datetime.now()
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get compliance status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve compliance status")


# ===============================
# PERFORMANCE MONITORING ENDPOINTS
# ===============================

@router.get("/performance/alerts", response_model=List[PerformanceAlertResponse])
async def get_performance_alerts(
    severity: Optional[str] = Query(default=None, description="Filter by severity"),
    rule_ids: Optional[List[int]] = Query(default=None, description="Filter by rule IDs"),
    active_only: bool = Query(default=True, description="Show only active alerts"),
    limit: int = Query(default=100, le=1000, description="Maximum alerts to return"),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_PERFORMANCE_MONITOR))
):
    """
    Get performance alerts and monitoring data
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Get performance alerts
        alerts = await analytics_service.get_performance_alerts(
            session=session,
            severity=severity,
            rule_ids=rule_ids,
            active_only=active_only,
            limit=limit
        )
        
        return [
            PerformanceAlertResponse(
                alert_id=alert.id,
                rule_id=alert.rule_id,
                alert_type=alert.alert_type,
                severity=alert.severity,
                message=alert.message,
                metric_name=alert.metric_name,
                threshold_value=alert.threshold_value,
                current_value=alert.current_value,
                triggered_at=alert.triggered_at,
                acknowledged=alert.acknowledged,
                resolved_at=alert.resolved_at,
                metadata=alert.metadata
            ) for alert in alerts
        ]
        
    except Exception as e:
        logger.error(f"Failed to get performance alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve performance alerts")


@router.post("/performance/alerts/{alert_id}/acknowledge", response_model=StandardResponse)
async def acknowledge_performance_alert(
    alert_id: int,
    acknowledgment_note: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_PERFORMANCE_MONITOR))
):
    """
    Acknowledge a performance alert
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Acknowledge alert
        result = await analytics_service.acknowledge_alert(
            session=session,
            alert_id=alert_id,
            acknowledged_by=current_user.get("username", "system"),
            acknowledgment_note=acknowledgment_note
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return StandardResponse(
            success=True,
            message="Alert acknowledged successfully",
            data={
                "alert_id": alert_id,
                "acknowledged_by": current_user.get("username", "system"),
                "acknowledged_at": datetime.now()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to acknowledge alert {alert_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to acknowledge alert")


# ===============================
# EXECUTIVE REPORTING ENDPOINTS
# ===============================

@router.get("/executive/dashboard", response_model=Dict[str, Any])
async def get_executive_dashboard(
    time_range: TimeRange = Query(default=TimeRange.LAST_30D),
    include_forecasts: bool = Query(default=True),
    include_comparisons: bool = Query(default=True),
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_ANALYTICS_VIEW))
):
    """
    Get executive dashboard with high-level KPIs and insights
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Get executive dashboard data
        dashboard = await analytics_service.get_executive_dashboard(
            session=session,
            time_range=time_range,
            include_forecasts=include_forecasts,
            include_comparisons=include_comparisons
        )
        
        return {
            "success": True,
            "data": dashboard,
            "metadata": {
                "time_range": time_range,
                "generated_at": datetime.now(),
                "generated_for": current_user.get("username", "system")
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get executive dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve executive dashboard")


@router.post("/reports/export", response_model=StandardResponse)
async def export_analytics_report(
    report_type: str,
    format: ReportFormat = Query(default=ReportFormat.PDF),
    time_range: TimeRange = Query(default=TimeRange.LAST_30D),
    filters: Optional[Dict[str, Any]] = None,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(require_permission(PERMISSION_REPORTS_GENERATE))
):
    """
    Export analytics report in specified format
    """
    try:
        analytics_service = UsageAnalyticsService()
        
        # Start export process
        export_job = await analytics_service.start_report_export(
            session=session,
            report_type=report_type,
            format=format,
            time_range=time_range,
            filters=filters or {},
            requested_by=current_user.get("username", "system")
        )
        
        # Background task for report generation
        background_tasks.add_task(
            analytics_service.generate_report_export,
            session, export_job.id
        )
        
        return StandardResponse(
            success=True,
            message="Report export started successfully",
            data={
                "export_job_id": export_job.id,
                "report_type": report_type,
                "format": format,
                "estimated_completion": export_job.estimated_completion
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to start report export: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start report export")


@router.get("/health", response_model=Dict[str, Any])
async def analytics_health_check():
    """
    Health check endpoint for analytics and reporting system
    """
    try:
        return {
            "status": "healthy",
            "service": "analytics-reporting",
            "timestamp": datetime.now(),
            "version": "1.0.0",
            "components": {
                "usage_analytics": "operational",
                "trend_analysis": "operational",
                "roi_calculation": "operational",
                "compliance_reporting": "operational",
                "performance_monitoring": "operational"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now()
        }