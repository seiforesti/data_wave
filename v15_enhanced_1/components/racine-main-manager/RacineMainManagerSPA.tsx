/**
 * Racine Main Manager SPA - Master Orchestrator Component
 * =====================================================
 * 
 * This is the ultimate orchestrator SPA for the entire data governance system,
 * providing a unified workspace that surpasses Databricks, Microsoft Purview,
 * and Azure in intelligence, flexibility, and enterprise power.
 * 
 * Features:
 * - Master orchestration of all 7 groups (Data Sources, Scan Rule Sets, Classifications, 
 *   Compliance, Catalog, Scan Logic, RBAC)
 * - Intelligent navigation with adaptive UI based on user roles and permissions
 * - Real-time cross-group analytics and monitoring
 * - Advanced workspace management with multi-environment support
 * - Databricks-style job workflow builder with cross-group orchestration
 * - AI-powered insights and recommendations
 * - Enterprise-grade collaboration features
 * - Comprehensive activity tracking and audit trails
 * - Intelligent dashboard system with predictive analytics
 * 
 * Architecture:
 * - Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui
 * - Real-time WebSocket integration for live updates
 * - Advanced state management with React Query and Zustand
 * - Responsive design with adaptive layouts
 * - RBAC-integrated security throughout
 * - Performance optimized with React.memo and virtual scrolling
 */

"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

// Core Layout Components
import { AppNavbar } from './components/navigation/AppNavbar'
import { AppSidebar } from './components/navigation/AppSidebar'
import { LayoutContent } from './components/layout/LayoutContent'
import { GlobalSearchInterface } from './components/navigation/GlobalSearchInterface'
import { NotificationCenter } from './components/navigation/NotificationCenter'

// Main Feature Components
import { WorkspaceOrchestrator } from './components/workspace/WorkspaceOrchestrator'
import { JobWorkflowBuilder } from './components/job-workflow-space/JobWorkflowBuilder'
import { PipelineDesigner } from './components/pipeline-manager/PipelineDesigner'
import { AIAssistantInterface } from './components/ai-assistant/AIAssistantInterface'
import { ActivityTrackingHub } from './components/activity-tracker/ActivityTrackingHub'
import { IntelligentDashboardOrchestrator } from './components/intelligent-dashboard/IntelligentDashboardOrchestrator'
import { MasterCollaborationHub } from './components/collaboration/MasterCollaborationHub'
import { UserProfileManager } from './components/user-management/UserProfileManager'

// Services and Hooks
import { useRacineOrchestration } from './hooks/useRacineOrchestration'
import { useWorkspaceManagement } from './hooks/useWorkspaceManagement'
import { useRealTimeUpdates } from './hooks/useRealTimeUpdates'
import { useUserPermissions } from './hooks/useUserPermissions'
import { useSystemHealth } from './hooks/useSystemHealth'

// Types and Constants
import { RacineState, ViewMode, LayoutMode, SystemHealth } from './types/racine-core.types'
import { SUPPORTED_GROUPS, VIEW_MODES, LAYOUT_PRESETS } from './constants/cross-group-configs'

// Utilities
import { cn } from '@/lib/utils'
import { ErrorFallback } from './components/common/ErrorFallback'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { PerformanceMonitor } from './components/common/PerformanceMonitor'

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// =====================================================================================
// Main SPA Interface Props
// =====================================================================================

interface RacineMainManagerSPAProps {
  initialUser?: any
  initialWorkspace?: string
  initialView?: ViewMode
  config?: {
    enableRealTimeUpdates?: boolean
    enableAIAssistant?: boolean
    enableCollaboration?: boolean
    performanceMonitoring?: boolean
    debugMode?: boolean
  }
}

// =====================================================================================
// Main SPA Component
// =====================================================================================

