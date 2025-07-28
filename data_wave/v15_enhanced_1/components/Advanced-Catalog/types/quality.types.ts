/**
 * Advanced Catalog Quality Types - Backend Integration
 * ==================================================
 * 
 * This file provides specialized TypeScript types for data quality management,
 * mapping to the catalog_quality_service.py backend implementation.
 * 
 * Features:
 * - Comprehensive quality assessment and monitoring
 * - Rule-based quality validation
 * - Quality trend analysis and reporting
 * - Automated quality improvement recommendations
 * - Real-time quality alerting
 */

import { AssetType, DataQuality } from './catalog-core.types'

// ===================== QUALITY RULE TYPES =====================

export interface QualityRule {
  rule_id: string
  rule_name: string
  rule_type: 'COMPLETENESS' | 'ACCURACY' | 'CONSISTENCY' | 'VALIDITY' | 'UNIQUENESS' | 'TIMELINESS' | 'CUSTOM'
  description: string
  
  // Rule definition
  sql_expression?: string
  python_expression?: string
  regex_pattern?: string
  threshold_value?: number
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_EQUAL' | 'LESS_EQUAL' | 'BETWEEN' | 'NOT_BETWEEN' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'NOT_CONTAINS' | 'MATCHES' | 'NOT_MATCHES'
  expected_value?: any
  
  // Scope and application
  applicable_asset_types: AssetType[]
  applicable_columns?: string[]
  column_patterns?: string[]
  data_type_filters?: string[]
  
  // Severity and impact
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  business_impact: string
  technical_impact: string
  
  // Execution configuration
  execution_frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND'
  sample_size?: number
  timeout_seconds: number
  retry_attempts: number
  
  // Status and metadata
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'DEPRECATED'
  created_at: string
  created_by: string
  updated_at: string
  last_modified_by: string
  version: number
  
  // Performance metrics
  execution_count: number
  average_execution_time_ms: number
  success_rate: number
  last_execution_at?: string
}

export interface QualityRuleExecution {
  execution_id: string
  rule_id: string
  asset_id: number
  execution_timestamp: string
  
  // Execution context
  execution_type: 'SCHEDULED' | 'MANUAL' | 'TRIGGERED' | 'VALIDATION'
  execution_trigger: string
  
  // Results
  execution_status: 'SUCCESS' | 'FAILURE' | 'TIMEOUT' | 'ERROR'
  rule_passed: boolean
  actual_value?: any
  expected_value?: any
  deviation_percentage?: number
  
  // Performance
  execution_duration_ms: number
  rows_evaluated: number
  rows_failed?: number
  
  // Error handling
  error_message?: string
  error_code?: string
  stack_trace?: string
  
  // Context
  execution_context: Record<string, any>
  metadata: Record<string, any>
}

// ===================== QUALITY ASSESSMENT TYPES =====================

export interface QualityAssessment {
  assessment_id: string
  asset_id: number
  assessment_timestamp: string
  assessment_type: 'AUTOMATED' | 'MANUAL' | 'HYBRID' | 'CONTINUOUS'
  
  // Overall quality metrics
  overall_score: number
  quality_level: DataQuality
  previous_score?: number
  score_change: number
  score_trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'VOLATILE'
  
  // Dimension scores (0-100)
  completeness_score: number
  accuracy_score: number
  consistency_score: number
  validity_score: number
  uniqueness_score: number
  timeliness_score: number
  
  // Dimension details
  dimension_assessments: QualityDimensionAssessment[]
  
  // Rule-based results
  rules_evaluated: QualityRuleResult[]
  rules_passed: number
  rules_failed: number
  critical_failures: number
  warnings: number
  
  // Issues and findings
  quality_issues: QualityIssue[]
  severity_distribution: Record<string, number>
  
  // Recommendations
  recommendations: QualityRecommendation[]
  action_items: QualityActionItem[]
  
  // Assessment metadata
  assessment_method: string
  assessment_duration_ms: number
  data_sample_size: number
  sampling_method: string
  confidence_level: number
  
