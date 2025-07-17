"use client"

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  Settings,
  Activity,
  TrendingUp,
  Users,
  Shield,
  Cloud,
  Search,
  BarChart3,
  Eye,
  Zap,
  Target,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Upload,
  RefreshCw,
  HelpCircle,
  User,
  LogOut,
  Monitor,
  Palette,
  Globe,
  Lock,
  Building,
  FileText,
  MessageSquare,
  Star,
  Grid,
  List,
  Layers,
  GitBranch,
  Workflow,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Play,
  Pause,
  Stop,
  Edit,
  Trash2,
  Copy,
  Share2,
  ExternalLink,
  MoreHorizontal,
  Sparkles,
  Brain,
  Bot,
  Radar,
  TestTube,
  Beaker,
  Microscope
} from "lucide-react"

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ============================================================================
// ENTERPRISE SYSTEM IMPORTS - PHASE 1-3 INTEGRATION
// ============================================================================

// Phase 1: Core Infrastructure
import { workflowEngine } from './core/workflow-engine'
import { eventBus } from './core/event-bus'
import { stateManager } from './core/state-manager'
import { componentRegistry } from './core/component-registry'
import { coreInfrastructureOrchestrator } from './core/core-infrastructure-orchestrator'

// Phase 2: Advanced Integration
import { approvalSystem } from './workflows/approval-system'
import { bulkOperationsManager } from './workflows/bulk-operations'
import { correlationEngine } from './analytics/correlation-engine'
import { realTimeCollaborationManager } from './collaboration/realtime-collaboration'

// Phase 3: UI/UX Components
import { EnterpriseDashboard } from './ui/dashboard/enterprise-dashboard'
import { WorkflowDesigner } from './ui/workflow/workflow-designer'
import { CollaborationStudio } from './ui/collaboration/collaboration-studio'
import { AnalyticsWorkbench } from './ui/analytics/analytics-workbench'

// Existing Data-Sources Components
import { DataSourceList } from "./data-source-list"
import { DataSourceGrid } from "./data-source-grid"
import { DataSourceDetails } from "./data-source-details"
import { DataSourceCreateModal } from "./data-source-create-modal"
import { DataSourceEditModal } from "./data-source-edit-modal"
import { DataSourceConnectionTestModal } from "./data-source-connection-test-modal"
import { DataSourceMonitoring } from "./data-source-monitoring"
import { DataSourceMonitoringDashboard } from "./data-source-monitoring-dashboard"
import { DataSourceBulkActions } from "./data-source-bulk-actions"

// Data Discovery Components
import { DataDiscoveryWorkspace } from "./data-discovery/data-discovery-workspace"
import { DataLineageGraph } from "./data-discovery/data-lineage-graph"
import { SchemaDiscovery } from "./data-discovery/schema-discovery"

// Types and Services
import { DataSource, ViewMode, PanelLayout, WorkspaceContext as WorkspaceContextType } from "./types"
import { useDataSourcesQuery, useUserQuery, useNotificationsQuery } from "./services/apis"

// ============================================================================
// ENTERPRISE WORKFLOW CONTEXT
// ============================================================================

interface EnterpriseWorkflowContext extends WorkspaceContextType {
  // Enterprise workflow capabilities
  workflowEngine: typeof workflowEngine
  activeWorkflows: WorkflowExecution[]
  triggerWorkflow: (type: string, params: any) => Promise<string>
  monitorWorkflow: (id: string) => void
  cancelWorkflow: (id: string) => void
  
  // Real-time collaboration
  collaborationSession: string | null
  participants: Participant[]
  startCollaboration: (type: string) => Promise<void>
  lockResource: (resourceId: string, type: string) => Promise<boolean>
  
  // Analytics and insights
  insights: InsightResult[]
  correlations: CorrelationResult[]
  generateInsights: (dataSourceIds: number[]) => Promise<void>
  predictPerformance: (dataSourceId: number) => Promise<PredictionResult>
  
  // Approval workflows
  pendingApprovals: ApprovalRequest[]
  requestApproval: (operation: string, details: any) => Promise<string>
  
