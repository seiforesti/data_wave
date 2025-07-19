from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class ScanType(str, Enum):
    FULL = "full"
    INCREMENTAL = "incremental"
    SAMPLE = "sample"
    TARGETED = "targeted"
    COMPLIANCE = "compliance"
    SECURITY = "security"


class ScanStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"


class ScanTriggerType(str, Enum):
    MANUAL = "manual"
    SCHEDULED = "scheduled"
    API = "api"
    EVENT = "event"
    WORKFLOW = "workflow"


class IssueSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class IssueType(str, Enum):
    DATA_QUALITY = "data_quality"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    PERFORMANCE = "performance"
    GOVERNANCE = "governance"
    PRIVACY = "privacy"
    ACCESS_CONTROL = "access_control"


class EntityType(str, Enum):
    DATABASE = "database"
    SCHEMA = "schema"
    TABLE = "table"
    VIEW = "view"
    COLUMN = "column"
    INDEX = "index"
    PROCEDURE = "procedure"
    FUNCTION = "function"


class ScanConfiguration(SQLModel, table=True):
    """Scan configuration model for defining scan parameters"""
    __tablename__ = "scan_configurations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    
    # Data source association
    data_source_id: int = Field(foreign_key="data_sources.id", index=True)
    
    # Scan configuration
    scan_type: ScanType = Field(default=ScanType.FULL)
    scope: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Scan settings
    settings: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Scheduling
    schedule_enabled: bool = Field(default=False)
    schedule_cron: Optional[str] = None
    schedule_timezone: str = Field(default="UTC")
    
    # Status and metadata
    status: str = Field(default="active")  # active, inactive, draft
    priority: int = Field(default=5)  # 1-10, higher is more important
    
    # Audit fields
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    updated_by: Optional[str] = None
    
    # Relationships
    scan_runs: List["ScanRun"] = Relationship(back_populates="configuration")
    scan_schedules: List["ScanSchedule"] = Relationship(back_populates="configuration")


class ScanRun(SQLModel, table=True):
    """Scan run model for tracking individual scan executions"""
    __tablename__ = "scan_runs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_config_id: int = Field(foreign_key="scan_configurations.id", index=True)
    
    # Run identification
    run_id: str = Field(unique=True, index=True)
    name: str
    
    # Execution details
    status: ScanStatus = Field(default=ScanStatus.PENDING)
    trigger_type: ScanTriggerType = Field(default=ScanTriggerType.MANUAL)
    
    # Timing
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Progress tracking
    progress_percentage: float = Field(default=0.0)
    entities_scanned: int = Field(default=0)
    entities_total: int = Field(default=0)
    
    # Results summary
    issues_found: int = Field(default=0)
    entities_discovered: int = Field(default=0)
    classifications_applied: int = Field(default=0)
    pii_detected: int = Field(default=0)
    
    # Configuration snapshot
    scan_config_snapshot: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Error handling
    error_message: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Audit fields
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    configuration: ScanConfiguration = Relationship(back_populates="scan_runs")
    scan_logs: List["ScanLog"] = Relationship(back_populates="scan_run")
    scan_results: List["ScanResult"] = Relationship(back_populates="scan_run")
    discovered_entities: List["DiscoveredEntity"] = Relationship(back_populates="scan_run")
    scan_issues: List["ScanIssue"] = Relationship(back_populates="scan_run")


class ScanLog(SQLModel, table=True):
    """Scan log model for tracking scan execution logs"""
    __tablename__ = "scan_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_run_id: int = Field(foreign_key="scan_runs.id", index=True)
    
    # Log details
    timestamp: datetime = Field(default_factory=datetime.now)
    level: str = Field(index=True)  # info, warning, error, debug
    message: str
    details: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Context
    entity_name: Optional[str] = None
    entity_type: Optional[str] = None
    step_name: Optional[str] = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    scan_run: ScanRun = Relationship(back_populates="scan_logs")


