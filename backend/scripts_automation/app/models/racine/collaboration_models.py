"""
🤝 RACINE MAIN MANAGER - COLLABORATION MODELS
=============================================

Advanced collaboration models for the racine main manager system.
Provides real-time collaboration, team coordination, and cross-group
communication that surpasses Databricks and Microsoft Purview.

Features:
- Real-time team collaboration with live cursors and editing
- Advanced role-based access control and inheritance
- Cross-group collaboration and coordination
- Intelligent communication and notification systems
- Knowledge sharing and expertise networks
- Collaborative workspace management
- Multi-user document editing and version control
- Expert consultation and mentorship systems
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

# Enums for collaboration management
class CollaborationType(PyEnum):
    """Collaboration type definitions"""
    DOCUMENT_EDITING = "document_editing"
    WORKSPACE_SHARING = "workspace_sharing"
    PROJECT_COLLABORATION = "project_collaboration"
    EXPERT_CONSULTATION = "expert_consultation"
    KNOWLEDGE_SHARING = "knowledge_sharing"
    PEER_REVIEW = "peer_review"
    MENTORSHIP = "mentorship"
    CROSS_GROUP = "cross_group"

class ParticipantRole(PyEnum):
    """Collaboration participant role definitions"""
    OWNER = "owner"
    EDITOR = "editor"
    REVIEWER = "reviewer"
    COMMENTER = "commenter"
    VIEWER = "viewer"
    MENTOR = "mentor"
    EXPERT = "expert"
    MODERATOR = "moderator"

class CollaborationStatus(PyEnum):
    """Collaboration status definitions"""
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ARCHIVED = "archived"
    SCHEDULED = "scheduled"

class CommunicationType(PyEnum):
    """Communication type definitions"""
    CHAT = "chat"
    VIDEO_CALL = "video_call"
    AUDIO_CALL = "audio_call"
    SCREEN_SHARING = "screen_sharing"
    ANNOTATION = "annotation"
    COMMENT = "comment"
    NOTIFICATION = "notification"
    ALERT = "alert"

class NotificationPriority(PyEnum):
    """Notification priority definitions"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"

class ExpertiseLevel(PyEnum):
    """Expertise level definitions"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    SPECIALIST = "specialist"

class ConflictResolutionStrategy(PyEnum):
    """Conflict resolution strategy definitions"""
    LAST_WRITER_WINS = "last_writer_wins"
    FIRST_WRITER_WINS = "first_writer_wins"
    MANUAL_RESOLUTION = "manual_resolution"
    INTELLIGENT_MERGE = "intelligent_merge"
    VOTE_BASED = "vote_based"

class AccessScope(PyEnum):
    """Access scope definitions"""
    PRIVATE = "private"
    TEAM = "team"
    DEPARTMENT = "department"
    ORGANIZATION = "organization"
    PUBLIC = "public"
    CROSS_GROUP = "cross_group"


class CollaborationSpace(Base):
    """
    🤝 Collaboration Space Model
    
    Advanced collaboration spaces with real-time features,
    multi-user coordination, and intelligent collaboration tools.
    """
    __tablename__ = "collaboration_spaces"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    space_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    display_name = Column(String(300))
    description = Column(Text)
    
    # Space configuration
    collaboration_type = Column(Enum(CollaborationType), nullable=False)
    status = Column(Enum(CollaborationStatus), default=CollaborationStatus.ACTIVE)
    access_scope = Column(Enum(AccessScope), default=AccessScope.TEAM)
    visibility = Column(String(20), default="internal")
    
    # Workspace and context
    workspace_id = Column(String(50), index=True)
    parent_space_id = Column(String(50))
    group_affiliations = Column(JSON, default=lambda: [])
    project_context = Column(JSON, default=lambda: {})
    
    # Collaboration features
    real_time_editing = Column(Boolean, default=True)
    live_cursors = Column(Boolean, default=True)
    version_control = Column(Boolean, default=True)
    conflict_resolution = Column(Enum(ConflictResolutionStrategy), default=ConflictResolutionStrategy.INTELLIGENT_MERGE)
    
    # Communication features
    chat_enabled = Column(Boolean, default=True)
    video_calls = Column(Boolean, default=True)
    screen_sharing = Column(Boolean, default=True)
    voice_notes = Column(Boolean, default=True)
    
    # Advanced features
    ai_assistance = Column(Boolean, default=True)
    smart_suggestions = Column(Boolean, default=True)
    auto_save = Column(Boolean, default=True)
    intelligent_notifications = Column(Boolean, default=True)
    
    # Content and resources
    shared_documents = Column(JSON, default=lambda: [])
    shared_resources = Column(JSON, default=lambda: [])
    knowledge_artifacts = Column(JSON, default=lambda: [])
    collaboration_history = Column(JSON, default=lambda: [])
    
    # Performance and analytics
    activity_score = Column(Float, default=0.0)
    collaboration_quality = Column(Float, default=0.0)
    productivity_metrics = Column(JSON, default=lambda: {})
    engagement_score = Column(Float, default=0.0)
    
    # Access control and permissions
    permission_model = Column(JSON, default=lambda: {})
    role_inheritance = Column(JSON, default=lambda: {})
    custom_permissions = Column(JSON, default=lambda: {})
    access_restrictions = Column(JSON, default=lambda: [])
    
    # Notification and alert settings
    notification_settings = Column(JSON, default=lambda: {})
    alert_preferences = Column(JSON, default=lambda: {})
    escalation_rules = Column(JSON, default=lambda: [])
    communication_channels = Column(JSON, default=lambda: [])
    
    # Integration and external services
    external_integrations = Column(JSON, default=lambda: [])
    api_connections = Column(JSON, default=lambda: {})
    webhook_endpoints = Column(JSON, default=lambda: [])
    sync_configurations = Column(JSON, default=lambda: {})
    
    # Lifecycle and scheduling
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    scheduled_sessions = Column(JSON, default=lambda: [])
    recurring_patterns = Column(JSON, default=lambda: {})
    
    # Quality and governance
    governance_policies = Column(JSON, default=lambda: [])
    quality_standards = Column(JSON, default=lambda: {})
    compliance_requirements = Column(JSON, default=lambda: [])
    audit_settings = Column(JSON, default=lambda: {})
    
    # Customization and branding
    theme_settings = Column(JSON, default=lambda: {})
    custom_layouts = Column(JSON, default=lambda: [])
    branding_config = Column(JSON, default=lambda: {})
    personalization = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    created_by = Column(Integer, nullable=False)
    last_modified_by = Column(Integer)
    owner_id = Column(Integer, nullable=False)
    tags = Column(JSON, default=lambda: [])
    metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    participants = relationship("CollaborationParticipant", back_populates="space", cascade="all, delete-orphan")
    sessions = relationship("CollaborationSession", back_populates="space", cascade="all, delete-orphan")
    communications = relationship("Communication", back_populates="space", cascade="all, delete-orphan")
    documents = relationship("CollaborativeDocument", back_populates="space", cascade="all, delete-orphan")
    expert_consultations = relationship("ExpertConsultation", back_populates="space", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CollaborationSpace(id={self.id}, name='{self.name}', type='{self.collaboration_type}')>"


class CollaborationParticipant(Base):
    """
    👥 Collaboration Participant Model
    
    Advanced participant management with role-based access,
    activity tracking, and intelligent collaboration insights.
    """
    __tablename__ = "collaboration_participants"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(String(50), unique=True, nullable=False, index=True)
    space_id = Column(Integer, ForeignKey("collaboration_spaces.id"), nullable=False, index=True)
    
    # Participant details
    user_id = Column(Integer, nullable=False, index=True)
    role = Column(Enum(ParticipantRole), nullable=False)
    expertise_level = Column(Enum(ExpertiseLevel), default=ExpertiseLevel.INTERMEDIATE)
    specializations = Column(JSON, default=lambda: [])
    
    # Participation status
    status = Column(String(20), default="active")
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True))
    availability_status = Column(String(20), default="available")
    
    # Permissions and access
    permissions = Column(JSON, default=lambda: [])
    inherited_permissions = Column(JSON, default=lambda: [])
    custom_permissions = Column(JSON, default=lambda: {})
    access_level = Column(String(20), default="standard")
    
    # Activity and engagement
    participation_score = Column(Float, default=0.0)
    contribution_score = Column(Float, default=0.0)
    collaboration_rating = Column(Float, default=0.0)
    activity_metrics = Column(JSON, default=lambda: {})
    
    # Communication preferences
    communication_preferences = Column(JSON, default=lambda: {})
    notification_preferences = Column(JSON, default=lambda: {})
    availability_schedule = Column(JSON, default=lambda: {})
    timezone = Column(String(50))
    
    # Collaboration history
    join_date = Column(DateTime(timezone=True), server_default=func.now())
    total_sessions = Column(Integer, default=0)
    total_time_spent = Column(Integer, default=0)  # minutes
    contributions = Column(JSON, default=lambda: [])
    
    # Performance tracking
    response_time_avg = Column(Float, default=0.0)
    task_completion_rate = Column(Float, default=0.0)
    quality_score = Column(Float, default=0.0)
    peer_ratings = Column(JSON, default=lambda: [])
    
    # Learning and development
    learning_objectives = Column(JSON, default=lambda: [])
    skill_development = Column(JSON, default=lambda: {})
    mentorship_relationships = Column(JSON, default=lambda: [])
    knowledge_gained = Column(JSON, default=lambda: [])
    
    # Recognition and achievements
    achievements = Column(JSON, default=lambda: [])
    badges = Column(JSON, default=lambda: [])
    recognition_points = Column(Integer, default=0)
    peer_nominations = Column(JSON, default=lambda: [])
    
    # Feedback and improvement
    feedback_given = Column(JSON, default=lambda: [])
    feedback_received = Column(JSON, default=lambda: [])
    improvement_suggestions = Column(JSON, default=lambda: [])
    development_plans = Column(JSON, default=lambda: [])
    
    # Privacy and security
    privacy_settings = Column(JSON, default=lambda: {})
    security_clearance = Column(String(20), default="standard")
    data_sharing_consent = Column(JSON, default=lambda: {})
    anonymization_preferences = Column(JSON, default=lambda: {})
    
    # Integration and tools
    preferred_tools = Column(JSON, default=lambda: [])
    integration_settings = Column(JSON, default=lambda: {})
    workspace_customizations = Column(JSON, default=lambda: {})
    ai_assistant_preferences = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    invitation_details = Column(JSON, default=lambda: {})
    onboarding_status = Column(String(20), default="pending")
    last_activity = Column(DateTime(timezone=True))
    metadata = Column(JSON, default=lambda: {})
    
    # Relationships
    space = relationship("CollaborationSpace", back_populates="participants")

    def __repr__(self):
        return f"<CollaborationParticipant(id={self.id}, user_id={self.user_id}, role='{self.role}')>"


class CollaborationSession(Base):
    """
    🎯 Collaboration Session Model
    
    Real-time collaboration sessions with detailed tracking,
    performance analytics, and intelligent insights.
    """
    __tablename__ = "collaboration_sessions"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), unique=True, nullable=False, index=True)
    space_id = Column(Integer, ForeignKey("collaboration_spaces.id"), nullable=False, index=True)
    
    # Session details
    title = Column(String(200))
    description = Column(Text)
    session_type = Column(String(50), default="collaborative_work")
    purpose = Column(String(200))
    
    # Session status and timing
    status = Column(String(20), default="active")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer, default=0)
    scheduled_duration = Column(Integer)  # minutes
    
    # Participants and attendance
    active_participants = Column(JSON, default=lambda: [])
    max_concurrent_users = Column(Integer, default=0)
    total_participants = Column(Integer, default=0)
    attendance_rate = Column(Float, default=0.0)
    
    # Session activities
    activities_log = Column(JSON, default=lambda: [])
    documents_edited = Column(JSON, default=lambda: [])
    decisions_made = Column(JSON, default=lambda: [])
    tasks_created = Column(JSON, default=lambda: [])
    
    # Communication and interaction
    messages_exchanged = Column(Integer, default=0)
    screen_shares = Column(Integer, default=0)
    video_calls = Column(Integer, default=0)
    annotations_made = Column(Integer, default=0)
    
    # Productivity and outcomes
    objectives_met = Column(JSON, default=lambda: [])
    deliverables_created = Column(JSON, default=lambda: [])
    knowledge_shared = Column(JSON, default=lambda: [])
    productivity_score = Column(Float, default=0.0)
    
    # Quality and satisfaction
    session_quality = Column(Float, default=0.0)
    participant_satisfaction = Column(Float, default=0.0)
    technical_quality = Column(Float, default=0.0)
    collaboration_effectiveness = Column(Float, default=0.0)
    
    # Technical metrics
    connection_quality = Column(JSON, default=lambda: {})
    performance_metrics = Column(JSON, default=lambda: {})
    error_incidents = Column(JSON, default=lambda: [])
    system_usage = Column(JSON, default=lambda: {})
    
    # AI and automation
    ai_assistance_used = Column(Boolean, default=False)
    ai_suggestions_accepted = Column(Integer, default=0)
    automated_actions = Column(JSON, default=lambda: [])
    intelligent_insights = Column(JSON, default=lambda: [])
    
    # Content and artifacts
    content_created = Column(JSON, default=lambda: [])
    files_shared = Column(JSON, default=lambda: [])
    resources_accessed = Column(JSON, default=lambda: [])
    knowledge_artifacts = Column(JSON, default=lambda: [])
    
    # Follow-up and continuation
    action_items = Column(JSON, default=lambda: [])
    follow_up_sessions = Column(JSON, default=lambda: [])
    pending_decisions = Column(JSON, default=lambda: [])
    next_steps = Column(JSON, default=lambda: [])
    
    # Recording and documentation
    session_recording = Column(JSON, default=lambda: {})
    meeting_notes = Column(Text)
    summary = Column(Text)
    transcription = Column(Text)
    
    # Privacy and compliance
    recording_consent = Column(JSON, default=lambda: {})
    data_retention_policy = Column(String(50), default="standard")
    compliance_flags = Column(JSON, default=lambda: [])
    anonymization_applied = Column(Boolean, default=False)
    
    # Analytics and insights
    collaboration_patterns = Column(JSON, default=lambda: {})
    communication_analysis = Column(JSON, default=lambda: {})
    participation_analysis = Column(JSON, default=lambda: {})
    outcome_analysis = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    session_context = Column(JSON, default=lambda: {})
    environment_info = Column(JSON, default=lambda: {})
    metadata = Column(JSON, default=lambda: {})
    
    # Relationships
    space = relationship("CollaborationSpace", back_populates="sessions")

    def __repr__(self):
        return f"<CollaborationSession(id={self.id}, session_type='{self.session_type}', duration={self.duration_minutes})>"


class Communication(Base):
    """
    💬 Communication Model
    
    Advanced communication tracking with multi-modal support,
    intelligent routing, and context-aware messaging.
    """
    __tablename__ = "communications"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    communication_id = Column(String(50), unique=True, nullable=False, index=True)
    space_id = Column(Integer, ForeignKey("collaboration_spaces.id"), nullable=True, index=True)
    
    # Communication details
    communication_type = Column(Enum(CommunicationType), nullable=False)
    title = Column(String(200))
    content = Column(Text)
    formatted_content = Column(JSON, default=lambda: {})
    
    # Participants
    sender_id = Column(Integer, nullable=False, index=True)
    recipients = Column(JSON, default=lambda: [])
    cc_recipients = Column(JSON, default=lambda: [])
    bcc_recipients = Column(JSON, default=lambda: [])
    
    # Context and threading
    thread_id = Column(String(50))
    parent_communication_id = Column(String(50))
    context_id = Column(String(50))
    conversation_context = Column(JSON, default=lambda: {})
    
    # Priority and urgency
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.NORMAL)
    urgency_level = Column(String(20), default="normal")
    deadline = Column(DateTime(timezone=True))
    follow_up_required = Column(Boolean, default=False)
    
    # Delivery and status
    status = Column(String(20), default="sent")
    delivery_status = Column(JSON, default=lambda: {})
    read_status = Column(JSON, default=lambda: {})
    response_status = Column(JSON, default=lambda: {})
    
    # Content features
    attachments = Column(JSON, default=lambda: [])
    mentions = Column(JSON, default=lambda: [])
    tags = Column(JSON, default=lambda: [])
    reactions = Column(JSON, default=lambda: {})
    
    # Multi-modal content
    voice_message = Column(JSON, default=lambda: {})
    video_content = Column(JSON, default=lambda: {})
    screen_recording = Column(JSON, default=lambda: {})
    interactive_elements = Column(JSON, default=lambda: [])
    
    # AI and intelligence
    ai_generated = Column(Boolean, default=False)
    sentiment_analysis = Column(JSON, default=lambda: {})
    intent_classification = Column(JSON, default=lambda: {})
    auto_translation = Column(JSON, default=lambda: {})
    
    # Response and interaction
    responses = Column(JSON, default=lambda: [])
    acknowledgments = Column(JSON, default=lambda: [])
    forwarded_to = Column(JSON, default=lambda: [])
    escalated_to = Column(JSON, default=lambda: [])
    
    # Analytics and tracking
    open_rate = Column(Float, default=0.0)
    response_rate = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    effectiveness_score = Column(Float, default=0.0)
    
    # Scheduling and timing
    scheduled_send = Column(DateTime(timezone=True))
    optimal_send_time = Column(DateTime(timezone=True))
    time_zone_considerations = Column(JSON, default=lambda: {})
    delivery_window = Column(JSON, default=lambda: {})
    
    # Security and privacy
    encryption_enabled = Column(Boolean, default=True)
    access_control = Column(JSON, default=lambda: {})
    privacy_level = Column(String(20), default="internal")
    retention_policy = Column(String(50), default="standard")
    
    # Workflow integration
    workflow_triggered = Column(Boolean, default=False)
    automated_actions = Column(JSON, default=lambda: [])
    integration_callbacks = Column(JSON, default=lambda: [])
    business_process_impact = Column(JSON, default=lambda: {})
    
    # Quality and compliance
    quality_score = Column(Float, default=0.0)
    compliance_check = Column(JSON, default=lambda: {})
    moderation_status = Column(String(20), default="approved")
    flag_reasons = Column(JSON, default=lambda: [])
    
    # Personalization and adaptation
    personalization_applied = Column(JSON, default=lambda: {})
    adaptive_content = Column(JSON, default=lambda: {})
    user_preferences = Column(JSON, default=lambda: {})
    context_adaptation = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    device_info = Column(JSON, default=lambda: {})
    location_info = Column(JSON, default=lambda: {})
    channel_info = Column(JSON, default=lambda: {})
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    metadata = Column(JSON, default=lambda: {})
    
    # Relationships
    space = relationship("CollaborationSpace", back_populates="communications")

    def __repr__(self):
        return f"<Communication(id={self.id}, type='{self.communication_type}', priority='{self.priority}')>"


class CollaborativeDocument(Base):
    """
    📄 Collaborative Document Model
    
    Advanced document collaboration with real-time editing,
    version control, and intelligent content management.
    """
    __tablename__ = "collaborative_documents"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(50), unique=True, nullable=False, index=True)
    space_id = Column(Integer, ForeignKey("collaboration_spaces.id"), nullable=False, index=True)
    
    # Document details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    document_type = Column(String(50), nullable=False)
    file_format = Column(String(20))
    content_type = Column(String(50))
    
    # Content and structure
    content = Column(Text)
    structured_content = Column(JSON, default=lambda: {})
    document_schema = Column(JSON, default=lambda: {})
    metadata_content = Column(JSON, default=lambda: {})
    
    # Version control
    current_version = Column(String(20), default="1.0.0")
    version_history = Column(JSON, default=lambda: [])
    change_log = Column(JSON, default=lambda: [])
    branching_info = Column(JSON, default=lambda: {})
    
    # Real-time collaboration
    active_editors = Column(JSON, default=lambda: [])
    live_cursors = Column(JSON, default=lambda: {})
    real_time_changes = Column(JSON, default=lambda: [])
    conflict_resolution = Column(JSON, default=lambda: [])
    
    # Access control and permissions
    access_permissions = Column(JSON, default=lambda: {})
    edit_permissions = Column(JSON, default=lambda: {})
    sharing_settings = Column(JSON, default=lambda: {})
    visibility_scope = Column(Enum(AccessScope), default=AccessScope.TEAM)
    
    # Document status and lifecycle
    status = Column(String(20), default="draft")
    approval_status = Column(String(20), default="pending")
    review_status = Column(String(20), default="not_reviewed")
    publication_status = Column(String(20), default="unpublished")
    
    # Collaboration features
    comments = Column(JSON, default=lambda: [])
    annotations = Column(JSON, default=lambda: [])
    suggestions = Column(JSON, default=lambda: [])
    reviews = Column(JSON, default=lambda: [])
    
    # AI and automation
    ai_assistance = Column(JSON, default=lambda: {})
    auto_formatting = Column(Boolean, default=True)
    smart_suggestions = Column(JSON, default=lambda: [])
    content_analysis = Column(JSON, default=lambda: {})
    
    # Quality and validation
    quality_score = Column(Float, default=0.0)
    readability_score = Column(Float, default=0.0)
    completeness_score = Column(Float, default=0.0)
    accuracy_score = Column(Float, default=0.0)
    
    # Usage and analytics
    view_count = Column(Integer, default=0)
    edit_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)
    collaboration_score = Column(Float, default=0.0)
    
    # Content organization
    sections = Column(JSON, default=lambda: [])
    chapters = Column(JSON, default=lambda: [])
    table_of_contents = Column(JSON, default=lambda: {})
    cross_references = Column(JSON, default=lambda: [])
    
    # Integration and linking
    linked_documents = Column(JSON, default=lambda: [])
    external_references = Column(JSON, default=lambda: [])
    embedded_content = Column(JSON, default=lambda: [])
    api_integrations = Column(JSON, default=lambda: [])
    
    # Security and compliance
    encryption_status = Column(Boolean, default=True)
    digital_signature = Column(JSON, default=lambda: {})
    compliance_tags = Column(JSON, default=lambda: [])
    audit_trail = Column(JSON, default=lambda: [])
    
    # Publication and distribution
    publication_settings = Column(JSON, default=lambda: {})
    distribution_channels = Column(JSON, default=lambda: [])
    export_formats = Column(JSON, default=lambda: [])
    synchronization_targets = Column(JSON, default=lambda: [])
    
    # Backup and recovery
    backup_status = Column(String(20), default="current")
    recovery_points = Column(JSON, default=lambda: [])
    auto_save_enabled = Column(Boolean, default=True)
    last_backup = Column(DateTime(timezone=True))
    
    # Performance tracking
    load_time = Column(Float, default=0.0)
    edit_performance = Column(JSON, default=lambda: {})
    sync_performance = Column(JSON, default=lambda: {})
    user_experience_score = Column(Float, default=0.0)
    
    # Metadata and tracking
    created_by = Column(Integer, nullable=False)
    last_modified_by = Column(Integer)
    owner_id = Column(Integer, nullable=False)
    contributors = Column(JSON, default=lambda: [])
    tags = Column(JSON, default=lambda: [])
    metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    space = relationship("CollaborationSpace", back_populates="documents")

    def __repr__(self):
        return f"<CollaborativeDocument(id={self.id}, title='{self.title}', type='{self.document_type}')>"


class ExpertConsultation(Base):
    """
    🎓 Expert Consultation Model
    
    Advanced expert consultation system with intelligent matching,
    knowledge transfer, and mentorship capabilities.
    """
    __tablename__ = "expert_consultations"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(String(50), unique=True, nullable=False, index=True)
    space_id = Column(Integer, ForeignKey("collaboration_spaces.id"), nullable=True, index=True)
    
    # Consultation details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    consultation_type = Column(String(50), default="expert_advice")
    urgency_level = Column(String(20), default="normal")
    
    # Participants
    requester_id = Column(Integer, nullable=False, index=True)
    expert_id = Column(Integer, index=True)
    additional_participants = Column(JSON, default=lambda: [])
    stakeholders = Column(JSON, default=lambda: [])
    
    # Expertise requirements
    required_expertise = Column(JSON, default=lambda: [])
    domain_knowledge = Column(JSON, default=lambda: [])
    skill_requirements = Column(JSON, default=lambda: [])
    experience_level = Column(Enum(ExpertiseLevel), default=ExpertiseLevel.EXPERT)
    
    # Consultation status and lifecycle
    status = Column(String(20), default="requested")
    matching_status = Column(String(20), default="pending")
    expert_acceptance = Column(String(20), default="pending")
    completion_status = Column(String(20), default="in_progress")
    
    # Scheduling and timing
    requested_date = Column(DateTime(timezone=True))
    scheduled_date = Column(DateTime(timezone=True))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer, default=0)
    
    # Problem definition
    problem_statement = Column(Text)
    context_information = Column(JSON, default=lambda: {})
    constraints = Column(JSON, default=lambda: [])
    success_criteria = Column(JSON, default=lambda: [])
    
    # Consultation process
    methodology = Column(String(100))
    consultation_format = Column(String(50), default="discussion")
    tools_used = Column(JSON, default=lambda: [])
    resources_provided = Column(JSON, default=lambda: [])
    
    # Knowledge transfer
    knowledge_shared = Column(JSON, default=lambda: [])
    recommendations = Column(JSON, default=lambda: [])
    best_practices = Column(JSON, default=lambda: [])
    lessons_learned = Column(JSON, default=lambda: [])
    
    # Outcomes and deliverables
    solutions_provided = Column(JSON, default=lambda: [])
    action_items = Column(JSON, default=lambda: [])
    follow_up_required = Column(Boolean, default=False)
    deliverables = Column(JSON, default=lambda: [])
    
    # Quality and satisfaction
    consultation_quality = Column(Float, default=0.0)
    requester_satisfaction = Column(Float, default=0.0)
    expert_satisfaction = Column(Float, default=0.0)
    knowledge_transfer_effectiveness = Column(Float, default=0.0)
    
    # Expert matching and selection
    matching_algorithm = Column(String(100))
    matching_score = Column(Float, default=0.0)
    alternative_experts = Column(JSON, default=lambda: [])
    selection_criteria = Column(JSON, default=lambda: {})
    
    # Communication and interaction
    communication_channels = Column(JSON, default=lambda: [])
    meeting_recordings = Column(JSON, default=lambda: {})
    chat_transcripts = Column(JSON, default=lambda: [])
    shared_documents = Column(JSON, default=lambda: [])
    
    # Payment and compensation
    compensation_model = Column(String(50), default="points")
    expert_points_awarded = Column(Integer, default=0)
    cost_estimate = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)
    
    # Feedback and improvement
    feedback_from_requester = Column(JSON, default=lambda: {})
    feedback_from_expert = Column(JSON, default=lambda: {})
    improvement_suggestions = Column(JSON, default=lambda: [])
    service_enhancement = Column(JSON, default=lambda: [])
    
    # Knowledge repository impact
    knowledge_base_updates = Column(JSON, default=lambda: [])
    reusable_content = Column(JSON, default=lambda: [])
    template_creation = Column(JSON, default=lambda: [])
    community_contribution = Column(JSON, default=lambda: {})
    
    # Analytics and insights
    consultation_patterns = Column(JSON, default=lambda: {})
    expertise_gaps = Column(JSON, default=lambda: [])
    demand_analysis = Column(JSON, default=lambda: {})
    impact_assessment = Column(JSON, default=lambda: {})
    
    # Privacy and confidentiality
    confidentiality_level = Column(String(20), default="standard")
    privacy_agreements = Column(JSON, default=lambda: {})
    data_sharing_restrictions = Column(JSON, default=lambda: [])
    anonymization_requirements = Column(JSON, default=lambda: {})
    
    # Integration and workflow
    workflow_integration = Column(JSON, default=lambda: {})
    automated_follow_up = Column(JSON, default=lambda: [])
    escalation_procedures = Column(JSON, default=lambda: [])
    business_impact = Column(JSON, default=lambda: {})
    
    # Metadata and tracking
    consultation_context = Column(JSON, default=lambda: {})
    external_references = Column(JSON, default=lambda: [])
    tags = Column(JSON, default=lambda: [])
    metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    space = relationship("CollaborationSpace", back_populates="expert_consultations")

    def __repr__(self):
        return f"<ExpertConsultation(id={self.id}, title='{self.title}', status='{self.status}')>"


class NotificationSystem(Base):
    """
    🔔 Notification System Model
    
    Intelligent notification system with smart routing,
    personalization, and multi-channel delivery.
    """
    __tablename__ = "notification_systems"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # Notification details
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)
    category = Column(String(100))
    
    # Target and context
    target_user_id = Column(Integer, nullable=False, index=True)
    source_user_id = Column(Integer, index=True)
    workspace_id = Column(String(50))
    context_id = Column(String(50))
    
    # Priority and urgency
    priority = Column(Enum(NotificationPriority), nullable=False)
    urgency_score = Column(Float, default=0.0)
    deadline = Column(DateTime(timezone=True))
    time_sensitivity = Column(String(20), default="normal")
    
    # Delivery configuration
    delivery_channels = Column(JSON, default=lambda: [])
    preferred_channel = Column(String(50))
    fallback_channels = Column(JSON, default=lambda: [])
    delivery_strategy = Column(String(50), default="intelligent")
    
    # Content and formatting
    rich_content = Column(JSON, default=lambda: {})
    interactive_elements = Column(JSON, default=lambda: [])
    attachments = Column(JSON, default=lambda: [])
    call_to_action = Column(JSON, default=lambda: {})
    
    # Personalization
    personalized_content = Column(JSON, default=lambda: {})
    user_preferences = Column(JSON, default=lambda: {})
    context_adaptation = Column(JSON, default=lambda: {})
    localization = Column(JSON, default=lambda: {})
    
    # Delivery status
    status = Column(String(20), default="pending")
    delivery_attempts = Column(Integer, default=0)
    delivered_at = Column(DateTime(timezone=True))
    read_at = Column(DateTime(timezone=True))
    acknowledged_at = Column(DateTime(timezone=True))
    
    # User interaction
    user_response = Column(JSON, default=lambda: {})
    action_taken = Column(JSON, default=lambda: {})
    feedback_provided = Column(JSON, default=lambda: {})
    dismissed_at = Column(DateTime(timezone=True))
    
    # Intelligence and automation
    ai_generated = Column(Boolean, default=False)
    smart_timing = Column(Boolean, default=True)
    auto_escalation = Column(Boolean, default=False)
    intelligent_routing = Column(Boolean, default=True)
    
    # Analytics and tracking
    delivery_success = Column(Boolean, default=False)
    engagement_score = Column(Float, default=0.0)
    effectiveness_score = Column(Float, default=0.0)
    response_time = Column(Float, default=0.0)
    
    # Workflow integration
    workflow_triggered = Column(Boolean, default=False)
    business_process = Column(String(100))
    integration_callbacks = Column(JSON, default=lambda: [])
    automated_actions = Column(JSON, default=lambda: [])
    
    # Scheduling and timing
    scheduled_delivery = Column(DateTime(timezone=True))
    optimal_send_time = Column(DateTime(timezone=True))
    timezone_adjustment = Column(JSON, default=lambda: {})
    delivery_window = Column(JSON, default=lambda: {})
    
    # Batching and aggregation
    batch_id = Column(String(50))
    aggregation_rules = Column(JSON, default=lambda: {})
    digest_inclusion = Column(Boolean, default=False)
    summary_eligible = Column(Boolean, default=True)
    
    # Privacy and compliance
    privacy_level = Column(String(20), default="internal")
    data_classification = Column(String(20), default="internal")
    retention_period = Column(Integer, default=90)  # days
    anonymization_applied = Column(Boolean, default=False)
    
    # Quality and reliability
    delivery_guarantee = Column(String(20), default="best_effort")
    retry_strategy = Column(JSON, default=lambda: {})
    error_handling = Column(JSON, default=lambda: {})
    quality_score = Column(Float, default=0.0)
    
    # Metadata and tracking
    source_system = Column(String(100))
    trigger_event = Column(String(100))
    business_context = Column(JSON, default=lambda: {})
    metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<NotificationSystem(id={self.id}, type='{self.notification_type}', priority='{self.priority}')>"


# Database indexes for optimal performance
def create_collaboration_indexes():
    """Create additional database indexes for optimal query performance"""
    indexes = [
        # CollaborationSpace indexes
        "CREATE INDEX IF NOT EXISTS idx_collaboration_spaces_type_status ON collaboration_spaces(collaboration_type, status);",
        "CREATE INDEX IF NOT EXISTS idx_collaboration_spaces_workspace ON collaboration_spaces(workspace_id, access_scope);",
        "CREATE INDEX IF NOT EXISTS idx_collaboration_spaces_owner ON collaboration_spaces(owner_id, created_at);",
        "CREATE INDEX IF NOT EXISTS idx_collaboration_spaces_activity ON collaboration_spaces(activity_score);",
        
        # CollaborationParticipant indexes
        "CREATE INDEX IF NOT EXISTS idx_collaboration_participants_space_user ON collaboration_participants(space_id, user_id);",
        "CREATE INDEX IF NOT EXISTS idx_collaboration_participants_role_status ON collaboration_participants(role, status);",
        "CREATE INDEX IF NOT EXISTS idx_collaboration_participants_online ON collaboration_participants(is_online, last_seen);",
        "CREATE INDEX IF NOT EXISTS idx_collaboration_participants_expertise ON collaboration_participants(expertise_level);",
        
        # CollaborationSession indexes
        "CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_space_status ON collaboration_sessions(space_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_started ON collaboration_sessions(started_at, status);",
        "CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_duration ON collaboration_sessions(duration_minutes);",
        "CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_quality ON collaboration_sessions(session_quality);",
        
        # Communication indexes
        "CREATE INDEX IF NOT EXISTS idx_communications_space_type ON communications(space_id, communication_type);",
        "CREATE INDEX IF NOT EXISTS idx_communications_sender ON communications(sender_id, sent_at);",
        "CREATE INDEX IF NOT EXISTS idx_communications_priority_status ON communications(priority, status);",
        "CREATE INDEX IF NOT EXISTS idx_communications_thread ON communications(thread_id, sent_at);",
        
        # CollaborativeDocument indexes
        "CREATE INDEX IF NOT EXISTS idx_collaborative_documents_space_type ON collaborative_documents(space_id, document_type);",
        "CREATE INDEX IF NOT EXISTS idx_collaborative_documents_status ON collaborative_documents(status, approval_status);",
        "CREATE INDEX IF NOT EXISTS idx_collaborative_documents_owner ON collaborative_documents(owner_id, created_at);",
        "CREATE INDEX IF NOT EXISTS idx_collaborative_documents_quality ON collaborative_documents(quality_score);",
        
        # ExpertConsultation indexes
        "CREATE INDEX IF NOT EXISTS idx_expert_consultations_requester ON expert_consultations(requester_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_expert_consultations_expert ON expert_consultations(expert_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_expert_consultations_expertise ON expert_consultations(experience_level);",
        "CREATE INDEX IF NOT EXISTS idx_expert_consultations_scheduled ON expert_consultations(scheduled_date, status);",
        
        # NotificationSystem indexes
        "CREATE INDEX IF NOT EXISTS idx_notification_systems_target_user ON notification_systems(target_user_id, status);",
        "CREATE INDEX IF NOT EXISTS idx_notification_systems_priority_created ON notification_systems(priority, created_at);",
        "CREATE INDEX IF NOT EXISTS idx_notification_systems_type_status ON notification_systems(notification_type, status);",
        "CREATE INDEX IF NOT EXISTS idx_notification_systems_delivery ON notification_systems(delivered_at, read_at);",
    ]
    return indexes


# Utility functions for collaboration management
def generate_space_id() -> str:
    """Generate a unique collaboration space ID"""
    return f"space_{uuid.uuid4().hex[:10]}"


def generate_participant_id() -> str:
    """Generate a unique participant ID"""
    return f"part_{uuid.uuid4().hex[:10]}"


def generate_session_id() -> str:
    """Generate a unique session ID"""
    return f"sess_{uuid.uuid4().hex[:12]}"


def generate_communication_id() -> str:
    """Generate a unique communication ID"""
    return f"comm_{uuid.uuid4().hex[:12]}"


def generate_document_id() -> str:
    """Generate a unique document ID"""
    return f"doc_{uuid.uuid4().hex[:10]}"


def generate_consultation_id() -> str:
    """Generate a unique consultation ID"""
    return f"consult_{uuid.uuid4().hex[:8]}"


def generate_notification_id() -> str:
    """Generate a unique notification ID"""
    return f"notif_{uuid.uuid4().hex[:12]}"