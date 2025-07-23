"""
Advanced Catalog Quality Models for Enterprise Data Governance
============================================================

This module contains sophisticated models for comprehensive data quality assessment,
monitoring, scoring, and improvement across all catalog assets with AI-powered
insights and enterprise-grade quality management capabilities.

Features:
- Multi-dimensional quality assessment (accuracy, completeness, consistency, timeliness)
- AI-powered quality pattern recognition and prediction
- Automated quality rule engine with business context
- Real-time quality monitoring and alerting
- Quality improvement recommendations and tracking
- Integration with lineage, classification, and compliance systems
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

class QualityDimension(str, Enum):
    """Data quality dimensions"""
    ACCURACY = "accuracy"                 # Correctness of data values
    COMPLETENESS = "completeness"         # Absence of missing values
    CONSISTENCY = "consistency"           # Uniformity across systems
    TIMELINESS = "timeliness"            # Currency and freshness
    VALIDITY = "validity"                # Conformance to rules
    UNIQUENESS = "uniqueness"            # Absence of duplicates
    INTEGRITY = "integrity"              # Referential integrity
    PRECISION = "precision"              # Granularity of data
    ACCESSIBILITY = "accessibility"       # Ease of access
    RELEVANCE = "relevance"              # Business relevance

class QualityLevel(str, Enum):
    """Quality assessment levels"""
    EXCELLENT = "excellent"              # 95-100% quality score
    GOOD = "good"                       # 80-94% quality score
    ACCEPTABLE = "acceptable"           # 65-79% quality score
    POOR = "poor"                      # 40-64% quality score
    CRITICAL = "critical"              # 0-39% quality score

class QualityTrend(str, Enum):
    """Quality trend directions"""
    IMPROVING = "improving"             # Quality getting better
    STABLE = "stable"                  # Quality remains consistent
    DECLINING = "declining"            # Quality getting worse
    VOLATILE = "volatile"              # Quality fluctuating
    UNKNOWN = "unknown"                # Insufficient data

class QualityRuleType(str, Enum):
    """Types of quality rules"""
    COMPLETENESS_CHECK = "completeness_check"     # Check for missing values
    RANGE_CHECK = "range_check"                   # Check value ranges
    PATTERN_CHECK = "pattern_check"               # Check patterns/formats
    UNIQUENESS_CHECK = "uniqueness_check"         # Check for duplicates
    REFERENTIAL_CHECK = "referential_check"       # Check referential integrity
    BUSINESS_RULE = "business_rule"               # Business-specific rules
    STATISTICAL_CHECK = "statistical_check"       # Statistical validation
    CROSS_FIELD_CHECK = "cross_field_check"       # Cross-field validation
    TEMPORAL_CHECK = "temporal_check"             # Time-based validation
    CUSTOM_CHECK = "custom_check"                 # Custom validation

class QualityIssueType(str, Enum):
    """Types of quality issues"""
    MISSING_VALUE = "missing_value"               # Null or empty values
    INVALID_FORMAT = "invalid_format"             # Format violations
    OUT_OF_RANGE = "out_of_range"                # Value range violations
    DUPLICATE_RECORD = "duplicate_record"         # Duplicate records
    REFERENTIAL_ERROR = "referential_error"      # Foreign key violations
    BUSINESS_RULE_VIOLATION = "business_rule_violation"  # Business rule violations
    INCONSISTENT_VALUE = "inconsistent_value"    # Cross-system inconsistencies
    OUTDATED_VALUE = "outdated_value"            # Stale or outdated data
    STATISTICAL_ANOMALY = "statistical_anomaly"  # Statistical outliers
    SCHEMA_MISMATCH = "schema_mismatch"          # Schema inconsistencies

class QualityImpactLevel(str, Enum):
    """Impact levels for quality issues"""
    CRITICAL = "critical"               # Severe business impact
    HIGH = "high"                      # Significant impact
    MEDIUM = "medium"                  # Moderate impact
    LOW = "low"                       # Minor impact
    INFORMATIONAL = "informational"    # No immediate impact


# ===================== CORE QUALITY MODELS =====================

class CatalogQualityProfile(SQLModel, table=True):
    """
    Comprehensive quality profile for catalog assets with multi-dimensional
    quality assessment, trends analysis, and improvement tracking.
    """
    __tablename__ = "catalog_quality_profiles"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    profile_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    asset_id: str = Field(index=True)  # Catalog asset ID
    asset_type: str = Field(index=True)  # table, view, file, api, system
    asset_name: str = Field(index=True)
    
    # Overall Quality Metrics
    overall_quality_score: float = Field(ge=0.0, le=100.0)
    quality_level: QualityLevel
    quality_trend: QualityTrend
    previous_score: Optional[float] = None
    score_change: Optional[float] = None
    
    # Dimensional Quality Scores
    accuracy_score: float = Field(ge=0.0, le=100.0)
    completeness_score: float = Field(ge=0.0, le=100.0)
    consistency_score: float = Field(ge=0.0, le=100.0)
    timeliness_score: float = Field(ge=0.0, le=100.0)
    validity_score: float = Field(ge=0.0, le=100.0)
    uniqueness_score: float = Field(ge=0.0, le=100.0)
    integrity_score: float = Field(ge=0.0, le=100.0)
    precision_score: float = Field(ge=0.0, le=100.0)
    accessibility_score: float = Field(ge=0.0, le=100.0)
    relevance_score: float = Field(ge=0.0, le=100.0)
    
    # Quality Statistics
    total_records: int = Field(default=0)
    records_with_issues: int = Field(default=0)
    total_columns: int = Field(default=0)
    columns_with_issues: int = Field(default=0)
    critical_issues_count: int = Field(default=0)
    high_issues_count: int = Field(default=0)
    medium_issues_count: int = Field(default=0)
    low_issues_count: int = Field(default=0)
    
    # Assessment Configuration
    assessment_frequency: str = "daily"  # hourly, daily, weekly, monthly
    assessment_scope: str = "full"       # full, sample, incremental
    sample_size: Optional[int] = None
    confidence_level: float = Field(default=0.95, ge=0.0, le=1.0)
    
    # Business Context
    business_criticality: str = "medium"  # low, medium, high, critical
    business_impact_score: Optional[float] = None
    sla_requirements: str = Field(default="{}")  # JSON SLA requirements
    quality_thresholds: str = Field(default="{}")  # JSON quality thresholds
    
    # Temporal Analysis
    quality_history: str = Field(default="[]")  # JSON time series data
    seasonal_patterns: str = Field(default="{}")  # JSON seasonal analysis
    trend_analysis: str = Field(default="{}")   # JSON trend data
    forecast_score: Optional[float] = None      # Predicted future score
    
    # Improvement Tracking
    improvement_target_score: Optional[float] = None
    improvement_plan: str = Field(default="[]")  # JSON improvement actions
    remediation_priority: int = Field(default=5, ge=1, le=10)
    estimated_improvement_effort: Optional[str] = None  # low, medium, high
    
    # Integration Points
    lineage_impact_score: Optional[float] = None    # Impact based on lineage
    classification_impact: Optional[str] = None     # Impact based on classification
    compliance_impact_score: Optional[float] = None # Impact on compliance
    
    # Assessment Metadata
    last_assessment_date: datetime = Field(default_factory=datetime.utcnow, index=True)
    next_assessment_due: datetime = Field(default_factory=datetime.utcnow)
    assessment_duration_seconds: Optional[float] = None
    assessment_method: str = "automated"  # automated, manual, hybrid
    assessed_by: Optional[str] = None
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    archived_at: Optional[datetime] = None
    
    # Custom Properties
    tags: str = Field(default="[]")  # JSON array of tags
    custom_metrics: str = Field(default="{}")  # JSON custom quality metrics
    notes: Optional[str] = None
    
    # Relationships
    quality_rules: List["CatalogQualityRule"] = Relationship(back_populates="profile")
    quality_issues: List["CatalogQualityIssue"] = Relationship(back_populates="profile")
    quality_assessments: List["CatalogQualityAssessment"] = Relationship(back_populates="profile")


class CatalogQualityRule(SQLModel, table=True):
    """
    Configurable quality rules with business context, automated execution,
    and intelligent adaptation based on data patterns and business requirements.
    """
    __tablename__ = "catalog_quality_rules"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    profile_id: int = Field(foreign_key="catalog_quality_profiles.id", index=True)
    
    # Rule Definition
    rule_name: str = Field(index=True)
    rule_type: QualityRuleType
    rule_description: str
    rule_logic: str  # SQL, Python, or other executable logic
    target_dimension: QualityDimension
    
    # Rule Configuration
    rule_parameters: str = Field(default="{}")  # JSON rule parameters
    threshold_value: Optional[float] = None
    threshold_operator: str = "gte"  # gte, lte, eq, ne, gt, lt
    severity_level: QualityImpactLevel = Field(default=QualityImpactLevel.MEDIUM)
    
    # Execution Settings
    is_active: bool = Field(default=True, index=True)
    execution_frequency: str = "daily"  # real-time, hourly, daily, weekly
    execution_scope: str = "full"       # full, sample, incremental
    timeout_seconds: int = Field(default=300)
    
    # Business Context
    business_rationale: Optional[str] = None
    regulatory_requirement: Optional[str] = None
    sla_requirement: Optional[str] = None
    business_owner: Optional[str] = None
    technical_owner: Optional[str] = None
    
    # Performance and Optimization
    execution_cost_score: Optional[float] = None
    performance_impact: str = "low"  # low, medium, high
    optimization_suggestions: str = Field(default="[]")  # JSON optimization tips
    
    # Execution Statistics
    total_executions: int = Field(default=0)
    successful_executions: int = Field(default=0)
    failed_executions: int = Field(default=0)
    average_execution_time_ms: Optional[float] = None
    last_execution_date: Optional[datetime] = None
    next_execution_due: Optional[datetime] = None
    
    # Issue Statistics
    total_violations: int = Field(default=0)
    violations_trend: QualityTrend = Field(default=QualityTrend.STABLE)
    false_positive_rate: Optional[float] = None
    
    # Adaptive Intelligence
    auto_tuning_enabled: bool = Field(default=False)
    learning_algorithm: Optional[str] = None  # bayesian, ml, statistical
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0)
    adaptation_history: str = Field(default="[]")  # JSON adaptation log
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    last_modified_by: Optional[str] = None
    version: str = Field(default="1.0.0")
    
    # Metadata
    tags: str = Field(default="[]")  # JSON array of tags
    documentation_url: Optional[str] = None
    contact_info: Optional[str] = None
    
    # Relationships
    profile: Optional[CatalogQualityProfile] = Relationship(back_populates="quality_rules")
    violations: List["CatalogQualityIssue"] = Relationship(back_populates="rule")


class CatalogQualityIssue(SQLModel, table=True):
    """
    Individual quality issues with detailed context, impact assessment,
    and resolution tracking for comprehensive quality management.
    """
    __tablename__ = "catalog_quality_issues"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    issue_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    profile_id: int = Field(foreign_key="catalog_quality_profiles.id", index=True)
    rule_id: Optional[int] = Field(foreign_key="catalog_quality_rules.id", index=True)
    
    # Issue Details
    issue_type: QualityIssueType
    issue_title: str = Field(index=True)
    issue_description: str
    severity_level: QualityImpactLevel
    affected_dimension: QualityDimension
    
    # Issue Location
    table_name: Optional[str] = Field(index=True)
    column_name: Optional[str] = Field(index=True)
    record_identifier: Optional[str] = None  # Primary key or row identifier
    field_path: Optional[str] = None         # Path for nested data
    
    # Issue Context
    current_value: Optional[str] = None      # Current problematic value
    expected_value: Optional[str] = None     # Expected correct value
    violation_details: str = Field(default="{}")  # JSON violation details
    error_message: Optional[str] = None      # System error message
    
    # Impact Assessment
    records_affected: int = Field(default=1)
    downstream_systems_affected: str = Field(default="[]")  # JSON array
    business_impact_description: Optional[str] = None
    estimated_cost_impact: Optional[float] = None
    
    # Detection Information
    detected_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    detection_method: str = "rule_based"     # rule_based, anomaly_detection, manual
    detection_confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    false_positive_probability: Optional[float] = None
    
    # Resolution Tracking
    status: str = "open"  # open, investigating, in_progress, resolved, closed, false_positive
    assigned_to: Optional[str] = None
    resolution_priority: int = Field(default=5, ge=1, le=10)
    resolution_target_date: Optional[datetime] = None
    resolution_description: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    
    # Resolution Verification
    verification_required: bool = Field(default=True)
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    verification_method: Optional[str] = None
    re_verification_date: Optional[datetime] = None
    
    # Recurrence Tracking
    is_recurring: bool = Field(default=False)
    first_occurrence: Optional[datetime] = None
    occurrence_count: int = Field(default=1)
    recurrence_pattern: Optional[str] = None  # daily, weekly, monthly, irregular
    
    # Root Cause Analysis
    root_cause_category: Optional[str] = None  # data_entry, system_error, process_issue
    root_cause_description: Optional[str] = None
    contributing_factors: str = Field(default="[]")  # JSON array of factors
    preventive_measures: str = Field(default="[]")   # JSON array of measures
    
    # Automation and Remediation
    auto_remediation_available: bool = Field(default=False)
    remediation_script: Optional[str] = None
    remediation_executed: bool = Field(default=False)
    remediation_success: Optional[bool] = None
    
    # Business Context
    business_justification: Optional[str] = None  # Why this issue matters
    regulatory_implications: Optional[str] = None
    customer_impact: Optional[str] = None
    revenue_impact: Optional[float] = None
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: Optional[datetime] = None
    
    # Communication
    notifications_sent: str = Field(default="[]")  # JSON array of notifications
    escalation_level: int = Field(default=0)
    escalated_at: Optional[datetime] = None
    
    # Metadata
    tags: str = Field(default="[]")  # JSON array of tags
    custom_attributes: str = Field(default="{}")  # JSON custom attributes
    attachments: str = Field(default="[]")        # JSON array of attachment URLs
    comments: str = Field(default="[]")           # JSON array of comments
    
    # Relationships
    profile: Optional[CatalogQualityProfile] = Relationship(back_populates="quality_issues")
    rule: Optional[CatalogQualityRule] = Relationship(back_populates="violations")


class CatalogQualityAssessment(SQLModel, table=True):
    """
    Comprehensive quality assessment results with detailed metrics,
    trends analysis, and actionable insights for quality improvement.
    """
    __tablename__ = "catalog_quality_assessments"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    profile_id: int = Field(foreign_key="catalog_quality_profiles.id", index=True)
    
    # Assessment Configuration
    assessment_name: str = Field(index=True)
    assessment_type: str = "regular"  # regular, ad_hoc, triggered, continuous
    assessment_scope: str = "full"    # full, sample, incremental, targeted
    trigger_event: Optional[str] = None  # What triggered this assessment
    
    # Execution Details
    started_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    status: str = "running"  # running, completed, failed, cancelled
    
    # Data Scope
    total_records_assessed: int = Field(default=0)
    total_columns_assessed: int = Field(default=0)
    sample_percentage: Optional[float] = None
    data_volume_mb: Optional[float] = None
    
    # Quality Results
    overall_score: float = Field(ge=0.0, le=100.0)
    accuracy_score: float = Field(ge=0.0, le=100.0)
    completeness_score: float = Field(ge=0.0, le=100.0)
    consistency_score: float = Field(ge=0.0, le=100.0)
    timeliness_score: float = Field(ge=0.0, le=100.0)
    validity_score: float = Field(ge=0.0, le=100.0)
    uniqueness_score: float = Field(ge=0.0, le=100.0)
    integrity_score: float = Field(ge=0.0, le=100.0)
    precision_score: float = Field(ge=0.0, le=100.0)
    accessibility_score: float = Field(ge=0.0, le=100.0)
    relevance_score: float = Field(ge=0.0, le=100.0)
    
    # Detailed Results
    rules_executed: int = Field(default=0)
    rules_passed: int = Field(default=0)
    rules_failed: int = Field(default=0)
    issues_found: int = Field(default=0)
    critical_issues: int = Field(default=0)
    high_issues: int = Field(default=0)
    medium_issues: int = Field(default=0)
    low_issues: int = Field(default=0)
    
    # Comparative Analysis
    previous_score: Optional[float] = None
    score_change: Optional[float] = None
    score_change_percentage: Optional[float] = None
    trend_direction: QualityTrend = Field(default=QualityTrend.STABLE)
    benchmark_comparison: Optional[float] = None  # vs industry benchmark
    
    # Column-Level Analysis
    column_quality_summary: str = Field(default="{}")  # JSON column scores
    worst_performing_columns: str = Field(default="[]")  # JSON array
    best_performing_columns: str = Field(default="[]")   # JSON array
    column_improvement_recommendations: str = Field(default="[]")  # JSON recommendations
    
    # Pattern Analysis
    data_patterns_detected: str = Field(default="[]")  # JSON array of patterns
    anomalies_detected: str = Field(default="[]")      # JSON array of anomalies
    statistical_insights: str = Field(default="{}")    # JSON statistical analysis
    correlation_analysis: str = Field(default="{}")    # JSON correlation data
    
    # Business Impact
    business_impact_assessment: str = Field(default="{}")  # JSON impact analysis
    compliance_impact: Optional[str] = None
    operational_impact: Optional[str] = None
    financial_impact_estimate: Optional[float] = None
    
    # Recommendations
    improvement_recommendations: str = Field(default="[]")  # JSON recommendations
    priority_actions: str = Field(default="[]")            # JSON priority actions
    quick_wins: str = Field(default="[]")                  # JSON quick improvements
    long_term_initiatives: str = Field(default="[]")       # JSON strategic initiatives
    
    # Resource Usage
    cpu_usage_seconds: Optional[float] = None
    memory_usage_mb: Optional[float] = None
    io_operations: Optional[int] = None
    network_usage_mb: Optional[float] = None
    execution_cost: Optional[float] = None
    
    # Error Handling
    errors_encountered: int = Field(default=0)
    warnings_generated: int = Field(default=0)
    error_details: str = Field(default="[]")  # JSON array of errors
    warnings_details: str = Field(default="[]")  # JSON array of warnings
    
    # Assessment Metadata
    assessment_version: str = Field(default="1.0.0")
    executed_by: Optional[str] = None
    execution_environment: str = "production"  # development, staging, production
    configuration_used: str = Field(default="{}")  # JSON configuration
    
    # Quality Certification
    certification_level: Optional[str] = None  # bronze, silver, gold, platinum
    certification_date: Optional[datetime] = None
    certification_valid_until: Optional[datetime] = None
    certification_criteria_met: str = Field(default="{}")  # JSON criteria
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    archived_at: Optional[datetime] = None
    retention_period_days: int = Field(default=365)
    
    # Integration
    exported_to_systems: str = Field(default="[]")  # JSON array of export targets
    shared_with_stakeholders: str = Field(default="[]")  # JSON stakeholder list
    
    # Relationships
    profile: Optional[CatalogQualityProfile] = Relationship(back_populates="quality_assessments")


class QualityImprovementPlan(SQLModel, table=True):
    """
    Structured improvement plans with actionable steps, timelines,
    and progress tracking for systematic quality enhancement.
    """
    __tablename__ = "quality_improvement_plans"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    profile_id: int = Field(foreign_key="catalog_quality_profiles.id")
    
    # Plan Details
    plan_name: str = Field(index=True)
    plan_description: str
    plan_objective: str  # Target quality improvement
    target_score: float = Field(ge=0.0, le=100.0)
    current_baseline_score: float = Field(ge=0.0, le=100.0)
    
    # Timeline
    start_date: datetime = Field(default_factory=datetime.utcnow)
    target_completion_date: datetime
    actual_completion_date: Optional[datetime] = None
    estimated_duration_days: int
    
    # Plan Structure
    improvement_initiatives: str = Field(default="[]")  # JSON array of initiatives
    action_items: str = Field(default="[]")             # JSON array of actions
    milestones: str = Field(default="[]")               # JSON array of milestones
    dependencies: str = Field(default="[]")             # JSON array of dependencies
    
    # Resource Requirements
    estimated_effort_hours: Optional[int] = None
    required_skills: str = Field(default="[]")          # JSON array of skills
    team_members: str = Field(default="[]")             # JSON array of team members
    budget_estimate: Optional[float] = None
    tools_required: str = Field(default="[]")           # JSON array of tools
    
    # Progress Tracking
    status: str = "draft"  # draft, approved, in_progress, completed, cancelled, on_hold
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    completed_actions: int = Field(default=0)
    total_actions: int = Field(default=0)
    
    # Quality Tracking
    quality_measurements: str = Field(default="[]")  # JSON time series of measurements
    improvement_achieved: Optional[float] = None     # Actual improvement in score
    roi_calculation: Optional[float] = None          # Return on investment
    
    # Risk Management
    identified_risks: str = Field(default="[]")      # JSON array of risks
    risk_mitigation_strategies: str = Field(default="[]")  # JSON mitigation plans
    contingency_plans: str = Field(default="[]")     # JSON contingency options
    
    # Stakeholder Management
    plan_owner: Optional[str] = None
    business_sponsor: Optional[str] = None
    technical_lead: Optional[str] = None
    stakeholders: str = Field(default="[]")          # JSON array of stakeholders
    
    # Communication
    status_reports: str = Field(default="[]")        # JSON array of status updates
    last_status_update: Optional[datetime] = None
    next_review_date: Optional[datetime] = None
    communication_plan: str = Field(default="{}")   # JSON communication strategy
    
    # Success Criteria
    success_criteria: str = Field(default="[]")     # JSON array of success criteria
    acceptance_criteria: str = Field(default="[]")  # JSON array of acceptance criteria
    quality_gates: str = Field(default="[]")        # JSON array of quality gates
    
    # Lessons Learned
    lessons_learned: str = Field(default="[]")      # JSON array of lessons
    best_practices: str = Field(default="[]")       # JSON array of best practices
    recommendations: str = Field(default="[]")      # JSON array of recommendations
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    
    # Metadata
    tags: str = Field(default="[]")  # JSON array of tags
    version: str = Field(default="1.0.0")
    custom_attributes: str = Field(default="{}")


# ===================== RESPONSE AND REQUEST MODELS =====================

class QualityProfileResponse(BaseModel):
    """Response model for quality profiles"""
    id: int
    profile_uuid: str
    asset_name: str
    overall_quality_score: float
    quality_level: QualityLevel
    quality_trend: QualityTrend
    critical_issues_count: int
    last_assessment_date: datetime
    business_criticality: str


class QualityRuleResponse(BaseModel):
    """Response model for quality rules"""
    id: int
    rule_uuid: str
    rule_name: str
    rule_type: QualityRuleType
    target_dimension: QualityDimension
    severity_level: QualityImpactLevel
    is_active: bool
    total_violations: int
    last_execution_date: Optional[datetime]


class QualityIssueResponse(BaseModel):
    """Response model for quality issues"""
    id: int
    issue_uuid: str
    issue_title: str
    issue_type: QualityIssueType
    severity_level: QualityImpactLevel
    status: str
    records_affected: int
    detected_at: datetime
    assigned_to: Optional[str]


class QualityAssessmentResponse(BaseModel):
    """Response model for quality assessments"""
    id: int
    assessment_uuid: str
    assessment_name: str
    overall_score: float
    trend_direction: QualityTrend
    issues_found: int
    started_at: datetime
    completed_at: Optional[datetime]
    status: str


# ===================== REQUEST MODELS =====================

class QualityRuleCreateRequest(BaseModel):
    """Request model for creating quality rules"""
    rule_name: str
    rule_type: QualityRuleType
    rule_description: str
    rule_logic: str
    target_dimension: QualityDimension
    severity_level: QualityImpactLevel = QualityImpactLevel.MEDIUM
    threshold_value: Optional[float] = None
    execution_frequency: str = "daily"


class QualityAssessmentRequest(BaseModel):
    """Request model for quality assessments"""
    assessment_name: str
    assessment_type: str = "regular"
    assessment_scope: str = "full"
    sample_percentage: Optional[float] = None
    include_column_analysis: bool = True
    include_pattern_analysis: bool = True


class QualityImprovementPlanRequest(BaseModel):
    """Request model for improvement plans"""
    plan_name: str
    plan_description: str
    target_score: float
    target_completion_date: datetime
    improvement_initiatives: List[str] = []
    estimated_effort_hours: Optional[int] = None
    budget_estimate: Optional[float] = None


# ===================== MODEL EXPORTS =====================

__all__ = [
    # Enums
    "QualityDimension", "QualityLevel", "QualityTrend", "QualityRuleType",
    "QualityIssueType", "QualityImpactLevel",
    
    # Core Models
    "CatalogQualityProfile", "CatalogQualityRule", "CatalogQualityIssue",
    "CatalogQualityAssessment", "QualityImprovementPlan",
    
    # Response Models
    "QualityProfileResponse", "QualityRuleResponse", "QualityIssueResponse",
    "QualityAssessmentResponse",
    
    # Request Models
    "QualityRuleCreateRequest", "QualityAssessmentRequest", "QualityImprovementPlanRequest",
]