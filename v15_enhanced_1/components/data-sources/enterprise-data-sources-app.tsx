"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "@/components/ui/dropdown-menu"
import {
  Database,
  Server,
  Cloud,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  Settings,
  RefreshCw,
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
  Zap,
  Target,
  Users,
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
  Info,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  Cpu,
  HardDrive,
  Network,
  Gauge,
  TestTube,
  Beaker,
  Microscope,
  Cog,
  Wrench,
  Tool,
  Package,
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
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Route,
  Map,
  MapPin,
  Navigation,
  Compass,
  TreePine,
  Workflow as WorkflowIcon,
} from "lucide-react"

// Enhanced Types for Enterprise Data Sources
interface EnterpriseDataSource {
  id: string
  name: string
  type: "database" | "api" | "file" | "stream" | "cloud" | "legacy"
  status: "active" | "inactive" | "warning" | "error" | "maintenance"
  phase: 1 | 2 | 3
  connection: {
    host: string
    port: number
    database?: string
    username?: string
    ssl: boolean
    timeout: number
  }
  metadata: {
    description: string
    tags: string[]
    owner: string
    department: string
    created: string
    lastModified: string
    size: number
    recordCount: number
    schemaVersion: string
  }
  security: {
    encryption: "none" | "ssl" | "tls" | "custom"
    authentication: "basic" | "oauth" | "kerberos" | "saml" | "custom"
    accessLevel: "public" | "internal" | "confidential" | "restricted"
    compliance: string[]
  }
  performance: {
    responseTime: number
    throughput: number
    availability: number
    lastHealthCheck: string
    uptime: number
  }
  quality: {
    score: number
    completeness: number
    accuracy: number
    consistency: number
    timeliness: number
    validity: number
  }
  lineage: {
    upstream: string[]
    downstream: string[]
    transformations: string[]
  }
  monitoring: {
    alerts: Alert[]
    metrics: Metric[]
    logs: LogEntry[]
  }
}

interface Alert {
  id: string
  type: "error" | "warning" | "info" | "success"
  message: string
  timestamp: string
  severity: "low" | "medium" | "high" | "critical"
  resolved: boolean
}

interface Metric {
  name: string
  value: number
  unit: string
  timestamp: string
  trend: "up" | "down" | "stable"
}

interface LogEntry {
  id: string
  level: "debug" | "info" | "warn" | "error"
  message: string
  timestamp: string
  source: string
}

interface PhaseConfig {
  id: 1 | 2 | 3
  name: string
  description: string
  features: string[]
  requirements: string[]
  status: "available" | "in-progress" | "completed" | "locked"
}

interface EnterpriseDataSourcesState {
  dataSources: EnterpriseDataSource[]
  selectedDataSource: EnterpriseDataSource | null
  activePhase: 1 | 2 | 3
  filters: {
    status: string[]
    type: string[]
    phase: number[]
    department: string[]
  }
  view: "grid" | "list" | "table"
  searchQuery: string
  sortBy: string
  sortOrder: "asc" | "desc"
}

