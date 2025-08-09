'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import {
  ActivityIcon,
  AlertTriangleIcon,
  BarChartIcon,
  CpuIcon,
  DatabaseIcon,
  DollarSignIcon,
  GaugeIcon,
  HardDriveIcon,
  MemoryStickIcon,
  MonitorIcon,
  NetworkIcon,
  OptimizeIcon,
  PieChartIcon,
  ServerIcon,
  SettingsIcon,
  TrendingUpIcon,
  ZapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  RefreshCwIcon,
  MoreHorizontalIcon
} from 'lucide-react';

// Racine System Integration
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import {
  getResourceUsage,
  allocateResources,
  deallocateResources,
  optimizeResourceAllocation,
  getResourceMetrics,
  getResourcePools,
  createResourcePool,
  updateResourcePool,
  deleteResourcePool,
  getResourceHistory,
  getResourcePredictions,
  configureAutoScaling,
  getCostAnalysis,
  getResourceRecommendations,
  setResourceQuotas,
  getResourceAlerts,
  optimizeResourceCosts,
  monitorResourceHealth,
  getResourceTopology,
  scheduleResourceMaintenance
} from '../../utils/pipeline-backend-integration';

// Types from racine-core.types
import {
  ResourcePool,
  ResourceAllocation,
  ResourceUsage,
  ResourceMetrics,
  ResourceQuota,
  ResourceAlert,
  ResourceOptimization,
  ResourcePrediction,
  AutoScalingConfig,
  CostAnalysis,
  ResourceRecommendation,
  ResourceHealth,
  ResourceTopology,
  ResourceMaintenance,
  PipelineResource,
  ResourceConstraint,
  ResourcePolicy,
  ResourceMonitoring,
  ResourceGovernance,
  ResourceCompliance,
  CrossSPAResourceMapping,
  ResourceLifecycle,
  ResourceSecurity
} from '../../types/racine-core.types';

interface PipelineResourceManagerProps {
  pipelineId?: string;
  workspaceId: string;
  className?: string;
}

interface ResourceManagerState {
  resourcePools: ResourcePool[];
  allocations: ResourceAllocation[];
  usage: ResourceUsage;
  metrics: ResourceMetrics;
  alerts: ResourceAlert[];
  recommendations: ResourceRecommendation[];
  selectedPool: ResourcePool | null;
  selectedAllocation: ResourceAllocation | null;
  activeTab: string;
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  autoRefresh: boolean;
  showCreateDialog: boolean;
  showOptimizeDialog: boolean;
  showScalingDialog: boolean;
  loading: boolean;
  error: string | null;
  costAnalysis: CostAnalysis | null;
  predictions: ResourcePrediction[];
}

