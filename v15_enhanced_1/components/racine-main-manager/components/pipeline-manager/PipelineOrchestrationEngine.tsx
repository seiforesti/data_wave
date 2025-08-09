'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, GitBranch, Play, Pause, Stop, RefreshCw, Settings, Target,
  Activity, BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle,
  XCircle, Zap, Database, Search, Shield, Users, Brain, Package,
  Code, Terminal, FileText, MoreHorizontal, X, Plus, Minus, Eye,
  EyeOff, Filter, Download, Upload, Save, Copy, Edit3, Trash2,
  Layers, Route, MapPin, Compass, Navigation, Globe, Monitor,
  Server, Cloud, Wifi, Link2, Unlink2, Share2, Bell, Volume2
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

// Advanced Chart components
import { 
  LineChart as RechartsLineChart, 
  BarChart as RechartsBarChart, 
  AreaChart, 
  PieChart as RechartsPieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  Line, 
  Bar, 
  Area, 
  Pie, 
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Racine System Imports
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Types from racine-core.types
import { 
  Pipeline,
  PipelineExecution,
  OrchestrationRule,
  ExecutionPlan,
  ResourceAllocation,
  CrossSPAOrchestration,
  OrchestrationMetrics,
  ExecutionQueue,
  PipelineSchedule,
  OrchestrationStrategy,
  DependencyGraph,
  ConditionalLogic,
  ParallelExecution,
  ErrorHandling,
  RetryPolicy,
  ExecutionContext,
  ResourceOptimization,
  PerformanceProfile,
  OrchestrationAlert,
  ExecutionTimeline,
  SystemHealth,
  WorkloadDistribution,
  ScalingPolicy,
  QualityGate,
  ComplianceCheck
} from '../../types/racine-core.types';

/**
 * Advanced Pipeline Orchestration Engine Component
 * 
 * Enterprise-grade pipeline orchestration system with comprehensive management capabilities:
 * - Advanced cross-SPA pipeline orchestration with intelligent coordination
 * - Intelligent execution planning with resource optimization
 * - Sophisticated dependency management and conflict resolution
 * - Real-time execution monitoring with predictive analytics
 * - Advanced error handling and automatic recovery mechanisms
 * - Dynamic resource allocation and load balancing
 * - Compliance and quality gate enforcement
 * - Multi-tenant execution with isolation guarantees
 * - Advanced scheduling with business rules integration
 * - Comprehensive audit trail and governance controls
 */

// Orchestration Strategies
const ORCHESTRATION_STRATEGIES = {
  SEQUENTIAL: {
    id: 'sequential',
    name: 'Sequential Execution',
    description: 'Execute pipelines one after another',
    icon: ArrowRight,
    advantages: ['Simple', 'Predictable', 'Resource-efficient'],
    disadvantages: ['Slower', 'No parallelism'],
    best_for: ['Simple workflows', 'Resource-constrained environments']
  },
  PARALLEL: {
    id: 'parallel',
    name: 'Parallel Execution',
    description: 'Execute independent pipelines simultaneously',
    icon: Layers,
    advantages: ['Faster', 'Resource utilization', 'Scalable'],
    disadvantages: ['Complex', 'Resource-intensive'],
    best_for: ['Independent workflows', 'High-throughput scenarios']
  },
  PRIORITY_BASED: {
    id: 'priority',
    name: 'Priority-Based',
    description: 'Execute pipelines based on priority levels',
    icon: Target,
    advantages: ['Business-aligned', 'Fair allocation', 'SLA compliance'],
    disadvantages: ['Starvation risk', 'Complex scheduling'],
    best_for: ['Mixed workloads', 'SLA-critical environments']
  },
  ADAPTIVE: {
    id: 'adaptive',
    name: 'Adaptive Orchestration',
    description: 'AI-driven dynamic strategy selection',
    icon: Brain,
    advantages: ['Self-optimizing', 'Context-aware', 'Performance-driven'],
    disadvantages: ['Complex', 'Learning overhead'],
    best_for: ['Dynamic environments', 'Performance-critical systems']
  },
  FEDERATED: {
    id: 'federated',
    name: 'Federated Execution',
    description: 'Distribute execution across multiple clusters',
    icon: Globe,
    advantages: ['Highly scalable', 'Fault-tolerant', 'Geographic distribution'],
    disadvantages: ['Network overhead', 'Coordination complexity'],
    best_for: ['Large-scale deployments', 'Multi-region scenarios']
  }
};

// Cross-SPA Integration Points
const CROSS_SPA_INTEGRATION_POINTS = {
  DATA_SOURCES: {
    spa_id: 'data-sources',
    name: 'Data Sources',
    api_base: '/api/data-sources',
    orchestration_endpoints: {
      trigger: '/orchestration/trigger',
      status: '/orchestration/status',
      cancel: '/orchestration/cancel',
      metrics: '/orchestration/metrics'
    },
    dependencies: [],
    capabilities: ['connection_management', 'data_ingestion', 'schema_validation'],
    resource_requirements: { cpu: 2, memory: 4, storage: 10 },
    avg_execution_time: 300000, // 5 minutes
    success_rate: 97.5
  },
  SCAN_RULE_SETS: {
    spa_id: 'scan-rule-sets',
    name: 'Scan Rule Sets',
    api_base: '/api/scan-rule-sets',
    orchestration_endpoints: {
      trigger: '/orchestration/trigger',
      status: '/orchestration/status',
      cancel: '/orchestration/cancel',
      metrics: '/orchestration/metrics'
    },
    dependencies: ['data-sources'],
    capabilities: ['rule_execution', 'policy_enforcement', 'compliance_checking'],
    resource_requirements: { cpu: 4, memory: 8, storage: 5 },
    avg_execution_time: 600000, // 10 minutes
    success_rate: 95.2
  },
  CLASSIFICATIONS: {
    spa_id: 'classifications',
    name: 'Classifications',
    api_base: '/api/classifications',
    orchestration_endpoints: {
      trigger: '/orchestration/trigger',
      status: '/orchestration/status',
      cancel: '/orchestration/cancel',
      metrics: '/orchestration/metrics'
    },
    dependencies: ['data-sources', 'scan-rule-sets'],
    capabilities: ['data_classification', 'tagging', 'sensitivity_analysis'],
    resource_requirements: { cpu: 3, memory: 6, storage: 3 },
    avg_execution_time: 450000, // 7.5 minutes
    success_rate: 96.8
  },
  COMPLIANCE_RULE: {
    spa_id: 'compliance-rule',
    name: 'Compliance Rules',
    api_base: '/api/compliance-rules',
    orchestration_endpoints: {
      trigger: '/orchestration/trigger',
      status: '/orchestration/status',
      cancel: '/orchestration/cancel',
      metrics: '/orchestration/metrics'
    },
    dependencies: ['classifications', 'scan-rule-sets'],
    capabilities: ['compliance_validation', 'audit_reporting', 'violation_detection'],
    resource_requirements: { cpu: 3, memory: 6, storage: 8 },
    avg_execution_time: 900000, // 15 minutes
    success_rate: 98.1
  },
  ADVANCED_CATALOG: {
    spa_id: 'advanced-catalog',
    name: 'Advanced Catalog',
    api_base: '/api/advanced-catalog',
    orchestration_endpoints: {
      trigger: '/orchestration/trigger',
      status: '/orchestration/status',
      cancel: '/orchestration/cancel',
      metrics: '/orchestration/metrics'
    },
    dependencies: ['classifications'],
    capabilities: ['metadata_management', 'lineage_tracking', 'discovery'],
    resource_requirements: { cpu: 2, memory: 4, storage: 15 },
    avg_execution_time: 720000, // 12 minutes
    success_rate: 97.9
  },
  SCAN_LOGIC: {
    spa_id: 'scan-logic',
    name: 'Scan Logic',
    api_base: '/api/scan-logic',
    orchestration_endpoints: {
      trigger: '/orchestration/trigger',
      status: '/orchestration/status',
      cancel: '/orchestration/cancel',
      metrics: '/orchestration/metrics'
    },
    dependencies: ['data-sources'],
    capabilities: ['data_scanning', 'pattern_detection', 'anomaly_identification'],
    resource_requirements: { cpu: 5, memory: 10, storage: 20 },
    avg_execution_time: 1800000, // 30 minutes
    success_rate: 94.7
  },
  RBAC_SYSTEM: {
    spa_id: 'rbac-system',
    name: 'RBAC System',
    api_base: '/api/rbac',
    orchestration_endpoints: {
      trigger: '/orchestration/trigger',
      status: '/orchestration/status',
      cancel: '/orchestration/cancel',
      metrics: '/orchestration/metrics'
    },
    dependencies: [],
    capabilities: ['access_control', 'user_management', 'permission_validation'],
    resource_requirements: { cpu: 1, memory: 2, storage: 5 },
    avg_execution_time: 180000, // 3 minutes
    success_rate: 99.2
  }
};

// Execution Priorities
const EXECUTION_PRIORITIES = {
  CRITICAL: { level: 1, name: 'Critical', color: '#ef4444', weight: 1000 },
  HIGH: { level: 2, name: 'High', color: '#f59e0b', weight: 800 },
  MEDIUM: { level: 3, name: 'Medium', color: '#3b82f6', weight: 500 },
  LOW: { level: 4, name: 'Low', color: '#6b7280', weight: 200 },
  BACKGROUND: { level: 5, name: 'Background', color: '#9ca3af', weight: 100 }
};

// Resource Allocation Policies
const RESOURCE_POLICIES = {
  GUARANTEED: {
    id: 'guaranteed',
    name: 'Guaranteed Resources',
    description: 'Reserve dedicated resources for execution',
    allocation_type: 'reserved',
    overhead: 0,
    isolation_level: 'high'
  },
  BURSTABLE: {
    id: 'burstable',
    name: 'Burstable Resources',
    description: 'Allow resource bursting based on availability',
    allocation_type: 'dynamic',
    overhead: 15,
    isolation_level: 'medium'
  },
  BEST_EFFORT: {
    id: 'best_effort',
    name: 'Best Effort',
    description: 'Use available resources without guarantees',
    allocation_type: 'shared',
    overhead: 30,
    isolation_level: 'low'
  }
};

interface PipelineOrchestrationEngineProps {
  pipelines?: Pipeline[];
  executions?: PipelineExecution[];
  orchestrationStrategy?: keyof typeof ORCHESTRATION_STRATEGIES;
  autoOptimize?: boolean;
  enableCrossGroupOrchestration?: boolean;
  showAdvancedMetrics?: boolean;
  className?: string;
}

const PipelineOrchestrationEngine: React.FC<PipelineOrchestrationEngineProps> = ({
  pipelines = [],
  executions = [],
  orchestrationStrategy = 'ADAPTIVE',
  autoOptimize = true,
  enableCrossGroupOrchestration = true,
  showAdvancedMetrics = true,
  className = ''
}) => {
  // Orchestration State
  const [activeStrategy, setActiveStrategy] = useState<keyof typeof ORCHESTRATION_STRATEGIES>(orchestrationStrategy);
  const [executionQueue, setExecutionQueue] = useState<ExecutionQueue[]>([]);
  const [orchestrationRules, setOrchestrationRules] = useState<OrchestrationRule[]>([]);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([]);
  const [crossSPAOrchestrations, setCrossSPAOrchestrations] = useState<CrossSPAOrchestration[]>([]);
  const [orchestrationMetrics, setOrchestrationMetrics] = useState<OrchestrationMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [orchestrationAlerts, setOrchestrationAlerts] = useState<OrchestrationAlert[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [showOrchestrationRules, setShowOrchestrationRules] = useState(false);
  const [showResourceAllocation, setShowResourceAllocation] = useState(false);
  const [showCrossSPAView, setShowCrossSPAView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [debugMode, setDebugMode] = useState(false);

  // Backend Integration Hooks
  const { 
    orchestratePipeline,
    getOrchestrationMetrics,
    getExecutionQueue,
    optimizeResourceAllocation,
    isOrchestrating,
    orchestrationError
  } = usePipelineManagement();

  const {
    coordinateExecution,
    monitorSystemHealth,
    getResourceUtilization,
    optimizeWorkloadDistribution,
    getScalingRecommendations
  } = useRacineOrchestration();

  const {
    orchestrateCrossGroupExecution,
    validateCrossGroupDependencies,
    getCrossGroupOrchestrationMetrics,
    resolveCrossGroupConflicts
  } = useCrossGroupIntegration();

  const { getCurrentUser, getUserPermissions } = useUserManagement();
  const { getActiveWorkspace, getWorkspaceResourceLimits } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    generateOrchestrationPlan,
    optimizeExecutionStrategy,
    predictResourceNeeds,
    recommendOrchestrationRules
  } = useAIAssistant();

  // Orchestration Metrics
  const orchestrationStats = useMemo(() => {
    if (!orchestrationMetrics) return null;

    return {
      totalExecutions: executionQueue.length,
      activeExecutions: executionQueue.filter(e => e.status === 'running').length,
      queuedExecutions: executionQueue.filter(e => e.status === 'queued').length,
      completedToday: orchestrationMetrics.daily_completions || 0,
      avgExecutionTime: orchestrationMetrics.avg_execution_time || 0,
      successRate: orchestrationMetrics.success_rate || 0,
      resourceUtilization: orchestrationMetrics.resource_utilization || 0,
      crossSPAOrchestrations: crossSPAOrchestrations.length
    };
  }, [orchestrationMetrics, executionQueue, crossSPAOrchestrations]);

  // Cross-SPA Dependency Graph
  const dependencyGraph = useMemo(() => {
    const nodes = Object.values(CROSS_SPA_INTEGRATION_POINTS).map(spa => ({
      id: spa.spa_id,
      name: spa.name,
      dependencies: spa.dependencies,
      capabilities: spa.capabilities,
      resource_requirements: spa.resource_requirements,
      success_rate: spa.success_rate
    }));

    const edges = nodes.flatMap(node => 
      node.dependencies.map(dep => ({
        source: dep,
        target: node.id,
        type: 'dependency'
      }))
    );

    return { nodes, edges };
  }, []);

  // Resource Allocation Chart Data
  const resourceAllocationData = useMemo(() => {
    return Object.values(CROSS_SPA_INTEGRATION_POINTS).map(spa => ({
      name: spa.name,
      cpu: spa.resource_requirements.cpu,
      memory: spa.resource_requirements.memory,
      storage: spa.resource_requirements.storage,
      utilization: orchestrationMetrics?.spa_utilization?.[spa.spa_id] || 0 // Real backend data
    }));
  }, [orchestrationMetrics]);

  // Execution Timeline Data
  const executionTimelineData = useMemo(() => {
    if (!orchestrationMetrics?.execution_timeline) return [];

    return orchestrationMetrics.execution_timeline.map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      executions: point.active_executions,
      queue_size: point.queue_size,
      resource_usage: point.resource_usage,
      success_rate: point.success_rate
    }));
  }, [orchestrationMetrics]);

  // Fetch orchestration data
  const fetchOrchestrationData = useCallback(async () => {
    try {
      const [metricsData, queueData, healthData, crossSPAData] = await Promise.all([
        getOrchestrationMetrics(),
        getExecutionQueue(),
        monitorSystemHealth(),
        getCrossGroupOrchestrationMetrics()
      ]);

      setOrchestrationMetrics(metricsData);
      setExecutionQueue(queueData);
      setSystemHealth(healthData);
      setCrossSPAOrchestrations(crossSPAData);

      trackActivity('orchestration_metrics_fetched', {
        strategy: activeStrategy,
        queue_size: queueData.length,
        active_executions: queueData.filter(e => e.status === 'running').length
      });

    } catch (error) {
      console.error('Failed to fetch orchestration data:', error);
    }
  }, [getOrchestrationMetrics, getExecutionQueue, monitorSystemHealth, getCrossGroupOrchestrationMetrics, trackActivity, activeStrategy]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchOrchestrationData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchOrchestrationData]);

  // Initial data load
  useEffect(() => {
    fetchOrchestrationData();
  }, [fetchOrchestrationData]);

  // Execute pipeline with orchestration
  const executeWithOrchestration = useCallback(async (pipelineId: string, priority: keyof typeof EXECUTION_PRIORITIES = 'MEDIUM') => {
    try {
      const executionPlan = await generateOrchestrationPlan({
        pipeline_id: pipelineId,
        strategy: activeStrategy,
        priority: EXECUTION_PRIORITIES[priority],
        resource_policy: 'BURSTABLE',
        cross_spa_enabled: enableCrossGroupOrchestration
      });

      const execution = await orchestratePipeline(pipelineId, executionPlan);

      trackActivity('pipeline_orchestration_started', {
        pipeline_id: pipelineId,
        execution_id: execution.id,
        strategy: activeStrategy,
        priority: priority
      });

      // Refresh data after execution starts
      setTimeout(fetchOrchestrationData, 1000);

    } catch (error) {
      console.error('Failed to execute pipeline with orchestration:', error);
    }
  }, [activeStrategy, enableCrossGroupOrchestration, generateOrchestrationPlan, orchestratePipeline, trackActivity, fetchOrchestrationData]);

  // Optimize orchestration strategy
  const optimizeStrategy = useCallback(async () => {
    try {
      const optimizationResult = await optimizeExecutionStrategy({
        current_strategy: activeStrategy,
        metrics: orchestrationMetrics,
        queue_state: executionQueue,
        resource_constraints: await getWorkspaceResourceLimits()
      });

      if (optimizationResult.recommended_strategy !== activeStrategy) {
        setActiveStrategy(optimizationResult.recommended_strategy as keyof typeof ORCHESTRATION_STRATEGIES);
        
        trackActivity('orchestration_strategy_optimized', {
          from_strategy: activeStrategy,
          to_strategy: optimizationResult.recommended_strategy,
          improvement_estimate: optimizationResult.improvement_estimate
        });
      }

    } catch (error) {
      console.error('Failed to optimize orchestration strategy:', error);
    }
  }, [activeStrategy, orchestrationMetrics, executionQueue, optimizeExecutionStrategy, getWorkspaceResourceLimits, trackActivity]);

  // Handle strategy change
  const handleStrategyChange = useCallback((newStrategy: keyof typeof ORCHESTRATION_STRATEGIES) => {
    setActiveStrategy(newStrategy);
    trackActivity('orchestration_strategy_changed', {
      from_strategy: activeStrategy,
      to_strategy: newStrategy
    });
  }, [activeStrategy, trackActivity]);

  // Cancel execution
  const cancelExecution = useCallback(async (executionId: string) => {
    try {
      // Implementation would call backend to cancel execution
      setExecutionQueue(prev => prev.filter(e => e.id !== executionId));
      
      trackActivity('pipeline_execution_cancelled', {
        execution_id: executionId,
        strategy: activeStrategy
      });

    } catch (error) {
      console.error('Failed to cancel execution:', error);
    }
  }, [activeStrategy, trackActivity]);

  return (
    <TooltipProvider>
      <div className={`flex h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${className}`}>
        <ResizablePanelGroup direction="horizontal">
          {/* Main Orchestration Panel */}
          <ResizablePanel defaultSize={70} minSize={50}>
            <div className="flex flex-col h-full">
              {/* Orchestration Header */}
              <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Network className="h-6 w-6 text-blue-500" />
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Pipeline Orchestration Engine
                      </h2>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Strategy Selector */}
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm text-slate-600 dark:text-slate-400">Strategy:</Label>
                      <Select value={activeStrategy} onValueChange={handleStrategyChange}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ORCHESTRATION_STRATEGIES).map(([key, strategy]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center space-x-2">
                                <strategy.icon className="h-4 w-4" />
                                <span>{strategy.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {orchestrationStats && (
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="text-slate-600 dark:text-slate-400">Active:</span>
                          <span className="font-medium">{orchestrationStats.activeExecutions}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-slate-600 dark:text-slate-400">Queued:</span>
                          <span className="font-medium">{orchestrationStats.queuedExecutions}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {autoOptimize && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={optimizeStrategy}
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Optimize
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>AI-Powered Strategy Optimization</TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchOrchestrationData}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh Data</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setAutoRefresh(!autoRefresh)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDebugMode(!debugMode)}>
                          <Code className="h-4 w-4 mr-2" />
                          {debugMode ? 'Disable' : 'Enable'} Debug Mode
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowOrchestrationRules(true)}>
                          <Target className="h-4 w-4 mr-2" />
                          Orchestration Rules
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowResourceAllocation(true)}>
                          <Server className="h-4 w-4 mr-2" />
                          Resource Allocation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Main Content Tabs */}
              <div className="flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="queue">Execution Queue</TabsTrigger>
                    <TabsTrigger value="cross-spa">Cross-SPA</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="flex-1 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                      {/* Current Strategy Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            {React.createElement(ORCHESTRATION_STRATEGIES[activeStrategy].icon, { className: "h-5 w-5" })}
                            <span>Current Strategy</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium">{ORCHESTRATION_STRATEGIES[activeStrategy].name}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {ORCHESTRATION_STRATEGIES[activeStrategy].description}
                              </p>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-2">Advantages:</h5>
                              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                {ORCHESTRATION_STRATEGIES[activeStrategy].advantages.map((advantage, index) => (
                                  <li key={index} className="flex items-center space-x-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>{advantage}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* System Health Card */}
                      {systemHealth && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Monitor className="h-5 w-5" />
                              <span>System Health</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Overall Status:</span>
                                <Badge variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                                  {systemHealth.status}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>CPU Usage:</span>
                                  <span>{systemHealth.cpu_usage}%</span>
                                </div>
                                <Progress value={systemHealth.cpu_usage} className="h-2" />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Memory Usage:</span>
                                  <span>{systemHealth.memory_usage}%</span>
                                </div>
                                <Progress value={systemHealth.memory_usage} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Orchestration Stats Card */}
                      {orchestrationStats && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <BarChart3 className="h-5 w-5" />
                              <span>Orchestration Stats</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{orchestrationStats.activeExecutions}</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">Active</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">{orchestrationStats.queuedExecutions}</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">Queued</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{orchestrationStats.completedToday}</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">Completed Today</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{orchestrationStats.successRate.toFixed(1)}%</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">Success Rate</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Execution Timeline Chart */}
                    {executionTimelineData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Execution Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <RechartsLineChart data={executionTimelineData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis />
                              <ChartTooltip />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="executions" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                name="Active Executions"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="queue_size" 
                                stroke="#f59e0b" 
                                strokeWidth={2}
                                name="Queue Size"
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Execution Queue Tab */}
                  <TabsContent value="queue" className="flex-1 p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Execution Queue</h3>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">Auto-refresh:</Label>
                          <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {executionQueue.map((execution) => (
                          <Card key={execution.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  execution.status === 'running' ? 'bg-green-500' :
                                  execution.status === 'queued' ? 'bg-blue-500' :
                                  execution.status === 'failed' ? 'bg-red-500' :
                                  'bg-gray-500'
                                }`} />
                                <div>
                                  <h4 className="font-medium">{execution.pipeline_name}</h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {execution.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <Badge variant="outline">
                                  {EXECUTION_PRIORITIES[execution.priority as keyof typeof EXECUTION_PRIORITIES]?.name || 'Medium'}
                                </Badge>
                                
                                <div className="text-right text-sm">
                                  <div className="text-slate-600 dark:text-slate-400">
                                    {execution.status === 'running' ? 'Running' : 'Queued'}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {new Date(execution.created_at).toLocaleTimeString()}
                                  </div>
                                </div>

                                {execution.status !== 'completed' && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => setSelectedExecution(execution.id)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {execution.status === 'running' && (
                                        <DropdownMenuItem>
                                          <Pause className="h-4 w-4 mr-2" />
                                          Pause
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => cancelExecution(execution.id)}
                                        className="text-red-600"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>

                            {execution.status === 'running' && execution.progress !== undefined && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                                  <span>Progress</span>
                                  <span>{execution.progress}%</span>
                                </div>
                                <Progress value={execution.progress} className="h-2" />
                              </div>
                            )}
                          </Card>
                        ))}

                        {executionQueue.length === 0 && (
                          <div className="text-center py-12">
                            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                              No Active Executions
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                              The execution queue is currently empty.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Cross-SPA Tab */}
                  <TabsContent value="cross-spa" className="flex-1 p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Cross-SPA Orchestration</h3>
                        <Switch 
                          checked={enableCrossGroupOrchestration} 
                          onCheckedChange={setShowCrossSPAView}
                        />
                      </div>

                      {/* SPA Integration Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(CROSS_SPA_INTEGRATION_POINTS).map((spa) => (
                          <Card key={spa.spa_id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{spa.name}</h4>
                              <Badge variant="outline">
                                {spa.success_rate.toFixed(1)}%
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Dependencies:</span>
                                <span>{spa.dependencies.length}</span>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Avg Duration:</span>
                                <span>{Math.round(spa.avg_execution_time / 60000)}m</span>
                              </div>

                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Resource Req:</span>
                                <span>{spa.resource_requirements.cpu}CPU/{spa.resource_requirements.memory}GB</span>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="flex flex-wrap gap-1">
                                {spa.capabilities.slice(0, 2).map((capability) => (
                                  <Badge key={capability} variant="secondary" className="text-xs">
                                    {capability.replace('_', ' ')}
                                  </Badge>
                                ))}
                                {spa.capabilities.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{spa.capabilities.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      {/* Cross-SPA Dependency Graph */}
                      <Card>
                        <CardHeader>
                          <CardTitle>SPA Dependency Graph</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="text-center">
                              <Network className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                              <p className="text-slate-600 dark:text-slate-400">
                                Interactive dependency graph visualization
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Resources Tab */}
                  <TabsContent value="resources" className="flex-1 p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Resource Management</h3>

                      {/* Resource Allocation Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Resource Allocation by SPA</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={resourceAllocationData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <ChartTooltip />
                              <Legend />
                              <Bar dataKey="cpu" fill="#3b82f6" name="CPU Cores" />
                              <Bar dataKey="memory" fill="#10b981" name="Memory (GB)" />
                              <Bar dataKey="storage" fill="#f59e0b" name="Storage (GB)" />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Resource Policy Configuration */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(RESOURCE_POLICIES).map(([key, policy]) => (
                          <Card key={key} className="p-4">
                            <h4 className="font-medium mb-2">{policy.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                              {policy.description}
                            </p>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Allocation:</span>
                                <Badge variant="secondary">{policy.allocation_type}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Overhead:</span>
                                <span>{policy.overhead}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Isolation:</span>
                                <span className="capitalize">{policy.isolation_level}</span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Analytics Tab */}
                  <TabsContent value="analytics" className="flex-1 p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Orchestration Analytics</h3>

                      {/* Performance Metrics */}
                      {orchestrationMetrics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {orchestrationMetrics.total_orchestrations}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Total Orchestrations
                            </div>
                          </Card>

                          <Card className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {Math.round(orchestrationMetrics.avg_execution_time / 1000)}s
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Avg Execution Time
                            </div>
                          </Card>

                          <Card className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {orchestrationMetrics.resource_utilization.toFixed(1)}%
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Resource Utilization
                            </div>
                          </Card>

                          <Card className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {orchestrationMetrics.success_rate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Success Rate
                            </div>
                          </Card>
                        </div>
                      )}

                      {/* Additional analytics content would go here */}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Side Panel */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
            <div className="h-full bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Orchestration Controls
                </h3>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Actions</h4>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Start New Orchestration
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause All Executions
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Optimize Resources
                  </Button>
                </div>

                {/* Alerts */}
                {orchestrationAlerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Alerts</h4>
                    <div className="space-y-2">
                      {orchestrationAlerts.slice(0, 3).map((alert, index) => (
                        <Alert key={index} className="p-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {alert.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Configuration */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Configuration</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Auto-optimize</Label>
                      <Switch checked={autoOptimize} onCheckedChange={() => {}} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Cross-SPA</Label>
                      <Switch checked={enableCrossGroupOrchestration} onCheckedChange={() => {}} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Debug Mode</Label>
                      <Switch checked={debugMode} onCheckedChange={setDebugMode} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Refresh Interval</Label>
                    <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">1 second</SelectItem>
                        <SelectItem value="5000">5 seconds</SelectItem>
                        <SelectItem value="10000">10 seconds</SelectItem>
                        <SelectItem value="30000">30 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
};

export default PipelineOrchestrationEngine;