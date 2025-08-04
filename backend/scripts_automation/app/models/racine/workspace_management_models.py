"""
🌐 RACINE MAIN MANAGER - WORKSPACE MANAGEMENT MODELS
==================================================

Advanced enterprise workspace management models for the racine main manager.
Provides global workspace orchestration, multi-tenant isolation, and intelligent
workspace features that surpass Databricks and Microsoft Purview.

Features:
- Global workspace definition and management
- Workspace templates and governance policies
- Multi-tenant isolation with enterprise security
- Workspace analytics and performance tracking
- Cross-workspace collaboration and resource sharing
- AI-powered workspace optimization
- Integration with external enterprise systems
- Comprehensive audit trails and compliance
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

# Enums for workspace management
class WorkspaceType(PyEnum):
    """Workspace type definitions"""
    PERSONAL = "personal"
    TEAM = "team"
    PROJECT = "project"
    DEPARTMENT = "department"
    ENTERPRISE = "enterprise"
    SANDBOX = "sandbox"
    PRODUCTION = "production"
    DEVELOPMENT = "development"

class WorkspaceStatus(PyEnum):
    """Workspace status definitions"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"
    MAINTENANCE = "maintenance"
    PROVISIONING = "provisioning"

class ResourceType(PyEnum):
    """Resource type definitions"""
    COMPUTE = "compute"
    STORAGE = "storage"
    MEMORY = "memory"
    NETWORK = "network"
    DATABASE = "database"
    AI_MODEL = "ai_model"
    PIPELINE = "pipeline"
    WORKFLOW = "workflow"

class PolicyType(PyEnum):
    """Policy type definitions"""
    GOVERNANCE = "governance"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    ACCESS_CONTROL = "access_control"
    DATA_RETENTION = "data_retention"
    BACKUP = "backup"
    MONITORING = "monitoring"

class IntegrationType(PyEnum):
    """Integration type definitions"""
    IDENTITY_PROVIDER = "identity_provider"
    DATA_SOURCE = "data_source"
    EXTERNAL_API = "external_api"
    CLOUD_SERVICE = "cloud_service"
    MONITORING_TOOL = "monitoring_tool"
    COLLABORATION_TOOL = "collaboration_tool"
    NOTIFICATION_SERVICE = "notification_service"

class MemberRole(PyEnum):
    """Workspace member role definitions"""
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"
    CONTRIBUTOR = "contributor"
    GUEST = "guest"


