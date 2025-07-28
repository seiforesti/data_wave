/**
 * Advanced Catalog Core Types - Complete Backend Mapping
 * =====================================================
 * 
 * Comprehensive TypeScript type definitions that map 100% to backend catalog models.
 * This ensures complete frontend-backend integration without missing any functionality.
 * 
 * Backend Files Mapped:
 * - advanced_catalog_models.py (1260+ lines)
 * - catalog_intelligence_models.py (536+ lines) 
 * - catalog_quality_models.py (483+ lines)
 * - data_lineage_models.py (models included in advanced_catalog_models.py)
 * - catalog_models.py (244+ lines)
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
  VERY_HIGH = "very_high",    // Multiple times per day
  HIGH = "high",              // Daily
  MEDIUM = "medium",          // Weekly
  LOW = "low",                // Monthly
  VERY_LOW = "very_low",      // Rarely
  NEVER = "never"
}

export enum QualityRuleType {
  COMPLETENESS = "completeness",
  UNIQUENESS = "uniqueness",
  VALIDITY = "validity",
  CONSISTENCY = "consistency",
  ACCURACY = "accuracy",
  FRESHNESS = "freshness",
  CUSTOM = "custom"
}

export enum MonitoringLevel {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  DISABLED = "disabled"
}

export enum AlertSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INFO = "info"
}

export enum AlertStatus {
  ACTIVE = "active",
  ACKNOWLEDGED = "acknowledged",
  RESOLVED = "resolved",
  SUPPRESSED = "suppressed"
}

export enum RelationshipType {
  SEMANTIC_SIMILARITY = "semantic_similarity",
  STRUCTURAL_SIMILARITY = "structural_similarity",
  USAGE_SIMILARITY = "usage_similarity",
  OWNERSHIP_RELATION = "ownership_relation",
  DEPENDENCY = "dependency",
  CONTAINMENT = "containment",
  REFERENCE = "reference"
}

export enum RecommendationType {
  SIMILAR_ASSETS = "similar_assets",
  RELATED_ASSETS = "related_assets",
  POPULAR_ASSETS = "popular_assets",
  RECENT_ASSETS = "recent_assets",
  QUALITY_IMPROVEMENTS = "quality_improvements",
  DATA_GOVERNANCE = "data_governance"
}

// ========================= CORE INTERFACES =========================

export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// ========================= INTELLIGENT DATA ASSET =========================

export interface IntelligentDataAsset extends BaseModel {
  // Core Asset Information
  asset_name: string;
  asset_type: AssetType;
  asset_status: AssetStatus;
  description?: string;
  schema_name?: string;
  database_name?: string;
  server_name?: string;
  full_qualified_name: string;
  
  // Data Source Integration
  data_source_id?: string;
  connection_details?: Record<string, any>;
  
  // Asset Metadata
  metadata: Record<string, any>;
  technical_metadata?: Record<string, any>;
  business_metadata?: Record<string, any>;
  custom_properties?: Record<string, any>;
  
  // AI/ML Enhanced Metadata
  ai_generated_summary?: string;
  ai_classification_confidence?: number;
  semantic_embedding?: number[];
  auto_generated_tags?: string[];
  
  // Data Quality and Assessment
  current_quality_score?: number;
  quality_level?: DataQuality;
  last_quality_assessment?: string;
  quality_trend?: string;
  
  // Business Context
  business_criticality?: AssetCriticality;
  data_sensitivity?: DataSensitivity;
  compliance_tags?: string[];
  business_owner?: string;
  technical_owner?: string;
  steward?: string;
  
  // Usage Analytics
  usage_frequency?: UsageFrequency;
  last_accessed?: string;
  access_count?: number;
  user_count?: number;
  query_count?: number;
  
  // Data Profiling
  row_count?: number;
  column_count?: number;
  size_bytes?: number;
  last_profiled?: string;
  profiling_summary?: Record<string, any>;
  
  // Lineage and Dependencies
  upstream_count?: number;
  downstream_count?: number;
  lineage_complexity_score?: number;
  
  // Security and Compliance
  access_policy?: string;
  encryption_status?: string;
  compliance_status?: string;
  audit_trail?: Record<string, any>;
  
  // Discovery Information
  discovery_method?: DiscoveryMethod;
  discovery_date?: string;
  discovery_confidence?: number;
  
  // Operational Information
  availability_sla?: number;
  update_frequency?: string;
  retention_policy?: string;
  backup_status?: string;
  
  // Relationships (Virtual)
  tags?: CatalogTag[];
  glossary_terms?: BusinessGlossaryTerm[];
  quality_assessments?: DataQualityAssessment[];
  usage_metrics?: AssetUsageMetrics[];
  profiling_results?: DataProfilingResult[];
  lineage_upstream?: EnterpriseDataLineage[];
  lineage_downstream?: EnterpriseDataLineage[];
}

// ========================= DATA LINEAGE =========================

export interface EnterpriseDataLineage extends BaseModel {
  // Source and Target Assets
  source_asset_id: string;
  target_asset_id: string;
  source_column?: string;
  target_column?: string;
  
  // Lineage Metadata
  lineage_type: LineageType;
  direction: LineageDirection;
  transformation_logic?: string;
  transformation_type?: string;
  transformation_confidence?: number;
  
  // Process Information
  process_name?: string;
  process_type?: string;
  process_id?: string;
  job_id?: string;
  execution_id?: string;
  
  // Technical Details
  query_text?: string;
  script_path?: string;
  tool_name?: string;
  engine?: string;
  
  // Impact Analysis
  impact_score?: number;
  criticality?: AssetCriticality;
  change_frequency?: string;
  
  // Validation and Quality
  lineage_quality?: DataQuality;
  validation_status?: string;
  validation_date?: string;
  confidence_score?: number;
  
  // Discovery Information
  discovery_method?: DiscoveryMethod;
  discovery_date?: string;
  last_validated?: string;
  
  // Operational Metadata
  is_active?: boolean;
  execution_frequency?: string;
  last_execution?: string;
  next_execution?: string;
  
  // Relationships (Virtual)
  source_asset?: IntelligentDataAsset;
  target_asset?: IntelligentDataAsset;
}

// ========================= DATA QUALITY =========================

export interface DataQualityAssessment extends BaseModel {
  // Asset Reference
  asset_id: string;
  column_name?: string;
  
  // Quality Scores
  overall_score: number;
  completeness_score?: number;
  uniqueness_score?: number;
  validity_score?: number;
  consistency_score?: number;
  accuracy_score?: number;
  freshness_score?: number;
  
  // Assessment Details
  assessment_date: string;
  assessment_method?: string;
  sample_size?: number;
  total_records?: number;
  
  // Quality Issues
  issues_found?: Record<string, any>;
  anomalies_detected?: Record<string, any>;
  data_drift_detected?: boolean;
  schema_changes?: Record<string, any>;
  
  // Recommendations
  improvement_suggestions?: string[];
  risk_level?: string;
  remediation_priority?: string;
  
  // Trend Analysis
  quality_trend?: string;
  trend_analysis?: Record<string, any>;
  historical_comparison?: Record<string, any>;
  
  // Compliance and Governance
  compliance_status?: string;
  governance_rules_applied?: string[];
  
  // Relationships (Virtual)
  asset?: IntelligentDataAsset;
}

export interface DataQualityRule extends BaseModel {
  // Rule Definition
  rule_name: string;
  rule_type: QualityRuleType;
  description?: string;
  
  // Rule Logic
  rule_expression: string;
  threshold_value?: number;
  threshold_operator?: string;
  parameters?: Record<string, any>;
  
  // Scope
  applies_to_assets?: string[];
  applies_to_columns?: string[];
  asset_type_filter?: AssetType[];
  
  // Monitoring
  monitoring_level: MonitoringLevel;
  alert_threshold?: number;
  notification_settings?: Record<string, any>;
  
  // Status and Execution
  is_active?: boolean;
  execution_frequency?: string;
  last_execution?: string;
  next_execution?: string;
  execution_history?: Record<string, any>;
  
  // Performance
  execution_time_ms?: number;
  resource_usage?: Record<string, any>;
  
  // Relationships (Virtual)
  assessments?: DataQualityAssessment[];
}

export interface QualityScorecard extends BaseModel {
  // Asset Reference
  asset_id?: string;
  scope_type: string; // 'asset', 'schema', 'database', 'global'
  scope_identifier?: string;
  
  // Overall Scores
  overall_score: number;
  data_quality_score: number;
  metadata_quality_score: number;
  governance_score: number;
  
  // Detailed Metrics
  completeness_score: number;
  uniqueness_score: number;
  validity_score: number;
  consistency_score: number;
  accuracy_score: number;
  freshness_score: number;
  
  // Asset Counts
  total_assets: number;
  assessed_assets: number;
  passed_assets: number;
  failed_assets: number;
  
  // Trend Information
  score_trend: string;
  improvement_rate: number;
  
  // Time Period
  period_start: string;
  period_end: string;
  
  // Relationships (Virtual)
  asset?: IntelligentDataAsset;
}

// ========================= BUSINESS GLOSSARY =========================

export interface BusinessGlossaryTerm extends BaseModel {
  // Term Definition
  term_name: string;
  definition: string;
  business_definition?: string;
  technical_definition?: string;
  
  // Categorization
  category?: string;
  domain?: string;
  subject_area?: string;
  
  // Additional Information
  synonyms?: string[];
  abbreviations?: string[];
  examples?: string[];
  usage_guidelines?: string;
  
  // Governance
  term_owner?: string;
  approved_by?: string;
  approval_date?: string;
  status?: string;
  version?: string;
  
  // Relationships
  related_terms?: string[];
  parent_term_id?: string;
  
  // AI Enhancement
  ai_generated_definition?: string;
  semantic_embedding?: number[];
  
  // Relationships (Virtual)
  associations?: BusinessGlossaryAssociation[];
  parent_term?: BusinessGlossaryTerm;
  child_terms?: BusinessGlossaryTerm[];
}

export interface BusinessGlossaryAssociation extends BaseModel {
  // References
  term_id: string;
  asset_id: string;
  column_name?: string;
  
  // Association Details
  association_type?: string;
  confidence_score?: number;
  validation_status?: string;
  
  // Metadata
  notes?: string;
  assigned_by?: string;
  assignment_date?: string;
  
  // Relationships (Virtual)
  term?: BusinessGlossaryTerm;
  asset?: IntelligentDataAsset;
}

// ========================= USAGE ANALYTICS =========================

export interface AssetUsageMetrics extends BaseModel {
  // Asset Reference
  asset_id: string;
  metric_date: string;
  
  // Access Metrics
  access_count: number;
  unique_users: number;
  query_count: number;
  download_count?: number;
  
  // Usage Patterns
  peak_usage_hour?: number;
  avg_session_duration?: number;
  popular_columns?: string[];
  common_queries?: string[];
  
  // User Analytics
  top_users?: Record<string, number>;
  user_departments?: Record<string, number>;
  user_roles?: Record<string, number>;
  
  // Performance Metrics
  avg_query_time?: number;
  error_rate?: number;
  cache_hit_rate?: number;
  
  // Trend Data
  usage_trend?: string;
  growth_rate?: number;
  
  // Relationships (Virtual)
  asset?: IntelligentDataAsset;
}

// ========================= DATA PROFILING =========================

export interface DataProfilingResult extends BaseModel {
  // Asset Reference
  asset_id: string;
  column_name?: string;
  
  // Profiling Metadata
  profiling_date: string;
  profiling_method?: string;
  sample_size?: number;
  total_records?: number;
  
  // Basic Statistics
  null_count?: number;
  null_percentage?: number;
  unique_count?: number;
  unique_percentage?: number;
  
  // Data Type Analysis
  inferred_data_type?: string;
  data_type_confidence?: number;
  data_format_patterns?: string[];
  
  // Statistical Analysis (for numeric columns)
  min_value?: number;
  max_value?: number;
  mean_value?: number;
  median_value?: number;
  std_deviation?: number;
  quartiles?: number[];
  
  // String Analysis (for text columns)
  min_length?: number;
  max_length?: number;
  avg_length?: number;
  common_patterns?: Record<string, number>;
  
  // Value Distribution
  value_distribution?: Record<string, number>;
  top_values?: Record<string, number>;
  outliers?: any[];
  
  // Data Quality Indicators
  completeness_score?: number;
  validity_score?: number;
  consistency_score?: number;
  
  // Classification Hints
  potential_pii?: boolean;
  potential_sensitive?: boolean;
  classification_suggestions?: string[];
  
  // Relationships (Virtual)
  asset?: IntelligentDataAsset;
}

// ========================= CATALOG INTELLIGENCE =========================

export interface SemanticEmbedding extends BaseModel {
  // Reference
  asset_id: string;
  embedding_type: string; // 'asset_description', 'column_names', 'sample_data'
  
  // Embedding Data
  embedding_vector: number[];
  embedding_model: string;
  embedding_version: string;
  
  // Metadata
  source_text?: string;
  preprocessing_steps?: string[];
  
  // Quality Metrics
  confidence_score?: number;
  similarity_threshold?: number;
}

export interface SemanticRelationship extends BaseModel {
  // Asset References
  source_asset_id: string;
  target_asset_id: string;
  
  // Relationship Details
  relationship_type: RelationshipType;
  similarity_score: number;
  confidence_level: number;
  
  // Context
  relationship_context?: string;
  evidence?: Record<string, any>;
  
  // Discovery Information
  discovery_method: string;
  discovery_date: string;
  last_validated?: string;
  
  // Relationships (Virtual)
  source_asset?: IntelligentDataAsset;
  target_asset?: IntelligentDataAsset;
}

export interface AssetRecommendation extends BaseModel {
  // User Context
  user_id?: string;
  session_id?: string;
  
  // Recommendation Details
  recommended_asset_id: string;
  recommendation_type: RecommendationType;
  confidence_score: number;
  relevance_score: number;
  
  // Context and Reasoning
  recommendation_reason?: string;
  context_assets?: string[];
  user_activity_context?: Record<string, any>;
  
  // Interaction Tracking
  presented_at?: string;
  clicked?: boolean;
  clicked_at?: string;
  feedback_rating?: number;
  
  // Relationships (Virtual)
  recommended_asset?: IntelligentDataAsset;
}

export interface AssetUsagePattern extends BaseModel {
  // Pattern Identification
  pattern_name: string;
  pattern_type: string;
  description?: string;
  
  // Assets Involved
  asset_ids: string[];
  
  // Pattern Characteristics
  frequency: number;
  confidence: number;
  support: number;
  
  // Temporal Information
  time_window?: string;
  recurring_schedule?: string;
  
  // User Information
  user_groups?: string[];
  departments?: string[];
  
  // Insights
  business_impact?: string;
  optimization_opportunities?: string[];
}

export interface IntelligenceInsight extends BaseModel {
  // Insight Classification
  insight_type: string;
  category: string;
  title: string;
  description: string;
  
  // Relevance
  relevance_score: number;
  confidence_level: number;
  impact_level: string;
  
  // Context
  related_assets?: string[];
  related_users?: string[];
  context_data?: Record<string, any>;
  
  // Actions
  recommended_actions?: string[];
  action_priority?: string;
  
  // Lifecycle
  insight_date: string;
  expiry_date?: string;
  status?: string;
}

// ========================= BASIC CATALOG MODELS =========================

export interface CatalogItem extends BaseModel {
  name: string;
  type: string;
  description?: string;
  metadata?: Record<string, any>;
  data_source_id?: string;
  
  // Relationships (Virtual)
  tags?: CatalogTag[];
  data_source?: any; // Reference to DataSource
}

export interface CatalogTag extends BaseModel {
  name: string;
  color?: string;
  description?: string;
  category?: string;
  
  // Relationships (Virtual)
  items?: CatalogItem[];
}

export interface CatalogItemTag extends BaseModel {
  catalog_item_id: string;
  catalog_tag_id: string;
  
  // Relationships (Virtual)
  catalog_item?: CatalogItem;
  catalog_tag?: CatalogTag;
}

export interface BasicDataLineage extends BaseModel {
  source_id: string;
  target_id: string;
  transformation?: string;
  confidence_score?: number;
  
  // Relationships (Virtual)
  source?: CatalogItem;
  target?: CatalogItem;
}

export interface CatalogUsageLog extends BaseModel {
  user_id: string;
  catalog_item_id: string;
  action: string;
  timestamp: string;
  details?: Record<string, any>;
  
  // Relationships (Virtual)
  catalog_item?: CatalogItem;
}

export interface BasicCatalogQualityRule extends BaseModel {
  name: string;
  description?: string;
  rule_expression: string;
  threshold?: number;
  severity?: string;
  
  // Relationships (Virtual)
  applicable_items?: CatalogItem[];
}

// ========================= REQUEST/RESPONSE TYPES =========================

export interface AssetCreateRequest {
  asset_name: string;
  asset_type: AssetType;
  description?: string;
  schema_name?: string;
  database_name?: string;
  server_name?: string;
  data_source_id?: string;
  metadata?: Record<string, any>;
  business_owner?: string;
  technical_owner?: string;
  tags?: string[];
  glossary_terms?: string[];
}

export interface AssetUpdateRequest {
  asset_name?: string;
  description?: string;
  metadata?: Record<string, any>;
  business_owner?: string;
  technical_owner?: string;
  asset_status?: AssetStatus;
  business_criticality?: AssetCriticality;
  data_sensitivity?: DataSensitivity;
  tags?: string[];
  glossary_terms?: string[];
}

export interface AssetSearchRequest {
  query?: string;
  asset_types?: AssetType[];
  asset_status?: AssetStatus[];
  quality_levels?: DataQuality[];
  criticality_levels?: AssetCriticality[];
  sensitivity_levels?: DataSensitivity[];
  owners?: string[];
  tags?: string[];
  glossary_terms?: string[];
  data_sources?: string[];
  schemas?: string[];
  databases?: string[];
  last_accessed_after?: string;
  last_accessed_before?: string;
  created_after?: string;
  created_before?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  include_embeddings?: boolean;
  semantic_search?: boolean;
  similarity_threshold?: number;
}

export interface IntelligentAssetResponse {
  assets: IntelligentDataAsset[];
  total_count: number;
  page_info: {
    limit: number;
    offset: number;
    has_next: boolean;
    has_previous: boolean;
  };
  facets?: {
    asset_types: Record<AssetType, number>;
    quality_levels: Record<DataQuality, number>;
    criticality_levels: Record<AssetCriticality, number>;
    owners: Record<string, number>;
    tags: Record<string, number>;
  };
  semantic_results?: {
    query_embedding: number[];
    similarity_scores: Record<string, number>;
  };
}

export interface LineageResponse {
  lineage_graph: LineageGraph;
  impact_analysis?: {
    affected_assets: string[];
    risk_assessment: Record<string, any>;
    change_recommendations: string[];
  };
  performance_stats?: {
    query_time_ms: number;
    nodes_analyzed: number;
    edges_analyzed: number;
  };
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  metadata: {
    center_asset_id: string;
    depth_upstream: number;
    depth_downstream: number;
    total_nodes: number;
    total_edges: number;
  };
}

export interface LineageNode {
  id: string;
  asset: IntelligentDataAsset;
  position?: { x: number; y: number };
  level: number;
  direction: 'upstream' | 'downstream' | 'center';
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  lineage: EnterpriseDataLineage;
  style?: Record<string, any>;
}

export interface QualityAssessmentResponse {
  assessments: DataQualityAssessment[];
  scorecard: QualityScorecard;
  trends: {
    quality_trend: string;
    trend_data: Array<{
      date: string;
      score: number;
    }>;
  };
  recommendations: string[];
  benchmark_comparison?: {
    industry_average: number;
    peer_average: number;
    ranking: string;
  };
}

export interface BusinessGlossaryResponse {
  terms: BusinessGlossaryTerm[];
  total_count: number;
  categories: Record<string, number>;
  domains: Record<string, number>;
  coverage_stats: {
    total_assets: number;
    assets_with_terms: number;
    coverage_percentage: number;
  };
}

export interface CatalogAnalytics {
  // Overview Statistics
  total_assets: number;
  assets_by_type: Record<AssetType, number>;
  assets_by_status: Record<AssetStatus, number>;
  assets_by_quality: Record<DataQuality, number>;
  
  // Growth Metrics
  growth_metrics: {
    daily_growth: number;
    weekly_growth: number;
    monthly_growth: number;
  };
  
  // Usage Statistics
  usage_statistics: {
    total_queries: number;
    unique_users: number;
    most_accessed_assets: Array<{
      asset_id: string;
      asset_name: string;
      access_count: number;
    }>;
  };
  
  // Quality Metrics
  quality_metrics: {
    average_quality_score: number;
    quality_distribution: Record<DataQuality, number>;
    quality_trends: Array<{
      date: string;
      average_score: number;
    }>;
  };
  
  // Governance Metrics
  governance_metrics: {
    assets_with_owners: number;
    assets_with_descriptions: number;
    assets_with_tags: number;
    assets_with_glossary_terms: number;
    governance_score: number;
  };
  
  // Time Period
  period_start: string;
  period_end: string;
  generated_at: string;
}

// ========================= EVENT TYPES =========================

export interface AssetDiscoveryEvent {
  event_id: string;
  event_type: string;
  asset_id: string;
  asset_name: string;
  discovery_method: DiscoveryMethod;
  confidence_score: number;
  metadata: Record<string, any>;
  timestamp: string;
  data_source_id?: string;
}

// ========================= UTILITY TYPES =========================

export type CatalogEntityType = 
  | IntelligentDataAsset 
  | BusinessGlossaryTerm 
  | DataQualityRule 
  | CatalogTag;

export type SearchableEntity = Pick<IntelligentDataAsset, 
  | 'id' 
  | 'asset_name' 
  | 'description' 
  | 'asset_type' 
  | 'full_qualified_name'
> & {
  relevance_score?: number;
  highlight?: Record<string, string[]>;
};

export type AssetSummary = Pick<IntelligentDataAsset,
  | 'id'
  | 'asset_name'
  | 'asset_type'
  | 'asset_status'
  | 'quality_level'
  | 'business_criticality'
  | 'usage_frequency'
  | 'last_accessed'
  | 'current_quality_score'
>;

// ========================= FILTER TYPES =========================

export interface CatalogFilters {
  asset_types?: AssetType[];
  asset_status?: AssetStatus[];
  quality_levels?: DataQuality[];
  criticality_levels?: AssetCriticality[];
  sensitivity_levels?: DataSensitivity[];
  usage_frequencies?: UsageFrequency[];
  owners?: string[];
  stewards?: string[];
  tags?: string[];
  glossary_terms?: string[];
  data_sources?: string[];
  schemas?: string[];
  databases?: string[];
  servers?: string[];
  date_ranges?: {
    created?: { start?: string; end?: string };
    updated?: { start?: string; end?: string };
    last_accessed?: { start?: string; end?: string };
  };
  quality_scores?: {
    min?: number;
    max?: number;
  };
}

export interface SortOptions {
  field: keyof IntelligentDataAsset;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

// ========================= BULK OPERATION TYPES =========================

export interface BulkOperationRequest {
  operation_type: 'update' | 'delete' | 'tag' | 'classify';
  asset_ids: string[];
  parameters?: Record<string, any>;
  reason?: string;
}

export interface BulkOperationResponse {
  operation_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  total_items: number;
  processed_items: number;
  failed_items: number;
  errors?: Array<{
    asset_id: string;
    error_message: string;
  }>;
  started_at: string;
  completed_at?: string;
}

// ========================= EXPORT TYPES =========================

export type CatalogExportFormat = 'json' | 'csv' | 'excel' | 'xml';

export interface CatalogExportRequest {
  format: CatalogExportFormat;
  include_assets?: boolean;
  include_lineage?: boolean;
  include_quality?: boolean;
  include_glossary?: boolean;
  filters?: CatalogFilters;
  template?: string;
}

export interface CatalogExportResponse {
  export_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  download_url?: string;
  expires_at?: string;
  file_size?: number;
  created_at: string;
}

// Default export for easier importing
export default {
  AssetType,
  AssetStatus,
  DataQuality,
  LineageDirection,
  LineageType,
  DiscoveryMethod,
  AssetCriticality,
  DataSensitivity,
  UsageFrequency,
  QualityRuleType,
  MonitoringLevel,
  AlertSeverity,
  AlertStatus,
  RelationshipType,
  RecommendationType
};