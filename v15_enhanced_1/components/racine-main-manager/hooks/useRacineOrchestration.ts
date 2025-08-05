'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

// Types
import {
  RacineState,
  CrossGroupState,
  WorkflowStep,
  WorkflowMetrics,
  PerformanceMetrics,
  SystemHealth,
  ActivityRecord
} from '../types/racine-core.types'

// Constants
import { 
  API_ENDPOINTS, 
  PERFORMANCE_THRESHOLDS,
  SUPPORTED_GROUPS 
} from '../constants/cross-group-configs'

/**
 * useRacineOrchestration - Master Orchestration Hook
 * 
 * This hook manages the core orchestration functionality for the Racine Manager:
 * - Cross-group service coordination
 * - Workflow execution and monitoring
 * - System health monitoring
 * - Performance optimization
 * - Resource management
 * - Error handling and recovery
 */

interface OrchestrationState {
  isActive: boolean
  activeWorkflows: Record<string, WorkflowExecution>
  systemMetrics: SystemMetrics
  healthStatus: SystemHealth
  performanceData: PerformanceMetrics
  resourceUsage: ResourceUsage
  errors: OrchestrationError[]
  lastSync: Date
}

interface WorkflowExecution {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  currentStep: number
  totalSteps: number
  startTime: Date
  endTime?: Date
  progress: number
  metrics: WorkflowMetrics
  logs: WorkflowLog[]
  errors: string[]
}

interface SystemMetrics {
  totalRequests: number
  successRate: number
  averageResponseTime: number
  activeConnections: number
  queueSize: number
  throughput: number
  errorRate: number
  uptime: number
}

interface ResourceUsage {
  cpu: number
  memory: number
  disk: number
  network: number
  connections: number
  threads: number
}

interface OrchestrationError {
  id: string
  type: string
  message: string
  source: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}

interface WorkflowLog {
  id: string
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  metadata?: Record<string, any>
}

export const useRacineOrchestration = (userId: string, racineState: RacineState) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [orchestrationState, setOrchestrationState] = useState<OrchestrationState>({
    isActive: false,
    activeWorkflows: {},
    systemMetrics: {
      totalRequests: 0,
      successRate: 0,
      averageResponseTime: 0,
      activeConnections: 0,
      queueSize: 0,
      throughput: 0,
      errorRate: 0,
      uptime: 0
    },
    healthStatus: 'healthy',
    performanceData: {
      loadTime: 0,
      memoryUsage: 0,
      apiLatency: 0,
      renderTime: 0
    },
    resourceUsage: {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
      connections: 0,
      threads: 0
    },
    errors: [],
    lastSync: new Date()
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs for intervals and cleanup
  const healthCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const metricsInterval = useRef<NodeJS.Timeout | null>(null)
  const performanceInterval = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const startTime = performance.now()
    
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          ...options.headers
        },
        ...options
      })

      const endTime = performance.now()
      const latency = endTime - startTime

      // Update performance metrics
      setOrchestrationState(prev => ({
        ...prev,
        performanceData: {
          ...prev.performanceData,
          apiLatency: (prev.performanceData.apiLatency + latency) / 2
        },
        systemMetrics: {
          ...prev.systemMetrics,
          totalRequests: prev.systemMetrics.totalRequests + 1,
          averageResponseTime: (prev.systemMetrics.averageResponseTime + latency) / 2
        }
      }))

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      const endTime = performance.now()
      const latency = endTime - startTime

      // Update error metrics
      setOrchestrationState(prev => ({
        ...prev,
        systemMetrics: {
          ...prev.systemMetrics,
          totalRequests: prev.systemMetrics.totalRequests + 1,
          errorRate: (prev.systemMetrics.errorRate * prev.systemMetrics.totalRequests + 1) / (prev.systemMetrics.totalRequests + 1)
        },
        errors: [...prev.errors, {
          id: `error-${Date.now()}`,
          type: 'api_error',
          message: error instanceof Error ? error.message : 'Unknown API error',
          source: endpoint,
          timestamp: new Date(),
          severity: 'medium',
          resolved: false
        }]
      }))

      throw error
    }
  }, [])

  // ============================================================================
  // WORKFLOW EXECUTION
  // ============================================================================

  const executeWorkflow = useCallback(async (
    workflowId: string, 
    steps: WorkflowStep[], 
    parameters: Record<string, any> = {}
  ): Promise<WorkflowExecution> => {
    const startTime = new Date()
    const execution: WorkflowExecution = {
      id: workflowId,
      name: `Workflow-${workflowId}`,
      status: 'running',
      currentStep: 0,
      totalSteps: steps.length,
      startTime,
      progress: 0,
      metrics: {
        totalRuns: 1,
        successRate: 0,
        averageDuration: 0,
        errorCount: 0,
        performance: {
          loadTime: 0,
          memoryUsage: 0,
          apiLatency: 0,
          renderTime: 0
        }
      },
      logs: [{
        id: `log-${Date.now()}`,
        timestamp: startTime,
        level: 'info',
        message: `Starting workflow execution with ${steps.length} steps`,
        metadata: { parameters }
      }],
      errors: []
    }

    // Update state with new execution
    setOrchestrationState(prev => ({
      ...prev,
      activeWorkflows: {
        ...prev.activeWorkflows,
        [workflowId]: execution
      }
    }))

    try {
      // Execute steps sequentially
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        const stepStartTime = performance.now()

        // Update progress
        const updatedExecution = {
          ...execution,
          currentStep: i,
          progress: (i / steps.length) * 100,
          logs: [...execution.logs, {
            id: `log-${Date.now()}-${i}`,
            timestamp: new Date(),
            level: 'info' as const,
            message: `Executing step ${i + 1}: ${step.name}`,
            metadata: { stepId: step.id, operation: step.operation }
          }]
        }

        setOrchestrationState(prev => ({
          ...prev,
          activeWorkflows: {
            ...prev.activeWorkflows,
            [workflowId]: updatedExecution
          }
        }))

        try {
          // Execute the step
          const stepResult = await executeWorkflowStep(step, parameters)
          const stepEndTime = performance.now()
          const stepDuration = stepEndTime - stepStartTime

          // Log successful step completion
          updatedExecution.logs.push({
            id: `log-${Date.now()}-${i}-success`,
            timestamp: new Date(),
            level: 'info',
            message: `Step ${i + 1} completed successfully in ${stepDuration.toFixed(2)}ms`,
            metadata: { stepResult, duration: stepDuration }
          })

        } catch (stepError) {
          const errorMessage = stepError instanceof Error ? stepError.message : 'Unknown step error'
          
          // Log step error
          updatedExecution.logs.push({
            id: `log-${Date.now()}-${i}-error`,
            timestamp: new Date(),
            level: 'error',
            message: `Step ${i + 1} failed: ${errorMessage}`,
            metadata: { error: errorMessage }
          })

          updatedExecution.errors.push(errorMessage)

          // Handle step failure based on retry policy
          if (step.retryPolicy && step.retryPolicy.maxRetries > 0) {
            // Implement retry logic
            let retryCount = 0
            while (retryCount < step.retryPolicy.maxRetries) {
              try {
                await new Promise(resolve => 
                  setTimeout(resolve, step.retryPolicy!.initialDelay * Math.pow(2, retryCount))
                )
                await executeWorkflowStep(step, parameters)
                break
              } catch (retryError) {
                retryCount++
                if (retryCount >= step.retryPolicy.maxRetries) {
                  throw stepError
                }
              }
            }
          } else {
            throw stepError
          }
        }
      }

      // Workflow completed successfully
      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()

      const completedExecution: WorkflowExecution = {
        ...execution,
        status: 'completed',
        currentStep: steps.length,
        progress: 100,
        endTime,
        metrics: {
          ...execution.metrics,
          successRate: 100,
          averageDuration: duration,
          performance: {
            ...execution.metrics.performance,
            loadTime: duration
          }
        },
        logs: [...execution.logs, {
          id: `log-${Date.now()}-completed`,
          timestamp: endTime,
          level: 'info',
          message: `Workflow completed successfully in ${duration}ms`,
          metadata: { duration, totalSteps: steps.length }
        }]
      }

      setOrchestrationState(prev => ({
        ...prev,
        activeWorkflows: {
          ...prev.activeWorkflows,
          [workflowId]: completedExecution
        }
      }))

      toast({
        title: "Workflow Completed",
        description: `Workflow ${workflowId} completed successfully in ${duration}ms`,
        variant: "default"
      })

      return completedExecution

    } catch (error) {
      const endTime = new Date()
      const errorMessage = error instanceof Error ? error.message : 'Unknown workflow error'

      const failedExecution: WorkflowExecution = {
        ...execution,
        status: 'failed',
        endTime,
        errors: [...execution.errors, errorMessage],
        logs: [...execution.logs, {
          id: `log-${Date.now()}-failed`,
          timestamp: endTime,
          level: 'error',
          message: `Workflow failed: ${errorMessage}`,
          metadata: { error: errorMessage }
        }]
      }

      setOrchestrationState(prev => ({
        ...prev,
        activeWorkflows: {
          ...prev.activeWorkflows,
          [workflowId]: failedExecution
        }
      }))

      toast({
        title: "Workflow Failed",
        description: `Workflow ${workflowId} failed: ${errorMessage}`,
        variant: "destructive"
      })

      throw error
    }
  }, [toast])

  const executeWorkflowStep = useCallback(async (
    step: WorkflowStep, 
    parameters: Record<string, any>
  ): Promise<any> => {
    const endpoint = `${API_ENDPOINTS.BASE_URL}/api/${step.groupId}/${step.operation}`
    
    const response = await apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        serviceId: step.serviceId,
        operation: step.operation,
        parameters: { ...step.parameters, ...parameters }
      })
    })

    return response
  }, [apiCall])

  // ============================================================================
  // SERVICE COORDINATION
  // ============================================================================

  const coordinateServices = useCallback(async (
    services: string[], 
    operation: string, 
    parameters: Record<string, any> = {}
  ): Promise<Record<string, any>> => {
    setIsLoading(true)
    setError(null)

    try {
      const results: Record<string, any> = {}
      const promises = services.map(async (serviceId) => {
        const result = await apiCall(`${API_ENDPOINTS.RACINE.ORCHESTRATION}/${serviceId}`, {
          method: 'POST',
          body: JSON.stringify({ operation, parameters })
        })
        results[serviceId] = result
        return result
      })

      await Promise.all(promises)

      toast({
        title: "Services Coordinated",
        description: `Successfully coordinated ${services.length} services`,
        variant: "default"
      })

      return results

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Service coordination failed'
      setError(errorMessage)
      
      toast({
        title: "Coordination Failed",
        description: errorMessage,
        variant: "destructive"
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [apiCall, toast])

  // ============================================================================
  // HEALTH MONITORING
  // ============================================================================

  const monitorHealth = useCallback(async (): Promise<SystemHealth> => {
    try {
      const healthData = await apiCall(API_ENDPOINTS.RACINE.HEALTH)
      
      const newHealthStatus: SystemHealth = 
        healthData.status === 'healthy' ? 'healthy' :
        healthData.status === 'warning' ? 'warning' :
        healthData.status === 'critical' ? 'critical' : 'maintenance'

      setOrchestrationState(prev => ({
        ...prev,
        healthStatus: newHealthStatus,
        systemMetrics: {
          ...prev.systemMetrics,
          uptime: healthData.uptime || prev.systemMetrics.uptime,
          activeConnections: healthData.connections || prev.systemMetrics.activeConnections
        },
        lastSync: new Date()
      }))

      return newHealthStatus

    } catch (error) {
      setOrchestrationState(prev => ({
        ...prev,
        healthStatus: 'critical',
        errors: [...prev.errors, {
          id: `health-error-${Date.now()}`,
          type: 'health_check',
          message: error instanceof Error ? error.message : 'Health check failed',
          source: 'health_monitor',
          timestamp: new Date(),
          severity: 'high',
          resolved: false
        }]
      }))

      return 'critical'
    }
  }, [apiCall])

  // ============================================================================
  // PERFORMANCE OPTIMIZATION
  // ============================================================================

  const optimizePerformance = useCallback(async (): Promise<void> => {
    try {
      const metrics = await apiCall(API_ENDPOINTS.RACINE.METRICS)
      
      // Analyze performance metrics
      const recommendations = []

      if (metrics.memoryUsage > PERFORMANCE_THRESHOLDS.WARNING_MEMORY) {
        recommendations.push('Consider increasing memory allocation')
      }

      if (metrics.responseTime > PERFORMANCE_THRESHOLDS.WARNING_API_LATENCY) {
        recommendations.push('API response time is above threshold')
      }

      if (metrics.errorRate > 0.05) {
        recommendations.push('Error rate is elevated')
      }

      // Update performance data
      setOrchestrationState(prev => ({
        ...prev,
        performanceData: {
          loadTime: metrics.loadTime || prev.performanceData.loadTime,
          memoryUsage: metrics.memoryUsage || prev.performanceData.memoryUsage,
          apiLatency: metrics.responseTime || prev.performanceData.apiLatency,
          renderTime: metrics.renderTime || prev.performanceData.renderTime
        },
        resourceUsage: {
          cpu: metrics.cpu || prev.resourceUsage.cpu,
          memory: metrics.memory || prev.resourceUsage.memory,
          disk: metrics.disk || prev.resourceUsage.disk,
          network: metrics.network || prev.resourceUsage.network,
          connections: metrics.connections || prev.resourceUsage.connections,
          threads: metrics.threads || prev.resourceUsage.threads
        }
      }))

      if (recommendations.length > 0) {
        toast({
          title: "Performance Recommendations",
          description: recommendations.join(', '),
          variant: "default"
        })
      }

    } catch (error) {
      console.error('Performance optimization failed:', error)
    }
  }, [apiCall, toast])

  // ============================================================================
  // LIFECYCLE AND CLEANUP
  // ============================================================================

  useEffect(() => {
    // Start health monitoring
    const startHealthMonitoring = async () => {
      await monitorHealth()
      
      healthCheckInterval.current = setInterval(async () => {
        await monitorHealth()
      }, PERFORMANCE_THRESHOLDS.HEARTBEAT_INTERVAL)
    }

    // Start metrics collection
    const startMetricsCollection = () => {
      metricsInterval.current = setInterval(async () => {
        await optimizePerformance()
      }, 60000) // Every minute
    }

    if (racineState.isInitialized) {
      startHealthMonitoring()
      startMetricsCollection()
      
      setOrchestrationState(prev => ({
        ...prev,
        isActive: true
      }))
    }

    return () => {
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current)
      }
      if (metricsInterval.current) {
        clearInterval(metricsInterval.current)
      }
      if (performanceInterval.current) {
        clearInterval(performanceInterval.current)
      }
    }
  }, [racineState.isInitialized, monitorHealth, optimizePerformance])

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    orchestrationState,
    isLoading,
    error,
    executeWorkflow,
    coordinateServices,
    monitorHealth,
    optimizePerformance,
    
    // Utility functions
    getActiveWorkflows: () => Object.values(orchestrationState.activeWorkflows),
    getSystemMetrics: () => orchestrationState.systemMetrics,
    getHealthStatus: () => orchestrationState.healthStatus,
    getPerformanceData: () => orchestrationState.performanceData,
    getResourceUsage: () => orchestrationState.resourceUsage,
    getErrors: () => orchestrationState.errors.filter(e => !e.resolved),
    
    // Actions
    pauseWorkflow: (workflowId: string) => {
      setOrchestrationState(prev => ({
        ...prev,
        activeWorkflows: {
          ...prev.activeWorkflows,
          [workflowId]: {
            ...prev.activeWorkflows[workflowId],
            status: 'paused'
          }
        }
      }))
    },
    
    resumeWorkflow: (workflowId: string) => {
      setOrchestrationState(prev => ({
        ...prev,
        activeWorkflows: {
          ...prev.activeWorkflows,
          [workflowId]: {
            ...prev.activeWorkflows[workflowId],
            status: 'running'
          }
        }
      }))
    },
    
    cancelWorkflow: (workflowId: string) => {
      setOrchestrationState(prev => ({
        ...prev,
        activeWorkflows: {
          ...prev.activeWorkflows,
          [workflowId]: {
            ...prev.activeWorkflows[workflowId],
            status: 'failed',
            endTime: new Date()
          }
        }
      }))
    },
    
    resolveError: (errorId: string) => {
      setOrchestrationState(prev => ({
        ...prev,
        errors: prev.errors.map(error => 
          error.id === errorId ? { ...error, resolved: true } : error
        )
      }))
    },
    
    clearErrors: () => {
      setOrchestrationState(prev => ({
        ...prev,
        errors: []
      }))
    }
  }
}