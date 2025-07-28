/**
 * Advanced Search Types
 * Maps to: semantic_search_service.py, enterprise_catalog_routes.py search endpoints
 * 
 * Comprehensive types for semantic search, natural language queries, search analytics,
 * and advanced search capabilities with AI-powered understanding.
 */

export interface SearchConfiguration {
  max_search_results: number;
  semantic_similarity_threshold: number;
  contextual_boost_factor: number;
  cache_ttl: number;
  vector_dimension: number;
  faiss_index_type: string;
  search_timeout: number;
  sentence_transformer_model: string;
  bert_model: string;
  spacy_model: string;
  query_expansion_enabled: boolean;
  auto_correct_enabled: boolean;
  synonym_expansion_enabled: boolean;
  contextual_search_enabled: boolean;
  semantic_weight: number;
  keyword_weight: number;
  popularity_weight: number;
  recency_weight: number;
}

export interface SearchRequest {
  query: string;
  search_type?: SearchType;
  context?: Record<string, any>;
  filters?: SearchFilters;
  max_results?: number;
  similarity_threshold?: number;
  include_embeddings?: boolean;
  include_relationships?: boolean;
  boost_factors?: BoostFactors;
  user_preferences?: UserSearchPreferences;
  search_scope?: SearchScope;
}

export interface SearchFilters {
  asset_types?: string[];
  business_domains?: string[];
  owners?: string[];
  criticality_levels?: string[];
  quality_thresholds?: Record<string, number>;
  date_ranges?: Record<string, string>;
  tags?: string[];
  status_filters?: string[];
  sensitivity_levels?: string[];
  custom_filters?: Record<string, any>;
}

export interface BoostFactors {
  title_boost?: number;
  description_boost?: number;
  tags_boost?: number;
  content_boost?: number;
  metadata_boost?: number;
  usage_boost?: number;
  quality_boost?: number;
  recency_boost?: number;
}

export interface UserSearchPreferences {
  preferred_asset_types?: string[];
  excluded_domains?: string[];
  quality_threshold?: number;
  preferred_languages?: string[];
  result_grouping?: string;
  sorting_preference?: string;
  personalization_enabled?: boolean;
}

export interface SearchScope {
  include_archived?: boolean;
  include_deprecated?: boolean;
  include_drafts?: boolean;
  cross_domain_search?: boolean;
  deep_search_enabled?: boolean;
  include_system_assets?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  total_results: number;
  search_time: number;
  query_analysis: QueryAnalysis;
  suggestions?: string[];
  facets?: SearchFacets;
  related_queries?: string[];
  search_metadata: SearchMetadata;
}

export interface SearchResult {
  asset: SearchableAsset;
  similarity_score: number;
  relevance_score: number;
  rank: number;
  match_highlights: MatchHighlight[];
  semantic_context: SemanticContext;
  relationship_context?: RelationshipContext[];
  boost_explanations?: BoostExplanation[];
}

export interface SearchableAsset {
  id: string;
  qualified_name: string;
  display_name: string;
  description?: string;
  asset_type: string;
  status: string;
  owner?: string;
  business_domain?: string;
  tags: string[];
  quality_score?: number;
  last_modified?: string;
  usage_frequency?: string;
  criticality?: string;
  sensitivity?: string;
  thumbnail_url?: string;
  preview_data?: any[];
}

export interface MatchHighlight {
  field: string;
  fragments: string[];
  match_type: MatchType;
  confidence: number;
}

export interface SemanticContext {
  semantic_similarity: number;
  contextual_relevance: number;
  topic_alignment: number;
  intent_match: number;
  concept_overlap: string[];
  semantic_distance: number;
}

export interface RelationshipContext {
  relationship_type: string;
  related_asset_id: string;
  relationship_strength: number;
  context_description: string;
}

export interface BoostExplanation {
  boost_type: string;
  boost_value: number;
  explanation: string;
  contributing_factors: string[];
}

export interface QueryAnalysis {
  intent: QueryIntent;
  entities: ExtractedEntity[];
  filters: InferredFilter[];
  suggestions: QuerySuggestion[];
  complexity_score: number;
  language: string;
  sentiment?: string;
  query_type: QueryType;
  processing_time: number;
}

export interface ExtractedEntity {
  entity: string;
  entity_type: EntityType;
  confidence: number;
  context: string;
  synonyms?: string[];
  related_terms?: string[];
}

export interface InferredFilter {
  filter_type: string;
  filter_value: any;
  confidence: number;
  source: string;
}

export interface QuerySuggestion {
  suggestion: string;
  suggestion_type: SuggestionType;
  confidence: number;
  expected_results: number;
  reasoning: string;
}

export interface SearchFacets {
  asset_types: FacetValue[];
  business_domains: FacetValue[];
  owners: FacetValue[];
  quality_ranges: FacetValue[];
  date_ranges: FacetValue[];
  tags: FacetValue[];
  statuses: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}

export interface SearchMetadata {
  search_id: string;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  search_source: string;
  personalization_applied: boolean;
  cache_hit: boolean;
  index_version: string;
  algorithm_version: string;
}

export interface SearchAnalytics {
  total_searches: number;
  successful_searches: number;
  average_response_time: number;
  semantic_search_ratio: number;
  query_expansion_ratio: number;
  click_through_rate: number;
  search_satisfaction: number;
  popular_queries: PopularQuery[];
  search_trends: SearchTrend[];
  user_behavior: SearchBehavior;
}

export interface PopularQuery {
  query: string;
  search_count: number;
  success_rate: number;
  average_results: number;
  trending_score: number;
}

export interface SearchTrend {
  time_period: string;
  search_volume: number;
  unique_queries: number;
  avg_response_time: number;
  satisfaction_score: number;
}

export interface SearchBehavior {
  avg_query_length: number;
  refinement_rate: number;
  filter_usage_rate: number;
  result_interaction_rate: number;
  session_duration: number;
  queries_per_session: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  query: string;
  filters: SearchFilters;
  user_id: string;
  created_at: string;
  last_executed: string;
  execution_count: number;
  alert_enabled: boolean;
  alert_frequency?: string;
  shared: boolean;
  tags?: string[];
}

export interface SearchAlert {
  id: string;
  saved_search_id: string;
  user_id: string;
  alert_name: string;
  conditions: AlertCondition[];
  notification_channels: string[];
  frequency: AlertFrequency;
  enabled: boolean;
  last_triggered?: string;
  trigger_count: number;
  created_at: string;
}

export interface AlertCondition {
  condition_type: AlertConditionType;
  threshold: number;
  comparison: ComparisonOperator;
  field: string;
}

export interface PersonalizedSearch {
  user_id: string;
  search_history: SearchHistoryEntry[];
  preferences: SearchPreferences;
  behavior_profile: UserBehaviorProfile;
  recommendation_model: RecommendationModel;
  learning_parameters: LearningParameters;
}

export interface SearchHistoryEntry {
  query: string;
  timestamp: string;
  results_count: number;
  clicked_results: string[];
  satisfaction_score?: number;
  context: Record<string, any>;
}

export interface SearchPreferences {
  preferred_result_types: string[];
  excluded_domains: string[];
  quality_threshold: number;
  language_preference: string;
  result_density: string;
  highlight_style: string;
  auto_suggestions: boolean;
  personalization_level: number;
}

export interface UserBehaviorProfile {
  search_patterns: SearchPattern[];
  interest_areas: string[];
  expertise_level: Record<string, number>;
  interaction_preferences: InteractionPreference[];
  time_patterns: TimePattern[];
}

export interface SearchPattern {
  pattern_type: string;
  frequency: number;
  confidence: number;
  description: string;
  example_queries: string[];
}

export interface InteractionPreference {
  interaction_type: string;
  preference_score: number;
  context: string;
}

export interface TimePattern {
  time_period: string;
  activity_level: number;
  query_types: string[];
  common_filters: string[];
}

export interface RecommendationModel {
  model_id: string;
  model_type: string;
  accuracy_score: number;
  last_trained: string;
  training_data_size: number;
  parameters: Record<string, any>;
}

export interface LearningParameters {
  learning_rate: number;
  feedback_weight: number;
  decay_factor: number;
  minimum_interactions: number;
  confidence_threshold: number;
}

export interface SearchIndexConfiguration {
  index_name: string;
  index_type: string;
  vector_dimension: number;
  distance_metric: string;
  shard_count: number;
  replica_count: number;
  refresh_interval: string;
  analyzer_settings: AnalyzerSettings;
  field_mappings: FieldMapping[];
}

export interface AnalyzerSettings {
  tokenizer: string;
  filters: string[];
  char_filters: string[];
  custom_analyzers: CustomAnalyzer[];
}

export interface CustomAnalyzer {
  name: string;
  tokenizer: string;
  filters: string[];
  char_filters: string[];
}

export interface FieldMapping {
  field_name: string;
  field_type: string;
  analyzer?: string;
  index: boolean;
  store: boolean;
  boost?: number;
}

// ===================== ENUMS =====================

export enum SearchType {
  KEYWORD = 'keyword',
  SEMANTIC = 'semantic',
  HYBRID = 'hybrid',
  FUZZY = 'fuzzy',
  EXACT = 'exact',
  NATURAL_LANGUAGE = 'natural_language',
  ADVANCED = 'advanced'
}

export enum MatchType {
  EXACT = 'exact',
  PARTIAL = 'partial',
  FUZZY = 'fuzzy',
  SEMANTIC = 'semantic',
  PHONETIC = 'phonetic',
  SYNONYM = 'synonym'
}

export enum QueryIntent {
  SEARCH = 'search',
  FILTER = 'filter',
  BROWSE = 'browse',
  COMPARE = 'compare',
  ANALYZE = 'analyze',
  DISCOVER = 'discover',
  NAVIGATE = 'navigate'
}

export enum EntityType {
  ASSET_NAME = 'asset_name',
  OWNER = 'owner',
  DOMAIN = 'domain',
  TAG = 'tag',
  DATE = 'date',
  NUMBER = 'number',
  LOCATION = 'location',
  ORGANIZATION = 'organization',
  TECHNOLOGY = 'technology'
}

export enum QueryType {
  SIMPLE = 'simple',
  COMPLEX = 'complex',
  BOOLEAN = 'boolean',
  WILDCARD = 'wildcard',
  PHRASE = 'phrase',
  PROXIMITY = 'proximity',
  RANGE = 'range'
}

export enum SuggestionType {
  COMPLETION = 'completion',
  CORRECTION = 'correction',
  EXPANSION = 'expansion',
  FILTER = 'filter',
  SIMILAR = 'similar',
  TRENDING = 'trending'
}

export enum AlertFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum AlertConditionType {
  NEW_RESULTS = 'new_results',
  RESULT_COUNT_CHANGE = 'result_count_change',
  QUALITY_CHANGE = 'quality_change',
  STATUS_CHANGE = 'status_change',
  OWNERSHIP_CHANGE = 'ownership_change'
}

export enum ComparisonOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains'
}

// ===================== REQUEST/RESPONSE TYPES =====================

export interface AutoCompleteRequest {
  partial_query: string;
  max_suggestions: number;
  context?: Record<string, any>;
  user_preferences?: UserSearchPreferences;
}

export interface AutoCompleteResponse {
  suggestions: AutoCompleteSuggestion[];
  query_analysis: Partial<QueryAnalysis>;
  processing_time: number;
}

export interface AutoCompleteSuggestion {
  suggestion: string;
  type: SuggestionType;
  confidence: number;
  preview_results: number;
  highlight: string;
}

export interface SearchSuggestionRequest {
  query: string;
  context?: Record<string, any>;
  max_suggestions?: number;
  suggestion_types?: SuggestionType[];
}

export interface SearchSuggestionResponse {
  suggestions: string[];
  confidence_scores: number[];
  suggestion_types: SuggestionType[];
  explanations: string[];
}

export interface QueryAnalysisRequest {
  query: string;
  context?: Record<string, any>;
  analysis_depth?: string;
}

export interface QueryAnalysisResponse {
  analysis: QueryAnalysis;
  optimization_suggestions: string[];
  alternative_queries: string[];
  performance_prediction: PerformancePrediction;
}

export interface PerformancePrediction {
  estimated_results: number;
  estimated_response_time: number;
  complexity_score: number;
  resource_requirements: ResourceRequirement[];
}

export interface ResourceRequirement {
  resource_type: string;
  estimated_usage: number;
  peak_usage: number;
}

// ===================== ADVANCED SEARCH TYPES =====================

export interface NaturalLanguageQuery {
  query: string;
  language: string;
  domain_context?: string;
  user_expertise_level?: string;
  expected_response_type?: string;
}

export interface ConversationalSearch {
  conversation_id: string;
  turn_number: number;
  query: string;
  context_history: ConversationTurn[];
  user_intent: QueryIntent;
  clarification_needed?: boolean;
}

export interface ConversationTurn {
  turn_number: number;
  user_query: string;
  system_response: string;
  results_count: number;
  user_satisfaction?: number;
  timestamp: string;
}

export interface VisualSearch {
  image_data?: string;
  image_url?: string;
  visual_features: VisualFeature[];
  similarity_threshold: number;
  search_scope: VisualSearchScope;
}

export interface VisualFeature {
  feature_type: string;
  feature_vector: number[];
  confidence: number;
  description: string;
}

export interface VisualSearchScope {
  asset_types: string[];
  include_thumbnails: boolean;
  include_diagrams: boolean;
  include_charts: boolean;
}

export interface MultiModalSearch {
  text_query?: string;
  image_query?: VisualSearch;
  voice_query?: VoiceSearch;
  combination_strategy: CombinationStrategy;
  weights: ModalityWeights;
}

export interface VoiceSearch {
  audio_data?: string;
  audio_url?: string;
  language: string;
  speaker_profile?: string;
  transcription_confidence?: number;
}

export interface CombinationStrategy {
  strategy_type: string;
  fusion_method: string;
  normalization_method: string;
  threshold_adjustment: number;
}

export interface ModalityWeights {
  text_weight: number;
  image_weight: number;
  voice_weight: number;
  metadata_weight: number;
}

// Import core types for integration
import type { IntelligentDataAsset } from './catalog-core.types';