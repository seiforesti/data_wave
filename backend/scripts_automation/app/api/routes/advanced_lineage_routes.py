from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import asyncio
from datetime import datetime

from app.core.deps import get_db_session, get_current_user
from app.services.advanced_lineage_service import AdvancedLineageService
from app.services.enterprise_catalog_service import EnterpriseCatalogService
from app.models.data_lineage_models import LineageGraph, LineageNode, LineageEdge
from app.models.advanced_catalog_models import CatalogEntry
from app.models.auth_models import User

router = APIRouter(prefix="/advanced-lineage", tags=["Advanced Lineage"])

# Pydantic Models for API
class LineageTraceRequest(BaseModel):
    asset_id: int
    direction: Optional[str] = "both"  # upstream, downstream, both
    max_depth: Optional[int] = 10
    include_transformations: Optional[bool] = True
    include_metadata: Optional[bool] = True
    include_quality_metrics: Optional[bool] = True
    filter_by_types: Optional[List[str]] = []
    confidence_threshold: Optional[float] = 0.5

class ImpactAnalysisRequest(BaseModel):
    source_asset_ids: List[int]
    analysis_type: Optional[str] = "comprehensive"  # basic, standard, comprehensive, deep
    include_downstream_impact: Optional[bool] = True
    include_business_impact: Optional[bool] = True
    include_cost_analysis: Optional[bool] = False
    max_depth: Optional[int] = 15
    scenario: Optional[str] = "change"  # change, failure, deletion, migration

class LineageComparisonRequest(BaseModel):
    baseline_asset_id: int
    comparison_asset_ids: List[int]
    comparison_type: Optional[str] = "structure"  # structure, quality, usage, evolution
    include_differences: Optional[bool] = True
    include_similarities: Optional[bool] = True
    detail_level: Optional[str] = "standard"  # basic, standard, detailed

class LineageValidationRequest(BaseModel):
    asset_ids: Optional[List[int]] = []
    validation_rules: Optional[List[str]] = ["completeness", "consistency", "accuracy"]
    include_recommendations: Optional[bool] = True
    auto_fix: Optional[bool] = False
    report_format: Optional[str] = "detailed"  # summary, detailed, comprehensive

