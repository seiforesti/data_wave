/**
 * Advanced Catalog Intelligence Types
 * Maps to: catalog_intelligence_models.py
 * 
 * Comprehensive types for AI-powered catalog intelligence, semantic understanding,
 * recommendation engines, and advanced analytics for data discovery optimization.
 */

export interface SemanticEmbedding {
  id?: number;
  embedding_id: string;
  asset_type: string;
  asset_id: string;
  asset_name: string;
  embedding_model: string;
  embedding_version: string;
  embedding_vector?: number[];
  vector_dimensions: number;
  text_content?: string;
  context_window?: string;
  language: string;
  embedding_quality_score?: number;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  processing_time_ms?: number;
  custom_properties?: Record<string, any>;
}

export interface SemanticRelationship {
  id?: number;
  relationship_id: string;
  source_asset_id: string;
  target_asset_id: string;
  source_asset_type: string;
  target_asset_type: string;
  relationship_type: SemanticRelationType;
  relationship_strength: number;
  confidence_score: number;
  evidence_text?: string;
  context_description?: string;
  supporting_metadata?: Record<string, any>;
  discovery_method: string;
  discovery_algorithm?: string;
  discovery_date: string;
  is_validated: boolean;
  validation_date?: string;
  validation_source?: string;
  quality_score?: number;
  usage_count: number;
  positive_feedback: number;
  negative_feedback: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  custom_properties?: Record<string, any>;
}

export interface RecommendationEngine {
  id?: number;
  engine_id: string;
  engine_name: string;
  engine_type: RecommendationType;
  engine_description?: string;
  algorithm_type: string;
  model_configuration: Record<string, any>;
  training_data_config: Record<string, any>;
  performance_metrics: Record<string, any>;
  is_active: boolean;
  version: string;
  last_trained: string;
  training_frequency: string;
  accuracy_score?: number;
  precision_score?: number;
  recall_score?: number;
  f1_score?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  custom_properties?: Record<string, any>;
}

export interface AssetRecommendation {
  id?: number;
  recommendation_id: string;
  engine_id: string;
  user_id: string;
  asset_id: string;
  recommendation_type: RecommendationType;
  recommended_assets: string[];
  confidence_scores: number[];
  reasoning: string;
  context_factors: Record<string, any>;
  interaction_context: Record<string, any>;
  is_personalized: boolean;
  relevance_score: number;
  diversity_score: number;
  novelty_score: number;
  generated_at: string;
  expires_at?: string;
  is_viewed: boolean;
  is_clicked: boolean;
  is_accepted: boolean;
  user_feedback?: number;
  feedback_comment?: string;
  performance_metrics: Record<string, any>;
  custom_properties?: Record<string, any>;
}

export interface AssetUsagePattern {
  id?: number;
  pattern_id: string;
  asset_id: string;
  user_id?: string;
  pattern_type: UsagePattern;
  pattern_description: string;
  pattern_confidence: number;
  temporal_pattern: Record<string, any>;
  frequency_pattern: Record<string, any>;
  access_pattern: Record<string, any>;
  context_pattern: Record<string, any>;
  discovered_at: string;
  last_observed: string;
  observation_count: number;
  pattern_strength: number;
  is_anomalous: boolean;
  business_impact: string;
  optimization_suggestions: string[];
  custom_properties?: Record<string, any>;
}

export interface IntelligenceInsight {
  id?: number;
  insight_id: string;
  insight_type: IntelligenceType;
  asset_id?: string;
  user_id?: string;
  insight_title: string;
  insight_description: string;
  insight_category: string;
  confidence_level: AnalysisConfidence;
  impact_level: string;
  actionable_recommendations: string[];
  supporting_evidence: Record<string, any>;
  metadata_context: Record<string, any>;
  business_value: number;
  implementation_effort: string;
  generated_by: string;
  generation_algorithm: string;
  generated_at: string;
  is_validated: boolean;
  validation_feedback?: Record<string, any>;
  custom_properties?: Record<string, any>;
}

export interface CollaborationInsight {
  id?: number;
  collaboration_id: string;
  asset_id: string;
  collaboration_type: string;
  participants: string[];
  interaction_data: Record<string, any>;
  collaboration_score: number;
  effectiveness_metrics: Record<string, any>;
  knowledge_sharing_score: number;
  decision_impact: Record<string, any>;
  temporal_analysis: Record<string, any>;
  patterns_identified: string[];
  improvement_suggestions: string[];
  created_at: string;
  updated_at: string;
  custom_properties?: Record<string, any>;
}

// ===================== ENUMS =====================

export enum IntelligenceType {
  SEMANTIC_ANALYSIS = 'semantic_analysis',
  USAGE_PATTERNS = 'usage_patterns',
  SIMILARITY_ANALYSIS = 'similarity_analysis',
  RECOMMENDATION = 'recommendation',
  ANOMALY_DETECTION = 'anomaly_detection',
  TREND_ANALYSIS = 'trend_analysis',
  QUALITY_INSIGHTS = 'quality_insights',
  BUSINESS_INSIGHTS = 'business_insights'
}

export enum RecommendationType {
  SIMILAR_DATASETS = 'similar_datasets',
  RELATED_ASSETS = 'related_assets',
  QUALITY_IMPROVEMENT = 'quality_improvement',
  USAGE_OPTIMIZATION = 'usage_optimization',
  DATA_DISCOVERY = 'data_discovery',
  GOVERNANCE_COMPLIANCE = 'governance_compliance',
  COLLABORATION = 'collaboration',
  LEARNING_RESOURCES = 'learning_resources'
}

export enum SemanticRelationType {
  SYNONYMS = 'synonyms',
  HYPERNYMS = 'hypernyms',
  HYPONYMS = 'hyponyms',
  MERONYMS = 'meronyms',
  HOLONYMS = 'holonyms',
  SIMILAR = 'similar',
  RELATED = 'related',
  ANTONYMS = 'antonyms',
  FUNCTIONAL = 'functional'
}

export enum AnalysisConfidence {
  VERY_HIGH = 'very_high',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low'
}

export enum UsagePattern {
  FREQUENT_ACCESS = 'frequent_access',
  PERIODIC_BATCH = 'periodic_batch',
  EXPLORATORY = 'exploratory',
  REPORTING = 'reporting',
  ANALYTICS = 'analytics',
  ML_TRAINING = 'ml_training',
  REAL_TIME = 'real_time',
  SEASONAL = 'seasonal'
}

// ===================== REQUEST/RESPONSE TYPES =====================

export interface SemanticSearchRequest {
  query: string;
  search_type?: string;
  context?: Record<string, any>;
  filters?: Record<string, any>;
  max_results?: number;
  similarity_threshold?: number;
  include_embeddings?: boolean;
  include_relationships?: boolean;
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  total_results: number;
  search_time: number;
  query_analysis: Record<string, any>;
  suggestions?: string[];
}

export interface SemanticSearchResult {
  asset: IntelligentDataAsset;
  similarity_score: number;
  relevance_score: number;
  match_highlights: string[];
  semantic_context: Record<string, any>;
  relationship_context?: SemanticRelationship[];
}

export interface RecommendationRequest {
  user_id: string;
  asset_id?: string;
  recommendation_type: RecommendationType;
  context?: Record<string, any>;
  personalization_enabled?: boolean;
  max_recommendations?: number;
  include_reasoning?: boolean;
}

export interface RecommendationResponse {
  recommendations: AssetRecommendation[];
  total_recommendations: number;
  generation_time: number;
  personalization_applied: boolean;
  context_factors: Record<string, any>;
}

export interface IntelligenceAnalysisRequest {
  analysis_type: IntelligenceType;
  asset_ids?: string[];
  user_id?: string;
  time_range?: string;
  analysis_depth?: string;
  include_predictions?: boolean;
  custom_parameters?: Record<string, any>;
}

export interface IntelligenceAnalysisResponse {
  analysis_id: string;
  insights: IntelligenceInsight[];
  summary: Record<string, any>;
  recommendations: string[];
  confidence_level: AnalysisConfidence;
  analysis_time: number;
  metadata: Record<string, any>;
}

// ===================== ANALYTICS TYPES =====================

export interface CatalogIntelligenceMetrics {
  total_embeddings: number;
  total_relationships: number;
  total_recommendations: number;
  avg_confidence_score: number;
  active_patterns: number;
  insights_generated: number;
  user_engagement: number;
  search_effectiveness: number;
}

export interface SemanticAnalytics {
  embedding_coverage: number;
  relationship_accuracy: number;
  search_satisfaction: number;
  recommendation_acceptance: number;
  pattern_detection_rate: number;
  insight_validation_rate: number;
  collaboration_effectiveness: number;
  knowledge_discovery_rate: number;
}

// Import core types for integration
import type { IntelligentDataAsset } from './catalog-core.types';