/**
 * Advanced Catalog Core Types - Complete Backend Mapping
 * =====================================================
 * 
 * Comprehensive TypeScript type definitions that map 100% to backend catalog models.
 * This ensures complete frontend-backend integration without missing any functionality.
 * 
 * Backend Files Mapped:
 * - advanced_catalog_models.py (1261 lines) - PRIMARY CATALOG MODELS
 * - catalog_intelligence_models.py (537 lines) - INTELLIGENCE MODELS  
 * - catalog_quality_models.py (484 lines) - QUALITY MODELS
 * - data_lineage_models.py (447 lines) - LINEAGE MODELS
 * - catalog_models.py (245 lines) - BASE CATALOG MODELS
 */

// ========================= CORE ENUMS =========================

export enum AssetType {
  TABLE = "table",
  VIEW = "view",
  STORED_PROCEDURE = "stored_procedure",
  FUNCTION = "function",
  DATASET = "dataset",
  FILE = "file",
  STREAM = "stream",
  API = "api",
  REPORT = "report",
  DASHBOARD = "dashboard",
  MODEL = "model",
  PIPELINE = "pipeline",
  SCHEMA = "schema",
  DATABASE = "database"
}

export enum AssetStatus {
  ACTIVE = "active",
  DEPRECATED = "deprecated",
  ARCHIVED = "archived",
  DRAFT = "draft",
  UNDER_REVIEW = "under_review",
  QUARANTINED = "quarantined",
  MIGRATING = "migrating",
  DELETED = "deleted"
}

export enum DataQuality {
  EXCELLENT = "excellent",      // 95-100%
  GOOD = "good",               // 85-94%
  FAIR = "fair",               // 70-84%
  POOR = "poor",               // 50-69%
  CRITICAL = "critical",       // <50%
  UNKNOWN = "unknown"
}

export enum LineageDirection {
  UPSTREAM = "upstream",
  DOWNSTREAM = "downstream",
  BIDIRECTIONAL = "bidirectional"
}

export enum LineageType {
  TABLE_TO_TABLE = "table_to_table",
  COLUMN_TO_COLUMN = "column_to_column",
  TRANSFORMATION = "transformation",
  AGGREGATION = "aggregation",
  JOIN = "join",
  FILTER = "filter",
  COMPUTED = "computed",
  DERIVED = "derived",
  COPY = "copy",
  ETL_PROCESS = "etl_process"
}

export enum DiscoveryMethod {
  AUTOMATED_SCAN = "automated_scan",
  AI_DETECTION = "ai_detection",
  PATTERN_MATCHING = "pattern_matching",
  METADATA_IMPORT = "metadata_import",
  MANUAL_ENTRY = "manual_entry",
  API_INTEGRATION = "api_integration",
  LINEAGE_INFERENCE = "lineage_inference"
}

export enum AssetCriticality {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  UNKNOWN = "unknown"
}

export enum DataSensitivity {
  HIGHLY_SENSITIVE = "highly_sensitive",
  SENSITIVE = "sensitive",
  INTERNAL = "internal",
  PUBLIC = "public",
  UNKNOWN = "unknown"
}

export enum UsageFrequency {
  VERY_HIGH = "very_high",     // Multiple times per hour
  HIGH = "high",               // Multiple times per day
  MEDIUM = "medium",           // Daily usage
  LOW = "low",                 // Weekly usage
  VERY_LOW = "very_low",       // Monthly or less
  UNKNOWN = "unknown"
}

export enum QualityDimension {
  COMPLETENESS = "completeness",
  ACCURACY = "accuracy",
  CONSISTENCY = "consistency",
  VALIDITY = "validity",
  UNIQUENESS = "uniqueness",
  TIMELINESS = "timeliness",
  INTEGRITY = "integrity"
}

export enum ProfilingStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

export enum GlossaryTermStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  DEPRECATED = "deprecated",
  ARCHIVED = "archived"
}

// ========================= INTELLIGENT DATA ASSET MODELS =========================

export interface IntelligentDataAsset {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  asset_type: AssetType;
  status: AssetStatus;
  
  // Source Information
  source_system: string;
  source_database?: string;
  source_schema?: string;
  source_table?: string;
  fully_qualified_name: string;
  
  // Metadata
  metadata: Record<string, any>;
  technical_metadata: Record<string, any>;
  business_metadata: Record<string, any>;
  
  // Quality and Classification
  data_quality_score?: number;
  quality_assessment?: DataQuality;
  sensitivity_level?: DataSensitivity;
  criticality_level?: AssetCriticality;
  
