"""
🧠 CATALOG INTELLIGENCE MODELS
Enterprise-grade AI/ML models for intelligent catalog operations, semantic search,
recommendations, and automated discovery systems.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, JSON, text
from pydantic import BaseModel, validator, Field as PydanticField
import json

# ====================================================================
# INTELLIGENCE ENUMS
# ====================================================================

class IntelligenceModelType(str, Enum):
    """Types of AI/ML models used in catalog intelligence"""
    SEMANTIC_SEARCH = "semantic_search"
    CONTENT_CLASSIFICATION = "content_classification"
    RELATIONSHIP_DISCOVERY = "relationship_discovery"
    QUALITY_ASSESSMENT = "quality_assessment"
    USAGE_PREDICTION = "usage_prediction"
    ANOMALY_DETECTION = "anomaly_detection"
    RECOMMENDATION_ENGINE = "recommendation_engine"
    NLP_PROCESSING = "nlp_processing"
    PATTERN_RECOGNITION = "pattern_recognition"
    SIMILARITY_MATCHING = "similarity_matching"

class LearningApproach(str, Enum):
    """Machine learning approaches for catalog intelligence"""
    SUPERVISED = "supervised"
    UNSUPERVISED = "unsupervised"
    SEMI_SUPERVISED = "semi_supervised"
    REINFORCEMENT = "reinforcement"
    DEEP_LEARNING = "deep_learning"
    TRANSFER_LEARNING = "transfer_learning"
    ENSEMBLE = "ensemble"
    FEDERATED = "federated"
    ONLINE_LEARNING = "online_learning"
    ACTIVE_LEARNING = "active_learning"

class ModelStatus(str, Enum):
    """Status of intelligence models"""
    TRAINING = "training"
    TRAINED = "trained"
    VALIDATING = "validating"
    VALIDATED = "validated"
    DEPLOYED = "deployed"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    FAILED = "failed"
    RETRAINING = "retraining"
    ARCHIVED = "archived"

class SemanticSearchType(str, Enum):
    """Types of semantic search operations"""
    NATURAL_LANGUAGE = "natural_language"
    KEYWORD_EXPANSION = "keyword_expansion"
    CONCEPT_SEARCH = "concept_search"
    SIMILARITY_SEARCH = "similarity_search"
    CONTEXTUAL_SEARCH = "contextual_search"
    INTENT_BASED = "intent_based"
    FACETED_SEARCH = "faceted_search"
    FEDERATED_SEARCH = "federated_search"
    MULTI_MODAL = "multi_modal"
    VOICE_SEARCH = "voice_search"

class RecommendationType(str, Enum):
    """Types of catalog recommendations"""
    CONTENT_BASED = "content_based"
    COLLABORATIVE = "collaborative"
    HYBRID = "hybrid"
    KNOWLEDGE_BASED = "knowledge_based"
    POPULARITY_BASED = "popularity_based"
    CONTEXTUAL = "contextual"
    BEHAVIORAL = "behavioral"
    DEMOGRAPHIC = "demographic"
    SESSION_BASED = "session_based"
    REAL_TIME = "real_time"

class DiscoveryMethod(str, Enum):
    """Methods for intelligent data discovery"""
    SCHEMA_ANALYSIS = "schema_analysis"
    CONTENT_PROFILING = "content_profiling"
    PATTERN_MATCHING = "pattern_matching"
    STATISTICAL_ANALYSIS = "statistical_analysis"
    SEMANTIC_ANALYSIS = "semantic_analysis"
    RELATIONSHIP_MINING = "relationship_mining"
    GRAPH_ANALYSIS = "graph_analysis"
    CLUSTERING = "clustering"
    ANOMALY_DETECTION = "anomaly_detection"
    TEMPORAL_ANALYSIS = "temporal_analysis"

class IntelligenceLevel(str, Enum):
    """Levels of intelligence applied"""
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    AUTONOMOUS = "autonomous"

class ProcessingPriority(str, Enum):
    """Priority levels for intelligence processing"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"
    REAL_TIME = "real_time"

# ====================================================================
# CORE INTELLIGENCE MODELS
# ====================================================================

class CatalogIntelligenceModel(SQLModel, table=True):
    """Core AI/ML models for catalog intelligence operations"""
    __tablename__ = "catalog_intelligence_models"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    model_name: str = Field(max_length=200, index=True)
    model_type: IntelligenceModelType = Field(index=True)
    model_version: str = Field(max_length=50)
    
    # Model configuration
    learning_approach: LearningApproach
    status: ModelStatus = Field(default=ModelStatus.TRAINING, index=True)
    intelligence_level: IntelligenceLevel = Field(default=IntelligenceLevel.BASIC)
    processing_priority: ProcessingPriority = Field(default=ProcessingPriority.NORMAL)
    
    # Technical specifications
    model_architecture: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    hyperparameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    feature_configuration: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Training information
    training_data_sources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    training_start_time: Optional[datetime] = None
    training_end_time: Optional[datetime] = None
    training_duration_minutes: Optional[int] = None
    training_samples_count: Optional[int] = None
    validation_accuracy: Optional[float] = None
    
    # Deployment information
    deployment_environment: Optional[str] = Field(max_length=100)
    deployment_time: Optional[datetime] = None
    deployment_version: Optional[str] = Field(max_length=50)
    api_endpoint: Optional[str] = Field(max_length=500)
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance tracking
    inference_count: int = Field(default=0)
    average_response_time_ms: Optional[float] = None
    success_rate: Optional[float] = None
    error_rate: Optional[float] = None
    throughput_per_minute: Optional[float] = None
    
    # Business context
    business_use_cases: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    target_domains: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    supported_languages: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    model_limitations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata and governance
    model_owner: str = Field(max_length=100)
    model_description: Optional[str] = Field(max_length=2000)
    model_documentation_url: Optional[str] = Field(max_length=500)
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    data_privacy_level: Optional[str] = Field(max_length=50)
    
    # Lifecycle management
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_retrain_date: Optional[datetime] = None
    next_retrain_date: Optional[datetime] = None
    retention_period_days: Optional[int] = None
    
    # Relationships
    training_sessions: List["IntelligenceTrainingSession"] = Relationship(back_populates="model")
    search_operations: List["SemanticSearchOperation"] = Relationship(back_populates="model")
    recommendations: List["CatalogRecommendation"] = Relationship(back_populates="model")
    discovery_operations: List["IntelligentDiscoveryOperation"] = Relationship(back_populates="model")

class IntelligenceTrainingSession(SQLModel, table=True):
    """Training sessions for intelligence models"""
    __tablename__ = "intelligence_training_sessions"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_name: str = Field(max_length=200)
    model_id: UUID = Field(foreign_key="catalog_intelligence_models.id", index=True)
    
    # Session configuration
    training_type: str = Field(max_length=50)  # initial, retrain, fine_tune, transfer
    training_objective: str = Field(max_length=200)
    session_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Data information
    training_dataset_size: int
    validation_dataset_size: int
    test_dataset_size: Optional[int] = None
    data_quality_score: Optional[float] = None
    data_sources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    feature_count: Optional[int] = None
    
    # Training progress
    status: str = Field(max_length=50, default="initialized")
    current_epoch: Optional[int] = None
    total_epochs: Optional[int] = None
    progress_percentage: Optional[float] = None
    estimated_completion_time: Optional[datetime] = None
    
    # Performance metrics
    training_loss: Optional[float] = None
    validation_loss: Optional[float] = None
    training_accuracy: Optional[float] = None
    validation_accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    
    # Resource utilization
    gpu_hours_used: Optional[float] = None
    cpu_hours_used: Optional[float] = None
    memory_peak_gb: Optional[float] = None
    storage_used_gb: Optional[float] = None
    compute_cost: Optional[float] = None
    
    # Session lifecycle
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    created_by: str = Field(max_length=100)
    
    # Results and artifacts
    model_artifacts: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    training_logs: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    performance_charts: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    final_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationship
    model: CatalogIntelligenceModel = Relationship(back_populates="training_sessions")

