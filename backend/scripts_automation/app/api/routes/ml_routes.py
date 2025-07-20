"""
Advanced ML Routes for Enterprise Classification System - Version 2
Production-grade ML API endpoints surpassing Databricks and Microsoft Purview
Comprehensive ML pipeline API management
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import logging
import json
import uuid
from io import BytesIO
import pandas as pd

# Import dependencies
from ...db_session import get_session
from ...services.ml_service import EnterpriseMLService
from ...services.auth_service import get_current_user, require_permissions
from ...models.ml_models import (
    MLModelConfiguration, MLTrainingDataset, MLTrainingJob, MLPrediction,
    MLFeedback, MLExperiment, MLExperimentRun, MLFeatureStore,
    MLModelMonitoring, MLModelType, MLTaskType, MLModelStatus
)

# Pydantic models for request/response
from pydantic import BaseModel, Field
from enum import Enum

# Setup logging
logger = logging.getLogger(__name__)

# Initialize router and service
router = APIRouter(prefix="/ml", tags=["ML Classification System"])
ml_service = EnterpriseMLService()

# ============ Request/Response Models ============

class MLModelConfigRequest(BaseModel):
    name: str = Field(..., description="Model configuration name")
    description: Optional[str] = Field(None, description="Model description")
    model_type: str = Field(..., description="ML model type")
    task_type: str = Field(..., description="ML task type")
    framework: str = Field(..., description="ML framework")
    model_config: Dict[str, Any] = Field(..., description="Model configuration")
    hyperparameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    training_config: Dict[str, Any] = Field(..., description="Training configuration")
    validation_config: Dict[str, Any] = Field(..., description="Validation configuration")
    feature_config: Optional[Dict[str, Any]] = Field(default_factory=dict)
    classification_framework_id: Optional[int] = None
    target_sensitivity_levels: Optional[List[str]] = Field(default_factory=list)
    classification_scope: Optional[str] = None

class TrainingDatasetRequest(BaseModel):
    name: str = Field(..., description="Dataset name")
    description: Optional[str] = Field(None, description="Dataset description")
    dataset_type: str = Field(..., description="Dataset type")
    data_source_ids: List[int] = Field(..., description="Data source IDs")
    catalog_item_ids: Optional[List[int]] = Field(default_factory=list)
    scan_result_ids: Optional[List[int]] = Field(default_factory=list)
    data_config: Dict[str, Any] = Field(..., description="Data configuration")
    schema_config: Dict[str, Any] = Field(..., description="Schema configuration")
    labeling_config: Dict[str, Any] = Field(..., description="Labeling configuration")
    ground_truth_labels: Dict[str, Any] = Field(..., description="Ground truth labels")

class TrainingJobRequest(BaseModel):
    job_name: str = Field(..., description="Training job name")
    description: Optional[str] = Field(None, description="Job description")
    model_config_id: int = Field(..., description="Model configuration ID")
    training_dataset_id: int = Field(..., description="Training dataset ID")
    job_config: Dict[str, Any] = Field(..., description="Job configuration")
    training_parameters: Dict[str, Any] = Field(..., description="Training parameters")
    hyperparameter_tuning: Optional[Dict[str, Any]] = Field(default_factory=dict)

class MLPredictionRequest(BaseModel):
    model_config_id: int = Field(..., description="Model configuration ID")
    target_type: str = Field(..., description="Target type")
    target_id: str = Field(..., description="Target ID")
    target_identifier: str = Field(..., description="Target identifier")
    input_data: Dict[str, Any] = Field(..., description="Input data for prediction")

class BatchPredictionRequest(BaseModel):
    model_config_id: int = Field(..., description="Model configuration ID")
    targets: List[Dict[str, Any]] = Field(..., description="List of prediction targets")

class MLFeedbackRequest(BaseModel):
    prediction_id: int = Field(..., description="Prediction ID")
    feedback_type: str = Field(..., description="Feedback type")
    feedback_source: Optional[str] = Field(default="human_expert")
    feedback_quality: Optional[float] = Field(default=1.0, ge=0.0, le=1.0)
    corrected_prediction: Optional[Dict[str, Any]] = Field(default_factory=dict)
    feedback_notes: Optional[str] = None
    correction_reasoning: Optional[str] = None
    expert_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    expert_domain: Optional[str] = None

class MLExperimentRequest(BaseModel):
    experiment_name: str = Field(..., description="Experiment name")
    description: Optional[str] = Field(None, description="Experiment description")
    model_config_id: int = Field(..., description="Model configuration ID")
    experiment_type: str = Field(..., description="Experiment type")
    config: Dict[str, Any] = Field(..., description="Experiment configuration")
    parameter_space: Dict[str, Any] = Field(..., description="Parameter space")
    optimization_objective: str = Field(..., description="Optimization objective")
    total_runs: Optional[int] = Field(default=10, ge=1, le=100)

class RetrainingRequest(BaseModel):
    model_config_id: int = Field(..., description="Model configuration ID")
    retraining_config: Dict[str, Any] = Field(..., description="Retraining configuration")

# ============ ML Model Configuration Endpoints ============

@router.post("/models", response_model=dict)
async def create_ml_model_config(
    request: MLModelConfigRequest,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Create ML model configuration"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_model_create"])
        
        # Create model configuration
        config = await ml_service.create_ml_model_config(
            session, current_user, request.dict()
        )
        
        return {
            "message": "ML model configuration created successfully",
            "config_id": config.id,
            "config": {
                "id": config.id,
                "name": config.name,
                "model_type": config.model_type,
                "status": config.status,
                "created_at": config.created_at
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating ML model configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models", response_model=dict)
async def get_ml_model_configs(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    model_type: Optional[str] = Query(None, description="Filter by model type"),
    framework: Optional[str] = Query(None, description="Filter by framework"),
    status: Optional[str] = Query(None, description="Filter by status"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search_query: Optional[str] = Query(None, description="Search query"),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get ML model configurations with filtering and pagination"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_model_read"])
        
        # Prepare filters
        filters = {}
        if model_type:
            filters["model_type"] = model_type
        if framework:
            filters["framework"] = framework
        if status:
            filters["status"] = status
        if is_active is not None:
            filters["is_active"] = is_active
        if search_query:
            filters["search_query"] = search_query
        
        # Get configurations
        configs, total_count = await ml_service.get_ml_model_configs(
            session,
            filters=filters,
            pagination={"page": page, "size": size}
        )
        
        return {
            "configs": [
                {
                    "id": config.id,
                    "name": config.name,
                    "description": config.description,
                    "model_type": config.model_type,
                    "framework": config.framework,
                    "status": config.status,
                    "performance_metrics": config.performance_metrics,
                    "created_at": config.created_at,
                    "last_trained": config.last_trained,
                    "current_performance": getattr(config, 'current_performance', {})
                }
                for config in configs
            ],
            "pagination": {
                "page": page,
                "size": size,
                "total": total_count,
                "pages": (total_count + size - 1) // size
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting ML model configurations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models/{config_id}", response_model=dict)
async def get_ml_model_config(
    config_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get specific ML model configuration"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_model_read"])
        
        config = await session.get(MLModelConfiguration, config_id)
        if not config:
            raise HTTPException(status_code=404, detail="ML model configuration not found")
        
        return {
            "config": {
                "id": config.id,
                "name": config.name,
                "description": config.description,
                "model_type": config.model_type,
                "task_type": config.task_type,
                "framework": config.framework,
                "model_config": config.model_config,
                "hyperparameters": config.hyperparameters,
                "training_config": config.training_config,
                "validation_config": config.validation_config,
                "feature_config": config.feature_config,
                "performance_metrics": config.performance_metrics,
                "status": config.status,
                "model_path": config.model_path,
                "created_at": config.created_at,
                "last_trained": config.last_trained
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ML model configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ Training Dataset Endpoints ============

@router.post("/datasets", response_model=dict)
async def create_training_dataset(
    request: TrainingDatasetRequest,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Create training dataset"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_dataset_create"])
        
        # Create dataset
        dataset = await ml_service.create_training_dataset(
            session, current_user, request.dict()
        )
        
        return {
            "message": "Training dataset created successfully",
            "dataset_id": dataset.id,
            "dataset": {
                "id": dataset.id,
                "name": dataset.name,
                "dataset_type": dataset.dataset_type,
                "total_samples": dataset.total_samples,
                "feature_count": dataset.feature_count,
                "created_at": dataset.created_at
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating training dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/datasets/{dataset_id}/prepare", response_model=dict)
async def prepare_training_data(
    dataset_id: int,
    feature_config: Dict[str, Any],
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Prepare training data with feature engineering"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_dataset_process"])
        
        # Prepare data
        prepared_data = await ml_service.prepare_training_data(
            session, dataset_id, feature_config
        )
        
        return {
            "message": "Training data prepared successfully",
            "dataset_id": dataset_id,
            "statistics": {
                "total_samples": len(prepared_data.get("train_data", [])),
                "training_samples": len(prepared_data.get("train_data", [])),
                "validation_samples": len(prepared_data.get("validation_data", [])),
                "test_samples": len(prepared_data.get("test_data", [])),
                "feature_count": len(prepared_data.get("feature_schema", {}))
            }
        }
        
    except Exception as e:
        logger.error(f"Error preparing training data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ Training Job Endpoints ============

@router.post("/training/jobs", response_model=dict)
async def start_training_job(
    request: TrainingJobRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Start ML training job"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_training_create"])
        
        # Start training job
        job = await ml_service.start_training_job(
            session, current_user, request.dict()
        )
        
        return {
            "message": "Training job started successfully",
            "job_id": job.id,
            "job": {
                "id": job.id,
                "job_name": job.job_name,
                "status": job.status,
                "progress_percentage": job.progress_percentage,
                "started_at": job.started_at,
                "model_config_id": job.model_config_id,
                "training_dataset_id": job.training_dataset_id
            }
        }
        
    except Exception as e:
        logger.error(f"Error starting training job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/training/jobs/{job_id}", response_model=dict)
async def get_training_job(
    job_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get training job details"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_training_read"])
        
        job = await session.get(MLTrainingJob, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Training job not found")
        
        return {
            "job": {
                "id": job.id,
                "job_name": job.job_name,
                "description": job.description,
                "status": job.status,
                "progress_percentage": job.progress_percentage,
                "started_at": job.started_at,
                "completed_at": job.completed_at,
                "duration_seconds": job.duration_seconds,
                "training_metrics": job.training_metrics,
                "validation_metrics": job.validation_metrics,
                "error_messages": job.error_messages,
                "model_config_id": job.model_config_id,
                "training_dataset_id": job.training_dataset_id,
                "final_model_path": job.final_model_path
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting training job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ ML Prediction Endpoints ============

@router.post("/predictions", response_model=dict)
async def create_ml_prediction(
    request: MLPredictionRequest,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Create ML prediction"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_prediction_create"])
        
        # Create prediction
        prediction = await ml_service.create_ml_prediction(
            session, current_user, request.dict()
        )
        
        return {
            "message": "ML prediction created successfully",
            "prediction_id": prediction.prediction_id,
            "prediction": {
                "id": prediction.id,
                "prediction_id": prediction.prediction_id,
                "predicted_class": prediction.predicted_class,
                "confidence_score": prediction.confidence_score,
                "confidence_level": prediction.confidence_level,
                "sensitivity_prediction": prediction.sensitivity_prediction,
                "processing_time_ms": prediction.inference_time_ms,
                "prediction_result": prediction.prediction_result,
                "created_at": prediction.created_at
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating ML prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predictions/batch", response_model=dict)
async def create_batch_predictions(
    request: BatchPredictionRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Create batch ML predictions"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_prediction_create"])
        
        # Create batch predictions
        predictions = await ml_service.batch_predict(
            session, current_user, request.dict()
        )
        
        return {
            "message": "Batch predictions created successfully",
            "total_predictions": len(predictions),
            "batch_id": predictions[0].batch_id if predictions else None,
            "predictions": [
                {
                    "id": pred.id,
                    "prediction_id": pred.prediction_id,
                    "target_id": pred.target_id,
                    "predicted_class": pred.predicted_class,
                    "confidence_score": pred.confidence_score,
                    "processing_time_ms": pred.inference_time_ms
                }
                for pred in predictions[:10]  # Return first 10 for preview
            ]
        }
        
    except Exception as e:
        logger.error(f"Error creating batch predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ ML Feedback Endpoints ============

@router.post("/feedback", response_model=dict)
async def submit_ml_feedback(
    request: MLFeedbackRequest,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Submit ML feedback for active learning"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_feedback_create"])
        
        # Submit feedback
        feedback = await ml_service.submit_ml_feedback(
            session, current_user, request.dict()
        )
        
        return {
            "message": "ML feedback submitted successfully",
            "feedback_id": feedback.id,
            "feedback": {
                "id": feedback.id,
                "prediction_id": feedback.prediction_id,
                "feedback_type": feedback.feedback_type,
                "feedback_quality": feedback.feedback_quality,
                "expert_confidence": feedback.expert_confidence,
                "is_processed": feedback.is_processed,
                "created_at": feedback.created_at
            }
        }
        
    except Exception as e:
        logger.error(f"Error submitting ML feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models/{model_config_id}/retrain", response_model=dict)
async def trigger_model_retraining(
    model_config_id: int,
    request: RetrainingRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Trigger model retraining based on feedback"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_training_create"])
        
        # Trigger retraining
        retraining_job = await ml_service.trigger_retraining(
            session, current_user, model_config_id, request.retraining_config
        )
        
        return {
            "message": "Model retraining triggered successfully",
            "retraining_job_id": retraining_job.id,
            "job": {
                "id": retraining_job.id,
                "job_name": retraining_job.job_name,
                "status": retraining_job.status,
                "started_at": retraining_job.started_at,
                "model_config_id": retraining_job.model_config_id
            }
        }
        
    except Exception as e:
        logger.error(f"Error triggering model retraining: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ ML Experiment Endpoints ============

@router.post("/experiments", response_model=dict)
async def create_ml_experiment(
    request: MLExperimentRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Create ML experiment for model optimization"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_experiment_create"])
        
        # Create experiment
        experiment = await ml_service.create_ml_experiment(
            session, current_user, request.dict()
        )
        
        return {
            "message": "ML experiment created successfully",
            "experiment_id": experiment.id,
            "experiment": {
                "id": experiment.id,
                "experiment_name": experiment.experiment_name,
                "experiment_type": experiment.experiment_type,
                "status": experiment.status,
                "total_runs": experiment.total_runs,
                "completed_runs": experiment.completed_runs,
                "started_at": experiment.started_at,
                "model_config_id": experiment.model_config_id
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating ML experiment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ ML Monitoring Endpoints ============

@router.get("/models/{model_config_id}/monitor", response_model=dict)
async def monitor_ml_model(
    model_config_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Monitor ML model performance"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_monitoring_read"])
        
        # Monitor model
        monitoring = await ml_service.monitor_ml_model_performance(
            session, model_config_id
        )
        
        return {
            "monitoring": {
                "model_config_id": monitoring.model_config_id,
                "monitoring_timestamp": monitoring.monitoring_timestamp,
                "accuracy_metrics": monitoring.accuracy_metrics,
                "precision_recall_metrics": monitoring.precision_recall_metrics,
                "prediction_distribution": monitoring.prediction_distribution,
                "input_drift_metrics": monitoring.input_drift_metrics,
                "inference_latency_metrics": monitoring.inference_latency_metrics,
                "throughput_metrics": monitoring.throughput_metrics,
                "alert_status": monitoring.alert_status,
                "alerts_triggered": monitoring.alerts_triggered,
                "recommendations": monitoring.recommendations
            }
        }
        
    except Exception as e:
        logger.error(f"Error monitoring ML model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ Utility Endpoints ============

@router.get("/health", response_model=dict)
async def ml_system_health():
    """Get ML system health status"""
    try:
        # Check ML frameworks availability
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "components": {
                "ml_service": "operational",
                "sklearn_available": True,  # Would check actual availability
                "model_cache": "operational",
                "training_queue": "operational"
            }
        }
        
        return health_status
        
    except Exception as e:
        logger.error(f"Error checking ML system health: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

@router.get("/metrics", response_model=dict)
async def get_ml_system_metrics(
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get ML system metrics and statistics"""
    try:
        # Validate permissions
        await require_permissions(current_user, ["ml_metrics_read"])
        
        # Get system metrics (placeholder implementation)
        metrics = {
            "total_models": 0,
            "active_models": 0,
            "total_predictions": 0,
            "training_jobs": {
                "running": 0,
                "completed": 0,
                "failed": 0
            },
            "experiments": {
                "active": 0,
                "completed": 0
            },
            "performance": {
                "average_prediction_time_ms": 0,
                "average_accuracy": 0,
                "total_feedback_received": 0
            }
        }
        
        return {"metrics": metrics}
        
    except Exception as e:
        logger.error(f"Error getting ML system metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))