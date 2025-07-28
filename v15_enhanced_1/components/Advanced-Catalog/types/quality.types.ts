/**
 * Quality Management Types - Complete Backend Mapping
 * ==================================================
 * 
 * TypeScript types for comprehensive data quality management.
 * Maps to catalog_quality_service.py (1195+ lines) and catalog_quality_models.py (483+ lines)
 */

import { AssetType, DataQuality, QualityRuleType, MonitoringLevel, AlertSeverity } from './catalog-core.types';

// ========================= QUALITY ENUMS =========================

export enum QualityDimension {
  COMPLETENESS = "completeness",
  ACCURACY = "accuracy",
  CONSISTENCY = "consistency",
  VALIDITY = "validity",
  UNIQUENESS = "uniqueness",
  TIMELINESS = "timeliness",
  FRESHNESS = "freshness"
}

export enum QualityRuleStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DRAFT = "draft",
  DEPRECATED = "deprecated"
}

export enum QualityCheckType {
  THRESHOLD_CHECK = "threshold_check",
  PATTERN_CHECK = "pattern_check",
  REFERENCE_CHECK = "reference_check",
  STATISTICAL_CHECK = "statistical_check",
  CUSTOM_CHECK = "custom_check"
}

export enum QualityScoreType {
  WEIGHTED_AVERAGE = "weighted_average",
  MINIMUM_SCORE = "minimum_score",
  CUSTOM_FORMULA = "custom_formula"
}

export enum QualityTrendDirection {
  IMPROVING = "improving",
  DECLINING = "declining",
  STABLE = "stable",
  VOLATILE = "volatile"
}

export enum RemediationStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

// ========================= QUALITY RULE INTERFACES =========================

export interface QualityRule {
  id: string;
  rule_name: string;
  rule_type: QualityRuleType;
  quality_dimension: QualityDimension;
  description?: string;
  
  // Rule Definition
  rule_expression: string;
  check_type: QualityCheckType;
  threshold_value?: number;
  threshold_operator?: string;
  parameters?: Record<string, any>;
  
  // Scope Configuration
  applies_to_assets?: string[];
  applies_to_columns?: string[];
  asset_type_filter?: AssetType[];
  schema_filters?: string[];
  database_filters?: string[];
  
  // Execution Configuration
  monitoring_level: MonitoringLevel;
  execution_frequency?: string;
  execution_window?: string;
  timeout_seconds?: number;
  
  // Alerting Configuration
  alert_threshold?: number;
  alert_severity?: AlertSeverity;
  notification_settings?: NotificationSettings;
  
  // Rule Status
  status: QualityRuleStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  
  // Execution History
  last_execution?: string;
  next_execution?: string;
  execution_count?: number;
  success_rate?: number;
  
  // Performance Metrics
  avg_execution_time_ms?: number;
  resource_usage?: Record<string, any>;
  
  // Version Control
  version: string;
  parent_rule_id?: string;
  
  // Relationships
  executions?: QualityRuleExecution[];
  violations?: QualityViolation[];
}

export interface NotificationSettings {
  email_enabled: boolean;
  email_recipients: string[];
  slack_enabled?: boolean;
  slack_webhook?: string;
  teams_enabled?: boolean;
  teams_webhook?: string;
  custom_webhooks?: string[];
  
  // Notification Conditions
  notify_on_failure: boolean;
  notify_on_threshold_breach: boolean;
  notify_on_trend_change: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface QualityRuleExecution {
  id: string;
  rule_id: string;
  execution_timestamp: string;
  status: 'success' | 'failure' | 'error' | 'timeout';
  
  // Execution Details
  assets_evaluated: number;
  records_evaluated: number;
  execution_time_ms: number;
  
  // Results
  violations_found: number;
  quality_score: number;
  pass_rate: number;
  
  // Error Information
  error_message?: string;
  error_code?: string;
  
  // Performance
  resource_usage?: Record<string, any>;
  
  // Results Detail
  violations?: QualityViolation[];
  metrics?: QualityMetrics;
}

export interface QualityViolation {
  id: string;
  rule_id: string;
  execution_id: string;
  
