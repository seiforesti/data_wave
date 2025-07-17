"use client"

import React, { useState, useMemo } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Database,
  Shield,
  Scan,
  FileText,
  Map,
  BarChart3,
  Settings,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Bell,
  MessageCircle,
  User,
  LogOut,
  Home,
  ExternalLink,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  Target,
  Users,
  Globe,
  Lock,
  Building,
  Workflow,
  Calendar,
  Clock,
  Info,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  Settings as SettingsIcon,
  Palette,
  Monitor,
  Palette as PaletteIcon,
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
  Scan as ScanIcon,
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
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Route,
  Map as MapIcon,
  MapPin,
  Navigation,
  Compass,
  TreePine,
  Workflow as WorkflowIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Separator } from "@/components/ui/separator"

// Enhanced Types for Unified Navigation
interface NavigationModule {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  status: "active" | "inactive" | "warning" | "error" | "maintenance"
  priority: "critical" | "high" | "medium" | "low"
  features: string[]
  metrics: {
    count?: number
    percentage?: number
    trend?: "up" | "down" | "stable"
    lastUpdated?: string
  }
  dependencies: string[]
  phase: 1 | 2 | 3
  premium?: boolean
}

interface NavigationSection {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  modules: NavigationModule[]
  status: "active" | "inactive" | "warning"
  priority: "critical" | "high" | "medium" | "low"
}

interface UnifiedNavigationState {
  activeSection: string | null
  activeModule: string | null
  expandedSections: Set<string>
  searchQuery: string
  filters: {
    status: string[]
    priority: string[]
    phase: number[]
  }
  view: "grid" | "list" | "table"
  notifications: Notification[]
  quickActions: QuickAction[]
}

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: string
  module?: string
  action?: () => void
  read: boolean
}

interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  shortcut?: string
  category: string
}

