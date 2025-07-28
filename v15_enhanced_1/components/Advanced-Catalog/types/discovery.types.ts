// 🔍 **DISCOVERY TYPES** - Supporting intelligent discovery and profiling
// Maps to: intelligent_discovery_service.py, data_profiling_service.py, semantic_search_service.py

import { AssetType, SensitivityLevel, ValidationStatus, ConfidenceLevel } from './catalog-core.types';

// 🎯 DISCOVERY CORE TYPES
export interface DiscoveryJob {
  id: string;
  name: string;
  description?: string;
  discovery_type: DiscoveryType;
  data_source_id: string;
  configuration: DiscoveryConfiguration;
  status: DiscoveryStatus;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  created_by: string;
  results_summary: DiscoveryResultsSummary;
  assets_discovered: number;
  assets_classified: number;
  errors: DiscoveryError[];
  progress_percentage: number;
  estimated_completion: Date;
  priority: Priority;
}

export interface DiscoveryConfiguration {
  scan_depth: ScanDepth;
  asset_types_to_discover: AssetType[];
  auto_classification_enabled: boolean;
  sensitivity_detection_enabled: boolean;
  profiling_enabled: boolean;
  sampling_strategy: SamplingStrategy;
  concurrent_threads: number;
  batch_size: number;
  timeout_minutes: number;
  custom_rules: CustomDiscoveryRule[];
  notification_settings: NotificationSettings;
  quality_checks_enabled: boolean;
}

export interface DiscoveryResultsSummary {
  total_assets_scanned: number;
  new_assets_discovered: number;
  existing_assets_updated: number;
  assets_with_issues: number;
  total_processing_time_ms: number;
  discovery_accuracy: number;
  classification_accuracy: number;
  quality_assessment_summary: QualityAssessmentSummary;
  sensitivity_distribution: Record<SensitivityLevel, number>;
  asset_type_distribution: Record<AssetType, number>;
}

export interface CustomDiscoveryRule {
  id: string;
  name: string;
  pattern: string;
  rule_type: DiscoveryRuleType;
  asset_type: AssetType;
  conditions: DiscoveryCondition[];
  actions: DiscoveryAction[];
  priority: number;
  is_active: boolean;
}

// 📊 PROFILING TYPES
export interface ProfilingJob {
  id: string;
  asset_id: string;
  profiling_type: ProfilingType;
  configuration: ProfilingConfiguration;
  status: ProfilingStatus;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  results: ProfilingResults;
  quality_score: number;
  anomalies_detected: ProfilingAnomaly[];
  recommendations: ProfilingRecommendation[];
  processing_time_ms: number;
}

export interface ProfilingConfiguration {
  sample_size?: number;
  sampling_method: SamplingMethod;
  columns_to_profile: string[];
  statistical_analysis: boolean;
  pattern_detection: boolean;
  null_analysis: boolean;
  uniqueness_analysis: boolean;
  distribution_analysis: boolean;
  correlation_analysis: boolean;
  outlier_detection: boolean;
  data_type_inference: boolean;
  custom_metrics: CustomMetric[];
}

export interface ProfilingResults {
  row_count: number;
  column_count: number;
  total_size_bytes: number;
  column_profiles: ColumnProfile[];
  table_statistics: TableStatistics;
  data_quality_metrics: DataQualityMetrics;
  patterns_detected: DetectedPattern[];
  anomalies: ProfilingAnomaly[];
  correlations: ColumnCorrelation[];
  recommendations: DataRecommendation[];
}

export interface ColumnProfile {
  column_name: string;
  data_type: string;
  inferred_data_type: string;
  is_nullable: boolean;
  null_count: number;
  null_percentage: number;
  unique_count: number;
  unique_percentage: number;
  min_value?: any;
  max_value?: any;
  mean_value?: number;
  median_value?: number;
  mode_value?: any;
  standard_deviation?: number;
  variance?: number;
  skewness?: number;
  kurtosis?: number;
  percentiles: Record<string, any>;
  value_distribution: ValueDistribution[];
  top_values: TopValue[];
  patterns: ColumnPattern[];
  quality_flags: QualityFlag[];
}

