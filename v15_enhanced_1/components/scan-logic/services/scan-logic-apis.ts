// ============================================================================
// ENTERPRISE SCAN-LOGIC API INTEGRATION - COMPREHENSIVE BACKEND BINDING
// ============================================================================

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { z } from 'zod'

// Import types from backend models
import {
  ScanConfig,
  ScanRun,
  ScanSchedule,
  ScanLog,
  ScanResults,
  DiscoveredEntity,
  ScanIssue,
  ScanAnalytics
} from '../types'

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const scanLogicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for scan operations
})

// Enhanced request interceptor with enterprise features
scanLogicApi.interceptors.request.use((config) => {
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
  config.headers['X-Feature-Set'] = 'scan-logic-enterprise'
  
  return config
})

// Enhanced response interceptor with enterprise error handling
scanLogicApi.interceptors.response.use(
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
      window.enterpriseEventBus.emit('scan-logic:api:request:completed', {
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
      window.enterpriseEventBus.emit('scan-logic:api:request:failed', errorDetails)
    }
    
    // Log enterprise-grade error details
    console.error('Scan-Logic API Error:', errorDetails)
    
    return Promise.reject(error)
  }
)

// ============================================================================
// SCAN CONFIGURATION APIs
// ============================================================================

export interface ScanConfigurationCreateRequest {
  name: string
  description: string
  data_source_id: number
  scan_type: 'full' | 'incremental' | 'sample'
  scope: {
    databases?: string[]
    schemas?: string[]
    tables?: string[]
  }
  settings: {
    enable_pii: boolean
    enable_classification: boolean
    enable_lineage: boolean
    enable_quality: boolean
    sample_size?: number
    parallelism: number
  }
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
  }
}

export interface ScanConfigurationUpdateRequest extends Partial<ScanConfigurationCreateRequest> {}

export interface ScanConfigurationFilters {
  data_source_id?: number
  status?: string
  scan_type?: string
  page?: number
  page_size?: number
}

export interface ScanConfigurationResponse {
  configurations: ScanConfig[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Create scan configuration
export const createScanConfiguration = async (configData: ScanConfigurationCreateRequest): Promise<ScanConfig> => {
  const response = await scanLogicApi.post('/api/scan-logic/configurations', configData)
  return response.data
}

// Get scan configurations with filtering and pagination
export const getScanConfigurations = async (filters: ScanConfigurationFilters = {}): Promise<ScanConfigurationResponse> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })
  
  const response = await scanLogicApi.get(`/api/scan-logic/configurations?${params.toString()}`)
  return response.data
}

// Get specific scan configuration
export const getScanConfiguration = async (configId: number): Promise<ScanConfig> => {
  const response = await scanLogicApi.get(`/api/scan-logic/configurations/${configId}`)
  return response.data
}

// Update scan configuration
export const updateScanConfiguration = async (configId: number, updateData: ScanConfigurationUpdateRequest): Promise<ScanConfig> => {
  const response = await scanLogicApi.put(`/api/scan-logic/configurations/${configId}`, updateData)
  return response.data
}

// Delete scan configuration
export const deleteScanConfiguration = async (configId: number): Promise<{ message: string; success: boolean }> => {
  const response = await scanLogicApi.delete(`/api/scan-logic/configurations/${configId}`)
  return response.data
}

// ============================================================================
// SCAN RUN APIs
// ============================================================================

export interface ScanRunCreateRequest {
  trigger_type?: 'manual' | 'scheduled' | 'api'
  run_name?: string
}

export interface ScanRunFilters {
  config_id?: number
  status?: string
  page?: number
  page_size?: number
}

export interface ScanRunResponse {
  runs: ScanRun[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Create and start a new scan run
export const createScanRun = async (configId: number, runData: ScanRunCreateRequest = {}): Promise<ScanRun> => {
  const response = await scanLogicApi.post(`/api/scan-logic/configurations/${configId}/runs`, runData)
  return response.data
}

// Get scan runs with filtering and pagination
export const getScanRuns = async (filters: ScanRunFilters = {}): Promise<ScanRunResponse> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })
  
  const response = await scanLogicApi.get(`/api/scan-logic/runs?${params.toString()}`)
  return response.data
}

// Get specific scan run
export const getScanRun = async (runId: number): Promise<ScanRun> => {
  const response = await scanLogicApi.get(`/api/scan-logic/runs/${runId}`)
  return response.data
}

// Cancel scan run
export const cancelScanRun = async (runId: number): Promise<ScanRun> => {
  const response = await scanLogicApi.post(`/api/scan-logic/runs/${runId}/cancel`)
  return response.data
}

// ============================================================================
// SCAN RESULTS APIs
// ============================================================================

export interface ScanResultsResponse {
  summary: {
    entities_scanned: number
    tables_scanned: number
    columns_scanned: number
    issues_found: number
    classifications_applied: number
    pii_detected: number
  }
  entities: DiscoveredEntity[]
  issues: ScanIssue[]
  classifications: any[]
  recommendations: any[]
}

// Get scan results
export const getScanResults = async (runId: number): Promise<ScanResultsResponse> => {
  const response = await scanLogicApi.get(`/api/scan-logic/runs/${runId}/results`)
  return response.data
}

// Get scan logs
export const getScanLogs = async (runId: number, filters: { level?: string; limit?: number } = {}): Promise<ScanLog[]> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })
  
  const response = await scanLogicApi.get(`/api/scan-logic/runs/${runId}/logs?${params.toString()}`)
  return response.data
}

// Get discovered entities
export const getDiscoveredEntities = async (runId: number, filters: { entity_type?: string; page?: number; page_size?: number } = {}): Promise<DiscoveredEntity[]> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })
  
  const response = await scanLogicApi.get(`/api/scan-logic/runs/${runId}/entities?${params.toString()}`)
  return response.data
}

// Get scan issues
export const getScanIssues = async (runId: number, filters: { severity?: string; issue_type?: string; status?: string; page?: number; page_size?: number } = {}): Promise<ScanIssue[]> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })
  
  const response = await scanLogicApi.get(`/api/scan-logic/runs/${runId}/issues?${params.toString()}`)
  return response.data
}

// ============================================================================
// SCAN SCHEDULE APIs
// ============================================================================

export interface ScanScheduleCreateRequest {
  scan_id: number
  enabled: boolean
  cron: string
  timezone: string
}

// Get scan schedules
export const getScanSchedules = async (filters: { config_id?: number; enabled?: boolean } = {}): Promise<ScanSchedule[]> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })
  
  const response = await scanLogicApi.get(`/api/scan-logic/schedules?${params.toString()}`)
  return response.data
}

// Enable scan schedule
export const enableScanSchedule = async (scheduleId: number): Promise<{ message: string; success: boolean }> => {
  const response = await scanLogicApi.post(`/api/scan-logic/schedules/${scheduleId}/enable`)
  return response.data
}

// Disable scan schedule
export const disableScanSchedule = async (scheduleId: number): Promise<{ message: string; success: boolean }> => {
  const response = await scanLogicApi.post(`/api/scan-logic/schedules/${scheduleId}/disable`)
  return response.data
}

// ============================================================================
// ANALYTICS APIs
// ============================================================================

export interface ScanAnalyticsFilters {
  data_source_id?: number
  period?: string
  start_date?: string
  end_date?: string
}

// Get scan analytics
export const getScanAnalytics = async (filters: ScanAnalyticsFilters = {}): Promise<ScanAnalytics> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })
  
  const response = await scanLogicApi.get(`/api/scan-logic/analytics?${params.toString()}`)
  return response.data
}

// Get scan statistics
export const getScanStatistics = async (): Promise<any> => {
  const response = await scanLogicApi.get('/api/scan-logic/statistics')
  return response.data
}

// ============================================================================
// MONITORING APIs
// ============================================================================

// Get active runs
export const getActiveRuns = async (): Promise<ScanRun[]> => {
  const response = await scanLogicApi.get('/api/scan-logic/monitoring/active-runs')
  return response.data
}

// Get recent activity
export const getRecentActivity = async (hours: number = 24): Promise<any> => {
  const response = await scanLogicApi.get(`/api/scan-logic/monitoring/recent-activity?hours=${hours}`)
  return response.data
}

// ============================================================================
// ISSUE MANAGEMENT APIs
// ============================================================================

export interface IssueUpdateRequest {
  status?: string
  assigned_to?: string
  resolution_notes?: string
}

// Update scan issue
export const updateScanIssue = async (issueId: number, updateData: IssueUpdateRequest): Promise<ScanIssue> => {
  const response = await scanLogicApi.put(`/api/scan-logic/issues/${issueId}`, updateData)
  return response.data
}

// Assign issue
export const assignIssue = async (issueId: number, assignee: string): Promise<{ message: string; success: boolean }> => {
  const response = await scanLogicApi.post(`/api/scan-logic/issues/${issueId}/assign`, { assignee })
  return response.data
}

// Resolve issue
export const resolveIssue = async (issueId: number, resolutionNotes?: string): Promise<{ message: string; success: boolean }> => {
  const response = await scanLogicApi.post(`/api/scan-logic/issues/${issueId}/resolve`, { resolution_notes: resolutionNotes })
  return response.data
}

// ============================================================================
// BULK OPERATIONS APIs
// ============================================================================

export interface BulkUpdateRequest {
  updates: Array<{
    config_id: number
    updates: ScanConfigurationUpdateRequest
  }>
}

// Bulk update configurations
export const bulkUpdateConfigurations = async (updates: BulkUpdateRequest): Promise<{ message: string; success: boolean }> => {
  const response = await scanLogicApi.post('/api/scan-logic/configurations/bulk-update', updates)
  return response.data
}

// Bulk cancel runs
export const bulkCancelRuns = async (runIds: number[]): Promise<{ message: string; success: boolean }> => {
  const response = await scanLogicApi.post('/api/scan-logic/runs/bulk-cancel', { run_ids: runIds })
  return response.data
}

// ============================================================================
// EXPORT APIs
// ============================================================================

// Export scan results
export const exportScanResults = async (runId: number, format: string = 'json'): Promise<Blob> => {
  const response = await scanLogicApi.get(`/api/scan-logic/export/results/${runId}?format=${format}`, {
    responseType: 'blob'
  })
  return response.data
}

// Export analytics
export const exportAnalytics = async (filters: { data_source_id?: number; start_date?: string; end_date?: string; format?: string } = {}): Promise<Blob> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })
  
  const response = await scanLogicApi.get(`/api/scan-logic/export/analytics?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}

// ============================================================================
// REACT QUERY HOOKS - SCAN CONFIGURATIONS
// ============================================================================

export const useScanConfigurationsQuery = (filters: ScanConfigurationFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['scan-configurations', filters],
    queryFn: () => getScanConfigurations(filters),
    ...options
  })
}

export const useScanConfigurationQuery = (configId: number, options = {}) => {
  return useQuery({
    queryKey: ['scan-configuration', configId],
    queryFn: () => getScanConfiguration(configId),
    enabled: !!configId,
    ...options
  })
}

export const useCreateScanConfigurationMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createScanConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-configurations'] })
    }
  })
}

export const useUpdateScanConfigurationMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ configId, updateData }: { configId: number; updateData: ScanConfigurationUpdateRequest }) =>
      updateScanConfiguration(configId, updateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scan-configurations'] })
      queryClient.invalidateQueries({ queryKey: ['scan-configuration', variables.configId] })
    }
  })
}

export const useDeleteScanConfigurationMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteScanConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-configurations'] })
    }
  })
}

// ============================================================================
// REACT QUERY HOOKS - SCAN RUNS
// ============================================================================

export const useScanRunsQuery = (filters: ScanRunFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['scan-runs', filters],
    queryFn: () => getScanRuns(filters),
    ...options
  })
}

export const useScanRunQuery = (runId: number, options = {}) => {
  return useQuery({
    queryKey: ['scan-run', runId],
    queryFn: () => getScanRun(runId),
    enabled: !!runId,
    ...options
  })
}

export const useCreateScanRunMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ configId, runData }: { configId: number; runData?: ScanRunCreateRequest }) =>
      createScanRun(configId, runData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-runs'] })
      queryClient.invalidateQueries({ queryKey: ['active-runs'] })
    }
  })
}

export const useCancelScanRunMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: cancelScanRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-runs'] })
      queryClient.invalidateQueries({ queryKey: ['active-runs'] })
    }
  })
}

// ============================================================================
// REACT QUERY HOOKS - SCAN RESULTS
// ============================================================================

export const useScanResultsQuery = (runId: number, options = {}) => {
  return useQuery({
    queryKey: ['scan-results', runId],
    queryFn: () => getScanResults(runId),
    enabled: !!runId,
    ...options
  })
}

export const useScanLogsQuery = (runId: number, filters: { level?: string; limit?: number } = {}, options = {}) => {
  return useQuery({
    queryKey: ['scan-logs', runId, filters],
    queryFn: () => getScanLogs(runId, filters),
    enabled: !!runId,
    ...options
  })
}

export const useDiscoveredEntitiesQuery = (runId: number, filters: { entity_type?: string; page?: number; page_size?: number } = {}, options = {}) => {
  return useQuery({
    queryKey: ['discovered-entities', runId, filters],
    queryFn: () => getDiscoveredEntities(runId, filters),
    enabled: !!runId,
    ...options
  })
}

export const useScanIssuesQuery = (runId: number, filters: { severity?: string; issue_type?: string; status?: string; page?: number; page_size?: number } = {}, options = {}) => {
  return useQuery({
    queryKey: ['scan-issues', runId, filters],
    queryFn: () => getScanIssues(runId, filters),
    enabled: !!runId,
    ...options
  })
}

// ============================================================================
// REACT QUERY HOOKS - SCAN SCHEDULES
// ============================================================================

export const useScanSchedulesQuery = (filters: { config_id?: number; enabled?: boolean } = {}, options = {}) => {
  return useQuery({
    queryKey: ['scan-schedules', filters],
    queryFn: () => getScanSchedules(filters),
    ...options
  })
}

export const useEnableScanScheduleMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: enableScanSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-schedules'] })
    }
  })
}

export const useDisableScanScheduleMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: disableScanSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-schedules'] })
    }
  })
}

// ============================================================================
// REACT QUERY HOOKS - ANALYTICS
// ============================================================================

export const useScanAnalyticsQuery = (filters: ScanAnalyticsFilters = {}, options = {}) => {
  return useQuery({
    queryKey: ['scan-analytics', filters],
    queryFn: () => getScanAnalytics(filters),
    ...options
  })
}

export const useScanStatisticsQuery = (options = {}) => {
  return useQuery({
    queryKey: ['scan-statistics'],
    queryFn: getScanStatistics,
    ...options
  })
}

// ============================================================================
// REACT QUERY HOOKS - MONITORING
// ============================================================================

export const useActiveRunsQuery = (options = {}) => {
  return useQuery({
    queryKey: ['active-runs'],
    queryFn: getActiveRuns,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time monitoring
    ...options
  })
}

export const useRecentActivityQuery = (hours: number = 24, options = {}) => {
  return useQuery({
    queryKey: ['recent-activity', hours],
    queryFn: () => getRecentActivity(hours),
    ...options
  })
}

// ============================================================================
// REACT QUERY HOOKS - ISSUE MANAGEMENT
// ============================================================================

export const useUpdateScanIssueMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ issueId, updateData }: { issueId: number; updateData: IssueUpdateRequest }) =>
      updateScanIssue(issueId, updateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scan-issues'] })
    }
  })
}

export const useAssignIssueMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ issueId, assignee }: { issueId: number; assignee: string }) =>
      assignIssue(issueId, assignee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-issues'] })
    }
  })
}

export const useResolveIssueMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ issueId, resolutionNotes }: { issueId: number; resolutionNotes?: string }) =>
      resolveIssue(issueId, resolutionNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-issues'] })
    }
  })
}

// ============================================================================
// REACT QUERY HOOKS - BULK OPERATIONS
// ============================================================================

export const useBulkUpdateConfigurationsMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: bulkUpdateConfigurations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-configurations'] })
    }
  })
}

export const useBulkCancelRunsMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: bulkCancelRuns,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-runs'] })
      queryClient.invalidateQueries({ queryKey: ['active-runs'] })
    }
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createScanLogicErrorHandler(componentName: string) {
  return (error: any) => {
    console.error(`[${componentName}] Scan-Logic API Error:`, error)
    
    // Emit error event for monitoring
    if (window.enterpriseEventBus) {
      window.enterpriseEventBus.emit('scan-logic:error', {
        component: componentName,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
    
    // Return user-friendly error message
    return error.response?.data?.message || error.message || 'An unexpected error occurred'
  }
}

export function withScanLogicRetry<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  maxRetries: number = 3,
  delayMs: number = 1000
): T {
  return (async (...args: any[]) => {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiFunction(...args)
      } catch (error: any) {
        lastError = error
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error
        }
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
        }
      }
    }
    
    throw lastError
  }) as T
}

export function createScanLogicOptimisticUpdate<TData, TVariables>(
  queryKey: string[],
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData
) {
  return (queryClient: any) => ({
    onMutate: async (variables: TVariables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey })
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey)
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: TData | undefined) => updateFn(old, variables))
      
      // Return a context object with the snapshotted value
      return { previousData }
    },
    onError: (err: any, variables: TVariables, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey })
    }
  })
}

// ============================================================================
// TYPE DECLARATIONS
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