# ====================================================================
# SEMANTIC SEARCH MODELS
# ====================================================================

class SemanticSearchOperation(SQLModel, table=True):
    """Semantic search operations and results"""
    __tablename__ = "semantic_search_operations"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    search_id: str = Field(max_length=100, index=True)
    model_id: UUID = Field(foreign_key="catalog_intelligence_models.id", index=True)
    
    # Search configuration
    search_type: SemanticSearchType
    search_query: str = Field(max_length=2000)
    processed_query: Optional[str] = Field(max_length=2000)
    search_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    search_filters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Search parameters
    max_results: int = Field(default=50)
    similarity_threshold: float = Field(default=0.7)
    search_scope: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    ranking_algorithm: str = Field(max_length=100, default="semantic_similarity")
    
    # Query processing
    query_understanding: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    entity_extraction: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    intent_classification: Optional[str] = Field(max_length=100)
    confidence_score: Optional[float] = None
    
    # Search execution
    execution_time_ms: Optional[int] = None
    results_count: Optional[int] = None
    search_results: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    result_rankings: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # User interaction
    user_id: Optional[str] = Field(max_length=100)
    user_session_id: Optional[str] = Field(max_length=100)
    user_feedback: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    clicked_results: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Performance metrics
    precision_at_k: Optional[float] = None
    recall_at_k: Optional[float] = None
    ndcg_score: Optional[float] = None
    user_satisfaction: Optional[float] = None
    
    # Search analytics
    search_timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_time_ms: Optional[int] = None
    cache_hit: bool = Field(default=False)
    error_message: Optional[str] = Field(max_length=1000)
    
    # Relationship
    model: CatalogIntelligenceModel = Relationship(back_populates="search_operations")

class SearchQueryUnderstanding(SQLModel, table=True):
    """Understanding and processing of search queries"""
    __tablename__ = "search_query_understanding"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    query: str = Field(max_length=2000, index=True)
    
    # Query analysis
    language: str = Field(max_length=10, default="en")
    query_type: str = Field(max_length=50)  # question, keyword, phrase, complex
    complexity_score: float = Field(default=0.0)
    ambiguity_score: float = Field(default=0.0)
    
    # Linguistic processing
    tokens: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    pos_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    named_entities: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    sentiment_score: Optional[float] = None
    
    # Semantic understanding
    concepts: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    topics: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    intent: Optional[str] = Field(max_length=100)
    entities: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Query expansion
    synonyms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    related_terms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    domain_specific_terms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    expanded_query: Optional[str] = Field(max_length=3000)
    
    # Context awareness
    user_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    domain_context: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    temporal_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Processing metadata
    processing_time_ms: Optional[int] = None
    confidence_score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ====================================================================
# RECOMMENDATION MODELS
# ====================================================================

class CatalogRecommendation(SQLModel, table=True):
    """AI-powered catalog recommendations"""
    __tablename__ = "catalog_recommendations"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    recommendation_id: str = Field(max_length=100, index=True)
    model_id: UUID = Field(foreign_key="catalog_intelligence_models.id", index=True)
    
    # Recommendation configuration
    recommendation_type: RecommendationType
    target_user_id: Optional[str] = Field(max_length=100)
    target_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Recommendation input
    input_assets: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    user_profile: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    session_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Recommendation output
    recommended_assets: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    recommendation_scores: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    recommendation_reasons: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    confidence_scores: List[float] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Algorithm details
    algorithm_used: str = Field(max_length=100)
    algorithm_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    feature_weights: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    similarity_matrix: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # User interaction tracking
    presented_at: datetime = Field(default_factory=datetime.utcnow)
    user_interactions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    clicked_recommendations: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    user_feedback: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance metrics
    click_through_rate: Optional[float] = None
    conversion_rate: Optional[float] = None
    user_satisfaction: Optional[float] = None
    relevance_score: Optional[float] = None
    
    # Business metrics
    business_value: Optional[float] = None
    revenue_impact: Optional[float] = None
    engagement_increase: Optional[float] = None
    
    # Lifecycle
    expires_at: Optional[datetime] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    model: CatalogIntelligenceModel = Relationship(back_populates="recommendations")

