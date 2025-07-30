// ============================================================================
// TREND ANALYSIS DASHBOARD - ADVANCED CATALOG ANALYTICS
// ============================================================================
// Enterprise-grade trend analysis dashboard providing predictive analytics,
// anomaly detection, forecasting, and advanced statistical analysis
// ============================================================================

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Calendar,
  Filter,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  StopCircle,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  ExternalLink,
  Search,
  Bell,
  Database,
  Users,
  Globe,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RotateCw,
  Gauge,
  Cpu,
  HardDrive,
  Network,
  Signal,
  Wifi
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Chart Components
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
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
  Brush,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

// Services and Types
import { 
  useTrendAnalysis,
  usePredictiveAnalytics,
  useAnomalyDetection
} from '../../hooks/useTrendAnalysis';
import { 
  TrendData,
  Prediction,
  Anomaly,
  Forecast,
  StatisticalAnalysis,
  TrendIndicator,
  AnalyticsAlert
} from '../../types/analytics.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TrendAnalysisDashboardProps {
  className?: string;
  enableRealTime?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onAnomalyDetected?: (anomaly: Anomaly) => void;
}

interface TrendState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  selectedMetric: string;
  selectedTimeframe: string;
  selectedGranularity: string;
  forecastEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  confidenceLevel: number;
  viewMode: 'trends' | 'forecasts' | 'anomalies' | 'insights';
}

interface TrendIndicatorData {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  significance: 'high' | 'medium' | 'low';
  confidence: number;
  forecast?: number;
  anomalyScore?: number;
}

interface ChartConfiguration {
  id: string;
  title: string;
  type: 'line' | 'area' | 'bar' | 'scatter' | 'composed';
  data: any[];
  config: any;
  height?: number;
  showBrush?: boolean;
  showPredictions?: boolean;
  showAnomalies?: boolean;
  showConfidenceBands?: boolean;
}

// ============================================================================
// TREND ANALYSIS DASHBOARD COMPONENT
// ============================================================================

