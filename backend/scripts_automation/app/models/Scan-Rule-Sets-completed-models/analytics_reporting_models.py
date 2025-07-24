"""
Advanced Analytics and Reporting Models for Scan-Rule-Sets Group
==============================================================

Enterprise-grade analytics and reporting system for scan rules with comprehensive metrics:
- Usage analytics and user behavior tracking
- Performance metrics and trend analysis
- ROI calculation and business value measurement
- Executive dashboard and reporting
- Advanced data visualization support
- Predictive analytics and forecasting
- Comparative analysis and benchmarking
- Real-time monitoring and alerting

Production Features:
- Multi-dimensional analytics with drill-down capabilities
- AI-powered insights and recommendations
- Automated reporting and distribution
- Custom dashboard builder
- Advanced data export and integration
- Real-time streaming analytics
"""

from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
from enum import Enum
import uuid

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, Text
from sqlalchemy import Index, UniqueConstraint, CheckConstraint
from pydantic import BaseModel, validator

# ===================== ENUMS AND TYPES =====================

class AnalyticsType(str, Enum):
    """Analytics type classifications"""
    USAGE = "usage"                        # Usage analytics
    PERFORMANCE = "performance"            # Performance metrics
    QUALITY = "quality"                    # Quality metrics
    EFFICIENCY = "efficiency"              # Efficiency analysis
    ADOPTION = "adoption"                  # Adoption tracking
    COLLABORATION = "collaboration"        # Collaboration metrics
    SECURITY = "security"                  # Security analytics
    COMPLIANCE = "compliance"              # Compliance tracking
    BUSINESS_VALUE = "business_value"      # Business impact
    PREDICTIVE = "predictive"              # Predictive analytics

class MetricType(str, Enum):
    """Metric type classifications"""
    COUNTER = "counter"                    # Simple count metric
    GAUGE = "gauge"                        # Current value metric
    HISTOGRAM = "histogram"                # Distribution metric
    RATE = "rate"                         # Rate/frequency metric
    RATIO = "ratio"                       # Ratio/percentage metric
    TREND = "trend"                       # Trend analysis metric
    COMPOSITE = "composite"               # Composite metric
    DERIVED = "derived"                   # Calculated metric

class ReportType(str, Enum):
    """Report type classifications"""
    EXECUTIVE_SUMMARY = "executive_summary"
    OPERATIONAL = "operational"
    TECHNICAL = "technical"
    COMPLIANCE = "compliance"
    PERFORMANCE = "performance"
    USAGE = "usage"
    TREND_ANALYSIS = "trend_analysis"
    COMPARATIVE = "comparative"
    PREDICTIVE = "predictive"
    CUSTOM = "custom"

class TrendDirection(str, Enum):
    """Trend direction classifications"""
    INCREASING = "increasing"
    DECREASING = "decreasing"
    STABLE = "stable"
    VOLATILE = "volatile"
    SEASONAL = "seasonal"
    UNKNOWN = "unknown"

class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

# ===================== CORE ANALYTICS MODELS =====================

class UsageAnalytics(SQLModel, table=True):
    """
    Comprehensive usage analytics tracking for scan rules.
    Monitors user behavior, feature adoption, and system utilization.
    """
    __tablename__ = "usage_analytics"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    analytics_id: str = Field(index=True, unique=True, description="Unique analytics identifier")
    
    # Analytics scope and context
    entity_type: str = Field(max_length=50, index=True, description="Entity being analyzed")
    entity_id: str = Field(index=True, description="Entity identifier")
    user_id: Optional[str] = Field(max_length=255, index=True, description="User identifier")
    session_id: Optional[str] = Field(max_length=255, index=True, description="Session identifier")
    
    # Time-based analytics
    measurement_date: datetime = Field(index=True, description="Measurement timestamp")
    measurement_period: str = Field(max_length=20, index=True, description="Period type")  # hourly, daily, weekly, monthly
    time_zone: str = Field(default="UTC", max_length=50)
    
    # Usage metrics
    total_usage_count: int = Field(default=0, ge=0, description="Total usage count")
    unique_users: int = Field(default=0, ge=0, description="Unique user count")
    active_sessions: int = Field(default=0, ge=0, description="Active session count")
    average_session_duration: float = Field(default=0.0, ge=0.0, description="Average session duration (minutes)")
    total_time_spent: float = Field(default=0.0, ge=0.0, description="Total time spent (minutes)")
    
    # Feature adoption metrics
    feature_usage: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    feature_adoption_rate: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    new_feature_adoption: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    advanced_feature_usage: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # User behavior patterns
    user_flow_patterns: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    click_patterns: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    navigation_patterns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    error_patterns: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Engagement metrics
    bounce_rate: float = Field(default=0.0, ge=0.0, le=1.0, description="Bounce rate")
    retention_rate: float = Field(default=0.0, ge=0.0, le=1.0, description="User retention rate")
    return_user_rate: float = Field(default=0.0, ge=0.0, le=1.0, description="Return user rate")
    engagement_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Overall engagement score")
    
    # Performance impact
    page_load_times: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    response_times: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    error_rates: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    success_rates: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Device and platform analytics
    device_types: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    browser_usage: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    platform_usage: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    screen_resolutions: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Geographic analytics
    geographic_distribution: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    time_zone_distribution: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Data quality and validation
    data_quality_score: float = Field(default=1.0, ge=0.0, le=1.0, description="Data quality score")
    sample_size: int = Field(default=0, ge=0, description="Sample size for analytics")
    confidence_level: float = Field(default=0.95, ge=0.0, le=1.0, description="Statistical confidence level")
    
    # Table constraints
    __table_args__ = (
        Index("idx_usage_entity", "entity_type", "entity_id"),
        Index("idx_usage_date_period", "measurement_date", "measurement_period"),
        Index("idx_usage_user_session", "user_id", "session_id"),
        UniqueConstraint("analytics_id", name="uq_usage_analytics_id"),
    )

class TrendAnalysis(SQLModel, table=True):
    """
    Advanced trend analysis with predictive capabilities.
    Identifies patterns, forecasts, and anomalies in scan rule metrics.
    """
    __tablename__ = "trend_analyses"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    analysis_id: str = Field(index=True, unique=True, description="Unique analysis identifier")
    
    # Analysis scope
    metric_name: str = Field(index=True, max_length=100, description="Metric being analyzed")
    entity_type: str = Field(max_length=50, index=True, description="Entity type")
    entity_id: Optional[str] = Field(index=True, description="Specific entity ID")
    
    # Time range for analysis
    analysis_start: datetime = Field(index=True, description="Analysis period start")
    analysis_end: datetime = Field(index=True, description="Analysis period end")
    data_points: int = Field(ge=2, description="Number of data points analyzed")
    sampling_interval: str = Field(max_length=20, description="Data sampling interval")
    
    # Trend characteristics
    trend_direction: TrendDirection = Field(index=True, description="Overall trend direction")
    trend_strength: float = Field(ge=0.0, le=1.0, description="Trend strength (0-1)")
    trend_consistency: float = Field(ge=0.0, le=1.0, description="Trend consistency")
    volatility_index: float = Field(ge=0.0, description="Volatility measure")
    
    # Statistical analysis
    correlation_coefficient: Optional[float] = Field(ge=-1.0, le=1.0, description="Correlation coefficient")
    r_squared: Optional[float] = Field(ge=0.0, le=1.0, description="R-squared value")
    p_value: Optional[float] = Field(ge=0.0, le=1.0, description="Statistical p-value")
    confidence_interval: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Trend components
    seasonal_component: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    cyclical_component: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    noise_component: float = Field(default=0.0, ge=0.0, le=1.0, description="Noise level")
    baseline_value: float = Field(description="Baseline/reference value")
    
    # Change points and anomalies
    change_points: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    anomaly_points: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    outlier_count: int = Field(default=0, ge=0, description="Number of outliers detected")
    
    # Predictive analysis
    forecast_values: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    forecast_confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Forecast confidence")
    forecast_horizon_days: int = Field(default=30, ge=1, description="Forecast horizon in days")
    prediction_accuracy: Optional[float] = Field(ge=0.0, le=1.0, description="Historical prediction accuracy")
    
    # Rate of change analysis
    absolute_change: float = Field(description="Absolute change over period")
    percentage_change: float = Field(description="Percentage change over period")
    average_rate_of_change: float = Field(description="Average rate of change per unit time")
    acceleration: Optional[float] = Field(description="Rate of change acceleration")
    
    # Comparative analysis
    comparison_benchmarks: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    peer_comparison: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    industry_percentile: Optional[float] = Field(ge=0.0, le=100.0, description="Industry percentile ranking")
    
    # AI and ML insights
    ml_model_used: Optional[str] = Field(max_length=100, description="ML model used for analysis")
    feature_importance: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    ai_insights: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    recommendation_score: float = Field(default=0.0, ge=0.0, le=1.0, description="AI recommendation confidence")
    
    # Analysis metadata
    analysis_type: str = Field(max_length=50, description="Type of trend analysis")
    analysis_algorithm: str = Field(max_length=100, description="Algorithm used")
    computational_complexity: str = Field(max_length=20, description="Computational complexity")
    execution_time_ms: int = Field(default=0, ge=0, description="Analysis execution time")
    
    # Quality and validation
    data_quality_issues: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    reliability_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Analysis reliability")
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    next_analysis_due: Optional[datetime] = Field(description="Next scheduled analysis")
    
    # User tracking
    requested_by: str = Field(max_length=255, index=True, description="Analysis requester")
    approved_by: Optional[str] = Field(max_length=255, description="Analysis approver")
    
    # Table constraints
    __table_args__ = (
        Index("idx_trend_metric_entity", "metric_name", "entity_type"),
        Index("idx_trend_period", "analysis_start", "analysis_end"),
        Index("idx_trend_direction_strength", "trend_direction", "trend_strength"),
        UniqueConstraint("analysis_id", name="uq_trend_analysis_id"),
    )