class RecommendationFeedback(SQLModel, table=True):
    """User feedback on recommendations"""
    __tablename__ = "recommendation_feedback"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    recommendation_id: str = Field(max_length=100, index=True)
    user_id: str = Field(max_length=100, index=True)
    
    # Feedback details
    feedback_type: str = Field(max_length=50)  # explicit, implicit, negative, positive
    feedback_value: float  # rating, score, or binary value
    feedback_text: Optional[str] = Field(max_length=1000)
    interaction_type: str = Field(max_length=50)  # click, view, download, bookmark
    
    # Context information
    feedback_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    session_id: Optional[str] = Field(max_length=100)
    
    # Temporal information
    feedback_timestamp: datetime = Field(default_factory=datetime.utcnow)
    interaction_duration: Optional[int] = None  # seconds

# ====================================================================
# INTELLIGENT DISCOVERY MODELS
# ====================================================================

class IntelligentDiscoveryOperation(SQLModel, table=True):
    """AI-powered data discovery operations"""
    __tablename__ = "intelligent_discovery_operations"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    operation_id: str = Field(max_length=100, index=True)
    model_id: UUID = Field(foreign_key="catalog_intelligence_models.id", index=True)
    
    # Discovery configuration
    discovery_method: DiscoveryMethod
    target_sources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    discovery_scope: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    intelligence_level: IntelligenceLevel
    
    # Operation parameters
    processing_priority: ProcessingPriority
    max_processing_time: Optional[int] = None  # minutes
    resource_limits: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    discovery_criteria: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Discovery results
    discovered_assets: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    discovered_relationships: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    discovered_patterns: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    confidence_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Analysis results
    statistical_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    semantic_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    pattern_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    anomaly_detection: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality assessment
    data_quality_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    completeness_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    consistency_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    accuracy_scores: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Operation lifecycle
    status: str = Field(max_length=50, default="initialized")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    
    # Resource utilization
    cpu_time_seconds: Optional[float] = None
    memory_used_mb: Optional[float] = None
    io_operations: Optional[int] = None
    network_traffic_mb: Optional[float] = None
    
    # Error handling
    error_count: int = Field(default=0)
    warnings: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    error_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationship
    model: CatalogIntelligenceModel = Relationship(back_populates="discovery_operations")

class DiscoveryPattern(SQLModel, table=True):
    """Patterns discovered through intelligent analysis"""
    __tablename__ = "discovery_patterns"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    pattern_name: str = Field(max_length=200, index=True)
    pattern_type: str = Field(max_length=100)
    
    # Pattern definition
    pattern_description: str = Field(max_length=2000)
    pattern_signature: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    pattern_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    pattern_examples: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Pattern characteristics
    complexity_level: str = Field(max_length=50)
    confidence_score: float
    frequency_score: float
    business_relevance: Optional[float] = None
    
    # Discovery context
    discovered_by: str = Field(max_length=100)
    discovery_method: DiscoveryMethod
    discovery_date: datetime = Field(default_factory=datetime.utcnow)
    discovery_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Pattern applications
    applicable_domains: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    use_cases: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    pattern_instances: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Validation and performance
    validation_status: str = Field(max_length=50, default="pending")
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Lifecycle management
    is_active: bool = Field(default=True)
    last_validated: Optional[datetime] = None
    usage_count: int = Field(default=0)

