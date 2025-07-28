/**
 * Advanced Catalog Search Types
 * ============================
 * 
 * Comprehensive search type definitions for the Advanced Catalog system.
 * Maps to backend semantic search and discovery services.
 * 
 * Backend Files Mapped:
 * - semantic_search_service.py (893 lines)
 * - semantic_search_routes.py (762 lines)
 * - intelligent_discovery_service.py (1117 lines)
 * - intelligent_discovery_routes.py (658 lines)
 */

import { 
  AssetType, 
  AssetStatus, 
  DataQuality, 
  AssetCriticality, 
  DataSensitivity,
  IntelligentDataAsset,
  BusinessGlossaryTerm 
} from './catalog-core.types';

// ========================= SEARCH ENUMS =========================

export enum SearchType {
  KEYWORD = "keyword",
  SEMANTIC = "semantic", 
  NATURAL_LANGUAGE = "natural_language",
  FUZZY = "fuzzy",
  EXACT = "exact",
  ADVANCED = "advanced"
}

export enum SearchScope {
  ALL = "all",
  ASSETS = "assets",
  COLUMNS = "columns", 
  GLOSSARY = "glossary",
  METADATA = "metadata",
  DESCRIPTIONS = "descriptions"
}

export enum SortBy {
  RELEVANCE = "relevance",
  NAME = "name",
  CREATED_DATE = "created_date",
  UPDATED_DATE = "updated_date",
  QUALITY_SCORE = "quality_score",
  USAGE_COUNT = "usage_count",
  POPULARITY = "popularity"
}

export enum SortDirection {
  ASC = "asc",
  DESC = "desc"
}

export enum SearchResultType {
  ASSET = "asset",
  COLUMN = "column",
  GLOSSARY_TERM = "glossary_term",
  SCHEMA = "schema",
  DATABASE = "database"
}

// ========================= SEARCH REQUEST INTERFACES =========================

export interface BaseSearchRequest {
  query: string;
  search_type?: SearchType;
  scope?: SearchScope;
  limit?: number;
  offset?: number;
  include_highlights?: boolean;
  include_facets?: boolean;
}

export interface AdvancedSearchRequest extends BaseSearchRequest {
  filters?: SearchFilters;
  sort?: SearchSort;
  boost_factors?: BoostFactors;
  aggregations?: string[];
  facet_filters?: Record<string, string[]>;
}

export interface SemanticSearchRequest extends BaseSearchRequest {
  similarity_threshold?: number;
  embedding_model?: string;
  include_similar_terms?: boolean;
  context_assets?: string[];
}

export interface NaturalLanguageSearchRequest extends BaseSearchRequest {
  intent_detection?: boolean;
  entity_extraction?: boolean;
  question_answering?: boolean;
  conversation_context?: ConversationContext;
}

export interface SearchFilters {
  asset_types?: AssetType[];
  asset_status?: AssetStatus[];
  source_systems?: string[];
  databases?: string[];
  schemas?: string[];
  tags?: string[];
  owners?: string[];
  stewards?: string[];
  quality_levels?: DataQuality[];
  criticality_levels?: AssetCriticality[];
  sensitivity_levels?: DataSensitivity[];
  date_ranges?: DateRangeFilters;
  numeric_ranges?: NumericRangeFilters;
  custom_properties?: Record<string, any>;
  has_lineage?: boolean;
  has_documentation?: boolean;
  has_glossary_terms?: boolean;
}

export interface DateRangeFilters {
  created_date?: DateRange;
  updated_date?: DateRange;
  last_accessed?: DateRange;
  discovered_date?: DateRange;
}

export interface NumericRangeFilters {
  quality_score?: NumericRange;
  usage_count?: NumericRange;
  column_count?: NumericRange;
  row_count?: NumericRange;
}

export interface DateRange {
  start?: string;
  end?: string;
}

export interface NumericRange {
  min?: number;
  max?: number;
}

export interface SearchSort {
  field: SortBy;
  direction: SortDirection;
  secondary_sort?: {
    field: SortBy;
    direction: SortDirection;
  };
}

export interface BoostFactors {
  name_boost?: number;
  description_boost?: number;
  tag_boost?: number;
  owner_boost?: number;
  quality_boost?: number;
  usage_boost?: number;
  recency_boost?: number;
}

export interface ConversationContext {
  conversation_id?: string;
  previous_queries?: string[];
  user_intent?: string;
  domain_context?: string;
}

// ========================= SEARCH RESULT INTERFACES =========================

