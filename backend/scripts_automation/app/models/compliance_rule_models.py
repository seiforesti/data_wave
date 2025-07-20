from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import json


class ComplianceRuleType(str, Enum):
    REGULATORY = "regulatory"
    INTERNAL = "internal"
    SECURITY = "security"
    PRIVACY = "privacy"
    QUALITY = "quality"
    ACCESS_CONTROL = "access_control"
    DATA_RETENTION = "data_retention"
    ENCRYPTION = "encryption"
    AUDIT = "audit"
    CUSTOM = "custom"


class ComplianceRuleSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ComplianceRuleStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    DEPRECATED = "deprecated"
    TESTING = "testing"


class ComplianceRuleScope(str, Enum):
    GLOBAL = "global"
    DATA_SOURCE = "data_source"
    SCHEMA = "schema"
    TABLE = "table"
    COLUMN = "column"
    FIELD = "field"


class RuleValidationStatus(str, Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    ERROR = "error"
    NOT_APPLICABLE = "not_applicable"
    PENDING = "pending"


class WorkflowStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"


# Core Compliance Rule Model
class ComplianceRule(SQLModel, table=True):
    """Compliance rule model for managing compliance rules and policies"""
    __tablename__ = "compliance_rules"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Basic Information
    name: str = Field(index=True)
    description: str
    rule_type: ComplianceRuleType
    severity: ComplianceRuleSeverity
    status: ComplianceRuleStatus = Field(default=ComplianceRuleStatus.DRAFT)
    
    # Scope and Applicability
    scope: ComplianceRuleScope = Field(default=ComplianceRuleScope.GLOBAL)
    entity_types: List[str] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    data_source_ids: List[int] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    
    # Rule Definition
    condition: str  # JSON or expression string representing the condition
    rule_definition: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Compliance Framework
    compliance_standard: Optional[str] = None  # e.g., "GDPR", "SOX", "HIPAA"
    reference: Optional[str] = None  # Reference to external standard or regulation
    reference_link: Optional[str] = None
    
    # Remediation
    remediation_steps: Optional[str] = None
    auto_remediation: bool = Field(default=False)
    
    # Validation and Monitoring
    validation_frequency: str = Field(default="daily")  # daily, weekly, monthly
    is_automated: bool = Field(default=True)
    last_evaluated_at: Optional[datetime] = None
    next_evaluation_at: Optional[datetime] = None
    
    # Business Context
    business_impact: str = Field(default="medium")  # low, medium, high, critical
    regulatory_requirement: bool = Field(default=False)
    
    # Metadata
    tags: List[str] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    metadata: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # System Fields
    is_built_in: bool = Field(default=False)
    is_global: bool = Field(default=True)
    version: int = Field(default=1)
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)
    updated_by: Optional[str] = None
    
    # Performance Metrics
    pass_rate: float = Field(default=0.0)
    total_entities: int = Field(default=0)
    passing_entities: int = Field(default=0)
    failing_entities: int = Field(default=0)
    
    # Relationships
    evaluations: List["ComplianceRuleEvaluation"] = Relationship(back_populates="rule")
    issues: List["ComplianceIssue"] = Relationship(back_populates="rule")
    workflows: List["ComplianceWorkflow"] = Relationship(back_populates="rule")


class ComplianceRuleTemplate(SQLModel, table=True):
    """Template model for creating compliance rules"""
    __tablename__ = "compliance_rule_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Template Information
    name: str = Field(index=True)
    description: str
    rule_type: ComplianceRuleType
    severity: ComplianceRuleSeverity
    
    # Template Definition
    condition_template: str  # Template with placeholders
    parameter_definitions: List[Dict[str, Any]] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    scope: ComplianceRuleScope
    entity_types: List[str] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    
    # Default Values
    default_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    remediation_template: Optional[str] = None
    reference_url: Optional[str] = None
    
    # System Fields
    is_built_in: bool = Field(default=True)
    category: Optional[str] = None
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)
    updated_by: Optional[str] = None


class ComplianceRuleEvaluation(SQLModel, table=True):
    """Model for tracking compliance rule evaluation results"""
    __tablename__ = "compliance_rule_evaluations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: int = Field(foreign_key="compliance_rules.id", index=True)
    
    # Evaluation Details
    evaluation_id: str = Field(index=True)  # Unique identifier for this evaluation
    evaluated_at: datetime = Field(default_factory=datetime.now)
    status: RuleValidationStatus
    
    # Results
    entity_count: Dict[str, int] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    compliance_score: float = Field(default=0.0)
    issues_found: int = Field(default=0)
    
    # Performance
    execution_time_ms: Optional[int] = None
    entities_processed: int = Field(default=0)
    
    # Error Handling
    error_message: Optional[str] = None
    warnings: List[str] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    
    # Metadata
    evaluation_context: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    metadata: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Relationships
    rule: ComplianceRule = Relationship(back_populates="evaluations")


class ComplianceIssue(SQLModel, table=True):
    """Model for tracking compliance issues found by rules"""
    __tablename__ = "compliance_issues"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: int = Field(foreign_key="compliance_rules.id", index=True)
    
    # Issue Details
    issue_id: str = Field(index=True)  # Unique identifier
    title: str
    description: str
    severity: ComplianceRuleSeverity
    
    # Location Information
    data_source_id: Optional[int] = None
    schema_name: Optional[str] = None
    table_name: Optional[str] = None
    column_name: Optional[str] = None
    entity_path: Optional[str] = None
    
    # Status and Resolution
    status: str = Field(default="open")  # open, in_progress, resolved, false_positive, accepted_risk
    resolution: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    
    # Assignment and Tracking
    assigned_to: Optional[str] = None
    priority: str = Field(default="medium")  # low, medium, high, critical
    due_date: Optional[datetime] = None
    
    # Evidence and Context
    evidence: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    context: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Remediation
    remediation_steps: Optional[str] = None
    remediation_status: str = Field(default="pending")
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    rule: ComplianceRule = Relationship(back_populates="issues")


class ComplianceWorkflow(SQLModel, table=True):
    """Model for compliance workflow automation"""
    __tablename__ = "compliance_workflows"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: Optional[int] = Field(foreign_key="compliance_rules.id")
    
    # Workflow Definition
    name: str = Field(index=True)
    description: Optional[str] = None
    workflow_type: str  # approval, remediation, notification, escalation
    
    # Trigger Configuration
    trigger_conditions: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    trigger_events: List[str] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    
    # Workflow Steps
    steps: List[Dict[str, Any]] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    approval_required: bool = Field(default=False)
    approvers: List[str] = Field(default_factory=list, sa_column_kwargs={"type_": "JSON"})
    
    # Status and Control
    status: WorkflowStatus = Field(default=WorkflowStatus.PENDING)
    is_active: bool = Field(default=True)
    priority: str = Field(default="medium")
    
    # Execution Configuration
    timeout_minutes: Optional[int] = None
    retry_count: int = Field(default=0)
    max_retries: int = Field(default=3)
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)
    updated_by: Optional[str] = None
    
    # Relationships
    rule: Optional[ComplianceRule] = Relationship(back_populates="workflows")
    executions: List["ComplianceWorkflowExecution"] = Relationship(back_populates="workflow")


class ComplianceWorkflowExecution(SQLModel, table=True):
    """Model for tracking workflow execution instances"""
    __tablename__ = "compliance_workflow_executions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: int = Field(foreign_key="compliance_workflows.id", index=True)
    
    # Execution Details
    execution_id: str = Field(index=True)
    status: WorkflowStatus = Field(default=WorkflowStatus.PENDING)
    
    # Timing
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Results
    result: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    error_message: Optional[str] = None
    
    # Context
    trigger_context: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    execution_context: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type_": "JSON"})
    
    # Audit Fields
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    workflow: ComplianceWorkflow = Relationship(back_populates="executions")


# Response Models
class ComplianceRuleResponse(SQLModel):
    id: int
    name: str
    description: str
    rule_type: ComplianceRuleType
    severity: ComplianceRuleSeverity
    status: ComplianceRuleStatus
    scope: ComplianceRuleScope
    entity_types: List[str]
    data_source_ids: List[int]
    condition: str
    rule_definition: Dict[str, Any]
    parameters: Dict[str, Any]
    compliance_standard: Optional[str]
    reference: Optional[str]
    reference_link: Optional[str]
    remediation_steps: Optional[str]
    auto_remediation: bool
    validation_frequency: str
    is_automated: bool
    last_evaluated_at: Optional[datetime]
    next_evaluation_at: Optional[datetime]
    business_impact: str
    regulatory_requirement: bool
    tags: List[str]
    metadata: Dict[str, Any]
    is_built_in: bool
    is_global: bool
    version: int
    created_at: datetime
    created_by: Optional[str]
    updated_at: datetime
    updated_by: Optional[str]
    pass_rate: float
    total_entities: int
    passing_entities: int
    failing_entities: int


class ComplianceRuleEvaluationResponse(SQLModel):
    id: int
    rule_id: int
    evaluation_id: str
    evaluated_at: datetime
    status: RuleValidationStatus
    entity_count: Dict[str, int]
    compliance_score: float
    issues_found: int
    execution_time_ms: Optional[int]
    entities_processed: int
    error_message: Optional[str]
    warnings: List[str]
    evaluation_context: Dict[str, Any]
    metadata: Dict[str, Any]


