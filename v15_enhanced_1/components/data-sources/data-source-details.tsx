"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCw,
  Play,
  Database,
  Activity,
  Calendar,
  Settings,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataSourceEditModal } from "./data-source-edit-modal"
import { DataSourceConnectionTestModal } from "./data-source-connection-test-modal"

interface DataSource {
  id: number
  name: string
  source_type: string
  host: string
  port: number
  database_name?: string
  username: string
  status: "active" | "inactive" | "error" | "pending"
  location: "on-premise" | "cloud"
  description?: string
  created_at: string
  updated_at: string
}

interface DataSourceStats {
  entity_stats: {
    total_entities: number
    tables: number
    views: number
    stored_procedures: number
  }
  size_stats: {
    total_size_formatted: string
  }
  last_scan_time?: string
  classification_stats?: {
    classified_columns: number
  }
  sensitivity_stats?: {
    sensitive_columns: number
  }
  compliance_stats?: {
    compliance_score: string
  }
}

interface DataSourceHealth {
  status: "healthy" | "warning" | "critical"
}

interface DataSourceDetailsProps {
  dataSource?: DataSource
  dataSourceStats?: DataSourceStats
  dataSourceHealth?: DataSourceHealth
  isLoading?: boolean
  onEdit?: (dataSource: DataSource) => void
  onDelete?: (id: number) => Promise<void>
  onTestConnection?: (id: number) => Promise<any>
  onStartScan?: (id: number) => Promise<void>
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "active":
      return "default"
    case "error":
      return "destructive"
    case "pending":
      return "secondary"
    default:
      return "outline"
  }
}

const getHealthVariant = (status: string): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "healthy":
      return "default"
    case "warning":
      return "secondary"
    case "critical":
      return "destructive"
    default:
      return "secondary"
  }
}

export function DataSourceDetails({
  dataSource,
  dataSourceStats,
  dataSourceHealth,
  isLoading = false,
  onEdit,
  onDelete,
  onTestConnection,
  onStartScan,
}: DataSourceDetailsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isStartingScan, setIsStartingScan] = useState(false)

  const handleGoBack = () => {
    router.push("/data-sources")
  }

  const handleEdit = () => {
    if (dataSource && onEdit) {
      onEdit(dataSource)
    }
    setShowEditModal(true)
  }

  const handleTestConnection = () => {
    setShowTestModal(true)
  }

  const handleStartScan = async () => {
    if (!dataSource || !onStartScan) return

    setIsStartingScan(true)
    try {
      await onStartScan(dataSource.id)
    } finally {
      setIsStartingScan(false)
    }
  }

  const handleDelete = async () => {
    if (!dataSource || !onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(dataSource.id)
      router.push("/data-sources")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatLastScan = (lastScan?: string) => {
    if (!lastScan) return "Never"
    const date = new Date(lastScan)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  if (!dataSource) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Data source not found. It may have been deleted or you don't have permission to view it.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={handleGoBack} className="gap-2 bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          Back to Data Sources
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleGoBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{dataSource.name}</h1>
              <Badge variant="outline">{dataSource.source_type.toUpperCase()}</Badge>
              <div className="flex items-center gap-1">
                {getStatusIcon(dataSource.status)}
                <Badge variant={getStatusVariant(dataSource.status)}>{dataSource.status}</Badge>
              </div>
            </div>
            <p className="text-muted-foreground">{dataSource.description || "No description provided"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleTestConnection} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Test Connection
          </Button>
          <Button variant="default" size="sm" onClick={handleStartScan} disabled={isStartingScan} className="gap-2">
            <Play className="h-4 w-4" />
            {isStartingScan ? "Starting..." : "Start Scan"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Data Source
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Data Source
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <Database className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="scans" className="gap-2">
            <Activity className="h-4 w-4" />
            Scans
          </TabsTrigger>
          <TabsTrigger value="schedules" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Settings className="h-4 w-4" />
            Rule Sets
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Connection Details */}
            <Card>
              <CardHeader>
                <CardTitle>Connection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Host</p>
                    <p className="text-sm font-mono">{dataSource.host}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Port</p>
                    <p className="text-sm font-mono">{dataSource.port}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Database</p>
                    <p className="text-sm font-mono">{dataSource.database_name || "N/A"}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="text-sm font-mono">{dataSource.username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-sm">{dataSource.location === "on-premise" ? "On-Premise" : "Cloud"}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-sm">{formatDate(dataSource.created_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{formatDate(dataSource.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {dataSourceStats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Entities</p>
                        <p className="text-2xl font-bold">
                          {dataSourceStats.entity_stats.total_entities.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                        <p className="text-2xl font-bold">{dataSourceStats.size_stats.total_size_formatted}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Tables</p>
                        <p className="text-lg font-semibold">{dataSourceStats.entity_stats.tables.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Views</p>
                        <p className="text-lg font-semibold">{dataSourceStats.entity_stats.views.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Procedures</p>
                        <p className="text-lg font-semibold">
                          {dataSourceStats.entity_stats.stored_procedures.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Last Scan</p>
                        <p className="text-sm">{formatLastScan(dataSourceStats.last_scan_time)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Health Status</p>
                        <Badge variant={getHealthVariant(dataSourceHealth?.status || "unknown")}>
                          {dataSourceHealth?.status || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                    {(dataSourceStats.classification_stats || dataSourceStats.sensitivity_stats) && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Classified Columns</p>
                            <p className="text-sm">
                              {dataSourceStats.classification_stats?.classified_columns.toLocaleString() || "0"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Sensitive Columns</p>
                            <p className="text-sm">
                              {dataSourceStats.sensitivity_stats?.sensitive_columns.toLocaleString() || "0"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No statistics available. Run a scan to collect data.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scans">
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Scan list component would be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Scan Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Scan schedule list component would be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Rule Sets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Rule set list component would be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Security settings and access control for this data source</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals and Dialogs */}
      <DataSourceEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        dataSource={dataSource}
        onSuccess={() => {
          setShowEditModal(false)
          // Refresh data
        }}
      />

      <DataSourceConnectionTestModal
        open={showTestModal}
        onClose={() => setShowTestModal(false)}
        dataSourceId={dataSource.id}
        onTestConnection={onTestConnection}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Data Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the data source "{dataSource.name}"? This action cannot be undone and will
              remove all associated scans, schedules, and rule sets.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
