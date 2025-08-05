"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { 
  Search, Settings, User, Bell, Grid3X3, BarChart3, Workflow, 
  Database, Shield, Brain, Clock, Users, FileText, Zap, Activity,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Plus, Filter,
  TrendingUp, AlertTriangle, CheckCircle, Globe, Cpu, Network,
  Eye, Edit3, Share2, Download, Upload, RefreshCw, Play, Pause,
  MoreVertical, Command, Menu, X, ChevronDown, Star, Bookmark,
  Target, Map, Layers, GitBranch, Workflow as WorkflowIcon,
  Sparkles, Lightbulb, MessageSquare, Video, Calendar, Mail
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Import group SPAs and components
import { AdvancedScanRuleSetsSPA } from '../Advanced-Scan-Rule-Sets/spa/ScanRuleSetsSPA'
import { AdvancedCatalogSPA } from '../Advanced-Catalog/spa/AdvancedCatalogSPA'
import { AdvancedScanLogicSPA } from '../Advanced-Scan-Logic/spa/ScanLogicMasterSPA'
import { RBACSystemSPA } from '../Advanced_RBAC_Datagovernance_System/RBACSystemSPA'
import { DataSourcesSPA } from '../data-sources/spa/DataSourcesSPA'
import { ClassificationsSPA } from '../classifications/spa/ClassificationsSPA'
import { ComplianceRuleSPA } from '../Compliance-Rule/spa/ComplianceRuleSPA'

// Import racine-specific components
import { GlobalWorkspaceManager } from './components/workspace/GlobalWorkspaceManager'
import { JobWorkflowSpace } from './components/workflow/JobWorkflowSpace'
import { PipelineManager } from './components/pipeline/PipelineManager'
import { IntegratedAIAssistant } from './components/ai/IntegratedAIAssistant'
import { HistoricActivitiesTracker } from './components/activity/HistoricActivitiesTracker'
import { IntelligentDashboard } from './components/dashboard/IntelligentDashboard'
import { MasterCollaborationSystem } from './components/collaboration/MasterCollaborationSystem'
import { UserSettingsProfile } from './components/settings/UserSettingsProfile'
import { AppNavbar } from './components/navigation/AppNavbar'
import { AppSideBar } from './components/navigation/AppSideBar'
import { LayoutContent } from './components/layout/LayoutContent'

// Import hooks and services
import { useRacineState } from './hooks/useRacineState'
import { useGlobalWorkspace } from './hooks/useGlobalWorkspace'
import { useJobWorkflow } from './hooks/useJobWorkflow'
import { usePipelineOrchestration } from './hooks/usePipelineOrchestration'
import { useAIAssistant } from './hooks/useAIAssistant'
import { useActivityTracker } from './hooks/useActivityTracker'
import { useIntelligentDashboard } from './hooks/useIntelligentDashboard'
import { useCollaboration } from './hooks/useCollaboration'
import { useRealTimeUpdates } from './hooks/useRealTimeUpdates'
import { useEnterpriseIntegration } from './hooks/useEnterpriseIntegration'

// Import types
import { 
  RacineView, 
  WorkspaceConfig, 
  JobWorkflowConfig, 
  PipelineConfig,
  AIAssistantConfig,
  DashboardConfig,
  CollaborationConfig,
  UserPreferences,
  SystemHealth,
  CrossGroupMetrics,
  NotificationConfig
} from './types/racine.types'

// Import services
import { racineApiService } from './services/racine-api.service'
import { workspaceService } from './services/workspace.service'
import { workflowService } from './services/workflow.service'
import { pipelineService } from './services/pipeline.service'
import { aiService } from './services/ai.service'
import { activityService } from './services/activity.service'
import { dashboardService } from './services/dashboard.service'
import { collaborationService } from './services/collaboration.service'

