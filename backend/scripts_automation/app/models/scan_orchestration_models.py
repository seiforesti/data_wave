"""
Advanced Scan Orchestration Models for Enterprise Data Governance System
========================================================================

This module contains sophisticated models for unified scan orchestration, intelligent workflow
management, advanced resource allocation, and comprehensive integration across all data governance
systems. These models serve as the central coordination hub for all scanning activities.

Features:
- Unified scan orchestration across all data sources and systems
- Intelligent workflow management with dependency tracking
- Advanced resource allocation and optimization
- Real-time performance monitoring and adjustment
- Multi-dimensional scheduling with priority management
- Enterprise workflow engines with approval processes
- Comprehensive audit trails and compliance tracking
- Deep integration with scan rules, catalog, compliance, and classification
- AI-powered optimization and predictive scaling
- Business intelligence and cost optimization
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, ARRAY, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple, Generic, TypeVar
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator, Field as PydanticField
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
import asyncio
from dataclasses import dataclass

# Graph analysis imports for dependency management
import networkx as nx

# AI/ML imports for intelligent optimization
import numpy as np
from typing_extensions import Annotated

# Import related models for integration
from .scan_models import DataSource, ScanRuleSet, Scan, ScanResult, ScanSchedule
from .advanced_scan_rule_models import IntelligentScanRule, RuleExecutionHistory
from .advanced_catalog_models import IntelligentDataAsset, EnterpriseDataLineage


# ===================== ENUMS AND CONSTANTS =====================

class OrchestrationStatus(str, Enum):
    """Status of orchestration operations"""
    INITIALIZING = "initializing"
    PLANNING = "planning"
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETING = "completing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"
    ARCHIVED = "archived"


class WorkflowStatus(str, Enum):
    """Status of workflow execution"""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    SCHEDULED = "scheduled"
    RUNNING = "running"
    SUSPENDED = "suspended"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TERMINATED = "terminated"


class ResourceType(str, Enum):
    """Types of resources for allocation"""
    CPU = "cpu"
    MEMORY = "memory"
    STORAGE = "storage"
    NETWORK = "network"
    DATABASE_CONNECTIONS = "database_connections"
    SCAN_WORKERS = "scan_workers"
    API_CALLS = "api_calls"
    COMPUTE_INSTANCES = "compute_instances"
    CLASSIFIER_INSTANCES = "classifier_instances"
    ML_MODELS = "ml_models"


class SchedulingStrategy(str, Enum):
    """Scheduling strategies for orchestration"""
    FIFO = "fifo"                    # First In First Out
    PRIORITY = "priority"            # Priority-based scheduling
    LOAD_BALANCED = "load_balanced"  # Load balancing across resources
    DEADLINE = "deadline"            # Deadline-driven scheduling
    COST_OPTIMIZED = "cost_optimized" # Cost-minimized scheduling
    INTELLIGENT = "intelligent"     # AI-driven optimization
    HYBRID = "hybrid"               # Combination of strategies


class WorkflowType(str, Enum):
    """Types of orchestration workflows"""
    DATA_DISCOVERY = "data_discovery"
    COMPREHENSIVE_SCAN = "comprehensive_scan"
    QUALITY_ASSESSMENT = "quality_assessment"
    COMPLIANCE_AUDIT = "compliance_audit"
    CLASSIFICATION_UPDATE = "classification_update"
    LINEAGE_REFRESH = "lineage_refresh"
    CATALOG_SYNC = "catalog_sync"
    INCREMENTAL_SCAN = "incremental_scan"
    EMERGENCY_SCAN = "emergency_scan"
    MAINTENANCE = "maintenance"
    CUSTOM = "custom"


class DependencyType(str, Enum):
    """Types of workflow dependencies"""
    PREREQUISITE = "prerequisite"    # Must complete before this workflow
    BLOCKING = "blocking"           # This workflow blocks the dependent one
    CONDITIONAL = "conditional"     # Dependency based on conditions
    PARALLEL = "parallel"          # Can run in parallel
    SEQUENTIAL = "sequential"      # Must run in sequence
    OPTIONAL = "optional"          # Optional dependency


class PriorityLevel(str, Enum):
    """Priority levels for orchestration"""
    CRITICAL = "critical"      # 1 - Mission critical
    HIGH = "high"             # 2 - High priority
    MEDIUM = "medium"         # 3 - Normal priority
    LOW = "low"              # 4 - Low priority
    BACKGROUND = "background" # 5 - Background processing


class ExecutionMode(str, Enum):
    """Execution modes for scan orchestration"""
    SYNCHRONOUS = "synchronous"      # Wait for completion
    ASYNCHRONOUS = "asynchronous"    # Fire and forget
    STREAMING = "streaming"          # Real-time streaming
    BATCH = "batch"                  # Batch processing
    HYBRID = "hybrid"                # Mixed mode
    ADAPTIVE = "adaptive"            # AI-driven mode selection


class OptimizationGoal(str, Enum):
    """Optimization goals for orchestration"""
    SPEED = "speed"                  # Minimize execution time
    COST = "cost"                   # Minimize resource cost
    QUALITY = "quality"             # Maximize result quality
    RELIABILITY = "reliability"     # Maximize success rate
    BALANCED = "balanced"           # Balance all factors
    CUSTOM = "custom"               # Custom optimization


# ===================== CORE ORCHESTRATION MODELS =====================

class ScanOrchestrationMaster(SQLModel, table=True):
    """
    Central orchestration master that coordinates all scanning activities across
    the entire data governance ecosystem with intelligent resource management,
    advanced scheduling, and comprehensive integration.
    
    This model serves as the brain of the scan orchestration system, managing
    complex multi-dimensional workflows, resource optimization, and real-time
    coordination across all data governance components.
    """
    __tablename__ = "scan_orchestration_masters"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    orchestration_id: str = Field(index=True, unique=True, description="Unique orchestration identifier")
    orchestration_name: str = Field(max_length=255, description="Human-readable orchestration name")
    description: Optional[str] = Field(sa_column=Column(Text), description="Detailed orchestration description")
    
    # Orchestration Configuration
    orchestration_type: WorkflowType = Field(index=True, description="Type of orchestration workflow")
    execution_mode: ExecutionMode = Field(default=ExecutionMode.ASYNCHRONOUS, index=True)
    scheduling_strategy: SchedulingStrategy = Field(default=SchedulingStrategy.INTELLIGENT, index=True)
    priority_level: PriorityLevel = Field(default=PriorityLevel.MEDIUM, index=True)
    optimization_goal: OptimizationGoal = Field(default=OptimizationGoal.BALANCED)
    
    # Status and Lifecycle
    status: OrchestrationStatus = Field(default=OrchestrationStatus.INITIALIZING, index=True)
    workflow_status: WorkflowStatus = Field(default=WorkflowStatus.DRAFT, index=True)
    current_phase: str = Field(default="initialization", max_length=100)
    completion_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Scheduling and Timing
    scheduled_start: Optional[datetime] = Field(index=True, description="Planned start time")
    actual_start: Optional[datetime] = Field(index=True, description="Actual start time")
    estimated_completion: Optional[datetime] = Field(description="Estimated completion time")
    actual_completion: Optional[datetime] = Field(description="Actual completion time")
    deadline: Optional[datetime] = Field(description="Hard deadline for completion")
    max_execution_time: Optional[int] = Field(ge=1, description="Maximum execution time in minutes")
    
    # Resource Requirements and Allocation
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_allocation: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    estimated_cost: Optional[float] = Field(ge=0.0, description="Estimated execution cost")
    actual_cost: Optional[float] = Field(ge=0.0, description="Actual execution cost")
    cost_budget: Optional[float] = Field(ge=0.0, description="Budget limit for execution")
    
    # Target Configuration
    target_data_sources: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    target_assets: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    target_rules: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    target_classifications: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    scope_filters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Workflow Configuration
    workflow_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    stage_definitions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    dependency_graph: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    parallel_execution_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    conditional_logic: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # AI and Optimization
    ai_optimization_enabled: bool = Field(default=True, description="Enable AI-driven optimization")
    ml_model_recommendations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_predictions: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    adaptive_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    learning_feedback: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Execution Tracking
    stages_completed: int = Field(default=0, ge=0)
    stages_total: int = Field(default=0, ge=0)
    tasks_completed: int = Field(default=0, ge=0)
    tasks_total: int = Field(default=0, ge=0)
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    error_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    retry_count: int = Field(default=0, ge=0)
    
    # Performance Metrics
    throughput_records_per_second: float = Field(default=0.0, ge=0.0)
    average_response_time: float = Field(default=0.0, ge=0.0)
    resource_utilization: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_benchmarks: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    sla_compliance: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Quality and Results
    quality_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    result_summary: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_quality_impact: float = Field(default=0.0, ge=-1.0, le=1.0)
    business_value_generated: float = Field(default=0.0, ge=0.0)
    insights_discovered: int = Field(default=0, ge=0)
    
    # Integration Points
    scan_rule_integrations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    catalog_integrations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_integrations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    classification_integrations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    data_source_integrations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Monitoring and Alerting
    monitoring_enabled: bool = Field(default=True)
    alert_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    notification_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    escalation_policies: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    health_check_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Approval and Governance
    requires_approval: bool = Field(default=False)
    approver_groups: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    approval_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    governance_policies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Error Handling and Recovery
    error_handling_strategy: str = Field(default="retry_with_backoff", max_length=100)
    max_retry_attempts: int = Field(default=3, ge=0, le=10)
    retry_backoff_strategy: str = Field(default="exponential", max_length=50)
    failure_recovery_actions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    circuit_breaker_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit and Compliance
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_checks: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    security_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_lineage_tracking: bool = Field(default=True)
    privacy_preservation: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Custom Properties and Extensions
    custom_properties: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    extension_points: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    plugin_configurations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    integration_webhooks: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal and Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    created_by: Optional[str] = Field(max_length=255)
    updated_by: Optional[str] = Field(max_length=255)
    version: str = Field(default="1.0.0", max_length=20)
    
    # Relationships
    workflow_executions: List["ScanWorkflowExecution"] = Relationship(back_populates="orchestration_master")
    resource_allocations: List["ScanResourceAllocation"] = Relationship(back_populates="orchestration_master")
    stage_executions: List["OrchestrationStageExecution"] = Relationship(back_populates="orchestration_master")
    dependency_relationships: List["OrchestrationDependency"] = Relationship(back_populates="source_orchestration")
    performance_snapshots: List["OrchestrationPerformanceSnapshot"] = Relationship(back_populates="orchestration_master")
    
    # Model Configuration
    class Config:
        schema_extra = {
            "example": {
                "orchestration_id": "orch_comprehensive_scan_001",
                "orchestration_name": "Comprehensive Data Governance Scan",
                "description": "Full-scale data discovery, classification, and quality assessment across all systems",
                "orchestration_type": "comprehensive_scan",
                "execution_mode": "asynchronous",
                "scheduling_strategy": "intelligent",
                "priority_level": "high",
                "optimization_goal": "balanced",
                "target_data_sources": [1, 2, 3],
                "ai_optimization_enabled": True,
                "requires_approval": True,
                "monitoring_enabled": True
            }
        }
    
    # Table Constraints
    __table_args__ = (
        Index('ix_orch_status_priority', 'status', 'priority_level'),
        Index('ix_orch_type_mode', 'orchestration_type', 'execution_mode'),
        Index('ix_orch_schedule', 'scheduled_start', 'deadline'),
        Index('ix_orch_performance', 'success_rate', 'sla_compliance'),
        Index('ix_orch_cost', 'estimated_cost', 'actual_cost'),
        UniqueConstraint('orchestration_id', name='uq_orchestration_id'),
        CheckConstraint('completion_percentage >= 0.0 AND completion_percentage <= 100.0'),
        CheckConstraint('success_rate >= 0.0 AND success_rate <= 1.0'),
        CheckConstraint('stages_completed <= stages_total'),
        CheckConstraint('tasks_completed <= tasks_total'),
    )


class ScanWorkflowExecution(SQLModel, table=True):
    """
    Detailed execution tracking for individual workflow instances within
    the orchestration master, providing granular monitoring and control.
    """
    __tablename__ = "scan_workflow_executions"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: str = Field(index=True, unique=True)
    orchestration_master_id: int = Field(foreign_key="scan_orchestration_masters.id", index=True)
    workflow_name: str = Field(max_length=255, index=True)
    
    # Execution Details
    workflow_type: WorkflowType = Field(index=True)
    execution_mode: ExecutionMode = Field(index=True)
    status: WorkflowStatus = Field(default=WorkflowStatus.DRAFT, index=True)
    current_step: str = Field(default="initialization", max_length=100)
    
    # Timing and Scheduling
    scheduled_at: Optional[datetime] = Field(index=True)
    started_at: Optional[datetime] = Field(index=True)
    completed_at: Optional[datetime] = Field(index=True)
    duration_seconds: Optional[float] = Field(ge=0.0)
    
    # Execution Configuration
    execution_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    input_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    output_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    intermediate_results: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Performance Tracking
    steps_completed: int = Field(default=0, ge=0)
    steps_total: int = Field(default=0, ge=0)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    throughput_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    latency_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Resource Usage
    cpu_usage_avg: float = Field(default=0.0, ge=0.0)
    memory_usage_peak: float = Field(default=0.0, ge=0.0)
    network_io_bytes: int = Field(default=0, ge=0)
    storage_io_bytes: int = Field(default=0, ge=0)
    resource_efficiency_score: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Quality and Results
    success_indicators: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    quality_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    business_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Error Handling
    error_count: int = Field(default=0, ge=0)
    warning_count: int = Field(default=0, ge=0)
    errors: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    warnings: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    recovery_actions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Integration Results
    scan_rules_applied: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    assets_discovered: int = Field(default=0, ge=0)
    classifications_updated: int = Field(default=0, ge=0)
    compliance_checks_performed: int = Field(default=0, ge=0)
    lineage_relationships_created: int = Field(default=0, ge=0)
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    orchestration_master: Optional[ScanOrchestrationMaster] = Relationship(back_populates="workflow_executions")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_workflow_exec_status_type', 'status', 'workflow_type'),
        Index('ix_workflow_exec_timing', 'started_at', 'completed_at'),
        Index('ix_workflow_exec_performance', 'progress_percentage', 'resource_efficiency_score'),
        CheckConstraint('steps_completed <= steps_total'),
        CheckConstraint('progress_percentage >= 0.0 AND progress_percentage <= 100.0'),
    )


class ScanResourceAllocation(SQLModel, table=True):
    """
    Intelligent resource allocation and management for scan orchestration
    with dynamic scaling, cost optimization, and performance monitoring.
    """
    __tablename__ = "scan_resource_allocations"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    allocation_id: str = Field(index=True, unique=True)
    orchestration_master_id: int = Field(foreign_key="scan_orchestration_masters.id", index=True)
    resource_pool_name: str = Field(max_length=255, index=True)
    
    # Resource Configuration
    resource_type: ResourceType = Field(index=True)
    resource_category: str = Field(max_length=100, index=True)
    allocation_strategy: str = Field(default="optimal", max_length=100)
    scaling_policy: str = Field(default="auto", max_length=100)
    
    # Capacity and Limits
    requested_capacity: float = Field(ge=0.0, description="Requested resource capacity")
    allocated_capacity: float = Field(ge=0.0, description="Actually allocated capacity")
    max_capacity: Optional[float] = Field(ge=0.0, description="Maximum allowed capacity")
    min_capacity: float = Field(default=0.0, ge=0.0, description="Minimum required capacity")
    current_usage: float = Field(default=0.0, ge=0.0, description="Current resource usage")
    
    # Cost Management
    cost_per_unit: float = Field(default=0.0, ge=0.0, description="Cost per resource unit")
    estimated_cost: float = Field(default=0.0, ge=0.0, description="Estimated total cost")
    actual_cost: float = Field(default=0.0, ge=0.0, description="Actual cost incurred")
    cost_budget: Optional[float] = Field(ge=0.0, description="Budget limit for this resource")
    cost_optimization_enabled: bool = Field(default=True)
    
    # Performance Metrics
    utilization_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    efficiency_score: float = Field(default=1.0, ge=0.0, le=1.0)
    response_time_avg: float = Field(default=0.0, ge=0.0)
    throughput_per_unit: float = Field(default=0.0, ge=0.0)
    availability_percentage: float = Field(default=100.0, ge=0.0, le=100.0)
    
    # Scaling Configuration
    auto_scaling_enabled: bool = Field(default=True)
    scale_up_threshold: float = Field(default=80.0, ge=0.0, le=100.0)
    scale_down_threshold: float = Field(default=20.0, ge=0.0, le=100.0)
    scaling_cooldown_seconds: int = Field(default=300, ge=0)
    max_scale_up_increment: float = Field(default=50.0, ge=0.0)
    max_scale_down_increment: float = Field(default=25.0, ge=0.0)
    
    # Quality of Service
    qos_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    sla_targets: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_targets: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    priority_weight: float = Field(default=1.0, ge=0.0, le=10.0)
    
    # Health and Monitoring
    health_status: str = Field(default="healthy", max_length=50, index=True)
    last_health_check: Optional[datetime] = None
    health_check_frequency: int = Field(default=60, ge=1, description="Health check interval in seconds")
    alerts_triggered: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Allocation Timeline
    allocation_start: datetime = Field(default_factory=datetime.utcnow, index=True)
    allocation_end: Optional[datetime] = None
    duration_planned: Optional[int] = Field(ge=1, description="Planned allocation duration in minutes")
    duration_actual: Optional[int] = Field(ge=1, description="Actual allocation duration in minutes")
    
    # Resource Dependencies
    depends_on_resources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    resource_conflicts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    shared_resources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    exclusive_access: bool = Field(default=False)
    
    # Optimization and AI
    optimization_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    ml_predictions: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    adaptive_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    learning_feedback: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata and Tracking
    allocation_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    usage_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    performance_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    orchestration_master: Optional[ScanOrchestrationMaster] = Relationship(back_populates="resource_allocations")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_resource_type_status', 'resource_type', 'health_status'),
        Index('ix_resource_utilization', 'utilization_percentage', 'efficiency_score'),
        Index('ix_resource_cost', 'estimated_cost', 'actual_cost'),
        Index('ix_resource_scaling', 'auto_scaling_enabled', 'scale_up_threshold'),
        CheckConstraint('utilization_percentage >= 0.0 AND utilization_percentage <= 100.0'),
        CheckConstraint('efficiency_score >= 0.0 AND efficiency_score <= 1.0'),
        CheckConstraint('allocated_capacity <= max_capacity OR max_capacity IS NULL'),
        CheckConstraint('allocated_capacity >= min_capacity'),
    )


class OrchestrationStageExecution(SQLModel, table=True):
    """
    Detailed tracking of individual stages within orchestration workflows
    with comprehensive monitoring, dependency management, and performance analytics.
    """
    __tablename__ = "orchestration_stage_executions"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    stage_execution_id: str = Field(index=True, unique=True)
    orchestration_master_id: int = Field(foreign_key="scan_orchestration_masters.id", index=True)
    stage_name: str = Field(max_length=255, index=True)
    stage_order: int = Field(ge=1, index=True, description="Order of execution in workflow")
    
    # Stage Configuration
    stage_type: str = Field(max_length=100, index=True)
    execution_strategy: str = Field(default="sequential", max_length=100)
    retry_policy: str = Field(default="exponential_backoff", max_length=100)
    timeout_minutes: int = Field(default=60, ge=1)
    
    # Status and Progress
    status: OrchestrationStatus = Field(default=OrchestrationStatus.INITIALIZING, index=True)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    current_task: str = Field(default="", max_length=255)
    tasks_completed: int = Field(default=0, ge=0)
    tasks_total: int = Field(default=0, ge=0)
    
    # Timing Information
    scheduled_start: Optional[datetime] = Field(index=True)
    actual_start: Optional[datetime] = Field(index=True)
    estimated_completion: Optional[datetime] = None
    actual_completion: Optional[datetime] = None
    duration_seconds: Optional[float] = Field(ge=0.0)
    
    # Stage Configuration and Parameters
    stage_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    input_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    output_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    intermediate_data: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Performance and Resource Usage
    cpu_usage_avg: float = Field(default=0.0, ge=0.0, le=100.0)
    memory_usage_peak: float = Field(default=0.0, ge=0.0)
    io_operations: int = Field(default=0, ge=0)
    network_bytes_transferred: int = Field(default=0, ge=0)
    resources_allocated: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality and Validation
    quality_checks_passed: int = Field(default=0, ge=0)
    quality_checks_failed: int = Field(default=0, ge=0)
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    business_validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_quality_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Error Handling and Recovery
    error_count: int = Field(default=0, ge=0)
    warning_count: int = Field(default=0, ge=0)
    retry_count: int = Field(default=0, ge=0)
    last_error: Optional[str] = Field(sa_column=Column(Text))
    error_details: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    recovery_actions_taken: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Dependencies and Integration
    prerequisite_stages: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    dependent_stages: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    blocking_conditions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    integration_points: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Impact and Results
    business_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    kpi_impacts: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    security_validations: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Monitoring and Alerting
    monitoring_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_triggers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    escalations_triggered: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    notifications_sent: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Custom Properties
    custom_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    stage_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    annotations: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    orchestration_master: Optional[ScanOrchestrationMaster] = Relationship(back_populates="stage_executions")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_stage_exec_order_status', 'stage_order', 'status'),
        Index('ix_stage_exec_timing', 'actual_start', 'actual_completion'),
        Index('ix_stage_exec_performance', 'progress_percentage', 'cpu_usage_avg'),
        Index('ix_stage_exec_quality', 'quality_checks_passed', 'quality_checks_failed'),
        UniqueConstraint('orchestration_master_id', 'stage_order', name='uq_stage_order_per_orchestration'),
        CheckConstraint('progress_percentage >= 0.0 AND progress_percentage <= 100.0'),
        CheckConstraint('tasks_completed <= tasks_total'),
        CheckConstraint('cpu_usage_avg >= 0.0 AND cpu_usage_avg <= 100.0'),
    )


class OrchestrationDependency(SQLModel, table=True):
    """
    Complex dependency management between orchestration workflows
    with conditional logic, priority handling, and intelligent resolution.
    """
    __tablename__ = "orchestration_dependencies"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    dependency_id: str = Field(index=True, unique=True)
    dependency_name: str = Field(max_length=255)
    
    # Source and Target Orchestrations
    source_orchestration_id: int = Field(foreign_key="scan_orchestration_masters.id", index=True)
    target_orchestration_id: int = Field(foreign_key="scan_orchestration_masters.id", index=True)
    
    # Dependency Configuration
    dependency_type: DependencyType = Field(index=True)
    priority_level: PriorityLevel = Field(default=PriorityLevel.MEDIUM)
    is_mandatory: bool = Field(default=True, description="Whether this dependency is required")
    can_be_overridden: bool = Field(default=False, description="Whether dependency can be manually overridden")
    
    # Conditional Logic
    condition_expression: Optional[str] = Field(sa_column=Column(Text), description="Conditional logic for dependency")
    condition_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    evaluation_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    last_evaluation_result: Optional[bool] = None
    last_evaluation_time: Optional[datetime] = None
    
    # Timing and Constraints
    wait_timeout_minutes: Optional[int] = Field(ge=1, description="Maximum wait time for dependency")
    retry_interval_seconds: int = Field(default=30, ge=1)
    max_retry_attempts: int = Field(default=5, ge=0)
    current_retry_count: int = Field(default=0, ge=0)
    
    # Status and Resolution
    status: str = Field(default="pending", max_length=50, index=True)
    resolution_status: str = Field(default="unresolved", max_length=50)
    blocking_reason: Optional[str] = Field(max_length=500)
    resolution_timestamp: Optional[datetime] = None
    override_timestamp: Optional[datetime] = None
    override_by: Optional[str] = Field(max_length=255)
    override_reason: Optional[str] = Field(max_length=500)
    
    # Impact Analysis
    blocking_impact_score: float = Field(default=1.0, ge=0.0, le=10.0)
    business_impact_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    cost_impact_estimate: Optional[float] = Field(ge=0.0)
    delay_impact_minutes: int = Field(default=0, ge=0)
    
    # Resolution Strategies
    resolution_strategies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    fallback_actions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    escalation_triggers: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    auto_resolution_enabled: bool = Field(default=True)
    
    # Monitoring and Alerts
    monitoring_enabled: bool = Field(default=True)
    alert_on_blocking: bool = Field(default=True)
    notification_channels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    escalation_policies: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Historical Data
    dependency_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    performance_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    resolution_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Custom Properties
    custom_attributes: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    annotations: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    source_orchestration: Optional[ScanOrchestrationMaster] = Relationship(back_populates="dependency_relationships")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_dep_source_target', 'source_orchestration_id', 'target_orchestration_id'),
        Index('ix_dep_type_priority', 'dependency_type', 'priority_level'),
        Index('ix_dep_status_resolution', 'status', 'resolution_status'),
        Index('ix_dep_mandatory_override', 'is_mandatory', 'can_be_overridden'),
        CheckConstraint('source_orchestration_id != target_orchestration_id', name='ck_no_self_dependency'),
        CheckConstraint('blocking_impact_score >= 0.0 AND blocking_impact_score <= 10.0'),
        CheckConstraint('current_retry_count <= max_retry_attempts'),
        UniqueConstraint('source_orchestration_id', 'target_orchestration_id', 'dependency_type', name='uq_dependency_relationship'),
    )


class OrchestrationPerformanceSnapshot(SQLModel, table=True):
    """
    Real-time performance snapshots for orchestration monitoring
    with comprehensive metrics, trending analysis, and alerting capabilities.
    """
    __tablename__ = "orchestration_performance_snapshots"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    snapshot_id: str = Field(index=True, unique=True)
    orchestration_master_id: int = Field(foreign_key="scan_orchestration_masters.id", index=True)
    
    # Snapshot Metadata
    snapshot_timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    snapshot_type: str = Field(default="periodic", max_length=50, index=True)
    collection_interval_seconds: int = Field(default=60, ge=1)
    data_retention_days: int = Field(default=30, ge=1)
    
    # System Performance Metrics
    cpu_utilization_percentage: float = Field(ge=0.0, le=100.0)
    memory_utilization_percentage: float = Field(ge=0.0, le=100.0)
    disk_io_operations_per_second: float = Field(ge=0.0)
    network_io_mbps: float = Field(ge=0.0)
    active_connections_count: int = Field(ge=0)
    thread_pool_utilization: float = Field(ge=0.0, le=100.0)
    
    # Business Performance Metrics
    records_processed_per_second: float = Field(ge=0.0)
    transactions_completed_per_minute: float = Field(ge=0.0)
    average_response_time_milliseconds: float = Field(ge=0.0)
    error_rate_percentage: float = Field(ge=0.0, le=100.0)
    success_rate_percentage: float = Field(ge=0.0, le=100.0)
    sla_compliance_percentage: float = Field(ge=0.0, le=100.0)
    
    # Resource Efficiency Metrics
    resource_efficiency_score: float = Field(ge=0.0, le=1.0)
    cost_efficiency_ratio: float = Field(ge=0.0)
    energy_consumption_watts: Optional[float] = Field(ge=0.0)
    carbon_footprint_kg: Optional[float] = Field(ge=0.0)
    waste_factor_percentage: float = Field(ge=0.0, le=100.0)
    
    # Quality Metrics
    data_quality_score: float = Field(ge=0.0, le=1.0)
    accuracy_percentage: float = Field(ge=0.0, le=100.0)
    completeness_percentage: float = Field(ge=0.0, le=100.0)
    consistency_score: float = Field(ge=0.0, le=1.0)
    validation_success_rate: float = Field(ge=0.0, le=100.0)
    
    # Workflow-Specific Metrics
    active_workflows_count: int = Field(ge=0)
    queued_workflows_count: int = Field(ge=0)
    completed_workflows_count: int = Field(ge=0)
    failed_workflows_count: int = Field(ge=0)
    workflow_throughput_per_hour: float = Field(ge=0.0)
    average_workflow_duration_minutes: float = Field(ge=0.0)
    
    # Integration Metrics
    api_calls_per_minute: float = Field(ge=0.0)
    database_query_response_time: float = Field(ge=0.0)
    external_service_latency: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    integration_success_rates: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    cache_hit_ratio: float = Field(ge=0.0, le=1.0)
    
    # Alerting and Thresholds
    threshold_violations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    alerts_triggered: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    critical_issues_detected: int = Field(ge=0)
    warning_issues_detected: int = Field(ge=0)
    health_status: str = Field(default="healthy", max_length=50, index=True)
    
    # Predictive Analytics
    predicted_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    trend_indicators: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    anomaly_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    capacity_forecasts: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Custom Metrics
    custom_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    business_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    operational_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Metadata
    data_source: str = Field(default="orchestration_engine", max_length=100)
    collection_method: str = Field(default="automated", max_length=50)
    data_quality_flags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Relationships
    orchestration_master: Optional[ScanOrchestrationMaster] = Relationship(back_populates="performance_snapshots")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_perf_snapshot_timestamp', 'snapshot_timestamp', 'orchestration_master_id'),
        Index('ix_perf_snapshot_health', 'health_status', 'critical_issues_detected'),
        Index('ix_perf_snapshot_efficiency', 'resource_efficiency_score', 'cost_efficiency_ratio'),
        Index('ix_perf_snapshot_quality', 'data_quality_score', 'sla_compliance_percentage'),
        CheckConstraint('cpu_utilization_percentage >= 0.0 AND cpu_utilization_percentage <= 100.0'),
        CheckConstraint('memory_utilization_percentage >= 0.0 AND memory_utilization_percentage <= 100.0'),
        CheckConstraint('error_rate_percentage >= 0.0 AND error_rate_percentage <= 100.0'),
        CheckConstraint('success_rate_percentage >= 0.0 AND success_rate_percentage <= 100.0'),
    )


# ===================== SPECIALIZED ORCHESTRATION MODELS =====================

class IntelligentScanCoordinator(SQLModel, table=True):
    """
    AI-powered scan coordination with machine learning optimization,
    predictive analytics, and autonomous decision-making capabilities.
    """
    __tablename__ = "intelligent_scan_coordinators"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    coordinator_id: str = Field(index=True, unique=True)
    coordinator_name: str = Field(max_length=255)
    
    # AI Configuration
    ai_engine_version: str = Field(default="v2.0", max_length=20)
    ml_model_versions: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    learning_enabled: bool = Field(default=True)
    autonomous_mode: bool = Field(default=False, description="Enable autonomous decision making")
    confidence_threshold: float = Field(default=0.85, ge=0.0, le=1.0)
    
    # Intelligence Metrics
    decision_accuracy_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    optimization_success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    prediction_accuracy: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    learning_progress: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Optimization Strategies
    optimization_algorithms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    performance_targets: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    cost_optimization_enabled: bool = Field(default=True)
    quality_optimization_enabled: bool = Field(default=True)
    resource_optimization_enabled: bool = Field(default=True)
    
    # Predictive Capabilities
    workload_predictions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_demand_forecasts: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_predictions: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    failure_risk_assessments: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Coordination State
    active_orchestrations: int = Field(default=0, ge=0)
    managed_resources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    coordination_policies: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    decision_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_learning_update: Optional[datetime] = None
    
    # Table Constraints
    __table_args__ = (
        Index('ix_coord_ai_metrics', 'decision_accuracy_rate', 'optimization_success_rate'),
        Index('ix_coord_active_resources', 'active_orchestrations'),
        CheckConstraint('confidence_threshold >= 0.0 AND confidence_threshold <= 1.0'),
        CheckConstraint('decision_accuracy_rate >= 0.0 AND decision_accuracy_rate <= 1.0'),
    )


# ===================== REQUEST/RESPONSE MODELS =====================

class OrchestrationCreateRequest(BaseModel):
    """Request model for creating orchestration workflows"""
    orchestration_name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    orchestration_type: WorkflowType
    execution_mode: ExecutionMode = ExecutionMode.ASYNCHRONOUS
    scheduling_strategy: SchedulingStrategy = SchedulingStrategy.INTELLIGENT
    priority_level: PriorityLevel = PriorityLevel.MEDIUM
    optimization_goal: OptimizationGoal = OptimizationGoal.BALANCED
    
    # Target Configuration
    target_data_sources: Optional[List[int]] = []
    target_assets: Optional[List[int]] = []
    target_rules: Optional[List[int]] = []
    scope_filters: Optional[Dict[str, Any]] = {}
    
    # Scheduling
    scheduled_start: Optional[datetime] = None
    deadline: Optional[datetime] = None
    max_execution_time: Optional[int] = Field(None, ge=1)
    
    # Configuration
    workflow_definition: Optional[Dict[str, Any]] = {}
    resource_requirements: Optional[Dict[str, Any]] = {}
    ai_optimization_enabled: bool = True
    requires_approval: bool = False
    
    @validator('orchestration_name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Orchestration name cannot be empty')
        return v.strip()


class OrchestrationResponse(BaseModel):
    """Response model for orchestration workflows"""
    id: int
    orchestration_id: str
    orchestration_name: str
    description: Optional[str]
    orchestration_type: WorkflowType
    execution_mode: ExecutionMode
    status: OrchestrationStatus
    workflow_status: WorkflowStatus
    priority_level: PriorityLevel
    
    # Progress
    completion_percentage: float
    stages_completed: int
    stages_total: int
    
    # Timing
    scheduled_start: Optional[datetime]
    actual_start: Optional[datetime]
    estimated_completion: Optional[datetime]
    actual_completion: Optional[datetime]
    
    # Performance
    success_rate: float
    throughput_records_per_second: float
    resource_utilization: Dict[str, float]
    
    # Costs
    estimated_cost: Optional[float]
    actual_cost: Optional[float]
    
    # Quality
    quality_scores: Dict[str, float]
    business_value_generated: float
    
    # Metadata
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str]
    
    class Config:
        from_attributes = True


class ResourceAllocationRequest(BaseModel):
    """Request model for resource allocation"""
    resource_type: ResourceType
    requested_capacity: float = Field(gt=0)
    max_capacity: Optional[float] = Field(None, gt=0)
    min_capacity: float = Field(default=0.0, ge=0)
    allocation_strategy: str = "optimal"
    auto_scaling_enabled: bool = True
    cost_budget: Optional[float] = Field(None, ge=0)
    qos_requirements: Optional[Dict[str, Any]] = {}
    
    @validator('max_capacity')
    def validate_max_capacity(cls, v, values):
        if v is not None and 'requested_capacity' in values:
            if v < values['requested_capacity']:
                raise ValueError('max_capacity must be >= requested_capacity')
        return v


class WorkflowExecutionResponse(BaseModel):
    """Response model for workflow executions"""
    id: int
    execution_id: str
    workflow_name: str
    workflow_type: WorkflowType
    status: WorkflowStatus
    progress_percentage: float
    
    # Timing
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    
    # Performance
    steps_completed: int
    steps_total: int
    resource_efficiency_score: float
    
    # Quality
    quality_metrics: Dict[str, float]
    validation_results: Dict[str, Any]
    
    # Results
    assets_discovered: int
    classifications_updated: int
    compliance_checks_performed: int
    
    # Errors
    error_count: int
    warning_count: int
    
    class Config:
        from_attributes = True


# ===================== ANALYTICS AND REPORTING MODELS =====================

class OrchestrationAnalytics(BaseModel):
    """Model for orchestration analytics and insights"""
    analytics_id: str
    generated_at: datetime
    time_range_start: datetime
    time_range_end: datetime
    
    # Summary Metrics
    total_orchestrations: int
    successful_orchestrations: int
    failed_orchestrations: int
    average_success_rate: float
    
    # Performance Analysis
    average_execution_time: float
    throughput_analysis: Dict[str, float]
    resource_utilization_trends: Dict[str, List[float]]
    cost_analysis: Dict[str, float]
    
    # Quality Insights
    quality_trends: Dict[str, List[float]]
    business_value_analysis: Dict[str, float]
    compliance_metrics: Dict[str, int]
    
    # Optimization Recommendations
    optimization_opportunities: List[str]
    cost_reduction_recommendations: List[str]
    performance_improvement_suggestions: List[str]
    resource_optimization_advice: List[str]
    
    # Predictive Insights
    capacity_forecasts: Dict[str, float]
    workload_predictions: Dict[str, Any]
    risk_assessments: Dict[str, float]


# ===================== MODEL REGISTRATION =====================

__all__ = [
    # Core Models
    "ScanOrchestrationMaster",
    "ScanWorkflowExecution",
    "ScanResourceAllocation",
    "OrchestrationStageExecution",
    "OrchestrationDependency",
    "OrchestrationPerformanceSnapshot",
    "IntelligentScanCoordinator",
    
    # Enums
    "OrchestrationStatus",
    "WorkflowStatus",
    "ResourceType",
    "SchedulingStrategy",
    "WorkflowType",
    "DependencyType",
    "PriorityLevel",
    "ExecutionMode",
    "OptimizationGoal",
    
    # Request/Response Models
    "OrchestrationCreateRequest",
    "OrchestrationResponse",
    "ResourceAllocationRequest",
    "WorkflowExecutionResponse",
    
    # Analytics Models
    "OrchestrationAnalytics"
]