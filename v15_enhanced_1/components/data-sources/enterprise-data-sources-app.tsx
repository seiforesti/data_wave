"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Database,
  Server,
  Shield,
  Activity,
  Plus,
  Search,
  Filter,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Zap,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Lock,
  Unlock,
  Key,
  Monitor,
  TestTube,
  Rocket,
  Crown,
  Star,
  Target,
  Layers,
  GitBranch,
  Workflow,
  Calendar,
  Bell,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Share2,
  Archive,
  RotateCcw,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Power,
  PowerOff,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Timer,
  TimerOff,
  TimerReset,
  TimerStart,
  TimerPause,
  TimerResume,
  TimerSkip,
  TimerBack,
  TimerForward,
  TimerRewind,
  TimerFastForward,
  TimerSkipBack,
  TimerSkipForward,
  TimerJumpBack,
  TimerJumpForward,
  TimerJumpToStart,
  TimerJumpToEnd,
  TimerJumpToMiddle,
  TimerJumpToQuarter,
  TimerJumpToThreeQuarters,
  TimerJumpToHalf,
  TimerJumpToThird,
  TimerJumpToTwoThirds,
  TimerJumpToFourth,
  TimerJumpToThreeFourths,
  TimerJumpToFifth,
  TimerJumpToFourFifths,
  TimerJumpToSixth,
  TimerJumpToFiveSixths,
  TimerJumpToSeventh,
  TimerJumpToSixSevenths,
  TimerJumpToEighth,
  TimerJumpToSevenEighths,
  TimerJumpToNinth,
  TimerJumpToEightNinths,
  TimerJumpToTenth,
  TimerJumpToNineTenths,
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
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

// Enhanced Types for Enterprise Data Sources
interface DataSource {
  id: string
  name: string
  type: "database" | "api" | "file" | "stream" | "cloud" | "legacy"
  status: "active" | "inactive" | "error" | "maintenance" | "testing"
  phase: "phase1" | "phase2" | "phase3"
  priority: "critical" | "high" | "medium" | "low"
  security: "public" | "internal" | "confidential" | "restricted"
  compliance: string[]
  tags: string[]
  description: string
  connectionString: string
  lastSync: Date
  nextSync: Date
  syncFrequency: string
  dataVolume: number
  recordCount: number
  qualityScore: number
  complianceScore: number
  performanceScore: number
  owner: string
  team: string
  environment: "development" | "staging" | "production"
  region: string
  version: string
  health: {
    status: "healthy" | "warning" | "critical"
    issues: string[]
    metrics: {
      uptime: number
      responseTime: number
      errorRate: number
      throughput: number
    }
  }
  metadata: {
    schema: any
    lineage: any[]
    dependencies: string[]
    transformations: any[]
  }
  access: {
    users: string[]
    roles: string[]
    permissions: string[]
  }
  monitoring: {
    alerts: any[]
    thresholds: any[]
    dashboards: string[]
  }
}

interface PhaseConfig {
  id: "phase1" | "phase2" | "phase3"
  name: string
  description: string
  features: string[]
  requirements: string[]
  progress: number
  status: "not_started" | "in_progress" | "completed" | "failed"
  startDate?: Date
  endDate?: Date
  metrics: {
    dataSources: number
    compliance: number
    performance: number
    security: number
  }
}

interface EnterpriseMetrics {
  totalDataSources: number
  activeDataSources: number
  complianceRate: number
  performanceScore: number
  securityScore: number
  dataQualityScore: number
  phaseProgress: {
    phase1: number
    phase2: number
    phase3: number
  }
  recentActivity: any[]
  alerts: any[]
  trends: {
    dataGrowth: number
    complianceImprovement: number
    performanceOptimization: number
  }
}

