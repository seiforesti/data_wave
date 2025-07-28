/**
 * Advanced Data Lineage Types
 * Maps to: advanced_lineage_service.py, data_lineage_models.py, lineage_service.py
 * 
 * Comprehensive types for advanced data lineage tracking, column-level lineage,
 * impact analysis, and lineage visualization with enterprise-grade capabilities.
 */

export interface EnterpriseDataLineage {
  id?: number;
  lineage_id: string;
  lineage_name: string;
  lineage_description?: string;
  source_asset_id: string;
  target_asset_id: string;
  lineage_type: LineageType;
  lineage_direction: LineageDirection;
  relationship_strength: number;
  confidence_level: number;
  transformation_logic?: string;
  transformation_type?: TransformationType;
  business_logic?: string;
  technical_details: Record<string, any>;
  column_mappings: ColumnMapping[];
  dependency_level: number;
  impact_scope: ImpactScope;
  data_flow_volume?: number;
  processing_frequency?: string;
  last_processed?: string;
  quality_impact: QualityImpact;
  business_impact: LineageBusinessImpact;
  governance_tags: string[];
  compliance_implications: string[];
  is_active: boolean;
  is_validated: boolean;
  validation_method?: string;
  validation_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  custom_properties?: Record<string, any>;
}

export interface ColumnMapping {
  mapping_id: string;
  source_column: ColumnReference;
  target_column: ColumnReference;
  transformation_expression?: string;
  transformation_type: ColumnTransformationType;
  data_type_conversion?: DataTypeConversion;
  business_rule?: string;
  quality_checks: QualityCheck[];
  impact_analysis: ColumnImpactAnalysis;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  is_derived: boolean;
  derivation_logic?: string;
  confidence_score: number;
  last_validated: string;
}

export interface ColumnReference {
  asset_id: string;
  database_name?: string;
  schema_name?: string;
  table_name: string;
  column_name: string;
  column_type: string;
  column_description?: string;
  is_nullable: boolean;
  default_value?: any;
  constraints: string[];
  metadata: Record<string, any>;
}

export interface LineageGraph {
  graph_id: string;
  graph_name: string;
  root_asset_id: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
  depth_levels: Record<number, string[]>;
  critical_paths: CriticalPath[];
  circular_dependencies: CircularDependency[];
  bottlenecks: LineageBottleneck[];
  statistics: LineageGraphStatistics;
  visualization_config: LineageVisualizationConfig;
  last_updated: string;
  refresh_frequency: string;
}

export interface LineageNode {
  node_id: string;
  asset_id: string;
  asset_name: string;
  asset_type: string;
  node_type: NodeType;
  position: NodePosition;
  metadata: NodeMetadata;
  properties: NodeProperties;
  relationships: NodeRelationship[];
  impact_metrics: NodeImpactMetrics;
  quality_metrics: NodeQualityMetrics;
  business_context: NodeBusinessContext;
  technical_context: NodeTechnicalContext;
  visualization_style: NodeVisualizationStyle;
}

export interface LineageEdge {
  edge_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: EdgeType;
  relationship_type: LineageType;
  weight: number;
  properties: EdgeProperties;
  transformation_details: TransformationDetails;
  data_flow_metrics: DataFlowMetrics;
  quality_metrics: EdgeQualityMetrics;
  business_rules: BusinessRule[];
  governance_policies: GovernancePolicy[];
  visualization_style: EdgeVisualizationStyle;
}

export interface ImpactAnalysis {
  analysis_id: string;
  source_asset_id: string;
  analysis_type: ImpactAnalysisType;
  scope: ImpactScope;
  affected_assets: AffectedAsset[];
  impact_summary: ImpactSummary;
  risk_assessment: ImpactRiskAssessment;
  recommendations: ImpactRecommendation[];
  business_implications: BusinessImplication[];
  technical_implications: TechnicalImplication[];
  compliance_implications: ComplianceImplication[];
  timeline_estimate: TimelineEstimate;
  stakeholder_impact: StakeholderImpact[];
  mitigation_strategies: MitigationStrategy[];
  rollback_plan: RollbackPlan;
  analysis_metadata: AnalysisMetadata;
  created_at: string;
  analyzed_by: string;
}

export interface AffectedAsset {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  impact_level: ImpactLevel;
  impact_type: string[];
  estimated_downtime?: string;
  recovery_time?: string;
  business_criticality: BusinessCriticality;
  dependencies: AssetDependency[];
  impact_details: ImpactDetails;
  mitigation_options: MitigationOption[];
}

export interface LineageVisualization {
  visualization_id: string;
  graph_id: string;
  layout_type: LayoutType;
  view_mode: ViewMode;
  filter_criteria: FilterCriteria;
  display_options: DisplayOptions;
  interaction_settings: InteractionSettings;
  export_settings: ExportSettings;
  performance_settings: PerformanceSettings;
  accessibility_settings: AccessibilitySettings;
  custom_styles: CustomStyles;
  animation_settings: AnimationSettings;
}

export interface LineageMetrics {
  lineage_id: string;
  coverage_metrics: CoverageMetrics;
  quality_metrics: LineageQualityMetrics;
  performance_metrics: LineagePerformanceMetrics;
  usage_metrics: LineageUsageMetrics;
  business_metrics: LineageBusinessMetrics;
  technical_metrics: LineageTechnicalMetrics;
  governance_metrics: LineageGovernanceMetrics;
  trend_analysis: LineageTrendAnalysis;
  benchmark_comparison: BenchmarkComparison;
  calculated_at: string;
  next_calculation: string;
}

// ===================== SUPPORTING TYPES =====================

export interface QualityImpact {
  impact_score: number;
  affected_dimensions: string[];
  quality_degradation_risk: number;
  data_freshness_impact: number;
  completeness_impact: number;
  accuracy_impact: number;
  consistency_impact: number;
}

export interface LineageBusinessImpact {
  business_value: number;
  criticality_level: BusinessCriticality;
  business_processes: string[];
  kpis_affected: string[];
  revenue_impact: number;
  cost_impact: number;
  compliance_impact: number;
  decision_impact: number;
}

export interface DataTypeConversion {
  source_type: string;
  target_type: string;
  conversion_function?: string;
  precision_loss: boolean;
  data_loss_risk: number;
  validation_rules: string[];
}

export interface QualityCheck {
  check_id: string;
  check_type: string;
  check_expression: string;
  threshold: number;
  severity: Severity;
  business_rule?: string;
}

export interface ColumnImpactAnalysis {
  impact_score: number;
  downstream_columns: number;
  critical_dependencies: number;
  business_rule_dependencies: number;
  quality_rule_dependencies: number;
  performance_impact: number;
}

export interface CriticalPath {
  path_id: string;
  path_nodes: string[];
  path_length: number;
  business_criticality: BusinessCriticality;
  performance_bottlenecks: string[];
  quality_risks: string[];
  mitigation_recommendations: string[];
}

export interface CircularDependency {
  cycle_id: string;
  cycle_nodes: string[];
  cycle_length: number;
  resolution_strategies: string[];
  business_impact: string;
  technical_impact: string;
}

export interface LineageBottleneck {
  bottleneck_id: string;
  location: string;
  bottleneck_type: BottleneckType;
  severity: Severity;
  impact_description: string;
  resolution_options: string[];
  estimated_improvement: number;
}

export interface LineageGraphStatistics {
  total_nodes: number;
  total_edges: number;
  max_depth: number;
  avg_fan_out: number;
  avg_fan_in: number;
  complexity_score: number;
  coverage_percentage: number;
  validation_percentage: number;
}

export interface NodePosition {
  x: number;
  y: number;
  z?: number;
  layer?: number;
  cluster?: string;
}

export interface NodeMetadata {
  last_accessed: string;
  access_frequency: number;
  data_volume: number;
  processing_time: number;
  error_rate: number;
  availability: number;
}

export interface NodeProperties {
  is_critical: boolean;
  is_deprecated: boolean;
  is_monitored: boolean;
  has_pii: boolean;
  compliance_tags: string[];
  business_tags: string[];
  technical_tags: string[];
}

export interface NodeRelationship {
  related_node_id: string;
  relationship_type: string;
  relationship_strength: number;
  business_context: string;
}

export interface NodeImpactMetrics {
  downstream_impact: number;
  upstream_dependencies: number;
  criticality_score: number;
  business_value: number;
  replacement_difficulty: number;
}

export interface NodeQualityMetrics {
  data_quality_score: number;
  completeness: number;
  accuracy: number;
  timeliness: number;
  consistency: number;
  validity: number;
}

export interface NodeBusinessContext {
  business_purpose: string;
  business_owner: string;
  business_processes: string[];
  kpis_supported: string[];
  regulatory_requirements: string[];
}

export interface NodeTechnicalContext {
  technology_stack: string[];
  deployment_environment: string;
  performance_characteristics: Record<string, number>;
  scalability_limits: Record<string, number>;
  monitoring_config: Record<string, any>;
}