class ROIMetrics(SQLModel, table=True):
    """
    Return on Investment calculation and business value tracking.
    Measures financial impact and business benefits of scan rule implementations.
    """
    __tablename__ = "roi_metrics"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    roi_id: str = Field(index=True, unique=True, description="Unique ROI identifier")
    
    # ROI scope and context
    investment_category: str = Field(max_length=100, index=True, description="Investment category")
    investment_description: str = Field(max_length=500, description="Investment description")
    entity_type: str = Field(max_length=50, index=True, description="Entity type being measured")
    entity_id: str = Field(index=True, description="Entity identifier")
    
    # Investment costs
    initial_investment: float = Field(ge=0.0, description="Initial investment amount")
    ongoing_costs: float = Field(default=0.0, ge=0.0, description="Ongoing operational costs")
    maintenance_costs: float = Field(default=0.0, ge=0.0, description="Maintenance costs")
    training_costs: float = Field(default=0.0, ge=0.0, description="Training and onboarding costs")
    infrastructure_costs: float = Field(default=0.0, ge=0.0, description="Infrastructure costs")
    total_cost_of_ownership: float = Field(ge=0.0, description="Total cost of ownership")
    
    # Revenue and benefits
    direct_revenue: float = Field(default=0.0, ge=0.0, description="Direct revenue generated")
    cost_savings: float = Field(default=0.0, ge=0.0, description="Cost savings achieved")
    efficiency_gains: float = Field(default=0.0, ge=0.0, description="Efficiency improvement value")
    risk_mitigation_value: float = Field(default=0.0, ge=0.0, description="Risk mitigation value")
    compliance_value: float = Field(default=0.0, ge=0.0, description="Compliance benefits value")
    total_benefits: float = Field(ge=0.0, description="Total quantified benefits")
    
    # ROI calculations
    net_present_value: float = Field(description="Net Present Value (NPV)")
    internal_rate_return: Optional[float] = Field(description="Internal Rate of Return (IRR)")
    payback_period_months: Optional[float] = Field(ge=0.0, description="Payback period in months")
    roi_percentage: float = Field(description="ROI percentage")
    roi_ratio: float = Field(description="ROI ratio (benefits/costs)")
    
    # Time-based analysis
    measurement_start: datetime = Field(index=True, description="ROI measurement period start")
    measurement_end: datetime = Field(index=True, description="ROI measurement period end")
    break_even_date: Optional[datetime] = Field(description="Projected break-even date")
    maturity_date: Optional[datetime] = Field(description="Investment maturity date")
    
    # Productivity metrics
    time_saved_hours: float = Field(default=0.0, ge=0.0, description="Time saved in hours")
    error_reduction_percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Error reduction %")
    quality_improvement_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Quality improvement")
    automation_percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Automation achieved %")
    
    # Risk and compliance metrics
    security_incidents_prevented: int = Field(default=0, ge=0, description="Security incidents prevented")
    compliance_violations_avoided: int = Field(default=0, ge=0, description="Compliance violations avoided")
    audit_preparation_time_reduced: float = Field(default=0.0, ge=0.0, description="Audit prep time reduced")
    regulatory_fine_avoidance: float = Field(default=0.0, ge=0.0, description="Regulatory fines avoided")
    
    # User adoption and satisfaction
    user_adoption_rate: float = Field(default=0.0, ge=0.0, le=1.0, description="User adoption rate")
    user_satisfaction_score: float = Field(default=0.0, ge=0.0, le=5.0, description="User satisfaction")
    training_completion_rate: float = Field(default=0.0, ge=0.0, le=1.0, description="Training completion rate")
    support_ticket_reduction: float = Field(default=0.0, ge=0.0, le=1.0, description="Support ticket reduction")
    
    # Business impact metrics
    customer_satisfaction_impact: Optional[float] = Field(ge=-1.0, le=1.0, description="Customer satisfaction impact")
    market_competitiveness_score: Optional[float] = Field(ge=0.0, le=1.0, description="Market competitiveness")
    innovation_score: Optional[float] = Field(ge=0.0, le=1.0, description="Innovation contribution")
    strategic_alignment_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Strategic alignment")
    
    # Financial projections
    projected_benefits_year1: float = Field(default=0.0, ge=0.0, description="Year 1 projected benefits")
    projected_benefits_year2: float = Field(default=0.0, ge=0.0, description="Year 2 projected benefits")
    projected_benefits_year3: float = Field(default=0.0, ge=0.0, description="Year 3 projected benefits")
    long_term_roi_projection: float = Field(default=0.0, description="Long-term ROI projection")
    
    # Confidence and validation
    calculation_confidence: float = Field(default=0.8, ge=0.0, le=1.0, description="Calculation confidence")
    data_sources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    validation_method: str = Field(max_length=100, description="ROI validation method")
    peer_reviewed: bool = Field(default=False, description="Peer reviewed calculation")
    
    # Comparative analysis
    industry_benchmark_roi: Optional[float] = Field(description="Industry benchmark ROI")
    peer_comparison_percentile: Optional[float] = Field(ge=0.0, le=100.0, description="Peer comparison percentile")
    best_practice_adherence: float = Field(default=0.0, ge=0.0, le=1.0, description="Best practice adherence")
    
    # Sensitivity analysis
    optimistic_scenario_roi: Optional[float] = Field(description="Optimistic scenario ROI")
    pessimistic_scenario_roi: Optional[float] = Field(description="Pessimistic scenario ROI")
    risk_adjusted_roi: Optional[float] = Field(description="Risk-adjusted ROI")
    sensitivity_factors: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_validated: Optional[datetime] = Field(description="Last validation date")
    next_review_due: Optional[datetime] = Field(description="Next review due date")
    
    # User tracking
    calculated_by: str = Field(max_length=255, index=True, description="ROI calculator")
    approved_by: Optional[str] = Field(max_length=255, description="ROI approver")
    validated_by: Optional[str] = Field(max_length=255, description="ROI validator")
    
    # Table constraints
    __table_args__ = (
        Index("idx_roi_category_entity", "investment_category", "entity_type"),
        Index("idx_roi_period", "measurement_start", "measurement_end"),
        Index("idx_roi_percentage", "roi_percentage"),
        UniqueConstraint("roi_id", name="uq_roi_metrics_id"),
    )

