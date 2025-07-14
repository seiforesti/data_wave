"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DataSourceDetails } from "./data-source-details"
import { DataSourceCreateModal } from "./data-source-create-modal"
import { DataSourceEditModal } from "./data-source-edit-modal"
import { DataSourceConnectionTestModal } from "./data-source-connection-test-modal"

// Enhanced Types
interface DataSource {
  id: number
  name: string
  source_type: string
  host: string
  port: number
  database_name?: string
  username: string
  status: "active" | "inactive" | "error" | "pending" | "syncing" | "maintenance"
  location: "on-premise" | "cloud" | "hybrid"
  description?: string
  created_at: string
  updated_at: string
  last_scan?: string
  health_score?: number
  compliance_score?: number
  entity_count?: number
  size_gb?: number
  tags?: string[]
  owner?: string
  team?: string
  environment?: "production" | "staging" | "development" | "test"
  criticality?: "critical" | "high" | "medium" | "low"
  data_classification?: "public" | "internal" | "confidential" | "restricted"
  backup_enabled?: boolean
  monitoring_enabled?: boolean
  encryption_enabled?: boolean
  last_backup?: string
  next_scan?: string
  scan_frequency?: "hourly" | "daily" | "weekly" | "monthly"
  connection_pool_size?: number
  avg_response_time?: number
  error_rate?: number
  uptime_percentage?: number
  cost_per_month?: number
  storage_used_percentage?: number
  active_connections?: number
  queries_per_second?: number
  favorite?: boolean
}

interface DataSourceStats {
  entity_stats: {
    total_entities: number
    tables: number
    views: number
    stored_procedures: number
    functions?: number
    triggers?: number
  }
  size_stats: {
    total_size_formatted: string
    total_size_gb: number
    growth_rate?: number
  }
  performance_stats?: {
    avg_query_time: number
    peak_connections: number
    cache_hit_ratio: number
  }
  last_scan_time?: string
  classification_stats?: {
    classified_columns: number
    unclassified_columns: number
    sensitive_columns: number
  }
  sensitivity_stats?: {
    sensitive_columns: number
    pii_columns: number
    financial_columns: number
  }
  compliance_stats?: {
    compliance_score: string
    violations: number
    last_audit: string
  }
  quality_stats?: {
    quality_score: number
    issues_found: number
    data_freshness: string
  }
}

interface DataSourceHealth {
  status: "healthy" | "warning" | "critical" | "unknown"
  issues?: Array<{
    type: "performance" | "security" | "compliance" | "connectivity"
    severity: "low" | "medium" | "high" | "critical"
    message: string
    recommendation?: string
  }>
  recommendations?: Array<{
    title: string
    description: string
    priority: "low" | "medium" | "high"
    estimated_effort: string
  }>
  last_check?: string
}

interface ConnectionTestResult {
  success: boolean
  message: string
  connection_time_ms: number
  details?: Record<string, any>
  recommendations?: Array<{
    title: string
    description: string
    severity: "info" | "warning" | "critical"
  }>
}

interface FilterState {
  search: string
  type: string
  status: string
  location: string
  environment: string
  criticality: string
  tags: string[]
  healthScore: [number, number]
  complianceScore: [number, number]
  owner: string
  team: string
  hasIssues: boolean
  favorites: boolean
}

interface SortConfig {
  key: keyof DataSource | "health_score" | "compliance_score"
  direction: "asc" | "desc"
}

// Enhanced Mock Data
const mockDataSources: DataSource[] = [
  {
    id: 1,
    name: "PostgreSQL Production",
    source_type: "postgresql",
    host: "prod-db.company.com",
    port: 5432,
    database_name: "production",
    username: "app_user",
    status: "active",
    location: "cloud",
    environment: "production",
    criticality: "critical",
    data_classification: "confidential",
    description: "Main production database containing customer and transaction data",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:22:00Z",
    last_scan: "2024-01-20T09:15:00Z",
    next_scan: "2024-01-21T09:15:00Z",
    scan_frequency: "daily",
    health_score: 98,
    compliance_score: 95,
    entity_count: 156,
    size_gb: 2400,
    tags: ["production", "customer-data", "pii", "critical", "postgresql"],
    owner: "john.doe@company.com",
    team: "Data Engineering",
    backup_enabled: true,
    monitoring_enabled: true,
    encryption_enabled: true,
    last_backup: "2024-01-20T02:00:00Z",
    connection_pool_size: 50,
    avg_response_time: 45,
    error_rate: 0.02,
    uptime_percentage: 99.9,
    cost_per_month: 2500,
    storage_used_percentage: 78,
    active_connections: 23,
    queries_per_second: 1250,
    favorite: true,
  },
  {
    id: 2,
    name: "Analytics Warehouse",
    source_type: "snowflake",
    host: "analytics.snowflakecomputing.com",
    port: 443,
    database_name: "analytics_db",
    username: "analytics_user",
    status: "syncing",
    location: "cloud",
    environment: "production",
    criticality: "high",
    data_classification: "internal",
    description: "Data warehouse for business intelligence and analytics",
    created_at: "2024-01-10T08:45:00Z",
    updated_at: "2024-01-20T16:30:00Z",
    last_scan: "2024-01-20T08:00:00Z",
    next_scan: "2024-01-27T08:00:00Z",
    scan_frequency: "weekly",
    health_score: 92,
    compliance_score: 88,
    entity_count: 89,
    size_gb: 8900,
    tags: ["analytics", "warehouse", "reporting", "bi", "snowflake"],
    owner: "jane.smith@company.com",
    team: "Analytics",
    backup_enabled: true,
    monitoring_enabled: true,
    encryption_enabled: true,
    last_backup: "2024-01-19T03:00:00Z",
    connection_pool_size: 25,
    avg_response_time: 120,
    error_rate: 0.05,
    uptime_percentage: 99.5,
    cost_per_month: 8500,
    storage_used_percentage: 65,
    active_connections: 12,
    queries_per_second: 450,
    favorite: false,
  },
  {
    id: 3,
    name: "MongoDB Logs",
    source_type: "mongodb",
    host: "logs-cluster.company.com",
    port: 27017,
    username: "log_reader",
    status: "error",
    location: "on-premise",
    environment: "production",
    criticality: "medium",
    data_classification: "internal",
    description: "Application logs and event data storage",
    created_at: "2024-01-08T12:00:00Z",
    updated_at: "2024-01-19T11:45:00Z",
    last_scan: "2024-01-18T14:30:00Z",
    next_scan: "2024-01-25T14:30:00Z",
    scan_frequency: "weekly",
    health_score: 65,
    compliance_score: 78,
    entity_count: 23,
    size_gb: 450,
    tags: ["logs", "application", "monitoring", "events", "mongodb"],
    owner: "mike.johnson@company.com",
    team: "DevOps",
    backup_enabled: false,
    monitoring_enabled: true,
    encryption_enabled: false,
    connection_pool_size: 15,
    avg_response_time: 200,
    error_rate: 0.15,
    uptime_percentage: 97.2,
    cost_per_month: 800,
    storage_used_percentage: 85,
    active_connections: 8,
    queries_per_second: 180,
    favorite: false,
  },
  {
    id: 4,
    name: "MySQL Development",
    source_type: "mysql",
    host: "dev-db.internal.com",
    port: 3306,
    database_name: "dev_database",
    username: "dev_user",
    status: "active",
    location: "on-premise",
    environment: "development",
    criticality: "low",
    data_classification: "public",
    description: "Development environment database for testing",
    created_at: "2024-01-12T09:15:00Z",
    updated_at: "2024-01-20T10:00:00Z",
    last_scan: "2024-01-19T16:45:00Z",
    next_scan: "2024-02-19T16:45:00Z",
    scan_frequency: "monthly",
    health_score: 85,
    compliance_score: 92,
    entity_count: 67,
    size_gb: 120,
    tags: ["development", "testing", "non-production", "mysql"],
    owner: "sarah.wilson@company.com",
    team: "Development",
    backup_enabled: true,
    monitoring_enabled: false,
    encryption_enabled: false,
    connection_pool_size: 10,
    avg_response_time: 80,
    error_rate: 0.08,
    uptime_percentage: 98.5,
    cost_per_month: 200,
    storage_used_percentage: 45,
    active_connections: 5,
    queries_per_second: 85,
    favorite: false,
  },
  {
    id: 5,
    name: "S3 Data Lake",
    source_type: "s3",
    host: "s3.amazonaws.com",
    port: 443,
    username: "s3_access_key",
    status: "active",
    location: "cloud",
    environment: "production",
    criticality: "high",
    data_classification: "confidential",
    description: "Raw data storage and data lake for batch processing",
    created_at: "2024-01-05T14:20:00Z",
    updated_at: "2024-01-20T12:10:00Z",
    last_scan: "2024-01-20T06:00:00Z",
    next_scan: "2024-01-21T06:00:00Z",
    scan_frequency: "daily",
    health_score: 96,
    compliance_score: 90,
    entity_count: 234,
    size_gb: 15600,
    tags: ["data-lake", "raw-data", "batch", "storage", "s3"],
    owner: "david.brown@company.com",
    team: "Data Engineering",
    backup_enabled: true,
    monitoring_enabled: true,
    encryption_enabled: true,
    last_backup: "2024-01-20T01:00:00Z",
    avg_response_time: 300,
    error_rate: 0.01,
    uptime_percentage: 99.8,
    cost_per_month: 1200,
    storage_used_percentage: 72,
    favorite: true,
  },
  {
    id: 6,
    name: "Redis Cache",
    source_type: "redis",
    host: "cache.company.com",
    port: 6379,
    username: "cache_user",
    status: "maintenance",
    location: "cloud",
    environment: "production",
    criticality: "high",
    data_classification: "internal",
    description: "High-performance caching layer for applications",
    created_at: "2024-01-18T11:30:00Z",
    updated_at: "2024-01-20T18:45:00Z",
    last_scan: "2024-01-19T12:00:00Z",
    next_scan: "2024-01-26T12:00:00Z",
    scan_frequency: "weekly",
    health_score: 88,
    compliance_score: 85,
    entity_count: 12,
    size_gb: 64,
    tags: ["cache", "performance", "redis", "memory"],
    owner: "alex.garcia@company.com",
    team: "Platform",
    backup_enabled: false,
    monitoring_enabled: true,
    encryption_enabled: true,
    connection_pool_size: 100,
    avg_response_time: 2,
    error_rate: 0.001,
    uptime_percentage: 99.95,
    cost_per_month: 450,
    storage_used_percentage: 60,
    active_connections: 45,
    queries_per_second: 5000,
    favorite: false,
  },
]

