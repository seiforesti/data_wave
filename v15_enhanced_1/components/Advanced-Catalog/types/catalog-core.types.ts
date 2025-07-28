/**
 * Advanced Catalog Core Types - Complete Backend Integration
 * ========================================================
 * 
 * This file provides comprehensive TypeScript types that map 100% to the
 * backend advanced catalog models, ensuring complete type safety and
 * enterprise-grade data management capabilities.
 * 
 * Features:
 * - AI-powered asset discovery and classification
 * - Real-time lineage tracking with graph analysis
 * - Comprehensive quality management and profiling
 * - Business glossary integration with semantic understanding
 * - Advanced analytics and insights generation
 */

import { ReactNode } from 'react'

// ===================== BACKEND ENUM MAPPINGS =====================

export enum AssetType {
  TABLE = 'table',
  VIEW = 'view',
  STORED_PROCEDURE = 'stored_procedure',
  FUNCTION = 'function',
  DATASET = 'dataset',
  FILE = 'file',
  STREAM = 'stream',
  API = 'api',
  REPORT = 'report',
  DASHBOARD = 'dashboard',
  MODEL = 'model',
  PIPELINE = 'pipeline',
  SCHEMA = 'schema',
  DATABASE = 'database'
}

export enum AssetStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived',
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  QUARANTINED = 'quarantined',
  MIGRATING = 'migrating',
  DELETED = 'deleted'
}

export enum DataQuality {
  EXCELLENT = 'excellent',    // 95-100%
  GOOD = 'good',             // 85-94%
  FAIR = 'fair',             // 70-84%
  POOR = 'poor',             // 50-69%
  CRITICAL = 'critical',     // <50%
  UNKNOWN = 'unknown'
}

export enum LineageDirection {
  UPSTREAM = 'upstream',
  DOWNSTREAM = 'downstream',
  BIDIRECTIONAL = 'bidirectional'
}

export enum LineageType {
  TABLE_TO_TABLE = 'table_to_table',
  COLUMN_TO_COLUMN = 'column_to_column',
  TRANSFORMATION = 'transformation',
  AGGREGATION = 'aggregation',
  JOIN = 'join',
  FILTER = 'filter',
  COMPUTED = 'computed',
  DERIVED = 'derived',
  COPY = 'copy',
  ETL_PROCESS = 'etl_process'
}

export enum DiscoveryMethod {
  AUTOMATED_SCAN = 'automated_scan',
  AI_DETECTION = 'ai_detection',
  PATTERN_MATCHING = 'pattern_matching',
  METADATA_IMPORT = 'metadata_import',
  MANUAL_ENTRY = 'manual_entry',
  API_INTEGRATION = 'api_integration',
  LINEAGE_INFERENCE = 'lineage_inference',
  ML_CLASSIFICATION = 'ml_classification'
}

export enum AssetCriticality {
  MISSION_CRITICAL = 'mission_critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  EXPERIMENTAL = 'experimental'
}

export enum DataSensitivity {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret'
}

export enum UsageFrequency {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  RARELY = 'rarely',
  UNKNOWN = 'unknown'
}

// ===================== CORE ASSET TYPES =====================

export interface IntelligentDataAsset {
  id?: number
  asset_uuid: string
  qualified_name: string
  display_name: string
  description?: string
  asset_type: AssetType
  status: AssetStatus
  owner_id?: string
  steward_ids: string[]
  
  // Source information
  source_system: string
  source_database?: string
  source_schema?: string
  source_table?: string
  source_url?: string
  connection_string?: string
  
  // Enhanced metadata
  technical_metadata: Record<string, any>
  business_metadata: Record<string, any>
  schema_metadata: Record<string, any>
  custom_properties: Record<string, any>
  
  // AI-powered features
  ai_generated_description?: string
  ai_suggested_tags: string[]
  semantic_embeddings?: number[]
  similarity_scores: Record<string, number>
  intelligent_insights: string[]
  
  // Quality and profiling
  data_quality_score: number
  quality_assessment?: DataQuality
  last_profiled_at?: string
  profiling_results?: DataProfilingResult
  quality_issues: string[]
  quality_recommendations: string[]
  
  // Usage and analytics
  usage_metrics?: AssetUsageMetrics
  popularity_score: number
  access_frequency: UsageFrequency
  last_accessed_at?: string
  access_count: number
  
  // Classification and governance
  classification_labels: string[]
  sensitivity_level: DataSensitivity
  criticality_level: AssetCriticality
  compliance_tags: string[]
  governance_policies: string[]
  
  // Lineage and relationships
  upstream_count: number
  downstream_count: number
  lineage_depth: number
  related_assets: string[]
  
  // Audit and lifecycle
  created_at: string
  updated_at: string
  created_by: string
  last_modified_by: string
  version: number
  changelog: string[]
  
  // Business context
  business_terms: string[]
  glossary_associations: BusinessGlossaryAssociation[]
  business_rules: string[]
  business_impact: string
  
  // Monitoring and alerts
  monitoring_enabled: boolean
  alert_thresholds: Record<string, number>
  last_alert_at?: string
  health_status: string
  availability_score: number
}

export interface DataProfilingResult {
  id?: number
  asset_id: number
  profile_uuid: string
  profiling_timestamp: string
  profiling_method: string
  
  // Statistical metrics
  row_count: number
  column_count: number
  size_bytes: number
  null_percentage: number
  duplicate_percentage: number
  completeness_score: number
  uniqueness_score: number
  validity_score: number
  consistency_score: number
  
  // Column-level profiling
  column_profiles: ColumnProfile[]
  data_types: Record<string, string>
  value_distributions: Record<string, any>
  pattern_analysis: Record<string, any>
  
  // Quality metrics
  quality_score: number
  quality_issues: QualityIssue[]
  anomalies_detected: Anomaly[]
  recommendations: string[]
  
  // Comparison metrics
  previous_profile_id?: number
  changes_detected: ProfileChange[]
  drift_score: number
  
  // Metadata
  profiling_duration_seconds: number
  sampling_rate: number
  confidence_level: number
}

export interface ColumnProfile {
  column_name: string
  data_type: string
  null_count: number
  null_percentage: number
  unique_count: number
  unique_percentage: number
  min_value?: any
  max_value?: any
  mean_value?: number
  median_value?: number
  std_deviation?: number
  top_values: Array<{ value: any; count: number }>
  patterns: string[]
  format_compliance: number
}

export interface QualityIssue {
  issue_type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  affected_columns: string[]
  affected_rows: number
  recommendation: string
}

export interface Anomaly {
  anomaly_type: string
  confidence: number
  description: string
  affected_data: any
  detection_method: string
}

export interface ProfileChange {
  change_type: string
  field_name: string
  old_value: any
  new_value: any
  change_percentage: number
}

// ===================== LINEAGE TYPES =====================

export interface EnterpriseDataLineage {
  id?: number
  lineage_uuid: string
  source_asset_id: number
  target_asset_id: number
  source_column?: string
  target_column?: string
  
  lineage_type: LineageType
  direction: LineageDirection
  transformation_logic?: string
  transformation_type?: string
  
  // Relationship metadata
  confidence_score: number
  discovery_method: DiscoveryMethod
  last_verified_at?: string
  verification_status: string
  
  // Technical details
  pipeline_id?: string
  job_id?: string
  step_name?: string
  sql_query?: string
  transformation_code?: string
  
  // Impact analysis
  impact_score: number
  criticality_inheritance: boolean
  dependency_level: number
  
  // Audit trail
  created_at: string
  created_by: string
  updated_at: string
  last_validated_by?: string
  
  // Graph metadata
  graph_properties: Record<string, any>
  edge_weight: number
  path_distance: number
}

export interface LineageGraph {
  nodes: LineageNode[]
  edges: LineageEdge[]
  graph_id: string
  generated_at: string
  center_asset_id: number
  depth_levels: number
  total_assets: number
  graph_metadata: Record<string, any>
}

export interface LineageNode {
  node_id: string
  asset_id: number
  asset_name: string
  asset_type: AssetType
  display_name: string
  level: number
  x_position?: number
  y_position?: number
  node_metadata: Record<string, any>
  criticality: AssetCriticality
  quality_score: number
}

export interface LineageEdge {
  edge_id: string
  source_node_id: string
  target_node_id: string
  lineage_type: LineageType
  confidence_score: number
  edge_metadata: Record<string, any>
  transformation_summary?: string
}

// ===================== QUALITY ASSESSMENT TYPES =====================

export interface DataQualityAssessment {
  id?: number
  asset_id: number
  assessment_uuid: string
  assessment_timestamp: string
  
  // Overall quality metrics
  overall_score: number
  quality_level: DataQuality
  previous_score?: number
  score_trend: 'IMPROVING' | 'DECLINING' | 'STABLE'
  
  // Dimension scores
  completeness_score: number
  accuracy_score: number
  consistency_score: number
  validity_score: number
  uniqueness_score: number
  timeliness_score: number
  
  // Rule-based assessment
  rules_evaluated: QualityRule[]
  rules_passed: number
  rules_failed: number
  critical_failures: number
  
  // Issues and recommendations
  quality_issues: QualityIssue[]
  recommendations: QualityRecommendation[]
  action_items: ActionItem[]
  
  // Comparison and trends
  historical_comparison: HistoricalQualityMetric[]
  benchmark_comparison: BenchmarkMetric[]
  
  // Assessment metadata
  assessment_method: string
  assessment_duration_seconds: number
  data_sample_size: number
  confidence_level: number
  
  // Audit
  assessed_by: string
  reviewed_by?: string
  review_status: string
  next_assessment_due: string
}

export interface QualityRule {
  rule_id: string
  rule_name: string
  rule_type: string
  description: string
  sql_expression?: string
  threshold_value?: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  passed: boolean
  actual_value?: number
  error_message?: string
}

export interface QualityRecommendation {
  recommendation_id: string
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  title: string
  description: string
  suggested_actions: string[]
  estimated_effort: string
  expected_impact: string
}

export interface ActionItem {
  action_id: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assigned_to?: string
  due_date?: string
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  created_at: string
}

export interface HistoricalQualityMetric {
  timestamp: string
  overall_score: number
  dimension_scores: Record<string, number>
  issues_count: number
}

export interface BenchmarkMetric {
  benchmark_name: string
  benchmark_score: number
  comparison_result: 'ABOVE' | 'BELOW' | 'EQUAL'
  percentile_rank: number
}

// ===================== BUSINESS GLOSSARY TYPES =====================

export interface BusinessGlossaryTerm {
  id?: number
  term_uuid: string
  term_name: string
  display_name: string
  definition: string
  business_definition: string
  technical_definition?: string
  
  // Categorization
  category: string
  subcategory?: string
  domain: string
  classification: string
  
  // Relationships
  synonyms: string[]
  acronyms: string[]
  related_terms: string[]
  parent_term_id?: number
  child_terms: string[]
  
  // Governance
  status: 'DRAFT' | 'APPROVED' | 'DEPRECATED' | 'RETIRED'
  approval_status: string
  approved_by?: string
  approved_at?: string
  
  // Ownership and stewardship
  business_owner: string
  technical_steward?: string
  subject_matter_expert?: string
  
  // Usage and context
  usage_context: string[]
  business_rules: string[]
  examples: string[]
  calculations?: string
  
  // Metadata
  created_at: string
  created_by: string
  updated_at: string
  last_modified_by: string
  version: number
  
  // Analytics
  usage_count: number
  associated_assets_count: number
  popularity_score: number
}

export interface BusinessGlossaryAssociation {
  id?: number
  association_uuid: string
  term_id: number
  asset_id: number
  
  // Association details
  association_type: 'PRIMARY' | 'SECONDARY' | 'CONTEXTUAL'
  confidence_score: number
  discovery_method: DiscoveryMethod
  
  // Context
  context_description?: string
  business_context?: string
  technical_context?: string
  
  // Validation
  validated: boolean
  validated_by?: string
  validated_at?: string
  
  // Audit
  created_at: string
  created_by: string
  updated_at: string
}

// ===================== USAGE METRICS TYPES =====================

export interface AssetUsageMetrics {
  id?: number
  asset_id: number
  metrics_uuid: string
  
  // Time-based metrics
  measurement_date: string
  measurement_period_hours: number
  
  // Access metrics
  total_access_count: number
  unique_users_count: number
  unique_applications_count: number
  unique_queries_count: number
  
  // Performance metrics
  average_query_duration_ms: number
  total_query_duration_ms: number
  peak_concurrent_users: number
  data_volume_accessed_bytes: number
  
  // Usage patterns
  hourly_distribution: Record<string, number>
  daily_distribution: Record<string, number>
  user_type_distribution: Record<string, number>
  application_distribution: Record<string, number>
  
  // Quality impact
  error_rate: number
  failed_queries_count: number
  timeout_count: number
  
  // Business metrics
  business_value_score: number
  roi_contribution: number
  cost_attribution: number
  
  // Comparative metrics
  usage_growth_rate: number
  popularity_rank: number
  peer_comparison_score: number
  
  // Metadata
  collection_method: string
  data_freshness_minutes: number
  confidence_level: number
}

// ===================== REQUEST/RESPONSE TYPES =====================

export interface AssetCreateRequest {
  qualified_name: string
  display_name: string
  description?: string
  asset_type: AssetType
  source_system: string
  technical_metadata?: Record<string, any>
  business_metadata?: Record<string, any>
  custom_properties?: Record<string, any>
  owner_id?: string
  steward_ids?: string[]
  classification_labels?: string[]
  sensitivity_level?: DataSensitivity
  criticality_level?: AssetCriticality
}

export interface AssetUpdateRequest {
  display_name?: string
  description?: string
  status?: AssetStatus
  technical_metadata?: Record<string, any>
  business_metadata?: Record<string, any>
  custom_properties?: Record<string, any>
  owner_id?: string
  steward_ids?: string[]
  classification_labels?: string[]
  sensitivity_level?: DataSensitivity
  criticality_level?: AssetCriticality
}

export interface AssetSearchRequest {
  query?: string
  asset_types?: AssetType[]
  statuses?: AssetStatus[]
  owners?: string[]
  stewards?: string[]
  tags?: string[]
  data_quality_min?: number
  criticality_levels?: AssetCriticality[]
  sensitivity_levels?: DataSensitivity[]
  created_after?: string
  created_before?: string
  updated_after?: string
  updated_before?: string
  
  // Advanced search
  semantic_search?: boolean
  similarity_threshold?: number
  include_derived_assets?: boolean
  include_deprecated?: boolean
  
  // Pagination and sorting
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'ASC' | 'DESC'
}

export interface IntelligentAssetResponse {
  asset: IntelligentDataAsset
  lineage_summary: {
    upstream_count: number
    downstream_count: number
    max_depth: number
  }
  quality_summary: {
    overall_score: number
    quality_level: DataQuality
    last_assessed: string
    issues_count: number
  }
  usage_summary: {
    access_frequency: UsageFrequency
    popularity_score: number
    last_accessed: string
    unique_users_30d: number
  }
  business_context: {
    glossary_terms: string[]
    business_impact: string
    stakeholders: string[]
  }
  ai_insights: {
    generated_description?: string
    suggested_improvements: string[]
    anomalies_detected: string[]
    recommendations: string[]
  }
}

export interface LineageResponse {
  graph: LineageGraph
  center_asset: IntelligentDataAsset
  depth_analyzed: number
  total_nodes: number
  total_edges: number
  analysis_metadata: {
    generated_at: string
    analysis_duration_ms: number
    confidence_threshold: number
    included_types: LineageType[]
  }
  impact_analysis?: {
    critical_paths: string[]
    bottlenecks: string[]
    recommendations: string[]
  }
}

export interface QualityAssessmentResponse {
  assessment: DataQualityAssessment
  asset: IntelligentDataAsset
  historical_trend: HistoricalQualityMetric[]
  benchmark_comparison: BenchmarkMetric[]
  improvement_recommendations: QualityRecommendation[]
  action_plan: ActionItem[]
}

export interface BusinessGlossaryResponse {
  terms: BusinessGlossaryTerm[]
  total_count: number
  categories: string[]
  domains: string[]
  relationship_graph?: {
    nodes: Array<{ id: string; name: string; category: string }>
    edges: Array<{ source: string; target: string; type: string }>
  }
}

// ===================== ANALYTICS TYPES =====================

export interface CatalogAnalytics {
  overview: {
    total_assets: number
    total_active_assets: number
    total_deprecated_assets: number
    asset_growth_rate: number
    average_quality_score: number
    total_lineage_connections: number
  }
  
  asset_distribution: {
    by_type: Record<AssetType, number>
    by_status: Record<AssetStatus, number>
    by_quality: Record<DataQuality, number>
    by_criticality: Record<AssetCriticality, number>
    by_sensitivity: Record<DataSensitivity, number>
  }
  
  usage_analytics: {
    most_accessed_assets: Array<{ asset_id: number; access_count: number }>
    least_accessed_assets: Array<{ asset_id: number; access_count: number }>
    usage_trends: Array<{ date: string; total_accesses: number }>
    top_users: Array<{ user_id: string; access_count: number }>
    top_applications: Array<{ application: string; access_count: number }>
  }
  
  quality_insights: {
    quality_distribution: Record<DataQuality, number>
    quality_trends: Array<{ date: string; average_score: number }>
    top_quality_issues: Array<{ issue_type: string; count: number }>
    quality_by_asset_type: Record<AssetType, number>
  }
  
  lineage_analytics: {
    most_connected_assets: Array<{ asset_id: number; connection_count: number }>
    lineage_depth_distribution: Record<number, number>
    orphaned_assets_count: number
    circular_dependencies_count: number
  }
  
  governance_metrics: {
    assets_with_owners: number
    assets_with_stewards: number
    assets_with_business_terms: number
    compliance_coverage: number
    classification_coverage: number
  }
  
  recommendations: {
    quality_improvements: string[]
    governance_actions: string[]
    usage_optimizations: string[]
    lineage_completions: string[]
  }
}

// ===================== DISCOVERY TYPES =====================

export interface AssetDiscoveryEvent {
  event_id: string
  event_type: 'ASSET_DISCOVERED' | 'ASSET_UPDATED' | 'ASSET_DELETED' | 'LINEAGE_DISCOVERED'
  asset_id?: number
  asset_qualified_name?: string
  discovery_method: DiscoveryMethod
  confidence_score: number
  metadata_changes: Record<string, any>
  discovered_at: string
  discovered_by: string
  processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  error_message?: string
}

// ===================== SEARCH TYPES =====================

export interface SemanticSearchResult {
  asset: IntelligentDataAsset
  relevance_score: number
  similarity_score: number
  matched_fields: string[]
  highlighted_content: Record<string, string>
  explanation: string
}

export interface SearchFacets {
  asset_types: Array<{ value: AssetType; count: number }>
  statuses: Array<{ value: AssetStatus; count: number }>
  quality_levels: Array<{ value: DataQuality; count: number }>
  criticality_levels: Array<{ value: AssetCriticality; count: number }>
  sensitivity_levels: Array<{ value: DataSensitivity; count: number }>
  owners: Array<{ value: string; count: number }>
  stewards: Array<{ value: string; count: number }>
  source_systems: Array<{ value: string; count: number }>
  tags: Array<{ value: string; count: number }>
}

// ===================== UI-SPECIFIC TYPES =====================

export interface CatalogViewMode {
  type: 'GRID' | 'LIST' | 'TREE' | 'GRAPH'
  group_by?: string
  filter_by?: Record<string, any>
  sort_by?: string
  sort_order?: 'ASC' | 'DESC'
}

export interface CatalogState {
  assets: IntelligentDataAsset[]
  loading: boolean
  error: string | null
  selectedAsset: IntelligentDataAsset | null
  viewMode: CatalogViewMode
  searchQuery: string
  filters: AssetSearchRequest
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  facets: SearchFacets | null
}

export interface LineageState {
  graph: LineageGraph | null
  selectedNode: LineageNode | null
  selectedEdge: LineageEdge | null
  viewMode: 'HIERARCHICAL' | 'RADIAL' | 'FORCE_DIRECTED'
  zoomLevel: number
  centerPosition: { x: number; y: number }
  filters: {
    directions: LineageDirection[]
    types: LineageType[]
    depth: number
  }
  loading: boolean
  error: string | null
}

export interface QualityState {
  assessments: DataQualityAssessment[]
  selectedAssessment: DataQualityAssessment | null
  qualityTrends: HistoricalQualityMetric[]
  qualityRules: QualityRule[]
  loading: boolean
  error: string | null
  filters: {
    quality_levels: DataQuality[]
    date_range: { start: string; end: string }
    asset_types: AssetType[]
  }
}

// ===================== COMPONENT PROP TYPES =====================

export interface CatalogComponentProps {
  className?: string
  children?: ReactNode
  onAssetSelect?: (asset: IntelligentDataAsset) => void
  onAssetUpdate?: (asset: IntelligentDataAsset) => void
  onError?: (error: string) => void
}

export interface LineageComponentProps {
  assetId?: number
  maxDepth?: number
  direction?: LineageDirection
  onNodeSelect?: (node: LineageNode) => void
  onEdgeSelect?: (edge: LineageEdge) => void
  className?: string
}

export interface QualityComponentProps {
  assetId?: number
  assessmentId?: string
  showTrends?: boolean
  showRecommendations?: boolean
  onAssessmentComplete?: (assessment: DataQualityAssessment) => void
  className?: string
}

// ===================== EXPORT ALL TYPES =====================

export type {
  // Core asset types
  IntelligentDataAsset,
  DataProfilingResult,
  ColumnProfile,
  QualityIssue,
  Anomaly,
  ProfileChange,
  
  // Lineage types
  EnterpriseDataLineage,
  LineageGraph,
  LineageNode,
  LineageEdge,
  
  // Quality types
  DataQualityAssessment,
  QualityRule,
  QualityRecommendation,
  ActionItem,
  HistoricalQualityMetric,
  BenchmarkMetric,
  
  // Business glossary types
  BusinessGlossaryTerm,
  BusinessGlossaryAssociation,
  
  // Usage metrics
  AssetUsageMetrics,
  
  // Request/Response types
  AssetCreateRequest,
  AssetUpdateRequest,
  AssetSearchRequest,
  IntelligentAssetResponse,
  LineageResponse,
  QualityAssessmentResponse,
  BusinessGlossaryResponse,
  
  // Analytics types
  CatalogAnalytics,
  
  // Discovery types
  AssetDiscoveryEvent,
  
  // Search types
  SemanticSearchResult,
  SearchFacets,
  
  // State types
  CatalogState,
  LineageState,
  QualityState,
  
  // Component prop types
  CatalogComponentProps,
  LineageComponentProps,
  QualityComponentProps
}