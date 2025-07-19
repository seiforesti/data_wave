"use client"

import { useState, useCallback } from "react"
import type { ScanConfig, ScanRun, ScanSchedule } from "../types"
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
  createScanLogicErrorHandler,
  type ScanConfigurationCreateRequest,
  type ScanConfigurationUpdateRequest,
  type ScanRunCreateRequest
} from "../services/scan-logic-apis"

export function useScanSystem() {
  const [error, setError] = useState<string | null>(null)
  const errorHandler = createScanLogicErrorHandler('useScanSystem')

  // Query hooks for data fetching
  const {
    data: scanConfigsData,
    isLoading: scanConfigsLoading,
    error: scanConfigsError,
    refetch: refetchScanConfigs
  } = useScanConfigurationsQuery({ page_size: 100 })

  const {
    data: scanRunsData,
    isLoading: scanRunsLoading,
    error: scanRunsError,
    refetch: refetchScanRuns
  } = useScanRunsQuery({ page_size: 100 })

  const {
    data: scanSchedulesData,
    isLoading: scanSchedulesLoading,
    error: scanSchedulesError,
    refetch: refetchScanSchedules
  } = useScanSchedulesQuery()

  const {
    data: activeRunsData,
    isLoading: activeRunsLoading,
    error: activeRunsError
  } = useActiveRunsQuery()

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError
  } = useScanAnalyticsQuery()

  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    error: statisticsError
  } = useScanStatisticsQuery()

  // Mutation hooks for data operations
  const createScanConfigurationMutation = useCreateScanConfigurationMutation()
  const updateScanConfigurationMutation = useUpdateScanConfigurationMutation()
  const deleteScanConfigurationMutation = useDeleteScanConfigurationMutation()
  const createScanRunMutation = useCreateScanRunMutation()
  const cancelScanRunMutation = useCancelScanRunMutation()

  // Extract data from query responses
  const scanConfigs = scanConfigsData?.configurations || []
  const scanRuns = scanRunsData?.runs || []
  const scanSchedules = scanSchedulesData || []
  const activeRuns = activeRunsData || []

  // Combined loading state
  const loading = scanConfigsLoading || scanRunsLoading || scanSchedulesLoading

  // Combined error state
  const combinedError = scanConfigsError || scanRunsError || scanSchedulesError || activeRunsError || analyticsError || statisticsError
  if (combinedError && !error) {
    setError(errorHandler(combinedError))
  }

  // Create new scan configuration
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
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [createScanConfigurationMutation, errorHandler])

  // Update scan configuration
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

  // Delete scan configuration
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

  // Run scan manually
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
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [createScanRunMutation, errorHandler])

  // Cancel running scan
  const cancelScan = useCallback(async (runId: string) => {
    try {
      setError(null)
      const result = await cancelScanRunMutation.mutateAsync(parseInt(runId))
      return result
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [cancelScanRunMutation, errorHandler])

  // Update scan schedule
  const updateSchedule = useCallback(async (scanId: string, schedule: ScanSchedule["cron"], timezone: string, enabled: boolean) => {
    try {
      setError(null)
      
      // Update the scan configuration with the new schedule
      await updateScan(scanId, {
        schedule: { enabled, cron: schedule, timezone }
      })
      
      // Refetch schedules to get updated data
      await refetchScanSchedules()
    } catch (err: any) {
      const errorMessage = errorHandler(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [updateScan, refetchScanSchedules, errorHandler])

  // Refresh all data
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

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Data
    scanConfigs,
    scanRuns,
    scanSchedules,
    activeRuns,
    analytics: analyticsData,
    statistics: statisticsData,
    
    // Loading states
    loading,
    scanConfigsLoading,
    scanRunsLoading,
    scanSchedulesLoading,
    activeRunsLoading,
    analyticsLoading,
    statisticsLoading,
    
    // Error states
    error,
    scanConfigsError,
    scanRunsError,
    scanSchedulesError,
    activeRunsError,
    analyticsError,
    statisticsError,
    
    // Actions
    createScan,
    updateScan,
    deleteScan,
    runScan,
    cancelScan,
    updateSchedule,
    refreshData,
    clearError,
    
    // Mutation states
    isCreatingScan: createScanConfigurationMutation.isPending,
    isUpdatingScan: updateScanConfigurationMutation.isPending,
    isDeletingScan: deleteScanConfigurationMutation.isPending,
    isRunningScan: createScanRunMutation.isPending,
    isCancellingScan: cancelScanRunMutation.isPending
  }
}
