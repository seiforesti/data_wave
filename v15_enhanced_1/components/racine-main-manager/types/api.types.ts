/**
 * Racine API Types - Complete API Request/Response Type Definitions
 * ================================================================
 * 
 * This file contains comprehensive TypeScript type definitions for all API
 * requests and responses, mapping 100% to the backend API routes and ensuring
 * complete type safety for all frontend-backend communication.
 * 
 * API Categories:
 * - Orchestration API: Master system orchestration and health monitoring
 * - Workspace API: Multi-workspace management and resource linking
 * - Workflow API: Databricks-style workflow management
 * - Pipeline API: Advanced pipeline management with AI optimization
 * - AI Assistant API: Context-aware AI functionality
 * - Activity API: Activity tracking and audit trails
 * - Dashboard API: Real-time metrics and visualization
 * - Collaboration API: Team collaboration and communication
 * - Integration API: Cross-group and external system integration
 * - User Management API: RBAC and profile management
 */

import {
  UUID,
  ISODateString,
  JSONValue,
  SystemStatus,
  OperationStatus,
  IntegrationStatus,
  RacineState,
  CrossGroupState,
  SystemHealth,
  PerformanceMetrics,
  WorkspaceConfiguration,
  WorkflowDefinition,
  WorkflowExecution,
  PipelineDefinition,
  PipelineExecution,
  AIConversation,
  AIMessage,
  AIRecommendation,
  AIInsight,
  ActivityRecord,
  AuditTrail,
  DashboardState,
  CollaborationState,
  IntegrationConfiguration,
  UserProfile,
  UserSession
} from './racine-core.types';

// =============================================================================
// BASE API TYPES
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
  pagination?: PaginationInfo;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, JSONValue>;
  stackTrace?: string;
  correlationId?: UUID;
  timestamp: ISODateString;
}

export interface ResponseMetadata {
  requestId: UUID;
  timestamp: ISODateString;
  duration: number;
  version: string;
  cached: boolean;
  rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: ISODateString;
  retryAfter?: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Standard request parameters
 */
export interface PaginationRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterRequest {
  filters?: Record<string, JSONValue>;
  search?: string;
  dateRange?: DateRangeFilter;
}

export interface DateRangeFilter {
  start?: ISODateString;
  end?: ISODateString;
  period?: 'hour' | 'day' | 'week' | 'month' | 'year';
}

// =============================================================================
// ORCHESTRATION API TYPES - Maps to /api/racine/orchestration
// =============================================================================

/**
 * Orchestration Master Management
 */
export interface CreateOrchestrationRequest {
  name: string;
  description?: string;
  orchestrationType: string;
  groupConfigurations: Record<string, JSONValue>;
  performanceThresholds: Record<string, number>;
  autoOptimization: boolean;
  notifications: NotificationSettings;
}

export interface OrchestrationResponse {
  id: UUID;
  name: string;
  status: SystemStatus;
  connectedGroups: string[];
  systemHealth: SystemHealth;
  performanceMetrics: PerformanceMetrics;
  createdAt: ISODateString;
  lastHealthCheck: ISODateString;
}

export interface SystemHealthResponse {
  overall: SystemStatus;
  groups: Record<string, GroupHealthStatus>;
  services: Record<string, ServiceHealthStatus>;
  integrations: Record<string, IntegrationHealthStatus>;
  performance: PerformanceHealthStatus;
  lastCheck: ISODateString;
  uptime: number;
  version: string;
  alerts: SystemAlert[];
}

export interface GroupHealthStatus {
  groupId: string;
  groupName: string;
  status: SystemStatus;
  responseTime: number;
  errorRate: number;
  uptime: number;
  lastCheck: ISODateString;
  endpoints: EndpointStatus[];
  capabilities: string[];
  activeConnections: number;
  resourceUsage: ResourceUsageInfo;
}

export interface ServiceHealthStatus {
  serviceId: string;
  serviceName: string;
  status: SystemStatus;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
  lastCheck: ISODateString;
  activeRequests: number;
  errorCount: number;
}

export interface IntegrationHealthStatus {
  integrationId: UUID;
  integrationName: string;
  status: IntegrationStatus;
  lastSync: ISODateString;
  syncSuccess: boolean;
  errorCount: number;
  responseTime: number;
  dataVolume: number;
  throughput: number;
}

export interface EndpointStatus {
  endpoint: string;
  status: SystemStatus;
  responseTime: number;
  statusCode: number;
  lastCheck: ISODateString;
  errorCount: number;
  successRate: number;
}

export interface PerformanceHealthStatus {
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  queueDepth: number;
}

export interface ResourceUsageInfo {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  connections: number;
}

export interface SystemAlert {
  id: UUID;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: string;
  timestamp: ISODateString;
  acknowledged: boolean;
  resolvedAt?: ISODateString;
  metadata: Record<string, JSONValue>;
}

export enum AlertType {
  PERFORMANCE = "performance",
  AVAILABILITY = "availability",
  SECURITY = "security",
  CAPACITY = "capacity",
  INTEGRATION = "integration"
}

export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical"
}

