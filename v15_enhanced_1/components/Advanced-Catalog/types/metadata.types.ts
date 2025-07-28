/**
 * Advanced Metadata Management Types
 * Maps to: enterprise_catalog_service.py, data_profiling_service.py, enterprise_integration_service.py
 * 
 * Comprehensive types for metadata management, profiling, enrichment,
 * and governance with enterprise-grade capabilities.
 */

export interface MetadataManagementConfig {
  auto_profiling_enabled: boolean;
  enrichment_frequency: string;
  validation_rules: string[];
  quality_thresholds: Record<string, number>;
  compliance_frameworks: string[];
  retention_policies: RetentionPolicy[];
  backup_strategies: BackupStrategy[];
  audit_configurations: AuditConfig[];
}

export interface DataProfile {
  profile_id: string;
  asset_id: string;
  profiling_type: ProfilingType;
  profiling_timestamp: string;
  profiling_duration: number;
  data_sample_size: number;
  data_sample_percentage: number;
  total_records: number;
  total_columns: number;
  column_profiles: ColumnProfile[];
  statistical_summary: StatisticalSummary;
  data_patterns: DataPattern[];
  anomalies_detected: Anomaly[];
  quality_metrics: QualityMetrics;
  profiling_metadata: ProfilingMetadata;
}

export interface ColumnProfile {
  column_name: string;
  column_type: string;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  foreign_key_references?: ForeignKeyReference[];
  default_value?: any;
  column_constraints: string[];
  data_type_details: DataTypeDetails;
  statistical_profile: ColumnStatistics;
  pattern_analysis: PatternAnalysis;
  value_distribution: ValueDistribution;
  quality_assessment: ColumnQualityAssessment;
  semantic_analysis: SemanticAnalysis;
  business_context: BusinessContext;
}

export interface DataTypeDetails {
  base_type: string;
  precision?: number;
  scale?: number;
  max_length?: number;
  character_set?: string;
  collation?: string;
  timezone?: string;
  format_pattern?: string;
}

export interface ColumnStatistics {
  total_count: number;
  null_count: number;
  unique_count: number;
  distinct_count: number;
  duplicate_count: number;
  completeness: number;
  uniqueness: number;
  min_value?: any;
  max_value?: any;
  avg_value?: number;
  median_value?: number;
  mode_value?: any;
  standard_deviation?: number;
  variance?: number;
  percentiles: Record<string, any>;
  histogram: HistogramBin[];
}

export interface HistogramBin {
  bin_start: any;
  bin_end: any;
  frequency: number;
  percentage: number;
}

export interface PatternAnalysis {
  detected_patterns: DataPattern[];
  format_patterns: FormatPattern[];
  length_distribution: LengthDistribution;
  character_analysis: CharacterAnalysis;
  date_patterns?: DatePattern[];
  numeric_patterns?: NumericPattern[];
  text_patterns?: TextPattern[];
}

export interface DataPattern {
  pattern_id: string;
  pattern_type: PatternType;
  pattern_expression: string;
  pattern_description: string;
  match_count: number;
  match_percentage: number;
  confidence_score: number;
  examples: string[];
  violations: PatternViolation[];
}

export interface FormatPattern {
  format_type: string;
  format_expression: string;
  format_description: string;
  sample_values: string[];
  frequency: number;
  confidence: number;
}

export interface LengthDistribution {
  min_length: number;
  max_length: number;
  avg_length: number;
  median_length: number;
  length_histogram: HistogramBin[];
  common_lengths: Array<{ length: number; frequency: number }>;
}

export interface CharacterAnalysis {
  character_set_analysis: CharacterSetAnalysis;
  case_analysis: CaseAnalysis;
  special_characters: SpecialCharacterAnalysis;
  unicode_analysis?: UnicodeAnalysis;
}

export interface CharacterSetAnalysis {
  alphabetic_percentage: number;
  numeric_percentage: number;
  alphanumeric_percentage: number;
  special_character_percentage: number;
  whitespace_percentage: number;
  punctuation_percentage: number;
}

export interface CaseAnalysis {
  uppercase_percentage: number;
  lowercase_percentage: number;
  mixed_case_percentage: number;
  title_case_percentage: number;
  case_pattern_consistency: number;
}

export interface SpecialCharacterAnalysis {
  common_special_chars: Array<{ char: string; frequency: number }>;
  delimiter_analysis: DelimiterAnalysis;
  encoding_issues: EncodingIssue[];
}

export interface DelimiterAnalysis {
  potential_delimiters: Array<{ delimiter: string; confidence: number }>;
  delimiter_consistency: number;
  field_count_distribution: HistogramBin[];
}

export interface UnicodeAnalysis {
  unicode_categories: Record<string, number>;
  script_analysis: Record<string, number>;
  normalization_issues: string[];
}

export interface DatePattern {
  date_format: string;
  date_format_confidence: number;
  date_range: DateRange;
  timezone_analysis: TimezoneAnalysis;
  date_completeness: number;
  date_validity: number;
}

export interface DateRange {
  earliest_date: string;
  latest_date: string;
  date_span_days: number;
  date_distribution: HistogramBin[];
}

export interface TimezoneAnalysis {
  timezone_detected: string;
  timezone_confidence: number;
  timezone_consistency: number;
  timezone_issues: string[];
}

export interface NumericPattern {
  numeric_format: string;
  decimal_places: number;
  number_range: NumberRange;
  distribution_type: DistributionType;
  outliers: OutlierAnalysis;
  rounding_patterns: RoundingPattern[];
}

export interface NumberRange {
  min_value: number;
  max_value: number;
  range: number;
  negative_percentage: number;
  zero_percentage: number;
  positive_percentage: number;
}

export interface OutlierAnalysis {
  outlier_count: number;
  outlier_percentage: number;
  outlier_values: number[];
  outlier_detection_method: string;
  outlier_threshold: number;
}

export interface RoundingPattern {
  rounding_base: number;
  rounded_percentage: number;
  confidence: number;
}

export interface TextPattern {
  language_detection: LanguageDetection;
  text_classification: TextClassification;
  named_entities: NamedEntity[];
  sentiment_analysis?: SentimentAnalysis;
  topic_analysis?: TopicAnalysis;
}

export interface LanguageDetection {
  detected_language: string;
  confidence: number;
  alternative_languages: Array<{ language: string; confidence: number }>;
}

export interface TextClassification {
  classification_type: string;
  classifications: Array<{ category: string; confidence: number }>;
  classification_model: string;
}

export interface NamedEntity {
  entity_text: string;
  entity_type: string;
  confidence: number;
  context: string;
  frequency: number;
}

export interface SentimentAnalysis {
  overall_sentiment: string;
  sentiment_score: number;
  sentiment_distribution: Record<string, number>;
  emotional_indicators: string[];
}

export interface TopicAnalysis {
  detected_topics: Array<{ topic: string; confidence: number }>;
  topic_model: string;
  topic_keywords: string[];
}

export interface ValueDistribution {
  value_frequency: Array<{ value: any; frequency: number; percentage: number }>;
  top_values: Array<{ value: any; frequency: number }>;
  rare_values: Array<{ value: any; frequency: number }>;
  value_entropy: number;
  cardinality_ratio: number;
  distribution_shape: DistributionShape;
}

export interface DistributionShape {
  shape_type: DistributionType;
  skewness: number;
  kurtosis: number;
  modality: string;
  symmetry_score: number;
}

export interface ColumnQualityAssessment {
  overall_quality_score: number;
  quality_dimensions: QualityDimensionScore[];
  quality_issues: QualityIssue[];
  quality_recommendations: QualityRecommendation[];
  data_governance_score: number;
}

export interface QualityDimensionScore {
  dimension: string;
  score: number;
  weight: number;
  weighted_score: number;
  assessment_details: string;
}

export interface QualityIssue {
  issue_id: string;
  issue_type: QualityIssueType;
  issue_severity: Severity;
  issue_description: string;
  affected_records: number;
  affected_percentage: number;
  examples: any[];
  recommendations: string[];
  auto_fixable: boolean;
}

export interface QualityRecommendation {
  recommendation_id: string;
  recommendation_type: string;
  priority: Priority;
  description: string;
  implementation_effort: EffortLevel;
  expected_improvement: number;
  implementation_steps: string[];
  cost_estimate?: number;
}

export interface SemanticAnalysis {
  semantic_type: string;
  semantic_confidence: number;
  business_meaning: string;
  domain_context: string;
  conceptual_relationships: ConceptualRelationship[];
  ontology_mappings: OntologyMapping[];
  semantic_tags: string[];
}

export interface ConceptualRelationship {
  relationship_type: string;
  related_concept: string;
  relationship_strength: number;
  context: string;
}

export interface OntologyMapping {
  ontology_name: string;
  mapped_concept: string;
  mapping_confidence: number;
  mapping_rationale: string;
}

export interface BusinessContext {
  business_domain: string;
  business_purpose: string;
  business_rules: BusinessRule[];
  stakeholders: Stakeholder[];
  compliance_requirements: ComplianceRequirement[];
  privacy_classifications: PrivacyClassification[];
}

export interface BusinessRule {
  rule_id: string;
  rule_name: string;
  rule_description: string;
  rule_type: string;
  rule_expression: string;
  business_impact: string;
  enforcement_level: EnforcementLevel;
}

