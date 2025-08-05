// ============================================================================
// RACINE MAIN MANAGER - CORE TYPE DEFINITIONS
// ============================================================================

/**
 * Core type definitions for the Racine Main Manager SPA
 * Supports all 7 groups with enterprise-grade orchestration
 */

// ============================================================================
// BASIC TYPES AND ENUMS
// ============================================================================

export type ViewMode = 'dashboard' | 'workflows' | 'pipelines' | 'activity' | 'collaboration' | 'profile' | 'settings'
export type LayoutMode = 'unified' | 'split' | 'tabbed' | 'modal' | 'fullscreen'
export type SystemHealth = 'healthy' | 'warning' | 'critical' | 'maintenance'
export type SynchronizationStatus = 'synced' | 'syncing' | 'error' | 'offline'
export type CollaborationStatus = 'available' | 'busy' | 'away' | 'offline'
export type ActivityType = 'navigation' | 'workflow' | 'pipeline' | 'collaboration' | 'system' | 'security'
export type NotificationLevel = 'info' | 'success' | 'warning' | 'error' | 'critical'
export type WorkflowStatus = 'draft' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
export type PipelineStatus = 'idle' | 'running' | 'success' | 'failed' | 'warning'

// ============================================================================
// GROUP CONFIGURATIONS
// ============================================================================

export interface GroupConfiguration {
  id: string
  name: string
  displayName: string
  description: string
  version: string
  status: 'active' | 'inactive' | 'maintenance'
  capabilities: string[]
  endpoints: GroupEndpoints
  permissions: string[]
  metadata: Record<string, any>
  lastSync: Date
  healthStatus: SystemHealth
}

export interface GroupEndpoints {
  base: string
  health: string
  metrics: string
  operations: string
  websocket?: string
}

export interface SupportedGroup {
  DATA_SOURCES: GroupConfiguration
  SCAN_RULE_SETS: GroupConfiguration
  CLASSIFICATIONS: GroupConfiguration
  COMPLIANCE_RULES: GroupConfiguration
  ADVANCED_CATALOG: GroupConfiguration
  SCAN_LOGIC: GroupConfiguration
  RBAC_SYSTEM: GroupConfiguration
}

// ============================================================================
// RBAC AND PERMISSIONS
// ============================================================================

export interface RBACPermissions {
  groups: Record<string, GroupPermissions>
  global: GlobalPermissions
  workspaces: Record<string, WorkspacePermissions>
  features: FeaturePermissions
}

export interface GroupPermissions {
  read: boolean
  write: boolean
  execute: boolean
  admin: boolean
  collaborate: boolean
  export: boolean
}

export interface GlobalPermissions {
  systemAdmin: boolean
  crossGroupOrchestration: boolean
  workspaceManagement: boolean
  userManagement: boolean
  securityAudit: boolean
  systemMonitoring: boolean
}

export interface WorkspacePermissions {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
  share: boolean
  manage: boolean
}

export interface FeaturePermissions {
  aiAssistant: boolean
  advancedAnalytics: boolean
  realTimeCollaboration: boolean
  customDashboards: boolean
  apiAccess: boolean
  exportData: boolean
}

// ============================================================================
// USER CONTEXT AND PREFERENCES
// ============================================================================

export interface UserContext {
  userId: string
  userRole: string
  permissions: RBACPermissions
  preferences: UserPreferences
  workspaces: WorkspaceInfo[]
  recentActivity: ActivityRecord[]
  collaborationStatus: CollaborationStatus
  profile?: UserProfile
  settings?: UserSettings
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: boolean
  layout: string
  accessibility?: AccessibilitySettings
  dashboard?: DashboardPreferences
}

export interface UserProfile {
  displayName: string
  email: string
  avatar?: string
  department?: string
  title?: string
  location?: string
  bio?: string
  skills?: string[]
  certifications?: string[]
}

export interface UserSettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  apiKeysEnabled: boolean
  auditLogRetention: number
  notificationChannels: NotificationChannel[]
  privacySettings: PrivacySettings
}

export interface AccessibilitySettings {
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large' | 'xl'
  screenReader: boolean
  keyboardNavigation: boolean
  reducedMotion: boolean
}

export interface DashboardPreferences {
  defaultView: ViewMode
  widgetLayout: WidgetLayout[]
  refreshInterval: number
  autoRefresh: boolean
  showMetrics: boolean
  compactMode: boolean
}

// ============================================================================
// NAVIGATION AND LAYOUT
// ============================================================================

export interface NavigationContext {
  currentPath: string
  breadcrumbs: Breadcrumb[]
  activeGroup: string | null
  searchQuery: string
  filters: Record<string, any>
  viewHistory: string[]
  bookmarks: Bookmark[]
  quickActions?: QuickAction[]
}

export interface Breadcrumb {
  label: string
  path: string
  icon?: string
  metadata?: Record<string, any>
}

export interface Bookmark {
  id: string
  label: string
  path: string
  icon?: string
  category?: string
  isShared: boolean
  createdAt: Date
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: () => void
  shortcut?: string
  category: string
  permissions?: string[]
}

export interface LayoutConfiguration {
  mode: LayoutMode
  sidebarCollapsed: boolean
  theme: string
  responsive: boolean
  animations: boolean
  accessibility: boolean
  customCss?: string
  widgets?: WidgetConfiguration[]
}

export interface WidgetConfiguration {
  id: string
  type: string
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, any>
  permissions: string[]
}

export interface WidgetLayout {
  id: string
  name: string
  widgets: WidgetConfiguration[]
  isDefault: boolean
  isShared: boolean
}

// ============================================================================
// WORKSPACE MANAGEMENT
// ============================================================================

export interface WorkspaceConfiguration {
  id: string
  name: string
  description: string
  type: 'personal' | 'team' | 'enterprise'
  owner: string
  members: WorkspaceMember[]
  groups: string[]
  resources: WorkspaceResource[]
  settings: WorkspaceSettings
  analytics: WorkspaceAnalytics
  createdAt: Date
  updatedAt: Date
  lastAccessed: Date
}

export interface WorkspaceMember {
  userId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: WorkspacePermissions
  joinedAt: Date
  lastActive: Date
}

export interface WorkspaceResource {
  id: string
  type: string
  groupId: string
  name: string
  path: string
  metadata: Record<string, any>
  permissions: string[]
  sharedWith: string[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkspaceSettings {
  isPublic: boolean
  allowInvites: boolean
  requireApproval: boolean
  retentionPolicy: number
  backupEnabled: boolean
  encryptionEnabled: boolean
  auditEnabled: boolean
  integrations: IntegrationConfig[]
}

export interface WorkspaceAnalytics {
  usage: UsageMetrics
  performance: PerformanceMetrics
  collaboration: CollaborationMetrics
  costs: CostMetrics
}

export interface WorkspaceInfo {
  id: string
  name: string
  type: string
  role: string
  lastAccessed: Date
  isActive: boolean
}

// ============================================================================
// CROSS-GROUP INTEGRATION
// ============================================================================

export interface CrossGroupState {
  connectedGroups: GroupConfiguration[]
  activeIntegrations: Integration[]
  sharedResources: SharedResource[]
  crossGroupWorkflows: CrossGroupWorkflow[]
  globalMetrics: Record<string, any>
  synchronizationStatus: SynchronizationStatus
  lastSync: Date
  conflicts?: IntegrationConflict[]
}

export interface Integration {
  id: string
  name: string
  sourceGroup: string
  targetGroup: string
  type: 'data' | 'workflow' | 'event' | 'api'
  status: 'active' | 'inactive' | 'error'
  config: IntegrationConfig
  metrics: IntegrationMetrics
  createdAt: Date
  lastSync: Date
}

export interface IntegrationConfig {
  endpoints: Record<string, string>
  authentication: AuthenticationConfig
  dataMapping: DataMapping[]
  eventTriggers: EventTrigger[]
  retryPolicy: RetryPolicy
  rateLimit: RateLimit
}

export interface SharedResource {
  id: string
  name: string
  type: string
  sourceGroup: string
  sharedWith: string[]
  permissions: string[]
  metadata: Record<string, any>
  lastModified: Date
  version: string
}

export interface CrossGroupWorkflow {
  id: string
  name: string
  description: string
  groups: string[]
  steps: WorkflowStep[]
  status: WorkflowStatus
  triggers: WorkflowTrigger[]
  schedule?: WorkflowSchedule
  metrics: WorkflowMetrics
  createdAt: Date
  updatedAt: Date
}

export interface IntegrationConflict {
  id: string
  type: string
  description: string
  groups: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolution?: string
  createdAt: Date
}

// ============================================================================
// WORKFLOW AND PIPELINE MANAGEMENT
// ============================================================================

export interface WorkflowStep {
  id: string
  name: string
  type: string
  groupId: string
  serviceId: string
  operation: string
  parameters: Record<string, any>
  dependencies: string[]
  conditions: WorkflowCondition[]
  retryPolicy: RetryPolicy
  timeout: number
  onSuccess?: WorkflowAction[]
  onFailure?: WorkflowAction[]
}

export interface WorkflowCondition {
  field: string
  operator: string
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface WorkflowAction {
  type: string
  target: string
  parameters: Record<string, any>
}

export interface WorkflowTrigger {
  id: string
  type: 'manual' | 'scheduled' | 'event' | 'webhook'
  config: Record<string, any>
  isActive: boolean
}

export interface WorkflowSchedule {
  type: 'cron' | 'interval' | 'once'
  expression: string
  timezone: string
  isActive: boolean
  nextRun?: Date
}

export interface WorkflowMetrics {
  totalRuns: number
  successRate: number
  averageDuration: number
  lastRun?: Date
  lastStatus?: WorkflowStatus
  errorCount: number
  performance: PerformanceMetrics
}

export interface Pipeline {
  id: string
  name: string
  description: string
  type: string
  groups: string[]
  stages: PipelineStage[]
  status: PipelineStatus
  config: PipelineConfig
  metrics: PipelineMetrics
  createdAt: Date
  updatedAt: Date
}

export interface PipelineStage {
  id: string
  name: string
  type: string
  groupId: string
  operations: PipelineOperation[]
  dependencies: string[]
  parallelExecution: boolean
  continueOnError: boolean
}

export interface PipelineOperation {
  id: string
  name: string
  type: string
  serviceId: string
  parameters: Record<string, any>
  validation: ValidationRule[]
  monitoring: MonitoringConfig
}

export interface PipelineConfig {
  maxParallelStages: number
  timeout: number
  retryPolicy: RetryPolicy
  notifications: NotificationConfig[]
  logging: LoggingConfig
  security: SecurityConfig
}

export interface PipelineMetrics {
  totalExecutions: number
  successRate: number
  averageDuration: number
  throughput: number
  errorRate: number
  performance: PerformanceMetrics
}

// ============================================================================
// AI ASSISTANT AND INTELLIGENCE
// ============================================================================

export interface AIAssistantState {
  isActive: boolean
  currentContext: AIContext
  conversationHistory: AIConversation[]
  capabilities: AICapability[]
  learningData: LearningData
  recommendations: AIRecommendation[]
  insights: AIInsight[]
  models: AIModel[]
}

export interface AIContext {
  userId: string
  workspaceId: string
  currentView: ViewMode
  activeGroups: string[]
  recentActivity: ActivityRecord[]
  userPreferences: UserPreferences
  systemState: Record<string, any>
}

export interface AIConversation {
  id: string
  userId: string
  messages: AIMessage[]
  context: AIContext
  startTime: Date
  endTime?: Date
  satisfaction?: number
}

export interface AIMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
  attachments?: AIAttachment[]
}

export interface AICapability {
  id: string
  name: string
  description: string
  category: string
  isEnabled: boolean
  permissions: string[]
  config: Record<string, any>
}

export interface AIRecommendation {
  id: string
  type: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  actions: RecommendedAction[]
  confidence: number
  createdAt: Date
  expiresAt?: Date
}

export interface AIInsight {
  id: string
  type: string
  title: string
  description: string
  data: Record<string, any>
  visualizations: VisualizationConfig[]
  confidence: number
  createdAt: Date
}

export interface AIModel {
  id: string
  name: string
  type: string
  version: string
  status: 'active' | 'training' | 'inactive'
  accuracy: number
  lastTrained: Date
  config: ModelConfig
}

// ============================================================================
// ACTIVITY TRACKING AND ANALYTICS
// ============================================================================

export interface ActivityState {
  recentActivities: ActivityRecord[]
  activityFeed: ActivityFeed
  patterns: ActivityPattern[]
  analytics: ActivityAnalytics
  auditTrail: AuditRecord[]
  filters: ActivityFilter[]
  isTracking: boolean
}

export interface ActivityRecord {
  id: string
  userId: string
  type: ActivityType
  action: string
  target: string
  metadata: Record<string, any>
  timestamp: Date
  duration?: number
  outcome: 'success' | 'failure' | 'partial'
  ipAddress?: string
  userAgent?: string
}

export interface ActivityFeed {
  items: ActivityFeedItem[]
  hasMore: boolean
  lastUpdate: Date
  filters: ActivityFilter[]
  grouping: 'none' | 'time' | 'user' | 'type'
}

export interface ActivityFeedItem {
  id: string
  type: string
  title: string
  description: string
  icon: string
  timestamp: Date
  user: UserInfo
  metadata: Record<string, any>
  actions?: ActivityAction[]
}

export interface ActivityPattern {
  id: string
  type: string
  description: string
  frequency: number
  confidence: number
  users: string[]
  timeRange: DateRange
  recommendations: string[]
}

export interface ActivityAnalytics {
  totalActivities: number
  uniqueUsers: number
  topActions: ActionStats[]
  timeDistribution: TimeDistribution[]
  userEngagement: UserEngagement[]
  trends: ActivityTrend[]
}

export interface AuditRecord {
  id: string
  userId: string
  action: string
  resource: string
  outcome: 'success' | 'failure'
  timestamp: Date
  ipAddress: string
  userAgent: string
  details: Record<string, any>
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

// ============================================================================
// DASHBOARD AND VISUALIZATION
// ============================================================================

export interface DashboardState {
  dashboards: Dashboard[]
  activeDashboard: string
  widgets: Widget[]
  metrics: DashboardMetrics
  insights: DashboardInsight[]
  alerts: DashboardAlert[]
  isLoading: boolean
  lastRefresh: Date
}

export interface Dashboard {
  id: string
  name: string
  description: string
  type: 'executive' | 'operational' | 'analytical' | 'custom'
  owner: string
  isShared: boolean
  layout: DashboardLayout
  widgets: string[]
  filters: DashboardFilter[]
  permissions: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Widget {
  id: string
  type: string
  title: string
  description: string
  dataSource: DataSourceConfig
  visualization: VisualizationConfig
  position: WidgetPosition
  config: WidgetConfig
  permissions: string[]
  lastUpdate: Date
}

export interface DashboardLayout {
  type: 'grid' | 'flexible' | 'fixed'
  columns: number
  rowHeight: number
  margin: [number, number]
  padding: [number, number]
  responsive: boolean
}

export interface DashboardMetrics {
  totalDashboards: number
  totalWidgets: number
  activeUsers: number
  viewCount: number
  averageLoadTime: number
  errorRate: number
}

export interface DashboardInsight {
  id: string
  type: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  recommendations: string[]
  data: Record<string, any>
  createdAt: Date
}

export interface DashboardAlert {
  id: string
  type: string
  title: string
  message: string
  level: NotificationLevel
  isRead: boolean
  actions: AlertAction[]
  createdAt: Date
  expiresAt?: Date
}

// ============================================================================
// COLLABORATION AND COMMUNICATION
// ============================================================================

export interface CollaborationState {
  activeCollaborations: Collaboration[]
  sharedResources: SharedResource[]
  teamMembers: TeamMember[]
  communicationChannels: CommunicationChannel[]
  recentActivity: CollaborationActivity[]
  notifications: CollaborationNotification[]
  presence: PresenceInfo[]
}

export interface Collaboration {
  id: string
  type: 'document' | 'workflow' | 'dashboard' | 'project'
  resourceId: string
  participants: Participant[]
  status: 'active' | 'paused' | 'completed'
  startTime: Date
  endTime?: Date
  metadata: Record<string, any>
}

export interface Participant {
  userId: string
  role: 'owner' | 'editor' | 'viewer' | 'commenter'
  joinedAt: Date
  lastActive: Date
  cursor?: CursorPosition
  selections?: Selection[]
}

export interface TeamMember {
  userId: string
  displayName: string
  email: string
  role: string
  avatar?: string
  status: CollaborationStatus
  lastSeen: Date
  permissions: string[]
}

export interface CommunicationChannel {
  id: string
  name: string
  type: 'chat' | 'video' | 'voice' | 'thread'
  participants: string[]
  isActive: boolean
  metadata: Record<string, any>
}

export interface CollaborationActivity {
  id: string
  type: string
  userId: string
  resourceId: string
  action: string
  timestamp: Date
  metadata: Record<string, any>
}

export interface CollaborationNotification {
  id: string
  type: string
  title: string
  message: string
  fromUser: string
  toUser: string
  resourceId?: string
  isRead: boolean
  createdAt: Date
}

export interface PresenceInfo {
  userId: string
  status: CollaborationStatus
  location: string
  lastUpdate: Date
  metadata?: Record<string, any>
}

// ============================================================================
// MAIN STATE INTERFACES
// ============================================================================

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
  notifications?: NotificationState
  theme?: ThemeState
}

export interface SystemState {
  health: SystemHealth
  version: string
  uptime: number
  resources: ResourceUsage
  services: ServiceStatus[]
  metrics: SystemMetrics
  alerts: SystemAlert[]
  maintenance: MaintenanceInfo
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface PerformanceMetrics {
  loadTime: number
  memoryUsage: number
  apiLatency: number
  renderTime: number
  networkLatency?: number
  cacheHitRate?: number
  errorRate?: number
}

export interface UsageMetrics {
  activeUsers: number
  totalSessions: number
  averageSessionDuration: number
  pageViews: number
  featureUsage: Record<string, number>
  apiCalls: number
}

export interface CollaborationMetrics {
  activeCollaborations: number
  totalParticipants: number
  messagesExchanged: number
  documentsShared: number
  averageResponseTime: number
  engagementScore: number
}

export interface CostMetrics {
  computeCosts: number
  storageCosts: number
  networkCosts: number
  licenseCosts: number
  totalCosts: number
  costPerUser: number
  budgetUtilization: number
}

export interface IntegrationMetrics {
  totalRequests: number
  successRate: number
  averageLatency: number
  errorCount: number
  throughput: number
  availability: number
}

export interface NotificationState {
  unreadCount: number
  notifications: Notification[]
  channels: NotificationChannel[]
  preferences: NotificationPreferences
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  level: NotificationLevel
  isRead: boolean
  actions?: NotificationAction[]
  metadata?: Record<string, any>
  createdAt: Date
  expiresAt?: Date
}

export interface NotificationChannel {
  id: string
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack'
  isEnabled: boolean
  config: Record<string, any>
  filters: NotificationFilter[]
}

export interface NotificationPreferences {
  enabledChannels: string[]
  quietHours: QuietHours
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  categories: Record<string, boolean>
}

export interface ThemeState {
  current: string
  available: ThemeOption[]
  customizations: ThemeCustomization[]
  isDark: boolean
  systemPreference: boolean
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface DateRange {
  start: Date
  end: Date
}

export interface TimeDistribution {
  hour: number
  count: number
  percentage: number
}

export interface ActionStats {
  action: string
  count: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

export interface UserEngagement {
  userId: string
  score: number
  activities: number
  lastActive: Date
  trend: 'up' | 'down' | 'stable'
}

export interface ActivityTrend {
  period: string
  count: number
  change: number
  changePercent: number
}

export interface UserInfo {
  id: string
  displayName: string
  avatar?: string
  role?: string
}

export interface ActivityFilter {
  field: string
  operator: string
  value: any
  isActive: boolean
}

export interface ActivityAction {
  id: string
  label: string
  icon: string
  action: () => void
}

export interface DataSourceConfig {
  type: string
  endpoint: string
  query: string
  parameters: Record<string, any>
  refreshInterval: number
  caching: boolean
}

export interface VisualizationConfig {
  type: string
  config: Record<string, any>
  theme: string
  responsive: boolean
  interactions: boolean
}

export interface WidgetPosition {
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

export interface WidgetConfig {
  title: string
  showHeader: boolean
  showBorder: boolean
  backgroundColor?: string
  textColor?: string
  customStyles?: Record<string, any>
}

export interface DashboardFilter {
  field: string
  operator: string
  value: any
  label: string
  isGlobal: boolean
}

export interface AlertAction {
  id: string
  label: string
  type: 'button' | 'link' | 'dismiss'
  action: string
  style?: string
}

export interface CursorPosition {
  x: number
  y: number
  elementId?: string
}

export interface Selection {
  start: number
  end: number
  text?: string
  elementId?: string
}

export interface AuthenticationConfig {
  type: 'oauth' | 'jwt' | 'apikey' | 'basic'
  credentials: Record<string, string>
  refreshToken?: string
  expiresAt?: Date
}

export interface DataMapping {
  sourceField: string
  targetField: string
  transformation?: string
  validation?: ValidationRule[]
}

export interface EventTrigger {
  event: string
  condition?: string
  action: string
  parameters: Record<string, any>
}

export interface RetryPolicy {
  maxRetries: number
  backoffStrategy: 'linear' | 'exponential' | 'fixed'
  initialDelay: number
  maxDelay: number
}

export interface RateLimit {
  requestsPerSecond: number
  burstSize: number
  windowSize: number
}

export interface ValidationRule {
  field: string
  type: string
  required: boolean
  pattern?: string
  min?: number
  max?: number
  customValidator?: string
}

export interface MonitoringConfig {
  enabled: boolean
  metrics: string[]
  alertThresholds: Record<string, number>
  dashboardId?: string
}

export interface NotificationConfig {
  channel: string
  events: string[]
  template: string
  recipients: string[]
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error'
  destinations: string[]
  format: string
  retention: number
}

export interface SecurityConfig {
  encryption: boolean
  accessControl: boolean
  auditLogging: boolean
  dataClassification: string
}

export interface AIAttachment {
  id: string
  type: string
  name: string
  url: string
  size: number
  metadata: Record<string, any>
}

export interface LearningData {
  userInteractions: UserInteraction[]
  systemFeedback: SystemFeedback[]
  modelPerformance: ModelPerformance[]
  trainingData: TrainingDataPoint[]
}

export interface UserInteraction {
  id: string
  userId: string
  type: string
  query: string
  response: string
  satisfaction?: number
  feedback?: string
  timestamp: Date
}

export interface SystemFeedback {
  id: string
  type: string
  source: string
  data: Record<string, any>
  timestamp: Date
}

export interface ModelPerformance {
  modelId: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  timestamp: Date
}

export interface TrainingDataPoint {
  id: string
  input: Record<string, any>
  output: Record<string, any>
  weight: number
  source: string
  timestamp: Date
}

export interface RecommendedAction {
  id: string
  type: string
  label: string
  description: string
  action: string
  parameters: Record<string, any>
  estimatedImpact: string
}

export interface ModelConfig {
  architecture: string
  hyperparameters: Record<string, any>
  trainingData: string
  features: string[]
  target: string
  evaluation: EvaluationConfig
}

export interface EvaluationConfig {
  metrics: string[]
  validationSplit: number
  crossValidation: boolean
  testDataset?: string
}

export interface ResourceUsage {
  cpu: number
  memory: number
  disk: number
  network: number
}

export interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  version: string
  uptime: number
  lastCheck: Date
}

export interface SystemMetrics {
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
  activeConnections: number
  queueSize: number
  cacheHitRate: number
}

export interface SystemAlert {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  source: string
  timestamp: Date
  acknowledged: boolean
}

export interface MaintenanceInfo {
  isScheduled: boolean
  startTime?: Date
  endTime?: Date
  description?: string
  affectedServices: string[]
}

export interface PrivacySettings {
  shareActivity: boolean
  shareProfile: boolean
  allowAnalytics: boolean
  dataRetention: number
  exportData: boolean
  deleteAccount: boolean
}

export interface QuietHours {
  enabled: boolean
  start: string
  end: string
  timezone: string
  days: string[]
}

export interface NotificationAction {
  type: string
  label: string
  action: string
  style?: string
}

export interface NotificationFilter {
  type: string
  condition: string
  value: any
}

export interface ThemeOption {
  id: string
  name: string
  description: string
  preview: string
  isDark: boolean
  colors: Record<string, string>
}

export interface ThemeCustomization {
  property: string
  value: string
  scope: 'global' | 'component' | 'user'
}