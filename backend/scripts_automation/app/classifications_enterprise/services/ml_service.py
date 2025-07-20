import logging
import asyncio
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
import pickle
import joblib
from pathlib import Path
import uuid

# ML Libraries
try:
    import sklearn
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    import shap
except ImportError:
    logging.warning("sklearn not available, ML features will be limited")

try:
    import tensorflow as tf
    from transformers import AutoTokenizer, AutoModel, pipeline
except ImportError:
    logging.warning("tensorflow/transformers not available, deep learning features will be limited")

from ..models.ml_models import (
    MLModel, MLTrainingJob, MLPrediction, MLFeedback, MLModelVersion,
    MLModelType, MLModelStatus, TrainingJobStatus, PredictionConfidenceLevel, FeedbackType
)
from ..models.classification_models import ClassificationResult, SensitivityLabelEnum

logger = logging.getLogger(__name__)

class MLClassificationService:
    """Advanced ML service for enterprise-grade classification with full lifecycle management"""
    
    def __init__(self, model_storage_path: str = "./ml_models"):
        self.model_storage_path = Path(model_storage_path)
        self.model_storage_path.mkdir(exist_ok=True)
        self.active_models = {}  # Cache for loaded models
        
    async def create_ml_model(self, session: Session, model_config: Dict[str, Any], user: str) -> MLModel:
        """Create a new ML model with full configuration"""
        try:
            model = MLModel(
                uuid=uuid.uuid4(),
                name=model_config['name'],
                description=model_config.get('description', ''),
                model_type=MLModelType(model_config['model_type']),
                algorithm=model_config['algorithm'],
                version=model_config.get('version', '1.0.0'),
                hyperparameters=model_config.get('hyperparameters', {}),
                feature_config=model_config.get('feature_config', {}),
                preprocessing_config=model_config.get('preprocessing_config', {}),
                created_by=user
            )
            
            session.add(model)
            session.commit()
            session.refresh(model)
            
            logger.info(f"Created ML model: {model.name} (ID: {model.id})")
            return model
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating ML model: {str(e)}")
            raise
    
    async def start_training_job(self, session: Session, model_id: int, training_config: Dict[str, Any], user: str) -> MLTrainingJob:
        """Start an asynchronous ML training job"""
        try:
            model = session.get(MLModel, model_id)
            if not model:
                raise ValueError(f"Model {model_id} not found")
            
            training_job = MLTrainingJob(
                uuid=uuid.uuid4(),
                model_id=model_id,
                job_name=f"training_{model.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                training_config=training_config,
                dataset_config=training_config.get('dataset_config', {}),
                validation_config=training_config.get('validation_config', {}),
                total_epochs=training_config.get('epochs', 100),
                created_by=user,
                started_at=datetime.utcnow()
            )
            
            session.add(training_job)
            session.commit()
            session.refresh(training_job)
            
            # Start training in background
            asyncio.create_task(self._execute_training_job(session, training_job.id))
            
            logger.info(f"Started training job: {training_job.job_name}")
            return training_job
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error starting training job: {str(e)}")
            raise
    
    async def _execute_training_job(self, session: Session, job_id: int):
        """Execute the actual ML training process"""
        training_job = session.get(MLTrainingJob, job_id)
        if not training_job:
            logger.error(f"Training job {job_id} not found")
            return
        
        try:
            training_job.status = TrainingJobStatus.RUNNING
            session.commit()
            
            model = training_job.model
            config = training_job.training_config
            
            # Load and prepare data
            data = await self._load_training_data(config['dataset_config'])
            X_train, X_test, y_train, y_test = self._prepare_training_data(data, config)
            
            # Initialize ML algorithm
            ml_algorithm = self._initialize_algorithm(model.algorithm, model.hyperparameters)
            
            # Training loop with progress tracking
            start_time = datetime.utcnow()
            
            if model.model_type == MLModelType.NLP_CLASSIFIER:
                trained_model, metrics = await self._train_nlp_classifier(
                    ml_algorithm, X_train, y_train, X_test, y_test, training_job, session
                )
            elif model.model_type == MLModelType.PATTERN_RECOGNITION:
                trained_model, metrics = await self._train_pattern_classifier(
                    ml_algorithm, X_train, y_train, X_test, y_test, training_job, session
                )
            elif model.model_type == MLModelType.ANOMALY_DETECTION:
                trained_model, metrics = await self._train_anomaly_detector(
                    ml_algorithm, X_train, y_train, X_test, y_test, training_job, session
                )
            else:
                trained_model, metrics = await self._train_generic_classifier(
                    ml_algorithm, X_train, y_train, X_test, y_test, training_job, session
                )
            
            # Save trained model
            model_path = self._save_model(trained_model, model.uuid)
            
            # Update model with training results
            end_time = datetime.utcnow()
            training_duration = int((end_time - start_time).total_seconds())
            
            model.accuracy = metrics.get('accuracy', 0.0)
            model.precision = metrics.get('precision', 0.0)
            model.recall = metrics.get('recall', 0.0)
            model.f1_score = metrics.get('f1_score', 0.0)
            model.auc_roc = metrics.get('auc_roc', 0.0)
            model.confusion_matrix = metrics.get('confusion_matrix', {})
            model.feature_importance = metrics.get('feature_importance', {})
            model.model_path = str(model_path)
            model.training_time_seconds = training_duration
            model.status = MLModelStatus.TRAINED
            
            # Update training job
            training_job.status = TrainingJobStatus.COMPLETED
            training_job.completed_at = end_time
            training_job.duration_seconds = training_duration
            training_job.final_metrics = metrics
            training_job.progress_percentage = 100.0
            
            session.commit()
            
            logger.info(f"Training completed for model {model.name}: {metrics}")
            
        except Exception as e:
            training_job.status = TrainingJobStatus.FAILED
            training_job.error_message = str(e)
            training_job.completed_at = datetime.utcnow()
            session.commit()
            logger.error(f"Training failed for job {job_id}: {str(e)}")
    
    async def _train_nlp_classifier(self, algorithm, X_train, y_train, X_test, y_test, training_job, session):
        """Train NLP-specific classifier with advanced features"""
        try:
            # Text preprocessing and feature extraction
            vectorizer = TfidfVectorizer(
                max_features=10000,
                ngram_range=(1, 3),
                stop_words='english',
                lowercase=True
            )
            
            X_train_vec = vectorizer.fit_transform(X_train)
            X_test_vec = vectorizer.transform(X_test)
            
            # Train the model
            algorithm.fit(X_train_vec, y_train)
            
            # Predictions and metrics
            y_pred = algorithm.predict(X_test_vec)
            y_pred_proba = algorithm.predict_proba(X_test_vec) if hasattr(algorithm, 'predict_proba') else None
            
            metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, average='weighted'),
                'recall': recall_score(y_test, y_pred, average='weighted'),
                'f1_score': f1_score(y_test, y_pred, average='weighted'),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
            }
            
            # Feature importance for interpretability
            if hasattr(algorithm, 'feature_importances_'):
                feature_names = vectorizer.get_feature_names_out()
                importance_scores = algorithm.feature_importances_
                feature_importance = dict(zip(feature_names[:100], importance_scores[:100]))  # Top 100 features
                metrics['feature_importance'] = feature_importance
            
            # Save vectorizer with the model
            model_artifacts = {
                'model': algorithm,
                'vectorizer': vectorizer,
                'label_encoder': None
            }
            
            return model_artifacts, metrics
            
        except Exception as e:
            logger.error(f"Error in NLP classifier training: {str(e)}")
            raise
    
    async def _train_pattern_classifier(self, algorithm, X_train, y_train, X_test, y_test, training_job, session):
        """Train pattern recognition classifier"""
        try:
            # Feature engineering for pattern recognition
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train the model
            algorithm.fit(X_train_scaled, y_train)
            
            # Predictions and metrics
            y_pred = algorithm.predict(X_test_scaled)
            
            metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, average='weighted'),
                'recall': recall_score(y_test, y_pred, average='weighted'),
                'f1_score': f1_score(y_test, y_pred, average='weighted'),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
            }
            
            model_artifacts = {
                'model': algorithm,
                'scaler': scaler,
                'feature_names': X_train.columns.tolist() if hasattr(X_train, 'columns') else None
            }
            
            return model_artifacts, metrics
            
        except Exception as e:
            logger.error(f"Error in pattern classifier training: {str(e)}")
            raise
    
    async def _train_anomaly_detector(self, algorithm, X_train, y_train, X_test, y_test, training_job, session):
        """Train anomaly detection model"""
        try:
            from sklearn.ensemble import IsolationForest
            from sklearn.svm import OneClassSVM
            
            # Anomaly detection typically uses unsupervised learning
            if 'IsolationForest' in str(type(algorithm)):
                algorithm.fit(X_train)
                y_pred = algorithm.predict(X_test)
                # Convert to binary classification (1 for normal, 0 for anomaly)
                y_pred_binary = np.where(y_pred == 1, 0, 1)
            else:
                algorithm.fit(X_train, y_train)
                y_pred_binary = algorithm.predict(X_test)
            
            metrics = {
                'accuracy': accuracy_score(y_test, y_pred_binary),
                'precision': precision_score(y_test, y_pred_binary, average='weighted'),
                'recall': recall_score(y_test, y_pred_binary, average='weighted'),
                'f1_score': f1_score(y_test, y_pred_binary, average='weighted')
            }
            
            model_artifacts = {
                'model': algorithm,
                'anomaly_threshold': algorithm.score_samples(X_test).mean() if hasattr(algorithm, 'score_samples') else None
            }
            
            return model_artifacts, metrics
            
        except Exception as e:
            logger.error(f"Error in anomaly detector training: {str(e)}")
            raise
    
    async def _train_generic_classifier(self, algorithm, X_train, y_train, X_test, y_test, training_job, session):
        """Train generic classifier"""
        try:
            # Train the model
            algorithm.fit(X_train, y_train)
            
            # Predictions and metrics
            y_pred = algorithm.predict(X_test)
            
            metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, average='weighted'),
                'recall': recall_score(y_test, y_pred, average='weighted'),
                'f1_score': f1_score(y_test, y_pred, average='weighted'),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
            }
            
            model_artifacts = {
                'model': algorithm
            }
            
            return model_artifacts, metrics
            
        except Exception as e:
            logger.error(f"Error in generic classifier training: {str(e)}")
            raise
    
    async def predict_classification(self, session: Session, model_id: int, entity_type: str, entity_id: str, input_data: str, user: str) -> MLPrediction:
        """Make ML-based classification prediction"""
        try:
            model = session.get(MLModel, model_id)
            if not model or model.status != MLModelStatus.DEPLOYED:
                raise ValueError(f"Model {model_id} not available for prediction")
            
            # Load model artifacts
            model_artifacts = self._load_model(model.uuid)
            
            # Preprocess input data
            processed_data = self._preprocess_prediction_data(input_data, model_artifacts, model.model_type)
            
            # Make prediction
            start_time = datetime.utcnow()
            
            if model.model_type == MLModelType.NLP_CLASSIFIER:
                prediction_result = self._predict_nlp(processed_data, model_artifacts)
            elif model.model_type == MLModelType.ANOMALY_DETECTION:
                prediction_result = self._predict_anomaly(processed_data, model_artifacts)
            else:
                prediction_result = self._predict_generic(processed_data, model_artifacts)
            
            end_time = datetime.utcnow()
            inference_time = (end_time - start_time).total_seconds() * 1000  # milliseconds
            
            # Determine confidence level
            confidence_level = self._determine_confidence_level(prediction_result['confidence'])
            
            # Create prediction record
            prediction = MLPrediction(
                uuid=uuid.uuid4(),
                model_id=model_id,
                entity_type=entity_type,
                entity_id=entity_id,
                input_data=input_data,
                input_features=prediction_result.get('features', {}),
                predicted_label=prediction_result['predicted_label'],
                confidence_score=prediction_result['confidence'],
                confidence_level=confidence_level,
                prediction_probabilities=prediction_result.get('probabilities', {}),
                feature_contributions=prediction_result.get('feature_contributions', {}),
                important_features=prediction_result.get('important_features', {}),
                explanation=prediction_result.get('explanation', ''),
                inference_time_ms=inference_time,
                model_version_used=model.version,
                created_by=user
            )
            
            session.add(prediction)
            session.commit()
            session.refresh(prediction)
            
            logger.info(f"ML prediction made: {prediction.predicted_label} (confidence: {prediction.confidence_score:.3f})")
            return prediction
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error making prediction: {str(e)}")
            raise
    
    async def submit_feedback(self, session: Session, prediction_id: int, feedback_data: Dict[str, Any], user: str) -> MLFeedback:
        """Submit feedback for active learning"""
        try:
            prediction = session.get(MLPrediction, prediction_id)
            if not prediction:
                raise ValueError(f"Prediction {prediction_id} not found")
            
            feedback = MLFeedback(
                uuid=uuid.uuid4(),
                model_id=prediction.model_id,
                prediction_id=prediction_id,
                feedback_type=FeedbackType(feedback_data['feedback_type']),
                correct_label=feedback_data.get('correct_label'),
                confidence_in_feedback=feedback_data.get('confidence_in_feedback', 1.0),
                explanation=feedback_data.get('explanation', ''),
                feedback_source=feedback_data.get('feedback_source', 'manual'),
                domain_expert=feedback_data.get('domain_expert', False),
                created_by=user
            )
            
            session.add(feedback)
            
            # Update prediction with feedback status
            prediction.feedback_provided = True
            prediction.validation_result = feedback_data['feedback_type']
            
            session.commit()
            session.refresh(feedback)
            
            # Trigger active learning if enough feedback collected
            await self._check_active_learning_trigger(session, prediction.model_id)
            
            logger.info(f"Feedback submitted for prediction {prediction_id}")
            return feedback
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error submitting feedback: {str(e)}")
            raise
    
    async def _check_active_learning_trigger(self, session: Session, model_id: int):
        """Check if active learning should be triggered"""
        try:
            # Count recent feedback
            feedback_count = session.query(MLFeedback).filter(
                MLFeedback.model_id == model_id,
                MLFeedback.created_at >= datetime.utcnow() - timedelta(days=7),
                MLFeedback.is_used_for_training == False
            ).count()
            
            # Trigger retraining if enough feedback
            if feedback_count >= 100:  # Configurable threshold
                await self._trigger_active_learning(session, model_id)
                
        except Exception as e:
            logger.error(f"Error checking active learning trigger: {str(e)}")
    
    async def _trigger_active_learning(self, session: Session, model_id: int):
        """Trigger active learning retraining"""
        try:
            model = session.get(MLModel, model_id)
            if not model:
                return
            
            # Collect feedback data for retraining
            feedback_data = self._collect_feedback_for_training(session, model_id)
            
            if len(feedback_data) < 50:  # Minimum feedback required
                return
            
            # Create new training configuration with feedback data
            training_config = {
                'dataset_config': {
                    'feedback_data': feedback_data,
                    'include_active_learning': True
                },
                'epochs': 50,  # Reduced epochs for incremental learning
                'learning_rate': 0.001
            }
            
            # Start incremental training job
            await self.start_training_job(
                session, 
                model_id, 
                training_config, 
                'active_learning_system'
            )
            
            logger.info(f"Active learning triggered for model {model_id}")
            
        except Exception as e:
            logger.error(f"Error triggering active learning: {str(e)}")
    
    def _initialize_algorithm(self, algorithm_name: str, hyperparameters: Dict[str, Any]):
        """Initialize ML algorithm with hyperparameters"""
        if algorithm_name == "RandomForestClassifier":
            return RandomForestClassifier(**hyperparameters)
        elif algorithm_name == "GradientBoostingClassifier":
            return GradientBoostingClassifier(**hyperparameters)
        elif algorithm_name == "SVM":
            from sklearn.svm import SVC
            return SVC(**hyperparameters)
        elif algorithm_name == "LogisticRegression":
            from sklearn.linear_model import LogisticRegression
            return LogisticRegression(**hyperparameters)
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm_name}")
    
    def _save_model(self, model_artifacts: Dict[str, Any], model_uuid: uuid.UUID) -> Path:
        """Save trained model artifacts"""
        model_path = self.model_storage_path / f"{model_uuid}.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(model_artifacts, f)
        return model_path
    
    def _load_model(self, model_uuid: uuid.UUID) -> Dict[str, Any]:
        """Load trained model artifacts"""
        if model_uuid in self.active_models:
            return self.active_models[model_uuid]
        
        model_path = self.model_storage_path / f"{model_uuid}.pkl"
        with open(model_path, 'rb') as f:
            model_artifacts = pickle.load(f)
        
        self.active_models[model_uuid] = model_artifacts
        return model_artifacts
    
    def _determine_confidence_level(self, confidence_score: float) -> PredictionConfidenceLevel:
        """Determine confidence level based on score"""
        if confidence_score >= 0.9:
            return PredictionConfidenceLevel.VERY_HIGH
        elif confidence_score >= 0.8:
            return PredictionConfidenceLevel.HIGH
        elif confidence_score >= 0.6:
            return PredictionConfidenceLevel.MEDIUM
        elif confidence_score >= 0.4:
            return PredictionConfidenceLevel.LOW
        else:
            return PredictionConfidenceLevel.VERY_LOW
    
    async def _load_training_data(self, dataset_config: Dict[str, Any]) -> pd.DataFrame:
        """Load training data from various sources"""
        # This would be implemented based on your data sources
        # For now, return mock data structure
        return pd.DataFrame({
            'text': ['sample text 1', 'sample text 2'],
            'label': ['PII', 'PUBLIC']
        })
    
    def _prepare_training_data(self, data: pd.DataFrame, config: Dict[str, Any]) -> Tuple:
        """Prepare data for training"""
        X = data.drop('label', axis=1)
        y = data['label']
        return train_test_split(X, y, test_size=0.2, random_state=42)
    
    def _preprocess_prediction_data(self, input_data: str, model_artifacts: Dict[str, Any], model_type: MLModelType) -> Any:
        """Preprocess input data for prediction"""
        if model_type == MLModelType.NLP_CLASSIFIER:
            vectorizer = model_artifacts.get('vectorizer')
            if vectorizer:
                return vectorizer.transform([input_data])
        return input_data
    
    def _predict_nlp(self, processed_data: Any, model_artifacts: Dict[str, Any]) -> Dict[str, Any]:
        """Make NLP prediction"""
        model = model_artifacts['model']
        prediction = model.predict(processed_data)[0]
        confidence = model.predict_proba(processed_data)[0].max()
        
        return {
            'predicted_label': prediction,
            'confidence': confidence,
            'probabilities': dict(zip(model.classes_, model.predict_proba(processed_data)[0]))
        }
    
    def _predict_anomaly(self, processed_data: Any, model_artifacts: Dict[str, Any]) -> Dict[str, Any]:
        """Make anomaly prediction"""
        model = model_artifacts['model']
        prediction = model.predict([processed_data])[0]
        
        return {
            'predicted_label': 'anomaly' if prediction == -1 else 'normal',
            'confidence': 0.8  # Placeholder confidence
        }
    
    def _predict_generic(self, processed_data: Any, model_artifacts: Dict[str, Any]) -> Dict[str, Any]:
        """Make generic prediction"""
        model = model_artifacts['model']
        prediction = model.predict([processed_data])[0]
        confidence = model.predict_proba([processed_data])[0].max() if hasattr(model, 'predict_proba') else 0.8
        
        return {
            'predicted_label': prediction,
            'confidence': confidence
        }
    
    def _collect_feedback_for_training(self, session: Session, model_id: int) -> List[Dict[str, Any]]:
        """Collect feedback data for active learning"""
        feedback_records = session.query(MLFeedback).filter(
            MLFeedback.model_id == model_id,
            MLFeedback.is_used_for_training == False
        ).all()
        
        feedback_data = []
        for feedback in feedback_records:
            prediction = feedback.prediction
            feedback_data.append({
                'input_data': prediction.input_data,
                'correct_label': feedback.correct_label,
                'feedback_type': feedback.feedback_type.value,
                'training_weight': feedback.training_weight
            })
            
            # Mark as used for training
            feedback.is_used_for_training = True
        
        session.commit()
        return feedback_data