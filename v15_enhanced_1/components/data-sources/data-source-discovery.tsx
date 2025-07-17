"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Filter,
  Database,
  Table,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Play,
  Pause,
  Stop,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  BarChart3,
  TrendingUp,
  FileText,
  Tag,
  Users,
  Calendar,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Star,
  StarOff,
  Share2,
  Copy,
  ExternalLink,
  History,
  Activity,
  Layers,
  Grid,
  List,
  TreePine,
  Network,
  Code,
  Hash,
  Type,
  Binary,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
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
} from "@/components/ui/dropdown-menu"
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Command,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { DataSource, DiscoveryJob, DiscoveredAsset, DataCatalog } from "./types"
import {
  useDiscoveryJobsQuery,
  useDiscoveredAssetsQuery,
  useDataCatalogQuery,
  useStartDiscoveryMutation,
  useStopDiscoveryMutation,
  useFavoriteAssetMutation,
} from "./services/apis"

interface DataSourceDiscoveryProps {
  dataSource: DataSource
}

export function DataSourceDiscovery({ dataSource }: DataSourceDiscoveryProps) {
  const [activeTab, setActiveTab] = useState("discovery")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "tree">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [discoveryConfig, setDiscoveryConfig] = useState({
    enabled: true,
    schedule: "0 2 * * *", // Daily at 2 AM
    depth: "full",
    include_pii: false,
    include_metadata: true,
    sample_size: 1000,
  })

  // Queries
  const { data: discoveryJobs, isLoading: jobsLoading } = useDiscoveryJobsQuery(dataSource.id)
  const { data: discoveredAssets, isLoading: assetsLoading } = useDiscoveredAssetsQuery(dataSource.id, {
    search: searchQuery,
    filters: selectedFilters,
  })
  const { data: dataCatalog, isLoading: catalogLoading } = useDataCatalogQuery(dataSource.id)

  // Mutations
  const startDiscoveryMutation = useStartDiscoveryMutation()
  const stopDiscoveryMutation = useStopDiscoveryMutation()
  const favoriteAssetMutation = useFavoriteAssetMutation()

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    if (!discoveredAssets) return []
    
    let filtered = discoveredAssets.filter(asset => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          asset.name.toLowerCase().includes(query) ||
          asset.schema?.toLowerCase().includes(query) ||
          asset.description?.toLowerCase().includes(query) ||
          asset.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }
      return true
    })

    // Apply filters
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(asset => {
          switch (key) {
            case "type":
              return values.includes(asset.asset_type)
            case "schema":
              return values.includes(asset.schema || "")
            case "status":
              return values.includes(asset.status)
            case "pii":
              return values.includes(asset.contains_pii ? "yes" : "no")
            default:
              return true
          }
        })
      }
    })

    return filtered
  }, [discoveredAssets, searchQuery, selectedFilters])

  const handleStartDiscovery = async () => {
    try {
      await startDiscoveryMutation.mutateAsync({
        data_source_id: dataSource.id,
        config: discoveryConfig,
      })
    } catch (error) {
      console.error("Failed to start discovery:", error)
    }
  }

  const handleStopDiscovery = async (jobId: string) => {
    try {
      await stopDiscoveryMutation.mutateAsync(jobId)
    } catch (error) {
      console.error("Failed to stop discovery:", error)
    }
  }

  const handleToggleFavorite = async (assetId: string) => {
    try {
      await favoriteAssetMutation.mutateAsync(assetId)
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    }
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "table":
        return <Table className="h-4 w-4" />
      case "view":
        return <Eye className="h-4 w-4" />
      case "procedure":
        return <Code className="h-4 w-4" />
      case "function":
        return <Zap className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "deprecated":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "N/A"
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Discovery</h2>
          <p className="text-muted-foreground">
            Discover, catalog, and manage data assets from {dataSource.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button onClick={handleStartDiscovery} disabled={startDiscoveryMutation.isPending}>
            <Play className="h-4 w-4 mr-2" />
            {startDiscoveryMutation.isPending ? "Starting..." : "Start Discovery"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discovery">Discovery Jobs</TabsTrigger>
          <TabsTrigger value="assets">Discovered Assets</TabsTrigger>
          <TabsTrigger value="catalog">Data Catalog</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* Discovery Jobs Tab */}
        <TabsContent value="discovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discovery Jobs</CardTitle>
              <CardDescription>Monitor and manage data discovery operations</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {discoveryJobs?.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {job.status === "running" && <Play className="h-4 w-4 text-blue-500" />}
                            {job.status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {job.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                            {job.status === "stopped" && <Stop className="h-4 w-4 text-gray-500" />}
                          </div>
                          <div>
                            <h4 className="font-medium">Discovery Job #{job.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              Started: {new Date(job.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={job.status === "running" ? "default" : "outline"}>
                            {job.status}
                          </Badge>
                          {job.status === "running" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStopDiscovery(job.id)}
                            >
                              <Stop className="h-4 w-4 mr-2" />
                              Stop
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {job.status === "running" && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} className="w-full" />
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium">Assets Found</p>
                          <p className="text-2xl font-bold">{job.assets_discovered || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Tables Scanned</p>
                          <p className="text-2xl font-bold">{job.tables_scanned || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">PII Detected</p>
                          <p className="text-2xl font-bold">{job.pii_fields_found || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Duration</p>
                          <p className="text-2xl font-bold">{job.duration || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discovered Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets by name, schema, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">
                        <div className="flex items-center gap-2">
                          <Grid className="h-4 w-4" />
                          Grid
                        </div>
                      </SelectItem>
                      <SelectItem value="list">
                        <div className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          List
                        </div>
                      </SelectItem>
                      <SelectItem value="tree">
                        <div className="flex items-center gap-2">
                          <TreePine className="h-4 w-4" />
                          Tree
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  {/* Asset Type Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Asset Type</Label>
                    <Select
                      value={selectedFilters.type?.[0] || ""}
                      onValueChange={(value) =>
                        setSelectedFilters(prev => ({
                          ...prev,
                          type: value ? [value] : []
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All types</SelectItem>
                        <SelectItem value="table">Tables</SelectItem>
                        <SelectItem value="view">Views</SelectItem>
                        <SelectItem value="procedure">Procedures</SelectItem>
                        <SelectItem value="function">Functions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Schema Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Schema</Label>
                    <Select
                      value={selectedFilters.schema?.[0] || ""}
                      onValueChange={(value) =>
                        setSelectedFilters(prev => ({
                          ...prev,
                          schema: value ? [value] : []
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All schemas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All schemas</SelectItem>
                        {/* Dynamic schema options */}
                        <SelectItem value="public">public</SelectItem>
                        <SelectItem value="staging">staging</SelectItem>
                        <SelectItem value="analytics">analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* PII Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Contains PII</Label>
                    <Select
                      value={selectedFilters.pii?.[0] || ""}
                      onValueChange={(value) =>
                        setSelectedFilters(prev => ({
                          ...prev,
                          pii: value ? [value] : []
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All assets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All assets</SelectItem>
                        <SelectItem value="yes">Contains PII</SelectItem>
                        <SelectItem value="no">No PII</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <Select
                      value={selectedFilters.status?.[0] || ""}
                      onValueChange={(value) =>
                        setSelectedFilters(prev => ({
                          ...prev,
                          status: value ? [value] : []
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assets Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Discovered Assets</CardTitle>
                  <CardDescription>
                    {filteredAssets.length} assets found
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {assetsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets.map((asset) => (
                    <Card key={asset.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getAssetIcon(asset.asset_type)}
                            <h4 className="font-medium truncate">{asset.name}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFavorite(asset.id)}
                            >
                              {asset.is_favorite ? (
                                <Star className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Path
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {asset.schema}
                          </Badge>
                          {getStatusIcon(asset.status)}
                          {asset.contains_pii && (
                            <Badge variant="destructive" className="text-xs">
                              PII
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {asset.description || "No description available"}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Rows:</span>{" "}
                            {asset.row_count?.toLocaleString() || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Size:</span>{" "}
                            {formatFileSize(asset.size_bytes)}
                          </div>
                          <div>
                            <span className="font-medium">Columns:</span>{" "}
                            {asset.column_count || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Updated:</span>{" "}
                            {asset.last_updated ? new Date(asset.last_updated).toLocaleDateString() : "N/A"}
                          </div>
                        </div>
                        {asset.tags && asset.tags.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {asset.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {asset.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{asset.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : viewMode === "list" ? (
                <UITable>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Schema</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rows</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAssetIcon(asset.asset_type)}
                            <div>
                              <div className="font-medium">{asset.name}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {asset.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.asset_type}</Badge>
                        </TableCell>
                        <TableCell>{asset.schema}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(asset.status)}
                            <span className="capitalize">{asset.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>{asset.row_count?.toLocaleString() || "N/A"}</TableCell>
                        <TableCell>{formatFileSize(asset.size_bytes)}</TableCell>
                        <TableCell>
                          {asset.last_updated ? new Date(asset.last_updated).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFavorite(asset.id)}
                            >
                              {asset.is_favorite ? (
                                <Star className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Path
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </UITable>
              ) : (
                // Tree view implementation
                <div className="space-y-2">
                  {Object.entries(
                    filteredAssets.reduce((acc, asset) => {
                      const schema = asset.schema || "unknown"
                      if (!acc[schema]) acc[schema] = []
                      acc[schema].push(asset)
                      return acc
                    }, {} as Record<string, typeof filteredAssets>)
                  ).map(([schema, assets]) => (
                    <Collapsible key={schema}>
                      <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted rounded">
                        <ChevronRight className="h-4 w-4" />
                        <Database className="h-4 w-4" />
                        <span className="font-medium">{schema}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {assets.length}
                        </Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ml-6 space-y-1">
                        {assets.map((asset) => (
                          <div key={asset.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                            {getAssetIcon(asset.asset_type)}
                            <span>{asset.name}</span>
                            <div className="ml-auto flex items-center gap-2">
                              {asset.contains_pii && (
                                <Badge variant="destructive" className="text-xs">
                                  PII
                                </Badge>
                              )}
                              {getStatusIcon(asset.status)}
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Catalog</CardTitle>
              <CardDescription>Organized view of your data assets with metadata</CardDescription>
            </CardHeader>
            <CardContent>
              {catalogLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Catalog Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <Database className="h-8 w-8 text-blue-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                            <p className="text-2xl font-bold">{dataCatalog?.total_assets || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <Tag className="h-8 w-8 text-green-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Tagged Assets</p>
                            <p className="text-2xl font-bold">{dataCatalog?.tagged_assets || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <Lock className="h-8 w-8 text-red-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">PII Assets</p>
                            <p className="text-2xl font-bold">{dataCatalog?.pii_assets || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-purple-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">Documented</p>
                            <p className="text-2xl font-bold">{dataCatalog?.documented_assets || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Popular Tags */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Popular Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {dataCatalog?.popular_tags?.map((tag) => (
                          <Badge key={tag.name} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                            {tag.name} ({tag.count})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Schema Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Schema Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dataCatalog?.schemas?.map((schema) => (
                          <div key={schema.name} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{schema.name}</h4>
                              <Badge variant="outline">{schema.asset_count} assets</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {schema.description || "No description available"}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div>Tables: {schema.table_count}</div>
                              <div>Views: {schema.view_count}</div>
                              <div>Functions: {schema.function_count}</div>
                              <div>Procedures: {schema.procedure_count}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discovery Configuration</CardTitle>
              <CardDescription>Configure how data discovery works for this data source</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="discovery-enabled"
                  checked={discoveryConfig.enabled}
                  onCheckedChange={(checked) =>
                    setDiscoveryConfig(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <Label htmlFor="discovery-enabled">Enable automatic discovery</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Discovery Schedule (Cron)</Label>
                  <Input
                    id="schedule"
                    value={discoveryConfig.schedule}
                    onChange={(e) =>
                      setDiscoveryConfig(prev => ({ ...prev, schedule: e.target.value }))
                    }
                    placeholder="0 2 * * *"
                  />
                  <p className="text-xs text-muted-foreground">
                    Daily at 2 AM (0 2 * * *)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depth">Discovery Depth</Label>
                  <Select
                    value={discoveryConfig.depth}
                    onValueChange={(value) =>
                      setDiscoveryConfig(prev => ({ ...prev, depth: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metadata">Metadata Only</SelectItem>
                      <SelectItem value="sample">Sample Data</SelectItem>
                      <SelectItem value="full">Full Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sample-size">Sample Size (rows)</Label>
                  <Input
                    id="sample-size"
                    type="number"
                    min="100"
                    max="10000"
                    value={discoveryConfig.sample_size}
                    onChange={(e) =>
                      setDiscoveryConfig(prev => ({ ...prev, sample_size: parseInt(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-pii"
                    checked={discoveryConfig.include_pii}
                    onCheckedChange={(checked) =>
                      setDiscoveryConfig(prev => ({ ...prev, include_pii: checked }))
                    }
                  />
                  <Label htmlFor="include-pii">Scan for PII (Personally Identifiable Information)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-metadata"
                    checked={discoveryConfig.include_metadata}
                    onCheckedChange={(checked) =>
                      setDiscoveryConfig(prev => ({ ...prev, include_metadata: checked }))
                    }
                  />
                  <Label htmlFor="include-metadata">Include extended metadata</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>Save Configuration</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}