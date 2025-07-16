"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Database,
  Plus,
  Filter,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Activity,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Play,
  Shield,
  FileText,
  HardDrive,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  Copy,
  ExternalLink,
  BarChart3,
  Layers,
  Star,
  StarOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Import types and services
import { DataSource, ViewMode, DataSourceFilters } from "./types"
import { 
  useDataSourcesQuery,
  useCreateDataSourceMutation,
  useUpdateDataSourceMutation,
  useDeleteDataSourceMutation,
  useTestDataSourceConnectionMutation,
  useStartDataSourceScanMutation
} from "./services/apis"
import { useDataSourceFilters } from "./hooks/useDataSourceFilters"
import { useBulkActions } from "./hooks/useBulkActions"

// Import components
import { DataSourceDetails } from "./data-source-details"
import { DataSourceCreateModal } from "./data-source-create-modal"
import { DataSourceEditModal } from "./data-source-edit-modal"
import { DataSourceConnectionTestModal } from "./data-source-connection-test-modal"

export function DataSourcesApp() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showFiltersSheet, setShowFiltersSheet] = useState(false)
  const [selectedForAction, setSelectedForAction] = useState<DataSource | null>(null)

  // Auto-refresh settings
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)
  const [compactView, setCompactView] = useState(false)

  // Backend data fetching
  const { 
    data: dataSources = [], 
    isLoading, 
    error, 
    refetch 
  } = useDataSourcesQuery({}, { 
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
    staleTime: 1 * 60 * 1000 // 1 minute
  })

  // Custom hooks
  const {
    filters,
    sortConfig,
    filteredAndSortedDataSources,
    filterOptions,
    updateFilter,
    setSortConfig,
    clearFilters,
    hasActiveFilters
  } = useDataSourceFilters(dataSources)

  const {
    selectedIds,
    selectedDataSources,
    isAllSelected,
    isIndeterminate,
    isDialogOpen: showBulkActionsDialog,
    actionType: bulkActionType,
    bulkActions,
    toggleSelectAll,
    toggleSelectItem,
    clearSelection,
    openBulkAction,
    closeBulkAction,
    executeBulkDelete,
    executeBulkUpdate,
    isLoading: isBulkLoading
  } = useBulkActions(dataSources)

  // Mutations
  const createMutation = useCreateDataSourceMutation()
  const updateMutation = useUpdateDataSourceMutation()
  const deleteMutation = useDeleteDataSourceMutation()
  const testConnectionMutation = useTestDataSourceConnectionMutation()
  const startScanMutation = useStartDataSourceScanMutation()

  // Initialize from URL params
  useEffect(() => {
    const id = searchParams.get("id")
    const view = searchParams.get("view") as ViewMode

    if (id && dataSources.length > 0) {
      const dataSource = dataSources.find((ds) => ds.id === Number.parseInt(id))
      if (dataSource) {
        setSelectedDataSource(dataSource)
        setViewMode("details")
      }
    }

    if (view && ["grid", "list", "details", "kanban"].includes(view)) {
      setViewMode(view)
    }
  }, [searchParams, dataSources])

  // Handlers
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const handleCreateDataSource = async (dataSourceData: any) => {
    try {
      await createMutation.mutateAsync(dataSourceData)
      setShowCreateModal(false)
    } catch (error) {
      console.error("Failed to create data source:", error)
    }
  }

  const handleEditDataSource = (dataSource: DataSource) => {
    setSelectedForAction(dataSource)
    setShowEditModal(true)
  }

  const handleUpdateDataSource = async (id: number, updates: any) => {
    try {
      await updateMutation.mutateAsync({ id, ...updates })
      setShowEditModal(false)
      setSelectedForAction(null)
    } catch (error) {
      console.error("Failed to update data source:", error)
    }
  }

  const handleDeleteDataSource = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      setShowDeleteDialog(false)
      setSelectedForAction(null)
    } catch (error) {
      console.error("Failed to delete data source:", error)
    }
  }

  const handleTestConnection = async (id: number) => {
    try {
      const result = await testConnectionMutation.mutateAsync(id)
      return result
    } catch (error) {
      console.error("Connection test failed:", error)
      throw error
    }
  }

  const handleStartScan = async (id: number) => {
    try {
      await startScanMutation.mutateAsync(id)
    } catch (error) {
      console.error("Failed to start scan:", error)
    }
  }

  const handleViewDetails = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource)
    setViewMode("details")
    router.push(`?id=${dataSource.id}&view=details`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Activity className="h-4 w-4 text-yellow-500" />
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "maintenance":
        return <Settings className="h-4 w-4 text-orange-500" />
      default:
        return <Database className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default"
      case "error":
        return "destructive"
      case "pending":
      case "syncing":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load data sources. Please try again later.
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
                </Button>
          </AlertDescription>
        </Alert>
              </div>
    )
  }

  // Show details view
  if (viewMode === "details" && selectedDataSource) {
    return (
      <DataSourceDetails
        dataSourceId={selectedDataSource.id}
        onEdit={handleEditDataSource}
        onDelete={handleDeleteDataSource}
        onTestConnection={handleTestConnection}
        onStartScan={handleStartScan}
      />
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
                <p className="text-muted-foreground">
              Manage and monitor your data source connections
              {filteredAndSortedDataSources.length > 0 && (
                <span className="ml-2">
                  ({filteredAndSortedDataSources.length} of {dataSources.length})
                </span>
              )}
                </p>
              </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
                  </Button>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Data Source
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search data sources..."
                value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className="pl-10"
              />
            </div>

                <Select value={filters.type} onValueChange={(value) => updateFilter("type", value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                    {filterOptions.types.map((type) => (
                  <SelectItem key={type} value={type}>
                        {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

                <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                  <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                    {filterOptions.statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="gap-2">
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
            <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
              <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                      Advanced Filters
                </Button>
              </SheetTrigger>
                  <SheetContent>
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                      <SheetDescription>
                        Apply additional filters to refine your data source list
                      </SheetDescription>
                </SheetHeader>
                    {/* Advanced filter controls would go here */}
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>View Options</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                      <DropdownMenuRadioItem value="grid">Grid View</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="list">List View</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="kanban">Kanban View</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}>
                      {showAdvancedMetrics ? "Hide" : "Show"} Advanced Metrics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCompactView(!compactView)}>
                      {compactView ? "Disable" : "Enable"} Compact View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                  </div>
                  </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate
                    }}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    {selectedIds.size} of {filteredAndSortedDataSources.length} selected
                  </span>
                      </div>
                <div className="flex items-center gap-2">
                  {bulkActions.map((action) => (
                    <Button
                      key={action.id}
                      variant={action.variant}
                      size="sm"
                      disabled={action.disabled || isBulkLoading}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                  ))}
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                    </div>
                  </div>
            </CardContent>
          </Card>
        )}

        {/* Data Sources Grid/List */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                      </div>
                </CardContent>
              </Card>
            ))}
                    </div>
        ) : filteredAndSortedDataSources.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No data sources found</h3>
              <p className="text-muted-foreground mb-4">
                {dataSources.length === 0
                  ? "Get started by adding your first data source"
                  : "Try adjusting your filters or search terms"}
              </p>
              {dataSources.length === 0 && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Data Source
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedDataSources.map((dataSource) => (
              <Card key={dataSource.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedIds.has(dataSource.id)}
                        onCheckedChange={() => toggleSelectItem(dataSource.id)}
                      />
                      <Database className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{dataSource.name}</h3>
                        <p className="text-sm text-muted-foreground">{dataSource.source_type}</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(dataSource.status || 'pending')}
                      <Badge variant={getStatusVariant(dataSource.status || 'pending')}>
                        {dataSource.status || 'pending'}
                                </Badge>
                            </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>{dataSource.host}:{dataSource.port}</p>
                    {dataSource.database_name && <p>Database: {dataSource.database_name}</p>}
                  </div>

                  {showAdvancedMetrics && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {dataSource.health_score && (
                        <div>
                          <span className="text-muted-foreground">Health:</span>
                          <span className="font-medium ml-1">{dataSource.health_score}%</span>
                </div>
                      )}
                      {dataSource.compliance_score && (
                        <div>
                          <span className="text-muted-foreground">Compliance:</span>
                          <span className="font-medium ml-1">{dataSource.compliance_score}%</span>
          </div>
                      )}
            </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(dataSource)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditDataSource(dataSource)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedForAction(dataSource)
                          setShowTestModal(true)
                        }}>
                          <Activity className="h-4 w-4 mr-2" />
                          Test Connection
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartScan(dataSource.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Scan
                        </DropdownMenuItem>
                <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedForAction(dataSource)
                            setShowDeleteDialog(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
                </CardContent>
              </Card>
            ))}
        </div>
        ) : (
              <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate
                      }}
                      onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                  <TableHead>Host</TableHead>
                        <TableHead>Status</TableHead>
                  {showAdvancedMetrics && (
                    <>
                        <TableHead>Health</TableHead>
                        <TableHead>Compliance</TableHead>
                    </>
                  )}
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedDataSources.map((dataSource) => (
                  <TableRow key={dataSource.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(dataSource.id)}
                        onCheckedChange={() => toggleSelectItem(dataSource.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{dataSource.name}</p>
                          <p className="text-sm text-muted-foreground">{dataSource.description}</p>
                        </div>
                            </div>
                          </TableCell>
                          <TableCell>
                      <Badge variant="outline">{dataSource.source_type}</Badge>
                          </TableCell>
                          <TableCell>
                      <span className="font-mono text-sm">{dataSource.host}:{dataSource.port}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                        {getStatusIcon(dataSource.status || 'pending')}
                        <Badge variant={getStatusVariant(dataSource.status || 'pending')}>
                          {dataSource.status || 'pending'}
                        </Badge>
                            </div>
                          </TableCell>
                    {showAdvancedMetrics && (
                      <>
                          <TableCell>
                          {dataSource.health_score && (
                            <div className="flex items-center gap-2">
                              <Progress value={dataSource.health_score} className="w-12" />
                              <span className="text-sm">{dataSource.health_score}%</span>
                              </div>
                          )}
                          </TableCell>
                          <TableCell>
                          {dataSource.compliance_score && (
                            <div className="flex items-center gap-2">
                              <Progress value={dataSource.compliance_score} className="w-12" />
                              <span className="text-sm">{dataSource.compliance_score}%</span>
                            </div>
                          )}
                          </TableCell>
                      </>
                    )}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(dataSource)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditDataSource(dataSource)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedForAction(dataSource)
                            setShowTestModal(true)
                          }}>
                            <Activity className="h-4 w-4 mr-2" />
                            Test Connection
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStartScan(dataSource.id)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start Scan
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedForAction(dataSource)
                                    setShowDeleteDialog(true)
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </Card>
        )}

        {/* Modals */}
        <DataSourceCreateModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateDataSource}
        />

        {selectedForAction && (
          <DataSourceEditModal
            open={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedForAction(null)
            }}
            dataSource={selectedForAction}
            onSuccess={() => handleUpdateDataSource(selectedForAction.id, {})}
          />
        )}

        {selectedForAction && (
          <DataSourceConnectionTestModal
            open={showTestModal}
            onClose={() => {
              setShowTestModal(false)
              setSelectedForAction(null)
            }}
            dataSourceId={selectedForAction.id}
            onTestConnection={handleTestConnection}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Data Source</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedForAction?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedForAction && handleDeleteDataSource(selectedForAction.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Actions Dialog */}
        <Dialog open={showBulkActionsDialog} onOpenChange={closeBulkAction}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {bulkActionType === 'delete' ? 'Delete Data Sources' : 'Update Data Sources'}
              </DialogTitle>
              <DialogDescription>
                {bulkActionType === 'delete' 
                  ? `Are you sure you want to delete ${selectedIds.size} data sources? This action cannot be undone.`
                  : `Update ${selectedIds.size} selected data sources.`
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeBulkAction}>
                Cancel
              </Button>
              <Button 
                variant={bulkActionType === 'delete' ? 'destructive' : 'default'}
                onClick={bulkActionType === 'delete' ? executeBulkDelete : () => executeBulkUpdate({})}
                disabled={isBulkLoading}
              >
                {isBulkLoading ? "Processing..." : bulkActionType === 'delete' ? "Delete" : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