// Constants
const RACINE_VIEWS = {
  DASHBOARD: 'dashboard',
  WORKSPACE: 'workspace',
  WORKFLOW: 'workflow',
  PIPELINE: 'pipeline',
  AI_ASSISTANT: 'ai-assistant',
  ACTIVITY_TRACKER: 'activity-tracker',
  COLLABORATION: 'collaboration',
  SETTINGS: 'settings',
  // Group SPAs
  SCAN_RULE_SETS: 'scan-rule-sets',
  ADVANCED_CATALOG: 'advanced-catalog',
  SCAN_LOGIC: 'scan-logic',
  RBAC_SYSTEM: 'rbac-system',
  DATA_SOURCES: 'data-sources',
  CLASSIFICATIONS: 'classifications',
  COMPLIANCE_RULES: 'compliance-rules'
} as const

interface RacineMainManagerSPAProps {
  initialView?: RacineView
  userId?: string
  organizationId?: string
  permissions?: string[]
  theme?: 'light' | 'dark' | 'auto'
  onViewChange?: (view: RacineView) => void
  onError?: (error: Error) => void
}

export const RacineMainManagerSPA: React.FC<RacineMainManagerSPAProps> = ({
  initialView = RACINE_VIEWS.DASHBOARD,
  userId,
  organizationId,
  permissions = [],
  theme = 'auto',
  onViewChange,
  onError
}) => {
  // Core state management
  const {
    currentView,
    setCurrentView,
    userPreferences,
    setUserPreferences,
    systemHealth,
    crossGroupMetrics,
    isLoading,
    error,
    refreshData
  } = useRacineState({
    initialView,
    userId,
    organizationId,
    permissions,
    onError
  })

  // Specialized hooks for each feature area
  const { 
    workspaces, 
    activeWorkspace, 
    createWorkspace, 
    switchWorkspace,
    workspaceAnalytics 
  } = useGlobalWorkspace({ userId, organizationId })

  const { 
    workflows, 
    activeWorkflow, 
    createWorkflow, 
    executeWorkflow,
    workflowTemplates,
    workflowAnalytics 
  } = useJobWorkflow({ workspaceId: activeWorkspace?.id })

  const { 
    pipelines, 
    activePipeline, 
    createPipeline, 
    executePipeline,
    pipelineTemplates,
    pipelineAnalytics 
  } = usePipelineOrchestration({ workspaceId: activeWorkspace?.id })

  const { 
    aiAssistant, 
    sendMessage, 
    getRecommendations, 
    aiAnalytics,
    contextualHelp 
  } = useAIAssistant({ 
    userId, 
    currentView, 
    context: { workspace: activeWorkspace, workflow: activeWorkflow, pipeline: activePipeline }
  })

  const { 
    activities, 
    liveActivities, 
    filterActivities, 
    searchActivities,
    activityAnalytics 
  } = useActivityTracker({ userId, organizationId })

  const { 
    dashboardConfig, 
    updateDashboardConfig, 
    dashboardData,
    kpiMetrics,
    alertsAndNotifications 
  } = useIntelligentDashboard({ userId, workspaceId: activeWorkspace?.id })

  const { 
    collaborationSpaces, 
    activeSpace, 
    createSpace, 
    joinSpace,
    collaborationAnalytics 
  } = useCollaboration({ userId, organizationId })

  // Real-time updates and enterprise integration
  const { isConnected, connectionStatus } = useRealTimeUpdates({
    userId,
    onUpdate: (update) => {
      // Handle real-time updates across all systems
      console.log('Real-time update received:', update)
    }
  })

  const { 
    integrationStatus, 
    crossGroupData, 
    orchestrateAction,
    enterpriseMetrics 
  } = useEnterpriseIntegration({ organizationId })

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [quickActions, setQuickActions] = useState([])

  // Toast for notifications
  const { toast } = useToast()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault()
            setShowCommandPalette(true)
            break
          case 'b':
            event.preventDefault()
            setSidebarCollapsed(!sidebarCollapsed)
            break
          case 'f':
            event.preventDefault()
            setIsFullscreen(!isFullscreen)
            break
          case '1':
            event.preventDefault()
            setCurrentView(RACINE_VIEWS.DASHBOARD)
            break
          case '2':
            event.preventDefault()
            setCurrentView(RACINE_VIEWS.WORKSPACE)
            break
          case '3':
            event.preventDefault()
            setCurrentView(RACINE_VIEWS.WORKFLOW)
            break
          case '4':
            event.preventDefault()
            setCurrentView(RACINE_VIEWS.PIPELINE)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarCollapsed, isFullscreen, setCurrentView])

  // Handle view changes
  const handleViewChange = useCallback((view: RacineView) => {
    setCurrentView(view)
    onViewChange?.(view)
    
    // Track view change activity
    activityService.trackActivity({
      type: 'navigation',
      action: 'view_change',
      data: { from: currentView, to: view },
      userId,
      timestamp: new Date().toISOString()
    })
  }, [currentView, setCurrentView, onViewChange, userId])

  // AI Assistant integration with current context
  const getContextualAIHelp = useCallback(async () => {
    const context = {
      currentView,
      activeWorkspace,
      activeWorkflow,
      activePipeline,
      systemHealth,
      crossGroupMetrics,
      userPreferences
    }
    
    return await aiService.getContextualHelp(context)
  }, [currentView, activeWorkspace, activeWorkflow, activePipeline, systemHealth, crossGroupMetrics, userPreferences])

  // Intelligent search across all systems
  const handleGlobalSearch = useCallback(async (query: string) => {
    if (!query.trim()) return

    try {
      const results = await racineApiService.globalSearch({
        query,
        scope: ['workspaces', 'workflows', 'pipelines', 'activities', 'data-sources', 'catalogs', 'rules'],
        userId,
        organizationId
      })

      // Process and display search results
      console.log('Global search results:', results)
      
    } catch (error) {
      console.error('Global search error:', error)
      toast({
        title: "Search Error",
        description: "Failed to perform global search. Please try again.",
        variant: "destructive"
      })
    }
  }, [userId, organizationId, toast])

  // Main layout content based on current view
  const renderMainContent = () => {
    switch (currentView) {
      case RACINE_VIEWS.DASHBOARD:
        return (
          <IntelligentDashboard 
            config={dashboardConfig}
            data={dashboardData}
            kpiMetrics={kpiMetrics}
            alerts={alertsAndNotifications}
            onConfigUpdate={updateDashboardConfig}
            crossGroupMetrics={crossGroupMetrics}
            systemHealth={systemHealth}
          />
        )

      case RACINE_VIEWS.WORKSPACE:
        return (
          <GlobalWorkspaceManager 
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            onCreate={createWorkspace}
            onSwitch={switchWorkspace}
            analytics={workspaceAnalytics}
            integrationStatus={integrationStatus}
          />
        )

      case RACINE_VIEWS.WORKFLOW:
        return (
          <JobWorkflowSpace 
            workflows={workflows}
            activeWorkflow={activeWorkflow}
            templates={workflowTemplates}
            onCreate={createWorkflow}
            onExecute={executeWorkflow}
            analytics={workflowAnalytics}
            aiAssistant={aiAssistant}
          />
        )

      case RACINE_VIEWS.PIPELINE:
        return (
          <PipelineManager 
            pipelines={pipelines}
            activePipeline={activePipeline}
            templates={pipelineTemplates}
            onCreate={createPipeline}
            onExecute={executePipeline}
            analytics={pipelineAnalytics}
            crossGroupData={crossGroupData}
          />
        )

      case RACINE_VIEWS.AI_ASSISTANT:
        return (
          <IntegratedAIAssistant 
            assistant={aiAssistant}
            onSendMessage={sendMessage}
            onGetRecommendations={getRecommendations}
            analytics={aiAnalytics}
            contextualHelp={contextualHelp}
            systemContext={{
              currentView,
              activeWorkspace,
              systemHealth,
              crossGroupMetrics
            }}
          />
        )

      case RACINE_VIEWS.ACTIVITY_TRACKER:
        return (
          <HistoricActivitiesTracker 
            activities={activities}
            liveActivities={liveActivities}
            onFilter={filterActivities}
            onSearch={searchActivities}
            analytics={activityAnalytics}
            crossGroupData={crossGroupData}
          />
        )

      case RACINE_VIEWS.COLLABORATION:
        return (
          <MasterCollaborationSystem 
            spaces={collaborationSpaces}
            activeSpace={activeSpace}
            onCreate={createSpace}
            onJoin={joinSpace}
            analytics={collaborationAnalytics}
            currentUser={{ id: userId }}
          />
        )

      case RACINE_VIEWS.SETTINGS:
        return (
          <UserSettingsProfile 
            userId={userId}
            preferences={userPreferences}
            onPreferencesUpdate={setUserPreferences}
            organizationId={organizationId}
            permissions={permissions}
            systemHealth={systemHealth}
          />
        )

      // Group SPAs
      case RACINE_VIEWS.SCAN_RULE_SETS:
        return <AdvancedScanRuleSetsSPA userId={userId} organizationId={organizationId} />

      case RACINE_VIEWS.ADVANCED_CATALOG:
        return <AdvancedCatalogSPA userId={userId} organizationId={organizationId} />

      case RACINE_VIEWS.SCAN_LOGIC:
        return <AdvancedScanLogicSPA userId={userId} organizationId={organizationId} />

      case RACINE_VIEWS.RBAC_SYSTEM:
        return <RBACSystemSPA userId={userId} organizationId={organizationId} />

      case RACINE_VIEWS.DATA_SOURCES:
        return <DataSourcesSPA userId={userId} organizationId={organizationId} />

      case RACINE_VIEWS.CLASSIFICATIONS:
        return <ClassificationsSPA userId={userId} organizationId={organizationId} />

      case RACINE_VIEWS.COMPLIANCE_RULES:
        return <ComplianceRuleSPA userId={userId} organizationId={organizationId} />

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">View Not Found</h2>
              <p className="text-muted-foreground mb-6">The requested view could not be found.</p>
              <Button onClick={() => handleViewChange(RACINE_VIEWS.DASHBOARD)}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Racine Manager</h2>
          <p className="text-muted-foreground">Initializing enterprise data governance platform...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">System Error</h2>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Button onClick={refreshData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "min-h-screen bg-background text-foreground transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50"
      )}>
        {/* Global App Navbar */}
        <AppNavbar 
          currentView={currentView}
          onViewChange={handleViewChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleGlobalSearch}
          notifications={notifications}
          userPreferences={userPreferences}
          systemHealth={systemHealth}
          connectionStatus={connectionStatus}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onShowCommandPalette={() => setShowCommandPalette(true)}
          aiAssistant={aiAssistant}
        />

        <div className="flex h-[calc(100vh-4rem)]">
          {/* App Sidebar */}
          <AppSideBar 
            currentView={currentView}
            onViewChange={handleViewChange}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            quickActions={quickActions}
            systemHealth={systemHealth}
            integrationStatus={integrationStatus}
            userPermissions={permissions}
          />

          {/* Main Content Area */}
          <LayoutContent 
            collapsed={sidebarCollapsed}
            currentView={currentView}
            isFullscreen={isFullscreen}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderMainContent()}
              </motion.div>
            </AnimatePresence>
          </LayoutContent>
        </div>

        {/* Floating AI Assistant (always available) */}
        <motion.div
          className="fixed bottom-6 right-6 z-40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            onClick={() => handleViewChange(RACINE_VIEWS.AI_ASSISTANT)}
          >
            <Brain className="h-6 w-6" />
          </Button>
        </motion.div>

        {/* Command Palette */}
        <Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Command className="h-5 w-5" />
                Command Palette
              </DialogTitle>
              <DialogDescription>
                Navigate quickly through the platform using commands
              </DialogDescription>
            </DialogHeader>
            {/* Command palette content will be implemented in a separate component */}
            <div className="space-y-4">
              <Input
                placeholder="Type a command or search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12"
              />
              {/* Command results will be rendered here */}
            </div>
          </DialogContent>
        </Dialog>

        {/* Real-time Status Indicator */}
        <motion.div 
          className="fixed top-20 right-6 z-30"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className="flex items-center gap-1 px-3 py-1"
          >
            <div className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            )} />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}

export default RacineMainManagerSPA