export interface EdgeProperties {
  processing_time: number;
  data_volume: number;
  frequency: string;
  latency: number;
  error_rate: number;
  cost: number;
  complexity: number;
}

export interface TransformationDetails {
  transformation_id: string;
  transformation_name: string;
  transformation_type: TransformationType;
  logic_description: string;
  code_reference?: string;
  performance_characteristics: Record<string, number>;
  error_handling: ErrorHandling;
  monitoring_config: Record<string, any>;
}

export interface DataFlowMetrics {
  throughput: number;
  latency: number;
  volume_trend: number[];
  peak_times: string[];
  bottleneck_indicators: string[];
  quality_degradation: number;
}

export interface EdgeQualityMetrics {
  transformation_accuracy: number;
  data_loss_percentage: number;
  error_rate: number;
  validation_coverage: number;
  business_rule_compliance: number;
}

export interface BusinessRule {
  rule_id: string;
  rule_name: string;
  rule_description: string;
  rule_type: string;
  validation_logic: string;
  business_impact: string;
}

export interface GovernancePolicy {
  policy_id: string;
  policy_name: string;
  policy_description: string;
  policy_type: string;
  enforcement_level: string;
  compliance_requirements: string[];
}

// ===================== VISUALIZATION TYPES =====================

export interface LineageVisualizationConfig {
  layout_algorithm: string;
  node_spacing: number;
  edge_routing: string;
  zoom_limits: ZoomLimits;
  pan_limits: PanLimits;
  selection_options: SelectionOptions;
  highlighting_options: HighlightingOptions;
  animation_duration: number;
  performance_mode: boolean;
}

export interface NodeVisualizationStyle {
  shape: string;
  size: number;
  color: string;
  border_color: string;
  border_width: number;
  icon?: string;
  label_position: string;
  label_style: LabelStyle;
}

export interface EdgeVisualizationStyle {
  line_type: string;
  thickness: number;
  color: string;
  arrow_type: string;
  animation?: string;
  label_style?: LabelStyle;
}

export interface DisplayOptions {
  show_labels: boolean;
  show_icons: boolean;
  show_metrics: boolean;
  show_quality_indicators: boolean;
  show_business_context: boolean;
  show_technical_details: boolean;
  compact_mode: boolean;
  high_contrast_mode: boolean;
}

// ===================== ENUMS =====================

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

export enum LineageDirection {
  UPSTREAM = 'upstream',
  DOWNSTREAM = 'downstream',
  BIDIRECTIONAL = 'bidirectional'
}

export enum TransformationType {
  DIRECT_COPY = 'direct_copy',
  AGGREGATION = 'aggregation',
  JOIN = 'join',
  FILTER = 'filter',
  CALCULATION = 'calculation',
  CONVERSION = 'conversion',
  ENRICHMENT = 'enrichment',
  VALIDATION = 'validation',
  CUSTOM = 'custom'
}

export enum ColumnTransformationType {
  DIRECT_MAPPING = 'direct_mapping',
  CALCULATION = 'calculation',
  AGGREGATION = 'aggregation',
  CONCATENATION = 'concatenation',
  SPLIT = 'split',
  FORMAT_CONVERSION = 'format_conversion',
  LOOKUP = 'lookup',
  CONDITIONAL = 'conditional'
}

export enum NodeType {
  SOURCE = 'source',
  TARGET = 'target',
  INTERMEDIATE = 'intermediate',
  TRANSFORMATION = 'transformation',
  JUNCTION = 'junction'
}

export enum EdgeType {
  DATA_FLOW = 'data_flow',
  DEPENDENCY = 'dependency',
  TRANSFORMATION = 'transformation',
  REFERENCE = 'reference',
  CONTROL_FLOW = 'control_flow'
}

export enum ImpactAnalysisType {
  SCHEMA_CHANGE = 'schema_change',
  DATA_DELETION = 'data_deletion',
  ASSET_RETIREMENT = 'asset_retirement',
  TRANSFORMATION_CHANGE = 'transformation_change',
  ACCESS_RESTRICTION = 'access_restriction',
  QUALITY_CHANGE = 'quality_change'
}

export enum ImpactScope {
  IMMEDIATE = 'immediate',
  FIRST_DEGREE = 'first_degree',
  SECOND_DEGREE = 'second_degree',
  FULL_GRAPH = 'full_graph',
  CRITICAL_PATH = 'critical_path'
}

export enum BusinessCriticality {
  MISSION_CRITICAL = 'mission_critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  EXPERIMENTAL = 'experimental'
}

