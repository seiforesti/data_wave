// =============================================================================
// RACINE MAIN MANAGER - TYPE DEFINITIONS
// =============================================================================
// Comprehensive TypeScript definitions for the enterprise data governance platform
// Supporting all 7 groups (6 core + RBAC) with advanced orchestration capabilities

// =============================================================================
// CORE TYPES
// =============================================================================

export type RacineView = 
  | 'dashboard'
  | 'workspace'
  | 'workflow'
  | 'pipeline'
  | 'ai-assistant'
  | 'activity-tracker'
  | 'collaboration'
  | 'settings'
  // Group SPAs
  | 'scan-rule-sets'
  | 'advanced-catalog'
  | 'scan-logic'
  | 'rbac-system'
  | 'data-sources'
  | 'classifications'
  | 'compliance-rules'

export type SystemStatus = 'healthy' | 'warning' | 'critical' | 'maintenance'
export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type CollaborationRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest'

// =============================================================================
// USER & PREFERENCES
// =============================================================================

export interface UserPreferences {
  id: string
  name: string
  email: string
  avatar?: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: NotificationPreferences
  dashboard: DashboardPreferences
  accessibility: AccessibilityPreferences
  privacy: PrivacyPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  digest: 'immediate' | 'hourly' | 'daily' | 'weekly'
  categories: {
    system: boolean
    security: boolean
    workflows: boolean
    collaboration: boolean
    ai: boolean
  }
}

export interface DashboardPreferences {
  defaultView: RacineView
  layout: string
  autoRefresh: boolean
  refreshInterval: number
  widgets: string[]
  kpis: string[]
}

export interface AccessibilityPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  contrast: 'normal' | 'high'
  motion: 'normal' | 'reduced'
  screenReader: boolean
  keyboardNavigation: boolean
}

export interface PrivacyPreferences {
  analytics: boolean
  personalization: boolean
  dataSharing: boolean
  cookieConsent: boolean
}

// =============================================================================
// SYSTEM HEALTH & MONITORING
// =============================================================================

export interface SystemHealth {
  overall: SystemStatus
  cpu: ResourceMetric
  memory: ResourceMetric
  storage: ResourceMetric
  network: NetworkMetric
  services: ServiceHealth[]
  lastUpdated: string
}

export interface ResourceMetric {
  usage: number
  available: number
  total: number
  trend: 'up' | 'down' | 'stable'
  threshold: {
    warning: number
    critical: number
  }
}

export interface NetworkMetric {
  latency: number
  throughput: number
  packetLoss: number
  status: 'connected' | 'disconnected' | 'unstable'
}

export interface ServiceHealth {
  id: string
  name: string
  status: SystemStatus
  uptime: number
  responseTime: number
  errorRate: number
  lastCheck: string
}

export interface ConnectionStatus {
  connected: boolean
  lastConnected: string
  reconnectAttempts: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
}

// =============================================================================
// CROSS-GROUP METRICS & INTEGRATION
// =============================================================================

export interface CrossGroupMetrics {
  totalAssets: number
  scansCompleted: number
  complianceScore: number
  dataQualityScore: number
  activeWorkflows: number
  activePipelines: number
  aiRecommendations: number
  collaborationActivity: number
  groupStatuses: Record<string, IntegrationStatus>
  trends: {
    period: '1h' | '24h' | '7d' | '30d'
    dataPoints: Array<{
      timestamp: string
      metrics: Record<string, number>
    }>
  }
}

export interface IntegrationStatus {
  dataSources?: GroupIntegration
  scanRuleSets?: GroupIntegration
  catalog?: GroupIntegration
  scanLogic?: GroupIntegration
  classifications?: GroupIntegration
  compliance?: GroupIntegration
  rbac?: GroupIntegration
}

export interface GroupIntegration {
  status: IntegrationStatus
  lastSync: string
  syncFrequency: number
  errorCount: number
  successRate: number
  endpoints: Array<{
    url: string
    method: string
    status: number
    latency: number
  }>
}

// =============================================================================
// WORKSPACE MANAGEMENT
// =============================================================================

export interface Workspace {
  id: string
  name: string
  description?: string
  type: 'personal' | 'team' | 'organization' | 'project'
  status: 'active' | 'archived' | 'draft'
  owner: User
  members: WorkspaceMember[]
  settings: WorkspaceSettings
  resources: WorkspaceResources
  analytics: WorkspaceAnalytics
  createdAt: string
  updatedAt: string
  lastAccessed: string
}

export interface WorkspaceMember {
  user: User
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  permissions: string[]
  addedAt: string
  addedBy: string
}

export interface WorkspaceSettings {
  visibility: 'private' | 'team' | 'organization' | 'public'
  allowInvites: boolean
  requireApproval: boolean
  dataRetention: number
  autoArchive: boolean
  integrations: {
    [groupId: string]: {
      enabled: boolean
      config: Record<string, any>
    }
  }
}

export interface WorkspaceResources {
  workflows: number
  pipelines: number
  dataSources: number
  rules: number
  assets: number
  storage: number
  computeHours: number
}

export interface WorkspaceAnalytics {
  usage: {
    daily: number[]
    weekly: number[]
    monthly: number[]
  }
  performance: {
    averageResponseTime: number
    successRate: number
    errorRate: number
  }
  collaboration: {
    activeUsers: number
    sessionsToday: number
    totalSessions: number
  }
}

// =============================================================================
// WORKFLOW & PIPELINE MANAGEMENT
// =============================================================================

export interface JobWorkflow {
  id: string
  name: string
  description?: string
  type: 'data-processing' | 'governance' | 'compliance' | 'analytics' | 'custom'
  status: ExecutionStatus
  version: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  schedule: WorkflowSchedule
  configuration: WorkflowConfiguration
  metadata: WorkflowMetadata
  permissions: WorkflowPermissions
  createdAt: string
  updatedAt: string
  lastExecuted?: string
}

export interface WorkflowNode {
  id: string
  type: 'start' | 'end' | 'task' | 'decision' | 'parallel' | 'merge' | 'delay' | 'webhook'
  label: string
  description?: string
  position: { x: number; y: number }
  configuration: NodeConfiguration
  inputs: NodePort[]
  outputs: NodePort[]
  status?: ExecutionStatus
  metadata?: Record<string, any>
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourcePort: string
  targetPort: string
  condition?: string
  label?: string
  style?: EdgeStyle
}

export interface NodeConfiguration {
  service: string
  operation: string
  parameters: Record<string, any>
  timeout: number
  retries: number
  errorHandling: 'stop' | 'continue' | 'retry' | 'skip'
  resources: {
    cpu: number
    memory: number
    storage: number
  }
}

export interface NodePort {
  id: string
  name: string
  type: 'data' | 'control' | 'event'
  dataType?: string
  required: boolean
}

export interface EdgeStyle {
  color?: string
  width?: number
  style?: 'solid' | 'dashed' | 'dotted'
  animated?: boolean
}

export interface WorkflowSchedule {
  type: 'manual' | 'cron' | 'event' | 'interval'
  expression?: string
  timezone?: string
  enabled: boolean
  nextRun?: string
}

export interface WorkflowConfiguration {
  timeout: number
  maxRetries: number
  parallelism: number
  priority: Priority
  environment: string
  variables: Record<string, any>
  secrets: string[]
}

export interface WorkflowMetadata {
  tags: string[]
  category: string
  author: string
  estimatedDuration: number
  dependencies: string[]
  dataLineage: DataLineage[]
}

export interface WorkflowPermissions {
  execute: string[]
  edit: string[]
  view: string[]
  delete: string[]
}

export interface DataLineage {
  source: string
  target: string
  transformation?: string
  confidence: number
}

// =============================================================================
// PIPELINE ORCHESTRATION
// =============================================================================

export interface Pipeline {
  id: string
  name: string
  description?: string
  type: 'batch' | 'streaming' | 'real-time' | 'hybrid'
  status: ExecutionStatus
  stages: PipelineStage[]
  configuration: PipelineConfiguration
  monitoring: PipelineMonitoring
  resources: PipelineResources
  schedule: PipelineSchedule
  permissions: PipelinePermissions
  createdAt: string
  updatedAt: string
}

export interface PipelineStage {
  id: string
  name: string
  type: 'extract' | 'transform' | 'load' | 'validate' | 'govern' | 'monitor'
  order: number
  configuration: StageConfiguration
  dependencies: string[]
  outputs: StageOutput[]
  status?: ExecutionStatus
  metrics?: StageMetrics
}

export interface StageConfiguration {
  service: string
  parameters: Record<string, any>
  resources: {
    cpu: number
    memory: number
    storage: number
    parallelism: number
  }
  timeout: number
  retries: number
}

export interface StageOutput {
  id: string
  name: string
  type: string
  schema?: any
  location?: string
  metadata?: Record<string, any>
}

export interface StageMetrics {
  duration: number
  recordsProcessed: number
  bytesProcessed: number
  errorCount: number
  throughput: number
}

export interface PipelineConfiguration {
  maxConcurrency: number
  timeout: number
  retryPolicy: RetryPolicy
  errorHandling: ErrorHandling
  monitoring: MonitoringConfig
  optimization: OptimizationConfig
}

export interface RetryPolicy {
  maxAttempts: number
  backoffStrategy: 'fixed' | 'exponential' | 'linear'
  backoffMultiplier: number
  maxDelay: number
}

export interface ErrorHandling {
  strategy: 'fail-fast' | 'continue' | 'retry' | 'circuit-breaker'
  deadLetterQueue?: boolean
  alerting: boolean
  rollback: boolean
}

export interface MonitoringConfig {
  metrics: string[]
  alerts: AlertRule[]
  dashboard: boolean
  logging: LoggingConfig
}

export interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: number
  severity: Priority
  notification: string[]
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error'
  format: 'json' | 'text'
  destination: string[]
  retention: number
}

export interface OptimizationConfig {
  autoScaling: boolean
  resourceOptimization: boolean
  caching: boolean
  compression: boolean
  partitioning: boolean
}

export interface PipelineMonitoring {
  status: SystemStatus
  metrics: PipelineMetrics
  alerts: Alert[]
  logs: LogEntry[]
}

export interface PipelineMetrics {
  throughput: number
  latency: number
  errorRate: number
  resourceUtilization: number
  cost: number
  dataQuality: number
}

export interface PipelineResources {
  allocated: ResourceAllocation
  consumed: ResourceConsumption
  limits: ResourceLimits
}

export interface ResourceAllocation {
  cpu: number
  memory: number
  storage: number
  network: number
}

export interface ResourceConsumption {
  cpu: number
  memory: number
  storage: number
  network: number
  cost: number
}

export interface ResourceLimits {
  cpu: number
  memory: number
  storage: number
  network: number
  cost: number
}

export interface PipelineSchedule {
  type: 'manual' | 'cron' | 'event' | 'continuous'
  expression?: string
  timezone?: string
  enabled: boolean
  triggers: PipelineTrigger[]
}

export interface PipelineTrigger {
  id: string
  type: 'schedule' | 'file' | 'data' | 'api' | 'manual'
  configuration: Record<string, any>
  enabled: boolean
}

export interface PipelinePermissions {
  execute: string[]
  modify: string[]
  view: string[]
  delete: string[]
  schedule: string[]
}

// =============================================================================
// AI ASSISTANT & INTELLIGENCE
// =============================================================================

export interface AIAssistant {
  id: string
  name: string
  type: 'general' | 'data' | 'governance' | 'analytics' | 'specialized'
  status: 'active' | 'training' | 'offline'
  capabilities: AICapability[]
  models: AIModel[]
  conversations: Conversation[]
  suggestions: AISuggestion[]
  analytics: AIAnalytics
  configuration: AIConfiguration
}

export interface AICapability {
  id: string
  name: string
  description: string
  type: 'nlp' | 'ml' | 'vision' | 'reasoning' | 'planning'
  confidence: number
  languages: string[]
  domains: string[]
}

export interface AIModel {
  id: string
  name: string
  version: string
  type: 'llm' | 'classifier' | 'predictor' | 'recommender'
  status: 'active' | 'training' | 'deployed' | 'archived'
  metrics: ModelMetrics
  configuration: ModelConfiguration
}

export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  latency: number
  throughput: number
  confidence: number
}

export interface ModelConfiguration {
  parameters: Record<string, any>
  hyperparameters: Record<string, any>
  trainingData: string[]
  validationData: string[]
  features: string[]
}

export interface Conversation {
  id: string
  userId: string
  type: 'chat' | 'voice' | 'automation'
  status: 'active' | 'paused' | 'completed'
  context: ConversationContext
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface ConversationContext {
  currentView: RacineView
  workspace?: string
  workflow?: string
  pipeline?: string
  intent?: string
  entities: Record<string, any>
  history: string[]
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
  attachments?: Attachment[]
  actions?: MessageAction[]
}

export interface Attachment {
  id: string
  type: 'file' | 'image' | 'data' | 'chart' | 'report'
  name: string
  url: string
  size: number
  metadata?: Record<string, any>
}

export interface MessageAction {
  id: string
  type: 'button' | 'link' | 'form' | 'navigation'
  label: string
  action: string
  parameters?: Record<string, any>
}

export interface AISuggestion {
  id: string
  type: 'optimization' | 'automation' | 'insight' | 'action' | 'warning'
  title: string
  description: string
  confidence: number
  priority: Priority
  context: string
  action: () => void
  metadata?: Record<string, any>
  createdAt: string
  expiresAt?: string
}

export interface AIAnalytics {
  usage: {
    conversations: number
    messages: number
    automations: number
    suggestions: number
  }
  performance: {
    responseTime: number
    accuracy: number
    satisfaction: number
    adoptionRate: number
  }
  insights: {
    topQueries: string[]
    commonIssues: string[]
    successfulAutomations: number
    timesSaved: number
  }
}

export interface AIConfiguration {
  models: string[]
  languages: string[]
  personality: AIPersonality
  capabilities: string[]
  integrations: string[]
  privacy: AIPrivacySettings
}

export interface AIPersonality {
  tone: 'professional' | 'friendly' | 'casual' | 'technical'
  verbosity: 'brief' | 'detailed' | 'comprehensive'
  proactiveness: 'reactive' | 'proactive' | 'autonomous'
  domain: 'general' | 'data' | 'governance' | 'analytics'
}

export interface AIPrivacySettings {
  dataRetention: number
  anonymization: boolean
  encryption: boolean
  auditLogging: boolean
  consentRequired: boolean
}

// =============================================================================
// ACTIVITY TRACKING & MONITORING
// =============================================================================

export interface Activity {
  id: string
  type: ActivityType
  action: string
  description: string
  userId: string
  userName: string
  workspaceId?: string
  resourceId?: string
  resourceType?: string
  data?: Record<string, any>
  metadata: ActivityMetadata
  timestamp: string
  duration?: number
  status: 'success' | 'warning' | 'error'
  ipAddress?: string
  userAgent?: string
}

export type ActivityType = 
  | 'navigation'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'execute'
  | 'login'
  | 'logout'
  | 'search'
  | 'export'
  | 'import'
  | 'share'
  | 'collaborate'
  | 'system'
  | 'security'
  | 'compliance'
  | 'error'

export interface ActivityMetadata {
  source: string
  category: string
  tags: string[]
  correlation: string[]
  businessImpact: 'low' | 'medium' | 'high' | 'critical'
  compliance: string[]
  retention: number
}

export interface ActivityFilter {
  types: ActivityType[]
  users: string[]
  workspaces: string[]
  dateRange: DateRange
  status: string[]
  search: string
}

export interface DateRange {
  start: string
  end: string
  preset?: '1h' | '24h' | '7d' | '30d' | '90d' | 'custom'
}

export interface ActivityAnalytics {
  summary: {
    total: number
    byType: Record<ActivityType, number>
    byUser: Record<string, number>
    byWorkspace: Record<string, number>
    byStatus: Record<string, number>
  }
  trends: {
    period: string
    data: Array<{
      timestamp: string
      count: number
      type: ActivityType
    }>
  }
  patterns: {
    peakHours: number[]
    commonSequences: string[]
    anomalies: ActivityAnomaly[]
  }
}

export interface ActivityAnomaly {
  id: string
  type: 'unusual_volume' | 'suspicious_pattern' | 'security_concern' | 'system_issue'
  description: string
  severity: Priority
  confidence: number
  activities: string[]
  detected: string
  status: 'new' | 'investigating' | 'resolved' | 'false_positive'
}

// =============================================================================
// COLLABORATION & COMMUNICATION
// =============================================================================

export interface CollaborationSpace {
  id: string
  name: string
  description?: string
  type: 'workspace' | 'project' | 'team' | 'organization'
  visibility: 'private' | 'team' | 'organization' | 'public'
  members: SpaceMember[]
  channels: Channel[]
  documents: Document[]
  activities: Activity[]
  settings: SpaceSettings
  analytics: SpaceAnalytics
  createdAt: string
  updatedAt: string
}

export interface SpaceMember {
  user: User
  role: CollaborationRole
  permissions: string[]
  status: 'active' | 'invited' | 'inactive'
  joinedAt: string
  lastActive: string
}

export interface Channel {
  id: string
  name: string
  description?: string
  type: 'text' | 'voice' | 'video' | 'screen-share'
  privacy: 'public' | 'private' | 'restricted'
  members: string[]
  messages: ChannelMessage[]
  files: ChannelFile[]
  settings: ChannelSettings
  createdAt: string
}

export interface ChannelMessage {
  id: string
  authorId: string
  content: string
  type: 'text' | 'file' | 'image' | 'code' | 'system'
  reactions: MessageReaction[]
  replies: ChannelMessage[]
  mentions: string[]
  attachments: ChannelFile[]
  edited: boolean
  timestamp: string
  editedAt?: string
}

export interface MessageReaction {
  emoji: string
  users: string[]
  count: number
}

export interface ChannelFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedBy: string
  uploadedAt: string
  metadata?: Record<string, any>
}

export interface ChannelSettings {
  notifications: boolean
  autoArchive: boolean
  retentionDays: number
  allowFileUpload: boolean
  allowExternalSharing: boolean
}

export interface Document {
  id: string
  title: string
  content: string
  type: 'markdown' | 'rich-text' | 'code' | 'spreadsheet' | 'presentation'
  status: 'draft' | 'review' | 'published' | 'archived'
  authorId: string
  collaborators: DocumentCollaborator[]
  versions: DocumentVersion[]
  comments: DocumentComment[]
  metadata: DocumentMetadata
  createdAt: string
  updatedAt: string
}

export interface DocumentCollaborator {
  userId: string
  role: 'owner' | 'editor' | 'commenter' | 'viewer'
  permissions: string[]
  lastAccess: string
}

export interface DocumentVersion {
  id: string
  version: string
  authorId: string
  changes: string
  timestamp: string
  content: string
}

export interface DocumentComment {
  id: string
  authorId: string
  content: string
  position?: { line: number; column: number }
  resolved: boolean
  timestamp: string
  replies: DocumentComment[]
}

export interface DocumentMetadata {
  tags: string[]
  category: string
  language: string
  readTime: number
  wordCount: number
  lastReviewed?: string
}

export interface SpaceSettings {
  notifications: NotificationSettings
  permissions: SpacePermissions
  integration: IntegrationSettings
  moderation: ModerationSettings
}

export interface NotificationSettings {
  mentions: boolean
  messages: boolean
  files: boolean
  activities: boolean
  digest: 'immediate' | 'hourly' | 'daily'
}

export interface SpacePermissions {
  invite: CollaborationRole[]
  create: CollaborationRole[]
  edit: CollaborationRole[]
  delete: CollaborationRole[]
  moderate: CollaborationRole[]
}

export interface IntegrationSettings {
  external: boolean
  webhooks: boolean
  bots: boolean
  apiAccess: boolean
}

export interface ModerationSettings {
  autoModeration: boolean
  profanityFilter: boolean
  linkFilter: boolean
  fileScanning: boolean
}

export interface SpaceAnalytics {
  activity: {
    messages: number
    files: number
    collaborators: number
    sessions: number
  }
  engagement: {
    activeUsers: number
    messageFrequency: number
    responseTime: number
    satisfaction: number
  }
  content: {
    documents: number
    words: number
    media: number
    links: number
  }
}

// =============================================================================
// DASHBOARD & VISUALIZATION
// =============================================================================

export interface DashboardConfig {
  id: string
  name: string
  description?: string
  layout: DashboardLayout
  widgets: DashboardWidget[]
  filters: DashboardFilter[]
  settings: DashboardSettings
  permissions: DashboardPermissions
  createdAt: string
  updatedAt: string
}

export interface DashboardLayout {
  type: 'grid' | 'flex' | 'masonry' | 'custom'
  columns: number
  rows: number
  responsive: boolean
  breakpoints: Record<string, LayoutBreakpoint>
}

export interface LayoutBreakpoint {
  columns: number
  width: number
  spacing: number
}

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  description?: string
  position: WidgetPosition
  size: WidgetSize
  data: WidgetData
  configuration: WidgetConfiguration
  style: WidgetStyle
  permissions: WidgetPermissions
}

export type WidgetType = 
  | 'metric'
  | 'chart'
  | 'table'
  | 'list'
  | 'map'
  | 'text'
  | 'image'
  | 'iframe'
  | 'custom'

export interface WidgetPosition {
  x: number
  y: number
  z?: number
}

export interface WidgetSize {
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export interface WidgetData {
  source: string
  query?: string
  filters?: Record<string, any>
  aggregations?: Record<string, any>
  realTime?: boolean
  refreshInterval?: number
}

export interface WidgetConfiguration {
  visualization: VisualizationConfig
  interaction: InteractionConfig
  formatting: FormattingConfig
}

export interface VisualizationConfig {
  chartType?: string
  xAxis?: AxisConfig
  yAxis?: AxisConfig
  series?: SeriesConfig[]
  legend?: LegendConfig
  tooltip?: TooltipConfig
}

export interface AxisConfig {
  field: string
  label?: string
  scale?: 'linear' | 'logarithmic' | 'time'
  format?: string
  min?: number
  max?: number
}

export interface SeriesConfig {
  field: string
  label?: string
  type?: string
  color?: string
  style?: Record<string, any>
}

export interface LegendConfig {
  show: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
  orientation: 'horizontal' | 'vertical'
}

export interface TooltipConfig {
  show: boolean
  format?: string
  fields?: string[]
}

export interface InteractionConfig {
  selectable: boolean
  zoomable: boolean
  pannable: boolean
  clickable: boolean
  hoverable: boolean
  drilling: boolean
}

export interface FormattingConfig {
  numberFormat?: string
  dateFormat?: string
  colorScheme?: string
  font?: FontConfig
}

export interface FontConfig {
  family: string
  size: number
  weight: string
  color: string
}

export interface WidgetStyle {
  background?: string
  border?: BorderConfig
  padding?: number
  margin?: number
  borderRadius?: number
  shadow?: ShadowConfig
}

export interface BorderConfig {
  width: number
  style: 'solid' | 'dashed' | 'dotted'
  color: string
}

export interface ShadowConfig {
  x: number
  y: number
  blur: number
  color: string
}

export interface WidgetPermissions {
  view: string[]
  edit: string[]
  delete: string[]
  configure: string[]
}

export interface DashboardFilter {
  id: string
  name: string
  type: 'select' | 'multiselect' | 'range' | 'date' | 'text' | 'boolean'
  field: string
  options?: FilterOption[]
  defaultValue?: any
  required: boolean
}

export interface FilterOption {
  value: any
  label: string
  description?: string
}

export interface DashboardSettings {
  autoRefresh: boolean
  refreshInterval: number
  theme: string
  responsive: boolean
  fullscreen: boolean
  exportable: boolean
}

export interface DashboardPermissions {
  view: string[]
  edit: string[]
  delete: string[]
  share: string[]
  export: string[]
}

// =============================================================================
// NOTIFICATIONS & ALERTS
// =============================================================================

export interface Alert {
  id: string
  type: AlertType
  severity: Priority
  title: string
  message: string
  source: string
  category: string
  conditions: AlertCondition[]
  actions: AlertAction[]
  recipients: AlertRecipient[]
  status: AlertStatus
  metadata: AlertMetadata
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export type AlertType = 
  | 'system'
  | 'security'
  | 'performance'
  | 'data_quality'
  | 'compliance'
  | 'business'
  | 'custom'

export type AlertStatus = 
  | 'active'
  | 'acknowledged'
  | 'resolved'
  | 'suppressed'
  | 'expired'

export interface AlertCondition {
  field: string
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains' | 'regex'
  value: any
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count'
  timeWindow?: number
}

export interface AlertAction {
  type: 'email' | 'sms' | 'webhook' | 'ticket' | 'escalation'
  configuration: Record<string, any>
  delay?: number
  condition?: string
}

export interface AlertRecipient {
  type: 'user' | 'group' | 'role' | 'external'
  identifier: string
  method: 'email' | 'sms' | 'push' | 'webhook'
}

export interface AlertMetadata {
  tags: string[]
  correlation: string[]
  documentation: string
  runbook: string
  escalation: EscalationPolicy
}

export interface EscalationPolicy {
  levels: EscalationLevel[]
  timeout: number
  autoResolve: boolean
}

export interface EscalationLevel {
  level: number
  recipients: AlertRecipient[]
  timeout: number
  condition?: string
}

export interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  source: string
  component: string
  userId?: string
  sessionId?: string
  requestId?: string
  metadata?: Record<string, any>
  stackTrace?: string
}

// =============================================================================
// UTILITY & HELPER TYPES
// =============================================================================

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  lastLogin?: string
}

export interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  action: () => void
  category: 'navigation' | 'creation' | 'analysis' | 'settings'
  shortcut?: string
  permissions?: string[]
}

export interface NotificationConfig {
  channels: string[]
  frequency: 'immediate' | 'batched' | 'scheduled'
  filters: Record<string, any>
  template: string
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: ApiMetadata
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  stackTrace?: string
}

export interface ApiMetadata {
  timestamp: string
  requestId: string
  version: string
  pagination?: PaginationMetadata
}

export interface PaginationMetadata {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface RacineConfig {
  api: ApiConfig
  features: FeatureConfig
  security: SecurityConfig
  monitoring: MonitoringConfig
  integration: IntegrationConfig
}

export interface ApiConfig {
  baseUrl: string
  timeout: number
  retries: number
  rateLimit: number
  authentication: AuthConfig
}

export interface AuthConfig {
  type: 'jwt' | 'oauth' | 'apikey'
  configuration: Record<string, any>
}

export interface FeatureConfig {
  enabled: string[]
  disabled: string[]
  experimental: string[]
  configuration: Record<string, any>
}

export interface SecurityConfig {
  encryption: boolean
  tokenExpiry: number
  passwordPolicy: PasswordPolicy
  sessionTimeout: number
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSymbols: boolean
  history: number
}

export interface MonitoringConfig {
  enabled: boolean
  metrics: string[]
  alerting: boolean
  retention: number
}

export interface IntegrationConfig {
  groups: Record<string, GroupConfig>
  webhooks: WebhookConfig[]
  external: ExternalConfig[]
}

export interface GroupConfig {
  enabled: boolean
  endpoint: string
  authentication: AuthConfig
  syncFrequency: number
  features: string[]
}

export interface WebhookConfig {
  id: string
  url: string
  events: string[]
  authentication?: AuthConfig
  retries: number
}

export interface ExternalConfig {
  id: string
  type: string
  configuration: Record<string, any>
  enabled: boolean
}