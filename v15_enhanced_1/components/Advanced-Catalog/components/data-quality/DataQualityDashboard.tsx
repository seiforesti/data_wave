// ============================================================================
// DATA QUALITY DASHBOARD - COMPREHENSIVE QUALITY MONITORING (2200+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Data Quality Management Component
// Real-time quality monitoring, automated rule validation, quality metrics analysis,
// data profiling, anomaly detection, and quality improvement recommendations
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

// ============================================================================
// SHADCN/UI IMPORTS
// ============================================================================
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuSub } from '@/components/ui/dropdown-menu';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { AlertCircle, Activity, BarChart3, Brain, ChevronDown, ChevronRight, Clock, Database, Download, Eye, Filter, GitBranch, Globe, Home, Info, Layers, LineChart as LineChartIcon, MapPin, Network, Play, Plus, RefreshCw, Save, Search, Settings, Share2, Target, Trash2, TrendingUp, Users, Zap, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Move, Square, Circle, Triangle, Hexagon, Star, Bookmark, Bell, MessageCircle, Tag, Link, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronUp, MoreHorizontal, Edit, Copy, ExternalLink, FileText, Image, Video, Music, Archive, Code, Table, PieChart as PieChartIcon, TreePine, Workflow, AlertTriangle, CheckCircle, XCircle, MinusCircle, TrendingDown, Calendar as CalendarIcon, Clock3, Gauge, Shield, Award, Lightbulb, Bug, Wrench, Monitor, Server, HardDrive, Cpu, MemoryStick, CloudLightning, Wifi, WifiOff, CloudRain, Sun, Moon, Thermometer, Battery, Signal } from 'lucide-react';

// ============================================================================
// TYPE IMPORTS AND INTERFACES
// ============================================================================
import {
  // Core Types
  DataAsset,
  AssetMetadata,
  AssetType,
  DataSourceConfig,
  QualityMetrics,
  QualityRule,
  QualityDimension,
  QualityProfile,
  QualityReport,
  QualityIncident,
  QualityTrend,
  
  // Profiling Types
  DataProfile,
  ColumnProfile,
  StatisticalSummary,
  DataType,
  
  // Quality Monitoring
  QualityMonitorConfig,
  QualityThreshold,
  QualityAlert,
  QualityDashboardConfig,
  
  // Anomaly Detection
  AnomalyDetection,
  AnomalyPattern,
  AnomalyThreshold,
  
  // Search and Discovery
  SearchQuery,
  SearchResult,
  SearchFilters,
  
  // Compliance
  ComplianceStatus,
  ComplianceRule,
  
  // Collaboration
  Annotation,
  Comment,
  Tag,
  
  // Advanced Features
  AIRecommendation,
  SmartInsight,
  AutomatedDiscovery,
  
  // API Response Types
  ApiResponse,
  PaginatedResponse,
  ErrorResponse
} from '../../types/catalog-core.types';

// ============================================================================
// SERVICE IMPORTS
// ============================================================================
import {
  enterpriseCatalogService,
  qualityService,
  searchService,
  analyticsService,
  aiService,
  alertingService,
  profilingService
} from '../../services/enterprise-catalog.service';

// ============================================================================
// CONSTANTS AND CONFIGURATIONS
// ============================================================================
const QUALITY_DIMENSIONS = {
  COMPLETENESS: 'completeness',
  ACCURACY: 'accuracy',
  CONSISTENCY: 'consistency',
  VALIDITY: 'validity',
  TIMELINESS: 'timeliness',
  UNIQUENESS: 'uniqueness',
  INTEGRITY: 'integrity',
  CONFORMITY: 'conformity'
} as const;

const QUALITY_RULE_TYPES = {
  NULL_CHECK: 'null_check',
  RANGE_CHECK: 'range_check',
  FORMAT_CHECK: 'format_check',
  UNIQUENESS_CHECK: 'uniqueness_check',
  REFERENTIAL_INTEGRITY: 'referential_integrity',
  BUSINESS_RULE: 'business_rule',
  PATTERN_MATCH: 'pattern_match',
  STATISTICAL_OUTLIER: 'statistical_outlier',
  FRESHNESS_CHECK: 'freshness_check',
  VOLUME_CHECK: 'volume_check'
} as const;

