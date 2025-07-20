from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timedelta

from ...services.ml_service import MLClassificationService
from ...models.ml_models import (
    MLModel, MLTrainingJob, MLPrediction, MLFeedback, MLModelVersion,
    MLModelType, MLModelStatus, TrainingJobStatus, PredictionConfidenceLevel, FeedbackType
)
from ...utils.db import get_db

router = APIRouter(prefix="/ml-classification", tags=["ML Classification"])

# Pydantic Schemas for ML endpoints
class MLModelCreate(BaseModel):
    name: str = Field(..., description="Model name")
    description: Optional[str] = Field(None, description="Model description")
    model_type: MLModelType = Field(..., description="Type of ML model")
    algorithm: str = Field(..., description="Algorithm to use (e.g., RandomForestClassifier)")
    version: str = Field(default="1.0.0", description="Model version")
    hyperparameters: Dict[str, Any] = Field(default_factory=dict, description="Model hyperparameters")
    feature_config: Dict[str, Any] = Field(default_factory=dict, description="Feature configuration")
    preprocessing_config: Dict[str, Any] = Field(default_factory=dict, description="Preprocessing configuration")

class MLModelResponse(BaseModel):
    id: int
    uuid: str
    name: str
    description: Optional[str]
    model_type: str
    algorithm: str
    version: str
    status: str
    accuracy: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    created_at: datetime
    created_by: str

class TrainingJobCreate(BaseModel):
    model_id: int = Field(..., description="ID of the model to train")
    training_config: Dict[str, Any] = Field(..., description="Training configuration")
    dataset_config: Dict[str, Any] = Field(..., description="Dataset configuration")
    validation_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Validation configuration")

class TrainingJobResponse(BaseModel):
    id: int
    uuid: str
    model_id: int
    job_name: str
    status: str
    progress_percentage: float
    current_epoch: Optional[int]
    total_epochs: Optional[int]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    final_metrics: Optional[Dict[str, Any]]
    error_message: Optional[str]

class PredictionRequest(BaseModel):
    model_id: int = Field(..., description="ID of the model to use for prediction")
    entity_type: str = Field(..., description="Type of entity (datasource, table, column)")
    entity_id: str = Field(..., description="ID of the entity")
    input_data: str = Field(..., description="Input data for classification")

class PredictionResponse(BaseModel):
    id: int
    uuid: str
    model_id: int
    entity_type: str
    entity_id: str
    predicted_label: str
    confidence_score: float
    confidence_level: str
    prediction_probabilities: Dict[str, float]
    feature_contributions: Dict[str, Any]
    explanation: str
    inference_time_ms: float
    created_at: datetime

class FeedbackSubmission(BaseModel):
    prediction_id: int = Field(..., description="ID of the prediction to provide feedback for")
    feedback_type: FeedbackType = Field(..., description="Type of feedback")
    correct_label: Optional[str] = Field(None, description="Correct label if prediction was wrong")
    confidence_in_feedback: float = Field(default=1.0, description="Confidence in the feedback (0-1)")
    explanation: Optional[str] = Field(None, description="Explanation of the feedback")
    feedback_source: str = Field(default="manual", description="Source of feedback")
    domain_expert: bool = Field(default=False, description="Whether feedback is from domain expert")

class FeedbackResponse(BaseModel):
    id: int
    uuid: str
    model_id: int
    prediction_id: int
    feedback_type: str
    correct_label: Optional[str]
    confidence_in_feedback: float
    explanation: Optional[str]
    feedback_source: str
    domain_expert: bool
    created_at: datetime
    created_by: str

class BatchPredictionRequest(BaseModel):
    model_id: int = Field(..., description="ID of the model to use")
    predictions: List[Dict[str, Any]] = Field(..., description="List of prediction requests")
    batch_name: Optional[str] = Field(None, description="Name for the batch")

class ModelDeploymentRequest(BaseModel):
    model_id: int = Field(..., description="ID of the model to deploy")
    deployment_config: Dict[str, Any] = Field(default_factory=dict, description="Deployment configuration")

