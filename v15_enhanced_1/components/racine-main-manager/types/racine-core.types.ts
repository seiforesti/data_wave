/**
 * Racine Core Types - Complete TypeScript Type Definitions
 * =========================================================
 * 
 * This file contains comprehensive TypeScript type definitions that map 100% to the backend
 * Racine models, ensuring complete type safety and perfect backend-frontend integration.
 * 
 * Type Categories:
 * - Core System Types: Master state management and system health
 * - Cross-Group Integration Types: Multi-group orchestration and coordination
 * - Orchestration Types: Workflow and pipeline management
 * - Workspace Types: Multi-workspace and resource management
 * - AI Assistant Types: Context-aware AI functionality
 * - Activity & Monitoring Types: Comprehensive tracking and analytics
 * - Dashboard Types: Real-time metrics and visualization
 * - Collaboration Types: Team workspace and communication
 * - Integration Types: External system and API gateway integration
 * - User Management Types: RBAC and profile management
 * 
 * All types are designed to match backend models exactly and provide
 * comprehensive type safety for enterprise-grade applications.
 */

// =============================================================================
// UTILITY AND BASE TYPES
// =============================================================================

export type UUID = string;
export type ISODateString = string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject { [key: string]: JSONValue; }
export interface JSONArray extends Array<JSONValue> {}

// Status enumerations matching backend
export enum SystemStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded", 
  FAILED = "failed",
  MAINTENANCE = "maintenance",
  INITIALIZING = "initializing"
}

export enum OperationStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  PAUSED = "paused"
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

export enum LayoutMode {
  SINGLE_PANE = "single_pane",
  SPLIT_SCREEN = "split_screen", 
  TABBED = "tabbed",
  GRID = "grid",
  CUSTOM = "custom"
}

export enum IntegrationStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  FAILED = "failed", 
  MAINTENANCE = "maintenance",
  INITIALIZING = "initializing"
}

// =============================================================================
// CORE SYSTEM TYPES - Master State Management
// =============================================================================

/**
 * Main Racine system state - maps to RacineOrchestrationMaster backend model
 */
export interface RacineState {
  // Core state fields
  isInitialized: boolean;
  currentView: ViewMode;
  activeWorkspaceId: UUID;
  layoutMode: LayoutMode;
  sidebarCollapsed: boolean;
  loading: boolean;
  error: string | null;
  
  // System health and monitoring
  systemHealth: SystemHealth;
  lastActivity: ISODateString;
  performanceMetrics: PerformanceMetrics;
  
  // Cross-group state
  connectedGroups: GroupConfiguration[];
  activeIntegrations: Integration[];
  globalMetrics: Record<string, JSONValue>;
  
  // User context
  currentUser: UserContext;
  permissions: RBACPermissions;
  preferences: UserPreferences;
  
  // Real-time updates
  websocketConnected: boolean;
  lastSync: ISODateString;
}

/**
 * Cross-group integration state
 */
export interface CrossGroupState {
  connectedGroups: GroupConfiguration[];
  activeIntegrations: Integration[];
  sharedResources: SharedResource[];
  crossGroupWorkflows: CrossGroupWorkflow[];
  globalMetrics: Record<string, JSONValue>;
  synchronizationStatus: SynchronizationStatus;
  lastSync: ISODateString;
  healthStatus: Record<string, SystemStatus>;
}

/**
 * System health monitoring - maps to RacineSystemHealth backend model
 */
export interface SystemHealth {
  overall: SystemStatus;
  groups: Record<string, GroupHealth>;
  services: Record<string, ServiceHealth>;
  integrations: Record<string, IntegrationHealth>;
  performance: PerformanceHealth;
  lastCheck: ISODateString;
  uptime: number;
  version: string;
}

export interface GroupHealth {
  groupId: string;
  groupName: string;
  status: SystemStatus;
  responseTime: number;
  errorRate: number;
  lastCheck: ISODateString;
  endpoints: EndpointHealth[];
  capabilities: string[];
}

export interface ServiceHealth {
  serviceId: string;
  serviceName: string;
  status: SystemStatus;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
  lastCheck: ISODateString;
}

export interface IntegrationHealth {
  integrationId: UUID;
  integrationName: string;
  status: IntegrationStatus;
  lastSync: ISODateString;
  syncSuccess: boolean;
  errorCount: number;
  responseTime: number;
}

export interface EndpointHealth {
  endpoint: string;
  status: SystemStatus;
  responseTime: number;
  statusCode: number;
  lastCheck: ISODateString;
}

export interface PerformanceHealth {
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
}

/**
 * Performance metrics tracking
 */
export interface PerformanceMetrics {
  responseTime: {
    average: number;
    p95: number;
    p99: number;
    max: number;
  };
  throughput: {
    requestsPerSecond: number;
    operationsPerSecond: number;
    dataProcessed: number;
  };
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  errors: {
    totalCount: number;
    errorRate: number;
    criticalErrors: number;
    warningCount: number;
  };
  lastUpdated: ISODateString;
}

// =============================================================================
// GROUP CONFIGURATION AND INTEGRATION TYPES
// =============================================================================

/**
 * Group configuration - maps to supported data governance groups
 */
export interface GroupConfiguration {
  groupId: string;
  groupName: string;
  description: string;
  serviceClass: string;
  endpoints: string[];
  capabilities: string[];
  status: SystemStatus;
  version: string;
  healthCheckInterval: number;
  timeout: number;
  retryCount: number;
  configuration: Record<string, JSONValue>;
  lastHealthCheck: ISODateString;
}

/**
 * Integration definition between groups
 */
export interface Integration {
  id: UUID;
  name: string;
  description: string;
  sourceGroup: string;
  targetGroups: string[];
  integrationType: string;
  status: IntegrationStatus;
  configuration: Record<string, JSONValue>;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastSync: ISODateString;
  syncResults: Record<string, JSONValue>;
}

/**
 * Shared resource across groups
 */
export interface SharedResource {
  id: UUID;
  name: string;
  type: string;
  description: string;
  sourceGroup: string;
  sharedWithGroups: string[];
  resourceData: Record<string, JSONValue>;
  permissions: ResourcePermissions;
  createdBy: UUID;
  createdAt: ISODateString;
  lastAccessed: ISODateString;
  accessCount: number;
}

export interface ResourcePermissions {
  read: string[];
  write: string[];
  delete: string[];
  admin: string[];
}

/**
 * Cross-group workflow definition
 */
export interface CrossGroupWorkflow {
  id: UUID;
  name: string;
  description: string;
  groups: string[];
  steps: WorkflowStep[];
  dependencies: WorkflowDependency[];
  status: OperationStatus;
  configuration: Record<string, JSONValue>;
  createdBy: UUID;
  createdAt: ISODateString;
  lastExecution: ISODateString;
  executionHistory: WorkflowExecution[];
}