class ComplianceIntegration(SQLModel, table=True):
    """
    Compliance integration tracking and regulatory alignment.
    Monitors adherence to regulatory requirements and standards.
    """
    __tablename__ = "compliance_integrations"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    integration_id: str = Field(index=True, unique=True, description="Unique integration identifier")
    
    # Compliance framework details
    framework_name: str = Field(index=True, max_length=100, description="Compliance framework name")
    framework_version: str = Field(max_length=20, description="Framework version")
    regulation_type: str = Field(max_length=50, index=True, description="Type of regulation")
    jurisdiction: str = Field(max_length=100, description="Regulatory jurisdiction")
    
    # Entity compliance mapping
    entity_type: str = Field(max_length=50, index=True, description="Entity type")
    entity_id: str = Field(index=True, description="Entity identifier")
    rule_id: Optional[str] = Field(index=True, description="Associated rule ID")
    
    # Compliance requirements
    requirements: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    controls: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    policies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    procedures: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Compliance status
    overall_compliance_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Overall compliance score")
    compliance_status: str = Field(max_length=50, index=True, description="Compliance status")
    certification_status: str = Field(max_length=50, description="Certification status")
    last_assessment_date: Optional[datetime] = Field(description="Last assessment date")
    next_assessment_due: Optional[datetime] = Field(description="Next assessment due")
    
    # Compliance metrics
    controls_implemented: int = Field(default=0, ge=0, description="Controls implemented")
    controls_total: int = Field(default=0, ge=0, description="Total controls required")
    gaps_identified: int = Field(default=0, ge=0, description="Compliance gaps identified")
    violations_count: int = Field(default=0, ge=0, description="Violations detected")
    
    # Risk assessment
    risk_level: str = Field(max_length=20, index=True, description="Compliance risk level")
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Quantified risk score")
    mitigation_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    residual_risk: float = Field(default=0.0, ge=0.0, le=1.0, description="Residual risk after mitigation")
    
    # Audit trail
    audit_findings: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    remediation_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    evidence_artifacts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    audit_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Monitoring and alerting
    monitoring_enabled: bool = Field(default=True, description="Continuous monitoring enabled")
    alert_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    escalation_procedures: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    notification_contacts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Reporting and documentation
    compliance_reports: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    documentation_links: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    training_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    certification_documents: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Integration metadata
    integration_status: str = Field(default="active", max_length=50, index=True)
    automation_level: str = Field(max_length=20, description="Automation level")
    manual_effort_required: bool = Field(default=False, description="Manual effort required")
    third_party_tools: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    effective_date: datetime = Field(index=True, description="Compliance effective date")
    expiration_date: Optional[datetime] = Field(description="Compliance expiration date")
    
    # User tracking
    compliance_officer: str = Field(max_length=255, index=True, description="Compliance officer")
    auditor: Optional[str] = Field(max_length=255, description="External auditor")
    reviewer: Optional[str] = Field(max_length=255, description="Internal reviewer")
    
    # Table constraints
    __table_args__ = (
        Index("idx_compliance_framework", "framework_name", "framework_version"),
        Index("idx_compliance_entity", "entity_type", "entity_id"),
        Index("idx_compliance_status_risk", "compliance_status", "risk_level"),
        Index("idx_compliance_dates", "effective_date", "next_assessment_due"),
        UniqueConstraint("integration_id", name="uq_compliance_integration_id"),
    )

