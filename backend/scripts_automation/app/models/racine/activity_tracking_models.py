"""
📊 RACINE MAIN MANAGER - ACTIVITY TRACKING MODELS
==================================================

Advanced activity tracking models for the racine main manager system.
Provides comprehensive audit trails, intelligent monitoring, and
real-time activity analysis that surpasses Databricks and Microsoft Purview.

Features:
- Comprehensive user activity tracking across all system components
- Intelligent behavior pattern recognition and analysis
- Real-time activity monitoring with anomaly detection
- Advanced audit trails with compliance integration
- Performance analytics and productivity insights
- Cross-group activity correlation and insights
- Automated activity classification and tagging
- Privacy-preserving activity analytics
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum as PyEnum
import uuid

Base = declarative_base()

# Enums for activity tracking management
class ActivityType(PyEnum):
    """Activity type definitions"""
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    PAGE_VIEW = "page_view"
    DOCUMENT_ACCESS = "document_access"
    DOCUMENT_EDIT = "document_edit"
    WORKFLOW_EXECUTION = "workflow_execution"
    PIPELINE_RUN = "pipeline_run"
    COLLABORATION_JOIN = "collaboration_join"
    COMMUNICATION_SEND = "communication_send"
    AI_INTERACTION = "ai_interaction"
    SEARCH_QUERY = "search_query"
    CONFIGURATION_CHANGE = "configuration_change"
    PERMISSION_CHANGE = "permission_change"
    DATA_EXPORT = "data_export"
    SYSTEM_ERROR = "system_error"

class ActivityCategory(PyEnum):
    """Activity category definitions"""
    AUTHENTICATION = "authentication"
    NAVIGATION = "navigation"
    CONTENT_INTERACTION = "content_interaction"
    WORKFLOW_MANAGEMENT = "workflow_management"
    COLLABORATION = "collaboration"
    COMMUNICATION = "communication"
    AI_ASSISTANCE = "ai_assistance"
    SYSTEM_ADMINISTRATION = "system_administration"
    DATA_MANAGEMENT = "data_management"
    SECURITY = "security"
    PERFORMANCE = "performance"
    ERROR = "error"

class ActivitySeverity(PyEnum):
    """Activity severity definitions"""
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class BehaviorPattern(PyEnum):
    """Behavior pattern definitions"""
    NORMAL = "normal"
    ANOMALOUS = "anomalous"
    SUSPICIOUS = "suspicious"
    PRODUCTIVITY_HIGH = "productivity_high"
    PRODUCTIVITY_LOW = "productivity_low"
    LEARNING = "learning"
    EXPLORING = "exploring"
    FOCUSED = "focused"

class AggregationLevel(PyEnum):
    """Aggregation level definitions"""
    RAW = "raw"
    MINUTE = "minute"
    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"

class PrivacyLevel(PyEnum):
    """Privacy level definitions"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    ANONYMOUS = "anonymous"

class AlertType(PyEnum):
    """Alert type definitions"""
    SECURITY_BREACH = "security_breach"
    ANOMALY_DETECTED = "anomaly_detected"
    PERFORMANCE_DEGRADATION = "performance_degradation"
    COMPLIANCE_VIOLATION = "compliance_violation"
    ERROR_THRESHOLD = "error_threshold"
    UNUSUAL_BEHAVIOR = "unusual_behavior"
    SYSTEM_HEALTH = "system_health"