/**
 * Synchronization status across groups
 */
export interface SynchronizationStatus {
  overall: SystemStatus;
  groups: Record<string, GroupSyncStatus>;
  lastGlobalSync: ISODateString;
  syncInProgress: boolean;
  pendingSyncs: number;
  failedSyncs: number;
  totalSyncs: number;
}

export interface GroupSyncStatus {
  groupId: string;
  status: SystemStatus;
  lastSync: ISODateString;
  syncDuration: number;
  recordsSynced: number;
  errors: string[];
}

// =============================================================================
// WORKSPACE MANAGEMENT TYPES - Maps to RacineWorkspace models
// =============================================================================

/**
 * Workspace configuration - maps to RacineWorkspace backend model
 */
export interface WorkspaceConfiguration {
  id: UUID;
  name: string;
  description: string;
  type: WorkspaceType;
  owner: UUID;
  members: WorkspaceMember[];
  groups: string[];
  resources: WorkspaceResource[];
  settings: WorkspaceSettings;
  analytics: WorkspaceAnalytics;
  permissions: WorkspacePermissions;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastAccessed: ISODateString;
  isActive: boolean;
  tags: string[];
}

export enum WorkspaceType {
  PERSONAL = "personal",
  TEAM = "team", 
  ENTERPRISE = "enterprise",
  PROJECT = "project",
  TEMPORARY = "temporary"
}

/**
 * Workspace member - maps to RacineWorkspaceMember backend model
 */
export interface WorkspaceMember {
  id: UUID;
  workspaceId: UUID;
  userId: UUID;
  role: WorkspaceRole;
  permissions: string[];
  addedBy: UUID;
  addedAt: ISODateString;
  lastActivity: ISODateString;
  isActive: boolean;
  user: UserProfile;
}

export enum WorkspaceRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
  GUEST = "guest"
}

/**
 * Workspace resource - maps to RacineWorkspaceResource backend model
 */
export interface WorkspaceResource {
  id: UUID;
  workspaceId: UUID;
  resourceId: UUID;
  resourceType: string;
  sourceGroup: string;
  name: string;
  description: string;
  metadata: Record<string, JSONValue>;
  addedBy: UUID;
  addedAt: ISODateString;
  lastAccessed: ISODateString;
  accessCount: number;
  permissions: ResourcePermissions;
}

export interface WorkspaceSettings {
  theme: string;
  layout: LayoutMode;
  defaultView: ViewMode;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  integrations: IntegrationSettings;
  customizations: Record<string, JSONValue>;
}

export interface WorkspaceAnalytics {
  totalMembers: number;
  totalResources: number;
  activityLevel: number;
  collaborationScore: number;
  resourceUtilization: number;
  averageSessionDuration: number;
  mostActiveMembers: string[];
  mostUsedResources: string[];
  growthTrends: Record<string, number[]>;
  lastUpdated: ISODateString;
}

export interface WorkspacePermissions {
  canInvite: boolean;
  canRemoveMembers: boolean;
  canModifySettings: boolean;
  canDeleteWorkspace: boolean;
  canManageResources: boolean;
  canViewAnalytics: boolean;
}

// =============================================================================
// WORKFLOW AND PIPELINE TYPES - Maps to RacineWorkflow/Pipeline models
// =============================================================================

/**
 * Workflow definition - maps to RacineJobWorkflow backend model
 */
export interface WorkflowDefinition {
  id: UUID;
  name: string;
  description: string;
  version: string;
  workspaceId: UUID;
  steps: WorkflowStep[];
  dependencies: WorkflowDependency[];
  parameters: WorkflowParameter[];
  schedule: WorkflowSchedule;
  configuration: WorkflowConfiguration;
  status: OperationStatus;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastExecution: ISODateString;
  executionCount: number;
  successRate: number;
  averageDuration: number;
}

/**
 * Workflow step definition
 */
export interface WorkflowStep {
  id: UUID;
  name: string;
  description: string;
  type: StepType;
  groupId: string;
  operation: string;
  parameters: Record<string, JSONValue>;
  inputs: StepInput[];
  outputs: StepOutput[];
  dependencies: string[];
  timeout: number;
  retryPolicy: RetryPolicy;
  condition: StepCondition;
  position: StepPosition;
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

export interface StepInput {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
}

export interface StepOutput {
  name: string;
  type: string;
  description: string;
  schema?: Record<string, JSONValue>;
}

export interface StepCondition {
  type: ConditionType;
  expression: string;
  parameters: Record<string, JSONValue>;
}

export enum ConditionType {
  ALWAYS = "always",
  ON_SUCCESS = "on_success",
  ON_FAILURE = "on_failure",
  CONDITIONAL = "conditional"
}

export interface StepPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Workflow dependency
 */
export interface WorkflowDependency {
  id: UUID;
  sourceStepId: UUID;
  targetStepId: UUID;
  dependencyType: DependencyType;
  condition?: string;
  parameters?: Record<string, JSONValue>;
}

export enum DependencyType {
  SEQUENCE = "sequence",
  PARALLEL = "parallel",
  CONDITIONAL = "conditional",
  LOOP = "loop"
}

/**
 * Workflow parameter
 */
export interface WorkflowParameter {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: JSONValue;
  description: string;
  validation?: ValidationRule[];
  category: string;
}

export interface ValidationRule {
  type: string;
  value: JSONValue;
  message: string;
}

/**
 * Workflow schedule
 */
export interface WorkflowSchedule {
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

export interface NotificationRule {
  type: NotificationType;
  recipients: string[];
  events: string[];
  template: string;
}

export enum NotificationType {
  EMAIL = "email",
  SLACK = "slack",
  WEBHOOK = "webhook",
  IN_APP = "in_app"
}

/**
 * Workflow configuration
 */
export interface WorkflowConfiguration {
  maxConcurrentExecutions: number;
  timeoutMinutes: number;
  retryPolicy: RetryPolicy;
  errorHandling: ErrorHandlingPolicy;
  logging: LoggingConfiguration;
  monitoring: MonitoringConfiguration;
  resources: ResourceConfiguration;
}

export interface RetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors: string[];
}

export enum BackoffStrategy {
  FIXED = "fixed",
  LINEAR = "linear",
  EXPONENTIAL = "exponential"
}

export interface ErrorHandlingPolicy {
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

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

export interface LoggingConfiguration {
  level: LogLevel;
  includeParameters: boolean;
  includeResults: boolean;
  retention: number;
}

export interface MonitoringConfiguration {
  metricsEnabled: boolean;
  alertingEnabled: boolean;
  performanceThresholds: Record<string, number>;
  customMetrics: string[];
}

export interface ResourceConfiguration {
  cpuLimit: number;
  memoryLimit: number;
  diskSpace: number;
  networkBandwidth: number;
}

/**
 * Workflow execution - maps to RacineJobExecution backend model
 */
export interface WorkflowExecution {
  id: UUID;
  workflowId: UUID;
  workflowVersion: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  triggeredBy: UUID;
  triggerType: TriggerType;
  parameters: Record<string, JSONValue>;
  stepExecutions: StepExecution[];
  results: ExecutionResults;
  metrics: ExecutionMetrics;
  logs: ExecutionLog[];
  errors: ExecutionError[];
}

export enum TriggerType {
  MANUAL = "manual",
  SCHEDULED = "scheduled",
  EVENT = "event",
  API = "api"
}

export interface StepExecution {
  stepId: UUID;
  stepName: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  inputs: Record<string, JSONValue>;
  outputs: Record<string, JSONValue>;
  metrics: StepMetrics;
  logs: string[];
  errors: string[];
}

export interface StepMetrics {
  dataProcessed: number;
  recordsProcessed: number;
  memoryUsage: number;
  cpuUsage: number;
  networkIO: number;
  diskIO: number;
}

export interface ExecutionResults {
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

export interface ExecutionMetrics {
  totalDuration: number;
  queueTime: number;
  executionTime: number;
  resourceUsage: ResourceUsage;
  performance: PerformanceMetrics;
  cost: CostMetrics;
}

export interface ResourceUsage {
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

export interface ExecutionLog {
  timestamp: ISODateString;
  level: LogLevel;
  message: string;
  stepId?: UUID;
  metadata?: Record<string, JSONValue>;
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

// =============================================================================
// PIPELINE TYPES - Maps to RacinePipeline models
// =============================================================================

/**
 * Pipeline definition - maps to RacinePipeline backend model
 */
export interface PipelineDefinition {
  id: UUID;
  name: string;
  description: string;
  version: string;
  workspaceId: UUID;
  stages: PipelineStage[];
  configuration: PipelineConfiguration;
  status: OperationStatus;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastExecution: ISODateString;
  executionCount: number;
  successRate: number;
  averageDuration: number;
  tags: string[];
}

/**
 * Pipeline stage definition
 */
export interface PipelineStage {
  id: UUID;
  name: string;
  description: string;
  type: StageType;
  groupId: string;
  operations: PipelineOperation[];
  inputs: StageInput[];
  outputs: StageOutput[];
  dependencies: string[];
  parallelism: number;
  timeout: number;
  retryPolicy: RetryPolicy;
  position: StagePosition;
  configuration: Record<string, JSONValue>;
}

export enum StageType {
  INGESTION = "ingestion",
  TRANSFORMATION = "transformation",
  VALIDATION = "validation",
  CLASSIFICATION = "classification",
  COMPLIANCE_CHECK = "compliance_check",
  CATALOGING = "cataloging",
  ANALYSIS = "analysis",
  OUTPUT = "output"
}

export interface PipelineOperation {
  id: UUID;
  name: string;
  type: string;
  parameters: Record<string, JSONValue>;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface StageInput {
  name: string;
  type: string;
  source: string;
  required: boolean;
  schema?: Record<string, JSONValue>;
}

export interface StageOutput {
  name: string;
  type: string;
  destination: string;
  schema?: Record<string, JSONValue>;
}

export interface StagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
}

/**
 * Pipeline configuration
 */
export interface PipelineConfiguration {
  maxConcurrentStages: number;
  globalTimeout: number;
  errorHandling: ErrorHandlingPolicy;
  monitoring: MonitoringConfiguration;
  optimization: OptimizationConfiguration;
  resources: ResourceConfiguration;
  security: SecurityConfiguration;
}

export interface OptimizationConfiguration {
  enabled: boolean;
  autoScaling: boolean;
  resourceOptimization: boolean;
  costOptimization: boolean;
  performanceOptimization: boolean;
  customRules: OptimizationRule[];
}

export interface OptimizationRule {
  name: string;
  type: string;
  condition: string;
  action: string;
  parameters: Record<string, JSONValue>;
}

export interface SecurityConfiguration {
  encryption: EncryptionSettings;
  authentication: AuthenticationSettings;
  authorization: AuthorizationSettings;
  audit: AuditSettings;
}

export interface EncryptionSettings {
  enabled: boolean;
  algorithm: string;
  keyRotation: boolean;
  keyRotationInterval: number;
}

export interface AuthenticationSettings {
  required: boolean;
  methods: string[];
  tokenExpiry: number;
}

export interface AuthorizationSettings {
  rbacEnabled: boolean;
  requiredPermissions: string[];
  resourceAccess: Record<string, string[]>;
}

export interface AuditSettings {
  enabled: boolean;
  logLevel: LogLevel;
  retention: number;
  destinations: string[];
}

/**
 * Pipeline execution
 */
export interface PipelineExecution {
  id: UUID;
  pipelineId: UUID;
  pipelineVersion: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  triggeredBy: UUID;
  triggerType: TriggerType;
  stageExecutions: StageExecution[];
  results: PipelineResults;
  metrics: PipelineMetrics;
  logs: ExecutionLog[];
  errors: ExecutionError[];
}

export interface StageExecution {
  stageId: UUID;
  stageName: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  operationExecutions: OperationExecution[];
  inputs: Record<string, JSONValue>;
  outputs: Record<string, JSONValue>;
  metrics: StageMetrics;
  logs: string[];
  errors: string[];
}

export interface OperationExecution {
  operationId: UUID;
  operationName: string;
  status: OperationStatus;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  inputs: Record<string, JSONValue>;
  outputs: Record<string, JSONValue>;
  metrics: OperationMetrics;
  logs: string[];
  errors: string[];
}

export interface OperationMetrics {
  recordsProcessed: number;
  dataSize: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  networkIO: number;
  diskIO: number;
}

export interface StageMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  dataProcessed: number;
  recordsProcessed: number;
  averageOperationTime: number;
  resourceUsage: ResourceUsage;
}

export interface PipelineResults {
  success: boolean;
  totalStages: number;
  successfulStages: number;
  failedStages: number;
  skippedStages: number;
  totalOperations: number;
  dataProcessed: number;
  recordsProcessed: number;
  outputArtifacts: string[];
  qualityScore: number;
  summary: string;
}

export interface PipelineMetrics {
  totalDuration: number;
  queueTime: number;
  executionTime: number;
  optimizationSavings: number;
  resourceEfficiency: number;
  costEfficiency: number;
  qualityMetrics: QualityMetrics;
  performanceMetrics: PerformanceMetrics;
}

export interface QualityMetrics {
  dataQualityScore: number;
  completenessScore: number;
  accuracyScore: number;
  consistencyScore: number;
  validityScore: number;
  uniquenessScore: number;
}

// =============================================================================
// AI ASSISTANT TYPES - Maps to RacineAI models
// =============================================================================

/**
 * AI conversation - maps to RacineAIConversation backend model
 */
export interface AIConversation {
  id: UUID;
  userId: UUID;
  workspaceId?: UUID;
  title: string;
  context: AIContext;
  messages: AIMessage[];
  status: ConversationStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastActivity: ISODateString;
  metadata: Record<string, JSONValue>;
}

export enum ConversationStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  DELETED = "deleted"
}

/**
 * AI message within conversation
 */
export interface AIMessage {
  id: UUID;
  conversationId: UUID;
  role: MessageRole;
  content: string;
  messageType: MessageType;
  timestamp: ISODateString;
  context: MessageContext;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  metadata: Record<string, JSONValue>;
}

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system"
}

export enum MessageType {
  TEXT = "text",
  CODE = "code",
  QUERY = "query",
  RECOMMENDATION = "recommendation",
  INSIGHT = "insight",
  ERROR = "error",
  WARNING = "warning"
}

export interface MessageContext {
  currentView: ViewMode;
  activeWorkspace: UUID;
  relatedResources: string[];
  systemState: Record<string, JSONValue>;
  userIntent: string;
  confidence: number;
}

export interface MessageAttachment {
  id: UUID;
  type: AttachmentType;
  name: string;
  url: string;
  size: number;
  metadata: Record<string, JSONValue>;
}

export enum AttachmentType {
  DOCUMENT = "document",
  IMAGE = "image",
  CODE = "code",
  DATA = "data",
  WORKFLOW = "workflow",
  PIPELINE = "pipeline"
}

export interface MessageReaction {
  userId: UUID;
  reaction: ReactionType;
  timestamp: ISODateString;
}

export enum ReactionType {
  HELPFUL = "helpful",
  NOT_HELPFUL = "not_helpful",
  ACCURATE = "accurate",
  INACCURATE = "inaccurate"
}

/**
 * AI context for context-aware assistance
 */
export interface AIContext {
  userId: UUID;
  workspaceId?: UUID;
  currentView: ViewMode;
  activeResources: string[];
  recentActivities: ActivitySummary[];
  userPreferences: AIPreferences;
  systemState: SystemContextSnapshot;
  conversationHistory: ConversationSummary[];
  expertise: UserExpertise;
}

export interface ActivitySummary {
  type: string;
  timestamp: ISODateString;
  resource: string;
  action: string;
  context: Record<string, JSONValue>;
}

export interface AIPreferences {
  responseStyle: ResponseStyle;
  detailLevel: DetailLevel;
  languagePreference: string;
  topicInterests: string[];
  learningMode: boolean;
  proactiveAssistance: boolean;
}

export enum ResponseStyle {
  CONCISE = "concise",
  DETAILED = "detailed",
  TECHNICAL = "technical",
  BUSINESS = "business"
}

export enum DetailLevel {
  MINIMAL = "minimal",
  STANDARD = "standard",
  COMPREHENSIVE = "comprehensive"
}

export interface SystemContextSnapshot {
  systemHealth: SystemStatus;
  activeWorkflows: number;
  activePipelines: number;
  recentErrors: string[];
  performanceMetrics: PerformanceMetrics;
  timestamp: ISODateString;
}

export interface ConversationSummary {
  conversationId: UUID;
  topic: string;
  summary: string;
  keyInsights: string[];
  timestamp: ISODateString;
}

export interface UserExpertise {
  level: ExpertiseLevel;
  domains: string[];
  skills: string[];
  learningGoals: string[];
  recentAchievements: string[];
}

export enum ExpertiseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert"
}

/**
 * AI recommendation - maps to RacineAIRecommendation backend model
 */
export interface AIRecommendation {
  id: UUID;
  userId: UUID;
  type: RecommendationType;
  title: string;
  description: string;
  confidence: number;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  context: RecommendationContext;
  actions: RecommendationAction[];
  metrics: RecommendationMetrics;
  status: RecommendationStatus;
  createdAt: ISODateString;
  expiresAt?: ISODateString;
  implementedAt?: ISODateString;
  feedback: RecommendationFeedback[];
}

export enum RecommendationType {
  OPTIMIZATION = "optimization",
  SECURITY = "security",
  BEST_PRACTICE = "best_practice",
  TROUBLESHOOTING = "troubleshooting",
  WORKFLOW = "workflow",
  PIPELINE = "pipeline",
  INTEGRATION = "integration"
}

export enum RecommendationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum RecommendationCategory {
  PERFORMANCE = "performance",
  SECURITY = "security",
  COMPLIANCE = "compliance",
  COST = "cost",
  QUALITY = "quality",
  MAINTENANCE = "maintenance"
}

export interface RecommendationContext {
  triggeredBy: string;
  relatedResources: string[];
  currentMetrics: Record<string, number>;
  expectedImprovement: Record<string, number>;
  implementation: ImplementationGuide;
}

export interface ImplementationGuide {
  estimatedTime: number;
  difficulty: DifficultyLevel;
  prerequisites: string[];
  steps: ImplementationStep[];
  risks: string[];
  rollbackPlan: string[];
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

export interface RecommendationAction {
  id: UUID;
  type: ActionType;
  title: string;
  description: string;
  parameters: Record<string, JSONValue>;
  autoExecute: boolean;
  confirmationRequired: boolean;
}

export enum ActionType {
  EXECUTE_COMMAND = "execute_command",
  UPDATE_CONFIGURATION = "update_configuration",
  CREATE_RESOURCE = "create_resource",
  MODIFY_WORKFLOW = "modify_workflow",
  SCHEDULE_TASK = "schedule_task",
  SEND_NOTIFICATION = "send_notification"
}

export interface RecommendationMetrics {
  viewCount: number;
  implementationCount: number;
  successRate: number;
  averageRating: number;
  impactScore: number;
  roi: number;
}

export enum RecommendationStatus {
  PENDING = "pending",
  VIEWED = "viewed",
  IMPLEMENTED = "implemented",
  DISMISSED = "dismissed",
  EXPIRED = "expired"
}

export interface RecommendationFeedback {
  userId: UUID;
  rating: number;
  helpful: boolean;
  comment?: string;
  implemented: boolean;
  improvement: Record<string, number>;
  timestamp: ISODateString;
}

/**
 * AI insight - maps to RacineAIInsight backend model
 */
export interface AIInsight {
  id: UUID;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  relevance: number;
  category: InsightCategory;
  dataSource: string[];
  analysis: InsightAnalysis;
  visualizations: InsightVisualization[];
  recommendations: UUID[];
  status: InsightStatus;
  createdAt: ISODateString;
  validUntil?: ISODateString;
  viewCount: number;
  shareCount: number;
}

export enum InsightType {
  TREND = "trend",
  ANOMALY = "anomaly",
  PATTERN = "pattern",
  CORRELATION = "correlation",
  PREDICTION = "prediction",
  OPTIMIZATION = "optimization"
}

export enum InsightCategory {
  PERFORMANCE = "performance",
  USAGE = "usage",
  QUALITY = "quality",
  SECURITY = "security",
  COST = "cost",
  COMPLIANCE = "compliance"
}

export interface InsightAnalysis {
  summary: string;
  keyFindings: string[];
  methodology: string;
  dataQuality: number;
  statisticalSignificance: number;
  limitations: string[];
  nextSteps: string[];
}

export interface InsightVisualization {
  id: UUID;
  type: VisualizationType;
  title: string;
  description: string;
  data: Record<string, JSONValue>;
  configuration: Record<string, JSONValue>;
}

export enum VisualizationType {
  CHART = "chart",
  GRAPH = "graph",
  HEATMAP = "heatmap",
  TIMELINE = "timeline",
  NETWORK = "network",
  TREEMAP = "treemap"
}

export enum InsightStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  OUTDATED = "outdated"
}

// =============================================================================
// USER MANAGEMENT AND RBAC TYPES
// =============================================================================

/**
 * User context and profile
 */
export interface UserContext {
  id: UUID;
  username: string;
  email: string;
  profile: UserProfile;
  roles: Role[];
  permissions: RBACPermissions;
  preferences: UserPreferences;
  currentSession: UserSession;
  workspaces: UUID[];
  recentActivity: ActivitySummary[];
}

export interface UserProfile {
  id: UUID;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  title?: string;
  department?: string;
  organization?: string;
  phone?: string;
  timezone: string;
  locale: string;
  bio?: string;
  skills: string[];
  interests: string[];
  socialLinks: SocialLink[];
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface SocialLink {
  platform: string;
  url: string;
  verified: boolean;
}

export interface Role {
  id: UUID;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Permission {
  id: UUID;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, JSONValue>;
  isSystem: boolean;
  createdAt: ISODateString;
}

export interface RBACPermissions {
  groups: Record<string, GroupPermissions>;
  workspaces: Record<UUID, WorkspacePermissions>;
  resources: Record<UUID, ResourcePermissions>;
  system: SystemPermissions;
}

export interface GroupPermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
  execute: boolean;
  configure: boolean;
}

export interface SystemPermissions {
  manageUsers: boolean;
  manageRoles: boolean;
  managePermissions: boolean;
  viewSystemHealth: boolean;
  manageIntegrations: boolean;
  accessAuditLogs: boolean;
  manageBackups: boolean;
  systemConfiguration: boolean;
}

export interface UserPreferences {
  theme: ThemePreference;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  dashboard: DashboardPreferences;
  accessibility: AccessibilitySettings;
}

export enum ThemePreference {
  LIGHT = "light",
  DARK = "dark",
  AUTO = "auto"
}

export interface NotificationSettings {
  email: EmailNotificationSettings;
  inApp: InAppNotificationSettings;
  push: PushNotificationSettings;
  digest: DigestSettings;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  workflowUpdates: boolean;
  systemAlerts: boolean;
  collaborationUpdates: boolean;
  weeklyDigest: boolean;
  immediateAlerts: boolean;
}

export interface InAppNotificationSettings {
  enabled: boolean;
  showBadges: boolean;
  playSound: boolean;
  autoHide: boolean;
  autoHideDelay: number;
}

export interface PushNotificationSettings {
  enabled: boolean;
  criticalOnly: boolean;
  quietHours: QuietHours;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface DigestSettings {
  enabled: boolean;
  frequency: DigestFrequency;
  time: string;
  timezone: string;
  includeMetrics: boolean;
  includeRecommendations: boolean;
}

export enum DigestFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly"
}

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  activityTracking: boolean;
  dataSharing: boolean;
  analyticsOptOut: boolean;
  searchableProfile: boolean;
}

export enum ProfileVisibility {
  PUBLIC = "public",
  ORGANIZATION = "organization",
  TEAM = "team",
  PRIVATE = "private"
}

export interface DashboardPreferences {
  defaultLayout: LayoutMode;
  widgetPreferences: WidgetPreference[];
  autoRefresh: boolean;
  refreshInterval: number;
  compactMode: boolean;
}

export interface WidgetPreference {
  widgetId: string;
  visible: boolean;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: Record<string, JSONValue>;
}

export interface WidgetPosition {
  x: number;
  y: number;
  z: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: FontSize;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindness: ColorBlindnessType;
}

export enum FontSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  EXTRA_LARGE = "extra_large"
}

export enum ColorBlindnessType {
  NONE = "none",
  PROTANOPIA = "protanopia",
  DEUTERANOPIA = "deuteranopia",
  TRITANOPIA = "tritanopia"
}

export interface UserSession {
  id: UUID;
  userId: UUID;
  token: string;
  refreshToken: string;
  createdAt: ISODateString;
  expiresAt: ISODateString;
  lastActivity: ISODateString;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  isActive: boolean;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

// =============================================================================
// ACTIVITY AND MONITORING TYPES
// =============================================================================

/**
 * Activity record - maps to RacineActivity backend model
 */
export interface ActivityRecord {
  id: UUID;
  userId: UUID;
  workspaceId?: UUID;
  activityType: ActivityType;
  resourceType: string;
  resourceId: UUID;
  action: ActivityAction;
  description: string;
  metadata: ActivityMetadata;
  timestamp: ISODateString;
  duration?: number;
  ipAddress: string;
  userAgent: string;
  sessionId: UUID;
  correlationId?: UUID;
  parentActivityId?: UUID;
  childActivities: UUID[];
}

export enum ActivityType {
  USER_ACTION = "user_action",
  SYSTEM_EVENT = "system_event",
  WORKFLOW_EVENT = "workflow_event",
  PIPELINE_EVENT = "pipeline_event",
  INTEGRATION_EVENT = "integration_event",
  SECURITY_EVENT = "security_event",
  ERROR_EVENT = "error_event"
}

export enum ActivityAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  EXECUTE = "execute",
  PAUSE = "pause",
  RESUME = "resume",
  CANCEL = "cancel",
  LOGIN = "login",
  LOGOUT = "logout",
  ACCESS = "access",
  SHARE = "share",
  EXPORT = "export",
  IMPORT = "import"
}

export interface ActivityMetadata {
  source: string;
  category: string;
  severity: ActivitySeverity;
  tags: string[];
  properties: Record<string, JSONValue>;
  context: ActivityContext;
  impact: ActivityImpact;
}

export enum ActivitySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export interface ActivityContext {
  view: ViewMode;
  feature: string;
  component: string;
  operation: string;
  parameters: Record<string, JSONValue>;
}

export interface ActivityImpact {
  scope: ImpactScope;
  affectedUsers: number;
  affectedResources: number;
  dataVolume: number;
  performanceImpact: number;
}

export enum ImpactScope {
  USER = "user",
  WORKSPACE = "workspace",
  GROUP = "group",
  SYSTEM = "system"
}

/**
 * Audit trail
 */
export interface AuditTrail {
  id: UUID;
  resourceType: string;
  resourceId: UUID;
  activities: ActivityRecord[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  retentionPolicy: RetentionPolicy;
  complianceLevel: ComplianceLevel;
}

export interface RetentionPolicy {
  retentionPeriod: number;
  archiveAfter: number;
  deleteAfter: number;
  compressionEnabled: boolean;
  encryptionRequired: boolean;
}

export enum ComplianceLevel {
  BASIC = "basic",
  STANDARD = "standard",
  ENHANCED = "enhanced",
  STRICT = "strict"
}

// =============================================================================
// DASHBOARD AND VISUALIZATION TYPES
// =============================================================================

/**
 * Dashboard state - maps to RacineDashboard backend model
 */
export interface DashboardState {
  id: UUID;
  name: string;
  description: string;
  type: DashboardType;
  workspaceId?: UUID;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  permissions: DashboardPermissions;
  settings: DashboardSettings;
  analytics: DashboardAnalytics;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastViewed: ISODateString;
  isPublic: boolean;
  tags: string[];
}

export enum DashboardType {
  PERSONAL = "personal",
  TEAM = "team",
  EXECUTIVE = "executive",
  OPERATIONAL = "operational",
  ANALYTICAL = "analytical",
  REAL_TIME = "real_time"
}

export interface DashboardLayout {
  type: LayoutType;
  columns: number;
  rows: number;
  gaps: number;
  responsive: boolean;
  breakpoints: LayoutBreakpoint[];
}

export enum LayoutType {
  GRID = "grid",
  FLEX = "flex",
  MASONRY = "masonry",
  CUSTOM = "custom"
}

export interface LayoutBreakpoint {
  breakpoint: string;
  columns: number;
  gaps: number;
}

export interface DashboardWidget {
  id: UUID;
  type: WidgetType;
  title: string;
  description: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfiguration;
  dataSource: WidgetDataSource;
  refreshInterval: number;
  lastUpdated: ISODateString;
  isVisible: boolean;
  permissions: WidgetPermissions;
}

export enum WidgetType {
  METRIC = "metric",
  CHART = "chart",
  TABLE = "table",
  TEXT = "text",
  IMAGE = "image",
  MAP = "map",
  GAUGE = "gauge",
  PROGRESS = "progress",
  ALERT = "alert",
  ACTIVITY_FEED = "activity_feed",
  CUSTOM = "custom"
}

export interface WidgetConfiguration {
  visualization: VisualizationConfig;
  interactions: InteractionConfig;
  styling: StylingConfig;
  behavior: BehaviorConfig;
}

export interface VisualizationConfig {
  chartType?: ChartType;
  aggregation?: AggregationType;
  groupBy?: string[];
  sortBy?: SortConfig[];
  limits?: LimitConfig;
  formatting?: FormattingConfig;
}

export enum ChartType {
  LINE = "line",
  BAR = "bar",
  PIE = "pie",
  AREA = "area",
  SCATTER = "scatter",
  HEATMAP = "heatmap",
  TREEMAP = "treemap",
  SANKEY = "sankey"
}

export enum AggregationType {
  SUM = "sum",
  COUNT = "count",
  AVERAGE = "average",
  MIN = "min",
  MAX = "max",
  MEDIAN = "median",
  PERCENTILE = "percentile"
}

export interface SortConfig {
  field: string;
  direction: SortDirection;
  priority: number;
}

export enum SortDirection {
  ASC = "asc",
  DESC = "desc"
}

export interface LimitConfig {
  maxItems: number;
  showOthers: boolean;
  otherLabel: string;
}

export interface FormattingConfig {
  numberFormat?: NumberFormat;
  dateFormat?: string;
  colorPalette?: string[];
  customColors?: Record<string, string>;
}

export interface NumberFormat {
  type: NumberFormatType;
  decimals: number;
  thousands: boolean;
  prefix?: string;
  suffix?: string;
}

export enum NumberFormatType {
  NUMBER = "number",
  CURRENCY = "currency",
  PERCENTAGE = "percentage",
  BYTES = "bytes",
  DURATION = "duration"
}

export interface InteractionConfig {
  clickAction?: ClickAction;
  hoverEnabled: boolean;
  selectionEnabled: boolean;
  zoomEnabled: boolean;
  panEnabled: boolean;
  exportEnabled: boolean;
}

export enum ClickAction {
  NONE = "none",
  DRILL_DOWN = "drill_down",
  FILTER = "filter",
  NAVIGATE = "navigate",
  CUSTOM = "custom"
}

export interface StylingConfig {
  theme: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  opacity?: number;
}

export interface BehaviorConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  loadingIndicator: boolean;
  errorHandling: ErrorDisplayMode;
  emptyStateMessage: string;
}

export enum ErrorDisplayMode {
  INLINE = "inline",
  OVERLAY = "overlay",
  NOTIFICATION = "notification",
  HIDDEN = "hidden"
}

export interface WidgetDataSource {
  type: DataSourceType;
  query: DataQuery;
  parameters: Record<string, JSONValue>;
  caching: CachingConfig;
  refreshTriggers: RefreshTrigger[];
}

export enum DataSourceType {
  API = "api",
  DATABASE = "database",
  FILE = "file",
  REAL_TIME = "real_time",
  COMPUTED = "computed"
}

export interface DataQuery {
  source: string;
  query: string;
  parameters: QueryParameter[];
  filters: QueryFilter[];
  aggregations: QueryAggregation[];
}

export interface QueryParameter {
  name: string;
  type: string;
  defaultValue?: JSONValue;
  required: boolean;
}

export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: JSONValue;
  condition: FilterCondition;
}

export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  CONTAINS = "contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  IN = "in",
  NOT_IN = "not_in",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null"
}

export enum FilterCondition {
  AND = "and",
  OR = "or"
}

export interface QueryAggregation {
  field: string;
  function: AggregationType;
  alias?: string;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  strategy: CachingStrategy;
  invalidationRules: InvalidationRule[];
}

export enum CachingStrategy {
  TIME_BASED = "time_based",
  EVENT_BASED = "event_based",
  MANUAL = "manual"
}

export interface InvalidationRule {
  trigger: string;
  condition: string;
  action: InvalidationAction;
}

export enum InvalidationAction {
  REFRESH = "refresh",
  CLEAR = "clear",
  MARK_STALE = "mark_stale"
}

export interface RefreshTrigger {
  type: TriggerType;
  condition: string;
  parameters: Record<string, JSONValue>;
}

export interface WidgetPermissions {
  view: string[];
  edit: string[];
  delete: string[];
  share: string[];
}

export interface DashboardFilter {
  id: UUID;
  name: string;
  type: FilterType;
  field: string;
  operator: FilterOperator;
  values: JSONValue[];
  defaultValue?: JSONValue;
  required: boolean;
  visible: boolean;
  position: FilterPosition;
}

export enum FilterType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  SELECT = "select",
  MULTI_SELECT = "multi_select",
  RANGE = "range",
  BOOLEAN = "boolean"
}

export interface FilterPosition {
  section: FilterSection;
  order: number;
}

export enum FilterSection {
  TOP = "top",
  SIDEBAR = "sidebar",
  INLINE = "inline"
}

export interface DashboardPermissions {
  view: string[];
  edit: string[];
  delete: string[];
  share: string[];
  export: string[];
  embed: string[];
}

export interface DashboardSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  timezone: string;
  defaultDateRange: DateRange;
  allowExport: boolean;
  allowEmbed: boolean;
  publicAccess: boolean;
  watermark: WatermarkConfig;
}

export interface DateRange {
  type: DateRangeType;
  value: string | DateRangeValue;
}

export enum DateRangeType {
  RELATIVE = "relative",
  ABSOLUTE = "absolute",
  CUSTOM = "custom"
}

export interface DateRangeValue {
  start: ISODateString;
  end: ISODateString;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  position: WatermarkPosition;
  opacity: number;
}

export enum WatermarkPosition {
  TOP_LEFT = "top_left",
  TOP_RIGHT = "top_right",
  BOTTOM_LEFT = "bottom_left",
  BOTTOM_RIGHT = "bottom_right",
  CENTER = "center"
}

export interface DashboardAnalytics {
  viewCount: number;
  uniqueViewers: number;
  averageViewDuration: number;
  mostViewedWidgets: WidgetAnalytics[];
  interactionMetrics: InteractionMetrics;
  performanceMetrics: DashboardPerformanceMetrics;
  lastAnalyticsUpdate: ISODateString;
}

export interface WidgetAnalytics {
  widgetId: UUID;
  viewCount: number;
  interactionCount: number;
  errorCount: number;
  averageLoadTime: number;
}

export interface InteractionMetrics {
  totalClicks: number;
  totalFilters: number;
  totalExports: number;
  totalShares: number;
  heatmapData: HeatmapPoint[];
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

export interface DashboardPerformanceMetrics {
  averageLoadTime: number;
  renderTime: number;
  dataLoadTime: number;
  errorRate: number;
  cacheHitRate: number;
}

// =============================================================================
// COLLABORATION TYPES
// =============================================================================

/**
 * Collaboration state - maps to RacineCollaboration backend model
 */
export interface CollaborationState {
  id: UUID;
  type: CollaborationType;
  resourceId: UUID;
  resourceType: string;
  participants: CollaborationParticipant[];
  sessions: CollaborationSession[];
  messages: CollaborationMessage[];
  activities: CollaborationActivity[];
  settings: CollaborationSettings;
  status: CollaborationStatus;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastActivity: ISODateString;
}

export enum CollaborationType {
  WORKSPACE = "workspace",
  WORKFLOW = "workflow",
  PIPELINE = "pipeline",
  DOCUMENT = "document",
  DASHBOARD = "dashboard",
  MEETING = "meeting"
}

export interface CollaborationParticipant {
  userId: UUID;
  role: CollaborationRole;
  permissions: CollaborationPermissions;
  status: ParticipantStatus;
  joinedAt: ISODateString;
  lastActivity: ISODateString;
  user: UserProfile;
}

export enum CollaborationRole {
  OWNER = "owner",
  MODERATOR = "moderator",
  CONTRIBUTOR = "contributor",
  VIEWER = "viewer"
}

export interface CollaborationPermissions {
  canEdit: boolean;
  canComment: boolean;
  canShare: boolean;
  canInvite: boolean;
  canRemove: boolean;
  canModerate: boolean;
}

export enum ParticipantStatus {
  ONLINE = "online",
  AWAY = "away",
  BUSY = "busy",
  OFFLINE = "offline"
}

export interface CollaborationSession {
  id: UUID;
  userId: UUID;
  startTime: ISODateString;
  endTime?: ISODateString;
  duration?: number;
  activities: SessionActivity[];
  cursor: CursorPosition;
  viewport: ViewportPosition;
  selections: Selection[];
}

export interface SessionActivity {
  type: string;
  timestamp: ISODateString;
  data: Record<string, JSONValue>;
}

export interface CursorPosition {
  x: number;
  y: number;
  element?: string;
}

export interface ViewportPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export interface Selection {
  type: string;
  start: Position;
  end: Position;
  content: string;
}

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface CollaborationMessage {
  id: UUID;
  senderId: UUID;
  type: CollaborationMessageType;
  content: string;
  metadata: MessageMetadata;
  timestamp: ISODateString;
  editedAt?: ISODateString;
  deletedAt?: ISODateString;
  reactions: MessageReaction[];
  replies: CollaborationMessage[];
  mentions: UUID[];
  attachments: MessageAttachment[];
}

export enum CollaborationMessageType {
  TEXT = "text",
  COMMENT = "comment",
  SUGGESTION = "suggestion",
  QUESTION = "question",
  ANNOUNCEMENT = "announcement",
  SYSTEM = "system"
}

export interface MessageMetadata {
  channel?: string;
  thread?: UUID;
  priority: MessagePriority;
  flags: string[];
  context: Record<string, JSONValue>;
}

export enum MessagePriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent"
}

export interface CollaborationActivity {
  id: UUID;
  userId: UUID;
  type: CollaborationActivityType;
  description: string;
  timestamp: ISODateString;
  metadata: Record<string, JSONValue>;
}

export enum CollaborationActivityType {
  JOINED = "joined",
  LEFT = "left",
  EDITED = "edited",
  COMMENTED = "commented",
  SHARED = "shared",
  INVITED = "invited",
  REMOVED = "removed",
  PROMOTED = "promoted",
  DEMOTED = "demoted"
}

