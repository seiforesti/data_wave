"""
Advanced Data Lineage Models for Enterprise Data Governance
=========================================================

This module contains sophisticated models for comprehensive data lineage tracking,
graph-based analysis, impact assessment, and advanced visualization capabilities
that provide complete visibility into data flow across enterprise systems.

Features:
- Real-time lineage tracking and graph analysis
- Advanced impact assessment and dependency mapping
- Intelligent relationship discovery and validation
- Multi-dimensional lineage (column, table, system, business process)
- Performance optimization for large-scale lineage graphs
- Integration with all data governance components
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, Text, ARRAY, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint
import networkx as nx


# ===================== ENUMS AND CONSTANTS =====================

class LineageDirection(str, Enum):
    """Direction of lineage relationships"""
    UPSTREAM = "upstream"          # Source to target flow
    DOWNSTREAM = "downstream"      # Target from source flow
    BIDIRECTIONAL = "bidirectional"  # Two-way relationship

class LineageType(str, Enum):
    """Types of lineage relationships"""
    DATA_FLOW = "data_flow"               # Direct data movement
    TRANSFORMATION = "transformation"     # Data transformation
    AGGREGATION = "aggregation"          # Data aggregation
    JOIN = "join"                        # Data joining
    UNION = "union"                      # Data union
    FILTER = "filter"                    # Data filtering
    LOOKUP = "lookup"                    # Reference lookup
    DERIVATION = "derivation"            # Derived calculation
    REPLICATION = "replication"          # Data replication
    SYNCHRONIZATION = "synchronization"  # Data synchronization

class LineageGranularity(str, Enum):
    """Granularity levels for lineage tracking"""
    SYSTEM = "system"                # System-to-system level
    DATABASE = "database"            # Database-to-database level
    SCHEMA = "schema"                # Schema-to-schema level
    TABLE = "table"                  # Table-to-table level
    COLUMN = "column"                # Column-to-column level
    FIELD = "field"                  # Field-to-field level
    RECORD = "record"                # Record-to-record level

class LineageConfidence(str, Enum):
    """Confidence levels for lineage relationships"""
    VERIFIED = "verified"            # Manually verified
    HIGH = "high"                    # High confidence (95%+)
    MEDIUM = "medium"                # Medium confidence (70-95%)
    LOW = "low"                      # Low confidence (50-70%)
    INFERRED = "inferred"            # AI/ML inferred relationship
    SUSPECTED = "suspected"          # Potential relationship

class ImpactSeverity(str, Enum):
    """Severity levels for impact assessment"""
    CRITICAL = "critical"            # Mission-critical impact
    HIGH = "high"                    # High business impact
    MEDIUM = "medium"                # Moderate impact
    LOW = "low"                      # Minimal impact
    NONE = "none"                    # No impact

class LineageStatus(str, Enum):
    """Status of lineage relationships"""
    ACTIVE = "active"                # Currently active
    INACTIVE = "inactive"            # No longer active
    DEPRECATED = "deprecated"        # Deprecated but still tracked
    UNKNOWN = "unknown"              # Status unknown
    VALIDATING = "validating"        # Being validated


# ===================== CORE LINEAGE MODELS =====================

class AdvancedDataLineage(SQLModel, table=True):
    """
    Advanced data lineage model with comprehensive tracking capabilities,
    graph analysis, and intelligent relationship management.
    """
    __tablename__ = "advanced_data_lineage"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    lineage_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    
    # Source and Target Information
    source_entity_type: str = Field(index=True)  # table, view, file, api, system, process
    source_entity_id: str = Field(index=True)
    source_entity_name: str = Field(index=True)
    source_system_id: Optional[str] = Field(index=True)
    source_database_name: Optional[str] = None
    source_schema_name: Optional[str] = None
    
    target_entity_type: str = Field(index=True)
    target_entity_id: str = Field(index=True)
    target_entity_name: str = Field(index=True)
    target_system_id: Optional[str] = Field(index=True)
    target_database_name: Optional[str] = None
    target_schema_name: Optional[str] = None
    
    # Lineage Relationship Details
    lineage_type: LineageType
    lineage_direction: LineageDirection
    granularity: LineageGranularity
    confidence_level: LineageConfidence
    confidence_score: float = Field(ge=0.0, le=1.0)
    
    # Transformation Details
    transformation_logic: Optional[str] = None  # SQL, code, description
    transformation_type: Optional[str] = None   # etl, elt, streaming, batch
    business_rules: str = Field(default="[]")   # JSON array of business rules
    data_quality_rules: str = Field(default="[]")  # JSON array of quality rules
    
    # Technical Metadata
    connection_method: Optional[str] = None      # jdbc, api, file, streaming
    execution_frequency: Optional[str] = None    # real-time, hourly, daily, etc.
    average_latency_seconds: Optional[float] = None
    data_volume_mb: Optional[float] = None
    processing_duration_seconds: Optional[float] = None
    
    # Graph Analysis Properties
    graph_depth: int = Field(default=1)          # Depth in lineage graph
    path_length: int = Field(default=1)          # Path length to root
    centrality_score: Optional[float] = None     # Centrality in graph
    importance_score: Optional[float] = None     # Business importance
    complexity_score: Optional[float] = None     # Relationship complexity
    
    # Quality and Validation
    is_validated: bool = Field(default=False)
    validation_method: Optional[str] = None      # manual, automated, ai_inferred
    validation_date: Optional[datetime] = None
    validation_notes: Optional[str] = None
    data_quality_score: Optional[float] = None
    
    # Business Context
    business_process: Optional[str] = None       # Associated business process
    business_criticality: str = "medium"        # low, medium, high, critical
    compliance_requirements: str = Field(default="[]")  # JSON compliance needs
    data_classification: Optional[str] = None   # public, internal, confidential, restricted
    
    # Lifecycle Management
    status: LineageStatus = Field(default=LineageStatus.ACTIVE)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    discovered_at: datetime = Field(default_factory=datetime.utcnow)
    last_verified_at: Optional[datetime] = None
    
    # Discovery and Tracking
    discovery_method: str = "manual"             # manual, scan, ai_discovery, metadata_analysis
    discovered_by: Optional[str] = None
    tracking_enabled: bool = Field(default=True)
    monitoring_frequency: str = "daily"         # real-time, hourly, daily, weekly
    
    # Performance Optimization
    is_cached: bool = Field(default=False)
    cache_key: Optional[str] = None
    cache_expiry: Optional[datetime] = None
    indexed_for_search: bool = Field(default=True)
    
    # Integration Points
    scan_rule_id: Optional[str] = None           # Associated scan rule
    catalog_asset_id: Optional[str] = None       # Associated catalog asset
    classification_id: Optional[str] = None      # Associated classification
    compliance_rule_id: Optional[str] = None     # Associated compliance rule
    
    # Metadata
    tags: str = Field(default="[]")              # JSON array of tags
    custom_properties: str = Field(default="{}")  # JSON custom properties
    notes: Optional[str] = None
    
    # Relationships
    impact_assessments: List["LineageImpactAssessment"] = Relationship(back_populates="lineage")
    quality_metrics: List["LineageQualityMetric"] = Relationship(back_populates="lineage")
    change_events: List["LineageChangeEvent"] = Relationship(back_populates="lineage")


class LineageGraph(SQLModel, table=True):
    """
    Graph representation of data lineage with advanced analytics
    and optimization for complex lineage queries and visualizations.
    """
    __tablename__ = "lineage_graphs"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    graph_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    graph_name: str = Field(index=True)
    
    # Graph Properties
    root_entity_type: str = Field(index=True)    # Starting point entity type
    root_entity_id: str = Field(index=True)      # Starting point entity ID
    max_depth: int = Field(default=10)           # Maximum graph depth
    direction: LineageDirection = Field(default=LineageDirection.BIDIRECTIONAL)
    
    # Graph Statistics
    total_nodes: int = Field(default=0)
    total_edges: int = Field(default=0)
    max_path_length: int = Field(default=0)
    connected_components: int = Field(default=1)
    cyclic_paths: int = Field(default=0)
    
    # Performance Metrics
    computation_time_seconds: Optional[float] = None
    memory_usage_mb: Optional[float] = None
    complexity_score: Optional[float] = None
    visualization_ready: bool = Field(default=False)
    
    # Graph Analysis Results
    critical_paths: str = Field(default="[]")    # JSON array of critical paths
    bottlenecks: str = Field(default="[]")       # JSON array of bottleneck nodes
    key_influencers: str = Field(default="[]")   # JSON array of key nodes
    orphaned_nodes: str = Field(default="[]")    # JSON nodes with no connections
    
    # Centrality Metrics
    degree_centrality: str = Field(default="{}")      # JSON centrality scores
    betweenness_centrality: str = Field(default="{}")  # JSON betweenness scores
    closeness_centrality: str = Field(default="{}")   # JSON closeness scores
    eigenvector_centrality: str = Field(default="{}")  # JSON eigenvector scores
    
    # Business Analytics
    business_impact_score: Optional[float] = None
    data_quality_score: Optional[float] = None
    compliance_coverage: Optional[float] = None
    operational_efficiency: Optional[float] = None
    
    # Graph Storage
    adjacency_matrix: Optional[str] = None       # JSON adjacency matrix for small graphs
    edge_list: str = Field(default="[]")         # JSON edge list
    node_properties: str = Field(default="{}")   # JSON node properties
    graph_layout: str = Field(default="{}")      # JSON layout coordinates
    
    # Caching and Optimization
    is_materialized: bool = Field(default=False)
    materialization_date: Optional[datetime] = None
    refresh_frequency: str = "daily"             # hourly, daily, weekly, on_demand
    next_refresh_due: Optional[datetime] = None
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_computed_at: Optional[datetime] = None
    computation_version: str = Field(default="1.0.0")
    
    # Access and Usage
    access_count: int = Field(default=0)
    last_accessed_at: Optional[datetime] = None
    average_query_time_ms: Optional[float] = None
    
    # Metadata
    description: Optional[str] = None
    created_by: Optional[str] = None
    purpose: Optional[str] = None
    tags: str = Field(default="[]")


class LineageImpactAssessment(SQLModel, table=True):
    """
    Impact assessment model for analyzing the downstream effects
    of changes in data lineage relationships.
    """
    __tablename__ = "lineage_impact_assessments"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    lineage_id: int = Field(foreign_key="advanced_data_lineage.id", index=True)
    
    # Impact Scenario
    scenario_name: str = Field(index=True)
    scenario_description: str
    impact_type: str = Field(index=True)         # schema_change, data_quality, system_outage, etc.
    trigger_entity_type: str                     # What type of entity triggered the assessment
    trigger_entity_id: str = Field(index=True)   # Which entity triggered it
    
    # Impact Analysis
    severity: ImpactSeverity
    scope: str = "local"                         # local, regional, global, enterprise
    affected_entities_count: int = Field(default=0)
    affected_systems_count: int = Field(default=0)
    affected_processes_count: int = Field(default=0)
    
    # Detailed Impact Data
    affected_entities: str = Field(default="[]")      # JSON array of affected entities
    impact_chain: str = Field(default="[]")           # JSON chain of impacts
    mitigation_strategies: str = Field(default="[]")  # JSON mitigation options
    estimated_downtime_hours: Optional[float] = None
    
    # Business Impact
    business_functions_affected: str = Field(default="[]")  # JSON business functions
    revenue_impact_estimate: Optional[float] = None
    customer_impact_level: str = "low"                     # low, medium, high, critical
    compliance_impact: Optional[str] = None
    
    # Risk Assessment
    probability_score: float = Field(ge=0.0, le=1.0)
    risk_score: float = Field(ge=0.0, le=10.0)
    recovery_time_estimate_hours: Optional[float] = None
    contingency_plans: str = Field(default="[]")           # JSON contingency plans
    
    # Validation and Approval
    assessment_status: str = "draft"             # draft, reviewed, approved, rejected
    assessed_by: Optional[str] = None
    reviewed_by: Optional[str] = None
    approved_by: Optional[str] = None
    
    # Analytics
    confidence_level: float = Field(ge=0.0, le=1.0)
    analysis_methodology: str
    supporting_evidence: str = Field(default="{}")  # JSON evidence data
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    
    # Relationships
    lineage: Optional[AdvancedDataLineage] = Relationship(back_populates="impact_assessments")


class LineageQualityMetric(SQLModel, table=True):
    """
    Quality metrics for lineage relationships including accuracy,
    completeness, consistency, and reliability measures.
    """
    __tablename__ = "lineage_quality_metrics"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    metric_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    lineage_id: int = Field(foreign_key="advanced_data_lineage.id", index=True)
    
    # Quality Dimensions
    accuracy_score: float = Field(ge=0.0, le=1.0)        # How accurate is the lineage
    completeness_score: float = Field(ge=0.0, le=1.0)    # How complete is the lineage
    consistency_score: float = Field(ge=0.0, le=1.0)     # How consistent is the lineage
    timeliness_score: float = Field(ge=0.0, le=1.0)      # How up-to-date is the lineage
    reliability_score: float = Field(ge=0.0, le=1.0)     # How reliable is the lineage
    
    # Composite Scores
    overall_quality_score: float = Field(ge=0.0, le=1.0)
    weighted_quality_score: float = Field(ge=0.0, le=1.0)
    business_quality_score: float = Field(ge=0.0, le=1.0)
    technical_quality_score: float = Field(ge=0.0, le=1.0)
    
    # Measurement Details
    measurement_method: str                       # automated, manual, hybrid, ai_based
    measurement_criteria: str = Field(default="{}")  # JSON criteria used
    data_points_analyzed: int = Field(default=0)
    sample_size: int = Field(default=0)
    confidence_interval: Optional[str] = None     # JSON confidence interval
    
    # Temporal Analysis
    trend_direction: Optional[str] = None         # improving, declining, stable
    quality_velocity: Optional[float] = None     # Rate of quality change
    seasonal_patterns: str = Field(default="{}")  # JSON seasonal analysis
    
    # Issue Tracking
    quality_issues_count: int = Field(default=0)
    critical_issues_count: int = Field(default=0)
    resolved_issues_count: int = Field(default=0)
    quality_issues: str = Field(default="[]")     # JSON array of quality issues
    
    # Benchmarking
    industry_benchmark_score: Optional[float] = None
    internal_benchmark_score: Optional[float] = None
    peer_comparison_score: Optional[float] = None
    best_practice_alignment: Optional[float] = None
    
    # Improvement Tracking
    improvement_opportunities: str = Field(default="[]")  # JSON opportunities
    recommended_actions: str = Field(default="[]")        # JSON recommendations
    improvement_target_score: Optional[float] = None
    improvement_timeline_days: Optional[int] = None
    
    # Metadata
    measured_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    measured_by: Optional[str] = None
    measurement_duration_seconds: Optional[float] = None
    next_measurement_due: Optional[datetime] = None
    
    # Relationships
    lineage: Optional[AdvancedDataLineage] = Relationship(back_populates="quality_metrics")


class LineageChangeEvent(SQLModel, table=True):
    """
    Change event tracking for lineage relationships to maintain
    comprehensive audit trails and enable change impact analysis.
    """
    __tablename__ = "lineage_change_events"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    event_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    lineage_id: int = Field(foreign_key="advanced_data_lineage.id", index=True)
    
    # Event Details
    event_type: str = Field(index=True)          # created, updated, deleted, verified, deprecated
    event_category: str = Field(index=True)      # data_change, schema_change, system_change, business_change
    event_description: str
    event_source: str                            # user, system, automated_discovery, ai_inference
    
    # Change Details
    changed_attributes: str = Field(default="[]")     # JSON array of changed attributes
    previous_values: str = Field(default="{}")        # JSON previous values
    new_values: str = Field(default="{}")             # JSON new values
    change_magnitude: str = "minor"                   # minor, moderate, major, critical
    
    # Context and Metadata
    user_id: Optional[str] = Field(index=True)
    session_id: Optional[str] = None
    request_id: Optional[str] = None
    system_context: str = Field(default="{}")         # JSON system context
    business_context: Optional[str] = None
    
    # Impact Assessment
    impact_scope: str = "local"                       # local, regional, global
    downstream_affected: int = Field(default=0)      # Count of downstream entities affected
    upstream_affected: int = Field(default=0)        # Count of upstream entities affected
    systems_impacted: str = Field(default="[]")      # JSON array of impacted systems
    
    # Validation and Approval
    requires_approval: bool = Field(default=False)
    approval_status: str = "not_required"             # not_required, pending, approved, rejected
    approved_by: Optional[str] = None
    approval_timestamp: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    
    # Rollback and Recovery
    is_reversible: bool = Field(default=True)
    rollback_available: bool = Field(default=False)
    rollback_data: Optional[str] = None               # JSON rollback information
    recovery_steps: str = Field(default="[]")         # JSON recovery procedures
    
    # Compliance and Audit
    compliance_reviewed: bool = Field(default=False)
    audit_trail_id: Optional[str] = None
    regulatory_impact: Optional[str] = None
    retention_period_days: int = Field(default=2555)  # 7 years default
    
    # Performance Impact
    performance_impact: Optional[str] = None          # Description of performance impact
    resource_usage_change: Optional[float] = None     # Change in resource usage
    processing_time_change: Optional[float] = None    # Change in processing time
    
    # Lifecycle
    event_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    processed_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    
    # Metadata
    tags: str = Field(default="[]")                   # JSON array of tags
    custom_attributes: str = Field(default="{}")     # JSON custom attributes
    notes: Optional[str] = None
    
    # Relationships
    lineage: Optional[AdvancedDataLineage] = Relationship(back_populates="change_events")


class LineageDiscoveryJob(SQLModel, table=True):
    """
    Automated lineage discovery jobs that continuously scan and
    discover new lineage relationships across the enterprise.
    """
    __tablename__ = "lineage_discovery_jobs"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    job_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    job_name: str = Field(index=True)
    
    # Job Configuration
    discovery_scope: str = Field(default="[]")        # JSON array of scope definitions
    discovery_methods: str = Field(default="[]")      # JSON array of discovery methods
    granularity_levels: str = Field(default="[]")     # JSON array of granularity levels
    confidence_threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    
    # Execution Schedule
    schedule_type: str = "manual"                     # manual, scheduled, triggered, continuous
    schedule_expression: Optional[str] = None         # Cron expression for scheduled jobs
    trigger_conditions: str = Field(default="[]")    # JSON array of trigger conditions
    max_runtime_hours: float = Field(default=24.0)
    
    # Job Status and Progress
    status: str = "pending"                           # pending, running, completed, failed, cancelled
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    current_phase: Optional[str] = None               # Current processing phase
    estimated_completion: Optional[datetime] = None
    
    # Discovery Results
    lineages_discovered: int = Field(default=0)
    lineages_validated: int = Field(default=0)
    lineages_rejected: int = Field(default=0)
    new_entities_found: int = Field(default=0)
    relationships_updated: int = Field(default=0)
    
    # Quality Metrics
    discovery_accuracy: Optional[float] = None
    false_positive_rate: Optional[float] = None
    false_negative_rate: Optional[float] = None
    precision_score: Optional[float] = None
    recall_score: Optional[float] = None
    
    # Performance Metrics
    entities_processed: int = Field(default=0)
    processing_rate_per_hour: Optional[float] = None
    memory_usage_peak_mb: Optional[float] = None
    cpu_usage_average: Optional[float] = None
    
    # Error Handling
    error_count: int = Field(default=0)
    warning_count: int = Field(default=0)
    error_details: str = Field(default="[]")          # JSON array of error details
    retry_count: int = Field(default=0)
    max_retries: int = Field(default=3)
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_heartbeat: Optional[datetime] = None
    
    # Job Output
    output_location: Optional[str] = None             # Storage location for job output
    summary_report: Optional[str] = None              # JSON summary report
    detailed_log: Optional[str] = None                # Path to detailed log file
    
    # Configuration
    created_by: Optional[str] = None
    job_parameters: str = Field(default="{}")         # JSON job parameters
    environment: str = "production"                   # development, staging, production
    
    # Relationships
    discovered_lineages: List["AdvancedDataLineage"] = Relationship()


# ===================== RESPONSE AND REQUEST MODELS =====================

class LineageResponse(BaseModel):
    """Response model for lineage queries"""
    id: int
    lineage_uuid: str
    source_entity_name: str
    target_entity_name: str
    lineage_type: LineageType
    lineage_direction: LineageDirection
    confidence_level: LineageConfidence
    confidence_score: float
    business_criticality: str
    status: LineageStatus
    created_at: datetime


class LineageGraphResponse(BaseModel):
    """Response model for lineage graph queries"""
    id: int
    graph_uuid: str
    graph_name: str
    total_nodes: int
    total_edges: int
    max_depth: int
    business_impact_score: Optional[float]
    visualization_ready: bool
    created_at: datetime


class ImpactAssessmentResponse(BaseModel):
    """Response model for impact assessments"""
    id: int
    assessment_uuid: str
    scenario_name: str
    severity: ImpactSeverity
    affected_entities_count: int
    business_functions_affected: List[str]
    risk_score: float
    estimated_downtime_hours: Optional[float]
    created_at: datetime


class LineageQualityResponse(BaseModel):
    """Response model for lineage quality metrics"""
    id: int
    metric_uuid: str
    overall_quality_score: float
    accuracy_score: float
    completeness_score: float
    consistency_score: float
    quality_issues_count: int
    trend_direction: Optional[str]
    measured_at: datetime


# ===================== REQUEST MODELS =====================

class LineageCreateRequest(BaseModel):
    """Request model for creating lineage relationships"""
    source_entity_type: str
    source_entity_id: str
    source_entity_name: str
    target_entity_type: str
    target_entity_id: str
    target_entity_name: str
    lineage_type: LineageType
    lineage_direction: LineageDirection = LineageDirection.DOWNSTREAM
    transformation_logic: Optional[str] = None
    business_rules: List[str] = []
    confidence_level: LineageConfidence = LineageConfidence.MEDIUM


class LineageGraphRequest(BaseModel):
    """Request model for generating lineage graphs"""
    root_entity_type: str
    root_entity_id: str
    max_depth: int = 5
    direction: LineageDirection = LineageDirection.BIDIRECTIONAL
    include_quality_metrics: bool = True
    include_business_context: bool = True


class ImpactAssessmentRequest(BaseModel):
    """Request model for impact assessments"""
    trigger_entity_type: str
    trigger_entity_id: str
    scenario_name: str
    impact_type: str
    scope: str = "local"
    include_mitigation_strategies: bool = True


class LineageDiscoveryRequest(BaseModel):
    """Request model for lineage discovery jobs"""
    job_name: str
    discovery_scope: List[str]
    discovery_methods: List[str] = ["metadata_analysis", "query_log_analysis"]
    confidence_threshold: float = 0.7
    schedule_type: str = "manual"
    max_runtime_hours: float = 24.0


# ===================== MODEL EXPORTS =====================

__all__ = [
    # Enums
    "LineageDirection", "LineageType", "LineageGranularity", "LineageConfidence",
    "ImpactSeverity", "LineageStatus",
    
    # Core Models
    "AdvancedDataLineage", "LineageGraph", "LineageImpactAssessment",
    "LineageQualityMetric", "LineageChangeEvent", "LineageDiscoveryJob",
    
    # Response Models
    "LineageResponse", "LineageGraphResponse", "ImpactAssessmentResponse",
    "LineageQualityResponse",
    
    # Request Models
    "LineageCreateRequest", "LineageGraphRequest", "ImpactAssessmentRequest",
    "LineageDiscoveryRequest",
]