  // Bulk operations
  activeBulkOperations: BulkOperation[]
  executeBulkOperation: (type: string, items: any[], config: any) => Promise<string>
  
  // State management
  globalState: any
  syncState: (key: string, value: any) => Promise<void>
  resolveConflicts: (conflicts: StateConflict[]) => Promise<void>
}

const EnterpriseWorkspaceContext = createContext<EnterpriseWorkflowContext>({} as EnterpriseWorkflowContext)

// ============================================================================
// ENTERPRISE DATA SOURCES APP
// ============================================================================

export const EnterpriseDataSourcesApp: React.FC = () => {
  // Core state
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [activeView, setActiveView] = useState("enterprise-overview")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  
  // Enterprise state
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowExecution[]>([])
  const [collaborationSession, setCollaborationSession] = useState<string | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [insights, setInsights] = useState<InsightResult[]>([])
  const [correlations, setCorrelations] = useState<CorrelationResult[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([])
  const [activeBulkOperations, setActiveBulkOperations] = useState<BulkOperation[]>([])
  const [globalState, setGlobalState] = useState<any>({})
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filters, setFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  
  // Data fetching
  const { data: dataSources, isLoading: dataSourcesLoading, refetch: refetchDataSources } = useDataSourcesQuery()
  const { data: user } = useUserQuery()
  const { data: userNotifications } = useNotificationsQuery()

  // ========================================================================
  // ENTERPRISE SYSTEM INITIALIZATION
  // ========================================================================

  useEffect(() => {
    const initializeEnterpriseSystem = async () => {
      try {
        // Initialize core infrastructure
        await coreInfrastructureOrchestrator.initialize()
        
        // Register data source components
        await componentRegistry.registerComponent({
          id: 'data-sources-app',
          name: 'Enterprise Data Sources',
          type: 'application',
          version: '4.0.0',
          capabilities: [
            'data-source-management',
            'workflow-orchestration',
            'real-time-collaboration',
            'advanced-analytics',
            'bulk-operations'
          ],
          dependencies: [
            'workflow-engine',
            'event-bus',
            'state-manager',
            'approval-system',
            'correlation-engine'
          ]
        })
        
        // Initialize collaboration
        const sessionId = await realTimeCollaborationManager.createSession(
          'Enterprise Data Sources Management',
          'Collaborative data source management with enterprise features',
          'data_source_management',
          user?.id || 'current-user'
        )
        setCollaborationSession(sessionId)
        
        // Subscribe to enterprise events
        subscribeToEnterpriseEvents()
        
        // Load initial insights
        if (dataSources && dataSources.length > 0) {
          await generateDataSourceInsights(dataSources.map(ds => ds.id))
        }
        
      } catch (error) {
        console.error('Failed to initialize enterprise system:', error)
      }
    }
    
    initializeEnterpriseSystem()
  }, [user?.id, dataSources])

  // ========================================================================
  // ENTERPRISE EVENT SUBSCRIPTIONS
  // ========================================================================

  const subscribeToEnterpriseEvents = useCallback(() => {
    // Workflow events
    eventBus.subscribe('workflow:execution:started', handleWorkflowStarted)
    eventBus.subscribe('workflow:execution:completed', handleWorkflowCompleted)
    eventBus.subscribe('workflow:execution:failed', handleWorkflowFailed)
    
    // Data source events
    eventBus.subscribe('data_source:health:changed', handleDataSourceHealthChanged)
    eventBus.subscribe('data_source:created', handleDataSourceCreated)
    eventBus.subscribe('data_source:updated', handleDataSourceUpdated)
    eventBus.subscribe('data_source:deleted', handleDataSourceDeleted)
    
    // Collaboration events
    eventBus.subscribe('collaboration:participant:joined', handleParticipantJoined)
    eventBus.subscribe('collaboration:participant:left', handleParticipantLeft)
    eventBus.subscribe('collaboration:operation:broadcast', handleCollaborativeOperation)
    
    // Analytics events
    eventBus.subscribe('analytics:insight:generated', handleInsightGenerated)
    eventBus.subscribe('analytics:correlation:found', handleCorrelationFound)
    eventBus.subscribe('analytics:prediction:completed', handlePredictionCompleted)
    
    // Approval events
    eventBus.subscribe('approval:request:created', handleApprovalCreated)
    eventBus.subscribe('approval:request:approved', handleApprovalApproved)
    eventBus.subscribe('approval:request:rejected', handleApprovalRejected)
    
    // Bulk operation events
    eventBus.subscribe('bulk:operation:started', handleBulkOperationStarted)
    eventBus.subscribe('bulk:operation:progress', handleBulkOperationProgress)
    eventBus.subscribe('bulk:operation:completed', handleBulkOperationCompleted)
    
    // State management events
    eventBus.subscribe('state:conflict:detected', handleStateConflict)
    eventBus.subscribe('state:conflict:resolved', handleStateConflictResolved)
    
    return () => {
      eventBus.unsubscribe('workflow:*', handleWorkflowStarted)
      eventBus.unsubscribe('data_source:*', handleDataSourceHealthChanged)
      eventBus.unsubscribe('collaboration:*', handleParticipantJoined)
      eventBus.unsubscribe('analytics:*', handleInsightGenerated)
      eventBus.unsubscribe('approval:*', handleApprovalCreated)
      eventBus.unsubscribe('bulk:*', handleBulkOperationStarted)
      eventBus.unsubscribe('state:*', handleStateConflict)
    }
  }, [])

  // ========================================================================
  // ENTERPRISE EVENT HANDLERS
  // ========================================================================

  const handleWorkflowStarted = useCallback((event: any) => {
    const { workflowId, type, params } = event.payload
    setActiveWorkflows(prev => [...prev, {
      id: workflowId,
      type,
      status: 'running',
      startTime: new Date(),
      params
    }])
    
    addNotification({
      type: 'info',
      title: 'Workflow Started',
      message: `${type} workflow has been initiated`,
      workflowId
    })
  }, [])

  const handleWorkflowCompleted = useCallback((event: any) => {
    const { workflowId, result } = event.payload
    setActiveWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: 'completed', result, endTime: new Date() }
        : w
    ))
    
    addNotification({
      type: 'success',
      title: 'Workflow Completed',
      message: 'Workflow has been completed successfully',
      actions: [
        { label: 'View Results', action: () => openWorkflowResults(workflowId) }
      ]
    })
  }, [])

  const handleDataSourceHealthChanged = useCallback((event: any) => {
    const { dataSourceId, oldHealth, newHealth, severity } = event.payload
    
    // Update data source in local state
    setSelectedDataSource(prev => 
      prev?.id === dataSourceId 
        ? { ...prev, health_score: newHealth, lastHealthCheck: new Date() }
        : prev
    )
    
    if (severity === 'critical') {
      addNotification({
        type: 'error',
        title: 'Critical Health Issue',
        message: `Data source ${dataSourceId} requires immediate attention`,
        actions: [
          { label: 'Investigate', action: () => setActiveView('monitoring') },
          { label: 'Run Diagnostics', action: () => triggerDiagnosticWorkflow(dataSourceId) }
        ]
      })
    }
  }, [])

  const handleInsightGenerated = useCallback((event: any) => {
    const { insight } = event.payload
    setInsights(prev => [insight, ...prev.slice(0, 9)]) // Keep latest 10
    
    if (insight.impact === 'high' || insight.impact === 'critical') {
      addNotification({
        type: 'info',
        title: 'New Insight Generated',
        message: insight.title,
        actions: [
          { label: 'View Insight', action: () => setActiveView('analytics') }
        ]
      })
    }
  }, [])

  const handleApprovalCreated = useCallback((event: any) => {
    const { approval } = event.payload
    setPendingApprovals(prev => [...prev, approval])
    
    addNotification({
      type: 'info',
      title: 'Approval Request Created',
      message: `${approval.type} requires approval`,
      actions: [
        { label: 'View Approval', action: () => setActiveView('approvals') }
      ]
    })
  }, [])

  const handleBulkOperationStarted = useCallback((event: any) => {
    const { operationId, type, itemCount } = event.payload
    setActiveBulkOperations(prev => [...prev, {
      id: operationId,
      type,
      status: 'running',
      progress: 0,
      totalItems: itemCount,
      startTime: new Date()
    }])
  }, [])

  // ========================================================================
  // ENTERPRISE WORKFLOW OPERATIONS
  // ========================================================================

  const triggerWorkflow = useCallback(async (type: string, params: any): Promise<string> => {
    const workflowId = await workflowEngine.executeWorkflow(type, {
      ...params,
      requester: user?.id,
      timestamp: new Date(),
      source: 'data_sources_app'
    })
    
    return workflowId
  }, [user?.id])

  const monitorWorkflow = useCallback((workflowId: string) => {
    const workflow = activeWorkflows.find(w => w.id === workflowId)
    if (workflow) {
      setActiveView('workflows')
      // Additional monitoring logic
    }
  }, [activeWorkflows])

  const cancelWorkflow = useCallback(async (workflowId: string) => {
    await workflowEngine.cancelExecution(workflowId)
    setActiveWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: 'cancelled', endTime: new Date() }
        : w
    ))
  }, [])

  // ========================================================================
  // ENTERPRISE DATA SOURCE OPERATIONS
  // ========================================================================

  const createDataSourceWithWorkflow = useCallback(async (params: any) => {
    // Route through approval workflow for enterprise governance
    if (params.criticality === 'critical' || params.environment === 'production') {
      const approvalId = await approvalSystem.createRequest({
        type: 'data_source_creation',
        title: `Create Data Source: ${params.name}`,
        description: `Request to create ${params.criticality} data source in ${params.environment}`,
        requester: user?.id || 'unknown',
        priority: params.criticality === 'critical' ? 'high' : 'medium',
        data: params,
        approvers: getRequiredApprovers('create', params),
        policies: ['data_source_creation_policy']
      })
      
      return approvalId
    } else {
      // Direct creation for non-critical resources
      const workflowId = await triggerWorkflow('data_source_creation', params)
      return workflowId
    }
  }, [user?.id])

  const bulkUpdateDataSources = useCallback(async (
    dataSourceIds: number[], 
    updates: any, 
    config: any = {}
  ) => {
    const operationId = await bulkOperationsManager.executeOperation({
      type: 'data_source_bulk_update',
      batchSize: config.batchSize || 5,
      parallelism: config.parallelism || 3,
      rollbackOnFailure: config.rollbackOnFailure ?? true,
      items: dataSourceIds.map(id => ({ 
        id: id.toString(), 
        data: { dataSourceId: id, updates } 
      })),
      executor: async (item: any) => {
        const { dataSourceId, updates } = item.data
        // Apply updates through workflow engine for audit trail
        return await triggerWorkflow('data_source_update', {
          dataSourceId,
          updates,
          source: 'bulk_operation'
        })
      },
      progressCallback: (progress) => {
        handleBulkOperationProgress({ payload: { operationId, ...progress } })
      }
    })
    
    return operationId
  }, [])

  const generateDataSourceInsights = useCallback(async (dataSourceIds: number[]) => {
    // Use correlation engine to analyze data source patterns
    const dataPoints = dataSources
      ?.filter(ds => dataSourceIds.includes(ds.id))
      .map(ds => ({
        id: ds.id,
        health_score: ds.health_score || 0,
        response_time: ds.avg_response_time || 0,
        error_rate: ds.error_rate || 0,
        usage: ds.queries_per_second || 0,
        size: ds.size_gb || 0
      })) || []

    if (dataPoints.length > 1) {
      const correlations = await correlationEngine.analyzeCorrelations([
        { name: 'health_score', data: dataPoints.map(dp => dp.health_score) },
        { name: 'response_time', data: dataPoints.map(dp => dp.response_time) },
        { name: 'error_rate', data: dataPoints.map(dp => dp.error_rate) },
        { name: 'usage', data: dataPoints.map(dp => dp.usage) }
      ])
      
      setCorrelations(correlations.correlations)
      
      // Generate insights
      const insights = await correlationEngine.generateInsights(correlations.correlations)
      setInsights(insights)
    }
  }, [dataSources])

  const predictDataSourcePerformance = useCallback(async (dataSourceId: number) => {
    const prediction = await correlationEngine.predict('data_source_performance', {
      dataSourceId,
      features: [
        'historical_health_scores',
        'response_time_trend',
        'error_rate_trend',
        'usage_pattern'
      ],
      horizon: 7 // 7 days
    })
    
    return prediction
  }, [])

  // ========================================================================
  // COLLABORATIVE OPERATIONS
  // ========================================================================

  const startCollaboration = useCallback(async (type: string) => {
    if (!collaborationSession) {
      const sessionId = await realTimeCollaborationManager.createSession(
        `Data Source ${type}`,
        `Collaborative ${type} session`,
        type as any,
        user?.id || 'current-user'
      )
      setCollaborationSession(sessionId)
    }
  }, [collaborationSession, user?.id])

  const lockResource = useCallback(async (resourceId: string, type: string): Promise<boolean> => {
    if (!collaborationSession) return false
    
    const lockResult = await realTimeCollaborationManager.lockDocument(
      collaborationSession,
      user?.id || 'current-user',
      resourceId,
      type
    )
    
    return lockResult.success
  }, [collaborationSession, user?.id])

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  const addNotification = useCallback((notification: any) => {
    setNotifications(prev => [
      { id: Date.now().toString(), timestamp: new Date(), ...notification },
      ...prev.slice(0, 9)
    ])
  }, [])

  const getRequiredApprovers = (operation: string, details: any) => {
    const approvers = ['data_team_lead']
    
    if (details.criticality === 'critical') {
      approvers.push('security_team_lead', 'data_architect')
    }
    
    if (operation === 'delete') {
      approvers.push('database_admin')
    }
    
    return approvers
  }

  const triggerDiagnosticWorkflow = useCallback(async (dataSourceId: number) => {
    const workflowId = await triggerWorkflow('data_source_diagnostics', {
      dataSourceId,
      tests: ['connectivity', 'performance', 'security', 'compliance'],
      generateReport: true
    })
    
    addNotification({
      type: 'info',
      title: 'Diagnostic Started',
      message: `Running comprehensive diagnostics for data source ${dataSourceId}`,
      workflowId
    })
    
    return workflowId
  }, [])

  const openWorkflowResults = useCallback((workflowId: string) => {
    setActiveView('workflows')
    // Additional logic to show specific workflow results
  }, [])

  // ========================================================================
  // ENTERPRISE WORKSPACE CONTEXT
  // ========================================================================

  const enterpriseContextValue = useMemo<EnterpriseWorkflowContext>(() => ({
    // Base workspace context
    selectedDataSource,
    setSelectedDataSource,
    activeView,
    setActiveView,
    layout: 'standard',
    setLayout: () => {},
    panels: [],
    setPanels: () => {},
    notifications,
    addNotification,
    removeNotification: (id: string) => setNotifications(prev => prev.filter(n => n.id !== id)),
    selectedItems,
    setSelectedItems,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    expandedPanels: new Set(),
    togglePanel: () => {},
    quickActions: [],
    addQuickAction: () => {},
    removeQuickAction: () => {},
    
    // Enterprise extensions
    workflowEngine,
    activeWorkflows,
    triggerWorkflow,
    monitorWorkflow,
    cancelWorkflow,
    
    collaborationSession,
    participants,
    startCollaboration,
    lockResource,
    
    insights,
    correlations,
    generateInsights: generateDataSourceInsights,
    predictPerformance: predictDataSourcePerformance,
    
    pendingApprovals,
    requestApproval: async (operation: string, details: any) => {
      return await approvalSystem.createRequest({
        type: `data_source_${operation}`,
        title: `Data Source ${operation}`,
        description: `${operation} operation request`,
        requester: user?.id || 'unknown',
        priority: details.criticality === 'critical' ? 'high' : 'medium',
        data: details,
        approvers: getRequiredApprovers(operation, details),
        policies: [`data_source_${operation}_policy`]
      })
    },
    
    activeBulkOperations,
    executeBulkOperation: bulkUpdateDataSources,
    
    globalState,
    syncState: async (key: string, value: any) => {
      await stateManager.updateState('data_sources', key, value)
      setGlobalState(prev => ({ ...prev, [key]: value }))
    },
    resolveConflicts: async (conflicts: any[]) => {
      for (const conflict of conflicts) {
        await stateManager.resolveConflict(conflict.id, {
          strategy: 'last_writer_wins',
          metadata: { resolvedBy: user?.id, timestamp: new Date() }
        })
      }
    }
  }), [
    selectedDataSource, activeView, notifications, selectedItems, filters, searchQuery, viewMode,
    activeWorkflows, collaborationSession, participants, insights, correlations, pendingApprovals,
    activeBulkOperations, globalState, user?.id
  ])

  // ========================================================================
  // ENHANCED COMPONENT RENDERER
  // ========================================================================

  const renderEnterpriseComponent = (componentId: string) => {
    const commonProps = {
      dataSource: selectedDataSource,
      dataSources,
      onSelectDataSource: setSelectedDataSource,
      user,
      
      // Enterprise context
      workflowEngine,
      eventBus,
      stateManager,
      correlationEngine,
      collaborationSession,
      insights,
      correlations,
      activeWorkflows,
      pendingApprovals,
      activeBulkOperations,
      
      // Operations
      triggerWorkflow,
      generateInsights: generateDataSourceInsights,
      executeBulkOperation: bulkUpdateDataSources,
      startCollaboration,
      createDataSource: createDataSourceWithWorkflow
    }

    switch (componentId) {
      case "enterprise-overview":
        return (
          <div className="space-y-6">
            <EnterpriseDashboard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataSourceMonitoringDashboard {...commonProps} />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.slice(0, 3).map((insight, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">{insight.title}</h4>
                        <p className="text-sm text-blue-700 mt-1">{insight.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    ))}
                    {insights.length === 0 && (
                      <p className="text-gray-500 text-sm">No insights available. Add data sources to generate insights.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      
      case "workflows":
        return <WorkflowDesigner />
      
      case "collaboration":
        return <CollaborationStudio />
      
      case "analytics":
        return <AnalyticsWorkbench />
      
      case "data-sources":
        return viewMode === 'grid' ? (
          <DataSourceGrid {...commonProps} />
        ) : (
          <DataSourceList {...commonProps} />
        )
      
      case "discovery":
        return <DataDiscoveryWorkspace {...commonProps} />
      
      case "lineage":
        return <DataLineageGraph {...commonProps} />
      
      case "schema":
        return <SchemaDiscovery {...commonProps} />
      
      case "monitoring":
        return selectedDataSource ? (
          <DataSourceMonitoring {...commonProps} />
        ) : (
          <DataSourceMonitoringDashboard {...commonProps} />
        )
      
      case "bulk-operations":
        return <DataSourceBulkActions {...commonProps} />
      
      default:
        return (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Component Not Found</AlertTitle>
            <AlertDescription>
              The requested component "{componentId}" could not be found.
            </AlertDescription>
          </Alert>
        )
    }
  }

  // ========================================================================
  // ENHANCED NAVIGATION
  // ========================================================================

  const enterpriseNavigation = {
    overview: {
      label: "Enterprise Overview",
      icon: BarChart3,
      component: "enterprise-overview",
      description: "Comprehensive enterprise dashboard with AI insights"
    },
    workflows: {
      label: "Workflow Designer",
      icon: Workflow,
      component: "workflows",
      description: "Visual workflow orchestration and automation"
    },
    collaboration: {
      label: "Collaboration Studio",
      icon: Users,
      component: "collaboration",
      description: "Real-time collaborative workspace"
    },
    analytics: {
      label: "Analytics Workbench",
      icon: Brain,
      component: "analytics",
      description: "AI-powered analytics and insights"
    },
    dataSources: {
      label: "Data Sources",
      icon: Database,
      component: "data-sources",
      description: "Manage data source connections"
    },
    discovery: {
      label: "Data Discovery",
      icon: Search,
      component: "discovery",
      description: "Automated data discovery workspace"
    },
    lineage: {
      label: "Data Lineage",
      icon: GitBranch,
      component: "lineage",
      description: "Data lineage visualization"
    },
    schema: {
      label: "Schema Discovery",
      icon: TestTube,
      component: "schema",
      description: "Automated schema discovery"
    },
    monitoring: {
      label: "Monitoring",
      icon: Monitor,
      component: "monitoring",
      description: "Real-time system monitoring"
    },
    bulkOps: {
      label: "Bulk Operations",
      icon: Layers,
      component: "bulk-operations",
      description: "Mass operations with rollback"
    }
  }

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <EnterpriseWorkspaceContext.Provider value={enterpriseContextValue}>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          {/* Enhanced Sidebar */}
          <div className={`hidden md:flex flex-col ${sidebarCollapsed ? "w-16" : "w-80"} transition-all duration-300 border-r bg-card`}>
            {/* User Profile Section */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.name || "User"}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">Enterprise</Badge>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">Online</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enterprise Status */}
            {!sidebarCollapsed && (
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">System Health</span>
                    <Badge variant="default">Optimal</Badge>
                  </div>
                  <Progress value={95} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Active Workflows: {activeWorkflows.length}</div>
                    <div>Collaborators: {participants.length}</div>
                    <div>Insights: {insights.length}</div>
                    <div>Data Sources: {dataSources?.length || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {Object.entries(enterpriseNavigation).map(([key, nav]) => {
                  const Icon = nav.icon
                  const isActive = activeView === nav.component
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start mb-1 ${sidebarCollapsed ? "px-2" : ""}`}
                          onClick={() => setActiveView(nav.component)}
                        >
                          <Icon className="h-4 w-4" />
                          {!sidebarCollapsed && (
                            <span className="ml-2 truncate">{nav.label}</span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{nav.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Sidebar Footer */}
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Collapse
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Enhanced Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center px-4 gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search data sources, workflows, insights..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Real-time Indicators */}
                  {activeWorkflows.length > 0 && (
                    <Badge variant="outline" className="animate-pulse">
                      <Workflow className="h-3 w-3 mr-1" />
                      {activeWorkflows.length} Active
                    </Badge>
                  )}
                  
                  {participants.length > 0 && (
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {participants.length} Online
                    </Badge>
                  )}

                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-4 w-4" />
                        {notifications.length > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                            {notifications.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <Separator />
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem key={notification.id} className="flex-col items-start">
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-muted-foreground">{notification.message}</div>
                            <div className="text-xs text-muted-foreground">
                              {notification.timestamp.toLocaleString()}
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          No new notifications
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="outline" size="sm" onClick={() => refetchDataSources()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Breadcrumb */}
              {selectedDataSource && (
                <div className="px-4 py-2 border-t bg-muted/50">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Enterprise Data Sources</span>
                    <ChevronRight className="h-3 w-3 mx-1" />
                    <span className="font-medium text-foreground">{selectedDataSource.name}</span>
                    <ChevronRight className="h-3 w-3 mx-1" />
                    <span className="font-medium text-foreground">
                      {enterpriseNavigation[activeView as keyof typeof enterpriseNavigation]?.label}
                    </span>
                  </div>
                </div>
              )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden">
              <div className="h-full p-6 overflow-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {dataSourcesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                          <p className="text-muted-foreground">Loading enterprise systems...</p>
                        </div>
                      </div>
                    ) : (
                      renderEnterpriseComponent(activeView)
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </EnterpriseWorkspaceContext.Provider>
  )
}

// Export QueryClient wrapper
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
})

export function EnterpriseDataSourcesAppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnterpriseDataSourcesApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

// Export context for child components
export { EnterpriseWorkspaceContext, type EnterpriseWorkflowContext }