class UserActivity(Base):
    """
    📊 User Activity Model
    
    Comprehensive user activity tracking with intelligent analysis,
    behavior pattern recognition, and privacy controls.
    """
    __tablename__ = "user_activities"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # Activity details
    activity_type = Column(Enum(ActivityType), nullable=False, index=True)
    activity_category = Column(Enum(ActivityCategory), nullable=False)
    activity_name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # User and session information
    user_id = Column(Integer, nullable=False, index=True)
    session_id = Column(String(100), index=True)
    workspace_id = Column(String(50), index=True)
    group_id = Column(String(50))
    
    # Context and location
    context_type = Column(String(100))
    context_id = Column(String(100))
    page_url = Column(String(1000))
    referrer_url = Column(String(1000))
    
    # Activity metadata
    activity_data = Column(JSON, default=lambda: {})
    parameters = Column(JSON, default=lambda: {})
    result_data = Column(JSON, default=lambda: {})
    error_details = Column(JSON, default=lambda: {})
    
    # Timing information
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    duration_ms = Column(Integer, default=0)
    response_time_ms = Column(Integer, default=0)
    processing_time_ms = Column(Integer, default=0)
    
    # Technical details
    ip_address = Column(String(45))
    user_agent = Column(String(1000))
    device_type = Column(String(50))
    browser = Column(String(100))
    operating_system = Column(String(100))
    
    # Geolocation
    country = Column(String(100))
    region = Column(String(100))
    city = Column(String(100))
    timezone = Column(String(50))
    coordinates = Column(JSON, default=lambda: {})
    
    # Performance metrics
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    network_latency = Column(Float, default=0.0)
    bandwidth_used = Column(Integer, default=0)
    
    # Status and outcome
    status = Column(String(20), default="completed")
    success = Column(Boolean, default=True)
    error_code = Column(String(50))
    error_message = Column(Text)
    
    # Security and compliance
    security_level = Column(String(20), default="normal")
    compliance_flags = Column(JSON, default=lambda: [])
    audit_required = Column(Boolean, default=False)
    sensitive_data_access = Column(Boolean, default=False)
    
    # Behavior analysis
    behavior_pattern = Column(Enum(BehaviorPattern), default=BehaviorPattern.NORMAL)
    anomaly_score = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    productivity_score = Column(Float, default=0.0)
    
    # AI and automation
    ai_generated = Column(Boolean, default=False)
    automated_action = Column(Boolean, default=False)
    ai_assistance_used = Column(Boolean, default=False)
    intelligent_routing = Column(Boolean, default=False)
    
    # Cross-reference and relationships
    parent_activity_id = Column(String(50))
    related_activities = Column(JSON, default=lambda: [])
    workflow_id = Column(String(50))
    pipeline_id = Column(String(50))
    
    # Privacy and anonymization
    privacy_level = Column(Enum(PrivacyLevel), default=PrivacyLevel.INTERNAL)
    anonymized = Column(Boolean, default=False)
    pseudonymized = Column(Boolean, default=False)
    data_retention_days = Column(Integer, default=365)
    
    # Analytics and insights
    business_impact = Column(String(20), default="normal")
    value_score = Column(Float, default=0.0)
    efficiency_score = Column(Float, default=0.0)
    quality_score = Column(Float, default=0.0)
    
    # Integration and source
    source_system = Column(String(100))
    integration_id = Column(String(50))
    external_id = Column(String(100))
    sync_status = Column(String(20), default="synced")
    
    # Tags and classification
    tags = Column(JSON, default=lambda: [])
    labels = Column(JSON, default=lambda: [])
    categories = Column(JSON, default=lambda: [])
    custom_fields = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    ingested_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    enriched_at = Column(DateTime(timezone=True))
    metadata = Column(JSON, default=lambda: {})

    def __repr__(self):
        return f"<UserActivity(id={self.id}, type='{self.activity_type}', user_id={self.user_id})>"