// View modes
type ViewMode = "grid" | "list" | "details" | "kanban"

export function DataSourcesApp() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources)
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter and search state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    status: "all",
    location: "all",
    environment: "all",
    criticality: "all",
    tags: [],
    healthScore: [0, 100],
    complianceScore: [0, 100],
    owner: "all",
    team: "all",
    hasIssues: false,
    favorites: false,
  })

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  })

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showFiltersSheet, setShowFiltersSheet] = useState(false)
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false)
  const [selectedForAction, setSelectedForAction] = useState<DataSource | null>(null)

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkActionType, setBulkActionType] = useState<string>("")

  // Advanced settings
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)
  const [compactView, setCompactView] = useState(false)

  // Initialize from URL params
  useEffect(() => {
    const id = searchParams.get("id")
    const view = searchParams.get("view") as ViewMode

    if (id) {
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

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      handleRefresh()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Filtered and sorted data sources
  const filteredAndSortedDataSources = useMemo(() => {
    let filtered = dataSources

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (ds) =>
          ds.name.toLowerCase().includes(searchLower) ||
          ds.host.toLowerCase().includes(searchLower) ||
          ds.source_type.toLowerCase().includes(searchLower) ||
          ds.description?.toLowerCase().includes(searchLower) ||
          ds.owner?.toLowerCase().includes(searchLower) ||
          ds.team?.toLowerCase().includes(searchLower) ||
          ds.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((ds) => ds.source_type === filters.type)
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((ds) => ds.status === filters.status)
    }

    // Location filter
    if (filters.location !== "all") {
      filtered = filtered.filter((ds) => ds.location === filters.location)
    }

    // Environment filter
    if (filters.environment !== "all") {
      filtered = filtered.filter((ds) => ds.environment === filters.environment)
    }

    // Criticality filter
    if (filters.criticality !== "all") {
      filtered = filtered.filter((ds) => ds.criticality === filters.criticality)
    }

    // Owner filter
    if (filters.owner !== "all") {
      filtered = filtered.filter((ds) => ds.owner === filters.owner)
    }

    // Team filter
    if (filters.team !== "all") {
      filtered = filtered.filter((ds) => ds.team === filters.team)
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((ds) => ds.tags?.some((tag) => filters.tags.includes(tag)))
    }

    // Health score filter
    filtered = filtered.filter(
      (ds) => (ds.health_score || 0) >= filters.healthScore[0] && (ds.health_score || 0) <= filters.healthScore[1],
    )

    // Compliance score filter
    filtered = filtered.filter(
      (ds) =>
        (ds.compliance_score || 0) >= filters.complianceScore[0] &&
        (ds.compliance_score || 0) <= filters.complianceScore[1],
    )

    // Issues filter
    if (filters.hasIssues) {
      filtered = filtered.filter((ds) => ds.status === "error" || (ds.health_score || 100) < 80)
    }

    // Favorites filter
    if (filters.favorites) {
      filtered = filtered.filter((ds) => ds.favorite)
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof DataSource] || 0
      const bValue = b[sortConfig.key as keyof DataSource] || 0

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  }, [dataSources, filters, sortConfig])

  // Statistics
  const stats = useMemo(() => {
    const total = dataSources.length
    const active = dataSources.filter((ds) => ds.status === "active").length
    const errors = dataSources.filter((ds) => ds.status === "error").length
    const syncing = dataSources.filter((ds) => ds.status === "syncing").length
    const maintenance = dataSources.filter((ds) => ds.status === "maintenance").length
    const avgHealth = dataSources.reduce((sum, ds) => sum + (ds.health_score || 0), 0) / total
    const avgCompliance = dataSources.reduce((sum, ds) => sum + (ds.compliance_score || 0), 0) / total
    const totalEntities = dataSources.reduce((sum, ds) => sum + (ds.entity_count || 0), 0)
    const totalSize = dataSources.reduce((sum, ds) => sum + (ds.size_gb || 0), 0)
    const totalCost = dataSources.reduce((sum, ds) => sum + (ds.cost_per_month || 0), 0)
    const criticalSources = dataSources.filter((ds) => ds.criticality === "critical").length
    const encryptedSources = dataSources.filter((ds) => ds.encryption_enabled).length
    const backupEnabledSources = dataSources.filter((ds) => ds.backup_enabled).length

    return {
      total,
      active,
      errors,
      syncing,
      maintenance,
      avgHealth: Math.round(avgHealth),
      avgCompliance: Math.round(avgCompliance),
      totalEntities,
      totalSize,
      totalCost,
      criticalSources,
      encryptedSources,
      backupEnabledSources,
      encryptionRate: Math.round((encryptedSources / total) * 100),
      backupRate: Math.round((backupEnabledSources / total) * 100),
    }
  }, [dataSources])

  // Event handlers
  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In real app, fetch fresh data here
      console.log("Refreshing data sources...")
    } catch (err: any) {
      setError(err.message || "Failed to refresh data sources")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCreateDataSource = async (dataSourceData: any) => {
    const newDataSource: DataSource = {
      id: Math.max(...dataSources.map((ds) => ds.id)) + 1,
      name: dataSourceData.name,
      source_type: dataSourceData.source_type,
      host: dataSourceData.host,
      port: dataSourceData.port,
      database_name: dataSourceData.database_name,
      username: dataSourceData.username,
      status: "pending",
      location: dataSourceData.location,
      environment: dataSourceData.environment || "development",
      criticality: dataSourceData.criticality || "medium",
      data_classification: dataSourceData.data_classification || "internal",
      description: dataSourceData.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      health_score: 0,
      compliance_score: 0,
      entity_count: 0,
      size_gb: 0,
      tags: dataSourceData.tags || [],
      owner: dataSourceData.owner,
      team: dataSourceData.team,
      backup_enabled: false,
      monitoring_enabled: false,
      encryption_enabled: false,
      scan_frequency: "weekly",
      favorite: false,
    }

    setDataSources((prev) => [...prev, newDataSource])
  }

  const handleEditDataSource = (dataSource: DataSource) => {
    setSelectedForAction(dataSource)
    setShowEditModal(true)
  }

  const handleDeleteDataSource = async (id: number) => {
    setDataSources((prev) => prev.filter((ds) => ds.id !== id))
    if (selectedDataSource?.id === id) {
      setSelectedDataSource(null)
      setViewMode("grid")
    }
  }

  const handleTestConnection = async (id: number): Promise<ConnectionTestResult> => {
    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const dataSource = dataSources.find((ds) => ds.id === id)
    const success = Math.random() > 0.3 // 70% success rate

    return {
      success,
      message: success ? "Connection established successfully" : "Failed to connect to database",
      connection_time_ms: Math.floor(Math.random() * 1000) + 100,
      details: {
        host_reachable: success,
        port_open: success,
        authentication: success,
        database_accessible: success,
        permissions_valid: success,
      },
      recommendations: success
        ? []
        : [
            {
              title: "Check network connectivity",
              description: "Ensure the database server is reachable from this network",
              severity: "warning" as const,
            },
            {
              title: "Verify credentials",
              description: "Double-check username and password are correct",
              severity: "critical" as const,
            },
          ],
    }
  }

  const handleStartScan = async (id: number) => {
    const dataSource = dataSources.find((ds) => ds.id === id)
    if (dataSource) {
      setDataSources((prev) => prev.map((ds) => (ds.id === id ? { ...ds, status: "syncing" as const } : ds)))

      // Simulate scan completion
      setTimeout(() => {
        setDataSources((prev) =>
          prev.map((ds) =>
            ds.id === id
              ? {
                  ...ds,
                  status: "active" as const,
                  last_scan: new Date().toISOString(),
                  entity_count: Math.floor(Math.random() * 200) + 50,
                  health_score: Math.floor(Math.random() * 20) + 80,
                }
              : ds,
          ),
        )
      }, 5000)
    }
  }

  const handleViewDetails = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource)
    setViewMode("details")
    router.push(`/data-governance/data-sources?id=${dataSource.id}&view=details`)
  }

  const handleBackToList = () => {
    setSelectedDataSource(null)
    setViewMode("grid")
    router.push("/data-governance/data-sources")
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      status: "all",
      location: "all",
      environment: "all",
      criticality: "all",
      tags: [],
      healthScore: [0, 100],
      complianceScore: [0, 100],
      owner: "all",
      team: "all",
      hasIssues: false,
      favorites: false,
    })
  }

  const handleSort = (key: keyof DataSource | "health_score" | "compliance_score") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleBulkAction = async (action: string) => {
    setBulkActionType(action)
    setShowBulkActionsDialog(true)
  }

  const executeBulkAction = async () => {
    console.log(`Performing bulk action: ${bulkActionType} on`, Array.from(selectedIds))

    switch (bulkActionType) {
      case "delete":
        setDataSources((prev) => prev.filter((ds) => !selectedIds.has(ds.id)))
        break
      case "test":
        // Simulate testing connections
        break
      case "scan":
        setDataSources((prev) =>
          prev.map((ds) => (selectedIds.has(ds.id) ? { ...ds, status: "syncing" as const } : ds)),
        )
        break
      case "favorite":
        setDataSources((prev) => prev.map((ds) => (selectedIds.has(ds.id) ? { ...ds, favorite: true } : ds)))
        break
      case "unfavorite":
        setDataSources((prev) => prev.map((ds) => (selectedIds.has(ds.id) ? { ...ds, favorite: false } : ds)))
        break
    }

    setSelectedIds(new Set())
    setShowBulkActionsDialog(false)
    setBulkActionType("")
  }

  const toggleFavorite = (id: number) => {
    setDataSources((prev) => prev.map((ds) => (ds.id === id ? { ...ds, favorite: !ds.favorite } : ds)))
  }

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filteredAndSortedDataSources.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredAndSortedDataSources.map((ds) => ds.id)))
    }
  }

  // Get unique values for filters
  const uniqueTypes = [...new Set(dataSources.map((ds) => ds.source_type).filter(Boolean))]
  const uniqueOwners = [...new Set(dataSources.map((ds) => ds.owner).filter(Boolean))]
  const uniqueTeams = [...new Set(dataSources.map((ds) => ds.team).filter(Boolean))]
  const uniqueTags = [...new Set(dataSources.flatMap((ds) => ds.tags || []))]

  const hasActiveFilters =
    filters.search ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.location !== "all" ||
    filters.environment !== "all" ||
    filters.criticality !== "all" ||
    filters.owner !== "all" ||
    filters.team !== "all" ||
    filters.tags.length > 0 ||
    filters.hasIssues ||
    filters.favorites

  // Render functions
  const renderDataSourceCard = (dataSource: DataSource) => (
    <Card key={dataSource.id} className="group hover:shadow-lg transition-all duration-200 relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Checkbox
              checked={selectedIds.has(dataSource.id)}
              onCheckedChange={() => toggleSelection(dataSource.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg truncate">{dataSource.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(dataSource.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                >
                  {dataSource.favorite ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {dataSource.source_type?.toUpperCase() || "UNKNOWN"}
                </Badge>
                <Badge
                  variant={dataSource.environment === "production" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {dataSource.environment}
                </Badge>
                <Badge
                  variant={
                    dataSource.criticality === "critical"
                      ? "destructive"
                      : dataSource.criticality === "high"
                        ? "default"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {dataSource.criticality}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
              <DropdownMenuItem onClick={() => handleStartScan(dataSource.id)}>
                <Play className="h-4 w-4 mr-2" />
                Start Scan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toggleFavorite(dataSource.id)}>
                {dataSource.favorite ? (
                  <>
                    <StarOff className="h-4 w-4 mr-2" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
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
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Status and Health */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  dataSource.status === "active"
                    ? "bg-green-500"
                    : dataSource.status === "syncing"
                      ? "bg-blue-500 animate-pulse"
                      : dataSource.status === "error"
                        ? "bg-red-500"
                        : dataSource.status === "maintenance"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                }`}
              />
              <span className="text-sm font-medium capitalize">{dataSource.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Health:</span>
              <div className="flex items-center gap-1">
                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      (dataSource.health_score || 0) >= 90
                        ? "bg-green-500"
                        : (dataSource.health_score || 0) >= 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${dataSource.health_score || 0}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{dataSource.health_score || 0}%</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Entities</p>
              <p className="font-semibold">{(dataSource.entity_count || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Size</p>
              <p className="font-semibold">
                {dataSource.size_gb && dataSource.size_gb > 1000
                  ? `${(dataSource.size_gb / 1000).toFixed(1)}TB`
                  : `${dataSource.size_gb || 0}GB`}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Compliance</p>
              <p className="font-semibold">{dataSource.compliance_score || 0}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cost/Month</p>
              <p className="font-semibold">${(dataSource.cost_per_month || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Advanced Metrics (if enabled) */}
          {showAdvancedMetrics && (
            <div className="grid grid-cols-2 gap-4 text-xs border-t pt-3">
              <div>
                <p className="text-muted-foreground">Avg Response</p>
                <p className="font-medium">{dataSource.avg_response_time || 0}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Error Rate</p>
                <p className="font-medium">{((dataSource.error_rate || 0) * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Uptime</p>
                <p className="font-medium">{dataSource.uptime_percentage || 0}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">QPS</p>
                <p className="font-medium">{(dataSource.queries_per_second || 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {dataSource.tags && dataSource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dataSource.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {dataSource.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{dataSource.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Owner and Team */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{dataSource.team || "No team"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-xs">
                  {dataSource.owner?.split(".")[0]?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-20">{dataSource.owner?.split("@")[0] || "Unassigned"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(dataSource)} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartScan(dataSource.id)}
              disabled={dataSource.status === "syncing"}
              className="flex-1"
            >
              {dataSource.status === "syncing" ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderKanbanView = () => {
    const statusGroups = {
      active: dataSources.filter((ds) => ds.status === "active"),
      syncing: dataSources.filter((ds) => ds.status === "syncing"),
      error: dataSources.filter((ds) => ds.status === "error"),
      maintenance: dataSources.filter((ds) => ds.status === "maintenance"),
      pending: dataSources.filter((ds) => ds.status === "pending"),
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
        {Object.entries(statusGroups).map(([status, sources]) => (
          <div key={status} className="flex flex-col">
            <div className="flex items-center justify-between p-3 bg-muted rounded-t-lg">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    status === "active"
                      ? "bg-green-500"
                      : status === "syncing"
                        ? "bg-blue-500"
                        : status === "error"
                          ? "bg-red-500"
                          : status === "maintenance"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                  }`}
                />
                <span className="font-medium capitalize">{status}</span>
              </div>
              <Badge variant="secondary">{sources.length}</Badge>
            </div>
            <ScrollArea className="flex-1 p-2 bg-muted/30 rounded-b-lg">
              <div className="space-y-2">
                {sources.map((source) => (
                  <Card key={source.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{source.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(source.id)}
                          className="p-1 h-auto"
                        >
                          {source.favorite ? (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {source.source_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {source.environment}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>Health: {source.health_score || 0}%</div>
                        <div>Entities: {(source.entity_count || 0).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(source)}
                          className="flex-1 text-xs h-6"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartScan(source.id)}
                          disabled={source.status === "syncing"}
                          className="flex-1 text-xs h-6"
                        >
                          Scan
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
                <p className="text-muted-foreground">
                  Manage and monitor your data source connections across your organization
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Settings className="h-4 w-4" />
                    Bulk Actions ({selectedIds.size})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction("test")}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Connections
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("scan")}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Scans
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("favorite")}>
                    <Star className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("unfavorite")}>
                    <StarOff className="h-4 w-4 mr-2" />
                    Remove from Favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>View Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} size="sm" />
                    <Label htmlFor="auto-refresh" className="text-sm">
                      Auto-refresh
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="advanced-metrics"
                      checked={showAdvancedMetrics}
                      onCheckedChange={setShowAdvancedMetrics}
                      size="sm"
                    />
                    <Label htmlFor="advanced-metrics" className="text-sm">
                      Advanced metrics
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="compact-view" checked={compactView} onCheckedChange={setCompactView} size="sm" />
                    <Label htmlFor="compact-view" className="text-sm">
                      Compact view
                    </Label>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleRefresh()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Now
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Config
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Data Source
            </Button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sources</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.criticalSources} critical</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.syncing} syncing</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issues</p>
                  <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.maintenance} maintenance</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Health</p>
                  <p className="text-2xl font-bold">{stats.avgHealth}%</p>
                  <Progress value={stats.avgHealth} className="mt-1 h-1" />
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                  <p className="text-2xl font-bold">{stats.avgCompliance}%</p>
                  <Progress value={stats.avgCompliance} className="mt-1 h-1" />
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entities</p>
                  <p className="text-2xl font-bold">{stats.totalEntities.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">across all sources</p>
                </div>
                <FileText className="h-8 w-8 text-indigo-500" />
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Storage</p>
                  <p className="text-2xl font-bold">{(stats.totalSize / 1000).toFixed(1)}TB</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.encryptionRate}% encrypted</p>
                </div>
                <HardDrive className="h-8 w-8 text-cyan-500" />
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold">${(stats.totalCost / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.backupRate}% backed up</p>
                </div>
                <BarChart3 className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search data sources..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type?.toUpperCase() || "UNKNOWN"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="syncing">Syncing</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-96">
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                  <SheetDescription>Filter data sources by various criteria</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Environment Filter */}
                  <div className="space-y-2">
                    <Label>Environment</Label>
                    <Select
                      value={filters.environment}
                      onValueChange={(value) => handleFilterChange("environment", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Environments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Environments</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="test">Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Criticality Filter */}
                  <div className="space-y-2">
                    <Label>Criticality</Label>
                    <Select
                      value={filters.criticality}
                      onValueChange={(value) => handleFilterChange("criticality", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Owner Filter */}
                  <div className="space-y-2">
                    <Label>Owner</Label>
                    <Select value={filters.owner} onValueChange={(value) => handleFilterChange("owner", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Owners" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Owners</SelectItem>
                        {uniqueOwners.map((owner) => (
                          <SelectItem key={owner} value={owner}>
                            {owner?.split("@")[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Team Filter */}
                  <div className="space-y-2">
                    <Label>Team</Label>
                    <Select value={filters.team} onValueChange={(value) => handleFilterChange("team", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Teams" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        {uniqueTeams.map((team) => (
                          <SelectItem key={team} value={team}>
                            {team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Health Score Range */}
                  <div className="space-y-2">
                    <Label>Health Score Range</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.healthScore}
                        onValueChange={(value) => handleFilterChange("healthScore", value)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{filters.healthScore[0]}%</span>
                        <span>{filters.healthScore[1]}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Score Range */}
                  <div className="space-y-2">
                    <Label>Compliance Score Range</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.complianceScore}
                        onValueChange={(value) => handleFilterChange("complianceScore", value)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{filters.complianceScore[0]}%</span>
                        <span>{filters.complianceScore[1]}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Boolean Filters */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-issues"
                        checked={filters.hasIssues}
                        onCheckedChange={(checked) => handleFilterChange("hasIssues", checked)}
                      />
                      <Label htmlFor="has-issues">Show only sources with issues</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="favorites"
                        checked={filters.favorites}
                        onCheckedChange={(checked) => handleFilterChange("favorites", checked)}
                      />
                      <Label htmlFor="favorites">Show only favorites</Label>
                    </div>
                  </div>

                  {/* Tags Filter */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          {filters.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {filters.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {filters.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{filters.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            "Select tags..."
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Command>
                          <CommandInput placeholder="Search tags..." />
                          <CommandEmpty>No tags found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {uniqueTags.map((tag) => (
                                <CommandItem
                                  key={tag}
                                  onSelect={() => {
                                    const newTags = filters.tags.includes(tag)
                                      ? filters.tags.filter((t) => t !== tag)
                                      : [...filters.tags, tag]
                                    handleFilterChange("tags", newTags)
                                  }}
                                >
                                  <Checkbox checked={filters.tags.includes(tag)} className="mr-2" />
                                  {tag}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Clear Filters */}
                  <Button variant="outline" onClick={handleClearFilters} className="w-full bg-transparent">
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Checkbox
                checked={
                  selectedIds.size === filteredAndSortedDataSources.length && filteredAndSortedDataSources.length > 0
                }
                onCheckedChange={selectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.size > 0 && `${selectedIds.size} selected`}
              </span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort by {sortConfig.key}
                  {sortConfig.direction === "asc" ? (
                    <TrendingUp className="h-3 w-3 ml-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortConfig.key} onValueChange={(value) => handleSort(value as any)}>
                  <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="health_score">Health Score</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="compliance_score">Compliance Score</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="entity_count">Entity Count</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="size_gb">Size</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="created_at">Created Date</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="last_scan">Last Scan</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Layers className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>View Mode</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                  <DropdownMenuRadioItem value="grid">Grid View</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="list">List View</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="kanban">Kanban View</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === "details" && selectedDataSource ? (
          <DataSourceDetails
            dataSource={selectedDataSource}
            dataSourceStats={{
              entity_stats: {
                total_entities: selectedDataSource.entity_count || 0,
                tables: Math.floor((selectedDataSource.entity_count || 0) * 0.6),
                views: Math.floor((selectedDataSource.entity_count || 0) * 0.3),
                stored_procedures: Math.floor((selectedDataSource.entity_count || 0) * 0.1),
                functions: Math.floor((selectedDataSource.entity_count || 0) * 0.05),
                triggers: Math.floor((selectedDataSource.entity_count || 0) * 0.02),
              },
              size_stats: {
                total_size_formatted: `${selectedDataSource.size_gb}GB`,
                total_size_gb: selectedDataSource.size_gb || 0,
                growth_rate: Math.random() * 10 + 2,
              },
              performance_stats: {
                avg_query_time: selectedDataSource.avg_response_time || 0,
                peak_connections: selectedDataSource.connection_pool_size || 0,
                cache_hit_ratio: Math.random() * 30 + 70,
              },
              last_scan_time: selectedDataSource.last_scan,
              classification_stats: {
                classified_columns: Math.floor(Math.random() * 100) + 50,
                unclassified_columns: Math.floor(Math.random() * 20) + 5,
                sensitive_columns: Math.floor(Math.random() * 30) + 10,
              },
              sensitivity_stats: {
                sensitive_columns: Math.floor(Math.random() * 30) + 10,
                pii_columns: Math.floor(Math.random() * 15) + 5,
                financial_columns: Math.floor(Math.random() * 10) + 2,
              },
              compliance_stats: {
                compliance_score: `${selectedDataSource.compliance_score || 0}%`,
                violations: Math.floor(Math.random() * 5),
                last_audit: selectedDataSource.last_scan || new Date().toISOString(),
              },
              quality_stats: {
                quality_score: selectedDataSource.health_score || 0,
                issues_found: Math.floor(Math.random() * 10),
                data_freshness: "2 hours ago",
              },
            }}
            dataSourceHealth={{
              status:
                selectedDataSource.health_score && selectedDataSource.health_score > 90
                  ? "healthy"
                  : selectedDataSource.health_score && selectedDataSource.health_score > 70
                    ? "warning"
                    : "critical",
              issues:
                selectedDataSource.status === "error"
                  ? [
                      {
                        type: "connectivity",
                        severity: "high",
                        message: "Connection timeout detected",
                        recommendation: "Check network connectivity and firewall settings",
                      },
                      {
                        type: "performance",
                        severity: "medium",
                        message: "High response times observed",
                        recommendation: "Consider optimizing queries or scaling resources",
                      },
                    ]
                  : [],
              recommendations: [
                {
                  title: "Enable monitoring",
                  description: "Set up comprehensive monitoring for better observability",
                  priority: "high",
                  estimated_effort: "2 hours",
                },
                {
                  title: "Configure backups",
                  description: "Implement automated backup strategy",
                  priority: "medium",
                  estimated_effort: "4 hours",
                },
              ],
              last_check: new Date().toISOString(),
            }}
            isLoading={isLoading}
            onEdit={handleEditDataSource}
            onDelete={handleDeleteDataSource}
            onTestConnection={handleTestConnection}
            onStartScan={handleStartScan}
          />
        ) : (
          <div className="flex-1 overflow-hidden">
            {viewMode === "kanban" ? (
              renderKanbanView()
            ) : viewMode === "list" ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedIds.size === filteredAndSortedDataSources.length &&
                              filteredAndSortedDataSources.length > 0
                            }
                            onCheckedChange={selectAll}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Environment</TableHead>
                        <TableHead>Health</TableHead>
                        <TableHead>Compliance</TableHead>
                        <TableHead>Entities</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedDataSources.map((dataSource) => (
                        <TableRow key={dataSource.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(dataSource.id)}
                              onCheckedChange={() => toggleSelection(dataSource.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{dataSource.name}</span>
                              {dataSource.favorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{dataSource.source_type?.toUpperCase() || "UNKNOWN"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  dataSource.status === "active"
                                    ? "bg-green-500"
                                    : dataSource.status === "syncing"
                                      ? "bg-blue-500 animate-pulse"
                                      : dataSource.status === "error"
                                        ? "bg-red-500"
                                        : dataSource.status === "maintenance"
                                          ? "bg-yellow-500"
                                          : "bg-gray-500"
                                }`}
                              />
                              <span className="capitalize">{dataSource.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={dataSource.environment === "production" ? "destructive" : "secondary"}>
                              {dataSource.environment}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{dataSource.health_score || 0}%</span>
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    (dataSource.health_score || 0) >= 90
                                      ? "bg-green-500"
                                      : (dataSource.health_score || 0) >= 70
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${dataSource.health_score || 0}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{dataSource.compliance_score || 0}%</span>
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 transition-all"
                                  style={{ width: `${dataSource.compliance_score || 0}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{(dataSource.entity_count || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            {dataSource.size_gb && dataSource.size_gb > 1000
                              ? `${(dataSource.size_gb / 1000).toFixed(1)}TB`
                              : `${dataSource.size_gb || 0}GB`}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {dataSource.owner?.split(".")[0]?.charAt(0)?.toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{dataSource.owner?.split("@")[0] || "Unassigned"}</span>
                            </div>
                          </TableCell>
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
                                <DropdownMenuItem onClick={() => handleStartScan(dataSource.id)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start Scan
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => toggleFavorite(dataSource.id)}>
                                  {dataSource.favorite ? (
                                    <>
                                      <StarOff className="h-4 w-4 mr-2" />
                                      Remove from Favorites
                                    </>
                                  ) : (
                                    <>
                                      <Star className="h-4 w-4 mr-2" />
                                      Add to Favorites
                                    </>
                                  )}
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
                </CardContent>
              </Card>
            ) : (
              <div
                className={`grid gap-4 ${
                  compactView
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {filteredAndSortedDataSources.map(renderDataSourceCard)}
              </div>
            )}

            {filteredAndSortedDataSources.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Database className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No data sources found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {hasActiveFilters
                      ? "No data sources match your current filters. Try adjusting your search criteria."
                      : "Get started by adding your first data source to begin managing your data ecosystem."}
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Data Source
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Modals and Dialogs */}
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
            onSuccess={() => {
              setShowEditModal(false)
              setSelectedForAction(null)
              handleRefresh()
            }}
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
                Are you sure you want to delete "{selectedForAction?.name}"? This action cannot be undone and will
                remove all associated scans, schedules, and rule sets.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedForAction) {
                    handleDeleteDataSource(selectedForAction.id)
                  }
                  setShowDeleteDialog(false)
                  setSelectedForAction(null)
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Actions Confirmation Dialog */}
        <Dialog open={showBulkActionsDialog} onOpenChange={setShowBulkActionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Bulk Action</DialogTitle>
              <DialogDescription>
                Are you sure you want to {bulkActionType} {selectedIds.size} selected data source
                {selectedIds.size > 1 ? "s" : ""}?{bulkActionType === "delete" && " This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkActionsDialog(false)}>
                Cancel
              </Button>
              <Button variant={bulkActionType === "delete" ? "destructive" : "default"} onClick={executeBulkAction}>
                {bulkActionType === "delete" ? "Delete" : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
