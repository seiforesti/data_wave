'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

// Racine System Hooks
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import {
  monitorPipelineHealth,
  getPipelineHealthMetrics,
  generateHealthAlerts,
  diagnosePipelineIssues,
  getHealthTrends,
  validatePipelineIntegrity,
  getSystemHealthStatus,
  monitorResourceHealth,
  analyzeHealthPatterns,
  predictHealthIssues,
  getComplianceHealthStatus,
  validateCrossGroupHealth
} from '../../utils/pipeline-backend-integration';

// Types from racine-core.types
import {
  Pipeline,
  PipelineHealth,
  HealthMetrics,
  HealthAlert,
  HealthTrend,
  HealthDiagnostic,
  SystemHealth,
  ResourceHealth,
  ComplianceHealth,
  HealthStatus,
  HealthThreshold,
  HealthMonitorConfig,
  HealthReport,
  HealthPrediction,
  HealthIncident,
  PerformanceHealth,
  SecurityHealth,
  DataQualityHealth,
  HealthPattern
} from '../../types/racine-core.types';

// Icons
import {
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Server,
  Database,
  Network,
  Cpu,
  MemoryStick,
  HardDrive,
  Gauge,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  Info,
  Settings,
  Filter,
  Download,
  Eye,
  Bell,
  Search,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Wrench
} from 'lucide-react';

// Advanced Chart Components
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, PieChart as RechartsPieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface PipelineHealthMonitorProps {
  pipelineId: string;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onHealthAlert?: (alert: HealthAlert) => void;
  onHealthCritical?: (incident: HealthIncident) => void;
}