// Mock Data for Enterprise Data Sources
const mockDataSources: DataSource[] = [
  {
    id: "ds-001",
    name: "Customer Database",
    type: "database",
    status: "active",
    phase: "phase3",
    priority: "critical",
    security: "confidential",
    compliance: ["GDPR", "CCPA", "SOX"],
    tags: ["customer", "pii", "critical"],
    description: "Primary customer database containing user profiles and transaction history",
    connectionString: "postgresql://customer-db:5432/customers",
    lastSync: new Date("2024-01-15T10:30:00Z"),
    nextSync: new Date("2024-01-15T11:30:00Z"),
    syncFrequency: "1 hour",
    dataVolume: 2.5, // GB
    recordCount: 1500000,
    qualityScore: 98,
    complianceScore: 95,
    performanceScore: 92,
    owner: "Sarah Johnson",
    team: "Data Engineering",
    environment: "production",
    region: "us-east-1",
    version: "2.1.0",
    health: {
      status: "healthy",
      issues: [],
      metrics: {
        uptime: 99.9,
        responseTime: 45,
        errorRate: 0.1,
        throughput: 1500,
      },
    },
    metadata: {
      schema: {},
      lineage: [],
      dependencies: [],
      transformations: [],
    },
    access: {
      users: ["sarah.johnson", "mike.chen"],
      roles: ["admin", "analyst"],
      permissions: ["read", "write", "delete"],
    },
    monitoring: {
      alerts: [],
      thresholds: [],
      dashboards: ["customer-metrics", "performance-dashboard"],
    },
  },
  {
    id: "ds-002",
    name: "Product Catalog API",
    type: "api",
    status: "active",
    phase: "phase2",
    priority: "high",
    security: "internal",
    compliance: ["GDPR"],
    tags: ["product", "catalog", "api"],
    description: "REST API providing product catalog information",
    connectionString: "https://api.products.company.com/v2",
    lastSync: new Date("2024-01-15T10:25:00Z"),
    nextSync: new Date("2024-01-15T10:35:00Z"),
    syncFrequency: "10 minutes",
    dataVolume: 0.5,
    recordCount: 50000,
    qualityScore: 94,
    complianceScore: 88,
    performanceScore: 89,
    owner: "Alex Rodriguez",
    team: "Product Engineering",
    environment: "production",
    region: "us-west-2",
    version: "2.0.1",
    health: {
      status: "warning",
      issues: ["High response time during peak hours"],
      metrics: {
        uptime: 99.5,
        responseTime: 120,
        errorRate: 0.5,
        throughput: 800,
      },
    },
    metadata: {
      schema: {},
      lineage: [],
      dependencies: [],
      transformations: [],
    },
    access: {
      users: ["alex.rodriguez", "lisa.wang"],
      roles: ["developer", "analyst"],
      permissions: ["read", "write"],
    },
    monitoring: {
      alerts: ["High response time alert"],
      thresholds: [],
      dashboards: ["api-performance", "product-metrics"],
    },
  },
  {
    id: "ds-003",
    name: "Legacy Order System",
    type: "legacy",
    status: "maintenance",
    phase: "phase1",
    priority: "medium",
    security: "internal",
    compliance: ["SOX"],
    tags: ["legacy", "orders", "migration"],
    description: "Legacy order management system scheduled for migration",
    connectionString: "oracle://legacy-orders:1521/orders",
    lastSync: new Date("2024-01-15T09:00:00Z"),
    nextSync: new Date("2024-01-15T12:00:00Z"),
    syncFrequency: "3 hours",
    dataVolume: 5.0,
    recordCount: 3000000,
    qualityScore: 75,
    complianceScore: 70,
    performanceScore: 65,
    owner: "David Kim",
    team: "Legacy Systems",
    environment: "production",
    region: "us-central-1",
    version: "1.8.5",
    health: {
      status: "warning",
      issues: ["Scheduled maintenance", "Performance degradation"],
      metrics: {
        uptime: 95.0,
        responseTime: 300,
        errorRate: 2.0,
        throughput: 400,
      },
    },
    metadata: {
      schema: {},
      lineage: [],
      dependencies: [],
      transformations: [],
    },
    access: {
      users: ["david.kim"],
      roles: ["admin"],
      permissions: ["read"],
    },
    monitoring: {
      alerts: ["Maintenance scheduled", "Performance alert"],
      thresholds: [],
      dashboards: ["legacy-monitoring"],
    },
  },
]

const phaseConfigs: PhaseConfig[] = [
  {
    id: "phase1",
    name: "Foundation & Discovery",
    description: "Establish data source inventory and basic governance",
    features: [
      "Data source discovery and cataloging",
      "Basic metadata management",
      "Initial security assessment",
      "Compliance baseline establishment",
      "Performance monitoring setup",
    ],
    requirements: [
      "Complete data source inventory",
      "Security assessment completed",
      "Compliance requirements documented",
      "Basic monitoring implemented",
    ],
    progress: 85,
    status: "in_progress",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-03-31"),
    metrics: {
      dataSources: 45,
      compliance: 75,
      performance: 70,
      security: 80,
    },
  },
  {
    id: "phase2",
    name: "Advanced Governance",
    description: "Implement advanced governance and quality controls",
    features: [
      "Advanced data quality monitoring",
      "Automated compliance checks",
      "Performance optimization",
      "Enhanced security controls",
      "Data lineage tracking",
    ],
    requirements: [
      "Data quality framework implemented",
      "Automated compliance monitoring",
      "Performance benchmarks established",
      "Security controls enhanced",
    ],
    progress: 60,
    status: "in_progress",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-06-30"),
    metrics: {
      dataSources: 32,
      compliance: 88,
      performance: 85,
      security: 92,
    },
  },
  {
    id: "phase3",
    name: "Enterprise Excellence",
    description: "Achieve enterprise-grade data governance maturity",
    features: [
      "Real-time data governance",
      "Predictive analytics",
      "Advanced automation",
      "Enterprise-wide integration",
      "Continuous optimization",
    ],
    requirements: [
      "Real-time monitoring implemented",
      "Predictive capabilities deployed",
      "Full automation achieved",
      "Enterprise integration complete",
    ],
    progress: 25,
    status: "not_started",
    startDate: new Date("2024-07-01"),
    endDate: new Date("2024-12-31"),
    metrics: {
      dataSources: 18,
      compliance: 95,
      performance: 92,
      security: 98,
    },
  },
]

