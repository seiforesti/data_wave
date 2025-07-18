// ============================================================================
// ENHANCED DATA SOURCES SPA - ENTERPRISE INTEGRATION
// ============================================================================

"use client"

import React, { useState, useEffect, Suspense, useCallback, useMemo, createContext, useContext } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "sonner"
import {
  Database, Settings, Activity, TrendingUp, Users, Shield, Cloud, Search,
  BarChart3, Eye, Zap, Target, Bell, Menu, X, ChevronLeft, ChevronRight,
  Plus, Filter, Download, Upload, RefreshCw, HelpCircle, User, LogOut,
  Monitor, Palette, Globe, Lock, Building, FileText, MessageSquare, Star,
  Grid, List, Layers, GitBranch, Workflow, Calendar, Clock, AlertTriangle,
  CheckCircle, Info, Play, Pause, Stop, Edit, Trash2, Copy, Share2,
  ExternalLink, MoreHorizontal, ChevronDown, ChevronUp, Maximize2, Minimize2,
  PanelLeftOpen, PanelRightOpen, SplitSquareHorizontal, Layout, Command,
  Cpu, HardDrive, Network, Gauge, LineChart, PieChart, AreaChart,
  TestTube, Beaker, Microscope, Cog, Wrench, Tool, Package, Server,
  CircuitBoard, Boxes, Archive, FolderOpen, Folder, File, Code2,
  Terminal, Bug, Sparkles, Rocket, Flame, Lightbulb, Brain, Bot,
  Radar, Crosshair, Focus, Scan, SearchX, ScanLine, Binary, Hash,
  Type, Key, ShieldCheck, UserCheck, Crown, Badge as BadgeIcon,
  Award, Medal, Trophy, Flag, Bookmark, Heart, ThumbsUp, Smile,
  Frown, AlertCircle, XCircle, Wifi, WifiOff, Signal, SignalHigh,
  SignalLow, SignalMedium, Route, Map, MapPin, Navigation, Compass,
  TreePine, Workflow as WorkflowIcon
} from "lucide-react"

// Import shadcn/ui components
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuShortcut } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Command as CommandComponent, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Import enterprise integration
import { 
  EnterpriseIntegrationProvider, 
  useEnterpriseContext,
  createEnterpriseEvent,
  getSystemHealthScore 
} from './enterprise-integration'

// Import enterprise hooks
import {
  useEnterpriseFeatures,
  useMonitoringFeatures,
  useSecurityFeatures,
  useOperationsFeatures,
  useCollaborationFeatures,
  useWorkflowIntegration,
  useAnalyticsIntegration
} from './hooks/use-enterprise-features'

// Import ALL enterprise APIs for complete backend integration
import { 
  // Core Data Source APIs
  useDataSourcesQuery, 
  useUserQuery, 
  useNotificationsQuery,
  useWorkspaceQuery,
  useDataSourceMetricsQuery,
  useDataSourceHealthQuery,
  useConnectionPoolStatsQuery,
  useDiscoveryHistoryQuery,
  useScanResultsQuery,
  useQualityMetricsQuery,
  useGrowthMetricsQuery,
  useSchemaDiscoveryQuery,
  useDataLineageQuery,
  useBackupStatusQuery,
  useScheduledTasksQuery,
  useAuditLogsQuery,
  useUserPermissionsQuery,
  useDataCatalogQuery,
  
  // NEW ENTERPRISE APIs - FULL BACKEND INTEGRATION 
  // Collaboration APIs
  useCollaborationWorkspacesQuery,
  useActiveCollaborationSessionsQuery,
  useSharedDocumentsQuery,
  useCreateSharedDocumentMutation,
  useDocumentCommentsQuery,
  useAddDocumentCommentMutation,
  useInviteToWorkspaceMutation,
  useWorkspaceActivityQuery,
  useCreateCollaborationWorkspaceMutation,
  
  // Workflow APIs  
  useWorkflowDefinitionsQuery,
  useWorkflowExecutionsQuery,
  usePendingApprovalsQuery,
  useWorkflowTemplatesQuery,
  useWorkflowDefinitionQuery,
  useUpdateWorkflowDefinitionMutation,
  useExecuteWorkflowMutation,
  useWorkflowExecutionDetailsQuery,
  useCreateApprovalWorkflowMutation,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useCreateBulkOperationMutation,
  useBulkOperationStatusQuery,
  useCreateWorkflowDefinitionMutation,
  
  // Enhanced Performance APIs
  useSystemHealthQuery,
  useEnhancedPerformanceMetricsQuery,
  usePerformanceAlertsQuery,
  usePerformanceTrendsQuery,
  useOptimizationRecommendationsQuery,
  usePerformanceSummaryReportQuery,
  useAcknowledgePerformanceAlertMutation,
  useResolvePerformanceAlertMutation,
  usePerformanceThresholdsQuery,
  useCreatePerformanceThresholdMutation,
  useStartRealTimeMonitoringMutation,
  useStopRealTimeMonitoringMutation,
  
  // Enhanced Security APIs
  useEnhancedSecurityAuditQuery,
  useVulnerabilityAssessmentsQuery,
  useSecurityIncidentsQuery,
  useComplianceChecksQuery,
  useThreatDetectionQuery,
  useSecurityAnalyticsDashboardQuery,
  useRiskAssessmentReportQuery,
  useCreateEnhancedSecurityScanMutation,
  useSecurityScansQuery,
  useRemediateVulnerabilityMutation,
  useCreateSecurityIncidentMutation,
  useRunComplianceCheckMutation,
  useStartSecurityMonitoringMutation,
} from './services/enterprise-apis'

// Import three-phase architecture
import { CoreComponentRegistry } from './core/component-registry'
import { EnterpriseEventBus } from './core/event-bus'
import { StateManager } from './core/state-manager'
import { WorkflowEngine } from './core/workflow-engine'
import { CorrelationEngine } from './analytics/correlation-engine'
import { RealtimeCollaboration } from './collaboration/realtime-collaboration'
import { ApprovalSystem } from './workflows/approval-system'
import { BulkOperations } from './workflows/bulk-operations'

// Import ALL existing data-sources components
import { DataSourceList } from "./data-source-list"
import { DataSourceGrid } from "./data-source-grid"
import { DataSourceDetails } from "./data-source-details"
import { DataSourceCreateModal } from "./data-source-create-modal"
import { DataSourceEditModal } from "./data-source-edit-modal"
import { DataSourceConnectionTestModal } from "./data-source-connection-test-modal"
import { DataSourceMonitoring } from "./data-source-monitoring"
import { DataSourceMonitoringDashboard } from "./data-source-monitoring-dashboard"
import { DataSourceCloudConfig } from "./data-source-cloud-config"
import { DataSourceDiscovery } from "./data-source-discovery"
import { DataSourceQualityAnalytics } from "./data-source-quality-analytics"
import { DataSourceGrowthAnalytics } from "./data-source-growth-analytics"
import { DataSourceWorkspaceManagement } from "./data-source-workspace-management"
import { DataSourceFilters } from "./data-source-filters"
import { DataSourceBulkActions } from "./data-source-bulk-actions"

// Import data-discovery subdirectory components
import { DataDiscoveryWorkspace } from "./data-discovery/data-discovery-workspace"
import { DataLineageGraph } from "./data-discovery/data-lineage-graph"
import { SchemaDiscovery } from "./data-discovery/schema-discovery"

// Import enterprise UI components
import { EnterpriseDashboard } from "./ui/dashboard/enterprise-dashboard"
import { CollaborationStudio } from "./ui/collaboration/collaboration-studio"
import { AnalyticsWorkbench } from "./ui/analytics/analytics-workbench"
import { WorkflowDesigner } from "./ui/workflow/workflow-designer"

// Import remaining components with enterprise features
const DataSourceComplianceView = React.lazy(() => import("./data-source-compliance-view"))
const DataSourceSecurityView = React.lazy(() => import("./data-source-security-view"))
const DataSourcePerformanceView = React.lazy(() => import("./data-source-performance-view"))
const DataSourceScanResults = React.lazy(() => import("./data-source-scan-results"))
const DataSourceTagsManager = React.lazy(() => import("./data-source-tags-manager"))
const DataSourceVersionHistory = React.lazy(() => import("./data-source-version-history"))
const DataSourceBackupRestore = React.lazy(() => import("./data-source-backup-restore"))
const DataSourceAccessControl = React.lazy(() => import("./data-source-access-control"))
const DataSourceNotifications = React.lazy(() => import("./data-source-notifications"))
const DataSourceReports = React.lazy(() => import("./data-source-reports"))
const DataSourceScheduler = React.lazy(() => import("./data-source-scheduler"))
const DataSourceIntegrations = React.lazy(() => import("./data-source-integrations"))
const DataSourceCatalog = React.lazy(() => import("./data-source-catalog"))

// Import enterprise UI components
import { EnterpriseDashboard } from './ui/dashboard/enterprise-dashboard'
import { AnalyticsWorkbench } from './ui/analytics/analytics-workbench'
import { CollaborationStudio } from './ui/collaboration/collaboration-studio'
import { WorkflowDesigner } from './ui/workflow/workflow-designer'

// Import types and services
import { DataSource, ViewMode, PanelLayout } from "./types"
import * as enterpriseApis from './services/enterprise-apis'

// ============================================================================
// ENHANCED QUERY CLIENT CONFIGURATION
// ============================================================================

const createEnterpriseQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error: any) => {
        console.error('Query error:', error)
        // Global error handling with enterprise event bus
        if (window.enterpriseEventBus) {
          window.enterpriseEventBus.emit('query:error', {
            error: error.message,
            timestamp: new Date(),
            component: 'data-sources-app'
          })
        }
      }
    },
    mutations: {
      retry: 2,
      onError: (error: any) => {
        console.error('Mutation error:', error)
        // Global mutation error handling
        if (window.enterpriseEventBus) {
          window.enterpriseEventBus.emit('mutation:error', {
            error: error.message,
            timestamp: new Date(),
            component: 'data-sources-app'
          })
        }
      }
    },
  },
})

// ============================================================================
// ENHANCED NAVIGATION STRUCTURE WITH ENTERPRISE FEATURES
// ============================================================================

const enterpriseNavigationStructure = {
  core: {
    label: "Core Management",
    icon: Database,
    category: "primary",
    items: [
      { id: "dashboard", label: "Enterprise Dashboard", icon: BarChart3, component: "enterprise-dashboard", description: "Unified enterprise dashboard with AI insights", shortcut: "⌘+D", premium: true },
      { id: "overview", label: "Overview", icon: Eye, component: "overview", description: "Comprehensive data sources overview", shortcut: "⌘+1" },
      { id: "grid", label: "Grid View", icon: Grid, component: "grid", description: "Visual grid layout with real-time updates", shortcut: "⌘+2" },
      { id: "list", label: "List View", icon: List, component: "list", description: "Advanced list view with filtering", shortcut: "⌘+3" },
      { id: "details", label: "Details", icon: FileText, component: "details", description: "In-depth analysis with AI insights", shortcut: "⌘+4" },
    ]
  },
  monitoring: {
    label: "Monitoring & Analytics",
    icon: Activity,
    category: "analytics",
    items: [
      { id: "monitoring", label: "Real-time Monitoring", icon: Monitor, component: "monitoring", description: "Live health and performance metrics", shortcut: "⌘+M", features: ["realTime", "analytics"] },
      { id: "dashboard-monitoring", label: "Monitoring Dashboard", icon: BarChart3, component: "dashboard-monitoring", description: "Advanced monitoring dashboards", shortcut: "⌘+Shift+M", features: ["analytics"] },
      { id: "performance", label: "Performance Analytics", icon: Zap, component: "performance", description: "Performance insights with AI recommendations", shortcut: "⌘+P", features: ["analytics", "ai"] },
      { id: "quality", label: "Quality Analytics", icon: Shield, component: "quality", description: "Data quality metrics and ML scoring", shortcut: "⌘+Q", features: ["analytics", "ml"] },
      { id: "growth", label: "Growth Analytics", icon: TrendingUp, component: "growth", description: "Growth patterns and predictions", shortcut: "⌘+G", features: ["analytics", "predictions"] },
      { id: "analytics-workbench", label: "Analytics Workbench", icon: Brain, component: "analytics-workbench", description: "Advanced analytics workspace", shortcut: "⌘+A", premium: true, features: ["analytics", "collaboration"] },
    ]
  },
  discovery: {
    label: "Discovery & Governance",
    icon: Search,
    category: "governance",
    items: [
      { id: "discovery", label: "Data Discovery", icon: Scan, component: "discovery", description: "AI-powered data asset discovery", shortcut: "⌘+F", features: ["ai", "analytics"] },
      { id: "discovery-workspace", label: "Discovery Workspace", icon: FolderOpen, component: "discovery-workspace", description: "Collaborative discovery workspace", shortcut: "⌘+W", features: ["collaboration"] },
      { id: "schema-discovery", label: "Schema Discovery", icon: TreePine, component: "schema-discovery", description: "Automated schema mapping", shortcut: "⌘+H" },
      { id: "data-lineage", label: "Data Lineage", icon: WorkflowIcon, component: "data-lineage", description: "Interactive lineage visualization", shortcut: "⌘+L", features: ["analytics"] },
      { id: "scan-results", label: "Scan Results", icon: ScanLine, component: "scan-results", description: "Detailed scan results with insights", shortcut: "⌘+S" },
      { id: "compliance", label: "Compliance", icon: ShieldCheck, component: "compliance", description: "Compliance monitoring and reporting", shortcut: "⌘+C", features: ["workflows", "analytics"] },
      { id: "security", label: "Security", icon: Lock, component: "security", description: "Security assessment with AI analysis", shortcut: "⌘+E", features: ["ai", "workflows"] },
    ]
  },
  management: {
    label: "Configuration & Management",
    icon: Settings,
    category: "management",
    items: [
      { id: "cloud-config", label: "Cloud Configuration", icon: Cloud, component: "cloud-config", description: "Multi-cloud provider settings", shortcut: "⌘+K" },
      { id: "access-control", label: "Access Control", icon: UserCheck, component: "access-control", description: "Advanced user permissions and RBAC", shortcut: "⌘+Shift+A", features: ["workflows"] },
      { id: "tags", label: "Tags Manager", icon: Hash, component: "tags", description: "AI-powered tag management", shortcut: "⌘+T", features: ["ai"] },
      { id: "scheduler", label: "Task Scheduler", icon: Calendar, component: "scheduler", description: "Advanced task automation", shortcut: "⌘+J", features: ["workflows"] },
      { id: "workflow-designer", label: "Workflow Designer", icon: Workflow, component: "workflow-designer", description: "Visual workflow design studio", shortcut: "⌘+Shift+W", premium: true, features: ["workflows", "collaboration"] },
    ]
  },
  collaboration: {
    label: "Collaboration & Sharing",
    icon: Users,
    category: "collaboration",
    items: [
      { id: "workspaces", label: "Workspaces", icon: Building, component: "workspaces", description: "Team collaboration spaces", shortcut: "⌘+U", features: ["collaboration"] },
      { id: "collaboration-studio", label: "Collaboration Studio", icon: MessageSquare, component: "collaboration-studio", description: "Real-time collaboration environment", shortcut: "⌘+Shift+C", premium: true, features: ["collaboration", "realTime"] },
      { id: "notifications", label: "Notifications", icon: Bell, component: "notifications", description: "Smart notification center", shortcut: "⌘+N", features: ["ai"] },
      { id: "reports", label: "Reports", icon: FileText, component: "reports", description: "Automated report generation", shortcut: "⌘+R", features: ["workflows"] },
      { id: "version-history", label: "Version History", icon: GitBranch, component: "version-history", description: "Configuration change tracking", shortcut: "⌘+V" },
    ]
  },
  operations: {
    label: "Operations & Maintenance",
    icon: Tool,
    category: "operations",
    items: [
      { id: "backup-restore", label: "Backup & Restore", icon: Archive, component: "backup-restore", description: "Automated backup management", shortcut: "⌘+B", features: ["workflows"] },
      { id: "bulk-actions", label: "Bulk Operations", icon: Layers, component: "bulk-actions", description: "Mass operations with workflows", shortcut: "⌘+Y", features: ["workflows"] },
      { id: "integrations", label: "Integrations", icon: Boxes, component: "integrations", description: "Third-party integrations", shortcut: "⌘+I" },
      { id: "catalog", label: "Data Catalog", icon: Package, component: "catalog", description: "Enterprise data catalog", shortcut: "⌘+Shift+D", features: ["ai", "analytics"] },
    ]
  }
}

// ============================================================================
// ENHANCED LAYOUT CONFIGURATIONS
// ============================================================================

const enterpriseLayoutConfigurations = {
  standard: { 
    name: "Standard", 
    icon: Layout, 
    panels: [{ id: "main", size: 100 }],
    description: "Single panel layout"
  },
  split: { 
    name: "Split View", 
    icon: SplitSquareHorizontal, 
    panels: [{ id: "main", size: 70 }, { id: "secondary", size: 30 }],
    description: "Two panel horizontal split"
  },
  dashboard: { 
    name: "Dashboard", 
    icon: BarChart3, 
    panels: [{ id: "overview", size: 40 }, { id: "details", size: 35 }, { id: "metrics", size: 25 }],
    description: "Multi-panel dashboard layout"
  },
  analysis: { 
    name: "Analysis", 
    icon: LineChart, 
    panels: [{ id: "data", size: 50 }, { id: "analytics", size: 30 }, { id: "insights", size: 20 }],
    description: "Analytics-focused layout"
  },
  collaboration: {
    name: "Collaboration",
    icon: Users,
    panels: [{ id: "main", size: 60 }, { id: "chat", size: 20 }, { id: "activity", size: 20 }],
    description: "Collaboration-optimized layout"
  },
  monitoring: {
    name: "Monitoring",
    icon: Monitor,
    panels: [{ id: "metrics", size: 70 }, { id: "alerts", size: 30 }],
    description: "Real-time monitoring layout"
  }
}

