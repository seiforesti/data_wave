/**
 * Advanced Catalog Analytics Types
 * Maps to: catalog_analytics_service.py, comprehensive_analytics_service.py
 * 
 * Comprehensive types for catalog analytics including usage patterns,
 * data discovery analytics, lineage analysis, quality trends, and AI-powered insights.
 */

export interface CatalogAnalyticsReport {
  analytics_id: string;
  report_type: AnalyticsReportType;
  time_range: string;
  generation_time: number;
  data_points: number;
  metrics: CatalogMetrics;
  insights: AnalyticsInsight[];
  trends: AnalyticsTrend[];
  recommendations: AnalyticsRecommendation[];
  visualizations: VisualizationData[];
  custom_properties?: Record<string, any>;
}

export interface CatalogMetrics {
  usage_metrics: UsageMetrics;
  quality_metrics: QualityMetrics;
  discovery_metrics: DiscoveryMetrics;
  lineage_metrics: LineageMetrics;
  collaboration_metrics: CollaborationMetrics;
  performance_metrics: PerformanceMetrics;
  business_metrics: BusinessMetrics;
}

export interface UsageMetrics {
  total_assets_accessed: number;
  unique_users: number;
  total_queries: number;
  avg_response_time: number;
  peak_usage_times: TimeRange[];
  usage_by_asset_type: Record<string, number>;
  usage_by_department: Record<string, number>;
  usage_trends: UsageTrend[];
  access_patterns: AccessPattern[];
  user_engagement_score: number;
  retention_rate: number;
  adoption_rate: number;
}

export interface QualityMetrics {
  overall_quality_score: number;
  quality_distribution: QualityDistribution;
  quality_trends: QualityTrend[];
  issues_detected: QualityIssue[];
  improvement_rate: number;
  compliance_score: number;
  data_completeness: number;
  data_accuracy: number;
  data_consistency: number;
  data_validity: number;
  data_uniqueness: number;
  data_timeliness: number;
}

export interface DiscoveryMetrics {
  total_assets_discovered: number;
  discovery_rate: number;
  automated_discovery_ratio: number;
  ai_discovery_accuracy: number;
  discovery_sources: DiscoverySource[];
  schema_evolution_rate: number;
  metadata_enrichment_rate: number;
  discovery_effectiveness: number;
  time_to_discovery: number;
  discovery_coverage: number;
}

export interface LineageMetrics {
  total_lineage_relationships: number;
  lineage_coverage: number;
  lineage_accuracy: number;
  column_level_coverage: number;
  lineage_depth_distribution: Record<number, number>;
  impact_analysis_coverage: number;
  lineage_freshness: number;
  data_flow_complexity: number;
  upstream_dependencies: number;
  downstream_dependencies: number;
}

export interface CollaborationMetrics {
  active_collaborators: number;
  collaboration_frequency: number;
  knowledge_sharing_rate: number;
  expert_consultation_rate: number;
  crowd_sourcing_participation: number;
  annotation_coverage: number;
  review_completion_rate: number;
  stewardship_effectiveness: number;
  community_engagement: number;
  collaboration_satisfaction: number;
}

export interface PerformanceMetrics {
  avg_query_response_time: number;
  system_uptime: number;
  error_rate: number;
  throughput: number;
  resource_utilization: ResourceUtilization;
  cache_hit_rate: number;
  indexing_performance: number;
  search_performance: number;
  api_performance: APIPerformanceMetrics;
  scalability_metrics: ScalabilityMetrics;
}

export interface BusinessMetrics {
  roi_score: number;
  cost_savings: number;
  productivity_improvement: number;
  decision_speed_improvement: number;
  compliance_improvement: number;
  risk_reduction: number;
  data_value_realization: number;
  time_to_insights: number;
  business_impact_score: number;
  strategic_alignment: number;
}

export interface AnalyticsInsight {
  insight_id: string;
  insight_type: InsightType;
  title: string;
  description: string;
  confidence: AnalysisConfidence;
  impact_level: ImpactLevel;
  category: InsightCategory;
  evidence: InsightEvidence[];
  recommendations: string[];
  business_value: number;
  implementation_effort: EffortLevel;
  timeline: string;
  stakeholders: string[];
  kpis_affected: string[];
  related_insights: string[];
  created_at: string;
}

export interface AnalyticsTrend {
  trend_id: string;
  trend_type: TrendType;
  metric_name: string;
  time_period: string;
  trend_direction: TrendDirection;
  trend_strength: number;
  trend_significance: number;
  trend_data: TrendDataPoint[];
  seasonality_detected: boolean;
  anomalies_detected: AnomalyDetection[];
  forecast_data: ForecastDataPoint[];
  confidence_interval: ConfidenceInterval;
  drivers: TrendDriver[];
}

