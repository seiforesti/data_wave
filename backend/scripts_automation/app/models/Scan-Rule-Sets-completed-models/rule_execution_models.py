"""
🔧 Advanced Rule Execution Models for Scan-Rule-Sets Group
===========================================================

This module defines comprehensive models for rule execution, validation, 
performance tracking, and orchestration management within the enterprise 
data governance system.

Key Features:
- Rule execution history and tracking
- Real-time performance monitoring
- Comprehensive validation framework
- Resource allocation and management
- Orchestration job management
- Execution pipeline definitions
- Pattern recognition and analysis
- Anomaly detection results
"""

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

class ExecutionStatus(str, Enum):
    """Execution status for rule workflows."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"
    RETRYING = "retrying"
    TIMEOUT = "timeout"
    SKIPPED = "skipped"

class ExecutionPriority(str, Enum):
    """Priority levels for rule execution."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    BACKGROUND = "background"

class ResourceType(str, Enum):
    """Types of resources for execution."""
    CPU = "cpu"
    MEMORY = "memory"
    STORAGE = "storage"
    NETWORK = "network"
    GPU = "gpu"
    DATABASE_CONNECTIONS = "database_connections"

class WorkflowType(str, Enum):
    """Types of workflow execution."""
    BATCH = "batch"
    STREAMING = "streaming"
    REAL_TIME = "real_time"
    SCHEDULED = "scheduled"
    TRIGGER_BASED = "trigger_based"
    HYBRID = "hybrid"

class FailureRecoveryStrategy(str, Enum):
    """Failure recovery strategies."""
    RETRY = "retry"
    SKIP = "skip"
    ROLLBACK = "rollback"
    MANUAL_INTERVENTION = "manual_intervention"
    ALTERNATIVE_PATH = "alternative_path"
    GRACEFUL_DEGRADATION = "graceful_degradation"

# ===================================
# CORE EXECUTION MODELS
# ===================================

class RuleExecutionWorkflow(SQLModel, table=True):
    """
    Advanced workflow model for rule execution orchestration.
    """
    __tablename__ = "rule_execution_workflows"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    name: str = Field(max_length=200, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    
    # Workflow Configuration
    workflow_type: WorkflowType
    execution_strategy: str = Field(max_length=100)  # sequential, parallel, hybrid
    max_parallel_executions: int = Field(default=5, ge=1, le=100)
    timeout_minutes: int = Field(default=60, ge=1, le=1440)
    retry_attempts: int = Field(default=3, ge=0, le=10)
    failure_recovery_strategy: FailureRecoveryStrategy
    
    # Priority and Scheduling
    priority: ExecutionPriority = Field(default=ExecutionPriority.MEDIUM)
    schedule_expression: Optional[str] = Field(default=None, max_length=100)  # Cron expression
    auto_retry_enabled: bool = Field(default=True)
    
    # Resource Configuration
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_limits: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    execution_environment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Dependencies and Relationships
    dependent_workflows: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    prerequisite_workflows: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    associated_rule_sets: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Execution Configuration
    execution_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    notification_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Metadata and Tracking
    created_by: str = Field(max_length=100)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_executed_at: Optional[datetime] = Field(default=None)
    next_scheduled_at: Optional[datetime] = Field(default=None)
    
    # Status and Monitoring
    is_active: bool = Field(default=True)
    is_template: bool = Field(default=False)
    execution_count: int = Field(default=0, ge=0)
    success_count: int = Field(default=0, ge=0)
    failure_count: int = Field(default=0, ge=0)
    
    # Performance Metrics
    average_execution_time_seconds: Optional[float] = Field(default=None, ge=0)
    total_execution_time_seconds: float = Field(default=0, ge=0)
    
    # Relationships
    executions: List["RuleExecutionInstance"] = Relationship(back_populates="workflow")
    resource_allocations: List["ResourceAllocation"] = Relationship(back_populates="workflow")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_workflow_type_priority", "workflow_type", "priority"),
        Index("idx_workflow_schedule", "next_scheduled_at"),
        Index("idx_workflow_active", "is_active"),
        CheckConstraint("max_parallel_executions > 0", name="check_max_parallel_positive"),
        CheckConstraint("timeout_minutes > 0", name="check_timeout_positive"),
    )

