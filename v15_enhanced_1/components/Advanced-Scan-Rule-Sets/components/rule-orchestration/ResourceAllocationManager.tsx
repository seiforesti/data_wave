"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useOrchestration } from "../../hooks/useOrchestration"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Cpu,
  Memory,
  HardDrive,
  Network,
  Server,
  Cloud,
  Settings,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Database,
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

interface ResourceAllocationManagerProps {
  workflowId?: string
  embedded?: boolean
}

interface ResourcePool {
  id: string
  name: string
  description: string
  type: "cpu" | "memory" | "storage" | "network"
  capacity: number
  allocated: number
  available: number
  unit: string
  status: "available" | "allocated" | "overloaded" | "maintenance"
  priority: "low" | "medium" | "high" | "critical"
  tags: string[]
  metadata: {
    location: string
    provider: string
    cost: number
    lastUpdated: string
  }
}

interface ResourceAllocation {
  id: string
  resourcePoolId: string
  workflowId: string
  ruleSetId: number
  amount: number
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "allocated" | "released" | "failed"
  startTime: string
  endTime?: string
  duration?: number
  metadata: {
    requestedBy: string
    reason: string
    tags: string[]
  }
}

interface ResourceMetrics {
  totalCapacity: number
  totalAllocated: number
  totalAvailable: number
  utilizationRate: number
  efficiency: number
  costPerHour: number
  trends: {
    cpu: number[]
    memory: number[]
    storage: number[]
    network: number[]
  }
}