export interface ValueDistribution {
  value: any;
  count: number;
  percentage: number;
  frequency_rank: number;
}

export interface TopValue {
  value: any;
  count: number;
  percentage: number;
}

export interface ColumnPattern {
  pattern_type: PatternType;
  pattern: string;
  match_count: number;
  match_percentage: number;
  confidence_score: number;
  examples: string[];
}

export interface DetectedPattern {
  pattern_id: string;
  pattern_name: string;
  pattern_type: PatternType;
  pattern_expression: string;
  columns_matched: string[];
  confidence_score: number;
  sample_values: string[];
  business_meaning: string;
  recommendations: string[];
}

export interface ProfilingAnomaly {
  anomaly_id: string;
  anomaly_type: AnomalyType;
  severity: Severity;
  column_name?: string;
  description: string;
  affected_rows: number;
  confidence_score: number;
  detected_at: Date;
  sample_values: any[];
  recommended_actions: string[];
}

// 🔍 SEMANTIC SEARCH TYPES
export interface SemanticSearchConfiguration {
  embedding_model: string;
  similarity_threshold: number;
  max_results: number;
  include_synonyms: boolean;
  boost_recent_assets: boolean;
  boost_popular_assets: boolean;
  personalization_enabled: boolean;
  language: string;
  search_domains: SearchDomain[];
}

export interface SearchResult {
  asset_id: string;
  name: string;
  description?: string;
  asset_type: AssetType;
  relevance_score: number;
  similarity_score: number;
  popularity_score: number;
  quality_score: number;
  last_accessed: Date;
  match_highlights: MatchHighlight[];
  recommended_reason: string;
  tags: string[];
  business_glossary_terms: string[];
  stewards: string[];
}

export interface MatchHighlight {
  field: string;
  original_text: string;
  highlighted_text: string;
  match_type: MatchType;
}

export interface SearchFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  logical_operator?: LogicalOperator;
}

export interface SearchFacet {
  field: string;
  display_name: string;
  values: FacetValue[];
  facet_type: FacetType;
}

export interface FacetValue {
  value: string;
  display_name: string;
  count: number;
  selected: boolean;
}

export interface SearchSuggestion {
  suggestion: string;
  suggestion_type: SuggestionType;
  confidence_score: number;
  result_count: number;
}

// 🎯 CLASSIFICATION TYPES
export interface AutoClassificationResult {
  asset_id: string;
  classifications: ClassificationPrediction[];
  confidence_score: number;
  model_version: string;
  processing_time_ms: number;
  created_at: Date;
  validation_status: ValidationStatus;
  human_reviewed: boolean;
  feedback_provided: boolean;
}

export interface ClassificationPrediction {
  label: string;
  category: string;
  confidence_score: number;
  reasoning: string;
  evidence: ClassificationEvidence[];
  sensitivity_level: SensitivityLevel;
  compliance_tags: string[];
  business_context: string;
}

export interface ClassificationEvidence {
  evidence_type: EvidenceType;
  source: string;
  description: string;
  confidence_contribution: number;
  sample_data?: string[];
}

// 🏗️ SCHEMA ANALYSIS TYPES
export interface SchemaAnalysisResult {
  id: string;
  asset_id: string;
  analysis_date: Date;
  schema_complexity: SchemaComplexity;
  relationships: SchemaRelationship[];
  quality_assessment: SchemaQualityAssessment;
  recommendations: SchemaRecommendation[];
  evolution_history: SchemaEvolution[];
  business_significance: BusinessSignificance;
  technical_debt_indicators: TechnicalDebtIndicator[];
}

export interface SchemaComplexity {
  complexity_score: number;
  factors: ComplexityFactor[];
  table_count: number;
  column_count: number;
  relationship_count: number;
  constraint_count: number;
  index_count: number;
  nested_levels: number;
  circular_dependencies: boolean;
}