export interface NotificationSettings {
  email: boolean;
  slack: boolean;
  webhook?: string;
  thresholds: Record<string, number>;
}

/**
 * Cross-group workflow execution
 */
export interface ExecuteWorkflowRequest {
  workflowDefinition: WorkflowDefinitionInput;
  parameters: Record<string, JSONValue>;
  priority: WorkflowPriority;
  scheduledAt?: ISODateString;
  notifications: NotificationRule[];
}

export interface WorkflowDefinitionInput {
  name: string;
  description?: string;
  steps: WorkflowStepInput[];
  dependencies: WorkflowDependencyInput[];
  timeout: number;
  retryPolicy: RetryPolicyInput;
}

export interface WorkflowStepInput {
  id: UUID;
  name: string;
  groupId: string;
  operation: string;
  parameters: Record<string, JSONValue>;
  timeout: number;
  retryPolicy: RetryPolicyInput;
  condition?: ConditionInput;
}

export interface WorkflowDependencyInput {
  sourceStepId: UUID;
  targetStepId: UUID;
  dependencyType: DependencyType;
  condition?: string;
}

export interface RetryPolicyInput {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors: string[];
}

export interface ConditionInput {
  type: ConditionType;
  expression: string;
  parameters: Record<string, JSONValue>;
}

export interface NotificationRule {
  type: NotificationType;
  recipients: string[];
  events: string[];
  template: string;
}

export enum WorkflowPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent"
}

export enum DependencyType {
  SEQUENCE = "sequence",
  PARALLEL = "parallel",
  CONDITIONAL = "conditional",
  LOOP = "loop"
}

export enum BackoffStrategy {
  FIXED = "fixed",
  LINEAR = "linear",
  EXPONENTIAL = "exponential"
}

export enum ConditionType {
  ALWAYS = "always",
  ON_SUCCESS = "on_success",
  ON_FAILURE = "on_failure",
  CONDITIONAL = "conditional"
}

export enum NotificationType {
  EMAIL = "email",
  SLACK = "slack",
  WEBHOOK = "webhook",
  IN_APP = "in_app"
}

export interface WorkflowExecutionResponse {
  executionId: UUID;
  workflowId: UUID;
  status: OperationStatus;
  startTime: ISODateString;
  estimatedCompletion?: ISODateString;
  progress: WorkflowProgress;
  results: WorkflowResults;
  logs: ExecutionLog[];
  metrics: ExecutionMetrics;
}

export interface WorkflowProgress {
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  currentStep?: StepProgress;
  overallProgress: number;
  estimatedTimeRemaining?: number;
}

export interface StepProgress {
  stepId: UUID;
  stepName: string;
  status: OperationStatus;
  progress: number;
  startTime: ISODateString;
  estimatedCompletion?: ISODateString;
}

export interface WorkflowResults {
  success: boolean;
  outputs: Record<string, JSONValue>;
  artifacts: string[];
  summary: string;
  metrics: Record<string, number>;
}

export interface ExecutionLog {
  timestamp: ISODateString;
  level: LogLevel;
  message: string;
  stepId?: UUID;
  metadata?: Record<string, JSONValue>;
}

export interface ExecutionMetrics {
  totalDuration: number;
  queueTime: number;
  executionTime: number;
  resourceUsage: ResourceUsageMetrics;
  performance: PerformanceMetrics;
  cost: CostMetrics;
}

export interface ResourceUsageMetrics {
  peakMemory: number;
  avgCpuUsage: number;
  diskIO: number;
  networkIO: number;
  duration: number;
}

export interface CostMetrics {
  computeCost: number;
  storageCost: number;
  networkCost: number;
  totalCost: number;
  currency: string;
}

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

/**
 * Performance optimization
 */
