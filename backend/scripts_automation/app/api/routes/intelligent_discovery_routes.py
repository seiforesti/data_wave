from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import asyncio
from datetime import datetime

from app.core.deps import get_db_session, get_current_user
from app.services.intelligent_discovery_service import IntelligentDiscoveryService
from app.services.enterprise_catalog_service import EnterpriseCatalogService
from app.models.advanced_catalog_models import CatalogEntry, DataAsset, DiscoveryTask
from app.models.scan_models import DataSource
from app.models.auth_models import User

router = APIRouter(prefix="/intelligent-discovery", tags=["Intelligent Discovery"])

# Pydantic Models for API
class DiscoveryRequest(BaseModel):
    data_source_ids: Optional[List[int]] = []
    discovery_types: Optional[List[str]] = ["schema", "content", "relationships", "quality"]
    discovery_depth: Optional[str] = "comprehensive"  # basic, standard, comprehensive, deep
    include_ai_insights: Optional[bool] = True
    include_lineage_detection: Optional[bool] = True
    include_quality_assessment: Optional[bool] = True
    schedule_recurring: Optional[bool] = False
    notification_settings: Optional[Dict[str, Any]] = {}

class SchemaDiscoveryRequest(BaseModel):
    data_source_id: int
    include_samples: Optional[bool] = True
    include_statistics: Optional[bool] = True
    include_relationships: Optional[bool] = True
    max_tables: Optional[int] = 1000
    max_columns_per_table: Optional[int] = 500

class ContentProfilingRequest(BaseModel):
    asset_ids: List[int]
    profiling_depth: Optional[str] = "standard"  # basic, standard, comprehensive
    include_patterns: Optional[bool] = True
    include_anomalies: Optional[bool] = True
    include_classifications: Optional[bool] = True
    sample_size: Optional[int] = 10000

class RelationshipDiscoveryRequest(BaseModel):
    source_asset_ids: Optional[List[int]] = []
    relationship_types: Optional[List[str]] = ["foreign_key", "semantic", "usage", "lineage"]
    confidence_threshold: Optional[float] = 0.7
    max_depth: Optional[int] = 5
    include_cross_source: Optional[bool] = True

class AutoCatalogingRequest(BaseModel):
    data_source_ids: List[int]
    cataloging_rules: Optional[Dict[str, Any]] = {}
    auto_classify: Optional[bool] = True
    auto_tag: Optional[bool] = True
    auto_lineage: Optional[bool] = True
    quality_gates: Optional[Dict[str, Any]] = {}
    approval_required: Optional[bool] = False