export const PipelineResourceManager: React.FC<PipelineResourceManagerProps> = ({
  pipelineId,
  workspaceId,
  className = ''
}) => {
  // Racine System Hooks
  const {
    pipelines,
    getResourceRequirements,
    optimizePipelineResources
  } = usePipelineManagement();

  const {
    orchestrateResourceAllocation,
    getResourceOrchestrationMetrics,
    optimizeResourceDistribution
  } = useRacineOrchestration();

  const {
    getCrossGroupResourceMappings,
    validateResourceCompatibility,
    optimizeCrossGroupResources
  } = useCrossGroupIntegration();

  const { currentUser, userPermissions } = useUserManagement();
  const { currentWorkspace, workspaceResources } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    getAIRecommendations, 
    optimizeWithAI,
    predictResourceNeeds 
  } = useAIAssistant();

  // Component State
  const [state, setState] = useState<ResourceManagerState>({
    resourcePools: [],
    allocations: [],
    usage: {
      cpu: { current: 0, maximum: 0, average: 0 },
      memory: { current: 0, maximum: 0, average: 0 },
      storage: { current: 0, maximum: 0, average: 0 },
      network: { current: 0, maximum: 0, average: 0 }
    },
    metrics: {
      totalAllocated: 0,
      totalUsed: 0,
      efficiency: 0,
      cost: 0,
      timestamp: new Date()
    },
    alerts: [],
    recommendations: [],
    selectedPool: null,
    selectedAllocation: null,
    activeTab: 'overview',
    timeRange: '24h',
    autoRefresh: true,
    showCreateDialog: false,
    showOptimizeDialog: false,
    showScalingDialog: false,
    loading: false,
    error: null,
    costAnalysis: null,
    predictions: []
  });

  const [newPool, setNewPool] = useState<Partial<ResourcePool>>({
    name: '',
    type: 'compute',
    capacity: {},
    autoScaling: false,
    policies: {}
  });

  // Load Resource Data
  useEffect(() => {
    loadResourceData();
    
    if (state.autoRefresh) {
      const interval = setInterval(loadResourceData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [workspaceId, pipelineId, state.timeRange, state.autoRefresh]);

  const loadResourceData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [
        pools,
        allocations,
        usage,
        metrics,
        alerts,
        recommendations,
        costAnalysis,
        predictions
      ] = await Promise.all([
        getResourcePools({ workspaceId, pipelineId }),
        getResourceUsage({ workspaceId, pipelineId }),
        getResourceUsage({ workspaceId, pipelineId, timeRange: state.timeRange }),
        getResourceMetrics({ workspaceId, timeRange: state.timeRange }),
        getResourceAlerts({ workspaceId, severity: 'all' }),
        getResourceRecommendations({ workspaceId, pipelineId }),
        getCostAnalysis({ workspaceId, timeRange: state.timeRange }),
        getResourcePredictions({ workspaceId, horizon: '7d' })
      ]);

      setState(prev => ({
        ...prev,
        resourcePools: pools,
        allocations: allocations,
        usage,
        metrics,
        alerts,
        recommendations,
        costAnalysis,
        predictions,
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load resource data'
      }));
    }
  }, [workspaceId, pipelineId, state.timeRange]);

  // Resource Pool Management
  const handleCreatePool = useCallback(async () => {
    if (!newPool.name || !newPool.type) {
      setState(prev => ({ ...prev, error: 'Pool name and type are required' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      const poolData: Partial<ResourcePool> = {
        ...newPool,
        workspaceId,
        createdBy: currentUser?.id,
        createdAt: new Date(),
        status: 'active'
      };

      const createdPool = await createResourcePool(poolData);

      setState(prev => ({
        ...prev,
        resourcePools: [...prev.resourcePools, createdPool],
        showCreateDialog: false,
        loading: false
      }));

      setNewPool({
        name: '',
        type: 'compute',
        capacity: {},
        autoScaling: false,
        policies: {}
      });

      trackActivity({
        action: 'resource_pool_created',
        resource: 'resource_pool',
        resourceId: createdPool.id,
        metadata: { name: createdPool.name, type: createdPool.type }
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create resource pool'
      }));
    }
  }, [newPool, workspaceId, currentUser, trackActivity]);

  const handleOptimizeResources = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const optimization = await optimizeResourceAllocation({
        workspaceId,
        pipelineId,
        strategy: 'cost_efficiency',
        constraints: {
          maxCost: state.costAnalysis?.budget,
          minPerformance: 0.8,
          maxLatency: 5000
        }
      });

      // Apply optimization recommendations
      for (const recommendation of optimization.recommendations) {
        await allocateResources({
          poolId: recommendation.poolId,
          allocation: recommendation.allocation,
          pipelineId
        });
      }

      setState(prev => ({ ...prev, showOptimizeDialog: false, loading: false }));

      // Reload data to see changes
      loadResourceData();

      trackActivity({
        action: 'resources_optimized',
        resource: 'resource_optimization',
        metadata: { 
          savings: optimization.estimatedSavings,
          efficiencyGain: optimization.efficiencyImprovement
        }
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to optimize resources'
      }));
    }
  }, [workspaceId, pipelineId, state.costAnalysis, loadResourceData, trackActivity]);

  // Metrics and Monitoring
  const getResourceUtilization = useCallback(() => {
    if (!state.usage) return 0;
    
    const totalCapacity = Object.values(state.usage).reduce((sum, resource) => 
      sum + (resource.maximum || 0), 0
    );
    const totalUsed = Object.values(state.usage).reduce((sum, resource) => 
      sum + (resource.current || 0), 0
    );
    
    return totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;
  }, [state.usage]);

  const getResourceEfficiency = useCallback(() => {
    return state.metrics.efficiency || 0;
  }, [state.metrics]);

  const getCostSavings = useCallback(() => {
    return state.costAnalysis?.savings || 0;
  }, [state.costAnalysis]);

  // Chart Data Processing
  const getUsageChartData = useMemo(() => {
    return state.metrics?.history?.map(point => ({
      timestamp: new Date(point.timestamp).toLocaleDateString(),
      cpu: point.cpu?.current || 0,
      memory: point.memory?.current || 0,
      storage: point.storage?.current || 0,
      network: point.network?.current || 0
    })) || [];
  }, [state.metrics]);

  const getCostChartData = useMemo(() => {
    return state.costAnalysis?.breakdown?.map(item => ({
      name: item.category,
      value: item.cost,
      percentage: item.percentage
    })) || [];
  }, [state.costAnalysis]);

  const getResourceDistribution = useMemo(() => {
    return state.resourcePools.map(pool => ({
      name: pool.name,
      allocated: pool.allocated || 0,
      available: pool.capacity?.total - pool.allocated || 0,
      utilization: ((pool.allocated || 0) / (pool.capacity?.total || 1)) * 100
    }));
  }, [state.resourcePools]);

  // Render Resource Cards
  const renderResourceCard = useCallback((resource: string, data: any, icon: React.ReactNode) => (
    <Card key={resource} className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h3 className="font-semibold capitalize">{resource}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {data.current || 0} / {data.maximum || 0} {resource === 'storage' ? 'GB' : resource === 'network' ? 'Mbps' : '%'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {Math.round(((data.current || 0) / (data.maximum || 1)) * 100)}%
            </div>
            <div className="text-xs text-slate-500">Utilization</div>
          </div>
        </div>
        <div className="mt-4">
          <Progress 
            value={((data.current || 0) / (data.maximum || 1)) * 100} 
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  ), []);

  // Render Resource Pool Card
  const renderPoolCard = useCallback((pool: ResourcePool) => (
    <Card key={pool.id} className="transition-all hover:shadow-md cursor-pointer" 
          onClick={() => setState(prev => ({ ...prev, selectedPool: pool }))}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ServerIcon className="h-5 w-5 text-blue-500" />
            {pool.name}
          </CardTitle>
          <Badge variant={pool.status === 'active' ? 'default' : 'secondary'}>
            {pool.status}
          </Badge>
        </div>
        <CardDescription>
          {pool.type} pool • {pool.capacity?.total || 0} total capacity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Utilization</span>
              <span>{Math.round(((pool.allocated || 0) / (pool.capacity?.total || 1)) * 100)}%</span>
            </div>
            <Progress value={((pool.allocated || 0) / (pool.capacity?.total || 1)) * 100} className="h-2" />
          </div>
          
          {pool.autoScaling && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <ZapIcon className="h-4 w-4" />
              Auto-scaling enabled
            </div>
          )}
          
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Allocated: {pool.allocated || 0}</span>
            <span>Available: {(pool.capacity?.total || 0) - (pool.allocated || 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ), []);

  // Main Render
  return (
    <TooltipProvider>
      <div className={`pipeline-resource-manager h-full flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 ${className}`}>
        {/* Header */}
        <div className="flex-none border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <ServerIcon className="h-7 w-7 text-blue-500" />
                  Resource Manager
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Monitor and optimize pipeline resource allocation
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={state.timeRange} onValueChange={(value: any) => setState(prev => ({ ...prev, timeRange: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                >
                  <RefreshCwIcon className={`h-4 w-4 mr-2 ${state.autoRefresh ? 'animate-spin' : ''}`} />
                  {state.autoRefresh ? 'Auto' : 'Manual'}
                </Button>
                <Button
                  onClick={() => setState(prev => ({ ...prev, showOptimizeDialog: true }))}
                  size="sm"
                >
                  <OptimizeIcon className="h-4 w-4 mr-2" />
                  Optimize
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Utilization</p>
                      <p className="text-2xl font-bold">{Math.round(getResourceUtilization())}%</p>
                    </div>
                    <GaugeIcon className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Efficiency</p>
                      <p className="text-2xl font-bold">{Math.round(getResourceEfficiency())}%</p>
                    </div>
                    <TrendingUpIcon className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Cost</p>
                      <p className="text-2xl font-bold">${state.metrics.cost || 0}</p>
                    </div>
                    <DollarSignIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Alerts</p>
                      <p className="text-2xl font-bold">{state.alerts.length}</p>
                    </div>
                    <AlertTriangleIcon className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value }))} className="h-full flex flex-col">
            <div className="flex-none px-6 pt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pools">Resource Pools</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
                <TabsTrigger value="optimization">Optimization</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="overview" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Resource Usage Cards */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {renderResourceCard('cpu', state.usage.cpu, <CpuIcon className="h-6 w-6 text-blue-500" />)}
                        {renderResourceCard('memory', state.usage.memory, <MemoryStickIcon className="h-6 w-6 text-green-500" />)}
                        {renderResourceCard('storage', state.usage.storage, <HardDriveIcon className="h-6 w-6 text-yellow-500" />)}
                        {renderResourceCard('network', state.usage.network, <NetworkIcon className="h-6 w-6 text-purple-500" />)}
                      </div>
                    </div>

                    {/* Usage Trends Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Usage Trends</CardTitle>
                        <CardDescription>Resource utilization over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getUsageChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="timestamp" />
                              <YAxis />
                              <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                              <Area type="monotone" dataKey="memory" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                              <Area type="monotone" dataKey="storage" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                              <Area type="monotone" dataKey="network" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Alerts and Recommendations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
                            Active Alerts
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {state.alerts.length > 0 ? (
                              state.alerts.map(alert => (
                                <div key={alert.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <AlertTriangleIcon className="h-4 w-4 text-orange-500 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-medium">{alert.title}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{alert.description}</p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                                  </div>
                                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                                    {alert.severity}
                                  </Badge>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-6 text-slate-500">
                                <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                <p>No active alerts</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <InfoIcon className="h-5 w-5 text-blue-500" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {state.recommendations.length > 0 ? (
                              state.recommendations.map(rec => (
                                <div key={rec.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-medium">{rec.title}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{rec.description}</p>
                                    {rec.estimatedSavings && (
                                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        Potential savings: ${rec.estimatedSavings}
                                      </p>
                                    )}
                                  </div>
                                  <Button size="sm" variant="outline">
                                    Apply
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-6 text-slate-500">
                                <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                <p>All resources optimized</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="pools" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Resource Pools</h3>
                      <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                        <ServerIcon className="h-4 w-4 mr-2" />
                        Create Pool
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {state.resourcePools.map(renderPoolCard)}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="monitoring" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Real-time Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Real-time Monitoring</CardTitle>
                        <CardDescription>Live resource usage and performance metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getUsageChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="timestamp" />
                              <YAxis />
                              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} />
                              <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} />
                              <Line type="monotone" dataKey="storage" stroke="#f59e0b" strokeWidth={2} />
                              <Line type="monotone" dataKey="network" stroke="#8b5cf6" strokeWidth={2} />
                              <Legend />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Resource Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Resource Distribution</CardTitle>
                        <CardDescription>Allocation across resource pools</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getResourceDistribution}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Bar dataKey="allocated" fill="#3b82f6" />
                              <Bar dataKey="available" fill="#e2e8f0" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="costs" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Cost Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <DollarSignIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Cost</p>
                            <p className="text-2xl font-bold">${state.costAnalysis?.total || 0}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <TrendingUpIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">Cost Trend</p>
                            <p className="text-2xl font-bold">{state.costAnalysis?.trend || 0}%</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <DollarSignIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">Potential Savings</p>
                            <p className="text-2xl font-bold">${getCostSavings()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Cost Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Breakdown</CardTitle>
                        <CardDescription>Resource costs by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getCostChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                              >
                                {getCostChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={`hsl(${index * 137.5}, 70%, 50%)`} />
                                ))}
                              </Pie>
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="optimization" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Optimization Controls */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Resource Optimization</CardTitle>
                        <CardDescription>AI-powered resource allocation optimization</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Auto-optimization</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Automatically optimize resource allocation based on usage patterns
                            </p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Cost optimization</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Prioritize cost savings in optimization decisions
                            </p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Performance optimization</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Prioritize performance in optimization decisions
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Predictions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Resource Predictions</CardTitle>
                        <CardDescription>AI predictions for future resource needs</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {state.predictions.map(prediction => (
                            <div key={prediction.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{prediction.resource}</h4>
                                <Badge variant={prediction.trend === 'increasing' ? 'destructive' : 'default'}>
                                  {prediction.trend}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                {prediction.description}
                              </p>
                              <div className="flex justify-between text-sm">
                                <span>Predicted usage: {prediction.predictedUsage}%</span>
                                <span>Confidence: {Math.round(prediction.confidence * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Create Pool Dialog */}
        <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Resource Pool</DialogTitle>
              <DialogDescription>Configure a new resource pool for pipeline execution</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pool Name</Label>
                  <Input
                    value={newPool.name}
                    onChange={(e) => setNewPool(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter pool name..."
                  />
                </div>
                <div>
                  <Label>Pool Type</Label>
                  <Select value={newPool.type} onValueChange={(value) => setNewPool(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compute">Compute</SelectItem>
                      <SelectItem value="memory">Memory</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newPool.autoScaling}
                  onCheckedChange={(checked) => setNewPool(prev => ({ ...prev, autoScaling: checked }))}
                />
                <Label>Enable auto-scaling</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
                Cancel
              </Button>
              <Button onClick={handleCreatePool} disabled={state.loading}>
                {state.loading ? 'Creating...' : 'Create Pool'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Optimize Dialog */}
        <Dialog open={state.showOptimizeDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showOptimizeDialog: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Optimize Resources</DialogTitle>
              <DialogDescription>AI-powered resource optimization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">Optimization Preview</h4>
                <ul className="text-sm space-y-1">
                  <li>• Estimated cost savings: ${getCostSavings()}</li>
                  <li>• Performance improvement: +15%</li>
                  <li>• Resource efficiency: +22%</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showOptimizeDialog: false }))}>
                Cancel
              </Button>
              <Button onClick={handleOptimizeResources} disabled={state.loading}>
                {state.loading ? 'Optimizing...' : 'Apply Optimization'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Error Display */}
        {state.error && (
          <Alert className="m-6 border-red-200 dark:border-red-800">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  );
};