class ScanResult(SQLModel, table=True):
    """Scan result model for storing scan execution results"""
    __tablename__ = "scan_results"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_run_id: int = Field(foreign_key="scan_runs.id", index=True)
    
    # Result summary
    summary: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Detailed results
    entities_summary: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    issues_summary: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    classifications_summary: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    quality_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Performance metrics
    performance_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Recommendations
    recommendations: List[Dict[str, Any]] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    scan_run: ScanRun = Relationship(back_populates="scan_results")


class DiscoveredEntity(SQLModel, table=True):
    """Discovered entity model for storing entities found during scans"""
    __tablename__ = "discovered_entities"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_run_id: int = Field(foreign_key="scan_runs.id", index=True)
    
    # Entity identification
    entity_id: str = Field(index=True)
    name: str = Field(index=True)
    type: EntityType = Field(index=True)
    path: str = Field(index=True)
    
    # Entity details
    data_source: str
    schema_name: Optional[str] = None
    table_name: Optional[str] = None
    column_name: Optional[str] = None
    
    # Technical details
    data_type: Optional[str] = None
    nullable: Optional[bool] = None
    primary_key: Optional[bool] = None
    foreign_key: Optional[bool] = None
    unique: Optional[bool] = None
    
    # Metadata
    row_count: Optional[int] = None
    size_bytes: Optional[int] = None
    last_modified: Optional[datetime] = None
    description: Optional[str] = None
    
    # Classification and tags
    classifications: List[str] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    pii_tags: List[str] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    custom_tags: List[str] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    
    # Quality metrics
    quality_score: float = Field(default=0.0)
    completeness_score: float = Field(default=0.0)
    accuracy_score: float = Field(default=0.0)
    consistency_score: float = Field(default=0.0)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    scan_run: ScanRun = Relationship(back_populates="discovered_entities")
    scan_issues: List["ScanIssue"] = Relationship(back_populates="entity")


class ScanIssue(SQLModel, table=True):
    """Scan issue model for storing issues found during scans"""
    __tablename__ = "scan_issues"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_run_id: int = Field(foreign_key="scan_runs.id", index=True)
    entity_id: Optional[int] = Field(default=None, foreign_key="discovered_entities.id", index=True)
    
    # Issue details
    severity: IssueSeverity = Field(index=True)
    type: IssueType = Field(index=True)
    title: str
    description: str
    
    # Issue context
    entity_name: Optional[str] = None
    entity_type: Optional[str] = None
    entity_path: Optional[str] = None
    
    # Issue metadata
    recommendation: Optional[str] = None
    impact: Optional[str] = None
    effort: Optional[str] = None
    
    # Status tracking
    status: str = Field(default="open", index=True)  # open, resolved, ignored, in_progress
    assigned_to: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    
    # Additional details
    details: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    scan_run: ScanRun = Relationship(back_populates="scan_issues")
    entity: Optional[DiscoveredEntity] = Relationship(back_populates="scan_issues")


class ScanSchedule(SQLModel, table=True):
    """Scan schedule model for managing scheduled scans"""
    __tablename__ = "scan_schedules"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_config_id: int = Field(foreign_key="scan_configurations.id", index=True)
    
    # Schedule details
    name: str
    description: Optional[str] = None
    
    # Scheduling configuration
    cron_expression: str
    timezone: str = Field(default="UTC")
    is_enabled: bool = Field(default=True, index=True)
    
    # Execution tracking
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    run_count: int = Field(default=0)
    
    # Status
    status: str = Field(default="active", index=True)  # active, paused, disabled
    
    # Configuration
    schedule_config: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Audit fields
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    updated_by: Optional[str] = None
    
    # Relationships
    configuration: ScanConfiguration = Relationship(back_populates="scan_schedules")


