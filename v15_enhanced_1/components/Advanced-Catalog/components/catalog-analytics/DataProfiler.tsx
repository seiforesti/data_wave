// ============================================================================
// DATA PROFILER - ADVANCED CATALOG ANALYTICS
// ============================================================================
// Enterprise-grade data profiling component providing comprehensive statistical
// analysis, data quality assessment, and intelligent profiling insights
// ============================================================================

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Database, 
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Target,
  Activity,
  RefreshCw,
  Download,
  Settings,
  Filter,
  Search,
  Calendar,
  Hash,
  Type,
  Clock,
  Globe,
  MapPin,
  Tag,
  Eye,
  EyeOff,
  Info,
  Zap,
  Shield,
  Users,
  FileText,
  Layout,
  Layers,
  Code,
  Brain,
  Star,
  Bookmark,
  Share2,
  Copy,
  Upload
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
  Label,
} from '@/components/ui/label';
import {
  Separator,
} from '@/components/ui/separator';
import {
  ScrollArea,
} from '@/components/ui/scroll-area';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Switch,
} from '@/components/ui/switch';
import {
  Textarea,
} from '@/components/ui/textarea';
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
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  Histogram,
  BoxPlot
} from 'recharts';

// Services and Types
import { 
  useDataProfiling,
  useDataQuality,
  useDataStatistics
} from '../../hooks/useDataProfiling';
import { 
  DataProfilingResult,
  ColumnProfile,
  DataStatistics,
  QualityMetrics,
  ProfilingConfig,
  DataDistribution,
  DataPattern,
  ProfileInsight,
  DataSample
} from '../../types/catalog-core.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DataProfilerProps {
  assetId: string;
  assetName?: string;
  className?: string;
  enableAutoRefresh?: boolean;
  onInsightGenerated?: (insight: ProfileInsight) => void;
  onQualityIssueDetected?: (issue: any) => void;
}

interface ProfilerState {
  loading: boolean;
  error: string | null;
  lastProfiled: Date | null;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface StatisticalSummary {
  count: number;
  nulls: number;
  duplicates: number;
  uniqueValues: number;
  completeness: number;
  distinctness: number;
  validity: number;
  consistency: number;
}

interface ColumnAnalysis {
  name: string;
  type: string;
  statistics: StatisticalSummary;
  distribution: DataDistribution;
  patterns: DataPattern[];
  qualityScore: number;
  insights: ProfileInsight[];
  samples: string[];
}

interface ProfilingInsight {
  id: string;
  type: 'quality' | 'pattern' | 'anomaly' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  column?: string;
  impact: number;
  actionable: boolean;
  recommendations: string[];
  confidence: number;
}

// ============================================================================
// DATA PROFILER COMPONENT
// ============================================================================

export const DataProfiler: React.FC<DataProfilerProps> = ({
  assetId,
  assetName = 'Dataset',
  className = '',
  enableAutoRefresh = false,
  onInsightGenerated,
  onQualityIssueDetected
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [profilerState, setProfilerState] = useState<ProfilerState>({
    loading: true,
    error: null,
    lastProfiled: null,
    autoRefresh: enableAutoRefresh,
    refreshInterval: 300000 // 5 minutes
  });

  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedView, setSelectedView] = useState<string>('overview');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [insights, setInsights] = useState<ProfilingInsight[]>([]);
  const [profilingConfig, setProfilingConfig] = useState<ProfilingConfig>({
    includeDistribution: true,
    includePatterns: true,
    includeSamples: true,
    sampleSize: 1000,
    qualityChecks: true,
    detectAnomalies: true
  });

  // Refs for performance optimization
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // HOOKS & DATA FETCHING
  // ============================================================================

  const {
    profilingResult,
    columnProfiles,
    loading: profilingLoading,
    error: profilingError,
    refreshProfiling,
    exportProfile
  } = useDataProfiling({
    assetId,
    config: profilingConfig,
    enableAutoRefresh: profilerState.autoRefresh,
    refreshInterval: profilerState.refreshInterval
  });

  const {
    qualityMetrics,
    qualityScore,
    qualityIssues,
    loading: qualityLoading,
    error: qualityError
  } = useDataQuality({
    assetId,
    enableRealTime: profilerState.autoRefresh
  });

  const {
    statistics,
    distributions,
    correlations,
    loading: statsLoading,
    error: statsError
  } = useDataStatistics({
    assetId,
    includeCorrelations: true,
    includeDistributions: true
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const overallStatistics = useMemo<StatisticalSummary>(() => {
    if (!profilingResult) {
      return {
        count: 0,
        nulls: 0,
        duplicates: 0,
        uniqueValues: 0,
        completeness: 0,
        distinctness: 0,
        validity: 0,
        consistency: 0
      };
    }

    return {
      count: profilingResult.totalRecords || 0,
      nulls: profilingResult.nullCount || 0,
      duplicates: profilingResult.duplicateCount || 0,
      uniqueValues: profilingResult.uniqueValueCount || 0,
      completeness: profilingResult.completenessScore || 0,
      distinctness: profilingResult.distinctnessScore || 0,
      validity: profilingResult.validityScore || 0,
      consistency: profilingResult.consistencyScore || 0
    };
  }, [profilingResult]);

  const columnAnalyses = useMemo<ColumnAnalysis[]>(() => {
    if (!columnProfiles || !Array.isArray(columnProfiles)) return [];

    return columnProfiles.map(profile => ({
      name: profile.columnName || 'Unknown',
      type: profile.dataType || 'Unknown',
      statistics: {
        count: profile.recordCount || 0,
        nulls: profile.nullCount || 0,
        duplicates: profile.duplicateCount || 0,
        uniqueValues: profile.distinctCount || 0,
        completeness: profile.completenessScore || 0,
        distinctness: profile.distinctnessScore || 0,
        validity: profile.validityScore || 0,
        consistency: profile.consistencyScore || 0
      },
      distribution: profile.distribution || {},
      patterns: profile.patterns || [],
      qualityScore: profile.qualityScore || 0,
      insights: profile.insights || [],
      samples: profile.sampleValues || []
    }));
  }, [columnProfiles]);

  const qualityOverview = useMemo(() => {
    if (!qualityMetrics) return null;

    const issues = qualityIssues || [];
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const highIssues = issues.filter(issue => issue.severity === 'high').length;
    const mediumIssues = issues.filter(issue => issue.severity === 'medium').length;
    const lowIssues = issues.filter(issue => issue.severity === 'low').length;

    return {
      overallScore: qualityScore || 0,
      totalIssues: issues.length,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      accuracy: qualityMetrics.accuracy || 0,
      completeness: qualityMetrics.completeness || 0,
      consistency: qualityMetrics.consistency || 0,
      validity: qualityMetrics.validity || 0,
      uniqueness: qualityMetrics.uniqueness || 0,
      timeliness: qualityMetrics.timeliness || 0
    };
  }, [qualityMetrics, qualityScore, qualityIssues]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setProfilerState(prev => ({
      ...prev,
      loading: profilingLoading || qualityLoading || statsLoading,
      error: profilingError || qualityError || statsError,
      lastProfiled: profilingResult?.profilingDate ? new Date(profilingResult.profilingDate) : null
    }));
  }, [profilingLoading, qualityLoading, statsLoading, profilingError, qualityError, statsError, profilingResult]);

  useEffect(() => {
    if (profilerState.autoRefresh && enableAutoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        refreshProfiling();
      }, profilerState.refreshInterval);
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
  }, [profilerState.autoRefresh, profilerState.refreshInterval, enableAutoRefresh, refreshProfiling]);

  // Generate insights when data changes
  useEffect(() => {
    if (profilingResult && qualityMetrics) {
      generateProfilingInsights();
    }
  }, [profilingResult, qualityMetrics]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(async () => {
    setProfilerState(prev => ({ ...prev, loading: true }));
    try {
      await refreshProfiling();
      setProfilerState(prev => ({ 
        ...prev, 
        loading: false, 
        lastProfiled: new Date(),
        error: null 
      }));
    } catch (error) {
      setProfilerState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Refresh failed' 
      }));
    }
  }, [refreshProfiling]);

  const handleExport = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      await exportProfile({
        format,
        includeStatistics: true,
        includeQuality: true,
        includeInsights: true,
        includeSamples: !showSensitiveData
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportProfile, showSensitiveData]);

  const toggleAutoRefresh = useCallback(() => {
    setProfilerState(prev => ({
      ...prev,
      autoRefresh: !prev.autoRefresh
    }));
  }, []);

  const handleColumnSelect = useCallback((columnName: string) => {
    setSelectedColumn(columnName);
    setSelectedView('column-detail');
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const generateProfilingInsights = useCallback(() => {
    const newInsights: ProfilingInsight[] = [];

    // Quality-based insights
    if (qualityOverview && qualityOverview.overallScore < 70) {
      newInsights.push({
        id: `quality-low-${Date.now()}`,
        type: 'quality',
        severity: qualityOverview.overallScore < 50 ? 'critical' : 'high',
        title: 'Low Data Quality Detected',
        description: `Overall quality score is ${qualityOverview.overallScore.toFixed(1)}%, below acceptable threshold`,
        impact: 90,
        actionable: true,
        recommendations: [
          'Review data validation rules',
          'Implement data cleansing processes',
          'Enhance data entry controls'
        ],
        confidence: 0.92
      });
    }

    // Completeness insights
    if (overallStatistics.completeness < 85) {
      newInsights.push({
        id: `completeness-${Date.now()}`,
        type: 'quality',
        severity: overallStatistics.completeness < 70 ? 'high' : 'medium',
        title: 'Data Completeness Issues',
        description: `${overallStatistics.completeness.toFixed(1)}% completeness detected`,
        impact: 75,
        actionable: true,
        recommendations: [
          'Identify sources of missing data',
          'Implement required field validations',
          'Review data collection processes'
        ],
        confidence: 0.89
      });
    }

    // Duplicate detection
    if (overallStatistics.duplicates > overallStatistics.count * 0.05) {
      newInsights.push({
        id: `duplicates-${Date.now()}`,
        type: 'anomaly',
        severity: 'medium',
        title: 'High Duplicate Rate Detected',
        description: `${overallStatistics.duplicates} duplicate records found (${((overallStatistics.duplicates / overallStatistics.count) * 100).toFixed(1)}%)`,
        impact: 60,
        actionable: true,
        recommendations: [
          'Implement duplicate detection rules',
          'Review data ingestion processes',
          'Consider data deduplication'
        ],
        confidence: 0.95
      });
    }

    // Column-specific insights
    columnAnalyses.forEach(column => {
      if (column.qualityScore < 60) {
        newInsights.push({
          id: `column-quality-${column.name}-${Date.now()}`,
          type: 'quality',
          severity: column.qualityScore < 40 ? 'high' : 'medium',
          title: `Poor Quality in Column: ${column.name}`,
          description: `Column "${column.name}" has a quality score of ${column.qualityScore.toFixed(1)}%`,
          column: column.name,
          impact: 50,
          actionable: true,
          recommendations: [
            `Review data validation for ${column.name}`,
            'Check data source quality',
            'Implement column-specific cleansing'
          ],
          confidence: 0.87
        });
      }
    });

    setInsights(newInsights);
    
    // Notify parent components
    if (onInsightGenerated) {
      newInsights.forEach(insight => onInsightGenerated(insight as ProfileInsight));
    }

    if (onQualityIssueDetected && qualityIssues) {
      qualityIssues.forEach(issue => onQualityIssueDetected(issue));
    }
  }, [qualityOverview, overallStatistics, columnAnalyses, qualityIssues, onInsightGenerated, onQualityIssueDetected]);

  const formatNumber = useCallback((value: number, type: 'number' | 'percentage' = 'number') => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    
    if (type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    
    return new Intl.NumberFormat('en-US').format(value);
  }, []);

  const getQualityColor = useCallback((score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  }, []);

  const getSeverityIcon = useCallback((severity: ProfilingInsight['severity']) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertCircle;
      case 'medium': return Info;
      case 'low': return CheckCircle;
      default: return Info;
    }
  }, []);

  const getSeverityColor = useCallback((severity: ProfilingInsight['severity']) => {
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

  const renderOverviewMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Total Records</CardTitle>
          <Database className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {formatNumber(overallStatistics.count)}
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {formatNumber(overallStatistics.uniqueValues)} unique values
          </p>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Completeness</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {formatNumber(overallStatistics.completeness, 'percentage')}
          </div>
          <div className="mt-2">
            <Progress 
              value={overallStatistics.completeness} 
              className="w-full h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Quality Score</CardTitle>
          <Star className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            {formatNumber(qualityOverview?.overallScore || 0, 'percentage')}
          </div>
          <p className="text-xs text-purple-600 mt-1">
            {qualityOverview?.totalIssues || 0} issues detected
          </p>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">Duplicates</CardTitle>
          <Copy className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">
            {formatNumber(overallStatistics.duplicates)}
          </div>
          <p className="text-xs text-orange-600 mt-1">
            {formatNumber((overallStatistics.duplicates / overallStatistics.count) * 100, 'percentage')} of total
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderQualityDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quality Dimensions</CardTitle>
          <CardDescription>
            Comprehensive data quality assessment across multiple dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityOverview && [
              { name: 'Accuracy', score: qualityOverview.accuracy, icon: Target },
              { name: 'Completeness', score: qualityOverview.completeness, icon: CheckCircle },
              { name: 'Consistency', score: qualityOverview.consistency, icon: Activity },
              { name: 'Validity', score: qualityOverview.validity, icon: Shield },
              { name: 'Uniqueness', score: qualityOverview.uniqueness, icon: Hash },
              { name: 'Timeliness', score: qualityOverview.timeliness, icon: Clock }
            ].map(dimension => (
              <div key={dimension.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <dimension.icon className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{dimension.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24">
                    <Progress value={dimension.score} className="h-2" />
                  </div>
                  <Badge variant="outline" className={getQualityColor(dimension.score)}>
                    {formatNumber(dimension.score, 'percentage')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quality Issues Breakdown</CardTitle>
          <CardDescription>
            Distribution of data quality issues by severity level
          </CardDescription>
        </CardHeader>
        <CardContent>
          {qualityOverview && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Critical', value: qualityOverview.criticalIssues, fill: '#ef4444' },
                      { name: 'High', value: qualityOverview.highIssues, fill: '#f97316' },
                      { name: 'Medium', value: qualityOverview.mediumIssues, fill: '#eab308' },
                      { name: 'Low', value: qualityOverview.lowIssues, fill: '#22c55e' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {[
                      { name: 'Critical', value: qualityOverview.criticalIssues, fill: '#ef4444' },
                      { name: 'High', value: qualityOverview.highIssues, fill: '#f97316' },
                      { name: 'Medium', value: qualityOverview.mediumIssues, fill: '#eab308' },
                      { name: 'Low', value: qualityOverview.lowIssues, fill: '#22c55e' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderColumnProfiles = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Column Profiles</CardTitle>
        <CardDescription>
          Detailed statistical analysis for each column in the dataset
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Completeness</TableHead>
                <TableHead>Uniqueness</TableHead>
                <TableHead>Quality Score</TableHead>
                <TableHead>Patterns</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columnAnalyses.map((column, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Type className="h-4 w-4 text-gray-500" />
                      <span>{column.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{column.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16">
                        <Progress value={column.statistics.completeness} className="h-2" />
                      </div>
                      <span className="text-sm">
                        {formatNumber(column.statistics.completeness, 'percentage')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16">
                        <Progress value={column.statistics.distinctness} className="h-2" />
                      </div>
                      <span className="text-sm">
                        {formatNumber(column.statistics.distinctness, 'percentage')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getQualityColor(column.qualityScore)}
                    >
                      {formatNumber(column.qualityScore, 'percentage')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {column.patterns.slice(0, 3).map((pattern, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {pattern.name || pattern.type}
                        </Badge>
                      ))}
                      {column.patterns.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{column.patterns.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleColumnSelect(column.name)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const renderInsightsPanel = () => (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Profiling Insights</CardTitle>
            <CardDescription>
              AI-generated insights and recommendations for data quality improvement
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {insights.length} insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No insights available yet</p>
                <p className="text-sm">Run profiling to generate insights</p>
              </div>
            ) : (
              insights.map((insight) => {
                const IconComponent = getSeverityIcon(insight.severity);
                return (
                  <Alert key={insight.id} className={`border ${getSeverityColor(insight.severity)}`}>
                    <IconComponent className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between">
                      {insight.title}
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence * 100}% confidence
                        </Badge>
                        {insight.column && (
                          <Badge variant="secondary" className="text-xs">
                            {insight.column}
                          </Badge>
                        )}
                      </div>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="mb-2">{insight.description}</p>
                      {insight.recommendations.length > 0 && (
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

  const renderColumnDetail = () => {
    const column = columnAnalyses.find(col => col.name === selectedColumn);
    if (!column) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Column Analysis: {column.name}
            </CardTitle>
            <CardDescription>
              Comprehensive statistical analysis and quality assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(column.statistics.count)}
                </div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(column.statistics.uniqueValues)}
                </div>
                <div className="text-sm text-gray-600">Unique Values</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(column.statistics.nulls)}
                </div>
                <div className="text-sm text-gray-600">Null Values</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(column.qualityScore, 'percentage')}
                </div>
                <div className="text-sm text-gray-600">Quality Score</div>
              </div>
            </div>

            {/* Data Samples */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Sample Values</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {column.samples.slice(0, 8).map((sample, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm font-mono">
                    {showSensitiveData ? sample : '***'}
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSensitiveData(!showSensitiveData)}
                >
                  {showSensitiveData ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                  {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
                </Button>
              </div>
            </div>

            {/* Patterns */}
            {column.patterns.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Detected Patterns</h4>
                <div className="space-y-2">
                  {column.patterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{pattern.name || pattern.type}</span>
                        <p className="text-sm text-gray-600">{pattern.description}</p>
                      </div>
                      <Badge variant="outline">
                        {formatNumber((pattern.confidence || 0) * 100, 'percentage')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderControlPanel = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Profiling Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium">Sample Size</Label>
            <Select 
              value={profilingConfig.sampleSize?.toString()}
              onValueChange={(value) => 
                setProfilingConfig(prev => ({ ...prev, sampleSize: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 records</SelectItem>
                <SelectItem value="1000">1,000 records</SelectItem>
                <SelectItem value="10000">10,000 records</SelectItem>
                <SelectItem value="100000">100,000 records</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="includeDistribution"
              checked={profilingConfig.includeDistribution}
              onCheckedChange={(checked) => 
                setProfilingConfig(prev => ({ ...prev, includeDistribution: checked }))
              }
            />
            <Label htmlFor="includeDistribution" className="text-sm">
              Include Distributions
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="detectPatterns"
              checked={profilingConfig.includePatterns}
              onCheckedChange={(checked) => 
                setProfilingConfig(prev => ({ ...prev, includePatterns: checked }))
              }
            />
            <Label htmlFor="detectPatterns" className="text-sm">
              Detect Patterns
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="autoRefresh"
              checked={profilerState.autoRefresh}
              onCheckedChange={toggleAutoRefresh}
            />
            <Label htmlFor="autoRefresh" className="text-sm">
              Auto Refresh
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderActionButtons = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900">Data Profiler</h1>
        <Badge variant="outline" className="text-sm">
          {assetName}
        </Badge>
        {profilerState.lastProfiled && (
          <Badge variant="outline" className="text-sm">
            Last profiled: {profilerState.lastProfiled.toLocaleTimeString()}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={profilerState.loading}
              >
                <RefreshCw className={`h-4 w-4 ${profilerState.loading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh Profiling</p>
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

  if (profilerState.error) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Profiling Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {profilerState.error}
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
      {profilerState.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Profiling data...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="columns">Columns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewMetrics()}
          {renderColumnProfiles()}
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          {renderQualityDashboard()}
          {renderInsightsPanel()}
        </TabsContent>

        <TabsContent value="columns" className="space-y-6">
          {selectedColumn ? renderColumnDetail() : renderColumnProfiles()}
          {selectedColumn && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedColumn('')}
              className="mb-4"
            >
              ← Back to All Columns
            </Button>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {renderInsightsPanel()}
          
          {/* Additional insights visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Insight Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['quality', 'pattern', 'anomaly', 'recommendation'].map(category => {
                    const categoryInsights = insights.filter(i => i.type === category);
                    return (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium capitalize">{category}</span>
                        <Badge variant="secondary">{categoryInsights.length}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insight Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Critical', count: insights.filter(i => i.severity === 'critical').length },
                        { name: 'High', count: insights.filter(i => i.severity === 'high').length },
                        { name: 'Medium', count: insights.filter(i => i.severity === 'medium').length },
                        { name: 'Low', count: insights.filter(i => i.severity === 'low').length }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataProfiler;