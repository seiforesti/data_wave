// ============================================================================
// CATALOG METRICS CENTER - ADVANCED CATALOG ANALYTICS
// ============================================================================
// Enterprise-grade metrics center providing comprehensive catalog analytics,
// KPIs, performance monitoring, and advanced insights dashboard
// ============================================================================

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Database,
  FileText,
  Search,
  Eye,
  Download,
  Upload,
  Target,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Filter,
  Settings,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Globe,
  Bookmark,
  Star,
  Heart,
  Share2,
  ExternalLink,
  PieChart,
  LineChart,
  AreaChart,
  DollarSign,
  Percent,
  Hash,
  Timer,
  Gauge,
  Award,
  Trophy
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
  Input,
} from '@/components/ui/input';
import {
  Label,
} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Progress,
} from '@/components/ui/progress';
import {
  ScrollArea,
} from '@/components/ui/scroll-area';
import {
  Separator,
} from '@/components/ui/separator';
import {
  Switch,
} from '@/components/ui/switch';
import {
  Slider,
} from '@/components/ui/slider';

// Chart Components
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart as RechartsAreaChart,
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
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts';

// Services and Types
import { 
  useCatalogAnalytics,
  useCatalogMetrics
} from '../../hooks/useCatalogAnalytics';
import { 
  CatalogMetrics,
  UsageMetrics,
  QualityMetrics,
  PerformanceMetrics,
  UserEngagementMetrics,
  BusinessValueMetrics,
  TrendAnalysis,
  AlertThreshold
} from '../../types/analytics.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CatalogMetricsCenterProps {
  className?: string;
  enableRealTime?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onMetricAlert?: (alert: AlertThreshold) => void;
}

interface MetricsState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  selectedTimeRange: string;
  selectedMetricGroup: string;
  alertsEnabled: boolean;
  compareMode: boolean;
  comparisonPeriod: string;
}

interface KPICardData {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  icon: React.ReactNode;
  color: string;
  description?: string;
  target?: number;
  critical?: boolean;
}

interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'area' | 'bar' | 'pie' | 'radial' | 'composed' | 'scatter';
  data: any[];
  config: any;
  height?: number;
  description?: string;
}

// ============================================================================
// CATALOG METRICS CENTER COMPONENT
// ============================================================================

