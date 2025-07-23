from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import asyncio
from datetime import datetime, timedelta

from app.core.deps import get_db_session, get_current_user
from app.services.enterprise_catalog_service import EnterpriseCatalogService
from app.services.catalog_analytics_service import CatalogAnalyticsService
from app.models.advanced_catalog_models import CatalogEntry, DataAsset
from app.models.auth_models import User

router = APIRouter(prefix="/catalog-analytics", tags=["Catalog Analytics"])

# Pydantic Models for API
class AnalyticsRequest(BaseModel):
    time_range: Optional[str] = "30d"  # 7d, 30d, 90d, 1y
    metrics: Optional[List[str]] = []  # specific metrics to include
    filters: Optional[Dict[str, Any]] = {}
    include_trends: Optional[bool] = True
    include_predictions: Optional[bool] = False

class UsageAnalyticsRequest(BaseModel):
    asset_ids: Optional[List[int]] = []
    time_range: Optional[str] = "30d"
    granularity: Optional[str] = "daily"  # hourly, daily, weekly, monthly
    include_user_breakdown: Optional[bool] = True

class QualityAnalyticsRequest(BaseModel):
    data_source_ids: Optional[List[int]] = []
    quality_dimensions: Optional[List[str]] = []  # completeness, accuracy, consistency, etc.
    time_range: Optional[str] = "30d"
    include_recommendations: Optional[bool] = True

class LineageAnalyticsRequest(BaseModel):
    asset_id: int
    depth: Optional[int] = 5
    direction: Optional[str] = "both"  # upstream, downstream, both
    include_impact_analysis: Optional[bool] = True