export interface SchemaRelationship {
  relationship_id: string;
  source_table: string;
  target_table: string;
  relationship_type: RelationshipType;
  cardinality: Cardinality;
  constraint_name: string;
  confidence_score: number;
  business_meaning: string;
}

export interface SchemaEvolution {
  version: string;
  change_date: Date;
  change_type: SchemaChangeType;
  changes: SchemaChange[];
  impact_assessment: ChangeImpactAssessment;
  backward_compatible: boolean;
  migration_required: boolean;
}

export interface SchemaChange {
  change_id: string;
  change_type: SchemaChangeType;
  object_name: string;
  object_type: SchemaObjectType;
  before_state: any;
  after_state: any;
  impact_level: ImpactLevel;
  breaking_change: boolean;
}

// 🎯 ENUMS
export enum DiscoveryType {
  FULL_SCAN = 'full_scan',
  INCREMENTAL = 'incremental',
  TARGETED = 'targeted',
  SCHEMA_ONLY = 'schema_only',
  METADATA_ONLY = 'metadata_only',
  LINEAGE_DISCOVERY = 'lineage_discovery'
}

export enum DiscoveryStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PARTIALLY_COMPLETED = 'partially_completed'
}

export enum ScanDepth {
  SHALLOW = 'shallow',
  MEDIUM = 'medium',
  DEEP = 'deep',
  COMPREHENSIVE = 'comprehensive'
}

export enum SamplingStrategy {
  RANDOM = 'random',
  SYSTEMATIC = 'systematic',
  STRATIFIED = 'stratified',
  TOP_N = 'top_n',
  BOTTOM_N = 'bottom_n',
  REPRESENTATIVE = 'representative'
}

export enum DiscoveryRuleType {
  INCLUSION = 'inclusion',
  EXCLUSION = 'exclusion',
  CLASSIFICATION = 'classification',
  TRANSFORMATION = 'transformation',
  VALIDATION = 'validation'
}

export enum ProfilingType {
  BASIC = 'basic',
  COMPREHENSIVE = 'comprehensive',
  STATISTICAL = 'statistical',
  QUALITY_FOCUSED = 'quality_focused',
  PERFORMANCE_OPTIMIZED = 'performance_optimized'
}

export enum ProfilingStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum SamplingMethod {
  RANDOM = 'random',
  SYSTEMATIC = 'systematic',
  STRATIFIED = 'stratified',
  HEAD = 'head',
  TAIL = 'tail'
}

export enum PatternType {
  EMAIL = 'email',
  PHONE = 'phone',
  SSN = 'ssn',
  CREDIT_CARD = 'credit_card',
  IP_ADDRESS = 'ip_address',
  URL = 'url',
  DATE = 'date',
  TIME = 'time',
  CURRENCY = 'currency',
  POSTAL_CODE = 'postal_code',
  CUSTOM = 'custom'
}

export enum AnomalyType {
  OUTLIER = 'outlier',
  NULL_SPIKE = 'null_spike',
  DATA_TYPE_MISMATCH = 'data_type_mismatch',
  UNUSUAL_PATTERN = 'unusual_pattern',
  CARDINALITY_CHANGE = 'cardinality_change',
  VALUE_DISTRIBUTION_SHIFT = 'value_distribution_shift'
}

export enum Severity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SearchDomain {
  ALL = 'all',
  TECHNICAL_METADATA = 'technical_metadata',
  BUSINESS_METADATA = 'business_metadata',
  CONTENT = 'content',
  USAGE = 'usage',
  LINEAGE = 'lineage'
}

export enum MatchType {
  EXACT = 'exact',
  PARTIAL = 'partial',
  SEMANTIC = 'semantic',
  FUZZY = 'fuzzy',
  SYNONYM = 'synonym'
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'not_in'
}

export enum LogicalOperator {
  AND = 'and',
  OR = 'or',
  NOT = 'not'
}

