"""
Advanced Catalog Intelligence Models for Enterprise Data Governance
================================================================

This module contains sophisticated AI/ML models for intelligent catalog management,
semantic understanding, automated insights generation, and intelligent recommendations
that transform the data catalog into a self-improving, intelligent knowledge system.

Features:
- AI-powered semantic understanding and relationship detection
- Intelligent tagging and classification automation
- Smart recommendations and usage analytics
- Automated business glossary enrichment
- Contextual search and discovery optimization
- Integration with all data governance components for holistic intelligence
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

class IntelligenceType(str, Enum):
    """Types of catalog intelligence"""
    SEMANTIC_ANALYSIS = "semantic_analysis"       # NLP-based semantic understanding
    USAGE_ANALYTICS = "usage_analytics"           # Usage pattern analysis
    RELATIONSHIP_DISCOVERY = "relationship_discovery"  # Automated relationship detection
    QUALITY_INSIGHTS = "quality_insights"         # Data quality intelligence
    BUSINESS_CONTEXT = "business_context"         # Business context understanding
    RECOMMENDATION_ENGINE = "recommendation_engine"  # Intelligent recommendations
    ANOMALY_DETECTION = "anomaly_detection"       # Anomaly detection in catalog
    PATTERN_RECOGNITION = "pattern_recognition"   # Pattern recognition across assets

class SemanticConfidence(str, Enum):
    """Confidence levels for semantic analysis"""
    VERY_HIGH = "very_high"                       # 95-100% confidence
    HIGH = "high"                                 # 80-94% confidence
    MEDIUM = "medium"                            # 60-79% confidence
    LOW = "low"                                  # 40-59% confidence
    VERY_LOW = "very_low"                        # 0-39% confidence

class RecommendationType(str, Enum):
    """Types of intelligent recommendations"""
    DATA_DISCOVERY = "data_discovery"             # Discover relevant datasets
    SIMILAR_ASSETS = "similar_assets"             # Find similar assets
    USAGE_OPTIMIZATION = "usage_optimization"    # Optimize data usage
    QUALITY_IMPROVEMENT = "quality_improvement"  # Improve data quality
    BUSINESS_CONTEXT = "business_context"        # Add business context
    GOVERNANCE_COMPLIANCE = "governance_compliance"  # Ensure compliance
    LINEAGE_COMPLETION = "lineage_completion"    # Complete lineage gaps
    CLASSIFICATION_SUGGESTION = "classification_suggestion"  # Suggest classifications

class UsagePattern(str, Enum):
    """Usage pattern types"""
    FREQUENT_ACCESS = "frequent_access"           # Frequently accessed
    BATCH_PROCESSING = "batch_processing"        # Used in batch jobs
    REAL_TIME_STREAMING = "real_time_streaming"  # Used in streaming
    REPORTING = "reporting"                      # Used for reporting
    ANALYTICS = "analytics"                      # Used for analytics
    MACHINE_LEARNING = "machine_learning"       # Used in ML workflows
    DATA_EXPLORATION = "data_exploration"       # Used for exploration
    COMPLIANCE_REPORTING = "compliance_reporting"  # Used for compliance

class InsightCategory(str, Enum):
    """Categories of insights"""
    PERFORMANCE = "performance"                  # Performance insights
    USAGE = "usage"                             # Usage insights
    QUALITY = "quality"                         # Quality insights
    COMPLIANCE = "compliance"                   # Compliance insights
    BUSINESS_VALUE = "business_value"           # Business value insights
    OPERATIONAL = "operational"                 # Operational insights
    STRATEGIC = "strategic"                     # Strategic insights
    TECHNICAL = "technical"                     # Technical insights


# ===================== CORE INTELLIGENCE MODELS =====================

class CatalogSemanticProfile(SQLModel, table=True):
    """
    Semantic profile for catalog assets with AI-powered understanding,
    context extraction, and relationship mapping capabilities.
    """
    __tablename__ = "catalog_semantic_profiles"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    profile_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    asset_id: str = Field(index=True)  # Catalog asset ID
    asset_type: str = Field(index=True)  # table, view, file, api, dataset
    asset_name: str = Field(index=True)
    
    # Semantic Analysis
    semantic_description: Optional[str] = None      # AI-generated description
    business_context: Optional[str] = None          # Extracted business context
    domain_classification: Optional[str] = None     # Business domain (finance, hr, sales)
    functional_category: Optional[str] = None       # Functional category (transactional, reference)
    
    # Content Analysis
    content_summary: Optional[str] = None           # AI-generated content summary
    data_themes: str = Field(default="[]")          # JSON array of identified themes
    key_concepts: str = Field(default="[]")         # JSON array of key concepts
    entity_types: str = Field(default="[]")         # JSON array of entity types
    
    # Semantic Embeddings
    content_embedding: Optional[str] = None         # JSON vector embedding of content
    schema_embedding: Optional[str] = None          # JSON vector embedding of schema
    usage_embedding: Optional[str] = None           # JSON vector embedding of usage patterns
    combined_embedding: Optional[str] = None        # JSON combined semantic embedding
    
    # Language and NLP Analysis
    primary_language: str = "english"               # Detected primary language
    technical_terminology: str = Field(default="[]")  # JSON array of technical terms
    business_terminology: str = Field(default="[]")   # JSON array of business terms
    acronym_definitions: str = Field(default="{}")    # JSON acronym mappings
    
    # Similarity and Relationships
    similar_assets: str = Field(default="[]")       # JSON array of similar asset IDs
    related_concepts: str = Field(default="[]")     # JSON array of related concepts
    semantic_clusters: str = Field(default="[]")    # JSON array of cluster memberships
    contextual_relationships: str = Field(default="[]")  # JSON relationship data
    
    # Confidence and Quality
    analysis_confidence: SemanticConfidence
    confidence_score: float = Field(ge=0.0, le=1.0)
    analysis_completeness: float = Field(ge=0.0, le=1.0)
    quality_indicators: str = Field(default="{}")   # JSON quality metrics
    
    # Analysis Configuration
    analysis_methods_used: str = Field(default="[]")  # JSON array of methods
    model_versions: str = Field(default="{}")         # JSON model version info
    analysis_parameters: str = Field(default="{}")   # JSON analysis parameters
    
    # Business Intelligence
    business_criticality_score: Optional[float] = None  # Business importance score
    usage_popularity_score: Optional[float] = None      # Usage popularity score
    strategic_value_score: Optional[float] = None       # Strategic value score
    innovation_potential_score: Optional[float] = None  # Innovation potential
    
    # Temporal Analysis
    content_evolution: str = Field(default="[]")    # JSON time series of changes
    usage_trends: str = Field(default="[]")         # JSON usage trend data
    semantic_drift: Optional[float] = None          # Measure of semantic change
    
    # Integration Points
    classification_alignment: str = Field(default="{}")  # Alignment with classifications
    compliance_context: str = Field(default="{}")        # Compliance implications
    lineage_semantics: str = Field(default="{}")         # Semantic lineage insights
    quality_semantics: str = Field(default="{}")         # Quality-related semantics
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_analysis_date: datetime = Field(default_factory=datetime.utcnow)
    next_analysis_due: Optional[datetime] = None
    
    # Analysis Metadata
    analyzed_by: Optional[str] = None               # AI model or user
    analysis_version: str = Field(default="1.0.0")
    analysis_duration_seconds: Optional[float] = None
    
    # Custom Extensions
    custom_semantic_attributes: str = Field(default="{}")  # JSON custom attributes
    tags: str = Field(default="[]")                        # JSON array of tags
    notes: Optional[str] = None
    
    # Relationships
    usage_analytics: List["CatalogUsageAnalytics"] = Relationship(back_populates="semantic_profile")
    recommendations: List["CatalogRecommendation"] = Relationship(back_populates="semantic_profile")
    insights: List["CatalogIntelligenceInsight"] = Relationship(back_populates="semantic_profile")


class CatalogUsageAnalytics(SQLModel, table=True):
    """
    Comprehensive usage analytics with AI-powered pattern recognition,
    behavioral analysis, and predictive insights for catalog optimization.
    """
    __tablename__ = "catalog_usage_analytics"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    analytics_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    semantic_profile_id: int = Field(foreign_key="catalog_semantic_profiles.id", index=True)
    asset_id: str = Field(index=True)
    
    # Time Period
    analysis_period_start: datetime = Field(index=True)
    analysis_period_end: datetime = Field(index=True)
    analysis_granularity: str = "daily"             # hourly, daily, weekly, monthly
    
    # Basic Usage Metrics
    total_access_count: int = Field(default=0)
    unique_users_count: int = Field(default=0)
    unique_applications_count: int = Field(default=0)
    total_queries_executed: int = Field(default=0)
    total_data_volume_accessed_gb: float = Field(default=0.0)
    
    # Access Patterns
    access_pattern_type: UsagePattern
    peak_usage_hours: str = Field(default="[]")     # JSON array of peak hours
    usage_frequency_distribution: str = Field(default="{}")  # JSON frequency analysis
    seasonal_patterns: str = Field(default="{}")    # JSON seasonal analysis
    weekly_patterns: str = Field(default="{}")      # JSON weekly patterns
    
    # User Behavior Analysis
    top_users: str = Field(default="[]")            # JSON array of top users
    user_segments: str = Field(default="{}")        # JSON user segmentation
    usage_personas: str = Field(default="[]")       # JSON identified personas
    collaboration_patterns: str = Field(default="{}")  # JSON collaboration data
    
    # Application and System Usage
    top_applications: str = Field(default="[]")     # JSON array of top apps
    system_integration_patterns: str = Field(default="{}")  # JSON system usage
    api_usage_patterns: str = Field(default="{}")   # JSON API usage
    automation_vs_manual_ratio: Optional[float] = None
    
    # Query and Access Analysis
    query_complexity_distribution: str = Field(default="{}")  # JSON complexity analysis
    common_query_patterns: str = Field(default="[]")          # JSON common patterns
    data_access_paths: str = Field(default="[]")              # JSON access paths
    join_patterns: str = Field(default="[]")                  # JSON join analysis
    
    # Performance Analytics
    average_query_response_time_ms: Optional[float] = None
    performance_percentiles: str = Field(default="{}")        # JSON percentile data
    resource_utilization: str = Field(default="{}")           # JSON resource usage
    bottleneck_analysis: str = Field(default="[]")            # JSON bottlenecks
    
    # Business Value Metrics
    business_process_alignment: str = Field(default="[]")     # JSON business processes
    revenue_impact_score: Optional[float] = None              # Revenue impact
    operational_efficiency_score: Optional[float] = None      # Efficiency impact
    decision_support_value: Optional[float] = None            # Decision value
    
    # Predictive Analytics
    usage_trend_direction: str = "stable"           # increasing, decreasing, stable, volatile
    predicted_future_usage: str = Field(default="{}")  # JSON usage predictions
    growth_projections: str = Field(default="{}")      # JSON growth data
    capacity_planning_insights: str = Field(default="{}")  # JSON capacity insights
    
    # Quality and Reliability
    error_rate_percentage: Optional[float] = None
    data_quality_impact_on_usage: Optional[float] = None
    reliability_score: Optional[float] = None
    user_satisfaction_indicators: str = Field(default="{}")  # JSON satisfaction data
    
    # Comparative Analysis
    industry_benchmark_comparison: Optional[float] = None
    internal_benchmark_comparison: Optional[float] = None
    peer_asset_comparison: str = Field(default="{}")      # JSON peer comparisons
    historical_trend_analysis: str = Field(default="{}")  # JSON historical trends
    
    # Optimization Opportunities
    optimization_recommendations: str = Field(default="[]")  # JSON recommendations
    performance_improvement_potential: Optional[float] = None
    cost_optimization_opportunities: str = Field(default="[]")  # JSON cost savings
    usage_efficiency_score: Optional[float] = None
    
    # Advanced Analytics
    anomaly_detection_results: str = Field(default="[]")    # JSON anomalies
    clustering_analysis: str = Field(default="{}")          # JSON cluster analysis
    correlation_analysis: str = Field(default="{}")         # JSON correlations
    statistical_insights: str = Field(default="{}")         # JSON statistical data
    
    # Data Sources and Methods
    data_sources_analyzed: str = Field(default="[]")        # JSON data sources
    analysis_methods_used: str = Field(default="[]")        # JSON methods
    sample_size: Optional[int] = None
    confidence_level: float = Field(default=0.95, ge=0.0, le=1.0)
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    analysis_completed_at: Optional[datetime] = None
    next_analysis_scheduled: Optional[datetime] = None
    
    # Metadata
    analyzed_by: Optional[str] = None
    analysis_version: str = Field(default="1.0.0")
    custom_metrics: str = Field(default="{}")      # JSON custom metrics
    
    # Relationships
    semantic_profile: Optional[CatalogSemanticProfile] = Relationship(back_populates="usage_analytics")


class CatalogRecommendation(SQLModel, table=True):
    """
    AI-powered intelligent recommendations for catalog optimization,
    data discovery, and governance improvement with context-aware suggestions.
    """
    __tablename__ = "catalog_recommendations"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    recommendation_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    semantic_profile_id: int = Field(foreign_key="catalog_semantic_profiles.id", index=True)
    
    # Recommendation Details
    recommendation_type: RecommendationType
    title: str = Field(index=True)
    description: str
    detailed_explanation: str
    
    # Target and Context
    target_user_type: str = "all"                  # all, data_analyst, data_scientist, business_user
    target_asset_id: Optional[str] = Field(index=True)
    context_description: str
    trigger_event: Optional[str] = None            # What triggered this recommendation
    
    # Recommendation Content
    recommended_actions: str = Field(default="[]")          # JSON array of actions
    expected_benefits: str = Field(default="[]")            # JSON array of benefits
    implementation_steps: str = Field(default="[]")         # JSON step-by-step guide
    required_resources: str = Field(default="[]")           # JSON resource requirements
    
    # Confidence and Scoring
    confidence_score: float = Field(ge=0.0, le=1.0)
    relevance_score: float = Field(ge=0.0, le=1.0)
    impact_score: float = Field(ge=0.0, le=1.0)
    effort_score: float = Field(ge=0.0, le=1.0)           # Lower is easier
    priority_score: float = Field(ge=0.0, le=1.0)
    
    # Business Value
    estimated_business_value: Optional[float] = None        # Estimated value
    roi_projection: Optional[float] = None                  # Return on investment
    time_savings_hours: Optional[float] = None              # Projected time savings
    cost_impact: Optional[float] = None                     # Cost implications
    
    # Implementation Details
    implementation_complexity: str = "medium"              # simple, medium, complex
    estimated_implementation_time: Optional[str] = None    # Time estimate
    prerequisites: str = Field(default="[]")               # JSON prerequisites
    potential_risks: str = Field(default="[]")             # JSON risk factors
    
    # AI/ML Context
    generated_by_model: str                                 # AI model that generated this
    model_version: str = Field(default="1.0.0")
    training_data_context: str = Field(default="{}")       # JSON training context
    similar_recommendations: str = Field(default="[]")     # JSON similar recommendations
    
    # User Interaction
    status: str = "pending"                                 # pending, viewed, accepted, rejected, implemented
    user_feedback_score: Optional[int] = Field(default=None, ge=1, le=5)
    user_feedback_text: Optional[str] = None
    implementation_feedback: Optional[str] = None
    
    # Personalization
    personalization_factors: str = Field(default="{}")     # JSON personalization data
    user_profile_alignment: Optional[float] = None
    contextual_relevance: Optional[float] = None
    historical_preference_alignment: Optional[float] = None
    
    # A/B Testing and Optimization
    recommendation_variant: Optional[str] = None           # A/B test variant
    control_group_assignment: Optional[str] = None
    performance_metrics: str = Field(default="{}")         # JSON performance data
    conversion_tracking: str = Field(default="{}")         # JSON conversion data
    
    # Temporal Aspects
    recommendation_validity_period: Optional[int] = None   # Days valid
    time_sensitive: bool = Field(default=False)
    optimal_implementation_window: Optional[str] = None
    seasonal_relevance: Optional[str] = None
    
    # Integration Context
    related_assets: str = Field(default="[]")              # JSON related assets
    governance_impact: Optional[str] = None                # Governance implications
    compliance_considerations: str = Field(default="[]")   # JSON compliance factors
    security_implications: Optional[str] = None
    
    # Learning and Adaptation
    learning_source: str = Field(default="[]")             # JSON learning sources
    adaptation_triggers: str = Field(default="[]")         # JSON adaptation triggers
    feedback_incorporation: str = Field(default="{}")      # JSON feedback handling
    
    # Lifecycle
    generated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    expires_at: Optional[datetime] = None
    viewed_at: Optional[datetime] = None
    acted_upon_at: Optional[datetime] = None
    
    # Communication
    notification_sent: bool = Field(default=False)
    notification_channels: str = Field(default="[]")       # JSON notification channels
    presentation_format: str = "standard"                  # standard, detailed, summary
    
    # Metadata
    tags: str = Field(default="[]")                        # JSON array of tags
    custom_attributes: str = Field(default="{}")           # JSON custom attributes
    external_references: str = Field(default="[]")         # JSON external refs
    
    # Relationships
    semantic_profile: Optional[CatalogSemanticProfile] = Relationship(back_populates="recommendations")


class CatalogIntelligenceInsight(SQLModel, table=True):
    """
    AI-generated insights about catalog patterns, trends, and opportunities
    with actionable intelligence for data governance optimization.
    """
    __tablename__ = "catalog_intelligence_insights"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    insight_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    semantic_profile_id: Optional[int] = Field(foreign_key="catalog_semantic_profiles.id", index=True)
    
    # Insight Classification
    insight_category: InsightCategory
    insight_type: IntelligenceType
    severity_level: str = "medium"                         # low, medium, high, critical
    urgency_level: str = "normal"                          # low, normal, high, urgent
    
    # Insight Content
    title: str = Field(index=True)
    summary: str
    detailed_analysis: str
    implications: str                                       # What this means
    
    # Supporting Evidence
    supporting_data: str = Field(default="{}")             # JSON supporting evidence
    statistical_significance: Optional[float] = None
    confidence_level: float = Field(ge=0.0, le=1.0)
    data_quality_score: Optional[float] = None
    
    # Pattern and Trend Analysis
    patterns_identified: str = Field(default="[]")         # JSON patterns
    trends_detected: str = Field(default="[]")             # JSON trends
    anomalies_found: str = Field(default="[]")             # JSON anomalies
    correlations_discovered: str = Field(default="[]")     # JSON correlations
    
    # Business Impact Assessment
    business_impact_level: str = "medium"                  # low, medium, high, critical
    affected_business_processes: str = Field(default="[]") # JSON processes
    stakeholder_impact: str = Field(default="{}")          # JSON stakeholder impact
    financial_implications: Optional[str] = None
    
    # Recommendations and Actions
    recommended_actions: str = Field(default="[]")         # JSON recommended actions
    immediate_actions: str = Field(default="[]")           # JSON immediate actions
    long_term_initiatives: str = Field(default="[]")       # JSON long-term actions
    prevention_strategies: str = Field(default="[]")       # JSON prevention measures
    
    # Predictive Elements
    future_projections: str = Field(default="{}")          # JSON future projections
    risk_assessment: str = Field(default="{}")             # JSON risk analysis
    opportunity_assessment: str = Field(default="{}")      # JSON opportunities
    scenario_analysis: str = Field(default="[]")           # JSON scenarios
    
    # Context and Scope
    scope_description: str                                  # What this insight covers
    affected_assets: str = Field(default="[]")             # JSON affected assets
    geographic_scope: Optional[str] = None                 # Geographic relevance
    temporal_scope: Optional[str] = None                   # Time relevance
    
    # Generation Context
    generated_by_algorithm: str                            # Algorithm that generated this
    algorithm_version: str = Field(default="1.0.0")
    generation_parameters: str = Field(default="{}")       # JSON generation params
    computation_time_seconds: Optional[float] = None
    
    # Validation and Quality
    peer_review_status: str = "pending"                    # pending, reviewed, validated
    expert_validation: Optional[bool] = None
    automated_validation_score: Optional[float] = None
    validation_comments: Optional[str] = None
    
    # User Interaction
    view_count: int = Field(default=0)
    user_ratings: str = Field(default="[]")                # JSON user ratings
    user_comments: str = Field(default="[]")               # JSON user comments
    bookmark_count: int = Field(default=0)
    share_count: int = Field(default=0)
    
    # Integration and Distribution
    distribution_channels: str = Field(default="[]")       # JSON distribution channels
    target_audiences: str = Field(default="[]")            # JSON target audiences
    notification_settings: str = Field(default="{}")       # JSON notification config
    dashboard_placement: Optional[str] = None
    
    # Learning and Improvement
    feedback_collected: str = Field(default="[]")          # JSON feedback data
    accuracy_tracking: str = Field(default="{}")           # JSON accuracy metrics
    improvement_suggestions: str = Field(default="[]")     # JSON improvements
    model_refinement_data: str = Field(default="{}")       # JSON refinement data
    
    # Lifecycle Management
    generated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None
    
    # Status and Workflow
    status: str = "active"                                 # active, archived, deprecated, superseded
    workflow_stage: str = "generated"                      # generated, reviewed, approved, published
    approval_required: bool = Field(default=False)
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    
    # Related Insights
    related_insights: str = Field(default="[]")            # JSON related insight IDs
    supersedes_insights: str = Field(default="[]")         # JSON superseded insights
    insight_lineage: str = Field(default="[]")             # JSON insight evolution
    
    # Metadata and Tagging
    tags: str = Field(default="[]")                        # JSON array of tags
    keywords: str = Field(default="[]")                    # JSON array of keywords
    categories: str = Field(default="[]")                  # JSON array of categories
    custom_metadata: str = Field(default="{}")             # JSON custom metadata
    
    # Relationships
    semantic_profile: Optional[CatalogSemanticProfile] = Relationship(back_populates="insights")


class CatalogIntelligenceDashboard(SQLModel, table=True):
    """
    Intelligent dashboard configurations and analytics for catalog intelligence
    with personalized views and adaptive content based on user behavior.
    """
    __tablename__ = "catalog_intelligence_dashboards"
    
    # Core identification
    id: Optional[int] = Field(default=None, primary_key=True)
    dashboard_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    dashboard_name: str = Field(index=True)
    
    # Dashboard Configuration
    dashboard_type: str = "executive"                      # executive, operational, analytical, technical
    target_audience: str = Field(default="[]")             # JSON target audience types
    visibility_scope: str = "organization"                 # personal, team, department, organization
    
    # Layout and Visualization
    layout_configuration: str = Field(default="{}")        # JSON layout config
    widget_configurations: str = Field(default="[]")       # JSON widget configs
    color_scheme: str = "default"                          # Color scheme identifier
    responsive_design: bool = Field(default=True)
    
    # Content and Data
    data_sources: str = Field(default="[]")                # JSON data source configurations
    refresh_frequency: str = "hourly"                      # real-time, hourly, daily, weekly
    data_retention_days: int = Field(default=365)
    historical_data_included: bool = Field(default=True)
    
    # Intelligence Features
    ai_insights_enabled: bool = Field(default=True)
    automated_alerts_enabled: bool = Field(default=True)
    predictive_analytics_enabled: bool = Field(default=True)
    anomaly_detection_enabled: bool = Field(default=True)
    
    # Personalization
    personalization_level: str = "medium"                 # none, low, medium, high, full
    user_behavior_tracking: bool = Field(default=True)
    adaptive_content: bool = Field(default=True)
    learning_preferences: str = Field(default="{}")       # JSON learning preferences
    
    # Performance and Optimization
    cache_enabled: bool = Field(default=True)
    cache_duration_minutes: int = Field(default=60)
    lazy_loading_enabled: bool = Field(default=True)
    performance_optimization: str = Field(default="{}")   # JSON optimization settings
    
    # Access and Security
    access_permissions: str = Field(default="{}")         # JSON access control
    sharing_enabled: bool = Field(default=True)
    export_enabled: bool = Field(default=True)
    embedding_enabled: bool = Field(default=False)
    
    # Analytics and Metrics
    usage_analytics: str = Field(default="{}")            # JSON usage analytics
    user_engagement_metrics: str = Field(default="{}")    # JSON engagement data
    performance_metrics: str = Field(default="{}")        # JSON performance data
    effectiveness_score: Optional[float] = None
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    # Metadata
    description: Optional[str] = None
    tags: str = Field(default="[]")                       # JSON array of tags
    version: str = Field(default="1.0.0")
    custom_properties: str = Field(default="{}")          # JSON custom properties


# ===================== RESPONSE AND REQUEST MODELS =====================

class SemanticProfileResponse(BaseModel):
    """Response model for semantic profiles"""
    id: int
    profile_uuid: str
    asset_name: str
    semantic_description: Optional[str]
    business_context: Optional[str]
    domain_classification: Optional[str]
    analysis_confidence: SemanticConfidence
    confidence_score: float
    similar_assets: List[str]
    last_analysis_date: datetime


class UsageAnalyticsResponse(BaseModel):
    """Response model for usage analytics"""
    id: int
    analytics_uuid: str
    asset_id: str
    total_access_count: int
    unique_users_count: int
    access_pattern_type: UsagePattern
    usage_trend_direction: str
    business_value_score: Optional[float]
    analysis_period_start: datetime
    analysis_period_end: datetime


class RecommendationResponse(BaseModel):
    """Response model for recommendations"""
    id: int
    recommendation_uuid: str
    recommendation_type: RecommendationType
    title: str
    description: str
    confidence_score: float
    relevance_score: float
    impact_score: float
    status: str
    generated_at: datetime


class IntelligenceInsightResponse(BaseModel):
    """Response model for intelligence insights"""
    id: int
    insight_uuid: str
    insight_category: InsightCategory
    insight_type: IntelligenceType
    title: str
    summary: str
    severity_level: str
    business_impact_level: str
    confidence_level: float
    generated_at: datetime


# ===================== REQUEST MODELS =====================

class SemanticAnalysisRequest(BaseModel):
    """Request model for semantic analysis"""
    asset_id: str
    analysis_scope: str = "full"  # full, schema_only, content_sample
    include_similarity_analysis: bool = True
    include_business_context: bool = True
    confidence_threshold: float = 0.6


class UsageAnalyticsRequest(BaseModel):
    """Request model for usage analytics"""
    asset_id: str
    analysis_period_days: int = 30
    granularity: str = "daily"
    include_predictive_analysis: bool = True
    include_user_segmentation: bool = True


class RecommendationRequest(BaseModel):
    """Request model for generating recommendations"""
    asset_id: Optional[str] = None
    user_type: str = "all"
    recommendation_types: List[RecommendationType] = []
    personalization_enabled: bool = True
    max_recommendations: int = 10


class DashboardConfigRequest(BaseModel):
    """Request model for dashboard configuration"""
    dashboard_name: str
    dashboard_type: str = "operational"
    target_audience: List[str] = []
    widget_configurations: List[Dict[str, Any]] = []
    refresh_frequency: str = "hourly"
    personalization_level: str = "medium"


# ===================== MODEL EXPORTS =====================

__all__ = [
    # Enums
    "IntelligenceType", "SemanticConfidence", "RecommendationType", "UsagePattern",
    "InsightCategory",
    
    # Core Models
    "CatalogSemanticProfile", "CatalogUsageAnalytics", "CatalogRecommendation",
    "CatalogIntelligenceInsight", "CatalogIntelligenceDashboard",
    
    # Response Models
    "SemanticProfileResponse", "UsageAnalyticsResponse", "RecommendationResponse",
    "IntelligenceInsightResponse",
    
    # Request Models
    "SemanticAnalysisRequest", "UsageAnalyticsRequest", "RecommendationRequest",
    "DashboardConfigRequest",
]