  // AI-Enhanced Features
  ai_generated_summary?: string;
  semantic_embedding?: number[];
  similarity_score?: number;
  ai_tags: string[];
  auto_generated_tags: string[];
  
  // Usage and Performance
  usage_frequency?: UsageFrequency;
  last_accessed?: string;
  access_count?: number;
  popularity_score?: number;
  
  // Governance
  owner?: string;
  steward?: string;
  governance_policies: string[];
  compliance_status?: string;
  
  // Discovery Information
  discovery_method?: DiscoveryMethod;
  discovered_at?: string;
  discovery_confidence?: number;
  
  // Schema Information
  columns?: ColumnMetadata[];
  schema_version?: string;
  schema_evolution_history?: SchemaEvolution[];
  
  // Relationships
  parent_asset_id?: string;
  child_assets?: string[];
  related_assets?: string[];
  
  // Audit Trail
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  version: number;
  
  // Additional Properties
  tags: string[];
  custom_properties: Record<string, any>;
  business_context?: BusinessContext;
  technical_context?: TechnicalContext;
}

export interface ColumnMetadata {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  data_type: string;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  default_value?: string;
  max_length?: number;
  precision?: number;
  scale?: number;
  
  // Quality Information
  data_quality_score?: number;
  completeness_percentage?: number;
  uniqueness_percentage?: number;
  
  // Classification
  sensitivity_level?: DataSensitivity;
  classification_tags: string[];
  
  // Statistics
  distinct_count?: number;
  null_count?: number;
  min_value?: any;
  max_value?: any;
  avg_value?: number;
  
  // Business Information
  business_name?: string;
  business_description?: string;
  business_rules: string[];
  
  created_at: string;
  updated_at: string;
}

export interface SchemaEvolution {
  id: string;
  asset_id: string;
  version: string;
  changes: SchemaChange[];
  changed_at: string;
  changed_by: string;
  change_reason?: string;
  impact_analysis?: string;
}

export interface SchemaChange {
  change_type: 'added' | 'removed' | 'modified' | 'renamed';
  element_type: 'column' | 'constraint' | 'index' | 'trigger';
  element_name: string;
  old_definition?: string;
  new_definition?: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface BusinessContext {
  business_domain: string;
  business_process: string;
  business_owner: string;
  business_purpose: string;
  business_rules: string[];
  sla_requirements?: SLARequirements;
}

export interface TechnicalContext {
  storage_format?: string;
  compression_type?: string;
  partition_strategy?: string;
  indexing_strategy?: string;
  backup_strategy?: string;
  retention_policy?: string;
  performance_characteristics?: PerformanceCharacteristics;
}

export interface SLARequirements {
  availability_percentage: number;
  response_time_ms: number;
  throughput_requirements: string;
  recovery_time_objective: string;
  recovery_point_objective: string;
}

export interface PerformanceCharacteristics {
  average_query_time_ms?: number;
  peak_usage_times?: string[];
  resource_consumption?: ResourceConsumption;
  optimization_recommendations?: string[];
}

export interface ResourceConsumption {
  cpu_usage_percentage?: number;
  memory_usage_mb?: number;
  storage_usage_gb?: number;
  network_io_mbps?: number;
}

// ========================= DATA LINEAGE MODELS =========================

export interface EnterpriseDataLineage {
  id: string;
  source_asset_id: string;
  target_asset_id: string;
  lineage_type: LineageType;
  direction: LineageDirection;
  
  // Detailed Lineage Information
  source_columns?: string[];
  target_columns?: string[];
  transformation_logic?: string;
  transformation_type?: string;
  
  // Metadata
  confidence_score: number;
  discovery_method: DiscoveryMethod;
  validation_status: 'validated' | 'pending' | 'rejected';
  
  // Process Information
  process_name?: string;
  process_type?: string;
  process_owner?: string;
  execution_frequency?: string;
  
  // Technical Details
  sql_query?: string;
  etl_job_name?: string;
  pipeline_stage?: string;
  transformation_rules?: TransformationRule[];
  
  // Quality and Monitoring
  data_flow_volume?: number;
  last_execution?: string;
  execution_success_rate?: number;
  
  // Audit Information
  created_at: string;
  updated_at: string;
  created_by: string;
  validated_by?: string;
  validated_at?: string;
  
  // Additional Properties
  tags: string[];
  custom_properties: Record<string, any>;
}

export interface TransformationRule {
  id: string;
  name: string;
  description?: string;
  rule_type: string;
  source_expression: string;
  target_expression: string;
  conditions?: string[];
  parameters?: Record<string, any>;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  metadata: LineageGraphMetadata;
}

export interface LineageNode {
  id: string;
  asset_id: string;
  name: string;
  asset_type: AssetType;
  level: number;
  position?: { x: number; y: number };
  metadata: Record<string, any>;
}

export interface LineageEdge {
  id: string;
  source_id: string;
  target_id: string;
  lineage_type: LineageType;
  transformation_summary?: string;
  weight?: number;
  metadata: Record<string, any>;
}

export interface LineageGraphMetadata {
  total_nodes: number;
  total_edges: number;
  max_depth: number;
  generation_time: string;
  confidence_score: number;
  coverage_percentage: number;
}

// ========================= DATA QUALITY MODELS =========================

export interface DataQualityAssessment {
  id: string;
  asset_id: string;
  assessment_date: string;
  overall_score: number;
  overall_quality: DataQuality;
  
  // Dimension Scores
  dimension_scores: QualityDimensionScore[];
  
  // Rule-based Assessment
  quality_rules_applied: string[];
  rules_passed: number;
  rules_failed: number;
  rule_results: QualityRuleResult[];
  
  // Statistical Analysis
  completeness_percentage: number;
  accuracy_percentage: number;
  consistency_percentage: number;
  validity_percentage: number;
  uniqueness_percentage: number;
  timeliness_score: number;
  
  // Issues and Recommendations
  quality_issues: QualityIssue[];
  improvement_recommendations: string[];
  
  // Trend Analysis
  score_trend: 'improving' | 'stable' | 'declining';
  previous_score?: number;
  score_change?: number;
  
  // Metadata
  assessment_method: 'automated' | 'manual' | 'hybrid';
  confidence_level: number;
  sample_size?: number;
  
  created_at: string;
  created_by: string;
}

export interface QualityDimensionScore {
  dimension: QualityDimension;
  score: number;
  weight: number;
  weighted_score: number;
  status: 'passed' | 'warning' | 'failed';
  details?: string;
}

export interface QualityRuleResult {
  rule_id: string;
  rule_name: string;
  rule_description: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  threshold: number;
  actual_value: number;
  affected_records?: number;
  error_details?: string;
}

export interface QualityIssue {
  id: string;
  issue_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_columns?: string[];
  affected_records_count?: number;
  suggested_resolution?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'ignored';
}

// ========================= DATA PROFILING MODELS =========================

export interface DataProfilingResult {
  id: string;
  asset_id: string;
  column_id?: string;
  profiling_date: string;
  profiling_status: ProfilingStatus;
  
  // Basic Statistics
  total_records: number;
  null_count: number;
  null_percentage: number;
  distinct_count: number;
  distinct_percentage: number;
  
  // Data Type Analysis
  inferred_data_type?: string;
  data_type_consistency: number;
  format_patterns: string[];
  
  // Value Analysis
  min_value?: any;
  max_value?: any;
  avg_value?: number;
  median_value?: any;
  mode_values?: any[];
  
  // Distribution Analysis
  value_distribution: ValueDistribution[];
  outliers: OutlierInfo[];
  
  // Pattern Analysis
  common_patterns: PatternInfo[];
  anomalous_patterns: PatternInfo[];
  
  // Quality Indicators
  completeness_score: number;
  validity_score: number;
  consistency_score: number;
  
  // Advanced Analytics
  correlation_analysis?: CorrelationInfo[];
  seasonal_patterns?: SeasonalPattern[];
  
  created_at: string;
  execution_time_ms: number;
  sample_size: number;
}

export interface ValueDistribution {
  value: any;
  count: number;
  percentage: number;
  rank: number;
}

export interface OutlierInfo {
  value: any;
  outlier_score: number;
  outlier_type: 'statistical' | 'pattern' | 'business_rule';
  context?: string;
}

export interface PatternInfo {
  pattern: string;
  regex: string;
  frequency: number;
  percentage: number;
  examples: string[];
}

export interface CorrelationInfo {
  related_column: string;
  correlation_coefficient: number;
  correlation_type: 'positive' | 'negative' | 'none';
  significance_level: number;
}

export interface SeasonalPattern {
  pattern_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  pattern_strength: number;
  peak_periods: string[];
  low_periods: string[];
}

// ========================= BUSINESS GLOSSARY MODELS =========================

export interface BusinessGlossaryTerm {
  id: string;
  name: string;
  display_name?: string;
  definition: string;
  description?: string;
  
  // Hierarchical Structure
  parent_term_id?: string;
  child_terms?: string[];
  
