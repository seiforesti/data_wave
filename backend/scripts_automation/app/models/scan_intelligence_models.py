"""
Scan Intelligence Models for Enterprise Data Governance System
============================================================

This module contains sophisticated models for AI-powered scan intelligence,
intelligent pattern recognition, predictive scanning optimization, and
advanced scan orchestration with machine learning capabilities.

Features:
- AI-powered scan optimization and scheduling
- Intelligent pattern recognition and anomaly detection
- Predictive scan planning and resource optimization
- Advanced performance analytics and insights
- Machine learning-based scan improvement
- Real-time scan intelligence and monitoring
- Cross-system scan coordination and orchestration
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, ARRAY, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple, Generic, TypeVar
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator, Field as PydanticField
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
import numpy as np

# ===================== ENUMS AND CONSTANTS =====================

class ScanIntelligenceType(str, Enum):
    """Types of scan intelligence and optimization"""
    PERFORMANCE_OPTIMIZATION = "performance_optimization"
    RESOURCE_PREDICTION = "resource_prediction"
    PATTERN_RECOGNITION = "pattern_recognition"
    ANOMALY_DETECTION = "anomaly_detection"
    SCHEDULING_OPTIMIZATION = "scheduling_optimization"
    QUALITY_PREDICTION = "quality_prediction"
    FAILURE_PREDICTION = "failure_prediction"
    COST_OPTIMIZATION = "cost_optimization"

class OptimizationStrategy(str, Enum):
    """Optimization strategies for scan operations"""
    PERFORMANCE_FOCUSED = "performance_focused"
    COST_OPTIMIZED = "cost_optimized"
    QUALITY_MAXIMIZED = "quality_maximized"
    RESOURCE_BALANCED = "resource_balanced"
    TIME_CRITICAL = "time_critical"
    ACCURACY_FOCUSED = "accuracy_focused"
    ADAPTIVE = "adaptive"
    CUSTOM = "custom"

class PredictionModel(str, Enum):
    """Types of ML models used for predictions"""
    LINEAR_REGRESSION = "linear_regression"
    RANDOM_FOREST = "random_forest"
    GRADIENT_BOOSTING = "gradient_boosting"
    NEURAL_NETWORK = "neural_network"
    TIME_SERIES = "time_series"
    ENSEMBLE = "ensemble"
    REINFORCEMENT_LEARNING = "reinforcement_learning"
    TRANSFORMER = "transformer"

class PerformanceMetric(str, Enum):
    """Key performance metrics for scan operations"""
    EXECUTION_TIME = "execution_time"
    RESOURCE_UTILIZATION = "resource_utilization"
    DATA_THROUGHPUT = "data_throughput"
    ERROR_RATE = "error_rate"
    SUCCESS_RATE = "success_rate"
    COST_EFFICIENCY = "cost_efficiency"
    QUALITY_SCORE = "quality_score"
    USER_SATISFACTION = "user_satisfaction"

class AnomalyType(str, Enum):
    """Types of anomalies detected in scan operations"""
    PERFORMANCE_DEGRADATION = "performance_degradation"
    UNUSUAL_RESOURCE_USAGE = "unusual_resource_usage"
    DATA_QUALITY_ISSUES = "data_quality_issues"
    SECURITY_ANOMALY = "security_anomaly"
    PATTERN_DEVIATION = "pattern_deviation"
    SYSTEM_BEHAVIOR = "system_behavior"
    USER_BEHAVIOR = "user_behavior"
    EXTERNAL_FACTOR = "external_factor"

# ===================== SCAN INTELLIGENCE MODELS =====================

class ScanIntelligenceModel(SQLModel, table=True):
    """
    Represents AI/ML models used for scan intelligence and optimization.
    Tracks model performance, versions, and deployment status.
    """
    __tablename__ = "scan_intelligence_models"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    model_id: str = Field(index=True, unique=True)
    model_name: str = Field(index=True)
    
    # Model details
    intelligence_type: ScanIntelligenceType = Field(index=True)
    model_type: PredictionModel = Field(index=True)
    model_version: str = Field(default="1.0", index=True)
    
    # Model configuration
    model_parameters: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    feature_set: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    target_metrics: List[PerformanceMetric] = Field(default=[], sa_column=Column(ARRAY(String)))
    
    # Training information
    training_data_size: Optional[int] = Field(default=None)
    training_period_start: Optional[datetime] = Field(default=None)
    training_period_end: Optional[datetime] = Field(default=None)
    training_duration_minutes: Optional[int] = Field(default=None)
    
    # Model performance
    accuracy_score: Optional[float] = Field(default=None)
    precision_score: Optional[float] = Field(default=None)
    recall_score: Optional[float] = Field(default=None)
    f1_score: Optional[float] = Field(default=None)
    validation_score: Optional[float] = Field(default=None)
    cross_validation_score: Optional[float] = Field(default=None)
    
    # Deployment information
    is_deployed: bool = Field(default=False, index=True)
    deployment_date: Optional[datetime] = Field(default=None)
    deployment_environment: Optional[str] = Field(default=None)
    api_endpoint: Optional[str] = Field(default=None)
    
    # Performance metrics
    prediction_count: int = Field(default=0)
    successful_predictions: int = Field(default=0)
    average_prediction_time_ms: Optional[float] = Field(default=None)
    confidence_threshold: float = Field(default=0.7)
    
    # Model lifecycle
    status: str = Field(default="training", index=True)  # training, deployed, deprecated
    retirement_date: Optional[datetime] = Field(default=None)
    replacement_model_id: Optional[str] = Field(default=None)
    
    # Monitoring and alerts
    performance_degradation_threshold: float = Field(default=0.1)
    last_performance_check: Optional[datetime] = Field(default=None)
    alerts_enabled: bool = Field(default=True)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(default="system")
    
    # Additional metadata
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_intelligence_model_type', 'intelligence_type', 'model_type'),
        Index('idx_intelligence_model_status', 'status', 'is_deployed'),
    )

class ScanOptimizationRecommendation(SQLModel, table=True):
    """
    Stores AI-generated recommendations for scan optimization.
    Provides actionable insights to improve scan performance and efficiency.
    """
    __tablename__ = "scan_optimization_recommendations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    recommendation_id: str = Field(index=True, unique=True)
    
    # Scope and target
    scan_rule_id: Optional[str] = Field(default=None, index=True)
    data_source_id: Optional[int] = Field(default=None, index=True)
    asset_id: Optional[str] = Field(default=None, index=True)
    scope: str = Field(index=True)  # rule, source, asset, global
    
    # Recommendation details
    optimization_type: OptimizationStrategy = Field(index=True)
    recommendation_title: str = Field(index=True)
    recommendation_description: str = Field(sa_column=Column(Text))
    detailed_analysis: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Impact analysis
    expected_performance_improvement: Optional[float] = Field(default=None)  # Percentage
    expected_cost_reduction: Optional[float] = Field(default=None)  # Percentage
    expected_quality_improvement: Optional[float] = Field(default=None)  # Percentage
    implementation_effort: str = Field(default="medium")  # low, medium, high
    
    # Supporting data
    current_metrics: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    projected_metrics: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    supporting_evidence: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Implementation details
    recommended_actions: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    implementation_steps: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    configuration_changes: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # AI/ML metadata
    model_id: str = Field(foreign_key="scan_intelligence_models.model_id", index=True)
    confidence_score: float = Field(default=0.0)
    prediction_accuracy: Optional[float] = Field(default=None)
    
    # Priority and scheduling
    priority_level: str = Field(default="medium", index=True)  # critical, high, medium, low
    recommended_implementation_date: Optional[datetime] = Field(default=None)
    estimated_implementation_time: Optional[int] = Field(default=None)  # Hours
    
    # Status tracking
    status: str = Field(default="pending", index=True)  # pending, approved, implementing, completed, rejected
    approval_date: Optional[datetime] = Field(default=None)
    implementation_date: Optional[datetime] = Field(default=None)
    completion_date: Optional[datetime] = Field(default=None)
    
    # Results tracking
    actual_performance_improvement: Optional[float] = Field(default=None)
    actual_cost_reduction: Optional[float] = Field(default=None)
    actual_quality_improvement: Optional[float] = Field(default=None)
    user_satisfaction_score: Optional[float] = Field(default=None)
    
    # Feedback and learning
    implementation_feedback: Optional[str] = Field(default=None, sa_column=Column(Text))
    lessons_learned: Optional[str] = Field(default=None, sa_column=Column(Text))
    would_recommend_again: Optional[bool] = Field(default=None)
    
    # Audit fields
    generated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(default=None, index=True)
    
    # Relationships
    model: Optional[ScanIntelligenceModel] = Relationship()
    
    # Additional metadata
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_optimization_scope_type', 'scope', 'optimization_type'),
        Index('idx_optimization_priority_status', 'priority_level', 'status'),
    )

class ScanAnomalyDetection(SQLModel, table=True):
    """
    Stores detected anomalies in scan operations and system behavior.
    Enables proactive issue identification and resolution.
    """
    __tablename__ = "scan_anomaly_detections"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    anomaly_id: str = Field(index=True, unique=True)
    
    # Anomaly identification
    anomaly_type: AnomalyType = Field(index=True)
    severity_level: str = Field(index=True)  # critical, high, medium, low
    confidence_score: float = Field(default=0.0)
    
    # Scope and context
    scan_rule_id: Optional[str] = Field(default=None, index=True)
    data_source_id: Optional[int] = Field(default=None, index=True)
    asset_id: Optional[str] = Field(default=None, index=True)
    user_id: Optional[str] = Field(default=None, index=True)
    
    # Anomaly details
    anomaly_title: str = Field(index=True)
    anomaly_description: str = Field(sa_column=Column(Text))
    detailed_analysis: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Detection information
    detection_time: datetime = Field(default_factory=datetime.utcnow, index=True)
    detection_method: str = Field(index=True)  # statistical, ml, rule_based, hybrid
    detection_model_id: Optional[str] = Field(default=None, foreign_key="scan_intelligence_models.model_id")
    
    # Baseline and deviation
    baseline_value: Optional[float] = Field(default=None)
    observed_value: Optional[float] = Field(default=None)
    deviation_percentage: Optional[float] = Field(default=None)
    threshold_value: Optional[float] = Field(default=None)
    
    # Supporting data
    anomaly_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    context_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    time_series_data: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    
    # Impact assessment
    potential_impact: str = Field(default="unknown")  # none, low, medium, high, critical
    affected_systems: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    business_impact_description: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Response and resolution
    recommended_actions: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    automated_response_triggered: bool = Field(default=False)
    manual_investigation_required: bool = Field(default=True)
    
    # Status tracking
    status: str = Field(default="new", index=True)  # new, investigating, resolved, false_positive
    investigation_start_time: Optional[datetime] = Field(default=None)
    resolution_time: Optional[datetime] = Field(default=None)
    resolution_notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Follow-up and learning
    root_cause: Optional[str] = Field(default=None, sa_column=Column(Text))
    preventive_measures: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    false_positive: bool = Field(default=False)
    feedback_for_model: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Notification and alerting
    notifications_sent: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    escalation_level: int = Field(default=1)
    escalation_time: Optional[datetime] = Field(default=None)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    detection_model: Optional[ScanIntelligenceModel] = Relationship()
    
    # Additional metadata
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_anomaly_type_severity', 'anomaly_type', 'severity_level'),
        Index('idx_anomaly_detection_time', 'detection_time', 'status'),
    )

class ScanPerformanceMetrics(SQLModel, table=True):
    """
    Comprehensive performance metrics for scan operations.
    Used for AI analysis, optimization, and trend prediction.
    """
    __tablename__ = "scan_performance_metrics"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    metric_id: str = Field(index=True, unique=True)
    
    # Metric identification
    metric_type: PerformanceMetric = Field(index=True)
    metric_name: str = Field(index=True)
    metric_value: float = Field(index=True)
    metric_unit: str = Field(default="")
    
    # Scope and context
    scan_rule_id: Optional[str] = Field(default=None, index=True)
    data_source_id: Optional[int] = Field(default=None, index=True)
    asset_id: Optional[str] = Field(default=None, index=True)
    scan_execution_id: Optional[str] = Field(default=None, index=True)
    
    # Temporal information
    measurement_time: datetime = Field(default_factory=datetime.utcnow, index=True)
    measurement_period: Optional[str] = Field(default=None)  # instant, hour, day, week
    aggregation_method: Optional[str] = Field(default=None)  # avg, max, min, sum, count
    
    # Baseline and comparison
    baseline_value: Optional[float] = Field(default=None)
    target_value: Optional[float] = Field(default=None)
    threshold_value: Optional[float] = Field(default=None)
    percentage_change: Optional[float] = Field(default=None)
    
    # Quality and reliability
    measurement_confidence: float = Field(default=1.0)
    data_quality_score: Optional[float] = Field(default=None)
    sample_size: Optional[int] = Field(default=None)
    measurement_method: str = Field(default="automated")
    
    # Context and environment
    system_load: Optional[float] = Field(default=None)
    concurrent_scans: Optional[int] = Field(default=None)
    resource_availability: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    environmental_factors: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Statistical analysis
    trend_direction: Optional[str] = Field(default=None)  # increasing, decreasing, stable
    variance: Optional[float] = Field(default=None)
    standard_deviation: Optional[float] = Field(default=None)
    percentile_rank: Optional[float] = Field(default=None)
    
    # Machine learning features
    is_outlier: bool = Field(default=False)
    anomaly_score: Optional[float] = Field(default=None)
    feature_importance: Optional[float] = Field(default=None)
    cluster_id: Optional[str] = Field(default=None)
    
    # Business context
    business_impact_score: Optional[float] = Field(default=None)
    cost_impact: Optional[float] = Field(default=None)
    user_satisfaction_impact: Optional[float] = Field(default=None)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(default="system")
    
    # Additional metadata
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_performance_metric_type', 'metric_type', 'metric_name'),
        Index('idx_performance_measurement_time', 'measurement_time', 'scan_rule_id'),
        Index('idx_performance_scope', 'scan_rule_id', 'data_source_id', 'asset_id'),
    )

class ScanPrediction(SQLModel, table=True):
    """
    Stores predictions made by AI models for scan operations.
    Enables proactive planning and optimization.
    """
    __tablename__ = "scan_predictions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    prediction_id: str = Field(index=True, unique=True)
    
    # Prediction details
    prediction_type: str = Field(index=True)  # performance, failure, resource, quality
    predicted_metric: PerformanceMetric = Field(index=True)
    predicted_value: float = Field(default=0.0)
    confidence_interval_lower: Optional[float] = Field(default=None)
    confidence_interval_upper: Optional[float] = Field(default=None)
    confidence_score: float = Field(default=0.0)
    
    # Temporal scope
    prediction_horizon: str = Field(index=True)  # next_scan, hour, day, week, month
    prediction_date: datetime = Field(default_factory=datetime.utcnow, index=True)
    target_date: datetime = Field(index=True)
    
    # Scope and context
    scan_rule_id: Optional[str] = Field(default=None, index=True)
    data_source_id: Optional[int] = Field(default=None, index=True)
    asset_id: Optional[str] = Field(default=None, index=True)
    
    # Model information
    model_id: str = Field(foreign_key="scan_intelligence_models.model_id", index=True)
    model_version: str = Field(default="1.0")
    feature_values: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Supporting analysis
    prediction_factors: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    influence_scores: Optional[Dict[str, float]] = Field(default=None, sa_column=Column(JSON))
    scenario_analysis: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Recommendations
    recommended_actions: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    preventive_measures: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    optimization_suggestions: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    
    # Validation and accuracy
    actual_value: Optional[float] = Field(default=None)
    prediction_error: Optional[float] = Field(default=None)
    accuracy_score: Optional[float] = Field(default=None)
    is_validated: bool = Field(default=False)
    validation_date: Optional[datetime] = Field(default=None)
    
    # Impact and business value
    business_impact: Optional[str] = Field(default=None)  # high, medium, low
    cost_implications: Optional[float] = Field(default=None)
    resource_requirements: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Status and lifecycle
    status: str = Field(default="active", index=True)  # active, validated, expired
    expires_at: Optional[datetime] = Field(default=None, index=True)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    model: Optional[ScanIntelligenceModel] = Relationship()
    
    # Additional metadata
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    class Config:
        arbitrary_types_allowed = True
    
    __table_args__ = (
        Index('idx_prediction_type_metric', 'prediction_type', 'predicted_metric'),
        Index('idx_prediction_target_date', 'target_date', 'prediction_horizon'),
        Index('idx_prediction_scope', 'scan_rule_id', 'data_source_id'),
    )

# ===================== PYDANTIC MODELS FOR API =====================

class OptimizationRequest(BaseModel):
    """Request model for scan optimization recommendations"""
    scan_rule_ids: Optional[List[str]] = None
    data_source_ids: Optional[List[int]] = None
    optimization_strategy: OptimizationStrategy = OptimizationStrategy.ADAPTIVE
    analysis_period_days: int = 30
    include_predictions: bool = True

class AnomalyDetectionRequest(BaseModel):
    """Request model for anomaly detection"""
    scope: str  # rule, source, asset, global
    target_ids: Optional[List[str]] = None
    detection_sensitivity: float = 0.8
    look_back_hours: int = 24
    include_context: bool = True

class PredictionRequest(BaseModel):
    """Request model for generating predictions"""
    prediction_type: str
    target_metric: PerformanceMetric
    scan_rule_ids: Optional[List[str]] = None
    prediction_horizon: str = "day"
    confidence_threshold: float = 0.7

class IntelligenceResponse(BaseModel):
    """Response model for scan intelligence operations"""
    recommendations: List[Dict[str, Any]]
    anomalies: List[Dict[str, Any]]
    predictions: List[Dict[str, Any]]
    performance_insights: List[Dict[str, Any]]
    optimization_opportunities: List[Dict[str, Any]]
    confidence_score: float
    processing_time_ms: int
    metadata: Dict[str, Any]