export interface SearchResponse<T = SearchResult> {
  results: T[];
  total_count: number;
  search_time_ms: number;
  query_info: QueryInfo;
  facets?: SearchFacets;
  suggestions?: SearchSuggestion[];
  aggregations?: SearchAggregations;
  debug_info?: SearchDebugInfo;
}

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  relevance_score: number;
  highlights?: SearchHighlights;
  metadata: SearchResultMetadata;
  asset?: IntelligentDataAsset;
  column?: ColumnSearchResult;
  glossary_term?: BusinessGlossaryTerm;
}

export interface ColumnSearchResult {
  id: string;
  name: string;
  asset_id: string;
  asset_name: string;
  data_type: string;
  description?: string;
  business_name?: string;
  tags: string[];
  sensitivity_level?: DataSensitivity;
}

export interface SearchHighlights {
  title?: string[];
  description?: string[];
  content?: string[];
  tags?: string[];
  column_names?: string[];
  metadata?: Record<string, string[]>;
}

export interface SearchResultMetadata {
  asset_type?: AssetType;
  source_system?: string;
  database?: string;
  schema?: string;
  owner?: string;
  quality_score?: number;
  last_updated?: string;
  usage_count?: number;
  tags: string[];
  custom_properties?: Record<string, any>;
}

export interface QueryInfo {
  original_query: string;
  processed_query: string;
  search_type: SearchType;
  filters_applied: string[];
  boost_factors_used?: BoostFactors;
  semantic_similarity?: SemanticSimilarityInfo;
}

export interface SemanticSimilarityInfo {
  embedding_model: string;
  similarity_threshold: number;
  query_embedding?: number[];
  similar_terms_found: string[];
}

// ========================= SEARCH FACETS AND AGGREGATIONS =========================