class ScanAnalytics(SQLModel, table=True):
    """Scan analytics model for storing aggregated scan metrics"""
    __tablename__ = "scan_analytics"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Analytics period
    date: datetime = Field(index=True)
    period: str = Field(index=True)  # daily, weekly, monthly
    
    # Scan metrics
    total_scans: int = Field(default=0)
    successful_scans: int = Field(default=0)
    failed_scans: int = Field(default=0)
    cancelled_scans: int = Field(default=0)
    
    # Entity metrics
    total_entities_scanned: int = Field(default=0)
    new_entities_discovered: int = Field(default=0)
    updated_entities: int = Field(default=0)
    
    # Issue metrics
    total_issues_found: int = Field(default=0)
    critical_issues: int = Field(default=0)
    high_issues: int = Field(default=0)
    medium_issues: int = Field(default=0)
    low_issues: int = Field(default=0)
    
    # Performance metrics
    avg_scan_duration: float = Field(default=0.0)
    total_scan_time: float = Field(default=0.0)
    
    # Quality metrics
    avg_quality_score: float = Field(default=0.0)
    compliance_rate: float = Field(default=0.0)
    
    # Analytics data
    metrics_data: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# Response Models
class ScanConfigurationResponse(SQLModel):
    id: int
    name: str
    description: Optional[str]
    data_source_id: int
    scan_type: ScanType
    scope: Dict[str, Any]
    settings: Dict[str, Any]
    schedule_enabled: bool
    schedule_cron: Optional[str]
    schedule_timezone: str
    status: str
    priority: int
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime


class ScanRunResponse(SQLModel):
    id: int
    scan_config_id: int
    run_id: str
    name: str
    status: ScanStatus
    trigger_type: ScanTriggerType
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    progress_percentage: float
    entities_scanned: int
    entities_total: int
    issues_found: int
    entities_discovered: int
    classifications_applied: int
    pii_detected: int
    error_message: Optional[str]
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime


class ScanLogResponse(SQLModel):
    id: int
    scan_run_id: int
    timestamp: datetime
    level: str
    message: str
    details: Optional[Dict[str, Any]]
    entity_name: Optional[str]
    entity_type: Optional[str]
    step_name: Optional[str]
    created_at: datetime


class ScanResultResponse(SQLModel):
    id: int
    scan_run_id: int
    summary: Dict[str, Any]
    entities_summary: Dict[str, Any]
    issues_summary: Dict[str, Any]
    classifications_summary: Dict[str, Any]
    quality_metrics: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


class DiscoveredEntityResponse(SQLModel):
    id: int
    scan_run_id: int
    entity_id: str
    name: str
    type: EntityType
    path: str
    data_source: str
    schema_name: Optional[str]
    table_name: Optional[str]
    column_name: Optional[str]
    data_type: Optional[str]
    nullable: Optional[bool]
    primary_key: Optional[bool]
    foreign_key: Optional[bool]
    unique: Optional[bool]
    row_count: Optional[int]
    size_bytes: Optional[int]
    last_modified: Optional[datetime]
    description: Optional[str]
    classifications: List[str]
    pii_tags: List[str]
    custom_tags: List[str]
    quality_score: float
    completeness_score: float
    accuracy_score: float
    consistency_score: float
    created_at: datetime
    updated_at: datetime


class ScanIssueResponse(SQLModel):
    id: int
    scan_run_id: int
    entity_id: Optional[int]
    severity: IssueSeverity
    type: IssueType
    title: str
    description: str
    entity_name: Optional[str]
    entity_type: Optional[str]
    entity_path: Optional[str]
    recommendation: Optional[str]
    impact: Optional[str]
    effort: Optional[str]
    status: str
    assigned_to: Optional[str]
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]
    details: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


class ScanScheduleResponse(SQLModel):
    id: int
    scan_config_id: int
    name: str
    description: Optional[str]
    cron_expression: str
    timezone: str
    is_enabled: bool
    last_run: Optional[datetime]
    next_run: Optional[datetime]
    run_count: int
    status: str
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime


class ScanAnalyticsResponse(SQLModel):
    id: int
    date: datetime
    period: str
    total_scans: int
    successful_scans: int
    failed_scans: int
    cancelled_scans: int
    total_entities_scanned: int
    new_entities_discovered: int
    updated_entities: int
    total_issues_found: int
    critical_issues: int
    high_issues: int
    medium_issues: int
    low_issues: int
    avg_scan_duration: float
    total_scan_time: float
    avg_quality_score: float
    compliance_rate: float
    metrics_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime