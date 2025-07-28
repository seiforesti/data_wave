/**
 * Discovery Types - Complete Backend Mapping
 * ==========================================
 * 
 * TypeScript types for AI-powered discovery functionality.
 * Maps to intelligent_discovery_service.py (1117+ lines)
 */

import { AssetType, AssetStatus, DiscoveryMethod, DataQuality, AssetCriticality } from './catalog-core.types';

// ========================= DISCOVERY ENUMS =========================

export enum DiscoveryStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  PAUSED = "paused"
}

export enum DiscoveryScope {
  FULL_SCAN = "full_scan",
  INCREMENTAL = "incremental",
  TARGETED = "targeted",
  SAMPLE_BASED = "sample_based"
}

export enum ClassificationConfidence {
  HIGH = "high",        // 90-100%
  MEDIUM = "medium",    // 70-89%
  LOW = "low",          // 50-69%
  UNCERTAIN = "uncertain" // <50%
}

export enum SchemaChangeType {
  COLUMN_ADDED = "column_added",
  COLUMN_REMOVED = "column_removed",
  COLUMN_RENAMED = "column_renamed",
  DATA_TYPE_CHANGED = "data_type_changed",
  CONSTRAINT_ADDED = "constraint_added",
  CONSTRAINT_REMOVED = "constraint_removed",
  INDEX_ADDED = "index_added",
  INDEX_REMOVED = "index_removed"
}

// ========================= DISCOVERY INTERFACES =========================

export interface DiscoveryJob {
  id: string;
  name: string;
  description?: string;
  status: DiscoveryStatus;
  scope: DiscoveryScope;
  
  // Configuration
  data_source_ids: string[];
  discovery_methods: DiscoveryMethod[];
  include_patterns?: string[];
  exclude_patterns?: string[];
  
  // Scheduling
  schedule_expression?: string;
  is_scheduled: boolean;
  next_run?: string;
  
  // Progress Tracking
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  progress_percentage: number;
  
  // Results Summary
  assets_discovered: number;
  assets_updated: number;
  assets_failed: number;
  errors_count: number;
  
  // Metadata
  created_at: string;
  created_by: string;
  updated_at: string;
  
  // Configuration Details
  discovery_config: DiscoveryConfiguration;
  
  // Results
  discovery_results?: DiscoveryResult[];
  errors?: DiscoveryError[];
}

export interface DiscoveryConfiguration {
  // AI/ML Settings
  enable_ai_classification: boolean;
  enable_semantic_analysis: boolean;
  enable_pattern_detection: boolean;
  classification_threshold: number;
  
  // Profiling Settings
  enable_data_profiling: boolean;
  profiling_sample_size: number;
  max_profiling_records: number;
  
  // Schema Analysis
  enable_schema_analysis: boolean;
  detect_schema_changes: boolean;
  schema_comparison_baseline?: string;
  
  // Performance Settings
  max_concurrent_connections: number;
  query_timeout_seconds: number;
  batch_size: number;
  
  // Quality Assessment
  enable_quality_assessment: boolean;
  quality_rules: string[];
  
  // Notification Settings
  notify_on_completion: boolean;
  notify_on_errors: boolean;
  notification_recipients: string[];
  
  // Advanced Options
  custom_classifiers?: Record<string, any>;
  metadata_extraction_rules?: Record<string, any>;
  lineage_detection_enabled: boolean;
}

export interface DiscoveryResult {
  id: string;
  discovery_job_id: string;
  
  // Asset Information
  asset_name: string;
  asset_type: AssetType;
  full_qualified_name: string;
  
  // Discovery Details
  discovery_method: DiscoveryMethod;
  discovery_confidence: number;
  discovery_timestamp: string;
  
  // Classification Results
  ai_classifications: ClassificationResult[];
  detected_patterns: PatternDetectionResult[];
  
  // Schema Information
  schema_metadata: SchemaMetadata;
  column_metadata: ColumnMetadata[];
  
  // Data Profiling
  profiling_summary?: ProfilingSummary;
  
  // Quality Assessment
  quality_assessment?: QualityAssessmentSummary;
  
  // Lineage Information
  detected_lineage?: LineageDetectionResult[];
  
  // Status
  processing_status: 'success' | 'partial' | 'failed';
  error_messages?: string[];
}

export interface ClassificationResult {
  classifier_name: string;
  classifier_version: string;
  classification_label: string;
  confidence_score: number;
  confidence_level: ClassificationConfidence;
  
  // Evidence
  evidence: Record<string, any>;
  features_used: string[];
  
  // Context
  applies_to_asset: boolean;
  applies_to_columns?: string[];
  
  // Metadata
  classification_timestamp: string;
  model_version: string;
}

export interface PatternDetectionResult {
  pattern_name: string;
  pattern_type: string;
  confidence_score: number;
  
  // Pattern Details
  pattern_description: string;
  regex_pattern?: string;
  example_values: string[];
  
