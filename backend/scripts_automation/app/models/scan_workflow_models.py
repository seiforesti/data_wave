"""
⚙️ SCAN WORKFLOW MODELS
Enterprise-grade workflow models for complex multi-stage scanning operations,
approval processes, conditional logic, and comprehensive workflow orchestration.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, JSON, text
from pydantic import BaseModel, validator, Field as PydanticField
import json

# ====================================================================
# WORKFLOW ENUMS
# ====================================================================

class WorkflowType(str, Enum):
    """Types of scan workflows"""
    SIMPLE_SCAN = "simple_scan"
    MULTI_STAGE_SCAN = "multi_stage_scan"
    CONDITIONAL_SCAN = "conditional_scan"
    PARALLEL_SCAN = "parallel_scan"
    SEQUENTIAL_SCAN = "sequential_scan"
    APPROVAL_BASED_SCAN = "approval_based_scan"
    COMPLIANCE_SCAN = "compliance_scan"
    DISCOVERY_SCAN = "discovery_scan"
    REMEDIATION_SCAN = "remediation_scan"
    MONITORING_SCAN = "monitoring_scan"

class WorkflowStatus(str, Enum):
    """Status of workflow executions"""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"
    PARTIALLY_COMPLETED = "partially_completed"

class StepType(str, Enum):
    """Types of workflow steps"""
    SCAN_OPERATION = "scan_operation"
    DATA_VALIDATION = "data_validation"
    QUALITY_CHECK = "quality_check"
    APPROVAL_GATE = "approval_gate"
    NOTIFICATION = "notification"
    DATA_TRANSFORMATION = "data_transformation"
    RULE_EXECUTION = "rule_execution"
    CONDITION_CHECK = "condition_check"
    PARALLEL_EXECUTION = "parallel_execution"
    SEQUENTIAL_EXECUTION = "sequential_execution"
    EXTERNAL_INTEGRATION = "external_integration"
    MANUAL_INTERVENTION = "manual_intervention"

class StepStatus(str, Enum):
    """Status of individual workflow steps"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    WAITING_APPROVAL = "waiting_approval"
    WAITING_CONDITION = "waiting_condition"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"
    RETRY = "retry"

class ConditionType(str, Enum):
    """Types of workflow conditions"""
    DATA_THRESHOLD = "data_threshold"
    QUALITY_SCORE = "quality_score"
    TIME_BASED = "time_based"
    RESOURCE_AVAILABILITY = "resource_availability"
    EXTERNAL_DEPENDENCY = "external_dependency"
    USER_INPUT = "user_input"
    BUSINESS_RULE = "business_rule"
    SYSTEM_STATE = "system_state"
    COMPLIANCE_CHECK = "compliance_check"
    COST_THRESHOLD = "cost_threshold"

class ApprovalType(str, Enum):
    """Types of approval requirements"""
    SINGLE_APPROVER = "single_approver"
    MULTIPLE_APPROVERS = "multiple_approvers"
    HIERARCHICAL_APPROVAL = "hierarchical_approval"
    CONSENSUS_APPROVAL = "consensus_approval"
    ROLE_BASED_APPROVAL = "role_based_approval"
    AUTOMATIC_APPROVAL = "automatic_approval"
    CONDITIONAL_APPROVAL = "conditional_approval"
    ESCALATED_APPROVAL = "escalated_approval"

class WorkflowPriority(str, Enum):
    """Priority levels for workflow execution"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

class ExecutionMode(str, Enum):
    """Execution modes for workflows"""
    IMMEDIATE = "immediate"
    SCHEDULED = "scheduled"
    TRIGGERED = "triggered"
    MANUAL = "manual"
    BATCH = "batch"
    REAL_TIME = "real_time"

# ====================================================================
# CORE WORKFLOW MODELS
# ====================================================================

class ScanWorkflow(SQLModel, table=True):
    """Master workflow definition for scan operations"""
    __tablename__ = "scan_workflows"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    workflow_id: str = Field(max_length=100, index=True)
    workflow_name: str = Field(max_length=200)
    
    # Workflow definition
    workflow_type: WorkflowType
    workflow_description: str = Field(max_length=2000)
    workflow_version: str = Field(max_length=50, default="1.0")
    is_active: bool = Field(default=True)
    
    # Workflow configuration
    execution_mode: ExecutionMode = Field(default=ExecutionMode.MANUAL)
    priority: WorkflowPriority = Field(default=WorkflowPriority.NORMAL)
    max_concurrent_executions: int = Field(default=1)
    timeout_minutes: Optional[int] = Field(default=120)
    retry_attempts: int = Field(default=3)
    
    # Business context
    business_owner: str = Field(max_length=100)
    business_justification: Optional[str] = Field(max_length=1000)
    business_impact: Optional[str] = Field(max_length=100)
    cost_center: Optional[str] = Field(max_length=100)
    
    # Compliance and governance
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    audit_level: Optional[str] = Field(max_length=50, default="standard")
    data_sensitivity_level: Optional[str] = Field(max_length=50)
    regulatory_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Resource requirements
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    estimated_cost: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None
    required_permissions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Scheduling configuration
    schedule_expression: Optional[str] = Field(max_length=200)  # cron expression
    schedule_timezone: Optional[str] = Field(max_length=50)
    schedule_start_date: Optional[datetime] = None
    schedule_end_date: Optional[datetime] = None
    
    # Notification settings
    notification_channels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    notification_recipients: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    notification_events: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Error handling
    error_handling_strategy: Optional[str] = Field(max_length=100, default="fail_fast")
    rollback_strategy: Optional[str] = Field(max_length=100)
    recovery_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Performance tracking
    execution_count: int = Field(default=0)
    success_count: int = Field(default=0)
    failure_count: int = Field(default=0)
    average_execution_time: Optional[float] = None
    last_executed_at: Optional[datetime] = None
    
    # Lifecycle management
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    version_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    steps: List["WorkflowStep"] = Relationship(back_populates="workflow")
    executions: List["WorkflowExecution"] = Relationship(back_populates="workflow")
    approvals: List["WorkflowApproval"] = Relationship(back_populates="workflow")

class WorkflowStep(SQLModel, table=True):
    """Individual steps within a workflow"""
    __tablename__ = "workflow_steps"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    step_id: str = Field(max_length=100, index=True)
    workflow_id: UUID = Field(foreign_key="scan_workflows.id", index=True)
    
    # Step definition
    step_name: str = Field(max_length=200)
    step_type: StepType
    step_description: Optional[str] = Field(max_length=1000)
    step_order: int = Field(index=True)
    
    # Step configuration
    is_required: bool = Field(default=True)
    is_parallel: bool = Field(default=False)
    can_skip: bool = Field(default=False)
    timeout_minutes: Optional[int] = Field(default=30)
    retry_attempts: int = Field(default=3)
    retry_delay_seconds: int = Field(default=60)
    
    # Step parameters
    step_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    input_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    output_specifications: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Dependencies and conditions
    predecessor_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    successor_steps: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    execution_conditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    skip_conditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Resource requirements
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    estimated_duration_minutes: Optional[int] = None
    estimated_cost: Optional[float] = None
    
    # Approval requirements
    requires_approval: bool = Field(default=False)
    approval_type: Optional[ApprovalType] = None
    approvers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    approval_criteria: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Error handling
    error_handling: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    rollback_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    failure_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Performance tracking
    execution_count: int = Field(default=0)
    success_count: int = Field(default=0)
    failure_count: int = Field(default=0)
    average_execution_time: Optional[float] = None
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    workflow: ScanWorkflow = Relationship(back_populates="steps")
    executions: List["StepExecution"] = Relationship(back_populates="step")
    conditions: List["WorkflowCondition"] = Relationship(back_populates="step")

class WorkflowExecution(SQLModel, table=True):
    """Execution instances of workflows"""
    __tablename__ = "workflow_executions"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    execution_id: str = Field(max_length=100, index=True)
    workflow_id: UUID = Field(foreign_key="scan_workflows.id", index=True)
    
    # Execution context
    execution_type: str = Field(max_length=50)  # scheduled, manual, triggered
    triggered_by: Optional[str] = Field(max_length=100)
    trigger_event: Optional[str] = Field(max_length=200)
    execution_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution status
    status: WorkflowStatus = Field(default=WorkflowStatus.QUEUED, index=True)
    priority: WorkflowPriority = Field(default=WorkflowPriority.NORMAL)
    progress_percentage: Optional[float] = Field(ge=0.0, le=100.0)
    
    # Execution timeline
    queued_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    estimated_completion_time: Optional[datetime] = None
    
    # Step tracking
    total_steps: int = Field(default=0)
    completed_steps: int = Field(default=0)
    failed_steps: int = Field(default=0)
    skipped_steps: int = Field(default=0)
    current_step_id: Optional[str] = Field(max_length=100)
    
    # Results and outputs
    execution_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    output_artifacts: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    generated_reports: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Resource utilization
    cpu_time_seconds: Optional[float] = None
    memory_used_mb: Optional[float] = None
    storage_used_mb: Optional[float] = None
    network_io_mb: Optional[float] = None
    actual_cost: Optional[float] = None
    
    # Error tracking
    error_count: int = Field(default=0)
    warnings: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    errors: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    last_error: Optional[str] = Field(max_length=2000)
    
    # Approval tracking
    approval_required: bool = Field(default=False)
    pending_approvals: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    approved_by: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    approval_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Business metrics
    business_value_delivered: Optional[float] = None
    compliance_score: Optional[float] = None
    quality_improvement: Optional[float] = None
    
    # Metadata
    execution_environment: Optional[str] = Field(max_length=100)
    execution_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    execution_notes: Optional[str] = Field(max_length=2000)
    
    # Relationships
    workflow: ScanWorkflow = Relationship(back_populates="executions")
    step_executions: List["StepExecution"] = Relationship(back_populates="workflow_execution")

class StepExecution(SQLModel, table=True):
    """Execution instances of workflow steps"""
    __tablename__ = "step_executions"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    execution_id: str = Field(max_length=100, index=True)
    step_id: UUID = Field(foreign_key="workflow_steps.id", index=True)
    workflow_execution_id: UUID = Field(foreign_key="workflow_executions.id", index=True)
    
    # Execution details
    status: StepStatus = Field(default=StepStatus.PENDING, index=True)
    attempt_number: int = Field(default=1)
    execution_order: int
    
    # Execution timeline
    queued_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Execution context
    input_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    output_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    execution_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Conditions evaluation
    conditions_evaluated: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    conditions_met: bool = Field(default=True)
    skip_reason: Optional[str] = Field(max_length=500)
    
    # Resource utilization
    cpu_time_ms: Optional[int] = None
    memory_used_mb: Optional[float] = None
    io_operations: Optional[int] = None
    step_cost: Optional[float] = None
    
    # Error handling
    error_message: Optional[str] = Field(max_length=2000)
    error_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    retry_count: int = Field(default=0)
    rollback_required: bool = Field(default=False)
    rollback_completed: bool = Field(default=False)
    
    # Approval tracking
    approval_requested_at: Optional[datetime] = None
    approval_received_at: Optional[datetime] = None
    approved_by: Optional[str] = Field(max_length=100)
    approval_notes: Optional[str] = Field(max_length=1000)
    
    # Quality metrics
    quality_score: Optional[float] = None
    performance_score: Optional[float] = None
    completion_confidence: Optional[float] = None
    
    # Relationships
    step: WorkflowStep = Relationship(back_populates="executions")
    workflow_execution: WorkflowExecution = Relationship(back_populates="step_executions")

# ====================================================================
# WORKFLOW CONDITION MODELS
# ====================================================================

class WorkflowCondition(SQLModel, table=True):
    """Conditions that control workflow execution flow"""
    __tablename__ = "workflow_conditions"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    condition_id: str = Field(max_length=100, index=True)
    step_id: UUID = Field(foreign_key="workflow_steps.id", index=True)
    
    # Condition definition
    condition_name: str = Field(max_length=200)
    condition_type: ConditionType
    condition_description: Optional[str] = Field(max_length=1000)
    
    # Condition logic
    condition_expression: str = Field(max_length=2000)
    condition_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    evaluation_criteria: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Condition behavior
    is_blocking: bool = Field(default=True)
    timeout_minutes: Optional[int] = Field(default=60)
    retry_attempts: int = Field(default=3)
    retry_interval_seconds: int = Field(default=30)
    
    # Business context
    business_justification: Optional[str] = Field(max_length=1000)
    compliance_requirement: Optional[str] = Field(max_length=200)
    risk_level: Optional[str] = Field(max_length=50)
    
    # Dependencies
    dependent_conditions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    external_dependencies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Performance tracking
    evaluation_count: int = Field(default=0)
    success_count: int = Field(default=0)
    failure_count: int = Field(default=0)
    average_evaluation_time: Optional[float] = None
    last_evaluated_at: Optional[datetime] = None
    
    # Lifecycle
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    
    # Relationships
    step: WorkflowStep = Relationship(back_populates="conditions")
    evaluations: List["ConditionEvaluation"] = Relationship(back_populates="condition")

class ConditionEvaluation(SQLModel, table=True):
    """Individual evaluations of workflow conditions"""
    __tablename__ = "condition_evaluations"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    evaluation_id: str = Field(max_length=100, index=True)
    condition_id: UUID = Field(foreign_key="workflow_conditions.id", index=True)
    
    # Evaluation context
    evaluation_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    evaluation_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    triggered_by: Optional[str] = Field(max_length=100)
    
    # Evaluation results
    result: bool = Field(default=False)
    confidence_score: Optional[float] = Field(ge=0.0, le=1.0)
    evaluation_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance metrics
    evaluation_time_ms: Optional[int] = None
    resource_cost: Optional[float] = None
    
    # Error handling
    error_occurred: bool = Field(default=False)
    error_message: Optional[str] = Field(max_length=1000)
    retry_count: int = Field(default=0)
    
    # Business impact
    business_impact: Optional[str] = Field(max_length=200)
    risk_assessment: Optional[str] = Field(max_length=200)
    
    # Relationship
    condition: WorkflowCondition = Relationship(back_populates="evaluations")

# ====================================================================
# WORKFLOW APPROVAL MODELS
# ====================================================================

class WorkflowApproval(SQLModel, table=True):
    """Approval requests and tracking for workflows"""
    __tablename__ = "workflow_approvals"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    approval_id: str = Field(max_length=100, index=True)
    workflow_id: UUID = Field(foreign_key="scan_workflows.id", index=True)
    
    # Approval request details
    approval_type: ApprovalType
    approval_subject: str = Field(max_length=200)
    approval_description: str = Field(max_length=2000)
    requested_by: str = Field(max_length=100)
    
    # Approval requirements
    required_approvers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    approval_criteria: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    minimum_approvals: int = Field(default=1)
    escalation_levels: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Approval status
    status: str = Field(max_length=50, default="pending", index=True)
    current_approvers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    approved_by: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    rejected_by: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Timeline tracking
    requested_at: datetime = Field(default_factory=datetime.utcnow)
    first_response_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    escalation_deadline: Optional[datetime] = None
    
    # Business context
    business_justification: str = Field(max_length=2000)
    risk_assessment: Optional[str] = Field(max_length=1000)
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    estimated_cost: Optional[float] = None
    expected_benefits: Optional[str] = Field(max_length=1000)
    
    # Decision tracking
    approval_comments: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    conditions_attached: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    final_decision: Optional[str] = Field(max_length=2000)
    decision_rationale: Optional[str] = Field(max_length=2000)
    
    # Notification tracking
    notifications_sent: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    reminders_sent: int = Field(default=0)
    escalations_triggered: int = Field(default=0)
    
    # Relationships
    workflow: ScanWorkflow = Relationship(back_populates="approvals")
    approval_actions: List["ApprovalAction"] = Relationship(back_populates="approval")

class ApprovalAction(SQLModel, table=True):
    """Individual approval actions taken by approvers"""
    __tablename__ = "approval_actions"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    action_id: str = Field(max_length=100, index=True)
    approval_id: UUID = Field(foreign_key="workflow_approvals.id", index=True)
    
    # Action details
    approver: str = Field(max_length=100, index=True)
    action_type: str = Field(max_length=50)  # approve, reject, delegate, request_info
    action_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Action content
    comments: Optional[str] = Field(max_length=2000)
    conditions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Delegation handling
    delegated_to: Optional[str] = Field(max_length=100)
    delegation_reason: Optional[str] = Field(max_length=500)
    delegation_deadline: Optional[datetime] = None
    
    # Business context
    business_rationale: Optional[str] = Field(max_length=1000)
    risk_considerations: Optional[str] = Field(max_length=1000)
    
    # Relationship
    approval: WorkflowApproval = Relationship(back_populates="approval_actions")

# ====================================================================
# WORKFLOW TEMPLATE MODELS
# ====================================================================

class WorkflowTemplate(SQLModel, table=True):
    """Reusable workflow templates"""
    __tablename__ = "workflow_templates"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    template_id: str = Field(max_length=100, index=True)
    template_name: str = Field(max_length=200)
    
    # Template definition
    template_description: str = Field(max_length=2000)
    template_category: str = Field(max_length=100)
    template_version: str = Field(max_length=50, default="1.0")
    is_public: bool = Field(default=False)
    
    # Template structure
    workflow_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    step_definitions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    condition_definitions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Template parameters
    configurable_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    parameter_defaults: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    parameter_validation: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business context
    use_cases: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    business_domains: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_frameworks: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Template metrics
    usage_count: int = Field(default=0)
    success_rate: Optional[float] = None
    average_execution_time: Optional[float] = None
    user_rating: Optional[float] = None
    
    # Lifecycle management
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    approved_by: Optional[str] = Field(max_length=100)
    approval_date: Optional[datetime] = None
    
    # Template usage tracking
    instantiations: List["WorkflowInstance"] = Relationship(back_populates="template")

class WorkflowInstance(SQLModel, table=True):
    """Instances created from workflow templates"""
    __tablename__ = "workflow_instances"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    instance_id: str = Field(max_length=100, index=True)
    template_id: UUID = Field(foreign_key="workflow_templates.id", index=True)
    
    # Instance configuration
    instance_name: str = Field(max_length=200)
    parameter_values: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    customizations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Instance lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(max_length=100)
    instantiation_reason: Optional[str] = Field(max_length=1000)
    
    # Performance tracking
    execution_count: int = Field(default=0)
    success_count: int = Field(default=0)
    last_executed_at: Optional[datetime] = None
    
    # Relationship
    template: WorkflowTemplate = Relationship(back_populates="instantiations")

# ====================================================================
# WORKFLOW ANALYTICS MODELS
# ====================================================================

class WorkflowAnalytics(SQLModel, table=True):
    """Analytics for workflow operations"""
    __tablename__ = "workflow_analytics"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    analytics_id: str = Field(max_length=100, index=True)
    
    # Time dimensions
    analytics_date: datetime = Field(index=True)
    time_period: str = Field(max_length=50)  # hour, day, week, month
    
    # Workflow execution metrics
    workflows_executed: int = Field(default=0)
    successful_workflows: int = Field(default=0)
    failed_workflows: int = Field(default=0)
    average_execution_time: Optional[float] = None
    
    # Step execution metrics
    total_steps_executed: int = Field(default=0)
    successful_steps: int = Field(default=0)
    failed_steps: int = Field(default=0)
    skipped_steps: int = Field(default=0)
    
    # Approval metrics
    approvals_requested: int = Field(default=0)
    approvals_granted: int = Field(default=0)
    approvals_rejected: int = Field(default=0)
    average_approval_time: Optional[float] = None
    
    # Resource utilization
    total_cpu_time: Optional[float] = None
    total_memory_used: Optional[float] = None
    total_cost: Optional[float] = None
    resource_efficiency: Optional[float] = None
    
    # Business impact
    business_value_delivered: Optional[float] = None
    compliance_improvements: Optional[float] = None
    operational_efficiency: Optional[float] = None
    cost_savings: Optional[float] = None

# ====================================================================
# REQUEST/RESPONSE MODELS
# ====================================================================

class CreateWorkflowRequest(BaseModel):
    """Request to create a new workflow"""
    workflow_name: str = PydanticField(max_length=200)
    workflow_type: WorkflowType
    workflow_description: str = PydanticField(max_length=2000)
    business_owner: str = PydanticField(max_length=100)
    execution_mode: ExecutionMode = ExecutionMode.MANUAL
    priority: WorkflowPriority = WorkflowPriority.NORMAL

class WorkflowStepRequest(BaseModel):
    """Request to add/update a workflow step"""
    step_name: str = PydanticField(max_length=200)
    step_type: StepType
    step_order: int
    step_parameters: Dict[str, Any] = {}
    requires_approval: bool = False
    timeout_minutes: int = 30

class ExecuteWorkflowRequest(BaseModel):
    """Request to execute a workflow"""
    workflow_id: str
    execution_type: str = "manual"
    execution_context: Dict[str, Any] = {}
    priority: WorkflowPriority = WorkflowPriority.NORMAL

class ApprovalRequest(BaseModel):
    """Request for workflow approval"""
    approval_type: ApprovalType
    approval_subject: str = PydanticField(max_length=200)
    approval_description: str = PydanticField(max_length=2000)
    required_approvers: List[str]
    business_justification: str = PydanticField(max_length=2000)

class WorkflowResponse(BaseModel):
    """Response for workflow operations"""
    workflow_id: str
    workflow_name: str
    status: WorkflowStatus
    created_at: datetime
    execution_count: int
    success_rate: Optional[float]

class WorkflowExecutionResponse(BaseModel):
    """Response for workflow execution"""
    execution_id: str
    workflow_id: str
    status: WorkflowStatus
    progress_percentage: Optional[float]
    started_at: Optional[datetime]
    estimated_completion_time: Optional[datetime]
    current_step: Optional[str]

class ApprovalResponse(BaseModel):
    """Response for approval operations"""
    approval_id: str
    status: str
    required_approvers: List[str]
    approved_by: List[str]
    requested_at: datetime
    escalation_deadline: Optional[datetime]

# ====================================================================
# UTILITY FUNCTIONS  
# ====================================================================

def generate_workflow_uuid() -> str:
    """Generate a UUID for workflow operations"""
    return f"wf_{uuid4().hex[:12]}"

def calculate_workflow_success_rate(
    total_executions: int,
    successful_executions: int
) -> float:
    """Calculate workflow success rate"""
    if total_executions == 0:
        return 0.0
    return (successful_executions / total_executions) * 100

def estimate_workflow_duration(
    steps: List[Dict[str, Any]],
    parallel_execution: bool = False
) -> int:
    """Estimate workflow execution duration in minutes"""
    if not steps:
        return 0
    
    if parallel_execution:
        # For parallel execution, take the maximum step duration
        return max(step.get('estimated_duration_minutes', 5) for step in steps)
    else:
        # For sequential execution, sum all step durations
        return sum(step.get('estimated_duration_minutes', 5) for step in steps)

def calculate_approval_efficiency(
    requested_approvals: int,
    completed_approvals: int,
    average_approval_time: float
) -> float:
    """Calculate approval process efficiency"""
    if requested_approvals == 0:
        return 0.0
    
    completion_rate = (completed_approvals / requested_approvals) * 100
    time_efficiency = max(0, 100 - (average_approval_time / 24))  # Normalize to 24 hours
    
    return (completion_rate + time_efficiency) / 2

def determine_workflow_complexity(
    step_count: int,
    condition_count: int,
    approval_count: int,
    parallel_steps: int
) -> str:
    """Determine workflow complexity level"""
    complexity_score = (
        step_count * 1 +
        condition_count * 2 +
        approval_count * 3 +
        parallel_steps * 1.5
    )
    
    if complexity_score <= 5:
        return "simple"
    elif complexity_score <= 15:
        return "moderate"
    elif complexity_score <= 30:
        return "complex"
    else:
        return "very_complex"