export interface OptimizePerformanceRequest {
  targetMetrics: Record<string, number>;
  constraints: Record<string, JSONValue>;
  optimizationScope: OptimizationScope[];
  dryRun: boolean;
}

export enum OptimizationScope {
  SYSTEM_WIDE = "system_wide",
  GROUP_SPECIFIC = "group_specific",
  WORKFLOW_SPECIFIC = "workflow_specific",
  RESOURCE_ALLOCATION = "resource_allocation"
}

export interface PerformanceOptimizationResponse {
  optimizationId: UUID;
  recommendations: OptimizationRecommendation[];
  expectedImprovements: Record<string, number>;
  estimatedSavings: CostMetrics;
  implementationPlan: ImplementationPlan;
  riskAssessment: RiskAssessment;
}

export interface OptimizationRecommendation {
  id: UUID;
  type: OptimizationType;
  title: string;
  description: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  category: OptimizationCategory;
  actions: OptimizationAction[];
  metrics: OptimizationMetrics;
}

export enum OptimizationType {
  RESOURCE_SCALING = "resource_scaling",
  QUERY_OPTIMIZATION = "query_optimization",
  CACHING_STRATEGY = "caching_strategy",
  LOAD_BALANCING = "load_balancing",
  WORKFLOW_REDESIGN = "workflow_redesign"
}

export enum ImpactLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum EffortLevel {
  MINIMAL = "minimal",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export enum OptimizationCategory {
  PERFORMANCE = "performance",
  COST = "cost",
  RELIABILITY = "reliability",
  SCALABILITY = "scalability"
}

export interface OptimizationAction {
  id: UUID;
  type: string;
  description: string;
  parameters: Record<string, JSONValue>;
  estimatedTime: number;
  prerequisites: string[];
  risks: string[];
}

export interface OptimizationMetrics {
  expectedImprovement: Record<string, number>;
  confidenceScore: number;
  implementationTime: number;
  rollbackTime: number;
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  totalDuration: number;
  dependencies: string[];
  rollbackPlan: RollbackStep[];
}

export interface ImplementationPhase {
  phase: number;
  name: string;
  description: string;
  actions: OptimizationAction[];
  estimatedDuration: number;
  prerequisites: string[];
}

export interface RollbackStep {
  step: number;
  description: string;
  command?: string;
  estimatedTime: number;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  risks: Risk[];
  mitigations: Mitigation[];
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export interface Risk {
  id: UUID;
  type: RiskType;
  description: string;
  probability: number;
  impact: ImpactLevel;
  severity: RiskLevel;
  mitigations: string[];
}

export enum RiskType {
  PERFORMANCE_DEGRADATION = "performance_degradation",
  SERVICE_OUTAGE = "service_outage",
  DATA_LOSS = "data_loss",
  SECURITY_VULNERABILITY = "security_vulnerability",
  COMPATIBILITY_ISSUE = "compatibility_issue"
}

export interface Mitigation {
  id: UUID;
  riskId: UUID;
  description: string;
  effectiveness: number;
  implementationCost: number;
  recommended: boolean;
}

// =============================================================================
// WORKSPACE API TYPES - Maps to /api/racine/workspace
// =============================================================================

/**
 * Workspace Management
 */
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  type: WorkspaceType;
  templateId?: UUID;
  settings: WorkspaceSettingsInput;
  initialMembers?: WorkspaceMemberInput[];
  initialResources?: WorkspaceResourceInput[];
}

export enum WorkspaceType {
  PERSONAL = "personal",
  TEAM = "team",
  ENTERPRISE = "enterprise",
  PROJECT = "project",
  TEMPORARY = "temporary"
}

export interface WorkspaceSettingsInput {
  theme?: string;
  layout?: LayoutMode;
  defaultView?: ViewMode;
  privacy?: PrivacyLevel;
  notifications?: WorkspaceNotificationSettings;
  integrations?: WorkspaceIntegrationSettings;
  customizations?: Record<string, JSONValue>;
}

export enum LayoutMode {
  SINGLE_PANE = "single_pane",
  SPLIT_SCREEN = "split_screen",
  TABBED = "tabbed",
  GRID = "grid",
  CUSTOM = "custom"
}

export enum ViewMode {
  DASHBOARD = "dashboard",
  WORKSPACE = "workspace",
  WORKFLOWS = "workflows",
  PIPELINES = "pipelines",
  AI_ASSISTANT = "ai_assistant",
  ACTIVITY = "activity",
  COLLABORATION = "collaboration",
  SETTINGS = "settings"
}

export enum PrivacyLevel {
  PRIVATE = "private",
  TEAM = "team",
  ORGANIZATION = "organization",
  PUBLIC = "public"
}

export interface WorkspaceNotificationSettings {
  enabled: boolean;
  events: string[];
  channels: string[];
  frequency: NotificationFrequency;
}

export enum NotificationFrequency {
  IMMEDIATE = "immediate",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly"
}

export interface WorkspaceIntegrationSettings {
  allowedGroups: string[];
  externalIntegrations: string[];
  sharingEnabled: boolean;
  collaborationEnabled: boolean;
}

export interface WorkspaceMemberInput {
  userId: UUID;
  role: WorkspaceRole;
  permissions: string[];
}

export enum WorkspaceRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
  GUEST = "guest"
}

