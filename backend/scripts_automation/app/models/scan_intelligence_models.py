"""
Scan Intelligence Models - Advanced Production Implementation
============================================================

This module defines SQLModel classes for AI-powered scan intelligence including
scan optimization, predictive analytics, performance optimization, anomaly detection,
and intelligent pattern recognition for enterprise data governance systems.

Key Features:
- AI-powered scan optimization and resource management
- Predictive scanning with machine learning models
- Performance optimization and intelligent caching
- Anomaly detection and pattern recognition
- Adaptive rule optimization and learning systems
- Cross-system intelligence and coordination

Production Requirements:
- Support for 10M+ scan intelligence records
- Real-time AI model inference and updates
- Advanced ML model lifecycle management
- Performance optimization for large-scale operations
- Enterprise-grade security and compliance
"""

from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json

from sqlmodel import SQLModel, Field, Relationship, Column, Index, UniqueConstraint
from sqlalchemy import String, Integer, Float, Boolean, DateTime, JSON, Text, LargeBinary
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB, VECTOR
from pydantic import BaseModel, validator, Field as PydanticField

# ===================== ENUMS =====================

class ScanIntelligenceType(str, Enum):
    """Types of scan intelligence"""
    PREDICTIVE_ANALYTICS = "predictive_analytics"
    PERFORMANCE_OPTIMIZATION = "performance_optimization"
    ANOMALY_DETECTION = "anomaly_detection"
    PATTERN_RECOGNITION = "pattern_recognition"
    RESOURCE_OPTIMIZATION = "resource_optimization"
    ADAPTIVE_LEARNING = "adaptive_learning"
    BEHAVIORAL_ANALYSIS = "behavioral_analysis"
    CROSS_SYSTEM_CORRELATION = "cross_system_correlation"

class AIModelType(str, Enum):
    """Types of AI models used in scan intelligence"""
    NEURAL_NETWORK = "neural_network"
    RANDOM_FOREST = "random_forest"
    GRADIENT_BOOSTING = "gradient_boosting"
    SVM = "svm"
    CLUSTERING = "clustering"
    TRANSFORMER = "transformer"
    ENSEMBLE = "ensemble"
    REINFORCEMENT_LEARNING = "reinforcement_learning"

class OptimizationStrategy(str, Enum):
    """Optimization strategies for scan intelligence"""
    PERFORMANCE_FIRST = "performance_first"
    ACCURACY_FIRST = "accuracy_first"
    RESOURCE_EFFICIENT = "resource_efficient"
    COST_OPTIMIZED = "cost_optimized"
    BALANCED = "balanced"
    ADAPTIVE = "adaptive"
    CUSTOM = "custom"

class IntelligenceScope(str, Enum):
    """Scope of intelligence application"""
    SINGLE_SCAN = "single_scan"
    SCAN_GROUP = "scan_group"
    DATA_SOURCE = "data_source"
    SYSTEM_WIDE = "system_wide"
    CROSS_SYSTEM = "cross_system"
    GLOBAL = "global"

class LearningMode(str, Enum):
    """Learning modes for adaptive intelligence"""
    SUPERVISED = "supervised"
    UNSUPERVISED = "unsupervised"
    SEMI_SUPERVISED = "semi_supervised"
    REINFORCEMENT = "reinforcement"
    TRANSFER = "transfer"
    FEDERATED = "federated"
    ONLINE = "online"
    BATCH = "batch"

class ModelStatus(str, Enum):
    """Status of AI models"""
    TRAINING = "training"
    TRAINED = "trained"
    DEPLOYED = "deployed"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    FAILED = "failed"
    ARCHIVED = "archived"

# ===================== CORE INTELLIGENCE MODELS =====================

class ScanIntelligenceEngine(SQLModel, table=True):
    """Core scan intelligence engine configuration and state"""
    __tablename__ = "scan_intelligence_engines"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    engine_id: str = Field(unique=True, index=True, description="Unique engine identifier")
    engine_name: str = Field(index=True, description="Human-readable engine name")
    intelligence_type: ScanIntelligenceType = Field(index=True, description="Type of intelligence provided")
    
    # Configuration
    configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Engine configuration")
    optimization_strategy: OptimizationStrategy = Field(description="Optimization strategy used")
    intelligence_scope: IntelligenceScope = Field(description="Scope of intelligence application")
    learning_mode: LearningMode = Field(description="Learning mode for adaptive behavior")
    
    # Status and metadata
    status: str = Field(default="active", index=True, description="Engine status")
    version: str = Field(description="Engine version")
    last_trained: Optional[datetime] = Field(default=None, description="Last training timestamp")
    last_updated: Optional[datetime] = Field(default=None, description="Last update timestamp")
    
    # Performance metrics
    accuracy_score: Optional[float] = Field(default=None, description="Model accuracy score")
    performance_score: Optional[float] = Field(default=None, description="Performance optimization score")
    efficiency_score: Optional[float] = Field(default=None, description="Resource efficiency score")
    reliability_score: Optional[float] = Field(default=None, description="Reliability score")
    
    # Resource requirements
    cpu_requirement: Optional[float] = Field(default=None, description="CPU requirement for operation")
    memory_requirement: Optional[float] = Field(default=None, description="Memory requirement in GB")
    storage_requirement: Optional[float] = Field(default=None, description="Storage requirement in GB")
    
    # Relationships
    ai_models: List["ScanAIModel"] = Relationship(back_populates="intelligence_engine")
    optimization_records: List["ScanOptimizationRecord"] = Relationship(back_populates="intelligence_engine")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    created_by: str = Field(description="User who created the engine")
    
    # Custom properties
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Custom properties")

class ScanAIModel(SQLModel, table=True):
    """AI/ML models used for scan intelligence"""
    __tablename__ = "scan_ai_models"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    model_id: str = Field(unique=True, index=True, description="Unique model identifier")
    model_name: str = Field(index=True, description="Human-readable model name")
    model_type: AIModelType = Field(index=True, description="Type of AI model")
    
    # Model configuration
    model_architecture: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Model architecture definition")
    hyperparameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Model hyperparameters")
    training_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Training configuration")
    
    # Model artifacts
    model_binary: Optional[bytes] = Field(default=None, sa_column=Column(LargeBinary), description="Serialized model binary")
    model_path: Optional[str] = Field(default=None, description="Path to model file")
    model_checksum: Optional[str] = Field(default=None, description="Model file checksum")
    
    # Training data and metrics
    training_dataset_id: Optional[str] = Field(default=None, description="Training dataset identifier")
    validation_dataset_id: Optional[str] = Field(default=None, description="Validation dataset identifier")
    training_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Training metrics")
    validation_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Validation metrics")
    
    # Model lifecycle
    status: ModelStatus = Field(default=ModelStatus.TRAINING, index=True, description="Model status")
    version: str = Field(description="Model version")
    parent_model_id: Optional[str] = Field(default=None, description="Parent model for versioning")
    
    # Performance tracking
    inference_latency_ms: Optional[float] = Field(default=None, description="Average inference latency in milliseconds")
    throughput_per_second: Optional[float] = Field(default=None, description="Inference throughput per second")
    resource_utilization: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Resource utilization metrics")
    
    # Deployment configuration
    deployment_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Deployment configuration")
    scaling_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Auto-scaling configuration")
    
    # Foreign keys
    intelligence_engine_id: Optional[int] = Field(default=None, foreign_key="scan_intelligence_engines.id")
    
    # Relationships
    intelligence_engine: Optional[ScanIntelligenceEngine] = Relationship(back_populates="ai_models")
    predictions: List["ScanPrediction"] = Relationship(back_populates="ai_model")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    deployed_at: Optional[datetime] = Field(default=None, description="Deployment timestamp")
    
    # Custom properties
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Custom properties")

