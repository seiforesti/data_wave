"""
🧠 SCAN RULE INTELLIGENCE MODELS
Advanced AI/ML models for intelligent rule pattern recognition, machine learning optimization,
and adaptive rule enhancement with enterprise-grade intelligence capabilities.

This module provides cutting-edge intelligence features for:
- AI-Powered Pattern Recognition and Semantic Analysis
- Machine Learning Model Management and Training
- Adaptive Rule Learning and Continuous Improvement
- Intelligent Feature Engineering and Selection
- Predictive Analytics and Forecasting Models
- Enterprise-Grade Knowledge Management and Insights
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, ForeignKey
from decimal import Decimal
import numpy as np

# Import related models for cross-system integration
from .advanced_scan_rule_models import IntelligentScanRule, RuleExecutionHistory
from .scan_rule_orchestration_models import OrchestrationJob


class IntelligenceModelType(str, Enum):
    """Types of AI/ML models used for rule intelligence"""
    PATTERN_CLASSIFIER = "pattern_classifier"           # Pattern classification models
    ANOMALY_DETECTOR = "anomaly_detector"               # Anomaly detection models
    SEMANTIC_ANALYZER = "semantic_analyzer"             # NLP semantic analysis
    FEATURE_EXTRACTOR = "feature_extractor"             # Feature extraction models
    PREDICTIVE_OPTIMIZER = "predictive_optimizer"       # Performance prediction
    KNOWLEDGE_GRAPH = "knowledge_graph"                 # Knowledge graph models
    REINFORCEMENT_LEARNER = "reinforcement_learner"     # RL optimization models
    DEEP_NEURAL_NETWORK = "deep_neural_network"         # Deep learning models
    ENSEMBLE_MODEL = "ensemble_model"                   # Combined model ensembles
    TRANSFORMER_MODEL = "transformer_model"             # Transformer architectures
    GRAPH_NEURAL_NETWORK = "graph_neural_network"       # Graph neural networks
    GENERATIVE_MODEL = "generative_model"               # Generative AI models


class LearningApproach(str, Enum):
    """Machine learning approaches for rule intelligence"""
    SUPERVISED_LEARNING = "supervised_learning"         # Supervised learning
    UNSUPERVISED_LEARNING = "unsupervised_learning"     # Unsupervised learning
    SEMI_SUPERVISED = "semi_supervised"                 # Semi-supervised learning
    REINFORCEMENT_LEARNING = "reinforcement_learning"   # Reinforcement learning
    TRANSFER_LEARNING = "transfer_learning"             # Transfer learning
    FEDERATED_LEARNING = "federated_learning"           # Federated learning
    ACTIVE_LEARNING = "active_learning"                 # Active learning
    META_LEARNING = "meta_learning"                     # Meta learning
    CONTINUAL_LEARNING = "continual_learning"           # Continual learning
    MULTI_TASK_LEARNING = "multi_task_learning"         # Multi-task learning


class ModelStatus(str, Enum):
    """Status of AI/ML models in the intelligence system"""
    TRAINING = "training"                   # Currently training
    TRAINED = "trained"                     # Training completed
    VALIDATING = "validating"               # Model validation in progress
    VALIDATED = "validated"                 # Validation completed
    DEPLOYED = "deployed"                   # Deployed in production
    UPDATING = "updating"                   # Model update in progress
    DEPRECATED = "deprecated"               # Model deprecated
    FAILED = "failed"                       # Training/deployment failed
    ARCHIVED = "archived"                   # Archived for reference


class FeatureType(str, Enum):
    """Types of features used in machine learning models"""
    NUMERICAL = "numerical"                 # Numerical features
    CATEGORICAL = "categorical"             # Categorical features
    TEXT = "text"                          # Text/NLP features
    TEMPORAL = "temporal"                   # Time-based features
    GRAPH = "graph"                        # Graph structure features
    EMBEDDING = "embedding"                 # Vector embeddings
    STATISTICAL = "statistical"            # Statistical features
    CONTEXTUAL = "contextual"              # Context-aware features
    BEHAVIORAL = "behavioral"              # Behavioral pattern features
    SEMANTIC = "semantic"                  # Semantic meaning features


class OptimizationObjective(str, Enum):
    """Objectives for AI/ML model optimization"""
    ACCURACY_MAXIMIZATION = "accuracy_maximization"     # Maximize accuracy
    PRECISION_RECALL = "precision_recall"               # Balance precision/recall
    F1_OPTIMIZATION = "f1_optimization"                 # Optimize F1 score
    LATENCY_MINIMIZATION = "latency_minimization"       # Minimize response time
    RESOURCE_EFFICIENCY = "resource_efficiency"         # Optimize resource usage
    COST_MINIMIZATION = "cost_minimization"             # Minimize operational cost
    THROUGHPUT_MAXIMIZATION = "throughput_maximization" # Maximize throughput
    ROBUSTNESS = "robustness"                           # Improve model robustness
    FAIRNESS = "fairness"                               # Ensure model fairness
    INTERPRETABILITY = "interpretability"               # Enhance interpretability


class IntelligenceModel(SQLModel, table=True):
    """
    Enterprise-grade AI/ML model for intelligent rule processing with advanced
    machine learning capabilities, model versioning, and performance tracking.
    """
    __tablename__ = "intelligence_models"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    model_uuid: str = Field(index=True, unique=True, description="Unique model identifier")
    model_name: str = Field(max_length=255, index=True)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = Field(sa_column=Column(Text))
    version: str = Field(default="1.0.0", max_length=20)
    
    # Model Classification
    model_type: IntelligenceModelType = Field(index=True)
    learning_approach: LearningApproach = Field(index=True)
    model_family: str = Field(max_length=100, index=True)  # sklearn, pytorch, tensorflow, etc.
    model_algorithm: str = Field(max_length=100)
    
    # Model Configuration
    hyperparameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    model_architecture: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    training_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    optimization_objective: OptimizationObjective = Field(default=OptimizationObjective.ACCURACY_MAXIMIZATION)
    
    # Training Data Management
    training_data_sources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    training_data_size: int = Field(default=0, ge=0)
    validation_data_size: int = Field(default=0, ge=0)
    test_data_size: int = Field(default=0, ge=0)
    data_quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    feature_count: int = Field(default=0, ge=0)
    
    # Model Performance Metrics
    accuracy_score: float = Field(default=0.0, ge=0.0, le=1.0)
    precision_score: float = Field(default=0.0, ge=0.0, le=1.0)
    recall_score: float = Field(default=0.0, ge=0.0, le=1.0)
    f1_score: float = Field(default=0.0, ge=0.0, le=1.0)
    auc_score: Optional[float] = Field(ge=0.0, le=1.0)
    confusion_matrix: Optional[List[List[int]]] = Field(sa_column=Column(JSON))
    
    # Advanced Performance Metrics
    cross_validation_scores: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    performance_distribution: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    confidence_intervals: Dict[str, Tuple[float, float]] = Field(default_factory=dict, sa_column=Column(JSON))
    statistical_significance: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Model Status and Lifecycle
    status: ModelStatus = Field(default=ModelStatus.TRAINING, index=True)
    deployment_status: str = Field(default="not_deployed", max_length=50, index=True)
    health_score: float = Field(default=1.0, ge=0.0, le=1.0)
    last_health_check: Optional[datetime] = None
    
    # Training Progress and History
    training_epochs: int = Field(default=0, ge=0)
    training_loss: Optional[float] = Field(ge=0.0)
    validation_loss: Optional[float] = Field(ge=0.0)
    training_time_minutes: Optional[float] = Field(ge=0.0)
    convergence_achieved: bool = Field(default=False)
    early_stopping_triggered: bool = Field(default=False)
    
    # Resource Usage and Efficiency
    memory_usage_mb: Optional[float] = Field(ge=0.0)
    compute_time_seconds: Optional[float] = Field(ge=0.0)
    gpu_utilization: Optional[float] = Field(ge=0.0, le=100.0)
    storage_size_mb: float = Field(default=0.0, ge=0.0)
    inference_latency_ms: Optional[float] = Field(ge=0.0)
    
    # Feature Engineering and Selection
    feature_engineering_pipeline: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    feature_selection_methods: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    feature_importance_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    selected_features: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Model Interpretability
    interpretability_methods: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    explainability_reports: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    feature_interactions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    decision_boundaries: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    
    # Deployment and Production
    deployment_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    serving_infrastructure: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    api_endpoints: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    model_artifacts_path: Optional[str] = Field(max_length=500)
    
    # Monitoring and Observability
    monitoring_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_conditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    drift_detection_enabled: bool = Field(default=True)
    
    # Business Context and Impact
    business_use_cases: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    business_value_score: float = Field(default=0.0, ge=0.0, le=10.0)
    cost_savings_potential: Optional[float] = Field(ge=0.0)
    roi_estimation: Optional[float] = Field(ge=0.0)
    risk_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Compliance and Governance
    compliance_frameworks: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    privacy_preserving_techniques: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    bias_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    fairness_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Metadata and Documentation
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    documentation: Optional[str] = Field(sa_column=Column(Text))
    research_papers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    code_repository: Optional[str] = Field(max_length=500)
    
    # Lifecycle Management
    created_by: str = Field(max_length=255)
    updated_by: Optional[str] = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    deprecated_by: Optional[str] = Field(max_length=255)
    deprecation_reason: Optional[str] = Field(max_length=500)
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    training_started_at: Optional[datetime] = None
    training_completed_at: Optional[datetime] = None
    deployed_at: Optional[datetime] = None
    deprecated_at: Optional[datetime] = None
    
    # Relationships
    training_sessions: List["ModelTrainingSession"] = Relationship(back_populates="model")
    inference_logs: List["ModelInferenceLog"] = Relationship(back_populates="model")
    performance_benchmarks: List["ModelPerformanceBenchmark"] = Relationship(back_populates="model")
    feature_stores: List["FeatureStore"] = Relationship(back_populates="model")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_model_performance', 'accuracy_score', 'f1_score'),
        Index('ix_model_status_type', 'status', 'model_type'),
        Index('ix_model_business', 'business_value_score', 'roi_estimation'),
        Index('ix_model_deployment', 'deployment_status', 'health_score'),
        CheckConstraint('accuracy_score >= 0.0 AND accuracy_score <= 1.0'),
        CheckConstraint('business_value_score >= 0.0 AND business_value_score <= 10.0'),
        CheckConstraint('health_score >= 0.0 AND health_score <= 1.0'),
        UniqueConstraint('model_uuid'),
    )


class ModelTrainingSession(SQLModel, table=True):
    """
    Comprehensive training session tracking for AI/ML models with detailed
    metrics, experiment management, and hyperparameter optimization.
    """
    __tablename__ = "model_training_sessions"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    session_uuid: str = Field(index=True, unique=True)
    model_id: int = Field(foreign_key="intelligence_models.id", index=True)
    experiment_name: str = Field(max_length=255, index=True)
    
    # Training Configuration
    training_approach: LearningApproach = Field(index=True)
    batch_size: int = Field(default=32, ge=1, le=10000)
    learning_rate: float = Field(default=0.001, ge=0.0001, le=1.0)
    max_epochs: int = Field(default=100, ge=1, le=10000)
    early_stopping_patience: int = Field(default=10, ge=1, le=100)
    
    # Hyperparameter Configuration
    hyperparameter_space: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    hyperparameter_values: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    optimization_algorithm: str = Field(default="grid_search", max_length=100)
    hyperparameter_tuning_budget: Optional[int] = Field(ge=1, le=1000)
    
    # Training Progress
    current_epoch: int = Field(default=0, ge=0)
    training_loss_history: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    validation_loss_history: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    accuracy_history: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    learning_curves: Dict[str, List[float]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance Metrics
    best_validation_score: float = Field(default=0.0, ge=0.0, le=1.0)
    best_epoch: int = Field(default=0, ge=0)
    final_training_score: float = Field(default=0.0, ge=0.0, le=1.0)
    generalization_gap: Optional[float] = None
    overfitting_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Resource Utilization
    training_duration_minutes: Optional[float] = Field(ge=0.0)
    cpu_usage_avg: Optional[float] = Field(ge=0.0, le=100.0)
    memory_usage_peak_mb: Optional[float] = Field(ge=0.0)
    gpu_usage_avg: Optional[float] = Field(ge=0.0, le=100.0)
    power_consumption_kwh: Optional[float] = Field(ge=0.0)
    
    # Data Management
    training_data_version: str = Field(default="v1.0", max_length=50)
    data_preprocessing_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    data_augmentation_techniques: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    cross_validation_folds: int = Field(default=5, ge=2, le=20)
    stratification_enabled: bool = Field(default=True)
    
    # Model Checkpointing
    checkpoint_frequency: int = Field(default=10, ge=1, le=100)  # Save every N epochs
    checkpoint_paths: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    best_model_checkpoint: Optional[str] = Field(max_length=500)
    model_serialization_format: str = Field(default="pickle", max_length=50)
    
    # Experiment Tracking
    experiment_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    reproducibility_seed: Optional[int] = None
    environment_snapshot: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    dependencies_versions: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Status and Control
    training_status: str = Field(default="initialized", max_length=50, index=True)
    completion_status: str = Field(default="in_progress", max_length=50)
    termination_reason: Optional[str] = Field(max_length=255)
    manual_intervention: bool = Field(default=False)
    
    # Quality Assessment
    training_stability_score: float = Field(default=0.0, ge=0.0, le=1.0)
    convergence_quality: str = Field(default="unknown", max_length=50)
    training_anomalies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    quality_gates_passed: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Context
    training_cost_usd: Optional[float] = Field(ge=0.0)
    expected_business_impact: Optional[str] = Field(max_length=500)
    training_priority: int = Field(default=5, ge=1, le=10)
    deadline: Optional[datetime] = None
    
    # Temporal Management
    started_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_at: Optional[datetime] = None
    last_checkpoint_at: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None
    
    # Relationships
    model: Optional[IntelligenceModel] = Relationship(back_populates="training_sessions")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_training_performance', 'best_validation_score', 'training_stability_score'),
        Index('ix_training_timing', 'started_at', 'completed_at'),
        Index('ix_training_resource', 'training_duration_minutes', 'training_cost_usd'),
        Index('ix_training_status', 'training_status', 'completion_status'),
        CheckConstraint('learning_rate > 0.0 AND learning_rate <= 1.0'),
        CheckConstraint('training_priority >= 1 AND training_priority <= 10'),
    )


class ModelInferenceLog(SQLModel, table=True):
    """
    Real-time inference logging for deployed AI/ML models with performance
    monitoring, prediction tracking, and anomaly detection.
    """
    __tablename__ = "model_inference_logs"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    inference_uuid: str = Field(index=True, unique=True)
    model_id: int = Field(foreign_key="intelligence_models.id", index=True)
    
    # Request Context
    request_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    request_id: Optional[str] = Field(max_length=255, index=True)
    user_id: Optional[str] = Field(max_length=255)
    session_id: Optional[str] = Field(max_length=255)
    api_endpoint: str = Field(max_length=255)
    
    # Input Data
    input_features: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    input_data_size_kb: float = Field(default=0.0, ge=0.0)
    input_feature_count: int = Field(default=0, ge=0)
    input_data_quality_score: Optional[float] = Field(ge=0.0, le=1.0)
    preprocessing_applied: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Prediction Results
    predictions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    confidence_scores: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    prediction_probabilities: Optional[List[float]] = Field(sa_column=Column(JSON))
    top_k_predictions: Optional[List[Dict[str, Any]]] = Field(sa_column=Column(JSON))
    
    # Performance Metrics
    inference_latency_ms: float = Field(ge=0.0)
    preprocessing_time_ms: Optional[float] = Field(ge=0.0)
    model_execution_time_ms: Optional[float] = Field(ge=0.0)
    postprocessing_time_ms: Optional[float] = Field(ge=0.0)
    total_processing_time_ms: float = Field(ge=0.0)
    
    # Resource Usage
    cpu_usage_percent: Optional[float] = Field(ge=0.0, le=100.0)
    memory_usage_mb: Optional[float] = Field(ge=0.0)
    gpu_usage_percent: Optional[float] = Field(ge=0.0, le=100.0)
    network_io_kb: Optional[float] = Field(ge=0.0)
    
    # Quality Assessment
    prediction_quality_score: Optional[float] = Field(ge=0.0, le=1.0)
    uncertainty_estimate: Optional[float] = Field(ge=0.0, le=1.0)
    anomaly_score: Optional[float] = Field(ge=0.0, le=1.0)
    out_of_distribution_flag: bool = Field(default=False)
    data_drift_detected: bool = Field(default=False)
    
    # Response and Status
    response_status: str = Field(default="success", max_length=50, index=True)
    error_message: Optional[str] = Field(max_length=1000)
    warning_messages: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    response_data_size_kb: float = Field(default=0.0, ge=0.0)
    
    # Business Context
    business_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    use_case_category: Optional[str] = Field(max_length=100, index=True)
    business_value_generated: Optional[float] = Field(ge=0.0)
    cost_per_inference: Optional[float] = Field(ge=0.0)
    
    # Feedback and Learning
    ground_truth_available: bool = Field(default=False)
    ground_truth_value: Optional[str] = Field(max_length=500)
    feedback_score: Optional[float] = Field(ge=0.0, le=1.0)
    user_satisfaction: Optional[int] = Field(ge=1, le=5)
    active_learning_candidate: bool = Field(default=False)
    
    # Environment and Context
    model_version: str = Field(max_length=50)
    deployment_environment: str = Field(max_length=100)
    infrastructure_node: Optional[str] = Field(max_length=100)
    client_information: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    model: Optional[IntelligenceModel] = Relationship(back_populates="inference_logs")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_inference_performance', 'inference_latency_ms', 'total_processing_time_ms'),
        Index('ix_inference_quality', 'prediction_quality_score', 'anomaly_score'),
        Index('ix_inference_timestamp', 'request_timestamp', 'model_id'),
        Index('ix_inference_business', 'use_case_category', 'business_value_generated'),
        CheckConstraint('inference_latency_ms >= 0.0'),
        CheckConstraint('total_processing_time_ms >= 0.0'),
    )


class ModelPerformanceBenchmark(SQLModel, table=True):
    """
    Comprehensive performance benchmarking for AI/ML models with comparative
    analysis, baseline tracking, and performance regression detection.
    """
    __tablename__ = "model_performance_benchmarks"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    benchmark_uuid: str = Field(index=True, unique=True)
    model_id: int = Field(foreign_key="intelligence_models.id", index=True)
    
    # Benchmark Configuration
    benchmark_name: str = Field(max_length=255, index=True)
    benchmark_version: str = Field(default="v1.0", max_length=50)
    benchmark_type: str = Field(max_length=100, index=True)  # accuracy, performance, fairness, robustness
    evaluation_dataset: str = Field(max_length=255)
    evaluation_criteria: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance Metrics
    overall_score: float = Field(ge=0.0, le=1.0, index=True)
    accuracy_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    efficiency_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    robustness_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    fairness_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Comparative Analysis
    baseline_comparison: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    peer_model_comparison: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    industry_benchmark_comparison: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_percentile: float = Field(default=50.0, ge=0.0, le=100.0)
    
    # Detailed Analysis
    confusion_matrix: Optional[List[List[int]]] = Field(sa_column=Column(JSON))
    roc_curve_data: Optional[Dict[str, List[float]]] = Field(sa_column=Column(JSON))
    precision_recall_curve: Optional[Dict[str, List[float]]] = Field(sa_column=Column(JSON))
    feature_importance_analysis: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Resource Performance
    inference_latency_p50: float = Field(ge=0.0)
    inference_latency_p95: float = Field(ge=0.0)
    inference_latency_p99: float = Field(ge=0.0)
    throughput_requests_per_second: float = Field(ge=0.0)
    memory_footprint_mb: float = Field(ge=0.0)
    cpu_utilization_avg: float = Field(ge=0.0, le=100.0)
    
    # Quality Assessment
    statistical_significance: Optional[float] = Field(ge=0.0, le=1.0)
    confidence_intervals: Dict[str, Tuple[float, float]] = Field(default_factory=dict, sa_column=Column(JSON))
    test_data_coverage: float = Field(default=1.0, ge=0.0, le=1.0)
    evaluation_stability: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Business Impact
    business_value_score: float = Field(default=0.0, ge=0.0, le=10.0)
    cost_effectiveness: float = Field(default=0.0, ge=0.0, le=10.0)
    user_experience_impact: Optional[float] = Field(ge=0.0, le=10.0)
    operational_efficiency_gain: Optional[float] = Field(ge=0.0)
    
    # Benchmark Execution
    execution_environment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    execution_duration_minutes: Optional[float] = Field(ge=0.0)
    total_test_cases: int = Field(default=0, ge=0)
    passed_test_cases: int = Field(default=0, ge=0)
    benchmark_status: str = Field(default="completed", max_length=50, index=True)
    
    # Recommendations and Insights
    performance_insights: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    optimization_recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    identified_weaknesses: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    improvement_opportunities: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal Management
    executed_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_at: Optional[datetime] = None
    next_benchmark_scheduled: Optional[datetime] = None
    
    # Relationships
    model: Optional[IntelligenceModel] = Relationship(back_populates="performance_benchmarks")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_benchmark_performance', 'overall_score', 'performance_percentile'),
        Index('ix_benchmark_timing', 'executed_at', 'completed_at'),
        Index('ix_benchmark_business', 'business_value_score', 'cost_effectiveness'),
        Index('ix_benchmark_latency', 'inference_latency_p95', 'throughput_requests_per_second'),
        CheckConstraint('overall_score >= 0.0 AND overall_score <= 1.0'),
        CheckConstraint('performance_percentile >= 0.0 AND performance_percentile <= 100.0'),
    )


class FeatureStore(SQLModel, table=True):
    """
    Enterprise feature store for managing ML features with versioning,
    lineage tracking, and feature quality monitoring.
    """
    __tablename__ = "feature_stores"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    feature_uuid: str = Field(index=True, unique=True)
    feature_name: str = Field(max_length=255, index=True)
    feature_group: str = Field(max_length=100, index=True)
    model_id: int = Field(foreign_key="intelligence_models.id", index=True)
    
    # Feature Definition
    feature_type: FeatureType = Field(index=True)
    data_type: str = Field(max_length=50)  # int, float, string, boolean, array
    feature_description: Optional[str] = Field(sa_column=Column(Text))
    computation_logic: Optional[str] = Field(sa_column=Column(Text))
    transformation_pipeline: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Feature Metadata
    source_tables: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    source_columns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    dependencies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Feature Quality
    data_quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    completeness_ratio: float = Field(default=0.0, ge=0.0, le=1.0)
    uniqueness_ratio: float = Field(default=0.0, ge=0.0, le=1.0)
    validity_ratio: float = Field(default=0.0, ge=0.0, le=1.0)
    consistency_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Statistical Properties
    statistical_summary: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    distribution_statistics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    correlation_analysis: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    outlier_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Feature Engineering
    engineering_methods: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    normalization_applied: bool = Field(default=False)
    encoding_methods: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    dimensionality_reduction: Optional[str] = Field(max_length=100)
    
    # Usage and Performance
    usage_frequency: int = Field(default=0, ge=0)
    importance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    predictive_power: Optional[float] = Field(ge=0.0, le=1.0)
    feature_stability: float = Field(default=1.0, ge=0.0, le=1.0)
    computation_cost: Optional[float] = Field(ge=0.0)
    
    # Versioning and Lineage
    version: str = Field(default="v1.0", max_length=50)
    parent_features: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    derived_features: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    lineage_graph: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Access and Security
    access_permissions: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    privacy_level: str = Field(default="internal", max_length=50)
    encryption_enabled: bool = Field(default=False)
    anonymization_applied: bool = Field(default=False)
    
    # Monitoring and Alerting
    monitoring_enabled: bool = Field(default=True)
    drift_detection_enabled: bool = Field(default=True)
    quality_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_configurations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Lifecycle Management
    is_active: bool = Field(default=True, index=True)
    deprecation_date: Optional[datetime] = None
    retirement_date: Optional[datetime] = None
    created_by: str = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_computed_at: Optional[datetime] = None
    last_quality_check: Optional[datetime] = None
    
    # Relationships
    model: Optional[IntelligenceModel] = Relationship(back_populates="feature_stores")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_feature_quality', 'data_quality_score', 'importance_score'),
        Index('ix_feature_usage', 'usage_frequency', 'predictive_power'),
        Index('ix_feature_group_type', 'feature_group', 'feature_type'),
        Index('ix_feature_lifecycle', 'is_active', 'created_at'),
        CheckConstraint('data_quality_score >= 0.0 AND data_quality_score <= 1.0'),
        CheckConstraint('importance_score >= 0.0 AND importance_score <= 1.0'),
    )


# ===================== REQUEST AND RESPONSE MODELS =====================

class IntelligenceModelResponse(BaseModel):
    """Response model for intelligence models"""
    id: int
    model_uuid: str
    model_name: str
    display_name: Optional[str]
    model_type: IntelligenceModelType
    learning_approach: LearningApproach
    status: ModelStatus
    accuracy_score: float
    f1_score: float
    training_data_size: int
    feature_count: int
    deployment_status: str
    health_score: float
    business_value_score: float
    inference_latency_ms: Optional[float]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class IntelligenceModelCreate(BaseModel):
    """Request model for creating intelligence models"""
    model_name: str = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    model_type: IntelligenceModelType
    learning_approach: LearningApproach
    model_family: str = Field(max_length=100)
    model_algorithm: str = Field(max_length=100)
    hyperparameters: Optional[Dict[str, Any]] = {}
    optimization_objective: OptimizationObjective = OptimizationObjective.ACCURACY_MAXIMIZATION
    training_data_sources: Optional[List[str]] = []
    business_use_cases: Optional[List[str]] = []
    created_by: str = Field(min_length=1, max_length=255)


class ModelTrainingRequest(BaseModel):
    """Request model for model training"""
    model_id: int
    experiment_name: str = Field(min_length=1, max_length=255)
    training_approach: LearningApproach
    hyperparameters: Dict[str, Any] = {}
    max_epochs: int = Field(default=100, ge=1, le=10000)
    batch_size: int = Field(default=32, ge=1, le=10000)
    learning_rate: float = Field(default=0.001, ge=0.0001, le=1.0)
    early_stopping_patience: int = Field(default=10, ge=1, le=100)
    cross_validation_folds: int = Field(default=5, ge=2, le=20)
    training_priority: int = Field(default=5, ge=1, le=10)


class ModelInferenceRequest(BaseModel):
    """Request model for model inference"""
    model_id: int
    input_features: Dict[str, Any]
    return_probabilities: bool = False
    return_confidence: bool = True
    top_k_predictions: Optional[int] = Field(ge=1, le=10)
    explain_prediction: bool = False
    request_id: Optional[str] = None


class ModelPerformanceReport(BaseModel):
    """Performance report model for intelligence models"""
    model_uuid: str
    model_name: str
    report_period: str
    accuracy_metrics: Dict[str, float]
    performance_metrics: Dict[str, float]
    resource_utilization: Dict[str, float]
    business_impact: Dict[str, float]
    quality_assessment: Dict[str, float]
    recommendations: List[str]
    comparative_analysis: Dict[str, Any]


# ===================== UTILITY FUNCTIONS =====================

def generate_intelligence_uuid() -> str:
    """Generate a unique UUID for intelligence models"""
    return f"intel_{uuid.uuid4().hex[:12]}"


def calculate_model_health_score(
    accuracy: float,
    inference_latency: float,
    error_rate: float,
    resource_efficiency: float
) -> float:
    """Calculate comprehensive model health score"""
    # Normalize latency (assuming 100ms is optimal)
    latency_score = max(0.0, 1.0 - (inference_latency / 100.0))
    
    # Error rate score (inverse of error rate)
    error_score = max(0.0, 1.0 - error_rate)
    
    # Weighted health score
    health_score = (
        accuracy * 0.4 +
        latency_score * 0.2 +
        error_score * 0.2 +
        resource_efficiency * 0.2
    )
    
    return min(health_score, 1.0)


def estimate_training_time(
    data_size: int,
    model_complexity: str,
    hardware_type: str = "cpu"
) -> float:
    """Estimate model training time in minutes"""
    base_time = data_size / 10000  # Base time per 10k samples
    
    complexity_multipliers = {
        "simple": 1.0,
        "moderate": 2.5,
        "complex": 5.0,
        "very_complex": 10.0
    }
    
    hardware_multipliers = {
        "cpu": 1.0,
        "gpu": 0.3,
        "tpu": 0.1
    }
    
    complexity_factor = complexity_multipliers.get(model_complexity, 2.5)
    hardware_factor = hardware_multipliers.get(hardware_type, 1.0)
    
    estimated_time = base_time * complexity_factor * hardware_factor
    
    return max(estimated_time, 1.0)  # Minimum 1 minute


# Export all models and utilities
__all__ = [
    # Enums
    "IntelligenceModelType", "LearningApproach", "ModelStatus", "FeatureType", "OptimizationObjective",
    
    # Core Models
    "IntelligenceModel", "ModelTrainingSession", "ModelInferenceLog", 
    "ModelPerformanceBenchmark", "FeatureStore",
    
    # Request/Response Models
    "IntelligenceModelResponse", "IntelligenceModelCreate", "ModelTrainingRequest",
    "ModelInferenceRequest", "ModelPerformanceReport",
    
    # Utilities
    "generate_intelligence_uuid", "calculate_model_health_score", "estimate_training_time"
]