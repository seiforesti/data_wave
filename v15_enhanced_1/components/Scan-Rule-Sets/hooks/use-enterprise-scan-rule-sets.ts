"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useScanRuleSets,
  useScanRuleSet,
  useScanRuleSetAnalytics,
  useCreateScanRuleSet,
  useUpdateScanRuleSet,
  useDeleteScanRuleSet,
  useExecuteScanRuleSet,
  useDuplicateScanRuleSet,
  useValidateScanRuleSet,
  type ScanRuleSet,
  type ScanRuleSetCreate,
  type ScanRuleSetUpdate,
  type ScanRuleSetAnalytics,
  type ValidationResult,
  type ScanExecution,
} from '../services/enhanced-scan-rule-set-apis'

// Types for enterprise features
export interface ScanRuleSetInsight {
  id: string
  type: 'performance' | 'optimization' | 'security' | 'compliance'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  timestamp: string
  actionable: boolean
}

export interface ScanRuleSetAlert {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  ruleSetId?: number
}

export interface ScanRuleSetWorkflow {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  steps: Array<{
    id: string
    name: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    result?: any
  }>
  createdAt: string
  updatedAt: string
}

export interface CrossGroupData {
  dataSources: Array<{
    id: number
    name: string
    type: string
    status: string
  }>
  complianceRules: Array<{
    id: number
    name: string
    status: string
  }>
  scanLogs: Array<{
    id: string
    type: string
    status: string
    timestamp: string
  }>
}

// Enterprise Hook for Scan Rule Sets
export const useEnterpriseScanRuleSets = (
  dataSourceId?: number,
  search?: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const queryClient = useQueryClient()
  
  // Core data queries
  const {
    data: ruleSets,
    isLoading: isLoadingRuleSets,
    error: ruleSetsError,
    refetch: refetchRuleSets,
  } = useScanRuleSets(dataSourceId, search, page, pageSize)

  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useScanRuleSetAnalytics()

  // Mutations
  const createMutation = useCreateScanRuleSet()
  const updateMutation = useUpdateScanRuleSet()
  const deleteMutation = useDeleteScanRuleSet()
  const executeMutation = useExecuteScanRuleSet()
  const duplicateMutation = useDuplicateScanRuleSet()
  const validateMutation = useValidateScanRuleSet()

  // Enterprise state
  const [insights, setInsights] = useState<ScanRuleSetInsight[]>([])
  const [alerts, setAlerts] = useState<ScanRuleSetAlert[]>([])
  const [workflows, setWorkflows] = useState<ScanRuleSetWorkflow[]>([])
  const [crossGroupData, setCrossGroupData] = useState<CrossGroupData>({
    dataSources: [],
    complianceRules: [],
    scanLogs: [],
  })
  const [realTimeUpdates, setRealTimeUpdates] = useState(false)

  // Real-time monitoring setup
  useEffect(() => {
    if (!realTimeUpdates) return

    const interval = setInterval(() => {
      refetchRuleSets()
      // Simulate real-time updates
      generateInsights()
      checkForAlerts()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [realTimeUpdates, refetchRuleSets])

  // AI Insights Generation
  const generateInsights = useCallback(() => {
    if (!ruleSets || !analytics) return

    const newInsights: ScanRuleSetInsight[] = []

    // Performance insights
    ruleSets.forEach((ruleSet) => {
      if (ruleSet.success_rate && ruleSet.success_rate < 80) {
        newInsights.push({
          id: `perf-${ruleSet.id}`,
          type: 'performance',
          title: 'Low Success Rate Detected',
          description: `Rule set "${ruleSet.name}" has a success rate of ${ruleSet.success_rate.toFixed(1)}%`,
          severity: ruleSet.success_rate < 60 ? 'high' : 'medium',
          recommendations: [
            'Review scan configuration',
            'Check data source connectivity',
            'Validate rule set filters',
          ],
          timestamp: new Date().toISOString(),
          actionable: true,
        })
      }
    })

    // Optimization insights
    if (analytics.average_success_rate < 85) {
      newInsights.push({
        id: 'opt-overall',
        type: 'optimization',
        title: 'System-wide Performance Optimization Opportunity',
        description: `Overall success rate is ${analytics.average_success_rate.toFixed(1)}%`,
        severity: 'medium',
        recommendations: [
          'Review top performing rule sets for best practices',
          'Consider consolidating similar rule sets',
          'Optimize scan schedules',
        ],
        timestamp: new Date().toISOString(),
        actionable: true,
      })
    }

    // Security insights
    const inactiveRuleSets = ruleSets.filter((rs) => !rs.last_scan || 
      new Date(rs.last_scan) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    
    if (inactiveRuleSets.length > 0) {
      newInsights.push({
        id: 'sec-inactive',
        type: 'security',
        title: 'Inactive Rule Sets Detected',
        description: `${inactiveRuleSets.length} rule sets haven't been executed in the last 7 days`,
        severity: 'medium',
        recommendations: [
          'Review and update inactive rule sets',
          'Consider automated scheduling',
          'Archive unused rule sets',
        ],
        timestamp: new Date().toISOString(),
        actionable: true,
      })
    }

    setInsights(newInsights)
  }, [ruleSets, analytics])

  // Alert System
  const checkForAlerts = useCallback(() => {
    if (!ruleSets) return

    const newAlerts: ScanRuleSetAlert[] = []

    // Check for failed rule sets
    ruleSets.forEach((ruleSet) => {
      if (ruleSet.success_rate !== undefined && ruleSet.success_rate < 50) {
        newAlerts.push({
          id: `alert-${ruleSet.id}`,
          type: 'error',
          title: 'Critical: Rule Set Failure',
          message: `Rule set "${ruleSet.name}" has critical failure rate`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          ruleSetId: ruleSet.id,
        })
      }
    })

    // Check for system health
    if (analytics && analytics.average_success_rate < 70) {
      newAlerts.push({
        id: 'alert-system',
        type: 'warning',
        title: 'System Performance Warning',
        message: 'Overall system performance is below optimal levels',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      })
    }

    setAlerts((prev) => [...prev, ...newAlerts])
  }, [ruleSets, analytics])

  // Workflow Management
  const createWorkflow = useCallback((name: string, description: string, steps: string[]) => {
    const workflow: ScanRuleSetWorkflow = {
      id: `wf-${Date.now()}`,
      name,
      description,
      status: 'pending',
      steps: steps.map((step, index) => ({
        id: `step-${index}`,
        name: step,
        status: 'pending' as const,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setWorkflows((prev) => [...prev, workflow])
    return workflow
  }, [])

  const executeWorkflow = useCallback(async (workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === workflowId
          ? { ...wf, status: 'running', updatedAt: new Date().toISOString() }
          : wf
      )
    )

    // Simulate workflow execution
    setTimeout(() => {
      setWorkflows((prev) =>
        prev.map((wf) =>
          wf.id === workflowId
            ? {
                ...wf,
                status: 'completed',
                steps: wf.steps.map((step) => ({ ...step, status: 'completed' })),
                updatedAt: new Date().toISOString(),
              }
            : wf
        )
      )
      toast.success(`Workflow "${workflowId}" completed successfully`)
    }, 5000)
  }, [])

  // Cross-group data integration
  const fetchCrossGroupData = useCallback(async () => {
    try {
      // Simulate fetching data from other groups
      const mockData: CrossGroupData = {
        dataSources: [
          { id: 1, name: 'Production DB', type: 'postgresql', status: 'active' },
          { id: 2, name: 'Analytics Warehouse', type: 'snowflake', status: 'active' },
        ],
        complianceRules: [
          { id: 1, name: 'GDPR Compliance', status: 'active' },
          { id: 2, name: 'HIPAA Compliance', status: 'active' },
        ],
        scanLogs: [
          { id: '1', type: 'data_discovery', status: 'completed', timestamp: new Date().toISOString() },
          { id: '2', type: 'compliance_scan', status: 'running', timestamp: new Date().toISOString() },
        ],
      }

      setCrossGroupData(mockData)
    } catch (error) {
      console.error('Error fetching cross-group data:', error)
    }
  }, [])

  // Enhanced CRUD operations with enterprise features
  const createRuleSetWithValidation = useCallback(
    async (data: ScanRuleSetCreate) => {
      // Pre-validation
      const validation = await validateMutation.mutateAsync(data)
      if (!validation.valid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`)
        return null
      }

      // Create workflow for tracking
      const workflow = createWorkflow(
        'Create Rule Set',
        `Creating rule set: ${data.name}`,
        ['Validate configuration', 'Create rule set', 'Initialize monitoring']
      )

      // Execute creation
      const result = await createMutation.mutateAsync(data)
      
      // Complete workflow
      await executeWorkflow(workflow.id)
      
      return result
    },
    [createMutation, validateMutation, createWorkflow, executeWorkflow]
  )

  const updateRuleSetWithTracking = useCallback(
    async (id: number, data: ScanRuleSetUpdate) => {
      const workflow = createWorkflow(
        'Update Rule Set',
        `Updating rule set ID: ${id}`,
        ['Validate changes', 'Update rule set', 'Refresh monitoring']
      )

      const result = await updateMutation.mutateAsync({ id, data })
      await executeWorkflow(workflow.id)
      
      return result
    },
    [updateMutation, createWorkflow, executeWorkflow]
  )

  const deleteRuleSetWithCleanup = useCallback(
    async (id: number) => {
      const workflow = createWorkflow(
        'Delete Rule Set',
        `Deleting rule set ID: ${id}`,
        ['Check dependencies', 'Delete rule set', 'Cleanup references']
      )

      await deleteMutation.mutateAsync(id)
      await executeWorkflow(workflow.id)
    },
    [deleteMutation, createWorkflow, executeWorkflow]
  )

  const executeRuleSetWithMonitoring = useCallback(
    async (id: number, dataSourceId?: number) => {
      const workflow = createWorkflow(
        'Execute Rule Set',
        `Executing rule set ID: ${id}`,
        ['Validate execution', 'Start scan', 'Monitor progress', 'Complete scan']
      )

      const result = await executeMutation.mutateAsync({ id, dataSourceId })
      await executeWorkflow(workflow.id)
      
      return result
    },
    [executeMutation, createWorkflow, executeWorkflow]
  )

  // Analytics and reporting
  const getSystemHealth = useMemo(() => {
    if (!analytics) return null

    const healthScore = Math.min(100, analytics.average_success_rate + 20)
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    
    if (healthScore < 70) status = 'critical'
    else if (healthScore < 85) status = 'warning'

    return {
      score: healthScore,
      status,
      metrics: {
        totalRuleSets: analytics.total_rule_sets,
        activeRuleSets: analytics.active_rule_sets,
        averageSuccessRate: analytics.average_success_rate,
        totalScans: analytics.total_scans_executed,
        recentScans: analytics.scans_last_30_days,
      },
    }
  }, [analytics])

  const getPerformanceMetrics = useMemo(() => {
    if (!ruleSets || !analytics) return null

    return {
      topPerformers: analytics.top_performing_rule_sets.slice(0, 5),
      usageTrends: analytics.rule_set_usage_trends,
      dataSourceDistribution: analytics.rule_sets_by_data_source,
      successRateDistribution: {
        excellent: ruleSets.filter((rs) => rs.success_rate && rs.success_rate >= 95).length,
        good: ruleSets.filter((rs) => rs.success_rate && rs.success_rate >= 80 && rs.success_rate < 95).length,
        fair: ruleSets.filter((rs) => rs.success_rate && rs.success_rate >= 60 && rs.success_rate < 80).length,
        poor: ruleSets.filter((rs) => rs.success_rate && rs.success_rate < 60).length,
      },
    }
  }, [ruleSets, analytics])

  // Alert management
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    )
  }, [])

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }, [])

  const clearAllAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  // Insight management
  const dismissInsight = useCallback((insightId: string) => {
    setInsights((prev) => prev.filter((insight) => insight.id !== insightId))
  }, [])

  const applyInsightRecommendation = useCallback((insightId: string, recommendationIndex: number) => {
    const insight = insights.find((i) => i.id === insightId)
    if (!insight) return

    toast.success(`Applying recommendation: ${insight.recommendations[recommendationIndex]}`)
    dismissInsight(insightId)
  }, [insights, dismissInsight])

  // Real-time controls
  const toggleRealTimeUpdates = useCallback(() => {
    setRealTimeUpdates((prev) => !prev)
  }, [])

  // Initialize cross-group data
  useEffect(() => {
    fetchCrossGroupData()
  }, [fetchCrossGroupData])

  // Generate initial insights
  useEffect(() => {
    generateInsights()
  }, [generateInsights])

  // Check for initial alerts
  useEffect(() => {
    checkForAlerts()
  }, [checkForAlerts])

  return {
    // Core data
    ruleSets,
    analytics,
    isLoading: isLoadingRuleSets || isLoadingAnalytics,
    error: ruleSetsError || analyticsError,
    
    // Enterprise features
    insights,
    alerts,
    workflows,
    crossGroupData,
    realTimeUpdates,
    
    // System health and metrics
    systemHealth: getSystemHealth,
    performanceMetrics: getPerformanceMetrics,
    
    // Enhanced operations
    createRuleSet: createRuleSetWithValidation,
    updateRuleSet: updateRuleSetWithTracking,
    deleteRuleSet: deleteRuleSetWithCleanup,
    executeRuleSet: executeRuleSetWithMonitoring,
    duplicateRuleSet: duplicateMutation.mutateAsync,
    validateRuleSet: validateMutation.mutateAsync,
    
    // Workflow management
    createWorkflow,
    executeWorkflow,
    
    // Alert management
    acknowledgeAlert,
    dismissAlert,
    clearAllAlerts,
    
    // Insight management
    dismissInsight,
    applyInsightRecommendation,
    
    // Real-time controls
    toggleRealTimeUpdates,
    
    // Data refresh
    refetch: refetchRuleSets,
    fetchCrossGroupData,
  }
}

// Specialized hooks for specific use cases
export const useScanRuleSetDetails = (id: number) => {
  const {
    data: ruleSet,
    isLoading,
    error,
  } = useScanRuleSet(id)

  const [relatedWorkflows, setRelatedWorkflows] = useState<ScanRuleSetWorkflow[]>([])
  const [executionHistory, setExecutionHistory] = useState<ScanExecution[]>([])

  // Fetch related data
  useEffect(() => {
    if (!id) return

    // Simulate fetching related workflows and execution history
    setRelatedWorkflows([
      {
        id: `wf-${id}-1`,
        name: 'Recent Execution',
        description: 'Last scan execution workflow',
        status: 'completed',
        steps: [
          { id: 'step-1', name: 'Initialize', status: 'completed' },
          { id: 'step-2', name: 'Execute Scan', status: 'completed' },
          { id: 'step-3', name: 'Process Results', status: 'completed' },
        ],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ])

    setExecutionHistory([
      {
        scan_id: `scan-${id}-1`,
        rule_set_name: ruleSet?.name || 'Unknown',
        data_source_name: 'Production DB',
        message: 'Scan completed successfully',
      },
    ])
  }, [id, ruleSet])

  return {
    ruleSet,
    isLoading,
    error,
    relatedWorkflows,
    executionHistory,
  }
}

export const useScanRuleSetAnalytics = () => {
  const {
    data: analytics,
    isLoading,
    error,
  } = useScanRuleSetAnalytics()

  const [trends, setTrends] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])

  // Generate trends and predictions
  useEffect(() => {
    if (!analytics) return

    // Simulate trend analysis
    setTrends([
      {
        metric: 'Success Rate',
        trend: 'increasing',
        value: analytics.average_success_rate,
        change: '+2.5%',
      },
      {
        metric: 'Active Rule Sets',
        trend: 'stable',
        value: analytics.active_rule_sets,
        change: '0%',
      },
    ])

    // Simulate predictions
    setPredictions([
      {
        metric: 'Expected Success Rate (30 days)',
        prediction: Math.min(100, analytics.average_success_rate + 5),
        confidence: 85,
      },
      {
        metric: 'Expected Rule Set Growth',
        prediction: Math.floor(analytics.total_rule_sets * 1.1),
        confidence: 70,
      },
    ])
  }, [analytics])

  return {
    analytics,
    isLoading,
    error,
    trends,
    predictions,
  }
}