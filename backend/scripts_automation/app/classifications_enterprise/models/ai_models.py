from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum, JSON, Float, func, LargeBinary
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
import uuid

Base = declarative_base()

class AIModelType(enum.Enum):
    LARGE_LANGUAGE_MODEL = "large_language_model"
    GRAPH_NEURAL_NETWORK = "graph_neural_network"
    TRANSFORMER_ENCODER = "transformer_encoder"
    MULTIMODAL_MODEL = "multimodal_model"
    REINFORCEMENT_LEARNING = "reinforcement_learning"
    FOUNDATION_MODEL = "foundation_model"
    CUSTOM_ARCHITECTURE = "custom_architecture"

class AICapability(enum.Enum):
    NATURAL_LANGUAGE_UNDERSTANDING = "natural_language_understanding"
    CONTEXT_AWARENESS = "context_awareness"
    DOMAIN_EXPERTISE = "domain_expertise"
    CAUSAL_REASONING = "causal_reasoning"
    EXPLAINABLE_AI = "explainable_ai"
    CONTINUOUS_LEARNING = "continuous_learning"
    MULTIMODAL_PROCESSING = "multimodal_processing"

class IntelligenceLevel(enum.Enum):
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    SUPERHUMAN = "superhuman"

class InsightType(enum.Enum):
    DATA_QUALITY = "data_quality"
    BUSINESS_VALUE = "business_value"
    RISK_ASSESSMENT = "risk_assessment"
    OPTIMIZATION_OPPORTUNITY = "optimization_opportunity"
    ANOMALY_DETECTION = "anomaly_detection"
    TREND_ANALYSIS = "trend_analysis"
    RELATIONSHIP_DISCOVERY = "relationship_discovery"
    COMPLIANCE_GAP = "compliance_gap"

class RecommendationPriority(enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFORMATIONAL = "informational"

class AIModel(Base):
    __tablename__ = "ai_models"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    name = Column(String(256), nullable=False)
    description = Column(Text)
    model_type = Column(Enum(AIModelType), nullable=False)
    
    # Model Architecture
    architecture_details = Column(JSON)
    parameter_count = Column(Integer)  # Number of parameters in billions
    context_window_size = Column(Integer)
    
    # Capabilities
    capabilities = Column(JSON)  # List of AICapability enums
    intelligence_level = Column(Enum(IntelligenceLevel), nullable=False)
    specialized_domains = Column(JSON)  # List of domain expertise areas
    
    # Performance Metrics
    benchmark_scores = Column(JSON)
    accuracy_metrics = Column(JSON)
    latency_p95_ms = Column(Float)
    throughput_requests_per_second = Column(Float)
    
    # Configuration
    inference_config = Column(JSON)
    prompt_templates = Column(JSON)
    fine_tuning_config = Column(JSON)
    
    # Integration
    api_endpoint = Column(String(512))
    api_key_required = Column(Boolean, default=True)
    rate_limits = Column(JSON)
    
    # Cost and Resource Management
    cost_per_request = Column(Float)
    estimated_monthly_cost = Column(Float)
    resource_requirements = Column(JSON)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(String(128))
    
    # Relationships
    assistant_sessions = relationship("IntelligentAssistantSession", back_populates="ai_model")
    insights = relationship("AIInsight", back_populates="ai_model")

class IntelligentAssistantSession(Base):
    __tablename__ = "intelligent_assistant_sessions"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    ai_model_id = Column(Integer, ForeignKey('ai_models.id'), nullable=False)
    user_id = Column(String(128), nullable=False)
    session_name = Column(String(256))
    
    # Session Context
    domain_context = Column(JSON)  # Current domain being worked on
    entity_context = Column(JSON)  # Current entities in focus
    conversation_history = Column(JSON)
    user_preferences = Column(JSON)
    
    # Session State
    is_active = Column(Boolean, default=True)
    last_interaction_at = Column(DateTime)
    total_interactions = Column(Integer, default=0)
    
    # Performance Tracking
    user_satisfaction_score = Column(Float)
    task_completion_rate = Column(Float)
    average_response_time_ms = Column(Float)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    ai_model = relationship("AIModel", back_populates="assistant_sessions")
    interactions = relationship("AssistantInteraction", back_populates="session")

class AssistantInteraction(Base):
    __tablename__ = "assistant_interactions"
    
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('intelligent_assistant_sessions.id'), nullable=False)
    
    # Interaction Details
    user_input = Column(Text, nullable=False)
    assistant_response = Column(Text, nullable=False)
    interaction_type = Column(String(64))  # question, command, feedback, clarification
    
    # Context and Intent
    detected_intent = Column(String(128))
    entities_extracted = Column(JSON)
    confidence_score = Column(Float)
    
    # Response Generation
    reasoning_chain = Column(JSON)  # Chain of thought reasoning
    sources_cited = Column(JSON)  # Sources used for the response
    uncertainty_indicators = Column(JSON)
    
    # User Feedback
    user_rating = Column(Integer)  # 1-5 rating
    feedback_text = Column(Text)
    was_helpful = Column(Boolean)
    
    # Performance Metrics
    response_time_ms = Column(Float)
    tokens_used = Column(Integer)
    cost_incurred = Column(Float)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    session = relationship("IntelligentAssistantSession", back_populates="interactions")

class AIInsight(Base):
    __tablename__ = "ai_insights"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    ai_model_id = Column(Integer, ForeignKey('ai_models.id'), nullable=False)
    
    # Insight Details
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    insight_type = Column(Enum(InsightType), nullable=False)
    priority = Column(Enum(RecommendationPriority), nullable=False)
    
    # Target Entity
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(256), nullable=False)
    entity_metadata = Column(JSON)
    
    # Insight Content
    key_findings = Column(JSON)
    recommendations = Column(JSON)
    risk_assessment = Column(JSON)
    business_impact = Column(JSON)
    
    # Evidence and Reasoning
    evidence_sources = Column(JSON)
    confidence_score = Column(Float, nullable=False)
    reasoning_explanation = Column(Text)
    alternative_interpretations = Column(JSON)
    
    # Actionability
    action_items = Column(JSON)
    estimated_effort = Column(String(32))  # low, medium, high
    expected_outcome = Column(Text)
    success_metrics = Column(JSON)
    
    # Temporal Aspects
    urgency_level = Column(String(32))
    valid_until = Column(DateTime)
    last_updated = Column(DateTime)
    
    # User Interaction
    views_count = Column(Integer, default=0)
    actions_taken = Column(JSON)
    user_feedback = Column(JSON)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    generated_by = Column(String(128))
    
    # Relationships
    ai_model = relationship("AIModel", back_populates="insights")

class DomainIntelligence(Base):
    __tablename__ = "domain_intelligence"
    
    id = Column(Integer, primary_key=True)
    domain_name = Column(String(128), nullable=False, unique=True)
    domain_description = Column(Text)
    
    # Domain Knowledge
    knowledge_base = Column(JSON)  # Structured domain knowledge
    terminology_dictionary = Column(JSON)
    best_practices = Column(JSON)
    compliance_requirements = Column(JSON)
    
    # Domain Expertise
    expert_rules = Column(JSON)
    heuristics = Column(JSON)
    pattern_library = Column(JSON)
    
    # Learning and Adaptation
    learning_examples = Column(JSON)
    feedback_history = Column(JSON)
    adaptation_log = Column(JSON)
    
    # Performance Metrics
    accuracy_in_domain = Column(Float)
    user_satisfaction = Column(Float)
    knowledge_completeness = Column(Float)
    
    # Versioning
    version = Column(String(32), nullable=False)
    parent_version_id = Column(Integer, ForeignKey('domain_intelligence.id'))
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(String(128))
    
    # Relationships
    parent_version = relationship("DomainIntelligence", remote_side=[id])

