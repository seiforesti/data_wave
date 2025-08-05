/**
 * Racine Orchestration Types
 * ==========================
 * 
 * TypeScript types specifically for the Racine Orchestration system.
 * Maps 100% to backend racine_orchestration_models.py and racine_orchestration_routes.py
 */

import { 
  GroupType, 
  Status, 
  SystemHealth, 
  StandardResponse, 
  PerformanceMetrics,
  User 
} from '../shared/racine-core.types'

// ========================================================================================
// Orchestration Request Types (for API calls)
// ========================================================================================

export interface CreateOrchestrationMasterRequest {
  name: string
  description?: string
  orchestrationType: OrchestrationTypes
  connectedGroups: GroupType[]
  groupConfigurations: Record<string, any>
  crossGroupDependencies?: Record<string, any>
  configuration?: Record<string, any>
}

export interface UpdateOrchestrationMasterRequest {
  name?: string
  description?: string
  groupConfigurations?: Record<string, any>
  crossGroupDependencies?: Record<string, any>
  configuration?: Record<string, any>
}

export interface CrossGroupWorkflowRequest {
  name: string
  description?: string
  involvedGroups: GroupType[]
  orchestrationPlan: OrchestrationStepRequest[]
  configuration?: Record<string, any>
  scheduleConfig?: ScheduleConfigRequest
}

export interface OrchestrationStepRequest {
  stepName: string
  group: GroupType
  action: string
  parameters: Record<string, any>
  dependencies?: string[]
  timeoutSeconds?: number
  retryPolicy?: RetryPolicyRequest
  condition?: string
}

export interface SystemHealthRequest {
  includeGroups?: GroupType[]
  includeMetrics?: boolean
  includeIntegrations?: boolean
}

export interface PerformanceOptimizationRequest {
  targetGroups?: GroupType[]
  optimizationGoals: OptimizationGoal[]
  constraints?: Record<string, any>
  analysisPeriod?: string
}

// ========================================================================================
// Orchestration Response Types
// ========================================================================================

export interface OrchestrationMasterResponse {
  id: string
  name: string
  description: string
  orchestrationType: OrchestrationTypes
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

export interface CrossGroupWorkflowResponse {
  id: string
  name: string
  description?: string
  involvedGroups: GroupType[]
  orchestrationPlan: OrchestrationStepResponse[]
  status: Status
  executionHistory: CrossGroupExecutionResponse[]
  createdAt: Date
  createdBy: string
}

export interface OrchestrationStepResponse {
  id: string
  stepName: string
  group: GroupType
  action: string
  parameters: Record<string, any>
  dependencies: string[]
  timeoutSeconds: number
  order: number
  status: Status
}

export interface CrossGroupExecutionResponse {
  id: string
  workflowId: string
  status: Status
  startedAt: Date
  completedAt?: Date
  steps: StepExecutionResponse[]
  metrics: ExecutionMetricsResponse
  executedBy: string
}

export interface StepExecutionResponse {
  stepId: string
  status: Status
  startedAt: Date
  completedAt?: Date
  result?: Record<string, any>
  errorMessage?: string
  retryCount: number
}

export interface SystemHealthResponse {
  overall: SystemHealth
  groups: Record<GroupType, GroupHealthStatus>
  integrations: IntegrationHealthStatus[]
  metrics: SystemMetricsResponse
  lastUpdated: Date
}

export interface GroupHealthStatus {
  group: GroupType
  status: SystemHealth
  lastCheck: Date
  metrics: Record<string, number>
  issues: HealthIssue[]
  serviceStatus: ServiceStatus[]
}

export interface IntegrationHealthStatus {
  integrationId: string
  name: string
  status: SystemHealth
  sourceGroup: GroupType
  targetGroup: GroupType
  lastSync: Date
  errorCount: number
  latestErrors: string[]
}

export interface SystemMetricsResponse {
  cpu: number
  memory: number
  disk: number
  network: NetworkMetrics
  database: DatabaseMetrics
  api: ApiMetrics
  timestamp: Date
}

// ========================================================================================
// Orchestration Domain Types
// ========================================================================================

export enum OrchestrationTypes {
  MASTER_CONTROLLER = 'master_controller',
  WORKFLOW_ORCHESTRATOR = 'workflow_orchestrator',
  SERVICE_COORDINATOR = 'service_coordinator',
  DATA_PIPELINE_MANAGER = 'data_pipeline_manager',
  CROSS_GROUP_INTEGRATOR = 'cross_group_integrator',
  SYSTEM_MONITOR = 'system_monitor'
}

export enum OptimizationGoal {
  PERFORMANCE = 'performance',
  COST = 'cost',
  RELIABILITY = 'reliability',
  EFFICIENCY = 'efficiency',
  SCALABILITY = 'scalability',
  SECURITY = 'security'
}

export interface HealthIssue {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'performance' | 'connectivity' | 'data' | 'security' | 'configuration'
  title: string
  description: string
  affectedResources: string[]
  recommendedActions: string[]
  firstDetected: Date
  lastOccurred: Date
  occurrenceCount: number
}

export interface ServiceStatus {
  serviceName: string
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping'
  version: string
  uptime: number
  lastRestart?: Date
  healthEndpoint?: string
  dependencies: string[]
  metrics: ServiceMetrics
}

export interface ServiceMetrics {
  requestCount: number
  errorCount: number
  averageResponseTime: number
  memoryUsage: number
  cpuUsage: number
  activeConnections: number
}

export interface NetworkMetrics {
  inbound: number
  outbound: number
  connections: number
  latency: number
  packetLoss: number
}

export interface DatabaseMetrics {
  connections: number
  queries: number
  slowQueries: number
  lockWaits: number
  deadlocks: number
  storage: StorageMetrics
}

export interface StorageMetrics {
  total: number
  used: number
  free: number
  indexSize: number
  dataSize: number
}

export interface ApiMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  rateLimitHits: number
  authFailures: number
}

export interface ExecutionMetricsResponse {
  totalSteps: number
  completedSteps: number
  failedSteps: number
  skippedSteps: number
  totalDuration?: number
  averageStepDuration: number
  resourceUsage: ResourceUsageMetrics
}

export interface ResourceUsageMetrics {
  cpu: number
  memory: number
  network: number
  storage: number
  databaseConnections: number
  apiCalls: number
}

// ========================================================================================
// Supporting Types
// ========================================================================================

export interface RetryPolicyRequest {
  maxRetries: number
  backoffStrategy: 'linear' | 'exponential' | 'fixed'
  baseDelay: number
  maxDelay: number
  retryConditions: string[]
}

export interface ScheduleConfigRequest {
  scheduleType: 'cron' | 'interval' | 'event_driven' | 'manual'
  cronExpression?: string
  intervalSeconds?: number
  startTime?: Date
  endTime?: Date
  timezone: string
  isActive: boolean
  executionParameters: Record<string, any>
}

// ========================================================================================
// Orchestration State Management
// ========================================================================================

export interface OrchestrationState {
  masters: OrchestrationMasterResponse[]
  activeMaster?: OrchestrationMasterResponse
  workflows: CrossGroupWorkflowResponse[]
  systemHealth: SystemHealthResponse
  isLoading: boolean
  error: string | null
  lastUpdated: Date
}

export interface OrchestrationFilters {
  status?: Status[]
  orchestrationType?: OrchestrationTypes[]
  groups?: GroupType[]
  healthStatus?: SystemHealth[]
  dateRange?: {
    start: Date
    end: Date
  }
}

// ========================================================================================
// WebSocket Types for Real-time Updates
// ========================================================================================

export interface OrchestrationWebSocketMessage {
  type: 'health_update' | 'workflow_status' | 'system_alert' | 'performance_update'
  data: any
  timestamp: Date
}

export interface HealthUpdateMessage {
  type: 'health_update'
  data: {
    group: GroupType
    previousStatus: SystemHealth
    currentStatus: SystemHealth
    details: HealthIssue[]
  }
  timestamp: Date
}

export interface WorkflowStatusMessage {
  type: 'workflow_status'
  data: {
    workflowId: string
    executionId: string
    previousStatus: Status
    currentStatus: Status
    currentStep?: string
    progressPercentage: number
  }
  timestamp: Date
}

export interface SystemAlertMessage {
  type: 'system_alert'
  data: {
    alertId: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    affectedGroups: GroupType[]
    recommendedActions: string[]
  }
  timestamp: Date
}

// ========================================================================================
// Error Types
// ========================================================================================

export interface OrchestrationError {
  code: string
  message: string
  details?: Record<string, any>
  affectedGroups?: GroupType[]
  recoveryActions?: string[]
  timestamp: Date
}

export enum OrchestrationErrorCodes {
  ORCHESTRATION_CREATION_FAILED = 'ORCHESTRATION_CREATION_FAILED',
  WORKFLOW_EXECUTION_FAILED = 'WORKFLOW_EXECUTION_FAILED',
  GROUP_CONNECTION_FAILED = 'GROUP_CONNECTION_FAILED',
  HEALTH_CHECK_FAILED = 'HEALTH_CHECK_FAILED',
  SYSTEM_OPTIMIZATION_FAILED = 'SYSTEM_OPTIMIZATION_FAILED',
  CROSS_GROUP_SYNC_FAILED = 'CROSS_GROUP_SYNC_FAILED',
  PERFORMANCE_DEGRADATION = 'PERFORMANCE_DEGRADATION',
  INTEGRATION_FAILURE = 'INTEGRATION_FAILURE'
}

// ========================================================================================
// Export all orchestration types
// ========================================================================================

export type {
  CreateOrchestrationMasterRequest,
  UpdateOrchestrationMasterRequest,
  CrossGroupWorkflowRequest,
  OrchestrationStepRequest,
  SystemHealthRequest,
  PerformanceOptimizationRequest,
  OrchestrationMasterResponse,
  CrossGroupWorkflowResponse,
  OrchestrationStepResponse,
  CrossGroupExecutionResponse,
  StepExecutionResponse,
  SystemHealthResponse,
  GroupHealthStatus,
  IntegrationHealthStatus,
  SystemMetricsResponse,
  HealthIssue,
  ServiceStatus,
  ServiceMetrics,
  NetworkMetrics,
  DatabaseMetrics,
  ApiMetrics,
  ExecutionMetricsResponse,
  ResourceUsageMetrics,
  OrchestrationState,
  OrchestrationFilters,
  OrchestrationWebSocketMessage,
  HealthUpdateMessage,
  WorkflowStatusMessage,
  SystemAlertMessage,
  OrchestrationError
}

export {
  OrchestrationTypes,
  OptimizationGoal,
  OrchestrationErrorCodes
}