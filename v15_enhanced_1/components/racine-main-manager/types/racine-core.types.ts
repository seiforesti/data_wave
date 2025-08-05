/**
 * Racine Core Types - Enterprise Data Governance Orchestrator
 * ===========================================================
 * 
 * Comprehensive TypeScript type definitions for the Racine Main Manager SPA.
 * Each type maps directly to backend models and services for seamless integration.
 * 
 * Backend Integration:
 * - Maps to: backend/scripts_automation/app/models/racine_models.py
 * - Services: backend/scripts_automation/app/services/racine_*.py
 * - Routes: backend/scripts_automation/app/api/routes/racine_*.py
 */

// ============================================================================
// CORE SYSTEM TYPES
// ============================================================================

export enum RacineSystemStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded", 
  CRITICAL = "critical",
  MAINTENANCE = "maintenance"
}

export enum RacineEnvironment {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production"
}

export enum RacineGroupType {
  DATA_SOURCES = "data-sources",
  COMPLIANCE_RULES = "compliance-rules", 
  CLASSIFICATIONS = "classifications",
  SCAN_RULE_SETS = "scan-rule-sets",
  ADVANCED_CATALOG = "advanced-catalog",
  SCAN_LOGIC = "scan-logic",
  RBAC = "rbac"
}

// ============================================================================
// WORKSPACE MANAGEMENT TYPES
// ============================================================================

export interface RacineWorkspace {
  id?: number;
  workspace_id: string;
  name: string;
  description?: string;
  environment: RacineEnvironment;
  owner_id: string;
  created_at: string;
  updated_at?: string;
  status: RacineSystemStatus;
  configuration: Record<string, any>;
  resource_quotas: Record<string, any>;
  collaboration_settings: Record<string, any>;
  security_settings: Record<string, any>;
  metadata: Record<string, any>;
}

export interface WorkspaceResource {
  resource_id: string;
  resource_type: string;
  group_type: RacineGroupType;
  name: string;
  status: string;
  metadata: Record<string, any>;
  permissions: string[];
  dependencies: string[];
}

export interface WorkspaceTemplate {
  template_id: string;
  name: string;
  description: string;
  category: string;
  configuration: Record<string, any>;
  resource_templates: WorkspaceResourceTemplate[];
  tags: string[];
  created_by: string;
  is_public: boolean;
}

export interface WorkspaceResourceTemplate {
  resource_type: string;
  group_type: RacineGroupType;
  configuration: Record<string, any>;
  dependencies: string[];
}

// ============================================================================
// WORKFLOW ORCHESTRATION TYPES
// ============================================================================

export interface RacineWorkflow {
  id?: number;
  workflow_id: string;
  name: string;
  description?: string;
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  status: WorkflowStatus;
  workflow_definition: WorkflowDefinition;
  execution_history: WorkflowExecution[];
  performance_metrics: Record<string, any>;
  involved_groups: RacineGroupType[];
  dependencies: string[];
  ai_optimization_settings: Record<string, any>;
  metadata: Record<string, any>;
}

export enum WorkflowStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface WorkflowDefinition {
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, any>;
  triggers: WorkflowTrigger[];
  error_handling: ErrorHandlingConfig;
  optimization_rules: OptimizationRule[];
}

export interface WorkflowNode {
  node_id: string;
  node_type: WorkflowNodeType;
  name: string;
  description?: string;
  group_type: RacineGroupType;
  service_config: Record<string, any>;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  retry_config: RetryConfig;
  timeout_seconds?: number;
  position: NodePosition;
  metadata: Record<string, any>;
}

export enum WorkflowNodeType {
  TRIGGER = "trigger",
  ACTION = "action",
  CONDITION = "condition",
  PARALLEL = "parallel",
  LOOP = "loop",
  HUMAN_APPROVAL = "human_approval",
  AI_DECISION = "ai_decision"
}

export interface WorkflowEdge {
  edge_id: string;
  source_node_id: string;
  target_node_id: string;
  condition?: string;
  label?: string;
  metadata: Record<string, any>;
}