export interface CollaborationSettings {
  visibility: CollaborationVisibility;
  allowComments: boolean;
  allowSuggestions: boolean;
  allowAnonymous: boolean;
  moderationRequired: boolean;
  notificationsEnabled: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  versionControl: boolean;
  retentionPolicy: RetentionPolicy;
}

export enum CollaborationVisibility {
  PRIVATE = "private",
  TEAM = "team",
  ORGANIZATION = "organization",
  PUBLIC = "public"
}

export enum CollaborationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
  LOCKED = "locked"
}

// =============================================================================
// INTEGRATION TYPES
// =============================================================================

/**
 * Integration configuration for external systems
 */
export interface IntegrationConfiguration {
  id: UUID;
  name: string;
  description: string;
  type: IntegrationType;
  provider: string;
  configuration: IntegrationSettings;
  credentials: CredentialReference;
  endpoints: IntegrationEndpoint[];
  status: IntegrationStatus;
  lastSync: ISODateString;
  syncInterval: number;
  createdBy: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export enum IntegrationType {
  API = "api",
  DATABASE = "database",
  FILE_SYSTEM = "file_system",
  MESSAGE_QUEUE = "message_queue",
  WEBHOOK = "webhook",
  STREAMING = "streaming"
}

export interface IntegrationSettings {
  authentication: AuthenticationConfig;
  connection: ConnectionConfig;
  mapping: MappingConfig;
  transformation: TransformationConfig;
  validation: ValidationConfig;
  errorHandling: ErrorHandlingConfig;
}

export interface AuthenticationConfig {
  type: AuthenticationType;
  parameters: Record<string, JSONValue>;
  tokenExpiry?: number;
  refreshEnabled?: boolean;
}

export enum AuthenticationType {
  API_KEY = "api_key",
  OAUTH2 = "oauth2",
  BASIC_AUTH = "basic_auth",
  JWT = "jwt",
  CERTIFICATE = "certificate"
}

export interface ConnectionConfig {
  host: string;
  port?: number;
  protocol: string;
  timeout: number;
  retryConfig: RetryConfig;
  pooling: PoolingConfig;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableStatus: number[];
}

export interface PoolingConfig {
  enabled: boolean;
  maxConnections: number;
  minConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
}

export interface MappingConfig {
  fieldMappings: FieldMapping[];
  transformations: FieldTransformation[];
  filters: MappingFilter[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType: string;
  required: boolean;
  defaultValue?: JSONValue;
}

export interface FieldTransformation {
  field: string;
  type: TransformationType;
  parameters: Record<string, JSONValue>;
}

export enum TransformationType {
  FORMAT = "format",
  CALCULATE = "calculate",
  LOOKUP = "lookup",
  AGGREGATE = "aggregate",
  FILTER = "filter",
  SPLIT = "split",
  MERGE = "merge"
}

export interface MappingFilter {
  field: string;
  operator: FilterOperator;
  value: JSONValue;
}

export interface TransformationConfig {
  rules: TransformationRule[];
  validation: boolean;
  errorHandling: TransformationErrorHandling;
}

export interface TransformationRule {
  name: string;
  condition: string;
  actions: TransformationAction[];
  order: number;
}

export interface TransformationAction {
  type: TransformationType;
  parameters: Record<string, JSONValue>;
  onError: TransformationErrorAction;
}

export enum TransformationErrorAction {
  SKIP = "skip",
  DEFAULT = "default",
  FAIL = "fail",
  LOG = "log"
}

export interface TransformationErrorHandling {
  onValidationError: TransformationErrorAction;
  onTransformationError: TransformationErrorAction;
  maxErrors: number;
  logErrors: boolean;
}

export interface ValidationConfig {
  rules: ValidationRule[];
  strictMode: boolean;
  onError: ValidationErrorAction;
}

export enum ValidationErrorAction {
  REJECT = "reject",
  WARN = "warn",
  IGNORE = "ignore"
}

export interface ErrorHandlingConfig {
  retryPolicy: RetryPolicy;
  fallbackAction: FallbackAction;
  alerting: AlertingConfig;
  logging: LoggingConfig;
}

export enum FallbackAction {
  SKIP = "skip",
  DEFAULT_VALUE = "default_value",
  PREVIOUS_VALUE = "previous_value",
  FAIL = "fail"
}

export interface AlertingConfig {
  enabled: boolean;
  thresholds: AlertThreshold[];
  channels: AlertChannel[];
}

export interface AlertThreshold {
  metric: string;
  operator: string;
  value: number;
  severity: AlertSeverity;
}

export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical"
}

export interface AlertChannel {
  type: string;
  configuration: Record<string, JSONValue>;
  enabled: boolean;
}

export interface LoggingConfig {
  level: LogLevel;
  destinations: LogDestination[];
  format: LogFormat;
  retention: number;
}

export interface LogDestination {
  type: string;
  configuration: Record<string, JSONValue>;
  filters: LogFilter[];
}

export interface LogFilter {
  field: string;
  operator: string;
  value: JSONValue;
}

export enum LogFormat {
  JSON = "json",
  TEXT = "text",
  STRUCTURED = "structured"
}

export interface CredentialReference {
  id: UUID;
  type: string;
  provider: string;
  encrypted: boolean;
}

export interface IntegrationEndpoint {
  id: UUID;
  name: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  parameters: Record<string, JSONValue>;
  responseMapping: MappingConfig;
  rateLimit: RateLimitConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  period: number;
  burst: number;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

// Re-export all types for easy importing
export type {
  // Core system types
  SystemHealth, GroupHealth, ServiceHealth, PerformanceMetrics,
  
  // Cross-group integration types  
  GroupConfiguration, Integration, SharedResource, CrossGroupWorkflow,
  
  // Workspace types
  WorkspaceConfiguration, WorkspaceMember, WorkspaceResource, WorkspaceSettings,
  
  // Workflow types
  WorkflowDefinition, WorkflowStep, WorkflowDependency, WorkflowExecution,
  
  // Pipeline types
  PipelineDefinition, PipelineStage, PipelineExecution,
  
  // AI types
  AIConversation, AIMessage, AIRecommendation, AIInsight,
  
  // User management types
  UserProfile, Role, Permission, UserSession,
  
  // Activity types
  ActivityRecord, AuditTrail,
  
  // Dashboard types
  DashboardState, DashboardWidget, DashboardFilter,
  
  // Collaboration types
  CollaborationState, CollaborationParticipant, CollaborationMessage,
  
  // Integration types
  IntegrationConfiguration, IntegrationSettings
};