class ActivitySession(Base):
    """
    🎯 Activity Session Model
    
    Advanced session tracking with comprehensive analytics,
    behavior analysis, and intelligent insights.
    """
    __tablename__ = "activity_sessions"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # Session details
    user_id = Column(Integer, nullable=False, index=True)
    workspace_id = Column(String(50), index=True)
    session_type = Column(String(50), default="user_session")
    session_name = Column(String(200))
    
    # Session timing
    started_at = Column(DateTime(timezone=True), nullable=False, index=True)
    ended_at = Column(DateTime(timezone=True))
    last_activity = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer, default=0)
    idle_time_minutes = Column(Integer, default=0)
    
    # Session status
    status = Column(String(20), default="active")
    is_active = Column(Boolean, default=True)
    termination_reason = Column(String(100))
    logout_type = Column(String(50))
    
    # Activity summary
    total_activities = Column(Integer, default=0)
    unique_pages_visited = Column(Integer, default=0)
    documents_accessed = Column(Integer, default=0)
    workflows_executed = Column(Integer, default=0)
    
    # Interaction patterns
    page_views = Column(JSON, default=lambda: [])
    navigation_path = Column(JSON, default=lambda: [])
    interaction_sequence = Column(JSON, default=lambda: [])
    time_distribution = Column(JSON, default=lambda: {})
    
    # Technical environment
    ip_address = Column(String(45))
    user_agent = Column(String(1000))
    device_fingerprint = Column(String(200))
    screen_resolution = Column(String(20))
    browser_version = Column(String(100))
    
    # Performance metrics
    average_response_time = Column(Float, default=0.0)
    peak_response_time = Column(Float, default=0.0)
    error_count = Column(Integer, default=0)
    success_rate = Column(Float, default=100.0)
    
    # Productivity analysis
    productivity_score = Column(Float, default=0.0)
    focus_score = Column(Float, default=0.0)
    efficiency_score = Column(Float, default=0.0)
    task_completion_rate = Column(Float, default=0.0)
    
    # Behavior patterns
    behavior_profile = Column(JSON, default=lambda: {})
    interaction_style = Column(String(50))
    usage_pattern = Column(String(50))
    engagement_level = Column(String(20))
    
    # Security analysis
    security_events = Column(Integer, default=0)
    suspicious_activities = Column(JSON, default=lambda: [])
    risk_indicators = Column(JSON, default=lambda: [])
    security_score = Column(Float, default=100.0)
    
    # Goals and achievements
    session_goals = Column(JSON, default=lambda: [])
    goals_achieved = Column(JSON, default=lambda: [])
    milestones_reached = Column(JSON, default=lambda: [])
    completion_percentage = Column(Float, default=0.0)
    
    # Learning and adaptation
    new_features_used = Column(JSON, default=lambda: [])
    help_requests = Column(Integer, default=0)
    ai_interactions = Column(Integer, default=0)
    learning_progress = Column(JSON, default=lambda: {})
    
    # Collaboration activities
    collaboration_sessions = Column(Integer, default=0)
    messages_sent = Column(Integer, default=0)
    documents_shared = Column(Integer, default=0)
    team_interactions = Column(JSON, default=lambda: [])
    
    # Quality metrics
    session_quality = Column(Float, default=0.0)
    user_satisfaction = Column(Float, default=0.0)
    technical_quality = Column(Float, default=0.0)
    content_quality = Column(Float, default=0.0)
    
    # Analytics and insights
    session_insights = Column(JSON, default=lambda: [])
    recommendations = Column(JSON, default=lambda: [])
    improvement_opportunities = Column(JSON, default=lambda: [])
    next_best_actions = Column(JSON, default=lambda: [])
    
    # Privacy and compliance
    privacy_settings = Column(JSON, default=lambda: {})
    data_collection_consent = Column(Boolean, default=True)
    tracking_preferences = Column(JSON, default=lambda: {})
    anonymization_level = Column(String(20), default="none")
    
    # Metadata and tracking
    session_context = Column(JSON, default=lambda: {})
    environment_info = Column(JSON, default=lambda: {})
    custom_attributes = Column(JSON, default=lambda: {})
    metadata = Column(JSON, default=lambda: {})

    def __repr__(self):
        return f"<ActivitySession(id={self.id}, user_id={self.user_id}, duration={self.duration_minutes})>"


