// ============================================================================
// USAGE ANALYTICS DASHBOARD - ADVANCED CATALOG ANALYTICS
// ============================================================================
// Enterprise-grade usage analytics dashboard providing comprehensive insights
// into data asset utilization, user engagement patterns, and business value metrics
// ============================================================================

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Database, 
  BarChart3, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Search,
  Bell,
  BookOpen,
  Shield,
  Layers,
  MapPin,
  PieChart,
  LineChart,
  BarChart2,
  Hash,
  Percent,
  DollarSign,
  Globe
} from 'lucide-react';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Button,
} from '@/components/ui/button';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Progress,
} from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Input,
} from '@/components/ui/input';
import {
  Separator,
} from '@/components/ui/separator';
import {
  Switch,
} from '@/components/ui/switch';
import {
  Label,
} from '@/components/ui/label';
import {
  ScrollArea,
} from '@/components/ui/scroll-area';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Chart Components
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
} from 'recharts';

// Services and Types
import { 
  useCatalogAnalytics,
  useUsageAnalytics,
  useRealTimeMetrics 
} from '../../hooks/useCatalogAnalytics';
import { 
  UsageAnalyticsModule,
  AnalyticsDashboardConfig,
  UsageMetric,
  UserEngagementMetric,
  AssetPopularityMetric,
  UsageTrend,
  UserBehaviorAnalysis,
  AccessPatternAnalysis,
  UsageRecommendation,
  UsagePerformanceMetrics,
  AnalyticsFilter,
  TimePeriod
} from '../../types/analytics.types';
import { IntelligentDataAsset } from '../../types/catalog-core.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UsageAnalyticsDashboardProps {
  className?: string;
  initialTimeRange?: TimePeriod;
  enableRealTime?: boolean;
  enableExport?: boolean;
  customFilters?: AnalyticsFilter[];
  onInsightGenerated?: (insight: any) => void;
}

interface DashboardState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface UsageMetricsOverview {
  totalAssets: number;
  activeUsers: number;
  totalViews: number;
  avgUsageScore: number;
  trendingAssets: number;
  topCategories: string[];
  usageGrowth: number;
  userGrowth: number;
}

interface AdvancedUsageInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionable: boolean;
  recommendations?: string[];
  impact: number;
  category: string;
  timestamp: Date;
}

// ============================================================================
// USAGE ANALYTICS DASHBOARD COMPONENT
// ============================================================================

export const UsageAnalyticsDashboard: React.FC<UsageAnalyticsDashboardProps> = ({
  className = '',
  initialTimeRange = { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
  enableRealTime = true,
  enableExport = true,
  customFilters = [],
  onInsightGenerated
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    loading: true,
    error: null,
    lastUpdated: new Date(),
    autoRefresh: enableRealTime,
    refreshInterval: 30000 // 30 seconds
  });

  const [timeRange, setTimeRange] = useState<TimePeriod>(initialTimeRange);
  const [filters, setFilters] = useState<AnalyticsFilter[]>(customFilters);
  const [selectedView, setSelectedView] = useState<string>('overview');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [insights, setInsights] = useState<AdvancedUsageInsight[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for performance optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsCache = useRef<Map<string, any>>(new Map());

  // ============================================================================
  // HOOKS & DATA FETCHING
  // ============================================================================

  const {
    usageAnalytics,
    loading: analyticsLoading,
    error: analyticsError,
    refreshAnalytics,
    exportAnalytics
  } = useCatalogAnalytics({
    timeRange,
    filters,
    enableRealTime: enableRealTime && dashboardState.autoRefresh
  });

  const {
    usageMetrics,
    userEngagement,
    assetPopularity,
    trendData,
    behaviorAnalysis,
    loading: metricsLoading,
    error: metricsError
  } = useUsageAnalytics({
    timeRange,
    filters,
    granularity: 'hourly'
  });

  const {
    realTimeMetrics,
    connectionStatus,
    latency
  } = useRealTimeMetrics({
    enabled: enableRealTime && dashboardState.autoRefresh,
    metrics: ['usage', 'users', 'assets'],
    updateInterval: 5000
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const metricsOverview = useMemo<UsageMetricsOverview>(() => {
    if (!usageMetrics || !userEngagement || !assetPopularity) {
      return {
        totalAssets: 0,
        activeUsers: 0,
        totalViews: 0,
        avgUsageScore: 0,
        trendingAssets: 0,
        topCategories: [],
        usageGrowth: 0,
        userGrowth: 0
      };
    }

    return {
      totalAssets: usageMetrics.totalAssets || 0,
      activeUsers: userEngagement.activeUsers || 0,
      totalViews: usageMetrics.totalViews || 0,
      avgUsageScore: usageMetrics.averageScore || 0,
      trendingAssets: assetPopularity.trendingCount || 0,
      topCategories: assetPopularity.topCategories || [],
      usageGrowth: usageMetrics.growthRate || 0,
      userGrowth: userEngagement.growthRate || 0
    };
  }, [usageMetrics, userEngagement, assetPopularity]);

  const trendChartData = useMemo(() => {
    if (!trendData || !Array.isArray(trendData)) return [];
    
    return trendData.map(item => ({
      date: new Date(item.timestamp).toLocaleDateString(),
      usage: item.totalUsage || 0,
      users: item.activeUsers || 0,
      assets: item.assetsViewed || 0,
      engagement: item.engagementScore || 0
    }));
  }, [trendData]);

  const popularityChartData = useMemo(() => {
    if (!assetPopularity?.topAssets) return [];
    
    return assetPopularity.topAssets.slice(0, 10).map(asset => ({
      name: asset.name || 'Unknown',
      views: asset.views || 0,
      score: asset.popularityScore || 0,
      category: asset.category || 'Other'
    }));
  }, [assetPopularity]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setDashboardState(prev => ({
      ...prev,
      loading: analyticsLoading || metricsLoading,
      error: analyticsError || metricsError,
      lastUpdated: new Date()
    }));
  }, [analyticsLoading, metricsLoading, analyticsError, metricsError]);

  useEffect(() => {
    if (dashboardState.autoRefresh && enableRealTime) {
      refreshIntervalRef.current = setInterval(() => {
        refreshAnalytics();
      }, dashboardState.refreshInterval);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [dashboardState.autoRefresh, dashboardState.refreshInterval, enableRealTime, refreshAnalytics]);

  // Generate insights when data changes
  useEffect(() => {
    if (usageMetrics && userEngagement && assetPopularity) {
      generateAdvancedInsights();
    }
  }, [usageMetrics, userEngagement, assetPopularity]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTimeRangeChange = useCallback((newTimeRange: TimePeriod) => {
    setTimeRange(newTimeRange);
    metricsCache.current.clear();
  }, []);

  const handleFilterChange = useCallback((newFilters: AnalyticsFilter[]) => {
    setFilters(newFilters);
    metricsCache.current.clear();
  }, []);

  const handleRefresh = useCallback(async () => {
    setDashboardState(prev => ({ ...prev, loading: true }));
    try {
      await refreshAnalytics();
      setDashboardState(prev => ({ 
        ...prev, 
        loading: false, 
        lastUpdated: new Date(),
        error: null 
      }));
    } catch (error) {
      setDashboardState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Refresh failed' 
      }));
    }
  }, [refreshAnalytics]);

  const handleExport = useCallback(async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      await exportAnalytics({
        format,
        timeRange,
        filters,
        includeCharts: true,
        includeInsights: true
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportAnalytics, timeRange, filters]);

  const toggleAutoRefresh = useCallback(() => {
    setDashboardState(prev => ({
      ...prev,
      autoRefresh: !prev.autoRefresh
    }));
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const generateAdvancedInsights = useCallback(() => {
    const newInsights: AdvancedUsageInsight[] = [];

    // Usage trend analysis
    if (metricsOverview.usageGrowth > 20) {
      newInsights.push({
        id: `growth-${Date.now()}`,
        type: 'trend',
        title: 'High Usage Growth Detected',
        description: `Usage has increased by ${metricsOverview.usageGrowth.toFixed(1)}% in the selected period`,
        severity: 'medium',
        confidence: 0.85,
        actionable: true,
        recommendations: [
          'Consider scaling infrastructure to handle increased load',
          'Analyze most popular assets for optimization opportunities'
        ],
        impact: 75,
        category: 'Performance',
        timestamp: new Date()
      });
    }

    // Low engagement warning
    if (userEngagement?.averageSessionTime && userEngagement.averageSessionTime < 300) {
      newInsights.push({
        id: `engagement-${Date.now()}`,
        type: 'opportunity',
        title: 'Low User Engagement Detected',
        description: 'Average session time is below optimal threshold',
        severity: 'medium',
        confidence: 0.78,
        actionable: true,
        recommendations: [
          'Improve asset discovery mechanisms',
          'Enhance user onboarding process',
          'Add interactive tutorials'
        ],
        impact: 60,
        category: 'User Experience',
        timestamp: new Date()
      });
    }

    // Asset utilization insights
    if (assetPopularity?.lowUtilizationAssets && assetPopularity.lowUtilizationAssets.length > 0) {
      newInsights.push({
        id: `utilization-${Date.now()}`,
        type: 'opportunity',
        title: 'Underutilized Assets Identified',
        description: `${assetPopularity.lowUtilizationAssets.length} assets have low utilization rates`,
        severity: 'low',
        confidence: 0.92,
        actionable: true,
        recommendations: [
          'Review asset metadata and tags',
          'Improve asset discoverability',
          'Consider asset retirement for unused items'
        ],
        impact: 45,
        category: 'Asset Management',
        timestamp: new Date()
      });
    }

    setInsights(newInsights);
    
    // Notify parent component if callback provided
    if (onInsightGenerated) {
      newInsights.forEach(insight => onInsightGenerated(insight));
    }
  }, [metricsOverview, userEngagement, assetPopularity, onInsightGenerated]);

  const formatMetricValue = useCallback((value: number, type: 'number' | 'percentage' | 'currency' = 'number') => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  }, []);

  const getInsightIcon = useCallback((type: AdvancedUsageInsight['type']) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'opportunity': return Target;
      case 'recommendation': return CheckCircle;
      default: return Activity;
    }
  }, []);

  const getInsightColor = useCallback((severity: AdvancedUsageInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderMetricsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Total Assets</CardTitle>
          <Database className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {formatMetricValue(metricsOverview.totalAssets)}
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {metricsOverview.usageGrowth > 0 ? '+' : ''}{formatMetricValue(metricsOverview.usageGrowth, 'percentage')} from last period
          </p>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Active Users</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {formatMetricValue(metricsOverview.activeUsers)}
          </div>
          <p className="text-xs text-green-600 mt-1">
            {metricsOverview.userGrowth > 0 ? '+' : ''}{formatMetricValue(metricsOverview.userGrowth, 'percentage')} from last period
          </p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            {formatMetricValue(metricsOverview.totalViews)}
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Across {formatMetricValue(metricsOverview.topCategories.length)} categories
          </p>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">Avg Usage Score</CardTitle>
          <BarChart3 className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">
            {formatMetricValue(metricsOverview.avgUsageScore, 'percentage')}
          </div>
          <div className="mt-2">
            <Progress 
              value={metricsOverview.avgUsageScore} 
              className="w-full h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsageTrendsChart = () => (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Usage Trends</CardTitle>
            <CardDescription>
              Asset usage patterns and user engagement over time
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {enableRealTime && dashboardState.autoRefresh ? 'Live' : 'Static'}
            </Badge>
            {connectionStatus === 'connected' && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">{latency}ms</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                stroke="#666"
                fontSize={12}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="usage"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Total Usage"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="engagement"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Engagement Score"
              />
              <Bar
                yAxisId="left"
                dataKey="users"
                fill="#f59e0b"
                fillOpacity={0.7}
                name="Active Users"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderPopularAssetsChart = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Popular Assets</CardTitle>
        <CardDescription>
          Most viewed and highest scoring assets in your catalog
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={popularityChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number"
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                dataKey="name"
                type="category"
                stroke="#666"
                fontSize={10}
                width={120}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar
                dataKey="views"
                fill="#8b5cf6"
                radius={[0, 4, 4, 0]}
                name="Views"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderInsightsPanel = () => (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">AI-Powered Insights</CardTitle>
            <CardDescription>
              Automated analysis and recommendations for usage optimization
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {insights.length} insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No insights available yet</p>
                <p className="text-sm">Insights will appear as data is analyzed</p>
              </div>
            ) : (
              insights.map((insight) => {
                const IconComponent = getInsightIcon(insight.type);
                return (
                  <Alert key={insight.id} className={`border ${getInsightColor(insight.severity)}`}>
                    <IconComponent className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between">
                      {insight.title}
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence * 100}% confidence
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="mb-2">{insight.description}</p>
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div>
                          <p className="font-medium text-sm mb-1">Recommendations:</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderControlPanel = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Dashboard Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="timeRange" className="text-sm font-medium">Time Range</Label>
            <Select 
              value={`${Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (24 * 60 * 60 * 1000))}d`}
              onValueChange={(value) => {
                const days = parseInt(value);
                const end = new Date();
                const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
                handleTimeRangeChange({ start, end });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="365d">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assetType" className="text-sm font-medium">Asset Type</Label>
            <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dataset">Datasets</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="dashboard">Dashboards</SelectItem>
                <SelectItem value="api">APIs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="department" className="text-sm font-medium">Department</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Search Assets</Label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="autoRefresh"
              checked={dashboardState.autoRefresh}
              onCheckedChange={toggleAutoRefresh}
            />
            <Label htmlFor="autoRefresh" className="text-sm">
              Auto Refresh
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="advancedMetrics"
              checked={showAdvancedMetrics}
              onCheckedChange={setShowAdvancedMetrics}
            />
            <Label htmlFor="advancedMetrics" className="text-sm">
              Advanced Metrics
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderActionButtons = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900">Usage Analytics Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Last updated: {dashboardState.lastUpdated.toLocaleTimeString()}
        </Badge>
      </div>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={dashboardState.loading}
              >
                <RefreshCw className={`h-4 w-4 ${dashboardState.loading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh Dashboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {enableExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  if (dashboardState.error) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Dashboard Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {dashboardState.error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`p-6 space-y-6 bg-gray-50 min-h-screen ${className}`}>
      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Control Panel */}
      {renderControlPanel()}

      {/* Loading Overlay */}
      {dashboardState.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading analytics...</span>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderMetricsOverview()}
          {renderUsageTrendsChart()}
          {renderPopularAssetsChart()}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {renderUsageTrendsChart()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderPopularAssetsChart()}
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="#10b981" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {renderInsightsPanel()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Insight Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Performance', 'User Experience', 'Asset Management', 'Optimization'].map(category => {
                    const categoryInsights = insights.filter(i => i.category === category);
                    return (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{category}</span>
                        <Badge variant="secondary">{categoryInsights.length}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insight Impact Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'High Impact', value: insights.filter(i => i.impact > 70).length, fill: '#ef4444' },
                          { name: 'Medium Impact', value: insights.filter(i => i.impact > 40 && i.impact <= 70).length, fill: '#f59e0b' },
                          { name: 'Low Impact', value: insights.filter(i => i.impact <= 40).length, fill: '#10b981' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {[
                          { name: 'High Impact', value: insights.filter(i => i.impact > 70).length, fill: '#ef4444' },
                          { name: 'Medium Impact', value: insights.filter(i => i.impact > 40 && i.impact <= 70).length, fill: '#f59e0b' },
                          { name: 'Low Impact', value: insights.filter(i => i.impact <= 40).length, fill: '#10b981' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {showAdvancedMetrics && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Advanced Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cache Hit Rate</span>
                        <Badge variant="outline">{formatMetricValue(85.6, 'percentage')}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Query Performance</span>
                        <Badge variant="outline">245ms avg</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Data Freshness</span>
                        <Badge variant="outline" className="text-green-600">Fresh</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">API Response Time</span>
                        <Badge variant="outline">156ms avg</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Health</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm font-medium text-green-600">Healthy</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Database</span>
                          <span className="text-green-600">95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>API Services</span>
                          <span className="text-green-600">98%</span>
                        </div>
                        <Progress value={98} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Cache Layer</span>
                          <span className="text-yellow-600">87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resource Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU Usage</span>
                          <span>34%</span>
                        </div>
                        <Progress value={34} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Memory Usage</span>
                          <span>67%</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Storage</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Network I/O</span>
                          <span>23%</span>
                        </div>
                        <Progress value={23} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      {[
                        { time: '2 min ago', user: 'John Doe', action: 'viewed', asset: 'Sales Dashboard Q4', type: 'view' },
                        { time: '5 min ago', user: 'Jane Smith', action: 'downloaded', asset: 'Customer Dataset', type: 'download' },
                        { time: '8 min ago', user: 'Mike Johnson', action: 'shared', asset: 'Marketing Report', type: 'share' },
                        { time: '12 min ago', user: 'Sarah Wilson', action: 'commented on', asset: 'Product Analytics', type: 'comment' },
                        { time: '15 min ago', user: 'Tom Brown', action: 'bookmarked', asset: 'Financial Model', type: 'bookmark' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {activity.type === 'view' && <Eye className="h-4 w-4 text-blue-500" />}
                            {activity.type === 'download' && <Download className="h-4 w-4 text-green-500" />}
                            {activity.type === 'share' && <Globe className="h-4 w-4 text-purple-500" />}
                            {activity.type === 'comment' && <BookOpen className="h-4 w-4 text-orange-500" />}
                            {activity.type === 'bookmark' && <Target className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium">{activity.user}</span>
                              {' '}{activity.action}{' '}
                              <span className="font-medium">{activity.asset}</span>
                            </p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsageAnalyticsDashboard;