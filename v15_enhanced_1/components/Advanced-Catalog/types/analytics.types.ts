/**
 * Advanced Analytics Types - Enterprise Analytics Platform
 * =======================================================
 * 
 * Complete mapping to backend analytics models and services:
 * - catalog_analytics_service.py (901 lines, 30+ endpoints)
 * - comprehensive_analytics_service.py (882 lines)
 * - enterprise_analytics.py (588 lines, 20+ endpoints)
 * - Various analytics models supporting comprehensive reporting
 * 
 * This provides complete type definitions for:
 * - Usage analytics and patterns
 * - Performance metrics and trends
 * - Business intelligence and insights
 * - Predictive analytics and forecasting
 * - Custom analytics and visualizations
 * - ROI and business value measurement
 * - Cross-system analytics aggregation
 * - Executive dashboards and reporting
 */

// ========================= CORE ANALYTICS TYPES =========================

export interface AnalyticsDashboardData {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  dashboard_type: 'executive' | 'operational' | 'custom' | 'technical';
  widgets: DashboardWidget[];
  filters: AnalyticsFilter[];
  refresh_interval?: number;
  is_public: boolean;
  permissions: DashboardPermission[];
  metadata: Record<string, any>;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'kpi' | 'heatmap' | 'gauge';
  title: string;
  description?: string;
  position: WidgetPosition;
  size: WidgetSize;
  data_source: string;
  query: AnalyticsQuery;
  visualization_config: VisualizationConfig;
  refresh_interval?: number;
  is_real_time: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  z_index?: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  min_width?: number;
  min_height?: number;
  max_width?: number;
  max_height?: number;
}

export interface AnalyticsQuery {
  query_type: 'sql' | 'api' | 'aggregation' | 'custom';
  query_definition: string | object;
  parameters?: Record<string, any>;
  cache_duration?: number;
  timeout?: number;
}

export interface VisualizationConfig {
  chart_type?: string;
  color_scheme?: string[];
  axes_config?: AxesConfig;
  legend_config?: LegendConfig;
  tooltip_config?: TooltipConfig;
  interaction_config?: InteractionConfig;
  custom_options?: Record<string, any>;
}

export interface AxesConfig {
  x_axis: AxisConfig;
  y_axis: AxisConfig;
  secondary_y_axis?: AxisConfig;
}

export interface AxisConfig {
  label: string;
  scale_type: 'linear' | 'logarithmic' | 'time' | 'categorical';
  min_value?: number;
  max_value?: number;
  tick_interval?: number;
  format?: string;
}

export interface LegendConfig {
  show_legend: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  alignment: 'start' | 'center' | 'end';
}

export interface TooltipConfig {
  show_tooltip: boolean;
  format?: string;
  custom_template?: string;
}

export interface InteractionConfig {
  enable_zoom: boolean;
  enable_pan: boolean;
  enable_selection: boolean;
  enable_drill_down: boolean;
}

// ========================= USAGE ANALYTICS =========================

export interface UsageAnalytics {
  asset_id?: string;
  scope: 'asset' | 'catalog' | 'system' | 'global';
  time_period: TimePeriod;
  usage_metrics: UsageMetrics;
  user_analytics: UserAnalytics;
  access_patterns: AccessPattern[];
  popular_assets: PopularAsset[];
  trends: UsageTrend[];
  insights: AnalyticsInsight[];
}

export interface UsageMetrics {
  total_views: number;
  unique_users: number;
  total_downloads: number;
  total_queries: number;
  average_session_duration: number;
  bounce_rate: number;
  engagement_score: number;
  retention_rate: number;
}

export interface UserAnalytics {
  active_users: number;
  new_users: number;
  returning_users: number;
  user_segments: UserSegment[];
  user_behavior: UserBehavior[];
  user_journey: UserJourney[];
}

export interface UserSegment {
  segment_id: string;
  segment_name: string;
  user_count: number;
  characteristics: Record<string, any>;
  behavior_patterns: string[];
}

export interface UserBehavior {
  user_id: string;
  behavior_type: string;
  frequency: number;
  patterns: string[];
  preferences: Record<string, any>;
}

export interface UserJourney {
  journey_id: string;
  user_id: string;
  steps: JourneyStep[];
  total_duration: number;
  conversion_points: string[];
  drop_off_points: string[];
}

export interface JourneyStep {
  step_id: string;
  action: string;
  timestamp: string;
  duration: number;
  success: boolean;
  metadata: Record<string, any>;
}

export interface AccessPattern {
  pattern_id: string;
  pattern_type: 'temporal' | 'user_based' | 'asset_based' | 'workflow';
  frequency: number;
  peak_times: TimeSlot[];
  user_groups: string[];
  assets_involved: string[];
  correlation_score: number;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  day_of_week?: number;
  activity_level: 'low' | 'medium' | 'high' | 'peak';
}

export interface PopularAsset {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  popularity_score: number;
  usage_count: number;
  unique_users: number;
  growth_rate: number;
  trending: boolean;
}

export interface UsageTrend {
  metric_name: string;
  time_series: TimeSeriesPoint[];
  trend_direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  change_rate: number;
  seasonality: SeasonalityPattern;
  forecasts?: ForecastPoint[];
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  confidence_interval?: [number, number];
  annotations?: string[];
}

export interface SeasonalityPattern {
  has_seasonality: boolean;
  period?: string;
  strength?: number;
  peak_periods?: string[];
  low_periods?: string[];
}

export interface ForecastPoint {
  timestamp: string;
  predicted_value: number;
  confidence_interval: [number, number];
  model_confidence: number;
}

// ========================= PERFORMANCE METRICS =========================

export interface PerformanceMetrics {
  scope: string;
  measurement_period: TimePeriod;
  system_performance: SystemPerformanceMetrics;
  query_performance: QueryPerformanceMetrics;
  user_experience: UserExperienceMetrics;
  resource_utilization: ResourceUtilizationMetrics;
  availability_metrics: AvailabilityMetrics;
  quality_metrics: QualityPerformanceMetrics;
}

export interface SystemPerformanceMetrics {
  response_time: StatisticalMetrics;
  throughput: StatisticalMetrics;
  error_rate: number;
  uptime_percentage: number;
  cpu_utilization: StatisticalMetrics;
  memory_utilization: StatisticalMetrics;
  disk_io: StatisticalMetrics;
  network_io: StatisticalMetrics;
}

export interface QueryPerformanceMetrics {
  average_query_time: number;
  slow_queries_count: number;
  failed_queries_count: number;
  cache_hit_rate: number;
  index_usage_rate: number;
  query_optimization_score: number;
  concurrent_queries: StatisticalMetrics;
}

export interface UserExperienceMetrics {
  page_load_time: StatisticalMetrics;
  time_to_interactive: StatisticalMetrics;
  user_satisfaction_score: number;
  error_encounter_rate: number;
  task_completion_rate: number;
  help_seeking_rate: number;
}

export interface ResourceUtilizationMetrics {
  compute_resources: ResourceMetric[];
  storage_resources: ResourceMetric[];
  network_resources: ResourceMetric[];
  database_resources: ResourceMetric[];
  cost_metrics: CostMetric[];
}

export interface ResourceMetric {
  resource_type: string;
  current_usage: number;
  peak_usage: number;
  average_usage: number;
  capacity: number;
  utilization_percentage: number;
  efficiency_score: number;
}

export interface CostMetric {
  cost_center: string;
  current_cost: number;
  projected_cost: number;
  cost_per_user: number;
  cost_per_query: number;
  optimization_potential: number;
}

export interface AvailabilityMetrics {
  uptime_percentage: number;
  downtime_incidents: IncidentMetric[];
  mttr: number; // Mean Time To Recovery
  mtbf: number; // Mean Time Between Failures
  sla_compliance: number;
  service_level_indicators: SLIMetric[];
}

export interface IncidentMetric {
  incident_id: string;
  start_time: string;
  end_time?: string;
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact_scope: string[];
  root_cause?: string;
  resolution_actions?: string[];
}

export interface SLIMetric {
  indicator_name: string;
  target_value: number;
  current_value: number;
  compliance_percentage: number;
  trend: 'improving' | 'degrading' | 'stable';
}

export interface QualityPerformanceMetrics {
  data_quality_score: number;
  metadata_completeness: number;
  lineage_coverage: number;
  governance_compliance: number;
  quality_trend: 'improving' | 'degrading' | 'stable';
  quality_issues_resolved: number;
}

export interface StatisticalMetrics {
  mean: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  standard_deviation: number;
}

// ========================= BUSINESS INTELLIGENCE =========================

export interface BusinessIntelligenceInsight {
  insight_id: string;
  insight_type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'pattern';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  impact_assessment: ImpactAssessment;
  recommendations: Recommendation[];
  supporting_data: SupportingData[];
  generated_at: string;
  expires_at?: string;
  status: 'new' | 'reviewed' | 'acted_upon' | 'dismissed';
}

export interface ImpactAssessment {
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  financial_impact?: FinancialImpact;
  operational_impact?: OperationalImpact;
  strategic_impact?: StrategicImpact;
  risk_factors: RiskFactor[];
}

export interface FinancialImpact {
  cost_impact: number;
  revenue_impact: number;
  roi_potential: number;
  payback_period?: number;
  currency: string;
}

export interface OperationalImpact {
  efficiency_change: number;
  productivity_change: number;
  quality_change: number;
  resource_requirements: ResourceRequirement[];
}

export interface StrategicImpact {
  alignment_score: number;
  competitive_advantage: number;
  innovation_potential: number;
  market_positioning: string;
}

export interface RiskFactor {
  risk_type: string;
  probability: number;
  impact: number;
  mitigation_strategies: string[];
}

export interface Recommendation {
  recommendation_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  effort_required: 'low' | 'medium' | 'high';
  expected_benefit: string;
  implementation_steps: string[];
  success_metrics: string[];
  timeline: string;
}

export interface SupportingData {
  data_type: 'metric' | 'chart' | 'table' | 'reference';
  title: string;
  content: any;
  source: string;
  relevance_score: number;
}

// ========================= PREDICTIVE ANALYTICS =========================

export interface PredictiveAnalytics {
  model_id: string;
  model_type: string;
  prediction_target: string;
  time_horizon: string;
  predictions: Prediction[];
  model_performance: ModelPerformance;
  confidence_intervals: ConfidenceInterval[];
  feature_importance: FeatureImportance[];
  scenarios: PredictionScenario[];
}

export interface Prediction {
  timestamp: string;
  predicted_value: number;
  confidence_score: number;
  prediction_interval: [number, number];
  factors_contributing: string[];
  risk_indicators: string[];
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  rmse?: number;
  mae?: number;
  r_squared?: number;
  validation_metrics: Record<string, number>;
}

export interface ConfidenceInterval {
  timestamp: string;
  lower_bound: number;
  upper_bound: number;
  confidence_level: number;
}

export interface FeatureImportance {
  feature_name: string;
  importance_score: number;
  correlation: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PredictionScenario {
  scenario_id: string;
  scenario_name: string;
  description: string;
  assumptions: Record<string, any>;
  predictions: Prediction[];
  probability: number;
}

// ========================= CUSTOM ANALYTICS =========================

export interface CustomAnalyticsRequest {
  request_id?: string;
  name: string;
  description?: string;
  query_definition: AnalyticsQuery;
  parameters: Record<string, any>;
  output_format: 'json' | 'csv' | 'chart' | 'dashboard';
  schedule?: AnalyticsSchedule;
  recipients?: string[];
  filters?: AnalyticsFilter[];
}

export interface AnalyticsSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  time_of_day?: string;
  timezone?: string;
  advanced_schedule?: CronExpression;
}

export interface CronExpression {
  expression: string;
  description: string;
  next_execution?: string;
}

export interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between';
  value: any;
  logical_operator?: 'and' | 'or';
}

export interface AnalyticsReport {
  report_id: string;
  name: string;
  description?: string;
  report_type: 'standard' | 'custom' | 'scheduled' | 'ad_hoc';
  generated_at: string;
  generated_by: string;
  data_sources: string[];
  parameters: Record<string, any>;
  content: ReportContent;
  format: 'json' | 'pdf' | 'csv' | 'html';
  file_size?: number;
  download_url?: string;
  expires_at?: string;
}

export interface ReportContent {
  summary: ReportSummary;
  sections: ReportSection[];
  appendices?: ReportSection[];
  metadata: ReportMetadata;
}

export interface ReportSummary {
  key_findings: string[];
  recommendations: string[];
  metrics_overview: Record<string, number>;
}

export interface ReportSection {
  section_id: string;
  title: string;
  content_type: 'text' | 'chart' | 'table' | 'metric' | 'mixed';
  content: any;
  insights?: string[];
}

export interface ReportMetadata {
  data_freshness: string;
  coverage_period: TimePeriod;
  reliability_score: number;
  limitations: string[];
  methodology: string;
}

// ========================= KPI & METRICS =========================

export interface KPIDashboard {
  dashboard_id: string;
  name: string;
  category: string;
  kpis: KPIMetric[];
  targets: KPITarget[];
  alerts: KPIAlert[];
  last_updated: string;
  update_frequency: string;
}

export interface KPIMetric {
  kpi_id: string;
  name: string;
  description: string;
  current_value: number;
  previous_value: number;
  target_value: number;
  unit: string;
  trend: TrendIndicator;
  status: 'on_track' | 'at_risk' | 'off_track' | 'unknown';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface KPITarget {
  kpi_id: string;
  target_type: 'minimum' | 'maximum' | 'exact' | 'range';
  target_value: number | [number, number];
  target_period: string;
  achievement_percentage: number;
}

export interface KPIAlert {
  alert_id: string;
  kpi_id: string;
  alert_type: 'threshold' | 'trend' | 'anomaly';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggered_at: string;
  acknowledged: boolean;
}

export interface TrendIndicator {
  direction: 'up' | 'down' | 'stable';
  percentage_change: number;
  is_favorable: boolean;
  confidence: number;
}

// ========================= VISUALIZATION & UI =========================

export interface AnalyticsVisualization {
  visualization_id: string;
  type: VisualizationType;
  title: string;
  description?: string;
  data_source: string;
  configuration: VisualizationConfig;
  interactive_features: InteractiveFeature[];
  export_options: ExportOption[];
  sharing_settings: SharingSettings;
}

export type VisualizationType = 
  | 'line_chart' | 'bar_chart' | 'pie_chart' | 'scatter_plot' | 'heatmap'
  | 'gauge' | 'funnel' | 'sankey' | 'treemap' | 'network_graph'
  | 'geographic_map' | 'timeline' | 'waterfall' | 'radar_chart';

export interface InteractiveFeature {
  feature_type: 'drill_down' | 'filter' | 'zoom' | 'hover' | 'selection';
  enabled: boolean;
  configuration?: Record<string, any>;
}

export interface ExportOption {
  format: 'png' | 'svg' | 'pdf' | 'csv' | 'json';
  quality?: 'standard' | 'high' | 'print';
  include_data?: boolean;
}

export interface SharingSettings {
  is_public: boolean;
  allowed_users: string[];
  allowed_roles: string[];
  share_link?: string;
  embed_code?: string;
}

// ========================= ANALYTICS INSIGHTS =========================

export interface AnalyticsInsight {
  insight_id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'pattern' | 'prediction';
  title: string;
  description: string;
  confidence_score: number;
  impact_level: 'low' | 'medium' | 'high';
  data_points: DataPoint[];
  recommendations: string[];
  related_insights: string[];
  generated_at: string;
  validity_period?: string;
}

export interface DataPoint {
  metric_name: string;
  value: number;
  timestamp: string;
  context?: Record<string, any>;
}

// ========================= AGGREGATION & METRICS =========================

export interface MetricsAggregation {
  aggregation_id: string;
  aggregation_type: 'sum' | 'average' | 'count' | 'min' | 'max' | 'percentile';
  grouped_by: string[];
  time_granularity: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  results: AggregationResult[];
  metadata: AggregationMetadata;
}

export interface AggregationResult {
  group_key: Record<string, any>;
  aggregated_value: number;
  count: number;
  confidence_interval?: [number, number];
}

export interface AggregationMetadata {
  total_records: number;
  groups_count: number;
  computation_time: number;
  data_freshness: string;
}

// ========================= BUSINESS VALUE & ROI =========================

export interface BusinessValueMetrics {
  measurement_period: TimePeriod;
  total_value_generated: number;
  value_breakdown: ValueBreakdown[];
  roi_analysis: ROIAnalysis;
  productivity_gains: ProductivityGain[];
  cost_savings: CostSaving[];
  revenue_impact: RevenueImpact[];
}

export interface ValueBreakdown {
  category: string;
  value: number;
  percentage_of_total: number;
  growth_rate: number;
  contributors: string[];
}

export interface ROIAnalysis {
  total_investment: number;
  total_return: number;
  roi_percentage: number;
  payback_period: number;
  net_present_value: number;
  internal_rate_of_return: number;
}

export interface ProductivityGain {
  area: string;
  time_saved: number;
  efficiency_improvement: number;
  monetary_value: number;
  affected_users: number;
}

export interface CostSaving {
  category: string;
  amount_saved: number;
  source_of_saving: string;
  frequency: 'one_time' | 'recurring';
  confidence_level: number;
}

export interface RevenueImpact {
  source: string;
  revenue_increase: number;
  attribution_confidence: number;
  time_to_realize: string;
}

// ========================= SPECIALIZED METRICS =========================

export interface AssetUtilizationMetrics {
  asset_id: string;
  utilization_rate: number;
  peak_usage_times: TimeSlot[];
  user_distribution: UserDistribution[];
  access_frequency: AccessFrequency;
  value_score: number;
  optimization_opportunities: string[];
}

export interface UserDistribution {
  user_segment: string;
  user_count: number;
  usage_percentage: number;
  engagement_level: 'low' | 'medium' | 'high';
}

export interface AccessFrequency {
  daily_average: number;
  weekly_average: number;
  monthly_average: number;
  peak_concurrent_users: number;
}

export interface PopularityAnalysis {
  ranking: PopularityRanking[];
  trending_assets: TrendingAsset[];
  popularity_factors: PopularityFactor[];
  user_preferences: UserPreference[];
}

export interface PopularityRanking {
  rank: number;
  asset_id: string;
  asset_name: string;
  popularity_score: number;
  change_from_previous: number;
}

export interface TrendingAsset {
  asset_id: string;
  asset_name: string;
  growth_rate: number;
  momentum_score: number;
  trend_duration: string;
}

export interface PopularityFactor {
  factor_name: string;
  weight: number;
  contribution_to_popularity: number;
}

export interface UserPreference {
  user_segment: string;
  preferred_asset_types: string[];
  usage_patterns: string[];
  satisfaction_score: number;
}

export interface ImpactAnalysis {
  analysis_id: string;
  subject: string;
  impact_areas: ImpactArea[];
  affected_systems: string[];
  affected_users: number;
  severity_assessment: SeverityAssessment;
  mitigation_strategies: MitigationStrategy[];
  timeline_analysis: TimelineAnalysis;
}

export interface ImpactArea {
  area_name: string;
  impact_level: 'minimal' | 'low' | 'medium' | 'high' | 'severe';
  affected_components: string[];
  estimated_duration: string;
  recovery_complexity: 'simple' | 'moderate' | 'complex';
}

export interface SeverityAssessment {
  overall_severity: 'low' | 'medium' | 'high' | 'critical';
  business_impact: number;
  technical_impact: number;
  user_impact: number;
  financial_impact: number;
}

export interface MitigationStrategy {
  strategy_id: string;
  name: string;
  description: string;
  effectiveness: number;
  implementation_effort: 'low' | 'medium' | 'high';
  timeline: string;
  resources_required: string[];
}

export interface TimelineAnalysis {
  immediate_effects: string[];
  short_term_effects: string[];
  long_term_effects: string[];
  recovery_milestones: Milestone[];
}

export interface Milestone {
  milestone_id: string;
  name: string;
  target_date: string;
  completion_criteria: string[];
  dependencies: string[];
}

// ========================= COLLABORATION METRICS =========================

export interface CollaborationMetrics {
  team_id?: string;
  project_id?: string;
  measurement_period: TimePeriod;
  collaboration_score: number;
  activity_metrics: ActivityMetrics;
  communication_metrics: CommunicationMetrics;
  knowledge_sharing_metrics: KnowledgeSharingMetrics;
  productivity_metrics: CollaborationProductivityMetrics;
}

export interface ActivityMetrics {
  total_activities: number;
  unique_contributors: number;
  average_activities_per_user: number;
  peak_activity_periods: TimeSlot[];
  activity_distribution: ActivityDistribution[];
}

export interface ActivityDistribution {
  activity_type: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface CommunicationMetrics {
  total_messages: number;
  response_time_average: number;
  conversation_threads: number;
  resolved_discussions: number;
  collaboration_quality_score: number;
}

export interface KnowledgeSharingMetrics {
  knowledge_articles_created: number;
  knowledge_articles_accessed: number;
  expert_consultations: number;
  knowledge_reuse_rate: number;
  expertise_distribution: ExpertiseDistribution[];
}

export interface ExpertiseDistribution {
  expertise_area: string;
  expert_count: number;
  knowledge_articles: number;
  consultation_requests: number;
}

export interface CollaborationProductivityMetrics {
  tasks_completed: number;
  average_completion_time: number;
  collaboration_efficiency: number;
  cross_functional_projects: number;
  innovation_indicators: InnovationIndicator[];
}

export interface InnovationIndicator {
  indicator_name: string;
  value: number;
  benchmark: number;
  trend: 'improving' | 'declining' | 'stable';
}

// ========================= SYSTEM METRICS =========================

export interface SystemMetrics {
  system_id: string;
  measurement_timestamp: string;
  health_score: number;
  performance_indicators: PerformanceIndicator[];
  resource_usage: ResourceUsage[];
  error_rates: ErrorRate[];
  service_levels: ServiceLevel[];
}

export interface PerformanceIndicator {
  indicator_name: string;
  current_value: number;
  target_value: number;
  threshold_warning: number;
  threshold_critical: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface ResourceUsage {
  resource_type: string;
  current_usage: number;
  maximum_capacity: number;
  utilization_percentage: number;
  projected_usage: number;
}

export interface ErrorRate {
  error_category: string;
  error_count: number;
  error_rate_percentage: number;
  trend: 'improving' | 'worsening' | 'stable';
}

export interface ServiceLevel {
  service_name: string;
  availability_percentage: number;
  response_time_p95: number;
  error_rate: number;
  sla_compliance: boolean;
}

// ========================= SEARCH & LINEAGE METRICS =========================

export interface SearchMetrics {
  total_searches: number;
  unique_searchers: number;
  average_searches_per_user: number;
  search_success_rate: number;
  popular_search_terms: PopularSearchTerm[];
  search_performance: SearchPerformanceMetrics;
  search_satisfaction: SearchSatisfactionMetrics;
}

export interface PopularSearchTerm {
  term: string;
  frequency: number;
  success_rate: number;
  user_segments: string[];
}

export interface SearchPerformanceMetrics {
  average_response_time: number;
  index_performance: number;
  cache_hit_rate: number;
  search_accuracy: number;
}

export interface SearchSatisfactionMetrics {
  click_through_rate: number;
  session_abandonment_rate: number;
  query_refinement_rate: number;
  user_satisfaction_score: number;
}

export interface LineageMetrics {
  total_lineage_connections: number;
  lineage_coverage_percentage: number;
  lineage_accuracy_score: number;
  lineage_freshness: LineageFreshness;
  impact_analysis_metrics: ImpactAnalysisMetrics;
}

export interface LineageFreshness {
  average_age: number;
  stale_connections: number;
  refresh_frequency: number;
  data_currency_score: number;
}

export interface ImpactAnalysisMetrics {
  analyses_performed: number;
  average_analysis_time: number;
  accuracy_score: number;
  prediction_confidence: number;
}

export interface UserActivityMetrics {
  user_id?: string;
  session_count: number;
  total_session_duration: number;
  average_session_duration: number;
  actions_performed: ActionMetric[];
  feature_usage: FeatureUsageMetric[];
  user_journey_metrics: UserJourneyMetrics;
}

export interface ActionMetric {
  action_type: string;
  count: number;
  success_rate: number;
  average_duration: number;
}

export interface FeatureUsageMetric {
  feature_name: string;
  usage_count: number;
  unique_users: number;
  adoption_rate: number;
  satisfaction_score: number;
}

export interface UserJourneyMetrics {
  typical_journey_length: number;
  conversion_funnel: ConversionStep[];
  drop_off_points: DropOffPoint[];
  optimization_opportunities: string[];
}

export interface ConversionStep {
  step_name: string;
  users_entering: number;
  users_completing: number;
  conversion_rate: number;
}

export interface DropOffPoint {
  step_name: string;
  drop_off_rate: number;
  reasons: string[];
  improvement_suggestions: string[];
}

// ========================= BENCHMARKING & COMPARISON =========================

export interface BenchmarkingData {
  benchmark_id: string;
  benchmark_type: 'internal' | 'industry' | 'peer_group' | 'best_practice';
  comparison_metrics: ComparisonMetric[];
  performance_gaps: PerformanceGap[];
  improvement_opportunities: ImprovementOpportunity[];
  maturity_assessment: MaturityAssessment;
}

export interface ComparisonMetric {
  metric_name: string;
  our_value: number;
  benchmark_value: number;
  variance: number;
  variance_percentage: number;
  performance_rating: 'below' | 'meets' | 'exceeds' | 'leader';
}

export interface PerformanceGap {
  area: string;
  gap_size: number;
  impact_level: 'low' | 'medium' | 'high';
  effort_to_close: 'low' | 'medium' | 'high';
  priority_score: number;
}

export interface ImprovementOpportunity {
  opportunity_id: string;
  title: string;
  description: string;
  potential_impact: number;
  implementation_effort: string;
  success_probability: number;
  timeline: string;
}

export interface MaturityAssessment {
  overall_maturity_level: number;
  dimension_scores: DimensionScore[];
  maturity_gaps: string[];
  development_roadmap: DevelopmentMilestone[];
}

export interface DimensionScore {
  dimension: string;
  current_score: number;
  target_score: number;
  industry_average: number;
  strengths: string[];
  weaknesses: string[];
}

export interface DevelopmentMilestone {
  milestone: string;
  target_date: string;
  success_criteria: string[];
  dependencies: string[];
}

// ========================= COST ANALYSIS =========================

export interface CostAnalysis {
  analysis_period: TimePeriod;
  total_cost: number;
  cost_breakdown: CostBreakdown[];
  cost_trends: CostTrend[];
  optimization_opportunities: CostOptimizationOpportunity[];
  budget_analysis: BudgetAnalysis;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage_of_total: number;
  cost_drivers: string[];
  variability: 'fixed' | 'variable' | 'semi_variable';
}

export interface CostTrend {
  category: string;
  historical_costs: HistoricalCost[];
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  projected_costs: ProjectedCost[];
}

export interface HistoricalCost {
  period: string;
  amount: number;
  drivers: string[];
}

export interface ProjectedCost {
  period: string;
  projected_amount: number;
  confidence_interval: [number, number];
  assumptions: string[];
}

export interface CostOptimizationOpportunity {
  opportunity_id: string;
  description: string;
  potential_savings: number;
  implementation_cost: number;
  roi: number;
  risk_level: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface BudgetAnalysis {
  allocated_budget: number;
  actual_spend: number;
  variance: number;
  variance_percentage: number;
  forecast_accuracy: number;
  budget_utilization_rate: number;
}

// ========================= HELPER TYPES =========================

export interface TimePeriod {
  start_date: string;
  end_date: string;
  duration: string;
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface DashboardPermission {
  user_id?: string;
  role?: string;
  permissions: ('view' | 'edit' | 'share' | 'delete')[];
}

export interface ExecutiveAnalytics {
  executive_summary: ExecutiveSummary;
  key_performance_indicators: KPIMetric[];
  strategic_insights: StrategicInsight[];
  risk_dashboard: RiskDashboard;
  opportunity_matrix: OpportunityMatrix;
  forecasts: ExecutiveForecast[];
}

export interface ExecutiveSummary {
  period: TimePeriod;
  overall_health_score: number;
  key_achievements: string[];
  major_concerns: string[];
  strategic_recommendations: string[];
}

export interface StrategicInsight {
  insight_id: string;
  category: 'market' | 'operational' | 'financial' | 'competitive' | 'innovation';
  title: string;
  description: string;
  strategic_impact: 'low' | 'medium' | 'high' | 'transformational';
  action_required: boolean;
  timeline: string;
}

export interface RiskDashboard {
  overall_risk_score: number;
  risk_categories: RiskCategory[];
  emerging_risks: EmergingRisk[];
  mitigation_status: MitigationStatus[];
}

export interface RiskCategory {
  category: string;
  risk_level: number;
  trend: 'improving' | 'stable' | 'worsening';
  key_risks: string[];
}

export interface EmergingRisk {
  risk_id: string;
  description: string;
  probability: number;
  impact: number;
  detection_date: string;
  monitoring_status: string;
}

export interface MitigationStatus {
  risk_id: string;
  mitigation_plan: string;
  progress_percentage: number;
  effectiveness_score: number;
  next_review_date: string;
}

export interface OpportunityMatrix {
  opportunities: OpportunityItem[];
  prioritization_criteria: PrioritizationCriteria[];
  resource_allocation: ResourceAllocation[];
}

export interface OpportunityItem {
  opportunity_id: string;
  title: string;
  potential_value: number;
  effort_required: number;
  probability_of_success: number;
  strategic_alignment: number;
  priority_score: number;
}

export interface PrioritizationCriteria {
  criterion: string;
  weight: number;
  description: string;
}

export interface ResourceAllocation {
  opportunity_id: string;
  allocated_resources: AllocatedResource[];
  total_allocation: number;
  allocation_efficiency: number;
}

export interface AllocatedResource {
  resource_type: string;
  amount: number;
  utilization_rate: number;
}

export interface ExecutiveForecast {
  forecast_type: string;
  time_horizon: string;
  predicted_outcomes: PredictedOutcome[];
  confidence_level: number;
  key_assumptions: string[];
  scenario_analysis: ScenarioAnalysis[];
}

export interface PredictedOutcome {
  metric: string;
  current_value: number;
  predicted_value: number;
  change_percentage: number;
  confidence_interval: [number, number];
}

export interface ScenarioAnalysis {
  scenario_name: string;
  probability: number;
  predicted_outcomes: PredictedOutcome[];
  key_drivers: string[];
  implications: string[];
}

// ========================= REQUEST/RESPONSE TYPES =========================

export interface GovernanceAnalytics extends AnalyticsDashboardData {
  governance_score: number;
  compliance_metrics: ComplianceMetric[];
  policy_effectiveness: PolicyEffectiveness[];
  audit_insights: AuditInsight[];
}

export interface ComplianceMetric {
  framework: string;
  compliance_percentage: number;
  trend: 'improving' | 'stable' | 'declining';
  gaps: string[];
}

export interface PolicyEffectiveness {
  policy_id: string;
  policy_name: string;
  effectiveness_score: number;
  enforcement_rate: number;
  violation_count: number;
}

export interface AuditInsight {
  insight_type: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Export comprehensive analytics API interface
export interface AnalyticsAPI {
  dashboard: AnalyticsDashboardData;
  usage: UsageAnalytics;
  performance: PerformanceMetrics;
  business_intelligence: BusinessIntelligenceInsight[];
  predictive: PredictiveAnalytics;
  kpis: KPIDashboard;
  custom: CustomAnalyticsRequest;
  reports: AnalyticsReport[];
  visualizations: AnalyticsVisualization[];
  insights: AnalyticsInsight[];
}