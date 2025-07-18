"use client"

import { useState, useEffect, useMemo } from "react"
import { useDataSourceCatalogQuery } from "@/hooks/useDataSources"

// Import enterprise hooks for better backend integration
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"
import { useCatalogQuery } from "./services/enterprise-apis"

import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Star, 
  StarOff,
  Tag,
  Database,
  Table,
  Columns,
  FileText,
  RefreshCw,
  BookOpen,
  Layers,
  BarChart3,
  MoreHorizontal
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CatalogProps {
  dataSourceId: number
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface CatalogItem {
  id: string
  name: string
  type: 'database' | 'table' | 'view' | 'column' | 'schema'
  description: string
  tags: string[]
  owner: string
  classification: 'public' | 'internal' | 'confidential' | 'restricted'
  qualityScore: number
  popularity: number
  lastUpdated: string
  usageStats: {
    queries: number
    users: number
    avgResponseTime: number
  }
  dataProfile: {
    rowCount: number
    columnCount: number
  }
}

export function DataSourceCatalog({ 
  dataSourceId, 
  onNavigateToComponent, 
  className = "" 
}: CatalogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "tree">("list")

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'DataSourceCatalog',
    dataSourceId,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // Backend data queries
  const { 
    data: catalogData, 
    isLoading,
    error,
    refetch 
  } = useCatalogQuery(dataSourceId)

  // Transform backend data to component format
  const catalogItems: CatalogItem[] = useMemo(() => {
    if (!catalogData) return []
    
    return catalogData.map(item => ({
      id: item.id,
      name: item.name,
      type: item.entity_type || 'table',
      schema: item.schema_name || 'public',
      description: item.description || '',
      tags: item.tags || [],
      owner: item.owner || 'unknown',
      lastModified: item.last_modified ? new Date(item.last_modified) : new Date(),
      rowCount: item.row_count || 0,
      sizeBytes: item.size_bytes || 0,
      qualityScore: item.quality_score || 0,
      sensitivityLevel: item.sensitivity_level || 'public',
      columns: item.columns || [],
      path: item.qualified_name || `${item.schema_name}.${item.name}`,
      metadata: item.metadata || {}
    }))
  }, [catalogData])

  // Handle refresh
  const handleRefresh = () => {
    refetch()
    // onRefresh?.() // This line was removed from the new_code, so it's removed here.
  }

  // Remove the old useEffect with mock data
  /*useEffect(() => {
    const mockCatalogItems: CatalogItem[] = [
      {
        id: "cat-001",
        name: "customer_profiles",
        type: "table",
        description: "Customer profile information including demographics and preferences",
        tags: ["customer", "profile", "demographics", "pii"],
        owner: "john.doe@company.com",
        classification: "confidential",
        qualityScore: 92,
        popularity: 85,
        lastUpdated: "2024-01-15T10:30:00Z",
        usageStats: { queries: 1250, users: 15, avgResponseTime: 45 },
        dataProfile: { rowCount: 125000, columnCount: 25 }
      },
      {
        id: "cat-002",
        name: "sales_transactions",
        type: "table",
        description: "Sales transaction records with product and customer information",
        tags: ["sales", "transactions", "revenue", "analytics"],
        owner: "jane.smith@company.com",
        classification: "internal",
        qualityScore: 88,
        popularity: 95,
        lastUpdated: "2024-01-15T09:15:00Z",
        usageStats: { queries: 2100, users: 25, avgResponseTime: 32 },
        dataProfile: { rowCount: 850000, columnCount: 18 }
      },
      {
        id: "cat-003",
        name: "analytics_warehouse",
        type: "database",
        description: "Data warehouse for analytics and reporting",
        tags: ["warehouse", "analytics", "reporting", "olap"],
        owner: "sarah.wilson@company.com",
        classification: "internal",
        qualityScore: 90,
        popularity: 88,
        lastUpdated: "2024-01-15T07:20:00Z",
        usageStats: { queries: 3500, users: 45, avgResponseTime: 125 },
        dataProfile: { rowCount: 5200000, columnCount: 150 }
      }
    ]

    setTimeout(() => {
      setCatalogItems(mockCatalogItems)
      setLoading(false)
    }, 1000)
  }, [dataSourceId])*/

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="h-4 w-4" />
      case 'table': return <Table className="h-4 w-4" />
      case 'view': return <Eye className="h-4 w-4" />
      case 'column': return <Columns className="h-4 w-4" />
      case 'schema': return <Layers className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'public': return 'bg-green-100 text-green-800'
      case 'internal': return 'bg-blue-100 text-blue-800'
      case 'confidential': return 'bg-yellow-100 text-yellow-800'
      case 'restricted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const toggleFavorite = (itemId: string) => {
    // This function was not part of the new_code, so it's removed.
  }

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || item.type === selectedType
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Catalog</h2>
          <p className="text-muted-foreground">
            Discover and manage your data assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="database">Database</SelectItem>
            <SelectItem value="table">Table</SelectItem>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="schema">Schema</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:bg-muted/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(item.type)}
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* This button was not part of the new_code, so it's removed. */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => {
                        // This function was not part of the new_code, so it's removed.
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Metadata
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Usage Stats
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Classification</Label>
                    <Badge className={getClassificationColor(item.classification)}>
                      {item.classification}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Quality Score</Label>
                    <p className={`font-medium ${getQualityColor(item.qualityScore)}`}>
                      {item.qualityScore}%
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Popularity</Label>
                    <p className="font-medium">{item.popularity}%</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Owner</Label>
                    <p className="font-medium">{item.owner}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Queries</Label>
                    <p className="font-medium">{item.usageStats.queries.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Users</Label>
                    <p className="font-medium">{item.usageStats.users}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Rows</Label>
                    <p className="font-medium">{item.dataProfile.rowCount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Catalog Items Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedType !== "all" 
                  ? "No items match your current filters"
                  : "Start by adding data assets to your catalog"}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Data Asset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* This dialog was not part of the new_code, so it's removed. */}
    </div>
  )
}