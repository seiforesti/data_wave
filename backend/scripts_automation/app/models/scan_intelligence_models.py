from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
import uuid

Base = declarative_base()

# Enums for Scan Intelligence
class IntelligenceType(str, Enum):
    PATTERN_RECOGNITION = "pattern_recognition"
    ANOMALY_DETECTION = "anomaly_detection"
    PREDICTIVE_ANALYSIS = "predictive_analysis"
    ADAPTIVE_OPTIMIZATION = "adaptive_optimization"
    CONTEXT_AWARENESS = "context_awareness"
    BEHAVIORAL_LEARNING = "behavioral_learning"
    PERFORMANCE_PREDICTION = "performance_prediction"
    RESOURCE_OPTIMIZATION = "resource_optimization"

class LearningMode(str, Enum):
    SUPERVISED = "supervised"
    UNSUPERVISED = "unsupervised"
    REINFORCEMENT = "reinforcement"
    SEMI_SUPERVISED = "semi_supervised"
    TRANSFER_LEARNING = "transfer_learning"
    ACTIVE_LEARNING = "active_learning"
    FEDERATED_LEARNING = "federated_learning"
    CONTINUOUS_LEARNING = "continuous_learning"

class PatternType(str, Enum):
    STRUCTURAL = "structural"
    BEHAVIORAL = "behavioral"
    TEMPORAL = "temporal"
    SEMANTIC = "semantic"
    STATISTICAL = "statistical"
    GEOMETRIC = "geometric"
    FREQUENCY = "frequency"
    CORRELATION = "correlation"

class IntelligenceStatus(str, Enum):
    INITIALIZING = "initializing"
    LEARNING = "learning"
    ANALYZING = "analyzing"
    OPTIMIZING = "optimizing"
    ACTIVE = "active"
    ADAPTING = "adapting"
    EVALUATING = "evaluating"
    SUSPENDED = "suspended"

class ConfidenceLevel(str, Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"
    CRITICAL = "critical"

class ModelType(str, Enum):
    NEURAL_NETWORK = "neural_network"
    DECISION_TREE = "decision_tree"
    RANDOM_FOREST = "random_forest"
    SVM = "svm"
    CLUSTERING = "clustering"
    REGRESSION = "regression"
    ENSEMBLE = "ensemble"
    DEEP_LEARNING = "deep_learning"

# Core Intelligence Models
class ScanIntelligenceEngine(Base):
    """
    Core intelligence engine for AI-powered scanning optimization
    """
    __tablename__ = "scan_intelligence_engines"

    id = Column(Integer, primary_key=True, index=True)
    engine_id = Column(String(255), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    intelligence_type = Column(SQLEnum(IntelligenceType), nullable=False)
    learning_mode = Column(SQLEnum(LearningMode), nullable=False)
    model_type = Column(SQLEnum(ModelType), nullable=False)
    status = Column(SQLEnum(IntelligenceStatus), default=IntelligenceStatus.INITIALIZING)
    
    # Configuration
    configuration = Column(JSON, default={})
    parameters = Column(JSON, default={})
    hyperparameters = Column(JSON, default={})
    training_config = Column(JSON, default={})
    
    # Performance Metrics
    accuracy_score = Column(Float, default=0.0)
    precision_score = Column(Float, default=0.0)
    recall_score = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    
    # Learning Progress
    training_iterations = Column(Integer, default=0)
    learning_rate = Column(Float, default=0.001)
    convergence_threshold = Column(Float, default=0.001)
    improvement_rate = Column(Float, default=0.0)
    
    # Resource Usage
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    training_time = Column(Float, default=0.0)
    inference_time = Column(Float, default=0.0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    version = Column(String(50), default="1.0.0")
    
    # Relationships
    patterns = relationship("IntelligencePattern", back_populates="engine")
    insights = relationship("ScanInsight", back_populates="engine")
    predictions = relationship("ScanPrediction", back_populates="engine")
    optimizations = relationship("ScanOptimization", back_populates="engine")

class IntelligencePattern(Base):
    """
    Detected patterns by intelligence engines
    """
    __tablename__ = "intelligence_patterns"

    id = Column(Integer, primary_key=True, index=True)
    pattern_id = Column(String(255), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    engine_id = Column(Integer, ForeignKey("scan_intelligence_engines.id"))
    
    # Pattern Details
    pattern_type = Column(SQLEnum(PatternType), nullable=False)
    pattern_name = Column(String(255), nullable=False)
    description = Column(Text)
    pattern_data = Column(JSON, default={})
    signature = Column(Text)  # Pattern signature for matching
    
    # Detection Metrics
    detection_count = Column(Integer, default=0)
    first_detected = Column(DateTime, default=datetime.utcnow)
    last_detected = Column(DateTime, default=datetime.utcnow)
    confidence_level = Column(SQLEnum(ConfidenceLevel), default=ConfidenceLevel.MEDIUM)
    strength = Column(Float, default=0.0)
    frequency = Column(Float, default=0.0)
    
    # Context Information
    data_source_types = Column(JSON, default=[])
    scan_types = Column(JSON, default=[])
    environmental_factors = Column(JSON, default={})
    temporal_context = Column(JSON, default={})
    
    # Impact Assessment
    performance_impact = Column(Float, default=0.0)
    quality_impact = Column(Float, default=0.0)
    resource_impact = Column(Float, default=0.0)
    business_impact = Column(Float, default=0.0)
    
    # Pattern Evolution
    evolution_history = Column(JSON, default=[])
    trend_direction = Column(String(50))  # increasing, decreasing, stable, volatile
    stability_score = Column(Float, default=0.0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    engine = relationship("ScanIntelligenceEngine", back_populates="patterns")
    applications = relationship("PatternApplication", back_populates="pattern")

class ScanInsight(Base):
    """
    AI-generated insights from scan intelligence analysis
    """
    __tablename__ = "scan_insights"

    id = Column(Integer, primary_key=True, index=True)
    insight_id = Column(String(255), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    engine_id = Column(Integer, ForeignKey("scan_intelligence_engines.id"))
    
    # Insight Details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    insight_type = Column(String(100), nullable=False)
    category = Column(String(100))
    priority = Column(String(50), default="medium")
    
    # Analysis Data
    analysis_data = Column(JSON, default={})
    evidence = Column(JSON, default=[])
    supporting_metrics = Column(JSON, default={})
    statistical_significance = Column(Float, default=0.0)
    
    # Confidence and Reliability
    confidence_score = Column(Float, nullable=False)
    reliability_score = Column(Float, default=0.0)
    validation_status = Column(String(50), default="pending")
    peer_review_score = Column(Float, default=0.0)
    
    # Actionability
    actionable = Column(Boolean, default=True)
    recommended_actions = Column(JSON, default=[])
    implementation_complexity = Column(String(50))  # low, medium, high
    expected_impact = Column(JSON, default={})
    
    # Temporal Aspects
    temporal_relevance = Column(String(50))  # immediate, short_term, long_term
    validity_period = Column(Integer)  # days
    expiration_date = Column(DateTime)
    refresh_frequency = Column(String(50))
    
    # Context and Scope
    scope = Column(JSON, default={})
    affected_entities = Column(JSON, default=[])
    environmental_context = Column(JSON, default={})
    business_context = Column(JSON, default={})
    
    # Impact Assessment
    performance_impact = Column(Float, default=0.0)
    cost_impact = Column(Float, default=0.0)
    risk_impact = Column(Float, default=0.0)
    opportunity_impact = Column(Float, default=0.0)
    
    # Metadata
    generated_at = Column(DateTime, default=datetime.utcnow)
    validated_at = Column(DateTime)
    applied_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    engine = relationship("ScanIntelligenceEngine", back_populates="insights")
    feedback = relationship("InsightFeedback", back_populates="insight")

class ScanPrediction(Base):
    """
    Predictive analytics for scan operations and outcomes
    """
    __tablename__ = "scan_predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(String(255), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    engine_id = Column(Integer, ForeignKey("scan_intelligence_engines.id"))
    
    # Prediction Details
    prediction_type = Column(String(100), nullable=False)
    target_metric = Column(String(100), nullable=False)
    predicted_value = Column(Float, nullable=False)
    prediction_range = Column(JSON, default={})  # min, max, std_dev
    
    # Time Horizon
    prediction_horizon = Column(Integer, nullable=False)  # hours
    prediction_date = Column(DateTime, nullable=False)
    target_date = Column(DateTime, nullable=False)
    
    # Model Information
    model_version = Column(String(50))
    algorithm_used = Column(String(100))
    training_data_size = Column(Integer)
    feature_importance = Column(JSON, default={})
    
    # Confidence Metrics
    confidence_interval = Column(JSON, default={})
    prediction_confidence = Column(Float, nullable=False)
    model_accuracy = Column(Float, default=0.0)
    uncertainty_score = Column(Float, default=0.0)
    
    # Input Features
    input_features = Column(JSON, default={})
    feature_values = Column(JSON, default={})
    contextual_factors = Column(JSON, default={})
    environmental_variables = Column(JSON, default={})
    
    # Validation and Tracking
    actual_value = Column(Float)
    prediction_error = Column(Float)
    validation_date = Column(DateTime)
    accuracy_score = Column(Float)
    
    # Business Impact
    business_value = Column(Float, default=0.0)
    risk_assessment = Column(JSON, default={})
    recommended_actions = Column(JSON, default=[])
    decision_support = Column(JSON, default={})
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    validated_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    engine = relationship("ScanIntelligenceEngine", back_populates="predictions")

class ScanOptimization(Base):
    """
    AI-driven optimization recommendations for scan operations
    """
    __tablename__ = "scan_optimizations"

    id = Column(Integer, primary_key=True, index=True)
    optimization_id = Column(String(255), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    engine_id = Column(Integer, ForeignKey("scan_intelligence_engines.id"))
    
    # Optimization Details
    optimization_type = Column(String(100), nullable=False)
    target_area = Column(String(100), nullable=False)  # performance, quality, cost, resource
    optimization_goal = Column(String(255), nullable=False)
    
    # Current State Analysis
    baseline_metrics = Column(JSON, default={})
    current_performance = Column(JSON, default={})
    identified_bottlenecks = Column(JSON, default=[])
    inefficiency_sources = Column(JSON, default=[])
    
    # Optimization Strategy
    strategy_type = Column(String(100))  # algorithmic, heuristic, hybrid
    optimization_approach = Column(JSON, default={})
    recommended_changes = Column(JSON, default=[])
    implementation_steps = Column(JSON, default=[])
    
    # Expected Outcomes
    projected_improvement = Column(JSON, default={})
    expected_metrics = Column(JSON, default={})
    confidence_level = Column(SQLEnum(ConfidenceLevel), default=ConfidenceLevel.MEDIUM)
    success_probability = Column(Float, default=0.0)
    
    # Resource Requirements
    implementation_effort = Column(String(50))  # low, medium, high
    resource_requirements = Column(JSON, default={})
    estimated_duration = Column(Integer)  # hours
    cost_estimate = Column(Float, default=0.0)
    
    # Risk Assessment
    risk_factors = Column(JSON, default=[])
    mitigation_strategies = Column(JSON, default=[])
    rollback_plan = Column(JSON, default={})
    impact_assessment = Column(JSON, default={})
    
    # Implementation Tracking
    implementation_status = Column(String(50), default="proposed")
    applied_at = Column(DateTime)
    results_measured_at = Column(DateTime)
    actual_improvement = Column(JSON, default={})
    
    # Validation
    effectiveness_score = Column(Float, default=0.0)
    roi_score = Column(Float, default=0.0)
    user_satisfaction = Column(Float, default=0.0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    engine = relationship("ScanIntelligenceEngine", back_populates="optimizations")

class PatternApplication(Base):
    """
    Applications of detected patterns to actual scan operations
    """
    __tablename__ = "pattern_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(255), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    pattern_id = Column(Integer, ForeignKey("intelligence_patterns.id"))
    
    # Application Details
    application_type = Column(String(100), nullable=False)
    target_scan_id = Column(String(255))
    application_context = Column(JSON, default={})
    application_parameters = Column(JSON, default={})
    
    # Execution Tracking
    applied_at = Column(DateTime, default=datetime.utcnow)
    execution_duration = Column(Float, default=0.0)
    execution_status = Column(String(50), default="pending")
    execution_results = Column(JSON, default={})
    
    # Performance Impact
    performance_before = Column(JSON, default={})
    performance_after = Column(JSON, default={})
    improvement_achieved = Column(JSON, default={})
    effectiveness_score = Column(Float, default=0.0)
    
    # Feedback and Learning
    user_feedback = Column(JSON, default={})
    automated_feedback = Column(JSON, default={})
    learning_data = Column(JSON, default={})
    pattern_refinement = Column(JSON, default={})
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    pattern = relationship("IntelligencePattern", back_populates="applications")

class InsightFeedback(Base):
    """
    User and system feedback on generated insights
    """
    __tablename__ = "insight_feedback"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(String(255), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    insight_id = Column(Integer, ForeignKey("scan_insights.id"))
    
    # Feedback Details
    feedback_type = Column(String(50), nullable=False)  # user, system, automated
    feedback_source = Column(String(100))
    rating = Column(Integer)  # 1-5 scale
    usefulness_score = Column(Float, default=0.0)
    accuracy_score = Column(Float, default=0.0)
    
    # Detailed Feedback
    comments = Column(Text)
    suggestions = Column(Text)
    corrections = Column(JSON, default={})
    additional_context = Column(JSON, default={})
    
    # Action Taken
    action_taken = Column(Boolean, default=False)
    action_details = Column(JSON, default={})
    outcome = Column(JSON, default={})
    follow_up_required = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    insight = relationship("ScanInsight", back_populates="feedback")

class IntelligenceMetrics(Base):
    """
    Performance metrics for intelligence engines
    """
    __tablename__ = "intelligence_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_id = Column(String(255), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    engine_id = Column(Integer, ForeignKey("scan_intelligence_engines.id"))
    
    # Metric Details
    metric_name = Column(String(100), nullable=False)
    metric_type = Column(String(50), nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String(50))
    
    # Context
    measurement_context = Column(JSON, default={})
    measurement_conditions = Column(JSON, default={})
    data_source = Column(String(100))
    calculation_method = Column(String(100))
    
    # Quality Indicators
    data_quality_score = Column(Float, default=0.0)
    measurement_confidence = Column(Float, default=0.0)
    statistical_significance = Column(Float, default=0.0)
    sample_size = Column(Integer)
    
    # Temporal Aspects
    measurement_period = Column(String(50))
    measurement_frequency = Column(String(50))
    trend_direction = Column(String(50))
    volatility_score = Column(Float, default=0.0)
    
    # Benchmarking
    baseline_value = Column(Float)
    target_value = Column(Float)
    benchmark_comparison = Column(JSON, default={})
    performance_percentile = Column(Float, default=0.0)
    
    # Metadata
    measured_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

# Pydantic Models for API
class ScanIntelligenceEngineBase(BaseModel):
    name: str
    description: Optional[str] = None
    intelligence_type: IntelligenceType
    learning_mode: LearningMode
    model_type: ModelType
    configuration: Optional[Dict[str, Any]] = {}
    parameters: Optional[Dict[str, Any]] = {}
    hyperparameters: Optional[Dict[str, Any]] = {}

class ScanIntelligenceEngineCreate(ScanIntelligenceEngineBase):
    training_config: Optional[Dict[str, Any]] = {}

class ScanIntelligenceEngineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[IntelligenceStatus] = None
    configuration: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    hyperparameters: Optional[Dict[str, Any]] = None

class ScanIntelligenceEngineResponse(ScanIntelligenceEngineBase):
    id: int
    engine_id: str
    status: IntelligenceStatus
    accuracy_score: float
    precision_score: float
    recall_score: float
    f1_score: float
    confidence_score: float
    training_iterations: int
    created_at: datetime
    updated_at: datetime
    version: str

    class Config:
        from_attributes = True

class IntelligencePatternBase(BaseModel):
    pattern_type: PatternType
    pattern_name: str
    description: Optional[str] = None
    pattern_data: Optional[Dict[str, Any]] = {}
    signature: Optional[str] = None

class IntelligencePatternCreate(IntelligencePatternBase):
    engine_id: int

class IntelligencePatternResponse(IntelligencePatternBase):
    id: int
    pattern_id: str
    engine_id: int
    detection_count: int
    first_detected: datetime
    last_detected: datetime
    confidence_level: ConfidenceLevel
    strength: float
    frequency: float
    performance_impact: float
    quality_impact: float
    created_at: datetime

    class Config:
        from_attributes = True

class ScanInsightBase(BaseModel):
    title: str
    description: str
    insight_type: str
    category: Optional[str] = None
    priority: Optional[str] = "medium"
    confidence_score: float
    analysis_data: Optional[Dict[str, Any]] = {}
    evidence: Optional[List[Any]] = []

class ScanInsightCreate(ScanInsightBase):
    engine_id: int

class ScanInsightResponse(ScanInsightBase):
    id: int
    insight_id: str
    engine_id: int
    reliability_score: float
    validation_status: str
    actionable: bool
    recommended_actions: List[Any]
    performance_impact: float
    cost_impact: float
    generated_at: datetime

    class Config:
        from_attributes = True

class ScanPredictionBase(BaseModel):
    prediction_type: str
    target_metric: str
    predicted_value: float
    prediction_horizon: int
    prediction_date: datetime
    target_date: datetime
    prediction_confidence: float

class ScanPredictionCreate(ScanPredictionBase):
    engine_id: int
    input_features: Optional[Dict[str, Any]] = {}
    feature_values: Optional[Dict[str, Any]] = {}

class ScanPredictionResponse(ScanPredictionBase):
    id: int
    prediction_id: str
    engine_id: int
    prediction_range: Dict[str, Any]
    model_version: Optional[str]
    algorithm_used: Optional[str]
    confidence_interval: Dict[str, Any]
    model_accuracy: float
    actual_value: Optional[float]
    prediction_error: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class ScanOptimizationBase(BaseModel):
    optimization_type: str
    target_area: str
    optimization_goal: str
    baseline_metrics: Optional[Dict[str, Any]] = {}
    recommended_changes: Optional[List[Any]] = []

class ScanOptimizationCreate(ScanOptimizationBase):
    engine_id: int

class ScanOptimizationResponse(ScanOptimizationBase):
    id: int
    optimization_id: str
    engine_id: int
    projected_improvement: Dict[str, Any]
    confidence_level: ConfidenceLevel
    success_probability: float
    implementation_effort: Optional[str]
    implementation_status: str
    effectiveness_score: float
    roi_score: float
    created_at: datetime

    class Config:
        from_attributes = True

# Additional utility models
class IntelligenceEngineMetrics(BaseModel):
    engine_id: str
    performance_metrics: Dict[str, float]
    learning_progress: Dict[str, Any]
    resource_usage: Dict[str, float]
    pattern_detection_stats: Dict[str, Any]
    insight_generation_stats: Dict[str, Any]
    prediction_accuracy_stats: Dict[str, Any]
    optimization_effectiveness_stats: Dict[str, Any]

class IntelligenceSystemHealth(BaseModel):
    overall_status: str
    active_engines: int
    total_patterns_detected: int
    total_insights_generated: int
    total_predictions_made: int
    total_optimizations_applied: int
    average_confidence_score: float
    system_performance_score: float
    resource_utilization: Dict[str, float]
    recent_activities: List[Dict[str, Any]]