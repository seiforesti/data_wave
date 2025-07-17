"use client"

import { useState, useMemo } from "react"
import {
  Database,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Monitor,
  Cloud,
  Shield,
  TrendingUp,
  Activity,
  FileText,
  Copy,
  ExternalLink,
  ChevronDown,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

import { DataSource, ViewMode } from "./types"

interface DataSourceGridProps {
  dataSources?: DataSource[]
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  selectedItems?: string[]
  onSelectionChange?: (items: string[]) => void
  filters?: any
  onFiltersChange?: (filters: any) => void
  onSelectDataSource?: (dataSource: DataSource) => void
  dataSource?: DataSource | null
}

const statusConfig = {
  connected: { 
    icon: CheckCircle, 
    color: "text-green-500", 
    bg: "bg-green-50 dark:bg-green-950",
    badge: "default" as const
  },
  error: { 
    icon: AlertTriangle, 
    color: "text-red-500", 
    bg: "bg-red-50 dark:bg-red-950",
    badge: "destructive" as const
  },
  warning: { 
    icon: Clock, 
    color: "text-yellow-500", 
    bg: "bg-yellow-50 dark:bg-yellow-950",
    badge: "secondary" as const
  },
  offline: { 
    icon: AlertTriangle, 
    color: "text-gray-500", 
    bg: "bg-gray-50 dark:bg-gray-950",
    badge: "outline" as const
  },
}

const typeIcons = {
  postgresql: Database,
  mysql: Database,
  mongodb: Database,
  redis: Database,
  elasticsearch: Search,
  s3: Cloud,
  azure: Cloud,
  gcp: Cloud,
  api: ExternalLink,
  file: FileText,
}

export function DataSourceGrid({
  dataSources = [],
  viewMode = "grid",
  onViewModeChange,
  selectedItems = [],
  onSelectionChange,
  filters = {},
  onFiltersChange,
  onSelectDataSource,
  dataSource
}: DataSourceGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("medium")

  // Filter and sort data sources
  const filteredDataSources = useMemo(() => {
    let filtered = dataSources.filter(ds => {
      const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ds.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ds.type.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = !filters.type || filters.type === "all" || ds.type === filters.type
      const matchesStatus = !filters.status || filters.status === "all" || ds.status === filters.status
      const matchesEnvironment = !filters.environment || filters.environment === "all" || ds.environment === filters.environment
      
      return matchesSearch && matchesType && matchesStatus && matchesEnvironment
    })

    // Sort
    filtered.sort((a, b) => {
      let valueA: any, valueB: any
      
      switch (sortBy) {
        case "name":
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case "type":
          valueA = a.type
          valueB = b.type
          break
        case "status":
          valueA = a.status
          valueB = b.status
          break
        case "updated":
          valueA = new Date(a.updated_at || 0)
          valueB = new Date(b.updated_at || 0)
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0
      }
    })

    return filtered
  }, [dataSources, searchQuery, filters, sortBy, sortOrder])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(filteredDataSources.map(ds => ds.id.toString()))
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectItem = (dataSourceId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedItems, dataSourceId])
    } else {
      onSelectionChange?.(selectedItems.filter(id => id !== dataSourceId))
    }
  }

  const getGridColumns = () => {
    switch (gridSize) {
      case "small": return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      case "medium": return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      case "large": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      default: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    }
  }

  const getHealthScore = (dataSource: DataSource) => {
    // Mock health score calculation
    const baseScore = dataSource.status === "connected" ? 85 : 
                     dataSource.status === "warning" ? 65 : 
                     dataSource.status === "error" ? 25 : 50
    return Math.min(100, baseScore + Math.random() * 15)
  }

  const DataSourceCard = ({ dataSource }: { dataSource: DataSource }) => {
    const StatusIcon = statusConfig[dataSource.status as keyof typeof statusConfig]?.icon || AlertTriangle
    const TypeIcon = typeIcons[dataSource.type as keyof typeof typeIcons] || Database
    const status = statusConfig[dataSource.status as keyof typeof statusConfig]
    const healthScore = getHealthScore(dataSource)
    const isSelected = selectedItems.includes(dataSource.id.toString())

    return (
      <Card 
        className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 ${
          isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/50"
        }`}
        onClick={() => onSelectDataSource?.(dataSource)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleSelectItem(dataSource.id.toString(), checked as boolean)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className={`p-2 rounded-lg ${status?.bg}`}>
                <TypeIcon className="h-4 w-4" />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Monitor className="h-4 w-4 mr-2" />
                  Monitor
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-lg truncate" title={dataSource.name}>
              {dataSource.name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={status?.badge} className="text-xs">
                <StatusIcon className="h-3 w-3 mr-1" />
                {dataSource.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {dataSource.type}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Health Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Health Score</span>
                <span className="font-medium">{Math.round(healthScore)}%</span>
              </div>
              <Progress value={healthScore} className="h-2" />
            </div>

            {/* Connection Info */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Host:</span>
                <span className="truncate ml-2 max-w-[120px]" title={dataSource.host}>
                  {dataSource.host}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Port:</span>
                <span>{dataSource.port}</span>
              </div>
              {dataSource.environment && (
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <Badge variant="outline" className="text-xs h-5">
                    {dataSource.environment}
                  </Badge>
                </div>
              )}
            </div>

            {/* Description */}
            {dataSource.description && (
              <p className="text-sm text-muted-foreground line-clamp-2" title={dataSource.description}>
                {dataSource.description}
              </p>
            )}

            {/* Quick Actions */}
            <div className="flex space-x-2 pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Activity className="h-3 w-3 mr-1" />
                      Monitor
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View real-time monitoring</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View analytics dashboard</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-muted-foreground border-t pt-2">
              Updated {dataSource.updated_at ? new Date(dataSource.updated_at).toLocaleDateString() : "Never"}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Data Sources</h2>
          <p className="text-muted-foreground">
            {filteredDataSources.length} of {dataSources.length} data sources
            {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={gridSize} onValueChange={(value: "small" | "medium" | "large") => setGridSize(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search data sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="type">Sort by Type</SelectItem>
              <SelectItem value="status">Sort by Status</SelectItem>
              <SelectItem value="updated">Sort by Updated</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${
              sortOrder === "desc" ? "rotate-180" : ""
            }`} />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedItems.length === filteredDataSources.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedItems.length} selected
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Start Monitoring
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Bulk Edit
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className={`grid gap-6 ${getGridColumns()}`}>
        {filteredDataSources.map((dataSource) => (
          <DataSourceCard key={dataSource.id} dataSource={dataSource} />
        ))}
      </div>

      {/* Empty State */}
      {filteredDataSources.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No data sources found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "Get started by creating your first data source"
            }
          </p>
          {(!searchQuery && Object.keys(filters).length === 0) && (
            <Button>
              <Database className="h-4 w-4 mr-2" />
              Add Data Source
            </Button>
          )}
        </div>
      )}
    </div>
  )
}