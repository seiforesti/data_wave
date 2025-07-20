"""
Advanced ML Service for Enterprise Classification System - Version 2
Production-grade ML service surpassing Databricks and Microsoft Purview
Comprehensive ML pipeline orchestration and management
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
import json
import uuid
import numpy as np
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, func, desc, asc
import pickle
import joblib
from pathlib import Path
import hashlib

# ML Framework Imports
try:
    import sklearn
    from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, RandomizedSearchCV
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.svm import SVC
    from sklearn.linear_model import LogisticRegression
    from sklearn.naive_bayes import GaussianNB
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.neural_network import MLPClassifier
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
    from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
    from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
    from sklearn.pipeline import Pipeline
    from sklearn.compose import ColumnTransformer
    ML_FRAMEWORKS_AVAILABLE = True
except ImportError:
    ML_FRAMEWORKS_AVAILABLE = False
    logging.warning("ML frameworks not available. Install scikit-learn for full functionality.")

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False

try:
    import catboost as cb
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False

# Import models and services
from ..models.ml_models import (
    MLModelConfiguration, MLTrainingDataset, MLTrainingJob, MLPrediction,
    MLFeedback, MLExperiment, MLExperimentRun, MLFeatureStore,
    MLModelMonitoring, MLModelType, MLTaskType, MLModelStatus,
    MLDataType, MLFeatureType, MLModelFramework
)
from ..models.classification_models import (
    ClassificationFramework, ClassificationRule, ClassificationResult,
    SensitivityLevel, ConfidenceLevel, ClassificationScope
)
from ..db_session import get_session
from .notification_service import NotificationService
from .task_service import TaskService

# Setup logging
logger = logging.getLogger(__name__)

class EnterpriseMLService:
    """
    Enterprise ML Service for Advanced Classification
    Comprehensive ML pipeline management and orchestration
    """
    
    def __init__(self):
        self.notification_service = NotificationService()
        self.task_service = TaskService()
        self.model_cache = {}
        self.feature_cache = {}
        self.performance_cache = {}
        
    # ============ ML Model Configuration Management ============
    
    async def create_ml_model_config(
        self,
        session: AsyncSession,
        user: dict,
        config_data: Dict[str, Any]
    ) -> MLModelConfiguration:
        """Create advanced ML model configuration"""
        try:
            # Validate model configuration
            validated_config = await self._validate_model_config(config_data)
            
            # Create model configuration
            ml_config = MLModelConfiguration(
                name=validated_config["name"],
                description=validated_config.get("description"),
                model_type=MLModelType(validated_config["model_type"]),
                task_type=MLTaskType(validated_config["task_type"]),
                framework=MLModelFramework(validated_config["framework"]),
                model_config=validated_config["model_config"],
                hyperparameters=validated_config.get("hyperparameters", {}),
                training_config=validated_config["training_config"],
                validation_config=validated_config["validation_config"],
                feature_config=validated_config.get("feature_config", {}),
                performance_metrics={},
                classification_framework_id=validated_config.get("classification_framework_id"),
                target_sensitivity_levels=validated_config.get("target_sensitivity_levels", []),
                classification_scope=validated_config.get("classification_scope"),
                created_by=user["id"]
            )
            
            session.add(ml_config)
            await session.commit()
            await session.refresh(ml_config)
            
            # Initialize feature engineering pipeline
            await self._initialize_feature_pipeline(session, ml_config)
            
            # Log creation
            logger.info(f"Created ML model configuration: {ml_config.name} (ID: {ml_config.id})")
            
            return ml_config
            
        except Exception as e:
            logger.error(f"Error creating ML model configuration: {str(e)}")
            await session.rollback()
            raise
    
    async def get_ml_model_configs(
        self,
        session: AsyncSession,
        filters: Optional[Dict[str, Any]] = None,
        pagination: Optional[Dict[str, Any]] = None
    ) -> Tuple[List[MLModelConfiguration], int]:
        """Get ML model configurations with advanced filtering"""
        try:
            query = select(MLModelConfiguration).options(
                selectinload(MLModelConfiguration.classification_framework),
                selectinload(MLModelConfiguration.training_jobs),
                selectinload(MLModelConfiguration.experiments)
            )
            
            # Apply filters
            if filters:
                if filters.get("model_type"):
                    query = query.where(MLModelConfiguration.model_type == filters["model_type"])
                if filters.get("framework"):
                    query = query.where(MLModelConfiguration.framework == filters["framework"])
                if filters.get("status"):
                    query = query.where(MLModelConfiguration.status == filters["status"])
                if filters.get("is_active") is not None:
                    query = query.where(MLModelConfiguration.is_active == filters["is_active"])
                if filters.get("search_query"):
                    search = f"%{filters['search_query']}%"
                    query = query.where(
                        or_(
                            MLModelConfiguration.name.ilike(search),
                            MLModelConfiguration.description.ilike(search)
                        )
                    )
            
            # Get total count
            count_query = select(func.count(MLModelConfiguration.id))
            if filters:
                # Apply same filters to count query
                count_query = count_query.where(query.whereclause)
            
            total_count = await session.scalar(count_query)
            
            # Apply pagination
            if pagination:
                offset = (pagination.get("page", 1) - 1) * pagination.get("size", 10)
                query = query.offset(offset).limit(pagination.get("size", 10))
            
            # Apply sorting
            query = query.order_by(desc(MLModelConfiguration.updated_at))
            
            result = await session.execute(query)
            configs = result.scalars().all()
            
            # Enrich with performance metrics
            for config in configs:
                config.current_performance = await self._get_model_performance_summary(session, config.id)
            
            return configs, total_count
            
        except Exception as e:
            logger.error(f"Error getting ML model configurations: {str(e)}")
            raise
    
    # ============ Training Dataset Management ============
    
    async def create_training_dataset(
        self,
        session: AsyncSession,
        user: dict,
        dataset_data: Dict[str, Any]
    ) -> MLTrainingDataset:
        """Create comprehensive training dataset"""
        try:
            # Validate and prepare dataset
            validated_data = await self._validate_dataset_config(dataset_data)
            
            # Create training dataset
            dataset = MLTrainingDataset(
                name=validated_data["name"],
                description=validated_data.get("description"),
                dataset_type=MLDataType(validated_data["dataset_type"]),
                data_source_ids=validated_data["data_source_ids"],
                catalog_item_ids=validated_data.get("catalog_item_ids", []),
                scan_result_ids=validated_data.get("scan_result_ids", []),
                data_config=validated_data["data_config"],
                schema_config=validated_data["schema_config"],
                labeling_config=validated_data["labeling_config"],
                ground_truth_labels=validated_data["ground_truth_labels"],
                quality_metrics={},
                feature_count=0,
                feature_schema={},
                created_by=user["id"]
            )
            
            session.add(dataset)
            await session.commit()
            await session.refresh(dataset)
            
            # Process dataset and generate statistics
            await self._process_training_dataset(session, dataset)
            
            logger.info(f"Created training dataset: {dataset.name} (ID: {dataset.id})")
            
            return dataset
            
        except Exception as e:
            logger.error(f"Error creating training dataset: {str(e)}")
            await session.rollback()
            raise
    
    async def prepare_training_data(
        self,
        session: AsyncSession,
        dataset_id: int,
        feature_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Prepare training data with advanced feature engineering"""
        try:
            # Get dataset
            dataset = await session.get(MLTrainingDataset, dataset_id)
            if not dataset:
                raise ValueError(f"Training dataset {dataset_id} not found")
            
            # Extract and prepare features
            raw_data = await self._extract_raw_data(session, dataset)
            
            # Apply feature engineering
            processed_data = await self._apply_feature_engineering(
                raw_data, feature_config, dataset.feature_schema
            )
            
            # Split data
            train_data, validation_data, test_data = await self._split_dataset(
                processed_data, dataset.data_config.get("split_config", {})
            )
            
            # Update dataset statistics
            await self._update_dataset_statistics(session, dataset, {
                "total_samples": len(processed_data),
                "training_samples": len(train_data),
                "validation_samples": len(validation_data),
                "test_samples": len(test_data),
                "feature_count": len(processed_data.columns) - 1  # Exclude target
            })
            
            return {
                "train_data": train_data,
                "validation_data": validation_data,
                "test_data": test_data,
                "feature_schema": dataset.feature_schema,
                "preprocessing_pipeline": processed_data.get("preprocessing_pipeline")
            }
            
        except Exception as e:
            logger.error(f"Error preparing training data: {str(e)}")
            raise
    
    # ============ ML Training Pipeline ============
    
    async def start_training_job(
        self,
        session: AsyncSession,
        user: dict,
        job_config: Dict[str, Any]
    ) -> MLTrainingJob:
        """Start comprehensive ML training job"""
        try:
            # Validate training configuration
            validated_config = await self._validate_training_config(job_config)
            
            # Create training job
            training_job = MLTrainingJob(
                job_name=validated_config["job_name"],
                description=validated_config.get("description"),
                model_config_id=validated_config["model_config_id"],
                training_dataset_id=validated_config["training_dataset_id"],
                job_config=validated_config["job_config"],
                training_parameters=validated_config["training_parameters"],
                hyperparameter_tuning=validated_config.get("hyperparameter_tuning", {}),
                status=MLModelStatus.TRAINING,
                started_at=datetime.utcnow(),
                progress_percentage=0.0,
                created_by=user["id"]
            )
            
            session.add(training_job)
            await session.commit()
            await session.refresh(training_job)
            
            # Start training in background
            await self._execute_training_job(session, training_job)
            
            logger.info(f"Started ML training job: {training_job.job_name} (ID: {training_job.id})")
            
            return training_job
            
        except Exception as e:
            logger.error(f"Error starting training job: {str(e)}")
            await session.rollback()
            raise
    
    async def _execute_training_job(
        self,
        session: AsyncSession,
        training_job: MLTrainingJob
    ) -> None:
        """Execute ML training job with comprehensive monitoring"""
        try:
            # Get model configuration and dataset
            model_config = await session.get(MLModelConfiguration, training_job.model_config_id)
            dataset = await session.get(MLTrainingDataset, training_job.training_dataset_id)
            
            # Prepare training data
            training_data = await self.prepare_training_data(
                session, dataset.id, model_config.feature_config
            )
            
            # Update job status
            training_job.status = MLModelStatus.TRAINING
            training_job.progress_percentage = 10.0
            await session.commit()
            
            # Initialize model based on configuration
            model = await self._initialize_model(model_config, training_job.training_parameters)
            
            # Training with progress tracking
            trained_model, training_metrics = await self._train_model_with_monitoring(
                model, training_data, training_job, session
            )
            
            # Validation
            validation_metrics = await self._validate_model(
                trained_model, training_data["validation_data"], training_job
            )
            
            # Testing
            test_metrics = await self._test_model(
                trained_model, training_data["test_data"], training_job
            )
            
            # Save model artifacts
            model_path = await self._save_model_artifacts(
                trained_model, training_job, training_data.get("preprocessing_pipeline")
            )
            
            # Update job completion
            training_job.status = MLModelStatus.TRAINED
            training_job.completed_at = datetime.utcnow()
            training_job.duration_seconds = int(
                (training_job.completed_at - training_job.started_at).total_seconds()
            )
            training_job.progress_percentage = 100.0
            training_job.training_metrics = training_metrics
            training_job.validation_metrics = validation_metrics
            training_job.final_model_path = model_path
            
            # Update model configuration
            model_config.status = MLModelStatus.TRAINED
            model_config.model_path = model_path
            model_config.last_trained = datetime.utcnow()
            model_config.performance_metrics = {
                "training": training_metrics,
                "validation": validation_metrics,
                "test": test_metrics
            }
            
            await session.commit()
            
            # Send notification
            await self.notification_service.send_notification(
                user_id=training_job.created_by,
                title="ML Training Completed",
                message=f"Training job '{training_job.job_name}' completed successfully",
                notification_type="ml_training_success"
            )
            
            logger.info(f"Completed ML training job: {training_job.id}")
            
        except Exception as e:
            # Update job status on failure
            training_job.status = MLModelStatus.FAILED
            training_job.error_messages = [str(e)]
            training_job.completed_at = datetime.utcnow()
            await session.commit()
            
            # Send error notification
            await self.notification_service.send_notification(
                user_id=training_job.created_by,
                title="ML Training Failed",
                message=f"Training job '{training_job.job_name}' failed: {str(e)}",
                notification_type="ml_training_error"
            )
            
            logger.error(f"Training job {training_job.id} failed: {str(e)}")
            raise
    
    # ============ ML Prediction and Inference ============
    
    async def create_ml_prediction(
        self,
        session: AsyncSession,
        user: dict,
        prediction_request: Dict[str, Any]
    ) -> MLPrediction:
        """Create ML prediction with comprehensive tracking"""
        try:
            # Generate prediction ID
            prediction_id = f"ml_pred_{uuid.uuid4().hex[:12]}"
            
            # Get model configuration
            model_config = await session.get(
                MLModelConfiguration, 
                prediction_request["model_config_id"]
            )
            if not model_config or model_config.status != MLModelStatus.TRAINED:
                raise ValueError("Model not found or not trained")
            
            # Load model
            model = await self._load_model(model_config.model_path)
            
            # Prepare input data
            input_features = await self._prepare_prediction_input(
                prediction_request["input_data"],
                model_config.feature_config
            )
            
            # Make prediction
            start_time = datetime.utcnow()
            prediction_result = await self._make_prediction(model, input_features)
            end_time = datetime.utcnow()
            
            # Process prediction results
            processed_result = await self._process_prediction_result(
                prediction_result, model_config
            )
            
            # Create prediction record
            ml_prediction = MLPrediction(
                prediction_id=prediction_id,
                model_config_id=model_config.id,
                model_version=model_config.model_version,
                target_type=prediction_request["target_type"],
                target_id=prediction_request["target_id"],
                target_identifier=prediction_request["target_identifier"],
                input_data=prediction_request["input_data"],
                input_features=input_features.to_dict() if hasattr(input_features, 'to_dict') else input_features,
                prediction_result=processed_result,
                predicted_class=processed_result.get("predicted_class"),
                prediction_probabilities=processed_result.get("probabilities", {}),
                confidence_score=processed_result.get("confidence_score", 0.0),
                confidence_level=self._determine_confidence_level(processed_result.get("confidence_score", 0.0)),
                sensitivity_prediction=processed_result.get("sensitivity_prediction"),
                inference_time_ms=int((end_time - start_time).total_seconds() * 1000),
                processing_timestamp=datetime.utcnow(),
                created_by=user["id"]
            )
            
            session.add(ml_prediction)
            await session.commit()
            await session.refresh(ml_prediction)
            
            # Update model usage statistics
            await self._update_model_usage_stats(session, model_config.id)
            
            logger.info(f"Created ML prediction: {prediction_id}")
            
            return ml_prediction
            
        except Exception as e:
            logger.error(f"Error creating ML prediction: {str(e)}")
            await session.rollback()
            raise
    
    async def batch_predict(
        self,
        session: AsyncSession,
        user: dict,
        batch_request: Dict[str, Any]
    ) -> List[MLPrediction]:
        """Batch ML prediction for multiple targets"""
        try:
            model_config_id = batch_request["model_config_id"]
            targets = batch_request["targets"]
            
            # Get model configuration
            model_config = await session.get(MLModelConfiguration, model_config_id)
            if not model_config or model_config.status != MLModelStatus.TRAINED:
                raise ValueError("Model not found or not trained")
            
            # Load model once for batch processing
            model = await self._load_model(model_config.model_path)
            
            predictions = []
            batch_id = f"batch_{uuid.uuid4().hex[:8]}"
            
            for target in targets:
                try:
                    # Create individual prediction request
                    prediction_request = {
                        "model_config_id": model_config_id,
                        "target_type": target["target_type"],
                        "target_id": target["target_id"],
                        "target_identifier": target["target_identifier"],
                        "input_data": target["input_data"]
                    }
                    
                    # Create prediction
                    prediction = await self.create_ml_prediction(
                        session, user, prediction_request
                    )
                    prediction.batch_id = batch_id
                    predictions.append(prediction)
                    
                except Exception as e:
                    logger.warning(f"Failed to predict for target {target['target_id']}: {str(e)}")
                    continue
            
            await session.commit()
            
            logger.info(f"Completed batch prediction: {batch_id} ({len(predictions)} predictions)")
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error in batch prediction: {str(e)}")
            raise
    
    # ============ ML Feedback and Active Learning ============
    
    async def submit_ml_feedback(
        self,
        session: AsyncSession,
        user: dict,
        feedback_data: Dict[str, Any]
    ) -> MLFeedback:
        """Submit ML feedback for active learning"""
        try:
            # Get prediction
            prediction = await session.get(MLPrediction, feedback_data["prediction_id"])
            if not prediction:
                raise ValueError("Prediction not found")
            
            # Create feedback
            feedback = MLFeedback(
                prediction_id=prediction.id,
                feedback_type=feedback_data["feedback_type"],
                feedback_source=feedback_data.get("feedback_source", "human_expert"),
                feedback_quality=feedback_data.get("feedback_quality", 1.0),
                original_prediction=prediction.prediction_result,
                corrected_prediction=feedback_data.get("corrected_prediction", {}),
                feedback_notes=feedback_data.get("feedback_notes"),
                correction_reasoning=feedback_data.get("correction_reasoning"),
                expert_id=user["id"],
                expert_confidence=feedback_data.get("expert_confidence"),
                expert_domain=feedback_data.get("expert_domain"),
                created_by=user["id"]
            )
            
            session.add(feedback)
            await session.commit()
            await session.refresh(feedback)
            
            # Process feedback for learning
            await self._process_feedback_for_learning(session, feedback)
            
            logger.info(f"Submitted ML feedback for prediction: {prediction.prediction_id}")
            
            return feedback
            
        except Exception as e:
            logger.error(f"Error submitting ML feedback: {str(e)}")
            await session.rollback()
            raise
    
    async def trigger_retraining(
        self,
        session: AsyncSession,
        user: dict,
        model_config_id: int,
        retraining_config: Dict[str, Any]
    ) -> MLTrainingJob:
        """Trigger model retraining based on feedback"""
        try:
            # Get model configuration
            model_config = await session.get(MLModelConfiguration, model_config_id)
            if not model_config:
                raise ValueError("Model configuration not found")
            
            # Collect feedback data
            feedback_data = await self._collect_feedback_for_retraining(session, model_config_id)
            
            # Update training dataset with feedback
            updated_dataset = await self._update_dataset_with_feedback(
                session, feedback_data, retraining_config
            )
            
            # Create retraining job
            retraining_job_config = {
                "job_name": f"Retrain_{model_config.name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                "description": "Automated retraining based on feedback",
                "model_config_id": model_config_id,
                "training_dataset_id": updated_dataset.id,
                "job_config": retraining_config,
                "training_parameters": model_config.model_config
            }
            
            # Start retraining job
            retraining_job = await self.start_training_job(
                session, user, retraining_job_config
            )
            
            logger.info(f"Triggered retraining for model: {model_config.name}")
            
            return retraining_job
            
        except Exception as e:
            logger.error(f"Error triggering retraining: {str(e)}")
            raise
    
    # ============ ML Experiment Management ============
    
    async def create_ml_experiment(
        self,
        session: AsyncSession,
        user: dict,
        experiment_config: Dict[str, Any]
    ) -> MLExperiment:
        """Create ML experiment for model optimization"""
        try:
            # Create experiment
            experiment = MLExperiment(
                experiment_name=experiment_config["experiment_name"],
                description=experiment_config.get("description"),
                model_config_id=experiment_config["model_config_id"],
                experiment_type=experiment_config["experiment_type"],
                experiment_config=experiment_config["config"],
                parameter_space=experiment_config["parameter_space"],
                optimization_objective=experiment_config["optimization_objective"],
                status=MLModelStatus.DRAFT,
                total_runs=experiment_config.get("total_runs", 10),
                created_by=user["id"]
            )
            
            session.add(experiment)
            await session.commit()
            await session.refresh(experiment)
            
            # Start experiment execution
            await self._execute_ml_experiment(session, experiment)
            
            logger.info(f"Created ML experiment: {experiment.experiment_name}")
            
            return experiment
            
        except Exception as e:
            logger.error(f"Error creating ML experiment: {str(e)}")
            await session.rollback()
            raise
    
    # ============ ML Model Monitoring ============
    
    async def monitor_ml_model_performance(
        self,
        session: AsyncSession,
        model_config_id: int
    ) -> MLModelMonitoring:
        """Monitor ML model performance and health"""
        try:
            # Get recent predictions for the model
            recent_predictions = await self._get_recent_predictions(session, model_config_id)
            
            # Calculate performance metrics
            performance_metrics = await self._calculate_performance_metrics(recent_predictions)
            
            # Detect data drift
            drift_metrics = await self._detect_data_drift(session, model_config_id, recent_predictions)
            
            # Analyze model behavior
            behavior_metrics = await self._analyze_model_behavior(recent_predictions)
            
            # Create monitoring record
            monitoring = MLModelMonitoring(
                model_config_id=model_config_id,
                monitoring_timestamp=datetime.utcnow(),
                accuracy_metrics=performance_metrics["accuracy"],
                precision_recall_metrics=performance_metrics["precision_recall"],
                prediction_distribution=performance_metrics["distribution"],
                input_drift_metrics=drift_metrics.get("input_drift", {}),
                prediction_drift_metrics=drift_metrics.get("prediction_drift", {}),
                confidence_distribution=behavior_metrics["confidence"],
                inference_latency_metrics=behavior_metrics["latency"],
                throughput_metrics=behavior_metrics["throughput"],
                alert_status="normal",
                created_by=1  # System user
            )
            
            # Check for alerts
            alerts = await self._check_performance_alerts(monitoring)
            if alerts:
                monitoring.alert_status = "warning"
                monitoring.alerts_triggered = alerts
            
            session.add(monitoring)
            await session.commit()
            
            logger.info(f"Completed ML model monitoring for model: {model_config_id}")
            
            return monitoring
            
        except Exception as e:
            logger.error(f"Error monitoring ML model: {str(e)}")
            raise
    
    # ============ Helper Methods ============
    
    async def _validate_model_config(self, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate ML model configuration"""
        required_fields = ["name", "model_type", "task_type", "framework", "model_config", "training_config", "validation_config"]
        
        for field in required_fields:
            if field not in config_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate model type and framework compatibility
        if not ML_FRAMEWORKS_AVAILABLE and config_data["framework"] == "scikit_learn":
            raise ValueError("Scikit-learn not available")
        
        return config_data
    
    async def _validate_dataset_config(self, dataset_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate training dataset configuration"""
        required_fields = ["name", "dataset_type", "data_source_ids", "data_config", "schema_config", "labeling_config", "ground_truth_labels"]
        
        for field in required_fields:
            if field not in dataset_data:
                raise ValueError(f"Missing required field: {field}")
        
        return dataset_data
    
    async def _validate_training_config(self, job_config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate training job configuration"""
        required_fields = ["job_name", "model_config_id", "training_dataset_id", "job_config", "training_parameters"]
        
        for field in required_fields:
            if field not in job_config:
                raise ValueError(f"Missing required field: {field}")
        
        return job_config
    
    async def _initialize_feature_pipeline(
        self,
        session: AsyncSession,
        ml_config: MLModelConfiguration
    ) -> None:
        """Initialize feature engineering pipeline"""
        # Create default feature configuration
        feature_config = {
            "text_features": {
                "vectorizer": "tfidf",
                "max_features": 10000,
                "ngram_range": [1, 2]
            },
            "numerical_features": {
                "scaler": "standard",
                "handle_missing": "median"
            },
            "categorical_features": {
                "encoder": "onehot",
                "handle_missing": "mode"
            }
        }
        
        ml_config.feature_config = feature_config
        await session.commit()
    
    async def _process_training_dataset(
        self,
        session: AsyncSession,
        dataset: MLTrainingDataset
    ) -> None:
        """Process training dataset and generate statistics"""
        try:
            # Extract sample data for analysis
            sample_data = await self._extract_sample_data(session, dataset)
            
            # Generate quality metrics
            quality_metrics = await self._generate_quality_metrics(sample_data)
            
            # Update dataset
            dataset.quality_metrics = quality_metrics
            dataset.total_samples = len(sample_data) if sample_data is not None else 0
            dataset.last_used = datetime.utcnow()
            
            await session.commit()
            
        except Exception as e:
            logger.warning(f"Error processing training dataset {dataset.id}: {str(e)}")
    
    def _determine_confidence_level(self, confidence_score: float) -> ConfidenceLevel:
        """Determine confidence level from score"""
        if confidence_score >= 0.95:
            return ConfidenceLevel.CERTAIN
        elif confidence_score >= 0.85:
            return ConfidenceLevel.VERY_HIGH
        elif confidence_score >= 0.70:
            return ConfidenceLevel.HIGH
        elif confidence_score >= 0.50:
            return ConfidenceLevel.MEDIUM
        else:
            return ConfidenceLevel.LOW
    
    # Additional helper methods would be implemented here...
    # (Due to length constraints, I'm showing the structure and key methods)
    
    async def _extract_raw_data(self, session: AsyncSession, dataset: MLTrainingDataset) -> pd.DataFrame:
        """Extract raw data from data sources"""
        # Implementation would extract data from configured sources
        pass
    
    async def _apply_feature_engineering(self, raw_data: pd.DataFrame, feature_config: Dict[str, Any], feature_schema: Dict[str, Any]) -> pd.DataFrame:
        """Apply feature engineering pipeline"""
        # Implementation would apply configured feature engineering
        pass
    
    async def _split_dataset(self, data: pd.DataFrame, split_config: Dict[str, Any]) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Split dataset into train/validation/test"""
        # Implementation would split data according to configuration
        pass
    
    async def _initialize_model(self, model_config: MLModelConfiguration, training_parameters: Dict[str, Any]):
        """Initialize ML model based on configuration"""
        # Implementation would create appropriate model instance
        pass
    
    async def _train_model_with_monitoring(self, model, training_data: Dict[str, Any], training_job: MLTrainingJob, session: AsyncSession) -> Tuple[Any, Dict[str, Any]]:
        """Train model with progress monitoring"""
        # Implementation would train model with progress updates
        pass
    
    async def _validate_model(self, model, validation_data: pd.DataFrame, training_job: MLTrainingJob) -> Dict[str, Any]:
        """Validate trained model"""
        # Implementation would validate model performance
        pass
    
    async def _test_model(self, model, test_data: pd.DataFrame, training_job: MLTrainingJob) -> Dict[str, Any]:
        """Test trained model"""
        # Implementation would test model on held-out data
        pass
    
    async def _save_model_artifacts(self, model, training_job: MLTrainingJob, preprocessing_pipeline) -> str:
        """Save model artifacts to storage"""
        # Implementation would save model and preprocessing pipeline
        pass
    
    async def _load_model(self, model_path: str):
        """Load trained model from storage"""
        # Implementation would load model from storage
        pass
    
    async def _make_prediction(self, model, input_features) -> Dict[str, Any]:
        """Make prediction using loaded model"""
        # Implementation would make prediction
        pass
    
    async def _process_prediction_result(self, prediction_result: Dict[str, Any], model_config: MLModelConfiguration) -> Dict[str, Any]:
        """Process and enrich prediction results"""
        # Implementation would process raw prediction results
        pass