class ComplianceIssueResponse(SQLModel):
    id: int
    rule_id: int
    issue_id: str
    title: str
    description: str
    severity: ComplianceRuleSeverity
    data_source_id: Optional[int]
    schema_name: Optional[str]
    table_name: Optional[str]
    column_name: Optional[str]
    entity_path: Optional[str]
    status: str
    resolution: Optional[str]
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]
    assigned_to: Optional[str]
    priority: str
    due_date: Optional[datetime]
    evidence: Dict[str, Any]
    context: Dict[str, Any]
    remediation_steps: Optional[str]
    remediation_status: str
    created_at: datetime
    updated_at: datetime


class ComplianceWorkflowResponse(SQLModel):
    id: int
    rule_id: Optional[int]
    name: str
    description: Optional[str]
    workflow_type: str
    trigger_conditions: Dict[str, Any]
    trigger_events: List[str]
    steps: List[Dict[str, Any]]
    approval_required: bool
    approvers: List[str]
    status: WorkflowStatus
    is_active: bool
    priority: str
    timeout_minutes: Optional[int]
    retry_count: int
    max_retries: int
    metadata: Dict[str, Any]
    created_at: datetime
    created_by: Optional[str]
    updated_at: datetime
    updated_by: Optional[str]


# Create Models
class ComplianceRuleCreate(SQLModel):
    name: str
    description: str
    rule_type: ComplianceRuleType
    severity: ComplianceRuleSeverity
    status: ComplianceRuleStatus = ComplianceRuleStatus.DRAFT
    scope: ComplianceRuleScope = ComplianceRuleScope.GLOBAL
    entity_types: List[str] = []
    data_source_ids: List[int] = []
    condition: str
    rule_definition: Dict[str, Any] = {}
    parameters: Dict[str, Any] = {}
    compliance_standard: Optional[str] = None
    reference: Optional[str] = None
    reference_link: Optional[str] = None
    remediation_steps: Optional[str] = None
    auto_remediation: bool = False
    validation_frequency: str = "daily"
    is_automated: bool = True
    business_impact: str = "medium"
    regulatory_requirement: bool = False
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    is_global: bool = True


class ComplianceIssueCreate(SQLModel):
    rule_id: int
    issue_id: str
    title: str
    description: str
    severity: ComplianceRuleSeverity
    data_source_id: Optional[int] = None
    schema_name: Optional[str] = None
    table_name: Optional[str] = None
    column_name: Optional[str] = None
    entity_path: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None
    evidence: Dict[str, Any] = {}
    context: Dict[str, Any] = {}
    remediation_steps: Optional[str] = None


class ComplianceWorkflowCreate(SQLModel):
    rule_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    workflow_type: str
    trigger_conditions: Dict[str, Any] = {}
    trigger_events: List[str] = []
    steps: List[Dict[str, Any]] = []
    approval_required: bool = False
    approvers: List[str] = []
    priority: str = "medium"
    timeout_minutes: Optional[int] = None
    max_retries: int = 3
    metadata: Dict[str, Any] = {}


# Update Models
class ComplianceRuleUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rule_type: Optional[ComplianceRuleType] = None
    severity: Optional[ComplianceRuleSeverity] = None
    status: Optional[ComplianceRuleStatus] = None
    scope: Optional[ComplianceRuleScope] = None
    entity_types: Optional[List[str]] = None
    data_source_ids: Optional[List[int]] = None
    condition: Optional[str] = None
    rule_definition: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    compliance_standard: Optional[str] = None
    reference: Optional[str] = None
    reference_link: Optional[str] = None
    remediation_steps: Optional[str] = None
    auto_remediation: Optional[bool] = None
    validation_frequency: Optional[str] = None
    is_automated: Optional[bool] = None
    business_impact: Optional[str] = None
    regulatory_requirement: Optional[bool] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    is_global: Optional[bool] = None


class ComplianceIssueUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[ComplianceRuleSeverity] = None
    status: Optional[str] = None
    resolution: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    evidence: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None
    remediation_steps: Optional[str] = None
    remediation_status: Optional[str] = None


class ComplianceWorkflowUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    workflow_type: Optional[str] = None
    trigger_conditions: Optional[Dict[str, Any]] = None
    trigger_events: Optional[List[str]] = None
    steps: Optional[List[Dict[str, Any]]] = None
    approval_required: Optional[bool] = None
    approvers: Optional[List[str]] = None
    status: Optional[WorkflowStatus] = None
    is_active: Optional[bool] = None
    priority: Optional[str] = None
    timeout_minutes: Optional[int] = None
    max_retries: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None