export default function PipelineHealthMonitor({
  pipelineId,
  className,
  autoRefresh = true,
  refreshInterval = 5000,
  onHealthAlert,
  onHealthCritical
}: PipelineHealthMonitorProps) {
  // Racine System Hooks
  const {
    pipelines,
    healthMetrics,
    loading: pipelineLoading,
    error: pipelineError,
    getPipelineDetails,
    getHealthStatus
  } = usePipelineManagement();

  const {
    getSystemStatus,
    orchestrateHealthCheck,
    getResourceStatus
  } = useRacineOrchestration();

  const {
    validateCrossGroupHealth: validateSPAHealth,
    getCrossGroupHealthMetrics,
    getIntegrationHealth
  } = useCrossGroupIntegration();

  const { currentUser, permissions } = useUserManagement();
  const { currentWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { analyzeWithAI, getHealthInsights } = useAIAssistant();

  // Component State
  const [activeTab, setActiveTab] = useState('overview');
  const [currentHealth, setCurrentHealth] = useState<PipelineHealth | null>(null);
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<HealthAlert[]>([]);
  const [healthDiagnostics, setHealthDiagnostics] = useState<HealthDiagnostic[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [resourceHealth, setResourceHealth] = useState<ResourceHealth | null>(null);
  const [complianceHealth, setComplianceHealth] = useState<ComplianceHealth | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [healthConfig, setHealthConfig] = useState<HealthMonitorConfig>({
    enableAlerts: true,
    alertThresholds: {
      critical: 90,
      warning: 70,
      info: 50
    },
    monitoringInterval: 5000,
    enablePredictions: true,
    enableDiagnostics: true
  });
  const [healthIncidents, setHealthIncidents] = useState<HealthIncident[]>([]);
  const [healthPredictions, setHealthPredictions] = useState<HealthPrediction[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Load Health Data
  useEffect(() => {
    if (pipelineId) {
      loadHealthData();
    }
  }, [pipelineId]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && isMonitoring) {
      const interval = setInterval(() => {
        loadHealthData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, isMonitoring, refreshInterval]);

  const loadHealthData = async () => {
    try {
      setIsMonitoring(true);

      // Load current health status
      const health = await monitorPipelineHealth(pipelineId);
      setCurrentHealth(health);

      // Load health metrics
      const metrics = await getPipelineHealthMetrics(pipelineId);
      
      // Load health trends
      const trends = await getHealthTrends(pipelineId);
      setHealthTrends(trends);

      // Load active alerts
      const alerts = await generateHealthAlerts(pipelineId);
      setActiveAlerts(alerts);

      // Check for critical alerts
      const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
      criticalAlerts.forEach(alert => {
        if (onHealthAlert) onHealthAlert(alert);
        if (alert.severity === 'critical' && onHealthCritical) {
          onHealthCritical({
            id: alert.id,
            type: 'health_critical',
            description: alert.message,
            timestamp: new Date().toISOString(),
            severity: 'critical',
            source: 'pipeline_health_monitor'
          });
        }
      });

      // Load diagnostics
      const diagnostics = await diagnosePipelineIssues(pipelineId);
      setHealthDiagnostics(diagnostics);

      // Load system health
      const sysHealth = await getSystemHealthStatus();
      setSystemHealth(sysHealth);

      // Load resource health
      const resHealth = await monitorResourceHealth(pipelineId);
      setResourceHealth(resHealth);

      // Load compliance health
      const compHealth = await getComplianceHealthStatus(pipelineId);
      setComplianceHealth(compHealth);

      // Load health predictions
      const predictions = await predictHealthIssues(pipelineId);
      setHealthPredictions(predictions);

      setLastUpdated(new Date());

      // Track activity
      await trackActivity('pipeline_health_monitored', {
        pipelineId,
        healthScore: health.overallScore,
        alertCount: alerts.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setIsMonitoring(false);
    }
  };

  const getHealthStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'unknown': return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getHealthStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'unknown': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredAlerts = useMemo(() => {
    return activeAlerts.filter(alert => {
      if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
      if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
      return true;
    });
  }, [activeAlerts, filterStatus, filterSeverity]);

  if (pipelineLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading Health Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`pipeline-health-monitor h-full ${className}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center">
                <Heart className="h-8 w-8 mr-3 text-red-500" />
                Pipeline Health Monitor
              </h2>
              <p className="text-muted-foreground">
                Real-time health monitoring and diagnostics
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                <Activity className="h-3 w-3 mr-1" />
                Live Monitoring
              </Badge>
              <Button
                onClick={() => loadHealthData()}
                disabled={isMonitoring}
                variant="outline"
              >
                {isMonitoring ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
              <Switch
                checked={autoRefresh}
                onCheckedChange={() => setIsMonitoring(!isMonitoring)}
              />
            </div>
          </div>

          {/* Health Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentHealth?.overallScore || 85}%
                </div>
                <Progress value={currentHealth?.overallScore || 85} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {getHealthStatusIcon(currentHealth?.status || 'healthy')}
                  <span className="ml-1">{currentHealth?.status || 'Healthy'}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAlerts.length}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="destructive" className="text-xs">
                    {activeAlerts.filter(a => a.severity === 'critical').length} Critical
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    {activeAlerts.filter(a => a.severity === 'warning').length} Warning
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resource Health</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resourceHealth?.overallScore || 78}%
                </div>
                <Progress value={resourceHealth?.overallScore || 78} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  CPU: {resourceHealth?.cpu || 65}% | Memory: {resourceHealth?.memory || 72}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lastUpdated.toLocaleTimeString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Health Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Health Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemHealth?.components?.map((component, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          {getHealthStatusIcon(component.status)}
                          <div>
                            <h4 className="font-medium">{component.name}</h4>
                            <p className="text-sm text-muted-foreground">{component.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{component.health}%</div>
                          <Badge className={getHealthStatusColor(component.status)}>
                            {component.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-6">
              {/* Alert Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Severity</Label>
                      <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alert List */}
              <div className="space-y-4">
                {filteredAlerts.map((alert, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getHealthStatusIcon(alert.severity as HealthStatus)}
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'warning' ? 'default' : 'secondary'
                            }>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Component: {alert.component}</span>
                            <span>Time: {new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          {alert.status === 'active' && (
                            <Button size="sm" variant="outline">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Diagnostics Tab */}
            <TabsContent value="diagnostics" className="space-y-6">
              <div className="space-y-4">
                {healthDiagnostics.map((diagnostic, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Wrench className="h-5 w-5 mr-2" />
                        {diagnostic.component}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="font-medium">Issue</Label>
                          <p className="text-sm">{diagnostic.issue}</p>
                        </div>
                        <div>
                          <Label className="font-medium">Root Cause</Label>
                          <p className="text-sm">{diagnostic.rootCause}</p>
                        </div>
                        <div>
                          <Label className="font-medium">Recommendation</Label>
                          <p className="text-sm">{diagnostic.recommendation}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={diagnostic.severity === 'high' ? 'destructive' : 'default'}>
                            {diagnostic.severity} severity
                          </Badge>
                          <Badge variant="outline">
                            {diagnostic.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Health Trends Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsLineChart data={healthTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="availability" stroke="#f59e0b" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>CPU & Memory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={resourceHealth?.usage || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                        <Area type="monotone" dataKey="memory" stackId="1" stroke="#10b981" fill="#10b981" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Network & Storage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={resourceHealth?.networkStorage || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="network" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                        <Area type="monotone" dataKey="storage" stackId="1" stroke="#ef4444" fill="#ef4444" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-6">
              <div className="space-y-4">
                {healthPredictions.map((prediction, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{prediction.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {prediction.description}
                          </p>
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline">
                              Probability: {Math.round(prediction.probability * 100)}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Expected: {prediction.timeframe}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Target className="h-4 w-4 mr-1" />
                          Mitigate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}