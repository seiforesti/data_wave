"""
📈 SCAN PERFORMANCE MODELS
Enterprise-grade performance models for scan operations analytics, bottleneck detection,
optimization recommendations, and comprehensive performance monitoring.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, JSON, text
from pydantic import BaseModel, validator, Field as PydanticField
import json

# ====================================================================
# PERFORMANCE ENUMS
# ====================================================================

class PerformanceMetricType(str, Enum):
    """Types of performance metrics"""
    THROUGHPUT = "throughput"
    LATENCY = "latency"
    RESPONSE_TIME = "response_time"
    CPU_UTILIZATION = "cpu_utilization"
    MEMORY_USAGE = "memory_usage"
    DISK_IO = "disk_io"
    NETWORK_IO = "network_io"
    QUEUE_SIZE = "queue_size"
    ERROR_RATE = "error_rate"
    SUCCESS_RATE = "success_rate"
    CONCURRENCY_LEVEL = "concurrency_level"
    RESOURCE_EFFICIENCY = "resource_efficiency"

class PerformanceLevel(str, Enum):
    """Performance levels for classification"""
    EXCELLENT = "excellent"      # 95%+ efficiency
    GOOD = "good"               # 80-94% efficiency
    ACCEPTABLE = "acceptable"   # 65-79% efficiency
    POOR = "poor"              # 40-64% efficiency
    CRITICAL = "critical"      # <40% efficiency

class BottleneckType(str, Enum):
    """Types of performance bottlenecks"""
    CPU_BOUND = "cpu_bound"
    MEMORY_BOUND = "memory_bound"
    IO_BOUND = "io_bound"
    NETWORK_BOUND = "network_bound"
    DATABASE_BOUND = "database_bound"
    CONCURRENCY_BOUND = "concurrency_bound"
    RESOURCE_CONTENTION = "resource_contention"
    ALGORITHM_INEFFICIENCY = "algorithm_inefficiency"
    EXTERNAL_DEPENDENCY = "external_dependency"
    CONFIGURATION_ISSUE = "configuration_issue"

class OptimizationCategory(str, Enum):
    """Categories of optimization recommendations"""
    RESOURCE_ALLOCATION = "resource_allocation"
    ALGORITHM_OPTIMIZATION = "algorithm_optimization"
    CACHING_STRATEGY = "caching_strategy"
    PARALLELIZATION = "parallelization"
    LOAD_BALANCING = "load_balancing"
    DATABASE_OPTIMIZATION = "database_optimization"
    NETWORK_OPTIMIZATION = "network_optimization"
    CONFIGURATION_TUNING = "configuration_tuning"
    WORKFLOW_OPTIMIZATION = "workflow_optimization"
    INFRASTRUCTURE_SCALING = "infrastructure_scaling"

class PerformanceStatus(str, Enum):
    """Status of performance monitoring"""
    MONITORING = "monitoring"
    ANALYZING = "analyzing"
    OPTIMIZING = "optimizing"
    STABLE = "stable"
    DEGRADED = "degraded"
    CRITICAL = "critical"
    RECOVERING = "recovering"
    MAINTENANCE = "maintenance"

class TrendDirection(str, Enum):
    """Direction of performance trends"""
    IMPROVING = "improving"
    STABLE = "stable"
    DECLINING = "declining"
    VOLATILE = "volatile"
    UNKNOWN = "unknown"

class OptimizationPriority(str, Enum):
    """Priority levels for optimization recommendations"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

# ====================================================================
# CORE PERFORMANCE MODELS
# ====================================================================

class ScanPerformanceProfile(SQLModel, table=True):
    """Performance profiles for scan operations"""
    __tablename__ = "scan_performance_profiles"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    profile_id: str = Field(max_length=100, index=True)
    profile_name: str = Field(max_length=200)
    
    # Profile scope
    scan_type: Optional[str] = Field(max_length=100)
    data_source_types: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    scan_scope: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance baselines
    baseline_throughput: Optional[float] = None  # records per second
    baseline_latency: Optional[float] = None     # milliseconds
    baseline_cpu_usage: Optional[float] = None   # percentage
    baseline_memory_usage: Optional[float] = None  # MB
    baseline_error_rate: Optional[float] = None  # percentage
    
    # Performance thresholds
    performance_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    critical_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Monitoring configuration
    is_active: bool = Field(default=True)
    monitoring_interval_seconds: int = Field(default=60)
    retention_period_days: int = Field(default=90)
    detailed_logging: bool = Field(default=False)
    
    # Business context
    business_criticality: Optional[str] = Field(max_length=50)
    sla_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    cost_constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Profile metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    
    # Relationships
    metrics: List["PerformanceMetric"] = Relationship(back_populates="profile")
    bottlenecks: List["PerformanceBottleneck"] = Relationship(back_populates="profile")

class PerformanceMetric(SQLModel, table=True):
    """Individual performance metrics collected"""
    __tablename__ = "performance_metrics"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    metric_id: str = Field(max_length=100, index=True)
    profile_id: UUID = Field(foreign_key="scan_performance_profiles.id", index=True)
    
    # Metric definition
    metric_type: PerformanceMetricType
    metric_name: str = Field(max_length=200)
    metric_description: Optional[str] = Field(max_length=1000)
    unit_of_measure: str = Field(max_length=50)
    
    # Metric collection
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    value: float
    normalized_value: Optional[float] = None  # Normalized to 0-100 scale
    
    # Metric context
    scan_operation_id: Optional[str] = Field(max_length=100)
    data_source_id: Optional[str] = Field(max_length=100)
    execution_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Statistical analysis
    moving_average_5min: Optional[float] = None
    moving_average_15min: Optional[float] = None
    moving_average_1hour: Optional[float] = None
    percentile_95: Optional[float] = None
    percentile_99: Optional[float] = None
    
    # Anomaly detection
    is_anomaly: bool = Field(default=False)
    anomaly_score: Optional[float] = None
    anomaly_reason: Optional[str] = Field(max_length=500)
    
    # Quality indicators
    data_quality_score: Optional[float] = None
    reliability_score: Optional[float] = None
    collection_method: Optional[str] = Field(max_length=100)
    
    # Relationship
    profile: ScanPerformanceProfile = Relationship(back_populates="metrics")

class PerformanceAnalysis(SQLModel, table=True):
    """Comprehensive performance analysis results"""
    __tablename__ = "performance_analyses"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    analysis_id: str = Field(max_length=100, index=True)
    profile_id: UUID = Field(foreign_key="scan_performance_profiles.id")
    
    # Analysis configuration
    analysis_name: str = Field(max_length=200)
    analysis_type: str = Field(max_length=100)  # real_time, batch, trend, comparative
    analysis_period_start: datetime
    analysis_period_end: datetime
    
    # Analysis results
    overall_performance_score: Optional[float] = Field(ge=0.0, le=100.0)
    performance_level: Optional[PerformanceLevel] = None
    performance_trend: Optional[TrendDirection] = None
    
    # Detailed metrics analysis
    throughput_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    latency_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_utilization_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    error_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance patterns
    identified_patterns: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    seasonal_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    usage_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Bottleneck analysis
    bottlenecks_identified: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    bottleneck_severity: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    root_cause_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance comparison
    baseline_comparison: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    historical_comparison: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    peer_comparison: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business impact assessment
    business_impact_score: Optional[float] = None
    sla_compliance: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    cost_impact: Optional[float] = None
    user_experience_impact: Optional[str] = Field(max_length=200)
    
    # Analysis metadata
    analysis_duration_seconds: Optional[int] = None
    data_points_analyzed: Optional[int] = None
    confidence_level: Optional[float] = None
    analysis_methodology: Optional[str] = Field(max_length=200)
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    analyzed_by: str = Field(max_length=100)
    
    # Relationships
    bottlenecks: List["PerformanceBottleneck"] = Relationship(back_populates="analysis")
    optimizations: List["OptimizationRecommendation"] = Relationship(back_populates="analysis")

class PerformanceBottleneck(SQLModel, table=True):
    """Identified performance bottlenecks"""
    __tablename__ = "performance_bottlenecks"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    bottleneck_id: str = Field(max_length=100, index=True)
    profile_id: UUID = Field(foreign_key="scan_performance_profiles.id", index=True)
    analysis_id: Optional[UUID] = Field(foreign_key="performance_analyses.id")
    
    # Bottleneck definition
    bottleneck_type: BottleneckType
    bottleneck_name: str = Field(max_length=200)
    bottleneck_description: str = Field(max_length=2000)
    severity_level: str = Field(max_length=50)  # low, medium, high, critical
    
    # Impact assessment
    performance_impact_score: float = Field(ge=0.0, le=100.0)
    affected_metrics: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    impact_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Root cause analysis
    root_causes: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    contributing_factors: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    diagnostic_evidence: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Occurrence patterns
    first_detected_at: datetime = Field(default_factory=datetime.utcnow)
    last_detected_at: Optional[datetime] = None
    occurrence_frequency: Optional[str] = Field(max_length=100)
    duration_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Resource context
    affected_resources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    resource_constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    environment_factors: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business impact
    business_processes_affected: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    estimated_cost_impact: Optional[float] = None
    user_experience_degradation: Optional[str] = Field(max_length=200)
    sla_violations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Resolution tracking
    status: str = Field(max_length=50, default="active")  # active, investigating, resolved, ignored
    resolution_attempts: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = Field(max_length=2000)
    
    # Relationships
    profile: ScanPerformanceProfile = Relationship(back_populates="bottlenecks")
    analysis: Optional[PerformanceAnalysis] = Relationship(back_populates="bottlenecks")

class OptimizationRecommendation(SQLModel, table=True):
    """AI-powered optimization recommendations"""
    __tablename__ = "optimization_recommendations"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    recommendation_id: str = Field(max_length=100, index=True)
    analysis_id: UUID = Field(foreign_key="performance_analyses.id", index=True)
    
    # Recommendation details
    recommendation_title: str = Field(max_length=200)
    recommendation_category: OptimizationCategory
    recommendation_description: str = Field(max_length=2000)
    priority: OptimizationPriority = Field(default=OptimizationPriority.MEDIUM)
    
    # Impact prediction
    predicted_improvement: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    confidence_score: float = Field(ge=0.0, le=1.0)
    estimated_effort: Optional[str] = Field(max_length=100)  # low, medium, high
    implementation_complexity: Optional[str] = Field(max_length=100)
    
    # Implementation details
    implementation_steps: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    required_resources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    prerequisites: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    estimated_timeline: Optional[str] = Field(max_length=100)
    
    # Risk assessment
    implementation_risks: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    risk_mitigation_strategies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    rollback_plan: Optional[str] = Field(max_length=1000)
    
    # Business justification
    business_benefits: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    cost_benefit_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    roi_estimate: Optional[float] = None
    payback_period: Optional[str] = Field(max_length=100)
    
    # Recommendation context
    applicable_scenarios: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    environmental_considerations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    dependency_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Tracking and validation
    status: str = Field(max_length=50, default="pending")  # pending, approved, implementing, completed, rejected
    implementation_progress: Optional[float] = Field(ge=0.0, le=100.0)
    actual_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    validation_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    recommended_by: str = Field(max_length=100)  # system, user, AI_model
    reviewed_by: Optional[str] = Field(max_length=100)
    approved_by: Optional[str] = Field(max_length=100)
    implemented_by: Optional[str] = Field(max_length=100)
    
    # Relationship
    analysis: PerformanceAnalysis = Relationship(back_populates="optimizations")

# ====================================================================
# PERFORMANCE MONITORING MODELS
# ====================================================================

