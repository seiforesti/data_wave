// ============================================================================
// DATA QUALITY DASHBOARD - QUALITY MONITORING & ASSESSMENT (2200+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Data Quality Dashboard Component
// Real-time quality monitoring, automated quality checks, anomaly detection,
// quality scoring, remediation workflows, and AI-powered quality insights
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { AlertTriangle, Search, Filter, Download, Upload, Share2, Settings, Info, Eye, EyeOff, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Move, Maximize2, Minimize2, Clock, Users, MessageSquare, Bookmark, Star, Edit3, Save, X, Plus, Minus, RefreshCw, Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, Activity, Database, FileText, Code, BarChart3, PieChart, LineChart, Layers, Network, TreePine, Workflow, Route, MapPin, Calendar as CalendarIcon, Timer, UserCheck, Flag, Hash, Link, Globe, Shield, Lock, Unlock, Key, Award, Zap, Sparkles, Brain, Cpu, HardDrive, Cloud, Server, Wifi, Radio, Bluetooth, Cable, Usb, Monitor, Smartphone, Tablet, Laptop, Watch, Gamepad2, Headphones, Camera, Mic, Speaker, Volume2, VolumeX, MoreHorizontal, MoreVertical, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUp, ChevronsDown, Home, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';

// Chart components
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, RadialBarChart, RadialBar, ScatterChart, Scatter, ComposedChart } from 'recharts';

// Import types and services
import type {
  DataQualityMetrics,
  QualityRule,
  QualityAssessment,
  QualityReport,
  QualityTrend,
  QualityAlert,
  QualityProfile,
  QualityDimension,
  AnomalyDetection,
  QualityRemediation,
  QualityBenchmark,
  DataAssetQuality,
  QualityConfiguration,
  QualityValidation,
  QualityDashboardConfig,
  QualityInsight,
  QualityScorecard
} from '../../types/catalog-quality.types';

import {
  enterpriseCatalogService,
  dataQualityService,
  qualityMetricsService,
  qualityRulesService,
  qualityAssessmentService,
  qualityRemediationService,
  qualityAnalyticsService,
  anomalyDetectionService,
  qualityBenchmarkService
} from '../../services/enterprise-catalog.service';

import {
  QUALITY_DIMENSIONS,
  QUALITY_METRICS_CONFIG,
  QUALITY_THRESHOLDS,
  QUALITY_ALERT_TYPES,
  ANOMALY_DETECTION_CONFIG,
  QUALITY_SCORING_METHODS,
  REMEDIATION_STRATEGIES,
  BENCHMARK_TYPES,
  QUALITY_CHART_COLORS
} from '../../constants/catalog-quality.constants';

import {
  useDataQuality,
  useQualityMetrics,
  useQualityRules,
  useQualityAssessment,
  useQualityTrends,
  useQualityAlerts,
  useAnomalyDetection,
  useQualityRemediation,
  useQualityBenchmarks,
  useQualityInsights,
  useQualityValidation,
  useQualityReports
} from '../../hooks/useAdvancedQuality';

// ============================================================================
// QUALITY OVERVIEW METRICS COMPONENT
// ============================================================================
interface QualityOverviewMetricsProps {
  metrics: DataQualityMetrics | null;
  isLoading: boolean;
  timeRange: string;
  onRefresh: () => void;
  className?: string;
}

const QualityOverviewMetrics: React.FC<QualityOverviewMetricsProps> = ({
  metrics,
  isLoading,
  timeRange,
  onRefresh,
  className
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const qualityScoreColor = useMemo(() => {
    if (!metrics?.overallScore) return 'text-muted-foreground';
    if (metrics.overallScore >= 90) return 'text-green-600';
    if (metrics.overallScore >= 75) return 'text-yellow-600';
    return 'text-red-600';
  }, [metrics?.overallScore]);

  const formatMetricValue = (value: number, type: string) => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'count':
        return value.toLocaleString();
      case 'score':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-8 bg-muted rounded mb-1" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No quality metrics available</p>
            <Button size="sm" variant="outline" onClick={onRefresh} className="mt-2">
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metricCards = [
    {
      id: 'overall',
      title: 'Overall Quality Score',
      value: metrics.overallScore,
      type: 'score',
      icon: Award,
      change: metrics.scoreChange,
      color: qualityScoreColor
    },
    {
      id: 'completeness',
      title: 'Completeness',
      value: metrics.completeness,
      type: 'percentage',
      icon: CheckCircle,
      change: metrics.completenessChange,
      color: metrics.completeness >= 95 ? 'text-green-600' : metrics.completeness >= 80 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      id: 'accuracy',
      title: 'Accuracy',
      value: metrics.accuracy,
      type: 'percentage',
      icon: Target,
      change: metrics.accuracyChange,
      color: metrics.accuracy >= 98 ? 'text-green-600' : metrics.accuracy >= 90 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      id: 'consistency',
      title: 'Consistency',
      value: metrics.consistency,
      type: 'percentage',
      icon: Shield,
      change: metrics.consistencyChange,
      color: metrics.consistency >= 95 ? 'text-green-600' : metrics.consistency >= 85 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      id: 'validity',
      title: 'Validity',
      value: metrics.validity,
      type: 'percentage',
      icon: CheckCircle,
      change: metrics.validityChange,
      color: metrics.validity >= 98 ? 'text-green-600' : metrics.validity >= 90 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      id: 'uniqueness',
      title: 'Uniqueness',
      value: metrics.uniqueness,
      type: 'percentage',
      icon: Hash,
      change: metrics.uniquenessChange,
      color: metrics.uniqueness >= 95 ? 'text-green-600' : metrics.uniqueness >= 85 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      id: 'timeliness',
      title: 'Timeliness',
      value: metrics.timeliness,
      type: 'percentage',
      icon: Clock,
      change: metrics.timelinessChange,
      color: metrics.timeliness >= 90 ? 'text-green-600' : metrics.timeliness >= 75 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      id: 'totalAssets',
      title: 'Monitored Assets',
      value: metrics.totalAssets,
      type: 'count',
      icon: Database,
      change: metrics.assetsChange,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {metricCards.map((metric, index) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMetric === metric.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                {metric.change !== undefined && (
                  <div className={`flex items-center text-xs ${
                    metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {metric.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                     metric.change < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}
                  </div>
                )}
              </div>
              
              <div className={`text-2xl font-bold mb-1 ${metric.color}`}>
                {formatMetricValue(metric.value, metric.type)}
              </div>
              
              <p className="text-xs text-muted-foreground">{metric.title}</p>
              
              {metric.type === 'percentage' && (
                <Progress 
                  value={metric.value} 
                  className="h-1 mt-2"
                  indicatorClassName={
                    metric.value >= 95 ? 'bg-green-500' : 
                    metric.value >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// QUALITY TREND CHART COMPONENT
// ============================================================================
interface QualityTrendChartProps {
  trends: QualityTrend[];
  selectedDimensions: string[];
  timeRange: string;
  isLoading: boolean;
  className?: string;
}

const QualityTrendChart: React.FC<QualityTrendChartProps> = ({
  trends,
  selectedDimensions,
  timeRange,
  isLoading,
  className
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [showDataPoints, setShowDataPoints] = useState(true);

  const chartData = useMemo(() => {
    if (!trends?.length) return [];

    const groupedData: Record<string, any> = {};

    trends.forEach(trend => {
      const date = new Date(trend.timestamp).toLocaleDateString();
      if (!groupedData[date]) {
        groupedData[date] = { date };
      }
      groupedData[date][trend.dimension] = trend.value;
    });

    return Object.values(groupedData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [trends]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    const Chart = chartType === 'line' ? RechartsLineChart : 
                 chartType === 'area' ? AreaChart : RechartsBarChart;

    return (
      <Chart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          fontSize={12}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tick={{ fontSize: 12 }}
          domain={[0, 100]}
        />
        <RechartsTooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        />
        <Legend />
        
        {selectedDimensions.map((dimension, index) => {
          const color = QUALITY_CHART_COLORS[index % QUALITY_CHART_COLORS.length];
          
          if (chartType === 'line') {
            return (
              <Line
                key={dimension}
                type="monotone"
                dataKey={dimension}
                stroke={color}
                strokeWidth={2}
                dot={showDataPoints ? { fill: color, strokeWidth: 2, r: 3 } : false}
                name={dimension.charAt(0).toUpperCase() + dimension.slice(1)}
              />
            );
          } else if (chartType === 'area') {
            return (
              <Area
                key={dimension}
                type="monotone"
                dataKey={dimension}
                stroke={color}
                fill={color}
                fillOpacity={0.3}
                name={dimension.charAt(0).toUpperCase() + dimension.slice(1)}
              />
            );
          } else {
            return (
              <Bar
                key={dimension}
                dataKey={dimension}
                fill={color}
                name={dimension.charAt(0).toUpperCase() + dimension.slice(1)}
              />
            );
          }
        })}
      </Chart>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Quality Trends</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={showDataPoints ? "default" : "outline"}
                  onClick={() => setShowDataPoints(!showDataPoints)}
                  className="h-8 w-8 p-0"
                >
                  <Circle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle data points</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <LineChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No trend data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// QUALITY RULES MANAGEMENT COMPONENT
// ============================================================================
interface QualityRulesManagementProps {
  rules: QualityRule[];
  onCreateRule: (rule: Omit<QualityRule, 'id' | 'createdAt'>) => void;
  onUpdateRule: (id: string, rule: Partial<QualityRule>) => void;
  onDeleteRule: (id: string) => void;
  onRunRule: (id: string) => void;
  isLoading: boolean;
  className?: string;
}

const QualityRulesManagement: React.FC<QualityRulesManagementProps> = ({
  rules,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onRunRule,
  isLoading,
  className
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<QualityRule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Form state for creating/editing rules
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    type: 'completeness',
    dimension: 'completeness',
    condition: '',
    threshold: 95,
    severity: 'medium',
    enabled: true,
    assetTypes: ['table'],
    schedule: 'daily'
  });

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rule.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || rule.type === selectedType;
      const matchesSeverity = selectedSeverity === 'all' || rule.severity === selectedSeverity;
      
      return matchesSearch && matchesType && matchesSeverity;
    });
  }, [rules, searchQuery, selectedType, selectedSeverity]);

  const handleCreateRule = () => {
    onCreateRule(newRule);
    setNewRule({
      name: '',
      description: '',
      type: 'completeness',
      dimension: 'completeness',
      condition: '',
      threshold: 95,
      severity: 'medium',
      enabled: true,
      assetTypes: ['table'],
      schedule: 'daily'
    });
    setShowCreateDialog(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'completeness': return CheckCircle;
      case 'accuracy': return Target;
      case 'consistency': return Shield;
      case 'validity': return CheckCircle;
      case 'uniqueness': return Hash;
      case 'timeliness': return Clock;
      default: return AlertCircle;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Quality Rules</CardTitle>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-3 w-3 mr-2" />
            Create Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {QUALITY_DIMENSIONS.map(dimension => (
                <SelectItem key={dimension.id} value={dimension.id}>
                  {dimension.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rules List */}
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {filteredRules.map((rule) => {
              const TypeIcon = getTypeIcon(rule.type);
              
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">{rule.name}</span>
                      <Badge variant={getSeverityColor(rule.severity)} className="text-xs">
                        {rule.severity}
                      </Badge>
                      {!rule.enabled && (
                        <Badge variant="secondary" className="text-xs">Disabled</Badge>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onRunRule(rule.id)}>
                          <Play className="h-3 w-3 mr-2" />
                          Run Now
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingRule(rule)}>
                          <Edit3 className="h-3 w-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateRule(rule.id, { enabled: !rule.enabled })}
                        >
                          {rule.enabled ? (
                            <>
                              <Pause className="h-3 w-3 mr-2" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-2" />
                              Enable
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteRule(rule.id)}
                          className="text-red-600"
                        >
                          <X className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">{rule.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Threshold: {rule.threshold}%</span>
                    <span>Schedule: {rule.schedule}</span>
                    <span>Assets: {rule.assetTypes.join(', ')}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Create Rule Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Quality Rule</DialogTitle>
              <DialogDescription>
                Define a new quality rule to monitor data quality metrics
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Rule Name</Label>
                  <Input
                    placeholder="Enter rule name"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Quality Dimension</Label>
                  <Select
                    value={newRule.dimension}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, dimension: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALITY_DIMENSIONS.map(dimension => (
                        <SelectItem key={dimension.id} value={dimension.id}>
                          {dimension.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea
                  placeholder="Describe what this rule checks"
                  value={newRule.description}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Threshold (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Severity</Label>
                  <Select
                    value={newRule.severity}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Schedule</Label>
                  <Select
                    value={newRule.schedule}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, schedule: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Condition</Label>
                <Textarea
                  placeholder="Define the rule condition (e.g., completeness > 95%)"
                  value={newRule.condition}
                  onChange={(e) => setNewRule(prev => ({ ...prev, condition: e.target.value }))}
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newRule.enabled}
                  onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, enabled: checked }))}
                />
                <Label className="text-xs">Enable rule</Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRule} disabled={!newRule.name || !newRule.condition}>
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// QUALITY ALERTS COMPONENT
// ============================================================================
interface QualityAlertsProps {
  alerts: QualityAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
  onCreateRemediation: (alertId: string) => void;
  isLoading: boolean;
  className?: string;
}

const QualityAlerts: React.FC<QualityAlertsProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
  onCreateRemediation,
  isLoading,
  className
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');

  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = alerts.filter(alert => {
      const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus;
      return matchesSeverity && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'timestamp') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity as keyof typeof severityOrder] - 
               severityOrder[a.severity as keyof typeof severityOrder];
      }
    });
  }, [alerts, selectedSeverity, selectedStatus, sortBy]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertCircle;
      case 'medium': return Info;
      case 'low': return Info;
      default: return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'acknowledged': return 'default';
      case 'resolved': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Quality Alerts</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Time</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : filteredAndSortedAlerts.length > 0 ? (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredAndSortedAlerts.map((alert) => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <SeverityIcon className={`h-4 w-4 ${getSeverityColor(alert.severity)}`} />
                        <span className="font-medium text-sm">{alert.title}</span>
                        <Badge variant={getStatusColor(alert.status)} className="text-xs">
                          {alert.status}
                        </Badge>
                      </div>
                      
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Asset: {alert.assetName}</span>
                        <span>•</span>
                        <span>Rule: {alert.ruleName}</span>
                      </div>
                      
                      {alert.status === 'active' && (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAcknowledgeAlert(alert.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCreateRemediation(alert.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Remediate
                          </Button>
                        </div>
                      )}
                      
                      {alert.status === 'acknowledged' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onResolveAlert(alert.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-green-500" />
              <p className="text-sm">No quality alerts</p>
              <p className="text-xs">All systems are running smoothly</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// ASSET QUALITY SCORECARD COMPONENT
// ============================================================================
interface AssetQualityScoreCardProps {
  assets: DataAssetQuality[];
  onSelectAsset: (assetId: string) => void;
  selectedAsset: string | null;
  isLoading: boolean;
  className?: string;
}

const AssetQualityScorecard: React.FC<AssetQualityScoreCardProps> = ({
  assets,
  onSelectAsset,
  selectedAsset,
  isLoading,
  className
}) => {
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'issues'>('score');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || asset.type === filterType;
      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.overallScore - a.overallScore;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'issues':
          return b.issuesCount - a.issuesCount;
        default:
          return 0;
      }
    });
  }, [assets, searchQuery, filterType, sortBy]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Asset Quality Scorecard</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="issues">Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="table">Tables</SelectItem>
              <SelectItem value="view">Views</SelectItem>
              <SelectItem value="file">Files</SelectItem>
              <SelectItem value="stream">Streams</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {filteredAndSortedAssets.map((asset) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                  selectedAsset === asset.id ? 'ring-2 ring-primary bg-primary/5' : 'bg-card'
                }`}
                onClick={() => onSelectAsset(asset.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">{asset.name}</span>
                    <Badge variant="outline" className="text-xs">{asset.type}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getScoreVariant(asset.overallScore)} className="text-xs">
                      {asset.overallScore.toFixed(1)}
                    </Badge>
                    {asset.issuesCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {asset.issuesCount} issues
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className={`font-medium ${getScoreColor(asset.completeness)}`}>
                      {asset.completeness.toFixed(0)}%
                    </div>
                    <div className="text-muted-foreground">Complete</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${getScoreColor(asset.accuracy)}`}>
                      {asset.accuracy.toFixed(0)}%
                    </div>
                    <div className="text-muted-foreground">Accurate</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${getScoreColor(asset.consistency)}`}>
                      {asset.consistency.toFixed(0)}%
                    </div>
                    <div className="text-muted-foreground">Consistent</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${getScoreColor(asset.timeliness)}`}>
                      {asset.timeliness.toFixed(0)}%
                    </div>
                    <div className="text-muted-foreground">Timely</div>
                  </div>
                </div>
                
                <Progress 
                  value={asset.overallScore} 
                  className="h-1 mt-2"
                  indicatorClassName={
                    asset.overallScore >= 90 ? 'bg-green-500' : 
                    asset.overallScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                  }
                />
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN DATA QUALITY DASHBOARD COMPONENT
// ============================================================================
export interface DataQualityDashboardProps {
  initialAssetId?: string;
  className?: string;
}

export const DataQualityDashboard: React.FC<DataQualityDashboardProps> = ({
  initialAssetId,
  className
}) => {
  // State management
  const [selectedAsset, setSelectedAsset] = useState<string | null>(initialAssetId || null);
  const [activeView, setActiveView] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedDimensions, setSelectedDimensions] = useState(['completeness', 'accuracy', 'consistency']);
  const [dashboardConfig, setDashboardConfig] = useState<QualityDashboardConfig>({
    refreshInterval: 30000,
    autoRefresh: true,
    showAlerts: true,
    alertThreshold: 'medium',
    chartType: 'line',
    metricsLayout: 'grid'
  });

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs
  const queryClient = useQueryClient();

  // Custom hooks for data management
  const {
    data: qualityMetrics,
    isLoading: isMetricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQualityMetrics({
    assetId: selectedAsset,
    timeRange,
    dimensions: selectedDimensions
  });

  const {
    data: qualityTrends,
    isLoading: isTrendsLoading
  } = useQualityTrends({
    assetId: selectedAsset,
    timeRange,
    dimensions: selectedDimensions
  });

  const {
    data: qualityRules,
    isLoading: isRulesLoading,
    mutate: createRule,
    updateRule,
    deleteRule
  } = useQualityRules(selectedAsset);

  const {
    data: qualityAlerts,
    isLoading: isAlertsLoading,
    mutate: acknowledgeAlert,
    resolveAlert
  } = useQualityAlerts(selectedAsset);

  const {
    data: assetQuality,
    isLoading: isAssetsLoading
  } = useDataQuality({
    filters: {
      timeRange,
      includeMetrics: true,
      includeTrends: true
    }
  });

  const {
    data: qualityInsights,
    isLoading: isInsightsLoading
  } = useQualityInsights(selectedAsset);

  const {
    data: anomalies,
    isLoading: isAnomaliesLoading
  } = useAnomalyDetection({
    assetId: selectedAsset,
    timeRange,
    dimensions: selectedDimensions
  });

  const {
    data: remediationTasks,
    mutate: createRemediation
  } = useQualityRemediation(selectedAsset);

  const {
    mutate: runQualityAssessment,
    isLoading: isAssessmentLoading
  } = useQualityAssessment();

  const {
    mutate: generateReport
  } = useQualityReports();

  // Event handlers
  const handleAssetSelect = useCallback((assetId: string) => {
    setSelectedAsset(assetId);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchMetrics(),
        queryClient.invalidateQueries({ queryKey: ['quality-trends'] }),
        queryClient.invalidateQueries({ queryKey: ['quality-alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['quality-rules'] })
      ]);
      toast.success('Quality data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchMetrics, queryClient]);

  const handleTimeRangeChange = useCallback((range: string) => {
    setTimeRange(range);
  }, []);

  const handleDimensionToggle = useCallback((dimension: string) => {
    setSelectedDimensions(prev => 
      prev.includes(dimension)
        ? prev.filter(d => d !== dimension)
        : [...prev, dimension]
    );
  }, []);

  const handleCreateRule = useCallback((rule: Omit<QualityRule, 'id' | 'createdAt'>) => {
    createRule(rule, {
      onSuccess: () => {
        toast.success('Quality rule created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create quality rule');
      }
    });
  }, [createRule]);

  const handleUpdateRule = useCallback((id: string, rule: Partial<QualityRule>) => {
    updateRule({ id, updates: rule }, {
      onSuccess: () => {
        toast.success('Quality rule updated');
      },
      onError: (error) => {
        toast.error('Failed to update rule');
      }
    });
  }, [updateRule]);

  const handleDeleteRule = useCallback((id: string) => {
    deleteRule(id, {
      onSuccess: () => {
        toast.success('Quality rule deleted');
      },
      onError: (error) => {
        toast.error('Failed to delete rule');
      }
    });
  }, [deleteRule]);

  const handleRunRule = useCallback((id: string) => {
    runQualityAssessment({
      ruleId: id,
      assetId: selectedAsset
    }, {
      onSuccess: () => {
        toast.success('Quality assessment started');
      },
      onError: (error) => {
        toast.error('Failed to run assessment');
      }
    });
  }, [runQualityAssessment, selectedAsset]);

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    acknowledgeAlert(alertId, {
      onSuccess: () => {
        toast.success('Alert acknowledged');
      },
      onError: (error) => {
        toast.error('Failed to acknowledge alert');
      }
    });
  }, [acknowledgeAlert]);

  const handleResolveAlert = useCallback((alertId: string) => {
    resolveAlert(alertId, {
      onSuccess: () => {
        toast.success('Alert resolved');
      },
      onError: (error) => {
        toast.error('Failed to resolve alert');
      }
    });
  }, [resolveAlert]);

  const handleCreateRemediation = useCallback((alertId: string) => {
    createRemediation({
      alertId,
      strategy: 'automated',
      priority: 'high'
    }, {
      onSuccess: () => {
        toast.success('Remediation task created');
      },
      onError: (error) => {
        toast.error('Failed to create remediation');
      }
    });
  }, [createRemediation]);

  const handleGenerateReport = useCallback(() => {
    generateReport({
      assetId: selectedAsset,
      timeRange,
      includeMetrics: true,
      includeTrends: true,
      includeRecommendations: true
    }, {
      onSuccess: () => {
        toast.success('Quality report generated');
      },
      onError: (error) => {
        toast.error('Failed to generate report');
      }
    });
  }, [generateReport, selectedAsset, timeRange]);

  // Auto-refresh effect
  useEffect(() => {
    if (!dashboardConfig.autoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, dashboardConfig.refreshInterval);

    return () => clearInterval(interval);
  }, [dashboardConfig.autoRefresh, dashboardConfig.refreshInterval, handleRefresh]);

  // Loading state
  if (isMetricsLoading && !qualityMetrics) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quality dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Data Quality Dashboard
          </h1>
          
          {selectedAsset && (
            <Badge variant="outline">
              Asset: {assetQuality?.find(a => a.id === selectedAsset)?.name || selectedAsset}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleGenerateReport}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quality Dimensions Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Quality Dimensions:</Label>
            <div className="flex items-center gap-2">
              {QUALITY_DIMENSIONS.map((dimension) => (
                <div key={dimension.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={dimension.id}
                    checked={selectedDimensions.includes(dimension.id)}
                    onCheckedChange={() => handleDimensionToggle(dimension.id)}
                  />
                  <Label htmlFor={dimension.id} className="text-sm">{dimension.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Dashboard Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeView === 'overview' && (
            <>
              {/* Quality Metrics Overview */}
              <QualityOverviewMetrics
                metrics={qualityMetrics}
                isLoading={isMetricsLoading}
                timeRange={timeRange}
                onRefresh={handleRefresh}
              />

              {/* Quality Trends Chart */}
              <QualityTrendChart
                trends={qualityTrends || []}
                selectedDimensions={selectedDimensions}
                timeRange={timeRange}
                isLoading={isTrendsLoading}
              />

              {/* Quality Insights & Anomalies */}
              {(qualityInsights || anomalies) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {qualityInsights && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          AI Quality Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-32">
                          <div className="space-y-2">
                            {qualityInsights.recommendations.map((insight, index) => (
                              <div key={index} className="p-2 bg-muted rounded text-sm">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="h-3 w-3 text-blue-500 mt-0.5" />
                                  <span>{insight}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {anomalies && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Anomaly Detection
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-32">
                          <div className="space-y-2">
                            {anomalies.detectedAnomalies.map((anomaly, index) => (
                              <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                                <div className="font-medium text-red-800">{anomaly.type}</div>
                                <div className="text-red-600 text-xs">{anomaly.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Confidence: {(anomaly.confidence * 100).toFixed(1)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}

          {activeView === 'assets' && (
            <AssetQualityScorecard
              assets={assetQuality || []}
              onSelectAsset={handleAssetSelect}
              selectedAsset={selectedAsset}
              isLoading={isAssetsLoading}
            />
          )}

          {activeView === 'rules' && (
            <QualityRulesManagement
              rules={qualityRules || []}
              onCreateRule={handleCreateRule}
              onUpdateRule={handleUpdateRule}
              onDeleteRule={handleDeleteRule}
              onRunRule={handleRunRule}
              isLoading={isRulesLoading}
            />
          )}

          {activeView === 'alerts' && (
            <QualityAlerts
              alerts={qualityAlerts || []}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              onCreateRemediation={handleCreateRemediation}
              isLoading={isAlertsLoading}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                size="sm"
                className="w-full justify-start"
                onClick={() => runQualityAssessment({ assetId: selectedAsset })}
                disabled={isAssessmentLoading || !selectedAsset}
              >
                <Play className="h-3 w-3 mr-2" />
                Run Assessment
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={handleGenerateReport}
                disabled={!selectedAsset}
              >
                <FileText className="h-3 w-3 mr-2" />
                Generate Report
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveView('rules')}
              >
                <Plus className="h-3 w-3 mr-2" />
                Create Rule
              </Button>
            </CardContent>
          </Card>

          {/* Recent Alerts Summary */}
          {qualityAlerts && qualityAlerts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Alert Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['critical', 'high', 'medium', 'low'].map(severity => {
                    const count = qualityAlerts.filter(alert => 
                      alert.severity === severity && alert.status === 'active'
                    ).length;
                    
                    if (count === 0) return null;
                    
                    return (
                      <div key={severity} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{severity}</span>
                        <Badge 
                          variant={severity === 'critical' || severity === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Score Distribution */}
          {assetQuality && assetQuality.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: 'Excellent (90-100)', min: 90, max: 100, color: 'bg-green-500' },
                    { label: 'Good (75-89)', min: 75, max: 89, color: 'bg-yellow-500' },
                    { label: 'Poor (0-74)', min: 0, max: 74, color: 'bg-red-500' }
                  ].map(range => {
                    const count = assetQuality.filter(asset => 
                      asset.overallScore >= range.min && asset.overallScore <= range.max
                    ).length;
                    const percentage = (count / assetQuality.length) * 100;
                    
                    return (
                      <div key={range.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{range.label}</span>
                          <span>{count} assets</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${range.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dashboard Settings</DialogTitle>
            <DialogDescription>
              Configure your quality dashboard preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Auto Refresh</Label>
              <Switch
                checked={dashboardConfig.autoRefresh}
                onCheckedChange={(checked) => 
                  setDashboardConfig(prev => ({ ...prev, autoRefresh: checked }))
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label>Refresh Interval</Label>
              <Select
                value={dashboardConfig.refreshInterval.toString()}
                onValueChange={(value) => 
                  setDashboardConfig(prev => ({ ...prev, refreshInterval: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10000">10 seconds</SelectItem>
                  <SelectItem value="30000">30 seconds</SelectItem>
                  <SelectItem value="60000">1 minute</SelectItem>
                  <SelectItem value="300000">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Alert Threshold</Label>
              <Select
                value={dashboardConfig.alertThreshold}
                onValueChange={(value: any) => 
                  setDashboardConfig(prev => ({ ...prev, alertThreshold: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical Only</SelectItem>
                  <SelectItem value="high">High & Above</SelectItem>
                  <SelectItem value="medium">Medium & Above</SelectItem>
                  <SelectItem value="low">All Alerts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataQualityDashboard;