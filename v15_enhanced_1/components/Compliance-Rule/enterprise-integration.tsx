"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Types
interface ComplianceConfig {
  analytics: {
    enableRealTimeAnalytics: boolean
    enableAiInsights: boolean
    enablePredictiveAnalytics: boolean
    enableAnomalyDetection: boolean
  }
  collaboration: {
    enableRealTimeCollaboration: boolean
    maxConcurrentUsers: number
    enableComments: boolean
    enableAnnotations: boolean
  }
  workflows: {
    enableWorkflowAutomation: boolean
    enableApprovalWorkflows: boolean
    enableBulkOperations: boolean
    enableTaskAutomation: boolean
  }
  monitoring: {
    enableRealTimeMonitoring: boolean
    enableComplianceAlerts: boolean
    enableRiskAssessment: boolean
    enableAuditTrail: boolean
  }
}

interface ComplianceMetrics {
  totalRequirements: number
  compliantRequirements: number
  nonCompliantRequirements: number
  complianceScore: number
  activeAssessments: number
  openGaps: number
  criticalGaps: number
  upcomingDeadlines: number
}

interface ComplianceEvent {
  type: 'requirement_updated' | 'assessment_started' | 'gap_identified' | 'deadline_approaching' | 'compliance_alert'
  data: any
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface EnterpriseComplianceContextType {
  // Configuration
  config: ComplianceConfig
  updateConfig: (updates: Partial<ComplianceConfig>) => void
  
  // Real-time data
  metrics: ComplianceMetrics
  events: ComplianceEvent[]
  isConnected: boolean
  
  // Actions
  executeAction: (action: string, params: any) => Promise<any>
  sendNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void
  
  // Analytics
  getAnalytics: () => Promise<any>
  getInsights: () => Promise<any>
  
  // Collaboration
  joinCollaboration: (workspaceId: string) => Promise<void>
  leaveCollaboration: (workspaceId: string) => Promise<void>
  
  // Workflows
  startWorkflow: (workflowId: string, params: any) => Promise<void>
  approveWorkflow: (workflowId: string, decision: 'approve' | 'reject', notes?: string) => Promise<void>
  
  // Monitoring
  getComplianceStatus: () => Promise<any>
  getRiskAssessment: () => Promise<any>
  
  // Backend integration
  backendData: any
  refreshData: () => Promise<void>
  
  // Feature flags
  features: {
    analytics: boolean
    collaboration: boolean
    workflows: boolean
    monitoring: boolean
  }
}

const EnterpriseComplianceContext = createContext<EnterpriseComplianceContextType | null>(null)

export function EnterpriseComplianceProvider({ 
  children, 
  initialConfig 
}: { 
  children: React.ReactNode
  initialConfig?: Partial<ComplianceConfig>
}) {
  const router = useRouter()
  
  // Configuration state
  const [config, setConfig] = useState<ComplianceConfig>({
    analytics: {
      enableRealTimeAnalytics: true,
      enableAiInsights: true,
      enablePredictiveAnalytics: true,
      enableAnomalyDetection: true,
      ...initialConfig?.analytics
    },
    collaboration: {
      enableRealTimeCollaboration: true,
      maxConcurrentUsers: 50,
      enableComments: true,
      enableAnnotations: true,
      ...initialConfig?.collaboration
    },
    workflows: {
      enableWorkflowAutomation: true,
      enableApprovalWorkflows: true,
      enableBulkOperations: true,
      enableTaskAutomation: true,
      ...initialConfig?.workflows
    },
    monitoring: {
      enableRealTimeMonitoring: true,
      enableComplianceAlerts: true,
      enableRiskAssessment: true,
      enableAuditTrail: true,
      ...initialConfig?.monitoring
    }
  })
  
  // Real-time state
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalRequirements: 0,
    compliantRequirements: 0,
    nonCompliantRequirements: 0,
    complianceScore: 0,
    activeAssessments: 0,
    openGaps: 0,
    criticalGaps: 0,
    upcomingDeadlines: 0
  })
  
  const [events, setEvents] = useState<ComplianceEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [backendData, setBackendData] = useState<any>(null)
  
  // Feature flags
  const features = useMemo(() => ({
    analytics: config.analytics.enableRealTimeAnalytics,
    collaboration: config.collaboration.enableRealTimeCollaboration,
    workflows: config.workflows.enableWorkflowAutomation,
    monitoring: config.monitoring.enableRealTimeMonitoring
  }), [config])
  
  // Update configuration
  const updateConfig = useCallback((updates: Partial<ComplianceConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])
  
  // Execute actions
  const executeAction = useCallback(async (action: string, params: any) => {
    try {
      console.log(`Executing compliance action: ${action}`, params)
      
      // Simulate backend call
      const response = await fetch('/api/compliance/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params })
      })
      
      if (!response.ok) throw new Error('Action failed')
      
      const result = await response.json()
      
      // Add event
      setEvents(prev => [...prev, {
        type: 'requirement_updated',
        data: { action, params, result },
        timestamp: new Date(),
        severity: 'medium'
      }])
      
      return result
    } catch (error) {
      console.error('Action execution failed:', error)
      throw error
    }
  }, [])
  
  // Send notifications
  const sendNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    toast[type](message)
  }, [])
  
  // Analytics functions
  const getAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/compliance/analytics')
      return await response.json()
    } catch (error) {
      console.error('Failed to get analytics:', error)
      return null
    }
  }, [])
  
  const getInsights = useCallback(async () => {
    try {
      const response = await fetch('/api/compliance/insights')
      return await response.json()
    } catch (error) {
      console.error('Failed to get insights:', error)
      return null
    }
  }, [])
  
  // Collaboration functions
  const joinCollaboration = useCallback(async (workspaceId: string) => {
    try {
      await fetch('/api/compliance/collaboration/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      })
    } catch (error) {
      console.error('Failed to join collaboration:', error)
    }
  }, [])
  
  const leaveCollaboration = useCallback(async (workspaceId: string) => {
    try {
      await fetch('/api/compliance/collaboration/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      })
    } catch (error) {
      console.error('Failed to leave collaboration:', error)
    }
  }, [])
  
  // Workflow functions
  const startWorkflow = useCallback(async (workflowId: string, params: any) => {
    try {
      await fetch('/api/compliance/workflows/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId, params })
      })
    } catch (error) {
      console.error('Failed to start workflow:', error)
    }
  }, [])
  
  const approveWorkflow = useCallback(async (workflowId: string, decision: 'approve' | 'reject', notes?: string) => {
    try {
      await fetch('/api/compliance/workflows/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId, decision, notes })
      })
    } catch (error) {
      console.error('Failed to approve workflow:', error)
    }
  }, [])
  
  // Monitoring functions
  const getComplianceStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/compliance/status')
      return await response.json()
    } catch (error) {
      console.error('Failed to get compliance status:', error)
      return null
    }
  }, [])
  
  const getRiskAssessment = useCallback(async () => {
    try {
      const response = await fetch('/api/compliance/risk-assessment')
      return await response.json()
    } catch (error) {
      console.error('Failed to get risk assessment:', error)
      return null
    }
  }, [])
  
  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      const [statusResponse, metricsResponse] = await Promise.all([
        fetch('/api/compliance/status'),
        fetch('/api/compliance/metrics')
      ])
      
      const status = await statusResponse.json()
      const metricsData = await metricsResponse.json()
      
      setBackendData(status)
      setMetrics(metricsData)
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }, [])
  
  // Initialize connection and data
  useEffect(() => {
    const initializeCompliance = async () => {
      try {
        setIsConnected(true)
        await refreshData()
        
        // Set up real-time updates if enabled
        if (config.monitoring.enableRealTimeMonitoring) {
          // Simulate WebSocket connection
          const interval = setInterval(refreshData, 30000) // 30 seconds
          return () => clearInterval(interval)
        }
      } catch (error) {
        console.error('Failed to initialize compliance:', error)
        setIsConnected(false)
      }
    }
    
    initializeCompliance()
  }, [config.monitoring.enableRealTimeMonitoring, refreshData])
  
  const contextValue: EnterpriseComplianceContextType = {
    config,
    updateConfig,
    metrics,
    events,
    isConnected,
    executeAction,
    sendNotification,
    getAnalytics,
    getInsights,
    joinCollaboration,
    leaveCollaboration,
    startWorkflow,
    approveWorkflow,
    getComplianceStatus,
    getRiskAssessment,
    backendData,
    refreshData,
    features
  }
  
  return (
    <EnterpriseComplianceContext.Provider value={contextValue}>
      {children}
    </EnterpriseComplianceContext.Provider>
  )
}

export function useEnterpriseCompliance() {
  const context = useContext(EnterpriseComplianceContext)
  if (!context) {
    throw new Error('useEnterpriseCompliance must be used within EnterpriseComplianceProvider')
  }
  return context
}