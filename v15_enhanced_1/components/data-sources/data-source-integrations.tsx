"use client"

import { useState, useEffect } from "react"
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  RefreshCw, 
  ExternalLink,
  Check,
  X,
  AlertTriangle,
  Info,
  Play,
  Pause,
  MoreHorizontal,
  Link,
  Unlink,
  Globe,
  Database,
  Cloud,
  Shield,
  Zap
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DataSourceIntegrationsProps {
  dataSourceId: number
  onRefresh?: () => void
}

interface Integration {
  id: string
  name: string
  type: string
  provider: string
  status: 'active' | 'inactive' | 'error' | 'connecting'
  description: string
  config: Record<string, any>
  lastSync: string
  nextSync: string
  syncFrequency: string
  dataVolume: number
  errorCount: number
  successRate: number
  createdAt: string
  updatedAt: string
}

interface IntegrationTemplate {
  id: string
  name: string
  provider: string
  type: string
  description: string
  icon: string
  category: string
  features: string[]
  configSchema: Record<string, any>
}

export function DataSourceIntegrations({ dataSourceId, onRefresh }: DataSourceIntegrationsProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Mock data
  useEffect(() => {
    const mockIntegrations: Integration[] = [
      {
        id: "int-001",
        name: "Salesforce CRM",
        type: "crm",
        provider: "salesforce",
        status: "active",
        description: "Customer relationship management data sync",
        config: { apiKey: "***", endpoint: "https://api.salesforce.com" },
        lastSync: "2024-01-15T10:30:00Z",
        nextSync: "2024-01-15T14:30:00Z",
        syncFrequency: "4h",
        dataVolume: 125000,
        errorCount: 2,
        successRate: 98.5,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "int-002",
        name: "AWS S3 Storage",
        type: "storage",
        provider: "aws",
        status: "active",
        description: "Cloud storage integration for data archival",
        config: { accessKey: "***", secretKey: "***", bucket: "data-archive" },
        lastSync: "2024-01-15T09:00:00Z",
        nextSync: "2024-01-16T09:00:00Z",
        syncFrequency: "24h",
        dataVolume: 2500000,
        errorCount: 0,
        successRate: 100,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T09:00:00Z"
      },
      {
        id: "int-003",
        name: "Slack Notifications",
        type: "notification",
        provider: "slack",
        status: "error",
        description: "Real-time alerts and notifications",
        config: { webhook: "https://hooks.slack.com/services/***" },
        lastSync: "2024-01-14T15:00:00Z",
        nextSync: "2024-01-15T15:00:00Z",
        syncFrequency: "1h",
        dataVolume: 450,
        errorCount: 15,
        successRate: 85.2,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-14T15:00:00Z"
      }
    ]

    const mockTemplates: IntegrationTemplate[] = [
      {
        id: "tmpl-001",
        name: "Salesforce CRM",
        provider: "salesforce",
        type: "crm",
        description: "Connect to Salesforce for CRM data synchronization",
        icon: "salesforce",
        category: "CRM",
        features: ["Data Sync", "Real-time Updates", "Custom Fields"],
        configSchema: {
          apiKey: { type: "string", required: true },
          endpoint: { type: "string", required: true },
          syncFrequency: { type: "select", options: ["1h", "4h", "24h"] }
        }
      },
      {
        id: "tmpl-002",
        name: "AWS S3",
        provider: "aws",
        type: "storage",
        description: "Connect to AWS S3 for data storage and archival",
        icon: "aws",
        category: "Storage",
        features: ["Data Backup", "Archival", "Lifecycle Management"],
        configSchema: {
          accessKey: { type: "string", required: true },
          secretKey: { type: "password", required: true },
          bucket: { type: "string", required: true }
        }
      }
    ]

    setTimeout(() => {
      setIntegrations(mockIntegrations)
      setTemplates(mockTemplates)
      setLoading(false)
    }, 1000)
  }, [dataSourceId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Check className="h-4 w-4 text-green-500" />
      case 'inactive': return <Pause className="h-4 w-4 text-gray-500" />
      case 'error': return <X className="h-4 w-4 text-red-500" />
      case 'connecting': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crm': return <Database className="h-4 w-4" />
      case 'storage': return <Cloud className="h-4 w-4" />
      case 'notification': return <Zap className="h-4 w-4" />
      case 'security': return <Shield className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || integration.type === filterType
    const matchesStatus = filterStatus === "all" || integration.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrations</h2>
          <p className="text-muted-foreground">
            Manage third-party integrations and data connections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Integration</DialogTitle>
                <DialogDescription>
                  Choose from available integration templates
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-muted/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(template.type)}
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map((feature) => (
                          <Badge key={feature} variant="secondary">{feature}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="crm">CRM</SelectItem>
            <SelectItem value="storage">Storage</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="security">Security</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="cursor-pointer hover:bg-muted/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(integration.type)}
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription>{integration.provider}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(integration.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{integration.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Success Rate</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={integration.successRate} className="flex-1" />
                      <span className="text-xs">{integration.successRate}%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Data Volume</Label>
                    <p className="font-medium">{integration.dataVolume.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last sync: {new Date(integration.lastSync).toLocaleString()}</span>
                  <Badge variant={integration.status === 'active' ? 'default' : 
                                integration.status === 'error' ? 'destructive' : 'secondary'}>
                    {integration.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Integrations Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== "all" || filterStatus !== "all" 
                  ? "No integrations match your current filters"
                  : "Get started by adding your first integration"}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}