"""
Advanced Scan Performance Models for Enterprise Data Governance
=============================================================

This module contains sophisticated models for comprehensive performance monitoring,
optimization, analytics, and intelligent resource management across all scanning
operations in the enterprise data governance ecosystem.

Features:
- Real-time performance monitoring and alerting
- AI-powered performance optimization and prediction
- Resource utilization tracking and cost management
- Benchmark analysis and comparative performance metrics
- Bottleneck detection and resolution recommendations
- SLA monitoring and compliance tracking
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

class PerformanceMetricType(str, Enum):
    """Types of performance metrics"""
    THROUGHPUT = "throughput"                    # Records/data processed per unit time
    LATENCY = "latency"                         # Response time metrics
    RESOURCE_UTILIZATION = "resource_utilization"  # CPU, memory, storage usage
    ERROR_RATE = "error_rate"                   # Error and failure rates
    AVAILABILITY = "availability"               # System availability metrics
    SCALABILITY = "scalability"                 # Scaling performance metrics
    COST_EFFICIENCY = "cost_efficiency"         # Cost per operation metrics
    QUALITY_IMPACT = "quality_impact"           # Impact on data quality
    BUSINESS_VALUE = "business_value"           # Business value delivered

class PerformanceLevel(str, Enum):
    """Performance assessment levels"""
    EXCELLENT = "excellent"                     # 95-100% of target
    GOOD = "good"                              # 80-94% of target
    ACCEPTABLE = "acceptable"                  # 65-79% of target
    POOR = "poor"                             # 40-64% of target
    CRITICAL = "critical"                      # 0-39% of target

class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFORMATIONAL = "informational"           # Information only
    WARNING = "warning"                       # Potential issue
    MINOR = "minor"                          # Minor performance impact
    MAJOR = "major"                          # Significant performance impact
    CRITICAL = "critical"                    # Critical performance issue

class OptimizationStatus(str, Enum):
    """Status of optimization recommendations"""
    IDENTIFIED = "identified"                # Opportunity identified
    ANALYZING = "analyzing"                  # Under analysis
    RECOMMENDED = "recommended"              # Ready for implementation
    IMPLEMENTING = "implementing"            # Being implemented
    COMPLETED = "completed"                  # Successfully implemented
    REJECTED = "rejected"                    # Not suitable for implementation
    FAILED = "failed"                       # Implementation failed

class BenchmarkType(str, Enum):
    """Types of performance benchmarks"""
    INTERNAL_HISTORICAL = "internal_historical"  # Historical internal performance
    PEER_COMPARISON = "peer_comparison"          # Comparison with peer systems
    INDUSTRY_STANDARD = "industry_standard"      # Industry benchmark standards
    THEORETICAL_MAXIMUM = "theoretical_maximum"  # Theoretical performance limits
    CUSTOM_TARGET = "custom_target"              # Custom performance targets


# ===================== CORE PERFORMANCE MODELS =====================

class ScanPerformanceProfile(SQLModel, table=True):
    """
    Comprehensive performance profile for scanning operations with
    multi-dimensional metrics, trends analysis, and optimization tracking.
    """
    __tablename__ = "scan_performance_profiles"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    profile_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    scan_operation_id: str = Field(index=True)  # References scan operation
    operation_type: str = Field(index=True)     # Type of scanning operation
    operation_name: str = Field(index=True)
    
    # Overall Performance Assessment
    overall_performance_score: float = Field(ge=0.0, le=100.0)
    performance_level: PerformanceLevel
    performance_trend: str = "stable"          # improving, stable, declining, volatile
    previous_score: Optional[float] = None
    score_change_percentage: Optional[float] = None
    
    # Core Performance Metrics
    throughput_records_per_second: Optional[float] = None
    throughput_mb_per_second: Optional[float] = None
    average_latency_ms: Optional[float] = None
    p95_latency_ms: Optional[float] = None
    p99_latency_ms: Optional[float] = None
    error_rate_percentage: Optional[float] = None
    availability_percentage: Optional[float] = None
    
    # Resource Utilization Metrics
    cpu_utilization_average: Optional[float] = None       # Average CPU usage %
    cpu_utilization_peak: Optional[float] = None          # Peak CPU usage %
    memory_utilization_average: Optional[float] = None    # Average memory usage %
    memory_utilization_peak: Optional[float] = None       # Peak memory usage %
    storage_utilization_gb: Optional[float] = None        # Storage used
    network_bandwidth_mbps: Optional[float] = None        # Network bandwidth used
    
    # Cost and Economic Metrics
    cost_per_operation: Optional[float] = None            # Cost per scan operation
    cost_per_record: Optional[float] = None               # Cost per record processed
    total_operational_cost: Optional[float] = None        # Total cost incurred
    cost_efficiency_score: Optional[float] = None         # Cost efficiency rating
    roi_percentage: Optional[float] = None                # Return on investment
    
    # Quality and Business Impact
    data_quality_impact_score: Optional[float] = None     # Impact on data quality
    business_value_score: Optional[float] = None          # Business value delivered
    sla_compliance_percentage: Optional[float] = None     # SLA compliance rate
    user_satisfaction_score: Optional[float] = None       # User satisfaction rating
    
    # Scalability Metrics
    concurrent_operations_supported: Optional[int] = None
    scaling_efficiency: Optional[float] = None            # How well it scales
    max_throughput_achieved: Optional[float] = None
    scaling_bottlenecks: str = Field(default="[]")        # JSON array of bottlenecks
    
    # Temporal Analysis
    measurement_period_start: datetime = Field(index=True)
    measurement_period_end: datetime = Field(index=True)
    measurement_frequency: str = "hourly"                 # minute, hourly, daily
    data_points_collected: int = Field(default=0)
    
    # Performance Trends
    performance_history: str = Field(default="[]")        # JSON time series data
    seasonal_patterns: str = Field(default="{}")          # JSON seasonal analysis
    peak_performance_periods: str = Field(default="[]")   # JSON peak periods
    low_performance_periods: str = Field(default="[]")    # JSON low periods
    
    # Comparative Analysis
    baseline_performance: str = Field(default="{}")       # JSON baseline metrics
    peer_comparison: str = Field(default="{}")            # JSON peer comparisons
    industry_benchmark: str = Field(default="{}")         # JSON industry benchmarks
    improvement_potential: Optional[float] = None         # % improvement possible
    
    # Configuration Context
    system_configuration: str = Field(default="{}")       # JSON system config
    resource_allocation: str = Field(default="{}")        # JSON resource allocation
    optimization_settings: str = Field(default="{}")      # JSON optimization config
    
    # Environmental Factors
    concurrent_workload_level: str = "normal"             # low, normal, high, peak
    system_load_average: Optional[float] = None
    external_dependencies_performance: str = Field(default="{}")  # JSON dependencies
    environmental_conditions: str = Field(default="{}")   # JSON environmental factors
    
    # Lifecycle and Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_measurement_at: datetime = Field(default_factory=datetime.utcnow)
    next_measurement_due: Optional[datetime] = None
    
    # Custom Properties
    tags: str = Field(default="[]")                       # JSON array of tags
    custom_metrics: str = Field(default="{}")             # JSON custom metrics
    notes: Optional[str] = None
    
    # Relationships
    performance_alerts: List["PerformanceAlert"] = Relationship(back_populates="performance_profile")
    optimization_recommendations: List["PerformanceOptimization"] = Relationship(back_populates="performance_profile")
    benchmark_comparisons: List["PerformanceBenchmark"] = Relationship(back_populates="performance_profile")


class PerformanceMetric(SQLModel, table=True):
    """
    Individual performance metrics with detailed measurement data,
    statistical analysis, and trend tracking capabilities.
    """
    __tablename__ = "performance_metrics"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    metric_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    profile_id: int = Field(foreign_key="scan_performance_profiles.id", index=True)
    
    # Metric Definition
    metric_name: str = Field(index=True)
    metric_type: PerformanceMetricType
    metric_description: str
    unit_of_measurement: str                               # records/sec, ms, %, GB, etc.
    
    # Measurement Data
    current_value: float
    target_value: Optional[float] = None
    threshold_warning: Optional[float] = None
    threshold_critical: Optional[float] = None
    measurement_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Statistical Analysis
    statistical_mean: Optional[float] = None
    statistical_median: Optional[float] = None
    statistical_std_dev: Optional[float] = None
    statistical_variance: Optional[float] = None
    percentile_95: Optional[float] = None
    percentile_99: Optional[float] = None
    
    # Trend Analysis
    trend_direction: str = "stable"                        # increasing, decreasing, stable, volatile
    trend_strength: Optional[float] = None                 # Strength of trend (0-1)
    trend_confidence: Optional[float] = None               # Confidence in trend analysis
    rate_of_change: Optional[float] = None                 # Rate of change per unit time
    
    # Comparative Context
    comparison_to_baseline: Optional[float] = None         # % difference from baseline
    comparison_to_target: Optional[float] = None           # % difference from target
    comparison_to_previous: Optional[float] = None         # % change from previous
    ranking_percentile: Optional[float] = None             # Percentile ranking
    
    # Quality and Reliability
    measurement_accuracy: Optional[float] = None           # Accuracy of measurement
    measurement_precision: Optional[float] = None          # Precision of measurement
    confidence_interval: Optional[str] = None              # JSON confidence interval
    data_quality_score: Optional[float] = None
    
    # Business Context
    business_impact_level: str = "medium"                  # low, medium, high, critical
    business_relevance_score: Optional[float] = None
    cost_implications: Optional[float] = None
    regulatory_importance: Optional[str] = None
    
    # Alerting Configuration
    alerting_enabled: bool = Field(default=True)
    alert_frequency: str = "immediate"                     # immediate, hourly, daily
    alert_recipients: str = Field(default="[]")            # JSON array of recipients
    suppression_rules: str = Field(default="[]")           # JSON suppression rules
    
    # Historical Context
    historical_values: str = Field(default="[]")           # JSON time series data
    historical_statistics: str = Field(default="{}")       # JSON historical stats
    anomaly_detection_results: str = Field(default="[]")   # JSON anomaly data
    
    # Measurement Configuration
    collection_method: str = "automated"                   # automated, manual, calculated
    collection_frequency: int = Field(default=60)          # Collection frequency in seconds
    aggregation_method: str = "average"                    # average, sum, max, min, count
    smoothing_algorithm: Optional[str] = None              # Smoothing algorithm used
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_collected_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    
    # Custom Properties
    tags: str = Field(default="[]")                       # JSON array of tags
    custom_attributes: str = Field(default="{}")          # JSON custom attributes
    metadata: str = Field(default="{}")                   # JSON metadata


class PerformanceAlert(SQLModel, table=True):
    """
    Performance alerts with intelligent filtering, escalation rules,
    and automated response capabilities for proactive monitoring.
    """
    __tablename__ = "performance_alerts"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    alert_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    performance_profile_id: int = Field(foreign_key="scan_performance_profiles.id", index=True)
    
    # Alert Definition
    alert_name: str = Field(index=True)
    alert_type: str = Field(index=True)                   # threshold, anomaly, trend, pattern
    severity: AlertSeverity
    priority: int = Field(default=5, ge=1, le=10)
    
    # Alert Trigger
    trigger_condition: str                                 # Description of trigger condition
    trigger_threshold: Optional[float] = None
    trigger_metric: str                                    # Metric that triggered alert
    trigger_value: float                                   # Value that triggered alert
    triggered_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Alert Content
    alert_message: str
    detailed_description: str
    impact_assessment: str                                 # Impact of the performance issue
    recommended_actions: str = Field(default="[]")        # JSON array of recommended actions
    
    # Status and Resolution
    status: str = "active"                                # active, acknowledged, resolved, suppressed
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None
    
    # Escalation Management
    escalation_level: int = Field(default=1)
    escalated_at: Optional[datetime] = None
    escalation_path: str = Field(default="[]")            # JSON escalation path
    auto_escalation_enabled: bool = Field(default=True)
    escalation_timeout_minutes: int = Field(default=60)
    
    # Business Context
    business_impact_level: str = "medium"                 # low, medium, high, critical
    affected_operations: str = Field(default="[]")        # JSON affected operations
    estimated_cost_impact: Optional[float] = None
    user_impact_assessment: Optional[str] = None
    
    # Communication and Notifications
    notifications_sent: str = Field(default="[]")         # JSON notification log
    notification_channels: str = Field(default="[]")      # JSON channels used
    suppression_until: Optional[datetime] = None
    notification_frequency: str = "immediate"             # immediate, batched, suppressed
    
    # Alert Intelligence
    is_recurring: bool = Field(default=False)
    recurrence_pattern: Optional[str] = None
    false_positive_probability: Optional[float] = None
    confidence_score: Optional[float] = None
    correlation_with_other_alerts: str = Field(default="[]")  # JSON correlated alerts
    
    # Root Cause Analysis
    root_cause_analysis: str = Field(default="{}")       # JSON root cause data
    contributing_factors: str = Field(default="[]")       # JSON contributing factors
    system_context: str = Field(default="{}")            # JSON system context
    environmental_factors: str = Field(default="{}")      # JSON environmental factors
    
    # Automated Response
    automated_response_triggered: bool = Field(default=False)
    automated_actions_taken: str = Field(default="[]")    # JSON automated actions
    response_effectiveness: Optional[float] = None
    response_outcome: Optional[str] = None
    
    # Learning and Improvement
    feedback_provided: bool = Field(default=False)
    feedback_score: Optional[int] = Field(default=None, ge=1, le=5)
    feedback_comments: Optional[str] = None
    improvement_suggestions: str = Field(default="[]")    # JSON improvement suggestions
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    
    # Custom Properties
    tags: str = Field(default="[]")                       # JSON array of tags
    custom_attributes: str = Field(default="{}")          # JSON custom attributes
    external_references: str = Field(default="[]")        # JSON external references
    
    # Relationships
    performance_profile: Optional[ScanPerformanceProfile] = Relationship(back_populates="performance_alerts")


class PerformanceOptimization(SQLModel, table=True):
    """
    AI-powered performance optimization recommendations with implementation
    tracking, impact analysis, and continuous improvement capabilities.
    """
    __tablename__ = "performance_optimizations"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    optimization_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    performance_profile_id: int = Field(foreign_key="scan_performance_profiles.id", index=True)
    
    # Optimization Details
    optimization_name: str = Field(index=True)
    optimization_category: str = Field(index=True)        # resource, algorithm, configuration, architecture
    optimization_type: str                                # cpu, memory, storage, network, process
    description: str
    detailed_rationale: str
    
    # Current State Analysis
    current_performance_baseline: str = Field(default="{}")  # JSON baseline metrics
    performance_bottlenecks: str = Field(default="[]")       # JSON identified bottlenecks
    resource_inefficiencies: str = Field(default="[]")       # JSON inefficiencies
    system_constraints: str = Field(default="[]")            # JSON constraints
    
    # Optimization Recommendation
    recommended_changes: str = Field(default="[]")           # JSON recommended changes
    implementation_steps: str = Field(default="[]")          # JSON implementation steps
    configuration_changes: str = Field(default="{}")         # JSON config changes
    resource_adjustments: str = Field(default="{}")          # JSON resource adjustments
    
    # Impact Projection
    projected_performance_improvement: Optional[float] = None  # % improvement expected
    projected_cost_savings: Optional[float] = None            # Cost savings expected
    projected_efficiency_gain: Optional[float] = None         # Efficiency improvement
    projected_roi: Optional[float] = None                     # Return on investment
    confidence_level: float = Field(ge=0.0, le=1.0)
    
    # Implementation Details
    implementation_complexity: str = "medium"                 # simple, medium, complex, enterprise
    implementation_effort_hours: Optional[int] = None
    implementation_cost: Optional[float] = None
    required_downtime_hours: Optional[float] = None
    rollback_plan_available: bool = Field(default=False)
    
    # Risk Assessment
    implementation_risks: str = Field(default="[]")          # JSON risk factors
    risk_mitigation_strategies: str = Field(default="[]")    # JSON mitigation strategies
    success_probability: Optional[float] = None              # Probability of success
    potential_negative_impacts: str = Field(default="[]")    # JSON potential negatives
    
    # Business Context
    business_priority: int = Field(default=5, ge=1, le=10)
    business_justification: str
    stakeholder_impact: str = Field(default="{}")            # JSON stakeholder impact
    regulatory_considerations: Optional[str] = None
    
    # Status and Progress
    status: OptimizationStatus = Field(default=OptimizationStatus.IDENTIFIED)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    implementation_started_at: Optional[datetime] = None
    implementation_completed_at: Optional[datetime] = None
    
    # Results and Validation
    actual_performance_improvement: Optional[float] = None   # Actual improvement achieved
    actual_cost_savings: Optional[float] = None             # Actual cost savings
    actual_efficiency_gain: Optional[float] = None          # Actual efficiency gain
    actual_roi: Optional[float] = None                      # Actual ROI
    validation_method: Optional[str] = None                  # How results were validated
    
    # Measurement and Monitoring
    success_criteria: str = Field(default="[]")             # JSON success criteria
    measurement_plan: str = Field(default="{}")             # JSON measurement plan
    monitoring_duration_days: int = Field(default=30)
    baseline_comparison_period_days: int = Field(default=7)
    
    # Learning and Feedback
    lessons_learned: str = Field(default="[]")              # JSON lessons learned
    improvement_recommendations: str = Field(default="[]")   # JSON recommendations
    reusability_score: Optional[float] = None               # How reusable is this optimization
    knowledge_base_contribution: Optional[str] = None
    
    # AI/ML Context
    generated_by_algorithm: Optional[str] = None            # AI algorithm that generated this
    algorithm_version: Optional[str] = None
    training_data_context: str = Field(default="{}")        # JSON training context
    model_confidence: Optional[float] = None
    
    # Dependencies and Relationships
    dependent_on_optimizations: str = Field(default="[]")   # JSON dependent optimizations
    conflicting_optimizations: str = Field(default="[]")    # JSON conflicting optimizations
    synergistic_optimizations: str = Field(default="[]")    # JSON synergistic optimizations
    
    # Approval and Governance
    approval_required: bool = Field(default=False)
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    approval_comments: Optional[str] = None
    
    # Lifecycle
    identified_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    
    # Custom Properties
    tags: str = Field(default="[]")                         # JSON array of tags
    custom_metrics: str = Field(default="{}")               # JSON custom metrics
    metadata: str = Field(default="{}")                     # JSON metadata
    
    # Relationships
    performance_profile: Optional[ScanPerformanceProfile] = Relationship(back_populates="optimization_recommendations")


class PerformanceBenchmark(SQLModel, table=True):
    """
    Performance benchmarks for comparative analysis with industry standards,
    peer systems, and historical performance data.
    """
    __tablename__ = "performance_benchmarks"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    benchmark_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    performance_profile_id: int = Field(foreign_key="scan_performance_profiles.id", index=True)
    
    # Benchmark Definition
    benchmark_name: str = Field(index=True)
    benchmark_type: BenchmarkType
    benchmark_source: str                                   # Source of benchmark data
    benchmark_version: str = Field(default="1.0.0")
    description: str
    
    # Benchmark Data
    benchmark_metrics: str = Field(default="{}")           # JSON benchmark metrics
    target_values: str = Field(default="{}")               # JSON target values
    acceptable_ranges: str = Field(default="{}")           # JSON acceptable ranges
    industry_percentiles: str = Field(default="{}")        # JSON percentile data
    
    # Comparison Results
    current_vs_benchmark: str = Field(default="{}")        # JSON comparison results
    performance_gap_analysis: str = Field(default="{}")    # JSON gap analysis
    percentile_ranking: Optional[float] = None             # Where we rank (0-100)
    competitive_position: str = "average"                  # leading, above_average, average, below_average, lagging
    
    # Statistical Analysis
    statistical_significance: Optional[float] = None        # Statistical significance of comparison
    confidence_interval: Optional[str] = None              # JSON confidence interval
    sample_size: Optional[int] = None                      # Size of benchmark sample
    data_quality_score: Optional[float] = None
    
    # Trend Analysis
    historical_comparisons: str = Field(default="[]")      # JSON historical comparisons
    trend_vs_benchmark: str = "stable"                     # improving, stable, declining
    improvement_velocity: Optional[float] = None           # Rate of improvement
    
    # Business Context
    business_relevance: str = "high"                       # low, medium, high, critical
    competitive_implications: Optional[str] = None
    strategic_insights: str = Field(default="[]")          # JSON strategic insights
    action_items: str = Field(default="[]")                # JSON action items
    
    # Benchmark Validity
    validity_period_days: int = Field(default=365)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    next_update_due: Optional[datetime] = None
    data_freshness_score: Optional[float] = None
    
    # Contextual Factors
    environmental_factors: str = Field(default="{}")       # JSON environmental context
    system_configuration_context: str = Field(default="{}")  # JSON system context
    workload_characteristics: str = Field(default="{}")    # JSON workload context
    comparable_conditions: bool = Field(default=True)
    
    # Quality and Reliability
    benchmark_reliability_score: Optional[float] = None
    data_source_credibility: Optional[float] = None
    methodology_transparency: Optional[float] = None
    peer_validation: Optional[bool] = None
    
    # Usage and Analytics
    access_count: int = Field(default=0)
    last_accessed_at: Optional[datetime] = None
    user_ratings: str = Field(default="[]")                # JSON user ratings
    usage_analytics: str = Field(default="{}")             # JSON usage data
    
    # Improvement Tracking
    improvement_recommendations: str = Field(default="[]")  # JSON recommendations
    target_achievement_plan: str = Field(default="{}")     # JSON achievement plan
    progress_towards_targets: str = Field(default="{}")    # JSON progress tracking
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    archived_at: Optional[datetime] = None
    
    # Custom Properties
    tags: str = Field(default="[]")                        # JSON array of tags
    custom_attributes: str = Field(default="{}")           # JSON custom attributes
    metadata: str = Field(default="{}")                    # JSON metadata
    
    # Relationships
    performance_profile: Optional[ScanPerformanceProfile] = Relationship(back_populates="benchmark_comparisons")


class PerformanceDashboard(SQLModel, table=True):
    """
    Performance dashboards with customizable views, real-time updates,
    and intelligent insights for comprehensive performance management.
    """
    __tablename__ = "performance_dashboards"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    dashboard_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    dashboard_name: str = Field(index=True)
    dashboard_type: str = "operational"                    # operational, executive, technical, custom
    
    # Dashboard Configuration
    layout_configuration: str = Field(default="{}")        # JSON layout configuration
    widget_configurations: str = Field(default="[]")       # JSON widget configurations
    data_refresh_interval: int = Field(default=60)         # Refresh interval in seconds
    auto_refresh_enabled: bool = Field(default=True)
    
    # Content and Scope
    monitored_profiles: str = Field(default="[]")          # JSON monitored profile IDs
    metric_filters: str = Field(default="{}")              # JSON metric filters
    time_range_default: str = "last_24_hours"             # Default time range
    aggregation_level: str = "hourly"                     # minute, hourly, daily
    
    # Visualization Settings
    chart_types: str = Field(default="{}")                 # JSON chart type mappings
    color_schemes: str = Field(default="{}")               # JSON color schemes
    threshold_indicators: str = Field(default="{}")        # JSON threshold settings
    alert_visualizations: str = Field(default="{}")        # JSON alert visualization
    
    # User Experience
    target_audience: str = Field(default="[]")             # JSON target audience
    user_personalization: str = Field(default="{}")        # JSON personalization settings
    accessibility_features: str = Field(default="[]")      # JSON accessibility features
    mobile_optimized: bool = Field(default=True)
    
    # Intelligence Features
    ai_insights_enabled: bool = Field(default=True)
    anomaly_highlighting: bool = Field(default=True)
    trend_predictions: bool = Field(default=True)
    automated_recommendations: bool = Field(default=True)
    
    # Alerting Integration
    alert_integration_enabled: bool = Field(default=True)
    alert_display_settings: str = Field(default="{}")      # JSON alert display settings
    notification_settings: str = Field(default="{}")       # JSON notification settings
    escalation_visual_cues: bool = Field(default=True)
    
    # Performance and Optimization
    caching_enabled: bool = Field(default=True)
    cache_duration_minutes: int = Field(default=15)
    lazy_loading_enabled: bool = Field(default=True)
    data_compression_enabled: bool = Field(default=True)
    
    # Export and Sharing
    export_formats_supported: str = Field(default="[]")    # JSON export formats
    sharing_enabled: bool = Field(default=True)
    embed_support: bool = Field(default=False)
    print_optimization: bool = Field(default=True)
    
    # Analytics and Usage
    view_count: int = Field(default=0)
    unique_users: int = Field(default=0)
    average_session_duration: Optional[float] = None
    user_engagement_score: Optional[float] = None
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    # Custom Properties
    tags: str = Field(default="[]")                        # JSON array of tags
    custom_settings: str = Field(default="{}")             # JSON custom settings
    metadata: str = Field(default="{}")                    # JSON metadata


# ===================== RESPONSE AND REQUEST MODELS =====================

class PerformanceProfileResponse(BaseModel):
    """Response model for performance profiles"""
    id: int
    profile_uuid: str
    operation_name: str
    overall_performance_score: float
    performance_level: PerformanceLevel
    throughput_records_per_second: Optional[float]
    average_latency_ms: Optional[float]
    error_rate_percentage: Optional[float]
    cost_per_operation: Optional[float]
    measurement_period_start: datetime
    measurement_period_end: datetime


class PerformanceAlertResponse(BaseModel):
    """Response model for performance alerts"""
    id: int
    alert_uuid: str
    alert_name: str
    severity: AlertSeverity
    status: str
    trigger_metric: str
    trigger_value: float
    triggered_at: datetime
    business_impact_level: str
    recommended_actions: List[str]


class OptimizationResponse(BaseModel):
    """Response model for optimization recommendations"""
    id: int
    optimization_uuid: str
    optimization_name: str
    optimization_category: str
    status: OptimizationStatus
    projected_performance_improvement: Optional[float]
    projected_cost_savings: Optional[float]
    implementation_complexity: str
    business_priority: int
    confidence_level: float


class BenchmarkResponse(BaseModel):
    """Response model for performance benchmarks"""
    id: int
    benchmark_uuid: str
    benchmark_name: str
    benchmark_type: BenchmarkType
    percentile_ranking: Optional[float]
    competitive_position: str
    performance_gap_analysis: Dict[str, Any]
    last_updated: datetime


# ===================== REQUEST MODELS =====================

class PerformanceProfileCreateRequest(BaseModel):
    """Request model for creating performance profiles"""
    scan_operation_id: str
    operation_type: str
    operation_name: str
    measurement_period_start: datetime
    measurement_period_end: datetime
    measurement_frequency: str = "hourly"
    include_resource_metrics: bool = True
    include_cost_metrics: bool = True


class PerformanceAlertRequest(BaseModel):
    """Request model for performance alerts"""
    alert_name: str
    alert_type: str
    severity: AlertSeverity
    trigger_condition: str
    trigger_threshold: Optional[float] = None
    notification_channels: List[str] = []
    escalation_enabled: bool = True


class OptimizationRequest(BaseModel):
    """Request model for optimization recommendations"""
    optimization_category: str
    target_improvement_percentage: float
    implementation_complexity_preference: str = "medium"
    budget_constraint: Optional[float] = None
    timeline_constraint_days: Optional[int] = None


class BenchmarkRequest(BaseModel):
    """Request model for benchmark comparisons"""
    benchmark_type: BenchmarkType
    comparison_metrics: List[str]
    include_industry_comparison: bool = True
    include_peer_comparison: bool = True
    include_historical_comparison: bool = True


# ===================== MODEL EXPORTS =====================

__all__ = [
    # Enums
    "PerformanceMetricType", "PerformanceLevel", "AlertSeverity", "OptimizationStatus", "BenchmarkType",
    
    # Core Models
    "ScanPerformanceProfile", "PerformanceMetric", "PerformanceAlert",
    "PerformanceOptimization", "PerformanceBenchmark", "PerformanceDashboard",
    
    # Response Models
    "PerformanceProfileResponse", "PerformanceAlertResponse", "OptimizationResponse",
    "BenchmarkResponse",
    
    # Request Models
    "PerformanceProfileCreateRequest", "PerformanceAlertRequest", "OptimizationRequest",
    "BenchmarkRequest",
]