// Navigation Configuration
const navigationSections: NavigationSection[] = [
  {
    id: "data-sources",
    name: "Data Sources",
    description: "Manage and monitor enterprise data connections",
    icon: Database,
    status: "active",
    priority: "critical",
    modules: [
      {
        id: "enterprise-data-sources",
        name: "Enterprise Data Sources",
        description: "Advanced data source management with three-phase governance",
        icon: Server,
        path: "/data-governance?main=data-map&sub=data-sources",
        status: "active",
        priority: "critical",
        features: [
          "Phase-based governance",
          "Real-time monitoring",
          "Quality assessment",
          "Security compliance",
          "Performance analytics",
          "Automated remediation"
        ],
        metrics: {
          count: 24,
          percentage: 95,
          trend: "up",
          lastUpdated: "2024-01-20T15:00:00Z"
        },
        dependencies: ["core-infrastructure"],
        phase: 3,
        premium: true
      },
      {
        id: "legacy-data-sources",
        name: "Legacy Data Sources",
        description: "Basic data source management for simple connections",
        icon: Database,
        path: "/data-governance?main=data-map&sub=data-sources&view=legacy",
        status: "active",
        priority: "medium",
        features: [
          "Basic connection management",
          "Simple monitoring",
          "Status tracking"
        ],
        metrics: {
          count: 12,
          percentage: 78,
          trend: "stable",
          lastUpdated: "2024-01-20T14:30:00Z"
        },
        dependencies: [],
        phase: 1
      }
    ]
  },
  {
    id: "data-catalog",
    name: "Data Catalog",
    description: "Discover, organize, and manage data assets",
    icon: Map,
    status: "active",
    priority: "high",
    modules: [
      {
        id: "entity-management",
        name: "Entity Management",
        description: "Comprehensive data entity lifecycle management",
        icon: FileText,
        path: "/data-governance?main=data-catalog&sub=entity-management",
        status: "active",
        priority: "high",
        features: [
          "Entity lifecycle management",
          "Schema discovery",
          "Metadata management",
          "Lineage tracking",
          "Collaborative editing"
        ],
        metrics: {
          count: 156,
          percentage: 92,
          trend: "up",
          lastUpdated: "2024-01-20T15:00:00Z"
        },
        dependencies: ["data-sources"],
        phase: 2
      },
      {
        id: "catalog-browser",
        name: "Catalog Browser",
        description: "Browse and search data catalog entries",
        icon: Folder,
        path: "/data-governance?main=data-catalog&sub=catalog-browser",
        status: "active",
        priority: "medium",
        features: [
          "Advanced search",
          "Filtering options",
          "Bulk operations",
          "Export capabilities"
        ],
        metrics: {
          count: 89,
          percentage: 85,
          trend: "stable",
          lastUpdated: "2024-01-20T14:45:00Z"
        },
        dependencies: ["entity-management"],
        phase: 1
      }
    ]
  },
  {
    id: "scan-logic",
    name: "Scan Logic",
    description: "Automated data discovery and scanning",
    icon: Scan,
    status: "active",
    priority: "high",
    modules: [
      {
        id: "scan-system",
        name: "Scan System",
        description: "Comprehensive data scanning and discovery",
        icon: Radar,
        path: "/data-governance?main=data-map&sub=scan",
        status: "active",
        priority: "high",
        features: [
          "Automated discovery",
          "Scheduled scanning",
          "Real-time monitoring",
          "Pattern recognition",
          "Anomaly detection"
        ],
        metrics: {
          count: 8,
          percentage: 88,
          trend: "up",
          lastUpdated: "2024-01-20T15:00:00Z"
        },
        dependencies: ["data-sources"],
        phase: 2
      },
      {
        id: "scan-schedules",
        name: "Scan Schedules",
        description: "Manage automated scan schedules and triggers",
        icon: Calendar,
        path: "/data-governance?main=data-map&sub=scan&view=schedules",
        status: "active",
        priority: "medium",
        features: [
          "Schedule management",
          "Trigger configuration",
          "Execution monitoring",
          "Alert management"
        ],
        metrics: {
          count: 15,
          percentage: 95,
          trend: "stable",
          lastUpdated: "2024-01-20T14:30:00Z"
        },
        dependencies: ["scan-system"],
        phase: 1
      }
    ]
  },
  {
    id: "scan-rule-sets",
    name: "Scan Rule Sets",
    description: "Configure and manage data scanning rules",
    icon: Shield,
    status: "active",
    priority: "high",
    modules: [
      {
        id: "rule-sets",
        name: "Rule Sets",
        description: "Comprehensive rule set management and configuration",
        icon: ShieldCheck,
        path: "/data-governance?main=data-map&sub=scan-rules",
        status: "active",
        priority: "high",
        features: [
          "Rule set management",
          "Template library",
          "Validation engine",
          "Compliance checking",
          "Custom rules"
        ],
        metrics: {
          count: 23,
          percentage: 90,
          trend: "up",
          lastUpdated: "2024-01-20T15:00:00Z"
        },
        dependencies: ["scan-system"],
        phase: 2
      },
      {
        id: "rule-templates",
        name: "Rule Templates",
        description: "Pre-built rule templates for common scenarios",
        icon: FileText,
        path: "/data-governance?main=data-map&sub=scan-rules&view=templates",
        status: "active",
        priority: "medium",
        features: [
          "Template library",
          "Customization options",
          "Version control",
          "Sharing capabilities"
        ],
        metrics: {
          count: 45,
          percentage: 87,
          trend: "stable",
          lastUpdated: "2024-01-20T14:15:00Z"
        },
        dependencies: ["rule-sets"],
        phase: 1
      }
    ]
  },
  {
    id: "compliance-rules",
    name: "Compliance Rules",
    description: "Governance and compliance management",
    icon: Shield,
    status: "active",
    priority: "critical",
    modules: [
      {
        id: "compliance-engine",
        name: "Compliance Engine",
        description: "Advanced compliance checking and enforcement",
        icon: ShieldCheck,
        path: "/data-governance?main=data-map&sub=compliance",
        status: "active",
        priority: "critical",
        features: [
          "Compliance checking",
          "Policy enforcement",
          "Audit trails",
          "Risk assessment",
          "Automated remediation"
        ],
        metrics: {
          count: 12,
          percentage: 96,
          trend: "up",
          lastUpdated: "2024-01-20T15:00:00Z"
        },
        dependencies: ["scan-rule-sets"],
        phase: 3,
        premium: true
      },
      {
        id: "policy-management",
        name: "Policy Management",
        description: "Create and manage compliance policies",
        icon: FileText,
        path: "/data-governance?main=data-map&sub=compliance&view=policies",
        status: "active",
        priority: "high",
        features: [
          "Policy creation",
          "Version control",
          "Approval workflows",
          "Distribution management"
        ],
        metrics: {
          count: 8,
          percentage: 92,
          trend: "stable",
          lastUpdated: "2024-01-20T14:45:00Z"
        },
        dependencies: ["compliance-engine"],
        phase: 2
      }
    ]
  }
]

export function UnifiedNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [state, setState] = useState<UnifiedNavigationState>({
    activeSection: null,
    activeModule: null,
    expandedSections: new Set(),
    searchQuery: "",
    filters: {
      status: [],
      priority: [],
      phase: []
    },
    view: "grid",
    notifications: [],
    quickActions: []
  })

  // Filtered and sorted sections
  const filteredSections = useMemo(() => {
    let filtered = navigationSections

    // Search filter
    if (state.searchQuery) {
      filtered = filtered.filter(section =>
        section.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        section.modules.some(module =>
          module.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          module.description.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      )
    }

    // Status filter
    if (state.filters.status.length > 0) {
      filtered = filtered.filter(section =>
        state.filters.status.includes(section.status) ||
        section.modules.some(module => state.filters.status.includes(module.status))
      )
    }

    // Priority filter
    if (state.filters.priority.length > 0) {
      filtered = filtered.filter(section =>
        state.filters.priority.includes(section.priority) ||
        section.modules.some(module => state.filters.priority.includes(module.priority))
      )
    }

    // Phase filter
    if (state.filters.phase.length > 0) {
      filtered = filtered.filter(section =>
        section.modules.some(module => state.filters.phase.includes(module.phase))
      )
    }

    return filtered
  }, [navigationSections, state.searchQuery, state.filters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100"
      case "inactive": return "text-gray-600 bg-gray-100"
      case "warning": return "text-yellow-600 bg-yellow-100"
      case "error": return "text-red-600 bg-red-100"
      case "maintenance": return "text-blue-600 bg-blue-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-600 bg-red-100"
      case "high": return "text-orange-600 bg-orange-100"
      case "medium": return "text-yellow-600 bg-yellow-100"
      case "low": return "text-green-600 bg-green-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 1: return "text-blue-600 bg-blue-100"
      case 2: return "text-purple-600 bg-purple-100"
      case 3: return "text-green-600 bg-green-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />
      case "stable": return <Activity className="h-4 w-4 text-blue-500" />
      default: return null
    }
  }

  const handleSectionClick = (sectionId: string) => {
    setState(prev => ({
      ...prev,
      expandedSections: new Set(prev.expandedSections).add(sectionId),
      activeSection: sectionId
    }))
  }

  const handleModuleClick = (module: NavigationModule) => {
    setState(prev => ({
      ...prev,
      activeModule: module.id
    }))
    router.push(module.path)
  }

  const toggleSectionExpansion = (sectionId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedSections)
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId)
      } else {
        newExpanded.add(sectionId)
      }
      return { ...prev, expandedSections: newExpanded }
    })
  }

  const ModuleCard = ({ module }: { module: NavigationModule }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <module.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{module.name}</CardTitle>
              <CardDescription className="truncate">
                {module.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {module.premium && (
              <Badge variant="outline" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
            <Badge className={getPhaseColor(module.phase)}>
              Phase {module.phase}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(module.status)}>
            {module.status}
          </Badge>
          <Badge className={getPriorityColor(module.priority)}>
            {module.priority}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Health Score</span>
            <span className="font-medium">{module.metrics.percentage}%</span>
          </div>
          <Progress value={module.metrics.percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Items</span>
            <div className="font-medium">{module.metrics.count}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Trend</span>
            <div className="flex items-center gap-1">
              {getTrendIcon(module.metrics.trend)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {module.features.slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {module.features.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{module.features.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const SectionHeader = ({ section }: { section: NavigationSection }) => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <section.icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{section.name}</h3>
          <p className="text-sm text-muted-foreground">{section.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(section.status)}>
          {section.status}
        </Badge>
        <Badge className={getPriorityColor(section.priority)}>
          {section.priority}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleSectionExpansion(section.id)}
        >
          {state.expandedSections.has(section.id) ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">Data Governance Platform</h1>
          <p className="text-muted-foreground">
            Unified navigation for all data governance modules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules and features..."
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={state.view} onValueChange={(value: "grid" | "list" | "table") => 
            setState(prev => ({ ...prev, view: value }))
          }>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="table">Table</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {filteredSections.map((section) => (
            <div key={section.id} className="space-y-4">
              <SectionHeader section={section} />
              
              {state.expandedSections.has(section.id) && (
                <div className={`grid gap-4 ${
                  state.view === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {section.modules.map((module) => (
                    <div key={module.id} onClick={() => handleModuleClick(module)}>
                      <ModuleCard module={module} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No modules found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}