class ActivityAnalytics(Base):
    """
    📈 Activity Analytics Model
    
    Advanced analytics engine with pattern recognition,
    predictive insights, and comprehensive reporting.
    """
    __tablename__ = "activity_analytics"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    analytics_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # Analytics scope and configuration
    analytics_type = Column(String(50), nullable=False)
    scope = Column(String(50), default="user")
    target_id = Column(String(100))  # user_id, workspace_id, etc.
    aggregation_level = Column(Enum(AggregationLevel), default=AggregationLevel.DAY)
    
    # Time period
    period_start = Column(DateTime(timezone=True), nullable=False, index=True)
    period_end = Column(DateTime(timezone=True), nullable=False)
    calculation_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Activity volume metrics
    total_activities = Column(Integer, default=0)
    unique_users = Column(Integer, default=0)
    active_sessions = Column(Integer, default=0)
    page_views = Column(Integer, default=0)
    document_interactions = Column(Integer, default=0)
    
    # Engagement metrics
    average_session_duration = Column(Float, default=0.0)
    bounce_rate = Column(Float, default=0.0)
    return_user_rate = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    
    # Performance metrics
    average_response_time = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    success_rate = Column(Float, default=100.0)
    system_availability = Column(Float, default=100.0)
    
    # Productivity metrics
    tasks_completed = Column(Integer, default=0)
    workflows_executed = Column(Integer, default=0)
    productivity_score = Column(Float, default=0.0)
    efficiency_score = Column(Float, default=0.0)
    
    # Collaboration metrics
    collaboration_events = Column(Integer, default=0)
    messages_exchanged = Column(Integer, default=0)
    documents_shared = Column(Integer, default=0)
    team_productivity = Column(Float, default=0.0)
    
    # AI and automation metrics
    ai_interactions = Column(Integer, default=0)
    automation_usage = Column(Integer, default=0)
    ai_assistance_effectiveness = Column(Float, default=0.0)
    automation_efficiency = Column(Float, default=0.0)
    
    # Security and compliance metrics
    security_events = Column(Integer, default=0)
    compliance_violations = Column(Integer, default=0)
    risk_incidents = Column(Integer, default=0)
    security_score = Column(Float, default=100.0)
    
    # Behavior analysis
    behavior_patterns = Column(JSON, default=lambda: {})
    anomaly_count = Column(Integer, default=0)
    pattern_changes = Column(JSON, default=lambda: [])
    trend_analysis = Column(JSON, default=lambda: {})
    
    # Feature usage
    feature_adoption = Column(JSON, default=lambda: {})
    popular_features = Column(JSON, default=lambda: [])
    underused_features = Column(JSON, default=lambda: [])
    feature_satisfaction = Column(JSON, default=lambda: {})
    
    # User journey analysis
    common_paths = Column(JSON, default=lambda: [])
    conversion_funnels = Column(JSON, default=lambda: {})
    drop_off_points = Column(JSON, default=lambda: [])
    journey_optimization = Column(JSON, default=lambda: [])
    
    # Content and resource usage
    popular_content = Column(JSON, default=lambda: [])
    content_engagement = Column(JSON, default=lambda: {})
    resource_utilization = Column(JSON, default=lambda: {})
    content_effectiveness = Column(JSON, default=lambda: {})
    
    # Performance insights
    bottlenecks = Column(JSON, default=lambda: [])
    optimization_opportunities = Column(JSON, default=lambda: [])
    performance_trends = Column(JSON, default=lambda: {})
    capacity_planning = Column(JSON, default=lambda: {})
    
    # Predictive analytics
    forecasts = Column(JSON, default=lambda: {})
    predictive_models = Column(JSON, default=lambda: {})
    recommendations = Column(JSON, default=lambda: [])
    early_warnings = Column(JSON, default=lambda: [])
    
    # Quality metrics
    data_quality_score = Column(Float, default=100.0)
    analysis_confidence = Column(Float, default=0.0)
    statistical_significance = Column(Float, default=0.0)
    sample_size = Column(Integer, default=0)
    
    # Comparative analysis
    period_over_period = Column(JSON, default=lambda: {})
    benchmark_comparisons = Column(JSON, default=lambda: {})
    cohort_analysis = Column(JSON, default=lambda: {})
    segment_analysis = Column(JSON, default=lambda: {})
    
    # Business impact
    business_kpis = Column(JSON, default=lambda: {})
    roi_metrics = Column(JSON, default=lambda: {})
    cost_efficiency = Column(JSON, default=lambda: {})
    value_creation = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    calculation_method = Column(String(100))
    data_sources = Column(JSON, default=lambda: [])
    processing_time_ms = Column(Integer, default=0)
    metadata = Column(JSON, default=lambda: {})

    def __repr__(self):
        return f"<ActivityAnalytics(id={self.id}, type='{self.analytics_type}', scope='{self.scope}')>"


class BehaviorPattern(Base):
    """
    🧠 Behavior Pattern Model
    
    Intelligent behavior pattern recognition with machine learning,
    anomaly detection, and personalized insights.
    """
    __tablename__ = "behavior_patterns"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    pattern_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # Pattern definition
    pattern_name = Column(String(200), nullable=False)
    pattern_type = Column(String(50), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    
    # Target and scope
    user_id = Column(Integer, index=True)
    workspace_id = Column(String(50))
    group_id = Column(String(50))
    scope = Column(String(50), default="user")
    
    # Pattern characteristics
    pattern_definition = Column(JSON, nullable=False)
    triggers = Column(JSON, default=lambda: [])
    conditions = Column(JSON, default=lambda: [])
    indicators = Column(JSON, default=lambda: [])
    
    # Detection and recognition
    detection_algorithm = Column(String(100))
    confidence_score = Column(Float, default=0.0)
    accuracy_score = Column(Float, default=0.0)
    false_positive_rate = Column(Float, default=0.0)
    
    # Pattern metrics
    frequency = Column(Float, default=0.0)
    consistency = Column(Float, default=0.0)
    predictability = Column(Float, default=0.0)
    stability = Column(Float, default=0.0)
    
    # Temporal characteristics
    first_observed = Column(DateTime(timezone=True))
    last_observed = Column(DateTime(timezone=True))
    observation_count = Column(Integer, default=0)
    pattern_duration = Column(JSON, default=lambda: {})
    
    # Context and environment
    contextual_factors = Column(JSON, default=lambda: {})
    environmental_conditions = Column(JSON, default=lambda: {})
    situational_triggers = Column(JSON, default=lambda: [])
    external_influences = Column(JSON, default=lambda: [])
    
    # Machine learning features
    feature_vector = Column(JSON, default=lambda: [])
    model_version = Column(String(20))
    training_data_size = Column(Integer, default=0)
    model_performance = Column(JSON, default=lambda: {})
    
    # Pattern evolution
    evolution_history = Column(JSON, default=lambda: [])
    trend_direction = Column(String(20))
    stability_score = Column(Float, default=0.0)
    adaptation_rate = Column(Float, default=0.0)
    
    # Anomaly detection
    is_anomalous = Column(Boolean, default=False)
    anomaly_type = Column(String(50))
    anomaly_severity = Column(Enum(ActivitySeverity), default=ActivitySeverity.INFO)
    deviation_score = Column(Float, default=0.0)
    
    # Business impact
    impact_level = Column(String(20), default="low")
    business_relevance = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    opportunity_score = Column(Float, default=0.0)
    
    # Prediction and forecasting
    prediction_accuracy = Column(Float, default=0.0)
    next_occurrence_probability = Column(Float, default=0.0)
    forecast_horizon = Column(Integer, default=0)  # hours
    seasonal_patterns = Column(JSON, default=lambda: {})
    
    # Intervention and optimization
    intervention_recommendations = Column(JSON, default=lambda: [])
    optimization_opportunities = Column(JSON, default=lambda: [])
    preventive_actions = Column(JSON, default=lambda: [])
    enhancement_suggestions = Column(JSON, default=lambda: [])
    
    # Privacy and ethics
    privacy_impact = Column(String(20), default="low")
    ethical_considerations = Column(JSON, default=lambda: [])
    bias_assessment = Column(JSON, default=lambda: {})
    fairness_metrics = Column(JSON, default=lambda: {})
    
    # Validation and quality
    validation_status = Column(String(20), default="pending")
    human_verified = Column(Boolean, default=False)
    expert_review = Column(JSON, default=lambda: {})
    quality_score = Column(Float, default=0.0)
    
    # Integration and automation
    automated_response = Column(Boolean, default=False)
    workflow_integration = Column(JSON, default=lambda: {})
    alert_configuration = Column(JSON, default=lambda: {})
    action_triggers = Column(JSON, default=lambda: [])
    
    # Metadata and tracking
    created_by = Column(String(100), default="system")
    tags = Column(JSON, default=lambda: [])
    custom_attributes = Column(JSON, default=lambda: {})
    metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<BehaviorPattern(id={self.id}, name='{self.pattern_name}', type='{self.pattern_type}')>"


class ActivityAlert(Base):
    """
    🚨 Activity Alert Model
    
    Intelligent alert system with smart notifications,
    escalation procedures, and automated responses.
    """
    __tablename__ = "activity_alerts"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # Alert definition
    alert_type = Column(Enum(AlertType), nullable=False)
    alert_name = Column(String(200), nullable=False)
    description = Column(Text)
    severity = Column(Enum(ActivitySeverity), nullable=False)
    
    # Source and context
    source_activity_id = Column(String(50))
    source_pattern_id = Column(String(50))
    user_id = Column(Integer, index=True)
    workspace_id = Column(String(50))
    context_data = Column(JSON, default=lambda: {})
    
    # Alert conditions and triggers
    trigger_conditions = Column(JSON, nullable=False)
    threshold_values = Column(JSON, default=lambda: {})
    detection_rules = Column(JSON, default=lambda: [])
    trigger_timestamp = Column(DateTime(timezone=True), nullable=False)
    
    # Alert status and lifecycle
    status = Column(String(20), default="active")
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer)
    acknowledged_at = Column(DateTime(timezone=True))
    resolved = Column(Boolean, default=False)
    resolved_by = Column(Integer)
    resolved_at = Column(DateTime(timezone=True))
    
    # Impact assessment
    impact_level = Column(String(20), default="medium")
    affected_users = Column(JSON, default=lambda: [])
    affected_systems = Column(JSON, default=lambda: [])
    business_impact = Column(Text)
    
    # Risk and priority
    risk_score = Column(Float, default=0.0)
    priority_score = Column(Float, default=0.0)
    urgency_level = Column(String(20), default="normal")
    escalation_level = Column(Integer, default=0)
    
    # Detection and analysis
    detection_method = Column(String(100))
    confidence_score = Column(Float, default=0.0)
    false_positive_probability = Column(Float, default=0.0)
    related_alerts = Column(JSON, default=lambda: [])
    
    # Response and actions
    automated_response = Column(Boolean, default=False)
    response_actions = Column(JSON, default=lambda: [])
    manual_actions_required = Column(JSON, default=lambda: [])
    corrective_measures = Column(JSON, default=lambda: [])
    
    # Notification and communication
    notification_sent = Column(Boolean, default=False)
    notification_channels = Column(JSON, default=lambda: [])
    recipients = Column(JSON, default=lambda: [])
    escalation_path = Column(JSON, default=lambda: [])
    
    # Investigation and analysis
    investigation_status = Column(String(20), default="pending")
    root_cause = Column(Text)
    investigation_notes = Column(Text)
    evidence = Column(JSON, default=lambda: [])
    
    # Resolution and follow-up
    resolution_summary = Column(Text)
    lessons_learned = Column(JSON, default=lambda: [])
    preventive_measures = Column(JSON, default=lambda: [])
    follow_up_actions = Column(JSON, default=lambda: [])
    
    # Performance metrics
    detection_time = Column(Float, default=0.0)  # minutes
    response_time = Column(Float, default=0.0)  # minutes
    resolution_time = Column(Float, default=0.0)  # minutes
    effectiveness_score = Column(Float, default=0.0)
    
    # Learning and improvement
    feedback_provided = Column(Boolean, default=False)
    feedback_score = Column(Float)
    accuracy_validated = Column(Boolean, default=False)
    model_updates = Column(JSON, default=lambda: [])
    
    # Compliance and audit
    compliance_impact = Column(JSON, default=lambda: [])
    audit_requirements = Column(JSON, default=lambda: [])
    regulatory_notifications = Column(JSON, default=lambda: [])
    documentation_required = Column(Boolean, default=False)
    
    # Integration and workflow
    workflow_triggered = Column(Boolean, default=False)
    workflow_id = Column(String(50))
    integration_responses = Column(JSON, default=lambda: [])
    external_notifications = Column(JSON, default=lambda: [])
    
    # Metadata and tracking
    alert_context = Column(JSON, default=lambda: {})
    custom_fields = Column(JSON, default=lambda: {})
    tags = Column(JSON, default=lambda: [])
    metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<ActivityAlert(id={self.id}, type='{self.alert_type}', severity='{self.severity}')>"


class ActivityAudit(Base):
    """
    🔍 Activity Audit Model
    
    Comprehensive audit trail with compliance integration,
    forensic capabilities, and intelligent analysis.
    """
    __tablename__ = "activity_audits"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # Audit scope and configuration
    audit_type = Column(String(50), nullable=False)
    audit_name = Column(String(200))
    description = Column(Text)
    scope = Column(String(50), default="comprehensive")
    
    # Audit period
    audit_start = Column(DateTime(timezone=True), nullable=False)
    audit_end = Column(DateTime(timezone=True), nullable=False)
    audit_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Audit targets
    target_users = Column(JSON, default=lambda: [])
    target_workspaces = Column(JSON, default=lambda: [])
    target_activities = Column(JSON, default=lambda: [])
    target_systems = Column(JSON, default=lambda: [])
    
    # Compliance framework
    compliance_standards = Column(JSON, default=lambda: [])
    regulatory_requirements = Column(JSON, default=lambda: [])
    internal_policies = Column(JSON, default=lambda: [])
    audit_objectives = Column(JSON, default=lambda: [])
    
    # Audit findings
    total_activities_reviewed = Column(Integer, default=0)
    violations_found = Column(Integer, default=0)
    compliance_score = Column(Float, default=100.0)
    risk_score = Column(Float, default=0.0)
    
    # Detailed findings
    compliance_violations = Column(JSON, default=lambda: [])
    security_issues = Column(JSON, default=lambda: [])
    policy_breaches = Column(JSON, default=lambda: [])
    anomalies_detected = Column(JSON, default=lambda: [])
    
    # Risk assessment
    high_risk_activities = Column(JSON, default=lambda: [])
    medium_risk_activities = Column(JSON, default=lambda: [])
    low_risk_activities = Column(JSON, default=lambda: [])
    risk_mitigation_required = Column(JSON, default=lambda: [])
    
    # User behavior analysis
    user_compliance_scores = Column(JSON, default=lambda: {})
    behavioral_anomalies = Column(JSON, default=lambda: [])
    suspicious_patterns = Column(JSON, default=lambda: [])
    access_violations = Column(JSON, default=lambda: [])
    
    # System performance audit
    system_availability = Column(Float, default=100.0)
    performance_issues = Column(JSON, default=lambda: [])
    error_patterns = Column(JSON, default=lambda: [])
    capacity_utilization = Column(JSON, default=lambda: {})
    
    # Data integrity and quality
    data_quality_score = Column(Float, default=100.0)
    data_inconsistencies = Column(JSON, default=lambda: [])
    missing_data_points = Column(JSON, default=lambda: [])
    data_corruption_incidents = Column(JSON, default=lambda: [])
    
    # Privacy and security audit
    privacy_compliance = Column(Float, default=100.0)
    data_access_patterns = Column(JSON, default=lambda: {})
    unauthorized_access = Column(JSON, default=lambda: [])
    data_export_activities = Column(JSON, default=lambda: [])
    
    # Audit methodology
    audit_procedures = Column(JSON, default=lambda: [])
    sampling_method = Column(String(100))
    analysis_techniques = Column(JSON, default=lambda: [])
    validation_methods = Column(JSON, default=lambda: [])
    
    # Evidence and documentation
    evidence_collected = Column(JSON, default=lambda: [])
    supporting_documents = Column(JSON, default=lambda: [])
    witness_statements = Column(JSON, default=lambda: [])
    technical_artifacts = Column(JSON, default=lambda: [])
    
    # Recommendations and actions
    recommendations = Column(JSON, default=lambda: [])
    corrective_actions = Column(JSON, default=lambda: [])
    preventive_measures = Column(JSON, default=lambda: [])
    process_improvements = Column(JSON, default=lambda: [])
    
    # Follow-up and tracking
    action_plan = Column(JSON, default=lambda: {})
    implementation_timeline = Column(JSON, default=lambda: {})
    responsible_parties = Column(JSON, default=lambda: [])
    follow_up_required = Column(Boolean, default=False)
    
    # Quality assurance
    audit_quality_score = Column(Float, default=0.0)
    peer_reviewed = Column(Boolean, default=False)
    external_validation = Column(Boolean, default=False)
    audit_confidence = Column(Float, default=0.0)
    
    # Reporting and communication
    executive_summary = Column(Text)
    detailed_report = Column(Text)
    stakeholder_notifications = Column(JSON, default=lambda: [])
    regulatory_submissions = Column(JSON, default=lambda: [])
    
    # Audit trail integrity
    hash_signature = Column(String(256))
    digital_signature = Column(JSON, default=lambda: {})
    chain_of_custody = Column(JSON, default=lambda: [])
    tamper_evidence = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    auditor_id = Column(Integer)
    audit_team = Column(JSON, default=lambda: [])
    audit_tools_used = Column(JSON, default=lambda: [])
    processing_statistics = Column(JSON, default=lambda: {})
    metadata = Column(JSON, default=lambda: {})

    def __repr__(self):
        return f"<ActivityAudit(id={self.id}, type='{self.audit_type}', compliance_score={self.compliance_score})>"


