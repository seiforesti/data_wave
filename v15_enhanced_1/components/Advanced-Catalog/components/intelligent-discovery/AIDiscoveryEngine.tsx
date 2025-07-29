'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Search,
  Brain,
  Sparkles,
  Zap,
  Database,
  FileText,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  Upload,
  Filter,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Target,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Clock,
  Calendar,
  MapPin,
  Globe,
  Network,
  Layers,
  Grid,
  List,
  Tag,
  Star,
  Bookmark,
  Share2,
  Copy,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  MoreHorizontal,
  Workflow,
  Bot,
  Cpu,
  Monitor,
  Shield,
  Lock,
  Unlock,
  CloudUpload,
  CloudDownload
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, formatDistanceToNow, isToday, startOfDay, endOfDay } from 'date-fns';

// Import hooks and services
import { useCatalogDiscovery } from '../../hooks/useCatalogDiscovery';
import { useCatalogAI } from '../../hooks/useCatalogAI';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';

// Import types
import type {
  DiscoveryJob,
  DiscoveryJobStats,
  DataSource,
  CatalogAsset,
  DiscoveryPattern,
  AIInsight,
  SmartRecommendation,
  DiscoveryConfiguration,
  JobExecution,
  DiscoveryMetrics,
  UserContext,
  SystemContext
} from '../../types';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface AIDiscoveryState {
  activeTab: 'discover' | 'jobs' | 'insights' | 'patterns' | 'config';
  viewMode: 'grid' | 'list' | 'detailed';
  selectedJobs: string[];
  selectedDataSources: string[];
  showAdvancedConfig: boolean;
  isRealTimeMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface DiscoveryJobTemplate {
  id: string;
  name: string;
  description: string;
  type: 'incremental' | 'full' | 'smart' | 'scheduled';
  dataSources: string[];
  configuration: Partial<DiscoveryConfiguration>;
  estimatedDuration: number;
  complexity: 'low' | 'medium' | 'high';
  tags: string[];
}

interface AIRecommendation {
  id: string;
  type: 'discovery' | 'optimization' | 'pattern' | 'quality';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  actions: string[];
  relatedAssets: string[];
  reasoning: string;
}

export const AIDiscoveryEngine: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<AIDiscoveryState>({
    activeTab: 'discover',
    viewMode: 'grid',
    selectedJobs: [],
    selectedDataSources: [],
    showAdvancedConfig: false,
    isRealTimeMode: false,
    autoRefresh: true,
    refreshInterval: 30000
  });

  const [jobTemplates, setJobTemplates] = useState<DiscoveryJobTemplate[]>([]);
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([]);
  const [discoveryPatterns, setDiscoveryPatterns] = useState<DiscoveryPattern[]>([]);
  const [newJobConfig, setNewJobConfig] = useState<Partial<DiscoveryConfiguration>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [jobName, setJobName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Refs for real-time updates
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const jobStreamRef = useRef<EventSource>();

  // ============================================================================
  // HOOKS INTEGRATION
  // ============================================================================
  
  const {
    discoveryJobs,
    activeJobs,
    jobStats,
    dataSources,
    isLoading,
    error,
    createDiscoveryJob,
    startJob,
    pauseJob,
    stopJob,
    deleteJob,
    getJobDetails,
    getDiscoveryMetrics,
    refreshJobs
  } = useCatalogDiscovery();

  const {
    aiInsights,
    smartRecommendations,
    generateInsights,
    getSmartSuggestions,
    getPatternAnalysis,
    analyzeDataSource,
    predictOptimalConfiguration
  } = useCatalogAI();

  const {
    getUsageAnalytics,
    getPerformanceMetrics
  } = useCatalogAnalytics();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const jobMetrics = useMemo(() => {
    if (!discoveryJobs || discoveryJobs.length === 0) return null;
    
    const total = discoveryJobs.length;
    const running = discoveryJobs.filter(job => job.status === 'running').length;
    const completed = discoveryJobs.filter(job => job.status === 'completed').length;
    const failed = discoveryJobs.filter(job => job.status === 'failed').length;
    const scheduled = discoveryJobs.filter(job => job.status === 'scheduled').length;
    
    return {
      total,
      running,
      completed,
      failed,
      scheduled,
      successRate: total > 0 ? (completed / total) * 100 : 0,
      avgDuration: discoveryJobs.reduce((acc, job) => acc + (job.duration || 0), 0) / total
    };
  }, [discoveryJobs]);

  const filteredJobs = useMemo(() => {
    if (!discoveryJobs) return [];
    
    return discoveryJobs.filter(job => {
      if (state.selectedDataSources.length > 0) {
        return job.dataSources?.some(ds => state.selectedDataSources.includes(ds));
      }
      return true;
    });
  }, [discoveryJobs, state.selectedDataSources]);

  const discoveryInsights = useMemo(() => {
    return aiInsights?.filter(insight => insight.category === 'discovery') || [];
  }, [aiInsights]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleCreateJob = useCallback(async () => {
    if (!jobName.trim()) return;
    
    try {
      const jobConfig: Partial<DiscoveryJob> = {
        name: jobName,
        description: jobDescription,
        dataSources: state.selectedDataSources,
        type: selectedTemplate ? jobTemplates.find(t => t.id === selectedTemplate)?.type || 'full' : 'full',
        configuration: {
          ...newJobConfig,
          enableAI: true,
          enableSmartPatterns: true,
          enableAutoClassification: true
        }
      };

      const createdJob = await createDiscoveryJob(jobConfig);
      
      if (createdJob) {
        // Auto-start if configured
        if (newJobConfig.autoStart) {
          await startJob(createdJob.id);
        }
        
        // Reset form
        setJobName('');
        setJobDescription('');
        setSelectedTemplate('');
        setNewJobConfig({});
        setState(prev => ({ ...prev, selectedDataSources: [] }));
      }
    } catch (error) {
      console.error('Failed to create discovery job:', error);
    }
  }, [jobName, jobDescription, state.selectedDataSources, selectedTemplate, newJobConfig, jobTemplates, createDiscoveryJob, startJob]);

  const handleJobAction = useCallback(async (jobId: string, action: 'start' | 'pause' | 'stop' | 'delete') => {
    try {
      switch (action) {
        case 'start':
          await startJob(jobId);
          break;
        case 'pause':
          await pauseJob(jobId);
          break;
        case 'stop':
          await stopJob(jobId);
          break;
        case 'delete':
          await deleteJob(jobId);
          break;
      }
      
      // Refresh jobs after action
      await refreshJobs();
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
    }
  }, [startJob, pauseJob, stopJob, deleteJob, refreshJobs]);

  const handleBulkAction = useCallback(async (action: 'start' | 'pause' | 'stop' | 'delete') => {
    for (const jobId of state.selectedJobs) {
      await handleJobAction(jobId, action);
    }
    setState(prev => ({ ...prev, selectedJobs: [] }));
  }, [state.selectedJobs, handleJobAction]);

  const handleDataSourceToggle = useCallback((dataSourceId: string) => {
    setState(prev => ({
      ...prev,
      selectedDataSources: prev.selectedDataSources.includes(dataSourceId)
        ? prev.selectedDataSources.filter(id => id !== dataSourceId)
        : [...prev.selectedDataSources, dataSourceId]
    }));
  }, []);

  const handleJobSelect = useCallback((jobId: string, isMultiSelect = false) => {
    setState(prev => {
      if (isMultiSelect) {
        const newSelected = prev.selectedJobs.includes(jobId)
          ? prev.selectedJobs.filter(id => id !== jobId)
          : [...prev.selectedJobs, jobId];
        return { ...prev, selectedJobs: newSelected };
      } else {
        return { ...prev, selectedJobs: [jobId] };
      }
    });
  }, []);

  const handleGenerateAIRecommendations = useCallback(async () => {
    try {
      const recommendations = await getSmartSuggestions();
      if (recommendations) {
        const mappedRecommendations: AIRecommendation[] = recommendations.map(rec => ({
          id: rec.id,
          type: rec.type as any || 'discovery',
          title: rec.title,
          description: rec.description,
          confidence: rec.confidence || 0.7,
          impact: rec.impact || 'medium',
          effort: rec.effort || 'medium',
          actions: rec.suggestedActions || [],
          relatedAssets: rec.relatedAssets?.map(a => a.id) || [],
          reasoning: rec.reasoning || ''
        }));
        setAIRecommendations(mappedRecommendations);
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    }
  }, [getSmartSuggestions]);

  const handleOptimizeConfiguration = useCallback(async (dataSourceId: string) => {
    try {
      const optimizedConfig = await predictOptimalConfiguration(dataSourceId);
      if (optimizedConfig) {
        setNewJobConfig(prev => ({
          ...prev,
          ...optimizedConfig
        }));
      }
    } catch (error) {
      console.error('Failed to optimize configuration:', error);
    }
  }, [predictOptimalConfiguration]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    // Load job templates
    const templates: DiscoveryJobTemplate[] = [
      {
        id: 'quick-scan',
        name: 'Quick Scan',
        description: 'Fast discovery with basic metadata extraction',
        type: 'incremental',
        dataSources: [],
        configuration: {
          scanDepth: 2,
          enableAI: false,
          enableSmartPatterns: false,
          enableAutoClassification: false,
          maxExecutionTime: 1800000 // 30 minutes
        },
        estimatedDuration: 30,
        complexity: 'low',
        tags: ['quick', 'basic', 'metadata']
      },
      {
        id: 'comprehensive-discovery',
        name: 'Comprehensive Discovery',
        description: 'Full discovery with AI-powered analysis and classification',
        type: 'full',
        dataSources: [],
        configuration: {
          scanDepth: 5,
          enableAI: true,
          enableSmartPatterns: true,
          enableAutoClassification: true,
          enableDataProfiling: true,
          enableQualityAnalysis: true,
          maxExecutionTime: 7200000 // 2 hours
        },
        estimatedDuration: 120,
        complexity: 'high',
        tags: ['comprehensive', 'ai', 'quality', 'profiling']
      },
      {
        id: 'smart-incremental',
        name: 'Smart Incremental',
        description: 'AI-optimized incremental discovery with pattern learning',
        type: 'smart',
        dataSources: [],
        configuration: {
          scanDepth: 3,
          enableAI: true,
          enableSmartPatterns: true,
          enableAutoClassification: true,
          enableIncrementalOptimization: true,
          maxExecutionTime: 3600000 // 1 hour
        },
        estimatedDuration: 60,
        complexity: 'medium',
        tags: ['smart', 'incremental', 'optimized', 'learning']
      }
    ];
    setJobTemplates(templates);
  }, []);

  useEffect(() => {
    // Setup real-time updates
    if (state.autoRefresh && !refreshIntervalRef.current) {
      refreshIntervalRef.current = setInterval(() => {
        refreshJobs();
      }, state.refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = undefined;
      }
    };
  }, [state.autoRefresh, state.refreshInterval, refreshJobs]);

  useEffect(() => {
    // Load initial data
    const loadInitialData = async () => {
      try {
        await refreshJobs();
        await handleGenerateAIRecommendations();
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [refreshJobs, handleGenerateAIRecommendations]);

  // ============================================================================
  // COMPONENT RENDERS
  // ============================================================================
  
  const DiscoveryInterface = () => (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-3 text-blue-600" />
            AI Discovery Engine
          </h3>
          <p className="text-muted-foreground">
            Intelligent data discovery with machine learning and pattern recognition
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
              >
                {state.autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {state.autoRefresh ? 'Pause auto-refresh' : 'Enable auto-refresh'}
            </TooltipContent>
          </Tooltip>
          <Button variant="outline" size="sm" onClick={refreshJobs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateAIRecommendations}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {jobMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobMetrics.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Running</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{jobMetrics.running}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{jobMetrics.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobMetrics.successRate.toFixed(1)}%</div>
              <Progress value={jobMetrics.successRate} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(jobMetrics.avgDuration / 60)}m</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create New Job */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create Discovery Job
          </CardTitle>
          <CardDescription>
            Configure and launch intelligent data discovery with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Templates */}
          <div>
            <Label className="text-sm font-medium">Job Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {jobTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTemplate(selectedTemplate === template.id ? '' : template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant={
                        template.complexity === 'low' ? 'secondary' :
                        template.complexity === 'medium' ? 'default' : 'destructive'
                      }>
                        {template.complexity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        ~{template.estimatedDuration}m
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {template.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Job Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobName">Job Name</Label>
                <Input
                  id="jobName"
                  placeholder="Enter job name..."
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="jobDescription">Description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Describe the discovery scope and objectives..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Data Sources</Label>
                <ScrollArea className="h-32 border rounded-md p-3">
                  <div className="space-y-2">
                    {dataSources?.map((dataSource) => (
                      <div key={dataSource.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={state.selectedDataSources.includes(dataSource.id)}
                          onCheckedChange={() => handleDataSourceToggle(dataSource.id)}
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{dataSource.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {dataSource.type}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOptimizeConfiguration(dataSource.id)}
                        >
                          <Zap className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Advanced Configuration */}
          <Collapsible open={state.showAdvancedConfig} onOpenChange={(open) => setState(prev => ({ ...prev, showAdvancedConfig: open }))}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Advanced Configuration
                {state.showAdvancedConfig ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Scan Depth</Label>
                  <Select
                    value={String(newJobConfig.scanDepth || 3)}
                    onValueChange={(value) => setNewJobConfig(prev => ({ ...prev, scanDepth: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 - Basic</SelectItem>
                      <SelectItem value="2">Level 2 - Standard</SelectItem>
                      <SelectItem value="3">Level 3 - Detailed</SelectItem>
                      <SelectItem value="4">Level 4 - Comprehensive</SelectItem>
                      <SelectItem value="5">Level 5 - Deep Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Execution Mode</Label>
                  <Select
                    value={newJobConfig.executionMode || 'parallel'}
                    onValueChange={(value) => setNewJobConfig(prev => ({ ...prev, executionMode: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="parallel">Parallel</SelectItem>
                      <SelectItem value="adaptive">Adaptive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Priority</Label>
                  <Select
                    value={newJobConfig.priority || 'medium'}
                    onValueChange={(value) => setNewJobConfig(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">AI Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Enable AI Analysis</Label>
                      <Switch
                        checked={newJobConfig.enableAI ?? true}
                        onCheckedChange={(checked) => setNewJobConfig(prev => ({ ...prev, enableAI: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Smart Pattern Detection</Label>
                      <Switch
                        checked={newJobConfig.enableSmartPatterns ?? true}
                        onCheckedChange={(checked) => setNewJobConfig(prev => ({ ...prev, enableSmartPatterns: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Auto Classification</Label>
                      <Switch
                        checked={newJobConfig.enableAutoClassification ?? true}
                        onCheckedChange={(checked) => setNewJobConfig(prev => ({ ...prev, enableAutoClassification: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Analysis Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Data Profiling</Label>
                      <Switch
                        checked={newJobConfig.enableDataProfiling ?? false}
                        onCheckedChange={(checked) => setNewJobConfig(prev => ({ ...prev, enableDataProfiling: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Quality Analysis</Label>
                      <Switch
                        checked={newJobConfig.enableQualityAnalysis ?? false}
                        onCheckedChange={(checked) => setNewJobConfig(prev => ({ ...prev, enableQualityAnalysis: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Auto Start</Label>
                      <Switch
                        checked={newJobConfig.autoStart ?? false}
                        onCheckedChange={(checked) => setNewJobConfig(prev => ({ ...prev, autoStart: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => {
                setJobName('');
                setJobDescription('');
                setSelectedTemplate('');
                setNewJobConfig({});
                setState(prev => ({ ...prev, selectedDataSources: [] }));
              }}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleCreateJob}
                disabled={!jobName.trim() || state.selectedDataSources.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
              <Button
                onClick={async () => {
                  await handleCreateJob();
                  if (newJobConfig.autoStart !== false) {
                    // Job will auto-start if configured
                  }
                }}
                disabled={!jobName.trim() || state.selectedDataSources.length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Create & Start
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Smart suggestions to optimize your discovery processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiRecommendations.slice(0, 3).map((recommendation) => (
                <Card key={recommendation.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{recommendation.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(recommendation.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant={
                          recommendation.impact === 'high' ? 'destructive' :
                          recommendation.impact === 'medium' ? 'default' : 'secondary'
                        } className="text-xs">
                          {recommendation.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {recommendation.effort} effort
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
                    {recommendation.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recommendation.actions.slice(0, 3).map((action, index) => (
                          <Button key={index} variant="outline" size="sm">
                            <ArrowRight className="h-3 w-3 mr-1" />
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const JobsManagement = () => (
    <div className="space-y-6">
      {/* Header and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Discovery Jobs</h3>
          {state.selectedJobs.length > 0 && (
            <Badge variant="secondary">
              {state.selectedJobs.length} selected
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {state.selectedJobs.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('start')}>
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('pause')}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('stop')}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}
          
          <Select value={state.viewMode} onValueChange={(value) => setState(prev => ({ ...prev, viewMode: value as any }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">
                <div className="flex items-center">
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </div>
              </SelectItem>
              <SelectItem value="list">
                <div className="flex items-center">
                  <List className="h-4 w-4 mr-2" />
                  List
                </div>
              </SelectItem>
              <SelectItem value="detailed">
                <div className="flex items-center">
                  <Layers className="h-4 w-4 mr-2" />
                  Detailed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label className="text-sm">Filter by Data Sources</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dataSources?.map((dataSource) => (
                  <Button
                    key={dataSource.id}
                    variant={state.selectedDataSources.includes(dataSource.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDataSourceToggle(dataSource.id)}
                  >
                    <Database className="h-3 w-3 mr-1" />
                    {dataSource.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className={
        state.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
        state.viewMode === 'list' ? 'space-y-3' :
        'space-y-6'
      }>
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className={`cursor-pointer transition-all ${
              state.selectedJobs.includes(job.id) ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
            }`}
            onClick={() => handleJobSelect(job.id)}
          >
            <CardContent className={state.viewMode === 'detailed' ? 'p-6' : 'p-4'}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    {job.status === 'running' && <Activity className="h-4 w-4 text-blue-600 animate-pulse" />}
                    {job.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {job.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {job.status === 'paused' && <Pause className="h-4 w-4 text-yellow-600" />}
                    {job.status === 'scheduled' && <Clock className="h-4 w-4 text-gray-600" />}
                    <h4 className="font-medium">{job.name}</h4>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Checkbox
                    checked={state.selectedJobs.includes(job.id)}
                    onCheckedChange={() => handleJobSelect(job.id, true)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40" align="end">
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleJobAction(job.id, 'start')}
                          disabled={job.status === 'running'}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleJobAction(job.id, 'pause')}
                          disabled={job.status !== 'running'}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleJobAction(job.id, 'stop')}
                          disabled={job.status === 'completed' || job.status === 'failed'}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                        <Separator />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-red-600"
                          onClick={() => handleJobAction(job.id, 'delete')}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span>Progress</span>
                  <span>{job.progress || 0}%</span>
                </div>
                <Progress value={job.progress || 0} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    job.status === 'running' ? 'default' :
                    job.status === 'completed' ? 'secondary' :
                    job.status === 'failed' ? 'destructive' : 'outline'
                  } className="text-xs">
                    {job.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{job.type}</Badge>
                </div>
                
                {state.viewMode === 'detailed' && (
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Database className="h-3 w-3 mr-1" />
                      {job.dataSources?.length || 0}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {job.duration ? `${Math.round(job.duration / 60)}m` : '-'}
                    </span>
                  </div>
                )}
              </div>
              
              {state.viewMode === 'detailed' && job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {job.tags.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value as any }))}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="discover">
              <Brain className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Activity className="h-4 w-4 mr-2" />
              Jobs ({filteredJobs.length})
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Sparkles className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="patterns">
              <Network className="h-4 w-4 mr-2" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <DiscoveryInterface />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsManagement />
          </TabsContent>

          <TabsContent value="insights">
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">AI Insights Coming Soon</h3>
              <p className="text-muted-foreground">
                Advanced pattern analysis and intelligent recommendations
              </p>
            </div>
          </TabsContent>

          <TabsContent value="patterns">
            <div className="text-center py-12">
              <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Pattern Analysis Coming Soon</h3>
              <p className="text-muted-foreground">
                Discover data patterns and relationships automatically
              </p>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <div className="text-center py-12">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Configuration Coming Soon</h3>
              <p className="text-muted-foreground">
                Advanced discovery engine configuration options
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default AIDiscoveryEngine;