/**
 * Advanced Catalog Discovery Types - Backend Integration
 * ===================================================
 * 
 * This file provides specialized TypeScript types for AI-powered asset discovery,
 * mapping to the intelligent_discovery_service.py backend implementation.
 * 
 * Features:
 * - AI-powered asset discovery and classification
 * - Schema analysis and semantic understanding
 * - Pattern detection and matching
 * - Automated metadata enrichment
 * - Real-time discovery monitoring
 */

import { AssetType, AssetStatus, DiscoveryMethod, DataSensitivity, AssetCriticality } from './catalog-core.types'

// ===================== DISCOVERY ENGINE TYPES =====================

export interface DiscoveryEngine {
  engine_id: string
  engine_name: string
  engine_type: 'AI_DISCOVERY' | 'PATTERN_MATCHING' | 'SCHEMA_INFERENCE' | 'METADATA_EXTRACTION'
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ERROR'
  configuration: DiscoveryEngineConfig
  performance_metrics: DiscoveryPerformanceMetrics
  last_run_at?: string
  next_scheduled_run?: string
}

export interface DiscoveryEngineConfig {
  discovery_methods: DiscoveryMethod[]
  source_systems: string[]
  asset_types: AssetType[]
  confidence_threshold: number
  max_discovery_depth: number
  enable_ai_classification: boolean
  enable_semantic_analysis: boolean
  enable_lineage_inference: boolean
  sampling_rate: number
  batch_size: number
  parallel_workers: number
  retry_attempts: number
  timeout_seconds: number
}

export interface DiscoveryPerformanceMetrics {
  total_assets_discovered: number
  discovery_rate_per_hour: number
  average_processing_time_ms: number
  accuracy_score: number
  false_positive_rate: number
  false_negative_rate: number
  confidence_distribution: Record<string, number>
  error_rate: number
  throughput_mbps: number
}

// ===================== DISCOVERY JOB TYPES =====================

export interface DiscoveryJob {
  job_id: string
  job_name: string
  job_type: 'FULL_DISCOVERY' | 'INCREMENTAL_DISCOVERY' | 'TARGETED_DISCOVERY' | 'VALIDATION_DISCOVERY'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PAUSED'
  
  // Configuration
  source_config: DiscoverySourceConfig
  discovery_config: DiscoveryJobConfig
  
  // Progress tracking
  progress: DiscoveryProgress
  
  // Results
  results?: DiscoveryJobResults
  
  // Scheduling
  schedule_config?: DiscoveryScheduleConfig
  
  // Audit
  created_at: string
  created_by: string
  started_at?: string
  completed_at?: string
  
  // Error handling
  error_message?: string
  retry_count: number
  
  // Dependencies
  depends_on_jobs: string[]
  dependent_jobs: string[]
}

export interface DiscoverySourceConfig {
  source_id: string
  source_name: string
  source_type: string
  connection_config: Record<string, any>
  authentication_config: Record<string, any>
  scan_patterns: string[]
  exclude_patterns: string[]
  include_schemas?: string[]
  exclude_schemas?: string[]
  custom_filters: Record<string, any>
}

export interface DiscoveryJobConfig {
  discovery_engines: string[]
  confidence_threshold: number
  max_assets_per_batch: number
  enable_deep_analysis: boolean
  enable_lineage_discovery: boolean
  enable_quality_profiling: boolean
  enable_business_context_extraction: boolean
  custom_rules: DiscoveryRule[]
  notification_config: DiscoveryNotificationConfig
}

export interface DiscoveryRule {
  rule_id: string
  rule_name: string
  rule_type: 'CLASSIFICATION' | 'PATTERN_MATCHING' | 'QUALITY_CHECK' | 'LINEAGE_DETECTION'
  condition: string
  action: DiscoveryAction
  priority: number
  enabled: boolean
}

export interface DiscoveryAction {
  action_type: 'CLASSIFY' | 'TAG' | 'ALERT' | 'EXCLUDE' | 'PRIORITIZE'
  parameters: Record<string, any>
}

export interface DiscoveryNotificationConfig {
  notify_on_completion: boolean
  notify_on_errors: boolean
  notify_on_anomalies: boolean
  notification_channels: string[]
  custom_notifications: CustomNotification[]
}

export interface CustomNotification {
  trigger_condition: string
  notification_template: string
  recipients: string[]
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

// ===================== DISCOVERY PROGRESS TYPES =====================

export interface DiscoveryProgress {
  phase: 'INITIALIZATION' | 'CONNECTION' | 'SCANNING' | 'ANALYSIS' | 'CLASSIFICATION' | 'LINEAGE' | 'FINALIZATION'
  overall_progress_percentage: number
  phase_progress_percentage: number
  
  // Counters
  total_sources_to_scan: number
  sources_scanned: number
  total_assets_found: number
  assets_processed: number
  assets_classified: number
  assets_with_lineage: number
  
  // Performance
  start_time: string
  estimated_completion_time?: string
  processing_rate_per_minute: number
  
  // Current activity
  current_activity: string
  current_source?: string
  current_asset?: string
  
  // Issues
  warnings: DiscoveryWarning[]
  errors: DiscoveryError[]
}

export interface DiscoveryWarning {
  warning_id: string
  warning_type: string
  message: string
  source?: string
  asset?: string
  timestamp: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface DiscoveryError {
  error_id: string
  error_type: string
  error_code: string
  message: string
  source?: string
  asset?: string
  timestamp: string
  stack_trace?: string
  resolution_suggestion?: string
}

// ===================== DISCOVERY RESULTS TYPES =====================

export interface DiscoveryJobResults {
  summary: DiscoveryResultSummary
  discovered_assets: DiscoveredAsset[]
  updated_assets: UpdatedAsset[]
  discovered_lineage: DiscoveredLineage[]
  quality_assessments: DiscoveredQualityAssessment[]
  business_context: DiscoveredBusinessContext[]
  anomalies: DiscoveryAnomaly[]
  recommendations: DiscoveryRecommendation[]
}

export interface DiscoveryResultSummary {
  total_assets_discovered: number
  new_assets_count: number
  updated_assets_count: number
  deprecated_assets_count: number
  lineage_connections_found: number
  quality_issues_detected: number
  business_terms_associated: number
  
  // Quality metrics
  discovery_accuracy: number
  confidence_distribution: Record<string, number>
  processing_statistics: ProcessingStatistics
  
  // Performance
  total_processing_time_ms: number
  average_asset_processing_time_ms: number
  peak_memory_usage_mb: number
  network_data_transferred_mb: number
}

export interface ProcessingStatistics {
  assets_by_type: Record<AssetType, number>
  assets_by_source: Record<string, number>
  assets_by_discovery_method: Record<DiscoveryMethod, number>
  assets_by_confidence_level: Record<string, number>
  processing_errors_by_type: Record<string, number>
}

export interface DiscoveredAsset {
  temporary_id: string
  qualified_name: string
  display_name: string
  asset_type: AssetType
  source_system: string
  discovery_method: DiscoveryMethod
  confidence_score: number
  
  // Metadata discovered
  technical_metadata: Record<string, any>
  schema_metadata?: Record<string, any>
  business_metadata?: Record<string, any>
  
  // AI-generated insights
  ai_generated_description?: string
  ai_suggested_tags: string[]
  ai_classification_labels: string[]
  
  // Inferred properties
  inferred_sensitivity: DataSensitivity
  inferred_criticality: AssetCriticality
  inferred_owner?: string
  inferred_stewards: string[]
  
  // Discovery context
  discovery_timestamp: string
  source_location: string
  discovery_rules_applied: string[]
  
  // Validation
  validation_status: 'PENDING' | 'VALIDATED' | 'REJECTED' | 'NEEDS_REVIEW'
  validation_comments?: string
  validation_score?: number
}

export interface UpdatedAsset {
  asset_id: number
  qualified_name: string
  changes_detected: AssetChange[]
  metadata_updates: Record<string, any>
  discovery_timestamp: string
  change_confidence: number
  requires_approval: boolean
}

export interface AssetChange {
  change_type: 'METADATA_UPDATE' | 'SCHEMA_CHANGE' | 'STATUS_CHANGE' | 'LINEAGE_UPDATE' | 'CLASSIFICATION_UPDATE'
  field_name: string
  old_value: any
  new_value: any
  confidence_score: number
  change_reason: string
}

export interface DiscoveredLineage {
  source_asset_qualified_name: string
  target_asset_qualified_name: string
  lineage_type: string
  transformation_logic?: string
  confidence_score: number
  discovery_method: DiscoveryMethod
  supporting_evidence: LineageEvidence[]
}

export interface LineageEvidence {
  evidence_type: 'SQL_ANALYSIS' | 'ETL_CONFIG' | 'API_CALL' | 'FILE_DEPENDENCY' | 'SEMANTIC_SIMILARITY'
  evidence_details: Record<string, any>
  confidence_contribution: number
  source_location?: string
}

export interface DiscoveredQualityAssessment {
  asset_qualified_name: string
  quality_score: number
  quality_dimensions: Record<string, number>
  quality_issues: DiscoveredQualityIssue[]
  profiling_results: DiscoveredProfilingResult
  recommendations: QualityRecommendation[]
}

export interface DiscoveredQualityIssue {
  issue_type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  affected_columns?: string[]
  estimated_impact: string
  suggested_resolution: string
}

export interface DiscoveredProfilingResult {
  row_count: number
  column_count: number
  null_percentage: number
  duplicate_percentage: number
  data_types: Record<string, string>
  sample_values: Record<string, any[]>
  value_distributions: Record<string, any>
}

export interface DiscoveredBusinessContext {
  asset_qualified_name: string
  business_terms: DiscoveredBusinessTerm[]
  business_rules: string[]
  stakeholders: DiscoveredStakeholder[]
  usage_patterns: DiscoveredUsagePattern[]
}

export interface DiscoveredBusinessTerm {
  term_name: string
  confidence_score: number
  context: string
  association_type: 'PRIMARY' | 'SECONDARY' | 'CONTEXTUAL'
  supporting_evidence: string[]
}

export interface DiscoveredStakeholder {
  stakeholder_id: string
  stakeholder_name: string
  role: string
  relationship_type: 'OWNER' | 'STEWARD' | 'USER' | 'APPROVER'
  confidence_score: number
}

export interface DiscoveredUsagePattern {
  pattern_type: string
  frequency: string
  peak_times: string[]
  user_groups: string[]
  access_methods: string[]
}

// ===================== DISCOVERY ANOMALY TYPES =====================

export interface DiscoveryAnomaly {
  anomaly_id: string
  anomaly_type: 'SCHEMA_ANOMALY' | 'DATA_ANOMALY' | 'LINEAGE_ANOMALY' | 'QUALITY_ANOMALY' | 'PATTERN_ANOMALY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  affected_assets: string[]
  detection_method: string
  confidence_score: number
  
  // Context
  discovery_context: Record<string, any>
  historical_comparison?: Record<string, any>
  
  // Resolution
  suggested_actions: string[]
  requires_investigation: boolean
  auto_resolvable: boolean
  
  // Metadata
  detected_at: string
  last_seen_at: string
  occurrence_count: number
}

// ===================== DISCOVERY RECOMMENDATION TYPES =====================

export interface DiscoveryRecommendation {
  recommendation_id: string
  category: 'DATA_QUALITY' | 'GOVERNANCE' | 'PERFORMANCE' | 'SECURITY' | 'OPTIMIZATION'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  title: string
  description: string
  
  // Scope
  affected_assets: string[]
  scope: 'ASSET' | 'SOURCE_SYSTEM' | 'CATALOG' | 'ORGANIZATION'
  
  // Action plan
  recommended_actions: RecommendedAction[]
  estimated_effort: string
  expected_benefits: string[]
  
  // Business impact
  business_impact_score: number
  risk_mitigation_score: number
  compliance_impact: string
  
  // Implementation
  implementation_complexity: 'LOW' | 'MEDIUM' | 'HIGH'
  prerequisites: string[]
  dependencies: string[]
  
  // Tracking
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED'
  assigned_to?: string
  due_date?: string
  
  // Context
  generated_at: string
  confidence_score: number
  supporting_data: Record<string, any>
}

export interface RecommendedAction {
  action_id: string
  action_type: string
  description: string
  parameters: Record<string, any>
  estimated_effort_hours: number
  automation_possible: boolean
  requires_approval: boolean
}

// ===================== DISCOVERY SCHEDULE TYPES =====================

export interface DiscoveryScheduleConfig {
  schedule_type: 'ONCE' | 'RECURRING' | 'TRIGGER_BASED' | 'CONTINUOUS'
  schedule_expression?: string // Cron expression for recurring
  trigger_conditions?: DiscoveryTrigger[]
  timezone: string
  
  // Recurring options
  start_date?: string
  end_date?: string
  max_executions?: number
  
  // Advanced scheduling
  dependencies: ScheduleDependency[]
  resource_requirements: ResourceRequirement[]
  execution_window?: ExecutionWindow
}

export interface DiscoveryTrigger {
  trigger_type: 'DATA_CHANGE' | 'SCHEMA_CHANGE' | 'TIME_BASED' | 'EVENT_BASED' | 'MANUAL'
  trigger_config: Record<string, any>
  cooldown_period_minutes?: number
}

export interface ScheduleDependency {
  dependency_type: 'JOB_COMPLETION' | 'DATA_AVAILABILITY' | 'SYSTEM_STATUS' | 'APPROVAL'
  dependency_target: string
  wait_timeout_minutes?: number
}

export interface ResourceRequirement {
  resource_type: 'CPU' | 'MEMORY' | 'STORAGE' | 'NETWORK' | 'DATABASE_CONNECTION'
  min_required: number
  max_allowed: number
  unit: string
}

export interface ExecutionWindow {
  start_time: string // HH:MM format
  end_time: string   // HH:MM format
  allowed_days: string[] // Monday, Tuesday, etc.
  timezone: string
}

// ===================== DISCOVERY MONITORING TYPES =====================

export interface DiscoveryMonitoring {
  monitor_id: string
  monitor_name: string
  monitor_type: 'JOB_MONITORING' | 'PERFORMANCE_MONITORING' | 'QUALITY_MONITORING' | 'ANOMALY_MONITORING'
  
  // Configuration
  monitoring_config: DiscoveryMonitoringConfig
  alert_config: DiscoveryAlertConfig
  
  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'ERROR'
  last_check_at?: string
  next_check_at?: string
  
  // Metrics
  metrics_collected: DiscoveryMetric[]
  alert_history: DiscoveryAlert[]
}

export interface DiscoveryMonitoringConfig {
  check_interval_minutes: number
  metrics_to_collect: string[]
  thresholds: Record<string, number>
  baseline_period_days: number
  anomaly_detection_enabled: boolean
  trend_analysis_enabled: boolean
}

export interface DiscoveryAlertConfig {
  alert_channels: string[]
  severity_thresholds: Record<string, number>
  escalation_rules: EscalationRule[]
  notification_templates: Record<string, string>
  rate_limiting: AlertRateLimit
}

export interface EscalationRule {
  condition: string
  escalation_delay_minutes: number
  escalation_targets: string[]
  escalation_template: string
}

export interface AlertRateLimit {
  max_alerts_per_hour: number
  max_alerts_per_day: number
  duplicate_suppression_minutes: number
}

export interface DiscoveryMetric {
  metric_name: string
  metric_value: number
  metric_unit: string
  measurement_timestamp: string
  context: Record<string, any>
}

export interface DiscoveryAlert {
  alert_id: string
  alert_type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  triggered_at: string
  resolved_at?: string
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED'
  
  // Context
  trigger_condition: string
  affected_components: string[]
  metric_values: Record<string, number>
  
  // Resolution
  resolution_notes?: string
  resolved_by?: string
  auto_resolved: boolean
}

// ===================== EXPORT ALL DISCOVERY TYPES =====================

export type {
  DiscoveryEngine,
  DiscoveryEngineConfig,
  DiscoveryPerformanceMetrics,
  DiscoveryJob,
  DiscoverySourceConfig,
  DiscoveryJobConfig,
  DiscoveryRule,
  DiscoveryAction,
  DiscoveryNotificationConfig,
  CustomNotification,
  DiscoveryProgress,
  DiscoveryWarning,
  DiscoveryError,
  DiscoveryJobResults,
  DiscoveryResultSummary,
  ProcessingStatistics,
  DiscoveredAsset,
  UpdatedAsset,
  AssetChange,
  DiscoveredLineage,
  LineageEvidence,
  DiscoveredQualityAssessment,
  DiscoveredQualityIssue,
  DiscoveredProfilingResult,
  DiscoveredBusinessContext,
  DiscoveredBusinessTerm,
  DiscoveredStakeholder,
  DiscoveredUsagePattern,
  DiscoveryAnomaly,
  DiscoveryRecommendation,
  RecommendedAction,
  DiscoveryScheduleConfig,
  DiscoveryTrigger,
  ScheduleDependency,
  ResourceRequirement,
  ExecutionWindow,
  DiscoveryMonitoring,
  DiscoveryMonitoringConfig,
  DiscoveryAlertConfig,
  EscalationRule,
  AlertRateLimit,
  DiscoveryMetric,
  DiscoveryAlert
}