  // Scope
  detected_in_columns?: string[];
  sample_matches: number;
  total_records_analyzed: number;
  
  // Metadata
  detection_timestamp: string;
  detector_version: string;
}

export interface SchemaMetadata {
  schema_name?: string;
  table_name: string;
  table_type: string;
  
  // Physical Properties
  row_count?: number;
  size_bytes?: number;
  last_modified?: string;
  
  // Schema Properties
  column_count: number;
  primary_key_columns?: string[];
  foreign_key_relations?: ForeignKeyRelation[];
  indexes?: IndexMetadata[];
  
  // Change Detection
  schema_fingerprint: string;
  changes_detected?: SchemaChange[];
  
  // Lineage Hints
  potential_source_tables?: string[];
  potential_target_tables?: string[];
}

export interface ColumnMetadata {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  
  // Constraints
  max_length?: number;
  precision?: number;
  scale?: number;
  default_value?: string;
  
  // Classification
  ai_classifications?: ClassificationResult[];
  detected_patterns?: PatternDetectionResult[];
  
  // Profiling Summary
  profiling_stats?: ColumnProfilingStats;
  
  // Business Context
  business_meaning?: string;
  potential_glossary_terms?: string[];
}

export interface ForeignKeyRelation {
  foreign_key_name: string;
  local_columns: string[];
  referenced_table: string;
  referenced_columns: string[];
  constraint_type: string;
}

export interface IndexMetadata {
  index_name: string;
  index_type: string;
  columns: string[];
  is_unique: boolean;
  is_clustered?: boolean;
}

export interface SchemaChange {
  change_type: SchemaChangeType;
  element_name: string;
  old_value?: any;
  new_value?: any;
  change_timestamp: string;
  impact_assessment: string;
}

export interface ProfilingSummary {
  profiling_timestamp: string;
  records_analyzed: number;
  profiling_duration_ms: number;
  
  // Overall Statistics
  completeness_score: number;
  uniqueness_score: number;
  validity_score: number;
  
  // Data Distribution
  null_records: number;
  unique_records: number;
  duplicate_records: number;
  
  // Quality Issues
  quality_issues: QualityIssue[];
  data_anomalies: DataAnomaly[];
  
  // Column Statistics
  column_profiles: ColumnProfilingStats[];
}

export interface ColumnProfilingStats {
  column_name: string;
  data_type: string;
  
  // Basic Statistics
  null_count: number;
  null_percentage: number;
  unique_count: number;
  unique_percentage: number;
  
  // Data Type Analysis
  inferred_type: string;
  type_confidence: number;
  format_patterns: string[];
  
  // Value Analysis
  min_value?: any;
  max_value?: any;
  most_frequent_values: Array<{ value: any; count: number }>;
  
  // String Analysis
  min_length?: number;
  max_length?: number;
  avg_length?: number;
  
  // Numeric Analysis
  mean?: number;
  median?: number;
  std_deviation?: number;
  quartiles?: number[];
  
  // Quality Indicators
  outliers: any[];
  suspicious_values: any[];
  validation_errors: string[];
}

export interface QualityIssue {
  issue_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affected_columns?: string[];
  affected_records?: number;
  suggested_actions: string[];
}

export interface DataAnomaly {
  anomaly_type: string;
  confidence_score: number;
  description: string;
  affected_columns: string[];
  evidence: Record<string, any>;
  potential_causes: string[];
}

export interface QualityAssessmentSummary {
  overall_score: number;
  assessment_timestamp: string;
  
  // Dimension Scores
  completeness_score: number;
  accuracy_score: number;
  consistency_score: number;
  validity_score: number;
  uniqueness_score: number;
  timeliness_score: number;
  
  // Issues Summary
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  
  // Recommendations
  improvement_recommendations: string[];
  priority_actions: string[];
}

export interface LineageDetectionResult {
  relationship_type: 'upstream' | 'downstream';
  related_asset: string;
  confidence_score: number;
  
  // Evidence
  detection_method: string;
  evidence_type: 'query_analysis' | 'metadata_analysis' | 'naming_convention';
  evidence_details: Record<string, any>;
  
  // Relationship Details
  transformation_logic?: string;
  column_mappings?: Array<{
    source_column: string;
    target_column: string;
    transformation?: string;
  }>;
}

export interface DiscoveryError {
  id: string;
  discovery_job_id: string;
  error_type: string;
  error_code: string;
  error_message: string;
  
  // Context
  affected_asset?: string;
  affected_operation: string;
  error_timestamp: string;
  
  // Technical Details
  stack_trace?: string;
  retry_count: number;
  is_retryable: boolean;
  
  // Resolution
  resolution_status: 'pending' | 'investigating' | 'resolved' | 'ignored';
  resolution_notes?: string;
}

// ========================= REQUEST/RESPONSE TYPES =========================

export interface DiscoveryJobCreateRequest {
  name: string;
  description?: string;
  data_source_ids: string[];
  discovery_methods: DiscoveryMethod[];
  scope: DiscoveryScope;
  
  // Optional Configuration
  include_patterns?: string[];
  exclude_patterns?: string[];
  schedule_expression?: string;
  discovery_config?: Partial<DiscoveryConfiguration>;
}

export interface DiscoveryJobUpdateRequest {
  name?: string;
  description?: string;
  discovery_methods?: DiscoveryMethod[];
  include_patterns?: string[];
  exclude_patterns?: string[];
  schedule_expression?: string;
  discovery_config?: Partial<DiscoveryConfiguration>;
}

export interface DiscoveryJobResponse {
  job: DiscoveryJob;
  execution_history?: DiscoveryExecution[];
  recent_results?: DiscoveryResult[];
}

export interface DiscoveryExecution {
  id: string;
  job_id: string;
  execution_timestamp: string;
  status: DiscoveryStatus;
  duration_seconds?: number;
  assets_discovered: number;
  errors_count: number;
}

export interface DiscoverySearchRequest {
  query?: string;
  asset_types?: AssetType[];
  discovery_methods?: DiscoveryMethod[];
  confidence_threshold?: number;
  
  // Classification Filters
  classifications?: string[];
  classification_confidence?: ClassificationConfidence[];
  
  // Time Filters
  discovered_after?: string;
  discovered_before?: string;
  
  // Pagination
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface DiscoverySearchResponse {
  results: DiscoveryResult[];
  total_count: number;
  facets: {
    asset_types: Record<AssetType, number>;
    discovery_methods: Record<DiscoveryMethod, number>;
    classifications: Record<string, number>;
    confidence_levels: Record<ClassificationConfidence, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface IncrementalDiscoveryRequest {
  base_discovery_job_id?: string;
  since_timestamp?: string;
  detect_changes_only: boolean;
  change_detection_sensitivity: 'high' | 'medium' | 'low';
}

export interface SchemaComparisonRequest {
  baseline_discovery_id: string;
  current_discovery_id: string;
  comparison_scope: 'full' | 'structure_only' | 'data_only';
}

export interface SchemaComparisonResponse {
  comparison_id: string;
  baseline_snapshot: string;
  current_snapshot: string;
  
  changes_summary: {
    total_changes: number;
    breaking_changes: number;
    additions: number;
    modifications: number;
    deletions: number;
  };
  
  detailed_changes: SchemaChange[];
  impact_analysis: {
    potentially_affected_assets: string[];
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    recommended_actions: string[];
  };
}

// ========================= ANALYTICS TYPES =========================

export interface DiscoveryAnalytics {
  time_period: {
    start_date: string;
    end_date: string;
  };
  
  // Job Statistics
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  avg_discovery_time: number;
  
  // Asset Discovery
  total_assets_discovered: number;
  assets_by_type: Record<AssetType, number>;
  assets_by_method: Record<DiscoveryMethod, number>;
  
  // Quality Metrics
  avg_classification_confidence: number;
  high_confidence_classifications: number;
  quality_issues_detected: number;
  
  // Trends
  discovery_trends: Array<{
    date: string;
    assets_discovered: number;
    jobs_completed: number;
  }>;
  
  // Performance
  performance_metrics: {
    avg_assets_per_minute: number;
    peak_discovery_rate: number;
    resource_utilization: Record<string, number>;
  };
}

export interface ClassificationAnalytics {
  classifier_performance: Array<{
    classifier_name: string;
    total_classifications: number;
    avg_confidence: number;
    accuracy_rate?: number;
    false_positive_rate?: number;
  }>;
  
  classification_distribution: Record<string, number>;
  confidence_distribution: Record<ClassificationConfidence, number>;
  
  trending_classifications: Array<{
    classification: string;
    growth_rate: number;
    current_count: number;
  }>;
}

// ========================= UTILITY TYPES =========================

export type DiscoveryEventType = 
  | 'job_started'
  | 'job_completed'
  | 'job_failed'
  | 'asset_discovered'
  | 'classification_applied'
  | 'pattern_detected'
  | 'quality_issue_found'
  | 'schema_change_detected';

export interface DiscoveryEvent {
  id: string;
  event_type: DiscoveryEventType;
  timestamp: string;
  job_id?: string;
  asset_id?: string;
  
  // Event Data
  event_data: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  // Context
  user_id?: string;
  data_source_id?: string;
  
  // Notification
  requires_notification: boolean;
  notification_sent: boolean;
}

export type DiscoveryFilter = {
  jobs?: string[];
  statuses?: DiscoveryStatus[];
  methods?: DiscoveryMethod[];
  asset_types?: AssetType[];
  date_range?: {
    start: string;
    end: string;
  };
};

export default {
  DiscoveryStatus,
  DiscoveryScope,
  ClassificationConfidence,
  SchemaChangeType
};