class ModelMetricsResponse(BaseModel):
    model_id: int
    accuracy: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    auc_roc: Optional[float]
    confusion_matrix: Optional[Dict[str, Any]]
    feature_importance: Optional[Dict[str, Any]]
    recent_predictions_count: int
    feedback_count: int
    active_learning_triggered: bool

# Initialize ML service
ml_service = MLClassificationService()

@router.post("/models", response_model=MLModelResponse)
async def create_ml_model(
    model: MLModelCreate,
    user: str,
    db: Session = Depends(get_db)
):
    """Create a new ML model configuration"""
    try:
        ml_model = await ml_service.create_ml_model(db, model.dict(), user)
        return MLModelResponse(
            id=ml_model.id,
            uuid=str(ml_model.uuid),
            name=ml_model.name,
            description=ml_model.description,
            model_type=ml_model.model_type.value,
            algorithm=ml_model.algorithm,
            version=ml_model.version,
            status=ml_model.status.value,
            accuracy=ml_model.accuracy,
            precision=ml_model.precision,
            recall=ml_model.recall,
            f1_score=ml_model.f1_score,
            created_at=ml_model.created_at,
            created_by=ml_model.created_by
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/models", response_model=List[MLModelResponse])
async def list_ml_models(
    status: Optional[MLModelStatus] = None,
    model_type: Optional[MLModelType] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List ML models with optional filtering"""
    try:
        query = db.query(MLModel)
        
        if status:
            query = query.filter(MLModel.status == status)
        if model_type:
            query = query.filter(MLModel.model_type == model_type)
        
        models = query.limit(limit).all()
        
        return [
            MLModelResponse(
                id=model.id,
                uuid=str(model.uuid),
                name=model.name,
                description=model.description,
                model_type=model.model_type.value,
                algorithm=model.algorithm,
                version=model.version,
                status=model.status.value,
                accuracy=model.accuracy,
                precision=model.precision,
                recall=model.recall,
                f1_score=model.f1_score,
                created_at=model.created_at,
                created_by=model.created_by
            )
            for model in models
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/models/{model_id}", response_model=MLModelResponse)
async def get_ml_model(
    model_id: int,
    db: Session = Depends(get_db)
):
    """Get ML model by ID"""
    model = db.get(MLModel, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return MLModelResponse(
        id=model.id,
        uuid=str(model.uuid),
        name=model.name,
        description=model.description,
        model_type=model.model_type.value,
        algorithm=model.algorithm,
        version=model.version,
        status=model.status.value,
        accuracy=model.accuracy,
        precision=model.precision,
        recall=model.recall,
        f1_score=model.f1_score,
        created_at=model.created_at,
        created_by=model.created_by
    )

@router.post("/training-jobs", response_model=TrainingJobResponse)
async def start_training_job(
    job: TrainingJobCreate,
    user: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start a new ML training job"""
    try:
        training_job = await ml_service.start_training_job(
            db, job.model_id, job.dict(exclude={'model_id'}), user
        )
        
        return TrainingJobResponse(
            id=training_job.id,
            uuid=str(training_job.uuid),
            model_id=training_job.model_id,
            job_name=training_job.job_name,
            status=training_job.status.value,
            progress_percentage=training_job.progress_percentage,
            current_epoch=training_job.current_epoch,
            total_epochs=training_job.total_epochs,
            started_at=training_job.started_at,
            completed_at=training_job.completed_at,
            duration_seconds=training_job.duration_seconds,
            final_metrics=training_job.final_metrics,
            error_message=training_job.error_message
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/training-jobs", response_model=List[TrainingJobResponse])
async def list_training_jobs(
    model_id: Optional[int] = None,
    status: Optional[TrainingJobStatus] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List training jobs with optional filtering"""
    try:
        query = db.query(MLTrainingJob)
        
        if model_id:
            query = query.filter(MLTrainingJob.model_id == model_id)
        if status:
            query = query.filter(MLTrainingJob.status == status)
        
        jobs = query.order_by(MLTrainingJob.created_at.desc()).limit(limit).all()
        
        return [
            TrainingJobResponse(
                id=job.id,
                uuid=str(job.uuid),
                model_id=job.model_id,
                job_name=job.job_name,
                status=job.status.value,
                progress_percentage=job.progress_percentage,
                current_epoch=job.current_epoch,
                total_epochs=job.total_epochs,
                started_at=job.started_at,
                completed_at=job.completed_at,
                duration_seconds=job.duration_seconds,
                final_metrics=job.final_metrics,
                error_message=job.error_message
            )
            for job in jobs
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/training-jobs/{job_id}", response_model=TrainingJobResponse)
async def get_training_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    """Get training job by ID"""
    job = db.get(MLTrainingJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    return TrainingJobResponse(
        id=job.id,
        uuid=str(job.uuid),
        model_id=job.model_id,
        job_name=job.job_name,
        status=job.status.value,
        progress_percentage=job.progress_percentage,
        current_epoch=job.current_epoch,
        total_epochs=job.total_epochs,
        started_at=job.started_at,
        completed_at=job.completed_at,
        duration_seconds=job.duration_seconds,
        final_metrics=job.final_metrics,
        error_message=job.error_message
    )

@router.post("/predict", response_model=PredictionResponse)
async def make_prediction(
    request: PredictionRequest,
    user: str,
    db: Session = Depends(get_db)
):
    """Make a classification prediction using ML model"""
    try:
        prediction = await ml_service.predict_classification(
            db, request.model_id, request.entity_type, request.entity_id, request.input_data, user
        )
        
        return PredictionResponse(
            id=prediction.id,
            uuid=str(prediction.uuid),
            model_id=prediction.model_id,
            entity_type=prediction.entity_type,
            entity_id=prediction.entity_id,
            predicted_label=prediction.predicted_label,
            confidence_score=prediction.confidence_score,
            confidence_level=prediction.confidence_level.value,
            prediction_probabilities=prediction.prediction_probabilities or {},
            feature_contributions=prediction.feature_contributions or {},
            explanation=prediction.explanation or "",
            inference_time_ms=prediction.inference_time_ms,
            created_at=prediction.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/predict/batch", response_model=List[PredictionResponse])
async def make_batch_predictions(
    request: BatchPredictionRequest,
    user: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Make batch predictions using ML model"""
    try:
        predictions = []
        batch_id = str(uuid.uuid4())
        
        for pred_data in request.predictions:
            prediction = await ml_service.predict_classification(
                db, 
                request.model_id, 
                pred_data['entity_type'], 
                pred_data['entity_id'], 
                pred_data['input_data'], 
                user
            )
            prediction.batch_id = batch_id
            db.commit()
            
            predictions.append(PredictionResponse(
                id=prediction.id,
                uuid=str(prediction.uuid),
                model_id=prediction.model_id,
                entity_type=prediction.entity_type,
                entity_id=prediction.entity_id,
                predicted_label=prediction.predicted_label,
                confidence_score=prediction.confidence_score,
                confidence_level=prediction.confidence_level.value,
                prediction_probabilities=prediction.prediction_probabilities or {},
                feature_contributions=prediction.feature_contributions or {},
                explanation=prediction.explanation or "",
                inference_time_ms=prediction.inference_time_ms,
                created_at=prediction.created_at
            ))
        
        return predictions
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    feedback: FeedbackSubmission,
    user: str,
    db: Session = Depends(get_db)
):
    """Submit feedback for ML prediction to improve model"""
    try:
        ml_feedback = await ml_service.submit_feedback(
            db, feedback.prediction_id, feedback.dict(exclude={'prediction_id'}), user
        )
        
        return FeedbackResponse(
            id=ml_feedback.id,
            uuid=str(ml_feedback.uuid),
            model_id=ml_feedback.model_id,
            prediction_id=ml_feedback.prediction_id,
            feedback_type=ml_feedback.feedback_type.value,
            correct_label=ml_feedback.correct_label,
            confidence_in_feedback=ml_feedback.confidence_in_feedback,
            explanation=ml_feedback.explanation,
            feedback_source=ml_feedback.feedback_source,
            domain_expert=ml_feedback.domain_expert,
            created_at=ml_feedback.created_at,
            created_by=ml_feedback.created_by
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/models/{model_id}/metrics", response_model=ModelMetricsResponse)
async def get_model_metrics(
    model_id: int,
    db: Session = Depends(get_db)
):
    """Get comprehensive metrics for an ML model"""
    try:
        model = db.get(MLModel, model_id)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        # Count recent predictions
        recent_predictions = db.query(MLPrediction).filter(
            MLPrediction.model_id == model_id,
            MLPrediction.created_at >= datetime.now() - timedelta(days=30)
        ).count()
        
        # Count feedback
        feedback_count = db.query(MLFeedback).filter(
            MLFeedback.model_id == model_id
        ).count()
        
        return ModelMetricsResponse(
            model_id=model.id,
            accuracy=model.accuracy,
            precision=model.precision,
            recall=model.recall,
            f1_score=model.f1_score,
            auc_roc=model.auc_roc,
            confusion_matrix=model.confusion_matrix,
            feature_importance=model.feature_importance,
            recent_predictions_count=recent_predictions,
            feedback_count=feedback_count,
            active_learning_triggered=False  # Would be determined by service logic
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/models/{model_id}/deploy", response_model=dict)
async def deploy_model(
    model_id: int,
    deployment: ModelDeploymentRequest,
    user: str,
    db: Session = Depends(get_db)
):
    """Deploy ML model to production"""
    try:
        model = db.get(MLModel, model_id)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        if model.status != MLModelStatus.TRAINED:
            raise HTTPException(status_code=400, detail="Model must be trained before deployment")
        
        # Update model status to deployed
        model.status = MLModelStatus.DEPLOYED
        model.deployment_date = datetime.utcnow()
        db.commit()
        
        return {
            "message": f"Model {model.name} deployed successfully",
            "model_id": model.id,
            "deployment_date": model.deployment_date
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/predictions", response_model=List[PredictionResponse])
async def list_predictions(
    model_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    confidence_threshold: Optional[float] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List ML predictions with optional filtering"""
    try:
        query = db.query(MLPrediction)
        
        if model_id:
            query = query.filter(MLPrediction.model_id == model_id)
        if entity_type:
            query = query.filter(MLPrediction.entity_type == entity_type)
        if entity_id:
            query = query.filter(MLPrediction.entity_id == entity_id)
        if confidence_threshold:
            query = query.filter(MLPrediction.confidence_score >= confidence_threshold)
        
        predictions = query.order_by(MLPrediction.created_at.desc()).limit(limit).all()
        
        return [
            PredictionResponse(
                id=prediction.id,
                uuid=str(prediction.uuid),
                model_id=prediction.model_id,
                entity_type=prediction.entity_type,
                entity_id=prediction.entity_id,
                predicted_label=prediction.predicted_label,
                confidence_score=prediction.confidence_score,
                confidence_level=prediction.confidence_level.value,
                prediction_probabilities=prediction.prediction_probabilities or {},
                feature_contributions=prediction.feature_contributions or {},
                explanation=prediction.explanation or "",
                inference_time_ms=prediction.inference_time_ms,
                created_at=prediction.created_at
            )
            for prediction in predictions
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/feedback", response_model=List[FeedbackResponse])
async def list_feedback(
    model_id: Optional[int] = None,
    feedback_type: Optional[FeedbackType] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List ML feedback with optional filtering"""
    try:
        query = db.query(MLFeedback)
        
        if model_id:
            query = query.filter(MLFeedback.model_id == model_id)
        if feedback_type:
            query = query.filter(MLFeedback.feedback_type == feedback_type)
        
        feedbacks = query.order_by(MLFeedback.created_at.desc()).limit(limit).all()
        
        return [
            FeedbackResponse(
                id=feedback.id,
                uuid=str(feedback.uuid),
                model_id=feedback.model_id,
                prediction_id=feedback.prediction_id,
                feedback_type=feedback.feedback_type.value,
                correct_label=feedback.correct_label,
                confidence_in_feedback=feedback.confidence_in_feedback,
                explanation=feedback.explanation,
                feedback_source=feedback.feedback_source,
                domain_expert=feedback.domain_expert,
                created_at=feedback.created_at,
                created_by=feedback.created_by
            )
            for feedback in feedbacks
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))