// 📊 **ADVANCED CATALOG CORE TYPES**
// Complete mapping to backend models: advanced_catalog_models.py, catalog_intelligence_models.py, 
// catalog_quality_models.py, data_lineage_models.py, catalog_models.py

// 🎯 CORE CATALOG MODELS TYPES
export interface IntelligentDataAsset {
  id: string;
  name: string;
  description?: string;
  asset_type: AssetType;
  schema_info: SchemaInfo;
  metadata: AssetMetadata;
  data_source_id: string;
  database_name?: string;
  schema_name?: string;
  table_name?: string;
  column_name?: string;
  file_path?: string;
  tags: CatalogTag[];
  business_glossary_terms: BusinessGlossaryAssociation[];
  quality_assessment: DataQualityAssessment;
  usage_metrics: AssetUsageMetrics;
  profiling_results: DataProfilingResult[];
  semantic_embeddings: SemanticEmbedding[];
  lineage_upstream: EnterpriseDataLineage[];
  lineage_downstream: EnterpriseDataLineage[];
  classification_labels: ClassificationLabel[];
  sensitivity_level: SensitivityLevel;
  access_policies: AccessPolicy[];
  stewards: DataSteward[];
  owners: DataOwner[];
  created_at: Date;
  updated_at: Date;
  last_accessed_at?: Date;
  is_active: boolean;
  version: number;
  ai_insights: AIInsight[];
  popularity_score: number;
  quality_score: number;
  trust_score: number;
  business_value_score: number;
}

export interface EnterpriseDataLineage {
  id: string;
  source_asset_id: string;
  target_asset_id: string;
  source_asset: IntelligentDataAsset;
  target_asset: IntelligentDataAsset;
  lineage_type: LineageType;
  transformation_logic?: string;
  transformation_type?: TransformationType;
  column_mappings: ColumnMapping[];
  created_at: Date;
  updated_at: Date;
  confidence_score: number;
  validation_status: ValidationStatus;
  business_context?: string;
  technical_context?: string;
  impact_analysis: LineageImpactAnalysis;
  visualization_config: LineageVisualizationConfig;
  metrics: LineageMetrics;
}

export interface DataQualityAssessment {
  id: string;
  asset_id: string;
  assessment_date: Date;
  overall_score: number;
  completeness_score: number;
  accuracy_score: number;
  consistency_score: number;
  validity_score: number;
  uniqueness_score: number;
  timeliness_score: number;
  rules_applied: DataQualityRule[];
  issues_found: QualityIssue[];
  recommendations: QualityRecommendation[];
  assessment_config: QualityAssessmentConfig;
  historical_trend: QualityTrend[];
  monitoring_alerts: QualityMonitoringAlert[];
  scorecard: QualityScorecard;
  reports: QualityReport[];
}

export interface BusinessGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  description?: string;
  category: string;
  synonyms: string[];
  related_terms: string[];
  business_rules: string[];
  data_steward_id?: string;
  domain: string;
  classification: string;
  approval_status: ApprovalStatus;
  version: number;
  created_at: Date;
  updated_at: Date;
  approved_at?: Date;
  approved_by?: string;
  usage_count: number;
  context_examples: string[];
  regulatory_context?: string;
  business_criticality: BusinessCriticality;
}

export interface BusinessGlossaryAssociation {
  id: string;
  asset_id: string;
  glossary_term_id: string;
  association_type: AssociationType;
  confidence_score: number;
  created_at: Date;
  created_by: string;
  validation_status: ValidationStatus;
  business_context?: string;
  usage_context?: string;
}

export interface AssetUsageMetrics {
  id: string;
  asset_id: string;
  daily_queries: number;
  weekly_queries: number;
  monthly_queries: number;
  unique_users_daily: number;
  unique_users_weekly: number;
  unique_users_monthly: number;
  avg_query_duration: number;
  peak_usage_times: TimeSlot[];
  usage_patterns: UsagePattern[];
  trending_score: number;
  popularity_rank: number;
  user_satisfaction_score: number;
  error_rate: number;
  performance_metrics: PerformanceMetric[];
  cost_metrics: CostMetric[];
  business_impact_score: number;
  last_calculated: Date;
}

