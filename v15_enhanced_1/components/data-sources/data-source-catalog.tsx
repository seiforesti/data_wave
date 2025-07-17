"use client"

import { useState, useEffect } from "react"
import { useDataSourceCatalogQuery } from "@/hooks/useDataSources"
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

interface DataSourceCatalogProps {
  dataSourceId: number
  onRefresh?: () => void
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

export function DataSourceCatalog({ dataSourceId, onRefresh }: DataSourceCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [favoriteItems, setFavoriteItems] = useState<string[]>([])

  // Use API hook to fetch catalog data
  const { 
    data: catalogResponse, 
    isLoading: loading, 
    error, 
    refetch 
  } = useDataSourceCatalogQuery(dataSourceId)

  const catalogItems = catalogResponse?.data?.catalog || []

  // Handle refresh
  const handleRefresh = () => {
    refetch()
    onRefresh?.()
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
    setFavoriteItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || item.type === filterType
    return matchesSearch && matchesType
  })

  if (loading) {
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
        <Select value={filterType} onValueChange={setFilterType}>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(item.id)}
                  >
                    {favoriteItems.includes(item.id) ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
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
                      <DropdownMenuItem onClick={() => {
                        setSelectedItem(item)
                        setShowDetailsDialog(true)
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
                {searchTerm || filterType !== "all" 
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

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && getTypeIcon(selectedItem.type)}
              {selectedItem?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Owner</Label>
                  <p className="font-medium">{selectedItem.owner}</p>
                </div>
                <div>
                  <Label>Classification</Label>
                  <Badge className={getClassificationColor(selectedItem.classification)}>
                    {selectedItem.classification}
                  </Badge>
                </div>
                <div>
                  <Label>Quality Score</Label>
                  <p className={`font-medium ${getQualityColor(selectedItem.qualityScore)}`}>
                    {selectedItem.qualityScore}%
                  </p>
                </div>
                <div>
                  <Label>Popularity</Label>
                  <p className="font-medium">{selectedItem.popularity}%</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}