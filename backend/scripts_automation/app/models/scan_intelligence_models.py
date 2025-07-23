"""
Advanced Scan Intelligence Models for Enterprise Data Governance
==============================================================

This module contains sophisticated AI/ML models for intelligent scanning behavior,
predictive analytics, behavioral pattern recognition, and enterprise decision-making
capabilities that surpass industry standards.

Features:
- AI-powered scan optimization and prediction
- Behavioral analysis and pattern recognition
- Intelligent resource allocation models
- Predictive maintenance and failure prevention
- Business intelligence and ROI optimization
- Advanced analytics and reporting models
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, Text, ARRAY, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint


# ===================== ENUMS AND CONSTANTS =====================

class IntelligenceType(str, Enum):
    """Types of intelligence analysis"""
    BEHAVIORAL = "behavioral"          # User/system behavior analysis
    PREDICTIVE = "predictive"          # Future trend prediction
    ANOMALY = "anomaly"               # Anomaly detection
    OPTIMIZATION = "optimization"      # Performance optimization
    RECOMMENDATION = "recommendation"  # Intelligent recommendations
    SENTIMENT = "sentiment"           # Business sentiment analysis
    CLASSIFICATION = "classification"  # AI classification insights
    CLUSTERING = "clustering"         # Data clustering analysis

class PredictionConfidence(str, Enum):
    """Confidence levels for AI predictions"""
    VERY_LOW = "very_low"             # 0-20% confidence
    LOW = "low"                       # 20-40% confidence
    MEDIUM = "medium"                 # 40-60% confidence
    HIGH = "high"                     # 60-80% confidence
    VERY_HIGH = "very_high"           # 80-95% confidence
    CRITICAL = "critical"             # 95-100% confidence

class OptimizationGoal(str, Enum):
    """Optimization objectives"""
    PERFORMANCE = "performance"        # Maximize performance
    COST = "cost"                     # Minimize cost
    QUALITY = "quality"               # Maximize quality
    RELIABILITY = "reliability"       # Maximize reliability
    EFFICIENCY = "efficiency"         # Maximize efficiency
    ROI = "roi"                      # Maximize return on investment
    COMPLIANCE = "compliance"         # Ensure compliance
    BALANCED = "balanced"            # Balance all factors

class AnalyticsGranularity(str, Enum):
    """Analytics time granularity"""
    REAL_TIME = "real_time"           # Real-time (seconds)
    MINUTE = "minute"                 # Per minute aggregation
    HOURLY = "hourly"                # Per hour aggregation
    DAILY = "daily"                  # Per day aggregation
    WEEKLY = "weekly"                # Per week aggregation
    MONTHLY = "monthly"              # Per month aggregation
    QUARTERLY = "quarterly"          # Per quarter aggregation
    YEARLY = "yearly"                # Per year aggregation


# ===================== CORE AI/ML MODELS =====================

class ScanIntelligenceProfile(SQLModel, table=True):
    """
    Advanced AI-powered intelligence profile for scanning operations.
    Tracks behavioral patterns, performance metrics, and optimization opportunities.
    """
    __tablename__ = "scan_intelligence_profiles"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    profile_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Intelligence configuration
    intelligence_type: IntelligenceType
    analysis_scope: str  # JSON array of scope identifiers
    target_entities: str = Field(default="[]")  # JSON array of target entity IDs
    confidence_threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    learning_rate: float = Field(default=0.01, ge=0.001, le=1.0)
    
    # AI/ML Model Configuration
    model_type: str = "ensemble"  # neural_network, random_forest, ensemble, deep_learning
    model_parameters: str = Field(default="{}")  # JSON model configuration
    feature_extraction_config: str = Field(default="{}")  # JSON feature config
    training_data_sources: str = Field(default="[]")  # JSON data source IDs
    
    # Performance Metrics
    accuracy_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    precision_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    recall_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    auc_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # Business Impact
    roi_improvement: Optional[float] = None  # % improvement in ROI
    cost_reduction: Optional[float] = None   # % cost reduction achieved
    efficiency_gain: Optional[float] = None  # % efficiency improvement
    quality_improvement: Optional[float] = None  # % quality improvement
    
    # Lifecycle Management
    is_active: bool = Field(default=True, index=True)
    is_production_ready: bool = Field(default=False)
    last_training_date: Optional[datetime] = None
    next_training_scheduled: Optional[datetime] = None
    model_version: str = Field(default="1.0.0")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    tags: str = Field(default="[]")  # JSON array of tags
    
    # Relationships
    intelligence_insights: List["ScanIntelligenceInsight"] = Relationship(back_populates="profile")
    behavioral_patterns: List["ScanBehavioralPattern"] = Relationship(back_populates="profile")
    predictive_models: List["ScanPredictiveModel"] = Relationship(back_populates="profile")


class ScanIntelligenceInsight(SQLModel, table=True):
    """
    AI-generated insights from scan intelligence analysis.
    Provides actionable recommendations and strategic guidance.
    """
    __tablename__ = "scan_intelligence_insights"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    insight_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    profile_id: int = Field(foreign_key="scan_intelligence_profiles.id", index=True)
    
    # Insight Details
    insight_type: IntelligenceType
    title: str = Field(index=True)
    description: str
    detailed_analysis: str  # Comprehensive analysis
    
    # Recommendations
    recommended_actions: str = Field(default="[]")  # JSON array of actions
    implementation_priority: int = Field(default=5, ge=1, le=10)
    estimated_impact: str = Field(default="{}")  # JSON impact analysis
    implementation_effort: str = "medium"  # low, medium, high, enterprise
    
    # Confidence and Validation
    confidence_level: PredictionConfidence
    confidence_score: float = Field(ge=0.0, le=1.0)
    validation_status: str = "pending"  # pending, validated, rejected, implemented
    validation_feedback: Optional[str] = None
    
    # Business Context
    business_value: Optional[float] = None  # Estimated business value
    cost_implications: Optional[float] = None  # Cost implications
    risk_assessment: str = Field(default="{}")  # JSON risk analysis
    compliance_impact: Optional[str] = None
    
    # Evidence and Supporting Data
    supporting_evidence: str = Field(default="{}")  # JSON evidence data
    data_sources_used: str = Field(default="[]")  # JSON data source IDs
    analysis_methodology: str  # Description of analysis method
    statistical_significance: Optional[float] = None
    
    # Lifecycle
    generated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    expires_at: Optional[datetime] = None
    implemented_at: Optional[datetime] = None
    is_archived: bool = Field(default=False)
    
    # Relationships
    profile: Optional[ScanIntelligenceProfile] = Relationship(back_populates="intelligence_insights")


class ScanBehavioralPattern(SQLModel, table=True):
    """
    Behavioral pattern recognition for users, systems, and data access patterns.
    Enables predictive analytics and anomaly detection.
    """
    __tablename__ = "scan_behavioral_patterns"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    pattern_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    profile_id: int = Field(foreign_key="scan_intelligence_profiles.id", index=True)
    
    # Pattern Details
    pattern_name: str = Field(index=True)
    pattern_type: str  # access_pattern, usage_pattern, performance_pattern, error_pattern
    entity_type: str   # user, system, data_source, application
    entity_id: str = Field(index=True)
    
    # Pattern Analysis
    pattern_description: str
    pattern_strength: float = Field(ge=0.0, le=1.0)  # How strong/consistent the pattern is
    frequency_analysis: str = Field(default="{}")  # JSON frequency data
    temporal_analysis: str = Field(default="{}")   # JSON temporal patterns
    seasonal_patterns: str = Field(default="{}")   # JSON seasonal analysis
    
    # Statistical Measures
    mean_value: Optional[float] = None
    median_value: Optional[float] = None
    standard_deviation: Optional[float] = None
    coefficient_variation: Optional[float] = None
    trend_direction: Optional[str] = None  # increasing, decreasing, stable, volatile
    
    # Anomaly Detection
    anomaly_threshold: float = Field(default=2.0)  # Standard deviations for anomaly
    anomaly_count: int = Field(default=0)
    last_anomaly_detected: Optional[datetime] = None
    false_positive_rate: Optional[float] = None
    
    # Business Context
    business_relevance: str = "medium"  # low, medium, high, critical
    operational_impact: Optional[str] = None
    optimization_opportunity: Optional[str] = None
    
    # Data Collection
    data_points_analyzed: int = Field(default=0)
    analysis_period_start: datetime
    analysis_period_end: datetime
    sample_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    next_analysis_due: Optional[datetime] = None
    
    # Relationships
    profile: Optional[ScanIntelligenceProfile] = Relationship(back_populates="behavioral_patterns")


class ScanPredictiveModel(SQLModel, table=True):
    """
    Advanced predictive models for forecasting scan outcomes, resource needs,
    and business impact. Uses ML/AI for accurate predictions.
    """
    __tablename__ = "scan_predictive_models"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    model_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    profile_id: int = Field(foreign_key="scan_intelligence_profiles.id", index=True)
    
    # Model Configuration
    model_name: str = Field(index=True)
    model_type: str  # time_series, regression, classification, ensemble, neural_network
    algorithm: str   # arima, lstm, random_forest, xgboost, neural_network
    prediction_target: str  # What is being predicted
    prediction_horizon: int  # Hours into the future
    
    # Feature Engineering
    input_features: str = Field(default="[]")  # JSON array of feature names
    feature_importance: str = Field(default="{}")  # JSON feature importance scores
    feature_selection_method: str = "automatic"
    dimensionality_reduction: Optional[str] = None
    
    # Model Performance
    training_accuracy: Optional[float] = None
    validation_accuracy: Optional[float] = None
    test_accuracy: Optional[float] = None
    cross_validation_score: Optional[float] = None
    prediction_error_rate: Optional[float] = None
    
    # Advanced Metrics
    mean_absolute_error: Optional[float] = None
    root_mean_square_error: Optional[float] = None
    r_squared: Optional[float] = None
    auc_roc: Optional[float] = None
    confusion_matrix: Optional[str] = None  # JSON serialized matrix
    
    # Training Configuration
    training_data_size: int = Field(default=0)
    training_duration_hours: Optional[float] = None
    hyperparameters: str = Field(default="{}")  # JSON hyperparameter configuration
    optimization_method: str = "grid_search"
    cross_validation_folds: int = Field(default=5)
    
    # Production Deployment
    is_deployed: bool = Field(default=False)
    deployment_date: Optional[datetime] = None
    model_endpoint: Optional[str] = None
    prediction_latency_ms: Optional[float] = None
    throughput_predictions_per_second: Optional[float] = None
    
    # Model Lifecycle
    model_version: str = Field(default="1.0.0")
    retrain_frequency_days: int = Field(default=30)
    last_retrain_date: Optional[datetime] = None
    next_retrain_scheduled: Optional[datetime] = None
    model_drift_detected: bool = Field(default=False)
    
    # Business Value
    business_impact_score: Optional[float] = None
    cost_savings_projected: Optional[float] = None
    efficiency_improvement: Optional[float] = None
    roi_projection: Optional[float] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    
    # Relationships
    profile: Optional[ScanIntelligenceProfile] = Relationship(back_populates="predictive_models")
    predictions: List["ScanPrediction"] = Relationship(back_populates="model")


class ScanPrediction(SQLModel, table=True):
    """
    Individual predictions generated by predictive models.
    Tracks prediction accuracy and provides feedback for model improvement.
    """
    __tablename__ = "scan_predictions"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    prediction_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    model_id: int = Field(foreign_key="scan_predictive_models.id", index=True)
    
    # Prediction Details
    prediction_type: str = Field(index=True)  # resource_usage, completion_time, failure_risk, quality_score
    target_entity_type: str  # scan, data_source, rule_set, orchestration
    target_entity_id: str = Field(index=True)
    
    # Prediction Value
    predicted_value: float
    predicted_value_unit: str  # hours, GB, percentage, score
    prediction_range_min: Optional[float] = None
    prediction_range_max: Optional[float] = None
    confidence_interval: Optional[str] = None  # JSON confidence interval
    
    # Temporal Information
    prediction_made_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    prediction_for_timestamp: datetime = Field(index=True)
    prediction_horizon_hours: int
    
    # Confidence and Quality
    confidence_score: float = Field(ge=0.0, le=1.0)
    prediction_quality: PredictionConfidence
    uncertainty_estimate: Optional[float] = None
    
    # Validation and Feedback
    actual_value: Optional[float] = None
    actual_value_recorded_at: Optional[datetime] = None
    prediction_error: Optional[float] = None
    prediction_accuracy: Optional[float] = None
    feedback_provided: bool = Field(default=False)
    feedback_score: Optional[int] = Field(default=None, ge=1, le=5)
    
    # Business Context
    business_importance: str = "medium"  # low, medium, high, critical
    decision_impact: Optional[str] = None  # Description of how prediction was used
    action_taken: Optional[str] = None     # Actions taken based on prediction
    
    # Features Used
    input_features_snapshot: str = Field(default="{}")  # JSON snapshot of input features
    feature_values: str = Field(default="{}")           # JSON actual feature values used
    
    # Metadata
    is_validated: bool = Field(default=False)
    validation_source: Optional[str] = None
    notes: Optional[str] = None
    
    # Relationships
    model: Optional[ScanPredictiveModel] = Relationship(back_populates="predictions")


class ScanOptimizationRecommendation(SQLModel, table=True):
    """
    AI-generated optimization recommendations for improving scan performance,
    efficiency, and business value across the entire governance ecosystem.
    """
    __tablename__ = "scan_optimization_recommendations"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    recommendation_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Recommendation Details
    title: str = Field(index=True)
    category: str = Field(index=True)  # performance, cost, quality, compliance, efficiency
    subcategory: Optional[str] = None
    description: str
    detailed_rationale: str
    
    # Target and Scope
    target_entity_type: str  # scan_rule, data_source, orchestration, system_wide
    target_entity_id: Optional[str] = Field(index=True)
    scope: str = "entity"  # entity, group, system_wide, enterprise
    
    # Optimization Goals
    primary_goal: OptimizationGoal
    secondary_goals: str = Field(default="[]")  # JSON array of secondary goals
    expected_benefits: str = Field(default="{}")  # JSON benefits analysis
    
    # Impact Analysis
    performance_impact: Optional[float] = None  # % improvement expected
    cost_impact: Optional[float] = None         # $ cost implications
    quality_impact: Optional[float] = None      # % quality improvement
    efficiency_impact: Optional[float] = None   # % efficiency gain
    risk_impact: Optional[float] = None         # Risk score impact
    
    # Implementation Details
    implementation_complexity: str = "medium"  # simple, medium, complex, enterprise
    implementation_effort_hours: Optional[int] = None
    required_resources: str = Field(default="[]")  # JSON array of required resources
    prerequisites: str = Field(default="[]")       # JSON array of prerequisites
    
    # Validation and Evidence
    confidence_level: PredictionConfidence
    supporting_evidence: str = Field(default="{}")  # JSON evidence data
    analysis_methodology: str
    statistical_significance: Optional[float] = None
    
    # Business Value
    estimated_roi: Optional[float] = None
    payback_period_months: Optional[int] = None
    business_priority: int = Field(default=5, ge=1, le=10)
    strategic_alignment: Optional[str] = None
    
    # Lifecycle Management
    status: str = "generated"  # generated, reviewed, approved, implementing, implemented, rejected
    generated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    reviewed_at: Optional[datetime] = None
    implemented_at: Optional[datetime] = None
    
    # Feedback and Results
    implementation_feedback: Optional[str] = None
    actual_results: Optional[str] = None  # JSON actual results achieved
    recommendation_rating: Optional[int] = Field(default=None, ge=1, le=5)
    
    # AI/ML Context
    generated_by_model: Optional[str] = None
    model_version: Optional[str] = None
    generation_confidence: float = Field(ge=0.0, le=1.0)
    
    # Metadata
    created_by: Optional[str] = None
    assigned_to: Optional[str] = None
    tags: str = Field(default="[]")  # JSON array of tags
    is_archived: bool = Field(default=False)


class ScanIntelligenceAnalytics(SQLModel, table=True):
    """
    Comprehensive analytics and metrics for scan intelligence operations.
    Provides business intelligence and operational insights.
    """
    __tablename__ = "scan_intelligence_analytics"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    analytics_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Analytics Configuration
    analytics_name: str = Field(index=True)
    analytics_type: str = Field(index=True)  # operational, business, technical, strategic
    granularity: AnalyticsGranularity
    time_period_start: datetime = Field(index=True)
    time_period_end: datetime = Field(index=True)
    
    # Operational Metrics
    total_scans_analyzed: int = Field(default=0)
    total_data_sources_covered: int = Field(default=0)
    total_rules_processed: int = Field(default=0)
    total_insights_generated: int = Field(default=0)
    total_recommendations_made: int = Field(default=0)
    
    # Performance Metrics
    average_scan_performance_score: Optional[float] = None
    system_efficiency_percentage: Optional[float] = None
    resource_utilization_percentage: Optional[float] = None
    cost_per_scan_operation: Optional[float] = None
    roi_percentage: Optional[float] = None
    
    # Quality Metrics
    prediction_accuracy_percentage: Optional[float] = None
    recommendation_acceptance_rate: Optional[float] = None
    false_positive_rate: Optional[float] = None
    user_satisfaction_score: Optional[float] = None
    business_value_score: Optional[float] = None
    
    # Detailed Analytics Data
    performance_trends: str = Field(default="{}")      # JSON time series data
    usage_patterns: str = Field(default="{}")          # JSON usage analytics
    cost_analysis: str = Field(default="{}")           # JSON cost breakdown
    quality_metrics: str = Field(default="{}")         # JSON quality data
    business_impact: str = Field(default="{}")         # JSON business metrics
    
    # Comparative Analysis
    previous_period_comparison: str = Field(default="{}")  # JSON comparison data
    benchmark_comparison: str = Field(default="{}")        # JSON benchmark data
    industry_comparison: str = Field(default="{}")         # JSON industry data
    
    # Insights and Observations
    key_insights: str = Field(default="[]")            # JSON array of key insights
    anomalies_detected: str = Field(default="[]")      # JSON array of anomalies
    improvement_opportunities: str = Field(default="[]")  # JSON opportunities
    risk_indicators: str = Field(default="[]")         # JSON risk indicators
    
    # Metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    generated_by: Optional[str] = None
    is_published: bool = Field(default=False)
    published_at: Optional[datetime] = None
    
    # Data Sources
    data_sources_used: str = Field(default="[]")  # JSON array of data source IDs
    computation_duration_seconds: Optional[float] = None
    computation_resources_used: Optional[str] = None


# ===================== RESPONSE AND REQUEST MODELS =====================

class ScanIntelligenceProfileResponse(BaseModel):
    """Response model for scan intelligence profiles"""
    id: int
    profile_uuid: str
    name: str
    description: Optional[str]
    intelligence_type: IntelligenceType
    confidence_threshold: float
    model_type: str
    accuracy_score: Optional[float]
    is_active: bool
    is_production_ready: bool
    created_at: datetime
    roi_improvement: Optional[float]
    cost_reduction: Optional[float]


class ScanIntelligenceInsightResponse(BaseModel):
    """Response model for intelligence insights"""
    id: int
    insight_uuid: str
    insight_type: IntelligenceType
    title: str
    description: str
    confidence_level: PredictionConfidence
    confidence_score: float
    business_value: Optional[float]
    implementation_priority: int
    generated_at: datetime


class ScanPredictionResponse(BaseModel):
    """Response model for scan predictions"""
    id: int
    prediction_uuid: str
    prediction_type: str
    predicted_value: float
    predicted_value_unit: str
    confidence_score: float
    prediction_quality: PredictionConfidence
    prediction_made_at: datetime
    prediction_for_timestamp: datetime
    actual_value: Optional[float]
    prediction_accuracy: Optional[float]


class ScanOptimizationRecommendationResponse(BaseModel):
    """Response model for optimization recommendations"""
    id: int
    recommendation_uuid: str
    title: str
    category: str
    description: str
    primary_goal: OptimizationGoal
    confidence_level: PredictionConfidence
    estimated_roi: Optional[float]
    implementation_complexity: str
    business_priority: int
    status: str
    generated_at: datetime


# ===================== REQUEST MODELS =====================

class ScanIntelligenceProfileCreateRequest(BaseModel):
    """Request model for creating intelligence profiles"""
    name: str
    description: Optional[str] = None
    intelligence_type: IntelligenceType
    analysis_scope: List[str] = []
    target_entities: List[str] = []
    confidence_threshold: float = 0.7
    learning_rate: float = 0.01
    model_type: str = "ensemble"
    model_parameters: Dict[str, Any] = {}
    training_data_sources: List[str] = []


class ScanPredictionRequest(BaseModel):
    """Request model for generating predictions"""
    model_id: int
    target_entity_type: str
    target_entity_id: str
    prediction_horizon_hours: int = 24
    input_features: Dict[str, Any] = {}


class AnalyticsRequest(BaseModel):
    """Request model for generating analytics"""
    analytics_type: str
    granularity: AnalyticsGranularity
    time_period_start: datetime
    time_period_end: datetime
    include_comparisons: bool = True
    include_predictions: bool = True


# ===================== MODEL EXPORTS =====================

__all__ = [
    # Enums
    "IntelligenceType", "PredictionConfidence", "OptimizationGoal", "AnalyticsGranularity",
    
    # Core Models
    "ScanIntelligenceProfile", "ScanIntelligenceInsight", "ScanBehavioralPattern",
    "ScanPredictiveModel", "ScanPrediction", "ScanOptimizationRecommendation",
    "ScanIntelligenceAnalytics",
    
    # Response Models
    "ScanIntelligenceProfileResponse", "ScanIntelligenceInsightResponse",
    "ScanPredictionResponse", "ScanOptimizationRecommendationResponse",
    
    # Request Models
    "ScanIntelligenceProfileCreateRequest", "ScanPredictionRequest", "AnalyticsRequest",
]