# ===================== SUPPORTING MODELS =====================

class PerformanceAlert(SQLModel, table=True):
    """
    Performance alerting system for proactive monitoring.
    Generates alerts based on thresholds and anomaly detection.
    """
    __tablename__ = "performance_alerts"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    alert_id: str = Field(index=True, unique=True, description="Unique alert identifier")
    
    # Alert details
    alert_type: str = Field(max_length=50, index=True, description="Alert type")
    severity: AlertSeverity = Field(index=True, description="Alert severity")
    title: str = Field(max_length=255, description="Alert title")
    description: str = Field(sa_column=Column(Text), description="Alert description")
    
    # Alert triggers
    metric_name: str = Field(index=True, max_length=100, description="Triggering metric")
    threshold_value: float = Field(description="Threshold value")
    actual_value: float = Field(description="Actual measured value")
    threshold_type: str = Field(max_length=20, description="Threshold type")  # above, below, equal, change
    
    # Alert context
    entity_type: str = Field(max_length=50, index=True, description="Entity type")
    entity_id: str = Field(index=True, description="Entity identifier")
    rule_id: Optional[str] = Field(index=True, description="Associated rule ID")
    
    # Alert status
    status: str = Field(default="active", max_length=50, index=True, description="Alert status")
    acknowledged: bool = Field(default=False, index=True, description="Alert acknowledged")
    resolved: bool = Field(default=False, index=True, description="Alert resolved")
    false_positive: bool = Field(default=False, description="Marked as false positive")
    
    # Response tracking
    acknowledged_by: Optional[str] = Field(max_length=255, description="Acknowledged by user")
    acknowledged_at: Optional[datetime] = Field(description="Acknowledgment timestamp")
    resolved_by: Optional[str] = Field(max_length=255, description="Resolved by user")
    resolved_at: Optional[datetime] = Field(description="Resolution timestamp")
    resolution_notes: Optional[str] = Field(sa_column=Column(Text), description="Resolution notes")
    
    # Alert recurrence
    is_recurring: bool = Field(default=False, description="Recurring alert")
    recurrence_count: int = Field(default=1, ge=1, description="Number of occurrences")
    first_occurrence: datetime = Field(default_factory=datetime.utcnow, description="First occurrence")
    last_occurrence: datetime = Field(default_factory=datetime.utcnow, description="Last occurrence")
    
    # Notification tracking
    notifications_sent: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    escalated: bool = Field(default=False, description="Alert escalated")
    escalation_level: int = Field(default=0, ge=0, description="Escalation level")
    
    # Temporal fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    expires_at: Optional[datetime] = Field(description="Alert expiration")
    
    # Table constraints
    __table_args__ = (
        Index("idx_alert_type_severity", "alert_type", "severity"),
        Index("idx_alert_status", "status", "acknowledged", "resolved"),
        Index("idx_alert_entity", "entity_type", "entity_id"),
        Index("idx_alert_metric", "metric_name"),
        UniqueConstraint("alert_id", name="uq_performance_alert_id"),
    )