export interface DataProfilingResult {
  id: string;
  asset_id: string;
  column_name?: string;
  profiling_date: Date;
  row_count: number;
  null_count: number;
  null_percentage: number;
  unique_count: number;
  unique_percentage: number;
  data_type: string;
  min_value?: any;
  max_value?: any;
  avg_value?: number;
  median_value?: number;
  std_deviation?: number;
  percentiles: Record<string, any>;
  value_distribution: ValueDistribution[];
  pattern_analysis: PatternAnalysis;
  anomalies_detected: Anomaly[];
  quality_flags: QualityFlag[];
  data_classification: DataClassification;
  sensitivity_indicators: SensitivityIndicator[];
  statistical_summary: StatisticalSummary;
}

// 🧠 CATALOG INTELLIGENCE TYPES
export interface SemanticEmbedding {
  id: string;
  asset_id: string;
  embedding_vector: number[];
  embedding_model: string;
  embedding_version: string;
  text_content: string;
  context_type: ContextType;
  created_at: Date;
  updated_at: Date;
  similarity_threshold: number;
  quality_score: number;
  validation_status: ValidationStatus;
}

export interface SemanticRelationship {
  id: string;
  source_asset_id: string;
  target_asset_id: string;
  relationship_type: RelationshipType;
  similarity_score: number;
  confidence_level: ConfidenceLevel;
  relationship_context: string;
  created_at: Date;
  validated: boolean;
  validation_date?: Date;
  business_relevance: number;
  technical_relevance: number;
  semantic_distance: number;
}

export interface RecommendationEngine {
  id: string;
  user_id: string;
  recommendation_type: RecommendationType;
  algorithm_used: string;
  model_version: string;
  training_data_date: Date;
  accuracy_score: number;
  precision_score: number;
  recall_score: number;
  f1_score: number;
  feature_importance: FeatureImportance[];
  hyperparameters: Record<string, any>;
  last_retrained: Date;
  performance_metrics: ModelPerformanceMetric[];
}

export interface AssetRecommendation {
  id: string;
  user_id: string;
  asset_id: string;
  recommendation_type: RecommendationType;
  relevance_score: number;
  confidence_score: number;
  reasoning: string;
  recommendation_context: RecommendationContext;
  created_at: Date;
  expires_at?: Date;
  clicked: boolean;
  clicked_at?: Date;
  feedback_rating?: number;
  feedback_comment?: string;
  business_value_indicator: number;
  usage_likelihood: number;
}

export interface AssetUsagePattern {
  id: string;
  asset_id: string;
  user_id?: string;
  pattern_type: PatternType;
  pattern_description: string;
  frequency: Frequency;
  temporal_pattern: TemporalPattern;
  access_pattern: AccessPattern;
  query_patterns: QueryPattern[];
  seasonal_trends: SeasonalTrend[];
  anomaly_indicators: AnomalyIndicator[];
  predictive_insights: PredictiveInsight[];
  business_context: string;
  technical_context: string;
  confidence_level: ConfidenceLevel;
  created_at: Date;
  updated_at: Date;
}

export interface IntelligenceInsight {
  id: string;
  asset_id?: string;
  insight_type: InsightType;
  insight_category: InsightCategory;
  title: string;
  description: string;
  severity: SeverityLevel;
  priority: PriorityLevel;
  confidence_score: number;
  supporting_evidence: Evidence[];
  recommendations: ActionRecommendation[];
  impact_assessment: ImpactAssessment;
  created_at: Date;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  resolved: boolean;
  resolved_at?: Date;
  business_impact: BusinessImpact;
  technical_impact: TechnicalImpact;
}

export interface CollaborationInsight {
  id: string;
  team_id?: string;
  collaboration_type: CollaborationType;
  insight_summary: string;
  participants: Participant[];
  activity_patterns: ActivityPattern[];
  knowledge_sharing_metrics: KnowledgeSharingMetric[];
  collaboration_effectiveness: number;
  knowledge_gaps_identified: KnowledgeGap[];
  recommended_connections: RecommendedConnection[];
  expertise_mapping: ExpertiseMapping[];
  created_at: Date;
  analysis_period_start: Date;
  analysis_period_end: Date;
}