export enum LayoutType {
  HIERARCHICAL = 'hierarchical',
  FORCE_DIRECTED = 'force_directed',
  CIRCULAR = 'circular',
  TREE = 'tree',
  GRID = 'grid',
  LAYERED = 'layered'
}

export enum ViewMode {
  OVERVIEW = 'overview',
  DETAILED = 'detailed',
  SIMPLIFIED = 'simplified',
  TECHNICAL = 'technical',
  BUSINESS = 'business'
}

export enum BottleneckType {
  PROCESSING = 'processing',
  NETWORK = 'network',
  STORAGE = 'storage',
  TRANSFORMATION = 'transformation',
  VALIDATION = 'validation'
}

// Import related types
import type { Severity, ImpactLevel } from './analytics.types';

// Complex nested types for detailed lineage analysis
export interface ImpactSummary {
  total_assets_affected: number;
  critical_assets_affected: number;
  estimated_recovery_time: string;
  business_processes_impacted: number;
  revenue_at_risk: number;
  compliance_risks: string[];
}

export interface ImpactRiskAssessment {
  overall_risk_level: string;
  technical_risks: TechnicalRisk[];
  business_risks: BusinessRisk[];
  compliance_risks: ComplianceRisk[];
  mitigation_complexity: string;
}

export interface ImpactRecommendation {
  recommendation_id: string;
  recommendation_type: string;
  description: string;
  priority: string;
  implementation_effort: string;
  expected_benefit: string;
  timeline: string;
}

export interface BusinessImplication {
  business_area: string;
  impact_description: string;
  severity: Severity;
  stakeholders_affected: string[];
  mitigation_options: string[];
}

export interface TechnicalImplication {
  system_component: string;
  impact_description: string;
  technical_complexity: string;
  required_changes: string[];
  testing_requirements: string[];
}

export interface ComplianceImplication {
  regulation: string;
  compliance_requirement: string;
  risk_level: string;
  remediation_required: boolean;
  timeline_constraint: string;
}

export interface StakeholderImpact {
  stakeholder_group: string;
  impact_level: ImpactLevel;
  impact_description: string;
  communication_required: boolean;
  approval_required: boolean;
}

export interface RollbackPlan {
  rollback_complexity: string;
  rollback_time_estimate: string;
  rollback_steps: RollbackStep[];
  rollback_risks: string[];
  success_criteria: string[];
}

export interface RollbackStep {
  step_number: number;
  step_description: string;
  estimated_time: string;
  dependencies: string[];
  verification_method: string;
}

export interface TimelineEstimate {
  planning_phase: string;
  implementation_phase: string;
  testing_phase: string;
  rollout_phase: string;
  total_timeline: string;
  critical_milestones: string[];
}

export interface AssetDependency {
  dependency_type: string;
  dependent_asset_id: string;
  dependency_strength: number;
  is_critical: boolean;
  fallback_options: string[];
}

export interface ImpactDetails {
  impact_vectors: string[];
  affected_functions: string[];
  data_quality_impact: number;
  performance_impact: number;
  availability_impact: number;
}

export interface MitigationOption {
  option_id: string;
  option_name: string;
  description: string;
  effectiveness: number;
  implementation_effort: string;
  cost_estimate: number;
  timeline: string;
}

export interface ErrorHandling {
  error_types: string[];
  handling_strategy: string;
  recovery_procedures: string[];
  escalation_rules: string[];
  monitoring_alerts: string[];
}

export interface FilterCriteria {
  asset_types: string[];
  business_domains: string[];
  criticality_levels: string[];
  quality_thresholds: Record<string, number>;
  date_ranges: Record<string, string>;
}

export interface InteractionSettings {
  selection_mode: string;
  zoom_behavior: string;
  pan_behavior: string;
  hover_effects: boolean;
  click_actions: ClickAction[];
  keyboard_shortcuts: KeyboardShortcut[];
}

export interface ClickAction {
  trigger: string;
  action: string;
  parameters: Record<string, any>;
}

export interface KeyboardShortcut {
  key_combination: string;
  action: string;
  description: string;
}

export interface ExportSettings {
  supported_formats: string[];
  export_options: ExportOption[];
  quality_settings: QualitySettings;
  metadata_inclusion: boolean;
}

export interface ExportOption {
  format: string;
  description: string;
  parameters: Record<string, any>;
}

export interface QualitySettings {
  resolution: string;
  compression: string;
  color_depth: number;
}