@router.get("/trace/{asset_id}", response_model=Dict[str, Any])
async def trace_lineage(
    asset_id: int,
    direction: str = Query("both", description="Lineage direction: upstream, downstream, both"),
    max_depth: int = Query(10, description="Maximum traversal depth"),
    include_transformations: bool = Query(True, description="Include transformation details"),
    include_metadata: bool = Query(True, description="Include asset metadata"),
    include_quality: bool = Query(True, description="Include quality metrics"),
    format: str = Query("graph", description="Response format: graph, tree, list"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Trace comprehensive lineage for a specific asset with advanced analytics
    """
    try:
        # Validate asset
        asset = db.query(CatalogEntry).filter(CatalogEntry.id == asset_id).first()
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        # Trace lineage
        lineage_trace = await AdvancedLineageService.trace_comprehensive_lineage(
            db=db,
            asset_id=asset_id,
            direction=direction,
            max_depth=max_depth,
            include_transformations=include_transformations,
            include_metadata=include_metadata,
            include_quality_metrics=include_quality,
            user_id=current_user.id
        )

        # Generate lineage analytics
        lineage_analytics = await AdvancedLineageService.generate_lineage_analytics(
            db=db,
            lineage_data=lineage_trace,
            asset_id=asset_id
        )

        # Calculate lineage metrics
        lineage_metrics = await AdvancedLineageService.calculate_lineage_metrics(
            db=db,
            lineage_data=lineage_trace
        )

        # Format response based on requested format
        if format == "tree":
            formatted_lineage = await AdvancedLineageService.format_as_tree(
                lineage_data=lineage_trace,
                root_asset_id=asset_id
            )
        elif format == "list":
            formatted_lineage = await AdvancedLineageService.format_as_list(
                lineage_data=lineage_trace
            )
        else:  # graph format (default)
            formatted_lineage = lineage_trace

        return {
            "success": True,
            "asset_id": asset_id,
            "asset_name": asset.name,
            "direction": direction,
            "max_depth": max_depth,
            "lineage_data": formatted_lineage,
            "analytics": lineage_analytics,
            "metrics": lineage_metrics,
            "trace_summary": {
                "total_nodes": lineage_metrics.get("node_count", 0),
                "total_edges": lineage_metrics.get("edge_count", 0),
                "max_depth_reached": lineage_metrics.get("max_depth_reached", 0),
                "data_sources_involved": lineage_metrics.get("data_sources_count", 0)
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lineage tracing failed: {str(e)}")

@router.post("/impact-analysis", response_model=Dict[str, Any])
async def analyze_impact(
    request: ImpactAnalysisRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Perform comprehensive impact analysis for changes to data assets
    """
    try:
        # Validate source assets
        source_assets = db.query(CatalogEntry).filter(
            CatalogEntry.id.in_(request.source_asset_ids)
        ).all()
        
        if len(source_assets) != len(request.source_asset_ids):
            raise HTTPException(status_code=404, detail="Some source assets not found")

        # Perform impact analysis
        impact_analysis = await AdvancedLineageService.analyze_comprehensive_impact(
            db=db,
            source_asset_ids=request.source_asset_ids,
            analysis_type=request.analysis_type,
            include_downstream_impact=request.include_downstream_impact,
            include_business_impact=request.include_business_impact,
            include_cost_analysis=request.include_cost_analysis,
            max_depth=request.max_depth,
            scenario=request.scenario,
            user_id=current_user.id
        )

        # Calculate impact severity
        impact_severity = await AdvancedLineageService.calculate_impact_severity(
            db=db,
            impact_data=impact_analysis,
            scenario=request.scenario
        )

        # Generate impact recommendations
        recommendations = await AdvancedLineageService.generate_impact_recommendations(
            db=db,
            impact_analysis=impact_analysis,
            severity=impact_severity,
            scenario=request.scenario
        )

        # Create impact visualization data
        visualization_data = await AdvancedLineageService.create_impact_visualization(
            db=db,
            impact_analysis=impact_analysis,
            source_asset_ids=request.source_asset_ids
        )

        return {
            "success": True,
            "source_assets": [{"id": asset.id, "name": asset.name} for asset in source_assets],
            "scenario": request.scenario,
            "analysis_type": request.analysis_type,
            "impact_analysis": impact_analysis,
            "impact_severity": impact_severity,
            "recommendations": recommendations,
            "visualization_data": visualization_data,
            "impact_summary": {
                "total_affected_assets": impact_analysis.get("affected_assets_count", 0),
                "critical_impacts": impact_analysis.get("critical_impacts_count", 0),
                "business_processes_affected": impact_analysis.get("business_processes_count", 0),
                "estimated_recovery_time": impact_analysis.get("estimated_recovery_time", "unknown")
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impact analysis failed: {str(e)}")

@router.get("/graph-analytics/{asset_id}", response_model=Dict[str, Any])
async def get_graph_analytics(
    asset_id: int,
    analytics_types: str = Query("centrality,clustering,paths", description="Comma-separated analytics types"),
    include_communities: bool = Query(True, description="Include community detection"),
    include_bottlenecks: bool = Query(True, description="Include bottleneck analysis"),
    include_critical_paths: bool = Query(True, description="Include critical path analysis"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get advanced graph analytics for lineage networks
    """
    try:
        # Validate asset
        asset = db.query(CatalogEntry).filter(CatalogEntry.id == asset_id).first()
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        analytics_list = [a.strip() for a in analytics_types.split(",")]

        # Get lineage graph
        lineage_graph = await AdvancedLineageService.get_lineage_graph(
            db=db,
            asset_id=asset_id,
            max_depth=15
        )

        # Perform graph analytics
        graph_analytics = {}
        
        if "centrality" in analytics_list:
            graph_analytics["centrality"] = await AdvancedLineageService.calculate_centrality_metrics(
                db=db,
                graph=lineage_graph,
                asset_id=asset_id
            )

        if "clustering" in analytics_list:
            graph_analytics["clustering"] = await AdvancedLineageService.analyze_clustering_patterns(
                db=db,
                graph=lineage_graph
            )

        if "paths" in analytics_list:
            graph_analytics["paths"] = await AdvancedLineageService.analyze_path_patterns(
                db=db,
                graph=lineage_graph,
                asset_id=asset_id
            )

        # Community detection
        communities = []
        if include_communities:
            communities = await AdvancedLineageService.detect_communities(
                db=db,
                graph=lineage_graph
            )

        # Bottleneck analysis
        bottlenecks = []
        if include_bottlenecks:
            bottlenecks = await AdvancedLineageService.identify_bottlenecks(
                db=db,
                graph=lineage_graph
            )

        # Critical path analysis
        critical_paths = []
        if include_critical_paths:
            critical_paths = await AdvancedLineageService.find_critical_paths(
                db=db,
                graph=lineage_graph,
                asset_id=asset_id
            )

        # Generate insights
        graph_insights = await AdvancedLineageService.generate_graph_insights(
            db=db,
            analytics=graph_analytics,
            communities=communities,
            bottlenecks=bottlenecks,
            critical_paths=critical_paths
        )

        return {
            "success": True,
            "asset_id": asset_id,
            "asset_name": asset.name,
            "analytics_types": analytics_list,
            "graph_analytics": graph_analytics,
            "communities": communities,
            "bottlenecks": bottlenecks,
            "critical_paths": critical_paths,
            "graph_insights": graph_insights,
            "graph_summary": {
                "total_nodes": len(lineage_graph.get("nodes", [])),
                "total_edges": len(lineage_graph.get("edges", [])),
                "communities_found": len(communities),
                "bottlenecks_identified": len(bottlenecks),
                "critical_paths_found": len(critical_paths)
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph analytics failed: {str(e)}")

@router.post("/comparison", response_model=Dict[str, Any])
async def compare_lineages(
    request: LineageComparisonRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Compare lineage structures between assets for evolution analysis
    """
    try:
        # Validate assets
        all_asset_ids = [request.baseline_asset_id] + request.comparison_asset_ids
        assets = db.query(CatalogEntry).filter(
            CatalogEntry.id.in_(all_asset_ids)
        ).all()
        
        if len(assets) != len(all_asset_ids):
            raise HTTPException(status_code=404, detail="Some assets not found")

        # Get baseline lineage
        baseline_lineage = await AdvancedLineageService.get_lineage_graph(
            db=db,
            asset_id=request.baseline_asset_id,
            max_depth=10
        )

        # Get comparison lineages
        comparison_lineages = []
        for asset_id in request.comparison_asset_ids:
            lineage = await AdvancedLineageService.get_lineage_graph(
                db=db,
                asset_id=asset_id,
                max_depth=10
            )
            comparison_lineages.append({
                "asset_id": asset_id,
                "lineage": lineage
            })

        # Perform comparison analysis
        comparison_results = await AdvancedLineageService.compare_lineage_structures(
            db=db,
            baseline_lineage=baseline_lineage,
            comparison_lineages=comparison_lineages,
            comparison_type=request.comparison_type,
            include_differences=request.include_differences,
            include_similarities=request.include_similarities,
            detail_level=request.detail_level
        )

        # Generate comparison insights
        comparison_insights = await AdvancedLineageService.generate_comparison_insights(
            db=db,
            comparison_results=comparison_results,
            comparison_type=request.comparison_type
        )

        # Create evolution timeline
        evolution_timeline = await AdvancedLineageService.create_evolution_timeline(
            db=db,
            asset_ids=all_asset_ids,
            comparison_results=comparison_results
        )

        return {
            "success": True,
            "baseline_asset_id": request.baseline_asset_id,
            "comparison_asset_ids": request.comparison_asset_ids,
            "comparison_type": request.comparison_type,
            "comparison_results": comparison_results,
            "comparison_insights": comparison_insights,
            "evolution_timeline": evolution_timeline,
            "comparison_summary": {
                "assets_compared": len(request.comparison_asset_ids),
                "differences_found": len(comparison_results.get("differences", [])),
                "similarities_found": len(comparison_results.get("similarities", [])),
                "evolution_patterns": len(evolution_timeline.get("patterns", []))
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lineage comparison failed: {str(e)}")

@router.post("/validation", response_model=Dict[str, Any])
async def validate_lineage(
    request: LineageValidationRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Validate lineage data integrity and consistency
    """
    try:
        # Get assets to validate
        if request.asset_ids:
            assets = db.query(CatalogEntry).filter(
                CatalogEntry.id.in_(request.asset_ids)
            ).all()
            asset_ids = request.asset_ids
        else:
            # Validate all assets with lineage
            assets = db.query(CatalogEntry).filter(
                CatalogEntry.lineage_relationships.any()
            ).limit(1000).all()  # Limit for performance
            asset_ids = [asset.id for asset in assets]

        # Perform validation
        validation_results = await AdvancedLineageService.validate_lineage_integrity(
            db=db,
            asset_ids=asset_ids,
            validation_rules=request.validation_rules,
            user_id=current_user.id
        )

        # Generate recommendations if requested
        recommendations = []
        if request.include_recommendations:
            recommendations = await AdvancedLineageService.generate_validation_recommendations(
                db=db,
                validation_results=validation_results,
                auto_fix=request.auto_fix
            )

        # Auto-fix issues if requested and user has permission
        auto_fix_results = {}
        if request.auto_fix and current_user.is_admin:
            auto_fix_results = await AdvancedLineageService.auto_fix_lineage_issues(
                db=db,
                validation_results=validation_results,
                user_id=current_user.id
            )

        # Generate validation report
        validation_report = await AdvancedLineageService.generate_validation_report(
            db=db,
            validation_results=validation_results,
            recommendations=recommendations,
            auto_fix_results=auto_fix_results,
            report_format=request.report_format
        )

        return {
            "success": True,
            "assets_validated": len(asset_ids),
            "validation_rules": request.validation_rules,
            "validation_results": validation_results,
            "recommendations": recommendations,
            "auto_fix_results": auto_fix_results,
            "validation_report": validation_report,
            "validation_summary": {
                "total_issues": validation_results.get("total_issues", 0),
                "critical_issues": validation_results.get("critical_issues", 0),
                "warnings": validation_results.get("warnings", 0),
                "auto_fixed": len(auto_fix_results.get("fixed_issues", [])) if auto_fix_results else 0
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lineage validation failed: {str(e)}")

@router.get("/real-time/{asset_id}", response_model=Dict[str, Any])
async def get_realtime_lineage(
    asset_id: int,
    include_live_metrics: bool = Query(True, description="Include live performance metrics"),
    include_alerts: bool = Query(True, description="Include active alerts"),
    monitoring_window: str = Query("1h", description="Monitoring time window"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get real-time lineage monitoring and live metrics
    """
    try:
        # Validate asset
        asset = db.query(CatalogEntry).filter(CatalogEntry.id == asset_id).first()
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        # Get real-time lineage status
        realtime_status = await AdvancedLineageService.get_realtime_lineage_status(
            db=db,
            asset_id=asset_id,
            monitoring_window=monitoring_window
        )

        # Get live metrics if requested
        live_metrics = {}
        if include_live_metrics:
            live_metrics = await AdvancedLineageService.get_live_lineage_metrics(
                db=db,
                asset_id=asset_id,
                monitoring_window=monitoring_window
            )

        # Get active alerts if requested
        active_alerts = []
        if include_alerts:
            active_alerts = await AdvancedLineageService.get_active_lineage_alerts(
                db=db,
                asset_id=asset_id
            )

        # Get lineage health score
        health_score = await AdvancedLineageService.calculate_lineage_health_score(
            db=db,
            asset_id=asset_id,
            realtime_status=realtime_status,
            live_metrics=live_metrics
        )

        # Get streaming updates configuration
        streaming_config = await AdvancedLineageService.get_streaming_configuration(
            db=db,
            asset_id=asset_id,
            user_id=current_user.id
        )

        return {
            "success": True,
            "asset_id": asset_id,
            "asset_name": asset.name,
            "monitoring_window": monitoring_window,
            "realtime_status": realtime_status,
            "live_metrics": live_metrics,
            "active_alerts": active_alerts,
            "health_score": health_score,
            "streaming_config": streaming_config,
            "monitoring_summary": {
                "status": realtime_status.get("overall_status", "unknown"),
                "active_alerts_count": len(active_alerts),
                "health_score": health_score.get("overall_score", 0),
                "last_updated": realtime_status.get("last_updated")
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Real-time lineage monitoring failed: {str(e)}")

@router.get("/dependencies/{asset_id}", response_model=Dict[str, Any])
async def get_dependency_analysis(
    asset_id: int,
    dependency_type: str = Query("all", description="Dependency type: all, critical, optional"),
    include_risk_analysis: bool = Query(True, description="Include risk analysis"),
    include_optimization: bool = Query(True, description="Include optimization suggestions"),
    max_depth: int = Query(8, description="Maximum dependency depth"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive dependency analysis for an asset
    """
    try:
        # Validate asset
        asset = db.query(CatalogEntry).filter(CatalogEntry.id == asset_id).first()
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        # Analyze dependencies
        dependency_analysis = await AdvancedLineageService.analyze_dependencies(
            db=db,
            asset_id=asset_id,
            dependency_type=dependency_type,
            max_depth=max_depth
        )

        # Risk analysis if requested
        risk_analysis = {}
        if include_risk_analysis:
            risk_analysis = await AdvancedLineageService.analyze_dependency_risks(
                db=db,
                asset_id=asset_id,
                dependencies=dependency_analysis
            )

        # Optimization suggestions if requested
        optimization_suggestions = []
        if include_optimization:
            optimization_suggestions = await AdvancedLineageService.generate_dependency_optimizations(
                db=db,
                asset_id=asset_id,
                dependencies=dependency_analysis,
                risks=risk_analysis
            )

        # Create dependency map
        dependency_map = await AdvancedLineageService.create_dependency_map(
            db=db,
            dependencies=dependency_analysis,
            asset_id=asset_id
        )

        return {
            "success": True,
            "asset_id": asset_id,
            "asset_name": asset.name,
            "dependency_type": dependency_type,
            "dependency_analysis": dependency_analysis,
            "risk_analysis": risk_analysis,
            "optimization_suggestions": optimization_suggestions,
            "dependency_map": dependency_map,
            "dependency_summary": {
                "total_dependencies": dependency_analysis.get("total_dependencies", 0),
                "critical_dependencies": dependency_analysis.get("critical_dependencies", 0),
                "risk_level": risk_analysis.get("overall_risk_level", "unknown"),
                "optimization_opportunities": len(optimization_suggestions)
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dependency analysis failed: {str(e)}")

@router.get("/export/{asset_id}", response_model=Dict[str, Any])
async def export_lineage(
    asset_id: int,
    export_format: str = Query("json", description="Export format: json, graphml, cypher, csv"),
    include_metadata: bool = Query(True, description="Include asset metadata"),
    include_transformations: bool = Query(True, description="Include transformation details"),
    max_depth: int = Query(10, description="Maximum lineage depth"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Export lineage data in various formats
    """
    try:
        # Validate asset
        asset = db.query(CatalogEntry).filter(CatalogEntry.id == asset_id).first()
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        # Get comprehensive lineage
        lineage_data = await AdvancedLineageService.get_comprehensive_lineage(
            db=db,
            asset_id=asset_id,
            max_depth=max_depth,
            include_metadata=include_metadata,
            include_transformations=include_transformations
        )

        # Export in requested format
        export_result = await AdvancedLineageService.export_lineage_data(
            db=db,
            lineage_data=lineage_data,
            export_format=export_format,
            asset_id=asset_id,
            user_id=current_user.id
        )

        return {
            "success": True,
            "asset_id": asset_id,
            "asset_name": asset.name,
            "export_format": export_format,
            "export_result": export_result,
            "download_url": export_result.get("download_url"),
            "file_size": export_result.get("file_size"),
            "expires_at": export_result.get("expires_at"),
            "export_summary": {
                "nodes_exported": export_result.get("nodes_count", 0),
                "edges_exported": export_result.get("edges_count", 0),
                "max_depth": max_depth,
                "export_time": export_result.get("export_time_ms", 0)
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lineage export failed: {str(e)}")