export interface AnalyticsRecommendation {
  recommendation_id: string;
  title: string;
  description: string;
  recommendation_type: RecommendationType;
  priority: Priority;
  impact_assessment: ImpactAssessment;
  implementation_plan: ImplementationPlan;
  success_metrics: SuccessMetric[];
  risk_assessment: RiskAssessment;
  resource_requirements: ResourceRequirement[];
  timeline: ImplementationTimeline;
  stakeholders: Stakeholder[];
  dependencies: string[];
  alternatives: AlternativeRecommendation[];
}

export interface VisualizationData {
  visualization_id: string;
  visualization_type: VisualizationType;
  title: string;
  description: string;
  data: any[];
  config: VisualizationConfig;
  metadata: VisualizationMetadata;
  interactive_features: InteractiveFeature[];
  export_options: ExportOption[];
}

// ===================== SUPPORTING TYPES =====================

export interface TimeRange {
  start: string;
  end: string;
  timezone?: string;
}

export interface UsageTrend {
  metric: string;
  time_period: string;
  values: number[];
  trend_direction: TrendDirection;
  growth_rate: number;
}

export interface AccessPattern {
  pattern_id: string;
  pattern_type: string;
  frequency: string;
  users: number;
  assets: string[];
  time_patterns: Record<string, number>;
}

export interface QualityDistribution {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  critical: number;
}

export interface QualityTrend {
  dimension: string;
  time_period: string;
  scores: number[];
  improvement_rate: number;
}

export interface DiscoverySource {
  source_type: string;
  assets_discovered: number;
  accuracy_rate: number;
  processing_time: number;
}

export interface ResourceUtilization {
  cpu_usage: number;
  memory_usage: number;
  storage_usage: number;
  network_usage: number;
  gpu_usage?: number;
}

export interface APIPerformanceMetrics {
  endpoint_performance: Record<string, EndpointMetrics>;
  overall_latency: number;
  success_rate: number;
  rate_limit_utilization: number;
}

export interface EndpointMetrics {
  avg_response_time: number;
  requests_per_second: number;
  error_rate: number;
  success_rate: number;
}

export interface ScalabilityMetrics {
  concurrent_users_supported: number;
  assets_scaling_limit: number;
  query_throughput_limit: number;
  horizontal_scaling_factor: number;
}

export interface InsightEvidence {
  evidence_type: string;
  source: string;
  data: any;
  confidence: number;
}

export interface AnomalyDetection {
  anomaly_id: string;
  timestamp: string;
  severity: Severity;
  description: string;
  detected_by: string;
  resolution_status: ResolutionStatus;
}

export interface TrendDataPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface ForecastDataPoint {
  timestamp: string;
  predicted_value: number;
  confidence_lower: number;
  confidence_upper: number;
}

export interface ConfidenceInterval {
  lower_bound: number;
  upper_bound: number;
  confidence_level: number;
}

export interface TrendDriver {
  driver_name: string;
  influence_strength: number;
  correlation: number;
  description: string;
}

export interface ImpactAssessment {
  business_impact: BusinessImpact;
  technical_impact: TechnicalImpact;
  user_impact: UserImpact;
  financial_impact: FinancialImpact;
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  total_duration: string;
  critical_path: string[];
  milestones: Milestone[];
  success_criteria: string[];
}

export interface SuccessMetric {
  metric_name: string;
  target_value: number;
  measurement_method: string;
  reporting_frequency: string;
}

export interface RiskAssessment {
  risks: Risk[];
  overall_risk_level: RiskLevel;
  mitigation_strategies: MitigationStrategy[];
}

export interface ResourceRequirement {
  resource_type: ResourceType;
  quantity: number;
  duration: string;
  cost_estimate: number;
  availability: ResourceAvailability;
}

export interface ImplementationTimeline {
  start_date: string;
  end_date: string;
  phases: TimelinePhase[];
  dependencies: TimelineDependency[];
  critical_milestones: string[];
}

export interface Stakeholder {
  name: string;
  role: string;
  involvement_level: InvolvementLevel;
  decision_authority: DecisionAuthority;
  communication_preference: string;
}

export interface AlternativeRecommendation {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  effort_comparison: EffortComparison;
  impact_comparison: ImpactComparison;
}

export interface VisualizationConfig {
  chart_type: string;
  dimensions: string[];
  measures: string[];
  color_scheme: string;
  interactive_options: string[];
  custom_settings: Record<string, any>;
}

export interface VisualizationMetadata {
  data_source: string;
  last_updated: string;
  refresh_rate: string;
  data_quality: number;
  completeness: number;
}

export interface InteractiveFeature {
  feature_type: string;
  feature_name: string;
  description: string;
  enabled: boolean;
}

export interface ExportOption {
  format: string;
  description: string;
  file_extension: string;
  supports_data: boolean;
  supports_visualization: boolean;
}

// ===================== ENUMS =====================