class GlobalWorkspace(Base):
    """
    🌐 Global Workspace Model
    
    Master workspace definition with enterprise-grade features,
    multi-tenant isolation, and intelligent workspace management.
    """
    __tablename__ = "global_workspaces"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    display_name = Column(String(300))
    description = Column(Text)
    
    # Workspace configuration
    workspace_type = Column(Enum(WorkspaceType), nullable=False, default=WorkspaceType.TEAM)
    status = Column(Enum(WorkspaceStatus), nullable=False, default=WorkspaceStatus.PROVISIONING)
    version = Column(String(20), default="1.0.0")
    tags = Column(JSON, default=lambda: [])
    
    # Ownership and access
    owner_id = Column(Integer, nullable=False, index=True)
    tenant_id = Column(String(100), nullable=False, index=True)
    organization_id = Column(Integer, index=True)
    department_id = Column(Integer, index=True)
    
    # Workspace settings
    is_public = Column(Boolean, default=False)
    is_template = Column(Boolean, default=False)
    auto_scaling_enabled = Column(Boolean, default=True)
    ai_assistance_enabled = Column(Boolean, default=True)
    real_time_collaboration = Column(Boolean, default=True)
    advanced_monitoring = Column(Boolean, default=True)
    
    # Resource limits and quotas
    max_compute_units = Column(Integer, default=100)
    max_storage_gb = Column(Integer, default=1000)
    max_memory_gb = Column(Integer, default=64)
    max_concurrent_jobs = Column(Integer, default=10)
    max_members = Column(Integer, default=50)
    
    # Performance and optimization
    performance_tier = Column(String(20), default="standard")
    optimization_level = Column(String(20), default="balanced")
    auto_optimization = Column(Boolean, default=True)
    resource_monitoring = Column(Boolean, default=True)
    
    # Security and compliance
    security_level = Column(String(20), default="standard")
    encryption_enabled = Column(Boolean, default=True)
    audit_logging = Column(Boolean, default=True)
    compliance_frameworks = Column(JSON, default=lambda: [])
    data_classification = Column(String(50), default="internal")
    
    # Integration and connectivity
    external_integrations = Column(JSON, default=lambda: {})
    api_endpoints = Column(JSON, default=lambda: {})
    webhook_urls = Column(JSON, default=lambda: [])
    custom_domains = Column(JSON, default=lambda: [])
    
    # Metadata and tracking
    metadata = Column(JSON, default=lambda: {})
    custom_fields = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_accessed_at = Column(DateTime(timezone=True))
    archived_at = Column(DateTime(timezone=True))
    
    # Relationships
    template = relationship("WorkspaceTemplate", back_populates="workspace", uselist=False)
    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    resources = relationship("WorkspaceResource", back_populates="workspace", cascade="all, delete-orphan")
    policies = relationship("WorkspacePolicy", back_populates="workspace", cascade="all, delete-orphan")
    analytics = relationship("WorkspaceAnalytics", back_populates="workspace", cascade="all, delete-orphan")
    integrations = relationship("WorkspaceIntegration", back_populates="workspace", cascade="all, delete-orphan")
    audits = relationship("WorkspaceAudit", back_populates="workspace", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<GlobalWorkspace(id={self.id}, name='{self.name}', type='{self.workspace_type}')>"


class WorkspaceTemplate(Base):
    """
    📋 Workspace Template Model
    
    Intelligent workspace templates with best practices,
    governance policies, and AI-powered recommendations.
    """
    __tablename__ = "workspace_templates"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    display_name = Column(String(300))
    description = Column(Text)
    
    # Template configuration
    workspace_id = Column(Integer, ForeignKey("global_workspaces.id"), nullable=False)
    template_type = Column(Enum(WorkspaceType), nullable=False)
    category = Column(String(100))
    industry = Column(String(100))
    use_case = Column(String(200))
    
    # Template content
    configuration = Column(JSON, nullable=False)
    default_resources = Column(JSON, default=lambda: {})
    default_policies = Column(JSON, default=lambda: {})
    default_integrations = Column(JSON, default=lambda: {})
    default_settings = Column(JSON, default=lambda: {})
    
    # Template metadata
    version = Column(String(20), default="1.0.0")
    is_public = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    popularity_score = Column(Float, default=0.0)
    usage_count = Column(Integer, default=0)
    
    # Requirements and recommendations
    min_resources = Column(JSON, default=lambda: {})
    recommended_resources = Column(JSON, default=lambda: {})
    prerequisites = Column(JSON, default=lambda: [])
    recommendations = Column(JSON, default=lambda: [])
    
    # AI and automation
    ai_optimizations = Column(JSON, default=lambda: {})
    auto_scaling_config = Column(JSON, default=lambda: {})
    monitoring_config = Column(JSON, default=lambda: {})
    alert_config = Column(JSON, default=lambda: {})
    
    # Access control
    creator_id = Column(Integer, nullable=False)
    owner_id = Column(Integer, nullable=False)
    visibility = Column(String(20), default="private")
    access_control = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    tags = Column(JSON, default=lambda: [])
    metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("GlobalWorkspace", back_populates="template")

    def __repr__(self):
        return f"<WorkspaceTemplate(id={self.id}, name='{self.name}', type='{self.template_type}')>"


class WorkspaceMember(Base):
    """
    👥 Workspace Member Model
    
    Advanced workspace membership with role-based access control,
    collaboration features, and activity tracking.
    """
    __tablename__ = "workspace_members"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("global_workspaces.id"), nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    
    # Member role and permissions
    role = Column(Enum(MemberRole), nullable=False, default=MemberRole.MEMBER)
    permissions = Column(JSON, default=lambda: [])
    custom_permissions = Column(JSON, default=lambda: {})
    inherited_permissions = Column(JSON, default=lambda: [])
    
    # Member status and activity
    status = Column(String(20), default="active")
    is_active = Column(Boolean, default=True)
    is_online = Column(Boolean, default=False)
    last_activity = Column(DateTime(timezone=True))
    total_sessions = Column(Integer, default=0)
    total_time_spent = Column(Integer, default=0)  # in minutes
    
    # Collaboration settings
    collaboration_preferences = Column(JSON, default=lambda: {})
    notification_settings = Column(JSON, default=lambda: {})
    timezone = Column(String(50))
    language = Column(String(10), default="en")
    
    # Performance and contribution metrics
    contribution_score = Column(Float, default=0.0)
    activity_score = Column(Float, default=0.0)
    collaboration_score = Column(Float, default=0.0)
    expertise_areas = Column(JSON, default=lambda: [])
    achievements = Column(JSON, default=lambda: [])
    
    # Access control and security
    ip_restrictions = Column(JSON, default=lambda: [])
    time_restrictions = Column(JSON, default=lambda: {})
    mfa_required = Column(Boolean, default=False)
    session_timeout = Column(Integer, default=480)  # in minutes
    
    # Invitation and onboarding
    invited_by = Column(Integer)
    invited_at = Column(DateTime(timezone=True))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    onboarding_completed = Column(Boolean, default=False)
    onboarding_progress = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("GlobalWorkspace", back_populates="members")

    def __repr__(self):
        return f"<WorkspaceMember(id={self.id}, user_id={self.user_id}, role='{self.role}')>"


class WorkspaceResource(Base):
    """
    💾 Workspace Resource Model
    
    Intelligent resource allocation and management with
    auto-scaling, optimization, and cost tracking.
    """
    __tablename__ = "workspace_resources"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String(50), unique=True, nullable=False, index=True)
    workspace_id = Column(Integer, ForeignKey("global_workspaces.id"), nullable=False, index=True)
    
    # Resource definition
    name = Column(String(200), nullable=False)
    resource_type = Column(Enum(ResourceType), nullable=False)
    provider = Column(String(100))
    region = Column(String(50))
    availability_zone = Column(String(50))
    
    # Resource configuration
    configuration = Column(JSON, nullable=False)
    capacity = Column(JSON, default=lambda: {})
    limits = Column(JSON, default=lambda: {})
    reservations = Column(JSON, default=lambda: {})
    
    # Resource status and health
    status = Column(String(20), default="provisioning")
    health_status = Column(String(20), default="unknown")
    availability = Column(Float, default=100.0)
    performance_score = Column(Float, default=0.0)
    
    # Usage and utilization
    current_usage = Column(JSON, default=lambda: {})
    peak_usage = Column(JSON, default=lambda: {})
    average_usage = Column(JSON, default=lambda: {})
    utilization_percentage = Column(Float, default=0.0)
    
    # Auto-scaling and optimization
    auto_scaling_enabled = Column(Boolean, default=True)
    auto_scaling_config = Column(JSON, default=lambda: {})
    optimization_enabled = Column(Boolean, default=True)
    optimization_config = Column(JSON, default=lambda: {})
    
    # Cost tracking and billing
    cost_center = Column(String(100))
    hourly_cost = Column(Float, default=0.0)
    monthly_budget = Column(Float)
    cost_alerts = Column(JSON, default=lambda: [])
    billing_tags = Column(JSON, default=lambda: {})
    
    # Monitoring and alerting
    monitoring_enabled = Column(Boolean, default=True)
    monitoring_config = Column(JSON, default=lambda: {})
    alert_thresholds = Column(JSON, default=lambda: {})
    notification_channels = Column(JSON, default=lambda: [])
    
    # Security and compliance
    encryption_enabled = Column(Boolean, default=True)
    encryption_config = Column(JSON, default=lambda: {})
    compliance_tags = Column(JSON, default=lambda: [])
    security_groups = Column(JSON, default=lambda: [])
    
    # Lifecycle management
    provisioned_at = Column(DateTime(timezone=True))
    last_scaled_at = Column(DateTime(timezone=True))
    last_optimized_at = Column(DateTime(timezone=True))
    scheduled_maintenance = Column(DateTime(timezone=True))
    
    # Metadata and tracking
    tags = Column(JSON, default=lambda: [])
    metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("GlobalWorkspace", back_populates="resources")

    def __repr__(self):
        return f"<WorkspaceResource(id={self.id}, name='{self.name}', type='{self.resource_type}')>"


class WorkspacePolicy(Base):
    """
    📋 Workspace Policy Model
    
    Advanced governance policies with automated enforcement,
    compliance tracking, and intelligent policy recommendations.
    """
    __tablename__ = "workspace_policies"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(String(50), unique=True, nullable=False, index=True)
    workspace_id = Column(Integer, ForeignKey("global_workspaces.id"), nullable=False, index=True)
    
    # Policy definition
    name = Column(String(200), nullable=False)
    policy_type = Column(Enum(PolicyType), nullable=False)
    category = Column(String(100))
    priority = Column(Integer, default=5)
    severity = Column(String(20), default="medium")
    
    # Policy content
    description = Column(Text)
    policy_document = Column(JSON, nullable=False)
    rules = Column(JSON, default=lambda: [])
    conditions = Column(JSON, default=lambda: [])
    actions = Column(JSON, default=lambda: [])
    
    # Policy status and enforcement
    status = Column(String(20), default="active")
    enforcement_mode = Column(String(20), default="enforce")  # enforce, warn, audit
    is_enabled = Column(Boolean, default=True)
    is_inherited = Column(Boolean, default=False)
    parent_policy_id = Column(String(50))
    
    # Compliance and regulatory
    compliance_frameworks = Column(JSON, default=lambda: [])
    regulatory_requirements = Column(JSON, default=lambda: [])
    audit_requirements = Column(JSON, default=lambda: [])
    retention_period = Column(Integer)  # in days
    
    # Enforcement tracking
    violations_count = Column(Integer, default=0)
    warnings_count = Column(Integer, default=0)
    last_violation = Column(DateTime(timezone=True))
    last_enforcement = Column(DateTime(timezone=True))
    enforcement_history = Column(JSON, default=lambda: [])
    
    # AI and automation
    ai_recommendations = Column(JSON, default=lambda: [])
    auto_remediation = Column(Boolean, default=False)
    auto_update = Column(Boolean, default=False)
    learning_enabled = Column(Boolean, default=True)
    
    # Notification and alerting
    notification_config = Column(JSON, default=lambda: {})
    escalation_config = Column(JSON, default=lambda: {})
    alert_channels = Column(JSON, default=lambda: [])
    
    # Version control
    version = Column(String(20), default="1.0.0")
    change_log = Column(JSON, default=lambda: [])
    approval_required = Column(Boolean, default=False)
    approved_by = Column(Integer)
    approved_at = Column(DateTime(timezone=True))
    
    # Metadata and tracking
    created_by = Column(Integer, nullable=False)
    tags = Column(JSON, default=lambda: [])
    metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("GlobalWorkspace", back_populates="policies")

    def __repr__(self):
        return f"<WorkspacePolicy(id={self.id}, name='{self.name}', type='{self.policy_type}')>"


class WorkspaceAnalytics(Base):
    """
    📊 Workspace Analytics Model
    
    Comprehensive workspace analytics with AI-powered insights,
    performance metrics, and predictive analytics.
    """
    __tablename__ = "workspace_analytics"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    analytics_id = Column(String(50), unique=True, nullable=False, index=True)
    workspace_id = Column(Integer, ForeignKey("global_workspaces.id"), nullable=False, index=True)
    
    # Analytics period
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    period_type = Column(String(20), default="daily")  # hourly, daily, weekly, monthly
    period_start = Column(DateTime(timezone=True))
    period_end = Column(DateTime(timezone=True))
    
    # Usage metrics
    active_users = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0)
    total_session_duration = Column(Integer, default=0)  # in minutes
    average_session_duration = Column(Float, default=0.0)
    page_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    
    # Resource utilization
    compute_usage = Column(JSON, default=lambda: {})
    storage_usage = Column(JSON, default=lambda: {})
    memory_usage = Column(JSON, default=lambda: {})
    network_usage = Column(JSON, default=lambda: {})
    database_usage = Column(JSON, default=lambda: {})
    
    # Performance metrics
    response_time_avg = Column(Float, default=0.0)
    response_time_p95 = Column(Float, default=0.0)
    response_time_p99 = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    availability = Column(Float, default=100.0)
    throughput = Column(Float, default=0.0)
    
    # Cost metrics
    total_cost = Column(Float, default=0.0)
    compute_cost = Column(Float, default=0.0)
    storage_cost = Column(Float, default=0.0)
    network_cost = Column(Float, default=0.0)
    cost_per_user = Column(Float, default=0.0)
    budget_utilization = Column(Float, default=0.0)
    
    # Collaboration metrics
    collaboration_events = Column(Integer, default=0)
    shared_resources = Column(Integer, default=0)
    cross_workspace_interactions = Column(Integer, default=0)
    knowledge_sharing_events = Column(Integer, default=0)
    expert_consultations = Column(Integer, default=0)
    
    # Security and compliance metrics
    security_incidents = Column(Integer, default=0)
    policy_violations = Column(Integer, default=0)
    access_violations = Column(Integer, default=0)
    compliance_score = Column(Float, default=100.0)
    audit_events = Column(Integer, default=0)
    
    # AI and automation metrics
    ai_recommendations_generated = Column(Integer, default=0)
    ai_recommendations_accepted = Column(Integer, default=0)
    automation_actions = Column(Integer, default=0)
    optimization_events = Column(Integer, default=0)
    ml_model_predictions = Column(Integer, default=0)
    
    # Quality metrics
    data_quality_score = Column(Float, default=0.0)
    workflow_success_rate = Column(Float, default=0.0)
    job_completion_rate = Column(Float, default=0.0)
    error_resolution_time = Column(Float, default=0.0)
    user_satisfaction_score = Column(Float, default=0.0)
    
    # Trends and predictions
    growth_rate = Column(Float, default=0.0)
    trend_direction = Column(String(20))  # up, down, stable
    predicted_usage = Column(JSON, default=lambda: {})
    capacity_forecast = Column(JSON, default=lambda: {})
    cost_forecast = Column(JSON, default=lambda: {})
    
    # Detailed analytics
    user_activity = Column(JSON, default=lambda: {})
    feature_usage = Column(JSON, default=lambda: {})
    workflow_analytics = Column(JSON, default=lambda: {})
    integration_analytics = Column(JSON, default=lambda: {})
    custom_metrics = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    calculation_duration = Column(Float, default=0.0)  # in seconds
    data_completeness = Column(Float, default=100.0)
    metadata = Column(JSON, default=lambda: {})
    
    # Relationships
    workspace = relationship("GlobalWorkspace", back_populates="analytics")

    def __repr__(self):
        return f"<WorkspaceAnalytics(id={self.id}, workspace_id={self.workspace_id}, date='{self.date}')>"


class WorkspaceIntegration(Base):
    """
    🔗 Workspace Integration Model
    
    Advanced external system integrations with intelligent
    connectivity, monitoring, and automated management.
    """
    __tablename__ = "workspace_integrations"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(String(50), unique=True, nullable=False, index=True)
    workspace_id = Column(Integer, ForeignKey("global_workspaces.id"), nullable=False, index=True)
    
    # Integration definition
    name = Column(String(200), nullable=False)
    integration_type = Column(Enum(IntegrationType), nullable=False)
    provider = Column(String(100), nullable=False)
    service_name = Column(String(200))
    version = Column(String(20))
    
    # Connection configuration
    endpoint_url = Column(String(500))
    connection_config = Column(JSON, default=lambda: {})
    authentication_config = Column(JSON, default=lambda: {})
    security_config = Column(JSON, default=lambda: {})
    
    # Integration status and health
    status = Column(String(20), default="inactive")
    health_status = Column(String(20), default="unknown")
    last_sync = Column(DateTime(timezone=True))
    sync_frequency = Column(Integer, default=3600)  # in seconds
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Data mapping and transformation
    data_mapping = Column(JSON, default=lambda: {})
    transformation_rules = Column(JSON, default=lambda: [])
    validation_rules = Column(JSON, default=lambda: [])
    error_handling = Column(JSON, default=lambda: {})
    
    # Performance and monitoring
    response_time_avg = Column(Float, default=0.0)
    success_rate = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    throughput = Column(Float, default=0.0)
    data_volume = Column(Integer, default=0)
    
    # Quota and rate limiting
    rate_limits = Column(JSON, default=lambda: {})
    quota_limits = Column(JSON, default=lambda: {})
    current_usage = Column(JSON, default=lambda: {})
    quota_alerts = Column(JSON, default=lambda: [])
    
    # Automation and intelligence
    auto_sync_enabled = Column(Boolean, default=True)
    intelligent_retry = Column(Boolean, default=True)
    predictive_scaling = Column(Boolean, default=False)
    anomaly_detection = Column(Boolean, default=True)
    auto_optimization = Column(Boolean, default=False)
    
    # Notification and alerting
    notification_config = Column(JSON, default=lambda: {})
    alert_thresholds = Column(JSON, default=lambda: {})
    escalation_rules = Column(JSON, default=lambda: [])
    
    # Compliance and security
    compliance_requirements = Column(JSON, default=lambda: [])
    security_policies = Column(JSON, default=lambda: [])
    audit_logging = Column(Boolean, default=True)
    data_encryption = Column(Boolean, default=True)
    
    # Metadata and tracking
    tags = Column(JSON, default=lambda: [])
    metadata = Column(JSON, default=lambda: {})
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workspace = relationship("GlobalWorkspace", back_populates="integrations")

    def __repr__(self):
        return f"<WorkspaceIntegration(id={self.id}, name='{self.name}', type='{self.integration_type}')>"


class WorkspaceAudit(Base):
    """
    🔍 Workspace Audit Model
    
    Comprehensive audit trails with intelligent analysis,
    compliance tracking, and automated reporting.
    """
    __tablename__ = "workspace_audits"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(String(50), unique=True, nullable=False, index=True)
    workspace_id = Column(Integer, ForeignKey("global_workspaces.id"), nullable=False, index=True)
    
    # Audit event details
    event_type = Column(String(100), nullable=False, index=True)
    event_category = Column(String(50), nullable=False)
    event_source = Column(String(100))
    event_severity = Column(String(20), default="info")
    
    # Actor information
    user_id = Column(Integer, index=True)
    username = Column(String(100))
    user_role = Column(String(50))
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    session_id = Column(String(100))
    
    # Resource and target information
    resource_type = Column(String(100))
    resource_id = Column(String(100))
    resource_name = Column(String(200))
    target_workspace_id = Column(Integer)
    affected_entities = Column(JSON, default=lambda: [])
    
    # Event details
    action = Column(String(100), nullable=False)
    description = Column(Text)
    details = Column(JSON, default=lambda: {})
    before_state = Column(JSON, default=lambda: {})
    after_state = Column(JSON, default=lambda: {})
    changes = Column(JSON, default=lambda: {})
    
    # Request and response information
    request_method = Column(String(10))
    request_url = Column(String(500))
    request_params = Column(JSON, default=lambda: {})
    response_status = Column(Integer)
    response_time = Column(Float)  # in milliseconds
    
    # Result and impact
    result = Column(String(20))  # success, failure, error
    error_code = Column(String(50))
    error_message = Column(Text)
    impact_level = Column(String(20), default="low")
    business_impact = Column(Text)
    
    # Compliance and regulatory
    compliance_tags = Column(JSON, default=lambda: [])
    regulatory_requirements = Column(JSON, default=lambda: [])
    retention_period = Column(Integer, default=2555)  # 7 years in days
    legal_hold = Column(Boolean, default=False)
    
    # Risk and security
    risk_level = Column(String(20), default="low")
    security_relevant = Column(Boolean, default=False)
    privacy_relevant = Column(Boolean, default=False)
    data_classification = Column(String(50))
    sensitive_data_involved = Column(Boolean, default=False)
    
    # Analytics and insights
    anomaly_score = Column(Float, default=0.0)
    pattern_tags = Column(JSON, default=lambda: [])
    correlation_id = Column(String(100))
    related_events = Column(JSON, default=lambda: [])
    ai_insights = Column(JSON, default=lambda: {})
    
    # Workflow and automation
    automated_action = Column(Boolean, default=False)
    workflow_id = Column(String(100))
    job_id = Column(String(100))
    pipeline_id = Column(String(100))
    execution_context = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    event_timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    ingested_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    enriched_at = Column(DateTime(timezone=True))
    
    # Additional context
    geolocation = Column(JSON, default=lambda: {})
    device_info = Column(JSON, default=lambda: {})
    environment = Column(String(50))
    application_version = Column(String(20))
    custom_fields = Column(JSON, default=lambda: {})
    
    # Relationships
    workspace = relationship("GlobalWorkspace", back_populates="audits")

    def __repr__(self):
        return f"<WorkspaceAudit(id={self.id}, event_type='{self.event_type}', timestamp='{self.event_timestamp}')>"


# Database indexes for optimal performance
def create_indexes():
    """Create additional database indexes for optimal query performance"""
    indexes = [
        # GlobalWorkspace indexes
        "CREATE INDEX IF NOT EXISTS idx_global_workspaces_owner_tenant ON global_workspaces(owner_id, tenant_id);",
        "CREATE INDEX IF NOT EXISTS idx_global_workspaces_type_status ON global_workspaces(workspace_type, status);",
        "CREATE INDEX IF NOT EXISTS idx_global_workspaces_created_updated ON global_workspaces(created_at, updated_at);",
        
        # WorkspaceMember indexes
        "CREATE INDEX IF NOT EXISTS idx_workspace_members_user_workspace ON workspace_members(user_id, workspace_id);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_members_role_status ON workspace_members(role, status);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_members_activity ON workspace_members(last_activity, is_active);",
        
        # WorkspaceResource indexes
        "CREATE INDEX IF NOT EXISTS idx_workspace_resources_type_status ON workspace_resources(resource_type, status);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_resources_workspace_type ON workspace_resources(workspace_id, resource_type);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_resources_cost_center ON workspace_resources(cost_center);",
        
        # WorkspacePolicy indexes
        "CREATE INDEX IF NOT EXISTS idx_workspace_policies_type_status ON workspace_policies(policy_type, status);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_policies_workspace_type ON workspace_policies(workspace_id, policy_type);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_policies_enforcement ON workspace_policies(enforcement_mode, is_enabled);",
        
        # WorkspaceAnalytics indexes
        "CREATE INDEX IF NOT EXISTS idx_workspace_analytics_date_period ON workspace_analytics(date, period_type);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_analytics_workspace_date ON workspace_analytics(workspace_id, date);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_analytics_calculated ON workspace_analytics(calculated_at);",
        
        # WorkspaceAudit indexes
        "CREATE INDEX IF NOT EXISTS idx_workspace_audits_event_timestamp ON workspace_audits(event_type, event_timestamp);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_audits_user_timestamp ON workspace_audits(user_id, event_timestamp);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_audits_workspace_event ON workspace_audits(workspace_id, event_type);",
        "CREATE INDEX IF NOT EXISTS idx_workspace_audits_severity_category ON workspace_audits(event_severity, event_category);",
    ]
    return indexes


# Utility functions for workspace management
def generate_workspace_id() -> str:
    """Generate a unique workspace ID"""
    return f"ws_{uuid.uuid4().hex[:12]}"


def generate_resource_id() -> str:
    """Generate a unique resource ID"""
    return f"res_{uuid.uuid4().hex[:10]}"


def generate_policy_id() -> str:
    """Generate a unique policy ID"""
    return f"pol_{uuid.uuid4().hex[:10]}"


def generate_analytics_id() -> str:
    """Generate a unique analytics ID"""
    return f"ana_{uuid.uuid4().hex[:10]}"


def generate_integration_id() -> str:
    """Generate a unique integration ID"""
    return f"int_{uuid.uuid4().hex[:10]}"


def generate_audit_id() -> str:
    """Generate a unique audit ID"""
    return f"aud_{uuid.uuid4().hex[:12]}"


def generate_template_id() -> str:
    """Generate a unique template ID"""
    return f"tpl_{uuid.uuid4().hex[:10]}"