export interface WorkflowTrigger {
  trigger_id: string;
  trigger_type: TriggerType;
  configuration: Record<string, any>;
  is_active: boolean;
}

export enum TriggerType {
  MANUAL = "manual",
  SCHEDULE = "schedule",
  EVENT = "event",
  WEBHOOK = "webhook",
  DATA_CHANGE = "data_change"
}

export interface WorkflowExecution {
  execution_id: string;
  workflow_id: string;
  started_at: string;
  ended_at?: string;
  status: ExecutionStatus;
  trigger_data: Record<string, any>;
  execution_context: Record<string, any>;
  node_executions: NodeExecution[];
  metrics: ExecutionMetrics;
  logs: ExecutionLog[];
  error_details?: ErrorDetails;
}

export enum ExecutionStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  TIMEOUT = "timeout"
}

export interface NodeExecution {
  node_id: string;
  execution_id: string;
  started_at: string;
  ended_at?: string;
  status: ExecutionStatus;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  error_details?: ErrorDetails;
  retry_count: number;
  metrics: NodeMetrics;
}

// ============================================================================
// PIPELINE ORCHESTRATION TYPES
// ============================================================================

export interface RacinePipeline {
  id?: number;
  pipeline_id: string;
  name: string;
  description?: string;
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  status: PipelineStatus;
  pipeline_definition: PipelineDefinition;
  execution_metrics: Record<string, any>;
  health_status: PipelineHealthStatus;
  scaling_configuration: ScalingConfiguration;
  involved_groups: RacineGroupType[];
  optimization_settings: Record<string, any>;
  metadata: Record<string, any>;
}

export enum PipelineStatus {
  INACTIVE = "inactive",
  ACTIVE = "active",
  RUNNING = "running",
  PAUSED = "paused",
  FAILED = "failed"
}

export interface PipelineDefinition {
  version: string;
  stages: PipelineStage[];
  data_flows: DataFlow[];
  resource_requirements: ResourceRequirements;
  quality_gates: QualityGate[];
  monitoring_config: MonitoringConfig;
}

export interface PipelineStage {
  stage_id: string;
  name: string;
  stage_type: PipelineStageType;
  group_type: RacineGroupType;
  configuration: Record<string, any>;
  input_requirements: DataRequirements;
  output_specification: DataSpecification;
  dependencies: string[];
  parallel_execution: boolean;
  timeout_minutes?: number;
}

export enum PipelineStageType {
  INGESTION = "ingestion",
  TRANSFORMATION = "transformation",
  VALIDATION = "validation",
  CLASSIFICATION = "classification",
  CATALOGING = "cataloging",
  SCANNING = "scanning",
  COMPLIANCE_CHECK = "compliance_check",
  ENRICHMENT = "enrichment",
  OUTPUT = "output"
}

export interface PipelineHealthStatus {
  overall_health: HealthLevel;
  stage_health: Record<string, HealthLevel>;
  performance_metrics: PerformanceMetrics;
  resource_utilization: ResourceUtilization;
  error_rate: number;
  last_health_check: string;
  alerts: HealthAlert[];
}

export enum HealthLevel {
  EXCELLENT = "excellent",
  GOOD = "good",
  WARNING = "warning",
  CRITICAL = "critical",
  UNKNOWN = "unknown"
}

// ============================================================================
// ACTIVITY TRACKING TYPES
// ============================================================================

export interface RacineActivity {
  id?: number;
  activity_id: string;
  user_id: string;
  workspace_id?: string;
  activity_type: ActivityType;
  activity_category: ActivityCategory;
  source_group: RacineGroupType;
  target_group?: RacineGroupType;
  action: ActivityAction;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  duration_ms?: number;
  status: ActivityStatus;
  details: Record<string, any>;
  context: Record<string, any>;
  impact_score?: number;
  compliance_relevant: boolean;
  metadata: Record<string, any>;
}

export enum ActivityType {
  WORKFLOW = "workflow",
  PIPELINE = "pipeline",
  COLLABORATION = "collaboration",
  SYSTEM = "system",
  NAVIGATION = "navigation",
  CONFIGURATION = "configuration",
  MONITORING = "monitoring",
  ANALYSIS = "analysis"
}