export interface Stakeholder {
  stakeholder_type: string;
  stakeholder_name: string;
  role: string;
  responsibilities: string[];
  contact_information?: ContactInformation;
}

export interface ContactInformation {
  email?: string;
  phone?: string;
  department?: string;
  location?: string;
}

export interface ComplianceRequirement {
  regulation: string;
  requirement_description: string;
  compliance_level: ComplianceLevel;
  audit_frequency: string;
  documentation_required: boolean;
}

export interface PrivacyClassification {
  classification_type: string;
  sensitivity_level: SensitivityLevel;
  data_subject_rights: string[];
  retention_requirements: RetentionRequirement;
  consent_requirements?: ConsentRequirement;
}

export interface RetentionRequirement {
  retention_period: string;
  retention_rationale: string;
  disposal_method: string;
  archive_requirements?: string;
}

export interface ConsentRequirement {
  consent_type: string;
  consent_purpose: string;
  consent_duration: string;
  withdrawal_mechanism: string;
}

export interface StatisticalSummary {
  dataset_statistics: DatasetStatistics;
  column_statistics_summary: ColumnStatisticsSummary;
  data_relationships: DataRelationship[];
  correlation_analysis: CorrelationAnalysis;
  dependency_analysis: DependencyAnalysis;
}

export interface DatasetStatistics {
  total_size_bytes: number;
  row_count: number;
  column_count: number;
  null_cell_count: number;
  null_cell_percentage: number;
  duplicate_row_count: number;
  duplicate_row_percentage: number;
  data_density: number;
  schema_complexity_score: number;
}

export interface ColumnStatisticsSummary {
  numeric_columns: number;
  text_columns: number;
  date_columns: number;
  boolean_columns: number;
  categorical_columns: number;
  key_columns: number;
  nullable_columns: number;
  avg_column_completeness: number;
}

export interface DataRelationship {
  relationship_id: string;
  relationship_type: RelationshipType;
  source_column: string;
  target_column: string;
  relationship_strength: number;
  statistical_significance: number;
  relationship_description: string;
}

export interface CorrelationAnalysis {
  correlation_matrix: CorrelationMatrix;
  strong_correlations: StrongCorrelation[];
  correlation_insights: string[];
}

export interface CorrelationMatrix {
  columns: string[];
  matrix: number[][];
  method: string;
}

export interface StrongCorrelation {
  column1: string;
  column2: string;
  correlation_coefficient: number;
  correlation_type: CorrelationType;
  statistical_significance: number;
}

export interface DependencyAnalysis {
  functional_dependencies: FunctionalDependency[];
  inclusion_dependencies: InclusionDependency[];
  uniqueness_constraints: UniquenessConstraint[];
  dependency_insights: string[];
}

export interface FunctionalDependency {
  determinant_columns: string[];
  dependent_columns: string[];
  confidence: number;
  support: number;
  dependency_strength: number;
}

export interface InclusionDependency {
  source_columns: string[];
  target_columns: string[];
  inclusion_percentage: number;
  confidence: number;
}

export interface UniquenessConstraint {
  columns: string[];
  uniqueness_percentage: number;
  violation_count: number;
  constraint_confidence: number;
}

export interface Anomaly {
  anomaly_id: string;
  anomaly_type: AnomalyType;
  anomaly_severity: Severity;
  anomaly_description: string;
  affected_column?: string;
  affected_records: number;
  anomaly_score: number;
  detection_method: string;
  detection_timestamp: string;
  examples: AnomalyExample[];
  remediation_suggestions: string[];
}

export interface AnomalyExample {
  record_id?: string;
  anomalous_value: any;
  expected_value?: any;
  deviation_score: number;
  context: Record<string, any>;
}

export interface ProfilingMetadata {
  profiling_version: string;
  profiling_engine: string;
  configuration_used: Record<string, any>;
  resource_usage: ResourceUsage;
  quality_checks_performed: string[];
  limitations: string[];
  recommendations: string[];
}

export interface ResourceUsage {
  cpu_time_seconds: number;
  memory_peak_mb: number;
  io_read_mb: number;
  io_write_mb: number;
  network_transfer_mb?: number;
}

export interface MetadataEnrichment {
  enrichment_id: string;
  asset_id: string;
  enrichment_type: EnrichmentType;
  enrichment_source: EnrichmentSource;
  enrichment_timestamp: string;
  enrichment_data: Record<string, any>;
  confidence_score: number;
  validation_status: ValidationStatus;
  enrichment_metadata: EnrichmentMetadata;
}

export interface EnrichmentMetadata {
  enrichment_algorithm: string;
  algorithm_version: string;
  processing_time: number;
  data_sources_used: string[];
  quality_indicators: Record<string, number>;
  limitations: string[];
}