class RuleExecutionInstance(SQLModel, table=True):
    """
    Individual execution instance of a rule workflow.
    """
    __tablename__ = "rule_execution_instances"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    workflow_id: str = Field(foreign_key="rule_execution_workflows.workflow_id", index=True)
    
    # Execution Details
    execution_number: int = Field(ge=1)  # Sequential number for this workflow
    status: ExecutionStatus = Field(default=ExecutionStatus.PENDING, index=True)
    priority: ExecutionPriority
    
    # Timing Information
    scheduled_at: datetime
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    execution_time_seconds: Optional[float] = Field(default=None, ge=0)
    
    # Resource Usage
    resources_allocated: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resources_used: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    peak_resource_usage: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Context
    execution_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    input_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    output_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Error Handling
    error_message: Optional[str] = Field(default=None, max_length=2000)
    error_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    retry_attempt: int = Field(default=0, ge=0)
    recovery_action_taken: Optional[str] = Field(default=None, max_length=500)
    
    # Progress Tracking
    progress_percentage: float = Field(default=0, ge=0, le=100)
    steps_completed: int = Field(default=0, ge=0)
    total_steps: int = Field(default=0, ge=0)
    current_step: Optional[str] = Field(default=None, max_length=200)
    
    # Performance Metrics
    throughput_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    quality_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    efficiency_score: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Execution Environment
    execution_node: Optional[str] = Field(default=None, max_length=100)
    executor_version: Optional[str] = Field(default=None, max_length=50)
    environment_variables: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Tracking and Audit
    triggered_by: str = Field(max_length=100)  # user, system, schedule, webhook
    trigger_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    parent_execution_id: Optional[str] = Field(default=None)
    child_execution_ids: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    workflow: RuleExecutionWorkflow = Relationship(back_populates="executions")
    execution_steps: List["ExecutionStep"] = Relationship(back_populates="execution_instance")
    performance_metrics: List["ExecutionPerformanceMetric"] = Relationship(back_populates="execution_instance")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_execution_status_priority", "status", "priority"),
        Index("idx_execution_timing", "scheduled_at", "started_at"),
        Index("idx_execution_workflow", "workflow_id", "execution_number"),
        UniqueConstraint("workflow_id", "execution_number", name="uq_workflow_execution_number"),
        CheckConstraint("progress_percentage >= 0 AND progress_percentage <= 100", name="check_progress_range"),
        CheckConstraint("steps_completed <= total_steps", name="check_steps_logical"),
    )

class ExecutionStep(SQLModel, table=True):
    """
    Individual steps within a rule execution instance.
    """
    __tablename__ = "execution_steps"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    step_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    execution_id: str = Field(foreign_key="rule_execution_instances.execution_id", index=True)
    
    # Step Configuration
    step_name: str = Field(max_length=200)
    step_type: str = Field(max_length=100)  # validation, transformation, analysis, etc.
    step_order: int = Field(ge=1)
    is_critical: bool = Field(default=False)
    can_skip_on_failure: bool = Field(default=False)
    
    # Execution Details
    status: ExecutionStatus = Field(default=ExecutionStatus.PENDING)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    execution_time_seconds: Optional[float] = Field(default=None, ge=0)
    
    # Step Implementation
    step_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    input_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    output_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Error Handling
    error_message: Optional[str] = Field(default=None, max_length=1000)
    error_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    retry_attempts: int = Field(default=0, ge=0)
    
    # Dependencies
    dependent_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    prerequisite_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Performance
    resource_usage: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    execution_instance: RuleExecutionInstance = Relationship(back_populates="execution_steps")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_step_execution_order", "execution_id", "step_order"),
        Index("idx_step_status", "status"),
        UniqueConstraint("execution_id", "step_order", name="uq_execution_step_order"),
    )

class ResourceAllocation(SQLModel, table=True):
    """
    Resource allocation and management for workflow executions.
    """
    __tablename__ = "resource_allocations"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    allocation_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    workflow_id: str = Field(foreign_key="rule_execution_workflows.workflow_id", index=True)
    
    # Resource Details
    resource_type: ResourceType
    resource_name: str = Field(max_length=200)
    allocated_amount: float = Field(ge=0)
    allocated_unit: str = Field(max_length=50)  # GB, cores, connections, etc.
    
    # Allocation Timing
    allocated_at: datetime = Field(default_factory=datetime.utcnow)
    released_at: Optional[datetime] = Field(default=None)
    allocation_duration_seconds: Optional[float] = Field(default=None, ge=0)
    
    # Resource Pool Information
    resource_pool_id: Optional[str] = Field(default=None, max_length=100)
    resource_node: Optional[str] = Field(default=None, max_length=100)
    availability_zone: Optional[str] = Field(default=None, max_length=100)
    
    # Usage Metrics
    peak_usage: float = Field(default=0, ge=0)
    average_usage: float = Field(default=0, ge=0)
    usage_efficiency: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Cost Information
    cost_per_unit: Optional[float] = Field(default=None, ge=0)
    total_cost: Optional[float] = Field(default=None, ge=0)
    billing_model: Optional[str] = Field(default=None, max_length=50)
    
    # Status and Management
    allocation_status: str = Field(default="active", max_length=50)
    is_shared: bool = Field(default=False)
    priority: ExecutionPriority = Field(default=ExecutionPriority.MEDIUM)
    
    # Metadata
    allocation_reason: str = Field(max_length=500)
    allocated_by: str = Field(max_length=100)
    allocation_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    workflow: RuleExecutionWorkflow = Relationship(back_populates="resource_allocations")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_resource_type_status", "resource_type", "allocation_status"),
        Index("idx_resource_timing", "allocated_at", "released_at"),
        Index("idx_resource_workflow", "workflow_id", "resource_type"),
    )

class ExecutionPerformanceMetric(SQLModel, table=True):
    """
    Performance metrics for execution instances.
    """
    __tablename__ = "execution_performance_metrics"
    
    # Primary Fields
    id: Optional[int] = Field(default=None, primary_key=True)
    metric_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    execution_id: str = Field(foreign_key="rule_execution_instances.execution_id", index=True)
    
    # Metric Details
    metric_name: str = Field(max_length=200, index=True)
    metric_category: str = Field(max_length=100)  # performance, quality, efficiency, cost
    metric_value: float
    metric_unit: str = Field(max_length=50)
    
    # Measurement Context
    measured_at: datetime = Field(default_factory=datetime.utcnow)
    measurement_duration_seconds: Optional[float] = Field(default=None, ge=0)
    measurement_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Benchmarking
    baseline_value: Optional[float] = Field(default=None)
    target_value: Optional[float] = Field(default=None)
    threshold_warning: Optional[float] = Field(default=None)
    threshold_critical: Optional[float] = Field(default=None)
    
    # Status and Analysis
    is_within_target: Optional[bool] = Field(default=None)
    deviation_percentage: Optional[float] = Field(default=None)
    trend_direction: Optional[str] = Field(default=None, max_length=50)  # improving, degrading, stable
    
    # Metadata
    metric_source: str = Field(max_length=100)  # system, calculated, external
    calculation_method: Optional[str] = Field(default=None, max_length=200)
    metric_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    execution_instance: RuleExecutionInstance = Relationship(back_populates="performance_metrics")
    
    # Indexes and Constraints
    __table_args__ = (
        Index("idx_metric_execution_category", "execution_id", "metric_category"),
        Index("idx_metric_name_time", "metric_name", "measured_at"),
    )

# ===================================
# REQUEST/RESPONSE MODELS
# ===================================

class WorkflowExecutionRequest(BaseModel):
    """Request model for executing a workflow."""
    workflow_id: str
    execution_parameters: Optional[Dict[str, Any]] = None
    priority: ExecutionPriority = ExecutionPriority.MEDIUM
    scheduled_at: Optional[datetime] = None
    triggered_by: str
    trigger_details: Optional[Dict[str, Any]] = None
    resource_overrides: Optional[Dict[str, Any]] = None

class WorkflowExecutionResponse(BaseModel):
    """Response model for workflow execution."""
    execution_id: str
    workflow_id: str
    status: ExecutionStatus
    scheduled_at: datetime
    execution_number: int
    estimated_completion_time: Optional[datetime] = None
    resource_requirements: Dict[str, Any]
    message: str

class ExecutionStatusUpdate(BaseModel):
    """Model for execution status updates."""
    execution_id: str
    status: ExecutionStatus
    progress_percentage: float
    current_step: Optional[str] = None
    steps_completed: int
    total_steps: int
    error_message: Optional[str] = None
    performance_metrics: Optional[Dict[str, Any]] = None

class ResourceAllocationRequest(BaseModel):
    """Request model for resource allocation."""
    workflow_id: str
    resource_type: ResourceType
    allocated_amount: float
    allocated_unit: str
    priority: ExecutionPriority = ExecutionPriority.MEDIUM
    allocation_reason: str
    duration_hours: Optional[int] = None

class PerformanceMetricRecord(BaseModel):
    """Model for recording performance metrics."""
    execution_id: str
    metric_name: str
    metric_category: str
    metric_value: float
    metric_unit: str
    measurement_context: Optional[Dict[str, Any]] = None
    baseline_value: Optional[float] = None
    target_value: Optional[float] = None

class WorkflowExecutionSummary(BaseModel):
    """Summary model for workflow execution analytics."""
    workflow_id: str
    total_executions: int
    successful_executions: int
    failed_executions: int
    average_execution_time_seconds: float
    success_rate_percentage: float
    last_execution_at: Optional[datetime] = None
    average_resource_efficiency: float
    cost_metrics: Dict[str, Any]
    performance_trends: Dict[str, Any]