"""
AI Pattern Detection Routes for Scan-Rule-Sets Group

This module provides comprehensive API routes for AI-powered pattern detection,
semantic analysis, intelligent insights, and ML-driven optimization.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Path
from sqlmodel import Session
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta

from app.core.database import get_session
from app.api.security.rbac import check_permissions, current_user, RoleType
from app.services.Scan-Rule-Sets-completed-services.ai_pattern_detection_service import AIPatternDetectionService
from app.models.Scan-Rule-Sets-completed-models.ai_pattern_models import (
    PatternDefinition, PatternDefinitionCreate, PatternDefinitionUpdate, PatternDefinitionResponse,
    PatternInstance, PatternInstanceCreate, PatternInstanceResponse,
    SemanticMapping, SemanticMappingCreate, SemanticMappingResponse,
    MLModel, MLModelCreate, MLModelUpdate, MLModelResponse,
    PatternCorrelation, PatternCorrelationResponse,
    IntelligentInsight, IntelligentInsightResponse,
    PatternSearchRequest, PatternSearchResponse,
    PatternAnalysisRequest, PatternAnalysisResponse,
    BulkPatternRequest, BulkPatternResponse,
    PatternTrendRequest, PatternTrendResponse,
    PatternOptimizationRequest, PatternOptimizationResponse,
    PatternCategoryEnum, PatternStatusEnum, PatternSeverityEnum,
    ModelTypeEnum, ModelStatusEnum
)
from app.utils.rate_limiter import check_rate_limit
from app.utils.cache import CacheManager
from app.core.logging_config import get_logger

router = APIRouter(prefix="/api/v1/scan-rule-sets/ai-patterns", tags=["AI Pattern Detection"])
logger = get_logger(__name__)

# Initialize services
async def get_ai_pattern_service(db: Session = Depends(get_session)) -> AIPatternDetectionService:
    return AIPatternDetectionService(db)

# ============================================================================
# PATTERN DEFINITION MANAGEMENT
# ============================================================================

@router.post("/patterns", response_model=PatternDefinitionResponse)
@check_rate_limit("pattern_creation", requests=10, window=300)
async def create_pattern_definition(
    pattern_data: PatternDefinitionCreate,
    background_tasks: BackgroundTasks,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(check_permissions([RoleType.DATA_STEWARD, RoleType.ADMIN]))
):
    """Create a new AI pattern definition with intelligent categorization."""
    try:
        # Create pattern with AI enhancement
        pattern = await service.create_pattern_definition(
            pattern_data=pattern_data,
            created_by=current_user_data.id
        )
        
        # Schedule background analysis
        background_tasks.add_task(
            service.analyze_pattern_relationships,
            pattern.id
        )
        
        logger.info(f"Pattern definition created: {pattern.id} by {current_user_data.id}")
        return pattern
        
    except Exception as e:
        logger.error(f"Error creating pattern definition: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create pattern: {str(e)}")

@router.get("/patterns", response_model=List[PatternDefinitionResponse])
@check_rate_limit("pattern_list", requests=30, window=300)
async def list_pattern_definitions(
    category: Optional[PatternCategoryEnum] = None,
    status: Optional[PatternStatusEnum] = None,
    severity: Optional[PatternSeverityEnum] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """List pattern definitions with intelligent filtering and search."""
    try:
        patterns = await service.list_pattern_definitions(
            category=category,
            status=status,
            severity=severity,
            search_query=search,
            skip=skip,
            limit=limit,
            user_id=current_user_data.id
        )
        return patterns
        
    except Exception as e:
        logger.error(f"Error listing pattern definitions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list patterns: {str(e)}")

@router.get("/patterns/{pattern_id}", response_model=PatternDefinitionResponse)
@check_rate_limit("pattern_detail", requests=50, window=300)
async def get_pattern_definition(
    pattern_id: UUID = Path(..., description="Pattern definition ID"),
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Get detailed pattern definition with AI insights."""
    try:
        pattern = await service.get_pattern_definition(pattern_id)
        if not pattern:
            raise HTTPException(status_code=404, detail="Pattern definition not found")
        return pattern
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting pattern definition: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get pattern: {str(e)}")