# ====================================================================
# INTELLIGENCE ANALYTICS MODELS
# ====================================================================

class IntelligenceAnalytics(SQLModel, table=True):
    """Analytics for catalog intelligence operations"""
    __tablename__ = "intelligence_analytics"
    
    # Primary identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    analytics_id: str = Field(max_length=100, index=True)
    
    # Time dimensions
    analytics_date: datetime = Field(index=True)
    time_period: str = Field(max_length=50)  # hour, day, week, month
    
    # Model performance metrics
    model_usage_count: int = Field(default=0)
    average_response_time: Optional[float] = None
    success_rate: Optional[float] = None
    error_rate: Optional[float] = None
    throughput: Optional[float] = None
    
    # Search analytics
    search_query_count: int = Field(default=0)
    unique_queries: int = Field(default=0)
    average_search_time: Optional[float] = None
    search_success_rate: Optional[float] = None
    popular_queries: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Recommendation analytics
    recommendations_generated: int = Field(default=0)
    recommendation_clicks: int = Field(default=0)
    click_through_rate: Optional[float] = None
    user_satisfaction: Optional[float] = None
    
    # Discovery analytics
    discovery_operations: int = Field(default=0)
    assets_discovered: int = Field(default=0)
    patterns_found: int = Field(default=0)
    discovery_accuracy: Optional[float] = None
    
    # User engagement
    active_users: int = Field(default=0)
    new_users: int = Field(default=0)
    session_duration: Optional[float] = None
    user_retention_rate: Optional[float] = None
    
    # Business impact
    business_value_generated: Optional[float] = None
    productivity_improvement: Optional[float] = None
    cost_savings: Optional[float] = None
    decision_speed_improvement: Optional[float] = None
    
    # Resource utilization
    compute_resources_used: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    storage_used_gb: Optional[float] = None
    network_bandwidth_mb: Optional[float] = None
    
    # Quality metrics
    data_quality_improvement: Optional[float] = None
    accuracy_improvement: Optional[float] = None
    completeness_improvement: Optional[float] = None

# ====================================================================
# REQUEST/RESPONSE MODELS
# ====================================================================

class CreateIntelligenceModelRequest(BaseModel):
    """Request model for creating intelligence models"""
    model_name: str = PydanticField(max_length=200)
    model_type: IntelligenceModelType
    learning_approach: LearningApproach
    intelligence_level: IntelligenceLevel = IntelligenceLevel.BASIC
    model_architecture: Dict[str, Any] = {}
    hyperparameters: Dict[str, Any] = {}
    business_use_cases: List[str] = []
    model_owner: str = PydanticField(max_length=100)
    model_description: Optional[str] = None

class SemanticSearchRequest(BaseModel):
    """Request model for semantic search operations"""
    search_query: str = PydanticField(max_length=2000)
    search_type: SemanticSearchType = SemanticSearchType.NATURAL_LANGUAGE
    max_results: int = PydanticField(default=50, ge=1, le=1000)
    similarity_threshold: float = PydanticField(default=0.7, ge=0.0, le=1.0)
    search_filters: Dict[str, Any] = {}
    user_context: Dict[str, Any] = {}

class RecommendationRequest(BaseModel):
    """Request model for catalog recommendations"""
    recommendation_type: RecommendationType
    target_user_id: Optional[str] = None
    input_assets: List[str] = []
    user_context: Dict[str, Any] = {}
    max_recommendations: int = PydanticField(default=10, ge=1, le=100)

class DiscoveryRequest(BaseModel):
    """Request model for intelligent discovery operations"""
    discovery_method: DiscoveryMethod
    target_sources: List[str]
    intelligence_level: IntelligenceLevel = IntelligenceLevel.INTERMEDIATE
    processing_priority: ProcessingPriority = ProcessingPriority.NORMAL
    discovery_criteria: Dict[str, Any] = {}