const enterpriseMetrics: EnterpriseMetrics = {
  totalDataSources: 95,
  activeDataSources: 87,
  complianceRate: 82,
  performanceScore: 78,
  securityScore: 85,
  dataQualityScore: 81,
  phaseProgress: {
    phase1: 85,
    phase2: 60,
    phase3: 25,
  },
  recentActivity: [
    { type: "sync", dataSource: "Customer Database", timestamp: new Date(), status: "success" },
    { type: "alert", dataSource: "Product Catalog API", timestamp: new Date(), status: "warning" },
    { type: "maintenance", dataSource: "Legacy Order System", timestamp: new Date(), status: "scheduled" },
  ],
  alerts: [
    { severity: "warning", message: "High response time on Product Catalog API", dataSource: "ds-002" },
    { severity: "info", message: "Maintenance scheduled for Legacy Order System", dataSource: "ds-003" },
  ],
  trends: {
    dataGrowth: 12.5,
    complianceImprovement: 8.2,
    performanceOptimization: 15.3,
  },
}

export function EnterpriseDataSourcesApp() {
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources)
  const [phases, setPhases] = useState<PhaseConfig[]>(phaseConfigs)
  const [metrics, setMetrics] = useState<EnterpriseMetrics>(enterpriseMetrics)
  const [selectedPhase, setSelectedPhase] = useState<"phase1" | "phase2" | "phase3">("phase1")
  const [viewMode, setViewMode] = useState<"overview" | "details" | "phases" | "analytics">("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [filterPhase, setFilterPhase] = useState<string[]>([])
  const [filterPriority, setFilterPriority] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"name" | "status" | "phase" | "priority" | "lastSync">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(false)
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)

  // Filter and sort data sources
  const filteredDataSources = useMemo(() => {
    let filtered = dataSources

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(ds =>
        ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply status filter
    if (filterStatus.length > 0) {
      filtered = filtered.filter(ds => filterStatus.includes(ds.status))
    }

    // Apply phase filter
    if (filterPhase.length > 0) {
      filtered = filtered.filter(ds => filterPhase.includes(ds.phase))
    }

    // Apply priority filter
    if (filterPriority.length > 0) {
      filtered = filtered.filter(ds => filterPriority.includes(ds.priority))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name
          bValue = b.name
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "phase":
          aValue = a.phase
          bValue = b.phase
          break
        case "priority":
          aValue = a.priority
          bValue = b.priority
          break
        case "lastSync":
          aValue = a.lastSync
          bValue = b.lastSync
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [dataSources, searchQuery, filterStatus, filterPhase, filterPriority, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      case "maintenance":
        return "bg-yellow-500"
      case "testing":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "phase1":
        return "bg-blue-500"
      case "phase2":
        return "bg-purple-500"
      case "phase3":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const handleRefresh = useCallback(() => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleDataSourceAction = useCallback((action: string, dataSource: DataSource) => {
    console.log(`${action} action for data source: ${dataSource.name}`)
    // Implement action logic
  }, [])

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Enterprise Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDataSources}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">+{metrics.trends.dataGrowth}%</span> from last month
            </div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complianceRate}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">+{metrics.trends.complianceImprovement}%</span> improvement
            </div>
            <Progress value={metrics.complianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.performanceScore}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">+{metrics.trends.performanceOptimization}%</span> optimization
            </div>
            <Progress value={metrics.performanceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.securityScore}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-green-600">Enterprise grade</span>
            </div>
            <Progress value={metrics.securityScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Phase Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Phase Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase) => (
              <div key={phase.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", getPhaseColor(phase.id))} />
                    <span className="font-medium">{phase.name}</span>
                    <Badge variant={phase.status === "completed" ? "default" : "secondary"}>
                      {phase.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{phase.progress}%</span>
                </div>
                <Progress value={phase.progress} className="h-2" />
                <p className="text-sm text-muted-foreground">{phase.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.dataSource}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.type} - {activity.timestamp.toLocaleString()}
                  </p>
                </div>
                <Badge variant={activity.status === "success" ? "default" : "secondary"}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDataSourcesList = () => (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search data sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {["active", "inactive", "error", "maintenance", "testing"].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filterStatus.includes(status)}
                  onCheckedChange={(checked) =>
                    setFilterStatus(prev => checked ? [...prev, status] : prev.filter(s => s !== status))
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Phase</DropdownMenuLabel>
              {["phase1", "phase2", "phase3"].map((phase) => (
                <DropdownMenuCheckboxItem
                  key={phase}
                  checked={filterPhase.includes(phase)}
                  onCheckedChange={(checked) =>
                    setFilterPhase(prev => checked ? [...prev, phase] : prev.filter(p => p !== phase))
                  }
                >
                  Phase {phase.slice(-1)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              {["critical", "high", "medium", "low"].map((priority) => (
                <DropdownMenuCheckboxItem
                  key={priority}
                  checked={filterPriority.includes(priority)}
                  onCheckedChange={(checked) =>
                    setFilterPriority(prev => checked ? [...prev, priority] : prev.filter(p => p !== priority))
                  }
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="phase">Phase</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="lastSync">Last Sync</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDataSources.map((dataSource) => (
          <Card key={dataSource.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{dataSource.name}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate">{dataSource.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDataSourceAction("view", dataSource)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDataSourceAction("edit", dataSource)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDataSourceAction("sync", dataSource)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDataSourceAction("delete", dataSource)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Status and Phase */}
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(dataSource.status))} />
                <span className="text-sm capitalize">{dataSource.status}</span>
                <div className={cn("w-2 h-2 rounded-full", getPhaseColor(dataSource.phase))} />
                <span className="text-sm">Phase {dataSource.phase.slice(-1)}</span>
                <div className={cn("w-2 h-2 rounded-full", getPriorityColor(dataSource.priority))} />
                <span className="text-sm capitalize">{dataSource.priority}</span>
              </div>

              {/* Health Status */}
              <div className="flex items-center gap-2">
                <div className={cn("flex items-center gap-1", getHealthColor(dataSource.health.status))}>
                  {dataSource.health.status === "healthy" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : dataSource.health.status === "warning" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="text-sm capitalize">{dataSource.health.status}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">{dataSource.qualityScore}%</div>
                  <div className="text-muted-foreground">Quality</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{dataSource.complianceScore}%</div>
                  <div className="text-muted-foreground">Compliance</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{dataSource.performanceScore}%</div>
                  <div className="text-muted-foreground">Performance</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {dataSource.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {dataSource.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{dataSource.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Last Sync */}
              <div className="text-xs text-muted-foreground">
                Last sync: {dataSource.lastSync.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderPhaseDetails = () => (
    <div className="space-y-6">
      {/* Phase Selection */}
      <div className="flex gap-2">
        {phases.map((phase) => (
          <Button
            key={phase.id}
            variant={selectedPhase === phase.id ? "default" : "outline"}
            onClick={() => setSelectedPhase(phase.id)}
          >
            {phase.name}
          </Button>
        ))}
      </div>

      {/* Selected Phase Details */}
      {phases.find(p => p.id === selectedPhase) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {phases.find(p => p.id === selectedPhase)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Phase Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {phases.find(p => p.id === selectedPhase)?.progress}%
                </span>
              </div>
              <Progress value={phases.find(p => p.id === selectedPhase)?.progress} className="h-3" />
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-medium">Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {phases.find(p => p.id === selectedPhase)?.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <h4 className="font-medium">Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {phases.find(p => p.id === selectedPhase)?.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <h4 className="font-medium">Phase Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(phases.find(p => p.id === selectedPhase)?.metrics || {}).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trends.dataGrowth}%</div>
            <p className="text-xs text-muted-foreground">Monthly growth rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Compliance Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trends.complianceImprovement}%</div>
            <p className="text-xs text-muted-foreground">Quarterly improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Performance Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trends.performanceOptimization}%</div>
            <p className="text-xs text-muted-foreground">Performance gains</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.alerts.map((alert, index) => (
              <Alert key={index} variant={alert.severity === "warning" ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Enterprise Data Sources</h1>
          <p className="text-muted-foreground">
            Manage and monitor your enterprise data sources across all phases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Data Source
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Data Sources</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {renderDataSourcesList()}
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          {renderPhaseDetails()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {renderAnalytics()}
        </TabsContent>
      </Tabs>
    </div>
  )
}