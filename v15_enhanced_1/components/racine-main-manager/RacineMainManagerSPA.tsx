'use client'

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Navigation Components
import AppNavbar from './components/navigation/AppNavbar'
import AppSidebar from './components/navigation/AppSidebar'
import ContextualBreadcrumbs from './components/navigation/ContextualBreadcrumbs'
import GlobalSearchInterface from './components/navigation/GlobalSearchInterface'
import NotificationCenter from './components/navigation/NotificationCenter'

// Layout Components
import LayoutContent from './components/layout/LayoutContent'
import DynamicWorkspaceManager from './components/layout/DynamicWorkspaceManager'
import ContextualOverlayManager from './components/layout/ContextualOverlayManager'

// Core Feature Components
import JobWorkflowBuilder from './components/job-workflow-space/JobWorkflowBuilder'
import PipelineDesigner from './components/pipeline-manager/PipelineDesigner'
import AIAssistantInterface from './components/ai-assistant/AIAssistantInterface'
import ActivityTrackingHub from './components/activity-tracker/ActivityTrackingHub'
import IntelligentDashboardOrchestrator from './components/intelligent-dashboard/IntelligentDashboardOrchestrator'
import MasterCollaborationHub from './components/collaboration/MasterCollaborationHub'
import UserProfileManager from './components/user-management/UserProfileManager'

// Hooks and Services
import { useRacineOrchestration } from './hooks/useRacineOrchestration'
import { useCrossGroupIntegration } from './hooks/useCrossGroupIntegration'
import { useWorkspaceManagement } from './hooks/useWorkspaceManagement'
import { useAIAssistant } from './hooks/useAIAssistant'
import { useActivityTracker } from './hooks/useActivityTracker'
import { useIntelligentDashboard } from './hooks/useIntelligentDashboard'
import { useCollaboration } from './hooks/useCollaboration'

// Types and Interfaces
import {
  RacineState,
  CrossGroupState,
  WorkspaceConfiguration,
  NavigationContext,
  UserContext,
  SystemHealth,
  LayoutConfiguration,
  ViewMode,
  GroupConfiguration,
  RBACPermissions,
  CollaborationState,
  AIAssistantState,
  ActivityState,
  DashboardState
} from './types/racine-core.types'

// Constants and Configurations
import {
  DEFAULT_WORKSPACE_CONFIG,
  SUPPORTED_GROUPS,
  LAYOUT_PRESETS,
  VIEW_MODES,
  PERFORMANCE_THRESHOLDS
} from './constants/cross-group-configs'

// Utilities
import { crossGroupOrchestrator } from './utils/cross-group-orchestrator'
import { workflowEngine } from './utils/workflow-engine'
import { aiIntegrationUtils } from './utils/ai-integration-utils'

/**
 * RacineMainManagerSPA - The Ultimate Data Governance Orchestrator
 * 
 * This is the master SPA that orchestrates and manages all 7 groups:
 * 1. Data Sources
 * 2. Advanced Scan Rule Sets  
 * 3. Classifications
 * 4. Compliance Rules
 * 5. Advanced Catalog
 * 6. Advanced Scan Logic
 * 7. RBAC System
 * 
 * Features:
 * - Intelligent navigation with adaptive UI
 * - Global workspace management
 * - Cross-group workflow orchestration
 * - Real-time collaboration
 * - AI-powered assistance and insights
 * - Comprehensive activity tracking
 * - Advanced analytics and reporting
 * - Enterprise-grade security and compliance
 */

interface RacineMainManagerSPAProps {
  userId: string
  userRole: string
  initialWorkspaceId?: string
  enterpriseConfig?: any
  rbacPermissions?: RBACPermissions
  theme?: 'light' | 'dark' | 'system'
  onError?: (error: Error) => void
  onPerformanceIssue?: (metrics: any) => void
}