export interface WorkspaceResourceInput {
  resourceId: UUID;
  resourceType: string;
  sourceGroup: string;
  name: string;
  description?: string;
  metadata?: Record<string, JSONValue>;
}

export interface WorkspaceResponse {
  id: UUID;
  name: string;
  description: string;
  type: WorkspaceType;
  owner: UserProfile;
  memberCount: number;
  resourceCount: number;
  settings: WorkspaceSettings;
  analytics: WorkspaceAnalytics;
  permissions: WorkspacePermissions;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastAccessed: ISODateString;
  isActive: boolean;
  tags: string[];
}

export interface WorkspaceSettings {
  theme: string;
  layout: LayoutMode;
  defaultView: ViewMode;
  privacy: PrivacyLevel;
  notifications: WorkspaceNotificationSettings;
  integrations: WorkspaceIntegrationSettings;
  customizations: Record<string, JSONValue>;
}

export interface WorkspaceAnalytics {
  totalMembers: number;
  totalResources: number;
  activityLevel: number;
  collaborationScore: number;
  resourceUtilization: number;
  averageSessionDuration: number;
  mostActiveMembers: UserActivity[];
  mostUsedResources: ResourceUsage[];
  growthTrends: GrowthTrend[];
  lastUpdated: ISODateString;
}

export interface UserActivity {
  userId: UUID;
  username: string;
  activityCount: number;
  lastActivity: ISODateString;
  averageSessionDuration: number;
}

export interface ResourceUsage {
  resourceId: UUID;
  resourceName: string;
  resourceType: string;
  accessCount: number;
  lastAccessed: ISODateString;
  averageUsageDuration: number;
}

export interface GrowthTrend {
  metric: string;
  period: string;
  values: number[];
  trend: TrendDirection;
  changePercent: number;
}

export enum TrendDirection {
  INCREASING = "increasing",
  DECREASING = "decreasing",
  STABLE = "stable",
  VOLATILE = "volatile"
}

export interface WorkspacePermissions {
  canInvite: boolean;
  canRemoveMembers: boolean;
  canModifySettings: boolean;
  canDeleteWorkspace: boolean;
  canManageResources: boolean;
  canViewAnalytics: boolean;
  canExport: boolean;
  canShare: boolean;
}

/**
 * Workspace Resources Management
 */
export interface LinkResourceRequest {
  resourceId: UUID;
  resourceType: string;
  sourceGroup: string;
  permissions?: ResourcePermissionLevel[];
  metadata?: Record<string, JSONValue>;
}

export enum ResourcePermissionLevel {
  READ = "read",
  WRITE = "write",
  DELETE = "delete",
  ADMIN = "admin"
}

export interface WorkspaceResourcesResponse {
  resources: WorkspaceResourceDetails[];
  groupSummary: ResourceGroupSummary[];
  totalCount: number;
  permissions: Record<UUID, ResourcePermissionLevel[]>;
}

export interface WorkspaceResourceDetails {
  id: UUID;
  workspaceId: UUID;
  resourceId: UUID;
  resourceType: string;
  sourceGroup: string;
  name: string;
  description: string;
  metadata: Record<string, JSONValue>;
  permissions: ResourcePermissionLevel[];
  addedBy: UserProfile;
  addedAt: ISODateString;
  lastAccessed: ISODateString;
  accessCount: number;
  status: ResourceStatus;
  tags: string[];
}

export enum ResourceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  ERROR = "error"
}

export interface ResourceGroupSummary {
  groupId: string;
  groupName: string;
  resourceCount: number;
  lastActivity: ISODateString;
  status: SystemStatus;
}

/**
 * Workspace Analytics
 */
