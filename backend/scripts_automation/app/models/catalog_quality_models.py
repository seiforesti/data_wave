"""
📊 CATALOG QUALITY MODELS
Enterprise-grade data quality models for assessment, monitoring, remediation,
and comprehensive quality management across the data catalog.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, JSON, text
from pydantic import BaseModel, validator, Field as PydanticField
import json

# ====================================================================
# QUALITY ENUMS
# ====================================================================

class QualityDimension(str, Enum):
    """Data quality dimensions for assessment"""
    ACCURACY = "accuracy"
    COMPLETENESS = "completeness"
    CONSISTENCY = "consistency"
    VALIDITY = "validity"
    UNIQUENESS = "uniqueness"
    TIMELINESS = "timeliness"
    INTEGRITY = "integrity"
    CONFORMITY = "conformity"
    PRECISION = "precision"
    RELEVANCE = "relevance"
    ACCESSIBILITY = "accessibility"
    SECURITY = "security"

class QualityRuleType(str, Enum):
    """Types of data quality rules"""
    NULL_CHECK = "null_check"
    RANGE_CHECK = "range_check"
    FORMAT_CHECK = "format_check"
    UNIQUENESS_CHECK = "uniqueness_check"
    REFERENTIAL_INTEGRITY = "referential_integrity"
    PATTERN_MATCH = "pattern_match"
    STATISTICAL_OUTLIER = "statistical_outlier"
    BUSINESS_RULE = "business_rule"
    CROSS_FIELD_VALIDATION = "cross_field_validation"
    TEMPORAL_CONSISTENCY = "temporal_consistency"
    DOMAIN_VALUE_CHECK = "domain_value_check"
    RELATIONSHIP_VALIDATION = "relationship_validation"

class QualityAssessmentType(str, Enum):
    """Types of quality assessments"""
    INITIAL_ASSESSMENT = "initial_assessment"
    PERIODIC_ASSESSMENT = "periodic_assessment"
    TRIGGERED_ASSESSMENT = "triggered_assessment"
    CONTINUOUS_MONITORING = "continuous_monitoring"
    COMPARATIVE_ASSESSMENT = "comparative_assessment"
    REMEDIATION_VALIDATION = "remediation_validation"
    COMPLIANCE_CHECK = "compliance_check"
    PROFILING_ASSESSMENT = "profiling_assessment"

class QualityStatus(str, Enum):
    """Status of quality assessments and rules"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    SCHEDULED = "scheduled"
    PAUSED = "paused"
    RETRYING = "retrying"

class QualityLevel(str, Enum):
    """Quality levels for scoring"""
    EXCELLENT = "excellent"      # 90-100%
    GOOD = "good"               # 75-89%
    ACCEPTABLE = "acceptable"   # 60-74%
    POOR = "poor"              # 40-59%
    CRITICAL = "critical"      # 0-39%

class RemediationStatus(str, Enum):
    """Status of quality remediation efforts"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PARTIALLY_COMPLETED = "partially_completed"
    VERIFIED = "verified"
    REJECTED = "rejected"

class QualityAlertSeverity(str, Enum):
    """Severity levels for quality alerts"""
    LOW = "low"
    MEDIUM = "medium" 
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

class QualityTrendDirection(str, Enum):
    """Direction of quality trends"""
    IMPROVING = "improving"
    STABLE = "stable"
    DECLINING = "declining"
    VOLATILE = "volatile"
    UNKNOWN = "unknown"

# ====================================================================
# CORE QUALITY MODELS
# ====================================================================

class DataQualityAssessment(SQLModel, table=True):
    """Comprehensive data quality assessments"""
    __tablename__ = "data_quality_assessments"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    assessment_id: str = Field(max_length=100, index=True)
    catalog_entry_id: UUID = Field(index=True)  # Links to catalog entry
    
    # Assessment configuration
    assessment_type: QualityAssessmentType
    assessment_name: str = Field(max_length=200)
    assessment_description: Optional[str] = Field(max_length=1000)
    assessment_scope: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality dimensions assessed
    dimensions_assessed: List[QualityDimension] = Field(default_factory=list, sa_column=Column(JSON))
    dimension_weights: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Assessment execution
    status: QualityStatus = Field(default=QualityStatus.PENDING, index=True)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    
    # Overall quality scores
    overall_quality_score: Optional[float] = Field(ge=0.0, le=100.0)
    overall_quality_level: Optional[QualityLevel] = None
    weighted_quality_score: Optional[float] = Field(ge=0.0, le=100.0)
    
    # Dimension-specific scores
    accuracy_score: Optional[float] = Field(ge=0.0, le=100.0)
    completeness_score: Optional[float] = Field(ge=0.0, le=100.0)
    consistency_score: Optional[float] = Field(ge=0.0, le=100.0)
    validity_score: Optional[float] = Field(ge=0.0, le=100.0)
    uniqueness_score: Optional[float] = Field(ge=0.0, le=100.0)
    timeliness_score: Optional[float] = Field(ge=0.0, le=100.0)
    integrity_score: Optional[float] = Field(ge=0.0, le=100.0)
    conformity_score: Optional[float] = Field(ge=0.0, le=100.0)
    
    # Statistical analysis
    records_analyzed: Optional[int] = None
    fields_analyzed: Optional[int] = None
    null_values_count: Optional[int] = None
    null_percentage: Optional[float] = None
    duplicate_records: Optional[int] = None
    duplicate_percentage: Optional[float] = None
    
    # Rule-based assessment
    rules_executed: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    rules_passed: int = Field(default=0)
    rules_failed: int = Field(default=0)
    rule_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Issues and findings
    critical_issues: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    warnings: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    remediation_suggestions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business impact
    business_impact_score: Optional[float] = None
    business_criticality: Optional[str] = Field(max_length=50)
    financial_impact: Optional[float] = None
    operational_impact: Optional[str] = Field(max_length=100)
    
    # Assessment context
    assessment_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_sample_size: Optional[int] = None
    sample_percentage: Optional[float] = None
    assessment_method: Optional[str] = Field(max_length=100)
    
    # Metadata
    assessed_by: str = Field(max_length=100)
    assessment_version: str = Field(max_length=50, default="1.0")
    previous_assessment_id: Optional[str] = Field(max_length=100)
    
    # Relationships
    quality_rules: List["QualityRule"] = Relationship(back_populates="assessments")
    remediation_plans: List["QualityRemediationPlan"] = Relationship(back_populates="assessment")
    quality_alerts: List["QualityAlert"] = Relationship(back_populates="assessment")

class QualityRule(SQLModel, table=True):
    """Data quality rules for automated assessment"""
    __tablename__ = "quality_rules"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    rule_id: str = Field(max_length=100, index=True)
    rule_name: str = Field(max_length=200)
    
    # Rule definition
    rule_type: QualityRuleType
    quality_dimension: QualityDimension
    rule_description: str = Field(max_length=1000)
    rule_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    rule_expression: Optional[str] = Field(max_length=2000)
    
    # Rule configuration
    is_active: bool = Field(default=True)
    severity: QualityAlertSeverity = Field(default=QualityAlertSeverity.MEDIUM)
    threshold_value: Optional[float] = None
    threshold_operator: Optional[str] = Field(max_length=20)  # >, <, =, !=, between
    expected_value: Optional[str] = Field(max_length=500)
    
    # Rule scope
    applicable_tables: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    applicable_columns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    applicable_data_types: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    excluded_tables: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business context
    business_justification: Optional[str] = Field(max_length=1000)
    business_owner: Optional[str] = Field(max_length=100)
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Execution settings
    execution_frequency: Optional[str] = Field(max_length=50)  # hourly, daily, weekly
    execution_schedule: Optional[str] = Field(max_length=100)  # cron expression
    timeout_minutes: Optional[int] = Field(default=30)
    retry_attempts: int = Field(default=3)
    
    # Performance metrics
    average_execution_time: Optional[float] = None
    success_rate: Optional[float] = None
    last_execution_time: Optional[datetime] = None
    execution_count: int = Field(default=0)
    failure_count: int = Field(default=0)
    
    # Rule effectiveness
    true_positive_rate: Optional[float] = None
    false_positive_rate: Optional[float] = None
    effectiveness_score: Optional[float] = None
    
    # Lifecycle management
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    version: str = Field(max_length=50, default="1.0")
    
    # Relationships
    assessments: List[DataQualityAssessment] = Relationship(back_populates="quality_rules")
    executions: List["QualityRuleExecution"] = Relationship(back_populates="rule")

class QualityRuleExecution(SQLModel, table=True):
    """Individual executions of quality rules"""
    __tablename__ = "quality_rule_executions"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    execution_id: str = Field(max_length=100, index=True)
    rule_id: UUID = Field(foreign_key="quality_rules.id", index=True)
    assessment_id: Optional[UUID] = Field(foreign_key="data_quality_assessments.id")
    
    # Execution context
    execution_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    execution_type: str = Field(max_length=50)  # scheduled, manual, triggered
    triggered_by: Optional[str] = Field(max_length=100)
    
    # Execution results
    status: QualityStatus
    result: bool = Field(default=False)  # True if rule passed
    score: Optional[float] = Field(ge=0.0, le=100.0)
    records_evaluated: Optional[int] = None
    records_passed: Optional[int] = None
    records_failed: Optional[int] = None
    
    # Detailed results
    execution_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    failed_records_sample: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    statistical_summary: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance metrics
    execution_time_ms: Optional[int] = None
    memory_used_mb: Optional[float] = None
    cpu_time_ms: Optional[int] = None
    
    # Error handling
    error_message: Optional[str] = Field(max_length=2000)
    error_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    retry_count: int = Field(default=0)
    
    # Relationship
    rule: QualityRule = Relationship(back_populates="executions")

# ====================================================================
# QUALITY MONITORING MODELS
# ====================================================================

class QualityMonitoringProfile(SQLModel, table=True):
    """Profiles for continuous quality monitoring"""
    __tablename__ = "quality_monitoring_profiles"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    profile_name: str = Field(max_length=200, index=True)
    catalog_entry_id: UUID = Field(index=True)
    
    # Monitoring configuration
    is_active: bool = Field(default=True)
    monitoring_frequency: str = Field(max_length=50)  # real_time, hourly, daily
    monitoring_schedule: Optional[str] = Field(max_length=100)
    
    # Quality thresholds
    quality_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    degradation_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Monitoring scope
    monitored_dimensions: List[QualityDimension] = Field(default_factory=list, sa_column=Column(JSON))
    monitored_rules: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    sample_size: Optional[int] = None
    sample_strategy: Optional[str] = Field(max_length=50)
    
    # Baseline establishment
    baseline_period_days: int = Field(default=30)
    baseline_quality_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    baseline_established_at: Optional[datetime] = None
    baseline_update_frequency: Optional[str] = Field(max_length=50)
    
    # Alert configuration
    alert_channels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    escalation_rules: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    notification_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance settings
    max_execution_time: int = Field(default=300)  # seconds
    resource_limits: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business context  
    business_owner: str = Field(max_length=100)
    criticality_level: Optional[str] = Field(max_length=50)
    sla_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    
    # Relationships
    monitoring_results: List["QualityMonitoringResult"] = Relationship(back_populates="profile")

class QualityMonitoringResult(SQLModel, table=True):
    """Results from quality monitoring executions"""
    __tablename__ = "quality_monitoring_results"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    result_id: str = Field(max_length=100, index=True)
    profile_id: UUID = Field(foreign_key="quality_monitoring_profiles.id", index=True)
    
    # Monitoring execution
    monitoring_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    execution_time_ms: Optional[int] = None
    
    # Quality measurements
    current_quality_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    baseline_quality_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    quality_deltas: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    quality_trends: Dict[str, QualityTrendDirection] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Threshold violations
    threshold_violations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    critical_violations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    degradation_detected: bool = Field(default=False)
    
    # Anomaly detection
    anomalies_detected: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    anomaly_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Statistical analysis
    statistical_measures: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    distribution_changes: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    correlation_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data profiling
    record_count: Optional[int] = None
    schema_changes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    new_values: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    missing_values: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Alert generation
    alerts_generated: int = Field(default=0)
    alert_ids: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationship
    profile: QualityMonitoringProfile = Relationship(back_populates="monitoring_results")

# ====================================================================
# QUALITY REMEDIATION MODELS
# ====================================================================

class QualityRemediationPlan(SQLModel, table=True):
    """Plans for remediating data quality issues"""
    __tablename__ = "quality_remediation_plans"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    plan_id: str = Field(max_length=100, index=True)
    assessment_id: UUID = Field(foreign_key="data_quality_assessments.id", index=True)
    
    # Plan details
    plan_name: str = Field(max_length=200)
    plan_description: str = Field(max_length=2000)
    plan_type: str = Field(max_length=50)  # automatic, manual, hybrid
    
    # Issues addressed
    quality_issues: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    targeted_dimensions: List[QualityDimension] = Field(default_factory=list, sa_column=Column(JSON))
    estimated_improvement: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Remediation steps
    remediation_steps: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    execution_order: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    dependencies: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Resource requirements
    required_resources: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    estimated_cost: Optional[float] = None
    estimated_effort_hours: Optional[int] = None
    required_skills: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Timeline and scheduling
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    estimated_duration_days: Optional[int] = None
    execution_schedule: Optional[str] = Field(max_length=100)
    
    # Status and progress
    status: RemediationStatus = Field(default=RemediationStatus.NOT_STARTED)
    progress_percentage: Optional[float] = Field(ge=0.0, le=100.0)
    completed_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    failed_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Risk assessment
    risks: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    risk_mitigation: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    rollback_plan: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Stakeholders and approvals
    plan_owner: str = Field(max_length=100)
    business_approver: Optional[str] = Field(max_length=100)
    technical_approver: Optional[str] = Field(max_length=100)
    approval_status: Optional[str] = Field(max_length=50)
    approved_at: Optional[datetime] = None
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    
    # Relationships
    assessment: DataQualityAssessment = Relationship(back_populates="remediation_plans")
    executions: List["QualityRemediationExecution"] = Relationship(back_populates="plan")

class QualityRemediationExecution(SQLModel, table=True):
    """Execution records for remediation plans"""
    __tablename__ = "quality_remediation_executions"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    execution_id: str = Field(max_length=100, index=True)
    plan_id: UUID = Field(foreign_key="quality_remediation_plans.id", index=True)
    
    # Execution details
    execution_type: str = Field(max_length=50)  # full, partial, test, rollback
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    
    # Execution status
    status: RemediationStatus
    executed_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    successful_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    failed_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Results
    records_processed: Optional[int] = None
    records_corrected: Optional[int] = None
    records_deleted: Optional[int] = None
    quality_improvement: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Before/after comparison
    before_quality_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    after_quality_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    improvement_deltas: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Resource utilization
    cpu_time_seconds: Optional[float] = None
    memory_used_mb: Optional[float] = None
    storage_used_mb: Optional[float] = None
    actual_cost: Optional[float] = None
    
    # Error handling
    errors_encountered: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    warnings: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    rollback_required: bool = Field(default=False)
    rollback_completed: bool = Field(default=False)
    
    # Validation
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    validation_passed: bool = Field(default=False)
    post_execution_assessment_id: Optional[str] = Field(max_length=100)
    
    # Metadata
    executed_by: str = Field(max_length=100)
    execution_environment: Optional[str] = Field(max_length=100)
    execution_notes: Optional[str] = Field(max_length=2000)
    
    # Relationship
    plan: QualityRemediationPlan = Relationship(back_populates="executions")

# ====================================================================
# QUALITY ALERT MODELS
# ====================================================================

class QualityAlert(SQLModel, table=True):
    """Quality alerts and notifications"""
    __tablename__ = "quality_alerts"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    alert_id: str = Field(max_length=100, index=True)
    assessment_id: Optional[UUID] = Field(foreign_key="data_quality_assessments.id")
    
    # Alert details
    alert_type: str = Field(max_length=50)  # threshold, anomaly, degradation, rule_failure
    severity: QualityAlertSeverity
    alert_title: str = Field(max_length=200)
    alert_description: str = Field(max_length=2000)
    
    # Alert context
    catalog_entry_id: UUID = Field(index=True)
    affected_dimension: Optional[QualityDimension] = None
    quality_rule_id: Optional[str] = Field(max_length=100)
    
    # Alert trigger
    trigger_condition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    threshold_value: Optional[float] = None
    actual_value: Optional[float] = None
    deviation_percentage: Optional[float] = None
    
    # Alert timing
    triggered_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    first_occurrence: Optional[datetime] = None
    last_occurrence: Optional[datetime] = None
    occurrence_count: int = Field(default=1)
    
    # Alert status
    status: str = Field(max_length=50, default="open")  # open, acknowledged, resolved, suppressed
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = Field(max_length=100)
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = Field(max_length=100)
    
    # Impact assessment
    business_impact: Optional[str] = Field(max_length=100)
    affected_systems: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    affected_users: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    financial_impact: Optional[float] = None
    
    # Notification tracking
    notification_channels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    notifications_sent: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    escalation_level: int = Field(default=0)
    next_escalation_at: Optional[datetime] = None
    
    # Resolution details
    resolution_notes: Optional[str] = Field(max_length=2000)
    resolution_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    false_positive: bool = Field(default=False)
    
    # Relationship
    assessment: Optional[DataQualityAssessment] = Relationship(back_populates="quality_alerts")

# ====================================================================
# QUALITY REPORTING MODELS
# ====================================================================

class QualityReport(SQLModel, table=True):
    """Comprehensive quality reports"""
    __tablename__ = "quality_reports"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    report_id: str = Field(max_length=100, index=True)
    report_name: str = Field(max_length=200)
    
    # Report configuration
    report_type: str = Field(max_length=50)  # summary, detailed, trend, compliance
    report_scope: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    report_period_start: datetime
    report_period_end: datetime
    
    # Report content
    executive_summary: Optional[str] = Field(max_length=5000)
    key_findings: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    quality_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    quality_trends: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Detailed analysis
    dimension_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    issue_analysis: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    improvement_opportunities: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    recommendations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Compliance and governance
    compliance_status: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    policy_violations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business impact
    business_impact_summary: Optional[str] = Field(max_length=2000)
    roi_analysis: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    cost_benefit_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Report generation
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    generated_by: str = Field(max_length=100)
    generation_time_ms: Optional[int] = None
    
    # Report distribution
    recipients: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    distribution_channels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    published_at: Optional[datetime] = None
    report_url: Optional[str] = Field(max_length=500)
    
    # Report metadata
    data_sources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    report_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    report_version: str = Field(max_length=50, default="1.0")

# ====================================================================
# QUALITY ANALYTICS MODELS
# ====================================================================

class QualityAnalytics(SQLModel, table=True):
    """Analytics for quality management operations"""
    __tablename__ = "quality_analytics"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    analytics_id: str = Field(max_length=100, index=True)
    
    # Time dimensions
    analytics_date: datetime = Field(index=True)
    time_period: str = Field(max_length=50)  # hour, day, week, month
    
    # Assessment analytics
    assessments_completed: int = Field(default=0)
    average_assessment_time: Optional[float] = None
    assessment_success_rate: Optional[float] = None
    
    # Quality metrics
    average_quality_score: Optional[float] = None
    quality_improvement_rate: Optional[float] = None
    quality_degradation_incidents: int = Field(default=0)
    
    # Rule analytics
    rules_executed: int = Field(default=0)
    rule_success_rate: Optional[float] = None
    most_failed_rules: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Alert analytics
    alerts_generated: int = Field(default=0)
    critical_alerts: int = Field(default=0)
    alert_resolution_time: Optional[float] = None
    false_positive_rate: Optional[float] = None
    
    # Remediation analytics
    remediation_plans_created: int = Field(default=0)
    remediation_success_rate: Optional[float] = None
    average_remediation_time: Optional[float] = None
    
    # Business impact
    business_value_generated: Optional[float] = None
    cost_savings: Optional[float] = None
    risk_mitigation_value: Optional[float] = None

# ====================================================================
# REQUEST/RESPONSE MODELS
# ====================================================================

class CreateQualityAssessmentRequest(BaseModel):
    """Request to create a quality assessment"""
    catalog_entry_id: UUID
    assessment_name: str = PydanticField(max_length=200)
    assessment_type: QualityAssessmentType
    dimensions_assessed: List[QualityDimension]
    assessment_scope: Dict[str, Any] = {}

class QualityRuleRequest(BaseModel):
    """Request to create or update a quality rule"""
    rule_name: str = PydanticField(max_length=200)
    rule_type: QualityRuleType
    quality_dimension: QualityDimension
    rule_description: str = PydanticField(max_length=1000)
    rule_definition: Dict[str, Any]
    severity: QualityAlertSeverity = QualityAlertSeverity.MEDIUM

class QualityAssessmentResponse(BaseModel):
    """Response for quality assessment results"""
    assessment_id: str
    overall_quality_score: Optional[float]
    overall_quality_level: Optional[QualityLevel]
    dimension_scores: Dict[str, float]
    critical_issues: List[Dict[str, Any]]
    recommendations: List[str]
    duration_minutes: Optional[int]

class QualityMonitoringResponse(BaseModel):
    """Response for quality monitoring results"""
    result_id: str
    current_quality_scores: Dict[str, float]
    quality_trends: Dict[str, QualityTrendDirection]
    threshold_violations: List[Dict[str, Any]]
    alerts_generated: int

# ====================================================================
# UTILITY FUNCTIONS
# ====================================================================

def generate_quality_uuid() -> str:
    """Generate a UUID for quality operations"""
    return f"qual_{uuid4().hex[:12]}"

def calculate_overall_quality_score(
    dimension_scores: Dict[str, float],
    dimension_weights: Dict[str, float]
) -> float:
    """Calculate weighted overall quality score"""
    if not dimension_scores:
        return 0.0
    
    weighted_sum = sum(
        score * dimension_weights.get(dim, 1.0) 
        for dim, score in dimension_scores.items()
    )
    total_weight = sum(
        dimension_weights.get(dim, 1.0) 
        for dim in dimension_scores.keys()
    )
    
    return weighted_sum / total_weight if total_weight > 0 else 0.0

def determine_quality_level(score: float) -> QualityLevel:
    """Determine quality level based on score"""
    if score >= 90:
        return QualityLevel.EXCELLENT
    elif score >= 75:
        return QualityLevel.GOOD
    elif score >= 60:
        return QualityLevel.ACCEPTABLE
    elif score >= 40:
        return QualityLevel.POOR
    else:
        return QualityLevel.CRITICAL

def calculate_quality_trend(
    current_scores: List[float],
    historical_scores: List[float],
    window_size: int = 5
) -> QualityTrendDirection:
    """Calculate quality trend direction"""
    if len(current_scores) < 2 or len(historical_scores) < 2:
        return QualityTrendDirection.UNKNOWN
    
    current_avg = sum(current_scores[-window_size:]) / min(len(current_scores), window_size)
    historical_avg = sum(historical_scores[-window_size:]) / min(len(historical_scores), window_size)
    
    diff_percentage = ((current_avg - historical_avg) / historical_avg) * 100
    
    if diff_percentage > 5:
        return QualityTrendDirection.IMPROVING
    elif diff_percentage < -5:
        return QualityTrendDirection.DECLINING
    elif abs(diff_percentage) > 2:
        return QualityTrendDirection.VOLATILE
    else:
        return QualityTrendDirection.STABLE