// ===================== ENUMS =====================

export enum ProfilingType {
  FULL = 'full',
  STATISTICAL = 'statistical',
  PATTERN = 'pattern',
  QUALITY = 'quality',
  SEMANTIC = 'semantic',
  CUSTOM = 'custom'
}

export enum PatternType {
  FORMAT = 'format',
  LENGTH = 'length',
  RANGE = 'range',
  ENUMERATION = 'enumeration',
  REGEX = 'regex',
  SEMANTIC = 'semantic'
}

export enum DistributionType {
  UNIFORM = 'uniform',
  NORMAL = 'normal',
  SKEWED = 'skewed',
  BIMODAL = 'bimodal',
  MULTIMODAL = 'multimodal',
  POWER_LAW = 'power_law',
  EXPONENTIAL = 'exponential',
  UNKNOWN = 'unknown'
}

export enum QualityIssueType {
  MISSING_VALUES = 'missing_values',
  INVALID_FORMAT = 'invalid_format',
  OUT_OF_RANGE = 'out_of_range',
  INCONSISTENT_FORMAT = 'inconsistent_format',
  DUPLICATE_VALUES = 'duplicate_values',
  REFERENTIAL_INTEGRITY = 'referential_integrity',
  BUSINESS_RULE_VIOLATION = 'business_rule_violation',
  DATA_TYPE_MISMATCH = 'data_type_mismatch'
}

export enum EnforcementLevel {
  MANDATORY = 'mandatory',
  RECOMMENDED = 'recommended',
  OPTIONAL = 'optional',
  DEPRECATED = 'deprecated'
}

export enum ComplianceLevel {
  FULL_COMPLIANCE = 'full_compliance',
  PARTIAL_COMPLIANCE = 'partial_compliance',
  NON_COMPLIANT = 'non_compliant',
  NOT_APPLICABLE = 'not_applicable'
}

export enum SensitivityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret'
}

export enum RelationshipType {
  FOREIGN_KEY = 'foreign_key',
  CORRELATION = 'correlation',
  FUNCTIONAL_DEPENDENCY = 'functional_dependency',
  INCLUSION_DEPENDENCY = 'inclusion_dependency',
  SEMANTIC_RELATIONSHIP = 'semantic_relationship'
}

export enum CorrelationType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NON_LINEAR = 'non_linear'
}

export enum AnomalyType {
  STATISTICAL_OUTLIER = 'statistical_outlier',
  PATTERN_DEVIATION = 'pattern_deviation',
  FORMAT_ANOMALY = 'format_anomaly',
  TEMPORAL_ANOMALY = 'temporal_anomaly',
  CONTEXTUAL_ANOMALY = 'contextual_anomaly',
  COLLECTIVE_ANOMALY = 'collective_anomaly'
}

export enum EnrichmentType {
  SEMANTIC_TAGGING = 'semantic_tagging',
  BUSINESS_CONTEXT = 'business_context',
  QUALITY_ASSESSMENT = 'quality_assessment',
  RELATIONSHIP_DISCOVERY = 'relationship_discovery',
  CLASSIFICATION = 'classification',
  LINEAGE_INFERENCE = 'lineage_inference'
}

export enum EnrichmentSource {
  AI_MODEL = 'ai_model',
  EXTERNAL_API = 'external_api',
  KNOWLEDGE_BASE = 'knowledge_base',
  USER_INPUT = 'user_input',
  AUTOMATED_ANALYSIS = 'automated_analysis',
  THIRD_PARTY_SERVICE = 'third_party_service'
}

export enum ValidationStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  NEEDS_REVIEW = 'needs_review'
}

export enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum Priority {
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum EffortLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTENSIVE = 'extensive'
}

// ===================== SUPPORTING TYPES =====================

export interface ForeignKeyReference {
  referenced_table: string;
  referenced_column: string;
  constraint_name: string;
  on_delete_action: string;
  on_update_action: string;
}

export interface PatternViolation {
  violation_value: any;
  violation_reason: string;
  suggested_correction?: any;
}

export interface EncodingIssue {
  issue_type: string;
  affected_values: string[];
  suggested_encoding: string;
}

export interface RetentionPolicy {
  policy_name: string;
  retention_period: string;
  data_types: string[];
  legal_basis: string;
  disposal_method: string;
}

export interface BackupStrategy {
  strategy_name: string;
  backup_frequency: string;
  retention_period: string;
  backup_scope: string[];
  encryption_required: boolean;
}

export interface AuditConfig {
  audit_type: string;
  audit_frequency: string;
  audit_scope: string[];
  compliance_frameworks: string[];
  reporting_requirements: string[];
}

// Import core types for integration
import type { IntelligentDataAsset } from './catalog-core.types';