class ScanPrediction(SQLModel, table=True):
    """Predictions made by AI models for scan optimization"""
    __tablename__ = "scan_predictions"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    prediction_id: str = Field(unique=True, index=True, description="Unique prediction identifier")
    prediction_type: str = Field(index=True, description="Type of prediction")
    
    # Prediction context
    target_scan_id: Optional[str] = Field(default=None, index=True, description="Target scan identifier")
    target_data_source_id: Optional[int] = Field(default=None, index=True, description="Target data source ID")
    prediction_scope: IntelligenceScope = Field(description="Scope of prediction")
    
    # Input features
    input_features: Dict[str, Any] = Field(sa_column=Column(JSONB), description="Input features for prediction")
    feature_vector: Optional[List[float]] = Field(default=None, sa_column=Column(ARRAY(Float)), description="Numerical feature vector")
    embedding_vector: Optional[List[float]] = Field(default=None, sa_column=Column(VECTOR), description="Embedding vector")
    
    # Prediction output
    prediction_value: Union[str, float, int, bool, Dict[str, Any]] = Field(sa_column=Column(JSONB), description="Predicted value")
    confidence_score: float = Field(description="Prediction confidence score")
    probability_distribution: Optional[Dict[str, float]] = Field(default=None, sa_column=Column(JSONB), description="Probability distribution")
    
    # Prediction metadata
    model_version: str = Field(description="Model version used for prediction")
    inference_time_ms: float = Field(description="Inference time in milliseconds")
    prediction_timestamp: datetime = Field(default_factory=datetime.utcnow, description="Prediction timestamp")
    
    # Validation and feedback
    actual_value: Optional[Union[str, float, int, bool, Dict[str, Any]]] = Field(default=None, sa_column=Column(JSONB), description="Actual observed value")
    prediction_accuracy: Optional[float] = Field(default=None, description="Prediction accuracy when validated")
    feedback_score: Optional[float] = Field(default=None, description="User feedback score")
    
    # Foreign keys
    ai_model_id: Optional[int] = Field(default=None, foreign_key="scan_ai_models.id")
    
    # Relationships
    ai_model: Optional[ScanAIModel] = Relationship(back_populates="predictions")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    validated_at: Optional[datetime] = Field(default=None, description="Validation timestamp")
    
    # Custom properties
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Custom properties")

class ScanOptimizationRecord(SQLModel, table=True):
    """Records of scan optimizations performed by intelligence engines"""
    __tablename__ = "scan_optimization_records"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    optimization_id: str = Field(unique=True, index=True, description="Unique optimization identifier")
    optimization_type: str = Field(index=True, description="Type of optimization")
    
    # Optimization context
    target_scan_id: Optional[str] = Field(default=None, index=True, description="Target scan identifier")
    target_system: str = Field(index=True, description="Target system or component")
    optimization_scope: IntelligenceScope = Field(description="Scope of optimization")
    
    # Optimization details
    original_configuration: Dict[str, Any] = Field(sa_column=Column(JSONB), description="Original configuration")
    optimized_configuration: Dict[str, Any] = Field(sa_column=Column(JSONB), description="Optimized configuration")
    optimization_strategy: OptimizationStrategy = Field(description="Strategy used for optimization")
    
    # Performance impact
    performance_before: Dict[str, float] = Field(sa_column=Column(JSONB), description="Performance metrics before optimization")
    performance_after: Dict[str, float] = Field(sa_column=Column(JSONB), description="Performance metrics after optimization")
    improvement_percentage: float = Field(description="Overall improvement percentage")
    
    # Resource impact
    resource_usage_before: Dict[str, float] = Field(sa_column=Column(JSONB), description="Resource usage before optimization")
    resource_usage_after: Dict[str, float] = Field(sa_column=Column(JSONB), description="Resource usage after optimization")
    resource_savings: Dict[str, float] = Field(sa_column=Column(JSONB), description="Resource savings achieved")
    
    # Cost impact
    cost_before: Optional[float] = Field(default=None, description="Cost before optimization")
    cost_after: Optional[float] = Field(default=None, description="Cost after optimization")
    cost_savings: Optional[float] = Field(default=None, description="Cost savings achieved")
    
    # Optimization metadata
    applied_at: datetime = Field(default_factory=datetime.utcnow, description="Optimization application timestamp")
    rollback_possible: bool = Field(default=True, description="Whether rollback is possible")
    rollback_deadline: Optional[datetime] = Field(default=None, description="Rollback deadline")
    
    # Validation
    validation_status: str = Field(default="pending", description="Validation status")
    validation_results: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Validation results")
    user_acceptance: Optional[bool] = Field(default=None, description="User acceptance of optimization")
    
    # Foreign keys
    intelligence_engine_id: Optional[int] = Field(default=None, foreign_key="scan_intelligence_engines.id")
    
    # Relationships
    intelligence_engine: Optional[ScanIntelligenceEngine] = Relationship(back_populates="optimization_records")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    created_by: str = Field(description="User or system that created the optimization")
    
    # Custom properties
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Custom properties")

class ScanAnomalyDetection(SQLModel, table=True):
    """Anomaly detection results for scan operations"""
    __tablename__ = "scan_anomaly_detections"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    anomaly_id: str = Field(unique=True, index=True, description="Unique anomaly identifier")
    detection_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True, description="Detection timestamp")
    
    # Anomaly context
    affected_scan_id: Optional[str] = Field(default=None, index=True, description="Affected scan identifier")
    affected_data_source_id: Optional[int] = Field(default=None, index=True, description="Affected data source ID")
    anomaly_scope: IntelligenceScope = Field(description="Scope of anomaly")
    
    # Anomaly details
    anomaly_type: str = Field(index=True, description="Type of anomaly detected")
    anomaly_severity: str = Field(index=True, description="Severity level: low, medium, high, critical")
    anomaly_score: float = Field(description="Anomaly score (0-1)")
    confidence_level: float = Field(description="Detection confidence level")
    
    # Anomaly data
    baseline_metrics: Dict[str, float] = Field(sa_column=Column(JSONB), description="Baseline metrics for comparison")
    anomalous_metrics: Dict[str, float] = Field(sa_column=Column(JSONB), description="Anomalous metrics detected")
    deviation_analysis: Dict[str, float] = Field(sa_column=Column(JSONB), description="Deviation analysis results")
    
    # Root cause analysis
    potential_causes: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Potential root causes")
    contributing_factors: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Contributing factors")
    correlation_analysis: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Correlation analysis")
    
    # Impact assessment
    impact_level: str = Field(description="Impact level: minimal, moderate, significant, severe")
    affected_operations: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Affected operations")
    business_impact: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Business impact assessment")
    
    # Resolution
    status: str = Field(default="open", index=True, description="Anomaly status: open, investigating, resolved, false_positive")
    resolution_actions: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)), description="Resolution actions taken")
    resolution_timestamp: Optional[datetime] = Field(default=None, description="Resolution timestamp")
    
    # Alert and notification
    alert_sent: bool = Field(default=False, description="Whether alert was sent")
    notification_channels: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Notification channels used")
    assigned_to: Optional[str] = Field(default=None, description="User assigned to handle anomaly")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    
    # Custom properties
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Custom properties")

class ScanPatternRecognition(SQLModel, table=True):
    """Pattern recognition results for scan operations"""
    __tablename__ = "scan_pattern_recognitions"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    pattern_id: str = Field(unique=True, index=True, description="Unique pattern identifier")
    discovery_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True, description="Pattern discovery timestamp")
    
    # Pattern context
    pattern_scope: IntelligenceScope = Field(description="Scope of pattern")
    affected_scans: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Affected scan identifiers")
    affected_data_sources: List[int] = Field(default_factory=list, sa_column=Column(ARRAY(Integer)), description="Affected data source IDs")
    
    # Pattern details
    pattern_type: str = Field(index=True, description="Type of pattern: temporal, behavioral, structural, performance")
    pattern_name: str = Field(description="Human-readable pattern name")
    pattern_description: str = Field(description="Detailed pattern description")
    pattern_signature: Dict[str, Any] = Field(sa_column=Column(JSONB), description="Pattern signature or fingerprint")
    
    # Pattern characteristics
    frequency: str = Field(description="Pattern frequency: one-time, periodic, continuous, irregular")
    periodicity: Optional[timedelta] = Field(default=None, description="Pattern periodicity if applicable")
    strength: float = Field(description="Pattern strength score (0-1)")
    consistency: float = Field(description="Pattern consistency score (0-1)")
    
    # Pattern data
    pattern_features: Dict[str, Any] = Field(sa_column=Column(JSONB), description="Pattern features and characteristics")
    statistical_metrics: Dict[str, float] = Field(sa_column=Column(JSONB), description="Statistical metrics of pattern")
    correlation_matrix: Optional[List[List[float]]] = Field(default=None, sa_column=Column(JSONB), description="Correlation matrix")
    
    # Business value
    business_relevance: str = Field(description="Business relevance: high, medium, low")
    actionable_insights: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Actionable insights from pattern")
    optimization_potential: Optional[float] = Field(default=None, description="Optimization potential score")
    
    # Pattern evolution
    evolution_tracking: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Pattern evolution tracking")
    trend_analysis: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Trend analysis results")
    
    # Validation
    validation_status: str = Field(default="pending", description="Pattern validation status")
    validation_confidence: Optional[float] = Field(default=None, description="Validation confidence score")
    expert_review: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Expert review results")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    validated_at: Optional[datetime] = Field(default=None, description="Validation timestamp")
    
    # Custom properties
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Custom properties")

class ScanPerformanceOptimization(SQLModel, table=True):
    """Performance optimization recommendations and implementations"""
    __tablename__ = "scan_performance_optimizations"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    optimization_id: str = Field(unique=True, index=True, description="Unique optimization identifier")
    recommendation_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True, description="Recommendation timestamp")
    
    # Optimization context
    target_scan_id: Optional[str] = Field(default=None, index=True, description="Target scan identifier")
    target_component: str = Field(description="Target component for optimization")
    optimization_category: str = Field(index=True, description="Optimization category")
    
    # Current performance baseline
    baseline_metrics: Dict[str, float] = Field(sa_column=Column(JSONB), description="Baseline performance metrics")
    performance_bottlenecks: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)), description="Identified bottlenecks")
    resource_constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB), description="Resource constraints")
    
    # Optimization recommendations
    recommended_changes: Dict[str, Any] = Field(sa_column=Column(JSONB), description="Recommended configuration changes")
    expected_improvements: Dict[str, float] = Field(sa_column=Column(JSONB), description="Expected performance improvements")
    implementation_priority: str = Field(description="Implementation priority: low, medium, high, critical")
    
    # Cost-benefit analysis
    implementation_cost: Optional[float] = Field(default=None, description="Estimated implementation cost")
    expected_savings: Optional[float] = Field(default=None, description="Expected cost savings")
    roi_estimate: Optional[float] = Field(default=None, description="Return on investment estimate")
    payback_period_days: Optional[int] = Field(default=None, description="Payback period in days")
    
    # Implementation details
    implementation_steps: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Implementation steps")
    rollback_plan: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Rollback plan")
    testing_requirements: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)), description="Testing requirements")
    
    # Risk assessment
    implementation_risks: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSONB), description="Implementation risks")
    risk_mitigation: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Risk mitigation strategies")
    
    # Status tracking
    status: str = Field(default="recommended", index=True, description="Status: recommended, approved, implementing, completed, rejected")
    implementation_progress: float = Field(default=0.0, description="Implementation progress (0-1)")
    completion_timestamp: Optional[datetime] = Field(default=None, description="Completion timestamp")
    
    # Results tracking
    actual_improvements: Optional[Dict[str, float]] = Field(default=None, sa_column=Column(JSONB), description="Actual improvements achieved")
    improvement_variance: Optional[Dict[str, float]] = Field(default=None, sa_column=Column(JSONB), description="Variance from expected improvements")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    approved_by: Optional[str] = Field(default=None, description="User who approved implementation")
    implemented_by: Optional[str] = Field(default=None, description="User who implemented optimization")
    
    # Custom properties
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB), description="Custom properties")

# ===================== PYDANTIC MODELS FOR API =====================

class ScanIntelligenceEngineCreate(BaseModel):
    """Pydantic model for creating scan intelligence engines"""
    engine_name: str = PydanticField(..., description="Human-readable engine name")
    intelligence_type: ScanIntelligenceType = PydanticField(..., description="Type of intelligence provided")
    configuration: Dict[str, Any] = PydanticField(default_factory=dict, description="Engine configuration")
    optimization_strategy: OptimizationStrategy = PydanticField(..., description="Optimization strategy")
    intelligence_scope: IntelligenceScope = PydanticField(..., description="Scope of intelligence application")
    learning_mode: LearningMode = PydanticField(..., description="Learning mode")

class ScanIntelligenceEngineResponse(BaseModel):
    """Pydantic model for scan intelligence engine responses"""
    engine_id: str
    engine_name: str
    intelligence_type: ScanIntelligenceType
    status: str
    version: str
    accuracy_score: Optional[float]
    performance_score: Optional[float]
    efficiency_score: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]