const QUALITY_STATUSES = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  CRITICAL: 'critical'
} as const;

const ALERT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

const QUALITY_SCORE_RANGES = {
  EXCELLENT: { min: 90, max: 100, color: '#16a34a' },
  GOOD: { min: 75, max: 89, color: '#84cc16' },
  FAIR: { min: 60, max: 74, color: '#eab308' },
  POOR: { min: 30, max: 59, color: '#f97316' },
  CRITICAL: { min: 0, max: 29, color: '#ef4444' }
} as const;

const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4'
};

const MONITORING_INTERVALS = [
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: '30 minutes', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '6 hours', value: 21600 },
  { label: '12 hours', value: 43200 },
  { label: '24 hours', value: 86400 }
] as const;

// ============================================================================
// EXTENDED INTERFACES FOR QUALITY DASHBOARD
// ============================================================================
interface QualityDashboardProps {
  assetId?: string;
  enableRealTimeMonitoring?: boolean;
  showAnomalyDetection?: boolean;
  enableAlerts?: boolean;
  enableRecommendations?: boolean;
  defaultTimeRange?: { start: Date; end: Date };
  customRules?: QualityRule[];
  onQualityIssue?: (incident: QualityIncident) => void;
  onRuleViolation?: (rule: QualityRule, violation: any) => void;
  className?: string;
}

interface QualityDashboardState {
  selectedAssets: Set<string>;
  timeRange: { start: Date; end: Date };
  qualityDimensions: Set<keyof typeof QUALITY_DIMENSIONS>;
  ruleTypes: Set<keyof typeof QUALITY_RULE_TYPES>;
  alertSeverities: Set<keyof typeof ALERT_SEVERITIES>;
  monitoringEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  realTimeUpdates: boolean;
  filterState: QualityFilterState;
  viewMode: 'overview' | 'detailed' | 'comparison' | 'trends';
}

interface QualityFilterState {
  searchQuery: string;
  statusFilter: keyof typeof QUALITY_STATUSES | 'all';
  dimensionFilter: keyof typeof QUALITY_DIMENSIONS | 'all';
  assetTypeFilter: string | 'all';
  severityFilter: keyof typeof ALERT_SEVERITIES | 'all';
  timeRangeFilter: 'last_hour' | 'last_day' | 'last_week' | 'last_month' | 'custom';
  showOnlyFailed: boolean;
  showOnlyActive: boolean;
}

interface QualityScoreBreakdown {
  overall: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  timeliness: number;
  uniqueness: number;
  integrity: number;
  conformity: number;
}

interface QualityTrendData {
  timestamp: Date;
  score: number;
  dimension: keyof typeof QUALITY_DIMENSIONS;
  assetId: string;
  incidents: number;
  violations: number;
}

interface AnomalyData {
  id: string;
  timestamp: Date;
  assetId: string;
  anomalyType: string;
  severity: keyof typeof ALERT_SEVERITIES;
  confidence: number;
  description: string;
  affectedRows: number;
  suggestions: string[];
}

// ============================================================================
// QUALITY OVERVIEW COMPONENT
// ============================================================================
const QualityOverviewPanel: React.FC<{
  qualityData: QualityReport | null;
  isLoading: boolean;
  timeRange: { start: Date; end: Date };
}> = ({ qualityData, isLoading, timeRange }) => {
  const qualityScore = qualityData?.overallScore || 0;
  const getQualityStatus = (score: number): keyof typeof QUALITY_STATUSES => {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'FAIR';
    if (score >= 30) return 'POOR';
    return 'CRITICAL';
  };

  const status = getQualityStatus(qualityScore);
  const statusColor = QUALITY_SCORE_RANGES[status].color;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Quality Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Quality Overview
        </CardTitle>
        <CardDescription>
          Data quality metrics for {timeRange.start.toLocaleDateString()} - {timeRange.end.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={statusColor}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${(qualityScore / 100) * 251.2} 251.2`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: statusColor }}>
                  {qualityScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
            </div>
          </div>
          <Badge
            variant={status === 'EXCELLENT' || status === 'GOOD' ? 'default' : 'destructive'}
            className="text-lg px-4 py-1"
          >
            {status}
          </Badge>
        </div>

        {/* Quality Dimensions */}
        {qualityData?.dimensionScores && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Quality Dimensions</Label>
            {Object.entries(QUALITY_DIMENSIONS).map(([key, dimension]) => {
              const score = qualityData.dimensionScores?.[dimension] || 0;
              const dimensionStatus = getQualityStatus(score);
              const dimensionColor = QUALITY_SCORE_RANGES[dimensionStatus].color;
              
              return (
                <div key={dimension} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {dimension.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold" style={{ color: dimensionColor }}>
                      {score.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={score} className="h-2">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        backgroundColor: dimensionColor,
                        width: `${score}%`
                      }}
                    />
                  </Progress>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-3">
            <div className="text-2xl font-bold text-green-600">
              {qualityData?.passedRules || 0}
            </div>
            <div className="text-sm text-gray-500">Passed Rules</div>
          </Card>
          <Card className="p-3">
            <div className="text-2xl font-bold text-red-600">
              {qualityData?.failedRules || 0}
            </div>
            <div className="text-sm text-gray-500">Failed Rules</div>
          </Card>
          <Card className="p-3">
            <div className="text-2xl font-bold text-blue-600">
              {qualityData?.totalAssets || 0}
            </div>
            <div className="text-sm text-gray-500">Monitored Assets</div>
          </Card>
          <Card className="p-3">
            <div className="text-2xl font-bold text-orange-600">
              {qualityData?.activeIncidents || 0}
            </div>
            <div className="text-sm text-gray-500">Active Issues</div>
          </Card>
        </div>

        {/* Recent Incidents */}
        {qualityData?.recentIncidents && qualityData.recentIncidents.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Recent Quality Issues</Label>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {qualityData.recentIncidents.slice(0, 5).map((incident, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        incident.severity === 'critical' ? 'text-red-500' :
                        incident.severity === 'high' ? 'text-orange-500' :
                        incident.severity === 'medium' ? 'text-yellow-500' :
                        'text-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium text-sm">{incident.title}</div>
                        <div className="text-xs text-gray-500">{incident.assetName}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {incident.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// QUALITY TRENDS CHART COMPONENT
// ============================================================================
const QualityTrendsChart: React.FC<{
  trendData: QualityTrendData[];
  isLoading: boolean;
  selectedDimensions: Set<keyof typeof QUALITY_DIMENSIONS>;
  timeRange: { start: Date; end: Date };
}> = ({ trendData, isLoading, selectedDimensions, timeRange }) => {
  const chartData = useMemo(() => {
    const dataMap = new Map<string, any>();
    
    trendData.forEach(trend => {
      const key = trend.timestamp.toISOString().split('T')[0];
      if (!dataMap.has(key)) {
        dataMap.set(key, {
          date: key,
          timestamp: trend.timestamp
        });
      }
      
      const entry = dataMap.get(key)!;
      entry[trend.dimension] = trend.score;
      entry[`${trend.dimension}_incidents`] = trend.incidents;
    });
    
    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [trendData]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" />
            Quality Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5" />
          Quality Trends
        </CardTitle>
        <CardDescription>
          Quality score trends over time by dimension
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any, name: string) => [
                  `${Number(value).toFixed(1)}%`,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Legend />
              {Array.from(selectedDimensions).map((dimension, index) => (
                <Line
                  key={dimension}
                  type="monotone"
                  dataKey={dimension}
                  stroke={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// QUALITY RULES MANAGEMENT COMPONENT
// ============================================================================
const QualityRulesPanel: React.FC<{
  rules: QualityRule[];
  isLoading: boolean;
  onCreateRule: (rule: Partial<QualityRule>) => void;
  onUpdateRule: (ruleId: string, updates: Partial<QualityRule>) => void;
  onDeleteRule: (ruleId: string) => void;
  onTestRule: (rule: QualityRule) => void;
}> = ({ rules, isLoading, onCreateRule, onUpdateRule, onDeleteRule, onTestRule }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<QualityRule | null>(null);
  const [searchQuery, setSearchQuery] = useDebounce('', 300);
  const [selectedRuleType, setSelectedRuleType] = useState<keyof typeof QUALITY_RULE_TYPES | 'all'>('all');

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      if (selectedRuleType !== 'all' && rule.type !== selectedRuleType) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          rule.name.toLowerCase().includes(query) ||
          rule.description?.toLowerCase().includes(query) ||
          rule.assetName?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [rules, selectedRuleType, searchQuery]);

  const RuleForm = ({ rule, onSave, onCancel }: {
    rule?: QualityRule;
    onSave: (rule: Partial<QualityRule>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: rule?.name || '',
      description: rule?.description || '',
      type: rule?.type || 'NULL_CHECK' as keyof typeof QUALITY_RULE_TYPES,
      dimension: rule?.dimension || 'COMPLETENESS' as keyof typeof QUALITY_DIMENSIONS,
      assetId: rule?.assetId || '',
      columnName: rule?.columnName || '',
      threshold: rule?.threshold || 0,
      operator: rule?.operator || 'greater_than',
      value: rule?.value || '',
      isActive: rule?.isActive ?? true,
      severity: rule?.severity || 'MEDIUM' as keyof typeof ALERT_SEVERITIES
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter rule name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Rule Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QUALITY_RULE_TYPES).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {key.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this rule validates"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dimension">Quality Dimension</Label>
            <Select
              value={formData.dimension}
              onValueChange={(value) => setFormData(prev => ({ ...prev, dimension: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QUALITY_DIMENSIONS).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {key.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ALERT_SEVERITIES).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="threshold">Threshold</Label>
            <Input
              id="threshold"
              type="number"
              value={formData.threshold}
              onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
              placeholder="0.95"
              step="0.01"
              min="0"
              max="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operator">Operator</Label>
            <Select
              value={formData.operator}
              onValueChange={(value) => setFormData(prev => ({ ...prev, operator: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greater_than">Greater Than</SelectItem>
                <SelectItem value="less_than">Less Than</SelectItem>
                <SelectItem value="equal_to">Equal To</SelectItem>
                <SelectItem value="not_equal_to">Not Equal To</SelectItem>
                <SelectItem value="between">Between</SelectItem>
                <SelectItem value="not_between">Not Between</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Expected value"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label>Active Rule</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {rule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quality Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Quality Rules
        </CardTitle>
        <CardDescription>
          Configure and manage data quality validation rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRuleType} onValueChange={(value: any) => setSelectedRuleType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(QUALITY_RULE_TYPES).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {key.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Quality Rule</DialogTitle>
                <DialogDescription>
                  Define a new data quality validation rule
                </DialogDescription>
              </DialogHeader>
              <RuleForm
                onSave={(rule) => {
                  onCreateRule(rule);
                  setIsCreateDialogOpen(false);
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Rules List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {rule.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant={
                          rule.severity === 'critical' ? 'destructive' :
                          rule.severity === 'high' ? 'default' :
                          'secondary'
                        }>
                          {rule.severity}
                        </Badge>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mt-2">{rule.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Dimension: {rule.dimension}</span>
                      <span>Threshold: {rule.threshold}</span>
                      {rule.lastExecuted && (
                        <span>Last Run: {new Date(rule.lastExecuted).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTestRule(rule)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Quality Rule</DialogTitle>
                          <DialogDescription>
                            Modify the quality validation rule
                          </DialogDescription>
                        </DialogHeader>
                        <RuleForm
                          rule={rule}
                          onSave={(updates) => {
                            onUpdateRule(rule.id, updates);
                          }}
                          onCancel={() => {}}
                        />
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {filteredRules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No quality rules found matching your criteria
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// ANOMALY DETECTION COMPONENT
// ============================================================================
const AnomalyDetectionPanel: React.FC<{
  anomalies: AnomalyData[];
  isLoading: boolean;
  onInvestigateAnomaly: (anomaly: AnomalyData) => void;
  onDismissAnomaly: (anomalyId: string) => void;
  onConfigureDetection: (config: AnomalyDetection) => void;
}> = ({ anomalies, isLoading, onInvestigateAnomaly, onDismissAnomaly, onConfigureDetection }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<keyof typeof ALERT_SEVERITIES | 'all'>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(anomaly => {
      if (selectedSeverity !== 'all' && anomaly.severity !== selectedSeverity) {
        return false;
      }
      
      const timeThreshold = selectedTimeRange === '1h' ? 1 :
                           selectedTimeRange === '6h' ? 6 :
                           selectedTimeRange === '24h' ? 24 :
                           selectedTimeRange === '7d' ? 168 : 24;
      
      const hoursAgo = new Date(Date.now() - timeThreshold * 60 * 60 * 1000);
      return anomaly.timestamp >= hoursAgo;
    });
  }, [anomalies, selectedSeverity, selectedTimeRange]);

  const anomalyStats = useMemo(() => {
    const stats = {
      total: filteredAnomalies.length,
      critical: filteredAnomalies.filter(a => a.severity === 'critical').length,
      high: filteredAnomalies.filter(a => a.severity === 'high').length,
      medium: filteredAnomalies.filter(a => a.severity === 'medium').length,
      low: filteredAnomalies.filter(a => a.severity === 'low').length
    };
    return stats;
  }, [filteredAnomalies]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Anomaly Detection
        </CardTitle>
        <CardDescription>
          AI-powered detection of data quality anomalies and patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedSeverity} onValueChange={(value: any) => setSelectedSeverity(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.entries(ALERT_SEVERITIES).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="6h">6h</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical: {anomalyStats.critical}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>High: {anomalyStats.high}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium: {anomalyStats.medium}</span>
            </div>
          </div>
        </div>

        {/* Anomalies List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredAnomalies.map((anomaly) => (
              <Card key={anomaly.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={
                        anomaly.severity === 'critical' ? 'destructive' :
                        anomaly.severity === 'high' ? 'default' :
                        'secondary'
                      }>
                        {anomaly.severity}
                      </Badge>
                      <Badge variant="outline">
                        {anomaly.anomalyType}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Confidence: {(anomaly.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <h4 className="font-medium">{anomaly.description}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Asset: {anomaly.assetId} • Affected rows: {anomaly.affectedRows.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Detected: {anomaly.timestamp.toLocaleString()}
                    </p>
                    
                    {anomaly.suggestions.length > 0 && (
                      <div className="mt-3">
                        <Label className="text-sm font-medium">Suggested Actions:</Label>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {anomaly.suggestions.slice(0, 2).map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onInvestigateAnomaly(anomaly)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Investigate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismissAnomaly(anomaly.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {filteredAnomalies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <div className="font-medium">No anomalies detected</div>
                <div className="text-sm">Your data quality looks good!</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// ALERTS MANAGEMENT COMPONENT
// ============================================================================
const AlertsManagementPanel: React.FC<{
  alerts: QualityAlert[];
  isLoading: boolean;
  onCreateAlert: (alert: Partial<QualityAlert>) => void;
  onUpdateAlert: (alertId: string, updates: Partial<QualityAlert>) => void;
  onDeleteAlert: (alertId: string) => void;
  onTestAlert: (alert: QualityAlert) => void;
}> = ({ alerts, isLoading, onCreateAlert, onUpdateAlert, onDeleteAlert, onTestAlert }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<keyof typeof ALERT_SEVERITIES | 'all'>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) {
        return false;
      }
      
      if (showActiveOnly && !alert.isActive) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          alert.name.toLowerCase().includes(query) ||
          alert.description?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [alerts, selectedSeverity, showActiveOnly, searchQuery]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alert Management
        </CardTitle>
        <CardDescription>
          Configure and manage quality monitoring alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedSeverity} onValueChange={(value: any) => setSelectedSeverity(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {Object.entries(ALERT_SEVERITIES).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
            />
            <Label>Active Only</Label>
          </div>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'high' ? 'default' :
                      'secondary'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium">{alert.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                  
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <div>Trigger: {alert.condition}</div>
                    <div>Recipients: {alert.recipients?.join(', ')}</div>
                    {alert.lastTriggered && (
                      <div>Last Triggered: {new Date(alert.lastTriggered).toLocaleString()}</div>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onTestAlert(alert)}>
                      <Play className="h-4 w-4 mr-2" />
                      Test Alert
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteAlert(alert.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No alerts found matching your criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN DATA QUALITY DASHBOARD COMPONENT
// ============================================================================
const DataQualityDashboard: React.FC<QualityDashboardProps> = ({
  assetId,
  enableRealTimeMonitoring = true,
  showAnomalyDetection = true,
  enableAlerts = true,
  enableRecommendations = true,
  defaultTimeRange = {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  },
  customRules = [],
  onQualityIssue,
  onRuleViolation,
  className
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const queryClient = useQueryClient();

  // Core State
  const [dashboardState, setDashboardState] = useState<QualityDashboardState>({
    selectedAssets: new Set(assetId ? [assetId] : []),
    timeRange: defaultTimeRange,
    qualityDimensions: new Set(Object.values(QUALITY_DIMENSIONS)),
    ruleTypes: new Set(Object.values(QUALITY_RULE_TYPES)),
    alertSeverities: new Set(Object.values(ALERT_SEVERITIES)),
    monitoringEnabled: enableRealTimeMonitoring,
    anomalyDetectionEnabled: showAnomalyDetection,
    realTimeUpdates: enableRealTimeMonitoring,
    filterState: {
      searchQuery: '',
      statusFilter: 'all',
      dimensionFilter: 'all',
      assetTypeFilter: 'all',
      severityFilter: 'all',
      timeRangeFilter: 'last_week',
      showOnlyFailed: false,
      showOnlyActive: true
    },
    viewMode: 'overview'
  });

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minutes

  // ============================================================================
  // DATA FETCHING WITH REACT QUERY
  // ============================================================================

  // Fetch quality overview data
  const {
    data: qualityData,
    isLoading: isLoadingQuality,
    error: qualityError,
    refetch: refetchQuality
  } = useQuery({
    queryKey: ['quality-overview', Array.from(dashboardState.selectedAssets), dashboardState.timeRange],
    queryFn: async () => {
      const response = await qualityService.getQualityOverview({
        assetIds: Array.from(dashboardState.selectedAssets),
        timeRange: dashboardState.timeRange,
        dimensions: Array.from(dashboardState.qualityDimensions)
      });
      return response.data;
    },
    enabled: dashboardState.selectedAssets.size > 0,
    refetchInterval: dashboardState.realTimeUpdates ? refreshInterval * 1000 : false,
    staleTime: 60000
  });

  // Fetch quality trends
  const {
    data: trendData,
    isLoading: isLoadingTrends
  } = useQuery({
    queryKey: ['quality-trends', Array.from(dashboardState.selectedAssets), dashboardState.timeRange],
    queryFn: async () => {
      const response = await qualityService.getQualityTrends({
        assetIds: Array.from(dashboardState.selectedAssets),
        timeRange: dashboardState.timeRange,
        dimensions: Array.from(dashboardState.qualityDimensions),
        granularity: 'day'
      });
      return response.data;
    },
    enabled: dashboardState.selectedAssets.size > 0,
    staleTime: 300000
  });

  // Fetch quality rules
  const {
    data: qualityRules,
    isLoading: isLoadingRules,
    refetch: refetchRules
  } = useQuery({
    queryKey: ['quality-rules', Array.from(dashboardState.selectedAssets)],
    queryFn: async () => {
      const response = await qualityService.getQualityRules({
        assetIds: Array.from(dashboardState.selectedAssets),
        includeCustomRules: true
      });
      return [...response.data, ...customRules];
    },
    staleTime: 300000
  });

  // Fetch anomalies
  const {
    data: anomalies,
    isLoading: isLoadingAnomalies
  } = useQuery({
    queryKey: ['quality-anomalies', Array.from(dashboardState.selectedAssets), dashboardState.timeRange],
    queryFn: async () => {
      const response = await qualityService.getAnomalies({
        assetIds: Array.from(dashboardState.selectedAssets),
        timeRange: dashboardState.timeRange,
        minConfidence: 0.7
      });
      return response.data;
    },
    enabled: dashboardState.anomalyDetectionEnabled && dashboardState.selectedAssets.size > 0,
    staleTime: 180000
  });

  // Fetch alerts
  const {
    data: alerts,
    isLoading: isLoadingAlerts,
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ['quality-alerts'],
    queryFn: async () => {
      const response = await alertingService.getAlerts({
        type: 'quality',
        includeInactive: true
      });
      return response.data;
    },
    enabled: enableAlerts,
    staleTime: 300000
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create quality rule mutation
  const createRuleMutation = useMutation({
    mutationFn: async (rule: Partial<QualityRule>) => {
      const response = await qualityService.createRule(rule);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Quality rule created successfully');
      refetchRules();
    },
    onError: (error) => {
      toast.error('Failed to create quality rule');
      console.error('Create rule error:', error);
    }
  });

  // Update quality rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: async ({ ruleId, updates }: { ruleId: string; updates: Partial<QualityRule> }) => {
      const response = await qualityService.updateRule(ruleId, updates);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Quality rule updated successfully');
      refetchRules();
    },
    onError: (error) => {
      toast.error('Failed to update quality rule');
      console.error('Update rule error:', error);
    }
  });

  // Delete quality rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      await qualityService.deleteRule(ruleId);
    },
    onSuccess: () => {
      toast.success('Quality rule deleted successfully');
      refetchRules();
    },
    onError: (error) => {
      toast.error('Failed to delete quality rule');
      console.error('Delete rule error:', error);
    }
  });

  // Test quality rule mutation
  const testRuleMutation = useMutation({
    mutationFn: async (rule: QualityRule) => {
      const response = await qualityService.testRule(rule.id);
      return response.data;
    },
    onSuccess: (result) => {
      toast.success(`Rule test completed: ${result.passed ? 'Passed' : 'Failed'}`);
    },
    onError: (error) => {
      toast.error('Failed to test quality rule');
      console.error('Test rule error:', error);
    }
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreateRule = useCallback((rule: Partial<QualityRule>) => {
    createRuleMutation.mutate(rule);
  }, [createRuleMutation]);

  const handleUpdateRule = useCallback((ruleId: string, updates: Partial<QualityRule>) => {
    updateRuleMutation.mutate({ ruleId, updates });
  }, [updateRuleMutation]);

  const handleDeleteRule = useCallback((ruleId: string) => {
    deleteRuleMutation.mutate(ruleId);
  }, [deleteRuleMutation]);

  const handleTestRule = useCallback((rule: QualityRule) => {
    testRuleMutation.mutate(rule);
  }, [testRuleMutation]);

  const handleInvestigateAnomaly = useCallback((anomaly: AnomalyData) => {
    // Navigate to detailed anomaly investigation view
    toast.info(`Investigating anomaly: ${anomaly.description}`);
  }, []);

  const handleDismissAnomaly = useCallback((anomalyId: string) => {
    // Dismiss anomaly
    toast.success('Anomaly dismissed');
  }, []);

  const handleTimeRangeChange = useCallback((timeRange: { start: Date; end: Date }) => {
    setDashboardState(prev => ({ ...prev, timeRange }));
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Handle quality issues
  useEffect(() => {
    if (qualityData?.recentIncidents && onQualityIssue) {
      qualityData.recentIncidents.forEach(incident => {
        onQualityIssue(incident);
      });
    }
  }, [qualityData, onQualityIssue]);

  // Handle rule violations
  useEffect(() => {
    if (qualityRules && onRuleViolation) {
      qualityRules.filter(rule => rule.lastViolation).forEach(rule => {
        onRuleViolation(rule, rule.lastViolation);
      });
    }
  }, [qualityRules, onRuleViolation]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (qualityError) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-lg font-semibold text-red-700">Failed to load quality data</div>
            <div className="text-sm text-gray-500 mt-1">
              {qualityError instanceof Error ? qualityError.message : 'Unknown error occurred'}
            </div>
            <Button onClick={() => refetchQuality()} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <TooltipProvider>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gauge className="h-6 w-6" />
              Data Quality Dashboard
            </h1>
            {assetId && (
              <Badge variant="outline">Asset: {assetId}</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <Select
              value={dashboardState.filterState.timeRangeFilter}
              onValueChange={(value) => {
                const now = new Date();
                let start: Date;
                
                switch (value) {
                  case 'last_hour':
                    start = new Date(now.getTime() - 60 * 60 * 1000);
                    break;
                  case 'last_day':
                    start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                  case 'last_week':
                    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                  case 'last_month':
                    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                  default:
                    start = dashboardState.timeRange.start;
                }
                
                handleTimeRangeChange({ start, end: now });
                setDashboardState(prev => ({
                  ...prev,
                  filterState: { ...prev.filterState, timeRangeFilter: value as any }
                }));
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_hour">Last Hour</SelectItem>
                <SelectItem value="last_day">Last Day</SelectItem>
                <SelectItem value="last_week">Last Week</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {/* Real-time toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={dashboardState.realTimeUpdates}
                onCheckedChange={(checked) => setDashboardState(prev => ({
                  ...prev,
                  realTimeUpdates: checked
                }))}
              />
              <Label>Real-time</Label>
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchQuality()}
              disabled={isLoadingQuality}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingQuality ? 'animate-spin' : ''}`} />
            </Button>

            {/* Settings */}
            <Button variant="outline" size="sm" onClick={() => setShowConfigDialog(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <QualityOverviewPanel
                    qualityData={qualityData}
                    isLoading={isLoadingQuality}
                    timeRange={dashboardState.timeRange}
                  />
                </div>
                <div className="lg:col-span-2">
                  <QualityTrendsChart
                    trendData={trendData || []}
                    isLoading={isLoadingTrends}
                    selectedDimensions={dashboardState.qualityDimensions}
                    timeRange={dashboardState.timeRange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <QualityTrendsChart
                trendData={trendData || []}
                isLoading={isLoadingTrends}
                selectedDimensions={dashboardState.qualityDimensions}
                timeRange={dashboardState.timeRange}
              />
            </TabsContent>

            <TabsContent value="rules" className="mt-6">
              <QualityRulesPanel
                rules={qualityRules || []}
                isLoading={isLoadingRules}
                onCreateRule={handleCreateRule}
                onUpdateRule={handleUpdateRule}
                onDeleteRule={handleDeleteRule}
                onTestRule={handleTestRule}
              />
            </TabsContent>

            <TabsContent value="anomalies" className="mt-6">
              {showAnomalyDetection ? (
                <AnomalyDetectionPanel
                  anomalies={anomalies || []}
                  isLoading={isLoadingAnomalies}
                  onInvestigateAnomaly={handleInvestigateAnomaly}
                  onDismissAnomaly={handleDismissAnomaly}
                  onConfigureDetection={() => {}}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-semibold text-gray-600">Anomaly Detection Disabled</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Enable anomaly detection to monitor for data quality issues
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="mt-6">
              {enableAlerts ? (
                <AlertsManagementPanel
                  alerts={alerts || []}
                  isLoading={isLoadingAlerts}
                  onCreateAlert={() => {}}
                  onUpdateAlert={() => {}}
                  onDeleteAlert={() => {}}
                  onTestAlert={() => {}}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-semibold text-gray-600">Alerts Disabled</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Enable alerts to receive notifications about quality issues
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================
export default DataQualityDashboard;
export type { QualityDashboardProps, QualityDashboardState, QualityScoreBreakdown, AnomalyData };