export enum ActivityCategory {
  NAVIGATION = "navigation",
  EXECUTION = "execution",
  MONITORING = "monitoring",
  CONFIGURATION = "configuration",
  COLLABORATION = "collaboration",
  ANALYSIS = "analysis",
  SECURITY = "security",
  COMPLIANCE = "compliance"
}

export enum ActivityAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  EXECUTE = "execute",
  MONITOR = "monitor",
  ANALYZE = "analyze",
  SHARE = "share",
  APPROVE = "approve",
  REJECT = "reject"
}

export enum ActivityStatus {
  SUCCESS = "success",
  FAILED = "failed",
  IN_PROGRESS = "in_progress",
  CANCELLED = "cancelled"
}

export interface ActivityPattern {
  pattern_id: string;
  pattern_type: PatternType;
  frequency: FrequencyData;
  participants: string[];
  resources: string[];
  groups: RacineGroupType[];
  insights: PatternInsight[];
  recommendations: PatternRecommendation[];
}

export enum PatternType {
  USAGE = "usage",
  COLLABORATION = "collaboration",
  PERFORMANCE = "performance",
  ERROR = "error",
  SECURITY = "security",
  COMPLIANCE = "compliance"
}

// ============================================================================
// AI ASSISTANT TYPES
// ============================================================================

export interface AIAssistantContext {
  user_id: string;
  current_workspace?: string;
  active_groups: RacineGroupType[];
  current_activity: ActivityType;
  user_role: string;
  permissions: string[];
  recent_activities: RacineActivity[];
  system_state: SystemState;
  preferences: UserPreferences;
}

export interface AIQuery {
  query_id: string;
  user_id: string;
  query_text: string;
  query_type: AIQueryType;
  context: AIAssistantContext;
  intent: QueryIntent;
  parameters: Record<string, any>;
  timestamp: string;
}

export enum AIQueryType {
  QUESTION = "question",
  COMMAND = "command",
  ANALYSIS_REQUEST = "analysis_request",
  RECOMMENDATION_REQUEST = "recommendation_request",
  AUTOMATION_REQUEST = "automation_request",
  TROUBLESHOOTING = "troubleshooting"
}

export interface AIResponse {
  response_id: string;
  query_id: string;
  response_type: AIResponseType;
  content: AIContent;
  confidence_score: number;
  processing_time_ms: number;
  recommendations: AIRecommendation[];
  actions: AIAction[];
  follow_up_suggestions: string[];
  metadata: Record<string, any>;
}

export enum AIResponseType {
  ANSWER = "answer",
  INSTRUCTION = "instruction",
  ANALYSIS = "analysis",
  RECOMMENDATION = "recommendation",
  AUTOMATION = "automation",
  ERROR = "error"
}

export interface AIRecommendation {
  recommendation_id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: Priority;
  impact_score: number;
  implementation_complexity: Complexity;
  estimated_time_hours?: number;
  prerequisites: string[];
  actions: AIAction[];
  supporting_data: Record<string, any>;
}

export enum RecommendationCategory {
  PERFORMANCE = "performance",
  SECURITY = "security",
  COMPLIANCE = "compliance",
  COST_OPTIMIZATION = "cost_optimization",
  COLLABORATION = "collaboration",
  WORKFLOW = "workflow",
  CONFIGURATION = "configuration"
}

// ============================================================================
// COLLABORATION TYPES
// ============================================================================

export interface RacineCollaboration {
  id?: number;
  collaboration_id: string;
  workspace_id: string;
  session_id: string;
  participants: string[];
  collaboration_type: CollaborationType;
  resource_type: string;
  resource_id: string;
  started_at: string;
  ended_at?: string;
  status: CollaborationStatus;
  real_time_data: Record<string, any>;
  changes_log: CollaborationChange[];
  conflict_resolution: ConflictResolution;
  metadata: Record<string, any>;
}

export enum CollaborationType {
  DOCUMENT = "document",
  WORKFLOW = "workflow",
  DASHBOARD = "dashboard",
  PIPELINE = "pipeline",
  ANALYSIS = "analysis",
  MEETING = "meeting",
  REVIEW = "review"
}