export enum FacetType {
  TERMS = 'terms',
  RANGE = 'range',
  DATE_RANGE = 'date_range',
  HISTOGRAM = 'histogram'
}

export enum SuggestionType {
  QUERY_COMPLETION = 'query_completion',
  SIMILAR_ASSETS = 'similar_assets',
  POPULAR_SEARCHES = 'popular_searches',
  SPELLING_CORRECTION = 'spelling_correction'
}

export enum EvidenceType {
  COLUMN_NAME = 'column_name',
  DATA_VALUES = 'data_values',
  DATA_PATTERNS = 'data_patterns',
  METADATA = 'metadata',
  USAGE_CONTEXT = 'usage_context',
  BUSINESS_RULES = 'business_rules'
}

export enum RelationshipType {
  ONE_TO_ONE = 'one_to_one',
  ONE_TO_MANY = 'one_to_many',
  MANY_TO_ONE = 'many_to_one',
  MANY_TO_MANY = 'many_to_many'
}

export enum Cardinality {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  IDENTIFYING = 'identifying',
  NON_IDENTIFYING = 'non_identifying'
}

export enum SchemaChangeType {
  TABLE_ADDED = 'table_added',
  TABLE_REMOVED = 'table_removed',
  TABLE_RENAMED = 'table_renamed',
  COLUMN_ADDED = 'column_added',
  COLUMN_REMOVED = 'column_removed',
  COLUMN_RENAMED = 'column_renamed',
  COLUMN_TYPE_CHANGED = 'column_type_changed',
  CONSTRAINT_ADDED = 'constraint_added',
  CONSTRAINT_REMOVED = 'constraint_removed',
  INDEX_ADDED = 'index_added',
  INDEX_REMOVED = 'index_removed'
}

export enum SchemaObjectType {
  TABLE = 'table',
  COLUMN = 'column',
  INDEX = 'index',
  CONSTRAINT = 'constraint',
  VIEW = 'view',
  PROCEDURE = 'procedure',
  FUNCTION = 'function'
}

export enum ImpactLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 🎯 SUPPORTING INTERFACES
export interface DiscoveryCondition {
  field: string;
  operator: string;
  value: any;
  case_sensitive: boolean;
}

export interface DiscoveryAction {
  action_type: string;
  parameters: Record<string, any>;
  execute_order: number;
}

export interface NotificationSettings {
  notify_on_completion: boolean;
  notify_on_errors: boolean;
  notification_channels: string[];
  recipients: string[];
}

export interface QualityAssessmentSummary {
  overall_score: number;
  dimension_scores: Record<string, number>;
  issues_found: number;
  critical_issues: number;
  recommendations_count: number;
}

export interface DiscoveryError {
  error_id: string;
  error_type: string;
  message: string;
  asset_path: string;
  timestamp: Date;
  severity: Severity;
  recoverable: boolean;
}

export interface CustomMetric {
  name: string;
  expression: string;
  data_type: string;
  description: string;
}

export interface TableStatistics {
  row_count: number;
  size_bytes: number;
  last_updated: Date;
  growth_rate: number;
  access_frequency: number;
  query_performance: QueryPerformance;
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  timeliness: number;
  overall_score: number;
}

export interface ColumnCorrelation {
  column1: string;
  column2: string;
  correlation_coefficient: number;
  correlation_type: CorrelationType;
  strength: CorrelationStrength;
  statistical_significance: number;
}

export interface DataRecommendation {
  recommendation_id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
  estimated_impact: ImpactLevel;
  implementation_effort: EffortLevel;
  affected_columns: string[];
}

export interface QualityFlag {
  flag_type: QualityFlagType;
  severity: Severity;
  description: string;
  affected_percentage: number;
  sample_values: any[];
}

export interface SchemaQualityAssessment {
  overall_score: number;
  naming_consistency: number;
  data_type_consistency: number;
  constraint_coverage: number;
  documentation_completeness: number;
  normalization_score: number;
  relationship_integrity: number;
}

