"use client"

import { useState, useEffect, Suspense, useCallback, useMemo, createContext, useContext } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
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
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  PanelLeftOpen,
  PanelRightOpen,
  SplitSquareHorizontal,
  Layout,
  Command,
  Cpu,
  HardDrive,
  Network,
  Gauge,
  LineChart,
  PieChart,
  AreaChart,
  TestTube,
  Beaker,
  Microscope,
  Cog,
  Wrench,
  Tool,
  Package,
  Server,
  CircuitBoard,
  Boxes,
  Archive,
  FolderOpen,
  Folder,
  File,
  Code2,
  Terminal,
  Bug,
  Sparkles,
  Rocket,
  Flame,
  Lightbulb,
  Brain,
  Bot,
  Radar,
  Crosshair,
  Focus,
  Scan,
  SearchX,
  ScanLine,
  Binary,
  Hash,
  Type,
  Key,
  ShieldCheck,
  UserCheck,
  Crown,
  Badge as BadgeIcon,
  Award,
  Medal,
  Trophy,
  Flag,
  Bookmark,
  Heart,
  ThumbsUp,
  Smile,
  Frown,
  AlertCircle,
  XCircle,
  Table as TableIcon,
  Columns,
} from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
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
  Command as CommandComponent,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Import ALL data-sources components (Main Directory)
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
import { DataSourceComplianceView } from "./data-source-compliance-view"
import { DataSourceSecurityView } from "./data-source-security-view"
import { DataSourcePerformanceView } from "./data-source-performance-view"
import { DataSourceScanResults } from "./data-source-scan-results"
import { DataSourceTagsManager } from "./data-source-tags-manager"
import { DataSourceVersionHistory } from "./data-source-version-history"
import { DataSourceBackupRestore } from "./data-source-backup-restore"
import { DataSourceAccessControl } from "./data-source-access-control"
import { DataSourceNotifications } from "./data-source-notifications"
import { DataSourceReports } from "./data-source-reports"
import { DataSourceScheduler } from "./data-source-scheduler"

// Import Data Discovery Components (Subdirectory)
import { DataDiscoveryWorkspace } from "./data-discovery/data-discovery-workspace"
import { DataLineageGraph } from "./data-discovery/data-lineage-graph"
import { SchemaDiscovery } from "./data-discovery/schema-discovery"

// Types and services with full backend integration
import { DataSource, ViewMode, PanelLayout, WorkspaceContext as WorkspaceContextType } from "./types"
import { 
  useDataSourcesQuery, 
  useUserQuery, 
  useNotificationsQuery,
  useWorkspaceQuery,
  useDataSourceMetricsQuery,
  useSystemHealthQuery,
  useDataDiscoveryQuery,
  useLineageDataQuery,
  useSchemaAnalysisQuery,
  useComplianceDataQuery,
  useSecurityAssessmentQuery,
  usePerformanceAnalyticsQuery,
  useScanResultsQuery,
  useTagsQuery,
  useVersionHistoryQuery,
  useBackupStatusQuery,
  useAccessControlQuery,
  useReportsQuery,
  useSchedulerJobsQuery,
} from "./services/apis"

// Create a new QueryClient instance with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
      onError: (error) => {
        console.error('Mutation error:', error)
        // Global error handling can be added here
      },
    },
  },
})

// Advanced workspace context for cross-component communication
const WorkspaceContext = createContext<WorkspaceContextType>({
  selectedDataSource: null,
  setSelectedDataSource: () => {},
  activeView: "overview",
  setActiveView: () => {},
  layout: "standard",
  setLayout: () => {},
  panels: [],
  setPanels: () => {},
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  selectedItems: [],
  setSelectedItems: () => {},
  filters: {},
  setFilters: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  viewMode: "grid",
  setViewMode: () => {},
  expandedPanels: new Set(),
  togglePanel: () => {},
  quickActions: [],
  addQuickAction: () => {},
  removeQuickAction: () => {},
})

// Enhanced navigation structure with ALL components including data-discovery
const navigationStructure = {
  core: {
    label: "Core Management",
    icon: Database,
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: Eye,
        component: "overview",
        description: "Comprehensive data sources overview",
        shortcut: "⌘+1",
      },
      {
        id: "grid",
        label: "Grid View", 
        icon: Grid,
        component: "grid",
        description: "Visual grid layout of data sources",
        shortcut: "⌘+2",
      },
      {
        id: "list", 
        label: "List View",
        icon: List,
        component: "list", 
        description: "Detailed list view with filters",
        shortcut: "⌘+3",
      },
      {
        id: "details",
        label: "Details",
        icon: FileText,
        component: "details",
        description: "In-depth data source analysis",
        shortcut: "⌘+4",
      },
    ]
  },
  monitoring: {
    label: "Monitoring & Analytics",
    icon: Activity,
    items: [
      {
        id: "monitoring",
        label: "Real-time Monitoring",
        icon: Monitor,
        component: "monitoring",
        description: "Live health and performance metrics",
        shortcut: "⌘+M",
      },
      {
        id: "dashboard",
        label: "Monitoring Dashboard",
        icon: BarChart3,
        component: "dashboard",
        description: "Comprehensive monitoring dashboards",
        shortcut: "⌘+D",
      },
      {
        id: "performance",
        label: "Performance Analytics",
        icon: Zap,
        component: "performance",
        description: "Performance insights and optimization",
        shortcut: "⌘+P",
      },
      {
        id: "quality",
        label: "Quality Analytics",
        icon: Shield,
        component: "quality",
        description: "Data quality metrics and scoring",
        shortcut: "⌘+Q",
      },
      {
        id: "growth",
        label: "Growth Analytics",
        icon: TrendingUp,
        component: "growth",
        description: "Growth patterns and predictions",
        shortcut: "⌘+G",
      },
    ]
  },
  discovery: {
    label: "Discovery & Governance",
    icon: Search,
    items: [
      {
        id: "discovery",
        label: "Data Discovery",
        icon: Scan,
        component: "discovery",
        description: "Automated data asset discovery",
        shortcut: "⌘+F",
      },
      {
        id: "discovery-workspace",
        label: "Discovery Workspace",
        icon: Workflow,
        component: "discovery-workspace",
        description: "Interactive data discovery workspace",
        shortcut: "⌘+W",
      },
      {
        id: "lineage-graph",
        label: "Data Lineage",
        icon: GitBranch,
        component: "lineage-graph",
        description: "Visual data lineage and dependencies",
        shortcut: "⌘+L",
      },
      {
        id: "schema-discovery",
        label: "Schema Discovery",
        icon: TableIcon,
        component: "schema-discovery",
        description: "Schema analysis and discovery",
        shortcut: "⌘+H",
      },
      {
        id: "scan-results",
        label: "Scan Results",
        icon: ScanLine,
        component: "scan-results",
        description: "Detailed scan results and findings",
        shortcut: "⌘+S",
      },
      {
        id: "compliance",
        label: "Compliance",
        icon: ShieldCheck,
        component: "compliance",
        description: "Compliance monitoring and reporting",
        shortcut: "⌘+C",
      },
      {
        id: "security",
        label: "Security",
        icon: Lock,
        component: "security",
        description: "Security assessment and controls",
        shortcut: "⌘+E",
      },
    ]
  },
  management: {
    label: "Configuration & Management",
    icon: Settings,
    items: [
      {
        id: "cloud-config",
        label: "Cloud Configuration",
        icon: Cloud,
        component: "cloud-config",
        description: "Multi-cloud provider settings",
        shortcut: "⌘+K",
      },
      {
        id: "access-control",
        label: "Access Control",
        icon: UserCheck,
        component: "access-control",
        description: "User permissions and roles",
        shortcut: "⌘+A",
      },
      {
        id: "tags",
        label: "Tags Manager",
        icon: Hash,
        component: "tags",
        description: "Organize with tags and labels",
        shortcut: "⌘+T",
      },
      {
        id: "scheduler",
        label: "Task Scheduler",
        icon: Calendar,
        component: "scheduler",
        description: "Automated tasks and scheduling",
        shortcut: "⌘+J",
      },
    ]
  },
  collaboration: {
    label: "Collaboration & Sharing",
    icon: Users,
    items: [
      {
        id: "workspaces",
        label: "Workspaces",
        icon: Building,
        component: "workspaces",
        description: "Team collaboration spaces",
        shortcut: "⌘+U",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        component: "notifications",
        description: "Alerts and notification center",
        shortcut: "⌘+N",
      },
      {
        id: "reports",
        label: "Reports",
        icon: FileText,
        component: "reports",
        description: "Generated reports and exports",
        shortcut: "⌘+R",
      },
      {
        id: "version-history",
        label: "Version History",
        icon: GitBranch,
        component: "version-history",
        description: "Configuration change history",
        shortcut: "⌘+V",
      },
    ]
  },
  operations: {
    label: "Operations & Maintenance",
    icon: Tool,
    items: [
      {
        id: "backup-restore",
        label: "Backup & Restore",
        icon: Archive,
        component: "backup-restore",
        description: "Data backup and recovery",
        shortcut: "⌘+B",
      },
      {
        id: "bulk-actions",
        label: "Bulk Operations",
        icon: Layers,
        component: "bulk-actions",
        description: "Mass operations on data sources",
        shortcut: "⌘+O",
      },
    ]
  }
}

// Advanced layout configurations
const layoutConfigurations = {
  standard: { 
    name: "Standard", 
    icon: Layout, 
    panels: [{ id: "main", size: 100 }] 
  },
  split: { 
    name: "Split View", 
    icon: SplitSquareHorizontal, 
    panels: [{ id: "main", size: 70 }, { id: "secondary", size: 30 }] 
  },
  dashboard: { 
    name: "Dashboard", 
    icon: BarChart3, 
    panels: [{ id: "overview", size: 40 }, { id: "details", size: 35 }, { id: "metrics", size: 25 }] 
  },
  analysis: { 
    name: "Analysis", 
    icon: LineChart, 
    panels: [{ id: "data", size: 50 }, { id: "analytics", size: 30 }, { id: "insights", size: 20 }] 
  }
}

interface DataSourcesAppProps {
  className?: string
}

// Advanced hook for cross-component communication
function useWorkspaceContext() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspaceContext must be used within WorkspaceContext.Provider")
  }
  return context
}

function DataSourcesAppContent({ className }: DataSourcesAppProps) {
  // Core state management
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [activeView, setActiveView] = useState("overview")
  const [layout, setLayout] = useState<keyof typeof layoutConfigurations>("standard")
  const [panels, setPanels] = useState([{ id: "main", size: 100, component: "overview" }])
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [expandedPanels, setExpandedPanels] = useState(new Set<string>())
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  
  // Advanced features
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filters, setFilters] = useState({})
  const [notifications, setNotifications] = useState<any[]>([])
  const [quickActions, setQuickActions] = useState<any[]>([])
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  
  // Modal states
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
    test: false,
    bulk: false,
    settings: false,
    help: false,
    discoveryWorkspace: false,
  })

  // Enhanced data fetching with full backend integration
  const { data: dataSources, isLoading: dataSourcesLoading, error: dataSourcesError } = useDataSourcesQuery({
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  })
  const { data: user, isLoading: userLoading } = useUserQuery()
  const { data: userNotifications } = useNotificationsQuery()
  const { data: workspace } = useWorkspaceQuery()
  const { data: systemHealth } = useSystemHealthQuery()
  const { data: metrics } = useDataSourceMetricsQuery(selectedDataSource?.id)
  
  // Data Discovery specific queries
  const { data: discoveryData } = useDataDiscoveryQuery(selectedDataSource?.id)
  const { data: lineageData } = useLineageDataQuery(selectedDataSource?.id)
  const { data: schemaData } = useSchemaAnalysisQuery(selectedDataSource?.id)
  const { data: complianceData } = useComplianceDataQuery(selectedDataSource?.id)
  const { data: securityData } = useSecurityAssessmentQuery(selectedDataSource?.id)
  const { data: performanceData } = usePerformanceAnalyticsQuery(selectedDataSource?.id)
  const { data: scanResults } = useScanResultsQuery(selectedDataSource?.id)
  const { data: tagsData } = useTagsQuery(selectedDataSource?.id)
  const { data: versionHistory } = useVersionHistoryQuery(selectedDataSource?.id)
  const { data: backupStatus } = useBackupStatusQuery(selectedDataSource?.id)
  const { data: accessControlData } = useAccessControlQuery(selectedDataSource?.id)
  const { data: reportsData } = useReportsQuery(selectedDataSource?.id)
  const { data: schedulerJobs } = useSchedulerJobsQuery(selectedDataSource?.id)

  // Advanced effects
  useEffect(() => {
    if (dataSources && dataSources.length > 0 && !selectedDataSource) {
      setSelectedDataSource(dataSources[0])
    }
  }, [dataSources, selectedDataSource])

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case "k":
            event.preventDefault()
            setCommandPaletteOpen(true)
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
          case "4":
            event.preventDefault()
            setActiveView("details")
            break
          case "m":
            event.preventDefault()
            setActiveView("monitoring")
            break
          case "d":
            event.preventDefault()
            setActiveView("dashboard")
            break
          case "f":
            event.preventDefault()
            setActiveView("discovery")
            break
          case "w":
            event.preventDefault()
            setActiveView("discovery-workspace")
            break
          case "l":
            event.preventDefault()
            setActiveView("lineage-graph")
            break
          case "h":
            event.preventDefault()
            setActiveView("schema-discovery")
            break
          case "s":
            event.preventDefault()
            setActiveView("scan-results")
            break
          case "c":
            event.preventDefault()
            setActiveView("compliance")
            break
          case "e":
            event.preventDefault()
            setActiveView("security")
            break
          // Add more shortcuts for all components
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Enhanced workspace context value
  const workspaceContextValue = useMemo(() => ({
    selectedDataSource,
    setSelectedDataSource,
    activeView,
    setActiveView,
    layout,
    setLayout,
    panels,
    setPanels,
    notifications,
    addNotification: (notification: any) => setNotifications(prev => [...prev, notification]),
    removeNotification: (id: string) => setNotifications(prev => prev.filter(n => n.id !== id)),
    selectedItems,
    setSelectedItems,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    expandedPanels,
    togglePanel: (id: string) => {
      setExpandedPanels(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    },
    quickActions,
    addQuickAction: (action: any) => setQuickActions(prev => [...prev, action]),
    removeQuickAction: (id: string) => setQuickActions(prev => prev.filter(a => a.id !== id)),
  }), [
    selectedDataSource, activeView, layout, panels, notifications, selectedItems,
    filters, searchQuery, viewMode, expandedPanels, quickActions
  ])

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "text-green-500"
      case "error": return "text-red-500"
      case "warning": return "text-yellow-500"
      default: return "text-gray-500"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "connected": return "default"
      case "error": return "destructive"
      case "warning": return "secondary"
      default: return "outline"
    }
  }

  const openModal = (modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: true }))
  }

  const closeModal = (modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: false }))
  }

  // Enhanced component renderer with ALL components including data-discovery
  const renderComponent = (componentId: string, panelId?: string) => {
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
    }

    try {
      switch (componentId) {
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
          return selectedDataSource ? <DataSourceDetails {...commonProps} /> : <div>Select a data source</div>
        case "monitoring":
          return selectedDataSource ? <DataSourceMonitoring {...commonProps} /> : <div>Select a data source</div>
        case "dashboard":
          return <DataSourceMonitoringDashboard {...commonProps} />
        case "performance":
          return selectedDataSource ? <DataSourcePerformanceView {...commonProps} data={performanceData} /> : <div>Select a data source</div>
        case "quality":
          return selectedDataSource ? <DataSourceQualityAnalytics {...commonProps} /> : <div>Select a data source</div>
        case "growth":
          return selectedDataSource ? <DataSourceGrowthAnalytics {...commonProps} /> : <div>Select a data source</div>
        case "discovery":
          return selectedDataSource ? <DataSourceDiscovery {...commonProps} data={discoveryData} /> : <div>Select a data source</div>
        
        // Data Discovery Components
        case "discovery-workspace":
          return selectedDataSource ? (
            <DataDiscoveryWorkspace 
              {...commonProps} 
              isOpen={modals.discoveryWorkspace}
              onClose={() => closeModal("discoveryWorkspace")}
              discoveryData={discoveryData}
              lineageData={lineageData}
              schemaData={schemaData}
            />
          ) : <div>Select a data source</div>
        case "lineage-graph":
          return selectedDataSource ? (
            <DataLineageGraph 
              {...commonProps}
              lineageData={lineageData}
              onNodeClick={(nodeId) => console.log('Node clicked:', nodeId)}
              onEdgeClick={(edgeId) => console.log('Edge clicked:', edgeId)}
            />
          ) : <div>Select a data source</div>
        case "schema-discovery":
          return selectedDataSource ? (
            <SchemaDiscovery 
              {...commonProps}
              schemaData={schemaData}
              onSchemaSelect={(schema) => console.log('Schema selected:', schema)}
              onTableSelect={(table) => console.log('Table selected:', table)}
            />
          ) : <div>Select a data source</div>
        
        case "scan-results":
          return selectedDataSource ? <DataSourceScanResults {...commonProps} data={scanResults} /> : <div>Select a data source</div>
        case "compliance":
          return selectedDataSource ? <DataSourceComplianceView {...commonProps} data={complianceData} /> : <div>Select a data source</div>
        case "security":
          return selectedDataSource ? <DataSourceSecurityView {...commonProps} data={securityData} /> : <div>Select a data source</div>
        case "cloud-config":
          return selectedDataSource ? <DataSourceCloudConfig {...commonProps} /> : <div>Select a data source</div>
        case "access-control":
          return selectedDataSource ? <DataSourceAccessControl {...commonProps} data={accessControlData} /> : <div>Select a data source</div>
        case "tags":
          return <DataSourceTagsManager {...commonProps} data={tagsData} />
        case "scheduler":
          return <DataSourceScheduler {...commonProps} jobs={schedulerJobs} />
        case "workspaces":
          return selectedDataSource ? <DataSourceWorkspaceManagement {...commonProps} /> : <div>Select a data source</div>
        case "notifications":
          return <DataSourceNotifications {...commonProps} />
        case "reports":
          return <DataSourceReports {...commonProps} data={reportsData} />
        case "version-history":
          return selectedDataSource ? <DataSourceVersionHistory {...commonProps} data={versionHistory} /> : <div>Select a data source</div>
        case "backup-restore":
          return selectedDataSource ? <DataSourceBackupRestore {...commonProps} status={backupStatus} /> : <div>Select a data source</div>
        case "bulk-actions":
          return <DataSourceBulkActions {...commonProps} />
        default:
          return (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Component Not Found</AlertTitle>
              <AlertDescription>
                The component "{componentId}" could not be loaded. Please check the component name or contact support.
              </AlertDescription>
            </Alert>
          )
      }
    } catch (error) {
      console.error(`Error rendering component ${componentId}:`, error)
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Component Error</AlertTitle>
          <AlertDescription>
            Failed to load component: {componentId}. Error: {error.message}
          </AlertDescription>
        </Alert>
      )
    }
  }

  // Advanced sidebar component
  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "" : "border-r"}`}>
      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {(!sidebarCollapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              {workspace && (
                <Badge variant="outline" className="text-xs mt-1">
                  {workspace.name}
                </Badge>
              )}
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openModal("settings")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Actions */}
      {(!sidebarCollapsed || mobile) && (
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => openModal("create")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCommandPaletteOpen(true)}>
              <Command className="h-4 w-4 mr-2" />
              Commands
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Navigation with all components */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(navigationStructure).map(([categoryKey, category]) => (
            <Collapsible key={categoryKey} defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  {(!sidebarCollapsed || mobile) && (
                    <span className="font-medium text-sm">{category.label}</span>
                  )}
                </div>
                {(!sidebarCollapsed || mobile) && <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 ml-6">
                {category.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id
                  return (
                    <TooltipProvider key={item.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={`w-full justify-start text-sm ${sidebarCollapsed && !mobile ? "px-2" : ""}`}
                            onClick={() => {
                              setActiveView(item.id)
                              if (mobile) setMobileMenuOpen(false)
                            }}
                          >
                            <Icon className="h-4 w-4" />
                            {(!sidebarCollapsed || mobile) && (
                              <span className="ml-2 truncate">{item.label}</span>
                            )}
                            {(!sidebarCollapsed || mobile) && item.shortcut && (
                              <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                                {item.shortcut}
                              </kbd>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.description}</p>
                          {item.shortcut && <p className="text-xs text-muted-foreground">{item.shortcut}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Data Sources List */}
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            {(!sidebarCollapsed || mobile) && (
              <h3 className="font-medium text-sm">Data Sources</h3>
            )}
            <Button variant="ghost" size="sm" onClick={() => openModal("create")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {dataSourcesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))
            ) : (
              dataSources?.map((dataSource) => (
                <HoverCard key={dataSource.id}>
                  <HoverCardTrigger asChild>
                    <Button
                      variant={selectedDataSource?.id === dataSource.id ? "secondary" : "ghost"}
                      className={`w-full justify-start ${sidebarCollapsed && !mobile ? "px-2" : ""}`}
                      onClick={() => {
                        setSelectedDataSource(dataSource)
                        if (mobile) setMobileMenuOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Database className="h-4 w-4 flex-shrink-0" />
                        {(!sidebarCollapsed || mobile) && (
                          <div className="flex-1 min-w-0 text-left">
                            <p className="truncate font-medium">{dataSource.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge
                                variant={getStatusBadgeVariant(dataSource.status)}
                                className="text-xs"
                              >
                                {dataSource.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {dataSource.type}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{dataSource.name}</h4>
                      <p className="text-sm text-muted-foreground">{dataSource.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Type: {dataSource.type}</div>
                        <div>Status: {dataSource.status}</div>
                        <div>Host: {dataSource.host}</div>
                        <div>Port: {dataSource.port}</div>
                      </div>
                      {metrics && (
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground">Health Score</div>
                          <Progress value={metrics.health_score} className="h-2" />
                        </div>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      {/* System Health */}
      {systemHealth && (!sidebarCollapsed || mobile) && (
        <div className="p-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>System Health</span>
              <Badge variant={systemHealth.status === "healthy" ? "default" : "destructive"}>
                {systemHealth.status}
              </Badge>
            </div>
            <Progress value={systemHealth.score} className="h-1" />
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      {!mobile && (
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
      )}
    </div>
  )

  // Enhanced Command Palette with all components
  const CommandPalette = () => (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <CommandComponent>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(navigationStructure).map(([categoryKey, category]) => (
              <CommandGroup key={categoryKey} heading={category.label}>
                {category.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      setActiveView(item.id)
                      setCommandPaletteOpen(false)
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {item.shortcut && (
                      <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                        {item.shortcut}
                      </kbd>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => { openModal("create"); setCommandPaletteOpen(false) }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Data Source
              </CommandItem>
              <CommandItem onSelect={() => { openModal("bulk"); setCommandPaletteOpen(false) }}>
                <Layers className="mr-2 h-4 w-4" />
                Bulk Actions
              </CommandItem>
              <CommandItem onSelect={() => { openModal("discoveryWorkspace"); setCommandPaletteOpen(false) }}>
                <Workflow className="mr-2 h-4 w-4" />
                Open Discovery Workspace
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandComponent>
      </DialogContent>
    </Dialog>
  )

  return (
    <WorkspaceContext.Provider value={workspaceContextValue}>
      <TooltipProvider>
        <div className={`flex h-screen bg-background ${className}`}>
          {/* Desktop Sidebar */}
          <div className={`hidden md:flex flex-col ${sidebarCollapsed ? "w-16" : "w-80"} transition-all duration-300`}>
            <Sidebar />
          </div>

          {/* Mobile Sidebar */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-80 p-0">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center px-4 gap-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>

                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search data sources, metrics, or insights... (⌘K)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={() => setCommandPaletteOpen(true)}
                      className="pl-10 cursor-pointer"
                      readOnly
                    />
                  </div>
                </div>

                {/* Layout Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {React.createElement(layoutConfigurations[layout].icon, { className: "h-4 w-4 mr-2" })}
                      {layoutConfigurations[layout].name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Layout</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={layout} onValueChange={(value) => setLayout(value as keyof typeof layoutConfigurations)}>
                      {Object.entries(layoutConfigurations).map(([key, config]) => (
                        <DropdownMenuRadioItem key={key} value={key}>
                          <config.icon className="h-4 w-4 mr-2" />
                          {config.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  
                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-4 w-4" />
                        {userNotifications && userNotifications.length > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                            {userNotifications.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <Separator />
                      {userNotifications && userNotifications.length > 0 ? (
                        userNotifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem key={notification.id} className="flex-col items-start">
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-muted-foreground">{notification.message}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openModal("help")}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openModal("settings")}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Breadcrumb & Quick Actions */}
              {selectedDataSource && (
                <div className="px-4 py-2 border-t bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>Data Sources</span>
                      <ChevronRight className="h-3 w-3 mx-1" />
                      <span className="font-medium text-foreground">{selectedDataSource.name}</span>
                      <ChevronRight className="h-3 w-3 mx-1" />
                      <span className="font-medium text-foreground">
                        {Object.values(navigationStructure)
                          .flatMap(cat => cat.items)
                          .find(item => item.id === activeView)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedItems.length > 0 && (
                        <Badge variant="secondary">
                          {selectedItems.length} selected
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openModal("bulk")}>
                        <Layers className="h-4 w-4 mr-2" />
                        Bulk Actions
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openModal("discoveryWorkspace")}>
                        <Workflow className="h-4 w-4 mr-2" />
                        Discovery Workspace
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </header>

            {/* Main Content Area with Advanced Layout */}
            <main className="flex-1 overflow-hidden">
              {layout === "standard" ? (
                <div className="h-full p-6 overflow-auto">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                          <p className="text-muted-foreground">Loading...</p>
                        </div>
                      </div>
                    }
                  >
                    {dataSourcesError ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Data Sources</AlertTitle>
                        <AlertDescription>
                          Failed to load data sources. Please try again.
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      renderComponent(activeView)
                    )}
                  </Suspense>
                </div>
              ) : (
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  {layoutConfigurations[layout].panels.map((panel, index) => (
                    <React.Fragment key={panel.id}>
                      <ResizablePanel defaultSize={panel.size} minSize={20}>
                        <div className="h-full p-6 overflow-auto">
                          <Suspense fallback={<Skeleton className="h-full w-full" />}>
                            {renderComponent(panels[index]?.component || activeView, panel.id)}
                          </Suspense>
                        </div>
                      </ResizablePanel>
                      {index < layoutConfigurations[layout].panels.length - 1 && <ResizableHandle />}
                    </React.Fragment>
                  ))}
                </ResizablePanelGroup>
              )}
            </main>
          </div>

          {/* Command Palette */}
          <CommandPalette />

          {/* ALL Modals */}
          <DataSourceCreateModal
            open={modals.create}
            onClose={() => closeModal("create")}
            onSuccess={() => closeModal("create")}
          />

          {selectedDataSource && (
            <DataSourceEditModal
              open={modals.edit}
              onClose={() => closeModal("edit")}
              dataSource={selectedDataSource}
              onSuccess={() => closeModal("edit")}
            />
          )}

          {selectedDataSource && (
            <DataSourceConnectionTestModal
              open={modals.test}
              onClose={() => closeModal("test")}
              dataSourceId={selectedDataSource.id}
              onTestConnection={() => {}}
            />
          )}

          <DataSourceBulkActions
            open={modals.bulk}
            onClose={() => closeModal("bulk")}
            selectedItems={selectedItems}
            dataSources={dataSources}
            onSuccess={() => {
              closeModal("bulk")
              setSelectedItems([])
            }}
          />

          {/* Discovery Workspace Modal */}
          {selectedDataSource && (
            <DataDiscoveryWorkspace
              dataSource={selectedDataSource}
              isOpen={modals.discoveryWorkspace}
              onClose={() => closeModal("discoveryWorkspace")}
              discoveryData={discoveryData}
              lineageData={lineageData}
              schemaData={schemaData}
            />
          )}

          {/* Advanced Filters Sidebar */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="hidden">Filters</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-96">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                  Fine-tune your data source view with advanced filtering options
                </SheetDescription>
              </SheetHeader>
              <DataSourceFilters
                filters={filters}
                onFiltersChange={setFilters}
                dataSources={dataSources}
              />
            </SheetContent>
          </Sheet>
        </div>
      </TooltipProvider>
    </WorkspaceContext.Provider>
  )
}

export function DataSourcesApp(props: DataSourcesAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataSourcesAppContent {...props} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

// Export the workspace context for use in child components
export { WorkspaceContext, useWorkspaceContext }
