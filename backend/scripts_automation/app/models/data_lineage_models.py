"""
🔄 DATA LINEAGE MODELS
Advanced data lineage models for comprehensive lineage tracking, real-time lineage updates,
impact analysis, column-level granularity, and intelligent lineage discovery.

This module provides sophisticated lineage capabilities for:
- Real-Time Data Lineage Tracking and Updates
- Column-Level Lineage with Transformation Logic
- Advanced Impact Analysis and Dependency Mapping
- Intelligent Lineage Discovery and Validation
- Cross-System Lineage Integration and Orchestration
- Enterprise-Grade Lineage Analytics and Reporting
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, ForeignKey
from decimal import Decimal

# Import related models for cross-system integration
from .advanced_catalog_models import EnterpriseDataAsset
from .scan_models import DataSource, ScanJob
from .advanced_scan_rule_models import IntelligentScanRule


class LineageDirection(str, Enum):
    """Direction of data lineage flow"""
    UPSTREAM = "upstream"           # Data flows from this asset
    DOWNSTREAM = "downstream"       # Data flows to this asset
    BIDIRECTIONAL = "bidirectional" # Data flows both ways
    CIRCULAR = "circular"           # Circular dependency detected
    LATERAL = "lateral"             # Lateral data movement


class LineageType(str, Enum):
    """Types of lineage relationships"""
    DIRECT = "direct"               # Direct data copy/movement
    TRANSFORMATION = "transformation"  # Data transformation applied
    AGGREGATION = "aggregation"     # Data aggregation/summarization
    JOIN = "join"                   # Data joining operation
    FILTER = "filter"               # Data filtering operation
    UNION = "union"                 # Data union operation
    DERIVATION = "derivation"       # Derived/calculated data
    REFERENCE = "reference"         # Reference relationship
    DEPENDENCY = "dependency"       # Dependency relationship
    COMPOSITION = "composition"     # Composition relationship


class LineageGranularity(str, Enum):
    """Granularity levels of lineage tracking"""
    SYSTEM = "system"               # System-to-system lineage
    DATABASE = "database"           # Database-to-database lineage
    SCHEMA = "schema"               # Schema-to-schema lineage
    TABLE = "table"                 # Table-to-table lineage
    COLUMN = "column"               # Column-to-column lineage
    FIELD = "field"                 # Field-to-field lineage
    VALUE = "value"                 # Value-level lineage
    RECORD = "record"               # Record-level lineage


class LineageDiscoveryMethod(str, Enum):
    """Methods used for lineage discovery"""
    MANUAL_DOCUMENTATION = "manual_documentation"     # Manually documented
    SQL_PARSING = "sql_parsing"                       # SQL query parsing
    LOG_ANALYSIS = "log_analysis"                     # Log file analysis
    METADATA_ANALYSIS = "metadata_analysis"           # Metadata analysis
    API_INTEGRATION = "api_integration"               # API-based discovery
    RUNTIME_MONITORING = "runtime_monitoring"         # Runtime monitoring
    AI_INFERENCE = "ai_inference"                     # AI/ML inference
    PATTERN_MATCHING = "pattern_matching"             # Pattern matching
    SCHEMA_ANALYSIS = "schema_analysis"               # Schema comparison
    DATA_PROFILING = "data_profiling"                 # Data profiling analysis


class LineageValidationStatus(str, Enum):
    """Validation status for lineage relationships"""
    UNVALIDATED = "unvalidated"     # Not yet validated
    VALIDATING = "validating"       # Currently being validated
    VALIDATED = "validated"         # Successfully validated
    VALIDATION_FAILED = "validation_failed"  # Validation failed
    PARTIALLY_VALIDATED = "partially_validated"  # Partially validated
    DEPRECATED = "deprecated"       # Lineage is deprecated
    CONFLICTED = "conflicted"       # Conflicting lineage detected


class ImpactLevel(str, Enum):
    """Impact levels for lineage changes"""
    MINIMAL = "minimal"             # Minimal impact
    LOW = "low"                     # Low impact
    MEDIUM = "medium"               # Medium impact
    HIGH = "high"                   # High impact
    CRITICAL = "critical"           # Critical impact
    CATASTROPHIC = "catastrophic"   # Catastrophic impact


class LineageConfidenceLevel(str, Enum):
    """Confidence levels for lineage accuracy"""
    VERY_LOW = "very_low"           # 0-20% confidence
    LOW = "low"                     # 21-40% confidence
    MEDIUM = "medium"               # 41-60% confidence
    HIGH = "high"                   # 61-80% confidence
    VERY_HIGH = "very_high"         # 81-100% confidence


class DataLineagePath(SQLModel, table=True):
    """
    Comprehensive data lineage path model tracking complete data flow paths
    with advanced analytics, impact analysis, and validation capabilities.
    """
    __tablename__ = "data_lineage_paths"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    path_uuid: str = Field(index=True, unique=True, description="Unique path identifier")
    path_name: str = Field(max_length=255, index=True)
    path_description: Optional[str] = Field(sa_column=Column(Text))
    
    # Path Configuration
    source_asset_id: int = Field(foreign_key="enterprise_data_assets.id", index=True)
    target_asset_id: int = Field(foreign_key="enterprise_data_assets.id", index=True)
    lineage_direction: LineageDirection = Field(index=True)
    lineage_type: LineageType = Field(index=True)
    granularity_level: LineageGranularity = Field(index=True)
    
    # Path Structure
    path_length: int = Field(default=1, ge=1, le=100)
    intermediate_assets: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    path_nodes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    path_edges: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    transformation_sequence: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Discovery and Validation
    discovery_method: LineageDiscoveryMethod = Field(index=True)
    discovery_confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    confidence_level: LineageConfidenceLevel = Field(default=LineageConfidenceLevel.MEDIUM, index=True)
    validation_status: LineageValidationStatus = Field(default=LineageValidationStatus.UNVALIDATED, index=True)
    validation_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Path Analytics
    usage_frequency: int = Field(default=0, ge=0)
    execution_count: int = Field(default=0, ge=0)
    last_execution: Optional[datetime] = Field(index=True)
    average_execution_time: Optional[float] = Field(ge=0.0)
    success_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Business Context
    business_process: Optional[str] = Field(max_length=255)
    business_owner: Optional[str] = Field(max_length=255)
    business_criticality: str = Field(default="medium", max_length=50)
    business_impact_score: float = Field(default=0.0, ge=0.0, le=10.0)
    
    # Data Quality Impact
    quality_impact_score: float = Field(default=0.0, ge=-1.0, le=1.0)
    data_consistency_score: float = Field(default=1.0, ge=0.0, le=1.0)
    transformation_accuracy: float = Field(default=1.0, ge=0.0, le=1.0)
    data_loss_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Performance Metrics
    data_volume_processed: Optional[int] = Field(ge=0)
    processing_latency_ms: Optional[float] = Field(ge=0.0)
    throughput_records_per_second: Optional[float] = Field(ge=0.0)
    resource_consumption: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Impact Analysis
    downstream_asset_count: int = Field(default=0, ge=0)
    upstream_dependency_count: int = Field(default=0, ge=0)
    impact_radius: int = Field(default=0, ge=0)
    impact_level: ImpactLevel = Field(default=ImpactLevel.MEDIUM, index=True)
    affected_systems: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Transformation Details
    transformation_logic: Optional[str] = Field(sa_column=Column(Text))
    transformation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    sql_query: Optional[str] = Field(sa_column=Column(Text))
    code_references: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Column-Level Mapping
    column_mappings: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    field_transformations: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    derived_columns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    calculated_fields: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data Flow Characteristics
    data_flow_pattern: Optional[str] = Field(max_length=100)
    flow_frequency: Optional[str] = Field(max_length=50)  # real-time, batch, streaming
    flow_schedule: Optional[str] = Field(max_length=255)  # Cron expression
    flow_volume_trend: str = Field(default="stable", max_length=50)
    
    # Monitoring and Alerting
    monitoring_enabled: bool = Field(default=True)
    alert_conditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    health_score: float = Field(default=1.0, ge=0.0, le=1.0)
    last_health_check: Optional[datetime] = None
    
    # Change Management
    version: str = Field(default="1.0.0", max_length=20)
    change_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    breaking_changes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    schema_evolution_impact: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Compliance and Governance
    compliance_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    governance_policies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    data_privacy_flags: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    audit_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata and Enrichment
    path_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    technical_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    operational_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    custom_attributes: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Tags and Labels
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    labels: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    semantic_annotations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle Management
    is_active: bool = Field(default=True, index=True)
    is_deprecated: bool = Field(default=False, index=True)
    deprecation_reason: Optional[str] = Field(max_length=500)
    created_by: str = Field(max_length=255)
    updated_by: Optional[str] = Field(max_length=255)
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    discovered_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_validated: Optional[datetime] = None
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    
    # Relationships
    source_asset: Optional[EnterpriseDataAsset] = Relationship(sa_relationship_kwargs={"foreign_keys": "DataLineagePath.source_asset_id"})
    target_asset: Optional[EnterpriseDataAsset] = Relationship(sa_relationship_kwargs={"foreign_keys": "DataLineagePath.target_asset_id"})
    lineage_segments: List["LineageSegment"] = Relationship(back_populates="lineage_path")
    impact_analyses: List["LineageImpactAnalysis"] = Relationship(back_populates="lineage_path")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_path_source_target', 'source_asset_id', 'target_asset_id'),
        Index('ix_path_type_direction', 'lineage_type', 'lineage_direction'),
        Index('ix_path_validation', 'validation_status', 'confidence_level'),
        Index('ix_path_business', 'business_criticality', 'business_impact_score'),
        Index('ix_path_impact', 'impact_level', 'downstream_asset_count'),
        CheckConstraint('discovery_confidence >= 0.0 AND discovery_confidence <= 1.0'),
        CheckConstraint('validation_score >= 0.0 AND validation_score <= 1.0'),
        CheckConstraint('source_asset_id != target_asset_id'),
        CheckConstraint('path_length >= 1 AND path_length <= 100'),
        UniqueConstraint('path_uuid'),
    )


class LineageSegment(SQLModel, table=True):
    """
    Individual lineage segment model representing a single hop in a lineage path
    with detailed transformation logic and granular tracking capabilities.
    """
    __tablename__ = "lineage_segments"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    segment_uuid: str = Field(index=True, unique=True)
    lineage_path_id: int = Field(foreign_key="data_lineage_paths.id", index=True)
    
    # Segment Position
    segment_order: int = Field(ge=1, index=True)
    is_first_segment: bool = Field(default=False)
    is_last_segment: bool = Field(default=False)
    
    # Source and Target
    source_asset_id: int = Field(foreign_key="enterprise_data_assets.id", index=True)
    target_asset_id: int = Field(foreign_key="enterprise_data_assets.id", index=True)
    source_element: Optional[str] = Field(max_length=500)  # column, field, etc.
    target_element: Optional[str] = Field(max_length=500)  # column, field, etc.
    
    # Transformation Details
    transformation_type: str = Field(max_length=100, index=True)
    transformation_name: Optional[str] = Field(max_length=255)
    transformation_logic: Optional[str] = Field(sa_column=Column(Text))
    transformation_function: Optional[str] = Field(max_length=255)
    transformation_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # SQL and Code Details
    sql_fragment: Optional[str] = Field(sa_column=Column(Text))
    join_conditions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    filter_conditions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    aggregation_functions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    window_functions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Data Characteristics
    data_type_transformation: Optional[str] = Field(max_length=255)
    data_format_change: Optional[str] = Field(max_length=255)
    data_volume_change: Optional[float] = None  # Percentage change
    data_quality_impact: float = Field(default=0.0, ge=-1.0, le=1.0)
    
    # Processing Information
    processing_engine: Optional[str] = Field(max_length=100)
    execution_environment: Optional[str] = Field(max_length=100)
    runtime_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Validation and Quality
    validation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    quality_checks: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    error_handling: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    success_criteria: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business Logic
    business_rule_applied: Optional[str] = Field(max_length=500)
    business_logic_description: Optional[str] = Field(sa_column=Column(Text))
    domain_specific_logic: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Monitoring and Observability
    execution_count: int = Field(default=0, ge=0)
    last_execution: Optional[datetime] = None
    average_execution_time: Optional[float] = Field(ge=0.0)
    failure_count: int = Field(default=0, ge=0)
    success_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Impact and Dependencies
    upstream_dependencies: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    downstream_impacts: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    side_effects: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Change Detection
    schema_version: Optional[str] = Field(max_length=50)
    last_schema_change: Optional[datetime] = None
    breaking_change_indicator: bool = Field(default=False)
    change_impact_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Metadata and Enrichment
    segment_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    execution_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    lineage_annotations: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    lineage_path: Optional[DataLineagePath] = Relationship(back_populates="lineage_segments")
    source_asset: Optional[EnterpriseDataAsset] = Relationship(sa_relationship_kwargs={"foreign_keys": "LineageSegment.source_asset_id"})
    target_asset: Optional[EnterpriseDataAsset] = Relationship(sa_relationship_kwargs={"foreign_keys": "LineageSegment.target_asset_id"})
    
    # Database Constraints
    __table_args__ = (
        Index('ix_segment_path_order', 'lineage_path_id', 'segment_order'),
        Index('ix_segment_transformation', 'transformation_type', 'transformation_name'),
        Index('ix_segment_performance', 'success_rate', 'average_execution_time'),
        Index('ix_segment_impact', 'data_quality_impact', 'breaking_change_indicator'),
        CheckConstraint('success_rate >= 0.0 AND success_rate <= 1.0'),
        CheckConstraint('source_asset_id != target_asset_id'),
        UniqueConstraint('segment_uuid'),
        UniqueConstraint('lineage_path_id', 'segment_order'),
    )


class LineageImpactAnalysis(SQLModel, table=True):
    """
    Comprehensive impact analysis model for lineage changes with
    predictive analysis, risk assessment, and mitigation strategies.
    """
    __tablename__ = "lineage_impact_analyses"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    analysis_uuid: str = Field(index=True, unique=True)
    lineage_path_id: int = Field(foreign_key="data_lineage_paths.id", index=True)
    
    # Analysis Configuration
    analysis_name: str = Field(max_length=255, index=True)
    analysis_type: str = Field(max_length=100, index=True)  # change_impact, failure_impact, optimization
    trigger_event: str = Field(max_length=100)  # schema_change, data_change, system_change
    analysis_scope: str = Field(max_length=100)  # local, regional, global
    
    # Impact Assessment
    impact_level: ImpactLevel = Field(index=True)
    impact_score: float = Field(ge=0.0, le=10.0, index=True)
    confidence_score: float = Field(ge=0.0, le=1.0)
    risk_level: str = Field(max_length=50, index=True)  # low, medium, high, critical
    
    # Affected Assets
    directly_affected_assets: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    indirectly_affected_assets: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    asset_impact_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    critical_path_assets: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    
    # System Impact
    affected_systems: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    system_downtime_risk: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_impact: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_impact: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Impact
    business_functions_affected: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    business_impact_score: float = Field(default=0.0, ge=0.0, le=10.0)
    revenue_impact_estimate: Optional[float] = None
    operational_impact: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    stakeholder_impact: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data Quality Impact
    data_quality_risks: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    data_consistency_impact: float = Field(default=0.0, ge=-1.0, le=1.0)
    data_availability_impact: float = Field(default=0.0, ge=-1.0, le=1.0)
    data_accuracy_impact: float = Field(default=0.0, ge=-1.0, le=1.0)
    
    # Timeline Analysis
    impact_timeline: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    immediate_impacts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    short_term_impacts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    long_term_impacts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Mitigation Strategies
    mitigation_strategies: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    contingency_plans: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    rollback_procedures: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    recovery_time_estimates: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Monitoring and Alerting
    monitoring_recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    alert_configurations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    health_check_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Predictive Analysis
    predictive_models_used: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    prediction_accuracy: Optional[float] = Field(ge=0.0, le=1.0)
    scenario_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    monte_carlo_results: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    
    # Validation and Testing
    testing_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    validation_checkpoints: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    acceptance_criteria: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Analysis Results
    analysis_summary: str = Field(sa_column=Column(Text))
    key_findings: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    action_items: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Analysis Execution
    analysis_duration_minutes: Optional[float] = Field(ge=0.0)
    computational_complexity: str = Field(default="medium", max_length=50)
    data_points_analyzed: int = Field(default=0, ge=0)
    analysis_accuracy: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Review and Approval
    review_status: str = Field(default="pending", max_length=50, index=True)
    reviewed_by: Optional[str] = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    review_comments: Optional[str] = Field(sa_column=Column(Text))
    
    # Temporal Management
    analysis_date: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_at: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    lineage_path: Optional[DataLineagePath] = Relationship(back_populates="impact_analyses")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_impact_level_score', 'impact_level', 'impact_score'),
        Index('ix_impact_risk_business', 'risk_level', 'business_impact_score'),
        Index('ix_impact_analysis_date', 'analysis_date', 'lineage_path_id'),
        Index('ix_impact_review', 'review_status', 'analysis_type'),
        CheckConstraint('impact_score >= 0.0 AND impact_score <= 10.0'),
        CheckConstraint('confidence_score >= 0.0 AND confidence_score <= 1.0'),
        CheckConstraint('business_impact_score >= 0.0 AND business_impact_score <= 10.0'),
        UniqueConstraint('analysis_uuid'),
    )


class LineageEvent(SQLModel, table=True):
    """
    Lineage event tracking model for capturing changes, updates, and
    important events in the lineage ecosystem with real-time monitoring.
    """
    __tablename__ = "lineage_events"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    event_uuid: str = Field(index=True, unique=True)
    event_name: str = Field(max_length=255, index=True)
    event_type: str = Field(max_length=100, index=True)
    
    # Event Context
    lineage_path_id: Optional[int] = Field(foreign_key="data_lineage_paths.id", index=True)
    asset_id: Optional[int] = Field(foreign_key="enterprise_data_assets.id", index=True)
    event_source: str = Field(max_length=100, index=True)  # system, user, automation, api
    event_category: str = Field(max_length=100, index=True)  # creation, modification, deletion, error
    
    # Event Details
    event_description: str = Field(sa_column=Column(Text))
    event_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    event_payload: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    event_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Impact and Severity
    severity_level: str = Field(max_length=50, index=True)  # info, warning, error, critical
    impact_scope: str = Field(max_length=100)  # local, regional, global
    affected_components: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    downstream_notifications: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Event Processing
    processing_status: str = Field(default="pending", max_length=50, index=True)
    processing_attempts: int = Field(default=0, ge=0)
    last_processing_attempt: Optional[datetime] = None
    processing_errors: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Change Information
    before_state: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    after_state: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    change_summary: Optional[str] = Field(max_length=1000)
    change_impact_analysis: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    
    # User and System Information
    triggered_by: Optional[str] = Field(max_length=255)
    user_context: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    system_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    session_id: Optional[str] = Field(max_length=255)
    
    # Correlation and Tracing
    correlation_id: Optional[str] = Field(max_length=255, index=True)
    parent_event_id: Optional[int] = Field(foreign_key="lineage_events.id")
    child_events: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    trace_id: Optional[str] = Field(max_length=255)
    
    # Notification and Alerting
    notification_sent: bool = Field(default=False)
    notification_channels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    alert_conditions_met: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    escalation_required: bool = Field(default=False)
    
    # Event Lifecycle
    event_status: str = Field(default="active", max_length=50, index=True)
    resolution_status: Optional[str] = Field(max_length=50)
    resolved_by: Optional[str] = Field(max_length=255)
    resolution_notes: Optional[str] = Field(sa_column=Column(Text))
    
    # Temporal Management
    event_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    ingestion_timestamp: datetime = Field(default_factory=datetime.utcnow)
    processing_timestamp: Optional[datetime] = None
    resolution_timestamp: Optional[datetime] = None
    
    # Relationships
    lineage_path: Optional[DataLineagePath] = Relationship()
    parent_event: Optional["LineageEvent"] = Relationship(back_populates="child_event_relations", sa_relationship_kwargs={"remote_side": "LineageEvent.id"})
    child_event_relations: List["LineageEvent"] = Relationship(back_populates="parent_event", sa_relationship_kwargs={"remote_side": "LineageEvent.parent_event_id"})
    
    # Database Constraints
    __table_args__ = (
        Index('ix_event_timestamp_type', 'event_timestamp', 'event_type'),
        Index('ix_event_severity_status', 'severity_level', 'event_status'),
        Index('ix_event_correlation', 'correlation_id', 'trace_id'),
        Index('ix_event_processing', 'processing_status', 'processing_attempts'),
        UniqueConstraint('event_uuid'),
    )


class LineageValidation(SQLModel, table=True):
    """
    Lineage validation model for tracking validation processes, results,
    and continuous monitoring of lineage accuracy and completeness.
    """
    __tablename__ = "lineage_validations"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    validation_uuid: str = Field(index=True, unique=True)
    lineage_path_id: int = Field(foreign_key="data_lineage_paths.id", index=True)
    
    # Validation Configuration
    validation_name: str = Field(max_length=255, index=True)
    validation_type: str = Field(max_length=100, index=True)  # automated, manual, hybrid
    validation_method: str = Field(max_length=100)  # data_comparison, schema_analysis, sampling
    validation_scope: str = Field(max_length=100)  # complete, sample, targeted
    
    # Validation Execution
    validation_status: LineageValidationStatus = Field(index=True)
    started_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[float] = Field(ge=0.0)
    validation_progress: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Validation Results
    overall_score: float = Field(default=0.0, ge=0.0, le=1.0, index=True)
    accuracy_score: float = Field(default=0.0, ge=0.0, le=1.0)
    completeness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    consistency_score: float = Field(default=0.0, ge=0.0, le=1.0)
    timeliness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Test Results
    tests_executed: int = Field(default=0, ge=0)
    tests_passed: int = Field(default=0, ge=0)
    tests_failed: int = Field(default=0, ge=0)
    test_pass_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Data Validation
    records_validated: int = Field(default=0, ge=0)
    records_matched: int = Field(default=0, ge=0)
    data_match_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    schema_match_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Issues and Findings
    validation_issues: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    critical_issues: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    warnings: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Evidence and Supporting Data
    validation_evidence: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    supporting_queries: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    data_samples: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    statistical_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Validation Configuration Details
    validation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    quality_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    sampling_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    comparison_criteria: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Impact
    business_validation_score: float = Field(default=0.0, ge=0.0, le=1.0)
    business_logic_validation: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_validation: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    regulatory_compliance_score: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Performance Metrics
    validation_performance: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_usage: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    execution_efficiency: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Historical Comparison
    previous_validation_id: Optional[int] = Field(foreign_key="lineage_validations.id")
    improvement_score: Optional[float] = Field(ge=-1.0, le=1.0)
    trend_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    regression_detected: bool = Field(default=False)
    
    # Reviewer Information
    validated_by: Optional[str] = Field(max_length=255)
    reviewer_notes: Optional[str] = Field(sa_column=Column(Text))
    review_status: str = Field(default="pending", max_length=50)
    peer_review_required: bool = Field(default=False)
    
    # Automation and Integration
    automated_validation: bool = Field(default=False)
    validation_schedule: Optional[str] = Field(max_length=255)  # Cron expression
    next_validation_due: Optional[datetime] = None
    continuous_monitoring: bool = Field(default=False)
    
    # Relationships
    lineage_path: Optional[DataLineagePath] = Relationship()
    previous_validation: Optional["LineageValidation"] = Relationship(back_populates="next_validation", sa_relationship_kwargs={"remote_side": "LineageValidation.id"})
    next_validation: Optional["LineageValidation"] = Relationship(back_populates="previous_validation", sa_relationship_kwargs={"remote_side": "LineageValidation.previous_validation_id"})
    
    # Database Constraints
    __table_args__ = (
        Index('ix_validation_status_score', 'validation_status', 'overall_score'),
        Index('ix_validation_timing', 'started_at', 'completed_at'),
        Index('ix_validation_results', 'test_pass_rate', 'data_match_percentage'),
        Index('ix_validation_business', 'business_validation_score', 'regulatory_compliance_score'),
        CheckConstraint('overall_score >= 0.0 AND overall_score <= 1.0'),
        CheckConstraint('validation_progress >= 0.0 AND validation_progress <= 100.0'),
        CheckConstraint('test_pass_rate >= 0.0 AND test_pass_rate <= 1.0'),
        UniqueConstraint('validation_uuid'),
    )


class LineageMetrics(SQLModel, table=True):
    """
    Comprehensive lineage metrics and analytics model for tracking
    performance, usage, and business value of lineage relationships.
    """
    __tablename__ = "lineage_metrics"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    metrics_uuid: str = Field(index=True, unique=True)
    lineage_path_id: int = Field(foreign_key="data_lineage_paths.id", index=True)
    
    # Metrics Configuration
    metrics_date: datetime = Field(index=True)
    metrics_type: str = Field(max_length=100, index=True)  # daily, weekly, monthly, real_time
    aggregation_period: str = Field(max_length=50)  # hour, day, week, month
    metrics_scope: str = Field(max_length=100)  # path, segment, system, global
    
    # Usage Metrics
    access_count: int = Field(default=0, ge=0)
    unique_users: int = Field(default=0, ge=0)
    query_count: int = Field(default=0, ge=0)
    execution_count: int = Field(default=0, ge=0)
    data_volume_processed: int = Field(default=0, ge=0)
    
    # Performance Metrics
    average_execution_time: Optional[float] = Field(ge=0.0)
    median_execution_time: Optional[float] = Field(ge=0.0)
    p95_execution_time: Optional[float] = Field(ge=0.0)
    p99_execution_time: Optional[float] = Field(ge=0.0)
    throughput_records_per_second: Optional[float] = Field(ge=0.0)
    
    # Quality Metrics
    data_quality_score: float = Field(default=1.0, ge=0.0, le=1.0)
    transformation_accuracy: float = Field(default=1.0, ge=0.0, le=1.0)
    error_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    success_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    data_consistency_score: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Business Metrics
    business_value_score: float = Field(default=0.0, ge=0.0, le=10.0)
    cost_per_execution: Optional[float] = Field(ge=0.0)
    roi_score: float = Field(default=0.0, ge=0.0, le=10.0)
    user_satisfaction_score: float = Field(default=0.0, ge=0.0, le=5.0)
    
    # Reliability Metrics
    availability_percentage: float = Field(default=100.0, ge=0.0, le=100.0)
    uptime_hours: float = Field(default=0.0, ge=0.0)
    downtime_incidents: int = Field(default=0, ge=0)
    mean_time_to_recovery: Optional[float] = Field(ge=0.0)
    
    # Resource Utilization
    cpu_utilization_avg: float = Field(default=0.0, ge=0.0, le=100.0)
    memory_utilization_avg: float = Field(default=0.0, ge=0.0, le=100.0)
    storage_usage_gb: float = Field(default=0.0, ge=0.0)
    network_io_mb: float = Field(default=0.0, ge=0.0)
    
    # Trend Analysis
    usage_trend: str = Field(default="stable", max_length=50)  # increasing, decreasing, stable
    performance_trend: str = Field(default="stable", max_length=50)
    quality_trend: str = Field(default="stable", max_length=50)
    growth_rate: Optional[float] = None
    
    # Comparative Metrics
    peer_comparison_score: float = Field(default=0.0, ge=0.0, le=1.0)
    industry_benchmark_score: float = Field(default=0.0, ge=0.0, le=1.0)
    historical_comparison: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Alert and Threshold Metrics
    threshold_breaches: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    sla_compliance_score: float = Field(default=1.0, ge=0.0, le=1.0)
    alert_frequency: int = Field(default=0, ge=0)
    escalation_count: int = Field(default=0, ge=0)
    
    # Advanced Analytics
    anomaly_score: float = Field(default=0.0, ge=0.0, le=1.0)
    pattern_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    predictive_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    machine_learning_insights: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Segmentation and Categorization
    user_segment_metrics: Dict[str, Dict[str, float]] = Field(default_factory=dict, sa_column=Column(JSON))
    time_based_segments: Dict[str, Dict[str, float]] = Field(default_factory=dict, sa_column=Column(JSON))
    geographic_distribution: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data Lineage Specific Metrics
    lineage_depth_impact: float = Field(default=0.0, ge=0.0, le=1.0)
    transformation_complexity_score: float = Field(default=0.0, ge=0.0, le=1.0)
    data_flow_efficiency: float = Field(default=1.0, ge=0.0, le=1.0)
    lineage_completeness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Metadata and Context
    metrics_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    calculation_method: str = Field(max_length=255)
    data_sources_used: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    confidence_interval: Optional[Tuple[float, float]] = None
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    calculated_at: datetime = Field(default_factory=datetime.utcnow)
    valid_from: datetime = Field(default_factory=datetime.utcnow)
    valid_until: Optional[datetime] = None
    
    # Relationships
    lineage_path: Optional[DataLineagePath] = Relationship()
    
    # Database Constraints
    __table_args__ = (
        Index('ix_metrics_date_type', 'metrics_date', 'metrics_type'),
        Index('ix_metrics_performance', 'average_execution_time', 'throughput_records_per_second'),
        Index('ix_metrics_quality', 'data_quality_score', 'success_rate'),
        Index('ix_metrics_business', 'business_value_score', 'roi_score'),
        CheckConstraint('data_quality_score >= 0.0 AND data_quality_score <= 1.0'),
        CheckConstraint('success_rate >= 0.0 AND success_rate <= 1.0'),
        CheckConstraint('availability_percentage >= 0.0 AND availability_percentage <= 100.0'),
        UniqueConstraint('metrics_uuid'),
        UniqueConstraint('lineage_path_id', 'metrics_date', 'metrics_type'),
    )


# ===================== REQUEST AND RESPONSE MODELS =====================

class DataLineagePathResponse(BaseModel):
    """Response model for data lineage paths"""
    id: int
    path_uuid: str
    path_name: str
    source_asset_id: int
    target_asset_id: int
    lineage_direction: LineageDirection
    lineage_type: LineageType
    granularity_level: LineageGranularity
    path_length: int
    discovery_confidence: float
    confidence_level: LineageConfidenceLevel
    validation_status: LineageValidationStatus
    business_impact_score: float
    impact_level: ImpactLevel
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DataLineagePathCreate(BaseModel):
    """Request model for creating data lineage paths"""
    path_name: str = Field(min_length=1, max_length=255)
    path_description: Optional[str] = None
    source_asset_id: int
    target_asset_id: int
    lineage_direction: LineageDirection
    lineage_type: LineageType
    granularity_level: LineageGranularity = LineageGranularity.TABLE
    discovery_method: LineageDiscoveryMethod
    discovery_confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    transformation_logic: Optional[str] = None
    business_process: Optional[str] = Field(max_length=255)
    business_criticality: str = Field(default="medium", max_length=50)
    created_by: str = Field(min_length=1, max_length=255)


class LineageSegmentResponse(BaseModel):
    """Response model for lineage segments"""
    id: int
    segment_uuid: str
    lineage_path_id: int
    segment_order: int
    source_asset_id: int
    target_asset_id: int
    transformation_type: str
    transformation_name: Optional[str]
    data_quality_impact: float
    success_rate: float
    execution_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class LineageImpactAnalysisResponse(BaseModel):
    """Response model for lineage impact analysis"""
    id: int
    analysis_uuid: str
    analysis_name: str
    lineage_path_id: int
    impact_level: ImpactLevel
    impact_score: float
    confidence_score: float
    risk_level: str
    business_impact_score: float
    analysis_summary: str
    recommendations: List[str]
    analysis_date: datetime
    
    class Config:
        from_attributes = True


class LineageSearchRequest(BaseModel):
    """Request model for lineage search"""
    asset_id: Optional[int] = None
    direction: Optional[LineageDirection] = None
    lineage_types: Optional[List[LineageType]] = []
    granularity_levels: Optional[List[LineageGranularity]] = []
    max_depth: int = Field(default=5, ge=1, le=20)
    include_inactive: bool = False
    min_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    business_critical_only: bool = False
    validated_only: bool = False


class LineageGraphResponse(BaseModel):
    """Response model for lineage graph"""
    root_asset_id: int
    direction: LineageDirection
    max_depth: int
    total_nodes: int
    total_edges: int
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    critical_paths: List[List[int]]
    complexity_score: float
    graph_metadata: Dict[str, Any]


class LineageValidationRequest(BaseModel):
    """Request model for lineage validation"""
    lineage_path_id: int
    validation_name: str = Field(min_length=1, max_length=255)
    validation_type: str = Field(min_length=1, max_length=100)
    validation_method: str = Field(min_length=1, max_length=100)
    validation_scope: str = Field(default="complete", max_length=100)
    quality_thresholds: Optional[Dict[str, float]] = {}
    sampling_parameters: Optional[Dict[str, Any]] = {}


class LineageMetricsReport(BaseModel):
    """Lineage metrics report model"""
    lineage_path_id: int
    metrics_period: str
    usage_summary: Dict[str, int]
    performance_summary: Dict[str, float]
    quality_summary: Dict[str, float]
    business_summary: Dict[str, float]
    trend_analysis: Dict[str, Any]
    recommendations: List[str]
    generated_at: datetime


# ===================== UTILITY FUNCTIONS =====================

def generate_lineage_uuid() -> str:
    """Generate a unique UUID for lineage paths"""
    return f"lineage_{uuid.uuid4().hex[:12]}"


def generate_segment_uuid() -> str:
    """Generate a unique UUID for lineage segments"""
    return f"segment_{uuid.uuid4().hex[:12]}"


def calculate_lineage_confidence(
    discovery_method: str,
    validation_score: float,
    data_consistency: float,
    business_validation: float
) -> float:
    """Calculate overall lineage confidence score"""
    # Method confidence weights
    method_weights = {
        "manual_documentation": 0.9,
        "sql_parsing": 0.8,
        "metadata_analysis": 0.7,
        "runtime_monitoring": 0.85,
        "ai_inference": 0.6,
        "pattern_matching": 0.5
    }
    
    method_confidence = method_weights.get(discovery_method, 0.5)
    
    # Weighted confidence calculation
    confidence = (
        method_confidence * 0.3 +
        validation_score * 0.4 +
        data_consistency * 0.2 +
        business_validation * 0.1
    )
    
    return min(confidence, 1.0)


def estimate_impact_radius(
    path_length: int,
    downstream_count: int,
    business_criticality: str,
    data_volume: int
) -> int:
    """Estimate the impact radius of lineage changes"""
    base_radius = path_length
    
    # Business criticality multiplier
    criticality_multipliers = {
        "low": 1.0,
        "medium": 1.5,
        "high": 2.0,
        "critical": 3.0
    }
    
    multiplier = criticality_multipliers.get(business_criticality, 1.5)
    
    # Consider downstream assets and data volume
    volume_factor = min(data_volume / 1000000, 5.0)  # Cap at 5x
    downstream_factor = min(downstream_count / 10, 3.0)  # Cap at 3x
    
    estimated_radius = int(base_radius * multiplier * (1 + volume_factor * 0.1) * (1 + downstream_factor * 0.1))
    
    return max(estimated_radius, 1)


# Export all models and utilities
__all__ = [
    # Enums
    "LineageDirection", "LineageType", "LineageGranularity", "LineageDiscoveryMethod",
    "LineageValidationStatus", "ImpactLevel", "LineageConfidenceLevel",
    
    # Core Models
    "DataLineagePath", "LineageSegment", "LineageImpactAnalysis", "LineageEvent",
    "LineageValidation", "LineageMetrics",
    
    # Request/Response Models
    "DataLineagePathResponse", "DataLineagePathCreate", "LineageSegmentResponse",
    "LineageImpactAnalysisResponse", "LineageSearchRequest", "LineageGraphResponse",
    "LineageValidationRequest", "LineageMetricsReport",
    
    # Utilities
    "generate_lineage_uuid", "generate_segment_uuid", "calculate_lineage_confidence",
    "estimate_impact_radius"
]