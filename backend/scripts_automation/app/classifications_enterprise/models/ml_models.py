from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum, JSON, Float, func, LargeBinary
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
import uuid

Base = declarative_base()

class MLModelType(enum.Enum):
    NLP_CLASSIFIER = "nlp_classifier"
    PATTERN_RECOGNITION = "pattern_recognition"
    ANOMALY_DETECTION = "anomaly_detection"
    ENSEMBLE = "ensemble"
    DEEP_LEARNING = "deep_learning"
    TRANSFORMER = "transformer"

class MLModelStatus(enum.Enum):
    TRAINING = "training"
    TRAINED = "trained"
    DEPLOYED = "deployed"
    FAILED = "failed"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"

class TrainingJobStatus(enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class PredictionConfidenceLevel(enum.Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class FeedbackType(enum.Enum):
    CORRECT = "correct"
    INCORRECT = "incorrect"
    PARTIAL = "partial"
    UNCERTAIN = "uncertain"

class MLModel(Base):
    __tablename__ = "ml_models"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    name = Column(String(256), nullable=False)
    description = Column(Text)
    model_type = Column(Enum(MLModelType), nullable=False)
    algorithm = Column(String(128), nullable=False)  # sklearn, tensorflow, pytorch, etc.
    version = Column(String(32), nullable=False)
    status = Column(Enum(MLModelStatus), default=MLModelStatus.TRAINING)
    
    # Model Configuration
    hyperparameters = Column(JSON)
    feature_config = Column(JSON)
    preprocessing_config = Column(JSON)
    
    # Performance Metrics
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    auc_roc = Column(Float)
    confusion_matrix = Column(JSON)
    feature_importance = Column(JSON)
    
    # Model Artifacts
    model_path = Column(String(512))  # Path to stored model file
    model_size_mb = Column(Float)
    training_time_seconds = Column(Integer)
    
    # Versioning and Lineage
    parent_model_id = Column(Integer, ForeignKey('ml_models.id'))
    is_production = Column(Boolean, default=False)
    deployment_date = Column(DateTime)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(String(128))
    updated_by = Column(String(128))
    
    # Relationships
    training_jobs = relationship("MLTrainingJob", back_populates="model")
    predictions = relationship("MLPrediction", back_populates="model")
    feedback = relationship("MLFeedback", back_populates="model")
    parent_model = relationship("MLModel", remote_side=[id])

class MLTrainingJob(Base):
    __tablename__ = "ml_training_jobs"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    model_id = Column(Integer, ForeignKey('ml_models.id'), nullable=False)
    job_name = Column(String(256), nullable=False)
    status = Column(Enum(TrainingJobStatus), default=TrainingJobStatus.PENDING)
    
    # Training Configuration
    training_config = Column(JSON, nullable=False)
    dataset_config = Column(JSON, nullable=False)
    validation_config = Column(JSON)
    
    # Training Progress
    progress_percentage = Column(Float, default=0.0)
    current_epoch = Column(Integer, default=0)
    total_epochs = Column(Integer)
    
    # Training Results
    training_logs = Column(Text)
    error_message = Column(Text)
    final_metrics = Column(JSON)
    
    # Resource Usage
    cpu_usage_avg = Column(Float)
    memory_usage_avg_mb = Column(Float)
    gpu_usage_avg = Column(Float)
    
    # Timing
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    created_by = Column(String(128))
    
    # Relationships
    model = relationship("MLModel", back_populates="training_jobs")

class MLPrediction(Base):
    __tablename__ = "ml_predictions"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    model_id = Column(Integer, ForeignKey('ml_models.id'), nullable=False)
    
    # Input Data
    entity_type = Column(String(64), nullable=False)  # datasource, table, column
    entity_id = Column(String(256), nullable=False)
    input_data = Column(Text, nullable=False)
    input_features = Column(JSON)
    
    # Prediction Results
    predicted_label = Column(String(128), nullable=False)
    confidence_score = Column(Float, nullable=False)
    confidence_level = Column(Enum(PredictionConfidenceLevel), nullable=False)
    prediction_probabilities = Column(JSON)  # All class probabilities
    
    # Feature Analysis
    feature_contributions = Column(JSON)  # SHAP values or similar
    important_features = Column(JSON)
    explanation = Column(Text)
    
    # Context and Metadata
    batch_id = Column(String(128))  # For batch predictions
    request_id = Column(String(128))  # For tracking individual requests
    prediction_context = Column(JSON)
    
    # Performance Tracking
    inference_time_ms = Column(Float)
    model_version_used = Column(String(32))
    
    # Validation and Feedback
    is_validated = Column(Boolean, default=False)
    validation_result = Column(String(32))  # correct, incorrect, partial
    feedback_provided = Column(Boolean, default=False)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    created_by = Column(String(128))
    
    # Relationships
    model = relationship("MLModel", back_populates="predictions")
    feedback = relationship("MLFeedback", back_populates="prediction")

class MLFeedback(Base):
    __tablename__ = "ml_feedback"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    model_id = Column(Integer, ForeignKey('ml_models.id'), nullable=False)
    prediction_id = Column(Integer, ForeignKey('ml_predictions.id'), nullable=False)
    
    # Feedback Details
    feedback_type = Column(Enum(FeedbackType), nullable=False)
    correct_label = Column(String(128))  # What the label should have been
    confidence_in_feedback = Column(Float)  # User's confidence in their feedback
    explanation = Column(Text)
    
    # Feedback Context
    feedback_source = Column(String(64))  # manual, automated, expert_review
    domain_expert = Column(Boolean, default=False)
    feedback_quality_score = Column(Float)
    
    # Active Learning
    is_used_for_training = Column(Boolean, default=False)
    training_weight = Column(Float, default=1.0)
    
    # Aggregated Feedback
    agreement_count = Column(Integer, default=1)
    disagreement_count = Column(Integer, default=0)
    consensus_reached = Column(Boolean, default=False)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    created_by = Column(String(128))
    
    # Relationships
    model = relationship("MLModel", back_populates="feedback")
    prediction = relationship("MLPrediction", back_populates="feedback")

class MLModelVersion(Base):
    __tablename__ = "ml_model_versions"
    
    id = Column(Integer, primary_key=True)
    model_id = Column(Integer, ForeignKey('ml_models.id'), nullable=False)
    version_number = Column(String(32), nullable=False)
    version_type = Column(String(32), nullable=False)  # major, minor, patch, hotfix
    
    # Version Details
    changelog = Column(Text)
    breaking_changes = Column(Boolean, default=False)
    performance_improvements = Column(JSON)
    bug_fixes = Column(JSON)
    
    # Compatibility
    backward_compatible = Column(Boolean, default=True)
    required_migrations = Column(JSON)
    
    # Release Information
    release_notes = Column(Text)
    rollback_plan = Column(Text)
    
    # Performance Comparison
    performance_delta = Column(JSON)  # Comparison with previous version
    benchmark_results = Column(JSON)
    
    # Deployment Information
    deployment_strategy = Column(String(64))  # blue_green, canary, rolling
    rollout_percentage = Column(Float, default=0.0)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    created_by = Column(String(128))
    
    # Relationships
    model = relationship("MLModel")

class MLExperiment(Base):
    __tablename__ = "ml_experiments"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    name = Column(String(256), nullable=False)
    description = Column(Text)
    
    # Experiment Configuration
    objective = Column(String(256), nullable=False)
    hypothesis = Column(Text)
    experiment_type = Column(String(64))  # a_b_test, hyperparameter_tuning, architecture_comparison
    
    # Experiment Parameters
    parameters = Column(JSON, nullable=False)
    baseline_model_id = Column(Integer, ForeignKey('ml_models.id'))
    
    # Results
    results = Column(JSON)
    conclusions = Column(Text)
    statistical_significance = Column(Float)
    
    # Status and Timeline
    status = Column(String(32), default="planning")
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(String(128))
    
    # Relationships
    baseline_model = relationship("MLModel")

class MLDatasetVersion(Base):
    __tablename__ = "ml_dataset_versions"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(256), nullable=False)
    version = Column(String(32), nullable=False)
    
    # Dataset Information
    description = Column(Text)
    data_source = Column(String(256))
    schema_definition = Column(JSON)
    
    # Dataset Metrics
    total_samples = Column(Integer)
    feature_count = Column(Integer)
    label_distribution = Column(JSON)
    data_quality_score = Column(Float)
    
    # Data Lineage
    source_datasets = Column(JSON)  # List of source dataset IDs
    transformations_applied = Column(JSON)
    
    # Versioning
    parent_version_id = Column(Integer, ForeignKey('ml_dataset_versions.id'))
    changes_summary = Column(Text)
    
    # Storage Information
    storage_path = Column(String(512))
    format = Column(String(32))  # parquet, csv, json, etc.
    size_mb = Column(Float)
    checksum = Column(String(128))
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    created_by = Column(String(128))
    
    # Relationships
    parent_version = relationship("MLDatasetVersion", remote_side=[id])