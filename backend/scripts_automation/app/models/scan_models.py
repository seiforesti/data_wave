from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


class DataSourceType(str, Enum):
    """Supported data source types."""
    MYSQL = "mysql"
    POSTGRESQL = "postgresql"
    MONGODB = "mongodb"
    SNOWFLAKE = "snowflake"
    S3 = "s3"
    REDIS = "redis"


class CloudProvider(str, Enum):
    """Cloud provider types."""
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"


class DataSourceStatus(str, Enum):
    """Status of the data source."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"
    SYNCING = "syncing"
    MAINTENANCE = "maintenance"


class Environment(str, Enum):
    """Environment type for the data source."""
    PRODUCTION = "production"
    STAGING = "staging"
    DEVELOPMENT = "development"
    TEST = "test"


class Criticality(str, Enum):
    """Criticality level of the data source."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class DataClassification(str, Enum):
    """Data classification level."""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


class ScanFrequency(str, Enum):
    """Frequency of automated scans."""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class DataSourceLocation(str, Enum):
    """Location type for the data source."""
    ON_PREM = "on_prem"
    CLOUD = "cloud"
    HYBRID = "hybrid"


class ScanStatus(str, Enum):
    """Status of a scan operation."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DiscoveryStatus(str, Enum):
    """Status of a discovery operation."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DataSource(SQLModel, table=True):
    """Enhanced model for registered data sources."""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    source_type: DataSourceType
    location: DataSourceLocation
    host: str
    port: int
    username: str
    # Password is stored as a reference to a secret manager
    password_secret: str
    # Secret manager type (local, vault, aws, azure)
    secret_manager_type: Optional[str] = Field(default="local")
    # Whether to use encryption for sensitive data
    use_encryption: bool = Field(default=False)
    database_name: Optional[str] = None
    
    # Enhanced cloud and hybrid configuration
    cloud_provider: Optional[CloudProvider] = None
    cloud_config: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    replica_config: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    ssl_config: Optional[Dict[str, str]] = Field(default=None, sa_column=Column(JSON))
    
    # Connection pool settings
    pool_size: Optional[int] = Field(default=5)
    max_overflow: Optional[int] = Field(default=10)
    pool_timeout: Optional[int] = Field(default=30)
    
    # Existing connection properties
    connection_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
        # Additional type-specific properties
    additional_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    class Config:
        schema_extra = {
            "example": {
                "cloud_config": {
                    "azure": {
                        "tenant_id": "your-tenant-id",
                        "client_id": "your-client-id",
                        "client_secret": "your-client-secret",
                        "use_managed_identity": True,
                        "ssl_ca": "path/to/ca.pem",
                        "ssl_cert": "path/to/cert.pem",
                        "ssl_key": "path/to/key.pem"
                    },
                    "aws": {
                        "access_key_id": "your-access-key",
                        "secret_access_key": "your-secret-key",
                        "region": "us-east-1",
                        "use_iam_auth": True
                    }
                },
                "replica_config": {
                    "replica_host": "replica.example.com",
                    "replica_port": 5432,
                    "replica_set": "rs0",
                    "replica_members": [
                        "replica1.example.com:27017",
                        "replica2.example.com:27017"
                    ]
                },
                "ssl_config": {
                    "ssl_ca": "path/to/ca.pem",
                    "ssl_cert": "path/to/cert.pem",
                    "ssl_key": "path/to/key.pem"
                }
            }
        } 
    # Enhanced fields for advanced UI
    status: DataSourceStatus = Field(default=DataSourceStatus.PENDING)
    environment: Optional[Environment] = None
    criticality: Optional[Criticality] = Field(default=Criticality.MEDIUM)
    data_classification: Optional[DataClassification] = Field(default=DataClassification.INTERNAL)
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    owner: Optional[str] = None
    team: Optional[str] = None
    
    # Operational fields
    backup_enabled: bool = Field(default=False)
    monitoring_enabled: bool = Field(default=False)
    encryption_enabled: bool = Field(default=False)
    scan_frequency: Optional[ScanFrequency] = Field(default=ScanFrequency.WEEKLY)
    
    # Performance metrics (updated by background tasks)
    health_score: Optional[int] = Field(default=None, ge=0, le=100)
    compliance_score: Optional[int] = Field(default=None, ge=0, le=100)
    entity_count: Optional[int] = Field(default=0)
    size_gb: Optional[float] = Field(default=0.0)
    avg_response_time: Optional[int] = Field(default=None)  # in ms
    error_rate: Optional[float] = Field(default=0.0)
    uptime_percentage: Optional[float] = Field(default=100.0)
    connection_pool_size: Optional[int] = Field(default=10)
    active_connections: Optional[int] = Field(default=0)
    queries_per_second: Optional[int] = Field(default=0)
    storage_used_percentage: Optional[float] = Field(default=0.0)
    cost_per_month: Optional[float] = Field(default=0.0)
    
    # Timestamp fields
    last_scan: Optional[datetime] = None
    next_scan: Optional[datetime] = None
    last_backup: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    scans: List["Scan"] = Relationship(back_populates="data_source")
    scan_rule_sets: List["ScanRuleSet"] = Relationship(back_populates="data_source")
    discovery_history: List["DiscoveryHistory"] = Relationship(back_populates="data_source")
    
    # **NEW: Compliance Relationships**
    compliance_requirements: List["ComplianceRequirement"] = Relationship(back_populates="data_source")
    compliance_assessments: List["ComplianceAssessment"] = Relationship(back_populates="data_source")
    compliance_rules: List["ComplianceRule"] = Relationship(
        back_populates="data_sources",
        link_table="compliance_rule_data_source_link"
    )

    def get_connection_uri(self) -> str:
        """Generate connection URI based on source type and location."""
        base_uri = ""
        if self.source_type == DataSourceType.MYSQL:
            base_uri = f"mysql+pymysql://{self.username}:{self.password_secret}@{self.host}:{self.port}/{self.database_name or ''}"
        elif self.source_type == DataSourceType.POSTGRESQL:
            base_uri = f"postgresql+psycopg2://{self.username}:{self.password_secret}@{self.host}:{self.port}/{self.database_name or ''}"
        elif self.source_type == DataSourceType.MONGODB:
            if self.location == DataSourceLocation.HYBRID and self.replica_config:
                # Handle replica set configuration
                hosts = [f"{self.host}:{self.port}"]
                if replica_members := self.replica_config.get("replica_members"):
                    hosts.extend(replica_members)
                hosts_str = ",".join(hosts)
                replica_set = self.replica_config.get("replica_set")
                base_uri = f"mongodb://{self.username}:{self.password_secret}@{hosts_str}/{self.database_name or ''}?replicaSet={replica_set}"
            else:
                base_uri = f"mongodb://{self.username}:{self.password_secret}@{self.host}:{self.port}/{self.database_name or ''}"
        else:
            raise ValueError(f"Unsupported data source type: {self.source_type}")

        # Add SSL configuration if present
        if self.ssl_config and self.location in [DataSourceLocation.CLOUD, DataSourceLocation.HYBRID]:
            ssl_params = []
            if ca_path := self.ssl_config.get("ssl_ca"):
                ssl_params.append(f"sslca={ca_path}")
            if cert_path := self.ssl_config.get("ssl_cert"):
                ssl_params.append(f"sslcert={cert_path}")
            if key_path := self.ssl_config.get("ssl_key"):
                ssl_params.append(f"sslkey={key_path}")
            
            if ssl_params:
                separator = "?" if "?" not in base_uri else "&"
                base_uri = f"{base_uri}{separator}{'&'.join(ssl_params)}"

        return base_uri


class DiscoveryHistory(SQLModel, table=True):
    """Model for tracking schema discovery operations."""
    id: Optional[int] = Field(default=None, primary_key=True)
    discovery_id: str = Field(index=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    status: DiscoveryStatus = Field(default=DiscoveryStatus.PENDING, index=True)
    discovery_time: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    tables_discovered: Optional[int] = None
    columns_discovered: Optional[int] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    triggered_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    discovery_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    # Relationships
    data_source: DataSource = Relationship(back_populates="discovery_history")


class ScanRuleSet(SQLModel, table=True):
    """Model for scan rule sets that define what to include/exclude during scans."""
    __tablename__ = "scan_rule_sets"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    data_source_id: Optional[int] = Field(default=None, foreign_key="datasource.id")
    include_schemas: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    exclude_schemas: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    include_tables: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    exclude_tables: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    include_columns: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    exclude_columns: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    sample_data: bool = Field(default=False)  # Whether to sample actual data or just metadata
    sample_size: Optional[int] = Field(default=100)  # Number of rows to sample if sample_data is True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    data_source: Optional[DataSource] = Relationship(back_populates="scan_rule_sets")
    scans: List["Scan"] = Relationship(back_populates="scan_rule_set")
    
    # **INTERCONNECTED: Compliance Relationships**
    compliance_rules: List["ComplianceRule"] = Relationship(back_populates="scan_rule_set")


class Scan(SQLModel, table=True):
    """Model for scan operations"""
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_id: str = Field(unique=True)
    name: str
    description: Optional[str] = None
    data_source_id: int = Field(foreign_key="datasource.id")
    scan_rule_set_id: Optional[int] = Field(foreign_key="scanruleset.id")
    status: ScanStatus = Field(default=ScanStatus.PENDING)
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    
    # Relationships
    data_source: DataSource = Relationship(back_populates="scans")
    scan_rule_set: Optional[ScanRuleSet] = Relationship(back_populates="scans")
    scan_results: List["ScanResult"] = Relationship(back_populates="scan")


class ScanResult(SQLModel, table=True):
    """Model for storing scan results."""
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_id: int = Field(foreign_key="scan.id", index=True)
    schema_name: str
    table_name: str
    column_name: Optional[str] = None
    object_type: str = Field(default="table")  # table, view, stored_procedure
    classification_labels: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    sensitivity_level: Optional[str] = None
    compliance_issues: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    data_type: Optional[str] = None
    nullable: Optional[bool] = None
    scan_metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    scan: Scan = Relationship(back_populates="results")


class CustomScanRuleBase(SQLModel):
    """Base model for custom scan rules."""
    name: str = Field(index=True)
    description: Optional[str] = None
    expression: str  # The rule logic/expression
    is_active: bool = Field(default=True)
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class CustomScanRule(CustomScanRuleBase, table=True):
    """DB model for custom scan rules."""
    id: Optional[int] = Field(default=None, primary_key=True)

class CustomScanRuleCreate(CustomScanRuleBase):
    """Schema for creating a custom scan rule."""
    pass

class CustomScanRuleUpdate(SQLModel):
    """Schema for updating a custom scan rule."""
    name: Optional[str] = None
    description: Optional[str] = None
    expression: Optional[str] = None
    is_active: Optional[bool] = None
    tags: Optional[List[str]] = None
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class ScanSchedule(SQLModel, table=True):
    """Model for scheduling recurring scans."""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    data_source_id: int = Field(foreign_key="datasource.id")
    scan_rule_set_id: int = Field(foreign_key="scanruleset.id")
    cron_expression: str  # Cron expression for scheduling
    enabled: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None

    # Enhanced response models
class DataSourceHealthResponse(SQLModel, table=True):
    status: str  # healthy, warning, critical
    last_checked: datetime
    latency_ms: Optional[int] = None
    error_message: Optional[str] = None
    recommendations: Optional[List[str]] = None
    issues: Optional[List[Dict[str, Any]]] = None

class DataSourceStatsResponse(SQLModel, table=True):
    entity_stats: Dict[str, Any]
    size_stats: Dict[str, Any]
    last_scan_time: Optional[datetime] = None
    classification_stats: Optional[Dict[str, Any]] = None
    sensitivity_stats: Optional[Dict[str, Any]] = None
    compliance_stats: Optional[Dict[str, Any]] = None
    performance_stats: Optional[Dict[str, Any]] = None
    quality_stats: Optional[Dict[str, Any]] = None

"""Add workspace models"""

class UserWorkspace(SQLModel, table=True):
    """Model for user workspaces"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    data_source_id: int = Field(foreign_key="datasource.id")
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WorkspaceItem(SQLModel, table=True):
    """Model for items in a workspace"""
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="userworkspace.id")
    item_type: str
    item_path: str
    metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

class WorkspacePreference(SQLModel, table=True):
    """Model for workspace preferences"""
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="userworkspace.id")
    preference_key: str
    preference_value: str

"""Add discovery history and workspace models"""

class UserFavorite(SQLModel, table=True):
    """Model for user-specific data source favorites."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QualityMetric(SQLModel, table=True):
    """Model for tracking data quality metrics."""
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    metric_type: str = Field(index=True)  # e.g., completeness, accuracy, consistency
    metric_value: float
    sample_size: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

class GrowthMetric(SQLModel, table=True):
    """Model for tracking data source growth over time."""
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    size_bytes: int
    record_count: int
    measured_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    growth_rate_bytes: Optional[float] = None  # bytes per day
    growth_rate_records: Optional[float] = None  # records per day

    