export interface SearchFacets {
  asset_types: FacetValue[];
  source_systems: FacetValue[];
  databases: FacetValue[];
  schemas: FacetValue[];
  owners: FacetValue[];
  tags: FacetValue[];
  quality_levels: FacetValue[];
  criticality_levels: FacetValue[];
  date_ranges: DateRangeFacet[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected?: boolean;
}

export interface DateRangeFacet {
  range: string;
  start_date: string;
  end_date: string;
  count: number;
}

export interface SearchAggregations {
  total_assets_by_type: Record<AssetType, number>;
  average_quality_score: number;
  quality_distribution: Record<DataQuality, number>;
  usage_statistics: UsageAggregation;
  temporal_distribution: TemporalAggregation[];
}

export interface UsageAggregation {
  total_usage: number;
  average_usage: number;
  most_used_assets: Array<{
    asset_id: string;
    asset_name: string;
    usage_count: number;
  }>;
}

export interface TemporalAggregation {
  period: string;
  asset_count: number;
  quality_trend: number;
}

// ========================= SEARCH SUGGESTIONS =========================

export interface SearchSuggestion {
  type: SuggestionType;
  text: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export enum SuggestionType {
  QUERY_COMPLETION = "query_completion",
  SPELLING_CORRECTION = "spelling_correction",
  RELATED_TERM = "related_term",
  POPULAR_SEARCH = "popular_search",
  SIMILAR_ASSET = "similar_asset"
}

// ========================= SAVED SEARCHES =========================

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  query: string;
  search_request: AdvancedSearchRequest;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_alert_enabled: boolean;
  alert_frequency?: AlertFrequency;
  tags: string[];
  usage_count: number;
  last_executed?: string;
}

export enum AlertFrequency {
  REAL_TIME = "real_time",
  HOURLY = "hourly", 
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly"
}

export interface SavedSearchCreateRequest {
  name: string;
  description?: string;
  search_request: AdvancedSearchRequest;
  is_public?: boolean;
  is_alert_enabled?: boolean;
  alert_frequency?: AlertFrequency;
  tags?: string[];
}

export interface SavedSearchUpdateRequest {
  name?: string;
  description?: string;
  search_request?: AdvancedSearchRequest;
  is_public?: boolean;
  is_alert_enabled?: boolean;
  alert_frequency?: AlertFrequency;
  tags?: string[];
}

// ========================= SEARCH ANALYTICS =========================

export interface SearchAnalytics {
  total_searches: number;
  unique_users: number;
  popular_queries: PopularQuery[];
  search_trends: SearchTrend[];
  result_click_rates: ClickRateAnalytics[];
  zero_result_queries: ZeroResultQuery[];
  performance_metrics: SearchPerformanceMetrics;
  user_behavior: UserBehaviorAnalytics;
}

export interface PopularQuery {
  query: string;
  search_count: number;
  unique_users: number;
  average_results: number;
  click_through_rate: number;
}

export interface SearchTrend {
  date: string;
  search_count: number;
  unique_queries: number;
  average_response_time: number;
}

export interface ClickRateAnalytics {
  result_position: number;
  click_count: number;
  impression_count: number;
  click_through_rate: number;
}

export interface ZeroResultQuery {
  query: string;
  search_count: number;
  suggested_alternatives?: string[];
}

export interface SearchPerformanceMetrics {
  average_response_time_ms: number;
  p95_response_time_ms: number;
  p99_response_time_ms: number;
  cache_hit_rate: number;
  index_size_mb: number;
  query_complexity_distribution: Record<string, number>;
}

export interface UserBehaviorAnalytics {
  average_query_length: number;
  query_refinement_rate: number;
  session_depth: number;
  bounce_rate: number;
  conversion_rate: number;
  popular_filters: Record<string, number>;
}

// ========================= SEARCH PERSONALIZATION =========================

export interface SearchPersonalization {
  user_id: string;
  preferences: SearchPreferences;
  search_history: SearchHistoryEntry[];
  bookmarked_assets: string[];
  frequently_accessed: FrequentlyAccessedAsset[];
  domain_expertise: DomainExpertise[];
  collaboration_context: CollaborationContext;
}

export interface SearchPreferences {
  default_search_type: SearchType;
  default_scope: SearchScope;
  preferred_result_count: number;
  auto_complete_enabled: boolean;
  highlight_enabled: boolean;
  facet_preferences: string[];
  sort_preferences: SearchSort;
  boost_preferences: BoostFactors;
}

export interface SearchHistoryEntry {
  query: string;
  search_request: AdvancedSearchRequest;
  timestamp: string;
  results_count: number;
  clicked_results: string[];
  session_id: string;
}

export interface FrequentlyAccessedAsset {
  asset_id: string;
  asset_name: string;
  access_count: number;
  last_accessed: string;
  context_tags: string[];
}

export interface DomainExpertise {
  domain: string;
  confidence_score: number;
  related_assets: string[];
  expertise_indicators: string[];
}

export interface CollaborationContext {
  team_id?: string;
  department?: string;
  project_context?: string[];
  shared_searches: string[];
  collaborative_assets: string[];
}

// ========================= SEARCH DEBUG AND MONITORING =========================

export interface SearchDebugInfo {
  query_parsing: QueryParsingDebug;
  filter_application: FilterDebugInfo[];
  scoring_details: ScoringDebugInfo;
  performance_breakdown: PerformanceBreakdown;
  index_statistics: IndexStatistics;
}

export interface QueryParsingDebug {
  original_query: string;
  tokenized_query: string[];
  stemmed_terms: string[];
  synonyms_applied: Record<string, string[]>;
  stop_words_removed: string[];
  spelling_corrections: Record<string, string>;
}

export interface FilterDebugInfo {
  filter_name: string;
  filter_values: any[];
  documents_matched: number;
  execution_time_ms: number;
}

export interface ScoringDebugInfo {
  scoring_model: string;
  base_scores: Record<string, number>;
  boost_applications: Record<string, BoostApplication>;
  final_scores: Record<string, number>;
  normalization_applied: boolean;
}

export interface BoostApplication {
  boost_factor: number;
  reason: string;
  score_before: number;
  score_after: number;
}

export interface PerformanceBreakdown {
  query_parsing_ms: number;
  filter_application_ms: number;
  scoring_ms: number;
  result_formatting_ms: number;
  total_execution_ms: number;
  cache_operations_ms: number;
}

export interface IndexStatistics {
  total_documents: number;
  index_size_mb: number;
  last_updated: string;
  segments_count: number;
  deleted_documents: number;
  optimization_needed: boolean;
}

// ========================= EXPORT TYPES =========================

export type {
  // Request Types
  BaseSearchRequest,
  AdvancedSearchRequest,
  SemanticSearchRequest,
  NaturalLanguageSearchRequest,
  SearchFilters,
  SearchSort,
  
  // Response Types  
  SearchResponse,
  SearchResult,
  SearchHighlights,
  SearchFacets,
  SearchAggregations,
  
  // Saved Searches
  SavedSearch,
  SavedSearchCreateRequest,
  SavedSearchUpdateRequest,
  
  // Analytics
  SearchAnalytics,
  SearchPersonalization,
  
  // Debug
  SearchDebugInfo
};