@router.put("/patterns/{pattern_id}", response_model=PatternDefinitionResponse)
@check_rate_limit("pattern_update", requests=20, window=300)
async def update_pattern_definition(
    pattern_id: UUID,
    pattern_data: PatternDefinitionUpdate,
    background_tasks: BackgroundTasks,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(check_permissions([RoleType.DATA_STEWARD, RoleType.ADMIN]))
):
    """Update pattern definition with intelligent validation."""
    try:
        pattern = await service.update_pattern_definition(
            pattern_id=pattern_id,
            pattern_data=pattern_data,
            updated_by=current_user_data.id
        )
        
        # Schedule background reanalysis
        background_tasks.add_task(
            service.reanalyze_pattern_instances,
            pattern_id
        )
        
        logger.info(f"Pattern definition updated: {pattern_id} by {current_user_data.id}")
        return pattern
        
    except Exception as e:
        logger.error(f"Error updating pattern definition: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update pattern: {str(e)}")

@router.delete("/patterns/{pattern_id}")
@check_rate_limit("pattern_delete", requests=10, window=300)
async def delete_pattern_definition(
    pattern_id: UUID,
    force: bool = Query(False, description="Force delete even with instances"),
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(check_permissions([RoleType.ADMIN]))
):
    """Delete pattern definition with cascade options."""
    try:
        await service.delete_pattern_definition(
            pattern_id=pattern_id,
            force_delete=force,
            deleted_by=current_user_data.id
        )
        
        logger.info(f"Pattern definition deleted: {pattern_id} by {current_user_data.id}")
        return {"message": "Pattern definition deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting pattern definition: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete pattern: {str(e)}")

# ============================================================================
# PATTERN DETECTION & ANALYSIS
# ============================================================================

