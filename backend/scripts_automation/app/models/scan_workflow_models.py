"""
Advanced Scan Workflow Models for Enterprise Data Governance
==========================================================

This module contains sophisticated models for complex workflow management,
orchestration, automation, and monitoring of scanning operations across
the entire enterprise data governance ecosystem.

Features:
- Multi-stage workflow definitions with conditional logic
- Advanced dependency management and parallel execution
- Intelligent error handling and recovery mechanisms
- Business process integration and approval workflows
- Resource optimization and cost management
- Real-time monitoring and alerting capabilities
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

class WorkflowType(str, Enum):
    """Types of scan workflows"""
    DISCOVERY = "discovery"                   # Data discovery workflows
    QUALITY_ASSESSMENT = "quality_assessment" # Quality assessment workflows
    COMPLIANCE_SCAN = "compliance_scan"       # Compliance scanning workflows
    LINEAGE_MAPPING = "lineage_mapping"       # Data lineage mapping workflows
    CLASSIFICATION = "classification"         # Data classification workflows
    REMEDIATION = "remediation"               # Data remediation workflows
    MONITORING = "monitoring"                 # Continuous monitoring workflows
    BATCH_PROCESSING = "batch_processing"     # Batch processing workflows
    REAL_TIME = "real_time"                  # Real-time processing workflows

class WorkflowStatus(str, Enum):
    """Workflow execution statuses"""
    DRAFT = "draft"                          # Being designed
    PENDING = "pending"                      # Waiting to start
    APPROVED = "approved"                    # Approved for execution
    SCHEDULED = "scheduled"                  # Scheduled for execution
    INITIALIZING = "initializing"            # Starting up
    RUNNING = "running"                      # Currently executing
    PAUSED = "paused"                       # Temporarily paused
    COMPLETED = "completed"                  # Successfully completed
    FAILED = "failed"                       # Failed with errors
    CANCELLED = "cancelled"                  # Manually cancelled
    TIMEOUT = "timeout"                     # Exceeded time limits
    SUSPENDED = "suspended"                  # Suspended pending review

class StepType(str, Enum):
    """Types of workflow steps"""
    DATA_SCAN = "data_scan"                  # Data scanning step
    VALIDATION = "validation"                # Data validation step
    TRANSFORMATION = "transformation"        # Data transformation step
    QUALITY_CHECK = "quality_check"          # Quality assessment step
    CLASSIFICATION = "classification"        # Data classification step
    NOTIFICATION = "notification"            # Notification step
    APPROVAL = "approval"                    # Approval step
    CONDITIONAL = "conditional"              # Conditional logic step
    PARALLEL = "parallel"                    # Parallel execution step
    SUBPROCESS = "subprocess"                # Subprocess invocation
    INTEGRATION = "integration"              # External system integration
    REPORTING = "reporting"                  # Report generation step

class StepStatus(str, Enum):
    """Status of individual workflow steps"""
    PENDING = "pending"                      # Waiting to execute
    READY = "ready"                         # Ready to execute
    RUNNING = "running"                     # Currently executing
    COMPLETED = "completed"                 # Successfully completed
    FAILED = "failed"                       # Failed with errors
    SKIPPED = "skipped"                     # Skipped due to conditions
    WAITING = "waiting"                     # Waiting for dependencies
    RETRYING = "retrying"                   # Being retried after failure
    TIMEOUT = "timeout"                     # Exceeded time limit

class TriggerType(str, Enum):
    """Types of workflow triggers"""
    MANUAL = "manual"                       # Manually triggered
    SCHEDULED = "scheduled"                 # Time-based schedule
    EVENT_DRIVEN = "event_driven"           # Event-driven trigger
    DATA_CHANGE = "data_change"             # Data change trigger
    QUALITY_THRESHOLD = "quality_threshold" # Quality threshold trigger
    COMPLIANCE_VIOLATION = "compliance_violation" # Compliance violation trigger
    SYSTEM_ALERT = "system_alert"           # System alert trigger
    EXTERNAL_REQUEST = "external_request"   # External system request

class ExecutionMode(str, Enum):
    """Workflow execution modes"""
    SEQUENTIAL = "sequential"               # Sequential execution
    PARALLEL = "parallel"                   # Parallel execution
    HYBRID = "hybrid"                       # Mixed sequential/parallel
    ADAPTIVE = "adaptive"                   # AI-optimized execution
    RESOURCE_AWARE = "resource_aware"       # Resource-aware execution


# ===================== CORE WORKFLOW MODELS =====================

class EnterpriseWorkflowDefinition(SQLModel, table=True):
    """
    Comprehensive workflow definition with advanced orchestration capabilities,
    conditional logic, and enterprise-grade features for complex scanning operations.
    """
    __tablename__ = "enterprise_workflow_definitions"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    workflow_name: str = Field(index=True)
    workflow_version: str = Field(default="1.0.0", index=True)
    
    # Workflow Metadata
    workflow_type: WorkflowType
    description: str
    purpose: str                             # Business purpose of workflow
    business_owner: Optional[str] = None
    technical_owner: Optional[str] = None
    
    # Workflow Configuration
    execution_mode: ExecutionMode = Field(default=ExecutionMode.SEQUENTIAL)
    max_concurrent_executions: int = Field(default=1)
    timeout_minutes: int = Field(default=1440)  # 24 hours default
    retry_policy: str = Field(default="{}")      # JSON retry configuration
    
    # Trigger Configuration
    trigger_type: TriggerType
    trigger_configuration: str = Field(default="{}")  # JSON trigger config
    schedule_expression: Optional[str] = None          # Cron expression for scheduled workflows
    trigger_conditions: str = Field(default="[]")     # JSON trigger conditions
    
    # Workflow Structure
    workflow_steps: str = Field(default="[]")          # JSON array of step definitions
    step_dependencies: str = Field(default="{}")       # JSON dependency graph
    conditional_logic: str = Field(default="{}")       # JSON conditional rules
    parallel_branches: str = Field(default="[]")       # JSON parallel execution branches
    
    # Resource Management
    resource_requirements: str = Field(default="{}")   # JSON resource specifications
    cost_budget: Optional[float] = None                 # Budget allocation
    priority_level: int = Field(default=5, ge=1, le=10)
    resource_optimization_enabled: bool = Field(default=True)
    
    # Quality and Validation
    validation_rules: str = Field(default="[]")        # JSON validation rules
    quality_gates: str = Field(default="[]")           # JSON quality checkpoints
    success_criteria: str = Field(default="[]")        # JSON success criteria
    failure_criteria: str = Field(default="[]")        # JSON failure criteria
    
    # Monitoring and Alerting
    monitoring_configuration: str = Field(default="{}")  # JSON monitoring config
    alert_thresholds: str = Field(default="{}")          # JSON alert thresholds
    notification_settings: str = Field(default="{}")     # JSON notification config
    sla_requirements: str = Field(default="{}")          # JSON SLA requirements
    
    # Integration Points
    data_source_connections: str = Field(default="[]")   # JSON data source configs
    external_system_integrations: str = Field(default="[]")  # JSON external integrations
    api_endpoints: str = Field(default="[]")              # JSON API configurations
    webhook_configurations: str = Field(default="[]")     # JSON webhook configs
    
    # Compliance and Governance
    compliance_requirements: str = Field(default="[]")    # JSON compliance requirements
    audit_trail_enabled: bool = Field(default=True)
    data_privacy_controls: str = Field(default="{}")      # JSON privacy controls
    regulatory_tags: str = Field(default="[]")            # JSON regulatory tags
    
    # Performance Optimization
    caching_strategy: str = Field(default="{}")           # JSON caching configuration
    optimization_hints: str = Field(default="[]")         # JSON optimization hints
    performance_targets: str = Field(default="{}")        # JSON performance targets
    scalability_configuration: str = Field(default="{}")  # JSON scalability config
    
    # Error Handling and Recovery
    error_handling_strategy: str = Field(default="{}")    # JSON error handling config
    recovery_procedures: str = Field(default="[]")        # JSON recovery procedures
    rollback_strategy: str = Field(default="{}")          # JSON rollback configuration
    disaster_recovery_plan: str = Field(default="{}")     # JSON disaster recovery
    
    # Versioning and Change Management
    is_active: bool = Field(default=True, index=True)
    is_published: bool = Field(default=False)
    previous_version_id: Optional[int] = None
    change_log: str = Field(default="[]")                  # JSON change history
    
    # Business Context
    business_impact_level: str = "medium"                 # low, medium, high, critical
    stakeholders: str = Field(default="[]")               # JSON stakeholder list
    approval_required: bool = Field(default=False)
    approval_workflow_id: Optional[str] = None
    
    # Lifecycle Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    last_modified_by: Optional[str] = None
    
    # Documentation and Help
    documentation_url: Optional[str] = None
    help_text: Optional[str] = None
    training_materials: str = Field(default="[]")         # JSON training resources
    best_practices: str = Field(default="[]")             # JSON best practices
    
    # Custom Properties
    tags: str = Field(default="[]")                       # JSON array of tags
    custom_properties: str = Field(default="{}")          # JSON custom properties
    metadata: str = Field(default="{}")                   # JSON additional metadata
    
    # Relationships
    executions: List["WorkflowExecution"] = Relationship(back_populates="workflow_definition")
    steps: List["WorkflowStepDefinition"] = Relationship(back_populates="workflow_definition")


class WorkflowStepDefinition(SQLModel, table=True):
    """
    Individual step definitions within workflows with detailed configuration,
    dependencies, and execution parameters for complex orchestration.
    """
    __tablename__ = "workflow_step_definitions"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    step_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    workflow_definition_id: int = Field(foreign_key="enterprise_workflow_definitions.id", index=True)
    
    # Step Metadata
    step_name: str = Field(index=True)
    step_type: StepType
    step_order: int = Field(index=True)
    description: str
    
    # Execution Configuration
    step_configuration: str = Field(default="{}")         # JSON step-specific config
    timeout_minutes: int = Field(default=60)
    retry_count: int = Field(default=3)
    retry_delay_seconds: int = Field(default=30)
    
    # Dependencies
    depends_on_steps: str = Field(default="[]")           # JSON array of step UUIDs
    conditional_execution: str = Field(default="{}")      # JSON conditional logic
    parallel_group: Optional[str] = None                  # Parallel execution group
    
    # Resource Requirements
    cpu_requirements: Optional[float] = None              # CPU cores required
    memory_requirements_mb: Optional[int] = None          # Memory in MB
    storage_requirements_gb: Optional[float] = None       # Storage in GB
    network_bandwidth_mbps: Optional[float] = None        # Network bandwidth
    
    # Input/Output Configuration
    input_parameters: str = Field(default="{}")           # JSON input parameters
    output_parameters: str = Field(default="{}")          # JSON output parameters
    input_validation: str = Field(default="[]")           # JSON input validation rules
    output_validation: str = Field(default="[]")          # JSON output validation rules
    
    # Error Handling
    on_failure_action: str = "stop"                       # stop, continue, retry, skip
    failure_threshold: int = Field(default=1)
    escalation_rules: str = Field(default="[]")           # JSON escalation rules
    
    # Monitoring
    monitoring_enabled: bool = Field(default=True)
    metrics_collection: str = Field(default="[]")         # JSON metrics to collect
    custom_alerts: str = Field(default="[]")              # JSON custom alert rules
    
    # Business Context
    business_rationale: Optional[str] = None
    stakeholder_notifications: str = Field(default="[]")  # JSON notification rules
    approval_required: bool = Field(default=False)
    
    # Integration
    external_service_calls: str = Field(default="[]")     # JSON external service calls
    database_operations: str = Field(default="[]")        # JSON database operations
    file_operations: str = Field(default="[]")            # JSON file operations
    
    # Lifecycle
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Custom Properties
    tags: str = Field(default="[]")                       # JSON array of tags
    custom_properties: str = Field(default="{}")          # JSON custom properties
    
    # Relationships
    workflow_definition: Optional[EnterpriseWorkflowDefinition] = Relationship(back_populates="steps")
    step_executions: List["WorkflowStepExecution"] = Relationship(back_populates="step_definition")


class WorkflowExecution(SQLModel, table=True):
    """
    Workflow execution instances with comprehensive tracking, monitoring,
    and analytics for enterprise-grade workflow management.
    """
    __tablename__ = "workflow_executions"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    workflow_definition_id: int = Field(foreign_key="enterprise_workflow_definitions.id", index=True)
    
    # Execution Context
    execution_name: str = Field(index=True)
    trigger_source: str                                    # What triggered this execution
    trigger_data: str = Field(default="{}")               # JSON trigger context
    parent_execution_id: Optional[int] = None             # For sub-workflows
    
    # Execution Status
    status: WorkflowStatus = Field(default=WorkflowStatus.PENDING, index=True)
    current_step: Optional[str] = None                     # Current executing step
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Timing
    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    estimated_completion: Optional[datetime] = None
    
    # Resource Tracking
    resources_allocated: str = Field(default="{}")        # JSON resource allocation
    resource_utilization: str = Field(default="{}")       # JSON utilization metrics
    cost_incurred: Optional[float] = None                  # Actual cost
    cost_budget_remaining: Optional[float] = None
    
    # Execution Results
    execution_results: str = Field(default="{}")          # JSON execution results
    output_data: str = Field(default="{}")                # JSON output data
    artifacts_generated: str = Field(default="[]")        # JSON artifact references
    quality_metrics: str = Field(default="{}")            # JSON quality metrics
    
    # Performance Metrics
    steps_completed: int = Field(default=0)
    steps_failed: int = Field(default=0)
    steps_skipped: int = Field(default=0)
    total_steps: int = Field(default=0)
    average_step_duration: Optional[float] = None
    
    # Error Tracking
    error_count: int = Field(default=0)
    warning_count: int = Field(default=0)
    last_error: Optional[str] = None
    error_details: str = Field(default="[]")              # JSON error log
    
    # Business Context
    business_priority: int = Field(default=5, ge=1, le=10)
    business_impact: Optional[str] = None
    stakeholder_notifications_sent: str = Field(default="[]")  # JSON notifications
    
    # Approval and Governance
    requires_approval: bool = Field(default=False)
    approval_status: str = "not_required"                 # not_required, pending, approved, rejected
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    
    # Monitoring and Alerting
    alerts_generated: str = Field(default="[]")           # JSON alerts
    monitoring_data: str = Field(default="{}")            # JSON monitoring metrics
    health_score: Optional[float] = None                   # Overall health score
    
    # Recovery and Rollback
    checkpoint_data: str = Field(default="{}")            # JSON checkpoint information
    rollback_available: bool = Field(default=False)
    rollback_executed: bool = Field(default=False)
    recovery_attempts: int = Field(default=0)
    
    # User Context
    initiated_by: Optional[str] = None                     # User who initiated
    execution_environment: str = "production"             # development, staging, production
    execution_mode: ExecutionMode = Field(default=ExecutionMode.SEQUENTIAL)
    
    # Integration Tracking
    external_system_calls: str = Field(default="[]")      # JSON external calls made
    data_sources_accessed: str = Field(default="[]")      # JSON data sources accessed
    systems_impacted: str = Field(default="[]")           # JSON impacted systems
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    archived_at: Optional[datetime] = None
    
    # Custom Properties
    tags: str = Field(default="[]")                       # JSON array of tags
    custom_metrics: str = Field(default="{}")             # JSON custom metrics
    metadata: str = Field(default="{}")                   # JSON additional metadata
    
    # Relationships
    workflow_definition: Optional[EnterpriseWorkflowDefinition] = Relationship(back_populates="executions")
    step_executions: List["WorkflowStepExecution"] = Relationship(back_populates="workflow_execution")


class WorkflowStepExecution(SQLModel, table=True):
    """
    Individual step execution tracking with detailed metrics, error handling,
    and performance analysis for comprehensive workflow monitoring.
    """
    __tablename__ = "workflow_step_executions"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    step_execution_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    workflow_execution_id: int = Field(foreign_key="workflow_executions.id", index=True)
    step_definition_id: int = Field(foreign_key="workflow_step_definitions.id", index=True)
    
    # Execution Context
    step_name: str = Field(index=True)
    execution_order: int                                   # Order in this execution
    attempt_number: int = Field(default=1)                # Retry attempt number
    
    # Status and Progress
    status: StepStatus = Field(default=StepStatus.PENDING, index=True)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    substep_completed: int = Field(default=0)
    substep_total: int = Field(default=1)
    
    # Timing
    queued_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    wait_time_seconds: Optional[float] = None              # Time spent waiting
    
    # Input/Output
    input_data: str = Field(default="{}")                 # JSON input data
    output_data: str = Field(default="{}")                # JSON output data
    data_processed_mb: Optional[float] = None              # Amount of data processed
    records_processed: Optional[int] = None               # Number of records processed
    
    # Resource Usage
    cpu_usage_seconds: Optional[float] = None             # CPU time used
    memory_usage_peak_mb: Optional[float] = None          # Peak memory usage
    disk_io_mb: Optional[float] = None                    # Disk I/O volume
    network_io_mb: Optional[float] = None                 # Network I/O volume
    
    # Performance Metrics
    throughput_records_per_second: Optional[float] = None
    efficiency_score: Optional[float] = None              # Performance efficiency
    resource_utilization_percentage: Optional[float] = None
    cost_per_record: Optional[float] = None
    
    # Quality Metrics
    data_quality_score: Optional[float] = None
    validation_passed: bool = Field(default=True)
    quality_issues_found: int = Field(default=0)
    quality_metrics: str = Field(default="{}")            # JSON quality data
    
    # Error Handling
    error_occurred: bool = Field(default=False)
    error_message: Optional[str] = None
    error_type: Optional[str] = None
    error_details: str = Field(default="{}")              # JSON error details
    stack_trace: Optional[str] = None
    
    # Recovery Information
    recovery_attempted: bool = Field(default=False)
    recovery_successful: bool = Field(default=False)
    recovery_method: Optional[str] = None
    recovery_details: str = Field(default="{}")           # JSON recovery info
    
    # Dependencies and Conditions
    dependencies_met: bool = Field(default=True)
    condition_evaluated: Optional[bool] = None            # Result of conditional logic
    condition_details: str = Field(default="{}")          # JSON condition evaluation
    
    # Business Context
    business_value_generated: Optional[float] = None
    compliance_status: str = "compliant"                  # compliant, non_compliant, unknown
    audit_trail: str = Field(default="[]")                # JSON audit events
    
    # Integration Tracking
    external_calls_made: str = Field(default="[]")        # JSON external service calls
    database_queries_executed: int = Field(default=0)
    files_processed: str = Field(default="[]")            # JSON file processing log
    
    # Monitoring and Alerting
    alerts_triggered: str = Field(default="[]")           # JSON alerts triggered
    monitoring_events: str = Field(default="[]")          # JSON monitoring events
    health_checks_passed: int = Field(default=0)
    health_checks_failed: int = Field(default=0)
    
    # Optimization Data
    optimization_opportunities: str = Field(default="[]")  # JSON optimization suggestions
    performance_baseline: str = Field(default="{}")        # JSON baseline metrics
    improvement_recommendations: str = Field(default="[]") # JSON recommendations
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    archived_at: Optional[datetime] = None
    
    # Custom Properties
    tags: str = Field(default="[]")                       # JSON array of tags
    custom_metrics: str = Field(default="{}")             # JSON custom metrics
    notes: Optional[str] = None
    
    # Relationships
    workflow_execution: Optional[WorkflowExecution] = Relationship(back_populates="step_executions")
    step_definition: Optional[WorkflowStepDefinition] = Relationship(back_populates="step_executions")


class WorkflowTemplate(SQLModel, table=True):
    """
    Reusable workflow templates for common scanning patterns with
    parameterization and customization capabilities.
    """
    __tablename__ = "workflow_templates"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    template_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    template_name: str = Field(index=True)
    template_version: str = Field(default="1.0.0")
    
    # Template Metadata
    category: str = Field(index=True)                     # discovery, quality, compliance, etc.
    template_type: WorkflowType
    description: str
    use_cases: str = Field(default="[]")                  # JSON array of use cases
    
    # Template Structure
    template_definition: str = Field(default="{}")        # JSON template structure
    parameter_definitions: str = Field(default="[]")      # JSON parameter definitions
    default_values: str = Field(default="{}")             # JSON default values
    validation_rules: str = Field(default="[]")           # JSON validation rules
    
    # Customization Options
    customizable_steps: str = Field(default="[]")         # JSON customizable steps
    optional_steps: str = Field(default="[]")             # JSON optional steps
    configuration_options: str = Field(default="{}")      # JSON configuration options
    
    # Business Context
    industry_focus: str = Field(default="[]")             # JSON industry applications
    regulatory_compliance: str = Field(default="[]")      # JSON compliance frameworks
    business_processes: str = Field(default="[]")         # JSON business processes
    
    # Usage and Analytics
    usage_count: int = Field(default=0)
    success_rate: Optional[float] = None
    average_execution_time: Optional[float] = None
    user_ratings: str = Field(default="[]")               # JSON user ratings
    
    # Template Quality
    maturity_level: str = "beta"                          # alpha, beta, stable, deprecated
    quality_score: Optional[float] = None
    test_coverage: Optional[float] = None
    documentation_completeness: Optional[float] = None
    
    # Lifecycle
    is_public: bool = Field(default=True)
    is_featured: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    
    # Metadata
    tags: str = Field(default="[]")                       # JSON array of tags
    keywords: str = Field(default="[]")                   # JSON array of keywords
    documentation_url: Optional[str] = None
    examples: str = Field(default="[]")                   # JSON example configurations


# ===================== RESPONSE AND REQUEST MODELS =====================

class WorkflowDefinitionResponse(BaseModel):
    """Response model for workflow definitions"""
    id: int
    workflow_uuid: str
    workflow_name: str
    workflow_version: str
    workflow_type: WorkflowType
    description: str
    trigger_type: TriggerType
    execution_mode: ExecutionMode
    is_active: bool
    created_at: datetime


class WorkflowExecutionResponse(BaseModel):
    """Response model for workflow executions"""
    id: int
    execution_uuid: str
    execution_name: str
    status: WorkflowStatus
    progress_percentage: float
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    steps_completed: int
    total_steps: int
    error_count: int


class StepExecutionResponse(BaseModel):
    """Response model for step executions"""
    id: int
    step_execution_uuid: str
    step_name: str
    status: StepStatus
    progress_percentage: float
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    error_occurred: bool
    data_processed_mb: Optional[float]


class WorkflowTemplateResponse(BaseModel):
    """Response model for workflow templates"""
    id: int
    template_uuid: str
    template_name: str
    template_version: str
    category: str
    template_type: WorkflowType
    description: str
    usage_count: int
    success_rate: Optional[float]
    maturity_level: str


# ===================== REQUEST MODELS =====================

class WorkflowDefinitionCreateRequest(BaseModel):
    """Request model for creating workflow definitions"""
    workflow_name: str
    workflow_type: WorkflowType
    description: str
    trigger_type: TriggerType
    execution_mode: ExecutionMode = ExecutionMode.SEQUENTIAL
    workflow_steps: List[Dict[str, Any]] = []
    resource_requirements: Dict[str, Any] = {}
    monitoring_configuration: Dict[str, Any] = {}


class WorkflowExecutionRequest(BaseModel):
    """Request model for workflow execution"""
    workflow_definition_id: int
    execution_name: str
    trigger_data: Dict[str, Any] = {}
    execution_parameters: Dict[str, Any] = {}
    priority_override: Optional[int] = None
    scheduled_at: Optional[datetime] = None


class StepDefinitionRequest(BaseModel):
    """Request model for step definitions"""
    step_name: str
    step_type: StepType
    step_order: int
    description: str
    step_configuration: Dict[str, Any] = {}
    depends_on_steps: List[str] = []
    timeout_minutes: int = 60


class WorkflowTemplateRequest(BaseModel):
    """Request model for workflow templates"""
    template_name: str
    template_type: WorkflowType
    category: str
    description: str
    template_definition: Dict[str, Any]
    parameter_definitions: List[Dict[str, Any]] = []
    use_cases: List[str] = []


# ===================== MODEL EXPORTS =====================

__all__ = [
    # Enums
    "WorkflowType", "WorkflowStatus", "StepType", "StepStatus", "TriggerType", "ExecutionMode",
    
    # Core Models
    "EnterpriseWorkflowDefinition", "WorkflowStepDefinition", "WorkflowExecution",
    "WorkflowStepExecution", "WorkflowTemplate",
    
    # Response Models
    "WorkflowDefinitionResponse", "WorkflowExecutionResponse", "StepExecutionResponse",
    "WorkflowTemplateResponse",
    
    # Request Models
    "WorkflowDefinitionCreateRequest", "WorkflowExecutionRequest", "StepDefinitionRequest",
    "WorkflowTemplateRequest",
]