  // Comparison data
  historical_comparison?: HistoricalQualityComparison
  peer_comparison?: PeerQualityComparison
  benchmark_comparison?: BenchmarkQualityComparison
  
  // Review and approval
  review_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUIRES_REVIEW'
  reviewed_by?: string
  reviewed_at?: string
  review_comments?: string
  
  // Next assessment
  next_assessment_due: string
  assessment_frequency: string
}

export interface QualityDimensionAssessment {
  dimension: 'COMPLETENESS' | 'ACCURACY' | 'CONSISTENCY' | 'VALIDITY' | 'UNIQUENESS' | 'TIMELINESS'
  score: number
  weight: number
  weighted_score: number
  
  // Detailed metrics
  metrics: QualityMetric[]
  
  // Issues specific to this dimension
  issues: QualityIssue[]
  
  // Improvement potential
  improvement_potential: number
  recommended_actions: string[]
}

export interface QualityMetric {
  metric_name: string
  metric_value: number
  metric_unit: string
  metric_type: 'PERCENTAGE' | 'COUNT' | 'RATIO' | 'SCORE' | 'DURATION' | 'SIZE'
  target_value?: number
  threshold_value?: number
  variance_percentage?: number
  
  // Context
  calculation_method: string
  data_points_evaluated: number
  confidence_interval?: number
  
  // Trend data
  historical_values?: Array<{ timestamp: string; value: number }>
  trend_direction: 'UP' | 'DOWN' | 'STABLE'
}

export interface QualityRuleResult {
  rule_id: string
  rule_name: string
  rule_type: string
  passed: boolean
  score: number
  actual_value?: any
  expected_value?: any
  threshold_value?: number
  
  // Context
  affected_rows: number
  total_rows_evaluated: number
  failure_percentage: number
  
  // Details
  error_details?: string
  sample_failures?: any[]
  
  // Performance
  execution_time_ms: number
}

// ===================== QUALITY ISSUE TYPES =====================

export interface QualityIssue {
  issue_id: string
  issue_type: string
  category: 'DATA_COMPLETENESS' | 'DATA_ACCURACY' | 'DATA_CONSISTENCY' | 'DATA_VALIDITY' | 'DATA_UNIQUENESS' | 'DATA_TIMELINESS' | 'SCHEMA_ISSUE' | 'BUSINESS_RULE_VIOLATION'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED' | 'DISMISSED'
  
  // Description
  title: string
  description: string
  business_impact: string
  technical_impact: string
  
  // Scope
  affected_assets: string[]
  affected_columns: string[]
  affected_rows_count: number
  affected_data_percentage: number
  
  // Root cause analysis
  root_cause?: string
  contributing_factors: string[]
  
  // Resolution
  resolution_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  estimated_effort: string
  resolution_complexity: 'LOW' | 'MEDIUM' | 'HIGH'
  suggested_resolution: string
  resolution_steps: string[]
  
  // Assignment and tracking
  assigned_to?: string
  assigned_at?: string
  due_date?: string
  
  // Resolution tracking
  resolution_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED'
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
  verification_notes?: string
  
  // Recurrence tracking
  first_detected_at: string
  last_detected_at: string
  occurrence_count: number
  recurrence_pattern?: string
  
  // Context and metadata
  detection_method: string
  confidence_score: number
  false_positive_probability: number
  metadata: Record<string, any>
}

export interface QualityRecommendation {
  recommendation_id: string
  category: 'IMMEDIATE_ACTION' | 'SHORT_TERM_IMPROVEMENT' | 'LONG_TERM_STRATEGY' | 'PREVENTIVE_MEASURE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  
  // Content
  title: string
  description: string
  rationale: string
  expected_benefits: string[]
  
  // Scope and impact
  scope: 'COLUMN' | 'TABLE' | 'DATABASE' | 'SYSTEM' | 'ORGANIZATION'
  affected_assets: string[]
  business_impact_score: number
  technical_impact_score: number
  
  // Implementation
  implementation_complexity: 'LOW' | 'MEDIUM' | 'HIGH'
  estimated_effort_hours: number
  estimated_cost?: number
  prerequisites: string[]
  dependencies: string[]
  
  // Actions
  recommended_actions: RecommendedQualityAction[]
  automation_potential: number
  automation_suggestions: string[]
  
  // Tracking
  status: 'OPEN' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'DEFERRED'
  assigned_to?: string
  accepted_at?: string
  started_at?: string
  completed_at?: string
  
  // Validation
  success_criteria: string[]
  validation_method: string
  expected_outcome: string
  
  // Context
  generated_at: string
  confidence_score: number
  supporting_data: Record<string, any>
}

export interface RecommendedQualityAction {
  action_id: string
  action_type: 'DATA_CLEANSING' | 'RULE_CREATION' | 'PROCESS_IMPROVEMENT' | 'SYSTEM_CONFIGURATION' | 'TRAINING' | 'MONITORING'
  description: string
  
  // Implementation details
  implementation_steps: string[]
  tools_required: string[]
  skills_required: string[]
  
  // Impact assessment
  expected_improvement_percentage: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  reversibility: boolean
  
  // Resource requirements
  effort_estimate_hours: number
  resource_requirements: string[]
  
  // Automation
  automatable: boolean
  automation_script?: string
  automation_tools: string[]
}

export interface QualityActionItem {
  action_id: string
  title: string
  description: string
  action_type: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  
  // Assignment
  assigned_to?: string
  assigned_by: string
  assigned_at: string
  due_date?: string
  
  // Status tracking
  status: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED'
  completion_percentage: number
  
  // Progress tracking
  started_at?: string
  completed_at?: string
  last_updated_at: string
  
  // Context
  related_issue_ids: string[]
  related_recommendation_ids: string[]
  related_asset_ids: number[]
  
  // Comments and updates
  comments: ActionItemComment[]
  status_updates: ActionItemStatusUpdate[]
  
  // Metadata
  estimated_effort_hours?: number
  actual_effort_hours?: number
  complexity: 'LOW' | 'MEDIUM' | 'HIGH'
  success_criteria: string[]
}

export interface ActionItemComment {
  comment_id: string
  comment_text: string
  author: string
  created_at: string
  comment_type: 'UPDATE' | 'QUESTION' | 'CLARIFICATION' | 'RESOLUTION'
}

export interface ActionItemStatusUpdate {
  update_id: string
  previous_status: string
  new_status: string
  reason: string
  updated_by: string
  updated_at: string
  completion_percentage: number
}

// ===================== QUALITY MONITORING TYPES =====================

export interface QualityMonitor {
  monitor_id: string
  monitor_name: string
  monitor_type: 'REAL_TIME' | 'BATCH' | 'CONTINUOUS' | 'EVENT_DRIVEN'
  
  // Configuration
  monitored_assets: number[]
  quality_rules: string[]
  thresholds: QualityThreshold[]
  
  // Scheduling
  schedule_config: QualityMonitorSchedule
  
  // Alerting
  alert_config: QualityAlertConfig
  
  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'ERROR'
  last_run_at?: string
  next_run_at?: string
  
  // Performance
  execution_statistics: MonitorExecutionStats
  
  // Metadata
  created_at: string
  created_by: string
  updated_at: string
}

export interface QualityThreshold {
  threshold_id: string
  metric_name: string
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'NOT_EQUALS' | 'BETWEEN'
  threshold_value: number
  upper_bound?: number
  lower_bound?: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  alert_enabled: boolean
}

export interface QualityMonitorSchedule {
  schedule_type: 'CRON' | 'INTERVAL' | 'EVENT_BASED'
  cron_expression?: string
  interval_minutes?: number
  event_triggers?: string[]
  timezone: string
}

export interface QualityAlertConfig {
  enabled: boolean
  alert_channels: string[]
  severity_filters: string[]
  escalation_rules: QualityEscalationRule[]
  notification_templates: Record<string, string>
  rate_limiting: QualityAlertRateLimit
}

export interface QualityEscalationRule {
  escalation_level: number
  trigger_condition: string
  escalation_delay_minutes: number
  escalation_targets: string[]
  escalation_template: string
}

export interface QualityAlertRateLimit {
  max_alerts_per_hour: number
  max_alerts_per_day: number
  duplicate_suppression_minutes: number
  burst_threshold: number
}

export interface MonitorExecutionStats {
  total_executions: number
  successful_executions: number
  failed_executions: number
  average_execution_time_ms: number
  last_execution_duration_ms?: number
  alerts_triggered: number
  false_positive_count: number
}

// ===================== QUALITY ALERT TYPES =====================

export interface QualityAlert {
  alert_id: string
  monitor_id: string
  alert_type: 'THRESHOLD_BREACH' | 'QUALITY_DEGRADATION' | 'RULE_FAILURE' | 'ANOMALY_DETECTED' | 'SYSTEM_ERROR'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  
  // Alert content
  title: string
  message: string
  description: string
  
  // Context
  triggered_by: string
  trigger_condition: string
  trigger_value?: number
  threshold_value?: number
  
  // Affected resources
  affected_assets: number[]
  affected_rules: string[]
  impact_assessment: string
  
  // Status and lifecycle
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED' | 'EXPIRED'
  triggered_at: string
  acknowledged_at?: string
  acknowledged_by?: string
  resolved_at?: string
  resolved_by?: string
  
  // Resolution
  resolution_notes?: string
  resolution_action?: string
  auto_resolved: boolean
  
  // Escalation
  escalation_level: number
  escalated_at?: string
  escalated_to?: string[]
  
  // Metadata
  metadata: Record<string, any>
  correlation_id?: string
  related_alerts: string[]
}

// ===================== QUALITY COMPARISON TYPES =====================

export interface HistoricalQualityComparison {
  comparison_period: string
  historical_scores: Array<{
    timestamp: string
    overall_score: number
    dimension_scores: Record<string, number>
  }>
  
  // Trend analysis
  score_trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'VOLATILE'
  trend_strength: number
  trend_confidence: number
  
  // Key insights
  significant_changes: QualityChange[]
  performance_summary: string
  recommendations: string[]
}

export interface QualityChange {
  change_type: 'IMPROVEMENT' | 'DEGRADATION' | 'SPIKE' | 'DIP'
  dimension: string
  change_magnitude: number
  change_date: string
  possible_causes: string[]
  impact_assessment: string
}

export interface PeerQualityComparison {
  peer_group: string
  peer_assets: number[]
  
  // Comparative metrics
  percentile_rank: number
  relative_score: number
  peer_average_score: number
  peer_median_score: number
  
  // Rankings
  quality_ranking: number
  total_peers: number
  better_than_percentage: number
  
  // Insights
  strengths: string[]
  improvement_areas: string[]
  best_practices_from_peers: string[]
}

export interface BenchmarkQualityComparison {
  benchmark_name: string
  benchmark_type: 'INDUSTRY' | 'INTERNAL' | 'REGULATORY' | 'CUSTOM'
  benchmark_score: number
  
  // Comparison results
  score_difference: number
  performance_level: 'EXCEEDS' | 'MEETS' | 'BELOW' | 'SIGNIFICANTLY_BELOW'
  compliance_status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT'
  
  // Gap analysis
  gaps_identified: QualityGap[]
  improvement_roadmap: string[]
  compliance_actions_required: string[]
}

export interface QualityGap {
  gap_area: string
  current_value: number
  benchmark_value: number
  gap_size: number
  gap_significance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  closure_recommendations: string[]
  estimated_effort: string
}

// ===================== EXPORT ALL QUALITY TYPES =====================

export type {
  QualityRule,
  QualityRuleExecution,
  QualityAssessment,
  QualityDimensionAssessment,
  QualityMetric,
  QualityRuleResult,
  QualityIssue,
  QualityRecommendation,
  RecommendedQualityAction,
  QualityActionItem,
  ActionItemComment,
  ActionItemStatusUpdate,
  QualityMonitor,
  QualityThreshold,
  QualityMonitorSchedule,
  QualityAlertConfig,
  QualityEscalationRule,
  QualityAlertRateLimit,
  MonitorExecutionStats,
  QualityAlert,
  HistoricalQualityComparison,
  QualityChange,
  PeerQualityComparison,
  BenchmarkQualityComparison,
  QualityGap
}