export enum CollaborationStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  ENDED = "ended"
}

export interface CollaborationChange {
  change_id: string;
  user_id: string;
  timestamp: string;
  change_type: ChangeType;
  target_path: string;
  old_value: any;
  new_value: any;
  conflict_resolution?: string;
}

export enum ChangeType {
  INSERT = "insert",
  UPDATE = "update",
  DELETE = "delete",
  MOVE = "move",
  COMMENT = "comment",
  APPROVE = "approve",
  REJECT = "reject"
}

// ============================================================================
// USER MANAGEMENT TYPES
// ============================================================================

export interface RacineUserProfile {
  id?: number;
  user_id: string;
  profile_data: UserProfileData;
  preferences: UserPreferences;
  personalization_settings: PersonalizationSettings;
  cross_group_permissions: Record<RacineGroupType, string[]>;
  activity_analytics: UserActivityAnalytics;
  collaboration_history: CollaborationHistoryItem[];
  ai_assistant_settings: AIAssistantSettings;
  notification_preferences: NotificationPreferences;
  security_settings: SecuritySettings;
  compliance_attestations: ComplianceAttestation[];
  created_at: string;
  updated_at?: string;
  metadata: Record<string, any>;
}

export interface UserProfileData {
  display_name: string;
  email: string;
  department?: string;
  role: string;
  manager?: string;
  skills: string[];
  expertise_areas: RacineGroupType[];
  timezone: string;
  language: string;
  avatar_url?: string;
}

export interface UserPreferences {
  theme: ThemeMode;
  layout_preferences: LayoutPreferences;
  dashboard_defaults: DashboardDefaults;
  notification_settings: NotificationSettings;
  ai_assistance_level: AIAssistanceLevel;
  collaboration_preferences: CollaborationPreferences;
}

export enum ThemeMode {
  LIGHT = "light",
  DARK = "dark",
  AUTO = "auto"
}

// ============================================================================
// DASHBOARD AND ANALYTICS TYPES
// ============================================================================

export interface RacineDashboard {
  id?: number;
  dashboard_id: string;
  name: string;
  description?: string;
  dashboard_type: DashboardType;
  owner_id: string;
  workspace_id?: string;
  created_at: string;
  updated_at?: string;
  configuration: DashboardConfiguration;
  widget_configurations: WidgetConfiguration[];
  data_sources: string[];
  refresh_schedule: RefreshSchedule;
  access_control: AccessControl;
  performance_metrics: Record<string, any>;
  usage_analytics: Record<string, any>;
  ai_insights: AIInsight[];
  metadata: Record<string, any>;
}

export enum DashboardType {
  EXECUTIVE = "executive",
  OPERATIONAL = "operational",
  ANALYTICAL = "analytical",
  PERSONAL = "personal",
  TEAM = "team",
  COMPLIANCE = "compliance"
}

export interface WidgetConfiguration {
  widget_id: string;
  widget_type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  data_source: DataSourceConfig;
  visualization_config: VisualizationConfig;
  filter_config: FilterConfig;
  refresh_interval: number;
  alert_config?: AlertConfig;
}

export enum WidgetType {
  METRIC = "metric",
  CHART = "chart",
  TABLE = "table",
  MAP = "map",
  TEXT = "text",
  IMAGE = "image",
  IFRAME = "iframe",
  CUSTOM = "custom"
}

// ============================================================================
// SYSTEM METRICS AND HEALTH TYPES
// ============================================================================

export interface RacineSystemMetrics {
  id?: number;
  metric_id: string;
  timestamp: string;
  metric_type: MetricType;
  metric_category: MetricCategory;
  source_group: RacineGroupType;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  threshold_config: ThresholdConfig;
  alert_status: AlertStatus;
  aggregation_level: AggregationLevel;
  dimensions: Record<string, any>;
  context: Record<string, any>;
  metadata: Record<string, any>;
}

export enum MetricType {
  SYSTEM_HEALTH = "system_health",
  PERFORMANCE = "performance",
  USAGE = "usage",
  SECURITY = "security",
  COMPLIANCE = "compliance",
  COST = "cost",
  QUALITY = "quality"
}

export enum MetricCategory {
  CPU = "cpu",
  MEMORY = "memory",
  NETWORK = "network",
  DATABASE = "database",
  STORAGE = "storage",
  APPLICATION = "application",
  USER = "user",
  BUSINESS = "business"
}

export enum AlertStatus {
  NORMAL = "normal",
  WARNING = "warning",
  CRITICAL = "critical"
}

export enum AggregationLevel {
  INSTANCE = "instance",
  GROUP = "group",
  SYSTEM = "system"
}

// ============================================================================
// COMMON UTILITY TYPES
// ============================================================================

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum Complexity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface RetryConfig {
  max_retries: number;
  retry_delay_seconds: number;
  exponential_backoff: boolean;
  retry_conditions: string[];
}

export interface ErrorHandlingConfig {
  default_action: ErrorAction;
  error_mappings: Record<string, ErrorAction>;
  notification_config: NotificationConfig;
  rollback_config?: RollbackConfig;
}

export enum ErrorAction {
  FAIL = "fail",
  RETRY = "retry",
  SKIP = "skip",
  FALLBACK = "fallback",
  HUMAN_INTERVENTION = "human_intervention"
}

export interface OptimizationRule {
  rule_id: string;
  rule_type: OptimizationType;
  condition: string;
  action: OptimizationAction;
  parameters: Record<string, any>;
  is_active: boolean;
}

export enum OptimizationType {
  PERFORMANCE = "performance",
  COST = "cost",
  RESOURCE = "resource",
  QUALITY = "quality"
}

export interface SystemState {
  overall_health: HealthLevel;
  group_status: Record<RacineGroupType, RacineSystemStatus>;
  active_workspaces: number;
  running_workflows: number;
  active_pipelines: number;
  active_users: number;
  system_load: number;
  resource_utilization: ResourceUtilization;
  alerts: SystemAlert[];
}

export interface SystemAlert {
  alert_id: string;
  alert_type: AlertType;
  severity: Priority;
  title: string;
  description: string;
  source_group: RacineGroupType;
  resource_id?: string;
  timestamp: string;
  is_acknowledged: boolean;
  actions: AlertAction[];
}

export enum AlertType {
  SYSTEM = "system",
  PERFORMANCE = "performance",
  SECURITY = "security",
  COMPLIANCE = "compliance",
  RESOURCE = "resource",
  USER = "user"
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    timestamp: string;
    request_id: string;
    processing_time_ms: number;
    pagination?: PaginationInfo;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  trace_id?: string;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// ============================================================================
// QUERY AND FILTER TYPES
// ============================================================================

export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  case_sensitive?: boolean;
}

export enum FilterOperator {
  EQUALS = "eq",
  NOT_EQUALS = "ne",
  GREATER_THAN = "gt",
  GREATER_THAN_OR_EQUAL = "gte",
  LESS_THAN = "lt",
  LESS_THAN_OR_EQUAL = "lte",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  IN = "in",
  NOT_IN = "not_in",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null"
}

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export enum SortDirection {
  ASC = "asc",
  DESC = "desc"
}

export interface SearchQuery {
  query: string;
  filters?: QueryFilter[];
  sort?: SortConfig[];
  pagination?: {
    page: number;
    page_size: number;
  };
  include_aggregations?: boolean;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Core types
  RacineWorkspace,
  RacineWorkflow,
  RacinePipeline,
  RacineActivity,
  RacineCollaboration,
  RacineUserProfile,
  RacineDashboard,
  RacineSystemMetrics,
  
  // Configuration types
  WorkspaceResource,
  WorkspaceTemplate,
  WorkflowDefinition,
  PipelineDefinition,
  DashboardConfiguration,
  
  // UI types
  APIResponse,
  SearchQuery,
  QueryFilter,
  SortConfig,
  
  // Assistant types
  AIQuery,
  AIResponse,
  AIRecommendation,
  
  // Utility types
  SystemState,
  SystemAlert,
  ErrorHandlingConfig,
  OptimizationRule
};