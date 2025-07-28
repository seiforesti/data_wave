/**
 * Advanced Catalog Discovery Hooks - Complete State Management
 * ==========================================================
 * 
 * This file provides comprehensive React hooks for managing catalog discovery
 * operations with real-time updates, intelligent caching, and error handling.
 * 
 * Features:
 * - Real-time discovery job monitoring
 * - AI-powered asset discovery management
 * - Intelligent state management with caching
 * - Comprehensive error handling and recovery
 * - WebSocket integration for live updates
 * - Performance optimization with debouncing
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'

import discoveryApiClient from '../services/catalog-discovery-apis'
import {
  DiscoveryEngine,
  DiscoveryJob,
  DiscoveryJobResults,
  DiscoveredAsset,
  DiscoveryProgress,
  DiscoveryAnomaly,
  DiscoveryRecommendation,
  DiscoveryMonitoring,
  DiscoveryAlert,
  DiscoverySourceConfig,
  DiscoveryJobConfig,
  DiscoveryScheduleConfig
} from '../types/discovery.types'
import { IntelligentDataAsset } from '../types/catalog-core.types'

// ===================== DISCOVERY ENGINE HOOKS =====================

export const useDiscoveryEngines = () => {
  const { toast } = useToast()

  const {
    data: engines = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['discovery', 'engines'],
    queryFn: () => discoveryApiClient.getDiscoveryEngines(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to load discovery engines',
        description: error.message,
      })
    },
  })

  const createEngineMutation = useMutation({
    mutationFn: (engine: Partial<DiscoveryEngine>) =>
      discoveryApiClient.createDiscoveryEngine(engine),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery engine created',
        description: 'The discovery engine has been successfully created.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create discovery engine',
        description: error.message,
      })
    },
  })

  const updateEngineMutation = useMutation({
    mutationFn: ({ engineId, updates }: { engineId: string; updates: Partial<DiscoveryEngine> }) =>
      discoveryApiClient.updateDiscoveryEngine(engineId, updates),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery engine updated',
        description: 'The discovery engine has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update discovery engine',
        description: error.message,
      })
    },
  })

  const deleteEngineMutation = useMutation({
    mutationFn: (engineId: string) => discoveryApiClient.deleteDiscoveryEngine(engineId),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery engine deleted',
        description: 'The discovery engine has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete discovery engine',
        description: error.message,
      })
    },
  })

  const startEngineMutation = useMutation({
    mutationFn: (engineId: string) => discoveryApiClient.startDiscoveryEngine(engineId),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery engine started',
        description: 'The discovery engine has been successfully started.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to start discovery engine',
        description: error.message,
      })
    },
  })

  const stopEngineMutation = useMutation({
    mutationFn: (engineId: string) => discoveryApiClient.stopDiscoveryEngine(engineId),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery engine stopped',
        description: 'The discovery engine has been successfully stopped.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to stop discovery engine',
        description: error.message,
      })
    },
  })

  return {
    engines,
    isLoading,
    error,
    refetch,
    createEngine: createEngineMutation.mutate,
    updateEngine: updateEngineMutation.mutate,
    deleteEngine: deleteEngineMutation.mutate,
    startEngine: startEngineMutation.mutate,
    stopEngine: stopEngineMutation.mutate,
    isCreating: createEngineMutation.isLoading,
    isUpdating: updateEngineMutation.isLoading,
    isDeleting: deleteEngineMutation.isLoading,
    isStarting: startEngineMutation.isLoading,
    isStopping: stopEngineMutation.isLoading,
  }
}

export const useDiscoveryEngine = (engineId: string | undefined) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['discovery', 'engines', engineId],
    queryFn: () => discoveryApiClient.getDiscoveryEngine(engineId!),
    enabled: !!engineId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to load discovery engine',
        description: error.message,
      })
    },
  })
}

export const useDiscoveryEngineMetrics = (engineId: string | undefined, timeRange?: string) => {
  return useQuery({
    queryKey: ['discovery', 'engines', engineId, 'metrics', timeRange],
    queryFn: () => discoveryApiClient.getDiscoveryEngineMetrics(engineId!, timeRange),
    enabled: !!engineId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  })
}

// ===================== DISCOVERY JOB HOOKS =====================

export const useDiscoveryJobs = (params?: {
  status?: string
  job_type?: string
  created_after?: string
  created_before?: string
  page?: number
  page_size?: number
}) => {
  const { toast } = useToast()
  const debouncedParams = useDebounce(params, 300)

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['discovery', 'jobs', debouncedParams],
    queryFn: () => discoveryApiClient.getDiscoveryJobs(debouncedParams),
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true,
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to load discovery jobs',
        description: error.message,
      })
    },
  })

  const createJobMutation = useMutation({
    mutationFn: (jobConfig: {
      job_name: string
      job_type: string
      source_config: DiscoverySourceConfig
      discovery_config: DiscoveryJobConfig
      schedule_config?: DiscoveryScheduleConfig
    }) => discoveryApiClient.createDiscoveryJob(jobConfig),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery job created',
        description: 'The discovery job has been successfully created.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create discovery job',
        description: error.message,
      })
    },
  })

  const updateJobMutation = useMutation({
    mutationFn: ({ jobId, updates }: { jobId: string; updates: Partial<DiscoveryJob> }) =>
      discoveryApiClient.updateDiscoveryJob(jobId, updates),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery job updated',
        description: 'The discovery job has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update discovery job',
        description: error.message,
      })
    },
  })

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => discoveryApiClient.deleteDiscoveryJob(jobId),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery job deleted',
        description: 'The discovery job has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete discovery job',
        description: error.message,
      })
    },
  })

  const startJobMutation = useMutation({
    mutationFn: (jobId: string) => discoveryApiClient.startDiscoveryJob(jobId),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery job started',
        description: 'The discovery job has been successfully started.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to start discovery job',
        description: error.message,
      })
    },
  })

  const stopJobMutation = useMutation({
    mutationFn: (jobId: string) => discoveryApiClient.stopDiscoveryJob(jobId),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery job stopped',
        description: 'The discovery job has been successfully stopped.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to stop discovery job',
        description: error.message,
      })
    },
  })

  return {
    jobs: data?.jobs || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.page_size || 20,
    isLoading,
    error,
    refetch,
    createJob: createJobMutation.mutate,
    updateJob: updateJobMutation.mutate,
    deleteJob: deleteJobMutation.mutate,
    startJob: startJobMutation.mutate,
    stopJob: stopJobMutation.mutate,
    isCreating: createJobMutation.isLoading,
    isUpdating: updateJobMutation.isLoading,
    isDeleting: deleteJobMutation.isLoading,
    isStarting: startJobMutation.isLoading,
    isStopping: stopJobMutation.isLoading,
  }
}

export const useDiscoveryJob = (jobId: string | undefined) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['discovery', 'jobs', jobId],
    queryFn: () => discoveryApiClient.getDiscoveryJob(jobId!),
    enabled: !!jobId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: (data) => {
      // Auto-refresh running jobs more frequently
      if (data?.status === 'RUNNING') return 5 * 1000 // 5 seconds
      if (data?.status === 'PENDING') return 10 * 1000 // 10 seconds
      return false // Don't auto-refresh completed jobs
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to load discovery job',
        description: error.message,
      })
    },
  })
}

// ===================== REAL-TIME DISCOVERY PROGRESS HOOK =====================

export const useDiscoveryJobProgress = (jobId: string | undefined) => {
  const [progress, setProgress] = useState<DiscoveryProgress | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const { toast } = useToast()

  // Fallback polling query
  const { data: polledProgress } = useQuery({
    queryKey: ['discovery', 'jobs', jobId, 'progress'],
    queryFn: () => discoveryApiClient.getDiscoveryJobProgress(jobId!),
    enabled: !!jobId && !isConnected,
    refetchInterval: 2 * 1000, // 2 seconds when not connected to real-time
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to load job progress',
        description: error.message,
      })
    },
  })

  useEffect(() => {
    if (!jobId) return

    // Try to establish real-time connection
    const connectToRealTime = async () => {
      try {
        const eventSource = await discoveryApiClient.subscribeToDiscoveryEvents(
          ['JOB_PROGRESS', 'JOB_STATUS_CHANGE'],
          (event) => {
            if (event.job_id === jobId && event.type === 'JOB_PROGRESS') {
              setProgress(event.progress)
            }
          }
        )

        eventSourceRef.current = eventSource
        setIsConnected(true)

        eventSource.onopen = () => setIsConnected(true)
        eventSource.onerror = () => setIsConnected(false)
      } catch (error) {
        console.warn('Failed to establish real-time connection, falling back to polling')
        setIsConnected(false)
      }
    }

    connectToRealTime()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      setIsConnected(false)
    }
  }, [jobId])

  // Use real-time progress if available, otherwise use polled data
  const currentProgress = progress || polledProgress

  return {
    progress: currentProgress,
    isConnected,
    isLoading: !currentProgress,
  }
}

// ===================== DISCOVERED ASSETS HOOKS =====================

export const useDiscoveredAssets = (params?: {
  job_id?: string
  discovery_method?: string
  confidence_min?: number
  asset_type?: string
  validation_status?: string
  page?: number
  page_size?: number
}) => {
  const { toast } = useToast()
  const debouncedParams = useDebounce(params, 300)

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['discovery', 'discovered-assets', debouncedParams],
    queryFn: () => discoveryApiClient.getDiscoveredAssets(debouncedParams),
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true,
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to load discovered assets',
        description: error.message,
      })
    },
  })

  const validateAssetMutation = useMutation({
    mutationFn: ({ assetId, validation }: {
      assetId: string
      validation: {
        validation_status: 'VALIDATED' | 'REJECTED' | 'NEEDS_REVIEW'
        validation_comments?: string
        validation_score?: number
      }
    }) => discoveryApiClient.validateDiscoveredAsset(assetId, validation),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Asset validated',
        description: 'The discovered asset has been successfully validated.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to validate asset',
        description: error.message,
      })
    },
  })

  const approveAssetsMutation = useMutation({
    mutationFn: (assetIds: string[]) => discoveryApiClient.approveDiscoveredAssets(assetIds),
    onSuccess: (approvedAssets) => {
      refetch()
      toast({
        title: 'Assets approved',
        description: `${approvedAssets.length} assets have been successfully approved and added to the catalog.`,
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to approve assets',
        description: error.message,
      })
    },
  })

  const rejectAssetsMutation = useMutation({
    mutationFn: ({ assetIds, reason }: { assetIds: string[]; reason: string }) =>
      discoveryApiClient.rejectDiscoveredAssets(assetIds, reason),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Assets rejected',
        description: 'The selected assets have been successfully rejected.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to reject assets',
        description: error.message,
      })
    },
  })

  const bulkValidateMutation = useMutation({
    mutationFn: (validations: Array<{
      asset_id: string
      validation_status: string
      validation_comments?: string
    }>) => discoveryApiClient.bulkValidateDiscoveredAssets(validations),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Bulk validation completed',
        description: 'The assets have been successfully validated in bulk.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to bulk validate assets',
        description: error.message,
      })
    },
  })

  return {
    assets: data?.assets || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    validateAsset: validateAssetMutation.mutate,
    approveAssets: approveAssetsMutation.mutate,
    rejectAssets: rejectAssetsMutation.mutate,
    bulkValidate: bulkValidateMutation.mutate,
    isValidating: validateAssetMutation.isLoading,
    isApproving: approveAssetsMutation.isLoading,
    isRejecting: rejectAssetsMutation.isLoading,
    isBulkValidating: bulkValidateMutation.isLoading,
  }
}

// ===================== AI-POWERED DISCOVERY HOOKS =====================

export const useAiDiscovery = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const triggerAiDiscoveryMutation = useMutation({
    mutationFn: (params: {
      source_systems?: string[]
      asset_types?: string[]
      confidence_threshold?: number
      enable_deep_analysis?: boolean
      enable_lineage_inference?: boolean
    }) => discoveryApiClient.triggerAiDiscovery(params),
    onSuccess: (job) => {
      queryClient.invalidateQueries(['discovery', 'jobs'])
      toast({
        title: 'AI Discovery Started',
        description: `AI discovery job "${job.job_name}" has been successfully triggered.`,
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to trigger AI discovery',
        description: error.message,
      })
    },
  })

  const {
    data: insights,
    isLoading: isLoadingInsights,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ['discovery', 'ai-insights'],
    queryFn: () => discoveryApiClient.getAiDiscoveryInsights(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const trainModelMutation = useMutation({
    mutationFn: (params: {
      training_data_source: string
      model_type: string
      validation_split?: number
      hyperparameters?: Record<string, any>
    }) => discoveryApiClient.trainDiscoveryModel(params),
    onSuccess: () => {
      toast({
        title: 'Model training started',
        description: 'The AI discovery model training has been successfully initiated.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to start model training',
        description: error.message,
      })
    },
  })

  return {
    triggerAiDiscovery: triggerAiDiscoveryMutation.mutate,
    trainModel: trainModelMutation.mutate,
    insights,
    isLoadingInsights,
    refetchInsights,
    isTriggering: triggerAiDiscoveryMutation.isLoading,
    isTraining: trainModelMutation.isLoading,
  }
}

// ===================== DISCOVERY MONITORING HOOKS =====================

export const useDiscoveryMonitoring = () => {
  const { toast } = useToast()

  const {
    data: monitors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['discovery', 'monitoring', 'monitors'],
    queryFn: () => discoveryApiClient.getDiscoveryMonitors(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to load discovery monitors',
        description: error.message,
      })
    },
  })

  const createMonitorMutation = useMutation({
    mutationFn: (monitor: Partial<DiscoveryMonitoring>) =>
      discoveryApiClient.createDiscoveryMonitor(monitor),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery monitor created',
        description: 'The discovery monitor has been successfully created.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create discovery monitor',
        description: error.message,
      })
    },
  })

  const updateMonitorMutation = useMutation({
    mutationFn: ({ monitorId, updates }: { monitorId: string; updates: Partial<DiscoveryMonitoring> }) =>
      discoveryApiClient.updateDiscoveryMonitor(monitorId, updates),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery monitor updated',
        description: 'The discovery monitor has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update discovery monitor',
        description: error.message,
      })
    },
  })

  const deleteMonitorMutation = useMutation({
    mutationFn: (monitorId: string) => discoveryApiClient.deleteDiscoveryMonitor(monitorId),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Discovery monitor deleted',
        description: 'The discovery monitor has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete discovery monitor',
        description: error.message,
      })
    },
  })

  return {
    monitors,
    isLoading,
    error,
    refetch,
    createMonitor: createMonitorMutation.mutate,
    updateMonitor: updateMonitorMutation.mutate,
    deleteMonitor: deleteMonitorMutation.mutate,
    isCreating: createMonitorMutation.isLoading,
    isUpdating: updateMonitorMutation.isLoading,
    isDeleting: deleteMonitorMutation.isLoading,
  }
}

// ===================== DISCOVERY ALERTS HOOK =====================

export const useDiscoveryAlerts = (params?: {
  severity?: string
  status?: string
  monitor_id?: string
  triggered_after?: string
  triggered_before?: string
  page?: number
  page_size?: number
}) => {
  const { toast } = useToast()
  const debouncedParams = useDebounce(params, 300)

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['discovery', 'monitoring', 'alerts', debouncedParams],
    queryFn: () => discoveryApiClient.getDiscoveryAlerts(debouncedParams),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    keepPreviousData: true,
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to load discovery alerts',
        description: error.message,
      })
    },
  })

  const acknowledgeAlertMutation = useMutation({
    mutationFn: ({ alertId, acknowledgment }: {
      alertId: string
      acknowledgment: {
        acknowledged_by: string
        acknowledgment_notes?: string
      }
    }) => discoveryApiClient.acknowledgeDiscoveryAlert(alertId, acknowledgment),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Alert acknowledged',
        description: 'The discovery alert has been successfully acknowledged.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to acknowledge alert',
        description: error.message,
      })
    },
  })

  const resolveAlertMutation = useMutation({
    mutationFn: ({ alertId, resolution }: {
      alertId: string
      resolution: {
        resolved_by: string
        resolution_notes: string
        resolution_action?: string
      }
    }) => discoveryApiClient.resolveDiscoveryAlert(alertId, resolution),
    onSuccess: () => {
      refetch()
      toast({
        title: 'Alert resolved',
        description: 'The discovery alert has been successfully resolved.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to resolve alert',
        description: error.message,
      })
    },
  })

  return {
    alerts: data?.alerts || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    acknowledgeAlert: acknowledgeAlertMutation.mutate,
    resolveAlert: resolveAlertMutation.mutate,
    isAcknowledging: acknowledgeAlertMutation.isLoading,
    isResolving: resolveAlertMutation.isLoading,
  }
}

// ===================== DISCOVERY ANALYTICS HOOK =====================

export const useDiscoveryAnalytics = (timeframe = '7d') => {
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['discovery', 'analytics', timeframe],
    queryFn: () => discoveryApiClient.getDiscoveryAnalytics({ timeframe }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  })

  const {
    data: performanceMetrics,
    isLoading: isLoadingPerformance,
  } = useQuery({
    queryKey: ['discovery', 'analytics', 'performance', timeframe],
    queryFn: () => discoveryApiClient.getDiscoveryPerformanceMetrics({ timeframe }),
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: accuracyMetrics,
    isLoading: isLoadingAccuracy,
  } = useQuery({
    queryKey: ['discovery', 'analytics', 'accuracy', timeframe],
    queryFn: () => discoveryApiClient.getDiscoveryAccuracyMetrics({ timeframe }),
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: trends,
    isLoading: isLoadingTrends,
  } = useQuery({
    queryKey: ['discovery', 'analytics', 'trends', timeframe],
    queryFn: () => discoveryApiClient.getDiscoveryTrends({ timeframe }),
    staleTime: 5 * 60 * 1000,
  })

  return {
    analytics,
    performanceMetrics,
    accuracyMetrics,
    trends,
    isLoading: isLoading || isLoadingPerformance || isLoadingAccuracy || isLoadingTrends,
    error,
    refetch,
  }
}

// ===================== SCHEMA ANALYSIS HOOKS =====================

export const useSchemaAnalysis = () => {
  const { toast } = useToast()

  const analyzeSchemaInMutation = useMutation({
    mutationFn: (params: {
      source_system: string
      schema_name?: string
      table_name?: string
      analysis_depth?: 'BASIC' | 'STANDARD' | 'COMPREHENSIVE'
    }) => discoveryApiClient.analyzeSchema(params),
    onSuccess: () => {
      toast({
        title: 'Schema analysis started',
        description: 'The schema analysis has been successfully initiated.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to start schema analysis',
        description: error.message,
      })
    },
  })

  const compareSchemaMutation = useMutation({
    mutationFn: (params: {
      source_schema: string
      target_schema: string
      comparison_type?: 'STRUCTURAL' | 'SEMANTIC' | 'COMPREHENSIVE'
    }) => discoveryApiClient.compareSchemas(params),
    onSuccess: () => {
      toast({
        title: 'Schema comparison started',
        description: 'The schema comparison has been successfully initiated.',
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to start schema comparison',
        description: error.message,
      })
    },
  })

  return {
    analyzeSchema: analyzeSchemaInMutation.mutate,
    compareSchemas: compareSchemaMutation.mutate,
    isAnalyzing: analyzeSchemaInMutation.isLoading,
    isComparing: compareSchemaMutation.isLoading,
  }
}

// ===================== COMPREHENSIVE DISCOVERY STATE HOOK =====================

export const useDiscoveryState = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedEngineId, setSelectedEngineId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'engines' | 'jobs' | 'assets' | 'monitoring' | 'analytics'>('jobs')
  
  const engines = useDiscoveryEngines()
  const jobs = useDiscoveryJobs()
  const selectedJob = useDiscoveryJob(selectedJobId || undefined)
  const selectedJobProgress = useDiscoveryJobProgress(selectedJobId || undefined)
  const discoveredAssets = useDiscoveredAssets()
  const monitoring = useDiscoveryMonitoring()
  const alerts = useDiscoveryAlerts()
  const analytics = useDiscoveryAnalytics()
  const aiDiscovery = useAiDiscovery()
  const schemaAnalysis = useSchemaAnalysis()

  const isLoading = engines.isLoading || jobs.isLoading || discoveredAssets.isLoading

  return {
    // State management
    selectedJobId,
    setSelectedJobId,
    selectedEngineId,
    setSelectedEngineId,
    activeTab,
    setActiveTab,
    
    // Data and operations
    engines,
    jobs,
    selectedJob,
    selectedJobProgress,
    discoveredAssets,
    monitoring,
    alerts,
    analytics,
    aiDiscovery,
    schemaAnalysis,
    
    // Global state
    isLoading,
    
    // Convenience methods
    refreshAll: useCallback(() => {
      engines.refetch()
      jobs.refetch()
      discoveredAssets.refetch()
      monitoring.refetch()
      alerts.refetch()
      analytics.refetch()
    }, [engines, jobs, discoveredAssets, monitoring, alerts, analytics]),
  }
}