export const TrendAnalysisDashboard: React.FC<TrendAnalysisDashboardProps> = ({
  className = '',
  enableRealTime = true,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
  onAnomalyDetected
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [trendState, setTrendState] = useState<TrendState>({
    loading: true,
    error: null,
    lastUpdated: null,
    selectedMetric: 'usage',
    selectedTimeframe: '30d',
    selectedGranularity: 'daily',
    forecastEnabled: true,
    anomalyDetectionEnabled: true,
    confidenceLevel: 95,
    viewMode: 'trends'
  });

  const [playbackState, setPlaybackState] = useState({
    isPlaying: false,
    speed: 1,
    currentPosition: 0
  });

  const [selectedAnomalies, setSelectedAnomalies] = useState<string[]>([]);
  const [expandedCharts, setExpandedCharts] = useState<Set<string>>(new Set());

  // Refs for performance optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // HOOKS & DATA FETCHING
  // ============================================================================

  const {
    trends,
    indicators,
    statistics,
    loading: trendsLoading,
    error: trendsError,
    refreshTrends
  } = useTrendAnalysis({
    metric: trendState.selectedMetric,
    timeframe: trendState.selectedTimeframe,
    granularity: trendState.selectedGranularity,
    enableRealTime,
    includeStatistics: true
  });

  const {
    predictions,
    forecasts,
    confidenceBands,
    loading: predictionsLoading,
    error: predictionsError,
    generateForecast
  } = usePredictiveAnalytics({
    enabled: trendState.forecastEnabled,
    confidenceLevel: trendState.confidenceLevel,
    forecastPeriods: 30
  });

  const {
    anomalies,
    alerts,
    loading: anomaliesLoading,
    error: anomaliesError,
    checkAnomalies
  } = useAnomalyDetection({
    enabled: trendState.anomalyDetectionEnabled,
    sensitivity: 'medium',
    alertThreshold: 0.8
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const trendIndicators = useMemo((): TrendIndicatorData[] => {
    if (!indicators) return [];

    return indicators.map(indicator => ({
      id: indicator.id,
      name: indicator.name,
      value: indicator.currentValue,
      change: indicator.change,
      changePercent: indicator.changePercent,
      trend: indicator.direction,
      significance: indicator.significance,
      confidence: indicator.confidence,
      forecast: indicator.predictedValue,
      anomalyScore: indicator.anomalyScore
    }));
  }, [indicators]);

  const chartConfigurations = useMemo((): ChartConfiguration[] => {
    if (!trends) return [];

    return [
      {
        id: 'primary-trends',
        title: 'Primary Trends Analysis',
        type: 'line',
        data: trends.primary || [],
        config: {
          xDataKey: 'timestamp',
          lines: [
            { dataKey: 'value', stroke: '#3b82f6', strokeWidth: 2 },
            { dataKey: 'trend', stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }
          ]
        },
        height: 400,
        showBrush: true,
        showPredictions: trendState.forecastEnabled,
        showAnomalies: trendState.anomalyDetectionEnabled,
        showConfidenceBands: true
      },
      {
        id: 'comparative-trends',
        title: 'Comparative Trends',
        type: 'area',
        data: trends.comparative || [],
        config: {
          xDataKey: 'timestamp',
          areas: [
            { dataKey: 'current', stroke: '#3b82f6', fill: '#3b82f6', fillOpacity: 0.6 },
            { dataKey: 'baseline', stroke: '#6b7280', fill: '#6b7280', fillOpacity: 0.3 }
          ]
        },
        height: 350,
        showBrush: false,
        showPredictions: false,
        showAnomalies: true,
        showConfidenceBands: false
      },
      {
        id: 'forecasts',
        title: 'Forecasting & Predictions',
        type: 'composed',
        data: [...(trends.historical || []), ...(forecasts || [])],
        config: {
          xDataKey: 'timestamp',
          lines: [
            { dataKey: 'actual', stroke: '#3b82f6', strokeWidth: 2 },
            { dataKey: 'predicted', stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5 5' }
          ],
          areas: [
            { dataKey: 'confidenceUpper', stroke: 'none', fill: '#f59e0b', fillOpacity: 0.2 },
            { dataKey: 'confidenceLower', stroke: 'none', fill: '#f59e0b', fillOpacity: 0.2 }
          ]
        },
        height: 350,
        showBrush: true,
        showPredictions: true,
        showAnomalies: false,
        showConfidenceBands: true
      },
      {
        id: 'anomaly-detection',
        title: 'Anomaly Detection',
        type: 'scatter',
        data: trends.anomalyData || [],
        config: {
          xDataKey: 'timestamp',
          scatters: [
            { dataKey: 'value', fill: '#3b82f6' },
            { dataKey: 'anomaly', fill: '#ef4444' }
          ]
        },
        height: 300,
        showBrush: false,
        showPredictions: false,
        showAnomalies: true,
        showConfidenceBands: false
      },
      {
        id: 'seasonal-patterns',
        title: 'Seasonal Patterns',
        type: 'bar',
        data: trends.seasonal || [],
        config: {
          xDataKey: 'period',
          bars: [
            { dataKey: 'average', fill: '#3b82f6' },
            { dataKey: 'variance', fill: '#10b981' }
          ]
        },
        height: 300,
        showBrush: false,
        showPredictions: false,
        showAnomalies: false,
        showConfidenceBands: false
      },
      {
        id: 'correlation-analysis',
        title: 'Correlation Analysis',
        type: 'scatter',
        data: trends.correlation || [],
        config: {
          xDataKey: 'x',
          yDataKey: 'y',
          scatters: [
            { fill: '#8b5cf6' }
          ]
        },
        height: 300,
        showBrush: false,
        showPredictions: false,
        showAnomalies: false,
        showConfidenceBands: false
      }
    ];
  }, [trends, forecasts, trendState.forecastEnabled, trendState.anomalyDetectionEnabled]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setTrendState(prev => ({
      ...prev,
      loading: trendsLoading || predictionsLoading || anomaliesLoading,
      error: trendsError || predictionsError || anomaliesError,
      lastUpdated: new Date()
    }));
  }, [
    trendsLoading, predictionsLoading, anomaliesLoading,
    trendsError, predictionsError, anomaliesError
  ]);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshTrends();
        if (trendState.forecastEnabled) generateForecast();
        if (trendState.anomalyDetectionEnabled) checkAnomalies();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [
    autoRefresh, refreshInterval, refreshTrends, generateForecast, checkAnomalies,
    trendState.forecastEnabled, trendState.anomalyDetectionEnabled
  ]);

  // Anomaly detection callback
  useEffect(() => {
    if (anomalies && anomalies.length > 0 && onAnomalyDetected) {
      anomalies.forEach(anomaly => {
        if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
          onAnomalyDetected(anomaly);
        }
      });
    }
  }, [anomalies, onAnomalyDetected]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMetricChange = useCallback((metric: string) => {
    setTrendState(prev => ({
      ...prev,
      selectedMetric: metric
    }));
  }, []);

  const handleTimeframeChange = useCallback((timeframe: string) => {
    setTrendState(prev => ({
      ...prev,
      selectedTimeframe: timeframe
    }));
  }, []);

  const handleGranularityChange = useCallback((granularity: string) => {
    setTrendState(prev => ({
      ...prev,
      selectedGranularity: granularity
    }));
  }, []);

  const handleViewModeChange = useCallback((mode: 'trends' | 'forecasts' | 'anomalies' | 'insights') => {
    setTrendState(prev => ({
      ...prev,
      viewMode: mode
    }));
  }, []);

  const handleForecastToggle = useCallback((enabled: boolean) => {
    setTrendState(prev => ({
      ...prev,
      forecastEnabled: enabled
    }));
  }, []);

  const handleAnomalyDetectionToggle = useCallback((enabled: boolean) => {
    setTrendState(prev => ({
      ...prev,
      anomalyDetectionEnabled: enabled
    }));
  }, []);

  const handleConfidenceLevelChange = useCallback((level: number[]) => {
    setTrendState(prev => ({
      ...prev,
      confidenceLevel: level[0]
    }));
  }, []);

  const handlePlayback = useCallback((action: 'play' | 'pause' | 'stop' | 'forward' | 'backward') => {
    switch (action) {
      case 'play':
        setPlaybackState(prev => ({ ...prev, isPlaying: true }));
        // Implement playback logic
        break;
      case 'pause':
        setPlaybackState(prev => ({ ...prev, isPlaying: false }));
        break;
      case 'stop':
        setPlaybackState(prev => ({ ...prev, isPlaying: false, currentPosition: 0 }));
        break;
      case 'forward':
        setPlaybackState(prev => ({ ...prev, speed: Math.min(prev.speed * 2, 8) }));
        break;
      case 'backward':
        setPlaybackState(prev => ({ ...prev, speed: Math.max(prev.speed / 2, 0.25) }));
        break;
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refreshTrends(),
        trendState.forecastEnabled && generateForecast(),
        trendState.anomalyDetectionEnabled && checkAnomalies()
      ].filter(Boolean));
    } catch (error) {
      console.error('Failed to refresh trend analysis:', error);
    }
  }, [refreshTrends, generateForecast, checkAnomalies, trendState.forecastEnabled, trendState.anomalyDetectionEnabled]);

  const handleExport = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    const exportData = {
      trends,
      indicators: trendIndicators,
      predictions,
      anomalies,
      statistics,
      metadata: {
        metric: trendState.selectedMetric,
        timeframe: trendState.selectedTimeframe,
        granularity: trendState.selectedGranularity,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trend-analysis-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [trends, trendIndicators, predictions, anomalies, statistics, trendState]);

  const toggleChartExpansion = useCallback((chartId: string) => {
    setExpandedCharts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chartId)) {
        newSet.delete(chartId);
      } else {
        newSet.add(chartId);
      }
      return newSet;
    });
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderTrendIndicator = (indicator: TrendIndicatorData) => (
    <Card key={indicator.id} className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-700">
            {indicator.name}
          </CardTitle>
          <div className="flex items-center space-x-1">
            {indicator.trend === 'up' ? (
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : indicator.trend === 'down' ? (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            ) : (
              <div className="h-3 w-3 rounded-full bg-gray-400" />
            )}
            <Badge 
              variant={indicator.significance === 'high' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {indicator.significance}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {indicator.value.toLocaleString()}
            </span>
            <span className={`text-sm font-medium ${
              indicator.trend === 'up' ? 'text-green-600' : 
              indicator.trend === 'down' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {indicator.changePercent > 0 ? '+' : ''}{indicator.changePercent.toFixed(1)}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Confidence</span>
              <span>{indicator.confidence.toFixed(0)}%</span>
            </div>
            <Progress value={indicator.confidence} className="w-full h-1" />
          </div>

          {indicator.forecast && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Forecast</span>
                <span className="font-medium text-gray-700">
                  {indicator.forecast.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {indicator.anomalyScore && indicator.anomalyScore > 0.5 && (
            <div className="flex items-center space-x-1 pt-2 border-t">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-orange-600 font-medium">
                Anomaly Score: {(indicator.anomalyScore * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderChart = (config: ChartConfiguration) => {
    const ChartComponent = ({ config }: { config: ChartConfiguration }) => {
      const isExpanded = expandedCharts.has(config.id);
      const chartHeight = isExpanded ? (config.height || 400) * 1.5 : (config.height || 400);

      switch (config.type) {
        case 'line':
          return (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <RechartsLineChart data={config.data}>
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
                    strokeWidth={line.strokeWidth}
                    strokeDasharray={line.strokeDasharray}
                  />
                ))}
                {config.showBrush && <Brush dataKey={config.config.xDataKey} height={30} />}
                {config.showPredictions && predictions && (
                  <ReferenceLine x={predictions.cutoffPoint} stroke="#f59e0b" strokeDasharray="5 5" />
                )}
              </RechartsLineChart>
            </ResponsiveContainer>
          );

        case 'area':
          return (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={config.data}>
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
                {anomalies && config.showAnomalies && anomalies.map((anomaly, index) => (
                  <ReferenceArea 
                    key={index}
                    x1={anomaly.startTime}
                    x2={anomaly.endTime}
                    fill="#ef4444"
                    fillOpacity={0.2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          );

        case 'bar':
          return (
            <ResponsiveContainer width="100%" height={chartHeight}>
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

        case 'scatter':
          return (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <ScatterChart data={config.data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey={config.config.xDataKey} />
                <YAxis dataKey={config.config.yDataKey} />
                <RechartsTooltip />
                <Legend />
                {config.config.scatters?.map((scatter: any, index: number) => (
                  <Scatter 
                    key={index}
                    dataKey={scatter.dataKey || 'value'}
                    fill={scatter.fill}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          );

        case 'composed':
          return (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <ComposedChart data={config.data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey={config.config.xDataKey} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {config.config.areas?.map((area: any, index: number) => (
                  <Area 
                    key={`area-${index}`}
                    type="monotone"
                    dataKey={area.dataKey}
                    stroke={area.stroke}
                    fill={area.fill}
                    fillOpacity={area.fillOpacity}
                  />
                ))}
                {config.config.lines?.map((line: any, index: number) => (
                  <Line 
                    key={`line-${index}`}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.stroke}
                    strokeWidth={line.strokeWidth}
                    strokeDasharray={line.strokeDasharray}
                  />
                ))}
                {config.showBrush && <Brush dataKey={config.config.xDataKey} height={30} />}
              </ComposedChart>
            </ResponsiveContainer>
          );

        default:
          return <div className="flex items-center justify-center h-64 text-gray-500">Chart type not supported</div>;
      }
    };

    return (
      <Card key={config.id} className="transition-all duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleChartExpansion(config.id)}
                    >
                      {expandedCharts.has(config.id) ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{expandedCharts.has(config.id) ? 'Minimize' : 'Maximize'}</p>
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

  const renderPlaybackControls = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Trend Playback</CardTitle>
        <CardDescription>
          Control temporal analysis and trend playback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePlayback('backward')}
          >
            <Rewind className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePlayback(playbackState.isPlaying ? 'pause' : 'play')}
          >
            {playbackState.isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePlayback('stop')}
          >
            <StopCircle className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePlayback('forward')}
          >
            <FastForward className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2 ml-8">
            <Label className="text-sm">Speed:</Label>
            <Badge variant="outline">{playbackState.speed}x</Badge>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Label className="text-sm">Position:</Label>
            <Progress value={playbackState.currentPosition} className="w-24 h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderActionBar = () => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900">Trend Analysis Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          {trendState.selectedMetric} | {trendState.selectedTimeframe}
        </Badge>
        {trendState.lastUpdated && (
          <Badge variant="outline" className="text-sm">
            Updated: {trendState.lastUpdated.toLocaleTimeString()}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="metric" className="text-sm font-medium">Metric:</Label>
          <Select value={trendState.selectedMetric} onValueChange={handleMetricChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usage">Usage</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="timeframe" className="text-sm font-medium">Timeframe:</Label>
          <Select value={trendState.selectedTimeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="forecast" className="text-sm font-medium">Forecast:</Label>
          <Switch
            id="forecast"
            checked={trendState.forecastEnabled}
            onCheckedChange={handleForecastToggle}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="anomalies" className="text-sm font-medium">Anomalies:</Label>
          <Switch
            id="anomalies"
            checked={trendState.anomalyDetectionEnabled}
            onCheckedChange={handleAnomalyDetectionToggle}
          />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={trendState.loading}
              >
                <RefreshCw className={`h-4 w-4 ${trendState.loading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh Analysis</p>
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
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('json')}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
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

  if (trendState.error) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Trend Analysis Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {trendState.error}
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
      {trendState.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading trend analysis...</span>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Bell className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Trend Alerts</AlertTitle>
          <AlertDescription className="text-orange-700">
            {alerts.length} trend alert(s) detected
          </AlertDescription>
        </Alert>
      )}

      {/* Trend Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendIndicators.map(renderTrendIndicator)}
      </div>

      {/* Playback Controls */}
      {renderPlaybackControls()}

      {/* Main Content */}
      <Tabs value={trendState.viewMode} onValueChange={(value) => handleViewModeChange(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartConfigurations.filter(c => ['primary-trends', 'comparative-trends', 'seasonal-patterns'].includes(c.id)).map(renderChart)}
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartConfigurations.filter(c => ['forecasts', 'correlation-analysis'].includes(c.id)).map(renderChart)}
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartConfigurations.filter(c => ['anomaly-detection'].includes(c.id)).map(renderChart)}
            
            {/* Anomalies Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Detected Anomalies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Metric</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {anomalies?.map((anomaly, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {new Date(anomaly.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{anomaly.metric}</TableCell>
                          <TableCell className="font-medium">
                            {anomaly.value.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              anomaly.severity === 'critical' ? 'destructive' :
                              anomaly.severity === 'high' ? 'secondary' :
                              'outline'
                            }>
                              {anomaly.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(anomaly.confidence * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500">
                            No anomalies detected
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statistical Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Statistical Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{statistics.mean?.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Mean</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{statistics.median?.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Median</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{statistics.standardDeviation?.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Std Dev</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{statistics.variance?.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Variance</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confidence Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Analysis Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Confidence Level: {trendState.confidenceLevel}%
                    </Label>
                    <Slider
                      value={[trendState.confidenceLevel]}
                      onValueChange={handleConfidenceLevelChange}
                      min={50}
                      max={99}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={trendState.forecastEnabled}
                        onCheckedChange={handleForecastToggle}
                      />
                      <Label className="text-sm">Enable Forecasting</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={trendState.anomalyDetectionEnabled}
                        onCheckedChange={handleAnomalyDetectionToggle}
                      />
                      <Label className="text-sm">Anomaly Detection</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrendAnalysisDashboard;