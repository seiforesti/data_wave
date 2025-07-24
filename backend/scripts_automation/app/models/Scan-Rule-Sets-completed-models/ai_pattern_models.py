from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint

# ===================================
# ENUMS AND CONSTANTS
# ===================================

class PatternType(str, Enum):
    """Types of patterns that can be detected."""
    DATA_QUALITY = "data_quality"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    PERFORMANCE = "performance"
    USAGE = "usage"
    BUSINESS_RULE = "business_rule"
    ANOMALY = "anomaly"
    TREND = "trend"
    CORRELATION = "correlation"
    CLASSIFICATION = "classification"

class PatternSeverity(str, Enum):
    """Severity levels for detected patterns."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class PatternStatus(str, Enum):
    """Status of pattern detection."""
    DETECTED = "detected"
    VALIDATED = "validated"
    DISMISSED = "dismissed"
    RESOLVED = "resolved"
    IN_PROGRESS = "in_progress"
    ESCALATED = "escalated"

class AIModelType(str, Enum):
    """Types of AI models used for detection."""
    NEURAL_NETWORK = "neural_network"
    RANDOM_FOREST = "random_forest"
    SVM = "svm"
    KMEANS = "kmeans"
    DBSCAN = "dbscan"
    ISOLATION_FOREST = "isolation_forest"
    LSTM = "lstm"
    TRANSFORMER = "transformer"
    GRADIENT_BOOSTING = "gradient_boosting"
    NAIVE_BAYES = "naive_bayes"

class RecommendationType(str, Enum):
    """Types of AI recommendations."""
    RULE_OPTIMIZATION = "rule_optimization"
    PATTERN_ENHANCEMENT = "pattern_enhancement"
    RESOURCE_ALLOCATION = "resource_allocation"
    WORKFLOW_IMPROVEMENT = "workflow_improvement"
    SECURITY_ENHANCEMENT = "security_enhancement"
    PERFORMANCE_TUNING = "performance_tuning"
    COMPLIANCE_ADJUSTMENT = "compliance_adjustment"
    DATA_QUALITY_FIX = "data_quality_fix"

class ContextType(str, Enum):
    """Types of contextual information."""
    BUSINESS = "business"
    TECHNICAL = "technical"
    TEMPORAL = "temporal"
    GEOGRAPHICAL = "geographical"
    ORGANIZATIONAL = "organizational"
    REGULATORY = "regulatory"

# ===================================
# PATTERN DETECTION MODELS
# ===================================

class PatternLibrary(SQLModel, table=True):
    """
    Library of known patterns for intelligent detection.
    """
    __tablename__ = "pattern_library"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    pattern_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    pattern_name: str = Field(max_length=200, index=True)
    pattern_description: Optional[str] = Field(default=None, max_length=1000)
    
    # Pattern Classification
    pattern_type: PatternType
    pattern_category: str = Field(max_length=100)
    pattern_subcategory: Optional[str] = Field(default=None, max_length=100)
    pattern_severity: PatternSeverity = Field(default=PatternSeverity.MEDIUM)
    
    # Pattern Definition
    pattern_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    pattern_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    detection_algorithm: str = Field(max_length=100)
    confidence_threshold: float = Field(default=0.7, ge=0, le=1)
    
    # AI Model Configuration
    ai_model_type: AIModelType
    model_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    training_data_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    model_version: str = Field(max_length=50)
    
    # Context and Metadata
    business_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    technical_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    regulatory_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Usage and Performance
    detection_frequency: int = Field(default=0, ge=0)
    false_positive_rate: Optional[float] = Field(default=None, ge=0, le=1)
    true_positive_rate: Optional[float] = Field(default=None, ge=0, le=1)
    last_used_at: Optional[datetime] = Field(default=None)
    
    # Lifecycle Management
    is_active: bool = Field(default=True)
    is_deprecated: bool = Field(default=False)
    created_by: str = Field(max_length=100)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deprecated_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    pattern_detections: List["PatternDetectionResult"] = Relationship(back_populates="pattern_library")
    pattern_validations: List["PatternValidation"] = Relationship(back_populates="pattern_library")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_pattern_type_category", "pattern_type", "pattern_category"),
        Index("idx_pattern_active", "is_active"),
        Index("idx_pattern_model", "ai_model_type"),
    )

class PatternDetectionResult(SQLModel, table=True):
    """
    Results from AI-powered pattern detection.
    """
    __tablename__ = "pattern_detection_results"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    detection_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    pattern_id: str = Field(foreign_key="pattern_library.pattern_id", index=True)
    
    # Detection Context
    data_source_id: Optional[int] = Field(default=None, index=True)
    rule_set_id: Optional[int] = Field(default=None, index=True)
    scan_execution_id: Optional[str] = Field(default=None, index=True)
    detection_scope: str = Field(max_length=200)  # table, column, dataset, system
    
    # Detection Results
    confidence_score: float = Field(ge=0, le=1)
    pattern_status: PatternStatus = Field(default=PatternStatus.DETECTED)
    severity_level: PatternSeverity
    detection_accuracy: Optional[float] = Field(default=None, ge=0, le=1)
    
    # Pattern Data
    detected_pattern_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    pattern_evidence: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    sample_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Impact Analysis
    affected_entities: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    impact_score: float = Field(default=0, ge=0, le=100)
    business_impact: Optional[str] = Field(default=None, max_length=1000)
    technical_impact: Optional[str] = Field(default=None, max_length=1000)
    
    # Detection Timing
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    detection_duration_ms: Optional[float] = Field(default=None, ge=0)
    data_scan_period_start: Optional[datetime] = Field(default=None)
    data_scan_period_end: Optional[datetime] = Field(default=None)
    
    # AI Model Information
    model_version: str = Field(max_length=50)
    model_confidence: float = Field(ge=0, le=1)
    model_explanation: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    feature_importance: Optional[Dict[str, float]] = Field(default=None, sa_column=Column(JSON))
    
    # Validation and Response
    is_validated: bool = Field(default=False)
    validated_by: Optional[str] = Field(default=None, max_length=100)
    validated_at: Optional[datetime] = Field(default=None)
    validation_notes: Optional[str] = Field(default=None, max_length=1000)
    
    # Response Actions
    response_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    resolution_status: Optional[str] = Field(default=None, max_length=100)
    resolved_by: Optional[str] = Field(default=None, max_length=100)
    resolved_at: Optional[datetime] = Field(default=None)
    
    # Metadata
    detection_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_generated: bool = Field(default=False)
    escalation_level: int = Field(default=0, ge=0)
    
    # Relationships
    pattern_library: PatternLibrary = Relationship(back_populates="pattern_detections")
    contextual_analysis: List["ContextualAnalysis"] = Relationship(back_populates="pattern_detection")
    recommendations: List["IntelligentRecommendation"] = Relationship(back_populates="pattern_detection")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_detection_pattern_status", "pattern_id", "pattern_status"),
        Index("idx_detection_time_severity", "detected_at", "severity_level"),
        Index("idx_detection_data_source", "data_source_id", "confidence_score"),
    )

class PatternValidation(SQLModel, table=True):
    """
    Validation of detected patterns by experts or automated systems.
    """
    __tablename__ = "pattern_validations"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    validation_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    pattern_id: str = Field(foreign_key="pattern_library.pattern_id", index=True)
    detection_id: Optional[str] = Field(default=None, index=True)
    
    # Validation Details
    validation_type: str = Field(max_length=100)  # manual, automated, hybrid
    validator_type: str = Field(max_length=100)  # human_expert, ai_system, rule_engine
    validator_id: str = Field(max_length=100)
    validation_method: str = Field(max_length=200)
    
    # Validation Results
    is_valid: bool
    confidence_level: float = Field(ge=0, le=1)
    validation_score: float = Field(ge=0, le=100)
    validation_rationale: Optional[str] = Field(default=None, max_length=2000)
    
    # Feedback and Corrections
    false_positive: bool = Field(default=False)
    false_negative: bool = Field(default=False)
    pattern_corrections: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    suggested_improvements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Timing
    validated_at: datetime = Field(default_factory=datetime.utcnow)
    validation_duration_minutes: Optional[float] = Field(default=None, ge=0)
    
    # Impact on Pattern Library
    pattern_library_updated: bool = Field(default=False)
    model_retraining_triggered: bool = Field(default=False)
    threshold_adjustment: Optional[Dict[str, float]] = Field(default=None, sa_column=Column(JSON))
    
    # Metadata
    validation_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    external_validation_source: Optional[str] = Field(default=None, max_length=200)
    
    # Relationships
    pattern_library: PatternLibrary = Relationship(back_populates="pattern_validations")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_validation_pattern_type", "pattern_id", "validation_type"),
        Index("idx_validation_valid_score", "is_valid", "validation_score"),
    )

# ===================================
# SEMANTIC ANALYSIS MODELS
# ===================================

class SemanticAnalysis(SQLModel, table=True):
    """
    Semantic analysis of data patterns and rules using NLP.
    """
    __tablename__ = "semantic_analysis"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    analysis_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    target_type: str = Field(max_length=100)  # rule, pattern, data_element, schema
    target_id: str = Field(max_length=200, index=True)
    
    # Text Analysis
    source_text: Text
    analyzed_text: Text
    language_detected: str = Field(max_length=10)
    text_quality_score: float = Field(ge=0, le=100)
    
    # Semantic Understanding
    semantic_concepts: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    named_entities: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    business_terms: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    technical_terms: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Sentiment and Intent Analysis
    sentiment_score: Optional[float] = Field(default=None, ge=-1, le=1)
    intent_classification: Optional[str] = Field(default=None, max_length=100)
    urgency_level: Optional[str] = Field(default=None, max_length=50)
    
    # Relationship Analysis
    semantic_relationships: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    concept_hierarchy: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    domain_classification: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality Assessment
    completeness_score: float = Field(ge=0, le=100)
    clarity_score: float = Field(ge=0, le=100)
    consistency_score: float = Field(ge=0, le=100)
    complexity_score: float = Field(ge=0, le=100)
    
    # AI Model Information
    nlp_model_name: str = Field(max_length=100)
    nlp_model_version: str = Field(max_length=50)
    processing_confidence: float = Field(ge=0, le=1)
    
    # Analysis Context
    analysis_purpose: str = Field(max_length=200)
    business_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    analysis_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Timing and Performance
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
    analysis_duration_ms: float = Field(ge=0)
    
    # Relationships
    contextual_analysis: List["ContextualAnalysis"] = Relationship(back_populates="semantic_analysis")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_semantic_target", "target_type", "target_id"),
        Index("idx_semantic_language", "language_detected"),
        Index("idx_semantic_quality", "text_quality_score"),
    )

class ContextualAnalysis(SQLModel, table=True):
    """
    Contextual analysis combining multiple data sources and intelligence.
    """
    __tablename__ = "contextual_analysis"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    analysis_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    pattern_detection_id: Optional[str] = Field(foreign_key="pattern_detection_results.detection_id", index=True)
    semantic_analysis_id: Optional[str] = Field(foreign_key="semantic_analysis.analysis_id", index=True)
    
    # Context Types
    context_types: List[ContextType] = Field(default_factory=list, sa_column=Column(JSON))
    primary_context: ContextType
    context_scope: str = Field(max_length=200)
    
    # Business Context
    business_domain: Optional[str] = Field(default=None, max_length=100)
    business_process: Optional[str] = Field(default=None, max_length=200)
    business_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    stakeholders: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Technical Context
    system_architecture: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    data_architecture: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    integration_points: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    dependencies: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal Context
    time_sensitivity: Optional[str] = Field(default=None, max_length=50)
    seasonal_patterns: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    historical_trends: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Regulatory Context
    applicable_regulations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_requirements: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    audit_requirements: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Risk Assessment
    risk_level: str = Field(max_length=50)
    risk_factors: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    mitigation_strategies: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Impact Analysis
    business_impact_level: str = Field(max_length=50)
    technical_impact_level: str = Field(max_length=50)
    user_impact_level: str = Field(max_length=50)
    cost_impact: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Context Quality
    context_completeness: float = Field(ge=0, le=100)
    context_accuracy: float = Field(ge=0, le=100)
    context_relevance: float = Field(ge=0, le=100)
    
    # Analysis Metadata
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
    analysis_method: str = Field(max_length=100)
    data_sources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    pattern_detection: Optional[PatternDetectionResult] = Relationship(back_populates="contextual_analysis")
    semantic_analysis: Optional[SemanticAnalysis] = Relationship(back_populates="contextual_analysis")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_context_type_scope", "primary_context", "context_scope"),
        Index("idx_context_risk", "risk_level"),
        Index("idx_context_impact", "business_impact_level"),
    )

# ===================================
# INTELLIGENT RECOMMENDATIONS
# ===================================

class IntelligentRecommendation(SQLModel, table=True):
    """
    AI-powered recommendations for rules, patterns, and optimizations.
    """
    __tablename__ = "intelligent_recommendations"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    recommendation_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    pattern_detection_id: Optional[str] = Field(foreign_key="pattern_detection_results.detection_id", index=True)
    
    # Recommendation Classification
    recommendation_type: RecommendationType
    recommendation_category: str = Field(max_length=100)
    priority_level: str = Field(max_length=50)
    urgency_level: str = Field(max_length=50)
    
    # Recommendation Content
    title: str = Field(max_length=200)
    description: Text
    detailed_explanation: Optional[Text] = Field(default=None)
    implementation_steps: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # AI Analysis
    confidence_score: float = Field(ge=0, le=1)
    ai_reasoning: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    supporting_evidence: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    alternative_approaches: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Impact Predictions
    expected_improvement: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    effort_estimate: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    risk_assessment: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    cost_benefit_analysis: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Implementation Tracking
    implementation_status: str = Field(default="pending", max_length=50)
    assigned_to: Optional[str] = Field(default=None, max_length=100)
    implementation_deadline: Optional[datetime] = Field(default=None)
    progress_percentage: float = Field(default=0, ge=0, le=100)
    
    # Feedback and Validation
    user_rating: Optional[int] = Field(default=None, ge=1, le=5)
    user_feedback: Optional[Text] = Field(default=None)
    effectiveness_score: Optional[float] = Field(default=None, ge=0, le=100)
    actual_impact: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Lifecycle Management
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(default=None)
    is_active: bool = Field(default=True)
    
    # AI Model Information
    model_name: str = Field(max_length=100)
    model_version: str = Field(max_length=50)
    training_data_version: Optional[str] = Field(default=None, max_length=50)
    
    # Relationships
    pattern_detection: Optional[PatternDetectionResult] = Relationship(back_populates="recommendations")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_recommendation_type_priority", "recommendation_type", "priority_level"),
        Index("idx_recommendation_status", "implementation_status"),
        Index("idx_recommendation_confidence", "confidence_score"),
    )

# ===================================
# AI MODEL MANAGEMENT
# ===================================

class AIModelRegistry(SQLModel, table=True):
    """
    Registry of AI models used for pattern detection and analysis.
    """
    __tablename__ = "ai_model_registry"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    model_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    model_name: str = Field(max_length=200, index=True)
    model_version: str = Field(max_length=50)
    
    # Model Classification
    model_type: AIModelType
    model_category: str = Field(max_length=100)  # classification, regression, clustering, etc.
    use_case: str = Field(max_length=200)
    target_patterns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Model Configuration
    model_architecture: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    hyperparameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    training_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance Metrics
    accuracy: Optional[float] = Field(default=None, ge=0, le=1)
    precision: Optional[float] = Field(default=None, ge=0, le=1)
    recall: Optional[float] = Field(default=None, ge=0, le=1)
    f1_score: Optional[float] = Field(default=None, ge=0, le=1)
    
    # Training Information
    training_data_size: Optional[int] = Field(default=None, ge=0)
    training_duration_hours: Optional[float] = Field(default=None, ge=0)
    validation_method: Optional[str] = Field(default=None, max_length=100)
    cross_validation_scores: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    
    # Deployment Information
    deployment_status: str = Field(default="development", max_length=50)
    deployment_environment: Optional[str] = Field(default=None, max_length=100)
    model_endpoint: Optional[str] = Field(default=None, max_length=500)
    inference_latency_ms: Optional[float] = Field(default=None, ge=0)
    
    # Lifecycle Management
    created_at: datetime = Field(default_factory=datetime.utcnow)
    trained_at: Optional[datetime] = Field(default=None)
    deployed_at: Optional[datetime] = Field(default=None)
    last_evaluated_at: Optional[datetime] = Field(default=None)
    retired_at: Optional[datetime] = Field(default=None)
    
    # Versioning
    parent_model_id: Optional[str] = Field(default=None)
    is_baseline: bool = Field(default=False)
    is_champion: bool = Field(default=False)
    is_challenger: bool = Field(default=False)
    
    # Metadata
    created_by: str = Field(max_length=100)
    model_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    model_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_model_type_status", "model_type", "deployment_status"),
        Index("idx_model_performance", "accuracy", "f1_score"),
        UniqueConstraint("model_name", "model_version", name="uq_model_name_version"),
    )

# ===================================
# REQUEST/RESPONSE MODELS
# ===================================

class PatternDetectionRequest(BaseModel):
    """Request model for pattern detection."""
    data_source_id: Optional[int] = None
    rule_set_id: Optional[int] = None
    pattern_types: List[PatternType] = Field(default_factory=list)
    detection_scope: str
    confidence_threshold: float = Field(default=0.7, ge=0, le=1)
    analysis_depth: str = Field(default="standard")  # basic, standard, deep
    include_semantic_analysis: bool = Field(default=True)
    include_contextual_analysis: bool = Field(default=True)

class PatternDetectionResponse(BaseModel):
    """Response model for pattern detection."""
    detection_id: str
    patterns_detected: int
    high_confidence_patterns: int
    processing_time_seconds: float
    analysis_summary: Dict[str, Any]
    detected_patterns: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]

class SemanticAnalysisRequest(BaseModel):
    """Request model for semantic analysis."""
    target_type: str
    target_id: str
    source_text: str
    analysis_purpose: str
    include_sentiment: bool = Field(default=True)
    include_entities: bool = Field(default=True)
    include_relationships: bool = Field(default=True)

class RecommendationRequest(BaseModel):
    """Request model for AI recommendations."""
    pattern_detection_id: Optional[str] = None
    context_data: Dict[str, Any] = Field(default_factory=dict)
    recommendation_types: List[RecommendationType] = Field(default_factory=list)
    priority_filter: Optional[str] = None
    include_implementation_plan: bool = Field(default=True)

class ModelPerformanceUpdate(BaseModel):
    """Model for updating AI model performance metrics."""
    model_id: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    inference_latency_ms: Optional[float] = None
    validation_results: Optional[Dict[str, Any]] = None