@router.post("/discover", response_model=Dict[str, Any])
async def start_intelligent_discovery(
    request: DiscoveryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Start comprehensive intelligent discovery process across data sources
    """
    try:
        # Validate data sources
        if request.data_source_ids:
            data_sources = db.query(DataSource).filter(
                DataSource.id.in_(request.data_source_ids)
            ).all()
            if len(data_sources) != len(request.data_source_ids):
                raise HTTPException(status_code=404, detail="Some data sources not found")
        else:
            # Discover all available data sources
            data_sources = db.query(DataSource).filter(
                DataSource.status == "active"
            ).all()
            request.data_source_ids = [ds.id for ds in data_sources]

        # Create discovery task
        discovery_task = await IntelligentDiscoveryService.create_discovery_task(
            db=db,
            data_source_ids=request.data_source_ids,
            discovery_types=request.discovery_types,
            discovery_depth=request.discovery_depth,
            user_id=current_user.id,
            settings={
                "include_ai_insights": request.include_ai_insights,
                "include_lineage_detection": request.include_lineage_detection,
                "include_quality_assessment": request.include_quality_assessment,
                "schedule_recurring": request.schedule_recurring,
                "notification_settings": request.notification_settings
            }
        )

        # Start discovery process in background
        background_tasks.add_task(
            IntelligentDiscoveryService.orchestrate_discovery,
            db=db,
            task_id=discovery_task["id"],
            data_source_ids=request.data_source_ids,
            discovery_types=request.discovery_types,
            discovery_depth=request.discovery_depth,
            settings=discovery_task["settings"]
        )

        # Get initial estimates
        estimates = await IntelligentDiscoveryService.estimate_discovery_effort(
            db=db,
            data_source_ids=request.data_source_ids,
            discovery_types=request.discovery_types,
            discovery_depth=request.discovery_depth
        )

        return {
            "success": True,
            "task_id": discovery_task["id"],
            "status": "started",
            "data_sources_count": len(request.data_source_ids),
            "discovery_types": request.discovery_types,
            "estimates": estimates,
            "message": "Intelligent discovery process started",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Discovery start failed: {str(e)}")

@router.get("/tasks/{task_id}/status", response_model=Dict[str, Any])
async def get_discovery_task_status(
    task_id: str,
    include_details: bool = Query(True, description="Include detailed progress information"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get the status and progress of a discovery task
    """
    try:
        # Get task status
        task_status = await IntelligentDiscoveryService.get_task_status(
            db=db,
            task_id=task_id,
            user_id=current_user.id
        )

        if not task_status:
            raise HTTPException(status_code=404, detail="Discovery task not found")

        # Get detailed progress if requested
        progress_details = {}
        if include_details:
            progress_details = await IntelligentDiscoveryService.get_task_progress_details(
                db=db,
                task_id=task_id
            )

        # Get discovered assets summary
        discovered_assets = await IntelligentDiscoveryService.get_discovered_assets_summary(
            db=db,
            task_id=task_id
        )

        # Get any issues or warnings
        issues = await IntelligentDiscoveryService.get_task_issues(
            db=db,
            task_id=task_id
        )

        return {
            "success": True,
            "task_id": task_id,
            "status": task_status["status"],
            "progress": task_status["progress"],
            "progress_details": progress_details,
            "discovered_assets": discovered_assets,
            "issues": issues,
            "started_at": task_status["started_at"],
            "estimated_completion": task_status.get("estimated_completion"),
            "completed_at": task_status.get("completed_at"),
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get task status: {str(e)}")

@router.post("/schema-discovery", response_model=Dict[str, Any])
async def discover_schema(
    request: SchemaDiscoveryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Perform detailed schema discovery for a specific data source
    """
    try:
        # Validate data source
        data_source = db.query(DataSource).filter(
            DataSource.id == request.data_source_id
        ).first()
        
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")

        # Start schema discovery
        discovery_result = await IntelligentDiscoveryService.discover_schema(
            db=db,
            data_source_id=request.data_source_id,
            include_samples=request.include_samples,
            include_statistics=request.include_statistics,
            include_relationships=request.include_relationships,
            max_tables=request.max_tables,
            max_columns_per_table=request.max_columns_per_table,
            user_id=current_user.id
        )

        # Analyze schema patterns
        schema_patterns = await IntelligentDiscoveryService.analyze_schema_patterns(
            db=db,
            schema_data=discovery_result["schema_data"]
        )

        # Generate schema insights
        schema_insights = await IntelligentDiscoveryService.generate_schema_insights(
            db=db,
            schema_data=discovery_result["schema_data"],
            patterns=schema_patterns
        )

        return {
            "success": True,
            "data_source_id": request.data_source_id,
            "data_source_name": data_source.name,
            "discovery_result": discovery_result,
            "schema_patterns": schema_patterns,
            "schema_insights": schema_insights,
            "discovery_summary": {
                "tables_discovered": discovery_result.get("tables_count", 0),
                "columns_discovered": discovery_result.get("columns_count", 0),
                "relationships_found": discovery_result.get("relationships_count", 0),
                "patterns_detected": len(schema_patterns)
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema discovery failed: {str(e)}")

@router.post("/content-profiling", response_model=Dict[str, Any])
async def profile_content(
    request: ContentProfilingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Perform comprehensive content profiling for catalog assets
    """
    try:
        # Validate assets
        assets = db.query(CatalogEntry).filter(
            CatalogEntry.id.in_(request.asset_ids)
        ).all()
        
        if len(assets) != len(request.asset_ids):
            raise HTTPException(status_code=404, detail="Some assets not found")

        # Start content profiling
        profiling_results = []
        for asset in assets:
            profile_result = await IntelligentDiscoveryService.profile_content(
                db=db,
                asset_id=asset.id,
                profiling_depth=request.profiling_depth,
                include_patterns=request.include_patterns,
                include_anomalies=request.include_anomalies,
                include_classifications=request.include_classifications,
                sample_size=request.sample_size,
                user_id=current_user.id
            )
            profiling_results.append(profile_result)

        # Aggregate profiling insights
        aggregated_insights = await IntelligentDiscoveryService.aggregate_profiling_insights(
            db=db,
            profiling_results=profiling_results
        )

        # Generate recommendations
        recommendations = await IntelligentDiscoveryService.generate_profiling_recommendations(
            db=db,
            profiling_results=profiling_results,
            insights=aggregated_insights
        )

        return {
            "success": True,
            "assets_profiled": len(request.asset_ids),
            "profiling_results": profiling_results,
            "aggregated_insights": aggregated_insights,
            "recommendations": recommendations,
            "profiling_summary": {
                "total_records_analyzed": sum([r.get("records_analyzed", 0) for r in profiling_results]),
                "patterns_detected": sum([len(r.get("patterns", [])) for r in profiling_results]),
                "anomalies_found": sum([len(r.get("anomalies", [])) for r in profiling_results]),
                "classifications_applied": sum([len(r.get("classifications", [])) for r in profiling_results])
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content profiling failed: {str(e)}")

@router.post("/relationship-discovery", response_model=Dict[str, Any])
async def discover_relationships(
    request: RelationshipDiscoveryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Discover relationships between data assets using AI analysis
    """
    try:
        # Get source assets
        if request.source_asset_ids:
            source_assets = db.query(CatalogEntry).filter(
                CatalogEntry.id.in_(request.source_asset_ids)
            ).all()
        else:
            # Discover relationships across all assets
            source_assets = db.query(CatalogEntry).filter(
                CatalogEntry.status == "active"
            ).limit(1000).all()  # Limit for performance

        # Start relationship discovery
        relationship_results = await IntelligentDiscoveryService.discover_relationships(
            db=db,
            source_assets=[asset.id for asset in source_assets],
            relationship_types=request.relationship_types,
            confidence_threshold=request.confidence_threshold,
            max_depth=request.max_depth,
            include_cross_source=request.include_cross_source,
            user_id=current_user.id
        )

        # Analyze relationship patterns
        relationship_patterns = await IntelligentDiscoveryService.analyze_relationship_patterns(
            db=db,
            relationships=relationship_results["relationships"]
        )

        # Build relationship graph
        relationship_graph = await IntelligentDiscoveryService.build_relationship_graph(
            db=db,
            relationships=relationship_results["relationships"]
        )

        # Generate relationship insights
        relationship_insights = await IntelligentDiscoveryService.generate_relationship_insights(
            db=db,
            relationships=relationship_results["relationships"],
            patterns=relationship_patterns,
            graph=relationship_graph
        )

        return {
            "success": True,
            "source_assets_count": len(source_assets),
            "relationship_results": relationship_results,
            "relationship_patterns": relationship_patterns,
            "relationship_graph": relationship_graph,
            "relationship_insights": relationship_insights,
            "discovery_summary": {
                "relationships_found": len(relationship_results["relationships"]),
                "relationship_types": list(set([r["type"] for r in relationship_results["relationships"]])),
                "confidence_distribution": relationship_results.get("confidence_distribution", {}),
                "patterns_detected": len(relationship_patterns)
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Relationship discovery failed: {str(e)}")

@router.post("/auto-cataloging", response_model=Dict[str, Any])
async def start_auto_cataloging(
    request: AutoCatalogingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Start automated cataloging process with AI-powered asset creation and tagging
    """
    try:
        # Validate data sources
        data_sources = db.query(DataSource).filter(
            DataSource.id.in_(request.data_source_ids)
        ).all()
        
        if len(data_sources) != len(request.data_source_ids):
            raise HTTPException(status_code=404, detail="Some data sources not found")

        # Create cataloging task
        cataloging_task = await IntelligentDiscoveryService.create_cataloging_task(
            db=db,
            data_source_ids=request.data_source_ids,
            cataloging_rules=request.cataloging_rules,
            auto_classify=request.auto_classify,
            auto_tag=request.auto_tag,
            auto_lineage=request.auto_lineage,
            quality_gates=request.quality_gates,
            approval_required=request.approval_required,
            user_id=current_user.id
        )

        # Start cataloging process in background
        background_tasks.add_task(
            IntelligentDiscoveryService.execute_auto_cataloging,
            db=db,
            task_id=cataloging_task["id"],
            data_source_ids=request.data_source_ids,
            settings=cataloging_task["settings"]
        )

        # Get cataloging estimates
        estimates = await IntelligentDiscoveryService.estimate_cataloging_effort(
            db=db,
            data_source_ids=request.data_source_ids,
            cataloging_rules=request.cataloging_rules
        )

        return {
            "success": True,
            "task_id": cataloging_task["id"],
            "status": "started",
            "data_sources_count": len(request.data_source_ids),
            "cataloging_settings": {
                "auto_classify": request.auto_classify,
                "auto_tag": request.auto_tag,
                "auto_lineage": request.auto_lineage,
                "approval_required": request.approval_required
            },
            "estimates": estimates,
            "message": "Auto-cataloging process started",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-cataloging start failed: {str(e)}")

@router.get("/recommendations", response_model=Dict[str, Any])
async def get_discovery_recommendations(
    data_source_id: Optional[int] = Query(None, description="Filter by data source"),
    recommendation_type: Optional[str] = Query(None, description="Filter by recommendation type"),
    priority: Optional[str] = Query(None, description="Filter by priority level"),
    limit: int = Query(20, description="Maximum recommendations to return"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-powered discovery recommendations based on current catalog state
    """
    try:
        # Get discovery recommendations
        recommendations = await IntelligentDiscoveryService.get_discovery_recommendations(
            db=db,
            data_source_id=data_source_id,
            recommendation_type=recommendation_type,
            priority=priority,
            limit=limit,
            user_id=current_user.id
        )

        # Get recommendation categories
        categories = await IntelligentDiscoveryService.get_recommendation_categories(
            db=db,
            recommendations=recommendations
        )

        # Get actionable insights
        actionable_insights = await IntelligentDiscoveryService.get_actionable_insights(
            db=db,
            recommendations=recommendations
        )

        return {
            "success": True,
            "recommendations": recommendations,
            "categories": categories,
            "actionable_insights": actionable_insights,
            "recommendation_summary": {
                "total_recommendations": len(recommendations),
                "high_priority": len([r for r in recommendations if r.get("priority") == "high"]),
                "medium_priority": len([r for r in recommendations if r.get("priority") == "medium"]),
                "low_priority": len([r for r in recommendations if r.get("priority") == "low"])
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@router.get("/insights", response_model=Dict[str, Any])
async def get_discovery_insights(
    time_range: str = Query("30d", description="Time range for insights"),
    insight_types: Optional[str] = Query(None, description="Comma-separated insight types"),
    include_trends: bool = Query(True, description="Include trend analysis"),
    include_predictions: bool = Query(False, description="Include predictive insights"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive discovery insights and analytics
    """
    try:
        insight_type_list = insight_types.split(",") if insight_types else None

        # Get discovery insights
        insights = await IntelligentDiscoveryService.get_discovery_insights(
            db=db,
            time_range=time_range,
            insight_types=insight_type_list,
            user_id=current_user.id
        )

        # Get trends if requested
        trends = {}
        if include_trends:
            trends = await IntelligentDiscoveryService.get_discovery_trends(
                db=db,
                time_range=time_range,
                insight_types=insight_type_list
            )

        # Get predictions if requested
        predictions = {}
        if include_predictions:
            predictions = await IntelligentDiscoveryService.get_discovery_predictions(
                db=db,
                time_range=time_range,
                historical_insights=insights
            )

        # Get discovery statistics
        statistics = await IntelligentDiscoveryService.get_discovery_statistics(
            db=db,
            time_range=time_range
        )

        return {
            "success": True,
            "time_range": time_range,
            "insights": insights,
            "trends": trends,
            "predictions": predictions,
            "statistics": statistics,
            "insight_summary": {
                "total_insights": len(insights),
                "insight_types": list(set([i.get("type") for i in insights])),
                "confidence_average": sum([i.get("confidence", 0) for i in insights]) / len(insights) if insights else 0
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get discovery insights: {str(e)}")

@router.post("/tasks/{task_id}/cancel", response_model=Dict[str, Any])
async def cancel_discovery_task(
    task_id: str,
    reason: Optional[str] = Query(None, description="Reason for cancellation"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a running discovery task
    """
    try:
        # Cancel the task
        cancellation_result = await IntelligentDiscoveryService.cancel_task(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            reason=reason
        )

        if not cancellation_result["success"]:
            raise HTTPException(status_code=400, detail=cancellation_result["message"])

        return {
            "success": True,
            "task_id": task_id,
            "status": "cancelled",
            "reason": reason,
            "cancellation_details": cancellation_result,
            "message": "Discovery task cancelled successfully",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel task: {str(e)}")

@router.get("/tasks", response_model=Dict[str, Any])
async def list_discovery_tasks(
    status: Optional[str] = Query(None, description="Filter by task status"),
    task_type: Optional[str] = Query(None, description="Filter by task type"),
    limit: int = Query(50, description="Maximum tasks to return"),
    offset: int = Query(0, description="Pagination offset"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    List discovery tasks with filtering and pagination
    """
    try:
        # Get tasks
        tasks = await IntelligentDiscoveryService.list_tasks(
            db=db,
            user_id=current_user.id if not current_user.is_admin else None,
            status=status,
            task_type=task_type,
            limit=limit,
            offset=offset
        )

        # Get task statistics
        task_stats = await IntelligentDiscoveryService.get_task_statistics(
            db=db,
            user_id=current_user.id if not current_user.is_admin else None
        )

        return {
            "success": True,
            "tasks": tasks,
            "task_statistics": task_stats,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": task_stats.get("total_tasks", 0),
                "has_more": len(tasks) == limit
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list tasks: {str(e)}")

@router.get("/health", response_model=Dict[str, Any])
async def get_discovery_health(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get discovery system health and performance metrics
    """
    try:
        # Get system health
        health_metrics = await IntelligentDiscoveryService.get_system_health(db=db)

        # Get performance metrics
        performance_metrics = await IntelligentDiscoveryService.get_performance_metrics(db=db)

        # Get resource utilization
        resource_metrics = await IntelligentDiscoveryService.get_resource_utilization(db=db)

        return {
            "success": True,
            "health_status": health_metrics.get("overall_status", "unknown"),
            "health_metrics": health_metrics,
            "performance_metrics": performance_metrics,
            "resource_metrics": resource_metrics,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get discovery health: {str(e)}")