@router.get("/overview", response_model=Dict[str, Any])
async def get_catalog_overview(
    time_range: str = Query("30d", description="Time range for analytics"),
    include_trends: bool = Query(True, description="Include trend analysis"),
    include_health: bool = Query(True, description="Include catalog health metrics"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive catalog overview with key metrics and trends
    """
    try:
        # Get catalog statistics
        catalog_stats = await CatalogAnalyticsService.get_catalog_statistics(
            db=db,
            time_range=time_range
        )

        # Get catalog health metrics
        health_metrics = {}
        if include_health:
            health_metrics = await CatalogAnalyticsService.get_catalog_health(
                db=db,
                time_range=time_range
            )

        # Get trends if requested
        trends = {}
        if include_trends:
            trends = await CatalogAnalyticsService.get_catalog_trends(
                db=db,
                time_range=time_range
            )

        # Get top assets by usage
        top_assets = await CatalogAnalyticsService.get_top_assets_by_usage(
            db=db,
            time_range=time_range,
            limit=10
        )

        # Get data quality summary
        quality_summary = await CatalogAnalyticsService.get_quality_summary(
            db=db,
            time_range=time_range
        )

        return {
            "success": True,
            "time_range": time_range,
            "catalog_statistics": catalog_stats,
            "health_metrics": health_metrics,
            "trends": trends,
            "top_assets": top_assets,
            "quality_summary": quality_summary,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get catalog overview: {str(e)}")

@router.post("/usage-analytics", response_model=Dict[str, Any])
async def get_usage_analytics(
    request: UsageAnalyticsRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed usage analytics for catalog assets
    """
    try:
        # Get usage analytics
        usage_analytics = await CatalogAnalyticsService.get_usage_analytics(
            db=db,
            asset_ids=request.asset_ids,
            time_range=request.time_range,
            granularity=request.granularity
        )

        # Get user breakdown if requested
        user_breakdown = {}
        if request.include_user_breakdown:
            user_breakdown = await CatalogAnalyticsService.get_usage_by_user(
                db=db,
                asset_ids=request.asset_ids,
                time_range=request.time_range
            )

        # Get usage patterns
        usage_patterns = await CatalogAnalyticsService.analyze_usage_patterns(
            db=db,
            asset_ids=request.asset_ids,
            time_range=request.time_range
        )

        # Get access frequency analysis
        access_frequency = await CatalogAnalyticsService.get_access_frequency_analysis(
            db=db,
            asset_ids=request.asset_ids,
            time_range=request.time_range
        )

        return {
            "success": True,
            "request_parameters": request.dict(),
            "usage_analytics": usage_analytics,
            "user_breakdown": user_breakdown,
            "usage_patterns": usage_patterns,
            "access_frequency": access_frequency,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get usage analytics: {str(e)}")

@router.post("/quality-analytics", response_model=Dict[str, Any])
async def get_quality_analytics(
    request: QualityAnalyticsRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive data quality analytics across catalog assets
    """
    try:
        # Get quality analytics
        quality_analytics = await CatalogAnalyticsService.get_quality_analytics(
            db=db,
            data_source_ids=request.data_source_ids,
            quality_dimensions=request.quality_dimensions,
            time_range=request.time_range
        )

        # Get quality trends
        quality_trends = await CatalogAnalyticsService.get_quality_trends(
            db=db,
            data_source_ids=request.data_source_ids,
            time_range=request.time_range
        )

        # Get quality recommendations if requested
        recommendations = []
        if request.include_recommendations:
            recommendations = await CatalogAnalyticsService.get_quality_recommendations(
                db=db,
                data_source_ids=request.data_source_ids,
                quality_analytics=quality_analytics
            )

        # Get quality issues summary
        issues_summary = await CatalogAnalyticsService.get_quality_issues_summary(
            db=db,
            data_source_ids=request.data_source_ids,
            time_range=request.time_range
        )

        return {
            "success": True,
            "request_parameters": request.dict(),
            "quality_analytics": quality_analytics,
            "quality_trends": quality_trends,
            "recommendations": recommendations,
            "issues_summary": issues_summary,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get quality analytics: {str(e)}")

@router.post("/lineage-analytics", response_model=Dict[str, Any])
async def get_lineage_analytics(
    request: LineageAnalyticsRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive lineage analytics and impact analysis
    """
    try:
        # Get lineage analytics
        lineage_analytics = await CatalogAnalyticsService.get_lineage_analytics(
            db=db,
            asset_id=request.asset_id,
            depth=request.depth,
            direction=request.direction
        )

        # Get impact analysis if requested
        impact_analysis = {}
        if request.include_impact_analysis:
            impact_analysis = await CatalogAnalyticsService.get_impact_analysis(
                db=db,
                asset_id=request.asset_id,
                depth=request.depth
            )

        # Get lineage complexity metrics
        complexity_metrics = await CatalogAnalyticsService.get_lineage_complexity(
            db=db,
            asset_id=request.asset_id,
            depth=request.depth
        )

        # Get critical path analysis
        critical_paths = await CatalogAnalyticsService.get_critical_paths(
            db=db,
            asset_id=request.asset_id,
            depth=request.depth
        )

        return {
            "success": True,
            "request_parameters": request.dict(),
            "lineage_analytics": lineage_analytics,
            "impact_analysis": impact_analysis,
            "complexity_metrics": complexity_metrics,
            "critical_paths": critical_paths,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get lineage analytics: {str(e)}")

@router.get("/governance-metrics", response_model=Dict[str, Any])
async def get_governance_metrics(
    time_range: str = Query("30d", description="Time range for metrics"),
    include_compliance: bool = Query(True, description="Include compliance metrics"),
    include_security: bool = Query(True, description="Include security metrics"),
    include_privacy: bool = Query(True, description="Include privacy metrics"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive governance metrics across the catalog
    """
    try:
        # Get governance overview
        governance_overview = await CatalogAnalyticsService.get_governance_overview(
            db=db,
            time_range=time_range
        )

        # Get compliance metrics if requested
        compliance_metrics = {}
        if include_compliance:
            compliance_metrics = await CatalogAnalyticsService.get_compliance_metrics(
                db=db,
                time_range=time_range
            )

        # Get security metrics if requested
        security_metrics = {}
        if include_security:
            security_metrics = await CatalogAnalyticsService.get_security_metrics(
                db=db,
                time_range=time_range
            )

        # Get privacy metrics if requested
        privacy_metrics = {}
        if include_privacy:
            privacy_metrics = await CatalogAnalyticsService.get_privacy_metrics(
                db=db,
                time_range=time_range
            )

        # Get governance trends
        governance_trends = await CatalogAnalyticsService.get_governance_trends(
            db=db,
            time_range=time_range
        )

        return {
            "success": True,
            "time_range": time_range,
            "governance_overview": governance_overview,
            "compliance_metrics": compliance_metrics,
            "security_metrics": security_metrics,
            "privacy_metrics": privacy_metrics,
            "governance_trends": governance_trends,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get governance metrics: {str(e)}")

@router.get("/discovery-insights", response_model=Dict[str, Any])
async def get_discovery_insights(
    time_range: str = Query("30d", description="Time range for insights"),
    include_patterns: bool = Query(True, description="Include pattern analysis"),
    include_anomalies: bool = Query(True, description="Include anomaly detection"),
    limit: int = Query(50, description="Maximum insights to return"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-powered discovery insights and patterns from catalog data
    """
    try:
        # Get discovery insights
        discovery_insights = await CatalogAnalyticsService.get_discovery_insights(
            db=db,
            time_range=time_range,
            limit=limit
        )

        # Get pattern analysis if requested
        patterns = {}
        if include_patterns:
            patterns = await CatalogAnalyticsService.analyze_catalog_patterns(
                db=db,
                time_range=time_range
            )

        # Get anomaly detection if requested
        anomalies = []
        if include_anomalies:
            anomalies = await CatalogAnalyticsService.detect_catalog_anomalies(
                db=db,
                time_range=time_range
            )

        # Get schema evolution insights
        schema_evolution = await CatalogAnalyticsService.get_schema_evolution_insights(
            db=db,
            time_range=time_range
        )

        # Get data drift analysis
        data_drift = await CatalogAnalyticsService.analyze_data_drift(
            db=db,
            time_range=time_range
        )

        return {
            "success": True,
            "time_range": time_range,
            "discovery_insights": discovery_insights,
            "patterns": patterns,
            "anomalies": anomalies,
            "schema_evolution": schema_evolution,
            "data_drift": data_drift,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get discovery insights: {str(e)}")

@router.get("/performance-metrics", response_model=Dict[str, Any])
async def get_performance_metrics(
    time_range: str = Query("30d", description="Time range for metrics"),
    include_benchmarks: bool = Query(True, description="Include performance benchmarks"),
    include_optimization: bool = Query(True, description="Include optimization suggestions"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get catalog performance metrics and optimization insights
    """
    try:
        # Get performance metrics
        performance_metrics = await CatalogAnalyticsService.get_performance_metrics(
            db=db,
            time_range=time_range
        )

        # Get benchmarks if requested
        benchmarks = {}
        if include_benchmarks:
            benchmarks = await CatalogAnalyticsService.get_performance_benchmarks(
                db=db,
                time_range=time_range
            )

        # Get optimization suggestions if requested
        optimization_suggestions = []
        if include_optimization:
            optimization_suggestions = await CatalogAnalyticsService.get_optimization_suggestions(
                db=db,
                performance_metrics=performance_metrics
            )

        # Get resource utilization
        resource_utilization = await CatalogAnalyticsService.get_resource_utilization(
            db=db,
            time_range=time_range
        )

        # Get bottleneck analysis
        bottlenecks = await CatalogAnalyticsService.analyze_bottlenecks(
            db=db,
            time_range=time_range
        )

        return {
            "success": True,
            "time_range": time_range,
            "performance_metrics": performance_metrics,
            "benchmarks": benchmarks,
            "optimization_suggestions": optimization_suggestions,
            "resource_utilization": resource_utilization,
            "bottlenecks": bottlenecks,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")

@router.get("/business-value", response_model=Dict[str, Any])
async def get_business_value_analytics(
    time_range: str = Query("30d", description="Time range for analytics"),
    include_roi: bool = Query(True, description="Include ROI analysis"),
    include_impact: bool = Query(True, description="Include business impact metrics"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get business value analytics for catalog assets
    """
    try:
        # Get business value metrics
        business_value = await CatalogAnalyticsService.get_business_value_metrics(
            db=db,
            time_range=time_range
        )

        # Get ROI analysis if requested
        roi_analysis = {}
        if include_roi:
            roi_analysis = await CatalogAnalyticsService.get_roi_analysis(
                db=db,
                time_range=time_range
            )

        # Get business impact if requested
        business_impact = {}
        if include_impact:
            business_impact = await CatalogAnalyticsService.get_business_impact_metrics(
                db=db,
                time_range=time_range
            )

        # Get cost analysis
        cost_analysis = await CatalogAnalyticsService.get_cost_analysis(
            db=db,
            time_range=time_range
        )

        # Get value creation opportunities
        value_opportunities = await CatalogAnalyticsService.identify_value_opportunities(
            db=db,
            time_range=time_range
        )

        return {
            "success": True,
            "time_range": time_range,
            "business_value": business_value,
            "roi_analysis": roi_analysis,
            "business_impact": business_impact,
            "cost_analysis": cost_analysis,
            "value_opportunities": value_opportunities,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get business value analytics: {str(e)}")

@router.post("/custom-analytics", response_model=Dict[str, Any])
async def run_custom_analytics(
    request: AnalyticsRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Run custom analytics with user-defined parameters and metrics
    """
    try:
        # Validate custom metrics
        validated_metrics = await CatalogAnalyticsService.validate_custom_metrics(
            metrics=request.metrics
        )

        # Run custom analytics
        custom_results = await CatalogAnalyticsService.run_custom_analytics(
            db=db,
            time_range=request.time_range,
            metrics=validated_metrics,
            filters=request.filters
        )

        # Get trends if requested
        trends = {}
        if request.include_trends:
            trends = await CatalogAnalyticsService.get_custom_trends(
                db=db,
                metrics=validated_metrics,
                time_range=request.time_range,
                filters=request.filters
            )

        # Get predictions if requested
        predictions = {}
        if request.include_predictions:
            predictions = await CatalogAnalyticsService.generate_predictions(
                db=db,
                metrics=validated_metrics,
                historical_data=custom_results,
                time_range=request.time_range
            )

        return {
            "success": True,
            "request_parameters": request.dict(),
            "validated_metrics": validated_metrics,
            "results": custom_results,
            "trends": trends,
            "predictions": predictions,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Custom analytics failed: {str(e)}")

@router.get("/export/{analytics_type}", response_model=Dict[str, Any])
async def export_analytics(
    analytics_type: str,
    format: str = Query("json", description="Export format: json, csv, excel, pdf"),
    time_range: str = Query("30d", description="Time range for export"),
    filters: Optional[str] = Query(None, description="Filters as JSON string"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Export analytics data in various formats
    """
    try:
        import json
        filter_dict = json.loads(filters) if filters else {}

        # Generate export data
        export_data = await CatalogAnalyticsService.generate_export_data(
            db=db,
            analytics_type=analytics_type,
            format=format,
            time_range=time_range,
            filters=filter_dict,
            user_id=current_user.id
        )

        # Create export file
        export_file = await CatalogAnalyticsService.create_export_file(
            data=export_data,
            format=format,
            analytics_type=analytics_type
        )

        return {
            "success": True,
            "analytics_type": analytics_type,
            "format": format,
            "export_file": export_file,
            "download_url": export_file.get("download_url"),
            "file_size": export_file.get("file_size"),
            "expires_at": export_file.get("expires_at"),
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")