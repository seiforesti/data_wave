'use client'

/**
 * ⚡ QUICK ACTIONS PANEL COMPONENT
 * 
 * Context-aware quick actions panel that provides instant access to frequently used operations
 * across all groups with intelligent recommendations and customizable interface.
 * Surpasses enterprise platforms with AI-powered action suggestions and workflow automation.
 * 
 * Features:
 * - Context-Aware Action Recommendations: Actions based on workspace, role, recent activities
 * - Cross-Group Quick Actions: Operations spanning all 7 groups with smart categorization
 * - Customizable Action Panel: User-configurable layout, custom actions, keyboard shortcuts
 * - Intelligent Workflow Triggers: Smart workflow initiation and bulk operations
 * - Advanced Action Management: Favorites, history, usage analytics, performance tracking
 * 
 * @version 1.0.0
 * @enterprise-grade true
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  ZapIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  RefreshCwIcon,
  DownloadIcon,
  UploadIcon,
  CopyIcon,
  EditIcon,
  TrashIcon,
  ArchiveIcon,
  StarIcon,
  BookmarkIcon,
  SearchIcon,
  FilterIcon,
  SettingsIcon,
  MoreHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  UsersIcon,
  DatabaseIcon,
  FolderIcon,
  FileIcon,
  TagIcon,
  LinkIcon,
  BellIcon,
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
  VideoIcon,
  ShareIcon,
  PrintIcon,
  SaveIcon,
  UndoIcon,
  RedoIcon,
  CutIcon,
  PasteIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  HighlighterIcon,
  PaletteIcon,
  ImageIcon,
  MapIcon,
  BarChartIcon,
  PieChartIcon,
  TrendingUpIcon,
  ActivityIcon,
  ShieldIcon,
  LockIcon,
  UnlockIcon,
  EyeIcon,
  EyeOffIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  HeartIcon,
  MessageCircleIcon,
  SendIcon,
  ReplyIcon,
  ForwardIcon,
  RotateCcwIcon,
  RotateCwIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  MaximizeIcon,
  MinimizeIcon,
  ExpandIcon,
  ShrinkIcon,
  MoveIcon,
  CropIcon,
  ScissorsIcon,
  WrenchIcon,
  HammerIcon,
  ScrewdriverIcon,
  PaintBrushIcon,
  SparklesIcon,
  MagicWandIcon,
  RocketIcon,
  FlashIcon,
} from 'lucide-react'

// Types
import type {
  QuickActionContext,
  QuickAction,
  QuickActionCategory,
  QuickActionGroup,
  QuickActionPreferences,
  QuickActionHistory,
  ActionRecommendation,
  CustomAction,
  WorkflowAction,
  BulkAction,
  NavigationContext,
  SystemHealth,
  CrossGroupState,
  User,
  Workspace,
} from '../../types/racine-core.types'

// Hooks and Services
import {
  useActivityTracker,
  useRacineOrchestration,
  useCrossGroupIntegration,
  useUserManagement,
  useWorkspaceManagement,
  useJobWorkflowBuilder,
  usePipelineManager,
} from '../../hooks'
import {
  activityTrackingAPI,
  racineOrchestrationAPI,
  crossGroupIntegrationAPI,
  workspaceManagementAPI,
  jobWorkflowAPI,
  pipelineManagementAPI,
} from '../../services'

// Utils and Constants
import {
  formatDateTime,
  formatNumber,
  generateActionRecommendations,
  categorizeActions,
  filterActionsByContext,
  trackActionUsage,
  optimizeActionLayout,
} from '../../utils/dashboard-utils'
import {
  QUICK_ACTION_CONFIGS,
  CROSS_GROUP_CONFIGS,
  WORKFLOW_TEMPLATES,
  KEYBOARD_SHORTCUTS,
} from '../../constants/cross-group-configs'

// Component Props Interface
interface QuickActionsPanelProps {
  currentUser: User
  navigationContext: NavigationContext
  systemHealth: SystemHealth
  crossGroupState: CrossGroupState
  currentWorkspace?: Workspace
  position?: 'sidebar' | 'toolbar' | 'floating' | 'modal'
  layout?: 'grid' | 'list' | 'compact' | 'expanded'
  maxActions?: number
  enableRecommendations?: boolean
  enableCustomActions?: boolean
  onActionExecute?: (action: QuickAction, context?: any) => void
  onActionCreate?: (action: CustomAction) => void
  onClose?: () => void
  className?: string
}

// Quick Actions State Interface
interface QuickActionsState {
  isLoading: boolean
  error: string | null
  actions: QuickAction[]
  recommendations: ActionRecommendation[]
  customActions: CustomAction[]
  favorites: string[]
  recentActions: QuickActionHistory[]
  selectedCategory: QuickActionCategory | 'all'
  searchQuery: string
  preferences: QuickActionPreferences
  isCommandPaletteOpen: boolean
  isCustomActionDialogOpen: boolean
  selectedAction: QuickAction | null
  executingActions: Set<string>
  lastUpdated: Date
}

// Pre-defined Quick Actions Configuration
const PREDEFINED_ACTIONS: Record<QuickActionCategory, QuickAction[]> = {
  data_sources: [
    {
      id: 'create-data-source',
      title: 'Create Data Source',
      description: 'Add a new data source connection',
      icon: DatabaseIcon,
      category: 'data_sources',
      group: 'Data Sources',
      shortcut: 'Ctrl+Shift+D',
      action: 'navigate',
      target: '/data-governance/data-sources/create',
      permissions: ['data_source.create'],
      estimatedTime: 120,
      popularity: 0.85,
    },
    {
      id: 'test-connections',
      title: 'Test All Connections',
      description: 'Run connection tests for all data sources',
      icon: RefreshCwIcon,
      category: 'data_sources',
      group: 'Data Sources',
      shortcut: 'Ctrl+T',
      action: 'execute',
      target: 'test_all_connections',
      permissions: ['data_source.test'],
      estimatedTime: 45,
      popularity: 0.92,
    },
    {
      id: 'import-data-sources',
      title: 'Import Data Sources',
      description: 'Bulk import data sources from file',
      icon: UploadIcon,
      category: 'data_sources',
      group: 'Data Sources',
      action: 'dialog',
      target: 'import_data_sources',
      permissions: ['data_source.import'],
      estimatedTime: 180,
      popularity: 0.67,
    },
  ],
  scan_rules: [
    {
      id: 'create-scan-rule',
      title: 'Create Scan Rule',
      description: 'Create a new advanced scan rule',
      icon: SearchIcon,
      category: 'scan_rules',
      group: 'Scan Rules',
      shortcut: 'Ctrl+Shift+R',
      action: 'navigate',
      target: '/data-governance/scan-rules/create',
      permissions: ['scan_rule.create'],
      estimatedTime: 300,
      popularity: 0.78,
    },
    {
      id: 'run-scan',
      title: 'Run Quick Scan',
      description: 'Execute a quick scan with default rules',
      icon: PlayIcon,
      category: 'scan_rules',
      group: 'Scan Rules',
      shortcut: 'Ctrl+R',
      action: 'execute',
      target: 'run_quick_scan',
      permissions: ['scan_rule.execute'],
      estimatedTime: 60,
      popularity: 0.95,
    },
    {
      id: 'optimize-rules',
      title: 'Optimize Scan Rules',
      description: 'AI-powered scan rule optimization',
      icon: SparklesIcon,
      category: 'scan_rules',
      group: 'Scan Rules',
      action: 'execute',
      target: 'optimize_scan_rules',
      permissions: ['scan_rule.optimize'],
      estimatedTime: 240,
      popularity: 0.73,
    },
  ],
  classifications: [
    {
      id: 'create-classification',
      title: 'Create Classification',
      description: 'Define a new data classification rule',
      icon: TagIcon,
      category: 'classifications',
      group: 'Classifications',
      shortcut: 'Ctrl+Shift+C',
      action: 'navigate',
      target: '/data-governance/classifications/create',
      permissions: ['classification.create'],
      estimatedTime: 180,
      popularity: 0.81,
    },
    {
      id: 'auto-classify',
      title: 'Auto-Classify Data',
      description: 'Run ML-powered auto-classification',
      icon: MagicWandIcon,
      category: 'classifications',
      group: 'Classifications',
      action: 'execute',
      target: 'auto_classify_data',
      permissions: ['classification.execute'],
      estimatedTime: 120,
      popularity: 0.88,
    },
  ],
  compliance: [
    {
      id: 'create-compliance-rule',
      title: 'Create Compliance Rule',
      description: 'Define a new compliance validation rule',
      icon: ShieldIcon,
      category: 'compliance',
      group: 'Compliance',
      shortcut: 'Ctrl+Shift+P',
      action: 'navigate',
      target: '/data-governance/compliance/create',
      permissions: ['compliance.create'],
      estimatedTime: 240,
      popularity: 0.76,
    },
    {
      id: 'run-compliance-check',
      title: 'Run Compliance Check',
      description: 'Execute compliance validation across all data',
      icon: CheckCircleIcon,
      category: 'compliance',
      group: 'Compliance',
      action: 'execute',
      target: 'run_compliance_check',
      permissions: ['compliance.execute'],
      estimatedTime: 180,
      popularity: 0.84,
    },
  ],
  catalog: [
    {
      id: 'create-catalog-entry',
      title: 'Create Catalog Entry',
      description: 'Add a new entry to the data catalog',
      icon: BookIcon,
      category: 'catalog',
      group: 'Catalog',
      shortcut: 'Ctrl+Shift+E',
      action: 'navigate',
      target: '/data-governance/catalog/create',
      permissions: ['catalog.create'],
      estimatedTime: 150,
      popularity: 0.79,
    },
    {
      id: 'sync-catalog',
      title: 'Sync Catalog',
      description: 'Synchronize catalog with data sources',
      icon: RefreshCwIcon,
      category: 'catalog',
      group: 'Catalog',
      action: 'execute',
      target: 'sync_catalog',
      permissions: ['catalog.sync'],
      estimatedTime: 300,
      popularity: 0.87,
    },
  ],
  scan_logic: [
    {
      id: 'create-scan-workflow',
      title: 'Create Scan Workflow',
      description: 'Build a new scan orchestration workflow',
      icon: PlayIcon,
      category: 'scan_logic',
      group: 'Scan Logic',
      action: 'navigate',
      target: '/data-governance/scan-logic/create',
      permissions: ['scan_workflow.create'],
      estimatedTime: 360,
      popularity: 0.72,
    },
    {
      id: 'monitor-scans',
      title: 'Monitor Active Scans',
      description: 'View real-time scan execution status',
      icon: ActivityIcon,
      category: 'scan_logic',
      group: 'Scan Logic',
      action: 'navigate',
      target: '/data-governance/scan-logic/monitor',
      permissions: ['scan_workflow.monitor'],
      estimatedTime: 30,
      popularity: 0.91,
    },
  ],
  rbac: [
    {
      id: 'create-user',
      title: 'Create User',
      description: 'Add a new user to the system',
      icon: UserIcon,
      category: 'rbac',
      group: 'RBAC',
      shortcut: 'Ctrl+Shift+U',
      action: 'navigate',
      target: '/data-governance/rbac/users/create',
      permissions: ['user.create'],
      estimatedTime: 120,
      popularity: 0.68,
      adminOnly: true,
    },
    {
      id: 'manage-roles',
      title: 'Manage Roles',
      description: 'Configure user roles and permissions',
      icon: UsersIcon,
      category: 'rbac',
      group: 'RBAC',
      action: 'navigate',
      target: '/data-governance/rbac/roles',
      permissions: ['role.manage'],
      estimatedTime: 180,
      popularity: 0.74,
      adminOnly: true,
    },
  ],
  workspace: [
    {
      id: 'create-workspace',
      title: 'Create Workspace',
      description: 'Set up a new collaborative workspace',
      icon: FolderIcon,
      category: 'workspace',
      group: 'Workspace',
      shortcut: 'Ctrl+Shift+W',
      action: 'dialog',
      target: 'create_workspace',
      permissions: ['workspace.create'],
      estimatedTime: 90,
      popularity: 0.83,
    },
    {
      id: 'switch-workspace',
      title: 'Switch Workspace',
      description: 'Change to a different workspace',
      icon: ArrowRightIcon,
      category: 'workspace',
      group: 'Workspace',
      shortcut: 'Ctrl+W',
      action: 'dialog',
      target: 'switch_workspace',
      permissions: ['workspace.access'],
      estimatedTime: 10,
      popularity: 0.96,
    },
  ],
  workflows: [
    {
      id: 'create-workflow',
      title: 'Create Workflow',
      description: 'Build a new automated workflow',
      icon: PlayIcon,
      category: 'workflows',
      group: 'Workflows',
      shortcut: 'Ctrl+Shift+F',
      action: 'navigate',
      target: '/racine/workflows/create',
      permissions: ['workflow.create'],
      estimatedTime: 420,
      popularity: 0.77,
    },
    {
      id: 'run-workflow',
      title: 'Run Workflow',
      description: 'Execute an existing workflow',
      icon: PlayIcon,
      category: 'workflows',
      group: 'Workflows',
      action: 'dialog',
      target: 'run_workflow',
      permissions: ['workflow.execute'],
      estimatedTime: 60,
      popularity: 0.89,
    },
  ],
  pipelines: [
    {
      id: 'create-pipeline',
      title: 'Create Pipeline',
      description: 'Design a new data processing pipeline',
      icon: ArrowRightIcon,
      category: 'pipelines',
      group: 'Pipelines',
      action: 'navigate',
      target: '/racine/pipelines/create',
      permissions: ['pipeline.create'],
      estimatedTime: 480,
      popularity: 0.75,
    },
    {
      id: 'monitor-pipelines',
      title: 'Monitor Pipelines',
      description: 'View pipeline execution status',
      icon: BarChartIcon,
      category: 'pipelines',
      group: 'Pipelines',
      action: 'navigate',
      target: '/racine/pipelines/monitor',
      permissions: ['pipeline.monitor'],
      estimatedTime: 30,
      popularity: 0.92,
    },
  ],
  system: [
    {
      id: 'system-health',
      title: 'System Health',
      description: 'View overall system health status',
      icon: ActivityIcon,
      category: 'system',
      group: 'System',
      action: 'navigate',
      target: '/racine/dashboard',
      permissions: ['system.monitor'],
      estimatedTime: 15,
      popularity: 0.94,
    },
    {
      id: 'export-logs',
      title: 'Export System Logs',
      description: 'Download system logs for analysis',
      icon: DownloadIcon,
      category: 'system',
      group: 'System',
      action: 'execute',
      target: 'export_system_logs',
      permissions: ['system.logs'],
      estimatedTime: 120,
      popularity: 0.61,
    },
  ],
}

/**
 * QuickActionsPanel Component
 * 
 * Comprehensive quick actions system with context-aware recommendations,
 * customizable interface, and intelligent workflow automation.
 */
const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  currentUser,
  navigationContext,
  systemHealth,
  crossGroupState,
  currentWorkspace,
  position = 'sidebar',
  layout = 'grid',
  maxActions = 20,
  enableRecommendations = true,
  enableCustomActions = true,
  onActionExecute,
  onActionCreate,
  onClose,
  className = '',
}) => {
  // Refs
  const commandPaletteRef = useRef<HTMLDivElement>(null)

  // State Management
  const [quickActionsState, setQuickActionsState] = useState<QuickActionsState>({
    isLoading: true,
    error: null,
    actions: [],
    recommendations: [],
    customActions: [],
    favorites: [],
    recentActions: [],
    selectedCategory: 'all',
    searchQuery: '',
    preferences: {
      layout: layout,
      maxActions: maxActions,
      enableRecommendations: enableRecommendations,
      enableKeyboardShortcuts: true,
      showEstimatedTime: true,
      showPopularity: true,
      groupByCategory: true,
      autoHideCompleted: false,
      soundEffects: false,
    },
    isCommandPaletteOpen: false,
    isCustomActionDialogOpen: false,
    selectedAction: null,
    executingActions: new Set(),
    lastUpdated: new Date(),
  })

  const [selectedView, setSelectedView] = useState<'all' | 'favorites' | 'recent' | 'custom'>('all')
  const [newCustomAction, setNewCustomAction] = useState<Partial<CustomAction>>({})

  // Hooks
  const {
    trackActivity,
    getActionHistory,
    recordActionUsage,
  } = useActivityTracker(currentUser.id, navigationContext)

  const {
    systemMetrics,
    executeSystemAction,
  } = useRacineOrchestration(currentUser.id, {
    isInitialized: true,
    currentView: 'quick_actions',
    activeWorkspaceId: navigationContext.workspaceId || '',
    layoutMode: 'panel',
    sidebarCollapsed: false,
    loading: false,
    error: null,
    systemHealth,
    lastActivity: new Date(),
    performanceMetrics: {},
  })

  const {
    crossGroupActions,
    executeCrossGroupAction,
  } = useCrossGroupIntegration(currentUser.id, crossGroupState)

  const {
    workspaces,
    createWorkspace,
    switchWorkspace,
  } = useWorkspaceManagement(currentUser.id, navigationContext)

  const {
    workflows,
    executeWorkflow,
    createWorkflow,
  } = useJobWorkflowBuilder(currentUser.id, navigationContext)

  const {
    pipelines,
    executePipeline,
    createPipeline,
  } = usePipelineManager(currentUser.id, navigationContext)

  // Load and process actions
  const loadQuickActions = useCallback(async () => {
    try {
      setQuickActionsState(prev => ({ ...prev, isLoading: true, error: null }))

      // Get all predefined actions
      const allPredefinedActions = Object.values(PREDEFINED_ACTIONS).flat()

      // Filter actions based on user permissions
      const userPermissions = currentUser.permissions || []
      const isAdmin = currentUser.roles?.includes('admin') || false

      const availableActions = allPredefinedActions.filter(action => {
        // Check admin-only actions
        if (action.adminOnly && !isAdmin) return false

        // Check permissions
        if (action.permissions && action.permissions.length > 0) {
          return action.permissions.some(permission => userPermissions.includes(permission))
        }

        return true
      })

      // Load user's custom actions
      const customActions = await activityTrackingAPI.getCustomActions(currentUser.id)

      // Load user's favorites and recent actions
      const [favorites, recentActions] = await Promise.all([
        activityTrackingAPI.getFavoriteActions(currentUser.id),
        getActionHistory({ limit: 10 }),
      ])

      // Generate recommendations if enabled
      let recommendations: ActionRecommendation[] = []
      if (enableRecommendations) {
        recommendations = await generateActionRecommendations({
          user: currentUser,
          context: navigationContext,
          workspace: currentWorkspace,
          recentActions,
          systemHealth,
          crossGroupState,
        })
      }

      setQuickActionsState(prev => ({
        ...prev,
        isLoading: false,
        actions: availableActions,
        customActions,
        favorites: favorites.map((f: any) => f.actionId),
        recentActions,
        recommendations,
        lastUpdated: new Date(),
      }))

    } catch (error) {
      console.error('Failed to load quick actions:', error)
      setQuickActionsState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load quick actions',
      }))
    }
  }, [
    currentUser,
    navigationContext,
    currentWorkspace,
    systemHealth,
    crossGroupState,
    enableRecommendations,
    getActionHistory,
  ])

  // Execute action
  const executeAction = useCallback(async (action: QuickAction, context?: any) => {
    try {
      // Mark action as executing
      setQuickActionsState(prev => ({
        ...prev,
        executingActions: new Set([...prev.executingActions, action.id]),
      }))

      // Record action usage
      await recordActionUsage(action.id, {
        timestamp: new Date(),
        context: navigationContext,
        workspace: currentWorkspace?.id,
        duration: 0, // Will be updated after completion
      })

      // Track activity
      trackActivity({
        type: 'quick_action_executed',
        details: {
          actionId: action.id,
          actionTitle: action.title,
          category: action.category,
          group: action.group,
        },
      })

      let result: any = null

      // Execute based on action type
      switch (action.action) {
        case 'navigate':
          if (action.target) {
            window.location.href = action.target
          }
          break

        case 'execute':
          if (action.target) {
            result = await executeSystemAction(action.target, context)
          }
          break

        case 'dialog':
          setQuickActionsState(prev => ({ ...prev, selectedAction: action }))
          break

        case 'workflow':
          if (action.workflowId) {
            result = await executeWorkflow(action.workflowId, context)
          }
          break

        case 'pipeline':
          if (action.pipelineId) {
            result = await executePipeline(action.pipelineId, context)
          }
          break

        case 'cross_group':
          result = await executeCrossGroupAction(action.target!, context)
          break

        default:
          console.warn('Unknown action type:', action.action)
      }

      // Call external handler if provided
      if (onActionExecute) {
        onActionExecute(action, { result, context })
      }

      // Show success feedback
      if (quickActionsState.preferences.soundEffects) {
        playSuccessSound()
      }

    } catch (error) {
      console.error('Failed to execute action:', error)
      
      // Show error feedback
      if (quickActionsState.preferences.soundEffects) {
        playErrorSound()
      }
      
      // Could show toast notification here
    } finally {
      // Remove from executing set
      setQuickActionsState(prev => ({
        ...prev,
        executingActions: new Set([...prev.executingActions].filter(id => id !== action.id)),
      }))
    }
  }, [
    navigationContext,
    currentWorkspace,
    recordActionUsage,
    trackActivity,
    executeSystemAction,
    executeWorkflow,
    executePipeline,
    executeCrossGroupAction,
    onActionExecute,
    quickActionsState.preferences.soundEffects,
  ])

  // Create custom action
  const createCustomAction = useCallback(async (customAction: CustomAction) => {
    try {
      const createdAction = await activityTrackingAPI.createCustomAction(currentUser.id, customAction)
      
      setQuickActionsState(prev => ({
        ...prev,
        customActions: [...prev.customActions, createdAction],
      }))

      if (onActionCreate) {
        onActionCreate(createdAction)
      }

      setNewCustomAction({})
      setQuickActionsState(prev => ({ ...prev, isCustomActionDialogOpen: false }))

    } catch (error) {
      console.error('Failed to create custom action:', error)
    }
  }, [currentUser.id, onActionCreate])

  // Toggle favorite
  const toggleFavorite = useCallback(async (actionId: string) => {
    try {
      const isFavorite = quickActionsState.favorites.includes(actionId)
      
      if (isFavorite) {
        await activityTrackingAPI.removeFavoriteAction(currentUser.id, actionId)
        setQuickActionsState(prev => ({
          ...prev,
          favorites: prev.favorites.filter(id => id !== actionId),
        }))
      } else {
        await activityTrackingAPI.addFavoriteAction(currentUser.id, actionId)
        setQuickActionsState(prev => ({
          ...prev,
          favorites: [...prev.favorites, actionId],
        }))
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }, [currentUser.id, quickActionsState.favorites])

  // Filter actions based on current view and search
  const filteredActions = useMemo(() => {
    let actions: QuickAction[] = []

    switch (selectedView) {
      case 'all':
        actions = [...quickActionsState.actions, ...quickActionsState.customActions]
        break
      case 'favorites':
        actions = [...quickActionsState.actions, ...quickActionsState.customActions]
          .filter(action => quickActionsState.favorites.includes(action.id))
        break
      case 'recent':
        const recentActionIds = quickActionsState.recentActions.map(ra => ra.actionId)
        actions = [...quickActionsState.actions, ...quickActionsState.customActions]
          .filter(action => recentActionIds.includes(action.id))
        break
      case 'custom':
        actions = quickActionsState.customActions
        break
    }

    // Apply category filter
    if (quickActionsState.selectedCategory !== 'all') {
      actions = actions.filter(action => action.category === quickActionsState.selectedCategory)
    }

    // Apply search filter
    if (quickActionsState.searchQuery) {
      const query = quickActionsState.searchQuery.toLowerCase()
      actions = actions.filter(action =>
        action.title.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query) ||
        action.group.toLowerCase().includes(query)
      )
    }

    // Sort by popularity or recent usage
    actions.sort((a, b) => {
      if (selectedView === 'recent') {
        const aRecent = quickActionsState.recentActions.find(ra => ra.actionId === a.id)
        const bRecent = quickActionsState.recentActions.find(ra => ra.actionId === b.id)
        if (aRecent && bRecent) {
          return new Date(bRecent.timestamp).getTime() - new Date(aRecent.timestamp).getTime()
        }
      }
      return (b.popularity || 0) - (a.popularity || 0)
    })

    return actions.slice(0, quickActionsState.preferences.maxActions)
  }, [
    quickActionsState.actions,
    quickActionsState.customActions,
    quickActionsState.favorites,
    quickActionsState.recentActions,
    quickActionsState.selectedCategory,
    quickActionsState.searchQuery,
    quickActionsState.preferences.maxActions,
    selectedView,
  ])

  // Group actions by category if enabled
  const groupedActions = useMemo(() => {
    if (!quickActionsState.preferences.groupByCategory) {
      return { 'All Actions': filteredActions }
    }

    const groups: Record<string, QuickAction[]> = {}
    filteredActions.forEach(action => {
      const groupName = action.group || 'Other'
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(action)
    })

    return groups
  }, [filteredActions, quickActionsState.preferences.groupByCategory])

  // Keyboard shortcuts
  useEffect(() => {
    if (!quickActionsState.preferences.enableKeyboardShortcuts) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Command palette shortcut (Ctrl/Cmd + K)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        setQuickActionsState(prev => ({ 
          ...prev, 
          isCommandPaletteOpen: !prev.isCommandPaletteOpen 
        }))
        return
      }

      // Check for action-specific shortcuts
      if (event.ctrlKey || event.metaKey) {
        const shortcutKey = `${event.ctrlKey ? 'Ctrl+' : 'Cmd+'}${event.shiftKey ? 'Shift+' : ''}${event.key.toUpperCase()}`
        
        const actionWithShortcut = quickActionsState.actions.find(action => 
          action.shortcut === shortcutKey
        )

        if (actionWithShortcut) {
          event.preventDefault()
          executeAction(actionWithShortcut)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [quickActionsState.preferences.enableKeyboardShortcuts, quickActionsState.actions, executeAction])

  // Sound effects
  const playSuccessSound = useCallback(() => {
    if (typeof Audio !== 'undefined') {
      try {
        const audio = new Audio('/sounds/success.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {})
      } catch (error) {
        // Ignore audio errors
      }
    }
  }, [])

  const playErrorSound = useCallback(() => {
    if (typeof Audio !== 'undefined') {
      try {
        const audio = new Audio('/sounds/error.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {})
      } catch (error) {
        // Ignore audio errors
      }
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadQuickActions()
  }, [loadQuickActions])

  // Render action item
  const renderActionItem = (action: QuickAction) => {
    const isExecuting = quickActionsState.executingActions.has(action.id)
    const isFavorite = quickActionsState.favorites.includes(action.id)
    const Icon = action.icon

    return (
      <motion.div
        key={action.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="cursor-pointer hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  {isExecuting ? (
                    <RefreshCwIcon className="h-5 w-5 text-blue-500 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="min-w-0 flex-grow">
                  <h4 className="font-medium text-sm truncate">{action.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(action.id)
                      }}
                    >
                      <StarIcon className={`h-3 w-3 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontalIcon className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => executeAction(action)}>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Execute
                    </DropdownMenuItem>
                    {action.shortcut && (
                      <DropdownMenuItem disabled>
                        <span className="text-xs text-muted-foreground">
                          Shortcut: {action.shortcut}
                        </span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toggleFavorite(action.id)}>
                      <StarIcon className="h-4 w-4 mr-2" />
                      {isFavorite ? 'Remove favorite' : 'Add favorite'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {action.group}
                </Badge>
                {quickActionsState.preferences.showEstimatedTime && action.estimatedTime && (
                  <span className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {Math.round(action.estimatedTime / 60)}m
                  </span>
                )}
              </div>
              
              {quickActionsState.preferences.showPopularity && action.popularity && (
                <div className="flex items-center">
                  <TrendingUpIcon className="h-3 w-3 mr-1" />
                  {Math.round(action.popularity * 100)}%
                </div>
              )}
            </div>

            <Button
              className="w-full mt-3"
              size="sm"
              onClick={() => executeAction(action)}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Render loading state
  if (quickActionsState.isLoading) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCwIcon className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-muted-foreground">Loading quick actions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render error state
  if (quickActionsState.error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              Failed to load quick actions: {quickActionsState.error}
              <Button
                variant="outline"
                size="sm"
                onClick={loadQuickActions}
                className="ml-2"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const positionClasses = {
    sidebar: 'w-full',
    toolbar: 'w-full',
    floating: 'w-96 max-h-[600px]',
    modal: 'w-full max-w-4xl max-h-[80vh]',
  }

  return (
    <TooltipProvider>
      <Card className={`${positionClasses[position]} ${className}`}>
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ZapIcon className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              {quickActionsState.recommendations.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {quickActionsState.recommendations.length} suggestions
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuickActionsState(prev => ({ 
                      ...prev, 
                      isCommandPaletteOpen: true 
                    }))}
                  >
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Command Palette (Ctrl+K)</TooltipContent>
              </Tooltip>

              {enableCustomActions && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuickActionsState(prev => ({ 
                        ...prev, 
                        isCustomActionDialogOpen: true 
                      }))}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create Custom Action</TooltipContent>
                </Tooltip>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={loadQuickActions}
                disabled={quickActionsState.isLoading}
              >
                <RefreshCwIcon className={`h-4 w-4 ${quickActionsState.isLoading ? 'animate-spin' : ''}`} />
              </Button>

              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <XCircleIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex items-center space-x-2 mt-3">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions..."
                value={quickActionsState.searchQuery}
                onChange={(e) => setQuickActionsState(prev => ({ 
                  ...prev, 
                  searchQuery: e.target.value 
                }))}
                className="pl-10"
              />
            </div>

            <Select
              value={quickActionsState.selectedCategory}
              onValueChange={(value) => setQuickActionsState(prev => ({ 
                ...prev, 
                selectedCategory: value as QuickActionCategory | 'all' 
              }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="data_sources">Data Sources</SelectItem>
                <SelectItem value="scan_rules">Scan Rules</SelectItem>
                <SelectItem value="classifications">Classifications</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="catalog">Catalog</SelectItem>
                <SelectItem value="scan_logic">Scan Logic</SelectItem>
                <SelectItem value="rbac">RBAC</SelectItem>
                <SelectItem value="workspace">Workspace</SelectItem>
                <SelectItem value="workflows">Workflows</SelectItem>
                <SelectItem value="pipelines">Pipelines</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Tabs */}
        <div className="px-6">
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="favorites">
                Favorites
                {quickActionsState.favorites.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {quickActionsState.favorites.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedView} className="mt-4">
              <CardContent className="p-0">
                {/* Recommendations */}
                {enableRecommendations && quickActionsState.recommendations.length > 0 && selectedView === 'all' && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <SparklesIcon className="h-4 w-4 mr-2 text-yellow-500" />
                      Recommended for you
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {quickActionsState.recommendations.slice(0, 3).map((rec) => {
                        const action = quickActionsState.actions.find(a => a.id === rec.actionId)
                        if (!action) return null
                        return (
                          <div key={rec.actionId} className="relative">
                            {renderActionItem(action)}
                            <Badge 
                              variant="secondary" 
                              className="absolute -top-2 -right-2 text-xs bg-yellow-100 text-yellow-800"
                            >
                              {Math.round(rec.score * 100)}% match
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                    <Separator className="my-6" />
                  </div>
                )}

                {/* Actions */}
                {Object.keys(groupedActions).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ZapIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No actions found</h3>
                    <p className="text-sm text-muted-foreground">
                      {quickActionsState.searchQuery
                        ? `No actions match "${quickActionsState.searchQuery}"`
                        : selectedView === 'favorites'
                        ? "You haven't favorited any actions yet"
                        : selectedView === 'recent'
                        ? "No recent actions to display"
                        : selectedView === 'custom'
                        ? "No custom actions created yet"
                        : "No actions available"
                      }
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-6 p-1">
                      {Object.entries(groupedActions).map(([groupName, actions]) => (
                        <div key={groupName}>
                          {quickActionsState.preferences.groupByCategory && Object.keys(groupedActions).length > 1 && (
                            <h3 className="text-sm font-medium mb-3 flex items-center">
                              {groupName}
                              <Badge variant="outline" className="ml-2 text-xs">
                                {actions.length}
                              </Badge>
                            </h3>
                          )}
                          <div className={`grid gap-3 ${
                            layout === 'grid' 
                              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                              : 'grid-cols-1'
                          }`}>
                            <AnimatePresence>
                              {actions.map(renderActionItem)}
                            </AnimatePresence>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </div>

        {/* Command Palette */}
        <CommandDialog 
          open={quickActionsState.isCommandPaletteOpen} 
          onOpenChange={(open) => setQuickActionsState(prev => ({ 
            ...prev, 
            isCommandPaletteOpen: open 
          }))}
        >
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(groupedActions).map(([groupName, actions]) => (
              <CommandGroup key={groupName} heading={groupName}>
                {actions.map((action) => (
                  <CommandItem
                    key={action.id}
                    onSelect={() => {
                      executeAction(action)
                      setQuickActionsState(prev => ({ 
                        ...prev, 
                        isCommandPaletteOpen: false 
                      }))
                    }}
                  >
                    <action.icon className="mr-2 h-4 w-4" />
                    <span>{action.title}</span>
                    {action.shortcut && (
                      <CommandShortcut>{action.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </CommandDialog>

        {/* Custom Action Dialog */}
        <Dialog 
          open={quickActionsState.isCustomActionDialogOpen}
          onOpenChange={(open) => setQuickActionsState(prev => ({ 
            ...prev, 
            isCustomActionDialogOpen: open 
          }))}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Custom Action</DialogTitle>
              <DialogDescription>
                Create a custom quick action for your workflow
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Action title"
                  value={newCustomAction.title || ''}
                  onChange={(e) => setNewCustomAction(prev => ({ 
                    ...prev, 
                    title: e.target.value 
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Action description"
                  value={newCustomAction.description || ''}
                  onChange={(e) => setNewCustomAction(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="action-type">Action Type</Label>
                <Select
                  value={newCustomAction.action || ''}
                  onValueChange={(value) => setNewCustomAction(prev => ({ 
                    ...prev, 
                    action: value as any 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="navigate">Navigate to URL</SelectItem>
                    <SelectItem value="execute">Execute Command</SelectItem>
                    <SelectItem value="workflow">Run Workflow</SelectItem>
                    <SelectItem value="pipeline">Run Pipeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  placeholder={
                    newCustomAction.action === 'navigate' ? 'URL or path' :
                    newCustomAction.action === 'execute' ? 'Command name' :
                    newCustomAction.action === 'workflow' ? 'Workflow ID' :
                    newCustomAction.action === 'pipeline' ? 'Pipeline ID' :
                    'Target'
                  }
                  value={newCustomAction.target || ''}
                  onChange={(e) => setNewCustomAction(prev => ({ 
                    ...prev, 
                    target: e.target.value 
                  }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNewCustomAction({})
                  setQuickActionsState(prev => ({ 
                    ...prev, 
                    isCustomActionDialogOpen: false 
                  }))
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newCustomAction.title && newCustomAction.action && newCustomAction.target) {
                    createCustomAction({
                      ...newCustomAction,
                      id: `custom-${Date.now()}`,
                      category: 'custom',
                      group: 'Custom',
                      icon: ZapIcon,
                      popularity: 0,
                    } as CustomAction)
                  }
                }}
                disabled={!newCustomAction.title || !newCustomAction.action || !newCustomAction.target}
              >
                Create Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </TooltipProvider>
  )
}

export default QuickActionsPanel