export interface SchemaRecommendation {
  recommendation_id: string;
  type: SchemaRecommendationType;
  priority: Priority;
  description: string;
  impact_assessment: ImpactLevel;
  implementation_complexity: ComplexityLevel;
  estimated_effort: EffortLevel;
}

export interface BusinessSignificance {
  business_value_score: number;
  usage_frequency: number;
  stakeholder_count: number;
  business_processes: string[];
  compliance_requirements: string[];
  revenue_impact: RevenueImpact;
}

export interface TechnicalDebtIndicator {
  indicator_type: TechnicalDebtType;
  severity: Severity;
  description: string;
  remediation_effort: EffortLevel;
  business_impact: ImpactLevel;
  recommendations: string[];
}

export interface ComplexityFactor {
  factor_name: string;
  factor_value: number;
  weight: number;
  contribution_percentage: number;
}

export interface ChangeImpactAssessment {
  impact_scope: ImpactScope;
  affected_systems: string[];
  affected_users: string[];
  business_continuity_risk: RiskLevel;
  mitigation_strategies: string[];
  rollback_complexity: ComplexityLevel;
}

export interface QueryPerformance {
  avg_execution_time_ms: number;
  query_count_24h: number;
  slow_query_count: number;
  index_utilization: number;
  cache_hit_ratio: number;
}

// 🎯 ADDITIONAL ENUMS
export enum Priority {
  LOWEST = 'lowest',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  HIGHEST = 'highest',
  URGENT = 'urgent'
}

export enum RecommendationType {
  DATA_QUALITY = 'data_quality',
  PERFORMANCE = 'performance',
  SCHEMA_DESIGN = 'schema_design',
  GOVERNANCE = 'governance',
  COST_OPTIMIZATION = 'cost_optimization'
}

export enum EffortLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTENSIVE = 'extensive'
}

export enum QualityFlagType {
  HIGH_NULL_PERCENTAGE = 'high_null_percentage',
  LOW_CARDINALITY = 'low_cardinality',
  HIGH_CARDINALITY = 'high_cardinality',
  SUSPICIOUS_VALUES = 'suspicious_values',
  INCONSISTENT_FORMAT = 'inconsistent_format',
  POTENTIAL_PII = 'potential_pii'
}

export enum CorrelationType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NON_LINEAR = 'non_linear'
}

export enum CorrelationStrength {
  VERY_WEAK = 'very_weak',
  WEAK = 'weak',
  MODERATE = 'moderate',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong'
}

export enum SchemaRecommendationType {
  NAMING_CONVENTION = 'naming_convention',
  DATA_TYPE_OPTIMIZATION = 'data_type_optimization',
  INDEX_RECOMMENDATION = 'index_recommendation',
  CONSTRAINT_ADDITION = 'constraint_addition',
  NORMALIZATION = 'normalization',
  DENORMALIZATION = 'denormalization'
}

export enum ComplexityLevel {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  VERY_COMPLEX = 'very_complex'
}

export enum TechnicalDebtType {
  DEPRECATED_DATA_TYPES = 'deprecated_data_types',
  MISSING_CONSTRAINTS = 'missing_constraints',
  POOR_NAMING = 'poor_naming',
  REDUNDANT_DATA = 'redundant_data',
  PERFORMANCE_ISSUES = 'performance_issues'
}

export enum RevenueImpact {
  NONE = 'none',
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ImpactScope {
  ASSET_ONLY = 'asset_only',
  RELATED_ASSETS = 'related_assets',
  DATABASE = 'database',
  SYSTEM = 'system',
  ENTERPRISE = 'enterprise'
}

export enum RiskLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 🏷️ EXPORT TYPES
export type {
  DiscoveryJob,
  DiscoveryConfiguration,
  ProfilingJob,
  ProfilingResults,
  ColumnProfile,
  SearchResult,
  AutoClassificationResult,
  SchemaAnalysisResult
};