class ScanAIModelCreate(BaseModel):
    """Pydantic model for creating AI models"""
    model_name: str = PydanticField(..., description="Human-readable model name")
    model_type: AIModelType = PydanticField(..., description="Type of AI model")
    model_architecture: Dict[str, Any] = PydanticField(default_factory=dict, description="Model architecture")
    hyperparameters: Dict[str, Any] = PydanticField(default_factory=dict, description="Model hyperparameters")
    training_config: Dict[str, Any] = PydanticField(default_factory=dict, description="Training configuration")

class ScanPredictionCreate(BaseModel):
    """Pydantic model for creating predictions"""
    prediction_type: str = PydanticField(..., description="Type of prediction")
    target_scan_id: Optional[str] = PydanticField(None, description="Target scan identifier")
    input_features: Dict[str, Any] = PydanticField(..., description="Input features")
    prediction_scope: IntelligenceScope = PydanticField(..., description="Scope of prediction")

class ScanOptimizationRequest(BaseModel):
    """Pydantic model for optimization requests"""
    optimization_type: str = PydanticField(..., description="Type of optimization")
    target_scan_id: Optional[str] = PydanticField(None, description="Target scan identifier")
    optimization_scope: IntelligenceScope = PydanticField(..., description="Scope of optimization")
    optimization_strategy: OptimizationStrategy = PydanticField(..., description="Optimization strategy")

class ScanAnomalyAlert(BaseModel):
    """Pydantic model for anomaly alerts"""
    anomaly_id: str
    anomaly_type: str
    anomaly_severity: str
    anomaly_score: float
    affected_scan_id: Optional[str]
    detection_timestamp: datetime
    potential_causes: List[str]
    recommended_actions: List[str]

# ===================== DATABASE INDEXES =====================

# Create indexes for better query performance
ScanIntelligenceEngine.__table_args__ = (
    Index('idx_intelligence_engine_type_status', 'intelligence_type', 'status'),
    Index('idx_intelligence_engine_scope', 'intelligence_scope'),
    Index('idx_intelligence_engine_updated', 'updated_at'),
)

ScanAIModel.__table_args__ = (
    Index('idx_ai_model_type_status', 'model_type', 'status'),
    Index('idx_ai_model_version', 'version'),
    Index('idx_ai_model_deployed', 'deployed_at'),
)

ScanPrediction.__table_args__ = (
    Index('idx_prediction_scan_timestamp', 'target_scan_id', 'prediction_timestamp'),
    Index('idx_prediction_type_scope', 'prediction_type', 'prediction_scope'),
    Index('idx_prediction_confidence', 'confidence_score'),
)

ScanOptimizationRecord.__table_args__ = (
    Index('idx_optimization_scan_type', 'target_scan_id', 'optimization_type'),
    Index('idx_optimization_applied', 'applied_at'),
    Index('idx_optimization_improvement', 'improvement_percentage'),
)

ScanAnomalyDetection.__table_args__ = (
    Index('idx_anomaly_scan_timestamp', 'affected_scan_id', 'detection_timestamp'),
    Index('idx_anomaly_severity_status', 'anomaly_severity', 'status'),
    Index('idx_anomaly_score', 'anomaly_score'),
)

ScanPatternRecognition.__table_args__ = (
    Index('idx_pattern_type_timestamp', 'pattern_type', 'discovery_timestamp'),
    Index('idx_pattern_scope_strength', 'pattern_scope', 'strength'),
    Index('idx_pattern_business_relevance', 'business_relevance'),
)

ScanPerformanceOptimization.__table_args__ = (
    Index('idx_perf_opt_scan_status', 'target_scan_id', 'status'),
    Index('idx_perf_opt_priority', 'implementation_priority'),
    Index('idx_perf_opt_roi', 'roi_estimate'),
)

# ===================== EXPORTS =====================

__all__ = [
    # Enums
    "ScanIntelligenceType",
    "AIModelType", 
    "OptimizationStrategy",
    "IntelligenceScope",
    "LearningMode",
    "ModelStatus",
    
    # Core models
    "ScanIntelligenceEngine",
    "ScanAIModel",
    "ScanPrediction",
    "ScanOptimizationRecord",
    "ScanAnomalyDetection",
    "ScanPatternRecognition",
    "ScanPerformanceOptimization",
    
    # API models
    "ScanIntelligenceEngineCreate",
    "ScanIntelligenceEngineResponse",
    "ScanAIModelCreate",
    "ScanPredictionCreate",
    "ScanOptimizationRequest",
    "ScanAnomalyAlert"
]