const RacineMainManagerSPA: React.FC<RacineMainManagerSPAProps> = ({
  userId,
  userRole,
  initialWorkspaceId,
  enterpriseConfig,
  rbacPermissions,
  theme = 'system',
  onError,
  onPerformanceIssue
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [racineState, setRacineState] = useState<RacineState>({
    isInitialized: false,
    currentView: 'dashboard',
    activeWorkspaceId: initialWorkspaceId || 'default',
    layoutMode: 'unified',
    sidebarCollapsed: false,
    loading: true,
    error: null,
    systemHealth: 'healthy',
    lastActivity: new Date(),
    performanceMetrics: {
      loadTime: 0,
      memoryUsage: 0,
      apiLatency: 0,
      renderTime: 0
    }
  })

  const [crossGroupState, setCrossGroupState] = useState<CrossGroupState>({
    connectedGroups: [],
    activeIntegrations: [],
    sharedResources: [],
    crossGroupWorkflows: [],
    globalMetrics: {},
    synchronizationStatus: 'synced',
    lastSync: new Date()
  })

  const [navigationContext, setNavigationContext] = useState<NavigationContext>({
    currentPath: '/racine/dashboard',
    breadcrumbs: [{ label: 'Racine Manager', path: '/racine' }],
    activeGroup: null,
    searchQuery: '',
    filters: {},
    viewHistory: [],
    bookmarks: []
  })

  const [userContext, setUserContext] = useState<UserContext>({
    userId,
    userRole,
    permissions: rbacPermissions || {},
    preferences: {
      theme,
      language: 'en',
      timezone: 'UTC',
      notifications: true,
      layout: 'default'
    },
    workspaces: [],
    recentActivity: [],
    collaborationStatus: 'available'
  })

  // ============================================================================
  // HOOKS AND SERVICES
  // ============================================================================

  const {
    orchestrationState,
    executeWorkflow,
    coordinateServices,
    monitorHealth,
    optimizePerformance
  } = useRacineOrchestration(userId, racineState)

  const {
    integrationState,
    connectGroups,
    syncResources,
    executeGlobalWorkflow,
    getGlobalMetrics
  } = useCrossGroupIntegration(crossGroupState, userContext)

  const {
    workspaceState,
    createWorkspace,
    switchWorkspace,
    manageResources,
    getWorkspaceAnalytics
  } = useWorkspaceManagement(racineState.activeWorkspaceId, userContext)

  const {
    aiState,
    queryAssistant,
    getRecommendations,
    analyzeContext,
    automateWorkflow
  } = useAIAssistant(userContext, crossGroupState)

  const {
    activityState,
    trackActivity,
    getActivityFeed,
    analyzePatterns,
    generateAuditReport
  } = useActivityTracker(userId, crossGroupState)

  const {
    dashboardState,
    getDashboardData,
    createCustomDashboard,
    getInsights,
    generateReport
  } = useIntelligentDashboard(racineState, crossGroupState)

  const {
    collaborationState,
    startCollaboration,
    shareResource,
    inviteUser,
    getCollaborationMetrics
  } = useCollaboration(userContext, workspaceState)

  const { toast } = useToast()

  // ============================================================================
  // INITIALIZATION AND LIFECYCLE
  // ============================================================================

  useEffect(() => {
    const initializeRacineManager = async () => {
      try {
        setRacineState(prev => ({ ...prev, loading: true }))
        
        // Initialize performance monitoring
        const startTime = performance.now()
        
        // Connect to all available groups
        const connectedGroups = await connectGroups(SUPPORTED_GROUPS)
        
        // Initialize workspace
        if (initialWorkspaceId) {
          await switchWorkspace(initialWorkspaceId)
        }
        
        // Start real-time synchronization
        await syncResources()
        
        // Initialize AI assistant
        await analyzeContext()
        
        // Start activity tracking
        trackActivity('racine_manager_initialized', {
          userId,
          timestamp: new Date(),
          groups: connectedGroups.length
        })
        
        // Calculate initialization performance
        const loadTime = performance.now() - startTime
        
        setRacineState(prev => ({
          ...prev,
          isInitialized: true,
          loading: false,
          performanceMetrics: {
            ...prev.performanceMetrics,
            loadTime
          }
        }))

        setCrossGroupState(prev => ({
          ...prev,
          connectedGroups,
          synchronizationStatus: 'synced',
          lastSync: new Date()
        }))

        toast({
          title: "Racine Manager Initialized",
          description: `Connected to ${connectedGroups.length} groups successfully`,
          variant: "default"
        })

      } catch (error) {
        console.error('Failed to initialize Racine Manager:', error)
        setRacineState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Initialization failed'
        }))
        
        onError?.(error instanceof Error ? error : new Error('Initialization failed'))
        
        toast({
          title: "Initialization Error",
          description: "Failed to initialize Racine Manager. Please refresh and try again.",
          variant: "destructive"
        })
      }
    }

    initializeRacineManager()
  }, [userId, initialWorkspaceId])

  // Performance monitoring
  useEffect(() => {
    const monitorPerformance = () => {
      const metrics = {
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        timing: performance.timing,
        navigation: performance.navigation
      }

      if (metrics.memoryUsage > PERFORMANCE_THRESHOLDS.MAX_MEMORY) {
        onPerformanceIssue?.(metrics)
      }

      setRacineState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          memoryUsage: metrics.memoryUsage
        }
      }))
    }

    const interval = setInterval(monitorPerformance, 30000) // Monitor every 30 seconds
    return () => clearInterval(interval)
  }, [onPerformanceIssue])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleNavigationChange = useCallback((newPath: string, context?: any) => {
    setNavigationContext(prev => ({
      ...prev,
      currentPath: newPath,
      viewHistory: [...prev.viewHistory.slice(-9), prev.currentPath],
      ...context
    }))

    trackActivity('navigation_change', {
      from: navigationContext.currentPath,
      to: newPath,
      userId,
      timestamp: new Date()
    })
  }, [navigationContext.currentPath, userId, trackActivity])

  const handleViewModeChange = useCallback((viewMode: ViewMode) => {
    setRacineState(prev => ({
      ...prev,
      layoutMode: viewMode
    }))

    trackActivity('view_mode_change', {
      newMode: viewMode,
      userId,
      timestamp: new Date()
    })
  }, [userId, trackActivity])

  const handleWorkspaceSwitch = useCallback(async (workspaceId: string) => {
    try {
      await switchWorkspace(workspaceId)
      setRacineState(prev => ({
        ...prev,
        activeWorkspaceId: workspaceId
      }))
      
      toast({
        title: "Workspace Switched",
        description: `Now working in workspace: ${workspaceId}`,
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Workspace Switch Failed",
        description: "Could not switch to the selected workspace",
        variant: "destructive"
      })
    }
  }, [switchWorkspace, toast])

  const handleGlobalSearch = useCallback(async (query: string) => {
    setNavigationContext(prev => ({
      ...prev,
      searchQuery: query
    }))

    trackActivity('global_search', {
      query,
      userId,
      timestamp: new Date()
    })
  }, [userId, trackActivity])

  const handleAIQuery = useCallback(async (query: string) => {
    try {
      const response = await queryAssistant(query)
      return response
    } catch (error) {
      toast({
        title: "AI Assistant Error",
        description: "Could not process your query. Please try again.",
        variant: "destructive"
      })
      throw error
    }
  }, [queryAssistant, toast])

  const handleErrorRecovery = useCallback(() => {
    setRacineState(prev => ({
      ...prev,
      error: null,
      loading: false
    }))
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const layoutConfiguration = useMemo<LayoutConfiguration>(() => ({
    mode: racineState.layoutMode,
    sidebarCollapsed: racineState.sidebarCollapsed,
    theme: userContext.preferences.theme,
    responsive: true,
    animations: true,
    accessibility: true
  }), [racineState.layoutMode, racineState.sidebarCollapsed, userContext.preferences.theme])

  const currentWorkspace = useMemo(() => {
    return workspaceState.workspaces.find(w => w.id === racineState.activeWorkspaceId) ||
           DEFAULT_WORKSPACE_CONFIG
  }, [workspaceState.workspaces, racineState.activeWorkspaceId])

  const systemHealthStatus = useMemo(() => {
    const healthMetrics = {
      groups: crossGroupState.connectedGroups.length,
      sync: crossGroupState.synchronizationStatus,
      performance: racineState.performanceMetrics,
      errors: racineState.error ? 1 : 0
    }

    return {
      status: racineState.systemHealth,
      metrics: healthMetrics,
      lastCheck: new Date()
    }
  }, [crossGroupState, racineState])

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8 max-w-md">
        <div className="text-destructive text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground">
          The Racine Manager encountered an unexpected error. Please try again.
        </p>
        <div className="space-y-2">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors ml-2"
          >
            Reload Page
          </button>
        </div>
        <details className="text-left text-sm text-muted-foreground">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  )

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (racineState.loading || !racineState.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold text-foreground">Initializing Racine Manager</h2>
          <p className="text-muted-foreground">
            Connecting to {SUPPORTED_GROUPS.length} groups and setting up your workspace...
          </p>
          <div className="w-64 bg-secondary rounded-full h-2 mx-auto">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={onError}>
      <div className={cn(
        "min-h-screen bg-background text-foreground",
        "racine-manager-spa",
        layoutConfiguration.theme === 'dark' && "dark",
        layoutConfiguration.animations && "motion-safe:animate-in"
      )}>
        {/* Global Navigation */}
        <AppNavbar
          userRole={userRole}
          permissions={rbacPermissions || {}}
          currentContext={navigationContext}
          crossGroupState={crossGroupState}
          systemHealth={systemHealthStatus}
          onNavigationChange={handleNavigationChange}
          onSearch={handleGlobalSearch}
          onWorkspaceSwitch={handleWorkspaceSwitch}
          onViewModeChange={handleViewModeChange}
        />

        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar Navigation */}
          <AppSidebar
            collapsed={racineState.sidebarCollapsed}
            userContext={userContext}
            workspaceState={workspaceState}
            crossGroupState={crossGroupState}
            navigationContext={navigationContext}
            onNavigationChange={handleNavigationChange}
            onToggleCollapse={() => setRacineState(prev => ({
              ...prev,
              sidebarCollapsed: !prev.sidebarCollapsed
            }))}
          />

          {/* Main Content Area */}
          <main className={cn(
            "flex-1 flex flex-col overflow-hidden transition-all duration-300",
            racineState.sidebarCollapsed ? "ml-16" : "ml-64"
          )}>
            {/* Contextual Breadcrumbs */}
            <ContextualBreadcrumbs
              context={navigationContext}
              workspace={currentWorkspace}
              onNavigationChange={handleNavigationChange}
            />

            {/* Dynamic Layout Content */}
            <LayoutContent
              workspaceId={racineState.activeWorkspaceId}
              layoutConfig={layoutConfiguration}
              activeGroups={crossGroupState.connectedGroups}
              collaborationState={collaborationState}
              currentView={racineState.currentView}
              onViewChange={(view) => setRacineState(prev => ({ ...prev, currentView: view }))}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }>
                <AnimatePresence mode="wait">
                  {racineState.currentView === 'dashboard' && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <IntelligentDashboardOrchestrator
                        workspaceId={racineState.activeWorkspaceId}
                        userRole={userRole}
                        crossGroupMetrics={crossGroupState.globalMetrics}
                        aiInsightsEngine={aiState}
                        dashboardState={dashboardState}
                        onDashboardAction={getDashboardData}
                      />
                    </motion.div>
                  )}

                  {racineState.currentView === 'workflows' && (
                    <motion.div
                      key="workflows"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <JobWorkflowBuilder
                        workspaceId={racineState.activeWorkspaceId}
                        availableServices={integrationState.serviceRegistry}
                        crossGroupCapabilities={crossGroupState}
                        aiOptimizationEngine={aiState}
                        onWorkflowExecute={executeGlobalWorkflow}
                      />
                    </motion.div>
                  )}

                  {racineState.currentView === 'pipelines' && (
                    <motion.div
                      key="pipelines"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PipelineDesigner
                        workspaceId={racineState.activeWorkspaceId}
                        groupServices={integrationState.serviceRegistry}
                        realTimeEngine={orchestrationState}
                        optimizationAI={aiState}
                        onPipelineExecute={executeGlobalWorkflow}
                      />
                    </motion.div>
                  )}

                  {racineState.currentView === 'activity' && (
                    <motion.div
                      key="activity"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ActivityTrackingHub
                        userId={userId}
                        rbacPermissions={rbacPermissions || {}}
                        crossGroupFilters={navigationContext.filters}
                        analyticsEngine={activityState}
                        onActivityAnalyze={analyzePatterns}
                      />
                    </motion.div>
                  )}

                  {racineState.currentView === 'collaboration' && (
                    <motion.div
                      key="collaboration"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MasterCollaborationHub
                        userContext={userContext}
                        workspaceState={workspaceState}
                        collaborationState={collaborationState}
                        crossGroupState={crossGroupState}
                        onCollaborationStart={startCollaboration}
                      />
                    </motion.div>
                  )}

                  {racineState.currentView === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UserProfileManager
                        userContext={userContext}
                        rbacPermissions={rbacPermissions || {}}
                        workspaceState={workspaceState}
                        activityState={activityState}
                        onProfileUpdate={(updates) => setUserContext(prev => ({ ...prev, ...updates }))}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Suspense>
            </LayoutContent>
          </main>
        </div>

        {/* Floating Components */}
        <GlobalSearchInterface
          isOpen={navigationContext.searchQuery.length > 0}
          query={navigationContext.searchQuery}
          crossGroupState={crossGroupState}
          onSearch={handleGlobalSearch}
          onClose={() => setNavigationContext(prev => ({ ...prev, searchQuery: '' }))}
        />

        <AIAssistantInterface
          userContext={userContext}
          systemState={racineState}
          crossGroupData={crossGroupState}
          learningEngine={aiState}
          onQuery={handleAIQuery}
        />

        <NotificationCenter
          userId={userId}
          crossGroupState={crossGroupState}
          activityState={activityState}
          collaborationState={collaborationState}
        />

        <ContextualOverlayManager
          layoutConfig={layoutConfiguration}
          activeOverlays={[]}
          onOverlayClose={() => {}}
        />

        {/* Global Toast Notifications */}
        <Toaster />
      </div>
    </ErrorBoundary>
  )
}

export default RacineMainManagerSPA