# Database indexes for optimal performance
def create_activity_tracking_indexes():
    """Create additional database indexes for optimal query performance"""
    indexes = [
        # UserActivity indexes
        "CREATE INDEX IF NOT EXISTS idx_user_activities_user_timestamp ON user_activities(user_id, timestamp);",
        "CREATE INDEX IF NOT EXISTS idx_user_activities_type_category ON user_activities(activity_type, activity_category);",
        "CREATE INDEX IF NOT EXISTS idx_user_activities_workspace ON user_activities(workspace_id, timestamp);",
        "CREATE INDEX IF NOT EXISTS idx_user_activities_session ON user_activities(session_id, timestamp);",
        "CREATE INDEX IF NOT EXISTS idx_user_activities_behavior ON user_activities(behavior_pattern, anomaly_score);",
        "CREATE INDEX IF NOT EXISTS idx_user_activities_status ON user_activities(status, success);",
        "CREATE INDEX IF NOT EXISTS idx_user_activities_security ON user_activities(security_level, risk_score);",
        
        # ActivitySession indexes
        "CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_started ON activity_sessions(user_id, started_at);",
        "CREATE INDEX IF NOT EXISTS idx_activity_sessions_workspace ON activity_sessions(workspace_id, started_at);",
        "CREATE INDEX IF NOT EXISTS idx_activity_sessions_status ON activity_sessions(status, is_active);",
        "CREATE INDEX IF NOT EXISTS idx_activity_sessions_duration ON activity_sessions(duration_minutes);",
        "CREATE INDEX IF NOT EXISTS idx_activity_sessions_productivity ON activity_sessions(productivity_score);",
        
        # ActivityAnalytics indexes
        "CREATE INDEX IF NOT EXISTS idx_activity_analytics_type_period ON activity_analytics(analytics_type, period_start);",
        "CREATE INDEX IF NOT EXISTS idx_activity_analytics_target ON activity_analytics(target_id, aggregation_level);",
        "CREATE INDEX IF NOT EXISTS idx_activity_analytics_calculation ON activity_analytics(calculation_timestamp);",
        
        # BehaviorPattern indexes
        "CREATE INDEX IF NOT EXISTS idx_behavior_patterns_user ON behavior_patterns(user_id, pattern_type);",
        "CREATE INDEX IF NOT EXISTS idx_behavior_patterns_workspace ON behavior_patterns(workspace_id, pattern_type);",
        "CREATE INDEX IF NOT EXISTS idx_behavior_patterns_confidence ON behavior_patterns(confidence_score);",
        "CREATE INDEX IF NOT EXISTS idx_behavior_patterns_anomaly ON behavior_patterns(is_anomalous, anomaly_severity);",
        "CREATE INDEX IF NOT EXISTS idx_behavior_patterns_observed ON behavior_patterns(last_observed);",
        
        # ActivityAlert indexes
        "CREATE INDEX IF NOT EXISTS idx_activity_alerts_type_severity ON activity_alerts(alert_type, severity);",
        "CREATE INDEX IF NOT EXISTS idx_activity_alerts_user ON activity_alerts(user_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_activity_alerts_workspace ON activity_alerts(workspace_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_activity_alerts_trigger ON activity_alerts(trigger_timestamp, status);",
        "CREATE INDEX IF NOT EXISTS idx_activity_alerts_priority ON activity_alerts(priority_score, status);",
        
        # ActivityAudit indexes
        "CREATE INDEX IF NOT EXISTS idx_activity_audits_type_period ON activity_audits(audit_type, audit_start);",
        "CREATE INDEX IF NOT EXISTS idx_activity_audits_compliance ON activity_audits(compliance_score);",
        "CREATE INDEX IF NOT EXISTS idx_activity_audits_timestamp ON activity_audits(audit_timestamp);",
    ]
    return indexes


# Utility functions for activity tracking management
def generate_activity_id() -> str:
    """Generate a unique activity ID"""
    return f"act_{uuid.uuid4().hex[:12]}"


def generate_session_id() -> str:
    """Generate a unique session ID"""
    return f"sess_{uuid.uuid4().hex[:12]}"


def generate_analytics_id() -> str:
    """Generate a unique analytics ID"""
    return f"analytics_{uuid.uuid4().hex[:8]}"


def generate_pattern_id() -> str:
    """Generate a unique pattern ID"""
    return f"pattern_{uuid.uuid4().hex[:8]}"


def generate_alert_id() -> str:
    """Generate a unique alert ID"""
    return f"alert_{uuid.uuid4().hex[:10]}"


def generate_audit_id() -> str:
    """Generate a unique audit ID"""
    return f"audit_{uuid.uuid4().hex[:10]}"