export const ResourceAllocationManager: React.FC<ResourceAllocationManagerProps> = ({
  workflowId,
  embedded = false,
}) => {
  // State management
  const [resourcePools, setResourcePools] = useState<ResourcePool[]>([])
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([])
  const [selectedPool, setSelectedPool] = useState<ResourcePool | null>(null)
  const [selectedAllocation, setSelectedAllocation] = useState<ResourceAllocation | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(false)
  const [showAllocateDialog, setShowAllocateDialog] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)

  // Form state
  const [allocationForm, setAllocationForm] = useState({
    resourcePoolId: "",
    amount: 0,
    priority: "medium" as const,
    reason: "",
    tags: [] as string[],
  })

  // Hooks
  const { getResourcePools, allocateResource, releaseResource, getResourceMetrics } = useOrchestration()

  // Effects
  useEffect(() => {
    loadResourcePools()
    loadAllocations()
  }, [workflowId])

  // Helper functions
  const loadResourcePools = async () => {
    setLoading(true)
    try {
      const result = await getResourcePools()
      setResourcePools(result.pools || [])
    } catch (error) {
      console.error("Error loading resource pools:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllocations = async () => {
    try {
      const result = await getResourcePools()
      setAllocations(result.allocations || [])
    } catch (error) {
      console.error("Error loading allocations:", error)
    }
  }

  const handleAllocateResource = async () => {
    setLoading(true)
    try {
      await allocateResource({
        ...allocationForm,
        workflowId: workflowId || "",
      })
      await loadResourcePools()
      await loadAllocations()
      setShowAllocateDialog(false)
      resetAllocationForm()
    } catch (error) {
      console.error("Error allocating resource:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReleaseResource = async (allocationId: string) => {
    setLoading(true)
    try {
      await releaseResource(allocationId)
      await loadResourcePools()
      await loadAllocations()
      setShowReleaseDialog(false)
    } catch (error) {
      console.error("Error releasing resource:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetAllocationForm = () => {
    setAllocationForm({
      resourcePoolId: "",
      amount: 0,
      priority: "medium",
      reason: "",
      tags: [],
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "allocated": return <Activity className="h-4 w-4 text-blue-500" />
      case "overloaded": return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "maintenance": return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "allocated": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "overloaded": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "maintenance": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "cpu": return <Cpu className="h-4 w-4" />
      case "memory": return <Memory className="h-4 w-4" />
      case "storage": return <HardDrive className="h-4 w-4" />
      case "network": return <Network className="h-4 w-4" />
      default: return <Server className="h-4 w-4" />
    }
  }

  const calculateUtilization = (pool: ResourcePool) => {
    return (pool.allocated / pool.capacity) * 100
  }

  const filteredPools = useMemo(() => {
    let filtered = resourcePools

    if (filter !== "all") {
      filtered = filtered.filter(p => p.status === filter)
    }

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof ResourcePool]
      const bValue = b[sortBy as keyof ResourcePool]
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [resourcePools, filter, searchQuery, sortBy, sortOrder])

  // Render functions
  const renderResourcePoolCard = (pool: ResourcePool) => (
    <Card key={pool.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getResourceIcon(pool.type)}
            <CardTitle className="text-lg">{pool.name}</CardTitle>
            <Badge className={getStatusColor(pool.status)}>
              {pool.status}
            </Badge>
            <Badge className={getPriorityColor(pool.priority)}>
              {pool.priority}
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
                setSelectedPool(pool)
                setAllocationForm(prev => ({ ...prev, resourcePoolId: pool.id }))
                setShowAllocateDialog(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Allocate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPool(pool)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>{pool.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Utilization Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Utilization</span>
              <span>{calculateUtilization(pool).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  calculateUtilization(pool) > 90 ? "bg-red-500" :
                  calculateUtilization(pool) > 70 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(calculateUtilization(pool), 100)}%` }}
              />
            </div>
          </div>

          {/* Resource Details */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Capacity:</span>
              <div className="font-medium">{pool.capacity.toLocaleString()} {pool.unit}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Allocated:</span>
              <div className="font-medium">{pool.allocated.toLocaleString()} {pool.unit}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Available:</span>
              <div className="font-medium">{pool.available.toLocaleString()} {pool.unit}</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground">
            <div>Location: {pool.metadata.location}</div>
            <div>Provider: {pool.metadata.provider}</div>
            <div>Cost: ${pool.metadata.cost}/hour</div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            {pool.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderAllocationCard = (allocation: ResourceAllocation) => {
    const pool = resourcePools.find(p => p.id === allocation.resourcePoolId)
    
    return (
      <Card key={allocation.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pool && getResourceIcon(pool.type)}
              <CardTitle className="text-lg">Allocation {allocation.id}</CardTitle>
              <Badge className={getStatusColor(allocation.status)}>
                {allocation.status}
              </Badge>
              <Badge className={getPriorityColor(allocation.priority)}>
                {allocation.priority}
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
                {allocation.status === "allocated" && (
                  <DropdownMenuItem onClick={() => {
                    setSelectedAllocation(allocation)
                    setShowReleaseDialog(true)
                  }}>
                    <Minus className="h-4 w-4 mr-2" />
                    Release
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setSelectedAllocation(allocation)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>
            {pool?.name} - {allocation.amount.toLocaleString()} {pool?.unit}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Start Time:</span>
                <div>{new Date(allocation.startTime).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <div>
                  {allocation.duration ? 
                    `${Math.floor(allocation.duration / 3600000)}h ${Math.floor((allocation.duration % 3600000) / 60000)}m` : 
                    "Running..."
                  }
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-muted-foreground text-sm">Reason:</span>
              <div className="text-sm">{allocation.metadata.reason}</div>
            </div>

            <div className="flex items-center gap-2">
              {allocation.metadata.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${embedded ? "p-0" : "p-6"}`}>
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Resource Allocation Manager</h1>
              <p className="text-muted-foreground">
                Advanced resource management and allocation for scan rule execution
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadResourcePools}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowAllocateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Allocate Resource
            </Button>
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
          <TabsTrigger value="pools" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Resource Pools
          </TabsTrigger>
          <TabsTrigger value="allocations" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Allocations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Resource Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resourcePools.reduce((sum, pool) => sum + pool.capacity, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {resourcePools.length} pools
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resourcePools.reduce((sum, pool) => sum + pool.allocated, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {allocations.filter(a => a.status === "allocated").length} active allocations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resourcePools.length > 0 ? 
                    (resourcePools.reduce((sum, pool) => sum + calculateUtilization(pool), 0) / resourcePools.length).toFixed(1) : 
                    0
                  }%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average across all pools
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Resources</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resourcePools.reduce((sum, pool) => sum + pool.available, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready for allocation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resource Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Type Breakdown</CardTitle>
              <CardDescription>Allocation by resource type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {["cpu", "memory", "storage", "network"].map(type => {
                  const pools = resourcePools.filter(p => p.type === type)
                  const totalCapacity = pools.reduce((sum, pool) => sum + pool.capacity, 0)
                  const totalAllocated = pools.reduce((sum, pool) => sum + pool.allocated, 0)
                  
                  return (
                    <div key={type} className="text-center">
                      {getResourceIcon(type)}
                      <div className="text-lg font-medium capitalize">{type}</div>
                      <div className="text-sm text-muted-foreground">
                        {totalAllocated.toLocaleString()} / {totalCapacity.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {totalCapacity > 0 ? ((totalAllocated / totalCapacity) * 100).toFixed(1) : 0}% used
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="overloaded">Overloaded</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search pools..."
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
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
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

          {/* Resource Pools Grid */}
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
              {filteredPools.map(renderResourcePoolCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          {/* Allocations List */}
          <div className="space-y-4">
            {allocations.map(renderAllocationCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Allocate Resource Dialog */}
      <Dialog open={showAllocateDialog} onOpenChange={setShowAllocateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Allocate Resource</DialogTitle>
            <DialogDescription>
              Allocate resources from available pools
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Resource Pool</label>
              <Select
                value={allocationForm.resourcePoolId}
                onValueChange={(value) => setAllocationForm(prev => ({ ...prev, resourcePoolId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a resource pool" />
                </SelectTrigger>
                <SelectContent>
                  {resourcePools.filter(p => p.status === "available").map(pool => (
                    <SelectItem key={pool.id} value={pool.id}>
                      {pool.name} ({pool.available.toLocaleString()} {pool.unit} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                value={allocationForm.amount}
                onChange={(e) => setAllocationForm(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={allocationForm.priority}
                onValueChange={(value: "low" | "medium" | "high" | "critical") => 
                  setAllocationForm(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Input
                value={allocationForm.reason}
                onChange={(e) => setAllocationForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter allocation reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAllocateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAllocateResource} disabled={loading}>
              {loading ? "Allocating..." : "Allocate Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Resource Dialog */}
      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Release Resource</DialogTitle>
            <DialogDescription>
              Release allocated resource back to the pool
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAllocation && (
              <div>
                <p className="text-sm">
                  Are you sure you want to release <strong>{selectedAllocation.amount.toLocaleString()}</strong> units
                  from allocation <strong>{selectedAllocation.id}</strong>?
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedAllocation && handleReleaseResource(selectedAllocation.id)} 
              disabled={loading}
            >
              {loading ? "Releasing..." : "Release Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}