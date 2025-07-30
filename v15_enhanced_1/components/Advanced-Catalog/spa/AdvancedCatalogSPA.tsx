'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Database, 
  FileText, 
  Users, 
  BarChart3, 
  GitBranch,
  Shield,
  Brain,
  Settings,
  Bell,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Eye,
  Tag,
  Workflow,
  Layers,
  Activity,
  TrendingUp,
  MessageSquare,
  Star,
  Bookmark,
  Share2,
  Calendar,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  Grid,
  List,
  Map,
  Layers3,
  Network,
  Gauge,
  PieChart,
  LineChart,
  BarChart,
  Sparkles,
  Bot,
  Monitor,
  Globe,
  Lock,
  Unlock,
  User,
  Team
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Import Advanced Catalog Components
import { AIDiscoveryEngine } from '../components/intelligent-discovery/AIDiscoveryEngine';
import { SemanticSchemaAnalyzer } from '../components/intelligent-discovery/SemanticSchemaAnalyzer';
import { AutoClassificationEngine } from '../components/intelligent-discovery/AutoClassificationEngine';
import { DataSourceIntegrator } from '../components/intelligent-discovery/DataSourceIntegrator';
import { MetadataEnrichmentEngine } from '../components/intelligent-discovery/MetadataEnrichmentEngine';
import { SchemaEvolutionTracker } from '../components/intelligent-discovery/SchemaEvolutionTracker';
import { DataProfilingEngine } from '../components/intelligent-discovery/DataProfilingEngine';
import { IncrementalDiscovery } from '../components/intelligent-discovery/IncrementalDiscovery';

import { IntelligentCatalogViewer } from '../components/catalog-intelligence/IntelligentCatalogViewer';

// Import hooks
import { useCatalogDiscovery } from '../hooks/useCatalogDiscovery';
import { useCatalogAnalytics } from '../hooks/useCatalogAnalytics';
import { useCatalogCollaboration } from '../hooks/useCatalogCollaboration';
import { useCatalogLineage } from '../hooks/useCatalogLineage';
import { useCatalogRecommendations } from '../hooks/useCatalogRecommendations';
import { useCatalogAI } from '../hooks/useCatalogAI';
import { useCatalogProfiling } from '../hooks/useCatalogProfiling';

// Import types
import type {
  CatalogAsset,
  CatalogSearchRequest,
  CatalogSearchResponse,
  DiscoveryJobStats,
  QualityMetrics,
  LineageGraph,
  CollaborationMetrics,
  RecommendationInsight,
  UserContext,
  SystemContext,
  TimeRange,
  Pagination,
  SortOption,
  GenericFilter
} from '../types';

// Import constants
import { CATALOG_VIEWS, QUALITY_THRESHOLDS, SEARCH_CONFIG } from '../constants';

interface CatalogViewState {
  activeView: string;
  selectedAssets: string[];
  searchQuery: string;
  filters: GenericFilter[];
  sortOptions: SortOption[];
  pagination: Pagination;
  timeRange: TimeRange | null;
  isLoading: boolean;
  selectedAsset: CatalogAsset | null;
  showAdvancedFilters: boolean;
  showBulkActions: boolean;
  viewMode: 'grid' | 'list' | 'lineage' | 'analytics';
}

interface CatalogDashboardMetrics {
  totalAssets: number;
  qualityScore: number;
  discoveryJobs: number;
  collaborationScore: number;
  lineageCompletenessPct: number;
  aiInsights: number;
  trendData: any[];
  alertsCount: number;
  activeUsersCount: number;
  recentActivity: any[];
}

interface CatalogNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionRequired: boolean;
  relatedAssets?: string[];
}

export const AdvancedCatalogSPA: React.FC = () => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  const [viewState, setViewState] = useState<CatalogViewState>({
    activeView: 'dashboard',
    selectedAssets: [],
    searchQuery: '',
    filters: [],
    sortOptions: [{ field: 'name', direction: 'ASC' }],
    pagination: {
      page: 1,
      size: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false
    },
    timeRange: null,
    isLoading: false,
    selectedAsset: null,
    showAdvancedFilters: false,
    showBulkActions: false,
    viewMode: 'grid'
  });

  const [dashboardMetrics, setDashboardMetrics] = useState<CatalogDashboardMetrics>({
    totalAssets: 0,
    qualityScore: 0,
    discoveryJobs: 0,
    collaborationScore: 0,
    lineageCompletenessPct: 0,
    aiInsights: 0,
    trendData: [],
    alertsCount: 0,
    activeUsersCount: 0,
    recentActivity: []
  });

  const [notifications, setNotifications] = useState<CatalogNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchResults, setSearchResults] = useState<CatalogSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dialog states
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [showDiscoveryConfig, setShowDiscoveryConfig] = useState(false);
  const [showQualityConfig, setShowQualityConfig] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // =============================================================================
  // HOOKS INTEGRATION
  // =============================================================================
  
  const {
    discoveryJobs,
    isLoadingJobs,
    createDiscoveryJob,
    updateDiscoveryJob,
    executeDiscoveryJob,
    getDiscoveryStats,
    getDiscoveryRecommendations
  } = useCatalogDiscovery();

  const {
    analyticsData,
    isLoadingAnalytics,
    getUsageAnalytics,
    getPerformanceMetrics,
    getTrendAnalysis,
    generateReports
  } = useCatalogAnalytics();

  const {
    collaborationData,
    isLoadingCollaboration,
    getCollaborationMetrics,
    createAnnotation,
    updateAnnotation,
    getTeamActivity
  } = useCatalogCollaboration();

  const {
    lineageData,
    isLoadingLineage,
    getAssetLineage,
    getImpactAnalysis,
    getLineageVisualization,
    updateLineage
  } = useCatalogLineage();

  const {
    recommendations,
    isLoadingRecommendations,
    getPersonalizedRecommendations,
    getAssetRecommendations,
    getUsageRecommendations
  } = useCatalogRecommendations();

  const {
    aiInsights,
    isLoadingAI,
    generateInsights,
    getSmartSuggestions,
    getPatternAnalysis,
    getAnomalyDetection
  } = useCatalogAI();

  const {
    profilingJobs,
    isLoadingProfiling,
    createProfilingJob,
    getProfilingResults,
    getQualityMetrics
  } = useCatalogProfiling();

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  const filteredAssets = useMemo(() => {
    if (!searchResults?.assets) return [];
    
    let filtered = searchResults.assets;
    
    // Apply filters
    viewState.filters.forEach(filter => {
      filtered = filtered.filter(asset => {
        const fieldValue = (asset as any)[filter.field];
        switch (filter.operator) {
          case 'EQUALS':
            return fieldValue === filter.value;
          case 'CONTAINS':
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'IN':
            return Array.isArray(filter.value) ? filter.value.includes(fieldValue) : false;
          default:
            return true;
        }
      });
    });
    
    // Apply sorting
    if (viewState.sortOptions.length > 0) {
      const sort = viewState.sortOptions[0];
      filtered.sort((a, b) => {
        const aVal = (a as any)[sort.field];
        const bVal = (b as any)[sort.field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.direction === 'DESC' ? -comparison : comparison;
      });
    }
    
    return filtered;
  }, [searchResults, viewState.filters, viewState.sortOptions]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const criticalAlertsCount = useMemo(() => {
    return notifications.filter(n => n.type === 'error' && n.actionRequired).length;
  }, [notifications]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  const handleViewChange = useCallback((newView: string) => {
    setViewState(prev => ({
      ...prev,
      activeView: newView,
      selectedAssets: [],
      selectedAsset: null
    }));
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setViewState(prev => ({ ...prev, searchQuery: query, isLoading: true }));
    
    try {
      // This would call the actual search service
      // const results = await semanticSearchService.searchAssets({
      //   query,
      //   filters: viewState.filters,
      //   pagination: viewState.pagination,
      //   sortOptions: viewState.sortOptions
      // });
      
      // Mock results for now
      const mockResults: CatalogSearchResponse = {
        assets: [],
        total: 0,
        facets: [],
        suggestions: [],
        executionTime: Date.now(),
        searchId: `search_${Date.now()}`
      };
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
      setViewState(prev => ({ ...prev, isLoading: false }));
    }
  }, [viewState.filters, viewState.pagination, viewState.sortOptions]);

  const handleAssetSelect = useCallback((assetId: string, isMultiSelect: boolean = false) => {
    setViewState(prev => {
      if (isMultiSelect) {
        const newSelected = prev.selectedAssets.includes(assetId)
          ? prev.selectedAssets.filter(id => id !== assetId)
          : [...prev.selectedAssets, assetId];
        return { ...prev, selectedAssets: newSelected };
      } else {
        return { ...prev, selectedAssets: [assetId] };
      }
    });
  }, []);

  const handleAssetView = useCallback((asset: CatalogAsset) => {
    setViewState(prev => ({ ...prev, selectedAsset: asset }));
    setShowAssetDetails(true);
  }, []);

  const handleFilterAdd = useCallback((filter: GenericFilter) => {
    setViewState(prev => ({
      ...prev,
      filters: [...prev.filters.filter(f => f.field !== filter.field), filter]
    }));
  }, []);

  const handleFilterRemove = useCallback((field: string) => {
    setViewState(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.field !== field)
    }));
  }, []);

  const handleNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  }, []);

  const handleNotificationAction = useCallback((notification: CatalogNotification) => {
    // Handle notification actions based on type
    switch (notification.type) {
      case 'error':
        // Navigate to error resolution
        break;
      case 'warning':
        // Show warning details
        break;
      default:
        break;
    }
    handleNotificationRead(notification.id);
  }, [handleNotificationRead]);

  const handleBulkAction = useCallback(async (action: string, assetIds: string[]) => {
    switch (action) {
      case 'delete':
        // Handle bulk delete
        break;
      case 'tag':
        // Handle bulk tagging
        break;
      case 'quality_check':
        // Handle bulk quality assessment
        break;
      case 'lineage_update':
        // Handle bulk lineage update
        break;
      default:
        break;
    }
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  useEffect(() => {
    // Load initial dashboard data
    const loadDashboardData = async () => {
      try {
        // Load metrics, notifications, etc.
        const [
          analytics,
          discoveryStats,
          qualityMetrics,
          collaborationMetrics,
          lineageMetrics
        ] = await Promise.all([
          getUsageAnalytics(),
          getDiscoveryStats(),
          getQualityMetrics(),
          getCollaborationMetrics(),
          // getLineageMetrics() // This would need to be implemented
        ]);

        setDashboardMetrics({
          totalAssets: analytics?.totalAssets || 0,
          qualityScore: qualityMetrics?.overallScore || 0,
          discoveryJobs: discoveryStats?.totalJobs || 0,
          collaborationScore: collaborationMetrics?.teamScore || 0,
          lineageCompletenessPct: 85, // Mock value
          aiInsights: 12, // Mock value
          trendData: analytics?.trends || [],
          alertsCount: 3, // Mock value
          activeUsersCount: 156, // Mock value
          recentActivity: [] // Mock value
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [getUsageAnalytics, getDiscoveryStats, getQualityMetrics, getCollaborationMetrics]);

  // =============================================================================
  // DASHBOARD VIEW COMPONENTS
  // =============================================================================
  
  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.totalAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.qualityScore}%</div>
            <Progress value={dashboardMetrics.qualityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.aiInsights}</div>
            <p className="text-xs text-muted-foreground">New recommendations</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.activeUsersCount}</div>
            <p className="text-xs text-muted-foreground">In the last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col p-4"
                onClick={() => setShowDiscoveryConfig(true)}
              >
                <Search className="h-6 w-6 mb-2" />
                <span className="text-sm">New Discovery</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col p-4"
                onClick={() => setShowQualityConfig(true)}
              >
                <Shield className="h-6 w-6 mb-2" />
                <span className="text-sm">Quality Check</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col p-4"
                onClick={() => handleViewChange('lineage')}
              >
                <GitBranch className="h-6 w-6 mb-2" />
                <span className="text-sm">View Lineage</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col p-4"
                onClick={() => setShowCollaborationPanel(true)}
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Collaborate</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alerts
              </span>
              {criticalAlertsCount > 0 && (
                <Badge variant="destructive">{criticalAlertsCount}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 3).map(notification => (
                <Alert key={notification.id} className={`${
                  notification.type === 'error' ? 'border-red-200' :
                  notification.type === 'warning' ? 'border-yellow-200' :
                  'border-blue-200'
                }`}>
                  {notification.type === 'error' && <XCircle className="h-4 w-4" />}
                  {notification.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                  {notification.type === 'info' && <Info className="h-4 w-4" />}
                  {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                  <AlertTitle className="text-sm">{notification.title}</AlertTitle>
                  <AlertDescription className="text-xs">
                    {notification.message}
                  </AlertDescription>
                </Alert>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowNotifications(true)}
              >
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {dashboardMetrics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Discovery job completed</p>
                      <p className="text-muted-foreground text-xs">2 minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Quality Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {/* Chart component would go here */}
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Quality trends visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // =============================================================================
  // SEARCH VIEW COMPONENTS
  // =============================================================================
  
  const SearchInterface = () => (
    <div className="space-y-6">
      {/* Advanced Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets, schemas, tables, or ask a question..."
                  value={viewState.searchQuery}
                  onChange={(e) => setViewState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(viewState.searchQuery)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => handleSearch(viewState.searchQuery)} disabled={isSearching}>
                {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setViewState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {viewState.showAdvancedFilters && (
              <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Asset Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="schema">Schema</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data Source</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgres">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="oracle">Oracle</SelectItem>
                        <SelectItem value="sqlserver">SQL Server</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quality Score</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (90-100%)</SelectItem>
                        <SelectItem value="medium">Medium (70-89%)</SelectItem>
                        <SelectItem value="low">Low (0-69%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                  <Button size="sm">
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="flex space-x-6">
        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">
                {searchResults ? `${searchResults.total} results` : 'Search results will appear here'}
              </h3>
              {viewState.selectedAssets.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewState(prev => ({ ...prev, showBulkActions: !prev.showBulkActions }))}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {viewState.selectedAssets.length} selected
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Label className="text-sm">View:</Label>
              <Button
                variant={viewState.viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewState(prev => ({ ...prev, viewMode: 'grid' }))}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewState.viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewState(prev => ({ ...prev, viewMode: 'list' }))}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {viewState.showBulkActions && viewState.selectedAssets.length > 0 && (
            <Card className="mb-4 border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {viewState.selectedAssets.length} assets selected
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Tag className="h-4 w-4 mr-2" />
                      Tag
                    </Button>
                    <Button size="sm" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Quality Check
                    </Button>
                    <Button size="sm" variant="outline">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Update Lineage
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Grid/List */}
          <div className={
            viewState.viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-2"
          }>
            {filteredAssets.map((asset) => (
              <Card 
                key={asset.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  viewState.selectedAssets.includes(asset.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleAssetSelect(asset.id)}
              >
                <CardContent className={viewState.viewMode === 'grid' ? 'p-4' : 'p-3'}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium truncate">{asset.name}</h4>
                        <Checkbox
                          checked={viewState.selectedAssets.includes(asset.id)}
                          onChange={() => handleAssetSelect(asset.id, true)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {asset.description || 'No description available'}
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <Badge variant="secondary">{asset.type}</Badge>
                        {asset.qualityScore && (
                          <Badge variant={asset.qualityScore > 80 ? 'default' : 'destructive'}>
                            {asset.qualityScore}% quality
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssetView(asset);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {searchResults && filteredAssets.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Search Facets/Filters Sidebar */}
        <div className="w-64 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Search Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {['user_profiles', 'order_history', 'product_catalog', 'payment_data'].map(suggestion => (
                  <Button
                    key={suggestion}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handleSearch(suggestion)}
                  >
                    <Search className="h-3 w-3 mr-2" />
                    {suggestion.replace(/_/g, ' ')}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Popular Assets</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {['customers', 'orders', 'products', 'transactions'].map(asset => (
                  <div key={asset} className="flex items-center justify-between text-xs">
                    <span className="flex items-center">
                      <Database className="h-3 w-3 mr-2" />
                      {asset}
                    </span>
                    <Badge variant="outline">
                      {Math.floor(Math.random() * 100)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // =============================================================================
  // MAIN NAVIGATION AND LAYOUT
  // =============================================================================
  
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'search', label: 'Search & Discovery', icon: Search },
    { id: 'catalog', label: 'Catalog Browser', icon: Database },
    { id: 'lineage', label: 'Data Lineage', icon: GitBranch },
    { id: 'quality', label: 'Quality Management', icon: Shield },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold flex items-center">
                <Database className="h-6 w-6 mr-2 text-blue-600" />
                Advanced Catalog
              </h1>
              <Separator orientation="vertical" className="h-6" />
              <nav className="hidden md:flex space-x-6">
                {navigationItems.slice(0, 6).map(item => (
                  <Button
                    key={item.id}
                    variant={viewState.activeView === item.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewChange(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-2">
              {/* Quick Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Quick search..."
                  className="pl-10 w-64"
                  value={viewState.searchQuery}
                  onChange={(e) => setViewState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleViewChange('search');
                      handleSearch(viewState.searchQuery);
                    }
                  }}
                />
              </div>

              {/* Notifications */}
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadNotificationsCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                        {unreadNotificationsCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <h4 className="font-medium">Notifications</h4>
                  </div>
                  <ScrollArea className="max-h-64">
                    <div className="p-2">
                      {notifications.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No notifications
                        </p>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg mb-2 cursor-pointer hover:bg-muted/50 ${
                              !notification.isRead ? 'bg-blue-50 border border-blue-200' : ''
                            }`}
                            onClick={() => handleNotificationAction(notification)}
                          >
                            <div className="flex items-start space-x-2">
                              {notification.type === 'error' && <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />}
                              {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />}
                              {notification.type === 'info' && <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />}
                              {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(notification.timestamp, 'MMM dd, HH:mm')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsDialog(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* User Menu */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-2">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">john.doe@company.com</p>
                    </div>
                    <Separator />
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Preferences
                    </Button>
                    <Separator />
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Sign out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {viewState.activeView === 'dashboard' && <DashboardOverview />}
          {viewState.activeView === 'search' && <SearchInterface />}
          {viewState.activeView === 'catalog' && (
            <div className="space-y-6">
              <IntelligentCatalogViewer />
            </div>
          )}
          {viewState.activeView === 'lineage' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Lineage Visualization</CardTitle>
                  <CardDescription>
                    Interactive lineage graphs and impact analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 border rounded-lg flex items-center justify-center bg-muted/20">
                    <div className="text-center text-muted-foreground">
                      <Network className="h-12 w-12 mx-auto mb-2" />
                      <p>Lineage visualization component will be rendered here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {viewState.activeView === 'quality' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Quality Management</CardTitle>
                  <CardDescription>
                    Monitor and manage data quality across your catalog
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 border rounded-lg flex items-center justify-center bg-muted/20">
                    <div className="text-center text-muted-foreground">
                      <Gauge className="h-12 w-12 mx-auto mb-2" />
                      <p>Quality management components will be rendered here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {viewState.activeView === 'discovery' && (
            <div className="space-y-6">
              <Tabs defaultValue="ai-discovery" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="ai-discovery">AI Discovery</TabsTrigger>
                  <TabsTrigger value="schema-analyzer">Schema Analysis</TabsTrigger>
                  <TabsTrigger value="classification">Auto Classification</TabsTrigger>
                  <TabsTrigger value="profiling">Data Profiling</TabsTrigger>
                </TabsList>
                <TabsContent value="ai-discovery">
                  <AIDiscoveryEngine />
                </TabsContent>
                <TabsContent value="schema-analyzer">
                  <SemanticSchemaAnalyzer />
                </TabsContent>
                <TabsContent value="classification">
                  <AutoClassificationEngine />
                </TabsContent>
                <TabsContent value="profiling">
                  <DataProfilingEngine />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>

        {/* Dialogs */}
        <Dialog open={showAssetDetails} onOpenChange={setShowAssetDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Asset Details</DialogTitle>
              <DialogDescription>
                Comprehensive information about the selected asset
              </DialogDescription>
            </DialogHeader>
            {viewState.selectedAsset && (
              <div className="space-y-6">
                {/* Asset details content would go here */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-2" />
                      <p>Asset details panel for: {viewState.selectedAsset.name}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showDiscoveryConfig} onOpenChange={setShowDiscoveryConfig}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure Data Discovery</DialogTitle>
              <DialogDescription>
                Set up a new data discovery job
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="discovery-name">Discovery Job Name</Label>
                <Input id="discovery-name" placeholder="Enter job name" />
              </div>
              <div>
                <Label htmlFor="data-source">Data Source</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDiscoveryConfig(false)}>
                  Cancel
                </Button>
                <Button>Create Discovery Job</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AdvancedCatalogSPA;