/**
 * AI Discovery Engine Component
 * ============================
 * 
 * Advanced AI-powered data discovery engine that provides:
 * - Intelligent schema discovery with ML classification
 * - Automated data profiling and quality assessment
 * - Smart tagging and metadata enrichment
 * - Multi-source data integration orchestration
 * - Schema evolution tracking and management
 * - Incremental discovery optimization
 * - Real-time discovery monitoring
 * - Predictive discovery recommendations
 * 
 * Backend Integration:
 * - Maps to enterprise_catalog_service.py discovery methods
 * - Uses IntelligentDataAsset and discovery models
 * - Integrates with AI/ML classification services
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Brain, 
  Database, 
  Zap, 
  Eye, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter,
  Download,
  Upload,
  Layers,
  Network,
  Sparkles,
  Target,
  BarChart3,
  Activity,
  Cpu,
  HardDrive,
  Users,
  Shield,
  Lightbulb,
  Workflow
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { useAssetDiscovery, useDiscoveryJob, useDiscoveryHistory } from '../../hooks/useCatalogAssets';
import { 
  IntelligentDataAsset, 
  DiscoveryJob, 
  DiscoveryResult, 
  AssetType, 
  AssetStatus,
  DataSource,
  DiscoveryMethod,
  DiscoveryStatus
} from '../../types/catalog-core.types';
import { 
  ASSET_TYPE_CONFIG, 
  DISCOVERY_CONFIG, 
  UI_CONFIG,
  QUALITY_CONFIG 
} from '../../constants/catalog-constants';
import { 
  calculateAssetHealthScore, 
  getAssetTypeInfo, 
  formatFileSize, 
  formatRelativeTime 
} from '../../utils/catalog-utils';

// ========================= INTERFACES =========================

interface DiscoveryConfiguration {
  methods: DiscoveryMethod[];
  dataSources: string[];
  includeMetadata: boolean;
  includeProfiler: boolean;
  includeClassification: boolean;
  includeQuality: boolean;
  batchSize: number;
  maxConcurrency: number;
  aiConfidenceThreshold: number;
  enableIncrementalDiscovery: boolean;
  scheduleEnabled: boolean;
  scheduleInterval: string;
  notificationEnabled: boolean;
  customRules: string[];
}

interface DiscoveryMetrics {
  totalAssets: number;
  discoveredAssets: number;
  classifiedAssets: number;
  profiledAssets: number;
  qualityAssessed: number;
  avgConfidenceScore: number;
  processingTime: number;
  errorRate: number;
  successRate: number;
  resourceUtilization: number;
}

interface DiscoveryInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'recommendation' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  suggestedActions: string[];
  relatedAssets: string[];
  createdAt: string;
}

// ========================= MAIN COMPONENT =========================

export const AIDiscoveryEngine: React.FC = () => {
  // ========================= STATE MANAGEMENT =========================
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [discoveryConfig, setDiscoveryConfig] = useState<DiscoveryConfiguration>({
    methods: [DiscoveryMethod.AUTOMATED_SCAN, DiscoveryMethod.PATTERN_MATCHING],
    dataSources: [],
    includeMetadata: true,
    includeProfiler: true,
    includeClassification: true,
    includeQuality: true,
    batchSize: DISCOVERY_CONFIG.BATCH_SIZE,
    maxConcurrency: DISCOVERY_CONFIG.MAX_CONCURRENT_JOBS,
    aiConfidenceThreshold: DISCOVERY_CONFIG.AI_CONFIDENCE_THRESHOLD,
    enableIncrementalDiscovery: true,
    scheduleEnabled: false,
    scheduleInterval: '24h',
    notificationEnabled: true,
    customRules: []
  });

  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [discoveryFilter, setDiscoveryFilter] = useState<string>('');
  const [isDiscoveryRunning, setIsDiscoveryRunning] = useState<boolean>(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // ========================= HOOKS =========================
  
  const {
    triggerDiscovery,
    isLoading: isDiscoveryLoading,
    error: discoveryError
  } = useAssetDiscovery();

  const {
    job: currentJob,
    isLoading: isJobLoading,
    error: jobError
  } = useDiscoveryJob(selectedJob || '');

  const {
    history: discoveryHistory,
    isLoading: isHistoryLoading,
    error: historyError
  } = useDiscoveryHistory({
    limit: 50,
    includeMetrics: true
  });

  // ========================= COMPUTED VALUES =========================
  
  const discoveryMetrics = useMemo<DiscoveryMetrics>(() => {
    if (!discoveryHistory?.length) {
      return {
        totalAssets: 0,
        discoveredAssets: 0,
        classifiedAssets: 0,
        profiledAssets: 0,
        qualityAssessed: 0,
        avgConfidenceScore: 0,
        processingTime: 0,
        errorRate: 0,
        successRate: 0,
        resourceUtilization: 0
      };
    }

    const recentJobs = discoveryHistory.slice(0, 10);
    const totalJobs = recentJobs.length;
    const successfulJobs = recentJobs.filter(job => job.status === DiscoveryStatus.COMPLETED).length;
    
    return {
      totalAssets: recentJobs.reduce((sum, job) => sum + (job.metrics?.totalAssets || 0), 0),
      discoveredAssets: recentJobs.reduce((sum, job) => sum + (job.metrics?.discoveredAssets || 0), 0),
      classifiedAssets: recentJobs.reduce((sum, job) => sum + (job.metrics?.classifiedAssets || 0), 0),
      profiledAssets: recentJobs.reduce((sum, job) => sum + (job.metrics?.profiledAssets || 0), 0),
      qualityAssessed: recentJobs.reduce((sum, job) => sum + (job.metrics?.qualityAssessed || 0), 0),
      avgConfidenceScore: recentJobs.reduce((sum, job) => sum + (job.metrics?.avgConfidenceScore || 0), 0) / totalJobs,
      processingTime: recentJobs.reduce((sum, job) => sum + (job.metrics?.processingTime || 0), 0) / totalJobs,
      errorRate: ((totalJobs - successfulJobs) / totalJobs) * 100,
      successRate: (successfulJobs / totalJobs) * 100,
      resourceUtilization: recentJobs.reduce((sum, job) => sum + (job.metrics?.resourceUtilization || 0), 0) / totalJobs
    };
  }, [discoveryHistory]);

  const discoveryInsights = useMemo<DiscoveryInsight[]>(() => {
    // Generate AI-powered insights based on discovery patterns and metrics
    const insights: DiscoveryInsight[] = [];

    if (discoveryMetrics.errorRate > 10) {
      insights.push({
        id: 'high-error-rate',
        type: 'anomaly',
        title: 'High Error Rate Detected',
        description: `Discovery error rate is ${discoveryMetrics.errorRate.toFixed(1)}%, which is above the recommended threshold.`,
        confidence: 0.9,
        impact: 'high',
        actionable: true,
        suggestedActions: [
          'Review data source configurations',
          'Check network connectivity',
          'Validate access permissions',
          'Optimize discovery batch sizes'
        ],
        relatedAssets: [],
        createdAt: new Date().toISOString()
      });
    }

    if (discoveryMetrics.avgConfidenceScore < 0.7) {
      insights.push({
        id: 'low-confidence',
        type: 'recommendation',
        title: 'Low AI Confidence Scores',
        description: `Average AI confidence score is ${(discoveryMetrics.avgConfidenceScore * 100).toFixed(1)}%. Consider improving training data.`,
        confidence: 0.8,
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          'Review and improve training datasets',
          'Add more labeled examples',
          'Fine-tune classification models',
          'Update pattern recognition rules'
        ],
        relatedAssets: [],
        createdAt: new Date().toISOString()
      });
    }

    if (discoveryMetrics.resourceUtilization > 80) {
      insights.push({
        id: 'high-resource-usage',
        type: 'optimization',
        title: 'High Resource Utilization',
        description: `Resource utilization is at ${discoveryMetrics.resourceUtilization.toFixed(1)}%. Consider optimization.`,
        confidence: 0.95,
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          'Reduce concurrent discovery jobs',
          'Optimize batch processing sizes',
          'Schedule discovery during off-peak hours',
          'Consider horizontal scaling'
        ],
        relatedAssets: [],
        createdAt: new Date().toISOString()
      });
    }

    return insights;
  }, [discoveryMetrics]);

  // ========================= EVENT HANDLERS =========================
  
  const handleStartDiscovery = useCallback(async () => {
    try {
      setIsDiscoveryRunning(true);
      
      const discoveryRequest = {
        configuration: discoveryConfig,
        dataSources: selectedDataSources,
        includeAIAnalysis: true,
        enableRealTimeUpdates: true
      };

      const result = await triggerDiscovery(discoveryRequest);
      setSelectedJob(result.jobId);
      
    } catch (error) {
      console.error('Failed to start discovery:', error);
    } finally {
      setIsDiscoveryRunning(false);
    }
  }, [discoveryConfig, selectedDataSources, triggerDiscovery]);

  const handleStopDiscovery = useCallback(async () => {
    if (selectedJob) {
      try {
        // Implementation for stopping discovery job
        setIsDiscoveryRunning(false);
      } catch (error) {
        console.error('Failed to stop discovery:', error);
      }
    }
  }, [selectedJob]);

  const handleConfigurationChange = useCallback((
    key: keyof DiscoveryConfiguration, 
    value: any
  ) => {
    setDiscoveryConfig(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // ========================= RENDER HELPERS =========================
  
  const renderDiscoveryDashboard = () => (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discoveryMetrics.totalAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{discoveryMetrics.discoveredAssets} discovered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(discoveryMetrics.avgConfidenceScore * 100).toFixed(1)}%
            </div>
            <Progress 
              value={discoveryMetrics.avgConfidenceScore * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discoveryMetrics.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Error rate: {discoveryMetrics.errorRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discoveryMetrics.resourceUtilization.toFixed(1)}%
            </div>
            <Progress 
              value={discoveryMetrics.resourceUtilization} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Discovery Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Discovery Controls
          </CardTitle>
          <CardDescription>
            Start, stop, and configure AI-powered data discovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={isDiscoveryRunning ? handleStopDiscovery : handleStartDiscovery}
                disabled={isDiscoveryLoading}
                variant={isDiscoveryRunning ? "destructive" : "default"}
                size="lg"
              >
                {isDiscoveryRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Discovery
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Discovery
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isDiscoveryRunning ? "default" : "secondary"}>
                {isDiscoveryRunning ? "Running" : "Idle"}
              </Badge>
              {currentJob && (
                <Badge variant="outline">
                  Job: {currentJob.id.slice(0, 8)}
                </Badge>
              )}
            </div>
          </div>

          {/* Advanced Configuration */}
          <AnimatePresence>
            {showAdvancedConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-4 space-y-4"
              >
                <h4 className="font-semibold">Advanced Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discovery Methods</Label>
                    <div className="space-y-2">
                      {Object.values(DiscoveryMethod).map(method => (
                        <div key={method} className="flex items-center space-x-2">
                          <Switch
                            id={method}
                            checked={discoveryConfig.methods.includes(method)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleConfigurationChange('methods', [
                                  ...discoveryConfig.methods,
                                  method
                                ]);
                              } else {
                                handleConfigurationChange('methods', 
                                  discoveryConfig.methods.filter(m => m !== method)
                                );
                              }
                            }}
                          />
                          <Label htmlFor={method} className="text-sm">
                            {method.replace(/_/g, ' ').toLowerCase()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>AI Confidence Threshold</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.1"
                          value={discoveryConfig.aiConfidenceThreshold}
                          onChange={(e) => handleConfigurationChange(
                            'aiConfidenceThreshold', 
                            parseFloat(e.target.value)
                          )}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground w-12">
                          {(discoveryConfig.aiConfidenceThreshold * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Batch Size</Label>
                      <Input
                        type="number"
                        min="10"
                        max="1000"
                        value={discoveryConfig.batchSize}
                        onChange={(e) => handleConfigurationChange(
                          'batchSize', 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Concurrency</Label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={discoveryConfig.maxConcurrency}
                        onChange={(e) => handleConfigurationChange(
                          'maxConcurrency', 
                          parseInt(e.target.value)
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Processing Options</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'includeMetadata', label: 'Metadata Enrichment' },
                      { key: 'includeProfiler', label: 'Data Profiling' },
                      { key: 'includeClassification', label: 'AI Classification' },
                      { key: 'includeQuality', label: 'Quality Assessment' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Switch
                          id={key}
                          checked={discoveryConfig[key as keyof DiscoveryConfiguration] as boolean}
                          onCheckedChange={(checked) => handleConfigurationChange(
                            key as keyof DiscoveryConfiguration, 
                            checked
                          )}
                        />
                        <Label htmlFor={key} className="text-sm">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {discoveryInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Insights & Recommendations
            </CardTitle>
            <CardDescription>
              Intelligent insights based on discovery patterns and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {discoveryInsights.map((insight) => (
                <Alert key={insight.id} className={
                  insight.impact === 'critical' ? 'border-red-200 bg-red-50' :
                  insight.impact === 'high' ? 'border-orange-200 bg-orange-50' :
                  insight.impact === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        {insight.type === 'anomaly' && <AlertTriangle className="h-4 w-4" />}
                        {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4" />}
                        {insight.type === 'optimization' && <TrendingUp className="h-4 w-4" />}
                        {insight.type === 'pattern' && <Target className="h-4 w-4" />}
                        {insight.title}
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        {insight.description}
                      </AlertDescription>
                      {insight.actionable && insight.suggestedActions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                          <ul className="text-sm space-y-1">
                            {insight.suggestedActions.map((action, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-current rounded-full" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline">
                        {(insight.confidence * 100).toFixed(0)}% confident
                      </Badge>
                      <Badge variant={
                        insight.impact === 'critical' ? 'destructive' :
                        insight.impact === 'high' ? 'default' :
                        insight.impact === 'medium' ? 'secondary' :
                        'outline'
                      }>
                        {insight.impact} impact
                      </Badge>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderJobHistory = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Discovery Job History</h3>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isHistoryLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {discoveryHistory?.map((job) => (
            <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedJob(job.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Job {job.id.slice(0, 8)}</h4>
                      <Badge variant={
                        job.status === DiscoveryStatus.COMPLETED ? 'default' :
                        job.status === DiscoveryStatus.FAILED ? 'destructive' :
                        job.status === DiscoveryStatus.RUNNING ? 'secondary' :
                        'outline'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Started: {formatRelativeTime(job.startedAt)}
                    </p>
                    {job.metrics && (
                      <div className="flex items-center gap-4 text-sm">
                        <span>Assets: {job.metrics.discoveredAssets}</span>
                        <span>Success: {job.metrics.successRate?.toFixed(1)}%</span>
                        <span>Duration: {job.metrics.processingTime}s</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {job.dataSources?.length || 0} sources
                    </div>
                    {job.progress !== undefined && (
                      <Progress value={job.progress} className="w-20 mt-2" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ========================= MAIN RENDER =========================
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              AI Discovery Engine
            </h1>
            <p className="text-muted-foreground mt-2">
              Intelligent data asset discovery with ML-powered classification and automated profiling
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Error States */}
        {(discoveryError || jobError || historyError) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {discoveryError?.message || jobError?.message || historyError?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Sources
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {renderDiscoveryDashboard()}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            {renderJobHistory()}
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Source Configuration</CardTitle>
                <CardDescription>
                  Configure and manage data sources for discovery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Data source configuration interface coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Advanced analytics and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced insights interface coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default AIDiscoveryEngine;