class ContextAwareSearch(Base):
    __tablename__ = "context_aware_searches"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    
    # Search Query
    query_text = Column(Text, nullable=False)
    user_id = Column(String(128), nullable=False)
    search_intent = Column(String(128))
    
    # Context Information
    user_context = Column(JSON)  # User's current working context
    entity_context = Column(JSON)  # Entities currently in focus
    temporal_context = Column(JSON)  # Time-based context
    domain_context = Column(JSON)  # Domain-specific context
    
    # Search Processing
    query_expansion = Column(JSON)  # Expanded query terms
    semantic_understanding = Column(JSON)  # Semantic analysis results
    context_enrichment = Column(JSON)  # How context was used
    
    # Search Results
    results = Column(JSON)  # Search results with relevance scores
    result_count = Column(Integer)
    personalization_applied = Column(JSON)
    
    # Performance Metrics
    search_time_ms = Column(Float)
    relevance_score = Column(Float)
    user_clicked_results = Column(JSON)
    user_satisfaction = Column(Float)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())

class AutoGeneratedTag(Base):
    __tablename__ = "auto_generated_tags"
    
    id = Column(Integer, primary_key=True)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(256), nullable=False)
    
    # Tag Details
    tag_name = Column(String(128), nullable=False)
    tag_value = Column(String(512))
    tag_category = Column(String(64))
    
    # AI Generation Details
    generation_method = Column(String(64))  # llm, graph_analysis, pattern_matching
    confidence_score = Column(Float, nullable=False)
    reasoning = Column(Text)
    
    # Validation
    is_validated = Column(Boolean, default=False)
    validation_source = Column(String(64))  # human, automated, consensus
    validation_confidence = Column(Float)
    
    # Usage Statistics
    usage_count = Column(Integer, default=0)
    usefulness_score = Column(Float)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    generated_by = Column(String(128))
    validated_by = Column(String(128))
    validated_at = Column(DateTime)

class AIOptimizationRecommendation(Base):
    __tablename__ = "ai_optimization_recommendations"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    
    # Target System
    target_system = Column(String(128), nullable=False)
    target_component = Column(String(128))
    
    # Optimization Details
    optimization_type = Column(String(64))  # performance, cost, security, compliance
    current_state = Column(JSON)
    recommended_changes = Column(JSON)
    expected_improvements = Column(JSON)
    
    # Implementation
    implementation_steps = Column(JSON)
    estimated_effort_hours = Column(Float)
    required_resources = Column(JSON)
    risk_assessment = Column(JSON)
    
    # Business Impact
    cost_savings_annual = Column(Float)
    performance_improvement_percentage = Column(Float)
    roi_months = Column(Float)
    
    # Status
    status = Column(String(32), default="pending")  # pending, approved, implementing, completed, rejected
    implementation_progress = Column(Float, default=0.0)
    
    # Results (after implementation)
    actual_improvements = Column(JSON)
    lessons_learned = Column(Text)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    created_by = Column(String(128))

class ExplainableAITrace(Base):
    __tablename__ = "explainable_ai_traces"
    
    id = Column(Integer, primary_key=True)
    
    # Traceability
    decision_id = Column(String(128), nullable=False)  # Links to specific AI decision
    model_used = Column(String(128), nullable=False)
    
    # Input Analysis
    input_data = Column(JSON, nullable=False)
    feature_importance = Column(JSON)
    attention_weights = Column(JSON)
    
    # Decision Process
    reasoning_steps = Column(JSON)
    alternative_paths_considered = Column(JSON)
    confidence_intervals = Column(JSON)
    
    # Output Explanation
    decision_rationale = Column(Text, nullable=False)
    key_factors = Column(JSON)
    uncertainty_sources = Column(JSON)
    
    # Validation
    human_review_status = Column(String(32))
    validation_notes = Column(Text)
    
    # Audit Fields
    created_at = Column(DateTime, server_default=func.now())
    decision_maker = Column(String(128))  # AI model identifier