// 📈 QUALITY MANAGEMENT TYPES
export interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  rule_type: QualityRuleType;
  category: QualityCategory;
  severity: SeverityLevel;
  threshold_value?: number;
  threshold_operator?: ComparisonOperator;
  validation_logic: string;
  sql_expression?: string;
  python_expression?: string;
  custom_logic?: string;
  applicable_data_types: string[];
  scope: QualityScope;
  tags: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  business_justification: string;
  technical_implementation: string;
}

export interface QualityAssessment {
  id: string;
  asset_id: string;
  rule_id: string;
  assessment_date: Date;
  assessment_result: AssessmentResult;
  score: number;
  status: QualityStatus;
  issues_count: number;
  records_passed: number;
  records_failed: number;
  total_records: number;
  execution_time: number;
  assessment_details: AssessmentDetail[];
  remediation_suggestions: RemediationSuggestion[];
  business_impact: BusinessImpact;
  priority: PriorityLevel;
}

export interface QualityScorecard {
  id: string;
  asset_id: string;
  scorecard_date: Date;
  overall_score: number;
  dimension_scores: DimensionScore[];
  rule_scores: RuleScore[];
  historical_comparison: HistoricalComparison;
  trend_analysis: TrendAnalysis;
  benchmark_comparison: BenchmarkComparison;
  improvement_opportunities: ImprovementOpportunity[];
  action_items: ActionItem[];
  stakeholder_summary: StakeholderSummary;
  executive_summary: ExecutiveSummary;
}

export interface QualityMonitoringConfig {
  id: string;
  asset_id: string;
  monitoring_frequency: MonitoringFrequency;
  rules_to_monitor: string[];
  alert_thresholds: AlertThreshold[];
  notification_channels: NotificationChannel[];
  escalation_rules: EscalationRule[];
  monitoring_schedule: MonitoringSchedule;
  retention_policy: RetentionPolicy;
  reporting_config: ReportingConfig;
  automated_actions: AutomatedAction[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_execution: Date;
}

export interface QualityMonitoringAlert {
  id: string;
  config_id: string;
  asset_id: string;
  rule_id: string;
  alert_type: AlertType;
  severity: SeverityLevel;
  title: string;
  description: string;
  threshold_breached: string;
  current_value: number;
  threshold_value: number;
  triggered_at: Date;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  resolved: boolean;
  resolved_at?: Date;
  resolution_notes?: string;
  notifications_sent: NotificationLog[];
  escalation_level: number;
}

export interface QualityReport {
  id: string;
  report_type: ReportType;
  report_name: string;
  scope: ReportScope;
  time_period: TimePeriod;
  generated_at: Date;
  generated_by: string;
  format: ReportFormat;
  content: ReportContent;
  executive_summary: ExecutiveSummary;
  detailed_findings: DetailedFinding[];
  recommendations: Recommendation[];
  charts_and_visualizations: Visualization[];
  appendices: Appendix[];
  distribution_list: string[];
  access_permissions: Permission[];
}

// 🔗 DATA LINEAGE TYPES
export interface DataLineageNode {
  id: string;
  asset_id: string;
  node_type: NodeType;
  node_label: string;
  position: NodePosition;
  metadata: NodeMetadata;
  properties: NodeProperty[];
  styling: NodeStyling;
  visibility: VisibilityConfig;
  interaction_config: InteractionConfig;
  tooltip_content: TooltipContent;
  connected_edges: string[];
  cluster_id?: string;
  hierarchy_level: number;
  importance_score: number;
}

export interface DataLineageEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: EdgeType;
  transformation_type?: TransformationType;
  transformation_description?: string;
  weight: number;
  confidence_score: number;
  metadata: EdgeMetadata;
  styling: EdgeStyling;
  visibility: VisibilityConfig;
  interaction_config: InteractionConfig;
  tooltip_content: TooltipContent;
  animation_config?: AnimationConfig;
  business_context?: string;
  technical_context?: string;
}