export enum AnalyticsReportType {
  USAGE_ANALYTICS = 'usage_analytics',
  QUALITY_ANALYTICS = 'quality_analytics',
  DISCOVERY_ANALYTICS = 'discovery_analytics',
  LINEAGE_ANALYTICS = 'lineage_analytics',
  COLLABORATION_ANALYTICS = 'collaboration_analytics',
  PERFORMANCE_ANALYTICS = 'performance_analytics',
  BUSINESS_ANALYTICS = 'business_analytics',
  COMPREHENSIVE_ANALYTICS = 'comprehensive_analytics'
}

export enum InsightType {
  USAGE_INSIGHT = 'usage_insight',
  QUALITY_INSIGHT = 'quality_insight',
  PERFORMANCE_INSIGHT = 'performance_insight',
  TREND_INSIGHT = 'trend_insight',
  ANOMALY_INSIGHT = 'anomaly_insight',
  RECOMMENDATION_INSIGHT = 'recommendation_insight'
}

export enum ImpactLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  MINIMAL = 'minimal'
}

export enum InsightCategory {
  OPERATIONAL = 'operational',
  STRATEGIC = 'strategic',
  TECHNICAL = 'technical',
  BUSINESS = 'business',
  COMPLIANCE = 'compliance'
}

export enum TrendType {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  SEASONAL = 'seasonal',
  CYCLICAL = 'cyclical',
  VOLATILE = 'volatile'
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  FLAT = 'flat',
  UNKNOWN = 'unknown'
}

export enum Priority {
  CRITICAL = 'critical',
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

export enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum ResolutionStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum VisualizationType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  SCATTER_PLOT = 'scatter_plot',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
  NETWORK_DIAGRAM = 'network_diagram',
  SANKEY_DIAGRAM = 'sankey_diagram',
  HISTOGRAM = 'histogram',
  BOX_PLOT = 'box_plot'
}

export enum RiskLevel {
  VERY_HIGH = 'very_high',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low'
}

export enum ResourceType {
  HUMAN = 'human',
  TECHNICAL = 'technical',
  FINANCIAL = 'financial',
  INFRASTRUCTURE = 'infrastructure',
  SOFTWARE = 'software'
}

export enum ResourceAvailability {
  AVAILABLE = 'available',
  LIMITED = 'limited',
  UNAVAILABLE = 'unavailable',
  CONDITIONAL = 'conditional'
}

export enum InvolvementLevel {
  CHAMPION = 'champion',
  ACTIVE = 'active',
  SUPPORTIVE = 'supportive',
  NEUTRAL = 'neutral',
  RESISTANT = 'resistant'
}

export enum DecisionAuthority {
  FINAL_DECISION = 'final_decision',
  APPROVAL_REQUIRED = 'approval_required',
  CONSULTATIVE = 'consultative',
  INFORMATIONAL = 'informational'
}

// Import related types for integration
import type { AnalysisConfidence, RecommendationType } from './intelligence.types';
import type { QualityIssue } from './quality.types';

// Complex nested types for detailed analytics
export interface BusinessImpact {
  revenue_impact: number;
  cost_impact: number;
  efficiency_gain: number;
  risk_reduction: number;
  compliance_improvement: number;
}

export interface TechnicalImpact {
  performance_improvement: number;
  scalability_improvement: number;
  reliability_improvement: number;
  security_improvement: number;
  maintainability_improvement: number;
}

export interface UserImpact {
  user_experience_improvement: number;
  productivity_improvement: number;
  learning_curve: EffortLevel;
  adoption_likelihood: number;
  satisfaction_improvement: number;
}

export interface FinancialImpact {
  implementation_cost: number;
  operational_cost_change: number;
  roi_timeframe: string;
  break_even_point: string;
  net_present_value: number;
}

export interface ImplementationPhase {
  phase_name: string;
  description: string;
  duration: string;
  deliverables: string[];
  resources_required: string[];
  success_criteria: string[];
}

export interface Milestone {
  milestone_name: string;
  target_date: string;
  deliverables: string[];
  success_criteria: string[];
  dependencies: string[];
}

export interface Risk {
  risk_name: string;
  probability: number;
  impact: ImpactLevel;
  risk_level: RiskLevel;
  description: string;
  mitigation_plan: string;
}

export interface MitigationStrategy {
  strategy_name: string;
  description: string;
  effectiveness: number;
  implementation_effort: EffortLevel;
  cost: number;
}

export interface TimelinePhase {
  phase_name: string;
  start_date: string;
  end_date: string;
  deliverables: string[];
  milestones: string[];
}

export interface TimelineDependency {
  dependent_task: string;
  prerequisite_task: string;
  dependency_type: DependencyType;
  lag_time?: string;
}

export enum DependencyType {
  FINISH_TO_START = 'finish_to_start',
  START_TO_START = 'start_to_start',
  FINISH_TO_FINISH = 'finish_to_finish',
  START_TO_FINISH = 'start_to_finish'
}

export interface EffortComparison {
  relative_effort: number;
  time_difference: string;
  complexity_difference: string;
  resource_difference: string;
}

export interface ImpactComparison {
  relative_impact: number;
  benefit_difference: string;
  risk_difference: string;
  value_difference: string;
}