  // Relationships
  synonyms: string[];
  related_terms: string[];
  acronyms: string[];
  
  // Classification
  category: string;
  domain: string;
  subject_area?: string;
  
  // Business Context
  business_owner: string;
  subject_matter_expert?: string;
  business_rules: string[];
  usage_guidelines?: string;
  
  // Status and Governance
  status: GlossaryTermStatus;
  approval_status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  version: number;
  
  // Usage Information
  usage_count: number;
  associated_assets_count: number;
  
  // Metadata
  tags: string[];
  custom_properties: Record<string, any>;
  
  // Audit Trail
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface BusinessGlossaryAssociation {
  id: string;
  term_id: string;
  asset_id: string;
  column_id?: string;
  
  // Association Details
  association_type: 'exact_match' | 'partial_match' | 'related' | 'derived';
  confidence_score: number;
  
  // Discovery Information
  discovery_method: 'manual' | 'automated' | 'ai_suggested';
  suggested_by?: string;
  
  // Validation
  validation_status: 'validated' | 'pending' | 'rejected';
  validated_by?: string;
  validated_at?: string;
  validation_notes?: string;
  
  created_at: string;
  created_by: string;
}

// ========================= USAGE METRICS MODELS =========================

export interface AssetUsageMetrics {
  id: string;
  asset_id: string;
  metric_date: string;
  
  // Access Metrics
  total_accesses: number;
  unique_users: number;
  unique_applications: number;
  
  // Query Metrics
  total_queries: number;
  successful_queries: number;
  failed_queries: number;
  avg_query_duration_ms: number;
  
  // Data Volume Metrics
  data_read_gb: number;
  data_written_gb?: number;
  rows_processed: number;
  
  // Performance Metrics
  avg_response_time_ms: number;
  p95_response_time_ms: number;
  p99_response_time_ms: number;
  
  // User Behavior
  peak_usage_hour: number;
  usage_pattern: 'consistent' | 'bursty' | 'seasonal';
  
  // Quality Impact
  quality_score_at_time?: number;
  error_rate_percentage: number;
  