export interface LineageImpactAnalysis {
  id: string;
  source_asset_id: string;
  analysis_type: AnalysisType;
  impact_scope: ImpactScope;
  affected_assets: AffectedAsset[];
  impact_assessment: ImpactAssessment;
  risk_analysis: RiskAnalysis;
  change_timeline: ChangeTimelineItem[];
  stakeholder_impact: StakeholderImpact[];
  business_continuity_assessment: BusinessContinuityAssessment;
  mitigation_strategies: MitigationStrategy[];
  rollback_plan: RollbackPlan;
  approval_workflow: ApprovalWorkflow;
  communication_plan: CommunicationPlan;
}

export interface LineageVisualizationConfig {
  id: string;
  config_name: string;
  layout_algorithm: LayoutAlgorithm;
  layout_parameters: LayoutParameter[];
  node_styling: GlobalNodeStyling;
  edge_styling: GlobalEdgeStyling;
  zoom_config: ZoomConfig;
  pan_config: PanConfig;
  filter_config: FilterConfig;
  grouping_config: GroupingConfig;
  animation_config: AnimationConfig;
  interaction_modes: InteractionMode[];
  tooltip_config: TooltipConfig;
  legend_config: LegendConfig;
  export_config: ExportConfig;
  performance_config: PerformanceConfig;
}

export interface LineageMetrics {
  id: string;
  lineage_graph_id: string;
  metrics_date: Date;
  total_nodes: number;
  total_edges: number;
  graph_density: number;
  average_path_length: number;
  clustering_coefficient: number;
  centrality_measures: CentralityMeasure[];
  complexity_score: number;
  completeness_score: number;
  accuracy_score: number;
  freshness_score: number;
  performance_metrics: PerformanceMetric[];
  usage_statistics: UsageStatistic[];
  quality_indicators: QualityIndicator[];
}

// 📋 FOUNDATION CATALOG TYPES
export interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  item_type: CatalogItemType;
  source_system: string;
  source_id: string;
  metadata: ItemMetadata;
  tags: CatalogItemTag[];
  lineage: DataLineage[];
  usage_logs: CatalogUsageLog[];
  quality_rules: CatalogQualityRule[];
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  access_level: AccessLevel;
  business_value: number;
  technical_debt_score: number;
}

export interface CatalogTag {
  id: string;
  name: string;
  description?: string;
  category: TagCategory;
  color: string;
  icon?: string;
  is_system_tag: boolean;
  parent_tag_id?: string;
  child_tags: CatalogTag[];
  usage_count: number;
  created_at: Date;
  created_by: string;
  approval_required: boolean;
  governance_level: GovernanceLevel;
}

export interface CatalogItemTag {
  id: string;
  catalog_item_id: string;
  tag_id: string;
  applied_at: Date;
  applied_by: string;
  confidence_score: number;
  auto_applied: boolean;
  validation_status: ValidationStatus;
  business_context?: string;
}

export interface DataLineage {
  id: string;
  source_item_id: string;
  target_item_id: string;
  relationship_type: LineageRelationshipType;
  created_at: Date;
  discovered_method: DiscoveryMethod;
  confidence_level: ConfidenceLevel;
  business_impact: number;
  technical_complexity: number;
}

export interface CatalogUsageLog {
  id: string;
  catalog_item_id: string;
  user_id: string;
  action_type: ActionType;
  access_timestamp: Date;
  session_id: string;
  ip_address: string;
  user_agent: string;
  access_duration?: number;
  success: boolean;
  error_message?: string;
  business_context?: string;
}

export interface CatalogQualityRule {
  id: string;
  name: string;
  description: string;
  rule_expression: string;
  severity: SeverityLevel;
  category: QualityCategory;
  applicable_types: CatalogItemType[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  execution_frequency: ExecutionFrequency;
  last_execution: Date;
  success_rate: number;
}

// 🎯 SUPPORTING TYPES AND ENUMS
export enum AssetType {
  TABLE = 'table',
  VIEW = 'view',
  COLUMN = 'column',
  FILE = 'file',
  API = 'api',
  STREAM = 'stream',
  REPORT = 'report',
  DASHBOARD = 'dashboard',
  MODEL = 'model',
  NOTEBOOK = 'notebook',
  PIPELINE = 'pipeline',
  DATASET = 'dataset',
  WAREHOUSE = 'warehouse',
  LAKE = 'lake',
  MART = 'mart'
}

export enum LineageType {
  DIRECT = 'direct',
  DERIVED = 'derived',
  AGGREGATED = 'aggregated',
  FILTERED = 'filtered',
  JOINED = 'joined',
  TRANSFORMED = 'transformed',
  CALCULATED = 'calculated',
  REFERENCED = 'referenced',
  COPIED = 'copied',
  MERGED = 'merged'
}

export enum TransformationType {
  SELECT = 'select',
  JOIN = 'join',
  UNION = 'union',
  AGGREGATE = 'aggregate',
  FILTER = 'filter',
  SORT = 'sort',
  GROUP_BY = 'group_by',
  WINDOW = 'window',
  PIVOT = 'pivot',
  UNPIVOT = 'unpivot',
  CASE_WHEN = 'case_when',
  CALCULATE = 'calculate',
  CAST = 'cast',
  EXTRACT = 'extract',
  CUSTOM = 'custom'
}

export enum ValidationStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  REQUIRES_REVIEW = 'requires_review',
  AUTO_VALIDATED = 'auto_validated',
  EXPIRED = 'expired'
}

export enum SensitivityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret'
}

export enum ApprovalStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
  ARCHIVED = 'archived'
}

export enum BusinessCriticality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  MISSION_CRITICAL = 'mission_critical'
}

export enum AssociationType {
  EXACT_MATCH = 'exact_match',
  RELATED = 'related',
  SYNONYM = 'synonym',
  PARENT = 'parent',
  CHILD = 'child',
  DERIVED = 'derived',
  CONTEXT = 'context'
}

export enum ContextType {
  SCHEMA = 'schema',
  CONTENT = 'content',
  USAGE = 'usage',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  SEMANTIC = 'semantic'
}

export enum RelationshipType {
  SEMANTIC_SIMILARITY = 'semantic_similarity',
  USAGE_SIMILARITY = 'usage_similarity',
  SCHEMA_SIMILARITY = 'schema_similarity',
  CONTENT_SIMILARITY = 'content_similarity',
  BUSINESS_RELATIONSHIP = 'business_relationship',
  TECHNICAL_DEPENDENCY = 'technical_dependency'
}

export enum ConfidenceLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum RecommendationType {
  SIMILAR_ASSETS = 'similar_assets',
  FREQUENTLY_USED_TOGETHER = 'frequently_used_together',
  TRENDING = 'trending',
  QUALITY_IMPROVEMENT = 'quality_improvement',
  GOVERNANCE_COMPLIANCE = 'governance_compliance',
  COST_OPTIMIZATION = 'cost_optimization',
  PERFORMANCE_OPTIMIZATION = 'performance_optimization',
  DATA_DISCOVERY = 'data_discovery'
}

export enum PatternType {
  ACCESS_PATTERN = 'access_pattern',
  QUERY_PATTERN = 'query_pattern',
  TEMPORAL_PATTERN = 'temporal_pattern',
  USER_BEHAVIOR = 'user_behavior',
  PERFORMANCE_PATTERN = 'performance_pattern',
  ERROR_PATTERN = 'error_pattern'
}

export enum Frequency {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  AD_HOC = 'ad_hoc'
}

export enum InsightType {
  QUALITY_ISSUE = 'quality_issue',
  PERFORMANCE_ISSUE = 'performance_issue',
  USAGE_ANOMALY = 'usage_anomaly',
  SECURITY_CONCERN = 'security_concern',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  COST_OPTIMIZATION = 'cost_optimization',
  EFFICIENCY_IMPROVEMENT = 'efficiency_improvement',
  BUSINESS_OPPORTUNITY = 'business_opportunity'
}

export enum InsightCategory {
  TECHNICAL = 'technical',
  BUSINESS = 'business',
  OPERATIONAL = 'operational',
  STRATEGIC = 'strategic',
  TACTICAL = 'tactical',
  GOVERNANCE = 'governance'
}

export enum SeverityLevel {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  BLOCKER = 'blocker'
}

export enum PriorityLevel {
  LOWEST = 'lowest',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  HIGHEST = 'highest',
  URGENT = 'urgent'
}

export enum CollaborationType {
  PEER_REVIEW = 'peer_review',
  KNOWLEDGE_SHARING = 'knowledge_sharing',
  EXPERT_CONSULTATION = 'expert_consultation',
  TEAM_COLLABORATION = 'team_collaboration',
  CROSS_FUNCTIONAL = 'cross_functional',
  MENTORING = 'mentoring'
}

// 🎯 ADDITIONAL SUPPORTING INTERFACES
export interface SchemaInfo {
  columns: ColumnInfo[];
  primary_keys: string[];
  foreign_keys: ForeignKeyInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
  partitioning: PartitioningInfo;
  statistics: SchemaStatistics;
}

export interface ColumnInfo {
  name: string;
  data_type: string;
  is_nullable: boolean;
  default_value?: any;
  max_length?: number;
  precision?: number;
  scale?: number;
  description?: string;
  tags: string[];
  classification: DataClassification;
  sensitivity: SensitivityLevel;
  quality_score: number;
}

export interface AssetMetadata {
  creation_timestamp: Date;
  last_modified: Date;
  size_bytes?: number;
  row_count?: number;
  file_format?: string;
  compression?: string;
  encoding?: string;
  location: string;
  version: string;
  checksum?: string;
  custom_properties: Record<string, any>;
}

export interface ClassificationLabel {
  id: string;
  label: string;
  category: string;
  confidence_score: number;
  applied_by: string;
  applied_at: Date;
  validation_status: ValidationStatus;
  business_context?: string;
}