# ===================== REQUEST/RESPONSE MODELS =====================

class AnalyticsRequest(BaseModel):
    """Request model for analytics generation"""
    entity_type: str
    entity_id: Optional[str] = None
    analytics_type: AnalyticsType = AnalyticsType.USAGE
    start_date: datetime
    end_date: datetime
    granularity: str = "daily"  # hourly, daily, weekly, monthly
    
class TrendAnalysisRequest(BaseModel):
    """Request model for trend analysis"""
    metric_name: str
    entity_type: str
    entity_id: Optional[str] = None
    analysis_period_days: int = Field(default=90, ge=7, le=365)
    forecast_days: int = Field(default=30, ge=1, le=180)
    
class ROICalculationRequest(BaseModel):
    """Request model for ROI calculation"""
    investment_category: str
    entity_type: str
    entity_id: str
    initial_investment: float = Field(ge=0.0)
    measurement_period_months: int = Field(default=12, ge=1, le=60)
    
class ReportGenerationRequest(BaseModel):
    """Request model for report generation"""
    report_type: ReportType = ReportType.EXECUTIVE_SUMMARY
    entities: List[Dict[str, str]]  # [{"type": "rule", "id": "123"}]
    date_range: Dict[str, datetime]
    include_predictions: bool = True
    include_comparisons: bool = True