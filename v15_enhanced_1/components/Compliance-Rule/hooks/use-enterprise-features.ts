"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceAPIs } from '../services/enterprise-apis'
import type {
  ComplianceRequirement,
  ComplianceAssessment,
  ComplianceGap,
  ComplianceEvidence,
  ComplianceWorkflow,
  ComplianceReport,
  ComplianceIntegration,
  ComplianceFramework
} from '../services/enterprise-apis'

// Core enterprise features hook for compliance components
export function useEnterpriseFeatures({
  componentName,
  complianceId,
  dataSourceId,
  enableAnalytics = true,
  enableCollaboration = true,
  enableWorkflows = true,
  enableMonitoring = true
}: {
  componentName: string
  complianceId?: number
  dataSourceId?: number
  enableAnalytics?: boolean
  enableCollaboration?: boolean
  enableWorkflows?: boolean
  enableMonitoring?: boolean
}) {
  const enterprise = useEnterpriseCompliance()
  
  const [localData, setLocalData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cache, setCache] = useState<Map<string, any>>(new Map())

  // Execute actions with comprehensive error handling and caching
  const executeAction = useCallback(async (action: string, params: any) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const cacheKey = `${action}_${JSON.stringify(params)}`
      
      // Check cache first for read operations
      if (action.startsWith('get') && cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey)
        if (Date.now() - cachedData.timestamp < 300000) { // 5 minutes cache
          setLocalData(cachedData.data)
          return cachedData.data
        }
      }
      
      const result = await enterprise.executeAction(action, {
        componentName,
        complianceId,
        dataSourceId,
        ...params
      })
      
      // Cache the result for read operations
      if (action.startsWith('get')) {
        setCache(prev => new Map(prev).set(cacheKey, {
          data: result,
          timestamp: Date.now()
        }))
      }
      
      setLocalData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed'
      setError(errorMessage)
      enterprise.sendNotification('error', errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [enterprise, componentName, complianceId, dataSourceId, cache])

  // Batch execute multiple actions
  const batchExecuteActions = useCallback(async (actions: Array<{ action: string; params: any }>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const results = await enterprise.batchExecuteActions(actions.map(({ action, params }) => ({
        action,
        params: {
          componentName,
          complianceId,
          dataSourceId,
          ...params
        }
      })))
      
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch actions failed'
      setError(errorMessage)
      enterprise.sendNotification('error', errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [enterprise, componentName, complianceId, dataSourceId])

  // Get real-time metrics with caching
  const getMetrics = useCallback(async () => {
    if (!enableMonitoring) return null
    
    try {
      const metrics = await enterprise.getComplianceStatus({ 
        data_source_id: dataSourceId,
        compliance_id: complianceId 
      })
      return metrics
    } catch (err) {
      console.error('Failed to get metrics:', err)
      return null
    }
  }, [enterprise, enableMonitoring, dataSourceId, complianceId])

  // Send notifications with enterprise features
  const sendNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string, options?: any) => {
    enterprise.sendNotification(type, message, {
      component: componentName,
      complianceId,
      dataSourceId,
      ...options
    })
  }, [enterprise, componentName, complianceId, dataSourceId])

  // Join collaboration workspace
  const joinWorkspace = useCallback(async (workspaceId: string) => {
    if (!enableCollaboration) return
    
    try {
      await enterprise.joinCollaboration(workspaceId)
      sendNotification('success', 'Joined collaboration workspace')
    } catch (err) {
      sendNotification('error', 'Failed to join workspace')
    }
  }, [enterprise, enableCollaboration, sendNotification])

  // Start workflow with context
  const startWorkflow = useCallback(async (workflowId: string, params: any) => {
    if (!enableWorkflows) return
    
    try {
      const instanceId = await enterprise.startWorkflow(workflowId, {
        component: componentName,
        complianceId,
        dataSourceId,
        ...params
      })
      sendNotification('success', 'Workflow started successfully')
      return instanceId
    } catch (err) {
      sendNotification('error', 'Failed to start workflow')
      throw err
    }
  }, [enterprise, enableWorkflows, sendNotification, componentName, complianceId, dataSourceId])

  // Get analytics insights
  const getInsights = useCallback(async () => {
    if (!enableAnalytics) return null
    
    try {
      const insights = await enterprise.getInsights('compliance', 10)
      return insights
    } catch (err) {
      console.error('Failed to get insights:', err)
      return null
    }
  }, [enterprise, enableAnalytics])

  // Clear cache
  const clearCache = useCallback(() => {
    setCache(new Map())
  }, [])

  return {
    // Core features
    executeAction,
    batchExecuteActions,
    sendNotification,
    getMetrics,
    getInsights,
    clearCache,
    
    // Collaboration
    joinWorkspace,
    leaveWorkspace: enterprise.leaveCollaboration,
    
    // Workflows
    startWorkflow,
    approveWorkflow: enterprise.approveWorkflow,
    
    // Data
    backendData: enterprise.backendData,
    localData,
    isLoading,
    error,
    
    // Features
    features: enterprise.features,
    
    // Status
    isConnected: enterprise.isConnected,
    metrics: enterprise.metrics,
    events: enterprise.events,
    notifications: enterprise.notifications,
    insights: enterprise.insights
  }
}

// Compliance monitoring hook with advanced features
export function useComplianceMonitoring(dataSourceId?: number, complianceId?: number) {
  const enterprise = useEnterpriseCompliance()
  
  const [monitoringData, setMonitoringData] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(true)

  // Get comprehensive compliance status
  const getComplianceStatus = useCallback(async (filters?: any) => {
    try {
      const status = await ComplianceAPIs.Management.getRequirements({
        data_source_id: dataSourceId,
        ...filters
      })
      setMonitoringData(status)
      return status
    } catch (err) {
      console.error('Failed to get compliance status:', err)
      return null
    }
  }, [dataSourceId])

  // Get risk assessment with detailed analysis
  const getRiskAssessment = useCallback(async () => {
    try {
      if (!dataSourceId) return null
      const assessment = await ComplianceAPIs.Risk.getRiskAssessment(dataSourceId.toString())
      return assessment
    } catch (err) {
      console.error('Failed to get risk assessment:', err)
      return null
    }
  }, [dataSourceId])

  // Get compliance trends
  const getComplianceTrends = useCallback(async (period: string = '30d') => {
    try {
      if (!dataSourceId) return null
      const trends = await ComplianceAPIs.Risk.getRiskTrends(dataSourceId.toString(), 'data_source', period)
      return trends
    } catch (err) {
      console.error('Failed to get compliance trends:', err)
      return null
    }
  }, [dataSourceId])

  // Monitor for compliance alerts
  useEffect(() => {
    if (!enterprise.config.monitoring.enableComplianceAlerts || !realTimeUpdates) return

    const checkAlerts = () => {
      const newAlerts = enterprise.events.filter(event => 
        (event.type === 'compliance_alert' || event.type === 'risk_threshold_exceeded') &&
        (event.severity === 'high' || event.severity === 'critical')
      )
      
      if (newAlerts.length > alerts.length) {
        setAlerts(newAlerts)
        const alertCount = newAlerts.length - alerts.length
        enterprise.sendNotification('warning', `${alertCount} new compliance alert${alertCount > 1 ? 's' : ''}`)
      }
    }

    const interval = setInterval(checkAlerts, enterprise.config.monitoring.monitoringInterval * 1000)
    return () => clearInterval(interval)
  }, [enterprise, alerts, realTimeUpdates])

  // Subscribe to real-time events
  useEffect(() => {
    if (!realTimeUpdates) return

    const unsubscribeCompliance = enterprise.addEventListener('compliance_alert', (event) => {
      setAlerts(prev => [...prev, event])
    })

    const unsubscribeRisk = enterprise.addEventListener('risk_threshold_exceeded', (event) => {
      setAlerts(prev => [...prev, event])
    })

    return () => {
      unsubscribeCompliance()
      unsubscribeRisk()
    }
  }, [enterprise, realTimeUpdates])

  return {
    getComplianceStatus,
    getRiskAssessment,
    getComplianceTrends,
    monitoringData,
    alerts,
    isMonitoring: enterprise.config.monitoring.enableRealTimeMonitoring,
    realTimeUpdates,
    setRealTimeUpdates
  }
}

// Risk assessment hook with advanced analytics
export function useRiskAssessment(dataSourceId?: number, entityType: string = 'data_source') {
  const enterprise = useEnterpriseCompliance()
  
  const [riskData, setRiskData] = useState<any>(null)
  const [riskFactors, setRiskFactors] = useState<any[]>([])
  const [riskMatrix, setRiskMatrix] = useState<any>(null)

  // Calculate comprehensive risk score
  const calculateRiskScore = useCallback(async (factors?: Record<string, any>) => {
    try {
      if (!dataSourceId) return null
      const result = await ComplianceAPIs.Risk.calculateRiskScore(
        dataSourceId.toString(), 
        entityType, 
        factors
      )
      setRiskData(result)
      return result
    } catch (err) {
      console.error('Failed to calculate risk score:', err)
      return null
    }
  }, [dataSourceId, entityType])

  // Get risk factors with detailed analysis
  const getRiskFactors = useCallback(async () => {
    try {
      if (!dataSourceId) return []
      const factors = await ComplianceAPIs.Risk.getRiskFactors(dataSourceId.toString(), entityType)
      setRiskFactors(factors)
      return factors
    } catch (err) {
      console.error('Failed to get risk factors:', err)
      return []
    }
  }, [dataSourceId, entityType])

  // Update risk factors with validation
  const updateRiskFactors = useCallback(async (factors: any[]) => {
    try {
      if (!dataSourceId) return
      await ComplianceAPIs.Risk.updateRiskFactors(dataSourceId.toString(), entityType, factors)
      setRiskFactors(factors)
      enterprise.sendNotification('success', 'Risk factors updated successfully')
      
      // Recalculate risk score after update
      await calculateRiskScore()
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to update risk factors')
      throw err
    }
  }, [dataSourceId, entityType, enterprise, calculateRiskScore])

  // Get risk matrix configuration
  const getRiskMatrix = useCallback(async () => {
    try {
      const matrix = await ComplianceAPIs.Risk.getRiskMatrix()
      setRiskMatrix(matrix)
      return matrix
    } catch (err) {
      console.error('Failed to get risk matrix:', err)
      return null
    }
  }, [])

  // Generate risk report
  const generateRiskReport = useCallback(async (reportType: string = 'detailed') => {
    try {
      if (!dataSourceId) return null
      const report = await ComplianceAPIs.Risk.generateRiskReport(
        dataSourceId.toString(), 
        entityType, 
        reportType
      )
      enterprise.sendNotification('success', 'Risk report generated successfully')
      return report
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to generate risk report')
      throw err
    }
  }, [dataSourceId, entityType, enterprise])

  return {
    calculateRiskScore,
    getRiskFactors,
    updateRiskFactors,
    getRiskMatrix,
    generateRiskReport,
    riskData,
    riskFactors,
    riskMatrix
  }
}

// Framework integration hook with multi-framework support
export function useFrameworkIntegration() {
  const enterprise = useEnterpriseCompliance()
  
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [frameworkMappings, setFrameworkMappings] = useState<Record<string, any>>({})

  // Get available frameworks with filtering
  const getFrameworks = useCallback(async (filters?: {
    category?: string
    status?: string
    jurisdiction?: string
    search?: string
  }) => {
    try {
      const result = await ComplianceAPIs.Framework.getFrameworks(filters)
      setFrameworks(result)
      return result
    } catch (err) {
      console.error('Failed to get frameworks:', err)
      return []
    }
  }, [])

  // Get framework details
  const getFramework = useCallback(async (frameworkId: string) => {
    try {
      const framework = await ComplianceAPIs.Framework.getFramework(frameworkId)
      return framework
    } catch (err) {
      console.error('Failed to get framework:', err)
      return null
    }
  }, [])

  // Import framework requirements with options
  const importFrameworkRequirements = useCallback(async (
    framework: string, 
    dataSourceId: number,
    options?: {
      overwrite_existing?: boolean
      import_controls?: boolean
      import_evidence_templates?: boolean
    }
  ) => {
    try {
      const result = await ComplianceAPIs.Framework.importFrameworkRequirements(
        framework, 
        dataSourceId, 
        options
      )
      enterprise.sendNotification('success', 
        `Imported ${result.imported_count} requirements from ${framework}`
      )
      return result
    } catch (err) {
      enterprise.sendNotification('error', `Failed to import ${framework} requirements`)
      throw err
    }
  }, [enterprise])

  // Validate framework compliance
  const validateFrameworkCompliance = useCallback(async (framework: string, entityId: string) => {
    try {
      const result = await ComplianceAPIs.Framework.validateFrameworkCompliance(
        framework, 
        entityId
      )
      return result
    } catch (err) {
      console.error('Failed to validate framework compliance:', err)
      return null
    }
  }, [])

  // Create framework mapping
  const createFrameworkMapping = useCallback(async (
    sourceFramework: string, 
    targetFramework: string, 
    mappings: Record<string, string[]>
  ) => {
    try {
      await ComplianceAPIs.Framework.createFrameworkMapping(
        sourceFramework, 
        targetFramework, 
        mappings
      )
      setFrameworkMappings(prev => ({
        ...prev,
        [`${sourceFramework}_${targetFramework}`]: mappings
      }))
      enterprise.sendNotification('success', 
        `Framework mapping created: ${sourceFramework} → ${targetFramework}`
      )
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to create framework mapping')
      throw err
    }
  }, [enterprise])

  // Get framework crosswalk
  const getFrameworkCrosswalk = useCallback(async (frameworkId: string) => {
    try {
      const crosswalk = await ComplianceAPIs.Framework.getFrameworkCrosswalk(frameworkId)
      return crosswalk
    } catch (err) {
      console.error('Failed to get framework crosswalk:', err)
      return null
    }
  }, [])

  return {
    getFrameworks,
    getFramework,
    importFrameworkRequirements,
    validateFrameworkCompliance,
    createFrameworkMapping,
    getFrameworkCrosswalk,
    frameworks,
    selectedFramework,
    setSelectedFramework,
    frameworkMappings
  }
}

// Audit features hook with comprehensive tracking
export function useAuditFeatures(entityType: string = 'compliance', entityId?: string) {
  const enterprise = useEnterpriseCompliance()
  
  const [auditTrail, setAuditTrail] = useState<any[]>([])
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [certifications, setCertifications] = useState<any[]>([])

  // Get comprehensive audit trail
  const getAuditTrail = useCallback(async (filters?: {
    action_type?: string
    user_id?: string
    date_from?: string
    date_to?: string
    page?: number
    limit?: number
  }) => {
    try {
      if (!entityId) return []
      const trail = await ComplianceAPIs.Audit.getAuditTrail(entityType, entityId, filters)
      setAuditTrail(trail.data)
      return trail.data
    } catch (err) {
      console.error('Failed to get audit trail:', err)
      return []
    }
  }, [entityType, entityId])

  // Generate compliance report with advanced options
  const generateReport = useCallback(async (
    reportType: string, 
    params?: any,
    schedule?: any
  ) => {
    try {
      const reportData = {
        name: `${reportType.replace('_', ' ').toUpperCase()} Report`,
        description: `Generated ${reportType} report`,
        report_type: reportType,
        file_format: 'pdf',
        parameters: params || {},
        filters: { entity_type: entityType, entity_id: entityId },
        schedule,
        recipients: [],
        distribution_method: 'download',
        access_level: 'internal',
        metadata: {}
      }
      
      const report = await ComplianceAPIs.Audit.createReport(reportData)
      const generated = await ComplianceAPIs.Audit.generateReport(report.id)
      
      enterprise.sendNotification('success', 'Report generated successfully')
      return generated
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to generate report')
      throw err
    }
  }, [entityType, entityId, enterprise])

  // Get compliance reports with filtering
  const getReports = useCallback(async (filters?: {
    framework?: string
    report_type?: string
    status?: string
  }) => {
    try {
      const result = await ComplianceAPIs.Audit.getComplianceReports({
        ...filters,
        page: 1,
        limit: 100
      })
      setReports(result.data)
      return result.data
    } catch (err) {
      console.error('Failed to get reports:', err)
      return []
    }
  }, [])

  // Get certifications
  const getCertifications = useCallback(async () => {
    try {
      if (!entityId) return []
      const certs = await ComplianceAPIs.Audit.getCertifications(entityId, entityType)
      setCertifications(certs)
      return certs
    } catch (err) {
      console.error('Failed to get certifications:', err)
      return []
    }
  }, [entityId, entityType])

  // Upload certification
  const uploadCertification = useCallback(async (certification: any, file?: File) => {
    try {
      if (!entityId) return null
      const result = await ComplianceAPIs.Audit.uploadCertification(entityId, certification, file)
      enterprise.sendNotification('success', 'Certification uploaded successfully')
      await getCertifications() // Refresh list
      return result
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to upload certification')
      throw err
    }
  }, [entityId, enterprise, getCertifications])

  return {
    getAuditTrail,
    generateReport,
    getReports,
    getCertifications,
    uploadCertification,
    auditTrail,
    reports,
    certifications
  }
}

// Workflow integration hook with advanced automation
export function useWorkflowIntegration() {
  const enterprise = useEnterpriseCompliance()
  
  const [workflows, setWorkflows] = useState<ComplianceWorkflow[]>([])
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([])
  const [workflowTemplates, setWorkflowTemplates] = useState<any[]>([])

  // Get workflows with advanced filtering
  const getWorkflows = useCallback(async (filters?: {
    workflow_type?: string
    status?: string
    assigned_to?: string
    priority?: string
  }) => {
    try {
      const result = await ComplianceAPIs.Workflow.getWorkflows(filters)
      setWorkflows(result.data)
      return result.data
    } catch (err) {
      console.error('Failed to get workflows:', err)
      return []
    }
  }, [])

  // Get workflow details
  const getWorkflow = useCallback(async (id: number) => {
    try {
      const workflow = await ComplianceAPIs.Workflow.getWorkflow(id)
      return workflow
    } catch (err) {
      console.error('Failed to get workflow:', err)
      return null
    }
  }, [])

  // Start workflow with advanced parameters
  const startWorkflow = useCallback(async (workflowId: number, params?: any) => {
    try {
      const result = await ComplianceAPIs.Workflow.startWorkflow(workflowId, params)
      enterprise.sendNotification('success', 'Workflow started successfully')
      
      // Refresh active workflows
      await getActiveWorkflows()
      
      return result.instance_id
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to start workflow')
      throw err
    }
  }, [enterprise])

  // Manage workflow instances
  const manageWorkflow = useCallback(async (instanceId: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      switch (action) {
        case 'pause':
          await ComplianceAPIs.Workflow.pauseWorkflow(instanceId)
          break
        case 'resume':
          await ComplianceAPIs.Workflow.resumeWorkflow(instanceId)
          break
        case 'cancel':
          await ComplianceAPIs.Workflow.cancelWorkflow(instanceId)
          break
      }
      
      enterprise.sendNotification('success', `Workflow ${action}ed successfully`)
      await getActiveWorkflows() // Refresh list
    } catch (err) {
      enterprise.sendNotification('error', `Failed to ${action} workflow`)
      throw err
    }
  }, [enterprise])

  // Approve workflow step
  const approveWorkflowStep = useCallback(async (
    instanceId: string, 
    stepId: string, 
    decision: 'approve' | 'reject', 
    notes?: string
  ) => {
    try {
      await ComplianceAPIs.Workflow.approveWorkflowStep(instanceId, stepId, decision, notes)
      enterprise.sendNotification('success', `Workflow step ${decision}ed`)
      await getActiveWorkflows() // Refresh list
    } catch (err) {
      enterprise.sendNotification('error', `Failed to ${decision} workflow step`)
      throw err
    }
  }, [enterprise])

  // Get workflow status
  const getWorkflowStatus = useCallback(async (instanceId: string) => {
    try {
      const status = await ComplianceAPIs.Workflow.getWorkflowStatus(instanceId)
      return status
    } catch (err) {
      console.error('Failed to get workflow status:', err)
      return null
    }
  }, [])

  // Get active workflow instances
  const getActiveWorkflows = useCallback(async (filters?: {
    workflow_id?: number
    assigned_to?: string
    status?: string
  }) => {
    try {
      const instances = await ComplianceAPIs.Workflow.getActiveWorkflowInstances(filters)
      setActiveWorkflows(instances)
      return instances
    } catch (err) {
      console.error('Failed to get active workflows:', err)
      return []
    }
  }, [])

  // Get workflow templates
  const getWorkflowTemplates = useCallback(async () => {
    try {
      const templates = await ComplianceAPIs.Workflow.getWorkflowTemplates()
      setWorkflowTemplates(templates)
      return templates
    } catch (err) {
      console.error('Failed to get workflow templates:', err)
      return []
    }
  }, [])

  // Create workflow from template
  const createWorkflowFromTemplate = useCallback(async (templateId: string, customizations?: any) => {
    try {
      const template = workflowTemplates.find(t => t.id === templateId)
      if (!template) throw new Error('Template not found')
      
      const workflowData = {
        ...template,
        ...customizations,
        id: undefined, // Remove template ID
        status: 'draft'
      }
      
      const workflow = await ComplianceAPIs.Workflow.createWorkflow(workflowData)
      enterprise.sendNotification('success', 'Workflow created from template')
      await getWorkflows() // Refresh list
      return workflow
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to create workflow from template')
      throw err
    }
  }, [workflowTemplates, enterprise])

  return {
    getWorkflows,
    getWorkflow,
    startWorkflow,
    manageWorkflow,
    approveWorkflowStep,
    getWorkflowStatus,
    getActiveWorkflows,
    getWorkflowTemplates,
    createWorkflowFromTemplate,
    workflows,
    activeWorkflows,
    workflowTemplates
  }
}

// Analytics integration hook with AI insights
export function useAnalyticsIntegration(dataSourceId?: number, complianceId?: number) {
  const enterprise = useEnterpriseCompliance()
  
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])

  // Get comprehensive analytics data
  const getAnalytics = useCallback(async (timeRange?: string, filters?: any) => {
    try {
      const data = await enterprise.getAnalytics(timeRange, {
        data_source_id: dataSourceId,
        compliance_id: complianceId,
        ...filters
      })
      setAnalyticsData(data)
      return data
    } catch (err) {
      console.error('Failed to get analytics:', err)
      return null
    }
  }, [enterprise, dataSourceId, complianceId])

  // Get AI-powered insights
  const getInsights = useCallback(async (category?: string, limit?: number) => {
    try {
      const data = await enterprise.getInsights(category, limit)
      setInsights(data)
      return data
    } catch (err) {
      console.error('Failed to get insights:', err)
      return []
    }
  }, [enterprise])

  // Generate specific insight
  const generateInsight = useCallback(async (type: string, params: any) => {
    try {
      const insight = await enterprise.generateInsight(type, {
        data_source_id: dataSourceId,
        compliance_id: complianceId,
        ...params
      })
      setInsights(prev => [insight, ...prev])
      enterprise.sendNotification('success', 'New insight generated')
      return insight
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to generate insight')
      throw err
    }
  }, [enterprise, dataSourceId, complianceId])

  // Get compliance trends
  const getComplianceTrends = useCallback(async (period: string = '90d') => {
    try {
      if (!dataSourceId) return []
      const trendData = await ComplianceAPIs.Risk.getRiskTrends(
        dataSourceId.toString(), 
        'data_source', 
        period
      )
      setTrends(trendData)
      return trendData
    } catch (err) {
      console.error('Failed to get compliance trends:', err)
      return []
    }
  }, [dataSourceId])

  // Get predictive analytics
  const getPredictiveAnalytics = useCallback(async () => {
    try {
      const result = await generateInsight('risk_prediction', {
        prediction_horizon: '30d',
        confidence_threshold: 0.8
      })
      setPredictions(prev => [result, ...prev])
      return result
    } catch (err) {
      console.error('Failed to get predictive analytics:', err)
      return null
    }
  }, [generateInsight])

  // Get anomaly detection
  const getAnomalyDetection = useCallback(async () => {
    try {
      const result = await generateInsight('anomaly_detection', {
        sensitivity: 'medium',
        lookback_period: '7d'
      })
      return result
    } catch (err) {
      console.error('Failed to get anomaly detection:', err)
      return null
    }
  }, [generateInsight])

  // Dismiss insight
  const dismissInsight = useCallback(async (insightId: string) => {
    try {
      await enterprise.dismissInsight(insightId)
      setInsights(prev => prev.filter(i => i.id !== insightId))
    } catch (err) {
      console.error('Failed to dismiss insight:', err)
    }
  }, [enterprise])

  return {
    getAnalytics,
    getInsights,
    generateInsight,
    getComplianceTrends,
    getPredictiveAnalytics,
    getAnomalyDetection,
    dismissInsight,
    analyticsData,
    insights,
    trends,
    predictions
  }
}

// Evidence management hook with advanced features
export function useEvidenceManagement(requirementId?: number, dataSourceId?: number) {
  const enterprise = useEnterpriseCompliance()
  
  const [evidence, setEvidence] = useState<ComplianceEvidence[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // Get evidence with filtering
  const getEvidence = useCallback(async (filters?: {
    evidence_type?: string
    verification_status?: string
    page?: number
    limit?: number
  }) => {
    try {
      const result = await ComplianceAPIs.Management.getEvidence({
        data_source_id: dataSourceId,
        requirement_id: requirementId,
        ...filters
      })
      setEvidence(result.data)
      return result.data
    } catch (err) {
      console.error('Failed to get evidence:', err)
      return []
    }
  }, [dataSourceId, requirementId])

  // Create evidence entry
  const createEvidence = useCallback(async (evidenceData: Partial<ComplianceEvidence>) => {
    try {
      const evidence = await ComplianceAPIs.Management.createEvidence({
        data_source_id: dataSourceId!,
        requirement_id: requirementId!,
        collection_date: new Date().toISOString(),
        is_current: true,
        verification_status: 'pending',
        access_level: 'internal',
        metadata: {},
        ...evidenceData
      })
      
      setEvidence(prev => [evidence, ...prev])
      enterprise.sendNotification('success', 'Evidence created successfully')
      return evidence
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to create evidence')
      throw err
    }
  }, [dataSourceId, requirementId, enterprise])

  // Upload evidence file
  const uploadEvidenceFile = useCallback(async (evidenceId: number, file: File) => {
    try {
      const uploadId = `upload_${evidenceId}_${Date.now()}`
      
      const evidence = await ComplianceAPIs.Management.uploadEvidenceFile(
        evidenceId,
        file,
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [uploadId]: progress }))
        }
      )
      
      // Remove progress tracking
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[uploadId]
        return newProgress
      })
      
      // Update evidence list
      setEvidence(prev => prev.map(e => e.id === evidenceId ? evidence : e))
      enterprise.sendNotification('success', 'Evidence file uploaded successfully')
      return evidence
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to upload evidence file')
      throw err
    }
  }, [enterprise])

  // Verify evidence
  const verifyEvidence = useCallback(async (
    evidenceId: number, 
    status: ComplianceEvidence['verification_status'], 
    notes?: string
  ) => {
    try {
      const evidence = await ComplianceAPIs.Management.verifyEvidence(evidenceId, {
        verification_status: status,
        verification_notes: notes
      })
      
      setEvidence(prev => prev.map(e => e.id === evidenceId ? evidence : e))
      enterprise.sendNotification('success', `Evidence ${status}`)
      return evidence
    } catch (err) {
      enterprise.sendNotification('error', `Failed to ${status} evidence`)
      throw err
    }
  }, [enterprise])

  // Download evidence file
  const downloadEvidenceFile = useCallback(async (evidenceId: number) => {
    try {
      const blob = await ComplianceAPIs.Management.downloadEvidenceFile(evidenceId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `evidence_${evidenceId}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      enterprise.sendNotification('success', 'Evidence file downloaded')
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to download evidence file')
      throw err
    }
  }, [enterprise])

  return {
    getEvidence,
    createEvidence,
    uploadEvidenceFile,
    verifyEvidence,
    downloadEvidenceFile,
    evidence,
    uploadProgress
  }
}

// Integration management hook
export function useIntegrationManagement() {
  const enterprise = useEnterpriseCompliance()
  
  const [integrations, setIntegrations] = useState<ComplianceIntegration[]>([])
  const [availableIntegrations, setAvailableIntegrations] = useState<any[]>([])
  const [syncStatus, setSyncStatus] = useState<Record<number, any>>({})

  // Get integrations
  const getIntegrations = useCallback(async (filters?: {
    integration_type?: string
    provider?: string
    status?: string
  }) => {
    try {
      const result = await ComplianceAPIs.Integration.getIntegrations(filters)
      setIntegrations(result)
      return result
    } catch (err) {
      console.error('Failed to get integrations:', err)
      return []
    }
  }, [])

  // Get available integrations
  const getAvailableIntegrations = useCallback(async () => {
    try {
      const result = await ComplianceAPIs.Integration.getAvailableIntegrations()
      setAvailableIntegrations(result)
      return result
    } catch (err) {
      console.error('Failed to get available integrations:', err)
      return []
    }
  }, [])

  // Test integration
  const testIntegration = useCallback(async (integrationId: number) => {
    try {
      const result = await ComplianceAPIs.Integration.testIntegration(integrationId)
      
      if (result.status === 'success') {
        enterprise.sendNotification('success', 'Integration test successful')
      } else {
        enterprise.sendNotification('error', `Integration test failed: ${result.error_message}`)
      }
      
      return result
    } catch (err) {
      enterprise.sendNotification('error', 'Integration test failed')
      throw err
    }
  }, [enterprise])

  // Sync integration
  const syncIntegration = useCallback(async (integrationId: number, fullSync: boolean = false) => {
    try {
      const result = await ComplianceAPIs.Integration.syncIntegration(integrationId, { full_sync: fullSync })
      
      setSyncStatus(prev => ({
        ...prev,
        [integrationId]: { status: 'syncing', sync_id: result.sync_id }
      }))
      
      enterprise.sendNotification('info', 'Integration sync started')
      return result
    } catch (err) {
      enterprise.sendNotification('error', 'Failed to start integration sync')
      throw err
    }
  }, [enterprise])

  // Get integration status
  const getIntegrationStatus = useCallback(async (integrationId: number) => {
    try {
      const status = await ComplianceAPIs.Integration.getIntegrationStatus(integrationId)
      setSyncStatus(prev => ({ ...prev, [integrationId]: status }))
      return status
    } catch (err) {
      console.error('Failed to get integration status:', err)
      return null
    }
  }, [])

  return {
    getIntegrations,
    getAvailableIntegrations,
    testIntegration,
    syncIntegration,
    getIntegrationStatus,
    integrations,
    availableIntegrations,
    syncStatus
  }
}

// Export all hooks as a collection
export const ComplianceHooks = {
  useEnterpriseFeatures,
  useComplianceMonitoring,
  useRiskAssessment,
  useFrameworkIntegration,
  useAuditFeatures,
  useWorkflowIntegration,
  useAnalyticsIntegration,
  useEvidenceManagement,
  useIntegrationManagement
}

// Export individual hooks for direct use
export {
  useEnterpriseFeatures,
  useComplianceMonitoring,
  useRiskAssessment,
  useFrameworkIntegration,
  useAuditFeatures,
  useWorkflowIntegration,
  useAnalyticsIntegration,
  useEvidenceManagement,
  useIntegrationManagement
}

export default ComplianceHooks