export interface AccessPolicy {
  id: string;
  policy_name: string;
  policy_type: PolicyType;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  effect: PolicyEffect;
  priority: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DataSteward {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department: string;
  expertise_areas: string[];
  responsibility_scope: string[];
  assigned_at: Date;
  is_primary: boolean;
}

export interface DataOwner {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department: string;
  business_unit: string;
  ownership_type: OwnershipType;
  assigned_at: Date;
  approved_by: string;
}

export interface AIInsight {
  id: string;
  insight_type: InsightType;
  title: string;
  description: string;
  confidence_score: number;
  created_at: Date;
  relevance_score: number;
  action_required: boolean;
  impact_level: ImpactLevel;
}

// 🔄 REQUEST/RESPONSE TYPES
export interface CatalogSearchRequest {
  query: string;
  filters: SearchFilter[];
  sort_by?: SortOption[];
  page: number;
  page_size: number;
  include_facets: boolean;
  search_type: SearchType;
  user_context?: UserContext;
}

export interface CatalogSearchResponse {
  results: SearchResult[];
  total_count: number;
  facets: Facet[];
  suggestions: Suggestion[];
  search_metadata: SearchMetadata;
  performance_metrics: SearchPerformanceMetrics;
}

export interface AssetCreationRequest {
  name: string;
  description?: string;
  asset_type: AssetType;
  data_source_id: string;
  metadata: Partial<AssetMetadata>;
  tags?: string[];
  business_glossary_terms?: string[];
  stewards?: string[];
  owners?: string[];
  sensitivity_level?: SensitivityLevel;
  custom_properties?: Record<string, any>;
}

export interface AssetUpdateRequest {
  name?: string;
  description?: string;
  metadata?: Partial<AssetMetadata>;
  tags?: string[];
  business_glossary_terms?: string[];
  stewards?: string[];
  owners?: string[];
  sensitivity_level?: SensitivityLevel;
  custom_properties?: Record<string, any>;
}

export interface LineageRequest {
  asset_id: string;
  direction: LineageDirection;
  depth: number;
  include_columns: boolean;
  filter_types?: AssetType[];
  include_transformations: boolean;
}

export interface LineageResponse {
  nodes: DataLineageNode[];
  edges: DataLineageEdge[];
  metadata: LineageMetadata;
  statistics: LineageStatistics;
  visualization_config: LineageVisualizationConfig;
}

export interface QualityAssessmentRequest {
  asset_id: string;
  rules?: string[];
  assessment_type: AssessmentType;
  include_recommendations: boolean;
  include_historical: boolean;
}

export interface QualityAssessmentResponse {
  assessment: DataQualityAssessment;
  recommendations: QualityRecommendation[];
  historical_trend: QualityTrend[];
  benchmark_comparison: BenchmarkComparison;
}

// 🎯 API RESPONSE WRAPPERS
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  metadata?: ResponseMetadata;
  pagination?: PaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface ResponseMetadata {
  request_id: string;
  timestamp: Date;
  processing_time_ms: number;
  api_version: string;
  cache_hit?: boolean;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// 📊 ANALYTICS & METRICS TYPES
export interface CatalogAnalytics {
  total_assets: number;
  assets_by_type: Record<AssetType, number>;
  quality_distribution: QualityDistribution;
  usage_statistics: UsageStatistics;
  growth_trends: GrowthTrend[];
  top_assets: TopAsset[];
  stewardship_metrics: StewardshipMetrics;
  governance_compliance: GovernanceCompliance;
}

export interface UsageStatistics {
  daily_active_assets: number;
  weekly_active_assets: number;
  monthly_active_assets: number;
  top_users: TopUser[];
  peak_usage_hours: number[];
  usage_by_department: Record<string, number>;
  query_patterns: QueryPattern[];
}

export interface QualityDistribution {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  unknown: number;
  quality_trends: QualityTrend[];
  dimension_breakdown: Record<string, number>;
}

export interface TopAsset {
  asset_id: string;
  name: string;
  usage_count: number;
  quality_score: number;
  business_value: number;
  popularity_rank: number;
}

export interface TopUser {
  user_id: string;
  name: string;
  department: string;
  asset_access_count: number;
  query_count: number;
  last_active: Date;
}

// 🎯 WORKFLOW & COLLABORATION TYPES
export interface WorkflowExecution {
  id: string;
  workflow_type: WorkflowType;
  status: WorkflowStatus;
  initiated_by: string;
  initiated_at: Date;
  completed_at?: Date;
  current_step: string;
  total_steps: number;
  steps_completed: number;
  context: WorkflowContext;
  approvals: Approval[];
  notifications: WorkflowNotification[];
}

export interface Approval {
  id: string;
  approver_id: string;
  approver_name: string;
  status: ApprovalStatus;
  requested_at: Date;
  responded_at?: Date;
  comments?: string;
  decision_reason?: string;
}

export interface WorkflowNotification {
  id: string;
  recipient_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  sent_at: Date;
  read_at?: Date;
  action_required: boolean;
  related_url?: string;
}

// 🏷️ EXPORT MAIN TYPES FOR EASY IMPORT
export type {
  // Core entities
  IntelligentDataAsset,
  EnterpriseDataLineage,
  DataQualityAssessment,
  BusinessGlossaryTerm,
  
  // Intelligence
  SemanticEmbedding,
  SemanticRelationship,
  AssetRecommendation,
  IntelligenceInsight,
  
  // Quality
  DataQualityRule,
  QualityScorecard,
  QualityMonitoringAlert,
  
  // Lineage
  DataLineageNode,
  DataLineageEdge,
  LineageImpactAnalysis,
  
  // Foundation
  CatalogItem,
  CatalogTag,
  
  // API
  CatalogSearchRequest,
  CatalogSearchResponse,
  ApiResponse,
  
  // Analytics
  CatalogAnalytics,
  UsageStatistics,
  
  // Workflow
  WorkflowExecution,
  Approval
};