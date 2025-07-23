"""
🔍 ADVANCED SCAN RULE MODELS
Enterprise-grade models for intelligent scan rule engine with AI-powered pattern recognition,
adaptive optimization, and seamless integration with all data governance groups.

This module provides the foundation for:
- Intelligent Rule Engine with ML-powered pattern detection
- Adaptive Rule Optimization with self-improving algorithms  
- Context-Aware Rules that adapt to data source characteristics
- Real-Time Rule Performance Analytics and Monitoring
- Cross-Group Integration with Data Sources, Compliance, Classifications, Catalog, and Scan Logic
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

# Import interconnection models
from .scan_models import DataSource, ScanJob, ScanResult
from .policy_models import ComplianceRule
from .asset_models import DataAsset
from .classification_models import ClassificationResult


class IntelligentRuleType(str, Enum):
    """Types of intelligent scan rules"""
    PATTERN_RECOGNITION = "pattern_recognition"     # AI-powered pattern detection
    CONTENT_ANALYSIS = "content_analysis"           # Deep content analysis
    SCHEMA_VALIDATION = "schema_validation"         # Schema structure validation
    DATA_QUALITY = "data_quality"                   # Data quality assessment
    COMPLIANCE_CHECK = "compliance_check"           # Compliance validation
    CLASSIFICATION_TRIGGER = "classification_trigger"  # Auto-classification rules
    LINEAGE_DISCOVERY = "lineage_discovery"         # Data lineage detection
    ANOMALY_DETECTION = "anomaly_detection"         # Statistical anomaly detection
    BUSINESS_RULE = "business_rule"                 # Custom business logic
    SECURITY_SCAN = "security_scan"                 # Security vulnerability detection
    PERFORMANCE_OPTIMIZATION = "performance_optimization"  # Performance enhancement
    METADATA_ENRICHMENT = "metadata_enrichment"     # Automatic metadata enhancement


class RuleComplexityLevel(str, Enum):
    """Complexity levels for scan rules"""
    SIMPLE = "simple"           # Basic pattern matching
    MODERATE = "moderate"       # Multi-condition rules
    COMPLEX = "complex"         # Advanced logic with ML
    VERY_COMPLEX = "very_complex"  # AI-powered with deep learning
    EXPERT = "expert"           # Custom algorithms and advanced AI


class RuleExecutionMode(str, Enum):
    """Execution modes for scan rules"""
    SYNCHRONOUS = "synchronous"     # Execute immediately
    ASYNCHRONOUS = "asynchronous"   # Execute in background
    STREAMING = "streaming"         # Real-time streaming execution
    BATCH = "batch"                # Batch processing
    SCHEDULED = "scheduled"         # Scheduled execution
    EVENT_DRIVEN = "event_driven"   # Triggered by events
    ADAPTIVE = "adaptive"           # AI-determined optimal mode


class RuleOptimizationStrategy(str, Enum):
    """Optimization strategies for rule performance"""
    PERFORMANCE_FIRST = "performance_first"    # Optimize for speed
    ACCURACY_FIRST = "accuracy_first"          # Optimize for precision
    RESOURCE_EFFICIENT = "resource_efficient"  # Minimize resource usage
    BALANCED = "balanced"                      # Balance all factors
    COST_OPTIMIZED = "cost_optimized"         # Minimize operational costs
    ADAPTIVE_LEARNING = "adaptive_learning"    # AI-driven optimization
    PREDICTIVE = "predictive"                  # Predictive optimization


class RuleValidationStatus(str, Enum):
    """Validation status for scan rules"""
    DRAFT = "draft"                 # Under development
    VALIDATING = "validating"       # Currently being validated
    VALIDATED = "validated"         # Successfully validated
    VALIDATION_FAILED = "validation_failed"  # Validation failed
    DEPRECATED = "deprecated"       # No longer recommended
    RETIRED = "retired"            # Permanently disabled
    ARCHIVED = "archived"          # Archived for reference


class PatternMatchingAlgorithm(str, Enum):
    """Algorithms for pattern matching"""
    REGEX = "regex"                 # Regular expressions
    FUZZY_MATCHING = "fuzzy_matching"  # Fuzzy string matching
    MACHINE_LEARNING = "machine_learning"  # ML-based pattern detection
    DEEP_LEARNING = "deep_learning"  # Deep neural networks
    NATURAL_LANGUAGE = "natural_language"  # NLP-based analysis
    STATISTICAL = "statistical"     # Statistical pattern analysis
    GRAPH_ANALYSIS = "graph_analysis"  # Graph-based pattern detection
    ENSEMBLE = "ensemble"           # Combination of multiple algorithms


class RuleImpactLevel(str, Enum):
    """Impact levels for rule execution"""
    LOW = "low"                     # Minimal system impact
    MEDIUM = "medium"               # Moderate system impact
    HIGH = "high"                   # Significant system impact
    CRITICAL = "critical"           # Mission-critical impact
    SYSTEM_WIDE = "system_wide"     # Affects entire system


class RuleTriggerEvent(str, Enum):
    """Events that can trigger rule execution"""
    DATA_SOURCE_SCAN = "data_source_scan"      # New data source scan
    SCHEMA_CHANGE = "schema_change"            # Schema modification detected
    DATA_INGESTION = "data_ingestion"          # New data ingested
    COMPLIANCE_UPDATE = "compliance_update"    # Compliance rules updated
    CLASSIFICATION_CHANGE = "classification_change"  # Classification updated
    QUALITY_THRESHOLD = "quality_threshold"   # Quality threshold breached
    ANOMALY_DETECTED = "anomaly_detected"     # Anomaly detection triggered
    SCHEDULED_TIME = "scheduled_time"         # Time-based trigger
    MANUAL_TRIGGER = "manual_trigger"         # Manually triggered
    API_CALL = "api_call"                     # API-triggered execution


class IntelligentScanRule(SQLModel, table=True):
    """
    Enterprise-grade intelligent scan rule with AI capabilities, adaptive optimization,
    and seamless integration across all data governance groups.
    """
    __tablename__ = "intelligent_scan_rules"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_uuid: str = Field(index=True, unique=True, description="Unique identifier for the rule")
    name: str = Field(max_length=255, index=True)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = Field(sa_column=Column(Text))
    version: str = Field(default="1.0.0", max_length=20)
    
    # Rule Classification
    rule_type: IntelligentRuleType = Field(index=True)
    complexity_level: RuleComplexityLevel = Field(default=RuleComplexityLevel.MODERATE)
    execution_mode: RuleExecutionMode = Field(default=RuleExecutionMode.ASYNCHRONOUS)
    impact_level: RuleImpactLevel = Field(default=RuleImpactLevel.MEDIUM)
    
    # Rule Logic and Configuration
    rule_logic: str = Field(sa_column=Column(Text), description="Core rule logic/algorithm")
    pattern_definition: Optional[str] = Field(sa_column=Column(Text))
    matching_algorithm: PatternMatchingAlgorithm = Field(default=PatternMatchingAlgorithm.REGEX)
    confidence_threshold: float = Field(default=0.8, ge=0.0, le=1.0)
    
    # Advanced Configuration
    ai_model_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    ml_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    optimization_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    validation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Execution Control
    is_active: bool = Field(default=True, index=True)
    auto_optimization_enabled: bool = Field(default=True)
    adaptive_learning_enabled: bool = Field(default=False)
    real_time_monitoring: bool = Field(default=True)
    
    # Performance and Resource Management
    max_execution_time_seconds: int = Field(default=3600, ge=1, le=86400)
    resource_limit_cpu_percent: float = Field(default=25.0, ge=1.0, le=100.0)
    resource_limit_memory_mb: int = Field(default=1024, ge=128, le=8192)
    max_concurrent_executions: int = Field(default=5, ge=1, le=50)
    
    # Optimization and Analytics
    optimization_strategy: RuleOptimizationStrategy = Field(default=RuleOptimizationStrategy.BALANCED)
    performance_weight: float = Field(default=0.4, ge=0.0, le=1.0)
    accuracy_weight: float = Field(default=0.6, ge=0.0, le=1.0)
    cost_weight: float = Field(default=0.2, ge=0.0, le=1.0)
    
    # Trigger Configuration
    trigger_events: List[RuleTriggerEvent] = Field(default_factory=list, sa_column=Column(JSON))
    trigger_conditions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    schedule_expression: Optional[str] = Field(max_length=255)  # Cron expression
    
    # Validation and Quality
    validation_status: RuleValidationStatus = Field(default=RuleValidationStatus.DRAFT, index=True)
    validation_score: float = Field(default=0.0, ge=0.0, le=1.0)
    test_cases: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    quality_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Context
    business_category: Optional[str] = Field(max_length=100, index=True)
    business_priority: int = Field(default=5, ge=1, le=10)
    business_value_score: float = Field(default=0.0, ge=0.0, le=10.0)
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Performance Tracking
    execution_count: int = Field(default=0, ge=0)
    success_count: int = Field(default=0, ge=0)
    failure_count: int = Field(default=0, ge=0)
    average_execution_time: float = Field(default=0.0, ge=0.0)
    total_data_processed: int = Field(default=0, ge=0)
    
    # Quality and Accuracy Metrics
    true_positive_count: int = Field(default=0, ge=0)
    false_positive_count: int = Field(default=0, ge=0)
    true_negative_count: int = Field(default=0, ge=0)
    false_negative_count: int = Field(default=0, ge=0)
    precision_score: float = Field(default=0.0, ge=0.0, le=1.0)
    recall_score: float = Field(default=0.0, ge=0.0, le=1.0)
    f1_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Advanced Analytics
    pattern_effectiveness: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    learning_progress: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    optimization_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    performance_trends: Dict[str, List[float]] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Integration and Interconnection
    data_source_scope: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    asset_type_scope: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    classification_integration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_integration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    catalog_integration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Metadata and Documentation
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    documentation: Optional[str] = Field(sa_column=Column(Text))
    examples: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    troubleshooting_guide: Optional[str] = Field(sa_column=Column(Text))
    
    # Lifecycle Management
    created_by: Optional[str] = Field(max_length=255)
    updated_by: Optional[str] = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    approval_date: Optional[datetime] = None
    deprecation_date: Optional[datetime] = None
    retirement_date: Optional[datetime] = None
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_executed: Optional[datetime] = Field(index=True)
    last_optimized: Optional[datetime] = None
    next_optimization: Optional[datetime] = None
    
    # Relationships - Cross-Group Integration
    execution_history: List["RuleExecutionHistory"] = Relationship(back_populates="rule")
    optimization_sessions: List["RuleOptimizationSession"] = Relationship(back_populates="rule")
    validation_tests: List["RuleValidationTest"] = Relationship(back_populates="rule")
    performance_analytics: List["RulePerformanceAnalytics"] = Relationship(back_populates="rule")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_rule_performance', 'execution_count', 'average_execution_time'),
        Index('ix_rule_quality', 'precision_score', 'recall_score', 'f1_score'),
        Index('ix_rule_business', 'business_category', 'business_priority'),
        Index('ix_rule_lifecycle', 'validation_status', 'is_active'),
        CheckConstraint('confidence_threshold >= 0.0 AND confidence_threshold <= 1.0'),
        CheckConstraint('business_priority >= 1 AND business_priority <= 10'),
        CheckConstraint('performance_weight + accuracy_weight + cost_weight <= 1.0'),
        UniqueConstraint('rule_uuid'),
    )


class RuleExecutionHistory(SQLModel, table=True):
    """
    Comprehensive execution history for intelligent scan rules with detailed
    performance metrics, results analysis, and cross-system integration tracking.
    """
    __tablename__ = "rule_execution_history"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: str = Field(index=True, unique=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    
    # Execution Context
    trigger_event: RuleTriggerEvent = Field(index=True)
    execution_mode: RuleExecutionMode
    triggered_by: Optional[str] = Field(max_length=255)
    scan_job_id: Optional[int] = Field(foreign_key="scanjob.id")
    data_source_id: Optional[int] = Field(foreign_key="datasource.id")
    
    # Execution Details
    started_at: datetime = Field(index=True)
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = Field(ge=0.0)
    status: str = Field(max_length=50, index=True)  # running, completed, failed, timeout
    
    # Input and Configuration
    input_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    rule_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_sample_size: int = Field(default=0, ge=0)
    processing_scope: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Results and Output
    matches_found: int = Field(default=0, ge=0)
    false_positives: int = Field(default=0, ge=0)
    confidence_scores: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    pattern_matches: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    generated_insights: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Performance Metrics
    cpu_usage_percent: Optional[float] = Field(ge=0.0, le=100.0)
    memory_usage_mb: Optional[float] = Field(ge=0.0)
    network_io_mb: Optional[float] = Field(ge=0.0)
    disk_io_mb: Optional[float] = Field(ge=0.0)
    throughput_records_per_second: Optional[float] = Field(ge=0.0)
    
    # Quality Metrics
    accuracy_score: Optional[float] = Field(ge=0.0, le=1.0)
    precision: Optional[float] = Field(ge=0.0, le=1.0)
    recall: Optional[float] = Field(ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(ge=0.0, le=1.0)
    error_rate: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Business Impact
    business_value_generated: Optional[float] = Field(ge=0.0)
    compliance_violations_found: int = Field(default=0, ge=0)
    data_quality_issues_identified: int = Field(default=0, ge=0)
    security_risks_detected: int = Field(default=0, ge=0)
    
    # Error and Exception Handling
    error_message: Optional[str] = Field(max_length=2000)
    exception_details: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    warnings: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    retry_count: int = Field(default=0, ge=0)
    
    # Integration Results
    classification_results: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_validations: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    catalog_updates: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    lineage_discoveries: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Learning and Optimization Data
    learning_feedback: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    optimization_suggestions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    pattern_effectiveness: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    adaptation_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Audit and Compliance
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_checkpoints: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    data_lineage_impact: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))
    
    # Relationships
    rule: Optional[IntelligentScanRule] = Relationship(back_populates="execution_history")
    scan_job: Optional[ScanJob] = Relationship()
    
    # Database Constraints
    __table_args__ = (
        Index('ix_execution_performance', 'duration_seconds', 'throughput_records_per_second'),
        Index('ix_execution_results', 'matches_found', 'accuracy_score'),
        Index('ix_execution_timing', 'started_at', 'completed_at'),
        Index('ix_execution_business', 'business_value_generated', 'compliance_violations_found'),
    )


class RuleOptimizationSession(SQLModel, table=True):
    """
    AI-powered optimization sessions for intelligent scan rules with machine learning
    algorithms, performance tuning, and adaptive improvements.
    """
    __tablename__ = "rule_optimization_sessions"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True, unique=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    
    # Optimization Configuration
    optimization_strategy: RuleOptimizationStrategy
    optimization_algorithm: str = Field(max_length=100)
    target_metrics: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Session Details
    started_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[float] = Field(ge=0.0)
    status: str = Field(max_length=50, index=True)
    
    # Baseline Performance
    baseline_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    baseline_accuracy: float = Field(default=0.0, ge=0.0, le=1.0)
    baseline_performance: float = Field(default=0.0, ge=0.0)
    baseline_resource_usage: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Optimization Process
    iterations_completed: int = Field(default=0, ge=0)
    parameter_space_explored: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    optimization_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    convergence_criteria: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Results and Improvements
    optimized_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_improvement: float = Field(default=0.0)
    accuracy_improvement: float = Field(default=0.0)
    resource_efficiency_gain: float = Field(default=0.0)
    
    # Final Metrics
    final_accuracy: float = Field(default=0.0, ge=0.0, le=1.0)
    final_performance: float = Field(default=0.0, ge=0.0)
    final_resource_usage: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    overall_improvement_score: float = Field(default=0.0)
    
    # Machine Learning Details
    ml_model_type: Optional[str] = Field(max_length=100)
    training_data_size: int = Field(default=0, ge=0)
    validation_data_size: int = Field(default=0, ge=0)
    feature_importance: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    model_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Recommendations and Actions
    optimization_recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    applied_changes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    rejected_changes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    next_optimization_suggestions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality and Validation
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    cross_validation_score: Optional[float] = Field(ge=0.0, le=1.0)
    robustness_testing: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    stability_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Impact
    estimated_cost_savings: Optional[float] = Field(ge=0.0)
    estimated_time_savings: Optional[float] = Field(ge=0.0)
    business_value_impact: Optional[float] = Field(ge=0.0)
    risk_assessment: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    rule: Optional[IntelligentScanRule] = Relationship(back_populates="optimization_sessions")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_optimization_improvements', 'performance_improvement', 'accuracy_improvement'),
        Index('ix_optimization_results', 'overall_improvement_score', 'model_confidence'),
        Index('ix_optimization_timing', 'started_at', 'duration_minutes'),
    )


class RuleValidationTest(SQLModel, table=True):
    """
    Comprehensive validation testing framework for intelligent scan rules with
    automated test generation, continuous validation, and quality assurance.
    """
    __tablename__ = "rule_validation_tests"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    test_id: str = Field(index=True, unique=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    
    # Test Configuration
    test_name: str = Field(max_length=255, index=True)
    test_category: str = Field(max_length=100, index=True)
    test_type: str = Field(max_length=50)  # unit, integration, performance, security
    test_priority: int = Field(default=5, ge=1, le=10)
    
    # Test Definition
    test_description: Optional[str] = Field(sa_column=Column(Text))
    test_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    expected_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    test_criteria: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Details
    is_automated: bool = Field(default=True)
    execution_frequency: str = Field(max_length=50)  # on_demand, continuous, scheduled
    last_executed: Optional[datetime] = Field(index=True)
    next_execution: Optional[datetime] = None
    execution_count: int = Field(default=0, ge=0)
    
    # Results and Status
    current_status: str = Field(max_length=50, index=True)  # pending, running, passed, failed
    success_count: int = Field(default=0, ge=0)
    failure_count: int = Field(default=0, ge=0)
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Latest Execution Results
    latest_execution_time: Optional[datetime] = None
    latest_duration_seconds: Optional[float] = Field(ge=0.0)
    latest_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    latest_score: Optional[float] = Field(ge=0.0, le=1.0)
    
    # Performance Metrics
    average_execution_time: float = Field(default=0.0, ge=0.0)
    min_execution_time: Optional[float] = Field(ge=0.0)
    max_execution_time: Optional[float] = Field(ge=0.0)
    performance_trend: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality Metrics
    accuracy_scores: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    precision_scores: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    recall_scores: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    consistency_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Error Analysis
    error_patterns: Dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    failure_reasons: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    error_resolution_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Test Environment
    environment_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_dependencies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Continuous Integration
    ci_integration: bool = Field(default=False)
    automated_regression: bool = Field(default=False)
    performance_benchmarking: bool = Field(default=False)
    quality_gates: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    rule: Optional[IntelligentScanRule] = Relationship(back_populates="validation_tests")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_test_performance', 'success_rate', 'average_execution_time'),
        Index('ix_test_quality', 'consistency_score', 'latest_score'),
        Index('ix_test_execution', 'last_executed', 'execution_count'),
    )


class RulePerformanceAnalytics(SQLModel, table=True):
    """
    Advanced performance analytics for intelligent scan rules with real-time monitoring,
    trend analysis, and predictive performance modeling.
    """
    __tablename__ = "rule_performance_analytics"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    analytics_id: str = Field(index=True, unique=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    
    # Time Series Data
    measurement_timestamp: datetime = Field(index=True)
    time_window_start: datetime
    time_window_end: datetime
    data_points_collected: int = Field(default=0, ge=0)
    
    # Execution Performance
    total_executions: int = Field(default=0, ge=0)
    successful_executions: int = Field(default=0, ge=0)
    failed_executions: int = Field(default=0, ge=0)
    average_execution_time: float = Field(default=0.0, ge=0.0)
    median_execution_time: float = Field(default=0.0, ge=0.0)
    p95_execution_time: float = Field(default=0.0, ge=0.0)
    p99_execution_time: float = Field(default=0.0, ge=0.0)
    
    # Throughput Metrics
    records_processed_per_hour: float = Field(default=0.0, ge=0.0)
    data_volume_processed_gb: float = Field(default=0.0, ge=0.0)
    processing_velocity_trend: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    throughput_efficiency: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Resource Utilization
    cpu_utilization_avg: float = Field(default=0.0, ge=0.0, le=100.0)
    cpu_utilization_peak: float = Field(default=0.0, ge=0.0, le=100.0)
    memory_utilization_avg: float = Field(default=0.0, ge=0.0)
    memory_utilization_peak: float = Field(default=0.0, ge=0.0)
    network_io_avg_mbps: float = Field(default=0.0, ge=0.0)
    disk_io_avg_mbps: float = Field(default=0.0, ge=0.0)
    
    # Quality and Accuracy Metrics
    accuracy_trend: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    precision_trend: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    recall_trend: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    f1_score_trend: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    false_positive_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    false_negative_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Business Impact Metrics  
    business_value_generated: float = Field(default=0.0, ge=0.0)
    cost_savings_realized: float = Field(default=0.0, ge=0.0)
    compliance_violations_prevented: int = Field(default=0, ge=0)
    data_quality_improvements: int = Field(default=0, ge=0)
    security_risks_mitigated: int = Field(default=0, ge=0)
    
    # Trend Analysis
    performance_trend_direction: str = Field(max_length=20)  # improving, degrading, stable
    trend_slope: float = Field(default=0.0)
    trend_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    seasonal_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    anomaly_indicators: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Predictive Analytics
    predicted_performance_next_week: Optional[float] = None
    predicted_resource_needs: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    capacity_forecasting: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    optimization_opportunities: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Comparative Analysis
    benchmark_comparison: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    peer_rule_comparison: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    historical_comparison: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    industry_benchmarks: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Alert and Monitoring
    performance_alerts: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    threshold_breaches: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    sla_compliance_status: bool = Field(default=True)
    monitoring_health_score: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Relationships
    rule: Optional[IntelligentScanRule] = Relationship(back_populates="performance_analytics")
    
    # Database Constraints
    __table_args__ = (
        Index('ix_analytics_time_series', 'measurement_timestamp', 'rule_id'),
        Index('ix_analytics_performance', 'average_execution_time', 'throughput_efficiency'),
        Index('ix_analytics_business', 'business_value_generated', 'cost_savings_realized'),
        Index('ix_analytics_quality', 'false_positive_rate', 'false_negative_rate'),
    )


# ===================== ENTERPRISE INTEGRATION MODELS =====================

class RuleDataSourceIntegration(SQLModel, table=True):
    """Integration model linking intelligent scan rules with data sources"""
    __tablename__ = "rule_data_source_integrations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    
    # Integration Configuration
    integration_type: str = Field(max_length=100)  # automatic, manual, scheduled
    scope_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    execution_priority: int = Field(default=5, ge=1, le=10)
    resource_allocation: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance Tracking
    total_executions: int = Field(default=0, ge=0)
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    average_processing_time: float = Field(default=0.0, ge=0.0)
    data_coverage_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Status and Health
    integration_status: str = Field(max_length=50, index=True)
    last_execution: Optional[datetime] = None
    next_scheduled_execution: Optional[datetime] = None
    health_score: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('rule_id', 'data_source_id'),
        Index('ix_integration_performance', 'success_rate', 'average_processing_time'),
    )


class RuleComplianceIntegration(SQLModel, table=True):
    """Integration model linking intelligent scan rules with compliance requirements"""
    __tablename__ = "rule_compliance_integrations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    compliance_rule_id: int = Field(index=True)  # Reference to compliance system
    
    # Integration Details
    compliance_framework: str = Field(max_length=100, index=True)  # GDPR, HIPAA, SOX, etc.
    compliance_requirement: str = Field(max_length=255)
    validation_frequency: str = Field(max_length=50)  # continuous, daily, weekly, monthly
    
    # Compliance Validation
    compliance_status: str = Field(max_length=50, index=True)  # compliant, non_compliant, partial
    last_validation: Optional[datetime] = None
    validation_score: float = Field(default=0.0, ge=0.0, le=1.0)
    violation_count: int = Field(default=0, ge=0)
    
    # Risk Assessment
    risk_level: str = Field(max_length=20)  # low, medium, high, critical
    risk_score: float = Field(default=0.0, ge=0.0, le=10.0)
    mitigation_actions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class RuleClassificationIntegration(SQLModel, table=True):
    """Integration model linking intelligent scan rules with classification systems"""
    __tablename__ = "rule_classification_integrations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: int = Field(foreign_key="intelligent_scan_rules.id", index=True)
    classification_id: int = Field(index=True)  # Reference to classification system
    
    # Classification Configuration
    classification_trigger: bool = Field(default=False)  # Whether rule triggers classification
    classification_confidence_threshold: float = Field(default=0.8, ge=0.0, le=1.0)
    auto_classification_enabled: bool = Field(default=False)
    
    # Integration Results
    classifications_triggered: int = Field(default=0, ge=0)
    successful_classifications: int = Field(default=0, ge=0)
    classification_accuracy: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)


# ===================== RESPONSE AND REQUEST MODELS =====================

class IntelligentScanRuleResponse(BaseModel):
    """Response model for intelligent scan rules"""
    id: int
    rule_uuid: str
    name: str
    display_name: Optional[str]
    description: Optional[str]
    rule_type: IntelligentRuleType
    complexity_level: RuleComplexityLevel
    execution_mode: RuleExecutionMode
    confidence_threshold: float
    is_active: bool
    validation_status: RuleValidationStatus
    execution_count: int
    success_count: int
    average_execution_time: float
    precision_score: float
    recall_score: float
    f1_score: float
    business_priority: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class IntelligentScanRuleCreate(BaseModel):
    """Request model for creating intelligent scan rules"""
    name: str = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    rule_type: IntelligentRuleType
    complexity_level: RuleComplexityLevel = RuleComplexityLevel.MODERATE
    execution_mode: RuleExecutionMode = RuleExecutionMode.ASYNCHRONOUS
    rule_logic: str = Field(min_length=1)
    pattern_definition: Optional[str] = None
    matching_algorithm: PatternMatchingAlgorithm = PatternMatchingAlgorithm.REGEX
    confidence_threshold: float = Field(default=0.8, ge=0.0, le=1.0)
    ai_model_config: Optional[Dict[str, Any]] = {}
    optimization_strategy: RuleOptimizationStrategy = RuleOptimizationStrategy.BALANCED
    trigger_events: Optional[List[RuleTriggerEvent]] = []
    business_category: Optional[str] = Field(max_length=100)
    business_priority: int = Field(default=5, ge=1, le=10)
    data_source_scope: Optional[List[int]] = []
    tags: Optional[List[str]] = []


class RuleExecutionRequest(BaseModel):
    """Request model for executing intelligent scan rules"""
    rule_ids: List[int] = Field(min_items=1)
    data_source_ids: Optional[List[int]] = []
    execution_mode: Optional[RuleExecutionMode] = None
    trigger_event: RuleTriggerEvent = RuleTriggerEvent.MANUAL_TRIGGER
    parameters: Optional[Dict[str, Any]] = {}
    priority_override: Optional[int] = Field(ge=1, le=10)


class RuleOptimizationRequest(BaseModel):
    """Request model for rule optimization"""
    rule_id: int
    optimization_strategy: RuleOptimizationStrategy = RuleOptimizationStrategy.BALANCED
    target_metrics: List[str] = ["performance", "accuracy"]
    constraints: Optional[Dict[str, Any]] = {}
    max_iterations: int = Field(default=100, ge=1, le=1000)


class RulePerformanceReport(BaseModel):
    """Performance report model for intelligent scan rules"""
    rule_id: int
    rule_name: str
    time_period: str
    total_executions: int
    success_rate: float
    average_execution_time: float
    throughput_metrics: Dict[str, float]
    quality_metrics: Dict[str, float]
    business_impact: Dict[str, float]
    optimization_recommendations: List[str]
    trend_analysis: Dict[str, Any]


# ===================== UTILITY FUNCTIONS AND EXPORTS =====================

def generate_rule_uuid() -> str:
    """Generate a unique UUID for scan rules"""
    return f"rule_{uuid.uuid4().hex[:12]}"


def calculate_rule_effectiveness(
    true_positives: int,
    false_positives: int,
    true_negatives: int,
    false_negatives: int
) -> Dict[str, float]:
    """Calculate comprehensive effectiveness metrics for a rule"""
    total = true_positives + false_positives + true_negatives + false_negatives
    
    if total == 0:
        return {"precision": 0.0, "recall": 0.0, "f1_score": 0.0, "accuracy": 0.0}
    
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0.0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0.0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (true_positives + true_negatives) / total
    
    return {
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
        "accuracy": accuracy
    }


# Export all models and types
__all__ = [
    # Enums
    "IntelligentRuleType", "RuleComplexityLevel", "RuleExecutionMode", "RuleOptimizationStrategy",
    "RuleValidationStatus", "PatternMatchingAlgorithm", "RuleImpactLevel", "RuleTriggerEvent",
    
    # Core Models
    "IntelligentScanRule", "RuleExecutionHistory", "RuleOptimizationSession", 
    "RuleValidationTest", "RulePerformanceAnalytics",
    
    # Integration Models
    "RuleDataSourceIntegration", "RuleComplianceIntegration", "RuleClassificationIntegration",
    
    # Request/Response Models
    "IntelligentScanRuleResponse", "IntelligentScanRuleCreate", "RuleExecutionRequest",
    "RuleOptimizationRequest", "RulePerformanceReport",
    
    # Utilities
    "generate_rule_uuid", "calculate_rule_effectiveness"
]