class PerformanceAlert(SQLModel, table=True):
    """Performance-related alerts and notifications"""
    __tablename__ = "performance_alerts"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    alert_id: str = Field(max_length=100, index=True)
    profile_id: UUID = Field(foreign_key="scan_performance_profiles.id")
    
    # Alert details
    alert_type: str = Field(max_length=100)  # threshold_breach, anomaly, degradation, bottleneck
    severity: str = Field(max_length=50)  # low, medium, high, critical, emergency
    alert_title: str = Field(max_length=200)
    alert_description: str = Field(max_length=2000)
    
    # Alert trigger
    triggered_metric: Optional[str] = Field(max_length=100)
    trigger_value: Optional[float] = None
    threshold_value: Optional[float] = None
    trigger_condition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Alert timing
    triggered_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    first_occurrence: Optional[datetime] = None
    last_occurrence: Optional[datetime] = None
    occurrence_count: int = Field(default=1)
    
    # Alert context
    affected_operations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    performance_impact: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    related_alerts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Alert status
    status: str = Field(max_length=50, default="open")  # open, acknowledged, investigating, resolved, suppressed
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = Field(max_length=100)
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = Field(max_length=100)
    
    # Notification tracking
    notification_channels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    notifications_sent: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    escalation_level: int = Field(default=0)
    next_escalation_at: Optional[datetime] = None
    
    # Resolution details
    resolution_notes: Optional[str] = Field(max_length=2000)
    resolution_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    false_positive: bool = Field(default=False)

class PerformanceDashboard(SQLModel, table=True):
    """Performance dashboard configurations and views"""
    __tablename__ = "performance_dashboards"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    dashboard_id: str = Field(max_length=100, index=True)
    dashboard_name: str = Field(max_length=200)
    
    # Dashboard configuration
    dashboard_type: str = Field(max_length=100)  # overview, detailed, real_time, historical
    target_audience: str = Field(max_length=100)  # executives, operators, analysts, developers
    refresh_interval_seconds: int = Field(default=300)
    
    # Dashboard content
    widgets: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    layout_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_filters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    time_range_default: str = Field(max_length=50, default="24h")
    
    # Access control
    is_public: bool = Field(default=False)
    allowed_users: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    allowed_roles: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Dashboard metrics
    view_count: int = Field(default=0)
    last_viewed_at: Optional[datetime] = None
    average_session_duration: Optional[int] = None  # seconds
    user_ratings: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)

# ====================================================================
# PERFORMANCE BENCHMARKING MODELS
# ====================================================================

class PerformanceBenchmark(SQLModel, table=True):
    """Performance benchmarks for comparison"""
    __tablename__ = "performance_benchmarks"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    benchmark_id: str = Field(max_length=100, index=True)
    benchmark_name: str = Field(max_length=200)
    
    # Benchmark definition
    benchmark_type: str = Field(max_length=100)  # internal, industry, synthetic, historical
    benchmark_category: str = Field(max_length=100)
    benchmark_description: str = Field(max_length=2000)
    
    # Benchmark metrics
    baseline_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    target_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    industry_averages: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    best_in_class_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Benchmark context
    applicable_scenarios: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    environment_specifications: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_characteristics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Benchmark validation
    validation_methodology: str = Field(max_length=1000)
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    confidence_interval: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    statistical_significance: Optional[float] = None
    
    # Usage tracking
    usage_count: int = Field(default=0)
    last_used_at: Optional[datetime] = None
    benchmark_accuracy: Optional[float] = None
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    approved_by: Optional[str] = Field(max_length=100)

class PerformanceComparison(SQLModel, table=True):
    """Performance comparison results"""
    __tablename__ = "performance_comparisons"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    comparison_id: str = Field(max_length=100, index=True)
    benchmark_id: UUID = Field(foreign_key="performance_benchmarks.id")
    
    # Comparison configuration
    comparison_name: str = Field(max_length=200)
    comparison_type: str = Field(max_length=100)  # current_vs_baseline, peer_comparison, trend_analysis
    comparison_period: Dict[str, datetime] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Comparison subjects
    subject_profiles: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    comparison_metrics: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Comparison results
    performance_gaps: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    relative_performance: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    ranking_results: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Statistical analysis
    statistical_summary: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    correlation_analysis: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    variance_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Insights and recommendations
    key_insights: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    improvement_opportunities: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    best_practices_identified: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Comparison metadata
    comparison_accuracy: Optional[float] = None
    data_completeness: Optional[float] = None
    comparison_confidence: Optional[float] = None
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    compared_by: str = Field(max_length=100)

