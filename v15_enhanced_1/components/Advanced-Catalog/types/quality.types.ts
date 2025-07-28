// 📈 **QUALITY TYPES** - Supporting data quality management and monitoring
// Maps to: catalog_quality_service.py, data_profiling_service.py

import { SeverityLevel, PriorityLevel, AssetType, ValidationStatus } from './catalog-core.types';

// 🎯 QUALITY RULE TYPES
export interface QualityRuleDefinition {
  id: string;
  name: string;
  description: string;
  category: QualityCategory;
  rule_type: QualityRuleType;
  severity: SeverityLevel;
  business_impact: BusinessImpact;
  technical_implementation: TechnicalImplementation;
  validation_logic: ValidationLogic;
  threshold_configuration: ThresholdConfiguration;
  scope_definition: ScopeDefinition;
  execution_settings: ExecutionSettings;
  documentation: RuleDocumentation;
  compliance_mappings: ComplianceMapping[];
  created_at: Date;
  updated_at: Date;
  created_by: string;
  approved_by?: string;
  approval_date?: Date;
  version: number;
  is_active: boolean;
  usage_statistics: RuleUsageStatistics;
}

export interface TechnicalImplementation {
  sql_expression?: string;
  python_expression?: string;
  custom_function?: string;
  validation_queries: ValidationQuery[];
  data_sampling: DataSampling;
  performance_hints: PerformanceHint[];
  dependencies: RuleDependency[];
  error_handling: ErrorHandling;
}

export interface ValidationLogic {
  validation_type: ValidationType;
  comparison_operator: ComparisonOperator;
  threshold_value?: any;
  acceptable_range?: ValueRange;
  pattern_regex?: string;
  business_rules: BusinessRuleCondition[];
  data_type_constraints: DataTypeConstraint[];
  referential_integrity_checks: ReferentialIntegrityCheck[];
}

export interface ThresholdConfiguration {
  warning_threshold?: number;
  error_threshold?: number;
  critical_threshold?: number;
  adaptive_thresholds: boolean;
  historical_baseline: boolean;
  seasonal_adjustments: boolean;
  industry_benchmarks: boolean;
  custom_calculations: CustomThresholdCalculation[];
}

export interface ScopeDefinition {
  applicable_asset_types: AssetType[];
  inclusion_patterns: string[];
  exclusion_patterns: string[];
  column_filters: ColumnFilter[];
  row_filters: RowFilter[];
  temporal_scope: TemporalScope;
  geographic_scope?: GeographicScope;
  business_unit_scope?: string[];
}

// 📊 QUALITY ASSESSMENT TYPES
export interface QualityAssessmentConfiguration {
  assessment_id: string;
  assessment_name: string;
  assessment_type: AssessmentType;
  scope: AssessmentScope;
  frequency: AssessmentFrequency;
  rules_to_execute: string[];
  sampling_strategy: SamplingStrategy;
  parallel_execution: boolean;
  timeout_minutes: number;
  notification_rules: NotificationRule[];
  reporting_configuration: ReportingConfiguration;
  data_lineage_analysis: boolean;
  impact_analysis: boolean;
  trend_analysis: boolean;
  benchmark_comparison: boolean;
}

export interface QualityAssessmentResult {
  assessment_id: string;
  asset_id: string;
  execution_timestamp: Date;
  overall_score: QualityScore;
  dimension_scores: QualityDimensionScore[];
  rule_execution_results: RuleExecutionResult[];
  data_profiling_summary: DataProfilingSummary;
  anomalies_detected: QualityAnomaly[];
  trend_analysis: QualityTrendAnalysis;
  recommendations: QualityRecommendation[];
  compliance_status: ComplianceStatus[];
  performance_metrics: AssessmentPerformanceMetrics;
  metadata: AssessmentMetadata;
}

export interface QualityScore {
  overall_score: number;
  confidence_level: number;
  score_breakdown: ScoreBreakdown;
  historical_comparison: HistoricalScoreComparison;
  industry_comparison?: IndustryScoreComparison;
  quality_grade: QualityGrade;
  improvement_potential: number;
}