export const CatalogMetricsCenter: React.FC<CatalogMetricsCenterProps> = ({
  className = '',
  enableRealTime = true,
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
  onMetricAlert
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [metricsState, setMetricsState] = useState<MetricsState>({
    loading: true,
    error: null,
    lastUpdated: null,
    selectedTimeRange: '7d',
    selectedMetricGroup: 'overview',
    alertsEnabled: true,
    compareMode: false,
    comparisonPeriod: '7d'
  });

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);

  // Refs for performance optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // HOOKS & DATA FETCHING
  // ============================================================================

  const {
    metrics,
    usage,
    quality,
    performance,
    engagement,
    businessValue,
    trends,
    loading: metricsLoading,
    error: metricsError,
    refreshMetrics
  } = useCatalogMetrics({
    timeRange: metricsState.selectedTimeRange,
    enableRealTime,
    includeComparison: metricsState.compareMode,
    comparisonPeriod: metricsState.comparisonPeriod
  });

  const {
    alerts,
    thresholds,
    loading: alertsLoading,
    checkThresholds,
    updateThreshold
  } = useCatalogAnalytics({
    enableAlerts: metricsState.alertsEnabled,
    autoCheck: true
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const kpiCards = useMemo((): KPICardData[] => {
    if (!metrics) return [];

    return [
      {
        id: 'total-assets',
        title: 'Total Assets',
        value: metrics.totalAssets || 0,
        previousValue: metrics.previousTotalAssets,
        change: metrics.assetsGrowth,
        trend: (metrics.assetsGrowth || 0) > 0 ? 'up' : (metrics.assetsGrowth || 0) < 0 ? 'down' : 'neutral',
        format: 'number',
        icon: <Database className="h-4 w-4" />,
        color: 'blue',
        description: 'Total number of data assets in catalog'
      },
      {
        id: 'active-users',
        title: 'Active Users',
        value: engagement?.activeUsers || 0,
        previousValue: engagement?.previousActiveUsers,
        change: engagement?.userGrowth,
        trend: (engagement?.userGrowth || 0) > 0 ? 'up' : (engagement?.userGrowth || 0) < 0 ? 'down' : 'neutral',
        format: 'number',
        icon: <Users className="h-4 w-4" />,
        color: 'green',
        description: 'Monthly active users'
      },
      {
        id: 'catalog-usage',
        title: 'Catalog Usage',
        value: usage?.totalViews || 0,
        previousValue: usage?.previousTotalViews,
        change: usage?.usageGrowth,
        trend: (usage?.usageGrowth || 0) > 0 ? 'up' : (usage?.usageGrowth || 0) < 0 ? 'down' : 'neutral',
        format: 'number',
        icon: <Eye className="h-4 w-4" />,
        color: 'purple',
        description: 'Total catalog views and interactions'
      },
      {
        id: 'data-quality',
        title: 'Data Quality',
        value: quality?.overallScore || 0,
        previousValue: quality?.previousOverallScore,
        change: quality?.qualityImprovement,
        trend: (quality?.qualityImprovement || 0) > 0 ? 'up' : (quality?.qualityImprovement || 0) < 0 ? 'down' : 'neutral',
        format: 'percentage',
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'emerald',
        description: 'Overall data quality score',
        target: 95,
        critical: (quality?.overallScore || 0) < 80
      },
      {
        id: 'search-success',
        title: 'Search Success',
        value: usage?.searchSuccessRate || 0,
        previousValue: usage?.previousSearchSuccessRate,
        change: usage?.searchSuccessImprovement,
        trend: (usage?.searchSuccessImprovement || 0) > 0 ? 'up' : (usage?.searchSuccessImprovement || 0) < 0 ? 'down' : 'neutral',
        format: 'percentage',
        icon: <Search className="h-4 w-4" />,
        color: 'blue',
        description: 'Percentage of successful searches',
        target: 90,
        critical: (usage?.searchSuccessRate || 0) < 70
      },
      {
        id: 'response-time',
        title: 'Avg Response Time',
        value: performance?.averageResponseTime || 0,
        previousValue: performance?.previousAverageResponseTime,
        change: performance?.responseTimeImprovement,
        trend: (performance?.responseTimeImprovement || 0) < 0 ? 'up' : (performance?.responseTimeImprovement || 0) > 0 ? 'down' : 'neutral',
        format: 'duration',
        icon: <Zap className="h-4 w-4" />,
        color: 'yellow',
        description: 'Average API response time',
        target: 500,
        critical: (performance?.averageResponseTime || 0) > 1000
      },
      {
        id: 'business-value',
        title: 'Business Value',
        value: businessValue?.totalValue || 0,
        previousValue: businessValue?.previousTotalValue,
        change: businessValue?.valueGrowth,
        trend: (businessValue?.valueGrowth || 0) > 0 ? 'up' : (businessValue?.valueGrowth || 0) < 0 ? 'down' : 'neutral',
        format: 'currency',
        icon: <DollarSign className="h-4 w-4" />,
        color: 'green',
        description: 'Estimated business value generated'
      },
      {
        id: 'compliance-score',
        title: 'Compliance Score',
        value: quality?.complianceScore || 0,
        previousValue: quality?.previousComplianceScore,
        change: quality?.complianceImprovement,
        trend: (quality?.complianceImprovement || 0) > 0 ? 'up' : (quality?.complianceImprovement || 0) < 0 ? 'down' : 'neutral',
        format: 'percentage',
        icon: <Shield className="h-4 w-4" />,
        color: 'indigo',
        description: 'Data governance compliance score',
        target: 98,
        critical: (quality?.complianceScore || 0) < 85
      }
    ];
  }, [metrics, usage, quality, performance, engagement, businessValue]);

  const chartConfigs = useMemo((): ChartConfig[] => {
    if (!trends || !usage || !quality) return [];

    return [
      {
        id: 'usage-trends',
        title: 'Usage Trends',
        type: 'area',
        data: trends.usageTrends || [],
        config: {
          xDataKey: 'date',
          areas: [
            { dataKey: 'views', stroke: '#3b82f6', fill: '#3b82f6', fillOpacity: 0.6 },
            { dataKey: 'downloads', stroke: '#10b981', fill: '#10b981', fillOpacity: 0.6 }
          ]
        },
        height: 300,
        description: 'Daily usage trends for catalog assets'
      },
      {
        id: 'quality-metrics',
        title: 'Quality Metrics',
        type: 'composed',
        data: trends.qualityTrends || [],
        config: {
          xDataKey: 'date',
          bars: [{ dataKey: 'qualityScore', fill: '#06b6d4' }],
          lines: [{ dataKey: 'complianceScore', stroke: '#8b5cf6' }]
        },
        height: 300,
        description: 'Data quality and compliance trends'
      },
      {
        id: 'user-engagement',
        title: 'User Engagement',
        type: 'line',
        data: trends.engagementTrends || [],
        config: {
          xDataKey: 'date',
          lines: [
            { dataKey: 'activeUsers', stroke: '#3b82f6' },
            { dataKey: 'newUsers', stroke: '#10b981' },
            { dataKey: 'returningUsers', stroke: '#f59e0b' }
          ]
        },
        height: 300,
        description: 'User engagement and adoption metrics'
      },
      {
        id: 'asset-distribution',
        title: 'Asset Distribution',
        type: 'pie',
        data: metrics?.assetDistribution || [],
        config: {
          dataKey: 'value',
          nameKey: 'name',
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
        },
        height: 300,
        description: 'Distribution of assets by type'
      },
      {
        id: 'performance-metrics',
        title: 'Performance Metrics',
        type: 'bar',
        data: trends.performanceTrends || [],
        config: {
          xDataKey: 'date',
          bars: [
            { dataKey: 'responseTime', fill: '#3b82f6' },
            { dataKey: 'throughput', fill: '#10b981' }
          ]
        },
        height: 300,
        description: 'System performance and response times'
      },
      {
        id: 'business-impact',
        title: 'Business Impact',
        type: 'area',
        data: trends.businessValueTrends || [],
        config: {
          xDataKey: 'date',
          areas: [
            { dataKey: 'costSavings', stroke: '#10b981', fill: '#10b981', fillOpacity: 0.6 },
            { dataKey: 'revenueGenerated', stroke: '#3b82f6', fill: '#3b82f6', fillOpacity: 0.6 }
          ]
        },
        height: 300,
        description: 'Business value and impact metrics'
      }
    ];
  }, [trends, usage, quality, metrics]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setMetricsState(prev => ({
      ...prev,
      loading: metricsLoading || alertsLoading,
      error: metricsError,
      lastUpdated: new Date()
    }));
  }, [metricsLoading, alertsLoading, metricsError]);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshMetrics();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshMetrics]);

  // Check alert thresholds
  useEffect(() => {
    if (metricsState.alertsEnabled && kpiCards.length > 0) {
      kpiCards.forEach(kpi => {
        if (kpi.critical && onMetricAlert) {
          onMetricAlert({
            id: kpi.id,
            metric: kpi.title,
            value: kpi.value,
            threshold: kpi.target || 0,
            severity: 'critical',
            message: `${kpi.title} is below threshold`
          });
        }
      });
    }
  }, [kpiCards, metricsState.alertsEnabled, onMetricAlert]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTimeRangeChange = useCallback((timeRange: string) => {
    setMetricsState(prev => ({
      ...prev,
      selectedTimeRange: timeRange
    }));
  }, []);

  const handleMetricGroupChange = useCallback((group: string) => {
    setMetricsState(prev => ({
      ...prev,
      selectedMetricGroup: group
    }));
  }, []);

  const handleComparisonToggle = useCallback((enabled: boolean) => {
    setMetricsState(prev => ({
      ...prev,
      compareMode: enabled
    }));
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshMetrics();
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    }
  }, [refreshMetrics]);

  const handleExportMetrics = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    const exportData = {
      kpis: kpiCards,
      charts: chartConfigs,
      metadata: {
        timeRange: metricsState.selectedTimeRange,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalog-metrics-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [kpiCards, chartConfigs, metricsState.selectedTimeRange]);

  const toggleCardExpansion = useCallback((cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          notation: value > 1000000 ? 'compact' : 'standard'
        }).format(value);
      case 'duration':
        return `${value}ms`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US', {
          notation: value > 1000 ? 'compact' : 'standard'
        }).format(value);
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral', change?: number) => {
    if (!trend || trend === 'neutral') return null;
    
    if (trend === 'up') {
      return <ArrowUpRight className="h-3 w-3 text-green-600" />;
    } else {
      return <ArrowDownRight className="h-3 w-3 text-red-600" />;
    }
  };

  const renderKPICard = (kpi: KPICardData) => (
    <Card 
      key={kpi.id} 
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
        kpi.critical ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">
          {kpi.title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-${kpi.color}-100`}>
          <div className={`text-${kpi.color}-600`}>
            {kpi.icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className={`text-2xl font-bold ${kpi.critical ? 'text-red-700' : 'text-gray-900'}`}>
            {formatValue(kpi.value, kpi.format)}
          </div>
          {kpi.change !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon(kpi.trend, kpi.change)}
              <span className={`text-xs font-medium ${
                kpi.trend === 'up' ? 'text-green-600' : 
                kpi.trend === 'down' ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {Math.abs(kpi.change).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        
        {kpi.target && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Target: {formatValue(kpi.target, kpi.format)}</span>
              <span>{((typeof kpi.value === 'number' ? kpi.value : 0) / kpi.target * 100).toFixed(0)}%</span>
            </div>
            <Progress 
              value={(typeof kpi.value === 'number' ? kpi.value : 0) / kpi.target * 100} 
              className="w-full h-1"
            />
          </div>
        )}
        
        {kpi.description && (
          <p className="text-xs text-gray-500 mt-2">
            {kpi.description}
          </p>
        )}

        {kpi.critical && (
          <div className="mt-2 flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span className="text-xs text-red-600 font-medium">Critical Alert</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderChart = (config: ChartConfig) => {
    const ChartComponent = ({ config }: { config: ChartConfig }) => {
      switch (config.type) {
        case 'line':
          return (
            <ResponsiveContainer width="100%" height={config.height || 300}>
              <LineChart data={config.data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey={config.config.xDataKey} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {config.config.lines?.map((line: any, index: number) => (
                  <Line 
                    key={index}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.stroke}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          );

        case 'area':
          return (
            <ResponsiveContainer width="100%" height={config.height || 300}>
              <RechartsAreaChart data={config.data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey={config.config.xDataKey} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {config.config.areas?.map((area: any, index: number) => (
                  <Area 
                    key={index}
                    type="monotone"
                    dataKey={area.dataKey}
                    stroke={area.stroke}
                    fill={area.fill}
                    fillOpacity={area.fillOpacity}
                  />
                ))}
              </RechartsAreaChart>
            </ResponsiveContainer>
          );

        case 'bar':
          return (
            <ResponsiveContainer width="100%" height={config.height || 300}>
              <BarChart data={config.data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey={config.config.xDataKey} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {config.config.bars?.map((bar: any, index: number) => (
                  <Bar 
                    key={index}
                    dataKey={bar.dataKey}
                    fill={bar.fill}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          );

        case 'pie':
          return (
            <ResponsiveContainer width="100%" height={config.height || 300}>
              <RechartsPieChart>
                <Pie
                  data={config.data}
                  dataKey={config.config.dataKey}
                  nameKey={config.config.nameKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {config.data.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={config.config.colors[index % config.config.colors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          );

        case 'composed':
          return (
            <ResponsiveContainer width="100%" height={config.height || 300}>
              <ComposedChart data={config.data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey={config.config.xDataKey} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {config.config.bars?.map((bar: any, index: number) => (
                  <Bar 
                    key={`bar-${index}`}
                    dataKey={bar.dataKey}
                    fill={bar.fill}
                  />
                ))}
                {config.config.lines?.map((line: any, index: number) => (
                  <Line 
                    key={`line-${index}`}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.stroke}
                    strokeWidth={2}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          );

        default:
          return <div className="flex items-center justify-center h-64 text-gray-500">Chart type not supported</div>;
      }
    };

    return (
      <Card key={config.id}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
              {config.description && (
                <CardDescription className="text-sm text-gray-500 mt-1">
                  {config.description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCardExpansion(config.id)}
                    >
                      {expandedCards.has(config.id) ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{expandedCards.has(config.id) ? 'Minimize' : 'Maximize'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Chart
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Screen
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartComponent config={config} />
        </CardContent>
      </Card>
    );
  };

  const renderActionBar = () => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900">Catalog Metrics Center</h1>
        <Badge variant="outline" className="text-sm">
          {metricsState.selectedTimeRange} timeframe
        </Badge>
        {metricsState.lastUpdated && (
          <Badge variant="outline" className="text-sm">
            Updated: {metricsState.lastUpdated.toLocaleTimeString()}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="timeRange" className="text-sm font-medium">Time Range:</Label>
          <Select value={metricsState.selectedTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last Day</SelectItem>
              <SelectItem value="7d">Last Week</SelectItem>
              <SelectItem value="30d">Last Month</SelectItem>
              <SelectItem value="90d">Last Quarter</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="comparison" className="text-sm font-medium">Compare:</Label>
          <Switch
            id="comparison"
            checked={metricsState.compareMode}
            onCheckedChange={handleComparisonToggle}
          />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={metricsState.loading}
              >
                <RefreshCw className={`h-4 w-4 ${metricsState.loading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh Metrics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExportMetrics('csv')}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportMetrics('json')}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportMetrics('pdf')}>
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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

  if (metricsState.error) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Metrics Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {metricsState.error}
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
      {/* Action Bar */}
      {renderActionBar()}

      {/* Loading Overlay */}
      {metricsState.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading metrics...</span>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Active Alerts</AlertTitle>
          <AlertDescription className="text-orange-700">
            {alerts.length} metric(s) require attention
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map(renderKPICard)}
      </div>

      {/* Main Content */}
      <Tabs value={metricsState.selectedMetricGroup} onValueChange={handleMetricGroupChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartConfigs.slice(0, 4).map(renderChart)}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartConfigs.filter(c => c.id.includes('usage')).map(renderChart)}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartConfigs.filter(c => c.id.includes('quality')).map(renderChart)}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartConfigs.filter(c => c.id.includes('performance')).map(renderChart)}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartConfigs.filter(c => c.id.includes('engagement')).map(renderChart)}
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartConfigs.filter(c => c.id.includes('business')).map(renderChart)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CatalogMetricsCenter;