// Mock Data for Enterprise Data Sources
const mockEnterpriseDataSources: EnterpriseDataSource[] = [
  {
    id: "ds-001",
    name: "Customer Database - Production",
    type: "database",
    status: "active",
    phase: 1,
    connection: {
      host: "prod-db.company.com",
      port: 5432,
      database: "customer_db",
      username: "app_user",
      ssl: true,
      timeout: 30,
    },
    metadata: {
      description: "Primary customer database containing user profiles, orders, and preferences",
      tags: ["customer", "production", "critical"],
      owner: "Data Engineering Team",
      department: "Engineering",
      created: "2023-01-15T10:00:00Z",
      lastModified: "2024-01-20T14:30:00Z",
      size: 1024000000,
      recordCount: 2500000,
      schemaVersion: "2.1.0",
    },
    security: {
      encryption: "tls",
      authentication: "oauth",
      accessLevel: "confidential",
      compliance: ["GDPR", "SOX", "PCI-DSS"],
    },
    performance: {
      responseTime: 45,
      throughput: 1500,
      availability: 99.9,
      lastHealthCheck: "2024-01-20T15:00:00Z",
      uptime: 99.8,
    },
    quality: {
      score: 95,
      completeness: 98,
      accuracy: 97,
      consistency: 94,
      timeliness: 96,
      validity: 95,
    },
    lineage: {
      upstream: ["user-registration-api", "order-processing-system"],
      downstream: ["analytics-warehouse", "reporting-dashboard"],
      transformations: ["data-cleansing", "anonymization"],
    },
    monitoring: {
      alerts: [
        {
          id: "alert-001",
          type: "warning",
          message: "High response time detected",
          timestamp: "2024-01-20T14:45:00Z",
          severity: "medium",
          resolved: false,
        },
      ],
      metrics: [
        {
          name: "Response Time",
          value: 45,
          unit: "ms",
          timestamp: "2024-01-20T15:00:00Z",
          trend: "up",
        },
      ],
      logs: [
        {
          id: "log-001",
          level: "info",
          message: "Connection established successfully",
          timestamp: "2024-01-20T15:00:00Z",
          source: "connection-manager",
        },
      ],
    },
  },
  {
    id: "ds-002",
    name: "Analytics Warehouse",
    type: "database",
    status: "active",
    phase: 2,
    connection: {
      host: "analytics.company.com",
      port: 5432,
      database: "analytics_warehouse",
      username: "analytics_user",
      ssl: true,
      timeout: 60,
    },
    metadata: {
      description: "Centralized data warehouse for business intelligence and analytics",
      tags: ["analytics", "warehouse", "bi"],
      owner: "Analytics Team",
      department: "Data Science",
      created: "2023-03-10T09:00:00Z",
      lastModified: "2024-01-19T16:20:00Z",
      size: 5120000000,
      recordCount: 15000000,
      schemaVersion: "3.0.1",
    },
    security: {
      encryption: "tls",
      authentication: "saml",
      accessLevel: "internal",
      compliance: ["GDPR", "HIPAA"],
    },
    performance: {
      responseTime: 120,
      throughput: 800,
      availability: 99.5,
      lastHealthCheck: "2024-01-20T15:00:00Z",
      uptime: 99.2,
    },
    quality: {
      score: 88,
      completeness: 92,
      accuracy: 89,
      consistency: 85,
      timeliness: 90,
      validity: 87,
    },
    lineage: {
      upstream: ["customer-database", "order-system", "inventory-system"],
      downstream: ["reporting-tools", "ml-models"],
      transformations: ["etl-processes", "data-aggregation"],
    },
    monitoring: {
      alerts: [],
      metrics: [
        {
          name: "Query Performance",
          value: 120,
          unit: "ms",
          timestamp: "2024-01-20T15:00:00Z",
          trend: "stable",
        },
      ],
      logs: [],
    },
  },
  {
    id: "ds-003",
    name: "External API - Payment Gateway",
    type: "api",
    status: "active",
    phase: 3,
    connection: {
      host: "api.payment-gateway.com",
      port: 443,
      ssl: true,
      timeout: 15,
    },
    metadata: {
      description: "Third-party payment processing API for transaction handling",
      tags: ["payment", "external", "api"],
      owner: "Payment Team",
      department: "Finance",
      created: "2023-06-01T11:00:00Z",
      lastModified: "2024-01-18T12:15:00Z",
      size: 0,
      recordCount: 0,
      schemaVersion: "1.0.0",
    },
    security: {
      encryption: "tls",
      authentication: "oauth",
      accessLevel: "restricted",
      compliance: ["PCI-DSS", "SOX"],
    },
    performance: {
      responseTime: 85,
      throughput: 2000,
      availability: 99.99,
      lastHealthCheck: "2024-01-20T15:00:00Z",
      uptime: 99.95,
    },
    quality: {
      score: 92,
      completeness: 95,
      accuracy: 94,
      consistency: 91,
      timeliness: 93,
      validity: 92,
    },
    lineage: {
      upstream: [],
      downstream: ["order-processing", "financial-reports"],
      transformations: ["data-validation", "format-conversion"],
    },
    monitoring: {
      alerts: [],
      metrics: [
        {
          name: "API Response Time",
          value: 85,
          unit: "ms",
          timestamp: "2024-01-20T15:00:00Z",
          trend: "down",
        },
      ],
      logs: [],
    },
  },
]

const phaseConfigs: PhaseConfig[] = [
  {
    id: 1,
    name: "Basic Integration",
    description: "Establish fundamental data source connections and basic monitoring",
    features: [
      "Connection Management",
      "Basic Health Monitoring",
      "Simple Authentication",
      "Error Logging",
      "Status Tracking",
    ],
    requirements: [
      "Network connectivity",
      "Basic credentials",
      "Firewall access",
    ],
    status: "completed",
  },
  {
    id: 2,
    name: "Advanced Monitoring",
    description: "Enhanced monitoring, performance tracking, and quality assessment",
    features: [
      "Performance Metrics",
      "Data Quality Scoring",
      "Advanced Authentication",
      "Real-time Alerts",
      "Compliance Tracking",
      "Data Lineage",
    ],
    requirements: [
      "Phase 1 completion",
      "Monitoring tools",
      "Quality assessment framework",
    ],
    status: "in-progress",
  },
  {
    id: 3,
    name: "Enterprise Governance",
    description: "Full enterprise governance with advanced security, automation, and AI",
    features: [
      "AI-Powered Insights",
      "Automated Remediation",
      "Advanced Security",
      "Predictive Analytics",
      "Workflow Automation",
      "Comprehensive Compliance",
      "Real-time Collaboration",
    ],
    requirements: [
      "Phase 2 completion",
      "AI/ML infrastructure",
      "Advanced security tools",
      "Automation framework",
    ],
    status: "available",
  },
]