  // Asset Context
  asset_id: string;
  asset_name: string;
  column_name?: string;
  
  // Violation Details
  violation_type: string;
  severity: AlertSeverity;
  description: string;
  actual_value?: any;
  expected_value?: any;
  threshold_breached?: number;
  
  // Record Context
  record_identifier?: string;
  record_count?: number;
  sample_values?: any[];
  
  // Status
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  
  // Impact Assessment
  business_impact?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  
  // Timestamps
  detected_at: string;
  first_seen?: string;
  last_seen?: string;
}

export interface QualityMetrics {
  // Overall Metrics
  overall_score: number;
  dimension_scores: Record<QualityDimension, number>;
  
  // Coverage Metrics
  rules_executed: number;
  assets_evaluated: number;
  records_evaluated: number;
  
  // Violation Metrics
  total_violations: number;
  critical_violations: number;
  high_violations: number;
  medium_violations: number;
  low_violations: number;
  
  // Performance Metrics
  avg_execution_time: number;
  success_rate: number;
  
  // Trend Metrics
  trend_direction: QualityTrendDirection;
  trend_strength: number;
  improvement_rate: number;
}

// ========================= QUALITY ASSESSMENT INTERFACES =========================

export interface QualityAssessment {
  id: string;
  asset_id: string;
  assessment_timestamp: string;
  assessment_type: 'scheduled' | 'on_demand' | 'triggered';
  
  // Overall Scores
  overall_score: number;
  data_quality_score: number;
  metadata_quality_score: number;
  governance_score: number;
  
  // Dimension Scores
  completeness_score: number;
  accuracy_score: number;
  consistency_score: number;
  validity_score: number;
  uniqueness_score: number;
  timeliness_score: number;
  freshness_score: number;
  
  // Assessment Details
  rules_applied: string[];
  sample_size: number;
  total_records: number;
  assessment_duration_ms: number;
  
  // Quality Issues
  critical_issues: QualityIssue[];
  high_issues: QualityIssue[];
  medium_issues: QualityIssue[];
  low_issues: QualityIssue[];
  
  // Data Profiling Results
  profiling_summary?: DataProfilingSummary;
  
  // Anomaly Detection
  anomalies_detected: DataAnomaly[];
  statistical_outliers: StatisticalOutlier[];
  
  // Recommendations
  improvement_recommendations: QualityRecommendation[];
  priority_actions: string[];
  estimated_effort?: Record<string, any>;
  
  // Comparison with Previous Assessments
  previous_assessment_id?: string;
  score_change?: number;
  trend_analysis?: QualityTrendAnalysis;
  
  // Compliance
  compliance_status: string;
  compliance_rules_met: string[];
  compliance_violations: string[];
}

export interface QualityIssue {
  id: string;
  issue_type: string;
  category: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  
  // Affected Elements
  affected_assets: string[];
  affected_columns?: string[];
  affected_records?: number;
  
  // Impact Assessment
  business_impact: string;
  technical_impact: string;
  urgency: 'immediate' | 'high' | 'medium' | 'low';
  
  // Root Cause Analysis
  potential_causes: string[];
  contributing_factors?: string[];
  
  // Remediation
  suggested_actions: string[];
  remediation_priority: number;
  estimated_effort_hours?: number;
  
  // Evidence
  evidence: Record<string, any>;
  sample_data?: any[];
  
  // Status
  status: 'open' | 'investigating' | 'remediation_planned' | 'in_remediation' | 'resolved';
  assigned_to?: string;
  due_date?: string;
  
  // Tracking
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface DataProfilingSummary {
  profiling_timestamp: string;
  total_columns: number;
  total_records: number;
  
  // Data Types
  data_type_distribution: Record<string, number>;
  inferred_types: Record<string, string>;
  
  // Completeness
  null_columns: string[];
  sparse_columns: Array<{ column: string; null_percentage: number }>;
  
  // Uniqueness
  unique_columns: string[];
  potential_keys: string[];
  duplicate_patterns: Array<{ columns: string[]; duplicate_count: number }>;
  
  // Value Patterns
  common_patterns: Record<string, Array<{ pattern: string; frequency: number }>>;
  format_inconsistencies: Array<{ column: string; inconsistencies: string[] }>;
  
  // Statistical Summary
  numeric_statistics: Record<string, NumericStatistics>;
  string_statistics: Record<string, StringStatistics>;
  
  // Quality Indicators
  quality_flags: Record<string, string[]>;
  data_drift_indicators: DataDriftIndicator[];
}

export interface NumericStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  std_deviation: number;
  quartiles: [number, number, number];
  outlier_count: number;
  outlier_percentage: number;
}

export interface StringStatistics {
  min_length: number;
  max_length: number;
  avg_length: number;
  common_prefixes: Array<{ prefix: string; count: number }>;
  common_suffixes: Array<{ suffix: string; count: number }>;
  character_distribution: Record<string, number>;
}

export interface DataAnomaly {
  id: string;
  anomaly_type: string;
  detection_method: string;
  confidence_score: number;
  
  // Location
  asset_id: string;
  column_name?: string;
  record_identifiers?: string[];
  
  // Anomaly Details
  expected_value?: any;
  actual_value?: any;
  deviation_magnitude: number;
  anomaly_score: number;
  
  // Context
  context_window?: string;
  contributing_factors?: string[];
  
  // Impact
  impact_assessment: string;
  severity: AlertSeverity;
  
  // Resolution
  status: 'detected' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  investigation_notes?: string;
  
  // Timestamps
  detected_at: string;
  first_occurrence?: string;
  last_occurrence?: string;
}

export interface StatisticalOutlier {
  column_name: string;
  outlier_method: string;
  threshold_value: number;
  
  outlier_values: Array<{
    value: any;
    score: number;
    record_identifier?: string;
  }>;
  
  outlier_count: number;
  outlier_percentage: number;
  
  statistical_context: {
    mean?: number;
    std_deviation?: number;
    iqr?: number;
    lower_bound?: number;
    upper_bound?: number;
  };
}

export interface QualityRecommendation {
  id: string;
  recommendation_type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  
  // Recommendation Details
  title: string;
  description: string;
  rationale: string;
  
  // Implementation
  implementation_steps: string[];
  estimated_effort_hours: number;
  required_skills: string[];
  dependencies?: string[];
  
  // Impact Prediction
  expected_improvement: Record<QualityDimension, number>;
  business_value: string;
  technical_benefits: string[];
  
  // Risk Assessment
  implementation_risks: string[];
  risk_mitigation: string[];
  
  // Tracking
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  assigned_to?: string;
  due_date?: string;
  
  // Results (after implementation)
  actual_improvement?: Record<QualityDimension, number>;
  lessons_learned?: string[];
}

export interface QualityTrendAnalysis {
  time_period: {
    start_date: string;
    end_date: string;
  };
  
  // Trend Metrics
  overall_trend: QualityTrendDirection;
  trend_strength: number;
  volatility: number;
  
  // Dimension Trends
  dimension_trends: Record<QualityDimension, {
    direction: QualityTrendDirection;
    change_rate: number;
    significance: number;
  }>;
  
  // Pattern Analysis
  seasonal_patterns?: Array<{
    pattern_type: string;
    period: string;
    strength: number;
  }>;
  
  // Change Points
  significant_changes: Array<{
    date: string;
    change_type: string;
    magnitude: number;
    potential_causes: string[];
  }>;
  
  // Predictions
  forecast?: Array<{
    date: string;
    predicted_score: number;
    confidence_interval: [number, number];
  }>;
}

export interface DataDriftIndicator {
  drift_type: string;
  affected_columns: string[];
  drift_magnitude: number;
  confidence_score: number;
  
  detection_method: string;
  baseline_period: string;
  comparison_period: string;
  
  drift_description: string;
  potential_causes: string[];
  impact_assessment: string;
  
  recommended_actions: string[];
}

// ========================= SCORECARD INTERFACES =========================

export interface QualityScorecard {
  id: string;
  name: string;
  description?: string;
  scope_type: 'global' | 'database' | 'schema' | 'asset_group' | 'custom';
  scope_identifier?: string;
  
  // Overall Scores
  overall_score: number;
  weighted_score: number;
  target_score?: number;
  
  // Dimension Scores
  dimension_scores: Record<QualityDimension, {
    current_score: number;
    target_score?: number;
    weight: number;
    trend: QualityTrendDirection;
  }>;
  
  // Scorecard Configuration
  scoring_method: QualityScoreType;
  weights: Record<QualityDimension, number>;
  custom_formula?: string;
  
  // Asset Coverage
  total_assets: number;
  assessed_assets: number;
  coverage_percentage: number;
  
  // Quality Distribution
  excellent_assets: number;
  good_assets: number;
  fair_assets: number;
  poor_assets: number;
  critical_assets: number;
  
  // Trend Information
  score_history: Array<{
    date: string;
    score: number;
  }>;
  
  improvement_rate: number;
  days_to_target?: number;
  
  // Benchmark Comparison
  industry_benchmark?: number;
  peer_benchmark?: number;
  best_practice_benchmark?: number;
  
  // Time Period
  period_start: string;
  period_end: string;
  last_updated: string;
  
  // Alerts and Notifications
  active_alerts: number;
  threshold_breaches: Array<{
    dimension: QualityDimension;
    threshold: number;
    current_value: number;
    breach_date: string;
  }>;
}

// ========================= REQUEST/RESPONSE TYPES =========================

export interface QualityRuleCreateRequest {
  rule_name: string;
  rule_type: QualityRuleType;
  quality_dimension: QualityDimension;
  description?: string;
  rule_expression: string;
  check_type: QualityCheckType;
  threshold_value?: number;
  threshold_operator?: string;
  parameters?: Record<string, any>;
  applies_to_assets?: string[];
  applies_to_columns?: string[];
  monitoring_level: MonitoringLevel;
  notification_settings?: NotificationSettings;
}

export interface QualityAssessmentRequest {
  asset_ids: string[];
  assessment_type?: 'full' | 'quick' | 'custom';
  rule_ids?: string[];
  include_profiling?: boolean;
  include_anomaly_detection?: boolean;
  sample_size?: number;
  custom_parameters?: Record<string, any>;
}

export interface QualityReportRequest {
  scope_type: 'global' | 'database' | 'schema' | 'asset_group';
  scope_identifier?: string;
  time_period: {
    start_date: string;
    end_date: string;
  };
  include_trends?: boolean;
  include_recommendations?: boolean;
  include_violations?: boolean;
  format?: 'json' | 'pdf' | 'excel' | 'html';
}

export interface QualityDashboardData {
  overview: {
    total_assets: number;
    assessed_assets: number;
    avg_quality_score: number;
    active_violations: number;
    trend_direction: QualityTrendDirection;
  };
  
  dimension_scores: Record<QualityDimension, number>;
  recent_assessments: QualityAssessment[];
  top_violations: QualityViolation[];
  quality_trends: Array<{
    date: string;
    score: number;
  }>;
  
  alerts: Array<{
    severity: AlertSeverity;
    message: string;
    timestamp: string;
  }>;
}

// ========================= UTILITY TYPES =========================

export type QualityEvent = {
  event_type: 'rule_executed' | 'violation_detected' | 'assessment_completed' | 'threshold_breached';
  timestamp: string;
  asset_id?: string;
  rule_id?: string;
  severity?: AlertSeverity;
  details: Record<string, any>;
};

export type QualityFilter = {
  asset_types?: AssetType[];
  quality_levels?: DataQuality[];
  dimensions?: QualityDimension[];
  severity_levels?: AlertSeverity[];
  date_range?: {
    start: string;
    end: string;
  };
  rule_types?: QualityRuleType[];
  violation_status?: Array<'open' | 'acknowledged' | 'resolved'>;
};

export default {
  QualityDimension,
  QualityRuleStatus,
  QualityCheckType,
  QualityScoreType,
  QualityTrendDirection,
  RemediationStatus
};