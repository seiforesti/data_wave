import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Tag, 
  Database, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Filter,
  Download,
  RefreshCw,
  Brain,
  Workflow,
  Share2,
  LineChart,
  PieChart,
  Target,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useEnterpriseCatalogItems,
  useCatalogDiscovery,
  useCatalogLineage,
  useCatalogQuality,
  useCatalogTagging,
  useCatalogUsage,
  useCatalogAnalytics,
  useCatalogMonitoring,
  useCatalogInsights,
  useCatalogDataSharing,
  useCatalogWorkflow
} from '../hooks/use-enterprise-data-catalog';
import { CatalogItem, SearchFilters } from '../types/data-catalog';

export const EnhancedDataCatalogApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Enterprise hooks
  const {
    items: catalogItems,
    totalItems,
    isLoading: itemsLoading,
    createItem,
    updateItem,
    deleteItem,
    isCreating,
    isUpdating,
    isDeleting
  } = useEnterpriseCatalogItems(searchFilters);

  const { discoveryResults, search, isSearching } = useCatalogDiscovery();
  const { lineage, createLineage, isCreating: isCreatingLineage } = useCatalogLineage(selectedItem?.id);
  const { qualityRules, qualityMetrics, createQualityRule, runQualityCheck, isRunningCheck } = useCatalogQuality(selectedItem?.id);
  const { tags, allTags, addTag, removeTag, createTag, isAdding: isAddingTag } = useCatalogTagging(selectedItem?.id);
  const { usageLogs, usageAnalytics, logUsage, isLogging } = useCatalogUsage(selectedItem?.id);
  const { analytics, trends, healthMetrics, generateReport, isGeneratingReport } = useCatalogAnalytics();
  const { realTimeStats } = useCatalogMonitoring();
  const { insights, generateInsights, isGenerating } = useCatalogInsights();
  const { shareWithCompliance, shareWithScanRules, shareWithScanLogic } = useCatalogDataSharing();
  const { triggerQualityWorkflow, triggerLineageWorkflow, triggerTaggingWorkflow, triggerDiscoveryWorkflow } = useCatalogWorkflow();

  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    type: '',
    source: '',
    location: '',
    owner: '',
    tags: [] as string[]
  });

  const [editItem, setEditItem] = useState({
    name: '',
    description: '',
    type: '',
    source: '',
    location: '',
    owner: '',
    tags: [] as string[]
  });

  // Handle search
  const handleSearch = (query: string) => {
    const filters = { ...searchFilters, query };
    setSearchFilters(filters);
    search(filters);
  };

  // Handle create item
  const handleCreateItem = () => {
    createItem(newItem);
    setIsCreateDialogOpen(false);
    setNewItem({ name: '', description: '', type: '', source: '', location: '', owner: '', tags: [] });
  };

  // Handle edit item
  const handleEditItem = () => {
    if (selectedItem) {
      updateItem({ id: selectedItem.id, data: editItem });
      setIsEditDialogOpen(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = (item: CatalogItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItem(item.id);
    }
  };

  // Handle share with other groups
  const handleShareItem = (item: CatalogItem, target: string) => {
    switch (target) {
      case 'compliance':
        shareWithCompliance(item);
        break;
      case 'scan-rules':
        shareWithScanRules(item);
        break;
      case 'scan-logic':
        shareWithScanLogic(item);
        break;
    }
  };

  // Handle workflow triggers
  const handleWorkflowTrigger = (workflow: string, itemId: string) => {
    switch (workflow) {
      case 'quality':
        triggerQualityWorkflow(itemId);
        break;
      case 'lineage':
        triggerLineageWorkflow(itemId);
        break;
      case 'tagging':
        triggerTaggingWorkflow(itemId, ['auto-tagged']);
        break;
      case 'discovery':
        triggerDiscoveryWorkflow();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              Data Catalog
            </h1>
            <p className="text-slate-600 mt-2">
              Enterprise data discovery, lineage tracking, and quality management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => generateInsights()}
              disabled={isGenerating}
            >
              <Brain className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'AI Insights'}
            </Button>
            <Button
              variant="outline"
              onClick={() => triggerDiscoveryWorkflow()}
            >
              <Zap className="h-4 w-4 mr-2" />
              Auto Discovery
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Real-time Stats */}
        {realTimeStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Items</p>
                    <p className="text-2xl font-bold text-slate-900">{realTimeStats.total_items}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Quality Score</p>
                    <p className="text-2xl font-bold text-green-600">{realTimeStats.quality_score}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Users</p>
                    <p className="text-2xl font-bold text-slate-900">{realTimeStats.active_users}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Recent Activity</p>
                    <p className="text-2xl font-bold text-slate-900">{realTimeStats.recent_activity}</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Catalog Items</TabsTrigger>
            <TabsTrigger value="lineage">Data Lineage</TabsTrigger>
            <TabsTrigger value="quality">Quality Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insights ? (
                    <div className="space-y-3">
                      {insights.recommendations?.map((rec, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">{rec.title}</p>
                          <p className="text-xs text-blue-700 mt-1">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No insights available</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {catalogItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.type}</p>
                        </div>
                        <Badge variant="secondary">{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Catalog Items Tab */}
          <TabsContent value="items" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search catalog items..."
                      onChange={(e) => handleSearch(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  <Select onValueChange={(value) => setSearchFilters({ ...searchFilters, type: value })}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setSearchFilters({})}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalogItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription className="mt-1">{item.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditItem({
                              name: item.name,
                              description: item.description,
                              type: item.type,
                              source: item.source,
                              location: item.location,
                              owner: item.owner,
                              tags: item.tags || []
                            });
                            setSelectedItem(item);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Type:</span>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Status:</span>
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Owner:</span>
                        <span>{item.owner}</span>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Data Lineage Tab */}
          <TabsContent value="lineage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Lineage</CardTitle>
                <CardDescription>
                  Track data flow and dependencies across your catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedItem ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Lineage for: {selectedItem.name}</h3>
                      <Button
                        onClick={() => handleWorkflowTrigger('lineage', selectedItem.id)}
                        variant="outline"
                      >
                        <Workflow className="h-4 w-4 mr-2" />
                        Update Lineage
                      </Button>
                    </div>
                    {lineage ? (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <pre className="text-sm">{JSON.stringify(lineage, null, 2)}</pre>
                      </div>
                    ) : (
                      <p className="text-slate-500">No lineage data available</p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">Select an item to view its lineage</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Management Tab */}
          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Management</CardTitle>
                <CardDescription>
                  Monitor and enforce data quality standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedItem ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Quality for: {selectedItem.name}</h3>
                      <Button
                        onClick={() => runQualityCheck(selectedItem.id)}
                        disabled={isRunningCheck}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {isRunningCheck ? 'Running...' : 'Run Quality Check'}
                      </Button>
                    </div>
                    {qualityMetrics && (
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm font-medium">Completeness</p>
                            <p className="text-2xl font-bold text-green-600">{qualityMetrics.completeness}%</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm font-medium">Accuracy</p>
                            <p className="text-2xl font-bold text-blue-600">{qualityMetrics.accuracy}%</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm font-medium">Consistency</p>
                            <p className="text-2xl font-bold text-purple-600">{qualityMetrics.consistency}%</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">Select an item to view quality metrics</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Usage Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Total Items</span>
                        <span className="font-bold">{analytics.total_items}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Items</span>
                        <span className="font-bold text-green-600">{analytics.active_items}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Quality Score</span>
                        <span className="font-bold text-blue-600">{analytics.quality_score}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">No analytics data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trends ? (
                    <div className="space-y-3">
                      {trends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{trend.metric}</span>
                          <span className={`text-sm font-medium ${trend.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.change > 0 ? '+' : ''}{trend.change}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No trend data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Automation</CardTitle>
                <CardDescription>
                  Automated processes for data catalog management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => triggerDiscoveryWorkflow()}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Zap className="h-6 w-6 mb-2" />
                    <span>Auto Discovery</span>
                  </Button>
                  <Button
                    onClick={() => selectedItem && handleWorkflowTrigger('quality', selectedItem.id)}
                    disabled={!selectedItem}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Target className="h-6 w-6 mb-2" />
                    <span>Quality Check</span>
                  </Button>
                  <Button
                    onClick={() => selectedItem && handleWorkflowTrigger('lineage', selectedItem.id)}
                    disabled={!selectedItem}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <LineChart className="h-6 w-6 mb-2" />
                    <span>Lineage Update</span>
                  </Button>
                  <Button
                    onClick={() => selectedItem && handleWorkflowTrigger('tagging', selectedItem.id)}
                    disabled={!selectedItem}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Tag className="h-6 w-6 mb-2" />
                    <span>Auto Tagging</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Item Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Catalog Item</DialogTitle>
              <DialogDescription>
                Add a new item to the data catalog
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select onValueChange={(value) => setNewItem({ ...newItem, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={newItem.source}
                  onChange={(e) => setNewItem({ ...newItem, source: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  value={newItem.owner}
                  onChange={(e) => setNewItem({ ...newItem, owner: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateItem} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Catalog Item</DialogTitle>
              <DialogDescription>
                Update the selected catalog item
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editItem.description}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select onValueChange={(value) => setEditItem({ ...editItem, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-source">Source</Label>
                <Input
                  id="edit-source"
                  value={editItem.source}
                  onChange={(e) => setEditItem({ ...editItem, source: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editItem.location}
                  onChange={(e) => setEditItem({ ...editItem, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-owner">Owner</Label>
                <Input
                  id="edit-owner"
                  value={editItem.owner}
                  onChange={(e) => setEditItem({ ...editItem, owner: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditItem} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};