export const RacineMainManagerSPA: React.FC<RacineMainManagerSPAProps> = ({
  initialUser,
  initialWorkspace,
  initialView = ViewMode.DASHBOARD,
  config = {
    enableRealTimeUpdates: true,
    enableAIAssistant: true,
    enableCollaboration: true,
    performanceMonitoring: true,
    debugMode: false
  }
}) => {
  const router = useRouter()
  
  // =====================================================================================
  // Core State Management
  // =====================================================================================
  
  const [racineState, setRacineState] = useState<RacineState>({
    isInitialized: false,
    currentView: initialView,
    activeWorkspaceId: initialWorkspace || '',
    layoutMode: LayoutMode.ADAPTIVE,
    sidebarCollapsed: false,
    loading: true,
    error: null,
    systemHealth: SystemHealth.UNKNOWN,
    lastActivity: new Date(),
    performanceMetrics: {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      apiResponseTime: 0
    }
  })

  // =====================================================================================
  // Core Hooks Integration
  // =====================================================================================
  
  // Master orchestration hook for coordinating all services
  const {
    orchestrationState,
    executeWorkflow,
    monitorHealth,
    optimizePerformance,
    getSystemMetrics,
    isLoading: orchestrationLoading,
    error: orchestrationError
  } = useRacineOrchestration(initialUser?.id || '', racineState)

  // Workspace management for multi-workspace support
  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
    getWorkspaceResources,
    workspaceAnalytics,
    isLoading: workspaceLoading
  } = useWorkspaceManagement(racineState.activeWorkspaceId, initialUser?.id || '')

  // Real-time updates across all groups
  const {
    connectionStatus,
    subscribeTo,
    unsubscribeFrom,
    sendMessage,
    lastMessage
  } = useRealTimeUpdates(config.enableRealTimeUpdates)

  // User permissions and RBAC integration
  const {
    permissions,
    hasPermission,
    canAccessGroup,
    canPerformAction,
    userRoles
  } = useUserPermissions(initialUser?.id || '')

  // System health monitoring across all groups
  const {
    systemHealth,
    groupHealthStatus,
    performanceMetrics,
    alerts,
    refreshHealth
  } = useSystemHealth()

  // =====================================================================================
  // Advanced State Management and Effects
  // =====================================================================================
  
  // Initialize the SPA
  useEffect(() => {
    const initializeRacine = async () => {
      try {
        setRacineState(prev => ({ ...prev, loading: true, error: null }))
        
        // Initialize orchestration system
        await Promise.all([
          monitorHealth(),
          refreshHealth(),
          // Initialize workspace if provided
          initialWorkspace ? switchWorkspace(initialWorkspace) : Promise.resolve(),
        ])
        
        // Set up real-time subscriptions
        if (config.enableRealTimeUpdates) {
          subscribeTo('system-health')
          subscribeTo('workspace-updates')
          subscribeTo('cross-group-notifications')
        }
        
        setRacineState(prev => ({
          ...prev,
          isInitialized: true,
          loading: false,
          systemHealth: systemHealth.overall,
          lastActivity: new Date()
        }))
        
      } catch (error) {
        console.error('Failed to initialize Racine Main Manager:', error)
        setRacineState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Initialization failed'
        }))
      }
    }

    initializeRacine()
  }, [initialWorkspace, config.enableRealTimeUpdates, monitorHealth, refreshHealth, subscribeTo, switchWorkspace, systemHealth.overall])

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage) {
      const { type, data } = lastMessage
      
      switch (type) {
        case 'system-health-update':
          setRacineState(prev => ({
            ...prev,
            systemHealth: data.systemHealth,
            lastActivity: new Date()
          }))
          break
          
        case 'workspace-update':
          // Handle workspace updates
          if (data.workspaceId === racineState.activeWorkspaceId) {
            // Refresh workspace data
            getWorkspaceResources(data.workspaceId)
          }
          break
          
        case 'cross-group-notification':
          // Handle cross-group notifications
          // This would trigger UI updates based on the notification type
          break
          
        default:
          console.log('Unhandled real-time message type:', type)
      }
    }
  }, [lastMessage, racineState.activeWorkspaceId, getWorkspaceResources])

  // Performance monitoring
  useEffect(() => {
    if (config.performanceMonitoring) {
      const startTime = performance.now()
      
      const updatePerformanceMetrics = () => {
        const renderTime = performance.now() - startTime
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0
        
        setRacineState(prev => ({
          ...prev,
          performanceMetrics: {
            ...prev.performanceMetrics,
            renderTime,
            memoryUsage: memoryUsage / (1024 * 1024) // Convert to MB
          }
        }))
      }
      
      const timeoutId = setTimeout(updatePerformanceMetrics, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [config.performanceMonitoring])

  // =====================================================================================
  // Event Handlers and Actions
  // =====================================================================================
  
  const handleViewChange = useCallback((newView: ViewMode) => {
    setRacineState(prev => ({
      ...prev,
      currentView: newView,
      lastActivity: new Date()
    }))
    
    // Update URL without page reload
    router.push(`/racine?view=${newView}`, { scroll: false })
  }, [router])

  const handleWorkspaceSwitch = useCallback(async (workspaceId: string) => {
    try {
      await switchWorkspace(workspaceId)
      setRacineState(prev => ({
        ...prev,
        activeWorkspaceId: workspaceId,
        lastActivity: new Date()
      }))
    } catch (error) {
      console.error('Failed to switch workspace:', error)
      setRacineState(prev => ({
        ...prev,
        error: 'Failed to switch workspace'
      }))
    }
  }, [switchWorkspace])

  const handleSidebarToggle = useCallback(() => {
    setRacineState(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed,
      lastActivity: new Date()
    }))
  }, [])

  const handleLayoutModeChange = useCallback((layoutMode: LayoutMode) => {
    setRacineState(prev => ({
      ...prev,
      layoutMode,
      lastActivity: new Date()
    }))
  }, [])

  const handleErrorRecovery = useCallback(() => {
    setRacineState(prev => ({
      ...prev,
      error: null,
      loading: false
    }))
  }, [])

  // =====================================================================================
  // Computed Values and Memoized Data
  // =====================================================================================
  
  const isLoading = useMemo(() => {
    return racineState.loading || orchestrationLoading || workspaceLoading
  }, [racineState.loading, orchestrationLoading, workspaceLoading])

  const hasErrors = useMemo(() => {
    return !!(racineState.error || orchestrationError)
  }, [racineState.error, orchestrationError])

  const navigationConfig = useMemo(() => ({
    currentView: racineState.currentView,
    activeWorkspace: activeWorkspace,
    systemHealth: systemHealth,
    userPermissions: permissions,
    availableGroups: SUPPORTED_GROUPS.filter(group => canAccessGroup(group)),
    connectionStatus: connectionStatus
  }), [racineState.currentView, activeWorkspace, systemHealth, permissions, canAccessGroup, connectionStatus])

  const layoutConfig = useMemo(() => ({
    mode: racineState.layoutMode,
    sidebarCollapsed: racineState.sidebarCollapsed,
    currentView: racineState.currentView,
    workspace: activeWorkspace,
    responsive: true,
    animations: true
  }), [racineState.layoutMode, racineState.sidebarCollapsed, racineState.currentView, activeWorkspace])

  // =====================================================================================
  // View Rendering Functions
  // =====================================================================================
  
  const renderMainContent = useCallback(() => {
    if (!racineState.isInitialized || isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" message="Initializing Racine Main Manager..." />
        </div>
      )
    }

    switch (racineState.currentView) {
      case ViewMode.DASHBOARD:
        return (
          <IntelligentDashboardOrchestrator
            workspaceId={racineState.activeWorkspaceId}
            userId={initialUser?.id}
            permissions={permissions}
            systemHealth={systemHealth}
            realTimeUpdates={config.enableRealTimeUpdates}
          />
        )

      case ViewMode.WORKSPACE:
        return (
          <WorkspaceOrchestrator
            activeWorkspaceId={racineState.activeWorkspaceId}
            workspaces={workspaces}
            onWorkspaceSwitch={handleWorkspaceSwitch}
            userPermissions={permissions}
            analytics={workspaceAnalytics}
          />
        )

      case ViewMode.WORKFLOWS:
        return (
          <JobWorkflowBuilder
            workspaceId={racineState.activeWorkspaceId}
            availableGroups={SUPPORTED_GROUPS}
            userPermissions={permissions}
            onExecuteWorkflow={executeWorkflow}
            realTimeMonitoring={config.enableRealTimeUpdates}
          />
        )

      case ViewMode.PIPELINES:
        return (
          <PipelineDesigner
            workspaceId={racineState.activeWorkspaceId}
            availableGroups={SUPPORTED_GROUPS}
            userPermissions={permissions}
            aiOptimization={config.enableAIAssistant}
          />
        )

      case ViewMode.COLLABORATION:
        return (
          <MasterCollaborationHub
            workspaceId={racineState.activeWorkspaceId}
            userId={initialUser?.id}
            permissions={permissions}
            realTimeEnabled={config.enableRealTimeUpdates}
          />
        )

      case ViewMode.ACTIVITY:
        return (
          <ActivityTrackingHub
            workspaceId={racineState.activeWorkspaceId}
            groups={SUPPORTED_GROUPS}
            userPermissions={permissions}
            realTimeTracking={config.enableRealTimeUpdates}
          />
        )

      case ViewMode.PROFILE:
        return (
          <UserProfileManager
            userId={initialUser?.id}
            permissions={permissions}
            workspaces={workspaces}
          />
        )

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to Racine</h2>
              <p className="text-muted-foreground">
                Select a view from the navigation to get started
              </p>
            </div>
          </div>
        )
    }
  }, [
    racineState.isInitialized,
    racineState.currentView,
    racineState.activeWorkspaceId,
    isLoading,
    initialUser?.id,
    permissions,
    systemHealth,
    config.enableRealTimeUpdates,
    config.enableAIAssistant,
    workspaces,
    handleWorkspaceSwitch,
    workspaceAnalytics,
    executeWorkflow
  ])

  // =====================================================================================
  // Error Handling
  // =====================================================================================
  
  if (hasErrors) {
    return (
      <div className="min-h-screen bg-background">
        <ErrorFallback
          error={new Error(racineState.error || orchestrationError?.message || 'Unknown error')}
          resetError={handleErrorRecovery}
          showDetails={config.debugMode}
        />
      </div>
    )
  }

  // =====================================================================================
  // Main Render
  // =====================================================================================
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error) => console.error('Racine SPA Error:', error)}
          onReset={handleErrorRecovery}
        >
          <div className={cn(
            "min-h-screen bg-background",
            "racine-main-manager",
            racineState.layoutMode === LayoutMode.COMPACT && "compact-mode",
            racineState.sidebarCollapsed && "sidebar-collapsed"
          )}>
            
            {/* Performance Monitor (Development) */}
            {config.performanceMonitoring && config.debugMode && (
              <PerformanceMonitor metrics={racineState.performanceMetrics} />
            )}
            
            {/* Global Navigation Bar */}
            <AppNavbar
              config={navigationConfig}
              onViewChange={handleViewChange}
              onWorkspaceSwitch={handleWorkspaceSwitch}
              onSidebarToggle={handleSidebarToggle}
              systemHealth={systemHealth}
              connectionStatus={connectionStatus}
            />
            
            {/* Main Layout Container */}
            <div className="flex h-[calc(100vh-4rem)]">
              
              {/* Adaptive Sidebar */}
              <AppSidebar
                config={layoutConfig}
                navigation={navigationConfig}
                onViewChange={handleViewChange}
                onLayoutModeChange={handleLayoutModeChange}
                collapsed={racineState.sidebarCollapsed}
                onToggle={handleSidebarToggle}
              />
              
              {/* Main Content Area */}
              <main className={cn(
                "flex-1 flex flex-col",
                "transition-all duration-300 ease-in-out",
                racineState.sidebarCollapsed ? "ml-16" : "ml-64"
              )}>
                
                {/* Layout Content Manager */}
                <LayoutContent
                  config={layoutConfig}
                  currentView={racineState.currentView}
                  workspace={activeWorkspace}
                  className="flex-1"
                >
                  <Suspense fallback={
                    <LoadingSpinner size="lg" message="Loading content..." />
                  }>
                    {renderMainContent()}
                  </Suspense>
                </LayoutContent>
                
              </main>
              
            </div>
            
            {/* Global Search Interface */}
            <GlobalSearchInterface
              workspaceId={racineState.activeWorkspaceId}
              availableGroups={SUPPORTED_GROUPS}
              userPermissions={permissions}
            />
            
            {/* AI Assistant (Floating) */}
            {config.enableAIAssistant && (
              <AIAssistantInterface
                userId={initialUser?.id}
                workspaceId={racineState.activeWorkspaceId}
                currentView={racineState.currentView}
                contextData={{
                  systemHealth,
                  activeWorkspace,
                  userPermissions: permissions
                }}
                floating={true}
              />
            )}
            
            {/* Notification Center */}
            <NotificationCenter
              userId={initialUser?.id}
              realTimeEnabled={config.enableRealTimeUpdates}
              systemAlerts={alerts}
            />
            
            {/* Global Toast Notifications */}
            <Toaster />
            
          </div>
          
          {/* React Query DevTools (Development) */}
          {config.debugMode && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
          
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// =====================================================================================
// Component Export and Display Name
// =====================================================================================

RacineMainManagerSPA.displayName = 'RacineMainManagerSPA'

export default RacineMainManagerSPA

// =====================================================================================
// Type Exports for External Use
// =====================================================================================

export type { RacineMainManagerSPAProps, RacineState }
export { ViewMode, LayoutMode, SystemHealth }