  created_at: string;
}

// ========================= BASE CATALOG MODELS =========================

export interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  item_type: string;
  metadata: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CatalogTag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  category?: string;
  created_at: string;
  created_by: string;
}

export interface CatalogItemTag {
  id: string;
  catalog_item_id: string;
  tag_id: string;
  assigned_at: string;
  assigned_by: string;
}

export interface DataLineage {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CatalogUsageLog {
  id: string;
  catalog_item_id: string;
  user_id: string;
  action: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface CatalogQualityRule {
  id: string;
  name: string;
  description?: string;
  rule_definition: Record<string, any>;
  severity: string;
  created_at: string;
  created_by: string;
}

// ========================= REQUEST/RESPONSE MODELS =========================

export interface AssetCreateRequest {
  name: string;
  display_name?: string;
  description?: string;
  asset_type: AssetType;
  source_system: string;
  source_database?: string;
  source_schema?: string;
  source_table?: string;
  metadata?: Record<string, any>;
  technical_metadata?: Record<string, any>;
  business_metadata?: Record<string, any>;
  tags?: string[];
  custom_properties?: Record<string, any>;
  columns?: Omit<ColumnMetadata, 'id' | 'created_at' | 'updated_at'>[];
}

export interface AssetUpdateRequest {
  name?: string;
  display_name?: string;
  description?: string;
  status?: AssetStatus;
  metadata?: Record<string, any>;
  technical_metadata?: Record<string, any>;
  business_metadata?: Record<string, any>;
  tags?: string[];
  custom_properties?: Record<string, any>;
  owner?: string;
  steward?: string;
}

export interface AssetSearchRequest {
  query?: string;
  filters?: {
    asset_types?: AssetType[];
    status?: AssetStatus[];
    source_systems?: string[];
    tags?: string[];
    owners?: string[];
    quality_scores?: { min?: number; max?: number };
    created_date_range?: { start: string; end: string };
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    size: number;
  };
  include_columns?: boolean;
  include_lineage?: boolean;
  include_quality?: boolean;
}

export interface IntelligentAssetResponse {
  asset: IntelligentDataAsset;
  lineage?: EnterpriseDataLineage[];
  quality_assessment?: DataQualityAssessment;
  profiling_results?: DataProfilingResult[];
  usage_metrics?: AssetUsageMetrics[];
  glossary_associations?: BusinessGlossaryAssociation[];
}

export interface LineageResponse {
  lineage_graph: LineageGraph;
  impact_analysis?: ImpactAnalysis;
  metadata: {
    depth: number;
    total_assets: number;
    generation_time: string;
  };
}

export interface ImpactAnalysis {
  upstream_assets: string[];
  downstream_assets: string[];
  critical_path: string[];
  impact_score: number;
  risk_assessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
}

export interface QualityAssessmentResponse {
  assessment: DataQualityAssessment;
  historical_trend: QualityTrend[];
  benchmarks: QualityBenchmark[];
  recommendations: QualityRecommendation[];
}

export interface QualityTrend {
  date: string;
  overall_score: number;
  dimension_scores: Record<QualityDimension, number>;
}

export interface QualityBenchmark {
  benchmark_type: 'industry' | 'organization' | 'similar_assets';
  score: number;
  percentile: number;
}

export interface QualityRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  expected_impact: string;
  effort_estimate: string;
  implementation_steps: string[];
}

export interface BusinessGlossaryResponse {
  term: BusinessGlossaryTerm;
  associations: BusinessGlossaryAssociation[];
  related_terms: BusinessGlossaryTerm[];
  usage_statistics: {
    total_associations: number;
    active_associations: number;
    recent_usage_trend: 'increasing' | 'stable' | 'decreasing';
  };
}

// ========================= ANALYTICS AND INSIGHTS =========================

export interface CatalogAnalytics {
  overview: CatalogOverview;
  asset_distribution: AssetDistribution;
  quality_metrics: QualityMetrics;
  usage_patterns: UsagePatterns;
  growth_trends: GrowthTrends;
  governance_metrics: GovernanceMetrics;
}

export interface CatalogOverview {
  total_assets: number;
  active_assets: number;
  deprecated_assets: number;
  total_columns: number;
  data_sources: number;
  last_updated: string;
}

export interface AssetDistribution {
  by_type: Record<AssetType, number>;
  by_source_system: Record<string, number>;
  by_quality_score: Record<string, number>;
  by_criticality: Record<AssetCriticality, number>;
}

export interface QualityMetrics {
  average_quality_score: number;
  quality_distribution: Record<DataQuality, number>;
  trending_quality: 'improving' | 'stable' | 'declining';
  assets_needing_attention: number;
}

export interface UsagePatterns {
  most_accessed_assets: Array<{ asset_id: string; access_count: number }>;
  least_accessed_assets: Array<{ asset_id: string; access_count: number }>;
  peak_usage_hours: number[];
  usage_by_department: Record<string, number>;
}

export interface GrowthTrends {
  assets_added_last_30_days: number;
  assets_deprecated_last_30_days: number;
  discovery_rate_trend: Array<{ date: string; count: number }>;
  quality_improvement_trend: Array<{ date: string; score: number }>;
}

export interface GovernanceMetrics {
  assets_with_owners: number;
  assets_with_stewards: number;
  glossary_coverage_percentage: number;
  compliance_score: number;
  policy_violations: number;
}

// ========================= DISCOVERY AND EVENTS =========================

export interface AssetDiscoveryEvent {
  id: string;
  event_type: 'asset_discovered' | 'asset_updated' | 'asset_deprecated' | 'schema_changed';
  asset_id: string;
  discovery_method: DiscoveryMethod;
  confidence_score: number;
  changes_detected?: string[];
  metadata: Record<string, any>;
  timestamp: string;
  processed: boolean;
}

// ========================= BULK OPERATIONS =========================

export interface BulkOperationRequest {
  operation_type: 'update' | 'delete' | 'tag' | 'classify';
  asset_ids: string[];
  parameters: Record<string, any>;
  dry_run?: boolean;
}

export interface BulkOperationResponse {
  operation_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  total_assets: number;
  processed_assets: number;
  successful_operations: number;
  failed_operations: number;
  errors: Array<{
    asset_id: string;
    error_message: string;
  }>;
  started_at: string;
  completed_at?: string;
}

// ========================= EXPORT TYPES =========================

export type {
  IntelligentDataAsset,
  EnterpriseDataLineage,
  DataQualityAssessment,
  BusinessGlossaryTerm,
  BusinessGlossaryAssociation,
  AssetUsageMetrics,
  DataProfilingResult,
  ColumnMetadata,
  SchemaEvolution,
  LineageGraph,
  CatalogAnalytics,
  AssetCreateRequest,
  AssetUpdateRequest,
  AssetSearchRequest,
  IntelligentAssetResponse,
  LineageResponse,
  QualityAssessmentResponse,
  BusinessGlossaryResponse,
  AssetDiscoveryEvent,
  BulkOperationRequest,
  BulkOperationResponse
};