export function EnterpriseDataSourcesApp() {
  const [state, setState] = useState<EnterpriseDataSourcesState>({
    dataSources: mockEnterpriseDataSources,
    selectedDataSource: null,
    activePhase: 1,
    filters: {
      status: [],
      type: [],
      phase: [],
      department: [],
    },
    view: "grid",
    searchQuery: "",
    sortBy: "name",
    sortOrder: "asc",
  })

  const [modals, setModals] = useState({
    addDataSource: false,
    editDataSource: false,
    deleteDataSource: false,
    phaseUpgrade: false,
    settings: false,
  })

  // Filtered and sorted data sources
  const filteredDataSources = useMemo(() => {
    let filtered = state.dataSources

    // Search filter
    if (state.searchQuery) {
      filtered = filtered.filter(ds =>
        ds.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        ds.metadata.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        ds.metadata.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()))
      )
    }

    // Status filter
    if (state.filters.status.length > 0) {
      filtered = filtered.filter(ds => state.filters.status.includes(ds.status))
    }

    // Type filter
    if (state.filters.type.length > 0) {
      filtered = filtered.filter(ds => state.filters.type.includes(ds.type))
    }

    // Phase filter
    if (state.filters.phase.length > 0) {
      filtered = filtered.filter(ds => state.filters.phase.includes(ds.phase))
    }

    // Department filter
    if (state.filters.department.length > 0) {
      filtered = filtered.filter(ds => state.filters.department.includes(ds.metadata.department))
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[state.sortBy as keyof EnterpriseDataSource]
      let bValue: any = b[state.sortBy as keyof EnterpriseDataSource]

      if (state.sortBy === "metadata.lastModified") {
        aValue = new Date(a.metadata.lastModified)
        bValue = new Date(b.metadata.lastModified)
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return state.sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return state.sortOrder === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  }, [state.dataSources, state.searchQuery, state.filters, state.sortBy, state.sortOrder])

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

  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 1: return "text-blue-600 bg-blue-100"
      case 2: return "text-purple-600 bg-purple-100"
      case 3: return "text-green-600 bg-green-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const openModal = (modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: true }))
  }

  const closeModal = (modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: false }))
  }

  const handleDataSourceSelect = (dataSource: EnterpriseDataSource) => {
    setState(prev => ({ ...prev, selectedDataSource: dataSource }))
  }

  const handlePhaseUpgrade = (dataSourceId: string, targetPhase: number) => {
    setState(prev => ({
      ...prev,
      dataSources: prev.dataSources.map(ds =>
        ds.id === dataSourceId ? { ...ds, phase: targetPhase as 1 | 2 | 3 } : ds
      )
    }))
    closeModal("phaseUpgrade")
  }

  const DataSourceCard = ({ dataSource }: { dataSource: EnterpriseDataSource }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{dataSource.name}</CardTitle>
              <CardDescription className="truncate">
                {dataSource.metadata.description}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDataSourceSelect(dataSource)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openModal("phaseUpgrade")}>
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Phase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(dataSource.status)}>
            {dataSource.status}
          </Badge>
          <Badge className={getPhaseColor(dataSource.phase)}>
            Phase {dataSource.phase}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quality Score</span>
            <span className={`font-medium ${getQualityColor(dataSource.quality.score)}`}>
              {dataSource.quality.score}%
            </span>
          </div>
          <Progress value={dataSource.quality.score} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Response Time</span>
            <div className="font-medium">{dataSource.performance.responseTime}ms</div>
          </div>
          <div>
            <span className="text-muted-foreground">Availability</span>
            <div className="font-medium">{dataSource.performance.availability}%</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {dataSource.metadata.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {dataSource.metadata.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{dataSource.metadata.tags.length - 3}
            </Badge>
          )}
        </div>

        {dataSource.monitoring.alerts.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{dataSource.monitoring.alerts.length} active alerts</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const DataSourceDetails = ({ dataSource }: { dataSource: EnterpriseDataSource }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{dataSource.name}</h2>
          <p className="text-muted-foreground">{dataSource.metadata.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(dataSource.status)}>
            {dataSource.status}
          </Badge>
          <Badge className={getPhaseColor(dataSource.phase)}>
            Phase {dataSource.phase}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Host</span>
                  <span className="font-mono">{dataSource.connection.host}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Port</span>
                  <span>{dataSource.connection.port}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database</span>
                  <span>{dataSource.connection.database || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SSL</span>
                  <span>{dataSource.connection.ssl ? "Enabled" : "Disabled"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span>{dataSource.metadata.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span>{dataSource.metadata.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span>{(dataSource.metadata.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Records</span>
                  <span>{dataSource.metadata.recordCount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dataSource.performance.responseTime}ms</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span>5% improvement</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dataSource.performance.throughput}</div>
                <div className="text-sm text-muted-foreground">requests/sec</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dataSource.performance.availability}%</div>
                <div className="text-sm text-muted-foreground">uptime</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completeness</span>
                    <span>{dataSource.quality.completeness}%</span>
                  </div>
                  <Progress value={dataSource.quality.completeness} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy</span>
                    <span>{dataSource.quality.accuracy}%</span>
                  </div>
                  <Progress value={dataSource.quality.accuracy} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Consistency</span>
                    <span>{dataSource.quality.consistency}%</span>
                  </div>
                  <Progress value={dataSource.quality.consistency} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Timeliness</span>
                    <span>{dataSource.quality.timeliness}%</span>
                  </div>
                  <Progress value={dataSource.quality.timeliness} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getQualityColor(dataSource.quality.score)}`}>
                    {dataSource.quality.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Quality Score</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Encryption</span>
                  <span>{dataSource.security.encryption}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authentication</span>
                  <span>{dataSource.security.authentication}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Access Level</span>
                  <span>{dataSource.security.accessLevel}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {dataSource.security.compliance.map((compliance, index) => (
                    <Badge key={index} variant="secondary">
                      {compliance}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {dataSource.monitoring.alerts.length > 0 ? (
                  <div className="space-y-2">
                    {dataSource.monitoring.alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <div className="flex-1">
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No active alerts
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dataSource.monitoring.metrics.map((metric) => (
                    <div key={metric.name} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{metric.value} {metric.unit}</span>
                        {metric.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {metric.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                        {metric.trend === "stable" && <Activity className="h-4 w-4 text-blue-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">Enterprise Data Sources</h1>
          <p className="text-muted-foreground">
            Manage and monitor your enterprise data sources with advanced governance capabilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => openModal("settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => openModal("addDataSource")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Data Source
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Phase Configuration</h3>
            <div className="space-y-3">
              {phaseConfigs.map((phase) => (
                <Card key={phase.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getPhaseColor(phase.id)}>
                        Phase {phase.id}
                      </Badge>
                      <Badge variant={phase.status === "completed" ? "default" : "secondary"}>
                        {phase.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-1">{phase.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                    <div className="space-y-1">
                      {phase.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {phase.features.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{phase.features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Sources</span>
                <span className="font-medium">{state.dataSources.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <span className="font-medium">
                  {state.dataSources.filter(ds => ds.status === "active").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phase 3 Ready</span>
                <span className="font-medium">
                  {state.dataSources.filter(ds => ds.phase === 3).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Quality</span>
                <span className="font-medium">
                  {Math.round(state.dataSources.reduce((acc, ds) => acc + ds.quality.score, 0) / state.dataSources.length)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {state.selectedDataSource ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, selectedDataSource: null }))}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Button>
              </div>
              <DataSourceDetails dataSource={state.selectedDataSource} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filters and Search */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search data sources..."
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

              {/* Data Sources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDataSources.map((dataSource) => (
                  <DataSourceCard key={dataSource.id} dataSource={dataSource} />
                ))}
              </div>

              {filteredDataSources.length === 0 && (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No data sources found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Dialog open={modals.phaseUpgrade} onOpenChange={() => closeModal("phaseUpgrade")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Data Source Phase</DialogTitle>
            <DialogDescription>
              Select the target phase for this data source. Higher phases unlock more advanced features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {phaseConfigs.map((phase) => (
              <Card key={phase.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getPhaseColor(phase.id)}>
                      Phase {phase.id}
                    </Badge>
                    <Badge variant={phase.status === "completed" ? "default" : "secondary"}>
                      {phase.status}
                    </Badge>
                  </div>
                  <h4 className="font-medium mb-1">{phase.name}</h4>
                  <p className="text-sm text-muted-foreground">{phase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal("phaseUpgrade")}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle phase upgrade logic
              closeModal("phaseUpgrade")
            }}>
              Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}