export interface WorkspaceAnalyticsRequest {
  workspaceId: UUID;
  timeRange: AnalyticsTimeRange;
  metrics: AnalyticsMetric[];
  groupBy?: AnalyticsGroupBy[];
  filters?: AnalyticsFilter[];
}

export interface AnalyticsTimeRange {
  start: ISODateString;
  end: ISODateString;
  granularity: TimeGranularity;
}

export enum TimeGranularity {
  MINUTE = "minute",
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month"
}

export enum AnalyticsMetric {
  USER_ACTIVITY = "user_activity",
  RESOURCE_USAGE = "resource_usage",
  COLLABORATION_EVENTS = "collaboration_events",
  PERFORMANCE_METRICS = "performance_metrics",
  ERROR_RATES = "error_rates"
}

export enum AnalyticsGroupBy {
  USER = "user",
  RESOURCE_TYPE = "resource_type",
  GROUP = "group",
  TIME_PERIOD = "time_period"
}

export interface AnalyticsFilter {
  field: string;
  operator: FilterOperator;
  value: JSONValue;
}

export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  CONTAINS = "contains",
  IN = "in",
  NOT_IN = "not_in"
}

export interface WorkspaceAnalyticsResponse {
  summary: AnalyticsSummary;
  timeSeries: TimeSeriesData[];
  breakdowns: AnalyticsBreakdown[];
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalResources: number;
  activeResources: number;
  totalActivity: number;
  averageSessionDuration: number;
  collaborationScore: number;
  healthScore: number;
}

export interface TimeSeriesData {
  metric: AnalyticsMetric;
  data: TimeSeriesPoint[];
  trend: TrendDirection;
  changePercent: number;
}

export interface TimeSeriesPoint {
  timestamp: ISODateString;
  value: number;
  metadata?: Record<string, JSONValue>;
}

export interface AnalyticsBreakdown {
  dimension: AnalyticsGroupBy;
  data: BreakdownItem[];
  total: number;
}

export interface BreakdownItem {
  key: string;
  value: number;
  percentage: number;
  trend: TrendDirection;
  metadata?: Record<string, JSONValue>;
}

export interface AnalyticsInsight {
  id: UUID;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  relevance: number;
  actionable: boolean;
  recommendations: string[];
}

export enum InsightType {
  TREND = "trend",
  ANOMALY = "anomaly",
  PATTERN = "pattern",
  OPPORTUNITY = "opportunity",
  RISK = "risk"
}

export interface AnalyticsRecommendation {
  id: UUID;
  type: RecommendationType;
  title: string;
  description: string;
  priority: RecommendationPriority;
  expectedImpact: Record<string, number>;
  implementation: ImplementationGuide;
}

export enum RecommendationType {
  OPTIMIZATION = "optimization",
  ENGAGEMENT = "engagement",
  SECURITY = "security",
  COST_REDUCTION = "cost_reduction",
  PRODUCTIVITY = "productivity"
}

export enum RecommendationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export interface ImplementationGuide {
  estimatedTime: number;
  difficulty: DifficultyLevel;
  steps: ImplementationStep[];
  prerequisites: string[];
  risks: string[];
}

export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert"
}

export interface ImplementationStep {
  order: number;
  title: string;
  description: string;
  estimatedTime: number;
  command?: string;
  verification?: string;
}

// =============================================================================
// WORKFLOW API TYPES - Maps to /api/racine/workflows
// =============================================================================

/**
 * Workflow Management
 */
export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  workspaceId: UUID;
  templateId?: UUID;
  steps: WorkflowStepDefinition[];
  dependencies: WorkflowDependencyDefinition[];
  parameters: WorkflowParameterDefinition[];
  schedule?: WorkflowScheduleDefinition;
  configuration: WorkflowConfigurationDefinition;
  tags?: string[];
}

export interface WorkflowStepDefinition {
  id?: UUID;
  name: string;
  description?: string;
  type: StepType;
  groupId: string;
  operation: string;
  parameters: Record<string, JSONValue>;
  inputs: StepInputDefinition[];
  outputs: StepOutputDefinition[];
  timeout: number;
  retryPolicy: RetryPolicyDefinition;
  condition?: StepConditionDefinition;
  position: StepPositionDefinition;
}

export enum StepType {
  DATA_SOURCE = "data_source",
  SCAN_RULE = "scan_rule",
  CLASSIFICATION = "classification",
  COMPLIANCE = "compliance",
  CATALOG = "catalog",
  SCAN_LOGIC = "scan_logic",
  AI_PROCESSING = "ai_processing",
  CUSTOM = "custom"
}

export interface StepInputDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
}

export interface StepOutputDefinition {
  name: string;
  type: string;
  description: string;
  schema?: Record<string, JSONValue>;
}

export interface ValidationRule {
  type: string;
  value: JSONValue;
  message: string;
}

export interface RetryPolicyDefinition {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors: string[];
}

export interface StepConditionDefinition {
  type: ConditionType;
  expression: string;
  parameters: Record<string, JSONValue>;
}

export interface StepPositionDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkflowDependencyDefinition {
  sourceStepId: UUID;
  targetStepId: UUID;
  dependencyType: DependencyType;
  condition?: string;
  parameters?: Record<string, JSONValue>;
}

export interface WorkflowParameterDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  category: string;
}

export interface WorkflowScheduleDefinition {
  enabled: boolean;
  type: ScheduleType;
  cronExpression?: string;
  interval?: number;
  timezone: string;
  startDate?: ISODateString;
  endDate?: ISODateString;
  maxRuns?: number;
  notifications: NotificationRule[];
}

export enum ScheduleType {
  MANUAL = "manual",
  CRON = "cron",
  INTERVAL = "interval",
  EVENT_TRIGGERED = "event_triggered"
}

export interface WorkflowConfigurationDefinition {
  maxConcurrentExecutions: number;
  timeoutMinutes: number;
  retryPolicy: RetryPolicyDefinition;
  errorHandling: ErrorHandlingPolicyDefinition;
  logging: LoggingConfigurationDefinition;
  monitoring: MonitoringConfigurationDefinition;
  resources: ResourceConfigurationDefinition;
}

export interface ErrorHandlingPolicyDefinition {
  onFailure: FailureAction;
  continueOnError: boolean;
  notificationEnabled: boolean;
  logLevel: LogLevel;
}

export enum FailureAction {
  STOP = "stop",
  CONTINUE = "continue",
  RETRY = "retry",
  SKIP = "skip"
}

export interface LoggingConfigurationDefinition {
  level: LogLevel;
  includeParameters: boolean;
  includeResults: boolean;
  retention: number;
}

export interface MonitoringConfigurationDefinition {
  metricsEnabled: boolean;
  alertingEnabled: boolean;
  performanceThresholds: Record<string, number>;
  customMetrics: string[];
}

export interface ResourceConfigurationDefinition {
  cpuLimit: number;
  memoryLimit: number;
  diskSpace: number;
  networkBandwidth: number;
}

export interface WorkflowResponse {
  id: UUID;
  name: string;
  description: string;
  version: string;
  workspaceId: UUID;
  status: OperationStatus;
  steps: WorkflowStepResponse[];
  dependencies: WorkflowDependencyResponse[];
  parameters: WorkflowParameterResponse[];
  schedule?: WorkflowScheduleResponse;
  configuration: WorkflowConfigurationResponse;
  createdBy: UserProfile;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastExecution?: ISODateString;
  executionCount: number;
  successRate: number;
  averageDuration: number;
  tags: string[];
}

export interface WorkflowStepResponse {
  id: UUID;
  name: string;
  description: string;
  type: StepType;
  groupId: string;
  operation: string;
  parameters: Record<string, JSONValue>;
  inputs: StepInputResponse[];
  outputs: StepOutputResponse[];
  dependencies: UUID[];
  timeout: number;
  retryPolicy: RetryPolicyResponse;
  condition?: StepConditionResponse;
  position: StepPositionResponse;
  status: StepStatus;
  lastExecution?: StepExecutionSummary;
}

export interface StepInputResponse {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  currentValue?: JSONValue;
}

export interface StepOutputResponse {
  name: string;
  type: string;
  description: string;
  schema?: Record<string, JSONValue>;
  lastValue?: JSONValue;
}

export interface RetryPolicyResponse {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors: string[];
  currentAttempt?: number;
}

export interface StepConditionResponse {
  type: ConditionType;
  expression: string;
  parameters: Record<string, JSONValue>;
  lastEvaluation?: boolean;
}

export interface StepPositionResponse {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum StepStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  SKIPPED = "skipped",
  CANCELLED = "cancelled"
}

export interface StepExecutionSummary {
  executionId: UUID;
  status: StepStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  successRate: number;
  errorCount: number;
}

export interface WorkflowDependencyResponse {
  id: UUID;
  sourceStepId: UUID;
  targetStepId: UUID;
  dependencyType: DependencyType;
  condition?: string;
  parameters?: Record<string, JSONValue>;
  status: DependencyStatus;
}

export enum DependencyStatus {
  PENDING = "pending",
  SATISFIED = "satisfied",
  BLOCKED = "blocked",
  FAILED = "failed"
}

export interface WorkflowParameterResponse {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  category: string;
  currentValue?: JSONValue;
}

export interface WorkflowScheduleResponse {
  enabled: boolean;
  type: ScheduleType;
  cronExpression?: string;
  interval?: number;
  timezone: string;
  startDate?: ISODateString;
  endDate?: ISODateString;
  maxRuns?: number;
  notifications: NotificationRule[];
  nextRun?: ISODateString;
  lastRun?: ISODateString;
  runCount: number;
}

export interface WorkflowConfigurationResponse {
  maxConcurrentExecutions: number;
  timeoutMinutes: number;
  retryPolicy: RetryPolicyResponse;
  errorHandling: ErrorHandlingPolicyResponse;
  logging: LoggingConfigurationResponse;
  monitoring: MonitoringConfigurationResponse;
  resources: ResourceConfigurationResponse;
}

export interface ErrorHandlingPolicyResponse {
  onFailure: FailureAction;
  continueOnError: boolean;
  notificationEnabled: boolean;
  logLevel: LogLevel;
}

export interface LoggingConfigurationResponse {
  level: LogLevel;
  includeParameters: boolean;
  includeResults: boolean;
  retention: number;
}

export interface MonitoringConfigurationResponse {
  metricsEnabled: boolean;
  alertingEnabled: boolean;
  performanceThresholds: Record<string, number>;
  customMetrics: string[];
}

export interface ResourceConfigurationResponse {
  cpuLimit: number;
  memoryLimit: number;
  diskSpace: number;
  networkBandwidth: number;
  currentUsage?: ResourceUsageInfo;
}

/**
 * Workflow Execution
 */
export interface ExecuteWorkflowRequest {
  workflowId: UUID;
  parameters?: Record<string, JSONValue>;
  priority?: WorkflowPriority;
  scheduledAt?: ISODateString;
  dryRun?: boolean;
  notifications?: NotificationRule[];
}

export interface WorkflowExecutionResponse {
  id: UUID;
  workflowId: UUID;
  workflowVersion: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  triggeredBy: UserProfile;
  triggerType: TriggerType;
  parameters: Record<string, JSONValue>;
  stepExecutions: StepExecutionDetails[];
  results: WorkflowExecutionResults;
  metrics: WorkflowExecutionMetrics;
  logs: ExecutionLog[];
  errors: ExecutionError[];
}

export enum TriggerType {
  MANUAL = "manual",
  SCHEDULED = "scheduled",
  EVENT = "event",
  API = "api"
}

export interface StepExecutionDetails {
  stepId: UUID;
  stepName: string;
  status: StepStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  inputs: Record<string, JSONValue>;
  outputs: Record<string, JSONValue>;
  metrics: StepExecutionMetrics;
  logs: string[];
  errors: string[];
  retryCount: number;
}

export interface StepExecutionMetrics {
  dataProcessed: number;
  recordsProcessed: number;
  memoryUsage: number;
  cpuUsage: number;
  networkIO: number;
  diskIO: number;
}

export interface WorkflowExecutionResults {
  success: boolean;
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  skippedSteps: number;
  dataProcessed: number;
  recordsProcessed: number;
  outputArtifacts: string[];
  summary: string;
}

export interface WorkflowExecutionMetrics {
  totalDuration: number;
  queueTime: number;
  executionTime: number;
  resourceUsage: ResourceUsageMetrics;
  performance: PerformanceMetrics;
  cost: CostMetrics;
}

export interface ExecutionError {
  timestamp: ISODateString;
  stepId?: UUID;
  errorType: string;
  errorCode: string;
  message: string;
  stackTrace?: string;
  recoverable: boolean;
  metadata?: Record<string, JSONValue>;
}

/**
 * Workflow Templates
 */
export interface GetWorkflowTemplatesRequest {
  category?: TemplateCategory;
  groupId?: string;
  tags?: string[];
  complexity?: TemplateComplexity;
}

