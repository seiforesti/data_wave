"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { ScanConfig, ScanRun, ScanSchedule, ScanIssue, DiscoveredEntity } from "../types"
import {
  useScanConfigurationsQuery,
  useScanRunsQuery,
  useScanSchedulesQuery,
  useCreateScanConfigurationMutation,
  useUpdateScanConfigurationMutation,
  useDeleteScanConfigurationMutation,
  useCreateScanRunMutation,
  useCancelScanRunMutation,
  useActiveRunsQuery,
  useScanAnalyticsQuery,
  useScanStatisticsQuery,
  useScanResultsQuery,
  useScanLogsQuery,
  useDiscoveredEntitiesQuery,
  useScanIssuesQuery,
  useUpdateScanIssueMutation,
  useAssignIssueMutation,
  useResolveIssueMutation,
  useBulkUpdateConfigurationsMutation,
  useBulkCancelRunsMutation,
  useRecentActivityQuery,
  createScanLogicErrorHandler,
  type ScanConfigurationCreateRequest,
  type ScanConfigurationUpdateRequest,
  type ScanRunCreateRequest,
  type IssueUpdateRequest
} from "../services/scan-logic-apis"

export interface ScanSystemFilters {
  dataSourceId?: number
  status?: string
  scanType?: string
  severity?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface ScanSystemMetrics {
  totalScans: number
  activeScans: number
  completedScans: number
  failedScans: number
  totalIssues: number
  criticalIssues: number
  highIssues: number
  mediumIssues: number
  lowIssues: number
  avgScanDuration: number
  successRate: number
  dataSourcesScanned: number
}

export interface RealTimeUpdate {
  type: 'scan_progress' | 'scan_completed' | 'scan_failed' | 'issue_detected' | 'schedule_triggered'
  data: any
  timestamp: string
}

export function useEnterpriseScanSystem(filters: ScanSystemFilters = {}) {
  const [error, setError] = useState<string | null>(null)
  const [selectedScanRun, setSelectedScanRun] = useState<ScanRun | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<ScanIssue | null>(null)
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeUpdate[]>([])
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const errorHandler = createScanLogicErrorHandler('useEnterpriseScanSystem')

  // Query hooks for data fetching with filters
  const {
    data: scanConfigsData,
    isLoading: scanConfigsLoading,
    error: scanConfigsError,
    refetch: refetchScanConfigs
  } = useScanConfigurationsQuery({
    data_source_id: filters.dataSourceId,
    status: filters.status,
    scan_type: filters.scanType,
    page_size: 100
  })

  const {
    data: scanRunsData,
    isLoading: scanRunsLoading,
    error: scanRunsError,
    refetch: refetchScanRuns
  } = useScanRunsQuery({
    config_id: filters.dataSourceId,
    status: filters.status,
    page_size: 100
  })

  const {
    data: scanSchedulesData,
    isLoading: scanSchedulesLoading,
    error: scanSchedulesError,
    refetch: refetchScanSchedules
  } = useScanSchedulesQuery({
    config_id: filters.dataSourceId
  })

  const {
    data: activeRunsData,
    isLoading: activeRunsLoading,
    error: activeRunsError
  } = useActiveRunsQuery()

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError
  } = useScanAnalyticsQuery({
    data_source_id: filters.dataSourceId,
    start_date: filters.dateRange?.start.toISOString(),
    end_date: filters.dateRange?.end.toISOString()
  })

  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    error: statisticsError
  } = useScanStatisticsQuery()

  const {
    data: recentActivityData,
    isLoading: recentActivityLoading,
    error: recentActivityError
  } = useRecentActivityQuery(24)

  // Selected scan run details
  const {
    data: selectedRunResults,
    isLoading: selectedRunResultsLoading,
    error: selectedRunResultsError
  } = useScanResultsQuery(selectedScanRun?.id ? parseInt(selectedScanRun.id) : 0, {
    enabled: !!selectedScanRun?.id
  })

  const {
    data: selectedRunLogs,
    isLoading: selectedRunLogsLoading,
    error: selectedRunLogsError
  } = useScanLogsQuery(selectedScanRun?.id ? parseInt(selectedScanRun.id) : 0, {
    enabled: !!selectedScanRun?.id
  })

  const {
    data: selectedRunEntities,
    isLoading: selectedRunEntitiesLoading,
    error: selectedRunEntitiesError
  } = useDiscoveredEntitiesQuery(selectedScanRun?.id ? parseInt(selectedScanRun.id) : 0, {
    enabled: !!selectedScanRun?.id
  })

  const {
    data: selectedRunIssues,
    isLoading: selectedRunIssuesLoading,
    error: selectedRunIssuesError
  } = useScanIssuesQuery(selectedScanRun?.id ? parseInt(selectedScanRun.id) : 0, {
    severity: filters.severity,
    enabled: !!selectedScanRun?.id
  })

  // Mutation hooks
  const createScanConfigurationMutation = useCreateScanConfigurationMutation()
  const updateScanConfigurationMutation = useUpdateScanConfigurationMutation()
  const deleteScanConfigurationMutation = useDeleteScanConfigurationMutation()
  const createScanRunMutation = useCreateScanRunMutation()
  const cancelScanRunMutation = useCancelScanRunMutation()
  const updateScanIssueMutation = useUpdateScanIssueMutation()
  const assignIssueMutation = useAssignIssueMutation()
  const resolveIssueMutation = useResolveIssueMutation()
  const bulkUpdateConfigurationsMutation = useBulkUpdateConfigurationsMutation()
  const bulkCancelRunsMutation = useBulkCancelRunsMutation()

  // Extract data from query responses
  const scanConfigs = scanConfigsData?.configurations || []
  const scanRuns = scanRunsData?.runs || []
  const scanSchedules = scanSchedulesData || []
  const activeRuns = activeRunsData || []
  const recentActivity = recentActivityData || []

  // Combined loading states
  const loading = scanConfigsLoading || scanRunsLoading || scanSchedulesLoading
  const detailsLoading = selectedRunResultsLoading || selectedRunLogsLoading || selectedRunEntitiesLoading || selectedRunIssuesLoading

  // Combined error state
  const combinedError = scanConfigsError || scanRunsError || scanSchedulesError || activeRunsError || 
                       analyticsError || statisticsError || recentActivityError || selectedRunResultsError || 
                       selectedRunLogsError || selectedRunEntitiesError || selectedRunIssuesError
  
  if (combinedError && !error) {
    setError(errorHandler(combinedError))
  }

  // Calculate metrics
  const metrics: ScanSystemMetrics = {
    totalScans: scanRuns.length,
    activeScans: activeRuns.length,
    completedScans: scanRuns.filter(run => run.status === 'completed').length,
    failedScans: scanRuns.filter(run => run.status === 'failed').length,
    totalIssues: selectedRunIssues?.length || 0,
    criticalIssues: selectedRunIssues?.filter(issue => issue.severity === 'critical').length || 0,
    highIssues: selectedRunIssues?.filter(issue => issue.severity === 'high').length || 0,
    mediumIssues: selectedRunIssues?.filter(issue => issue.severity === 'medium').length || 0,
    lowIssues: selectedRunIssues?.filter(issue => issue.severity === 'low').length || 0,
    avgScanDuration: scanRuns.length > 0 
      ? scanRuns.reduce((acc, run) => acc + (run.duration || 0), 0) / scanRuns.length 
      : 0,
    successRate: scanRuns.length > 0 
      ? (scanRuns.filter(run => run.status === 'completed').length / scanRuns.length) * 100 
      : 0,
    dataSourcesScanned: new Set(scanRuns.map(run => run.dataSourceName)).size
  }

  // Real-time monitoring setup
  useEffect(() => {
    if (isRealTimeEnabled && activeRuns.length > 0) {
      // Set up real-time monitoring for active runs
      realTimeIntervalRef.current = setInterval(() => {
        // Simulate real-time updates (in real implementation, this would be WebSocket or SSE)
        const updates: RealTimeUpdate[] = activeRuns.map(run => ({
          type: 'scan_progress',
          data: {
            runId: run.id,
            progress: Math.min((run.progress || 0) + Math.random() * 5, 100),
            entitiesScanned: Math.floor(Math.random() * 100),
            issuesFound: Math.floor(Math.random() * 3)
          },
          timestamp: new Date().toISOString()
        }))
        
        setRealTimeUpdates(prev => [...updates, ...prev.slice(0, 49)]) // Keep last 50 updates
      }, 3000) // Update every 3 seconds
    } else {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current)
        realTimeIntervalRef.current = null
      }
    }

    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current)
      }
    }
  }, [isRealTimeEnabled, activeRuns])

  // Core scan operations
  const createScan = useCallback(async (scanData: Omit<ScanConfig, "id" | "createdAt" | "updatedAt">) => {
    try {
      setError(null)
      
      const requestData: ScanConfigurationCreateRequest = {
        name: scanData.name,
        description: scanData.description,
        data_source_id: parseInt(scanData.dataSourceId),
        scan_type: scanData.scanType,
        scope: scanData.scope,
        settings: {
          enable_pii: scanData.settings.enablePII,
          enable_classification: scanData.settings.enableClassification,
          enable_lineage: scanData.settings.enableLineage,
          enable_quality: scanData.settings.enableQuality,
          sample_size: scanData.settings.sampleSize,
          parallelism: scanData.settings.parallelism
        },
        schedule: scanData.schedule
      }

      const result = await createScanConfigurationMutation.mutateAsync(requestData)
      
      // Add real-time update
      setRealTimeUpdates(prev => [{
        type: 'schedule_triggered',
        data: { scanId: result.id, scanName: result.name },
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 49)])
      
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [createScanConfigurationMutation, errorHandler])

  const updateScan = useCallback(async (id: string, updates: Partial<ScanConfig>) => {
    try {
      setError(null)
      
      const requestData: ScanConfigurationUpdateRequest = {
        name: updates.name,
        description: updates.description,
        data_source_id: updates.dataSourceId ? parseInt(updates.dataSourceId) : undefined,
        scan_type: updates.scanType,
        scope: updates.scope,
        settings: updates.settings ? {
          enable_pii: updates.settings.enablePII,
          enable_classification: updates.settings.enableClassification,
          enable_lineage: updates.settings.enableLineage,
          enable_quality: updates.settings.enableQuality,
          sample_size: updates.settings.sampleSize,
          parallelism: updates.settings.parallelism
        } : undefined,
        schedule: updates.schedule
      }

      const result = await updateScanConfigurationMutation.mutateAsync({
        configId: parseInt(id),
        updateData: requestData
      })
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [updateScanConfigurationMutation, errorHandler])

  const deleteScan = useCallback(async (id: string) => {
    try {
      setError(null)
      await deleteScanConfigurationMutation.mutateAsync(parseInt(id))
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [deleteScanConfigurationMutation, errorHandler])

  const runScan = useCallback(async (scanId: string) => {
    try {
      setError(null)
      
      const runData: ScanRunCreateRequest = {
        trigger_type: 'manual',
        run_name: `Manual run - ${new Date().toLocaleString()}`
      }

      const result = await createScanRunMutation.mutateAsync({
        configId: parseInt(scanId),
        runData
      })
      
      // Add real-time update
      setRealTimeUpdates(prev => [{
        type: 'scan_progress',
        data: { runId: result.id, scanName: result.scanName, status: 'started' },
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 49)])
      
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [createScanRunMutation, errorHandler])

  const cancelScan = useCallback(async (runId: string) => {
    try {
      setError(null)
      const result = await cancelScanRunMutation.mutateAsync(parseInt(runId))
      
      // Add real-time update
      setRealTimeUpdates(prev => [{
        type: 'scan_failed',
        data: { runId: result.id, scanName: result.scanName, reason: 'Cancelled by user' },
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 49)])
      
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [cancelScanRunMutation, errorHandler])

  // Issue management operations
  const updateIssue = useCallback(async (issueId: number, updates: IssueUpdateRequest) => {
    try {
      setError(null)
      const result = await updateScanIssueMutation.mutateAsync({ issueId, updateData: updates })
      
      // Add real-time update for critical issues
      if (result.severity === 'critical') {
        setRealTimeUpdates(prev => [{
          type: 'issue_detected',
          data: { issueId: result.id, severity: result.severity, title: result.title },
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 49)])
      }
      
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [updateScanIssueMutation, errorHandler])

  const assignIssue = useCallback(async (issueId: number, assignee: string) => {
    try {
      setError(null)
      const result = await assignIssueMutation.mutateAsync({ issueId, assignee })
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [assignIssueMutation, errorHandler])

  const resolveIssue = useCallback(async (issueId: number, resolutionNotes?: string) => {
    try {
      setError(null)
      const result = await resolveIssueMutation.mutateAsync({ issueId, resolutionNotes })
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [resolveIssueMutation, errorHandler])

  // Bulk operations
  const bulkUpdateConfigurations = useCallback(async (updates: Array<{ configId: number; updates: Partial<ScanConfig> }>) => {
    try {
      setError(null)
      const requestData = {
        updates: updates.map(({ configId, updates: updateData }) => ({
          config_id: configId,
          updates: {
            name: updateData.name,
            description: updateData.description,
            data_source_id: updateData.dataSourceId ? parseInt(updateData.dataSourceId) : undefined,
            scan_type: updateData.scanType,
            scope: updateData.scope,
            settings: updateData.settings ? {
              enable_pii: updateData.settings.enablePII,
              enable_classification: updateData.settings.enableClassification,
              enable_lineage: updateData.settings.enableLineage,
              enable_quality: updateData.settings.enableQuality,
              sample_size: updateData.settings.sampleSize,
              parallelism: updateData.settings.parallelism
            } : undefined,
            schedule: updateData.schedule
          }
        }))
      }
      
      const result = await bulkUpdateConfigurationsMutation.mutateAsync(requestData)
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [bulkUpdateConfigurationsMutation, errorHandler])

  const bulkCancelRuns = useCallback(async (runIds: string[]) => {
    try {
      setError(null)
      const result = await bulkCancelRunsMutation.mutateAsync(runIds.map(id => parseInt(id)))
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [bulkCancelRunsMutation, errorHandler])

  // Utility functions
  const selectScanRun = useCallback((run: ScanRun | null) => {
    setSelectedScanRun(run)
  }, [])

  const selectIssue = useCallback((issue: ScanIssue | null) => {
    setSelectedIssue(issue)
  }, [])

  const toggleRealTime = useCallback(() => {
    setIsRealTimeEnabled(prev => !prev)
  }, [])

  const clearRealTimeUpdates = useCallback(() => {
    setRealTimeUpdates([])
  }, [])

  const refreshData = useCallback(async () => {
    try {
      setError(null)
      await Promise.all([
        refetchScanConfigs(),
        refetchScanRuns(),
        refetchScanSchedules()
      ])
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
    }
  }, [refetchScanConfigs, refetchScanRuns, refetchScanSchedules, errorHandler])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Data
    scanConfigs,
    scanRuns,
    scanSchedules,
    activeRuns,
    recentActivity,
    analytics: analyticsData,
    statistics: statisticsData,
    metrics,
    
    // Selected items
    selectedScanRun,
    selectedIssue,
    selectedRunResults,
    selectedRunLogs,
    selectedRunEntities,
    selectedRunIssues,
    
    // Real-time features
    realTimeUpdates,
    isRealTimeEnabled,
    
    // Loading states
    loading,
    detailsLoading,
    scanConfigsLoading,
    scanRunsLoading,
    scanSchedulesLoading,
    activeRunsLoading,
    analyticsLoading,
    statisticsLoading,
    recentActivityLoading,
    
    // Error states
    error,
    scanConfigsError,
    scanRunsError,
    scanSchedulesError,
    activeRunsError,
    analyticsError,
    statisticsError,
    recentActivityError,
    selectedRunResultsError,
    selectedRunLogsError,
    selectedRunEntitiesError,
    selectedRunIssuesError,
    
    // Actions
    createScan,
    updateScan,
    deleteScan,
    runScan,
    cancelScan,
    updateIssue,
    assignIssue,
    resolveIssue,
    bulkUpdateConfigurations,
    bulkCancelRuns,
    selectScanRun,
    selectIssue,
    toggleRealTime,
    clearRealTimeUpdates,
    refreshData,
    clearError,
    
    // Mutation states
    isCreatingScan: createScanConfigurationMutation.isPending,
    isUpdatingScan: updateScanConfigurationMutation.isPending,
    isDeletingScan: deleteScanConfigurationMutation.isPending,
    isRunningScan: createScanRunMutation.isPending,
    isCancellingScan: cancelScanRunMutation.isPending,
    isUpdatingIssue: updateScanIssueMutation.isPending,
    isAssigningIssue: assignIssueMutation.isPending,
    isResolvingIssue: resolveIssueMutation.isPending,
    isBulkUpdating: bulkUpdateConfigurationsMutation.isPending,
    isBulkCancelling: bulkCancelRunsMutation.isPending
  }
}