'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  Database,
  Activity,
  BarChart3,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  FileText,
  Share,
  Download,
  Upload,
  Eye,
  Edit,
  Trash,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  Zap,
  Shield,
  Globe,
  Target,
  Workflow,
  Bot,
  MessageSquare,
  Bell,
  Info,
  ExternalLink,
  Network,
  Server,
  Cloud,
  HardDrive,
  Lock,
  Unlock,
  Key,
  Monitor,
  Cpu,
  MemoryStick,
  Timer,
  Gauge,
  LineChart,
  PieChart,
  BarChart,
  Calendar,
  Map,
  Link,
  Unlink,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Copy,
  Cut,
  Paste,
  Save,
  FolderOpen,
  Folder,
  File,
} from 'lucide-react';

// Import existing Data Sources SPA components
import { DataSourcesApp } from '@/components/data-sources/enhanced-data-sources-app';
import { DataSourceGrid } from '@/components/data-sources/data-source-grid';
import { DataSourceCatalog } from '@/components/data-sources/data-source-catalog';
import { DataSourceMonitoring } from '@/components/data-sources/data-source-monitoring';
import { DataSourceAnalytics } from '@/components/data-sources/analytics/data-source-analytics';

// Import racine hooks and services
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useActivityTracking } from '../../hooks/useActivityTracking';
import { useDataSources } from '../../hooks/useDataSources';
import { useScanRuleSets } from '../../hooks/useScanRuleSets';
import { useClassifications } from '../../hooks/useClassifications';
import { useComplianceRule } from '../../hooks/useComplianceRule';
import { useAdvancedCatalog } from '../../hooks/useAdvancedCatalog';
import { useScanLogic } from '../../hooks/useScanLogic';
import { useRBAC } from '../../hooks/useRBAC';

// Types
interface DataSourceOrchestrationMetrics {
  totalDataSources: number;
  activeConnections: number;
  healthyConnections: number;
  failedConnections: number;
  avgResponseTime: number;
  dataVolumeProcessed: number;
  lastSyncTime: string;
  uptime: number;
}

interface CrossSPAIntegration {
  scanRulesApplied: number;
  classificationsDetected: number;
  complianceChecks: number;
  catalogItemsCreated: number;
  workflowsTriggered: number;
  aiRecommendations: number;
}

interface AIRecommendation {
  id: string;
  type: 'optimization' | 'security' | 'performance' | 'compliance' | 'cost';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  actionItems: string[];
  estimatedSavings?: {
    cost?: number;
    time?: number;
    resources?: number;
  };
}

interface WorkflowIntegration {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending' | 'failed';
  triggers: string[];
  actions: string[];
  lastExecution: string;
  successRate: number;
}

interface DataSourcesSPAOrchestratorProps {
  className?: string;
  isEmbedded?: boolean;
  initialView?: 'overview' | 'grid' | 'catalog' | 'monitoring' | 'analytics' | 'workflows' | 'ai-insights';
  showHeader?: boolean;
  showNavigation?: boolean;
  onViewChange?: (view: string) => void;
  onDataSourceSelect?: (dataSourceId: string) => void;
  workspaceId?: string;
}

const DataSourcesSPAOrchestrator: React.FC<DataSourcesSPAOrchestratorProps> = ({
  className = '',
  isEmbedded = false,
  initialView = 'overview',
  showHeader = true,
  showNavigation = true,
  onViewChange,
  onDataSourceSelect,
  workspaceId,
}) => {
  // State management
  const [activeView, setActiveView] = useState<string>(initialView);
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [orchestrationMetrics, setOrchestrationMetrics] = useState<DataSourceOrchestrationMetrics | null>(null);
  const [crossSPAIntegration, setCrossSPAIntegration] = useState<CrossSPAIntegration | null>(null);
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([]);
  const [workflowIntegrations, setWorkflowIntegrations] = useState<WorkflowIntegration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIInsights, setShowAIInsights] = useState<boolean>(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState<boolean>(false);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const router = useRouter();
  const pathname = usePathname();

  const {
    orchestrateDataSources,
    getOrchestrationMetrics,
    optimizeDataSourcePerformance,
    monitorDataSourceHealth,
    loading: orchestrationLoading
  } = useRacineOrchestration();

  const {
    coordinateWorkflow,
    linkDataSourceToSPAs,
    getCrossGroupMetrics,
    triggerCrossGroupAction,
    loading: integrationLoading
  } = useCrossGroupIntegration();

  const { currentWorkspace, switchWorkspace } = useWorkspaceManagement();
  const { currentUser, hasPermission } = useUserManagement();

  const {
    getAIRecommendations,
    analyzeDataSourcePerformance,
    optimizeDataSourceConfiguration,
    predictDataSourceIssues,
    loading: aiLoading
  } = useAIAssistant();

  const { trackActivity, getActivityHistory } = useActivityTracking();

  // Data Sources SPA integration
  const {
    dataSources,
    createDataSource,
    updateDataSource,
    deleteDataSource,
    testConnection,
    getDataSourceMetrics,
    refreshDataSource,
    loading: dataSourcesLoading
  } = useDataSources();

  // Cross-SPA hooks for integration
  const { scanRuleSets, applyScanRule } = useScanRuleSets();
  const { classifications, applyClassification } = useClassifications();
  const { complianceRules, checkCompliance } = useComplianceRule();
  const { catalogItems, createCatalogItem } = useAdvancedCatalog();
  const { scanJobs, executeScan } = useScanLogic();
  const { users, roles, checkPermissions } = useRBAC();

  // Initialize orchestration
  useEffect(() => {
    const initializeOrchestration = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Track activity
        await trackActivity('data-sources-orchestrator-opened', {
          view: activeView,
          workspaceId: currentWorkspace?.id,
          userId: currentUser?.id
        });

        // Load orchestration metrics
        const metrics = await getOrchestrationMetrics('data-sources');
        setOrchestrationMetrics(metrics);

        // Load cross-SPA integration data
        const crossSPAData = await getCrossGroupMetrics('data-sources');
        setCrossSPAIntegration(crossSPAData);

        // Load AI recommendations
        const recommendations = await getAIRecommendations('data-sources', {
          workspaceId: currentWorkspace?.id,
          userId: currentUser?.id,
          includeOptimizations: true,
          includeSecurity: true,
          includeCompliance: true
        });
        setAIRecommendations(recommendations);

        // Load workflow integrations
        const workflows = await coordinateWorkflow('get-data-source-workflows', {
          workspaceId: currentWorkspace?.id
        });
        setWorkflowIntegrations(workflows);

        setLastRefreshTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Failed to initialize data sources orchestration:', err);
        setError('Failed to load orchestration data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrchestration();
  }, [
    activeView,
    currentWorkspace?.id,
    currentUser?.id,
    getOrchestrationMetrics,
    getCrossGroupMetrics,
    getAIRecommendations,
    coordinateWorkflow,
    trackActivity
  ]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(async () => {
        try {
          const metrics = await getOrchestrationMetrics('data-sources');
          setOrchestrationMetrics(metrics);
          
          const crossSPAData = await getCrossGroupMetrics('data-sources');
          setCrossSPAIntegration(crossSPAData);
          
          setLastRefreshTime(new Date().toLocaleTimeString());
        } catch (err) {
          console.error('Auto-refresh failed:', err);
        }
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, getOrchestrationMetrics, getCrossGroupMetrics]);

  // View change handler
  const handleViewChange = useCallback((view: string) => {
    setActiveView(view);
    onViewChange?.(view);
    
    // Track activity
    trackActivity('data-sources-view-changed', {
      fromView: activeView,
      toView: view,
      workspaceId: currentWorkspace?.id
    });
  }, [activeView, onViewChange, trackActivity, currentWorkspace?.id]);

  // Data source selection handler
  const handleDataSourceSelect = useCallback((dataSourceId: string) => {
    setSelectedDataSource(dataSourceId);
    onDataSourceSelect?.(dataSourceId);
    
    // Track activity
    trackActivity('data-source-selected', {
      dataSourceId,
      view: activeView,
      workspaceId: currentWorkspace?.id
    });
  }, [onDataSourceSelect, activeView, trackActivity, currentWorkspace?.id]);

  // Cross-SPA integration handlers
  const handleLinkToScanRules = useCallback(async (dataSourceId: string) => {
    try {
      await linkDataSourceToSPAs(dataSourceId, ['scan-rule-sets']);
      
      // Track activity
      await trackActivity('data-source-linked-scan-rules', {
        dataSourceId,
        workspaceId: currentWorkspace?.id
      });
      
      // Refresh integration data
      const crossSPAData = await getCrossGroupMetrics('data-sources');
      setCrossSPAIntegration(crossSPAData);
    } catch (err) {
      console.error('Failed to link data source to scan rules:', err);
      setError('Failed to link data source to scan rules');
    }
  }, [linkDataSourceToSPAs, trackActivity, currentWorkspace?.id, getCrossGroupMetrics]);

  const handleApplyClassifications = useCallback(async (dataSourceId: string) => {
    try {
      await triggerCrossGroupAction('apply-classifications', {
        dataSourceId,
        workspaceId: currentWorkspace?.id
      });
      
      // Track activity
      await trackActivity('data-source-classifications-applied', {
        dataSourceId,
        workspaceId: currentWorkspace?.id
      });
    } catch (err) {
      console.error('Failed to apply classifications:', err);
      setError('Failed to apply classifications');
    }
  }, [triggerCrossGroupAction, trackActivity, currentWorkspace?.id]);

  const handleComplianceCheck = useCallback(async (dataSourceId: string) => {
    try {
      await triggerCrossGroupAction('compliance-check', {
        dataSourceId,
        workspaceId: currentWorkspace?.id
      });
      
      // Track activity
      await trackActivity('data-source-compliance-checked', {
        dataSourceId,
        workspaceId: currentWorkspace?.id
      });
    } catch (err) {
      console.error('Failed to perform compliance check:', err);
      setError('Failed to perform compliance check');
    }
  }, [triggerCrossGroupAction, trackActivity, currentWorkspace?.id]);

  const handleCatalogData = useCallback(async (dataSourceId: string) => {
    try {
      await triggerCrossGroupAction('catalog-data', {
        dataSourceId,
        workspaceId: currentWorkspace?.id
      });
      
      // Track activity
      await trackActivity('data-source-cataloged', {
        dataSourceId,
        workspaceId: currentWorkspace?.id
      });
    } catch (err) {
      console.error('Failed to catalog data:', err);
      setError('Failed to catalog data');
    }
  }, [triggerCrossGroupAction, trackActivity, currentWorkspace?.id]);

  // AI recommendation handlers
  const handleApplyAIRecommendation = useCallback(async (recommendation: AIRecommendation) => {
    try {
      await optimizeDataSourceConfiguration(recommendation.id, {
        type: recommendation.type,
        actionItems: recommendation.actionItems,
        workspaceId: currentWorkspace?.id
      });
      
      // Track activity
      await trackActivity('ai-recommendation-applied', {
        recommendationId: recommendation.id,
        type: recommendation.type,
        workspaceId: currentWorkspace?.id
      });
      
      // Refresh recommendations
      const recommendations = await getAIRecommendations('data-sources', {
        workspaceId: currentWorkspace?.id,
        userId: currentUser?.id
      });
      setAIRecommendations(recommendations);
    } catch (err) {
      console.error('Failed to apply AI recommendation:', err);
      setError('Failed to apply AI recommendation');
    }
  }, [optimizeDataSourceConfiguration, trackActivity, currentWorkspace?.id, getAIRecommendations, currentUser?.id]);

  // Workflow integration handlers
  const handleCreateWorkflow = useCallback(async (workflowConfig: any) => {
    try {
      await coordinateWorkflow('create-data-source-workflow', {
        ...workflowConfig,
        workspaceId: currentWorkspace?.id
      });
      
      // Track activity
      await trackActivity('data-source-workflow-created', {
        workflowName: workflowConfig.name,
        workspaceId: currentWorkspace?.id
      });
      
      setShowWorkflowDialog(false);
    } catch (err) {
      console.error('Failed to create workflow:', err);
      setError('Failed to create workflow');
    }
  }, [coordinateWorkflow, trackActivity, currentWorkspace?.id]);

  // Computed values
  const isLoadingAny = useMemo(() => {
    return isLoading || orchestrationLoading || integrationLoading || aiLoading || dataSourcesLoading;
  }, [isLoading, orchestrationLoading, integrationLoading, aiLoading, dataSourcesLoading]);

  const healthScore = useMemo(() => {
    if (!orchestrationMetrics) return 0;
    const { totalDataSources, healthyConnections } = orchestrationMetrics;
    if (totalDataSources === 0) return 100;
    return Math.round((healthyConnections / totalDataSources) * 100);
  }, [orchestrationMetrics]);

  const performanceScore = useMemo(() => {
    if (!orchestrationMetrics) return 0;
    const { avgResponseTime } = orchestrationMetrics;
    // Consider < 100ms as excellent, < 500ms as good, < 1000ms as fair, > 1000ms as poor
    if (avgResponseTime < 100) return 100;
    if (avgResponseTime < 500) return 80;
    if (avgResponseTime < 1000) return 60;
    return Math.max(20, 100 - (avgResponseTime - 1000) / 50);
  }, [orchestrationMetrics]);

  // Render orchestration overview
  const renderOrchestrationOverview = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orchestrationMetrics?.totalDataSources || 0}</div>
            <p className="text-xs text-muted-foreground">
              {orchestrationMetrics?.activeConnections || 0} active connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthScore}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${healthScore >= 90 ? 'bg-green-500' : healthScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span>{orchestrationMetrics?.healthyConnections || 0} healthy</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(performanceScore)}%</div>
            <p className="text-xs text-muted-foreground">
              {orchestrationMetrics?.avgResponseTime || 0}ms avg response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orchestrationMetrics?.dataVolumeProcessed ? 
                `${(orchestrationMetrics.dataVolumeProcessed / 1024 / 1024 / 1024).toFixed(1)}GB` : 
                '0GB'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Last sync: {orchestrationMetrics?.lastSyncTime || 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cross-SPA Integration Status */}
      {crossSPAIntegration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Cross-SPA Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{crossSPAIntegration.scanRulesApplied}</div>
                <div className="text-sm text-muted-foreground">Scan Rules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{crossSPAIntegration.classificationsDetected}</div>
                <div className="text-sm text-muted-foreground">Classifications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{crossSPAIntegration.complianceChecks}</div>
                <div className="text-sm text-muted-foreground">Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{crossSPAIntegration.catalogItemsCreated}</div>
                <div className="text-sm text-muted-foreground">Catalog Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{crossSPAIntegration.workflowsTriggered}</div>
                <div className="text-sm text-muted-foreground">Workflows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{crossSPAIntegration.aiRecommendations}</div>
                <div className="text-sm text-muted-foreground">AI Insights</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations Preview */}
      {aiRecommendations.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAIInsights(true)}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiRecommendations.slice(0, 3).map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={recommendation.impact === 'critical' ? 'destructive' : 
                                recommendation.impact === 'high' ? 'default' : 'secondary'}
                      >
                        {recommendation.impact}
                      </Badge>
                      <Badge variant="outline">{recommendation.type}</Badge>
                    </div>
                    <h4 className="font-medium">{recommendation.title}</h4>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyAIRecommendation(recommendation)}
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render header if enabled
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Data Sources Orchestrator</h1>
          </div>
          {orchestrationMetrics && (
            <Badge 
              variant={healthScore >= 90 ? 'default' : healthScore >= 70 ? 'secondary' : 'destructive'}
            >
              {healthScore}% Health
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWorkflowDialog(true)}
                >
                  <Workflow className="h-4 w-4 mr-1" />
                  Workflows
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage cross-SPA workflows</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAIInsights(true)}
                >
                  <Bot className="h-4 w-4 mr-1" />
                  AI Insights
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View AI recommendations and insights</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Orchestration Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAutoRefresh(!autoRefresh)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Auto Refresh: {autoRefresh ? 'On' : 'Off'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowIntegrationDialog(true)}>
                <Network className="h-4 w-4 mr-2" />
                Integration Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Configuration
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {lastRefreshTime && (
            <div className="text-xs text-muted-foreground">
              Last updated: {lastRefreshTime}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render navigation tabs if enabled
  const renderNavigation = () => {
    if (!showNavigation) return null;

    const navigationItems = [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'grid', label: 'Data Sources', icon: Database },
      { id: 'catalog', label: 'Catalog', icon: BookOpen },
      { id: 'monitoring', label: 'Monitoring', icon: Monitor },
      { id: 'analytics', label: 'Analytics', icon: LineChart },
      { id: 'workflows', label: 'Workflows', icon: Workflow },
      { id: 'ai-insights', label: 'AI Insights', icon: Bot },
    ];

    return (
      <Tabs value={activeView} onValueChange={handleViewChange} className="mb-6">
        <TabsList className="grid w-full grid-cols-7">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger key={item.id} value={item.id} className="flex items-center gap-1">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    );
  };

  // Render main content based on active view
  const renderMainContent = () => {
    if (isLoadingAny) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orchestration data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'overview':
        return renderOrchestrationOverview();
        
      case 'grid':
        return (
          <DataSourceGrid
            onDataSourceSelect={handleDataSourceSelect}
            selectedDataSource={selectedDataSource}
            showOrchestrationFeatures={true}
            onLinkToScanRules={handleLinkToScanRules}
            onApplyClassifications={handleApplyClassifications}
            onComplianceCheck={handleComplianceCheck}
            onCatalogData={handleCatalogData}
          />
        );
        
      case 'catalog':
        return (
          <DataSourceCatalog
            onDataSourceSelect={handleDataSourceSelect}
            showCrossGroupIntegration={true}
          />
        );
        
      case 'monitoring':
        return (
          <DataSourceMonitoring
            showOrchestrationMetrics={true}
            orchestrationMetrics={orchestrationMetrics}
            crossSPAIntegration={crossSPAIntegration}
          />
        );
        
      case 'analytics':
        return (
          <DataSourceAnalytics
            showCrossGroupAnalytics={true}
            includeAIInsights={true}
            workspaceId={currentWorkspace?.id}
          />
        );
        
      case 'workflows':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cross-SPA Workflows</h2>
              <Button onClick={() => setShowWorkflowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
            
            <div className="grid gap-4">
              {workflowIntegrations.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{workflow.name}</CardTitle>
                      <Badge 
                        variant={workflow.status === 'active' ? 'default' : 
                                workflow.status === 'failed' ? 'destructive' : 'secondary'}
                      >
                        {workflow.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Success Rate: {workflow.successRate}%</span>
                      <span>Last Execution: {workflow.lastExecution}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 'ai-insights':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">AI Insights & Recommendations</h2>
              <Button onClick={() => getAIRecommendations('data-sources', { refresh: true })}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <div className="grid gap-4">
              {aiRecommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={recommendation.impact === 'critical' ? 'destructive' : 
                                  recommendation.impact === 'high' ? 'default' : 'secondary'}
                        >
                          {recommendation.impact}
                        </Badge>
                        <Badge variant="outline">{recommendation.type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {recommendation.confidence}% confidence
                      </div>
                    </div>
                    <CardTitle className="text-base">{recommendation.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{recommendation.description}</p>
                    
                    {recommendation.actionItems.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Action Items:</h4>
                        <ul className="text-sm space-y-1">
                          {recommendation.actionItems.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {recommendation.estimatedSavings && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Estimated Savings:</h4>
                        <div className="text-sm space-y-1">
                          {recommendation.estimatedSavings.cost && (
                            <div>Cost: ${recommendation.estimatedSavings.cost}/month</div>
                          )}
                          {recommendation.estimatedSavings.time && (
                            <div>Time: {recommendation.estimatedSavings.time} hours/week</div>
                          )}
                          {recommendation.estimatedSavings.resources && (
                            <div>Resources: {recommendation.estimatedSavings.resources}% efficiency gain</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">Effort: {recommendation.effort}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplyAIRecommendation(recommendation)}
                      >
                        Apply Recommendation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      default:
        return renderOrchestrationOverview();
    }
  };

  return (
    <div className={cn("data-sources-spa-orchestrator", className)}>
      {renderHeader()}
      {renderNavigation()}
      
      <div className={cn(
        "orchestrator-content",
        isEmbedded && "embedded-mode"
      )}>
        {renderMainContent()}
      </div>

      {/* AI Insights Dialog */}
      <Dialog open={showAIInsights} onOpenChange={setShowAIInsights}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Insights & Recommendations
            </DialogTitle>
            <DialogDescription>
              AI-powered recommendations to optimize your data sources
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {aiRecommendations.map((recommendation) => (
              <Card key={recommendation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={recommendation.impact === 'critical' ? 'destructive' : 
                                recommendation.impact === 'high' ? 'default' : 'secondary'}
                      >
                        {recommendation.impact}
                      </Badge>
                      <Badge variant="outline">{recommendation.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {recommendation.confidence}% confidence
                    </div>
                  </div>
                  <CardTitle className="text-base">{recommendation.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{recommendation.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Effort: {recommendation.effort}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyAIRecommendation(recommendation)}
                    >
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Workflow Creation Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Create Cross-SPA Workflow
            </DialogTitle>
            <DialogDescription>
              Create automated workflows that span across multiple SPAs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Workflow creation interface would be implemented here with:
            </p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Workflow name and description</li>
              <li>• Trigger conditions (data source events, schedules, etc.)</li>
              <li>• Cross-SPA actions (scan rules, classifications, compliance checks)</li>
              <li>• Error handling and notifications</li>
              <li>• Testing and validation</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Integration Settings Dialog */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Integration Settings
            </DialogTitle>
            <DialogDescription>
              Configure cross-SPA integration settings and preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Integration settings interface would be implemented here with:
            </p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Auto-linking preferences</li>
              <li>• Cross-SPA notification settings</li>
              <li>• Data sharing and privacy controls</li>
              <li>• Integration monitoring and alerting</li>
              <li>• Performance optimization settings</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataSourcesSPAOrchestrator;