// ============================================================================
// ENTERPRISE BACKEND API INTEGRATION - COMPREHENSIVE BACKEND BINDING
// ============================================================================

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { z } from 'zod'

// Import all existing APIs
export * from './apis'

// Import types from backend models
import {
  DataSource,
  DataSourceCreateParams,
  DataSourceUpdateParams,
  DataSourceFilters,
  DataSourceStats,
  DataSourceHealth,
  ConnectionTestResult,
  ApiResponse,
  PaginatedResponse
} from '../types'

// ============================================================================
// EXTENDED API CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const enterpriseApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for enterprise operations
})

// Enhanced request interceptor with enterprise features
enterpriseApi.interceptors.request.use((config) => {
  // Add auth token
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Add request tracking
  config.metadata = {
    startTime: Date.now(),
    requestId: Math.random().toString(36).substr(2, 9)
  }
  
  // Add enterprise headers
  config.headers['X-Client-Version'] = '1.0.0'
  config.headers['X-Feature-Set'] = 'enterprise'
  
  return config
})

// Enhanced response interceptor with enterprise error handling
enterpriseApi.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata?.startTime
    response.config.metadata = {
      ...response.config.metadata,
      duration,
      success: true
    }
    
    // Emit telemetry event
    if (window.enterpriseEventBus) {
      window.enterpriseEventBus.emit('api:request:completed', {
        url: response.config.url,
        method: response.config.method,
        duration,
        status: response.status,
        success: true
      })
    }
    
    return response
  },
  (error) => {
    // Calculate request duration
    const duration = Date.now() - error.config?.metadata?.startTime
    
    // Enhanced error handling
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      duration,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code || error.code,
      details: error.response?.data?.details,
      success: false
    }
    
    // Emit telemetry event
    if (window.enterpriseEventBus) {
      window.enterpriseEventBus.emit('api:request:failed', errorDetails)
    }
    
    // Log enterprise-grade error details
    console.error('Enterprise API Error:', errorDetails)
    
    return Promise.reject(error)
  }
)

// ============================================================================
// SECURITY & COMPLIANCE APIs
// ============================================================================

export interface SecurityAuditRequest {
  data_source_id: number
  scan_type?: 'vulnerability' | 'compliance' | 'penetration' | 'full'
  include_recommendations?: boolean
}

export interface SecurityAuditResponse {
  security_score: number
  last_scan: string | null
  vulnerabilities: SecurityVulnerability[]
  controls: SecurityControl[]
  recent_scans: SecurityScan[]
  incidents: SecurityIncident[]
  recommendations: string[]
  compliance_frameworks: ComplianceFramework[]
}

export interface SecurityVulnerability {
  id: number
  data_source_id: number
  name: string
  description: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'false_positive'
  cve_id?: string
  cvss_score?: number
  remediation?: string
  affected_components: string[]
  discovered_at: string
  last_updated: string
  resolved_at?: string
  assigned_to?: string
}

export interface SecurityControl {
  id: number
  data_source_id: number
  name: string
  description: string
  category: string
  framework: string
  control_id: string
  status: 'enabled' | 'disabled' | 'partial' | 'not_applicable'
  compliance_status: string
  implementation_notes?: string
  last_assessed?: string
  next_assessment?: string
  assessor?: string
}

export interface SecurityScan {
  id: number
  data_source_id: number
  scan_type: string
  scan_tool: string
  status: string
  vulnerabilities_found: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  started_at?: string
  completed_at?: string
  duration_seconds?: number
}

export interface SecurityIncident {
  id: number
  data_source_id: number
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  status: string
  assigned_to?: string
  reporter?: string
  occurred_at: string
  detected_at?: string
  resolved_at?: string
  impact_assessment?: string
  affected_systems: string[]
  response_actions: string[]
}

export interface ComplianceFramework {
  framework: string
  score: number
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed'
  requirements_total: number
  requirements_compliant: number
  last_assessment?: string
}

// Security APIs
export const getSecurityAudit = async (data_source_id: number): Promise<SecurityAuditResponse> => {
  const { data } = await enterpriseApi.get(`/security/audit/${data_source_id}`)
  return data
}

export const createSecurityScan = async (request: SecurityAuditRequest): Promise<SecurityScan> => {
  const { data } = await enterpriseApi.post('/security/scans', request)
  return data
}

export const updateSecurityVulnerability = async (
  vulnerability_id: number, 
  updates: Partial<SecurityVulnerability>
): Promise<SecurityVulnerability> => {
  const { data } = await enterpriseApi.put(`/security/vulnerabilities/${vulnerability_id}`, updates)
  return data
}

// ============================================================================
// PERFORMANCE & ANALYTICS APIs
// ============================================================================

export interface PerformanceMetricsRequest {
  data_source_id: number
  time_range?: '1h' | '6h' | '24h' | '7d' | '30d'
  metric_types?: ('response_time' | 'throughput' | 'error_rate' | 'cpu_usage' | 'memory_usage')[]
}

export interface PerformanceMetricsResponse {
  overall_score: number
  metrics: PerformanceMetric[]
  alerts: PerformanceAlert[]
  trends: Record<string, any>
  recommendations: string[]
}

export interface PerformanceMetric {
  id: number
  data_source_id: number
  metric_type: string
  value: number
  unit: string
  threshold?: number
  status: 'good' | 'warning' | 'critical' | 'unknown'
  trend: string
  previous_value?: number
  change_percentage?: number
  measurement_time: string
  time_range: string
  metadata: Record<string, any>
}

export interface PerformanceAlert {
  id: number
  data_source_id: number
  metric_id: number
  alert_type: string
  severity: string
  title: string
  description: string
  status: string
  acknowledged_by?: string
  acknowledged_at?: string
  resolved_at?: string
  created_at: string
}

// Performance APIs
export const getPerformanceMetrics = async (request: PerformanceMetricsRequest): Promise<PerformanceMetricsResponse> => {
  const params = new URLSearchParams()
  if (request.time_range) params.append('time_range', request.time_range)
  if (request.metric_types) request.metric_types.forEach(type => params.append('metric_types', type))
  
  const { data } = await enterpriseApi.get(`/performance/metrics/${request.data_source_id}?${params.toString()}`)
  return data
}

export const createPerformanceMetric = async (metric: Omit<PerformanceMetric, 'id' | 'created_at' | 'updated_at'>): Promise<PerformanceMetric> => {
  const { data } = await enterpriseApi.post('/performance/metrics', metric)
  return data
}

export const acknowledgePerformanceAlert = async (alert_id: number, user_id: string): Promise<PerformanceAlert> => {
  const { data } = await enterpriseApi.post(`/performance/alerts/${alert_id}/acknowledge`, { user_id })
  return data
}

// ============================================================================
// BACKUP & RESTORE APIs
// ============================================================================

export interface BackupStatusResponse {
  recent_backups: BackupOperation[]
  scheduled_backups: BackupSchedule[]
  backup_statistics: Record<string, any>
  storage_usage: Record<string, any>
  recommendations: string[]
}

export interface BackupOperation {
  id: number
  data_source_id: number
  backup_type: 'full' | 'incremental' | 'differential' | 'snapshot' | 'transaction_log'
  backup_name: string
  description?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  backup_size_bytes?: number
  backup_location?: string
  compression_ratio?: number
  created_by?: string
  created_at: string
}

export interface BackupSchedule {
  id: number
  data_source_id: number
  schedule_name: string
  backup_type: 'full' | 'incremental' | 'differential' | 'snapshot' | 'transaction_log'
  cron_expression: string
  is_enabled: boolean
  retention_days: number
  max_backups: number
  next_run?: string
  last_run?: string
  created_by?: string
  created_at: string
}

export interface RestoreOperation {
  id: number
  data_source_id: number
  backup_id: number
  restore_name: string
  description?: string
  target_location?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  progress_percentage: number
  created_by?: string
  created_at: string
}

// Backup APIs
export const getBackupStatus = async (data_source_id: number): Promise<BackupStatusResponse> => {
  const { data } = await enterpriseApi.get(`/backups/status/${data_source_id}`)
  return data
}

export const createBackup = async (backup: Omit<BackupOperation, 'id' | 'status' | 'created_at'>): Promise<BackupOperation> => {
  const { data } = await enterpriseApi.post('/backups', backup)
  return data
}

export const createBackupSchedule = async (schedule: Omit<BackupSchedule, 'id' | 'created_at'>): Promise<BackupSchedule> => {
  const { data } = await enterpriseApi.post('/backups/schedules', schedule)
  return data
}

export const createRestoreOperation = async (restore: Omit<RestoreOperation, 'id' | 'status' | 'progress_percentage' | 'created_at'>): Promise<RestoreOperation> => {
  const { data } = await enterpriseApi.post('/restores', restore)
  return data
}

// ============================================================================
// TASK MANAGEMENT APIs
// ============================================================================

export interface TaskResponse {
  id: number
  data_source_id?: number
  name: string
  description?: string
  task_type: 'scan' | 'backup' | 'cleanup' | 'sync' | 'report' | 'maintenance'
  cron_expression: string
  is_enabled: boolean
  next_run?: string
  last_run?: string
  configuration: Record<string, any>
  retry_count: number
  max_retries: number
  timeout_minutes: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'scheduled'
  created_by: string
  created_at: string
  updated_at: string
}

export interface TaskExecutionResponse {
  id: number
  task_id: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string
  duration_seconds?: number
  result_data?: Record<string, any>
  error_message?: string
  retry_attempt: number
}

export interface TaskStats {
  total_tasks: number
  enabled_tasks: number
  disabled_tasks: number
  running_tasks: number
  successful_executions: number
  failed_executions: number
  success_rate_percentage: number
  avg_execution_time_minutes: number
  next_scheduled_task?: string
  task_types_distribution: Record<string, number>
}

// Task APIs
export const getScheduledTasks = async (data_source_id?: number): Promise<TaskResponse[]> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/tasks${params}`)
  return data
}

export const createTask = async (task: Omit<TaskResponse, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<TaskResponse> => {
  const { data } = await enterpriseApi.post('/tasks', task)
  return data
}

export const updateTask = async (task_id: number, updates: Partial<TaskResponse>): Promise<TaskResponse> => {
  const { data } = await enterpriseApi.put(`/tasks/${task_id}`, updates)
  return data
}

export const executeTask = async (task_id: number, triggered_by: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/tasks/${task_id}/execute`, { triggered_by })
  return data.success
}

export const getTaskStats = async (data_source_id?: number): Promise<TaskStats> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/tasks/stats${params}`)
  return data
}

// ============================================================================
// NOTIFICATION APIs
// ============================================================================

export interface NotificationResponse {
  id: number
  data_source_id?: number
  user_id: string
  title: string
  message: string
  notification_type: 'alert' | 'info' | 'warning' | 'error' | 'success'
  channel: 'email' | 'slack' | 'webhook' | 'sms' | 'in_app'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read'
  sent_at?: string
  delivered_at?: string
  read_at?: string
  recipient: string
  created_at: string
}

// Notification APIs
export const getNotifications = async (user_id?: string): Promise<NotificationResponse[]> => {
  const params = user_id ? `?user_id=${user_id}` : ''
  const { data } = await enterpriseApi.get(`/notifications${params}`)
  return data
}

export const markNotificationRead = async (notification_id: number): Promise<NotificationResponse> => {
  const { data } = await enterpriseApi.post(`/notifications/${notification_id}/read`)
  return data
}

export const createNotification = async (notification: Omit<NotificationResponse, 'id' | 'status' | 'created_at'>): Promise<NotificationResponse> => {
  const { data } = await enterpriseApi.post('/notifications', notification)
  return data
}

// ============================================================================
// INTEGRATION APIs
// ============================================================================

export interface IntegrationResponse {
  id: number
  name: string
  type: 'crm' | 'storage' | 'notification' | 'security' | 'analytics' | 'api'
  provider: string
  status: 'active' | 'inactive' | 'error' | 'connecting' | 'disabled'
  description?: string
  sync_frequency: string
  last_sync?: string
  next_sync?: string
  data_volume: number
  error_count: number
  success_rate: number
  data_source_id: number
  created_at: string
  updated_at: string
}

export interface IntegrationStats {
  total_integrations: number
  active_integrations: number
  error_integrations: number
  total_data_volume: number
  avg_success_rate: number
  last_sync_time?: string
}

// Integration APIs
export const getIntegrations = async (data_source_id?: number): Promise<IntegrationResponse[]> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/integrations${params}`)
  return data
}

export const createIntegration = async (integration: Omit<IntegrationResponse, 'id' | 'created_at' | 'updated_at'>): Promise<IntegrationResponse> => {
  const { data } = await enterpriseApi.post('/integrations', integration)
  return data
}

export const updateIntegration = async (integration_id: number, updates: Partial<IntegrationResponse>): Promise<IntegrationResponse> => {
  const { data } = await enterpriseApi.put(`/integrations/${integration_id}`, updates)
  return data
}

export const triggerIntegrationSync = async (integration_id: number, user_id: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/integrations/${integration_id}/sync`, { user_id })
  return data.success
}

export const getIntegrationStats = async (data_source_id: number): Promise<IntegrationStats> => {
  const { data } = await enterpriseApi.get(`/integrations/stats/${data_source_id}`)
  return data
}

// ============================================================================
// REPORTING APIs
// ============================================================================

export interface ReportResponse {
  id: number
  data_source_id?: number
  name: string
  description?: string
  report_type: 'performance' | 'security' | 'compliance' | 'usage' | 'audit' | 'backup' | 'custom'
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html'
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'scheduled'
  generated_at?: string
  generated_by: string
  file_path?: string
  file_size?: number
  is_scheduled: boolean
  schedule_cron?: string
  next_run?: string
  parameters: Record<string, any>
  filters: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ReportStats {
  total_reports: number
  completed_reports: number
  failed_reports: number
  pending_reports: number
  scheduled_reports: number
  total_size_mb: number
  avg_generation_time_minutes: number
  most_used_type: string
  success_rate_percentage: number
}

// Report APIs
export const getReports = async (data_source_id?: number): Promise<ReportResponse[]> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/reports${params}`)
  return data
}

export const createReport = async (report: Omit<ReportResponse, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ReportResponse> => {
  const { data } = await enterpriseApi.post('/reports', report)
  return data
}

export const generateReport = async (report_id: number, user_id: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/reports/${report_id}/generate`, { user_id })
  return data.success
}

export const getReportStats = async (data_source_id?: number): Promise<ReportStats> => {
  const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
  const { data } = await enterpriseApi.get(`/reports/stats${params}`)
  return data
}

// ============================================================================
// VERSION HISTORY APIs
// ============================================================================

export interface VersionResponse {
  id: number
  data_source_id: number
  version_number: string
  description?: string
  is_current: boolean
  changes: VersionChange[]
  created_by: string
  created_at: string
  activated_at?: string
  tags: string[]
  rollback_info?: RollbackInfo
}

export interface VersionChange {
  id: number
  change_type: 'created' | 'updated' | 'deleted' | 'migrated' | 'rollback'
  field_path: string
  old_value?: string
  new_value?: string
  description: string
  impact_level: 'low' | 'medium' | 'high' | 'critical'
}

export interface RollbackInfo {
  can_rollback: boolean
  rollback_warnings: string[]
  estimated_downtime?: number
  dependencies: string[]
}

export interface VersionStats {
  total_versions: number
  major_versions: number
  minor_versions: number
  patch_versions: number
  avg_time_between_versions: number
  rollback_rate: number
  most_active_data_source: string
}

// Version APIs
export const getVersionHistory = async (data_source_id: number): Promise<VersionResponse[]> => {
  const { data } = await enterpriseApi.get(`/versions/${data_source_id}`)
  return data
}

export const createVersion = async (version: Omit<VersionResponse, 'id' | 'created_at' | 'is_current'>): Promise<VersionResponse> => {
  const { data } = await enterpriseApi.post('/versions', version)
  return data
}

export const activateVersion = async (version_id: number, activated_by: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/versions/${version_id}/activate`, { activated_by })
  return data.success
}

export const rollbackVersion = async (data_source_id: number, target_version_id: number, rolled_back_by: string): Promise<boolean> => {
  const { data } = await enterpriseApi.post(`/versions/rollback`, { data_source_id, target_version_id, rolled_back_by })
  return data.success
}

// ============================================================================
// REACT QUERY HOOKS - ENTERPRISE FEATURES
// ============================================================================

// Security Hooks
export const useSecurityAuditQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['security-audit', data_source_id],
    queryFn: () => getSecurityAudit(data_source_id!),
    enabled: !!data_source_id,
    ...options,
  })
}

export const useCreateSecurityScanMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSecurityScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-audit'] })
    },
  })
}

// Performance Hooks
export const usePerformanceMetricsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['performance-metrics', data_source_id],
    queryFn: () => getPerformanceMetrics({ data_source_id: data_source_id! }),
    enabled: !!data_source_id,
    ...options,
  })
}

export const useCreatePerformanceMetricMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPerformanceMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] })
    },
  })
}

// Backup Hooks
export const useBackupStatusQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['backup-status', data_source_id],
    queryFn: () => getBackupStatus(data_source_id!),
    enabled: !!data_source_id,
    ...options,
  })
}

export const useCreateBackupMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-status'] })
    },
  })
}

// Task Management Hooks
export const useScheduledTasksQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['scheduled-tasks', data_source_id],
    queryFn: () => getScheduledTasks(data_source_id),
    ...options,
  })
}

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-tasks'] })
    },
  })
}

export const useExecuteTaskMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ task_id, triggered_by }: { task_id: number; triggered_by: string }) => 
      executeTask(task_id, triggered_by),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-tasks'] })
    },
  })
}

// Notification Hooks
export const useNotificationsQuery = (user_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['notifications', user_id],
    queryFn: () => getNotifications(user_id),
    ...options,
  })
}

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Integration Hooks
export const useIntegrationsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['integrations', data_source_id],
    queryFn: () => getIntegrations(data_source_id),
    ...options,
  })
}

export const useCreateIntegrationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
  })
}

export const useTriggerIntegrationSyncMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ integration_id, user_id }: { integration_id: number; user_id: string }) => 
      triggerIntegrationSync(integration_id, user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
  })
}

// Report Hooks
export const useReportsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['reports', data_source_id],
    queryFn: () => getReports(data_source_id),
    ...options,
  })
}

export const useCreateReportMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export const useGenerateReportMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ report_id, user_id }: { report_id: number; user_id: string }) => 
      generateReport(report_id, user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

// Version History Hooks
export const useVersionHistoryQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['version-history', data_source_id],
    queryFn: () => getVersionHistory(data_source_id!),
    enabled: !!data_source_id,
    ...options,
  })
}

export const useCreateVersionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['version-history'] })
    },
  })
}

export const useActivateVersionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ version_id, activated_by }: { version_id: number; activated_by: string }) => 
      activateVersion(version_id, activated_by),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['version-history'] })
    },
  })
}

// ============================================================================
// ADDITIONAL ENTERPRISE QUERY HOOKS - LINKING TO EXISTING APIS
// ============================================================================

// User and Workspace Hooks (linking to backend user management)
export const useUserQuery = (options = {}) => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      // This would connect to your user management system
      const { data } = await enterpriseApi.get('/auth/me')
      return data
    },
    ...options,
  })
}

export const useWorkspaceQuery = (workspace_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['workspace', workspace_id],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/workspaces/${workspace_id || 'current'}`)
      return data
    },
    ...options,
  })
}

// Audit Logs Hook
export const useAuditLogsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['audit-logs', data_source_id],
    queryFn: async () => {
      const params = data_source_id ? `?data_source_id=${data_source_id}` : ''
      const { data } = await enterpriseApi.get(`/audit/logs${params}`)
      return data
    },
    ...options,
  })
}

// User Permissions Hook
export const useUserPermissionsQuery = (user_id?: string, options = {}) => {
  return useQuery({
    queryKey: ['user-permissions', user_id],
    queryFn: async () => {
      const params = user_id ? `?user_id=${user_id}` : ''
      const { data } = await enterpriseApi.get(`/auth/permissions${params}`)
      return data
    },
    ...options,
  })
}

// System Health Hook
export const useSystemHealthQuery = (options = {}) => {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const { data } = await enterpriseApi.get('/health/system')
      return data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    ...options,
  })
}

// Data Source Metrics Hook
export const useDataSourceMetricsQuery = (data_source_id?: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-metrics', data_source_id],
    queryFn: async () => {
      const { data } = await enterpriseApi.get(`/scan/data-sources/${data_source_id}/metrics`)
      return data
    },
    enabled: !!data_source_id,
    ...options,
  })
}

// ============================================================================
// EXPORT ALL ENTERPRISE API FUNCTIONS
// ============================================================================

export {
  enterpriseApi,
  getSecurityAudit,
  createSecurityScan,
  updateSecurityVulnerability,
  getPerformanceMetrics,
  createPerformanceMetric,
  acknowledgePerformanceAlert,
  getBackupStatus,
  createBackup,
  createBackupSchedule,
  createRestoreOperation,
  getScheduledTasks,
  createTask,
  updateTask,
  executeTask,
  getTaskStats,
  getNotifications,
  markNotificationRead,
  createNotification,
  getIntegrations,
  createIntegration,
  updateIntegration,
  triggerIntegrationSync,
  getIntegrationStats,
  getReports,
  createReport,
  generateReport,
  getReportStats,
  getVersionHistory,
  createVersion,
  activateVersion,
  rollbackVersion
}

// ============================================================================
// UTILITY FUNCTIONS FOR API MANAGEMENT
// ============================================================================

export function createApiErrorHandler(componentName: string) {
  return (error: any) => {
    console.error(`API Error in ${componentName}:`, error)
    
    // Emit error event for enterprise monitoring
    if (window.enterpriseEventBus) {
      window.enterpriseEventBus.emit('api:error', {
        component: componentName,
        error: error.message,
        timestamp: new Date(),
        url: error.config?.url,
        method: error.config?.method
      })
    }
    
    // You could also show user-friendly error messages here
    return error
  }
}

export function withApiRetry<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  maxRetries: number = 3,
  delayMs: number = 1000
): T {
  return (async (...args: Parameters<T>) => {
    let attempt = 0
    let lastError: any
    
    while (attempt < maxRetries) {
      try {
        return await apiFunction(...args)
      } catch (error) {
        lastError = error
        attempt++
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
        }
      }
    }
    
    throw lastError
  }) as T
}

export function createOptimisticUpdate<TData, TVariables>(
  queryKey: string[],
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData
) {
  return {
    onMutate: async (variables: TVariables) => {
      const queryClient = useQueryClient()
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey })
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey)
      
      // Optimistically update to the new value
      queryClient.setQueryData<TData>(queryKey, oldData => updateFn(oldData, variables))
      
      // Return a context object with the snapshotted value
      return { previousData }
    },
    
    onError: (err: any, variables: TVariables, context: any) => {
      const queryClient = useQueryClient()
      
      // Rollback to the previous value
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    
    onSettled: () => {
      const queryClient = useQueryClient()
      
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey })
    },
  }
}

// ============================================================================
// GLOBAL API EVENT BUS SETUP
// ============================================================================

declare global {
  interface Window {
    enterpriseEventBus: {
      emit: (event: string, data: any) => void
      on: (event: string, handler: (data: any) => void) => void
      off: (event: string, handler: (data: any) => void) => void
    }
  }
}

// Initialize global event bus if not already present
if (typeof window !== 'undefined' && !window.enterpriseEventBus) {
  const listeners: Record<string, ((data: any) => void)[]> = {}
  
  window.enterpriseEventBus = {
    emit: (event: string, data: any) => {
      const eventListeners = listeners[event] || []
      eventListeners.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    },
    
    on: (event: string, handler: (data: any) => void) => {
      if (!listeners[event]) {
        listeners[event] = []
      }
      listeners[event].push(handler)
    },
    
    off: (event: string, handler: (data: any) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(h => h !== handler)
      }
    }
  }
}