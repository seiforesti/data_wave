"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useOrchestration } from "../../hooks/useOrchestration"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Monitor,
  Play,
  Pause,
  Stop,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Database,
  Server,
  Cloud,
  Globe,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Filter,
  Search,
  Settings,
  MoreHorizontal,
  Info,
  HelpCircle,
  BookOpen,
  FileText,
  FileCode,
  FileJson,
  FileXml,
  FileCsv,
  FileYaml,
  FileSql,
  FilePython,
  FileJs,
  FileTs,
  FileReact,
  FileVue,
  FileAngular,
  FileSvelte,
  FileNext,
  FileNuxt,
  FileVite,
  FileWebpack,
  FileRollup,
  FileParcel,
  FileBabel,
  FileEslint,
  FilePrettier,
  FileJest,
  FileVitest,
  FileCypress,
  FilePlaywright,
  FileSelenium,
  FilePuppeteer,
  FileProtractor,
  FileKarma,
  FileMocha,
  FileChai,
  FileSinon,
  FileJasmine,
  FileCucumber,
  FileGherkin,
  FileBehave,
  FileRobot,
  FileKarate,
  FileRestAssured,
  FilePostman,
  FileInsomnia,
  FileGraphql,
  FileApollo,
  FilePrisma,
  FileTypeorm,
  FileSequelize,
  FileMongoose,
  FileMongo,
  FileRedis,
  FileElastic,
  FileKafka,
  FileRabbitmq,
  FileDocker,
  FileKubernetes,
  FileTerraform,
  FileAnsible,
  FileChef,
  FilePuppet,
  FileJenkins,
  FileGitlab,
  FileGithub,
  FileBitbucket,
  FileAzure,
  FileAws,
  FileGcp,
  FileDigitalocean,
  FileHeroku,
  FileVercel,
  FileNetlify,
  FileFirebase,
  FileSupabase,
  FileStrapi,
  FileSanity,
  FileContentful,
  FilePrismic,
  FileStoryblok,
  FileDato,
  FileButter,
  FileAgility,
  FileKentico,
  FileSitecore,
  FileWordpress,
  FileDrupal,
  FileJoomla,
  FileMagento,
  FileShopify,
  FileWooCommerce,
  FileBigcommerce,
  FileSquarespace,
  FileWix,
  FileWebflow,
  FileFramer,
  FileBubble,
  FileWebflow2,
  FileFigma,
  FileSketch,
  FileAdobe,
  FilePhotoshop,
  FileIllustrator,
  FileIndesign,
  FileXd,
  FilePremiere,
  FileAfterEffects,
  FileAudition,
  FileLightroom,
  FileBridge,
  FileAnimate,
  FileDimension,
  FileSubstance,
  FileMaya,
  FileBlender,
  FileCinema4d,
  FileHoudini,
  FileNuke,
  FileFusion,
  FileDaVinci,
  FileFinalCut,
  FileLogic,
  FileAbleton,
  FileProTools,
  FileGarageBand,
  FileReaper,
  FileAudacity,
  FileOBS,
  FileStreamlabs,
  FileXSplit,
  FileWirecast,
  FileVmix,
  FileTriCaster,
  FileBlackmagic,
  FileAJA,
  FileMatrox,
  FileDeckLink,
  FileUltraStudio,
  FileDuet,
  FileLuna,
  FileApollo,
  FileSaturn,
  FileJupiter,
  FileMars,
  FileVenus,
  FileMercury,
  FilePluto,
  FileNeptune,
  FileUranus,
  FileSaturn2,
  FileJupiter2,
  FileMars2,
  FileVenus2,
  FileMercury2,
  FilePluto2,
  FileNeptune2,
  FileUranus2,
} from "lucide-react"

interface ExecutionMonitorProps {
  workflowId?: string
  embedded?: boolean
}

interface Execution {
  id: string
  workflowId: string
  ruleSetId: number
  status: "pending" | "running" | "completed" | "failed" | "cancelled" | "paused"
  startTime: string
  endTime?: string
  duration?: number
  progress: number
  priority: "low" | "medium" | "high" | "critical"
  resources: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  metrics: {
    recordsProcessed: number
    recordsFailed: number
    recordsSkipped: number
    throughput: number
    latency: number
    errorRate: number
  }
  logs: ExecutionLog[]
  errors: ExecutionError[]
  warnings: ExecutionWarning[]
  result?: any
  metadata: {
    triggeredBy: string
    environment: string
    version: string
    tags: string[]
  }
}

interface ExecutionLog {
  id: string
  timestamp: string
  level: "debug" | "info" | "warning" | "error" | "critical"
  message: string
  source: string
  context?: any
}

interface ExecutionError {
  id: string
  timestamp: string
  type: string
  message: string
  stack?: string
  context?: any
  severity: "low" | "medium" | "high" | "critical"
}

interface ExecutionWarning {
  id: string
  timestamp: string
  type: string
  message: string
  context?: any
  severity: "low" | "medium" | "high"
}

interface PerformanceMetrics {
  executions: {
    total: number
    running: number
    completed: number
    failed: number
    cancelled: number
  }
  throughput: {
    average: number
    peak: number
    current: number
  }
  latency: {
    average: number
    p95: number
    p99: number
  }
  resourceUsage: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  errorRate: number
  successRate: number
}

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  workflowId,
  embedded = false,
}) => {
  // State management
  const [executions, setExecutions] = useState<Execution[]>([])
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("startTime")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000)
  const [loading, setLoading] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [showMetricsDialog, setShowMetricsDialog] = useState(false)

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Hooks
  const { getExecutions, getExecutionDetails, cancelExecution, pauseExecution, resumeExecution } = useOrchestration()

  // Effects
  useEffect(() => {
    loadExecutions()
    loadPerformanceMetrics()
  }, [workflowId])

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadExecutions()
        loadPerformanceMetrics()
      }, refreshInterval)
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh, refreshInterval])

  // Helper functions
  const loadExecutions = async () => {
    setLoading(true)
    try {
      const result = await getExecutions(workflowId)
      setExecutions(result.executions || [])
    } catch (error) {
      console.error("Error loading executions:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPerformanceMetrics = async () => {
    try {
      const result = await getExecutions(workflowId)
      // Calculate performance metrics from executions
      const metrics: PerformanceMetrics = {
        executions: {
          total: result.executions?.length || 0,
          running: result.executions?.filter(e => e.status === "running").length || 0,
          completed: result.executions?.filter(e => e.status === "completed").length || 0,
          failed: result.executions?.filter(e => e.status === "failed").length || 0,
          cancelled: result.executions?.filter(e => e.status === "cancelled").length || 0,
        },
        throughput: {
          average: 0,
          peak: 0,
          current: 0,
        },
        latency: {
          average: 0,
          p95: 0,
          p99: 0,
        },
        resourceUsage: {
          cpu: 0,
          memory: 0,
          disk: 0,
          network: 0,
        },
        errorRate: 0,
        successRate: 0,
      }
      setPerformanceMetrics(metrics)
    } catch (error) {
      console.error("Error loading performance metrics:", error)
    }
  }

  const handleCancelExecution = async (executionId: string) => {
    try {
      await cancelExecution(executionId)
      await loadExecutions()
    } catch (error) {
      console.error("Error cancelling execution:", error)
    }
  }

  const handlePauseExecution = async (executionId: string) => {
    try {
      await pauseExecution(executionId)
      await loadExecutions()
    } catch (error) {
      console.error("Error pausing execution:", error)
    }
  }

  const handleResumeExecution = async (executionId: string) => {
    try {
      await resumeExecution(executionId)
      await loadExecutions()
    } catch (error) {
      console.error("Error resuming execution:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />
      case "cancelled": return <Stop className="h-4 w-4 text-gray-500" />
      case "paused": return <Pause className="h-4 w-4 text-yellow-500" />
      case "pending": return <Clock className="h-4 w-4 text-gray-500" />
      default: return <Monitor className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "cancelled": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "paused": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "pending": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600000)
    const minutes = Math.floor((duration % 3600000) / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const filteredExecutions = useMemo(() => {
    let filtered = executions

    if (filter !== "all") {
      filtered = filtered.filter(e => e.status === filter)
    }

    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.metadata.triggeredBy.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Execution]
      const bValue = b[sortBy as keyof Execution]
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [executions, filter, searchQuery, sortBy, sortOrder])

  // Render functions
  const renderExecutionCard = (execution: Execution) => (
    <Card key={execution.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(execution.status)}
            <CardTitle className="text-lg">Execution {execution.id}</CardTitle>
            <Badge className={getStatusColor(execution.status)}>
              {execution.status}
            </Badge>
            <Badge className={getPriorityColor(execution.priority)}>
              {execution.priority}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setSelectedExecution(execution)
                setShowDetailsDialog(true)
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedExecution(execution)
                setShowLogsDialog(true)
              }}>
                <FileText className="h-4 w-4 mr-2" />
                View Logs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedExecution(execution)
                setShowMetricsDialog(true)
              }}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Metrics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {execution.status === "running" && (
                <>
                  <DropdownMenuItem onClick={() => handlePauseExecution(execution.id)}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCancelExecution(execution.id)}>
                    <Stop className="h-4 w-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
              {execution.status === "paused" && (
                <DropdownMenuItem onClick={() => handleResumeExecution(execution.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          Started at {new Date(execution.startTime).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{execution.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${execution.progress}%` }}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2">
                {execution.duration ? formatDuration(execution.duration) : "Running..."}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Records:</span>
              <span className="ml-2">
                {execution.metrics.recordsProcessed.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Throughput:</span>
              <span className="ml-2">
                {execution.metrics.throughput.toLocaleString()} rec/s
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Error Rate:</span>
              <span className="ml-2">
                {(execution.metrics.errorRate * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <Cpu className="h-4 w-4 mx-auto mb-1" />
              <div>{execution.resources.cpu.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <Memory className="h-4 w-4 mx-auto mb-1" />
              <div>{execution.resources.memory.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <HardDrive className="h-4 w-4 mx-auto mb-1" />
              <div>{execution.resources.disk.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <Network className="h-4 w-4 mx-auto mb-1" />
              <div>{execution.resources.network.toFixed(1)}%</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            {execution.metadata.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderPerformanceOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{performanceMetrics?.executions.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            {performanceMetrics?.executions.running || 0} currently running
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {performanceMetrics ? (performanceMetrics.successRate * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {performanceMetrics?.executions.completed || 0} completed successfully
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Throughput</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {performanceMetrics?.throughput.average.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            records per second
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {performanceMetrics ? (performanceMetrics.errorRate * 100).toFixed(2) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {performanceMetrics?.executions.failed || 0} failed executions
          </p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className={`space-y-4 ${embedded ? "p-0" : "p-6"}`}>
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Execution Monitor</h1>
              <p className="text-muted-foreground">
                Real-time monitoring and management of scan rule executions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadExecutions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <span className="text-sm">Auto-refresh</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Executions
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderPerformanceOverview()}
          
          {/* Recent Executions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Latest execution activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredExecutions.slice(0, 5).map(execution => (
                  <div key={execution.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      <span className="font-medium">Execution {execution.id}</span>
                      <Badge className={getStatusColor(execution.status)}>
                        {execution.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(execution.startTime).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search executions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startTime">Start Time</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>

          {/* Executions Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExecutions.map(renderExecutionCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>{performanceMetrics?.resourceUsage.cpu.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${performanceMetrics?.resourceUsage.cpu || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>{performanceMetrics?.resourceUsage.memory.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${performanceMetrics?.resourceUsage.memory || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Disk Usage</span>
                      <span>{performanceMetrics?.resourceUsage.disk.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${performanceMetrics?.resourceUsage.disk || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Network Usage</span>
                      <span>{performanceMetrics?.resourceUsage.network.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${performanceMetrics?.resourceUsage.network || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Execution performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Latency</span>
                    <span className="text-sm font-medium">
                      {performanceMetrics?.latency.average.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">P95 Latency</span>
                    <span className="text-sm font-medium">
                      {performanceMetrics?.latency.p95.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">P99 Latency</span>
                    <span className="text-sm font-medium">
                      {performanceMetrics?.latency.p99.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Throughput</span>
                    <span className="text-sm font-medium">
                      {performanceMetrics?.throughput.peak.toLocaleString()} rec/s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Execution Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
            <DialogDescription>
              Detailed information about execution {selectedExecution?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedExecution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedExecution.status)}
                    <Badge className={getStatusColor(selectedExecution.status)}>
                      {selectedExecution.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Badge className={getPriorityColor(selectedExecution.priority)}>
                    {selectedExecution.priority}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <div className="text-sm mt-1">
                    {new Date(selectedExecution.startTime).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <div className="text-sm mt-1">
                    {selectedExecution.duration ? formatDuration(selectedExecution.duration) : "Running..."}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium">Metrics</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Records Processed:</span>
                    <span className="ml-2">{selectedExecution.metrics.recordsProcessed.toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Records Failed:</span>
                    <span className="ml-2">{selectedExecution.metrics.recordsFailed.toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Throughput:</span>
                    <span className="ml-2">{selectedExecution.metrics.throughput.toLocaleString()} rec/s</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Error Rate:</span>
                    <span className="ml-2">{(selectedExecution.metrics.errorRate * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Execution Logs</DialogTitle>
            <DialogDescription>
              Log entries for execution {selectedExecution?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedExecution && (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {selectedExecution.logs.map(log => (
                  <div key={log.id} className="flex items-start gap-2 p-2 border rounded text-sm">
                    <span className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {log.level}
                    </Badge>
                    <span className="flex-1">{log.message}</span>
                    <span className="text-muted-foreground text-xs">{log.source}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}