export enum TemplateCategory {
  DATA_INGESTION = "data_ingestion",
  DATA_PROCESSING = "data_processing",
  COMPLIANCE_CHECK = "compliance_check",
  CLASSIFICATION = "classification",
  MONITORING = "monitoring",
  INTEGRATION = "integration"
}

export enum TemplateComplexity {
  SIMPLE = "simple",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert"
}

export interface WorkflowTemplateResponse {
  templates: WorkflowTemplate[];
  categories: TemplateCategoryInfo[];
  totalCount: number;
}

export interface WorkflowTemplate {
  id: UUID;
  name: string;
  description: string;
  category: TemplateCategory;
  complexity: TemplateComplexity;
  groups: string[];
  tags: string[];
  definition: WorkflowDefinitionTemplate;
  metadata: TemplateMetadata;
  usage: TemplateUsage;
  rating: TemplateRating;
  createdBy: UserProfile;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface WorkflowDefinitionTemplate {
  steps: WorkflowStepTemplate[];
  dependencies: WorkflowDependencyTemplate[];
  parameters: WorkflowParameterTemplate[];
  configuration: WorkflowConfigurationTemplate;
}

export interface WorkflowStepTemplate {
  name: string;
  description: string;
  type: StepType;
  groupId: string;
  operation: string;
  parameterTemplates: ParameterTemplate[];
  position: StepPositionDefinition;
  configurable: string[];
}

export interface ParameterTemplate {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  userConfigurable: boolean;
}

export interface WorkflowDependencyTemplate {
  sourceStepName: string;
  targetStepName: string;
  dependencyType: DependencyType;
  condition?: string;
}

export interface WorkflowParameterTemplate {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  category: string;
  userConfigurable: boolean;
}

export interface WorkflowConfigurationTemplate {
  maxConcurrentExecutions: number;
  timeoutMinutes: number;
  retryPolicy: RetryPolicyDefinition;
  errorHandling: ErrorHandlingPolicyDefinition;
  userConfigurable: string[];
}

export interface TemplateMetadata {
  author: string;
  version: string;
  license: string;
  documentation: string;
  examples: TemplateExample[];
  requirements: TemplateRequirement[];
}

export interface TemplateExample {
  name: string;
  description: string;
  parameters: Record<string, JSONValue>;
  expectedResults: Record<string, JSONValue>;
}

export interface TemplateRequirement {
  type: RequirementType;
  description: string;
  optional: boolean;
}

export enum RequirementType {
  PERMISSION = "permission",
  RESOURCE = "resource",
  INTEGRATION = "integration",
  CONFIGURATION = "configuration"
}

export interface TemplateUsage {
  usageCount: number;
  successRate: number;
  averageDuration: number;
  popularParameters: ParameterUsage[];
  recentUsage: TemplateUsageEvent[];
}

export interface ParameterUsage {
  parameter: string;
  usagePercent: number;
  averageValue: JSONValue;
  popularValues: JSONValue[];
}

export interface TemplateUsageEvent {
  userId: UUID;
  workflowId: UUID;
  timestamp: ISODateString;
  success: boolean;
  duration: number;
}

export interface TemplateRating {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: RatingDistribution;
  reviews: TemplateReview[];
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface TemplateReview {
  userId: UUID;
  username: string;
  rating: number;
  comment: string;
  helpful: number;
  timestamp: ISODateString;
}

export interface TemplateCategoryInfo {
  category: TemplateCategory;
  name: string;
  description: string;
  templateCount: number;
  popularTags: string[];
}

// Continue with Pipeline API, AI Assistant API, Activity API, Dashboard API, Collaboration API, Integration API, and User Management API types...
// Due to length constraints, I'll create additional type files for the remaining APIs

export type {
  // Core API response types
  APIResponse,
  APIError,
  ResponseMetadata,
  PaginationInfo,
  
  // Orchestration API types
  CreateOrchestrationRequest,
  OrchestrationResponse,
  SystemHealthResponse,
  ExecuteWorkflowRequest,
  WorkflowExecutionResponse,
  OptimizePerformanceRequest,
  PerformanceOptimizationResponse,
  
  // Workspace API types
  CreateWorkspaceRequest,
  WorkspaceResponse,
  LinkResourceRequest,
  WorkspaceResourcesResponse,
  WorkspaceAnalyticsRequest,
  WorkspaceAnalyticsResponse,
  
  // Workflow API types
  CreateWorkflowRequest,
  WorkflowResponse,
  ExecuteWorkflowRequest,
  GetWorkflowTemplatesRequest,
  WorkflowTemplateResponse
};