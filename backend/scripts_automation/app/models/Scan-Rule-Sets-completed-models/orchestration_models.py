from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator
from sqlalchemy import Index, UniqueConstraint, CheckConstraint

# ===================================
# ENUMS AND CONSTANTS
# ===================================

class OrchestrationStatus(str, Enum):
    """Status of orchestration jobs."""
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"
    RETRYING = "retrying"

class JobPriority(str, Enum):
    """Priority levels for orchestration jobs."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    BACKGROUND = "background"

class TriggerType(str, Enum):
    """Types of job triggers."""
    MANUAL = "manual"
    SCHEDULED = "scheduled"
    EVENT_DRIVEN = "event_driven"
    DATA_DRIVEN = "data_driven"
    API_TRIGGERED = "api_triggered"
    WEBHOOK = "webhook"
    DEPENDENCY = "dependency"

class DependencyType(str, Enum):
    """Types of dependencies between jobs."""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    CONDITIONAL = "conditional"
    RESOURCE_BASED = "resource_based"
    DATA_BASED = "data_based"

class ResourceState(str, Enum):
    """State of orchestration resources."""
    AVAILABLE = "available"
    ALLOCATED = "allocated"
    BUSY = "busy"
    MAINTENANCE = "maintenance"
    ERROR = "error"
    OFFLINE = "offline"

class OrchestrationStrategy(str, Enum):
    """Strategies for orchestration execution."""
    FIFO = "fifo"  # First In, First Out
    PRIORITY_BASED = "priority_based"
    RESOURCE_OPTIMIZED = "resource_optimized"
    DEADLINE_AWARE = "deadline_aware"
    COST_OPTIMIZED = "cost_optimized"
    LOAD_BALANCED = "load_balanced"

# ===================================
# ORCHESTRATION JOB MODELS
# ===================================

class OrchestrationJob(SQLModel, table=True):
    """
    Advanced orchestration job with enterprise features.
    """
    __tablename__ = "orchestration_jobs"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    job_name: str = Field(max_length=200, index=True)
    job_description: Optional[str] = Field(default=None, max_length=1000)
    
    # Job Classification
    job_type: str = Field(max_length=100, index=True)
    job_category: str = Field(max_length=100)
    business_process: Optional[str] = Field(default=None, max_length=200)
    
    # Priority and Scheduling
    priority: JobPriority = Field(default=JobPriority.MEDIUM, index=True)
    trigger_type: TriggerType = Field(default=TriggerType.MANUAL)
    schedule_expression: Optional[str] = Field(default=None, max_length=200)  # Cron expression
    timezone: str = Field(default="UTC", max_length=50)
    
    # Execution Configuration
    max_execution_time_minutes: int = Field(default=60, ge=1)
    max_retry_attempts: int = Field(default=3, ge=0)
    retry_delay_seconds: int = Field(default=60, ge=0)
    parallel_execution_allowed: bool = Field(default=False)
    max_parallel_instances: int = Field(default=1, ge=1)
    
    # Resource Requirements
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    preferred_execution_environment: Optional[str] = Field(default=None, max_length=100)
    
    # Workflow Definition
    workflow_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    input_schema: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    output_schema: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Dependencies
    dependent_jobs: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    prerequisite_jobs: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    dependency_logic: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Status and Control
    status: OrchestrationStatus = Field(default=OrchestrationStatus.DRAFT, index=True)
    is_active: bool = Field(default=True)
    is_template: bool = Field(default=False)
    can_run_concurrent: bool = Field(default=False)
    
    # Timing Information
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_executed_at: Optional[datetime] = Field(default=None)
    next_scheduled_at: Optional[datetime] = Field(default=None, index=True)
    
    # Performance Metrics
    total_executions: int = Field(default=0, ge=0)
    successful_executions: int = Field(default=0, ge=0)
    failed_executions: int = Field(default=0, ge=0)
    average_execution_time_seconds: Optional[float] = Field(default=None, ge=0)
    
    # Owner and Metadata
    created_by: str = Field(max_length=100)
    owner_team: Optional[str] = Field(default=None, max_length=100)
    job_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    job_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Notification Settings
    notification_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_on_failure: bool = Field(default=True)
    alert_on_success: bool = Field(default=False)
    alert_on_timeout: bool = Field(default=True)
    
    # Relationships
    executions: List["JobExecution"] = Relationship(back_populates="job")
    dependencies: List["JobDependency"] = Relationship(back_populates="parent_job", foreign_keys="JobDependency.parent_job_id")
    resource_allocations: List["OrchestrationResourceAllocation"] = Relationship(back_populates="job")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_job_type_status", "job_type", "status"),
        Index("idx_job_priority_schedule", "priority", "next_scheduled_at"),
        Index("idx_job_active", "is_active"),
        CheckConstraint("max_parallel_instances >= 1", name="check_max_parallel_positive"),
        CheckConstraint("max_execution_time_minutes > 0", name="check_execution_time_positive"),
    )

class JobExecution(SQLModel, table=True):
    """
    Individual execution instance of an orchestration job.
    """
    __tablename__ = "job_executions"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    job_id: str = Field(foreign_key="orchestration_jobs.job_id", index=True)
    
    # Execution Details
    execution_number: int = Field(ge=1)  # Sequential number for this job
    status: OrchestrationStatus = Field(default=OrchestrationStatus.QUEUED, index=True)
    priority: JobPriority
    
    # Timing Information
    queued_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    execution_time_seconds: Optional[float] = Field(default=None, ge=0)
    
    # Trigger Information
    trigger_type: TriggerType
    triggered_by: str = Field(max_length=100)
    trigger_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Input/Output
    input_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    output_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    execution_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Resource Usage
    allocated_resources: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    actual_resource_usage: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    execution_environment: Optional[str] = Field(default=None, max_length=100)
    execution_node: Optional[str] = Field(default=None, max_length=100)
    
    # Progress Tracking
    progress_percentage: float = Field(default=0, ge=0, le=100)
    current_step: Optional[str] = Field(default=None, max_length=200)
    steps_completed: int = Field(default=0, ge=0)
    total_steps: int = Field(default=0, ge=0)
    
    # Error Handling
    error_message: Optional[str] = Field(default=None, max_length=2000)
    error_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    error_category: Optional[str] = Field(default=None, max_length=100)
    retry_count: int = Field(default=0, ge=0)
    recovery_action: Optional[str] = Field(default=None, max_length=500)
    
    # Performance Metrics
    cpu_usage_percent: Optional[float] = Field(default=None, ge=0, le=100)
    memory_usage_mb: Optional[float] = Field(default=None, ge=0)
    disk_io_operations: Optional[int] = Field(default=None, ge=0)
    network_io_bytes: Optional[int] = Field(default=None, ge=0)
    
    # Quality Metrics
    data_processed_records: Optional[int] = Field(default=None, ge=0)
    data_quality_score: Optional[float] = Field(default=None, ge=0, le=100)
    execution_efficiency: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Relationships
    job: OrchestrationJob = Relationship(back_populates="executions")
    execution_steps: List["ExecutionStep"] = Relationship(back_populates="job_execution")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_execution_job_status", "job_id", "status"),
        Index("idx_execution_timing", "queued_at", "started_at"),
        Index("idx_execution_priority", "priority", "queued_at"),
        UniqueConstraint("job_id", "execution_number", name="uq_job_execution_number"),
        CheckConstraint("progress_percentage >= 0 AND progress_percentage <= 100", name="check_progress_range"),
        CheckConstraint("steps_completed <= total_steps", name="check_steps_logical"),
    )

class ExecutionStep(SQLModel, table=True):
    """
    Individual steps within a job execution.
    """
    __tablename__ = "execution_steps"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    step_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    execution_id: str = Field(foreign_key="job_executions.execution_id", index=True)
    
    # Step Configuration
    step_name: str = Field(max_length=200)
    step_type: str = Field(max_length=100)
    step_order: int = Field(ge=1)
    is_critical: bool = Field(default=False)
    can_retry: bool = Field(default=True)
    max_retry_attempts: int = Field(default=3, ge=0)
    
    # Execution Details
    status: OrchestrationStatus = Field(default=OrchestrationStatus.QUEUED)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    execution_time_seconds: Optional[float] = Field(default=None, ge=0)
    retry_count: int = Field(default=0, ge=0)
    
    # Step Implementation
    step_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    input_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    output_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    step_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Dependencies
    depends_on_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    step_conditions: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Error Handling
    error_message: Optional[str] = Field(default=None, max_length=1000)
    error_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    error_handling_strategy: Optional[str] = Field(default=None, max_length=100)
    
    # Performance
    resource_usage: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    job_execution: JobExecution = Relationship(back_populates="execution_steps")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_step_execution_order", "execution_id", "step_order"),
        Index("idx_step_status", "status"),
        UniqueConstraint("execution_id", "step_order", name="uq_execution_step_order"),
    )

# ===================================
# DEPENDENCY MANAGEMENT
# ===================================

class JobDependency(SQLModel, table=True):
    """
    Dependencies between orchestration jobs.
    """
    __tablename__ = "job_dependencies"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    dependency_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    parent_job_id: str = Field(foreign_key="orchestration_jobs.job_id", index=True)
    dependent_job_id: str = Field(index=True)
    
    # Dependency Configuration
    dependency_type: DependencyType = Field(default=DependencyType.SEQUENTIAL)
    dependency_name: Optional[str] = Field(default=None, max_length=200)
    dependency_description: Optional[str] = Field(default=None, max_length=500)
    
    # Conditions
    dependency_conditions: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    success_criteria: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    failure_handling: str = Field(default="block", max_length=50)  # block, skip, continue
    
    # Timing Constraints
    max_wait_time_minutes: Optional[int] = Field(default=None, ge=0)
    delay_before_trigger_minutes: int = Field(default=0, ge=0)
    
    # Status and Control
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    
    # Relationships
    parent_job: OrchestrationJob = Relationship(back_populates="dependencies")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_dependency_parent_dependent", "parent_job_id", "dependent_job_id"),
        Index("idx_dependency_type", "dependency_type"),
        UniqueConstraint("parent_job_id", "dependent_job_id", name="uq_job_dependency"),
    )

# ===================================
# RESOURCE MANAGEMENT
# ===================================

class OrchestrationResource(SQLModel, table=True):
    """
    Resources available for orchestration.
    """
    __tablename__ = "orchestration_resources"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    resource_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    resource_name: str = Field(max_length=200, index=True)
    resource_type: str = Field(max_length=100, index=True)
    
    # Resource Configuration
    resource_category: str = Field(max_length=100)
    resource_pool: Optional[str] = Field(default=None, max_length=100)
    capacity_units: str = Field(max_length=50)  # cores, GB, connections, etc.
    total_capacity: float = Field(ge=0)
    available_capacity: float = Field(ge=0)
    
    # Location and Environment
    environment: str = Field(max_length=100)
    availability_zone: Optional[str] = Field(default=None, max_length=100)
    physical_location: Optional[str] = Field(default=None, max_length=200)
    network_zone: Optional[str] = Field(default=None, max_length=100)
    
    # Status and Health
    status: ResourceState = Field(default=ResourceState.AVAILABLE, index=True)
    health_score: float = Field(default=100, ge=0, le=100)
    last_health_check: datetime = Field(default_factory=datetime.utcnow)
    uptime_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Performance Metrics
    average_utilization: float = Field(default=0, ge=0, le=100)
    peak_utilization: float = Field(default=0, ge=0, le=100)
    response_time_ms: Optional[float] = Field(default=None, ge=0)
    throughput_units_per_second: Optional[float] = Field(default=None, ge=0)
    
    # Cost Information
    cost_per_unit_per_hour: Optional[float] = Field(default=None, ge=0)
    billing_model: Optional[str] = Field(default=None, max_length=50)
    cost_tags: Optional[Dict[str, str]] = Field(default=None, sa_column=Column(JSON))
    
    # Lifecycle Management
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated_at: datetime = Field(default_factory=datetime.utcnow)
    maintenance_window: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    retirement_date: Optional[datetime] = Field(default=None)
    
    # Configuration
    resource_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    access_policies: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    resource_allocations: List["OrchestrationResourceAllocation"] = Relationship(back_populates="resource")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_resource_type_status", "resource_type", "status"),
        Index("idx_resource_pool", "resource_pool"),
        Index("idx_resource_utilization", "average_utilization"),
        CheckConstraint("available_capacity <= total_capacity", name="check_capacity_logical"),
        CheckConstraint("health_score >= 0 AND health_score <= 100", name="check_health_range"),
    )

class OrchestrationResourceAllocation(SQLModel, table=True):
    """
    Allocation of resources to orchestration jobs.
    """
    __tablename__ = "orchestration_resource_allocations"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    allocation_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    job_id: str = Field(foreign_key="orchestration_jobs.job_id", index=True)
    resource_id: str = Field(foreign_key="orchestration_resources.resource_id", index=True)
    
    # Allocation Details
    allocated_amount: float = Field(ge=0)
    allocated_at: datetime = Field(default_factory=datetime.utcnow)
    released_at: Optional[datetime] = Field(default=None)
    allocation_duration_seconds: Optional[float] = Field(default=None, ge=0)
    
    # Usage Tracking
    actual_usage: float = Field(default=0, ge=0)
    peak_usage: float = Field(default=0, ge=0)
    utilization_efficiency: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Status and Management
    allocation_status: str = Field(default="active", max_length=50)
    priority: JobPriority = Field(default=JobPriority.MEDIUM)
    can_preempt: bool = Field(default=False)
    
    # Cost Tracking
    cost_incurred: Optional[float] = Field(default=None, ge=0)
    cost_rate: Optional[float] = Field(default=None, ge=0)
    billing_start_time: Optional[datetime] = Field(default=None)
    billing_end_time: Optional[datetime] = Field(default=None)
    
    # Metadata
    allocation_reason: str = Field(max_length=500)
    allocated_by: str = Field(max_length=100)
    allocation_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    job: OrchestrationJob = Relationship(back_populates="resource_allocations")
    resource: OrchestrationResource = Relationship(back_populates="resource_allocations")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_allocation_job_resource", "job_id", "resource_id"),
        Index("idx_allocation_status", "allocation_status"),
        Index("idx_allocation_timing", "allocated_at", "released_at"),
    )

# ===================================
# WORKFLOW MANAGEMENT
# ===================================

class WorkflowTemplate(SQLModel, table=True):
    """
    Reusable workflow templates for orchestration.
    """
    __tablename__ = "workflow_templates"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    template_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    template_name: str = Field(max_length=200, index=True)
    template_description: Optional[str] = Field(default=None, max_length=1000)
    
    # Template Classification
    template_category: str = Field(max_length=100)
    template_type: str = Field(max_length=100)
    business_domain: Optional[str] = Field(default=None, max_length=100)
    use_case: str = Field(max_length=200)
    
    # Template Definition
    workflow_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    step_definitions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    parameter_schema: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    default_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Requirements and Constraints
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    execution_constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Template Metadata
    version: str = Field(max_length=50)
    is_active: bool = Field(default=True)
    is_approved: bool = Field(default=False)
    complexity_level: str = Field(max_length=50)  # simple, moderate, complex, expert
    
    # Usage Statistics
    usage_count: int = Field(default=0, ge=0)
    success_rate_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    average_execution_time_minutes: Optional[float] = Field(default=None, ge=0)
    
    # Lifecycle Management
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    approved_by: Optional[str] = Field(default=None, max_length=100)
    approved_at: Optional[datetime] = Field(default=None)
    
    # Documentation
    documentation: Optional[Text] = Field(default=None)
    example_usage: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    best_practices: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    known_limitations: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    # Template Tags and Organization
    template_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    template_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_template_category_type", "template_category", "template_type"),
        Index("idx_template_active", "is_active"),
        Index("idx_template_usage", "usage_count"),
    )

# ===================================
# ORCHESTRATION STRATEGY
# ===================================

class OrchestrationStrategy(SQLModel, table=True):
    """
    Strategies for orchestration execution and optimization.
    """
    __tablename__ = "orchestration_strategies"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    strategy_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    strategy_name: str = Field(max_length=200, index=True)
    strategy_description: Optional[str] = Field(default=None, max_length=1000)
    
    # Strategy Configuration
    strategy_type: str = Field(max_length=100)  # scheduling, resource_allocation, load_balancing
    execution_strategy: str = Field(max_length=100)  # fifo, priority, round_robin, etc.
    optimization_goals: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Strategy Rules
    strategy_rules: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    conditions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance Metrics
    effectiveness_score: Optional[float] = Field(default=None, ge=0, le=100)
    resource_efficiency: Optional[float] = Field(default=None, ge=0, le=100)
    cost_efficiency: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Application Context
    applicable_job_types: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    applicable_environments: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    workload_patterns: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Status and Control
    is_active: bool = Field(default=True)
    is_default: bool = Field(default=False)
    priority: int = Field(default=100, ge=1)
    
    # Lifecycle Management
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    
    # Usage and Performance
    times_applied: int = Field(default=0, ge=0)
    success_rate: Optional[float] = Field(default=None, ge=0, le=100)
    average_improvement: Optional[float] = Field(default=None)
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_strategy_type_active", "strategy_type", "is_active"),
        Index("idx_strategy_effectiveness", "effectiveness_score"),
    )

# ===================================
# REQUEST/RESPONSE MODELS
# ===================================

class OrchestrationJobRequest(BaseModel):
    """Request model for creating orchestration jobs."""
    job_name: str
    job_description: Optional[str] = None
    job_type: str
    priority: JobPriority = JobPriority.MEDIUM
    trigger_type: TriggerType = TriggerType.MANUAL
    schedule_expression: Optional[str] = None
    workflow_definition: Dict[str, Any]
    resource_requirements: Optional[Dict[str, Any]] = None
    input_parameters: Optional[Dict[str, Any]] = None
    notification_settings: Optional[Dict[str, Any]] = None
    
    @validator('job_name')
    def validate_job_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Job name cannot be empty")
        return v.strip()

class OrchestrationJobResponse(BaseModel):
    """Response model for orchestration job operations."""
    job_id: str
    job_name: str
    status: OrchestrationStatus
    priority: JobPriority
    next_scheduled_at: Optional[datetime] = None
    created_at: datetime
    message: str

class JobExecutionRequest(BaseModel):
    """Request model for executing a job."""
    job_id: str
    trigger_type: TriggerType = TriggerType.MANUAL
    priority_override: Optional[JobPriority] = None
    input_parameters: Optional[Dict[str, Any]] = None
    resource_overrides: Optional[Dict[str, Any]] = None
    execution_context: Optional[Dict[str, Any]] = None

class JobExecutionStatusResponse(BaseModel):
    """Response model for job execution status."""
    execution_id: str
    job_id: str
    status: OrchestrationStatus
    progress_percentage: float
    current_step: Optional[str] = None
    started_at: Optional[datetime] = None
    estimated_completion_time: Optional[datetime] = None
    resource_usage: Dict[str, Any]
    error_message: Optional[str] = None

class WorkflowTemplateRequest(BaseModel):
    """Request model for creating workflow templates."""
    template_name: str
    template_description: Optional[str] = None
    template_category: str
    template_type: str
    workflow_definition: Dict[str, Any]
    parameter_schema: Dict[str, Any]
    resource_requirements: Optional[Dict[str, Any]] = None

class ResourceAllocationRequest(BaseModel):
    """Request model for resource allocation."""
    job_id: str
    resource_type: str
    required_amount: float
    priority: JobPriority = JobPriority.MEDIUM
    duration_hours: Optional[int] = None
    allocation_constraints: Optional[Dict[str, Any]] = None

class OrchestrationMetrics(BaseModel):
    """Model for orchestration performance metrics."""
    total_jobs: int
    active_jobs: int
    completed_jobs_today: int
    failed_jobs_today: int
    average_execution_time_minutes: float
    resource_utilization_percentage: float
    success_rate_percentage: float
    queue_length: int
    system_health_score: float