export interface PerformanceSettings {
  rendering_mode: string;
  level_of_detail: boolean;
  culling_enabled: boolean;
  max_visible_nodes: number;
  refresh_rate: number;
}

export interface AccessibilitySettings {
  high_contrast: boolean;
  large_text: boolean;
  screen_reader_support: boolean;
  keyboard_navigation: boolean;
  voice_commands: boolean;
}

export interface CustomStyles {
  theme_name: string;
  color_palette: Record<string, string>;
  font_family: string;
  font_sizes: Record<string, number>;
  spacing_rules: Record<string, number>;
}

export interface AnimationSettings {
  animation_enabled: boolean;
  transition_duration: number;
  easing_function: string;
  frame_rate: number;
  reduce_motion: boolean;
}

export interface ZoomLimits {
  min_zoom: number;
  max_zoom: number;
  zoom_step: number;
}

export interface PanLimits {
  enabled: boolean;
  bounds: BoundingBox;
}

export interface BoundingBox {
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
}

export interface SelectionOptions {
  multi_select: boolean;
  select_connected: boolean;
  highlight_paths: boolean;
  show_details_panel: boolean;
}

export interface HighlightingOptions {
  highlight_on_hover: boolean;
  highlight_connected: boolean;
  highlight_critical_path: boolean;
  fade_unrelated: boolean;
}

export interface LabelStyle {
  font_family: string;
  font_size: number;
  font_weight: string;
  color: string;
  background_color?: string;
  padding: number;
  border_radius: number;
}

// Additional complex types for comprehensive lineage support
export interface CoverageMetrics {
  asset_coverage: number;
  column_coverage: number;
  transformation_coverage: number;
  business_rule_coverage: number;
  quality_rule_coverage: number;
}

export interface LineageQualityMetrics {
  accuracy_score: number;
  completeness_score: number;
  freshness_score: number;
  validation_coverage: number;
  confidence_score: number;
}

export interface LineagePerformanceMetrics {
  graph_build_time: number;
  query_response_time: number;
  visualization_render_time: number;
  memory_usage: number;
  cpu_usage: number;
}

export interface LineageUsageMetrics {
  view_count: number;
  unique_users: number;
  analysis_requests: number;
  export_requests: number;
  api_calls: number;
}

export interface LineageBusinessMetrics {
  business_value_score: number;
  compliance_score: number;
  risk_mitigation_value: number;
  decision_support_value: number;
  operational_efficiency_gain: number;
}

export interface LineageTechnicalMetrics {
  automation_level: number;
  integration_coverage: number;
  api_reliability: number;
  data_freshness: number;
  system_availability: number;
}

export interface LineageGovernanceMetrics {
  policy_compliance: number;
  audit_trail_completeness: number;
  access_control_coverage: number;
  data_classification_coverage: number;
  privacy_compliance: number;
}

export interface LineageTrendAnalysis {
  growth_trends: TrendData[];
  quality_trends: TrendData[];
  usage_trends: TrendData[];
  performance_trends: TrendData[];
  business_value_trends: TrendData[];
}

export interface TrendData {
  metric_name: string;
  time_series: TimeSeriesPoint[];
  trend_direction: string;
  growth_rate: number;
  seasonality: boolean;
  forecast: ForecastPoint[];
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface ForecastPoint {
  timestamp: string;
  predicted_value: number;
  confidence_interval: [number, number];
}

export interface BenchmarkComparison {
  industry_benchmarks: BenchmarkData[];
  internal_benchmarks: BenchmarkData[];
  peer_comparisons: BenchmarkData[];
  best_practices: BestPractice[];
}

export interface BenchmarkData {
  benchmark_name: string;
  metric_name: string;
  benchmark_value: number;
  current_value: number;
  variance_percentage: number;
  performance_rating: string;
}

export interface BestPractice {
  practice_name: string;
  description: string;
  implementation_guide: string;
  expected_benefit: string;
  implementation_effort: string;
}

export interface TechnicalRisk {
  risk_name: string;
  probability: number;
  impact: string;
  mitigation_strategy: string;
  owner: string;
}

export interface BusinessRisk {
  risk_name: string;
  business_impact: string;
  financial_impact: number;
  probability: number;
  mitigation_plan: string;
}

export interface ComplianceRisk {
  regulation: string;
  risk_description: string;
  severity: string;
  remediation_required: boolean;
  timeline: string;
}

export interface AnalysisMetadata {
  analysis_version: string;
  algorithm_used: string;
  confidence_level: number;
  data_sources: string[];
  assumptions: string[];
  limitations: string[];
}