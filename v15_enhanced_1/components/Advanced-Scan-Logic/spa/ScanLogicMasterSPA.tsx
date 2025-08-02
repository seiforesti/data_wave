'use client';

/**
 * 🎯 Scan Logic Master SPA - Advanced Scan Logic Orchestration Hub
 * ==============================================================
 * 
 * The central orchestration SPA for the Advanced-Scan-Logic group, providing
 * comprehensive management and coordination across all 8 subgroups:
 * 
 * 1. Advanced Analytics - Predictive analytics, ML insights, and business intelligence
 * 2. Performance Optimization - Resource optimization, caching, and load balancing  
 * 3. Real-Time Monitoring - Live metrics, alerting, and telemetry collection
 * 4. Scan Coordination - Multi-system coordination and conflict resolution
 * 5. Scan Intelligence - AI-powered pattern recognition and anomaly detection
 * 6. Scan Orchestration - Unified orchestration and workflow management
 * 7. Security Compliance - Access control, audit trails, and threat detection
 * 8. Workflow Management - Approval workflows, dependency resolution, and version control
 * 
 * Features:
 * - Enterprise-grade unified dashboard with real-time orchestration
 * - Advanced workflow coordination across all scan operations
 * - Intelligent resource allocation and performance optimization
 * - Comprehensive security and compliance monitoring
 * - Cross-system integration and coordination
 * - AI-powered insights and predictive analytics
 * - Real-time monitoring and alerting systems
 * - Advanced analytics and business intelligence
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  BarChart3, 
  Brain, 
  Shield, 
  Workflow, 
  Zap, 
  Eye, 
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Database,
  Network,
  Cpu,
  HardDrive,
  Monitor,
  Globe,
  Lock,
  Unlock,
  Users,
  FileText,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  Share,
  Bell,
  Home,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  Target,
  Layers,
  Command,
  Sparkles,
  Lightbulb,
  Rocket
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Chart Components
import { Line, LineChart, Bar, BarChart, Area, AreaChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

// Toast notifications
import { toast } from 'sonner';

// Advanced Scan Logic Components
import { AdvancedAnalyticsDashboard } from '../components/advanced-analytics/AdvancedAnalyticsDashboard';
import { BusinessIntelligence } from '../components/advanced-analytics/BusinessIntelligence';
import { CustomReportBuilder } from '../components/advanced-analytics/CustomReportBuilder';
import { DataVisualizationSuite } from '../components/advanced-analytics/DataVisualizationSuite';
import { MLInsightsGenerator } from '../components/advanced-analytics/MLInsightsGenerator';
import { PredictiveAnalyticsEngine } from '../components/advanced-analytics/PredictiveAnalyticsEngine';
import { StatisticalAnalyzer } from '../components/advanced-analytics/StatisticalAnalyzer';
import { TrendAnalysisEngine } from '../components/advanced-analytics/TrendAnalysisEngine';

import { CacheManager } from '../components/performance-optimization/CacheManager';
import { EfficiencyAnalyzer } from '../components/performance-optimization/EfficiencyAnalyzer';
import { LatencyReducer } from '../components/performance-optimization/LatencyReducer';
import { LoadBalancer } from '../components/performance-optimization/LoadBalancer';
import { PerformanceMonitor } from '../components/performance-optimization/PerformanceMonitor';
import { ResourceOptimizer } from '../components/performance-optimization/ResourceOptimizer';
import { ScalabilityManager } from '../components/performance-optimization/ScalabilityManager';
import { ThroughputOptimizer } from '../components/performance-optimization/ThroughputOptimizer';

import { AlertingSystem } from '../components/real-time-monitoring/AlertingSystem';
import { EventStreamProcessor } from '../components/real-time-monitoring/EventStreamProcessor';
import { HealthCheckEngine } from '../components/real-time-monitoring/HealthCheckEngine';
import { LiveMetricsDashboard } from '../components/real-time-monitoring/LiveMetricsDashboard';
import { MetricsAggregator } from '../components/real-time-monitoring/MetricsAggregator';
import { MonitoringReports } from '../components/real-time-monitoring/MonitoringReports';
import { RealTimeMonitoringHub } from '../components/real-time-monitoring/RealTimeMonitoringHub';
import { TelemetryCollector } from '../components/real-time-monitoring/TelemetryCollector';

import { ConflictResolver } from '../components/scan-coordination/ConflictResolver';
import { CoordinationAnalytics } from '../components/scan-coordination/CoordinationAnalytics';
import { DistributedExecution } from '../components/scan-coordination/DistributedExecution';
import { MultiSystemCoordinator } from '../components/scan-coordination/MultiSystemCoordinator';
import { ScanPriorityManager } from '../components/scan-coordination/ScanPriorityManager';
import { SynchronizationEngine } from '../components/scan-coordination/SynchronizationEngine';

import { AnomalyDetectionEngine } from '../components/scan-intelligence/AnomalyDetectionEngine';
import { BehavioralAnalyzer } from '../components/scan-intelligence/BehavioralAnalyzer';
import { ContextualIntelligence } from '../components/scan-intelligence/ContextualIntelligence';
import { PatternRecognitionCenter } from '../components/scan-intelligence/PatternRecognitionCenter';
import { PredictiveAnalyzer } from '../components/scan-intelligence/PredictiveAnalyzer';
import { ScanIntelligenceCenter } from '../components/scan-intelligence/ScanIntelligenceCenter';
import { ScanIntelligenceEngine } from '../components/scan-intelligence/ScanIntelligenceEngine';
import { ThreatDetectionEngine } from '../components/scan-intelligence/ThreatDetectionEngine';

import { CrossSystemCoordinator } from '../components/scan-orchestration/CrossSystemCoordinator';
import { ExecutionPipeline } from '../components/scan-orchestration/ExecutionPipeline';
import { IntelligentScheduler } from '../components/scan-orchestration/IntelligentScheduler';
import { ResourceCoordinator } from '../components/scan-orchestration/ResourceCoordinator';
import { ScanOrchestrationDashboard } from '../components/scan-orchestration/ScanOrchestrationDashboard';
import { UnifiedScanOrchestrator } from '../components/scan-orchestration/UnifiedScanOrchestrator';
import { WorkflowOrchestrator } from '../components/scan-orchestration/WorkflowOrchestrator';

import { AccessControlManager } from '../components/security-compliance/AccessControlManager';
import { AuditTrailManager } from '../components/security-compliance/AuditTrailManager';
import { ComplianceMonitor } from '../components/security-compliance/ComplianceMonitor';
import { SecurityOrchestrator } from '../components/security-compliance/SecurityOrchestrator';
import { SecurityReporting } from '../components/security-compliance/SecurityReporting';
import { SecurityScanEngine } from '../components/security-compliance/SecurityScanEngine';
import { ThreatIntelligence } from '../components/security-compliance/ThreatIntelligence';
import { VulnerabilityAssessment } from '../components/security-compliance/VulnerabilityAssessment';

import { ApprovalWorkflowEngine } from '../components/workflow-management/ApprovalWorkflowEngine';
import { ConditionalLogicEngine } from '../components/workflow-management/ConditionalLogicEngine';
import { DependencyResolver } from '../components/workflow-management/DependencyResolver';
import { FailureRecoveryEngine } from '../components/workflow-management/FailureRecoveryEngine';
import { WorkflowAnalytics } from '../components/workflow-management/WorkflowAnalytics';
import { WorkflowTemplateManager } from '../components/workflow-management/WorkflowTemplateManager';
import { WorkflowVersionControl } from '../components/workflow-management/WorkflowVersionControl';

// Hooks
import { useScanOrchestration } from '../hooks/useScanOrchestration';
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';
import { useRealTimeMonitoring } from '../hooks/useRealTimeMonitoring';
import { useScanCoordination } from '../hooks/useScanCoordination';
import { useScanIntelligence } from '../hooks/useScanIntelligence';
import { useSecurityCompliance } from '../hooks/useSecurityCompliance';
import { useWorkflowManagement } from '../hooks/useWorkflowManagement';
import { useOptimization } from '../hooks/useOptimization';

// Types
import { 
  ScanOrchestrationJob, 
  OrchestrationJobStatus, 
  OrchestrationPriority,
  WorkflowTemplate,
  ExecutionPipeline,
  ResourcePool 
} from '../types/orchestration.types';
import { 
  AnalyticsMetric, 
  AnalyticsInsight, 
  PredictiveModel,
  BusinessIntelligenceReport 
} from '../types/analytics.types';
import { 
  PerformanceMetric, 
  OptimizationRecommendation,
  ResourceUtilization 
} from '../types/performance.types';
import { 
  MonitoringAlert, 
  HealthStatus, 
  TelemetryData 
} from '../types/monitoring.types';
import { 
  CoordinationStatus, 
  ScanConflict, 
  SystemSynchronization 
} from '../types/coordination.types';
import { 
  IntelligenceInsight, 
  AnomalyDetection, 
  PatternRecognition,
  ThreatDetection 
} from '../types/intelligence.types';
import { 
  SecurityStatus, 
  ComplianceReport, 
  AuditTrail,
  VulnerabilityReport 
} from '../types/security.types';
import { 
  WorkflowExecution, 
  WorkflowStage, 
  ApprovalRequest,
  DependencyGraph 
} from '../types/workflow.types';

// Constants
import { 
  ORCHESTRATION_CONFIGS,
  PERFORMANCE_THRESHOLDS,
  SECURITY_POLICIES,
  UI_CONSTANTS,
  WORKFLOW_TEMPLATES 
} from '../constants';

// Utils
import {
  analyticsProcessor,
  coordinationManager,
  intelligenceProcessor,
  monitoringAggregator,
  optimizationAlgorithms,
  orchestrationEngine,
  performanceCalculator,
  securityValidator,
  workflowExecutor
} from '../utils';

// ==================== INTERFACES & TYPES ====================

interface ScanLogicMasterSPAProps {
  initialActiveTab?: string;
  enableRealTimeUpdates?: boolean;
  autoRefreshInterval?: number;
  theme?: 'light' | 'dark' | 'auto';
  compactMode?: boolean;
  showNavigationSidebar?: boolean;
  enableAdvancedFeatures?: boolean;
}

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical' | 'degraded';
  components: {
    analytics: HealthStatus;
    performance: HealthStatus;
    monitoring: HealthStatus;
    coordination: HealthStatus;
    intelligence: HealthStatus;
    orchestration: HealthStatus;
    security: HealthStatus;
    workflow: HealthStatus;
  };
  lastUpdate: Date;
  metrics: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    resourceUtilization: number;
    averagePerformance: number;
    securityScore: number;
    complianceScore: number;
  };
}

interface UnifiedCommand {
  id: string;
  type: 'start' | 'stop' | 'pause' | 'resume' | 'optimize' | 'analyze' | 'scan' | 'deploy';
  target: 'single' | 'group' | 'system' | 'global';
  scope: string[];
  parameters: Record<string, any>;
  priority: OrchestrationPriority;
  estimatedDuration: number;
  dependencies: string[];
  description: string;
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'status' | 'list' | 'control' | 'alert';
  title: string;
  component: React.ComponentType<any>;
  props: Record<string, any>;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number; w: number; h: number };
  minimized: boolean;
  refreshInterval?: number;
}

// ==================== MAIN COMPONENT ====================

export const ScanLogicMasterSPA: React.FC<ScanLogicMasterSPAProps> = ({
  initialActiveTab = 'overview',
  enableRealTimeUpdates = true,
  autoRefreshInterval = 30000,
  theme = 'auto',
  compactMode = false,
  showNavigationSidebar = true,
  enableAdvancedFeatures = true
}) => {
  // ==================== STATE MANAGEMENT ====================

  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isDashboardCustomized, setIsDashboardCustomized] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [activeCommands, setActiveCommands] = useState<UnifiedCommand[]>([]);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
  const [globalFilters, setGlobalFilters] = useState<Record<string, any>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);

  // WebSocket refs for real-time updates
  const wsConnections = useRef<Map<string, WebSocket>>(new Map());
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  // ==================== HOOKS INTEGRATION ====================

  const orchestration = useScanOrchestration({
    autoRefresh: enableRealTimeUpdates,
    refreshInterval: autoRefreshInterval,
    enableRealTimeUpdates,
    onJobStatusChange: (jobId, status) => {
      toast.info(`Job ${jobId} status changed to ${status}`);
      updateSystemMetrics();
    },
    onError: (error) => {
      console.error('Orchestration error:', error);
      toast.error(`Orchestration error: ${error.message}`);
    }
  });

  const analytics = useAdvancedAnalytics({
    autoRefresh: enableRealTimeUpdates,
    refreshInterval: autoRefreshInterval,
    enablePredictiveModels: enableAdvancedFeatures,
    onInsightGenerated: (insight) => {
      toast.success(`New insight generated: ${insight.title}`);
    }
  });

  const performance = usePerformanceOptimization({
    autoRefresh: enableRealTimeUpdates,
    refreshInterval: autoRefreshInterval,
    enableAutoOptimization: enableAdvancedFeatures,
    onOptimizationComplete: (optimization) => {
      toast.success(`Optimization completed: ${optimization.improvement}% improvement`);
    }
  });

  const monitoring = useRealTimeMonitoring({
    autoRefresh: enableRealTimeUpdates,
    refreshInterval: autoRefreshInterval / 3, // More frequent for monitoring
    enableAlerts: true,
    onAlert: (alert) => {
      const severity = alert.severity === 'critical' ? 'error' : 
                     alert.severity === 'warning' ? 'warning' : 'info';
      toast[severity](`Alert: ${alert.message}`);
      setNotifications(prev => [{ ...alert, timestamp: new Date() }, ...prev.slice(0, 99)]);
    }
  });

  const coordination = useScanCoordination({
    autoRefresh: enableRealTimeUpdates,
    refreshInterval: autoRefreshInterval,
    enableConflictResolution: enableAdvancedFeatures,
    onConflictResolved: (conflict) => {
      toast.success(`Conflict resolved: ${conflict.description}`);
    }
  });

  const intelligence = useScanIntelligence({
    autoRefresh: enableRealTimeUpdates,
    refreshInterval: autoRefreshInterval,
    enableMLModels: enableAdvancedFeatures,
    onAnomalyDetected: (anomaly) => {
      toast.warning(`Anomaly detected: ${anomaly.description}`);
    }
  });

  const security = useSecurityCompliance({
    autoRefresh: enableRealTimeUpdates,
    refreshInterval: autoRefreshInterval,
    enableThreatDetection: enableAdvancedFeatures,
    onSecurityIncident: (incident) => {
      toast.error(`Security incident: ${incident.description}`);
    }
  });

  const workflow = useWorkflowManagement({
    autoRefresh: enableRealTimeUpdates,
    refreshInterval: autoRefreshInterval,
    enableAutoApproval: false, // Security requirement
    onWorkflowCompleted: (workflowId) => {
      toast.success(`Workflow ${workflowId} completed successfully`);
    }
  });

  const optimization = useOptimization({
    enableAutoOptimization: enableAdvancedFeatures,
    optimizationInterval: autoRefreshInterval * 2,
    onOptimizationRecommendation: (recommendation) => {
      toast.info(`Optimization recommendation: ${recommendation.description}`);
    }
  });

  // ==================== SYSTEM STATUS CALCULATION ====================

  const updateSystemMetrics = useCallback(async () => {
    try {
      // Aggregate status from all subsystems
      const componentsStatus = {
        analytics: analytics.healthStatus || { status: 'unknown', lastCheck: new Date() },
        performance: performance.healthStatus || { status: 'unknown', lastCheck: new Date() },
        monitoring: monitoring.healthStatus || { status: 'unknown', lastCheck: new Date() },
        coordination: coordination.healthStatus || { status: 'unknown', lastCheck: new Date() },
        intelligence: intelligence.healthStatus || { status: 'unknown', lastCheck: new Date() },
        orchestration: orchestration.healthStatus || { status: 'unknown', lastCheck: new Date() },
        security: security.healthStatus || { status: 'unknown', lastCheck: new Date() },
        workflow: workflow.healthStatus || { status: 'unknown', lastCheck: new Date() }
      };

      // Calculate overall system health
      const healthScores = Object.values(componentsStatus).map(status => {
        switch (status.status) {
          case 'healthy': return 100;
          case 'warning': return 70;
          case 'degraded': return 40;
          case 'critical': return 10;
          default: return 50;
        }
      });

      const averageHealth = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
      
      const overall = averageHealth >= 90 ? 'healthy' :
                     averageHealth >= 70 ? 'warning' :
                     averageHealth >= 40 ? 'degraded' : 'critical';

      // Calculate system metrics
      const totalJobs = orchestration.jobs.length;
      const activeJobs = orchestration.jobs.filter(job => 
        job.status === 'RUNNING' || job.status === 'QUEUED' || job.status === 'INITIALIZING'
      ).length;
      const completedJobs = orchestration.jobs.filter(job => job.status === 'COMPLETED').length;
      const failedJobs = orchestration.jobs.filter(job => job.status === 'FAILED').length;

      const resourceUtilization = performance.currentResourceUtilization?.overall || 0;
      const averagePerformance = performance.performanceScore || 0;
      const securityScore = security.securityScore || 0;
      const complianceScore = security.complianceScore || 0;

      setSystemStatus({
        overall,
        components: componentsStatus,
        lastUpdate: new Date(),
        metrics: {
          totalJobs,
          activeJobs,
          completedJobs,
          failedJobs,
          resourceUtilization,
          averagePerformance,
          securityScore,
          complianceScore
        }
      });
    } catch (error) {
      console.error('Failed to update system metrics:', error);
    }
  }, [analytics, performance, monitoring, coordination, intelligence, orchestration, security, workflow]);

  // ==================== UNIFIED COMMAND CENTER ====================

  const executeUnifiedCommand = useCallback(async (command: UnifiedCommand) => {
    try {
      setActiveCommands(prev => [...prev, command]);
      toast.info(`Executing command: ${command.description}`);

      // Route command to appropriate subsystem(s)
      const results = await Promise.allSettled(
        command.scope.map(async (scope) => {
          switch (scope) {
            case 'orchestration':
              return await executeOrchestrationCommand(command);
            case 'analytics':
              return await executeAnalyticsCommand(command);
            case 'performance':
              return await executePerformanceCommand(command);
            case 'monitoring':
              return await executeMonitoringCommand(command);
            case 'coordination':
              return await executeCoordinationCommand(command);
            case 'intelligence':
              return await executeIntelligenceCommand(command);
            case 'security':
              return await executeSecurityCommand(command);
            case 'workflow':
              return await executeWorkflowCommand(command);
            default:
              throw new Error(`Unknown scope: ${scope}`);
          }
        })
      );

      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failureCount = results.filter(result => result.status === 'rejected').length;

      if (failureCount === 0) {
        toast.success(`Command executed successfully across ${successCount} systems`);
      } else {
        toast.warning(`Command partially executed: ${successCount} successful, ${failureCount} failed`);
      }

      setActiveCommands(prev => prev.filter(cmd => cmd.id !== command.id));
      await updateSystemMetrics();
    } catch (error) {
      console.error('Failed to execute unified command:', error);
      toast.error(`Command execution failed: ${error}`);
      setActiveCommands(prev => prev.filter(cmd => cmd.id !== command.id));
    }
  }, []);

  // Command execution functions for each subsystem
  const executeOrchestrationCommand = async (command: UnifiedCommand) => {
    switch (command.type) {
      case 'start':
        return await orchestration.bulkStartJobs(command.parameters.jobIds || []);
      case 'stop':
        return await orchestration.bulkStopJobs(command.parameters.jobIds || []);
      case 'optimize':
        return await optimization.optimizeSystem(command.parameters);
      default:
        throw new Error(`Unsupported orchestration command: ${command.type}`);
    }
  };

  const executeAnalyticsCommand = async (command: UnifiedCommand) => {
    switch (command.type) {
      case 'analyze':
        return await analytics.runAnalysis(command.parameters);
      case 'scan':
        return await analytics.generateInsights(command.parameters);
      default:
        throw new Error(`Unsupported analytics command: ${command.type}`);
    }
  };

  const executePerformanceCommand = async (command: UnifiedCommand) => {
    switch (command.type) {
      case 'optimize':
        return await performance.optimizePerformance(command.parameters);
      case 'analyze':
        return await performance.analyzePerformance(command.parameters);
      default:
        throw new Error(`Unsupported performance command: ${command.type}`);
    }
  };

  const executeMonitoringCommand = async (command: UnifiedCommand) => {
    switch (command.type) {
      case 'scan':
        return await monitoring.triggerHealthCheck(command.parameters);
      case 'analyze':
        return await monitoring.generateReport(command.parameters);
      default:
        throw new Error(`Unsupported monitoring command: ${command.type}`);
    }
  };

  const executeCoordinationCommand = async (command: UnifiedCommand) => {
    switch (command.type) {
      case 'start':
        return await coordination.coordinateExecution(command.parameters);
      case 'optimize':
        return await coordination.optimizeCoordination(command.parameters);
      default:
        throw new Error(`Unsupported coordination command: ${command.type}`);
    }
  };

  const executeIntelligenceCommand = async (command: UnifiedCommand) => {
    switch (command.type) {
      case 'analyze':
        return await intelligence.analyzePatterns(command.parameters);
      case 'scan':
        return await intelligence.detectAnomalies(command.parameters);
      default:
        throw new Error(`Unsupported intelligence command: ${command.type}`);
    }
  };

  const executeSecurityCommand = async (command: UnifiedCommand) => {
    switch (command.type) {
      case 'scan':
        return await security.runSecurityScan(command.parameters);
      case 'analyze':
        return await security.assessVulnerabilities(command.parameters);
      default:
        throw new Error(`Unsupported security command: ${command.type}`);
    }
  };

  const executeWorkflowCommand = async (command: UnifiedCommand) => {
    switch (command.type) {
      case 'start':
        return await workflow.executeWorkflow(command.parameters);
      case 'deploy':
        return await workflow.deployWorkflow(command.parameters);
      default:
        throw new Error(`Unsupported workflow command: ${command.type}`);
    }
  };

  // ==================== QUICK ACTIONS ====================

  const generateQuickActions = useMemo(() => [
    {
      id: 'emergency-stop',
      title: 'Emergency Stop All',
      icon: Square,
      color: 'destructive',
      action: () => executeUnifiedCommand({
        id: 'emergency-stop-all',
        type: 'stop',
        target: 'global',
        scope: ['orchestration', 'coordination', 'workflow'],
        parameters: { force: true, reason: 'Emergency stop initiated by user' },
        priority: 'URGENT' as OrchestrationPriority,
        estimatedDuration: 30,
        dependencies: [],
        description: 'Emergency stop all running operations'
      })
    },
    {
      id: 'system-optimize',
      title: 'Optimize System',
      icon: Zap,
      color: 'default',
      action: () => executeUnifiedCommand({
        id: 'system-optimize',
        type: 'optimize',
        target: 'system',
        scope: ['performance', 'orchestration', 'coordination'],
        parameters: { aggressive: true, autoApply: false },
        priority: 'HIGH' as OrchestrationPriority,
        estimatedDuration: 300,
        dependencies: [],
        description: 'Comprehensive system optimization'
      })
    },
    {
      id: 'security-scan',
      title: 'Security Scan',
      icon: Shield,
      color: 'secondary',
      action: () => executeUnifiedCommand({
        id: 'security-scan',
        type: 'scan',
        target: 'system',
        scope: ['security', 'intelligence'],
        parameters: { comprehensive: true, generateReport: true },
        priority: 'HIGH' as OrchestrationPriority,
        estimatedDuration: 180,
        dependencies: [],
        description: 'Comprehensive security scan'
      })
    },
    {
      id: 'health-check',
      title: 'Health Check',
      icon: Activity,
      color: 'outline',
      action: () => executeUnifiedCommand({
        id: 'health-check',
        type: 'scan',
        target: 'system',
        scope: ['monitoring', 'performance', 'orchestration'],
        parameters: { detailed: true },
        priority: 'NORMAL' as OrchestrationPriority,
        estimatedDuration: 60,
        dependencies: [],
        description: 'System health check'
      })
    }
  ], [executeUnifiedCommand]);

  // ==================== REAL-TIME UPDATES ====================

  useEffect(() => {
    if (enableRealTimeUpdates) {
      updateInterval.current = setInterval(updateSystemMetrics, autoRefreshInterval);
      updateSystemMetrics(); // Initial update

      return () => {
        if (updateInterval.current) {
          clearInterval(updateInterval.current);
        }
      };
    }
  }, [enableRealTimeUpdates, autoRefreshInterval, updateSystemMetrics]);

  // ==================== NAVIGATION CONFIGURATION ====================

  const navigationTabs = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'System overview and unified dashboard'
    },
    {
      id: 'advanced-analytics',
      label: 'Advanced Analytics',
      icon: BarChart3,
      description: 'Predictive analytics, ML insights, and business intelligence',
      subTabs: [
        { id: 'analytics-dashboard', label: 'Dashboard', component: AdvancedAnalyticsDashboard },
        { id: 'business-intelligence', label: 'Business Intelligence', component: BusinessIntelligence },
        { id: 'custom-reports', label: 'Custom Reports', component: CustomReportBuilder },
        { id: 'data-visualization', label: 'Data Visualization', component: DataVisualizationSuite },
        { id: 'ml-insights', label: 'ML Insights', component: MLInsightsGenerator },
        { id: 'predictive-analytics', label: 'Predictive Analytics', component: PredictiveAnalyticsEngine },
        { id: 'statistical-analysis', label: 'Statistical Analysis', component: StatisticalAnalyzer },
        { id: 'trend-analysis', label: 'Trend Analysis', component: TrendAnalysisEngine }
      ]
    },
    {
      id: 'performance-optimization',
      label: 'Performance Optimization',
      icon: Zap,
      description: 'Resource optimization, caching, and load balancing',
      subTabs: [
        { id: 'cache-manager', label: 'Cache Manager', component: CacheManager },
        { id: 'efficiency-analyzer', label: 'Efficiency Analyzer', component: EfficiencyAnalyzer },
        { id: 'latency-reducer', label: 'Latency Reducer', component: LatencyReducer },
        { id: 'load-balancer', label: 'Load Balancer', component: LoadBalancer },
        { id: 'performance-monitor', label: 'Performance Monitor', component: PerformanceMonitor },
        { id: 'resource-optimizer', label: 'Resource Optimizer', component: ResourceOptimizer },
        { id: 'scalability-manager', label: 'Scalability Manager', component: ScalabilityManager },
        { id: 'throughput-optimizer', label: 'Throughput Optimizer', component: ThroughputOptimizer }
      ]
    },
    {
      id: 'real-time-monitoring',
      label: 'Real-Time Monitoring',
      icon: Monitor,
      description: 'Live metrics, alerting, and telemetry collection',
      subTabs: [
        { id: 'alerting-system', label: 'Alerting System', component: AlertingSystem },
        { id: 'event-stream', label: 'Event Stream', component: EventStreamProcessor },
        { id: 'health-check', label: 'Health Check', component: HealthCheckEngine },
        { id: 'live-metrics', label: 'Live Metrics', component: LiveMetricsDashboard },
        { id: 'metrics-aggregator', label: 'Metrics Aggregator', component: MetricsAggregator },
        { id: 'monitoring-reports', label: 'Monitoring Reports', component: MonitoringReports },
        { id: 'monitoring-hub', label: 'Monitoring Hub', component: RealTimeMonitoringHub },
        { id: 'telemetry-collector', label: 'Telemetry Collector', component: TelemetryCollector }
      ]
    },
    {
      id: 'scan-coordination',
      label: 'Scan Coordination',
      icon: Network,
      description: 'Multi-system coordination and conflict resolution',
      subTabs: [
        { id: 'conflict-resolver', label: 'Conflict Resolver', component: ConflictResolver },
        { id: 'coordination-analytics', label: 'Coordination Analytics', component: CoordinationAnalytics },
        { id: 'distributed-execution', label: 'Distributed Execution', component: DistributedExecution },
        { id: 'multi-system-coordinator', label: 'Multi-System Coordinator', component: MultiSystemCoordinator },
        { id: 'priority-manager', label: 'Priority Manager', component: ScanPriorityManager },
        { id: 'synchronization-engine', label: 'Synchronization Engine', component: SynchronizationEngine }
      ]
    },
    {
      id: 'scan-intelligence',
      label: 'Scan Intelligence',
      icon: Brain,
      description: 'AI-powered pattern recognition and anomaly detection',
      subTabs: [
        { id: 'anomaly-detection', label: 'Anomaly Detection', component: AnomalyDetectionEngine },
        { id: 'behavioral-analyzer', label: 'Behavioral Analyzer', component: BehavioralAnalyzer },
        { id: 'contextual-intelligence', label: 'Contextual Intelligence', component: ContextualIntelligence },
        { id: 'pattern-recognition', label: 'Pattern Recognition', component: PatternRecognitionCenter },
        { id: 'predictive-analyzer', label: 'Predictive Analyzer', component: PredictiveAnalyzer },
        { id: 'intelligence-center', label: 'Intelligence Center', component: ScanIntelligenceCenter },
        { id: 'intelligence-engine', label: 'Intelligence Engine', component: ScanIntelligenceEngine },
        { id: 'threat-detection', label: 'Threat Detection', component: ThreatDetectionEngine }
      ]
    },
    {
      id: 'scan-orchestration',
      label: 'Scan Orchestration',
      icon: Layers,
      description: 'Unified orchestration and workflow management',
      subTabs: [
        { id: 'cross-system-coordinator', label: 'Cross-System Coordinator', component: CrossSystemCoordinator },
        { id: 'execution-pipeline', label: 'Execution Pipeline', component: ExecutionPipeline },
        { id: 'intelligent-scheduler', label: 'Intelligent Scheduler', component: IntelligentScheduler },
        { id: 'resource-coordinator', label: 'Resource Coordinator', component: ResourceCoordinator },
        { id: 'orchestration-dashboard', label: 'Orchestration Dashboard', component: ScanOrchestrationDashboard },
        { id: 'unified-orchestrator', label: 'Unified Orchestrator', component: UnifiedScanOrchestrator },
        { id: 'workflow-orchestrator', label: 'Workflow Orchestrator', component: WorkflowOrchestrator }
      ]
    },
    {
      id: 'security-compliance',
      label: 'Security & Compliance',
      icon: Shield,
      description: 'Access control, audit trails, and threat detection',
      subTabs: [
        { id: 'access-control', label: 'Access Control', component: AccessControlManager },
        { id: 'audit-trail', label: 'Audit Trail', component: AuditTrailManager },
        { id: 'compliance-monitor', label: 'Compliance Monitor', component: ComplianceMonitor },
        { id: 'security-orchestrator', label: 'Security Orchestrator', component: SecurityOrchestrator },
        { id: 'security-reporting', label: 'Security Reporting', component: SecurityReporting },
        { id: 'security-scan-engine', label: 'Security Scan Engine', component: SecurityScanEngine },
        { id: 'threat-intelligence', label: 'Threat Intelligence', component: ThreatIntelligence },
        { id: 'vulnerability-assessment', label: 'Vulnerability Assessment', component: VulnerabilityAssessment }
      ]
    },
    {
      id: 'workflow-management',
      label: 'Workflow Management',
      icon: Workflow,
      description: 'Approval workflows, dependency resolution, and version control',
      subTabs: [
        { id: 'approval-workflow', label: 'Approval Workflow', component: ApprovalWorkflowEngine },
        { id: 'conditional-logic', label: 'Conditional Logic', component: ConditionalLogicEngine },
        { id: 'dependency-resolver', label: 'Dependency Resolver', component: DependencyResolver },
        { id: 'failure-recovery', label: 'Failure Recovery', component: FailureRecoveryEngine },
        { id: 'workflow-analytics', label: 'Workflow Analytics', component: WorkflowAnalytics },
        { id: 'template-manager', label: 'Template Manager', component: WorkflowTemplateManager },
        { id: 'version-control', label: 'Version Control', component: WorkflowVersionControl }
      ]
    }
  ], []);

  // ==================== DASHBOARD WIDGETS ====================

  const renderSystemOverview = () => (
    <div className="space-y-6">
      {/* System Status Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">System Status Overview</CardTitle>
                <CardDescription>
                  Real-time monitoring across all Advanced Scan Logic components
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={systemStatus?.overall === 'healthy' ? 'default' : 
                               systemStatus?.overall === 'warning' ? 'secondary' : 'destructive'}>
                  {systemStatus?.overall?.toUpperCase() || 'UNKNOWN'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={updateSystemMetrics}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(systemStatus?.components || {}).map(([component, status]) => (
                <div key={component} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                    status.status === 'healthy' ? 'bg-green-100 text-green-600' :
                    status.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    status.status === 'degraded' ? 'bg-orange-100 text-orange-600' :
                    status.status === 'critical' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {status.status === 'healthy' ? <CheckCircle className="h-6 w-6" /> :
                     status.status === 'warning' ? <AlertTriangle className="h-6 w-6" /> :
                     status.status === 'critical' ? <XCircle className="h-6 w-6" /> :
                     <Clock className="h-6 w-6" />}
                  </div>
                  <p className="text-xs font-medium capitalize">{component.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-xs text-muted-foreground capitalize">{status.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus?.metrics.activeJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStatus?.metrics.totalJobs || 0} total jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(systemStatus?.metrics.resourceUtilization || 0)}%
            </div>
            <Progress value={systemStatus?.metrics.resourceUtilization || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(systemStatus?.metrics.securityScore || 0)}%
            </div>
            <Progress value={systemStatus?.metrics.securityScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(systemStatus?.metrics.complianceScore || 0)}%
            </div>
            <Progress value={systemStatus?.metrics.complianceScore || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Execute common operations across the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {generateQuickActions.map((action) => (
              <Button
                key={action.id}
                variant={action.color as any}
                onClick={action.action}
                className="h-20 flex flex-col gap-2"
                disabled={activeCommands.some(cmd => cmd.id.includes(action.id))}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Commands */}
      {activeCommands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Commands</CardTitle>
            <CardDescription>Currently executing operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCommands.map((command) => (
                <div key={command.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{command.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Scope: {command.scope.join(', ')} • Priority: {command.priority}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={undefined} className="w-20" />
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Latest system events and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-60">
              <div className="space-y-2">
                {notifications.slice(0, 10).map((notification, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 border rounded">
                    <Bell className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp?.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ==================== UNIFIED COMMAND CENTER ====================

  const renderCommandCenter = () => (
    <Sheet open={isCommandCenterOpen} onOpenChange={setIsCommandCenterOpen}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Unified Command Center
          </SheetTitle>
          <SheetDescription>
            Execute operations across multiple systems with intelligent coordination
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Command Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Command</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Command Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select command type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">Start Operation</SelectItem>
                    <SelectItem value="stop">Stop Operation</SelectItem>
                    <SelectItem value="pause">Pause Operation</SelectItem>
                    <SelectItem value="resume">Resume Operation</SelectItem>
                    <SelectItem value="optimize">Optimize System</SelectItem>
                    <SelectItem value="analyze">Run Analysis</SelectItem>
                    <SelectItem value="scan">Execute Scan</SelectItem>
                    <SelectItem value="deploy">Deploy Configuration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Scope</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['orchestration', 'analytics', 'performance', 'monitoring', 'coordination', 'intelligence', 'security', 'workflow'].map((scope) => (
                    <div key={scope} className="flex items-center space-x-2">
                      <Switch id={scope} />
                      <Label htmlFor={scope} className="text-sm capitalize">
                        {scope.replace(/([A-Z])/g, ' $1')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="BACKGROUND">Background</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Enter command description..." />
              </div>

              <Button className="w-full">
                <Rocket className="h-4 w-4 mr-2" />
                Execute Command
              </Button>
            </CardContent>
          </Card>

          {/* Active Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Commands</CardTitle>
            </CardHeader>
            <CardContent>
              {activeCommands.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active commands</p>
              ) : (
                <div className="space-y-2">
                  {activeCommands.map((command) => (
                    <div key={command.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{command.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {command.scope.join(', ')}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Square className="h-3 w-3" />
                        </Button>
                      </div>
                      <Progress value={50} className="mt-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );

  // ==================== MAIN RENDER ====================

  return (
    <TooltipProvider>
      <div className={`h-screen bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Advanced Scan Logic</h1>
              </div>
              {systemStatus && (
                <Badge variant={systemStatus.overall === 'healthy' ? 'default' : 
                               systemStatus.overall === 'warning' ? 'secondary' : 'destructive'}>
                  {systemStatus.overall.toUpperCase()}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Global Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search across all systems..." 
                  className="pl-10 w-64"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>

              {/* Command Center */}
              <Button variant="ghost" size="sm" onClick={() => setIsCommandCenterOpen(true)}>
                <Command className="h-4 w-4" />
              </Button>

              {/* Fullscreen Toggle */}
              <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          {showNavigationSidebar && (
            <div className="w-64 border-r bg-background/50 overflow-y-auto">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 h-auto gap-2 bg-transparent p-0">
                      {navigationTabs.map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="justify-start px-3 py-2 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <tab.icon className="h-4 w-4 mr-2 shrink-0" />
                          <div className="text-left">
                            <p className="font-medium">{tab.label}</p>
                            {tab.description && (
                              <p className="text-xs opacity-70 mt-1">{tab.description}</p>
                            )}
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 mt-0 h-full">
                {renderSystemOverview()}
              </TabsContent>

              {/* Component Tabs */}
              {navigationTabs.slice(1).map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="p-6 mt-0 h-full">
                  {tab.subTabs ? (
                    <Tabs defaultValue={tab.subTabs[0].id} className="h-full">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold">{tab.label}</h2>
                          <p className="text-muted-foreground">{tab.description}</p>
                        </div>
                        <TabsList>
                          {tab.subTabs.map((subTab) => (
                            <TabsTrigger key={subTab.id} value={subTab.id}>
                              {subTab.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>

                      {tab.subTabs.map((subTab) => (
                        <TabsContent key={subTab.id} value={subTab.id} className="mt-0 h-full">
                          <subTab.component />
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{tab.label}</h2>
                      <p className="text-muted-foreground mb-6">{tab.description}</p>
                      {/* Add default component content here */}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* Command Center */}
        {renderCommandCenter()}

        {/* Footer Status Bar */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-8 items-center justify-between px-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Last Updated: {systemStatus?.lastUpdate.toLocaleTimeString()}</span>
              <span>Active Jobs: {systemStatus?.metrics.activeJobs || 0}</span>
              <span>Resource Usage: {Math.round(systemStatus?.metrics.resourceUtilization || 0)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Version 1.0.0</span>
              <span>Enterprise Edition</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ScanLogicMasterSPA;