# ====================================================================
# PERFORMANCE ANALYTICS MODELS
# ====================================================================

class PerformanceAnalytics(SQLModel, table=True):
    """Aggregated performance analytics"""
    __tablename__ = "performance_analytics"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    analytics_id: str = Field(max_length=100, index=True)
    
    # Time dimensions
    analytics_date: datetime = Field(index=True)
    time_period: str = Field(max_length=50)  # hour, day, week, month, quarter
    aggregation_level: str = Field(max_length=50)  # system, service, operation, user
    
    # Performance summary
    total_operations: int = Field(default=0)
    successful_operations: int = Field(default=0)
    failed_operations: int = Field(default=0)
    average_response_time: Optional[float] = None
    
    # Throughput metrics
    operations_per_second: Optional[float] = None
    data_processed_mb: Optional[float] = None
    throughput_efficiency: Optional[float] = None
    peak_throughput: Optional[float] = None
    
    # Resource utilization
    average_cpu_utilization: Optional[float] = None
    peak_cpu_utilization: Optional[float] = None
    average_memory_usage: Optional[float] = None
    peak_memory_usage: Optional[float] = None
    total_io_operations: Optional[int] = None
    
    # Quality metrics
    performance_score: Optional[float] = Field(ge=0.0, le=100.0)
    reliability_score: Optional[float] = Field(ge=0.0, le=100.0)
    efficiency_score: Optional[float] = Field(ge=0.0, le=100.0)
    user_satisfaction_score: Optional[float] = Field(ge=0.0, le=100.0)
    
    # Trend analysis
    performance_trend: Optional[TrendDirection] = None
    trend_confidence: Optional[float] = None
    seasonal_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Bottleneck summary
    bottlenecks_detected: int = Field(default=0)
    critical_bottlenecks: int = Field(default=0)
    bottleneck_categories: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Optimization tracking
    optimizations_recommended: int = Field(default=0)
    optimizations_implemented: int = Field(default=0)
    optimization_success_rate: Optional[float] = None
    performance_improvements: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business impact
    business_value_delivered: Optional[float] = None
    cost_efficiency_ratio: Optional[float] = None
    sla_compliance_rate: Optional[float] = None
    customer_impact_score: Optional[float] = None

# ====================================================================
# REQUEST/RESPONSE MODELS
# ====================================================================

class CreatePerformanceProfileRequest(BaseModel):
    """Request to create a performance profile"""
    profile_name: str = PydanticField(max_length=200)
    scan_type: Optional[str] = None
    monitoring_interval_seconds: int = PydanticField(default=60, ge=10, le=3600)
    business_criticality: Optional[str] = None

class PerformanceAnalysisRequest(BaseModel):
    """Request to perform performance analysis"""
    profile_id: str
    analysis_type: str = "batch"
    analysis_period_start: datetime
    analysis_period_end: datetime
    include_recommendations: bool = True

class OptimizationRequest(BaseModel):
    """Request for optimization recommendations"""
    analysis_id: str
    optimization_categories: List[OptimizationCategory] = []
    priority_filter: Optional[OptimizationPriority] = None
    implementation_complexity_max: str = "high"

class PerformanceAlertRequest(BaseModel):
    """Request to create performance alert"""
    profile_id: str
    alert_type: str
    severity: str
    trigger_condition: Dict[str, Any]
    notification_channels: List[str] = []

class PerformanceProfileResponse(BaseModel):
    """Response for performance profile operations"""
    profile_id: str
    profile_name: str
    is_active: bool
    baseline_throughput: Optional[float]
    performance_level: Optional[PerformanceLevel]
    created_at: datetime

class PerformanceAnalysisResponse(BaseModel):
    """Response for performance analysis"""
    analysis_id: str
    overall_performance_score: Optional[float]
    performance_level: Optional[PerformanceLevel]
    performance_trend: Optional[TrendDirection]
    bottlenecks_count: int
    recommendations_count: int
    
class OptimizationResponse(BaseModel):
    """Response for optimization recommendations"""
    recommendation_id: str
    recommendation_title: str
    category: OptimizationCategory
    priority: OptimizationPriority
    predicted_improvement: Dict[str, float]
    confidence_score: float
    estimated_effort: Optional[str]

class PerformanceMetricsResponse(BaseModel):
    """Response for performance metrics"""
    metrics: List[Dict[str, Any]]
    aggregation_period: str
    total_data_points: int
    analysis_summary: Dict[str, float]

# ====================================================================
# UTILITY FUNCTIONS
# ====================================================================

def generate_performance_uuid() -> str:
    """Generate a UUID for performance operations"""
    return f"perf_{uuid4().hex[:12]}"

def calculate_performance_score(
    throughput_score: float,
    latency_score: float,
    resource_efficiency: float,
    error_rate: float
) -> float:
    """Calculate overall performance score"""
    # Invert error rate for scoring (lower is better)
    error_score = max(0, 100 - (error_rate * 100))
    
    # Weighted average of all components
    weights = {
        'throughput': 0.3,
        'latency': 0.25,
        'efficiency': 0.25,
        'reliability': 0.2
    }
    
    return (
        throughput_score * weights['throughput'] +
        (100 - latency_score) * weights['latency'] +  # Lower latency is better
        resource_efficiency * weights['efficiency'] +
        error_score * weights['reliability']
    )

def determine_performance_level(score: float) -> PerformanceLevel:
    """Determine performance level based on score"""
    if score >= 95:
        return PerformanceLevel.EXCELLENT
    elif score >= 80:
        return PerformanceLevel.GOOD
    elif score >= 65:
        return PerformanceLevel.ACCEPTABLE
    elif score >= 40:
        return PerformanceLevel.POOR
    else:
        return PerformanceLevel.CRITICAL

def calculate_bottleneck_severity(
    performance_impact: float,
    frequency: float,
    business_criticality: float
) -> str:
    """Calculate bottleneck severity level"""
    severity_score = (
        performance_impact * 0.4 +
        frequency * 0.3 +
        business_criticality * 0.3
    )
    
    if severity_score >= 80:
        return "critical"
    elif severity_score >= 60:
        return "high"
    elif severity_score >= 40:
        return "medium"
    else:
        return "low"

def estimate_optimization_impact(
    current_metrics: Dict[str, float],
    optimization_type: str,
    implementation_complexity: str
) -> Dict[str, float]:
    """Estimate the impact of optimization recommendations"""
    impact_multipliers = {
        "algorithm_optimization": {
            "low": 1.1, "medium": 1.3, "high": 1.8
        },
        "resource_allocation": {
            "low": 1.05, "medium": 1.15, "high": 1.4
        },
        "caching_strategy": {
            "low": 1.2, "medium": 1.5, "high": 2.0
        },
        "parallelization": {
            "low": 1.3, "medium": 1.8, "high": 2.5
        }
    }
    
    multiplier = impact_multipliers.get(optimization_type, {}).get(implementation_complexity, 1.1)
    
    return {
        metric: value * multiplier
        for metric, value in current_metrics.items()
    }

def analyze_performance_trend(
    historical_scores: List[float],
    window_size: int = 10
) -> TrendDirection:
    """Analyze performance trend direction"""
    if len(historical_scores) < window_size:
        return TrendDirection.UNKNOWN
    
    recent_avg = sum(historical_scores[-window_size:]) / window_size
    earlier_avg = sum(historical_scores[-2*window_size:-window_size]) / window_size
    
    if len(historical_scores) < 2 * window_size:
        return TrendDirection.UNKNOWN
    
    diff_percentage = ((recent_avg - earlier_avg) / earlier_avg) * 100
    
    # Calculate volatility
    recent_std = (sum((x - recent_avg) ** 2 for x in historical_scores[-window_size:]) / window_size) ** 0.5
    volatility = (recent_std / recent_avg) * 100 if recent_avg > 0 else 0
    
    if volatility > 15:  # High volatility threshold
        return TrendDirection.VOLATILE
    elif diff_percentage > 5:
        return TrendDirection.IMPROVING
    elif diff_percentage < -5:
        return TrendDirection.DECLINING
    else:
        return TrendDirection.STABLE