class IntelligenceModelResponse(BaseModel):
    """Response model for intelligence models"""
    id: UUID
    model_name: str
    model_type: IntelligenceModelType
    status: ModelStatus
    intelligence_level: IntelligenceLevel
    performance_metrics: Dict[str, Any]
    created_at: datetime
    deployment_time: Optional[datetime]

class SemanticSearchResponse(BaseModel):
    """Response model for semantic search results"""
    search_id: str
    results_count: int
    execution_time_ms: int
    search_results: List[Dict[str, Any]]
    confidence_score: Optional[float]
    query_understanding: Dict[str, Any]

class RecommendationResponse(BaseModel):
    """Response model for recommendations"""
    recommendation_id: str
    recommended_assets: List[Dict[str, Any]]
    recommendation_scores: List[float]
    confidence_scores: List[float]
    algorithm_used: str

class DiscoveryResponse(BaseModel):
    """Response model for discovery operations"""
    operation_id: str
    status: str
    discovered_assets: List[Dict[str, Any]]
    discovered_patterns: List[Dict[str, Any]]
    confidence_scores: Dict[str, float]
    duration_minutes: Optional[int]

# ====================================================================
# UTILITY FUNCTIONS
# ====================================================================

def generate_intelligence_uuid() -> str:
    """Generate a UUID for intelligence operations"""
    return f"int_{uuid4().hex[:12]}"

def calculate_model_health_score(
    success_rate: Optional[float],
    response_time: Optional[float],
    accuracy: Optional[float],
    usage_count: int
) -> float:
    """Calculate overall model health score"""
    if not any([success_rate, response_time, accuracy]):
        return 0.0
    
    # Normalize components
    success_component = (success_rate or 0.0) * 0.3
    speed_component = max(0, (1000 - (response_time or 1000)) / 1000) * 0.2
    accuracy_component = (accuracy or 0.0) * 0.4
    usage_component = min(1.0, usage_count / 1000) * 0.1
    
    return success_component + speed_component + accuracy_component + usage_component

def estimate_training_time(
    dataset_size: int,
    model_complexity: str,
    hardware_type: str = "standard"
) -> int:
    """Estimate training time in minutes"""
    base_time = dataset_size / 10000  # 1 minute per 10k samples
    
    complexity_multiplier = {
        "simple": 1.0,
        "moderate": 2.5,
        "complex": 5.0,
        "very_complex": 10.0
    }.get(model_complexity, 2.5)
    
    hardware_multiplier = {
        "gpu": 0.3,
        "tpu": 0.2,
        "standard": 1.0,
        "high_performance": 0.5
    }.get(hardware_type, 1.0)
    
    return max(5, int(base_time * complexity_multiplier * hardware_multiplier))

def calculate_search_relevance_score(
    semantic_similarity: float,
    context_match: float,
    popularity_score: float,
    recency_score: float
) -> float:
    """Calculate overall search relevance score"""
    weights = {
        'semantic': 0.4,
        'context': 0.3,
        'popularity': 0.2,
        'recency': 0.1
    }
    
    return (
        semantic_similarity * weights['semantic'] +
        context_match * weights['context'] +
        popularity_score * weights['popularity'] +
        recency_score * weights['recency']
    )

def generate_recommendation_explanation(
    recommendation_type: RecommendationType,
    similarity_score: float,
    user_context: Dict[str, Any]
) -> str:
    """Generate human-readable explanation for recommendations"""
    if recommendation_type == RecommendationType.CONTENT_BASED:
        return f"Recommended based on {similarity_score:.1%} similarity to your interests"
    elif recommendation_type == RecommendationType.COLLABORATIVE:
        return "Users with similar interests also viewed these items"
    elif recommendation_type == RecommendationType.POPULARITY_BASED:
        return "Trending items in your domain"
    else:
        return f"Recommended with {similarity_score:.1%} confidence"