@router.post("/detect", response_model=List[PatternInstanceResponse])
@check_rate_limit("pattern_detection", requests=20, window=300)
async def detect_patterns(
    analysis_request: PatternAnalysisRequest,
    background_tasks: BackgroundTasks,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Detect patterns in data using AI-powered analysis."""
    try:
        instances = await service.detect_patterns(
            analysis_request=analysis_request,
            detected_by=current_user_data.id
        )
        
        # Schedule background correlation analysis
        if instances:
            background_tasks.add_task(
                service.analyze_pattern_correlations,
                [instance.id for instance in instances]
            )
        
        logger.info(f"Pattern detection completed: {len(instances)} patterns found")
        return instances
        
    except Exception as e:
        logger.error(f"Error in pattern detection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Pattern detection failed: {str(e)}")

@router.post("/analyze-semantic", response_model=List[SemanticMappingResponse])
@check_rate_limit("semantic_analysis", requests=15, window=300)
async def analyze_semantic_patterns(
    analysis_request: PatternAnalysisRequest,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Perform semantic analysis on data patterns."""
    try:
        mappings = await service.analyze_semantic_patterns(
            analysis_request=analysis_request,
            analyzed_by=current_user_data.id
        )
        
        logger.info(f"Semantic analysis completed: {len(mappings)} mappings found")
        return mappings
        
    except Exception as e:
        logger.error(f"Error in semantic analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Semantic analysis failed: {str(e)}")

@router.post("/search", response_model=PatternSearchResponse)
@check_rate_limit("pattern_search", requests=30, window=300)
async def search_patterns(
    search_request: PatternSearchRequest,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Search patterns using intelligent semantic search."""
    try:
        results = await service.search_patterns(
            search_request=search_request,
            user_id=current_user_data.id
        )
        
        logger.info(f"Pattern search completed: {len(results.patterns)} results")
        return results
        
    except Exception as e:
        logger.error(f"Error in pattern search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Pattern search failed: {str(e)}")

# ============================================================================
# PATTERN INSTANCES
# ============================================================================

@router.get("/instances", response_model=List[PatternInstanceResponse])
@check_rate_limit("instance_list", requests=30, window=300)
async def list_pattern_instances(
    pattern_id: Optional[UUID] = None,
    data_source_id: Optional[UUID] = None,
    confidence_min: Optional[float] = Query(None, ge=0.0, le=1.0),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """List pattern instances with filtering options."""
    try:
        instances = await service.list_pattern_instances(
            pattern_id=pattern_id,
            data_source_id=data_source_id,
            confidence_min=confidence_min,
            skip=skip,
            limit=limit
        )
        return instances
        
    except Exception as e:
        logger.error(f"Error listing pattern instances: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list instances: {str(e)}")

@router.get("/instances/{instance_id}", response_model=PatternInstanceResponse)
@check_rate_limit("instance_detail", requests=50, window=300)
async def get_pattern_instance(
    instance_id: UUID,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Get detailed pattern instance information."""
    try:
        instance = await service.get_pattern_instance(instance_id)
        if not instance:
            raise HTTPException(status_code=404, detail="Pattern instance not found")
        return instance
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting pattern instance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get instance: {str(e)}")

@router.put("/instances/{instance_id}/validate")
@check_rate_limit("instance_validation", requests=20, window=300)
async def validate_pattern_instance(
    instance_id: UUID,
    is_valid: bool,
    feedback: Optional[str] = None,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Validate or invalidate a pattern instance."""
    try:
        await service.validate_pattern_instance(
            instance_id=instance_id,
            is_valid=is_valid,
            feedback=feedback,
            validated_by=current_user_data.id
        )
        
        logger.info(f"Pattern instance validated: {instance_id} -> {is_valid}")
        return {"message": "Pattern instance validation updated"}
        
    except Exception as e:
        logger.error(f"Error validating pattern instance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

# ============================================================================
# ML MODEL MANAGEMENT
# ============================================================================

@router.get("/models", response_model=List[MLModelResponse])
@check_rate_limit("model_list", requests=20, window=300)
async def list_ml_models(
    model_type: Optional[ModelTypeEnum] = None,
    status: Optional[ModelStatusEnum] = None,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """List available ML models for pattern detection."""
    try:
        models = await service.list_ml_models(
            model_type=model_type,
            status=status
        )
        return models
        
    except Exception as e:
        logger.error(f"Error listing ML models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")

@router.post("/models/train")
@check_rate_limit("model_training", requests=3, window=3600)
async def train_ml_model(
    model_data: MLModelCreate,
    background_tasks: BackgroundTasks,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(check_permissions([RoleType.DATA_SCIENTIST, RoleType.ADMIN]))
):
    """Train a new ML model for pattern detection."""
    try:
        # Start training in background
        background_tasks.add_task(
            service.train_ml_model,
            model_data=model_data,
            trained_by=current_user_data.id
        )
        
        logger.info(f"ML model training started by {current_user_data.id}")
        return {"message": "Model training started", "status": "training"}
        
    except Exception as e:
        logger.error(f"Error starting model training: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.get("/models/{model_id}", response_model=MLModelResponse)
@check_rate_limit("model_detail", requests=30, window=300)
async def get_ml_model(
    model_id: UUID,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Get detailed ML model information."""
    try:
        model = await service.get_ml_model(model_id)
        if not model:
            raise HTTPException(status_code=404, detail="ML model not found")
        return model
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ML model: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get model: {str(e)}")

@router.put("/models/{model_id}/deploy")
@check_rate_limit("model_deployment", requests=5, window=300)
async def deploy_ml_model(
    model_id: UUID,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(check_permissions([RoleType.DATA_SCIENTIST, RoleType.ADMIN]))
):
    """Deploy an ML model for production use."""
    try:
        await service.deploy_ml_model(
            model_id=model_id,
            deployed_by=current_user_data.id
        )
        
        logger.info(f"ML model deployed: {model_id} by {current_user_data.id}")
        return {"message": "Model deployed successfully"}
        
    except Exception as e:
        logger.error(f"Error deploying ML model: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Deployment failed: {str(e)}")

# ============================================================================
# ADVANCED ANALYTICS
# ============================================================================

@router.get("/correlations", response_model=List[PatternCorrelationResponse])
@check_rate_limit("correlation_analysis", requests=15, window=300)
async def get_pattern_correlations(
    pattern_id: Optional[UUID] = None,
    correlation_strength_min: Optional[float] = Query(0.5, ge=0.0, le=1.0),
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Get pattern correlations and relationships."""
    try:
        correlations = await service.get_pattern_correlations(
            pattern_id=pattern_id,
            min_strength=correlation_strength_min
        )
        return correlations
        
    except Exception as e:
        logger.error(f"Error getting pattern correlations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get correlations: {str(e)}")

@router.get("/insights", response_model=List[IntelligentInsightResponse])
@check_rate_limit("insight_generation", requests=10, window=300)
async def get_intelligent_insights(
    data_source_id: Optional[UUID] = None,
    pattern_category: Optional[PatternCategoryEnum] = None,
    time_range_days: int = Query(30, ge=1, le=365),
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Get AI-generated intelligent insights."""
    try:
        insights = await service.generate_intelligent_insights(
            data_source_id=data_source_id,
            pattern_category=pattern_category,
            time_range_days=time_range_days,
            user_id=current_user_data.id
        )
        return insights
        
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

@router.post("/trends", response_model=PatternTrendResponse)
@check_rate_limit("trend_analysis", requests=10, window=300)
async def analyze_pattern_trends(
    trend_request: PatternTrendRequest,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Analyze pattern trends and predictions."""
    try:
        trends = await service.analyze_pattern_trends(
            trend_request=trend_request,
            analyzed_by=current_user_data.id
        )
        return trends
        
    except Exception as e:
        logger.error(f"Error analyzing trends: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Trend analysis failed: {str(e)}")

@router.post("/optimize", response_model=PatternOptimizationResponse)
@check_rate_limit("pattern_optimization", requests=5, window=600)
async def optimize_patterns(
    optimization_request: PatternOptimizationRequest,
    background_tasks: BackgroundTasks,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(check_permissions([RoleType.DATA_STEWARD, RoleType.ADMIN]))
):
    """Optimize pattern detection using AI recommendations."""
    try:
        optimization = await service.optimize_pattern_detection(
            optimization_request=optimization_request,
            optimized_by=current_user_data.id
        )
        
        # Schedule background implementation
        background_tasks.add_task(
            service.implement_optimization_recommendations,
            optimization.optimization_id
        )
        
        logger.info(f"Pattern optimization completed: {optimization.optimization_id}")
        return optimization
        
    except Exception as e:
        logger.error(f"Error in pattern optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

# ============================================================================
# BULK OPERATIONS
# ============================================================================

@router.post("/bulk/analyze", response_model=BulkPatternResponse)
@check_rate_limit("bulk_analysis", requests=3, window=600)
async def bulk_pattern_analysis(
    bulk_request: BulkPatternRequest,
    background_tasks: BackgroundTasks,
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(check_permissions([RoleType.DATA_STEWARD, RoleType.ADMIN]))
):
    """Perform bulk pattern analysis across multiple data sources."""
    try:
        # Start bulk analysis in background
        background_tasks.add_task(
            service.bulk_pattern_analysis,
            bulk_request=bulk_request,
            initiated_by=current_user_data.id
        )
        
        logger.info(f"Bulk pattern analysis started by {current_user_data.id}")
        return BulkPatternResponse(
            operation_id=UUID("00000000-0000-0000-0000-000000000000"),  # Will be generated in service
            status="started",
            message="Bulk pattern analysis initiated",
            total_items=len(bulk_request.data_source_ids),
            processed_items=0,
            progress_percentage=0.0
        )
        
    except Exception as e:
        logger.error(f"Error starting bulk analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bulk analysis failed: {str(e)}")

# ============================================================================
# HEALTH & MONITORING
# ============================================================================

@router.get("/health")
async def health_check(
    service: AIPatternDetectionService = Depends(get_ai_pattern_service)
):
    """Health check for AI pattern detection service."""
    try:
        health_status = await service.get_health_status()
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@router.get("/metrics")
@check_rate_limit("metrics", requests=20, window=300)
async def get_service_metrics(
    service: AIPatternDetectionService = Depends(get_ai_pattern_service),
    current_user_data = Depends(current_user)
):
    """Get AI pattern detection service metrics."""
    try:
        metrics = await service.get_service_metrics()
        return metrics
        
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")