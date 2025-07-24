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

from sqlmodel import SQLModel, Field, Relationship
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from enum import Enum
from uuid import UUID, uuid4
from pydantic import BaseModel, validator
import json


# ===============================
# EXECUTION STATUS ENUMS
# ===============================

class RuleExecutionStatus(str, Enum):
    """Rule execution status enumeration"""
    PENDING = "pending"
    RUNNING = "running" 
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"
    RETRY = "retry"
    PAUSED = "paused"


class ValidationStatus(str, Enum):
    """Rule validation status enumeration"""
    VALID = "valid"
    INVALID = "invalid"
    WARNING = "warning"
    ERROR = "error"
    PENDING = "pending"
    SKIPPED = "skipped"


class ExecutionPriority(str, Enum):
    """Execution priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class ResourceType(str, Enum):
    """Resource type enumeration"""
    CPU = "cpu"
    MEMORY = "memory"
    STORAGE = "storage"
    NETWORK = "network"
    GPU = "gpu"
    DATABASE = "database"


# ===============================
# CORE EXECUTION MODELS
# ===============================

class RuleExecutionHistoryBase(SQLModel):
    """Base model for rule execution history"""
    rule_id: int = Field(description="ID of the executed rule")
    execution_start: datetime = Field(default_factory=datetime.now, description="Execution start timestamp")
    execution_end: Optional[datetime] = Field(default=None, description="Execution end timestamp")
    status: RuleExecutionStatus = Field(default=RuleExecutionStatus.PENDING, description="Execution status")
    priority: ExecutionPriority = Field(default=ExecutionPriority.NORMAL, description="Execution priority")
    
    # Performance Metrics
    duration_seconds: Optional[float] = Field(default=None, description="Execution duration in seconds")
    cpu_usage_percent: Optional[float] = Field(default=None, description="CPU usage percentage")
    memory_usage_mb: Optional[float] = Field(default=None, description="Memory usage in MB")
    records_processed: Optional[int] = Field(default=None, description="Number of records processed")
    records_failed: Optional[int] = Field(default=None, description="Number of records that failed")
    
    # Execution Context
    execution_context: Dict[str, Any] = Field(default_factory=dict, description="Execution context and parameters")
    error_message: Optional[str] = Field(default=None, description="Error message if execution failed")
    error_stack_trace: Optional[str] = Field(default=None, description="Full error stack trace")
    retry_count: int = Field(default=0, description="Number of retry attempts")
    
    # Environment Info
    execution_node: Optional[str] = Field(default=None, description="Node where execution occurred")
    execution_version: Optional[str] = Field(default=None, description="Rule version at execution time")
    triggered_by: Optional[str] = Field(default=None, description="User or system that triggered execution")


class RuleExecutionHistory(RuleExecutionHistoryBase, table=True):
    """Rule execution history tracking"""
    __tablename__ = "rule_execution_history"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    validation_results: List["RuleValidationResult"] = Relationship(back_populates="execution")
    performance_metrics: List["ExecutionPerformanceMetric"] = Relationship(back_populates="execution")


class RuleValidationResultBase(SQLModel):
    """Base model for rule validation results"""
    execution_id: int = Field(description="ID of the execution this validation belongs to")
    validation_type: str = Field(description="Type of validation performed")
    validation_status: ValidationStatus = Field(description="Validation result status")
    
    validation_message: Optional[str] = Field(default=None, description="Validation message or error")
    validation_details: Dict[str, Any] = Field(default_factory=dict, description="Detailed validation results")
    validation_score: Optional[float] = Field(default=None, description="Validation score (0-100)")
    
    # Validation Timing
    validation_start: datetime = Field(default_factory=datetime.now)
    validation_end: Optional[datetime] = Field(default=None)
    validation_duration_ms: Optional[float] = Field(default=None, description="Validation duration in milliseconds")
    
    # Rule Context
    rule_section: Optional[str] = Field(default=None, description="Section of rule that was validated")
    rule_line_number: Optional[int] = Field(default=None, description="Line number if applicable")
    suggested_fix: Optional[str] = Field(default=None, description="Suggested fix for validation issues")


class RuleValidationResult(RuleValidationResultBase, table=True):
    """Rule validation results"""
    __tablename__ = "rule_validation_results"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    execution_id: int = Field(foreign_key="rule_execution_history.id")
    execution: Optional[RuleExecutionHistory] = Relationship(back_populates="validation_results")


class ExecutionPerformanceMetricBase(SQLModel):
    """Base model for execution performance metrics"""
    execution_id: int = Field(description="ID of the execution")
    metric_name: str = Field(description="Name of the performance metric")
    metric_value: float = Field(description="Metric value")
    metric_unit: str = Field(description="Unit of measurement")
    
    measurement_time: datetime = Field(default_factory=datetime.now, description="When metric was measured")
    metric_category: str = Field(description="Category of metric (performance, resource, quality)")
    
    # Threshold Information
    warning_threshold: Optional[float] = Field(default=None, description="Warning threshold value")
    critical_threshold: Optional[float] = Field(default=None, description="Critical threshold value")
    is_within_threshold: bool = Field(default=True, description="Whether metric is within acceptable range")
    
    # Additional Context
    metric_metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metric metadata")


class ExecutionPerformanceMetric(ExecutionPerformanceMetricBase, table=True):
    """Execution performance metrics"""
    __tablename__ = "execution_performance_metrics"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    execution_id: int = Field(foreign_key="rule_execution_history.id")
    execution: Optional[RuleExecutionHistory] = Relationship(back_populates="performance_metrics")


# ===============================
# ORCHESTRATION MODELS
# ===============================

class OrchestrationJobBase(SQLModel):
    """Base model for orchestration jobs"""
    job_name: str = Field(description="Name of the orchestration job")
    job_description: Optional[str] = Field(default=None, description="Job description")
    job_type: str = Field(description="Type of orchestration job")
    
    # Scheduling
    schedule_expression: Optional[str] = Field(default=None, description="Cron-like schedule expression")
    is_scheduled: bool = Field(default=False, description="Whether job is scheduled")
    next_run_time: Optional[datetime] = Field(default=None, description="Next scheduled run time")
    last_run_time: Optional[datetime] = Field(default=None, description="Last run time")
    
    # Configuration
    job_configuration: Dict[str, Any] = Field(default_factory=dict, description="Job configuration parameters")
    environment_variables: Dict[str, str] = Field(default_factory=dict, description="Environment variables")
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, description="Resource requirements")
    
    # Status and Control
    is_active: bool = Field(default=True, description="Whether job is active")
    is_paused: bool = Field(default=False, description="Whether job is paused")
    max_retries: int = Field(default=3, description="Maximum number of retry attempts")
    timeout_minutes: Optional[int] = Field(default=None, description="Job timeout in minutes")
    
    # Owner and Tags
    created_by: str = Field(description="User who created the job")
    job_tags: List[str] = Field(default_factory=list, description="Job tags for organization")


class OrchestrationJob(OrchestrationJobBase, table=True):
    """Orchestration job management"""
    __tablename__ = "orchestration_jobs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    executions: List["JobExecution"] = Relationship(back_populates="job")
    resource_allocations: List["ResourceAllocation"] = Relationship(back_populates="job")


class JobExecutionBase(SQLModel):
    """Base model for job executions"""
    job_id: int = Field(description="ID of the orchestration job")
    execution_uuid: UUID = Field(default_factory=uuid4, description="Unique execution identifier")
    
    # Execution Status
    status: RuleExecutionStatus = Field(default=RuleExecutionStatus.PENDING)
    priority: ExecutionPriority = Field(default=ExecutionPriority.NORMAL)
    
    # Timing
    scheduled_start: Optional[datetime] = Field(default=None, description="Scheduled start time")
    actual_start: Optional[datetime] = Field(default=None, description="Actual start time")
    actual_end: Optional[datetime] = Field(default=None, description="Actual end time")
    duration_seconds: Optional[float] = Field(default=None, description="Execution duration")
    
    # Results
    exit_code: Optional[int] = Field(default=None, description="Job exit code")
    output_summary: Optional[str] = Field(default=None, description="Summary of job output")
    error_summary: Optional[str] = Field(default=None, description="Summary of errors")
    
    # Resource Usage
    peak_cpu_usage: Optional[float] = Field(default=None, description="Peak CPU usage percentage")
    peak_memory_usage: Optional[float] = Field(default=None, description="Peak memory usage in MB")
    total_io_operations: Optional[int] = Field(default=None, description="Total I/O operations")
    
    # Execution Context
    execution_node: Optional[str] = Field(default=None, description="Node where job executed")
    triggered_by: Optional[str] = Field(default=None, description="User or system that triggered execution")
    trigger_type: Optional[str] = Field(default=None, description="Type of trigger (manual, scheduled, event)")


class JobExecution(JobExecutionBase, table=True):
    """Job execution tracking"""
    __tablename__ = "job_executions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    job_id: int = Field(foreign_key="orchestration_jobs.id")
    job: Optional[OrchestrationJob] = Relationship(back_populates="executions")


class ResourceAllocationBase(SQLModel):
    """Base model for resource allocation"""
    job_id: int = Field(description="ID of the orchestration job")
    resource_type: ResourceType = Field(description="Type of allocated resource")
    
    # Allocation Details
    allocated_amount: float = Field(description="Amount of resource allocated")
    allocated_unit: str = Field(description="Unit of allocation")
    allocation_start: datetime = Field(default_factory=datetime.now)
    allocation_end: Optional[datetime] = Field(default=None)
    
    # Usage Tracking
    current_usage: Optional[float] = Field(default=None, description="Current resource usage")
    peak_usage: Optional[float] = Field(default=None, description="Peak resource usage")
    average_usage: Optional[float] = Field(default=None, description="Average resource usage")
    
    # Cost and Billing
    cost_per_unit: Optional[float] = Field(default=None, description="Cost per unit of resource")
    total_cost: Optional[float] = Field(default=None, description="Total cost of allocation")
    
    # Resource Metadata
    resource_pool: Optional[str] = Field(default=None, description="Resource pool name")
    resource_node: Optional[str] = Field(default=None, description="Specific node or instance")
    allocation_metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional allocation metadata")


class ResourceAllocation(ResourceAllocationBase, table=True):
    """Resource allocation tracking"""
    __tablename__ = "resource_allocations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships  
    job_id: int = Field(foreign_key="orchestration_jobs.id")
    job: Optional[OrchestrationJob] = Relationship(back_populates="resource_allocations")


# ===============================
# PATTERN AND INTELLIGENCE MODELS
# ===============================

class PatternRecognitionResultBase(SQLModel):
    """Base model for pattern recognition results"""
    rule_id: int = Field(description="ID of the rule that generated this pattern")
    pattern_type: str = Field(description="Type of pattern detected")
    pattern_name: str = Field(description="Name of the detected pattern")
    
    # Pattern Details
    pattern_confidence: float = Field(description="Confidence score (0-1)")
    pattern_frequency: int = Field(default=1, description="How often this pattern occurs")
    pattern_significance: Optional[str] = Field(default=None, description="Business significance of pattern")
    
    # Pattern Data
    pattern_data: Dict[str, Any] = Field(default_factory=dict, description="Detailed pattern data")
    sample_data: Optional[Dict[str, Any]] = Field(default=None, description="Sample data that exhibits this pattern")
    pattern_metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional pattern metadata")
    
    # Detection Context
    detected_at: datetime = Field(default_factory=datetime.now)
    detection_method: str = Field(description="Method used to detect pattern")
    data_source: Optional[str] = Field(default=None, description="Source of data where pattern was found")
    
    # Business Impact
    business_value: Optional[str] = Field(default=None, description="Business value of this pattern")
    recommended_actions: List[str] = Field(default_factory=list, description="Recommended actions based on pattern")


class PatternRecognitionResult(PatternRecognitionResultBase, table=True):
    """Pattern recognition results"""
    __tablename__ = "pattern_recognition_results"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class AnomalyDetectionResultBase(SQLModel):
    """Base model for anomaly detection results"""
    rule_id: int = Field(description="ID of the rule that detected the anomaly")
    anomaly_type: str = Field(description="Type of anomaly detected")
    anomaly_severity: str = Field(description="Severity level of anomaly")
    
    # Anomaly Details
    anomaly_score: float = Field(description="Anomaly score (higher = more anomalous)")
    anomaly_threshold: float = Field(description="Threshold used for detection")
    anomaly_description: str = Field(description="Description of the anomaly")
    
    # Data Context
    affected_data_source: Optional[str] = Field(default=None, description="Data source where anomaly was found")
    affected_table: Optional[str] = Field(default=None, description="Table where anomaly was found")
    affected_column: Optional[str] = Field(default=None, description="Column where anomaly was found")
    affected_records: Optional[int] = Field(default=None, description="Number of affected records")
    
    # Detection Details
    detected_at: datetime = Field(default_factory=datetime.now)
    detection_model: str = Field(description="Model used for anomaly detection")
    detection_confidence: float = Field(description="Confidence in anomaly detection")
    
    # Response Information
    is_acknowledged: bool = Field(default=False, description="Whether anomaly has been acknowledged")
    acknowledged_by: Optional[str] = Field(default=None, description="User who acknowledged anomaly")
    acknowledged_at: Optional[datetime] = Field(default=None, description="When anomaly was acknowledged")
    resolution_status: Optional[str] = Field(default=None, description="Status of anomaly resolution")
    
    # Additional Context
    anomaly_metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional anomaly metadata")
    suggested_investigation: Optional[str] = Field(default=None, description="Suggested investigation steps")


class AnomalyDetectionResult(AnomalyDetectionResultBase, table=True):
    """Anomaly detection results"""
    __tablename__ = "anomaly_detection_results"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# ===============================
# REQUEST/RESPONSE MODELS
# ===============================

class ExecutionRequest(BaseModel):
    """Request model for rule execution"""
    rule_ids: List[int] = Field(description="List of rule IDs to execute")
    priority: ExecutionPriority = Field(default=ExecutionPriority.NORMAL)
    execution_context: Dict[str, Any] = Field(default_factory=dict)
    schedule_for: Optional[datetime] = Field(default=None, description="Schedule execution for later")
    
    @validator('rule_ids')
    def validate_rule_ids(cls, v):
        if not v:
            raise ValueError("At least one rule ID must be provided")
        return v


class ExecutionStatusResponse(BaseModel):
    """Response model for execution status"""
    execution_id: int
    status: RuleExecutionStatus
    progress_percentage: Optional[float] = None
    estimated_completion: Optional[datetime] = None
    current_stage: Optional[str] = None
    performance_metrics: Dict[str, Any] = Field(default_factory=dict)


class ValidationRequest(BaseModel):
    """Request model for rule validation"""
    rule_id: int
    validation_types: List[str] = Field(default_factory=list, description="Types of validation to perform")
    strict_mode: bool = Field(default=False, description="Whether to use strict validation")


class ValidationResponse(BaseModel):
    """Response model for validation results"""
    overall_status: ValidationStatus
    validation_score: float
    validation_results: List[Dict[str, Any]]
    suggestions: List[str] = Field(default_factory=list)


class OrchestrationJobRequest(BaseModel):
    """Request model for creating orchestration jobs"""
    job_name: str
    job_description: Optional[str] = None
    job_type: str
    schedule_expression: Optional[str] = None
    job_configuration: Dict[str, Any] = Field(default_factory=dict)
    resource_requirements: Dict[str, Any] = Field(default_factory=dict)


class OrchestrationJobResponse(BaseModel):
    """Response model for orchestration jobs"""
    job_id: int
    job_name: str
    status: str
    next_run_time: Optional[datetime] = None
    last_execution: Optional[Dict[str, Any]] = None
    resource_usage: Dict[str, Any] = Field(default_factory=dict)


class PatternAnalysisRequest(BaseModel):
    """Request model for pattern analysis"""
    rule_ids: List[int] = Field(description="Rule IDs to analyze")
    data_sources: List[str] = Field(default_factory=list, description="Data sources to analyze")
    pattern_types: List[str] = Field(default_factory=list, description="Types of patterns to detect")
    analysis_depth: str = Field(default="standard", description="Depth of analysis")


class PatternAnalysisResponse(BaseModel):
    """Response model for pattern analysis"""
    analysis_id: str
    patterns_detected: int
    high_confidence_patterns: int
    anomalies_detected: int
    analysis_summary: Dict[str, Any]
    recommended_actions: List[str] = Field(default_factory=list)