'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Database, 
  Eye, 
  Download, 
  Filter, 
  Calendar,
  Clock,
  Activity,
  PieChart,
  LineChart,
  Target,
  Layers,
  Search,
  RefreshCw,
  Settings,
  ArrowUp,
  ArrowDown,
  Minus,
  MoreHorizontal,
  ExternalLink,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Bookmark,
  Share2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

// Import hooks and services
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';
import { useCatalogRecommendations } from '../../hooks/useCatalogRecommendations';

// Import types
import type {
  UsageAnalyticsData,
  AssetPopularityMetrics,
  UserAccessPatterns,
  SearchAnalytics,
  PerformanceMetrics,
  TrendData,
  TimeRange,
  UserContext,
  CatalogAsset
} from '../../types';

interface DashboardFilters {
  dateRange: DateRange | undefined;
  assetTypes: string[];
  dataSources: string[];
  userGroups: string[];
  departments: string[];
  refreshInterval: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  description?: string;
}

interface PopularAsset {
  id: string;
  name: string;
  type: string;
  viewCount: number;
  downloadCount: number;
  qualityScore: number;
  lastAccessed: Date;
  userFavorites: number;
  department: string;
  trending: boolean;
}

interface UserActivity {
  userId: string;
  username: string;
  email: string;
  department: string;
  totalViews: number;
  uniqueAssets: number;
  avgSessionDuration: number;
  lastActive: Date;
  favoriteAssets: string[];
  searchQueries: number;
}

interface SearchInsight {
  query: string;
  count: number;
  successRate: number;
  avgResultTime: number;
  relatedAssets: string[];
  trending: boolean;
}

export const UsageAnalyticsDashboard: React.FC = () => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date()
    },
    assetTypes: [],
    dataSources: [],
    userGroups: [],
    departments: [],
    refreshInterval: 300000 // 5 minutes
  });

  const [selectedView, setSelectedView] = useState<'overview' | 'assets' | 'users' | 'search' | 'performance'>('overview');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<PopularAsset | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserActivity | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');

  // =============================================================================
  // HOOKS INTEGRATION
  // =============================================================================
  
  const {
    analyticsData,
    isLoadingAnalytics,
    getUsageAnalytics,
    getAssetPopularity,
    getUserActivity,
    getSearchAnalytics,
    getPerformanceMetrics,
    getTrendAnalysis,
    generateReports,
    exportAnalytics
  } = useCatalogAnalytics();

  const {
    recommendations,
    getAssetRecommendations,
    getUsageRecommendations
  } = useCatalogRecommendations();

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================
  
  const overviewMetrics = useMemo<MetricCard[]>(() => [
    {
      title: 'Total Asset Views',
      value: analyticsData?.totalViews?.toLocaleString() || '0',
      change: 12.5,
      trend: 'up',
      icon: Eye,
      color: 'text-blue-600',
      description: 'Total number of asset views in selected period'
    },
    {
      title: 'Unique Users',
      value: analyticsData?.uniqueUsers?.toLocaleString() || '0',
      change: 8.3,
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
      description: 'Number of unique users accessing catalog'
    },
    {
      title: 'Popular Assets',
      value: analyticsData?.popularAssets?.length || 0,
      change: 15.2,
      trend: 'up',
      icon: Star,
      color: 'text-purple-600',
      description: 'Assets with high engagement scores'
    },
    {
      title: 'Search Queries',
      value: analyticsData?.searchQueries?.toLocaleString() || '0',
      change: -2.1,
      trend: 'down',
      icon: Search,
      color: 'text-orange-600',
      description: 'Total search queries performed'
    },
    {
      title: 'Downloads',
      value: analyticsData?.totalDownloads?.toLocaleString() || '0',
      change: 24.7,
      trend: 'up',
      icon: Download,
      color: 'text-indigo-600',
      description: 'Total asset downloads'
    },
    {
      title: 'Avg. Quality Score',
      value: `${analyticsData?.avgQualityScore?.toFixed(1) || '0'}%`,
      change: 3.4,
      trend: 'up',
      icon: Target,
      color: 'text-red-600',
      description: 'Average quality score of accessed assets'
    }
  ], [analyticsData]);

  const popularAssets = useMemo<PopularAsset[]>(() => {
    return analyticsData?.popularAssets?.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      viewCount: asset.viewCount || 0,
      downloadCount: asset.downloadCount || 0,
      qualityScore: asset.qualityScore || 0,
      lastAccessed: new Date(asset.lastAccessed || Date.now()),
      userFavorites: asset.userFavorites || 0,
      department: asset.department || 'Unknown',
      trending: asset.trending || false
    })) || [];
  }, [analyticsData?.popularAssets]);

  const userActivities = useMemo<UserActivity[]>(() => {
    return analyticsData?.userActivities?.map(user => ({
      userId: user.userId,
      username: user.username,
      email: user.email,
      department: user.department || 'Unknown',
      totalViews: user.totalViews || 0,
      uniqueAssets: user.uniqueAssets || 0,
      avgSessionDuration: user.avgSessionDuration || 0,
      lastActive: new Date(user.lastActive || Date.now()),
      favoriteAssets: user.favoriteAssets || [],
      searchQueries: user.searchQueries || 0
    })) || [];
  }, [analyticsData?.userActivities]);

  const searchInsights = useMemo<SearchInsight[]>(() => {
    return analyticsData?.searchInsights?.map(insight => ({
      query: insight.query,
      count: insight.count || 0,
      successRate: insight.successRate || 0,
      avgResultTime: insight.avgResultTime || 0,
      relatedAssets: insight.relatedAssets || [],
      trending: insight.trending || false
    })) || [];
  }, [analyticsData?.searchInsights]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  const handleFilterChange = useCallback((key: keyof DashboardFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleRefreshData = useCallback(async () => {
    try {
      await Promise.all([
        getUsageAnalytics({
          dateRange: filters.dateRange,
          assetTypes: filters.assetTypes,
          dataSources: filters.dataSources
        }),
        getAssetPopularity(filters.dateRange),
        getUserActivity(filters.dateRange),
        getSearchAnalytics(filters.dateRange),
        getPerformanceMetrics(filters.dateRange)
      ]);
    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
    }
  }, [filters, getUsageAnalytics, getAssetPopularity, getUserActivity, getSearchAnalytics, getPerformanceMetrics]);

  const handleExportData = useCallback(async () => {
    try {
      await exportAnalytics({
        format: exportFormat,
        dateRange: filters.dateRange,
        includeCharts: true,
        sections: ['overview', 'assets', 'users', 'search']
      });
    } catch (error) {
      console.error('Failed to export analytics data:', error);
    }
  }, [exportFormat, filters.dateRange, exportAnalytics]);

  const handleAssetDetails = useCallback((asset: PopularAsset) => {
    setSelectedAsset(asset);
  }, []);

  const handleUserDetails = useCallback((user: UserActivity) => {
    setSelectedUser(user);
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  useEffect(() => {
    handleRefreshData();
  }, [handleRefreshData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoRefresh && filters.refreshInterval > 0) {
      interval = setInterval(handleRefreshData, filters.refreshInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, filters.refreshInterval, handleRefreshData]);

  // =============================================================================
  // COMPONENT RENDERS
  // =============================================================================
  
  const MetricCardComponent: React.FC<{ metric: MetricCard }> = ({ metric }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        <metric.icon className={`h-4 w-4 ${metric.color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {metric.trend === 'up' && <ArrowUp className="h-3 w-3 text-green-500 mr-1" />}
          {metric.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500 mr-1" />}
          {metric.trend === 'stable' && <Minus className="h-3 w-3 text-gray-500 mr-1" />}
          <span className={
            metric.trend === 'up' ? 'text-green-600' :
            metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }>
            {metric.change > 0 ? '+' : ''}{metric.change}%
          </span>
          <span className="ml-1">vs last period</span>
        </div>
        {metric.description && (
          <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
        )}
      </CardContent>
    </Card>
  );

  const OverviewDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewMetrics.map((metric, index) => (
          <MetricCardComponent key={index} metric={metric} />
        ))}
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Usage Trends
            </CardTitle>
            <CardDescription>Asset usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Usage trends chart would be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Asset Types Distribution
            </CardTitle>
            <CardDescription>Breakdown by asset types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Asset distribution chart would be rendered here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top Users
            </CardTitle>
            <CardDescription>Most active users this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userActivities.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{user.totalViews}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Top Assets
            </CardTitle>
            <CardDescription>Most popular assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularAssets.slice(0, 5).map((asset, index) => (
                <div key={asset.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{asset.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">{asset.type}</Badge>
                        {asset.trending && <Badge variant="outline" className="text-xs">🔥 Trending</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{asset.viewCount}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest catalog activities</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {/* Mock recent activities */}
              {[...Array(10)].map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">john.doe</span> viewed{' '}
                      <span className="font-medium">customer_profiles</span> table
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(Math.random() * 60)} minutes ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const AssetAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Asset Analytics
            </span>
            <div className="flex items-center space-x-2">
              <Select value="popularity" onValueChange={() => {}}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Favorites</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Trending</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popularAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{asset.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{asset.type}</Badge>
                  </TableCell>
                  <TableCell>{asset.viewCount.toLocaleString()}</TableCell>
                  <TableCell>{asset.downloadCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={asset.qualityScore} className="w-16" />
                      <span className="text-sm">{asset.qualityScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{asset.userFavorites}</TableCell>
                  <TableCell>{asset.department}</TableCell>
                  <TableCell>
                    {asset.trending && (
                      <Badge variant="outline" className="text-orange-600">
                        🔥 Trending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAssetDetails(asset)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const UserAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Analytics
            </span>
            <div className="flex items-center space-x-2">
              <Select value="activity" onValueChange={() => {}}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Total Views</TableHead>
                <TableHead>Unique Assets</TableHead>
                <TableHead>Avg Session</TableHead>
                <TableHead>Search Queries</TableHead>
                <TableHead>Favorites</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userActivities.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.totalViews.toLocaleString()}</TableCell>
                  <TableCell>{user.uniqueAssets}</TableCell>
                  <TableCell>{Math.round(user.avgSessionDuration / 60)}m</TableCell>
                  <TableCell>{user.searchQueries}</TableCell>
                  <TableCell>{user.favoriteAssets.length}</TableCell>
                  <TableCell>{format(user.lastActive, 'MMM dd, HH:mm')}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUserDetails(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const SearchAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Top Search Queries
            </CardTitle>
            <CardDescription>Most frequently searched terms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchInsights.slice(0, 8).map((insight, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{insight.query}</p>
                      <p className="text-xs text-muted-foreground">
                        {insight.successRate}% success rate
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{insight.count}</p>
                    <p className="text-xs text-muted-foreground">searches</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Search Performance
            </CardTitle>
            <CardDescription>Search response times and success rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Response Time</span>
                <span className="text-2xl font-bold">
                  {analyticsData?.avgSearchTime?.toFixed(0) || 0}ms
                </span>
              </div>
              <Progress value={75} className="w-full" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-2xl font-bold">
                  {analyticsData?.searchSuccessRate?.toFixed(1) || 0}%
                </span>
              </div>
              <Progress value={analyticsData?.searchSuccessRate || 0} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usage Analytics</h2>
            <p className="text-muted-foreground">
              Monitor catalog usage patterns and user behavior
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersDialog(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              disabled={isLoadingAnalytics}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            >
              <Clock className="h-4 w-4 mr-2" />
              Auto Refresh {isAutoRefresh ? 'On' : 'Off'}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewDashboard />
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <AssetAnalytics />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserAnalytics />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <SearchAnalytics />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance and optimization insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Performance metrics visualization would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Analytics Filters</DialogTitle>
              <DialogDescription>
                Configure filters to customize your analytics view
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        {filters.dateRange?.from && filters.dateRange?.to ? (
                          `${format(filters.dateRange.from, 'MMM dd')} - ${format(filters.dateRange.to, 'MMM dd')}`
                        ) : (
                          'Select date range'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="range"
                        selected={filters.dateRange}
                        onSelect={(range) => handleFilterChange('dateRange', range)}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Refresh Interval</Label>
                  <Select
                    value={filters.refreshInterval.toString()}
                    onValueChange={(value) => handleFilterChange('refreshInterval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Manual</SelectItem>
                      <SelectItem value="60000">1 minute</SelectItem>
                      <SelectItem value="300000">5 minutes</SelectItem>
                      <SelectItem value="900000">15 minutes</SelectItem>
                      <SelectItem value="3600000">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowFiltersDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowFiltersDialog(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default UsageAnalyticsDashboard;