// ============================================================================
// ENHANCED DATA SOURCES APP COMPONENT
// ============================================================================

interface EnhancedDataSourcesAppProps {
  className?: string
  initialConfig?: any
}

function EnhancedDataSourcesAppContent({ className, initialConfig }: EnhancedDataSourcesAppProps) {
  // ========================================================================
  // ENTERPRISE CONTEXT AND HOOKS
  // ========================================================================
  
  const enterprise = useEnterpriseContext()
  const mainFeatures = useEnterpriseFeatures({
    componentName: 'data-sources-app',
    enableAnalytics: true,
    enableCollaboration: true,
    enableWorkflows: true,
    enableRealTimeUpdates: true,
    enableNotifications: true
  })

  // ========================================================================
  // CORE STATE MANAGEMENT
  // ========================================================================
  
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [activeView, setActiveView] = useState("enterprise-dashboard")
  const [layout, setLayout] = useState<keyof typeof enterpriseLayoutConfigurations>("dashboard")
  const [panels, setPanels] = useState(enterpriseLayoutConfigurations.dashboard.panels)
  
  // ========================================================================
  // UI STATE WITH ENTERPRISE FEATURES
  // ========================================================================
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [expandedPanels, setExpandedPanels] = useState(new Set<string>())
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filters, setFilters] = useState({})
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  
  // ========================================================================
  // ENTERPRISE FEATURES STATE
  // ========================================================================
  
  const [enterpriseFeatures, setEnterpriseFeatures] = useState({
    aiInsightsEnabled: true,
    realTimeCollaboration: false,
    workflowAutomation: true,
    predictiveAnalytics: true,
    advancedMonitoring: true,
    complianceTracking: true
  })
  
  const [notifications, setNotifications] = useState<any[]>([])
  const [systemAlerts, setSystemAlerts] = useState<any[]>([])
  const [collaborationSessions, setCollaborationSessions] = useState<any[]>([])
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([])
  
  // ========================================================================
  // MODAL STATES
  // ========================================================================
  
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
    test: false,
    bulk: false,
    settings: false,
    help: false,
    analytics: false,
    collaboration: false,
    workflow: false,
    aiInsights: false
  })

  // ========================================================================
  // COMPREHENSIVE BACKEND DATA INTEGRATION - ALL ENTERPRISE APIs
  // ========================================================================
  
  // Core Data Sources Integration
  const { data: dataSources, isLoading: dataSourcesLoading, error: dataSourcesError, refetch: refetchDataSources } = useDataSourcesQuery({
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  })
  const { data: user, isLoading: userLoading } = useUserQuery()
  const { data: userNotifications } = useNotificationsQuery()
  const { data: workspace } = useWorkspaceQuery()
  const { data: metrics } = useDataSourceMetricsQuery(selectedDataSource?.id)
  
  // Core data source backend integrations
  const { data: dataSourceHealth } = useDataSourceHealthQuery(selectedDataSource?.id)
  const { data: connectionPoolStats } = useConnectionPoolStatsQuery(selectedDataSource?.id)
  const { data: discoveryHistory } = useDiscoveryHistoryQuery(selectedDataSource?.id)
  const { data: scanResults } = useScanResultsQuery(selectedDataSource?.id)
  const { data: qualityMetrics } = useQualityMetricsQuery(selectedDataSource?.id)
  const { data: growthMetrics } = useGrowthMetricsQuery(selectedDataSource?.id)
  const { data: schemaDiscoveryData } = useSchemaDiscoveryQuery(selectedDataSource?.id)
  const { data: dataLineage } = useDataLineageQuery(selectedDataSource?.id)
  const { data: backupStatus } = useBackupStatusQuery(selectedDataSource?.id)
  const { data: scheduledTasks } = useScheduledTasksQuery()
  const { data: auditLogs } = useAuditLogsQuery()
  const { data: userPermissions } = useUserPermissionsQuery()
  const { data: dataCatalog } = useDataCatalogQuery()

  // =====================================================================================
  // NEW ENTERPRISE APIs - REAL BACKEND INTEGRATION (NO MOCK DATA)
  // =====================================================================================
  
  // COLLABORATION APIs
  const { data: collaborationWorkspaces } = useCollaborationWorkspacesQuery()
  const { data: activeCollaborationSessions } = useActiveCollaborationSessionsQuery()
  const { data: sharedDocuments } = useSharedDocumentsQuery(
    selectedDataSource?.id?.toString() || '', 
    { document_type: 'all' }
  )
  const { data: documentComments } = useDocumentCommentsQuery('')
  const { data: workspaceActivity } = useWorkspaceActivityQuery(workspace?.id?.toString() || '', 7)
  
  // WORKFLOW APIs
  const { data: workflowDefinitions } = useWorkflowDefinitionsQuery()
  const { data: workflowExecutions } = useWorkflowExecutionsQuery({ days: 7 })
  const { data: pendingApprovals } = usePendingApprovalsQuery()
  const { data: workflowTemplates } = useWorkflowTemplatesQuery()
  const { data: bulkOperationStatus } = useBulkOperationStatusQuery('')
  
  // ENHANCED PERFORMANCE APIs
  const { data: systemHealth } = useSystemHealthQuery(true) // Enhanced with detailed metrics
  const { data: enhancedPerformanceMetrics } = useEnhancedPerformanceMetricsQuery(
    selectedDataSource?.id || 0,
    { time_range: '24h', metric_types: ['cpu', 'memory', 'io', 'network'] }
  )
  const { data: performanceAlerts } = usePerformanceAlertsQuery({ severity: 'all', days: 7 })
  const { data: performanceTrends } = usePerformanceTrendsQuery(selectedDataSource?.id, '30d')
  const { data: optimizationRecommendations } = useOptimizationRecommendationsQuery(selectedDataSource?.id)
  const { data: performanceSummaryReport } = usePerformanceSummaryReportQuery({ time_range: '7d' })
  const { data: performanceThresholds } = usePerformanceThresholdsQuery(selectedDataSource?.id)
  
  // ENHANCED SECURITY APIs
  const { data: enhancedSecurityAudit } = useEnhancedSecurityAuditQuery(
    selectedDataSource?.id || 0,
    { include_vulnerabilities: true, include_compliance: true }
  )
  const { data: vulnerabilityAssessments } = useVulnerabilityAssessmentsQuery({ severity: 'all' })
  const { data: securityIncidents } = useSecurityIncidentsQuery({ days: 30 })
  const { data: complianceChecks } = useComplianceChecksQuery()
  const { data: threatDetection } = useThreatDetectionQuery({ days: 7 })
  const { data: securityAnalyticsDashboard } = useSecurityAnalyticsDashboardQuery('7d')
  const { data: riskAssessmentReport } = useRiskAssessmentReportQuery()
  const { data: securityScans } = useSecurityScansQuery({ days: 30 })

  // Mutation hooks for enterprise actions
  const createWorkspaceMutation = useCreateCollaborationWorkspaceMutation()
  const createDocumentMutation = useCreateSharedDocumentMutation()
  const addCommentMutation = useAddDocumentCommentMutation()
  const inviteToWorkspaceMutation = useInviteToWorkspaceMutation()
  const createWorkflowMutation = useCreateWorkflowDefinitionMutation()
  const executeWorkflowMutation = useExecuteWorkflowMutation()
  const approveRequestMutation = useApproveRequestMutation()
  const rejectRequestMutation = useRejectRequestMutation()
  const createBulkOperationMutation = useCreateBulkOperationMutation()
  const acknowledgeAlertMutation = useAcknowledgePerformanceAlertMutation()
  const resolveAlertMutation = useResolvePerformanceAlertMutation()
  const createThresholdMutation = useCreatePerformanceThresholdMutation()
  const startMonitoringMutation = useStartRealTimeMonitoringMutation()
  const stopMonitoringMutation = useStopRealTimeMonitoringMutation()
  const createSecurityScanMutation = useCreateEnhancedSecurityScanMutation()
  const remediateVulnerabilityMutation = useRemediateVulnerabilityMutation()
  const createIncidentMutation = useCreateSecurityIncidentMutation()
  const runComplianceCheckMutation = useRunComplianceCheckMutation()
  const startSecurityMonitoringMutation = useStartSecurityMonitoringMutation()

  // Consolidated loading state
  const loading = dataSourcesLoading || userLoading

  // Legacy enterprise context data for backward compatibility
  const { backendData } = enterprise || { backendData: { dataSources, loading } }

  // ========================================================================
  // REAL-TIME UPDATES AND EVENT HANDLING
  // ========================================================================
  
  useEffect(() => {
    if (enterprise.core?.eventBus) {
      const eventBus = enterprise.core.eventBus

      // Handle real-time data updates
      eventBus.subscribe('backend:data:updated', (event) => {
        // Refresh relevant data
        if (autoRefresh) {
          console.log('Real-time data update received:', event.payload)
        }
      })

      // Handle analytics insights
      eventBus.subscribe('analytics:insight:generated', (event) => {
        if (enterpriseFeatures.aiInsightsEnabled) {
          setNotifications(prev => [...prev.slice(-9), {
            id: Math.random().toString(36),
            type: 'insight',
            title: 'New AI Insight',
            message: event.payload.title,
            timestamp: new Date(),
            data: event.payload
          }])
        }
      })

      // Handle system alerts
      eventBus.subscribe('monitoring:alert:triggered', (event) => {
        setSystemAlerts(prev => [...prev.slice(-19), {
          id: Math.random().toString(36),
          type: event.payload.severity,
          message: event.payload.message,
          timestamp: new Date(),
          dataSourceId: event.payload.dataSourceId
        }])
      })

      // Handle collaboration events
      eventBus.subscribe('collaboration:session:started', (event) => {
        setCollaborationSessions(prev => [...prev, event.payload])
      })

      eventBus.subscribe('collaboration:session:ended', (event) => {
        setCollaborationSessions(prev => 
          prev.filter(session => session.id !== event.payload.sessionId)
        )
      })

      // Handle workflow events
      eventBus.subscribe('workflow:created', (event) => {
        setActiveWorkflows(prev => [...prev, event.payload])
      })

      eventBus.subscribe('workflow:completed', (event) => {
        setActiveWorkflows(prev => 
          prev.map(wf => wf.id === event.payload.workflowId 
            ? { ...wf, status: 'completed', completedAt: new Date() }
            : wf
          )
        )
      })
    }
  }, [enterprise.core, autoRefresh, enterpriseFeatures])

  // ========================================================================
  // AUTO-SELECTION LOGIC
  // ========================================================================
  
  useEffect(() => {
    if (dataSources && dataSources.length > 0 && !selectedDataSource) {
      const defaultDataSource = dataSources.find(ds => ds.status === 'active') || dataSources[0]
      setSelectedDataSource(defaultDataSource)
      enterprise.setSelectedDataSource(defaultDataSource)
    }
  }, [dataSources, selectedDataSource, enterprise])

  // ========================================================================
  // KEYBOARD SHORTCUTS WITH ENTERPRISE FEATURES
  // ========================================================================
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case "k":
            event.preventDefault()
            setCommandPaletteOpen(true)
            break
          case "d":
            event.preventDefault()
            setActiveView("enterprise-dashboard")
            break
          case "1":
            event.preventDefault()
            setActiveView("overview")
            break
          case "2":
            event.preventDefault()
            setActiveView("grid")
            break
          case "3":
            event.preventDefault()
            setActiveView("list")
            break
          case "a":
            if (event.shiftKey) {
              event.preventDefault()
              setModals(prev => ({ ...prev, analytics: true }))
            }
            break
          case "w":
            if (event.shiftKey) {
              event.preventDefault()
              setModals(prev => ({ ...prev, workflow: true }))
            } else {
              event.preventDefault()
              setActiveView("discovery-workspace")
            }
            break
          case "c":
            if (event.shiftKey) {
              event.preventDefault()
              setModals(prev => ({ ...prev, collaboration: true }))
            } else {
              event.preventDefault()
              setActiveView("compliance")
            }
            break
          case "r":
            event.preventDefault()
            // Trigger manual refresh
            window.location.reload()
            break
        }
      }

      // Handle escape key
      if (event.key === "Escape") {
        setCommandPaletteOpen(false)
        setModals(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any))
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // ========================================================================
  // COMPONENT SELECTION LOGIC
  // ========================================================================
  
  const renderActiveComponent = useCallback(() => {
    const commonProps = {
      selectedDataSource,
      onDataSourceSelect: setSelectedDataSource,
      searchQuery,
      filters,
      viewMode,
      enterprise: mainFeatures
    }

    switch (activeView) {
      // Enterprise components
      case "enterprise-dashboard":
        return <EnterpriseDashboard {...commonProps} />
      case "analytics-workbench":
        return <AnalyticsWorkbench {...commonProps} />
      case "collaboration-studio":
        return <CollaborationStudio {...commonProps} />
      case "workflow-designer":
        return <WorkflowDesigner {...commonProps} />

      // Core components
      case "overview":
        return <DataSourceDetails {...commonProps} />
      case "grid":
        return <DataSourceGrid {...commonProps} />
      case "list":
        return <DataSourceList {...commonProps} />
      case "details":
        return <DataSourceDetails {...commonProps} />

      // Monitoring components
      case "monitoring":
        return <DataSourceMonitoring {...commonProps} />
      case "dashboard-monitoring":
        return <DataSourceMonitoringDashboard {...commonProps} />
      case "performance":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourcePerformanceView {...commonProps} />
          </Suspense>
        )
      case "quality":
        return <DataSourceQualityAnalytics {...commonProps} />
      case "growth":
        return <DataSourceGrowthAnalytics {...commonProps} />

      // Discovery components
      case "discovery":
        return <DataSourceDiscovery {...commonProps} />
      case "discovery-workspace":
        return <DataDiscoveryWorkspace {...commonProps} />
      case "schema-discovery":
        return <SchemaDiscovery {...commonProps} />
      case "data-lineage":
        return <DataLineageGraph {...commonProps} />
      case "scan-results":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceScanResults {...commonProps} />
          </Suspense>
        )
      case "compliance":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceComplianceView {...commonProps} />
          </Suspense>
        )
      case "security":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceSecurityView {...commonProps} />
          </Suspense>
        )

      // Management components
      case "cloud-config":
        return <DataSourceCloudConfig {...commonProps} />
      case "access-control":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceAccessControl {...commonProps} />
          </Suspense>
        )
      case "tags":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceTagsManager {...commonProps} />
          </Suspense>
        )
      case "scheduler":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceScheduler {...commonProps} />
          </Suspense>
        )

      // Collaboration components
      case "workspaces":
        return <DataSourceWorkspaceManagement {...commonProps} />
      case "notifications":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceNotifications {...commonProps} />
          </Suspense>
        )
      case "reports":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceReports {...commonProps} />
          </Suspense>
        )
      case "version-history":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceVersionHistory {...commonProps} />
          </Suspense>
        )

      // Operations components
      case "backup-restore":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceBackupRestore {...commonProps} />
          </Suspense>
        )
      case "bulk-actions":
        return <DataSourceBulkActions {...commonProps} />
      case "integrations":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceIntegrations {...commonProps} />
          </Suspense>
        )
      case "catalog":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <DataSourceCatalog {...commonProps} />
          </Suspense>
        )

      default:
        return <EnterpriseDashboard {...commonProps} />
    }
  }, [activeView, selectedDataSource, searchQuery, filters, viewMode, mainFeatures])

  // ========================================================================
  // SYSTEM HEALTH MONITORING
  // ========================================================================
  
  const systemHealthScore = useMemo(() => {
    return getSystemHealthScore(systemHealth)
  }, [systemHealth])

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const getHealthIcon = (score: number) => {
    if (score >= 90) return CheckCircle
    if (score >= 70) return AlertTriangle
    if (score >= 50) return XCircle
    return AlertCircle
  }

  // ========================================================================
  // RENDER HELPER COMPONENTS
  // ========================================================================
  
  const ComponentLoader = () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500">Loading component...</p>
      </div>
    </div>
  )

  // ========================================================================
  // COMPREHENSIVE COMPONENT RENDERER WITH ALL ENTERPRISE FEATURES
  // ========================================================================
  
  const renderActiveComponent = () => {
    const commonProps = {
      dataSource: selectedDataSource,
      dataSources,
      onSelectDataSource: setSelectedDataSource,
      viewMode,
      onViewModeChange: setViewMode,
      selectedItems,
      onSelectionChange: setSelectedItems,
      filters,
      onFiltersChange: setFilters,
      
      // Real backend data props (NO MOCK DATA)
      health: dataSourceHealth,
      connectionPoolStats,
      discoveryHistory,
      scanResults,
      qualityMetrics,
      growthMetrics,
      schemaDiscoveryData,
      dataLineage,
      backupStatus,
      scheduledTasks,
      auditLogs,
      userPermissions,
      dataCatalog,
      metrics,
      workspace,
      user,
      
      // NEW ENTERPRISE DATA PROPS
      collaborationWorkspaces,
      activeCollaborationSessions,
      sharedDocuments,
      documentComments,
      workspaceActivity,
      workflowDefinitions,
      workflowExecutions,
      pendingApprovals,
      workflowTemplates,
      systemHealth,
      enhancedPerformanceMetrics,
      performanceAlerts,
      performanceTrends,
      optimizationRecommendations,
      performanceSummaryReport,
      performanceThresholds,
      enhancedSecurityAudit,
      vulnerabilityAssessments,
      securityIncidents,
      complianceChecks,
      threatDetection,
      securityAnalyticsDashboard,
      riskAssessmentReport,
      securityScans,
      
      // Enterprise mutation functions
      mutations: {
        createWorkspace: createWorkspaceMutation,
        createDocument: createDocumentMutation,
        addComment: addCommentMutation,
        inviteToWorkspace: inviteToWorkspaceMutation,
        createWorkflow: createWorkflowMutation,
        executeWorkflow: executeWorkflowMutation,
        approveRequest: approveRequestMutation,
        rejectRequest: rejectRequestMutation,
        createBulkOperation: createBulkOperationMutation,
        acknowledgeAlert: acknowledgeAlertMutation,
        resolveAlert: resolveAlertMutation,
        createThreshold: createThresholdMutation,
        startMonitoring: startMonitoringMutation,
        stopMonitoring: stopMonitoringMutation,
        createSecurityScan: createSecurityScanMutation,
        remediateVulnerability: remediateVulnerabilityMutation,
        createIncident: createIncidentMutation,
        runComplianceCheck: runComplianceCheckMutation,
        startSecurityMonitoring: startSecurityMonitoringMutation,
      }
    }

    try {
      switch (activeView) {
        // Enterprise Dashboard Components
        case "enterprise-dashboard":
          return <EnterpriseDashboard {...commonProps} />
        case "collaboration-studio":
          return <CollaborationStudio {...commonProps} />
        case "analytics-workbench":
          return <AnalyticsWorkbench {...commonProps} />
        case "workflow-designer":
          return <WorkflowDesigner {...commonProps} />
          
        // Core Management
        case "overview":
          return (
            <div className="space-y-6">
              <DataSourceDetails {...commonProps} />
              {selectedDataSource && <DataSourceMonitoringDashboard {...commonProps} />}
            </div>
          )
        case "grid":
          return <DataSourceGrid {...commonProps} />
        case "list":
          return <DataSourceList {...commonProps} />
        case "details":
          return selectedDataSource ? <DataSourceDetails {...commonProps} /> : <div className="p-6">Select a data source</div>
          
        // Monitoring & Analytics
        case "monitoring":
          return selectedDataSource ? <DataSourceMonitoring {...commonProps} /> : <div className="p-6">Select a data source</div>
        case "dashboard-monitoring":
          return <DataSourceMonitoringDashboard {...commonProps} />
        case "performance":
          return selectedDataSource ? (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourcePerformanceView {...commonProps} />
            </Suspense>
          ) : <div className="p-6">Select a data source</div>
        case "quality":
          return selectedDataSource ? <DataSourceQualityAnalytics {...commonProps} /> : <div className="p-6">Select a data source</div>
        case "growth":
          return selectedDataSource ? <DataSourceGrowthAnalytics {...commonProps} /> : <div className="p-6">Select a data source</div>
          
        // Discovery & Governance
        case "discovery":
          return selectedDataSource ? <DataSourceDiscovery {...commonProps} /> : <div className="p-6">Select a data source</div>
        case "discovery-workspace":
          return selectedDataSource ? <DataDiscoveryWorkspace {...commonProps} /> : <div className="p-6">Select a data source</div>
        case "schema-discovery":
          return selectedDataSource ? <SchemaDiscovery {...commonProps} /> : <div className="p-6">Select a data source</div>
        case "data-lineage":
          return selectedDataSource ? <DataLineageGraph {...commonProps} /> : <div className="p-6">Select a data source</div>
        case "scan-results":
          return selectedDataSource ? (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceScanResults {...commonProps} />
            </Suspense>
          ) : <div className="p-6">Select a data source</div>
        case "compliance":
          return selectedDataSource ? (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceComplianceView {...commonProps} />
            </Suspense>
          ) : <div className="p-6">Select a data source</div>
        case "security":
          return selectedDataSource ? (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceSecurityView {...commonProps} />
            </Suspense>
          ) : <div className="p-6">Select a data source</div>
          
        // Configuration & Management
        case "cloud-config":
          return selectedDataSource ? <DataSourceCloudConfig {...commonProps} /> : <div className="p-6">Select a data source</div>
        case "access-control":
          return selectedDataSource ? (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceAccessControl {...commonProps} />
            </Suspense>
          ) : <div className="p-6">Select a data source</div>
        case "tags":
          return (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceTagsManager {...commonProps} />
            </Suspense>
          )
        case "scheduler":
          return (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceScheduler {...commonProps} />
            </Suspense>
          )
          
        // Collaboration & Sharing
        case "workspaces":
          return selectedDataSource ? <DataSourceWorkspaceManagement {...commonProps} /> : <div className="p-6">Select a data source</div>
        case "notifications":
          return (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceNotifications {...commonProps} />
            </Suspense>
          )
        case "reports":
          return (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceReports {...commonProps} />
            </Suspense>
          )
        case "version-history":
          return selectedDataSource ? (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceVersionHistory {...commonProps} />
            </Suspense>
          ) : <div className="p-6">Select a data source</div>
          
        // Operations & Maintenance
        case "backup-restore":
          return selectedDataSource ? (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceBackupRestore {...commonProps} />
            </Suspense>
          ) : <div className="p-6">Select a data source</div>
        case "bulk-actions":
          return <DataSourceBulkActions {...commonProps} />
        case "integrations":
          return selectedDataSource ? (
            <Suspense fallback={<ComponentLoader />}>
              <DataSourceIntegrations {...commonProps} />
            </Suspense>
          ) : <div className="p-6">Select a data source</div>
          
        default:
          return (
            <div className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Component Not Found</h3>
              <p className="text-gray-500 mb-4">The component "{activeView}" could not be loaded.</p>
              <Button onClick={() => setActiveView("enterprise-dashboard")} variant="outline">
                Return to Dashboard
              </Button>
            </div>
          )
      }
    } catch (error) {
      console.error(`Error rendering component ${activeView}:`, error)
      return (
        <Alert className="m-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Component</AlertTitle>
          <AlertDescription>
            Failed to load component: {activeView}
            <br />
            <small className="text-gray-500">{error instanceof Error ? error.message : "Unknown error"}</small>
          </AlertDescription>
        </Alert>
      )
    }
  }

  const SystemHealthIndicator = () => {
    const HealthIcon = getHealthIcon(systemHealthScore)
    return (
      <div className="flex items-center space-x-2">
        <HealthIcon className={`h-4 w-4 ${getHealthColor(systemHealthScore)}`} />
        <span className={`text-sm font-medium ${getHealthColor(systemHealthScore)}`}>
          {systemHealthScore}%
        </span>
        <span className="text-xs text-gray-500">System Health</span>
      </div>
    )
  }

  const NotificationBadge = () => (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {notifications.length > 9 ? "9+" : notifications.length}
        </span>
      )}
    </div>
  )

  const CollaborationIndicator = () => (
    <div className="flex items-center space-x-2">
      <Users className="h-4 w-4" />
      <span className="text-sm">
        {collaborationSessions.length} {collaborationSessions.length === 1 ? 'session' : 'sessions'}
      </span>
    </div>
  )

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  
  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-background ${className}`}>
        
        {/* Enhanced Header with Enterprise Features */}
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-4">
            
            {/* Left: Logo and Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-lg">Data Sources</span>
                <Badge variant="secondary" className="text-xs">Enterprise</Badge>
              </div>
            </div>

            {/* Center: Search and Command Palette */}
            <div className="flex-1 flex justify-center px-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search data sources... (⌘K for commands)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setCommandPaletteOpen(true)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Right: Enterprise Features and User */}
            <div className="flex items-center space-x-3">
              
              {/* System Health */}
              <SystemHealthIndicator />
              
              {/* Collaboration Status */}
              {collaborationSessions.length > 0 && <CollaborationIndicator />}
              
              {/* Notifications */}
              <Button variant="ghost" size="icon">
                <NotificationBadge />
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Enterprise Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content with Resizable Panels */}
        <div className="flex h-[calc(100vh-4rem)]">
          
          {/* Enhanced Sidebar */}
          <aside className={`border-r bg-card transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                
                {Object.entries(enterpriseNavigationStructure).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="space-y-2">
                    {!sidebarCollapsed && (
                      <div className="flex items-center space-x-2 px-2">
                        <category.icon className="h-4 w-4 text-gray-500" />
                        <h3 className="text-sm font-medium text-gray-700">{category.label}</h3>
                        {category.category === 'analytics' && (
                          <Badge variant="outline" className="text-xs">AI</Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      {category.items.map((item) => (
                        <Tooltip key={item.id} delayDuration={sidebarCollapsed ? 0 : 1000}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={activeView === item.id ? "secondary" : "ghost"}
                              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
                              onClick={() => setActiveView(item.id)}
                            >
                              <item.icon className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-2'}`} />
                              {!sidebarCollapsed && (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-sm">{item.label}</span>
                                  <div className="flex items-center space-x-1">
                                    {item.premium && <Crown className="h-3 w-3 text-yellow-500" />}
                                    {item.features?.includes('ai') && <Brain className="h-3 w-3 text-purple-500" />}
                                    {item.features?.includes('realTime') && <Zap className="h-3 w-3 text-green-500" />}
                                  </div>
                                </div>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side={sidebarCollapsed ? "right" : "bottom"}>
                            <div className="space-y-1">
                              <p className="font-medium">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                              {item.shortcut && (
                                <p className="text-xs font-mono bg-gray-100 px-1 rounded">{item.shortcut}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
              
              {panels.map((panel, index) => (
                <React.Fragment key={panel.id}>
                  <ResizablePanel defaultSize={panel.size}>
                    <div className="h-full overflow-auto">
                      {index === 0 ? (
                        renderActiveComponent()
                      ) : (
                        <div className="p-4">
                          <h3 className="text-lg font-medium mb-4">Panel {index + 1}</h3>
                          {/* Additional panel content based on layout */}
                          {panel.id === 'metrics' && <div>Metrics Panel</div>}
                          {panel.id === 'activity' && <div>Activity Panel</div>}
                          {panel.id === 'chat' && <div>Chat Panel</div>}
                          {panel.id === 'alerts' && <div>Alerts Panel</div>}
                        </div>
                      )}
                    </div>
                  </ResizablePanel>
                  
                  {index < panels.length - 1 && <ResizableHandle />}
                </React.Fragment>
              ))}
              
            </ResizablePanelGroup>
          </main>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
          
          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setModals(prev => ({ ...prev, create: true }))}>
                <Database className="mr-2 h-4 w-4" />
                Add Data Source
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModals(prev => ({ ...prev, workflow: true }))}>
                <Workflow className="mr-2 h-4 w-4" />
                Create Workflow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModals(prev => ({ ...prev, collaboration: true }))}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Collaboration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* AI Insights */}
          {enterpriseFeatures.aiInsightsEnabled && (
            <Button
              size="icon"
              variant="outline"
              className="rounded-full h-10 w-10 shadow-lg"
              onClick={() => setModals(prev => ({ ...prev, aiInsights: true }))}
            >
              <Brain className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Modals */}
        {modals.create && (
          <DataSourceCreateModal
            open={modals.create}
            onOpenChange={(open) => setModals(prev => ({ ...prev, create: open }))}
          />
        )}

        {modals.edit && selectedDataSource && (
          <DataSourceEditModal
            open={modals.edit}
            onOpenChange={(open) => setModals(prev => ({ ...prev, edit: open }))}
            dataSource={selectedDataSource}
          />
        )}

        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </div>
    </TooltipProvider>
  )
}

// ============================================================================
// MAIN EXPORT WITH ENTERPRISE PROVIDER
// ============================================================================

export function EnhancedDataSourcesApp({ className, initialConfig }: EnhancedDataSourcesAppProps) {
  const queryClient = createEnterpriseQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <EnterpriseIntegrationProvider 
        queryClient={queryClient}
        initialConfig={initialConfig}
      >
        <EnhancedDataSourcesAppContent 
          className={className} 
          initialConfig={initialConfig}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </EnterpriseIntegrationProvider>
    </QueryClientProvider>
  )
}

export default EnhancedDataSourcesApp