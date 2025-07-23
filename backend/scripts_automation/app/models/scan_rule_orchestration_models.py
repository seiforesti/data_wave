"""
🎼 SCAN RULE ORCHESTRATION MODELS
Enterprise-grade orchestration models for intelligent rule coordination, workflow management,
and multi-system integration across all data governance components.

This module provides advanced orchestration capabilities for:
- Multi-Rule Coordination and Execution Management
- Intelligent Resource Load Balancing and Priority Management  
- Advanced Workflow Automation and State Management
- Cross-System Integration and Communication Protocols
- Real-Time Orchestration Monitoring and Performance Analytics
- Enterprise-Scale Failure Recovery and Retry Mechanisms
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
from .advanced_scan_rule_models import IntelligentScanRule, RuleExecutionHistory
from .scan_models import DataSource, ScanJob, ScanResult


class OrchestrationStrategy(str, Enum):
    """Strategies for orchestrating rule execution across systems"""
    PARALLEL_MAXIMUM = "parallel_maximum"       # Maximum parallelization
    SEQUENTIAL_ORDERED = "sequential_ordered"   # Strict sequential execution
    ADAPTIVE_HYBRID = "adaptive_hybrid"         # AI-determined optimal strategy
    PRIORITY_BASED = "priority_based"           # Priority-driven execution
    RESOURCE_AWARE = "resource_aware"           # Resource availability-based
    WORKFLOW_DRIVEN = "workflow_driven"         # Complex workflow orchestration
    INTELLIGENT_SCHEDULING = "intelligent_scheduling"  # ML-optimized scheduling
    DEPENDENCY_RESOLVED = "dependency_resolved"  # Dependency-aware execution


class ExecutionPriority(str, Enum):
    """Priority levels for rule execution orchestration"""
    CRITICAL = "critical"           # Mission-critical, highest priority
    HIGH = "high"                   # High business importance
    NORMAL = "normal"               # Standard priority
    LOW = "low"                     # Background processing
    BATCH = "batch"                 # Batch processing when resources available
    DEFERRED = "deferred"           # Execute when system load is low
    EMERGENCY = "emergency"         # Emergency execution, override all others


class OrchestrationStatus(str, Enum):
    """Status states for orchestration jobs"""
    PENDING = "pending"             # Waiting to start
    INITIALIZING = "initializing"   # Setting up resources
    RUNNING = "running"             # Currently executing
    PAUSED = "paused"               # Temporarily paused
    COMPLETED = "completed"         # Successfully completed
    FAILED = "failed"               # Execution failed
    CANCELLED = "cancelled"         # Manually cancelled
    TIMEOUT = "timeout"             # Execution timed out
    PARTIALLY_COMPLETED = "partially_completed"  # Some rules completed
    RETRYING = "retrying"           # Attempting retry
    RECOVERING = "recovering"       # Failure recovery in progress


class ResourceType(str, Enum):
    """Types of system resources managed by orchestration"""
    CPU_CORES = "cpu_cores"         # CPU processing cores
    MEMORY_GB = "memory_gb"         # RAM memory in gigabytes
    NETWORK_BANDWIDTH = "network_bandwidth"  # Network bandwidth
    STORAGE_IOPS = "storage_iops"   # Storage input/output operations
    DATABASE_CONNECTIONS = "database_connections"  # DB connection pool
    API_RATE_LIMITS = "api_rate_limits"  # API call rate limits
    COMPUTE_CREDITS = "compute_credits"  # Cloud computing credits
    CONCURRENT_THREADS = "concurrent_threads"  # Thread pool resources


class WorkflowType(str, Enum):
    """Types of orchestration workflows supported"""
    SIMPLE_PARALLEL = "simple_parallel"        # Basic parallel execution
    COMPLEX_SEQUENTIAL = "complex_sequential"   # Multi-stage sequential
    CONDITIONAL_BRANCHING = "conditional_branching"  # Conditional logic flows
    EVENT_DRIVEN = "event_driven"              # Event-triggered workflows
    APPROVAL_REQUIRED = "approval_required"     # Human approval workflows
    ITERATIVE_REFINEMENT = "iterative_refinement"  # Iterative improvement
    DEPENDENCY_GRAPH = "dependency_graph"       # Complex dependency management
    ADAPTIVE_PIPELINE = "adaptive_pipeline"     # AI-adaptive pipelines


class FailureStrategy(str, Enum):
    """Strategies for handling failures in orchestration"""
    IMMEDIATE_FAIL = "immediate_fail"           # Fail immediately on error
    CONTINUE_ON_ERROR = "continue_on_error"     # Continue with other rules
    RETRY_WITH_BACKOFF = "retry_with_backoff"   # Exponential backoff retry
    FALLBACK_EXECUTION = "fallback_execution"   # Use fallback rules
    CIRCUIT_BREAKER = "circuit_breaker"         # Circuit breaker pattern
    GRACEFUL_DEGRADATION = "graceful_degradation"  # Degrade functionality
    INTELLIGENT_RECOVERY = "intelligent_recovery"  # AI-driven recovery


class LoadBalancingStrategy(str, Enum):
    """Load balancing strategies for resource distribution"""
    ROUND_ROBIN = "round_robin"                 # Round-robin distribution
    LEAST_CONNECTIONS = "least_connections"     # Least connection count
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin"  # Weighted distribution
    RESOURCE_BASED = "resource_based"           # Resource availability-based
    PERFORMANCE_BASED = "performance_based"     # Performance history-based
    INTELLIGENT_ADAPTIVE = "intelligent_adaptive"  # AI-optimized balancing
    GEOGRAPHIC_PROXIMITY = "geographic_proximity"  # Location-based routing


class OrchestrationJob(SQLModel, table=True):
    """
    Enterprise-grade orchestration job for coordinating multiple rule executions
    across distributed systems with advanced workflow management and monitoring.
    """
    __tablename__ = "orchestration_jobs"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    job_uuid: str = Field(index=True, unique=True, description="Unique job identifier")
    job_name: str = Field(max_length=255, index=True)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = Field(sa_column=Column(Text))
    
    # Orchestration Configuration
    orchestration_strategy: OrchestrationStrategy = Field(default=OrchestrationStrategy.ADAPTIVE_HYBRID, index=True)
    workflow_type: WorkflowType = Field(default=WorkflowType.SIMPLE_PARALLEL, index=True)
    execution_priority: ExecutionPriority = Field(default=ExecutionPriority.NORMAL, index=True)
    failure_strategy: FailureStrategy = Field(default=FailureStrategy.RETRY_WITH_BACKOFF)
    load_balancing_strategy: LoadBalancingStrategy = Field(default=LoadBalancingStrategy.INTELLIGENT_ADAPTIVE)
    
    # Rule Configuration
    rule_ids: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    rule_execution_order: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    rule_dependencies: Dict[int, List[int]] = Field(default_factory=dict, sa_column=Column(JSON))
    conditional_rules: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Target Configuration
    data_source_ids: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    data_source_scope: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    target_filters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Control
    max_concurrent_rules: int = Field(default=10, ge=1, le=100)
    max_execution_time_minutes: int = Field(default=240, ge=1, le=1440)  # 4 hours max
    batch_size: int = Field(default=1000, ge=1, le=10000)
    retry_count: int = Field(default=3, ge=0, le=10)
    retry_delay_seconds: int = Field(default=60, ge=1, le=3600)
    
    # Resource Management
    resource_requirements: Dict[ResourceType, float] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_allocation: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_limits: Dict[ResourceType, float] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_priority_weights: Dict[ResourceType, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Workflow Configuration
    workflow_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    workflow_variables: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    approval_required: bool = Field(default=False)
    approval_workflow: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    
    # Status and Progress
    status: OrchestrationStatus = Field(default=OrchestrationStatus.PENDING, index=True)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    current_phase: str = Field(default="initialization", max_length=100)
    rules_completed: int = Field(default=0, ge=0)
    rules_failed: int = Field(default=0, ge=0)
    rules_skipped: int = Field(default=0, ge=0)
    
    # Execution Timing
    scheduled_start: Optional[datetime] = Field(index=True)
    actual_start: Optional[datetime] = Field(index=True)
    estimated_completion: Optional[datetime] = None
    actual_completion: Optional[datetime] = Field(index=True)
    total_execution_time_seconds: Optional[float] = Field(ge=0.0)
    
    # Performance Metrics
    total_records_processed: int = Field(default=0, ge=0)
    processing_rate_per_second: Optional[float] = Field(ge=0.0)
    average_rule_execution_time: Optional[float] = Field(ge=0.0)
    resource_utilization: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_score: float = Field(default=0.0, ge=0.0, le=10.0)
    
    # Results and Output
    execution_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    rule_execution_summaries: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    generated_artifacts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    quality_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Error Handling and Recovery
    error_messages: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    warnings: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    failed_rule_details: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    recovery_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Monitoring and Alerting
    monitoring_enabled: bool = Field(default=True)
    alert_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    notification_channels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    escalation_rules: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Context
    business_justification: Optional[str] = Field(sa_column=Column(Text))
    business_priority_score: int = Field(default=5, ge=1, le=10)
    cost_center: Optional[str] = Field(max_length=100)
    expected_business_value: Optional[float] = Field(ge=0.0)
    
    # Compliance and Audit
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    data_lineage_tracking: bool = Field(default=True)
    privacy_impact_assessment: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    
    # Integration and Communication
    integration_points: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    external_system_callbacks: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    webhook_endpoints: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    api_integrations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle Management
    created_by: str = Field(max_length=255)
    updated_by: Optional[str] = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    cancelled_by: Optional[str] = Field(max_length=255)
    approval_date: Optional[datetime] = None
    cancellation_reason: Optional[str] = Field(max_length=500)
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    rule_executions: List["OrchestrationRuleExecution"] = Relationship(back_populates="orchestration_job")
    resource_allocations: List["OrchestrationResourceAllocation"] = Relationship(back_populates="orchestration_job")
    workflow_states: List["OrchestrationWorkflowState"] = Relationship(back_populates="orchestration_job")
    performance_metrics: List["OrchestrationPerformanceMetrics"] = Relationship(back_populates="orchestration_job")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_orchestration_status_priority', 'status', 'execution_priority'),
        Index('ix_orchestration_timing', 'scheduled_start', 'actual_start'),
        Index('ix_orchestration_performance', 'performance_score', 'progress_percentage'),
        Index('ix_orchestration_business', 'business_priority_score', 'expected_business_value'),
        CheckConstraint('max_concurrent_rules >= 1 AND max_concurrent_rules <= 100'),
        CheckConstraint('business_priority_score >= 1 AND business_priority_score <= 10'),
        CheckConstraint('progress_percentage >= 0.0 AND progress_percentage <= 100.0'),
        UniqueConstraint('job_uuid'),
    )


class OrchestrationRuleExecution(SQLModel, table=True):
    """
    Detailed execution tracking for individual rules within orchestration jobs,
    providing granular monitoring and performance analytics.
    """
    __tablename__ = "orchestration_rule_executions"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_uuid: str = Field(index=True, unique=True)
    orchestration_job_id: int = Field(foreign_key="orchestration_jobs.id", index=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    
    # Execution Context
    execution_order: int = Field(ge=1, index=True)
    dependency_group: Optional[str] = Field(max_length=100)
    parallel_batch: Optional[int] = Field(ge=1)
    retry_attempt: int = Field(default=0, ge=0)
    
    # Status and Progress
    status: str = Field(max_length=50, index=True)  # pending, running, completed, failed, skipped
    status_message: Optional[str] = Field(max_length=500)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    completion_reason: Optional[str] = Field(max_length=255)
    
    # Timing Details
    queued_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    started_at: Optional[datetime] = Field(index=True)
    completed_at: Optional[datetime] = None
    execution_duration_seconds: Optional[float] = Field(ge=0.0)
    queue_wait_time_seconds: Optional[float] = Field(ge=0.0)
    
    # Resource Usage
    allocated_resources: Dict[ResourceType, float] = Field(default_factory=dict, sa_column=Column(JSON))
    actual_resource_usage: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    peak_resource_usage: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_efficiency: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Execution Results
    records_processed: int = Field(default=0, ge=0)
    records_matched: int = Field(default=0, ge=0)
    patterns_detected: int = Field(default=0, ge=0)
    issues_found: int = Field(default=0, ge=0)
    confidence_score: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Quality Metrics
    accuracy_score: Optional[float] = Field(ge=0.0, le=1.0)
    precision: Optional[float] = Field(ge=0.0, le=1.0)
    recall: Optional[float] = Field(ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(ge=0.0, le=1.0)
    false_positive_count: int = Field(default=0, ge=0)
    false_negative_count: int = Field(default=0, ge=0)
    
    # Error Handling
    error_category: Optional[str] = Field(max_length=100, index=True)
    error_message: Optional[str] = Field(max_length=1000)
    stack_trace: Optional[str] = Field(sa_column=Column(Text))
    recovery_attempted: bool = Field(default=False)
    recovery_successful: bool = Field(default=False)
    
    # Performance Analysis
    throughput_records_per_second: Optional[float] = Field(ge=0.0)
    latency_percentiles: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    bottleneck_indicators: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    optimization_opportunities: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Integration Results
    data_source_impacts: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    classification_results: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_findings: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    catalog_updates: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Context and Environment
    execution_environment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    system_state_snapshot: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    concurrent_executions: int = Field(default=1, ge=1)
    worker_node_id: Optional[str] = Field(max_length=100)
    
    # Relationships
    orchestration_job: Optional[OrchestrationJob] = Relationship(back_populates="rule_executions")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_rule_execution_performance', 'execution_duration_seconds', 'throughput_records_per_second'),
        Index('ix_rule_execution_quality', 'accuracy_score', 'f1_score'),
        Index('ix_rule_execution_timing', 'started_at', 'completed_at'),
        Index('ix_rule_execution_status', 'status', 'error_category'),
        CheckConstraint('progress_percentage >= 0.0 AND progress_percentage <= 100.0'),
    )


class OrchestrationResourceAllocation(SQLModel, table=True):
    """
    Dynamic resource allocation and management for orchestration jobs with
    real-time monitoring and intelligent optimization capabilities.
    """
    __tablename__ = "orchestration_resource_allocations"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    allocation_uuid: str = Field(index=True, unique=True)
    orchestration_job_id: int = Field(foreign_key="orchestration_jobs.id", index=True)
    
    # Resource Configuration
    resource_type: ResourceType = Field(index=True)
    resource_pool: str = Field(max_length=100, index=True)
    allocation_strategy: str = Field(max_length=100)  # reserved, on_demand, elastic, preemptible
    priority_level: int = Field(default=5, ge=1, le=10)
    
    # Allocation Details
    requested_amount: float = Field(ge=0.0)
    allocated_amount: float = Field(ge=0.0)
    reserved_amount: float = Field(ge=0.0)
    maximum_burst: Optional[float] = Field(ge=0.0)
    minimum_guaranteed: Optional[float] = Field(ge=0.0)
    
    # Usage Tracking
    current_usage: float = Field(default=0.0, ge=0.0)
    peak_usage: float = Field(default=0.0, ge=0.0)
    average_usage: float = Field(default=0.0, ge=0.0)
    utilization_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    efficiency_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Cost Management
    cost_per_unit: Optional[float] = Field(ge=0.0)
    total_cost: float = Field(default=0.0, ge=0.0)
    budget_allocation: Optional[float] = Field(ge=0.0)
    cost_optimization_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Timing and Lifecycle
    allocation_start: datetime = Field(default_factory=datetime.utcnow, index=True)
    allocation_end: Optional[datetime] = None
    duration_minutes: Optional[float] = Field(ge=0.0)
    auto_release: bool = Field(default=True)
    release_conditions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance Metrics
    allocation_latency_ms: Optional[float] = Field(ge=0.0)
    resource_availability_score: float = Field(default=1.0, ge=0.0, le=1.0)
    contention_level: str = Field(default="low", max_length=20)  # low, medium, high, critical
    scaling_events: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Health and Monitoring
    health_status: str = Field(default="healthy", max_length=50, index=True)
    health_score: float = Field(default=1.0, ge=0.0, le=1.0)
    alerts_triggered: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    maintenance_windows: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Optimization and Intelligence
    optimization_recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    historical_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    predictive_scaling: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    ai_insights: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    orchestration_job: Optional[OrchestrationJob] = Relationship(back_populates="resource_allocations")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_resource_allocation_usage', 'current_usage', 'utilization_percentage'),
        Index('ix_resource_allocation_cost', 'total_cost', 'cost_optimization_score'),
        Index('ix_resource_allocation_health', 'health_status', 'health_score'),
        Index('ix_resource_allocation_timing', 'allocation_start', 'allocation_end'),
        CheckConstraint('utilization_percentage >= 0.0 AND utilization_percentage <= 100.0'),
        CheckConstraint('priority_level >= 1 AND priority_level <= 10'),
    )


class OrchestrationWorkflowState(SQLModel, table=True):
    """
    Advanced workflow state management for complex orchestration scenarios
    with support for conditional logic, branching, and state persistence.
    """
    __tablename__ = "orchestration_workflow_states"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    state_uuid: str = Field(index=True, unique=True)
    orchestration_job_id: int = Field(foreign_key="orchestration_jobs.id", index=True)
    
    # Workflow Position
    workflow_step: str = Field(max_length=100, index=True)
    step_sequence: int = Field(ge=1, index=True)
    parent_step: Optional[str] = Field(max_length=100)
    child_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # State Information
    current_state: str = Field(max_length=50, index=True)  # pending, active, completed, failed, skipped, blocked
    previous_state: Optional[str] = Field(max_length=50)
    state_transition_reason: Optional[str] = Field(max_length=255)
    state_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Control
    is_blocking: bool = Field(default=False)  # Whether this step blocks subsequent steps
    can_retry: bool = Field(default=True)
    max_retries: int = Field(default=3, ge=0, le=10)
    current_retry: int = Field(default=0, ge=0)
    retry_delay_seconds: int = Field(default=60, ge=1, le=3600)
    
    # Conditional Logic
    entry_conditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    exit_conditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    conditional_branches: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    decision_logic: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    
    # Timing and Duration
    state_entered: datetime = Field(default_factory=datetime.utcnow, index=True)
    state_exited: Optional[datetime] = None
    state_duration_seconds: Optional[float] = Field(ge=0.0)
    timeout_seconds: Optional[int] = Field(ge=1, le=86400)  # 24 hours max
    
    # Dependencies and Coordination
    depends_on_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    waiting_for_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    coordination_tokens: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    synchronization_points: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Execution Results
    step_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    output_variables: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    side_effects: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    generated_artifacts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Error Handling
    error_handling_strategy: str = Field(default="continue", max_length=50)
    error_details: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    recovery_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    fallback_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Monitoring and Observability
    step_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_indicators: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    health_checks: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    observability_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Human Interactions
    requires_approval: bool = Field(default=False)
    approval_status: Optional[str] = Field(max_length=50)  # pending, approved, rejected
    approver_id: Optional[str] = Field(max_length=255)
    approval_comments: Optional[str] = Field(sa_column=Column(Text))
    approval_timestamp: Optional[datetime] = None
    
    # Integration Points
    external_system_calls: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    webhook_triggers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    api_interactions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    notification_events: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    orchestration_job: Optional[OrchestrationJob] = Relationship(back_populates="workflow_states")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_workflow_state_step', 'workflow_step', 'step_sequence'),
        Index('ix_workflow_state_status', 'current_state', 'state_entered'),
        Index('ix_workflow_state_approval', 'requires_approval', 'approval_status'),
        Index('ix_workflow_state_timing', 'state_entered', 'state_exited'),
        CheckConstraint('max_retries >= 0 AND max_retries <= 10'),
        CheckConstraint('current_retry >= 0 AND current_retry <= max_retries'),
    )


class OrchestrationPerformanceMetrics(SQLModel, table=True):
    """
    Comprehensive performance metrics and analytics for orchestration jobs
    with real-time monitoring and predictive performance modeling.
    """
    __tablename__ = "orchestration_performance_metrics"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    metrics_uuid: str = Field(index=True, unique=True)
    orchestration_job_id: int = Field(foreign_key="orchestration_jobs.id", index=True)
    
    # Measurement Context
    measurement_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    measurement_window_seconds: int = Field(default=300, ge=1, le=3600)  # 5 minutes default
    measurement_type: str = Field(max_length=50, index=True)  # real_time, batch, summary, baseline
    
    # Execution Performance
    rules_executed_per_minute: float = Field(default=0.0, ge=0.0)
    average_rule_execution_time: float = Field(default=0.0, ge=0.0)
    median_rule_execution_time: float = Field(default=0.0, ge=0.0)
    p95_rule_execution_time: float = Field(default=0.0, ge=0.0)
    p99_rule_execution_time: float = Field(default=0.0, ge=0.0)
    execution_time_variance: float = Field(default=0.0, ge=0.0)
    
    # Throughput Metrics
    total_records_processed: int = Field(default=0, ge=0)
    records_processed_per_second: float = Field(default=0.0, ge=0.0)
    data_volume_processed_gb: float = Field(default=0.0, ge=0.0)
    processing_velocity: float = Field(default=0.0, ge=0.0)
    throughput_efficiency: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Resource Utilization
    cpu_utilization_avg: float = Field(default=0.0, ge=0.0, le=100.0)
    cpu_utilization_peak: float = Field(default=0.0, ge=0.0, le=100.0)
    memory_utilization_avg: float = Field(default=0.0, ge=0.0, le=100.0)
    memory_utilization_peak: float = Field(default=0.0, ge=0.0, le=100.0)
    network_io_mbps: float = Field(default=0.0, ge=0.0)
    disk_io_mbps: float = Field(default=0.0, ge=0.0)
    resource_efficiency_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Quality and Accuracy
    overall_accuracy_score: float = Field(default=0.0, ge=0.0, le=1.0)
    average_confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
    false_positive_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    false_negative_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    data_quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Error and Reliability Metrics
    error_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    retry_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    timeout_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    recovery_success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    system_reliability_score: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Scalability Metrics
    concurrent_execution_count: int = Field(default=1, ge=1)
    scalability_factor: float = Field(default=1.0, ge=0.1, le=10.0)
    load_distribution_efficiency: float = Field(default=1.0, ge=0.0, le=1.0)
    bottleneck_indicators: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    scaling_recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business Impact Metrics
    business_value_generated: float = Field(default=0.0, ge=0.0)
    cost_per_execution: float = Field(default=0.0, ge=0.0)
    roi_score: float = Field(default=0.0, ge=0.0, le=10.0)
    compliance_score: float = Field(default=1.0, ge=0.0, le=1.0)
    customer_satisfaction_impact: Optional[float] = Field(ge=0.0, le=10.0)
    
    # Predictive Analytics
    predicted_completion_time: Optional[datetime] = None
    predicted_resource_needs: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    capacity_forecasting: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_trend_direction: str = Field(default="stable", max_length=20)  # improving, degrading, stable
    
    # Comparative Analysis
    baseline_comparison: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    peer_comparison: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    historical_performance: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    performance_percentile: float = Field(default=50.0, ge=0.0, le=100.0)
    
    # Alert and Threshold Management
    threshold_breaches: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    performance_alerts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    sla_compliance_status: bool = Field(default=True)
    optimization_opportunities: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    orchestration_job: Optional[OrchestrationJob] = Relationship(back_populates="performance_metrics")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_performance_metrics_timestamp', 'measurement_timestamp', 'orchestration_job_id'),
        Index('ix_performance_metrics_throughput', 'records_processed_per_second', 'throughput_efficiency'),
        Index('ix_performance_metrics_quality', 'overall_accuracy_score', 'data_quality_score'),
        Index('ix_performance_metrics_business', 'business_value_generated', 'roi_score'),
        CheckConstraint('throughput_efficiency >= 0.0 AND throughput_efficiency <= 1.0'),
        CheckConstraint('cpu_utilization_avg >= 0.0 AND cpu_utilization_avg <= 100.0'),
        CheckConstraint('performance_percentile >= 0.0 AND performance_percentile <= 100.0'),
    )


# ===================== WORKFLOW AND COORDINATION MODELS =====================

class OrchestrationTemplate(SQLModel, table=True):
    """
    Reusable orchestration templates for common workflow patterns
    with customizable parameters and best practice configurations.
    """
    __tablename__ = "orchestration_templates"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    template_uuid: str = Field(index=True, unique=True)
    name: str = Field(max_length=255, index=True)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = Field(sa_column=Column(Text))
    version: str = Field(default="1.0.0", max_length=20)
    
    # Template Configuration
    template_type: str = Field(max_length=100, index=True)  # data_discovery, compliance_scan, quality_assessment
    workflow_category: str = Field(max_length=100, index=True)
    use_case_scenarios: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    target_industries: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Workflow Definition
    workflow_steps: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    step_dependencies: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    conditional_logic: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    parallel_execution_groups: List[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Default Configuration
    default_orchestration_strategy: OrchestrationStrategy = Field(default=OrchestrationStrategy.ADAPTIVE_HYBRID)
    default_resource_requirements: Dict[ResourceType, float] = Field(default_factory=dict, sa_column=Column(JSON))
    default_timeout_minutes: int = Field(default=240, ge=1, le=1440)
    default_retry_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Customization Parameters
    configurable_parameters: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    parameter_validation_rules: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    parameter_dependencies: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Usage and Performance
    usage_count: int = Field(default=0, ge=0, index=True)
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    average_execution_time_minutes: float = Field(default=0.0, ge=0.0)
    user_satisfaction_score: float = Field(default=0.0, ge=0.0, le=5.0)
    
    # Metadata and Documentation
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    documentation: Optional[str] = Field(sa_column=Column(Text))
    examples: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    best_practices: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Lifecycle Management
    is_active: bool = Field(default=True, index=True)
    is_public: bool = Field(default=False, index=True)
    created_by: str = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Database Constraints
    __table_args__ = (
        Index('ix_template_usage_success', 'usage_count', 'success_rate'),
        Index('ix_template_performance', 'average_execution_time_minutes', 'user_satisfaction_score'),
        Index('ix_template_category', 'template_type', 'workflow_category'),
        UniqueConstraint('template_uuid'),
    )


# ===================== REQUEST AND RESPONSE MODELS =====================

class OrchestrationJobResponse(BaseModel):
    """Response model for orchestration jobs"""
    id: int
    job_uuid: str
    job_name: str
    orchestration_strategy: OrchestrationStrategy
    workflow_type: WorkflowType
    execution_priority: ExecutionPriority
    status: OrchestrationStatus
    progress_percentage: float
    rules_completed: int
    rules_failed: int
    total_records_processed: int
    performance_score: float
    created_at: datetime
    estimated_completion: Optional[datetime]
    
    class Config:
        from_attributes = True


class OrchestrationJobCreate(BaseModel):
    """Request model for creating orchestration jobs"""
    job_name: str = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    orchestration_strategy: OrchestrationStrategy = OrchestrationStrategy.ADAPTIVE_HYBRID
    workflow_type: WorkflowType = WorkflowType.SIMPLE_PARALLEL
    execution_priority: ExecutionPriority = ExecutionPriority.NORMAL
    rule_ids: List[int] = Field(min_items=1)
    data_source_ids: List[int] = Field(min_items=1)
    max_concurrent_rules: int = Field(default=10, ge=1, le=100)
    max_execution_time_minutes: int = Field(default=240, ge=1, le=1440)
    resource_requirements: Optional[Dict[str, float]] = {}
    workflow_definition: Optional[Dict[str, Any]] = {}
    approval_required: bool = False
    monitoring_enabled: bool = True
    created_by: str = Field(min_length=1, max_length=255)


class OrchestrationJobUpdate(BaseModel):
    """Request model for updating orchestration jobs"""
    job_name: Optional[str] = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    execution_priority: Optional[ExecutionPriority] = None
    status: Optional[OrchestrationStatus] = None
    max_concurrent_rules: Optional[int] = Field(ge=1, le=100)
    max_execution_time_minutes: Optional[int] = Field(ge=1, le=1440)
    monitoring_enabled: Optional[bool] = None


class OrchestrationMetricsReport(BaseModel):
    """Performance metrics report for orchestration jobs"""
    job_uuid: str
    measurement_period: str
    execution_performance: Dict[str, float]
    throughput_metrics: Dict[str, float]
    resource_utilization: Dict[str, float]
    quality_metrics: Dict[str, float]
    business_impact: Dict[str, float]
    recommendations: List[str]
    trend_analysis: Dict[str, Any]


# ===================== UTILITY FUNCTIONS =====================

def generate_orchestration_uuid() -> str:
    """Generate a unique UUID for orchestration jobs"""
    return f"orch_{uuid.uuid4().hex[:12]}"


def calculate_orchestration_efficiency(
    total_execution_time: float,
    resource_usage: Dict[str, float],
    records_processed: int,
    quality_score: float
) -> float:
    """Calculate overall orchestration efficiency score"""
    if total_execution_time <= 0 or records_processed <= 0:
        return 0.0
    
    # Throughput efficiency (records per second)
    throughput_efficiency = min(records_processed / total_execution_time / 1000, 1.0)  # Normalize to 1000 records/sec
    
    # Resource efficiency (inverse of average resource usage)
    avg_resource_usage = sum(resource_usage.values()) / len(resource_usage) if resource_usage else 0.5
    resource_efficiency = max(0.0, 1.0 - (avg_resource_usage / 100.0))
    
    # Combined efficiency score
    efficiency_score = (throughput_efficiency * 0.4 + resource_efficiency * 0.3 + quality_score * 0.3)
    
    return min(efficiency_score, 1.0)


# Export all models and utilities
__all__ = [
    # Enums
    "OrchestrationStrategy", "ExecutionPriority", "OrchestrationStatus", "ResourceType",
    "WorkflowType", "FailureStrategy", "LoadBalancingStrategy",
    
    # Core Models
    "OrchestrationJob", "OrchestrationRuleExecution", "OrchestrationResourceAllocation",
    "OrchestrationWorkflowState", "OrchestrationPerformanceMetrics", "OrchestrationTemplate",
    
    # Request/Response Models
    "OrchestrationJobResponse", "OrchestrationJobCreate", "OrchestrationJobUpdate",
    "OrchestrationMetricsReport",
    
    # Utilities
    "generate_orchestration_uuid", "calculate_orchestration_efficiency"
]