/**
 * Racine Core Types - Master Type Definitions
 * ==========================================
 * 
 * This file contains the core TypeScript type definitions that map 100% to the backend
 * Racine models and API structures. These types ensure type safety and consistency
 * between frontend and backend implementations.
 * 
 * Backend Mapping:
 * - Maps to all racine_models/*.py structures
 * - Aligns with API route request/response models  
 * - Maintains consistency with backend service interfaces
 * 
 * Architecture:
 * - Comprehensive type coverage for all Racine features
 * - Strict TypeScript for maximum type safety
 * - Generic types for reusability
 * - Proper nullable and optional field handling
 */

// ========================================================================================
// Core Enums and Constants
// ========================================================================================

export enum ViewMode {
  DASHBOARD = 'dashboard',
  WORKSPACE = 'workspace', 
  WORKFLOWS = 'workflows',
  PIPELINES = 'pipelines',
  AI_ASSISTANT = 'ai_assistant',
  ACTIVITY = 'activity',
  COLLABORATION = 'collaboration',
  PROFILE = 'profile',
  SETTINGS = 'settings'
}

export enum LayoutMode {
  ADAPTIVE = 'adaptive',
  COMPACT = 'compact',
  EXPANDED = 'expanded',
  FULL_SCREEN = 'full_screen',
  SPLIT_VIEW = 'split_view',
  TABBED = 'tabbed'
}

export enum SystemHealth {
  HEALTHY = 'healthy',
  WARNING = 'warning', 
  CRITICAL = 'critical',
  UNKNOWN = 'unknown',
  MAINTENANCE = 'maintenance'
}

export enum GroupType {
  DATA_SOURCES = 'data_sources',
  SCAN_RULES = 'scan_rules',
  CLASSIFICATIONS = 'classifications',
  COMPLIANCE = 'compliance',
  CATALOG = 'catalog',
  SCAN_LOGIC = 'scan_logic',
  RBAC = 'rbac',
  RACINE_ORCHESTRATION = 'racine_orchestration',
  RACINE_WORKSPACE = 'racine_workspace',
  RACINE_WORKFLOW = 'racine_workflow',
  RACINE_PIPELINE = 'racine_pipeline',
  RACINE_AI = 'racine_ai',
  RACINE_COLLABORATION = 'racine_collaboration'
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
  RUNNING = 'running',
  SCHEDULED = 'scheduled'
}

// ========================================================================================
// Core State Interfaces
// ========================================================================================

export interface RacineState {
  isInitialized: boolean
  currentView: ViewMode
  activeWorkspaceId: string
  layoutMode: LayoutMode
  sidebarCollapsed: boolean
  loading: boolean
  error: string | null
  systemHealth: SystemHealth
  lastActivity: Date
  performanceMetrics: PerformanceMetrics
}

export interface CrossGroupState {
  connectedGroups: GroupConfiguration[]
  activeIntegrations: Integration[]
  sharedResources: SharedResource[]
  crossGroupWorkflows: CrossGroupWorkflow[]
  globalMetrics: Record<string, any>
  synchronizationStatus: SynchronizationStatus
  lastSync: Date
}

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  apiResponseTime: number
  networkLatency?: number
  cacheHitRate?: number
  errorRate?: number
}

// ========================================================================================
// User and Authentication Types
// ========================================================================================

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: Role[]
  permissions: Permission[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystemRole: boolean
  createdAt: Date
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  conditions?: Record<string, any>
}

// ========================================================================================
// Workspace Types (Maps to racine_workspace_models.py)
// ========================================================================================

export interface WorkspaceConfiguration {
  id: string
  name: string
  description: string
  workspaceType: 'personal' | 'team' | 'enterprise'
  ownerId: string
  members: WorkspaceMember[]
  groups: string[]
  resources: WorkspaceResource[]
  settings: WorkspaceSettings
  analytics: WorkspaceAnalytics
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  lastAccessed: Date
  status: Status
}

export interface WorkspaceMember {
  id: string
  userId: string
  userName: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  permissions: string[]
  joinedAt: Date
  lastActivity?: Date
  status: 'active' | 'pending' | 'suspended'
}

export interface WorkspaceResource {
  id: string
  resourceType: string
  resourceId: string
  groupType: GroupType
  name: string
  description?: string
  configuration: Record<string, any>
  accessLevel: 'read' | 'write' | 'admin'
  linkedAt: Date
  lastUsed?: Date
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: NotificationSettings
  privacy: PrivacySettings
  integration: IntegrationSettings
  customization: Record<string, any>
}

export interface WorkspaceAnalytics {
  totalActivities: number
  totalResources: number
  activeUsers: number
  usageMetrics: Record<string, number>
  performanceMetrics: PerformanceMetrics
  trends: Record<string, any>
  lastCalculated: Date
}

// ========================================================================================
// Orchestration Types (Maps to racine_orchestration_models.py)
// ========================================================================================

export interface OrchestrationMaster {
  id: string
  name: string
  description: string
  orchestrationType: string
  status: Status
  connectedGroups: string[]
  groupConfigurations: Record<string, any>
  crossGroupDependencies: Record<string, any>
  performanceMetrics: Record<string, any>
  healthStatus: SystemHealth
  lastHealthCheck: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface GroupConfiguration {
  groupType: GroupType
  groupId: string
  configuration: Record<string, any>
  status: Status
  lastSync: Date
  metrics: Record<string, any>
}

export interface Integration {
  id: string
  name: string
  sourceGroup: GroupType
  targetGroup: GroupType
  integrationType: string
  configuration: Record<string, any>
  status: Status
  lastSync: Date
  metrics: IntegrationMetrics
}

export interface IntegrationMetrics {
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  averageSyncTime: number
  lastSyncDuration: number
  dataTransferred: number
  errorRate: number
}

// ========================================================================================
// Workflow Types (Maps to racine_workflow_models.py)
// ========================================================================================

export interface JobWorkflow {
  id: string
  name: string
  description?: string
  workflowType: 'sequential' | 'parallel' | 'dag' | 'conditional'
  workspaceId: string
  status: Status
  configuration: Record<string, any>
  steps: WorkflowStep[]
  scheduleConfig?: ScheduleConfig
  notificationConfig: NotificationConfig
  tags: string[]
  version: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface WorkflowStep {
  id: string
  workflowId: string
  name: string
  stepType: string
  groupTarget: GroupType
  configuration: Record<string, any>
  dependencies: string[]
  timeoutSeconds?: number
  retryCount: number
  condition?: string
  order: number
  status: Status
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: Status
  executionMode: 'normal' | 'debug' | 'dry_run' | 'test'
  priority: number
  startedAt?: Date
  completedAt?: Date
  progressPercentage: number
  currentStep?: string
  executionLog: ExecutionLogEntry[]
  metrics: ExecutionMetrics
  executedBy: string
}

export interface ExecutionLogEntry {
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  stepId?: string
  details?: Record<string, any>
}

export interface ExecutionMetrics {
  totalSteps: number
  completedSteps: number
  failedSteps: number
  skippedSteps: number
  totalDuration?: number
  averageStepDuration: number
  resourceUsage: Record<string, any>
}

// ========================================================================================
// Pipeline Types (Maps to racine_pipeline_models.py)  
// ========================================================================================

export interface Pipeline {
  id: string
  name: string
  description?: string
  pipelineType: 'data_processing' | 'data_quality' | 'compliance_check' | 'classification_pipeline' | 'catalog_sync' | 'custom'
  workspaceId: string
  status: Status
  configuration: Record<string, any>
  nodes: PipelineNode[]
  version: number
  aiOptimizationEnabled: boolean
  scheduleConfig?: ScheduleConfig
  notificationConfig: NotificationConfig
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface PipelineNode {
  id: string
  pipelineId: string
  name: string
  nodeType: string
  groupTarget: GroupType
  configuration: Record<string, any>
  inputConnections: string[]
  outputConnections: string[]
  position: NodePosition
  timeoutSeconds?: number
  retryPolicy: RetryPolicy
  condition?: string
  status: Status
}

export interface NodePosition {
  x: number
  y: number
  width?: number
  height?: number
}

export interface RetryPolicy {
  maxRetries: number
  backoffStrategy: 'linear' | 'exponential' | 'fixed'
  baseDelay: number
  maxDelay: number
  retryConditions: string[]
}

export interface PipelineExecution {
  id: string
  pipelineId: string
  status: Status
  executionMode: 'normal' | 'debug' | 'dry_run' | 'test' | 'validation'
  priority: number
  startedAt?: Date
  completedAt?: Date
  progressPercentage: number
  currentNode?: string
  executionLog: ExecutionLogEntry[]
  metrics: ExecutionMetrics
  checkpointData?: Record<string, any>
  executedBy: string
}

// ========================================================================================
// AI Assistant Types (Maps to racine_ai_models.py)
// ========================================================================================

export interface AIConversation {
  id: string
  conversationType: 'general' | 'workflow_assistance' | 'data_exploration' | 'compliance_help' | 'optimization_advice' | 'troubleshooting' | 'analytics_insights' | 'knowledge_query'
  status: 'active' | 'completed' | 'archived'
  context: Record<string, any>
  messages: AIMessage[]
  workspaceId?: string
  userId: string
  startedAt: Date
  lastActivity: Date
}

export interface AIMessage {
  id: string
  conversationId: string
  sender: 'user' | 'ai_assistant'
  message: string
  messageType: 'text' | 'query' | 'command' | 'file_upload' | 'code_snippet'
  attachments?: AIAttachment[]
  metadata: Record<string, any>
  createdAt: Date
}

export interface AIAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  url?: string
  content?: string
  metadata: Record<string, any>
}

export interface AIRecommendation {
  id: string
  recommendationType: 'workflow_optimization' | 'data_quality_improvement' | 'compliance_enhancement' | 'performance_tuning' | 'resource_optimization' | 'security_improvements' | 'automation_opportunities' | 'best_practices'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  impactScore: number
  implementationEffort: 'low' | 'medium' | 'high'
  benefits: string[]
  actions: AIAction[]
  userId: string
  createdAt: Date
}

export interface AIAction {
  id: string
  actionType: string
  description: string
  parameters: Record<string, any>
  estimatedDuration: number
  dependencies: string[]
}

// ========================================================================================
// Activity Tracking Types (Maps to racine_activity_models.py)
// ========================================================================================

export interface ActivityLog {
  id: string
  timestamp: Date
  userId: string
  userName: string
  group: GroupType
  activityType: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'configure' | 'authenticate' | 'authorize' | 'scan' | 'classify' | 'validate' | 'sync' | 'backup' | 'restore' | 'monitor' | 'alert' | 'optimize'
  resourceType: string
  resourceId: string
  resourceName?: string
  action: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  workspaceId?: string
  success: boolean
  errorMessage?: string
  durationMs?: number
  metadata: Record<string, any>
}

export interface ActivitySession {
  id: string
  userId: string
  userName: string
  workspaceId?: string
  startTime: Date
  endTime?: Date
  durationMinutes?: number
  totalActivities: number
  uniqueResources: number
  groupsAccessed: GroupType[]
  sessionSummary: Record<string, any>
  isActive: boolean
}

export interface ActivityMetrics {
  id: string
  metricType: string
  timePeriod: string
  totalActivities: number
  uniqueUsers: number
  uniqueResources: number
  successRate: number
  averageDuration: number
  peakActivityTime: Date
  groupBreakdown: Record<string, number>
  activityTypeBreakdown: Record<string, number>
  trends: Record<string, any>
  generatedAt: Date
}

// ========================================================================================
// Dashboard Types (Maps to racine_dashboard_models.py)
// ========================================================================================

export interface Dashboard {
  id: string
  name: string
  description?: string
  dashboardType: 'personal' | 'team' | 'global' | 'executive' | 'operational'
  workspaceId?: string
  configuration: DashboardConfiguration
  widgets: DashboardWidget[]
  layout: DashboardLayout
  permissions: DashboardPermission[]
  isPublic: boolean
  tags: string[]
  version: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface DashboardWidget {
  id: string
  dashboardId: string
  widgetType: 'metric' | 'chart' | 'table' | 'map' | 'text' | 'iframe' | 'custom'
  title: string
  description?: string
  dataSource: WidgetDataSource
  configuration: Record<string, any>
  position: WidgetPosition
  refreshInterval: number
  isVisible: boolean
  createdAt: Date
}

export interface WidgetDataSource {
  sourceType: 'api' | 'database' | 'file' | 'realtime' | 'computed'
  source: string
  query?: string
  parameters: Record<string, any>
  filters: WidgetFilter[]
}

export interface WidgetFilter {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in'
  value: any
  isRequired: boolean
}

export interface WidgetPosition {
  x: number
  y: number
  width: number
  height: number
  zIndex?: number
}

export interface DashboardLayout {
  type: 'grid' | 'flex' | 'absolute' | 'masonry'
  columns: number
  rowHeight: number
  margin: [number, number]
  padding: [number, number]
  isDraggable: boolean
  isResizable: boolean
}

export interface DashboardConfiguration {
  theme: 'light' | 'dark' | 'auto'
  autoRefresh: boolean
  refreshInterval: number
  timezone: string
  dateFormat: string
  numberFormat: string
  showExportOptions: boolean
  enableCollaboration: boolean
  customCss?: string
}

export interface DashboardPermission {
  userId?: string
  roleId?: string
  permission: 'view' | 'edit' | 'admin'
  grantedBy: string
  grantedAt: Date
}

// ========================================================================================
// Collaboration Types (Maps to racine_collaboration_models.py)
// ========================================================================================

export interface CollaborationSession {
  id: string
  sessionType: 'document_editing' | 'workflow_design' | 'data_analysis' | 'expert_consultation' | 'team_meeting' | 'knowledge_sharing'
  title: string
  description?: string
  workspaceId?: string
  participants: CollaborationParticipant[]
  resources: CollaborationResource[]
  status: 'active' | 'paused' | 'completed' | 'archived'
  configuration: CollaborationConfiguration
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface CollaborationParticipant {
  id: string
  sessionId: string
  userId: string
  userName: string
  email: string
  role: 'host' | 'moderator' | 'participant' | 'observer'
  permissions: string[]
  joinedAt: Date
  lastActivity?: Date
  status: 'online' | 'offline' | 'away' | 'busy'
  cursor?: CursorPosition
}

export interface CursorPosition {
  x: number
  y: number
  elementId?: string
  timestamp: Date
}

export interface CollaborationResource {
  id: string
  sessionId: string
  resourceType: string
  resourceId: string
  name: string
  permissions: string[]
  lockStatus?: ResourceLock
  version: number
  lastModified: Date
}

export interface ResourceLock {
  lockedBy: string
  lockedAt: Date
  lockType: 'exclusive' | 'shared'
  expiresAt?: Date
}

export interface CollaborationConfiguration {
  allowAnonymous: boolean
  maxParticipants: number
  requireApproval: boolean
  enableChat: boolean
  enableVoice: boolean
  enableVideo: boolean
  enableScreenShare: boolean
  enableWhiteboard: boolean
  recordSession: boolean
  autoSave: boolean
  versionControl: boolean
}

export interface CollaborationMessage {
  id: string
  sessionId: string
  senderId: string
  senderName: string
  messageType: 'text' | 'file' | 'image' | 'code' | 'system'
  content: string
  attachments?: CollaborationAttachment[]
  replyToId?: string
  mentions: string[]
  reactions: CollaborationReaction[]
  createdAt: Date
}

export interface CollaborationAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  thumbnail?: string
  metadata: Record<string, any>
}

export interface CollaborationReaction {
  emoji: string
  userId: string
  userName: string
  createdAt: Date
}

// ========================================================================================
// Integration Types (Maps to racine_integration_models.py)
// ========================================================================================

export interface IntegrationEndpoint {
  id: string
  name: string
  endpointType: 'rest_api' | 'graphql' | 'webhook' | 'database' | 'message_queue' | 'file_system' | 'cloud_storage' | 'event_stream' | 'custom'
  url?: string
  status: Status
  configuration: Record<string, any>
  authentication: AuthenticationConfig
  headers: Record<string, string>
  timeoutSeconds: number
  retryConfig: RetryConfiguration
  isActive: boolean
  lastHealthCheck?: Date
  healthStatus: SystemHealth
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface AuthenticationConfig {
  type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2' | 'custom'
  credentials: Record<string, any>
  tokenEndpoint?: string
  refreshToken?: string
  expiresAt?: Date
}

export interface RetryConfiguration {
  maxRetries: number
  backoffStrategy: 'linear' | 'exponential' | 'fixed'
  baseDelay: number
  maxDelay: number
  retryConditions: string[]
}

export interface IntegrationJob {
  id: string
  jobName: string
  jobType: 'data_sync' | 'event_stream' | 'batch_transfer' | 'real_time_sync' | 'validation_check' | 'health_monitor' | 'custom'
  sourceEndpointId: string
  targetEndpointId: string
  mappingId?: string
  status: Status
  scheduleConfig?: ScheduleConfig
  executionConfig: Record<string, any>
  notificationConfig: NotificationConfig
  lastExecution?: Date
  nextExecution?: Date
  successRate: number
  totalExecutions: number
  createdAt: Date
  createdBy: string
}

export interface SyncJob {
  id: string
  syncType: 'metadata_sync' | 'configuration_sync' | 'data_sync' | 'schema_sync' | 'permissions_sync' | 'full_sync'
  sourceGroups: GroupType[]
  targetGroups: GroupType[]
  status: Status
  syncMode: 'full' | 'incremental' | 'differential' | 'snapshot'
  conflictResolution: 'latest_wins' | 'manual_resolve' | 'source_priority' | 'target_priority'
  progressPercentage: number
  recordsProcessed: number
  recordsFailed: number
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
  initiatedBy: string
}

// ========================================================================================
// Shared Utility Types
// ========================================================================================

export interface SharedResource {
  id: string
  name: string
  resourceType: string
  sourceGroup: GroupType
  targetGroups: GroupType[]
  configuration: Record<string, any>
  permissions: ResourcePermission[]
  sharedAt: Date
  sharedBy: string
  lastAccessed?: Date
}

export interface ResourcePermission {
  userId?: string
  roleId?: string
  permission: 'read' | 'write' | 'admin'
  conditions?: Record<string, any>
  grantedBy: string
  grantedAt: Date
  expiresAt?: Date
}

export interface CrossGroupWorkflow {
  id: string
  name: string
  description?: string
  involvedGroups: GroupType[]
  orchestrationPlan: OrchestrationStep[]
  status: Status
  executionHistory: CrossGroupExecution[]
  createdAt: Date
  createdBy: string
}

export interface OrchestrationStep {
  id: string
  stepName: string
  group: GroupType
  action: string
  parameters: Record<string, any>
  dependencies: string[]
  timeoutSeconds: number
  order: number
}

export interface CrossGroupExecution {
  id: string
  workflowId: string
  status: Status
  startedAt: Date
  completedAt?: Date
  steps: StepExecution[]
  metrics: ExecutionMetrics
  executedBy: string
}

export interface StepExecution {
  stepId: string
  status: Status
  startedAt: Date
  completedAt?: Date
  result?: Record<string, any>
  errorMessage?: string
  retryCount: number
}

export interface SynchronizationStatus {
  overall: 'synchronized' | 'syncing' | 'out_of_sync' | 'error'
  groupStatuses: Record<GroupType, SyncStatus>
  lastFullSync: Date
  nextScheduledSync?: Date
  syncInProgress: boolean
  pendingChanges: number
}

export interface SyncStatus {
  status: 'synchronized' | 'syncing' | 'out_of_sync' | 'error'
  lastSync: Date
  pendingChanges: number
  errorMessage?: string
}

export interface ScheduleConfig {
  scheduleType: 'cron' | 'interval' | 'event_driven' | 'manual'
  cronExpression?: string
  intervalSeconds?: number
  startTime?: Date
  endTime?: Date
  timezone: string
  isActive: boolean
  executionParameters: Record<string, any>
}

export interface NotificationConfig {
  enableNotifications: boolean
  channels: NotificationChannel[]
  events: NotificationEvent[]
  recipients: NotificationRecipient[]
  templates: Record<string, string>
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms' | 'push'
  configuration: Record<string, any>
  isActive: boolean
}

export interface NotificationEvent {
  event: string
  condition?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  template: string
}

export interface NotificationRecipient {
  type: 'user' | 'role' | 'group' | 'external'
  identifier: string
  channels: string[]
}

export interface NotificationSettings {
  enableDesktop: boolean
  enableEmail: boolean
  enableMobile: boolean
  enableInApp: boolean
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  quietHours: TimeRange
  categories: Record<string, boolean>
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private'
  activityTracking: boolean
  dataSharing: boolean
  analyticsOptOut: boolean
  exportDataAllowed: boolean
}

export interface IntegrationSettings {
  autoSync: boolean
  syncInterval: number
  conflictResolution: 'manual' | 'auto'
  enableWebhooks: boolean
  webhookSecret?: string
  apiRateLimit: number
}

export interface TimeRange {
  start: string // HH:MM format
  end: string   // HH:MM format
  timezone: string
}

// ========================================================================================
// API Response Types
// ========================================================================================

export interface StandardResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
  meta?: ResponseMeta
}

export interface ResponseMeta {
  total?: number
  page?: number
  limit?: number
  hasMore?: boolean
  timestamp: Date
  requestId: string
}

export interface PaginatedResponse<T = any> extends StandardResponse<T[]> {
  meta: ResponseMeta & {
    total: number
    page: number
    limit: number
    hasMore: boolean
    totalPages: number
  }
}

export interface ErrorResponse {
  success: false
  message: string
  errors: string[]
  errorCode?: string
  details?: Record<string, any>
  timestamp: Date
  requestId: string
}

// ========================================================================================
// WebSocket Message Types
// ========================================================================================

export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: Date
  requestId?: string
  userId?: string
  sessionId?: string
}

export interface RealTimeUpdate {
  type: 'status_change' | 'data_update' | 'user_action' | 'system_event' | 'error'
  resource: string
  resourceId: string
  changes: Record<string, any>
  userId?: string
  timestamp: Date
}

// ========================================================================================
// Form and Validation Types
// ========================================================================================

export interface FormField<T = any> {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'datetime' | 'file' | 'json'
  value: T
  required: boolean
  disabled: boolean
  readonly: boolean
  placeholder?: string
  description?: string
  validation: ValidationRule[]
  options?: SelectOption[]
  dependencies?: string[]
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom'
  value?: any
  message: string
  validator?: (value: any) => boolean | Promise<boolean>
}

export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  group?: string
  icon?: string
}

export interface FormError {
  field: string
  message: string
  type: string
}

// ========================================================================================
// Export all types for easy importing
// ========================================================================================

export type {
  // Core types can be imported individually or as a group
  RacineState,
  CrossGroupState,
  PerformanceMetrics,
  User,
  Role, 
  Permission,
  WorkspaceConfiguration,
  OrchestrationMaster,
  JobWorkflow,
  Pipeline,
  AIConversation,
  ActivityLog,
  Dashboard,
  CollaborationSession,
  IntegrationEndpoint,
  StandardResponse,
  PaginatedResponse,
  WebSocketMessage,
  FormField
}

// Default export for convenience
export default {
  ViewMode,
  LayoutMode,
  SystemHealth,
  GroupType,
  Status
}