export interface QualityDimensionScore {
  dimension: QualityDimension;
  score: number;
  weight: number;
  contributing_rules: ContributingRule[];
  trend_direction: TrendDirection;
  issues_identified: DimensionIssue[];
  recommendations: DimensionRecommendation[];
}

export interface RuleExecutionResult {
  rule_id: string;
  rule_name: string;
  execution_status: ExecutionStatus;
  result_value: any;
  threshold_breached: boolean;
  severity_triggered: SeverityLevel;
  affected_records: number;
  total_records: number;
  percentage_affected: number;
  execution_time_ms: number;
  error_message?: string;
  sample_failures: FailureSample[];
  remediation_suggestions: RemediationSuggestion[];
}

// 📈 QUALITY MONITORING TYPES
export interface QualityMonitoringSetup {
  monitoring_id: string;
  asset_id: string;
  monitoring_name: string;
  description?: string;
  monitoring_type: MonitoringType;
  frequency: MonitoringFrequency;
  monitoring_rules: MonitoringRule[];
  alert_configuration: AlertConfiguration;
  reporting_schedule: ReportingSchedule;
  data_retention: DataRetentionPolicy;
  escalation_matrix: EscalationMatrix;
  automated_responses: AutomatedResponse[];
  integration_settings: IntegrationSettings;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MonitoringRule {
  rule_id: string;
  monitoring_enabled: boolean;
  threshold_override?: ThresholdOverride;
  custom_scheduling: CustomScheduling;
  anomaly_detection: AnomalyDetectionConfig;
  trend_monitoring: TrendMonitoringConfig;
  correlation_analysis: CorrelationAnalysisConfig;
  business_hours_only: boolean;
  weekend_monitoring: boolean;
  holiday_monitoring: boolean;
}

export interface AlertConfiguration {
  alert_levels: AlertLevel[];
  notification_channels: NotificationChannel[];
  recipient_groups: RecipientGroup[];
  alert_suppression: AlertSuppression;
  escalation_rules: EscalationRule[];
  alert_templates: AlertTemplate[];
  delivery_preferences: DeliveryPreference[];
  feedback_collection: boolean;
}

export interface QualityAlert {
  alert_id: string;
  monitoring_id: string;
  asset_id: string;
  rule_id: string;
  alert_type: AlertType;
  severity: SeverityLevel;
  priority: PriorityLevel;
  triggered_at: Date;
  alert_title: string;
  alert_description: string;
  current_value: any;
  threshold_value: any;
  deviation_percentage: number;
  impact_assessment: AlertImpactAssessment;
  recommended_actions: RecommendedAction[];
  related_alerts: RelatedAlert[];
  acknowledgment_status: AcknowledgmentStatus;
  resolution_status: ResolutionStatus;
  assignment: AlertAssignment;
  notifications_sent: NotificationLog[];
  escalation_history: EscalationHistory[];
}

// 📋 QUALITY REPORTING TYPES
export interface QualityReportDefinition {
  report_id: string;
  report_name: string;
  report_type: QualityReportType;
  description?: string;
  scope: ReportScope;
  content_configuration: ReportContentConfiguration;
  visualization_settings: VisualizationSettings;
  distribution_settings: DistributionSettings;
  generation_schedule: GenerationSchedule;
  format_preferences: FormatPreference[];
  access_permissions: AccessPermission[];
  template_customization: TemplateCustomization;
  branding_settings: BrandingSettings;
  created_at: Date;
  updated_at: Date;
}

export interface QualityReport {
  report_id: string;
  generation_timestamp: Date;
  report_period: ReportPeriod;
  executive_summary: ExecutiveSummary;
  key_findings: KeyFinding[];
  quality_overview: QualityOverview;
  trend_analysis: TrendAnalysis;
  asset_scorecards: AssetScorecard[];
  rule_performance: RulePerformance[];
  anomaly_summary: AnomalySummary;
  recommendations: ReportRecommendation[];
  action_items: ActionItem[];
  appendices: ReportAppendix[];
  metadata: ReportMetadata;
  distribution_log: DistributionLog[];
}

export interface ExecutiveSummary {
  overall_quality_score: number;
  quality_trend: TrendDirection;
  critical_issues: number;
  resolved_issues: number;
  new_issues: number;
  assets_monitored: number;
  compliance_status: OverallComplianceStatus;
  business_impact_summary: BusinessImpactSummary;
  investment_recommendations: InvestmentRecommendation[];
  strategic_insights: StrategicInsight[];
}

// 🎯 QUALITY IMPROVEMENT TYPES
export interface QualityImprovementPlan {
  plan_id: string;
  asset_id: string;
  plan_name: string;
  description: string;
  current_state_assessment: CurrentStateAssessment;
  target_state_definition: TargetStateDefinition;
  improvement_initiatives: ImprovementInitiative[];
  timeline: ImprovementTimeline;
  resource_requirements: ResourceRequirement[];
  success_metrics: SuccessMetric[];
  risk_assessment: RiskAssessment;
  stakeholder_involvement: StakeholderInvolvement;
  progress_tracking: ProgressTracking;
  created_at: Date;
  updated_at: Date;
  status: PlanStatus;
}

export interface ImprovementInitiative {
  initiative_id: string;
  title: string;
  description: string;
  initiative_type: InitiativeType;
  priority: PriorityLevel;
  estimated_effort: EffortEstimate;
  expected_impact: ImpactEstimate;
  dependencies: InitiativeDependency[];
  assigned_team: TeamAssignment;
  deliverables: Deliverable[];
  milestones: Milestone[];
  budget_allocation: BudgetAllocation;
  success_criteria: SuccessCriteria[];
}

// 🎯 ENUMS
export enum QualityCategory {
  COMPLETENESS = 'completeness',
  ACCURACY = 'accuracy',
  CONSISTENCY = 'consistency',
  VALIDITY = 'validity',
  UNIQUENESS = 'uniqueness',
  TIMELINESS = 'timeliness',
  CONFORMITY = 'conformity',
  INTEGRITY = 'integrity'
}

export enum QualityRuleType {
  THRESHOLD = 'threshold',
  PATTERN = 'pattern',
  REFERENCE = 'reference',
  STATISTICAL = 'statistical',
  BUSINESS_LOGIC = 'business_logic',
  CUSTOM = 'custom',
  ML_BASED = 'ml_based'
}

export enum ValidationType {
  RANGE_CHECK = 'range_check',
  FORMAT_CHECK = 'format_check',
  REFERENCE_CHECK = 'reference_check',
  COMPLETENESS_CHECK = 'completeness_check',
  UNIQUENESS_CHECK = 'uniqueness_check',
  CONSISTENCY_CHECK = 'consistency_check',
  FRESHNESS_CHECK = 'freshness_check'
}

export enum ComparisonOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  BETWEEN = 'between',
  NOT_BETWEEN = 'not_between',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  MATCHES_PATTERN = 'matches_pattern',
  NOT_MATCHES_PATTERN = 'not_matches_pattern'
}

export enum AssessmentType {
  FULL_ASSESSMENT = 'full_assessment',
  INCREMENTAL = 'incremental',
  FOCUSED = 'focused',
  COMPLIANCE_CHECK = 'compliance_check',
  BASELINE = 'baseline',
  COMPARATIVE = 'comparative'
}

export enum AssessmentFrequency {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  ON_DEMAND = 'on_demand'
}

export enum MonitoringType {
  CONTINUOUS = 'continuous',
  SCHEDULED = 'scheduled',
  EVENT_DRIVEN = 'event_driven',
  THRESHOLD_BASED = 'threshold_based',
  ANOMALY_DETECTION = 'anomaly_detection'
}

export enum MonitoringFrequency {
  REAL_TIME = 'real_time',
  EVERY_5_MINUTES = 'every_5_minutes',
  EVERY_15_MINUTES = 'every_15_minutes',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum QualityGrade {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  ACCEPTABLE = 'acceptable',
  POOR = 'poor',
  CRITICAL = 'critical'
}

export enum TrendDirection {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining',
  VOLATILE = 'volatile',
  UNKNOWN = 'unknown'
}

export enum ExecutionStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL_SUCCESS = 'partial_success',
  TIMEOUT = 'timeout',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

export enum AlertType {
  THRESHOLD_BREACH = 'threshold_breach',
  ANOMALY_DETECTED = 'anomaly_detected',
  TREND_CHANGE = 'trend_change',
  SYSTEM_ERROR = 'system_error',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  DATA_FRESHNESS = 'data_freshness'
}

export enum AcknowledgmentStatus {
  UNACKNOWLEDGED = 'unacknowledged',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  INVESTIGATING = 'investigating'
}

export enum ResolutionStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  FALSE_POSITIVE = 'false_positive'
}

export enum QualityReportType {
  EXECUTIVE_SUMMARY = 'executive_summary',
  DETAILED_ANALYSIS = 'detailed_analysis',
  COMPLIANCE_REPORT = 'compliance_report',
  TREND_REPORT = 'trend_report',
  EXCEPTION_REPORT = 'exception_report',
  SCORECARD = 'scorecard'
}

export enum InitiativeType {
  DATA_CLEANING = 'data_cleaning',
  PROCESS_IMPROVEMENT = 'process_improvement',
  SYSTEM_UPGRADE = 'system_upgrade',
  TRAINING = 'training',
  GOVERNANCE = 'governance',
  AUTOMATION = 'automation'
}

export enum PlanStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 🎯 SUPPORTING INTERFACES
export interface BusinessImpact {
  impact_level: ImpactLevel;
  affected_processes: string[];
  financial_impact: FinancialImpact;
  compliance_implications: ComplianceImplication[];
  stakeholder_impact: StakeholderImpact[];
  reputation_risk: ReputationRisk;
}

export interface RuleDocumentation {
  business_rationale: string;
  technical_specification: string;
  examples: RuleExample[];
  testing_procedures: TestingProcedure[];
  maintenance_notes: string[];
  change_history: ChangeHistoryEntry[];
}

export interface RuleUsageStatistics {
  execution_count: number;
  success_rate: number;
  average_execution_time: number;
  last_execution: Date;
  performance_trend: PerformanceTrend;
  adoption_metrics: AdoptionMetrics;
}

export interface DataProfilingSummary {
  profiling_timestamp: Date;
  records_profiled: number;
  columns_analyzed: number;
  null_percentage: number;
  duplicate_percentage: number;
  outlier_percentage: number;
  data_types_distribution: Record<string, number>;
  pattern_compliance: PatternCompliance[];
}

export interface QualityAnomaly {
  anomaly_id: string;
  anomaly_type: AnomalyType;
  severity: SeverityLevel;
  detected_at: Date;
  description: string;
  affected_data: AffectedDataSummary;
  confidence_score: number;
  root_cause_analysis: RootCauseAnalysis;
  impact_assessment: ImpactAssessment;
  recommended_actions: RecommendedAction[];
}

export interface QualityRecommendation {
  recommendation_id: string;
  recommendation_type: RecommendationType;
  priority: PriorityLevel;
  title: string;
  description: string;
  rationale: string;
  implementation_steps: ImplementationStep[];
  estimated_effort: EffortEstimate;
  expected_benefits: ExpectedBenefit[];
  risk_factors: RiskFactor[];
  success_metrics: SuccessMetric[];
}

export interface FailureSample {
  row_identifier: string;
  column_name?: string;
  actual_value: any;
  expected_value?: any;
  failure_reason: string;
  context: FailureContext;
}

export interface RemediationSuggestion {
  suggestion_id: string;
  suggestion_type: RemediationType;
  description: string;
  automated_fix_available: boolean;
  fix_complexity: ComplexityLevel;
  estimated_time: EstimatedTime;
  business_validation_required: boolean;
  implementation_guide: ImplementationGuide;
}

// 🏷️ EXPORT TYPES
export type {
  QualityRuleDefinition,
  QualityAssessmentResult,
  QualityScore,
  QualityAlert,
  QualityReport,
  QualityImprovementPlan,
  QualityAnomaly,
  QualityRecommendation
};