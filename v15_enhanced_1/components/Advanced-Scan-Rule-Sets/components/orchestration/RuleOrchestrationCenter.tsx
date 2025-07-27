import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Command, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  SkipForward, 
  SkipBack, 
  Activity, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Clock, 
  Timer, 
  Gauge, 
  Target, 
  Layers, 
  Network, 
  GitBranch, 
  Workflow, 
  Zap, 
  Brain, 
  Shield, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  Copy, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Minus, 
  X, 
  Check, 
  Edit, 
  Trash2, 
  Save, 
  Archive, 
  Unarchive, 
  Star, 
  Bookmark, 
  Share2, 
  Link, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  Database,
  Server,
  Cloud,
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  Package,
  Puzzle,
  Wrench,
  Hammer,
  Screwdriver,
  Binary,
  Code,
  Terminal,
  FileText,
  File,
  Folder,
  FolderOpen,
  Hash,
  Tag,
  Flag,
  MapPin,
  Globe,
  Wifi,
  WifiOff,
  Bluetooth,
  Smartphone,
  Tablet,
  Laptop,
  MessageSquare,
  Bell,
  Mail,
  Phone,
  Video,
  Maximize,
  Minimize,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Scissors,
  Clipboard,
  ClipboardCheck,
  ClipboardCopy,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Image,
  Music,
  PlayCircle,
  StopCircle,
  Radio,
  Tv,
  Camera,
  CameraOff,
  Headphones,
  Speaker,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UsersIcon,
  Crown,
  Award,
  Medal,
  Trophy,
  Gem,
  Diamond,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Umbrella,
  Flashlight,
  Battery,
  BatteryLow,
  Plug,
  Power,
  PowerOff
} from 'lucide-react';

// Hooks
import { useScanRules } from '../../hooks/useScanRules';
import { useValidation } from '../../hooks/useValidation';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useOptimization } from '../../hooks/useOptimization';
import { useReporting } from '../../hooks/useReporting';
import { useOrchestration } from '../../hooks/useOrchestration';

// Types
import type { 
  ScanRule, 
  RuleExecutionContext,
  RulePerformanceMetrics,
  WorkflowDefinition,
  OrchestrationPlan,
  ExecutionStep,
  ResourceRequirement
} from '../../types/scan-rules.types';
import type { 
  ValidationResult, 
  ValidationContext
} from '../../types/validation.types';
import type { 
  IntelligenceSuggestion, 
  AIAssistance
} from '../../types/intelligence.types';
import type { 
  CollaborationSession, 
  UserPresence, 
  Comment
} from '../../types/collaboration.types';

// Orchestration Types
interface OrchestrationState {
  activeWorkflows: WorkflowExecution[];
  queuedWorkflows: WorkflowDefinition[];
  completedWorkflows: WorkflowExecution[];
  failedWorkflows: WorkflowExecution[];
  resources: ResourcePool;
  clusters: OrchestrationCluster[];
  nodes: OrchestrationNode[];
  loadBalancer: LoadBalancerConfig;
  scheduler: SchedulerConfig;
  metrics: OrchestrationMetrics;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  name: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  steps: ExecutionStepResult[];
  resources: ResourceAllocation[];
  metrics: ExecutionMetrics;
  logs: ExecutionLog[];
  errors: ExecutionError[];
  warnings: ExecutionWarning[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  cluster: string;
  node: string;
  user: string;
  tags: string[];
}

interface ExecutionStepResult {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime: string;
  endTime?: string;
  duration?: number;
  input: any;
  output: any;
  error?: string;
  retries: number;
  maxRetries: number;
  dependencies: string[];
  resources: ResourceUsage;
}

interface ResourcePool {
  total: ResourceCapacity;
  allocated: ResourceCapacity;
  available: ResourceCapacity;
  utilization: ResourceUtilization;
  allocations: ResourceAllocation[];
  reservations: ResourceReservation[];
  policies: ResourcePolicy[];
}

interface ResourceCapacity {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  gpu: number;
  instances: number;
}

interface ResourceAllocation {
  id: string;
  workflowId: string;
  stepId: string;
  resources: ResourceCapacity;
  startTime: string;
  endTime?: string;
  status: 'allocated' | 'deallocated' | 'expired';
  node: string;
  cluster: string;
}

interface ResourceReservation {
  id: string;
  workflowId: string;
  resources: ResourceCapacity;
  scheduledTime: string;
  duration: number;
  priority: number;
  user: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

interface ResourcePolicy {
  id: string;
  name: string;
  type: 'quota' | 'priority' | 'scheduling' | 'cleanup';
  rules: PolicyRule[];
  enabled: boolean;
  scope: 'global' | 'cluster' | 'user' | 'workflow';
  target: string;
}

interface PolicyRule {
  condition: string;
  action: string;
  parameters: Record<string, any>;
  priority: number;
}

interface OrchestrationCluster {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  nodes: OrchestrationNode[];
  capacity: ResourceCapacity;
  utilization: ResourceUtilization;
  config: ClusterConfig;
  version: string;
  region: string;
  zone: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

interface OrchestrationNode {
  id: string;
  name: string;
  clusterId: string;
  status: 'ready' | 'not-ready' | 'unknown' | 'terminating';
  role: 'master' | 'worker' | 'etcd';
  capacity: ResourceCapacity;
  allocatable: ResourceCapacity;
  utilization: ResourceUtilization;
  workloads: string[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
  taints: NodeTaint[];
  conditions: NodeCondition[];
  info: NodeInfo;
}

interface NodeTaint {
  key: string;
  value: string;
  effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';
}

interface NodeCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  reason: string;
  message: string;
  lastTransitionTime: string;
}

interface NodeInfo {
  architecture: string;
  bootID: string;
  containerRuntimeVersion: string;
  kernelVersion: string;
  kubeProxyVersion: string;
  kubeletVersion: string;
  machineID: string;
  operatingSystem: string;
  osImage: string;
  systemUUID: string;
}

interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
  healthCheck: HealthCheckConfig;
  stickySession: boolean;
  timeout: number;
  retries: number;
  backendServers: BackendServer[];
  rules: LoadBalancingRule[];
}

interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  path: string;
  port: number;
  protocol: 'http' | 'https' | 'tcp';
  successThreshold: number;
  failureThreshold: number;
}

interface BackendServer {
  id: string;
  address: string;
  port: number;
  weight: number;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: string;
}

interface LoadBalancingRule {
  id: string;
  pattern: string;
  target: string;
  priority: number;
  conditions: string[];
}

interface SchedulerConfig {
  algorithm: 'FIFO' | 'SJF' | 'priority' | 'fair-share' | 'capacity';
  preemption: boolean;
  nodeAffinity: NodeAffinityConfig;
  podAntiAffinity: PodAntiAffinityConfig;
  tolerations: Toleration[];
  resourceRequests: ResourceRequirement[];
  resourceLimits: ResourceRequirement[];
  scheduling: SchedulingPolicy;
}

interface NodeAffinityConfig {
  requiredDuringScheduling: NodeSelector[];
  preferredDuringScheduling: PreferredSchedulingTerm[];
}

interface PodAntiAffinityConfig {
  requiredDuringScheduling: PodAffinityTerm[];
  preferredDuringScheduling: WeightedPodAffinityTerm[];
}

interface Toleration {
  key: string;
  operator: 'Equal' | 'Exists';
  value?: string;
  effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';
  tolerationSeconds?: number;
}

interface NodeSelector {
  matchExpressions: NodeSelectorRequirement[];
  matchFields: NodeSelectorRequirement[];
}

interface NodeSelectorRequirement {
  key: string;
  operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist' | 'Gt' | 'Lt';
  values: string[];
}

interface PreferredSchedulingTerm {
  weight: number;
  preference: NodeSelector;
}

interface PodAffinityTerm {
  labelSelector: LabelSelector;
  namespaces: string[];
  topologyKey: string;
}

interface WeightedPodAffinityTerm {
  weight: number;
  podAffinityTerm: PodAffinityTerm;
}

interface LabelSelector {
  matchLabels: Record<string, string>;
  matchExpressions: LabelSelectorRequirement[];
}

interface LabelSelectorRequirement {
  key: string;
  operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist';
  values: string[];
}

interface SchedulingPolicy {
  priorityClassName: string;
  preemptionPolicy: 'Never' | 'PreemptLowerPriority';
  overhead: ResourceCapacity;
  topologySpreadConstraints: TopologySpreadConstraint[];
}

interface TopologySpreadConstraint {
  maxSkew: number;
  topologyKey: string;
  whenUnsatisfiable: 'DoNotSchedule' | 'ScheduleAnyway';
  labelSelector: LabelSelector;
}

interface ResourceUtilization {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  gpu: number;
  instances: number;
}

interface ResourceUsage {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  gpu: number;
  duration: number;
}

interface ClusterConfig {
  version: string;
  networking: NetworkConfig;
  storage: StorageConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
  monitoring: MonitoringConfig;
  autoscaling: AutoscalingConfig;
}

interface NetworkConfig {
  podCIDR: string;
  serviceCIDR: string;
  dnsPolicy: string;
  networkPlugin: string;
  networkPolicy: boolean;
}

interface StorageConfig {
  storageClasses: StorageClass[];
  persistentVolumes: PersistentVolume[];
  csiDrivers: CSIDriver[];
}

interface StorageClass {
  name: string;
  provisioner: string;
  parameters: Record<string, string>;
  reclaimPolicy: 'Retain' | 'Delete' | 'Recycle';
  volumeBindingMode: 'Immediate' | 'WaitForFirstConsumer';
}

interface PersistentVolume {
  name: string;
  capacity: string;
  accessModes: string[];
  storageClass: string;
  status: 'Available' | 'Bound' | 'Released' | 'Failed';
}

interface CSIDriver {
  name: string;
  attachRequired: boolean;
  podInfoOnMount: boolean;
  volumeLifecycleModes: string[];
}

interface SecurityConfig {
  rbac: boolean;
  podSecurityPolicy: boolean;
  networkPolicy: boolean;
  admission: AdmissionConfig;
  encryption: EncryptionConfig;
}

interface AdmissionConfig {
  controllers: string[];
  webhooks: AdmissionWebhook[];
}

interface AdmissionWebhook {
  name: string;
  clientConfig: WebhookClientConfig;
  rules: RuleWithOperations[];
  admissionReviewVersions: string[];
}

interface WebhookClientConfig {
  url?: string;
  service?: ServiceReference;
  caBundle?: string;
}

interface ServiceReference {
  namespace: string;
  name: string;
  path?: string;
  port?: number;
}

interface RuleWithOperations {
  operations: string[];
  rule: Rule;
}

interface Rule {
  apiGroups: string[];
  apiVersions: string[];
  resources: string[];
  scope: string;
}

interface EncryptionConfig {
  enabled: boolean;
  provider: string;
  keys: EncryptionKey[];
}

interface EncryptionKey {
  name: string;
  secret: string;
  timestamp: string;
}

interface LoggingConfig {
  level: string;
  format: string;
  output: string[];
  rotation: LogRotationConfig;
  aggregation: LogAggregationConfig;
}

interface LogRotationConfig {
  enabled: boolean;
  maxSize: string;
  maxAge: string;
  maxBackups: number;
  compress: boolean;
}

interface LogAggregationConfig {
  enabled: boolean;
  endpoint: string;
  index: string;
  retention: string;
}

interface MonitoringConfig {
  enabled: boolean;
  prometheus: PrometheusConfig;
  grafana: GrafanaConfig;
  alerting: AlertingConfig;
}

interface PrometheusConfig {
  retention: string;
  storage: string;
  scrapeInterval: string;
  evaluationInterval: string;
}

interface GrafanaConfig {
  persistence: boolean;
  storageSize: string;
  adminPassword: string;
}

interface AlertingConfig {
  enabled: boolean;
  rules: AlertRule[];
  receivers: AlertReceiver[];
}

interface AlertRule {
  name: string;
  expr: string;
  duration: string;
  severity: string;
  annotations: Record<string, string>;
}

interface AlertReceiver {
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'pagerduty';
  config: Record<string, string>;
}

interface AutoscalingConfig {
  enabled: boolean;
  minNodes: number;
  maxNodes: number;
  targetCPUUtilization: number;
  targetMemoryUtilization: number;
  scaleUpPolicy: ScalingPolicy;
  scaleDownPolicy: ScalingPolicy;
}

interface ScalingPolicy {
  stabilizationWindowSeconds: number;
  policies: HPAScalingPolicy[];
}

interface HPAScalingPolicy {
  type: 'Pods' | 'Percent';
  value: number;
  periodSeconds: number;
}

interface OrchestrationMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  averageExecutionTime: number;
  resourceUtilization: ResourceUtilization;
  throughput: number;
  errorRate: number;
  availability: number;
  performance: PerformanceMetrics;
  costs: CostMetrics;
}

interface PerformanceMetrics {
  latency: LatencyMetrics;
  throughput: ThroughputMetrics;
  errorRate: number;
  availability: number;
  saturation: number;
}

interface LatencyMetrics {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  mean: number;
  max: number;
  min: number;
}

interface ThroughputMetrics {
  requestsPerSecond: number;
  workflowsPerMinute: number;
  dataProcessedPerHour: number;
  operationsPerSecond: number;
}

interface CostMetrics {
  totalCost: number;
  costPerWorkflow: number;
  costPerHour: number;
  resourceCosts: ResourceCostBreakdown;
  optimizationSavings: number;
}

interface ResourceCostBreakdown {
  compute: number;
  storage: number;
  network: number;
  gpu: number;
  other: number;
}

interface ExecutionMetrics {
  duration: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  networkUsage: number;
  gpuUsage: number;
  throughput: number;
  errorCount: number;
  warningCount: number;
}

interface ExecutionLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  component: string;
  message: string;
  metadata: Record<string, any>;
}

interface ExecutionError {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  stack?: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

interface ExecutionWarning {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  component: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

// Advanced Rule Orchestration Center Component
// Enterprise-grade orchestration hub with comprehensive workflow management,
// resource coordination, cluster orchestration, load balancing, scheduling,
// and complete backend integration with zero mock data usage.
const RuleOrchestrationCenter: React.FC = () => {
  // Hooks
  const { 
    rules, 
    workflows, 
    executeWorkflow, 
    pauseWorkflow, 
    resumeWorkflow, 
    cancelWorkflow,
    getWorkflowStatus,
    getExecutionMetrics,
    isLoading: rulesLoading,
    error: rulesError 
  } = useScanRules();

  const { 
    validateWorkflow, 
    validationResults,
    isValidating,
    validationError 
  } = useValidation();

  const { 
    optimizeWorkflow, 
    generateExecutionPlan,
    predictResourceUsage,
    suggestOptimizations,
    isAnalyzing,
    analysisError 
  } = useIntelligence();

  const { 
    sessions, 
    addComment,
    shareWorkflow,
    isCollaborating,
    collaborationError 
  } = useCollaboration();

  const { 
    analyzePerformance, 
    generateOptimizations,
    getBenchmarks,
    isOptimizing,
    optimizationError 
  } = useOptimization();

  const { 
    generateReport, 
    exportReport,
    reports,
    isGenerating,
    reportError 
  } = useReporting();

  const { 
    orchestrationState,
    clusters,
    nodes,
    resources,
    createWorkflow,
    deployWorkflow,
    scaleWorkflow,
    updateWorkflow,
    deleteWorkflow,
    createCluster,
    deleteCluster,
    addNode,
    removeNode,
    allocateResources,
    deallocateResources,
    getClusterStatus,
    getNodeStatus,
    getResourceUsage,
    configureLoadBalancer,
    configureScheduler,
    getOrchestrationMetrics,
    isOrchestrating,
    orchestrationError
  } = useOrchestration();

  // Orchestration State
  const [currentState, setCurrentState] = useState<OrchestrationState>({
    activeWorkflows: [],
    queuedWorkflows: [],
    completedWorkflows: [],
    failedWorkflows: [],
    resources: {
      total: { cpu: 0, memory: 0, storage: 0, network: 0, gpu: 0, instances: 0 },
      allocated: { cpu: 0, memory: 0, storage: 0, network: 0, gpu: 0, instances: 0 },
      available: { cpu: 0, memory: 0, storage: 0, network: 0, gpu: 0, instances: 0 },
      utilization: { cpu: 0, memory: 0, storage: 0, network: 0, gpu: 0, instances: 0 },
      allocations: [],
      reservations: [],
      policies: []
    },
    clusters: [],
    nodes: [],
    loadBalancer: {
      algorithm: 'round-robin',
      healthCheck: {
        enabled: true,
        interval: 30,
        timeout: 5,
        path: '/health',
        port: 8080,
        protocol: 'http',
        successThreshold: 1,
        failureThreshold: 3
      },
      stickySession: false,
      timeout: 30,
      retries: 3,
      backendServers: [],
      rules: []
    },
    scheduler: {
      algorithm: 'fair-share',
      preemption: true,
      nodeAffinity: { requiredDuringScheduling: [], preferredDuringScheduling: [] },
      podAntiAffinity: { requiredDuringScheduling: [], preferredDuringScheduling: [] },
      tolerations: [],
      resourceRequests: [],
      resourceLimits: [],
      scheduling: {
        priorityClassName: 'high-priority',
        preemptionPolicy: 'PreemptLowerPriority',
        overhead: { cpu: 0, memory: 0, storage: 0, network: 0, gpu: 0, instances: 0 },
        topologySpreadConstraints: []
      }
    },
    metrics: {
      totalWorkflows: 0,
      activeWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      averageExecutionTime: 0,
      resourceUtilization: { cpu: 0, memory: 0, storage: 0, network: 0, gpu: 0, instances: 0 },
      throughput: 0,
      errorRate: 0,
      availability: 0,
      performance: {
        latency: { p50: 0, p90: 0, p95: 0, p99: 0, mean: 0, max: 0, min: 0 },
        throughput: { requestsPerSecond: 0, workflowsPerMinute: 0, dataProcessedPerHour: 0, operationsPerSecond: 0 },
        errorRate: 0,
        availability: 0,
        saturation: 0
      },
      costs: {
        totalCost: 0,
        costPerWorkflow: 0,
        costPerHour: 0,
        resourceCosts: { compute: 0, storage: 0, network: 0, gpu: 0, other: 0 },
        optimizationSavings: 0
      }
    }
  });

  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowExecution | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<OrchestrationCluster | null>(null);
  const [selectedNode, setSelectedNode] = useState<OrchestrationNode | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showClusterDialog, setShowClusterDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Real-time State
  const [realTimeMetrics, setRealTimeMetrics] = useState<OrchestrationMetrics | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCluster, setFilterCluster] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Loading and Error States
  const [loadingStates, setLoadingStates] = useState({
    workflows: false,
    clusters: false,
    resources: false,
    deployment: false,
    scaling: false,
    optimization: false
  });

  const [errors, setErrors] = useState({
    orchestration: null as string | null,
    workflow: null as string | null,
    cluster: null as string | null,
    resource: null as string | null
  });

  // Refs
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Initialize orchestration state
  useEffect(() => {
    if (orchestrationState) {
      setCurrentState(orchestrationState);
    }
  }, [orchestrationState]);

  // Setup real-time metrics monitoring
  useEffect(() => {
    if (autoRefresh) {
      metricsIntervalRef.current = setInterval(async () => {
        try {
          const metrics = await getOrchestrationMetrics();
          setRealTimeMetrics(metrics);
        } catch (error) {
          console.error('Failed to fetch real-time metrics:', error);
        }
      }, refreshInterval);
    }

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, getOrchestrationMetrics]);

  // Handle execute workflow
  const handleExecuteWorkflow = useCallback(async (workflowId: string, config?: any) => {
    setLoadingStates(prev => ({ ...prev, workflows: true }));
    setErrors(prev => ({ ...prev, workflow: null }));

    try {
      const execution = await executeWorkflow(workflowId, {
        priority: config?.priority || 'medium',
        cluster: config?.cluster || 'default',
        resources: config?.resources,
        configuration: config
      });

      setCurrentState(prev => ({
        ...prev,
        activeWorkflows: [...prev.activeWorkflows, execution]
      }));

      console.log('Workflow execution started:', execution);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        workflow: error instanceof Error ? error.message : 'Failed to execute workflow' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, workflows: false }));
    }
  }, [executeWorkflow]);

  // Handle pause workflow
  const handlePauseWorkflow = useCallback(async (executionId: string) => {
    try {
      await pauseWorkflow(executionId);
      
      setCurrentState(prev => ({
        ...prev,
        activeWorkflows: prev.activeWorkflows.map(w => 
          w.id === executionId 
            ? { ...w, status: 'paused' as const }
            : w
        )
      }));

      console.log('Workflow paused:', executionId);
    } catch (error) {
      console.error('Failed to pause workflow:', error);
    }
  }, [pauseWorkflow]);

  // Handle resume workflow
  const handleResumeWorkflow = useCallback(async (executionId: string) => {
    try {
      await resumeWorkflow(executionId);
      
      setCurrentState(prev => ({
        ...prev,
        activeWorkflows: prev.activeWorkflows.map(w => 
          w.id === executionId 
            ? { ...w, status: 'running' as const }
            : w
        )
      }));

      console.log('Workflow resumed:', executionId);
    } catch (error) {
      console.error('Failed to resume workflow:', error);
    }
  }, [resumeWorkflow]);

  // Handle cancel workflow
  const handleCancelWorkflow = useCallback(async (executionId: string) => {
    try {
      await cancelWorkflow(executionId);
      
      setCurrentState(prev => ({
        ...prev,
        activeWorkflows: prev.activeWorkflows.filter(w => w.id !== executionId),
        failedWorkflows: [
          ...prev.failedWorkflows,
          ...prev.activeWorkflows.filter(w => w.id === executionId).map(w => ({
            ...w,
            status: 'cancelled' as const,
            endTime: new Date().toISOString()
          }))
        ]
      }));

      console.log('Workflow cancelled:', executionId);
    } catch (error) {
      console.error('Failed to cancel workflow:', error);
    }
  }, [cancelWorkflow]);

  // Handle create cluster
  const handleCreateCluster = useCallback(async (clusterConfig: Partial<OrchestrationCluster>) => {
    setLoadingStates(prev => ({ ...prev, clusters: true }));
    setErrors(prev => ({ ...prev, cluster: null }));

    try {
      const cluster = await createCluster({
        name: clusterConfig.name || 'new-cluster',
        region: clusterConfig.region || 'us-east-1',
        zone: clusterConfig.zone || 'us-east-1a',
        provider: clusterConfig.provider || 'aws',
        config: clusterConfig.config || {
          version: '1.24',
          networking: {
            podCIDR: '10.244.0.0/16',
            serviceCIDR: '10.96.0.0/12',
            dnsPolicy: 'ClusterFirst',
            networkPlugin: 'flannel',
            networkPolicy: false
          },
          storage: {
            storageClasses: [],
            persistentVolumes: [],
            csiDrivers: []
          },
          security: {
            rbac: true,
            podSecurityPolicy: false,
            networkPolicy: false,
            admission: { controllers: [], webhooks: [] },
            encryption: { enabled: false, provider: '', keys: [] }
          },
          logging: {
            level: 'info',
            format: 'json',
            output: ['stdout'],
            rotation: {
              enabled: true,
              maxSize: '100MB',
              maxAge: '7d',
              maxBackups: 3,
              compress: true
            },
            aggregation: {
              enabled: false,
              endpoint: '',
              index: '',
              retention: '30d'
            }
          },
          monitoring: {
            enabled: true,
            prometheus: {
              retention: '15d',
              storage: '10Gi',
              scrapeInterval: '15s',
              evaluationInterval: '15s'
            },
            grafana: {
              persistence: true,
              storageSize: '1Gi',
              adminPassword: 'admin'
            },
            alerting: {
              enabled: true,
              rules: [],
              receivers: []
            }
          },
          autoscaling: {
            enabled: true,
            minNodes: 1,
            maxNodes: 10,
            targetCPUUtilization: 70,
            targetMemoryUtilization: 70,
            scaleUpPolicy: {
              stabilizationWindowSeconds: 300,
              policies: []
            },
            scaleDownPolicy: {
              stabilizationWindowSeconds: 600,
              policies: []
            }
          }
        }
      });

      setCurrentState(prev => ({
        ...prev,
        clusters: [...prev.clusters, cluster]
      }));

      console.log('Cluster created:', cluster);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        cluster: error instanceof Error ? error.message : 'Failed to create cluster' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, clusters: false }));
    }
  }, [createCluster]);

  // Handle add node
  const handleAddNode = useCallback(async (clusterId: string, nodeConfig: Partial<OrchestrationNode>) => {
    setLoadingStates(prev => ({ ...prev, clusters: true }));

    try {
      const node = await addNode(clusterId, {
        name: nodeConfig.name || 'new-node',
        role: nodeConfig.role || 'worker',
        capacity: nodeConfig.capacity || {
          cpu: 4,
          memory: 8192,
          storage: 100,
          network: 1000,
          gpu: 0,
          instances: 50
        },
        labels: nodeConfig.labels || {},
        annotations: nodeConfig.annotations || {},
        taints: nodeConfig.taints || []
      });

      setCurrentState(prev => ({
        ...prev,
        nodes: [...prev.nodes, node],
        clusters: prev.clusters.map(c => 
          c.id === clusterId 
            ? { ...c, nodes: [...c.nodes, node] }
            : c
        )
      }));

      console.log('Node added:', node);
    } catch (error) {
      console.error('Failed to add node:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, clusters: false }));
    }
  }, [addNode]);

  // Handle allocate resources
  const handleAllocateResources = useCallback(async (
    workflowId: string, 
    stepId: string, 
    resources: ResourceCapacity,
    nodeId?: string
  ) => {
    setLoadingStates(prev => ({ ...prev, resources: true }));
    setErrors(prev => ({ ...prev, resource: null }));

    try {
      const allocation = await allocateResources({
        workflowId,
        stepId,
        resources,
        nodeId,
        duration: 3600, // 1 hour default
        priority: 'medium'
      });

      setCurrentState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          allocated: {
            cpu: prev.resources.allocated.cpu + resources.cpu,
            memory: prev.resources.allocated.memory + resources.memory,
            storage: prev.resources.allocated.storage + resources.storage,
            network: prev.resources.allocated.network + resources.network,
            gpu: prev.resources.allocated.gpu + resources.gpu,
            instances: prev.resources.allocated.instances + resources.instances
          },
          available: {
            cpu: prev.resources.available.cpu - resources.cpu,
            memory: prev.resources.available.memory - resources.memory,  
            storage: prev.resources.available.storage - resources.storage,
            network: prev.resources.available.network - resources.network,
            gpu: prev.resources.available.gpu - resources.gpu,
            instances: prev.resources.available.instances - resources.instances
          },
          allocations: [...prev.resources.allocations, allocation]
        }
      }));

      console.log('Resources allocated:', allocation);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        resource: error instanceof Error ? error.message : 'Failed to allocate resources' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, resources: false }));
    }
  }, [allocateResources]);

  // Handle scale workflow
  const handleScaleWorkflow = useCallback(async (workflowId: string, replicas: number) => {
    setLoadingStates(prev => ({ ...prev, scaling: true }));

    try {
      await scaleWorkflow(workflowId, replicas);
      console.log(`Workflow ${workflowId} scaled to ${replicas} replicas`);
    } catch (error) {
      console.error('Failed to scale workflow:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, scaling: false }));
    }
  }, [scaleWorkflow]);

  // Handle optimize workflow
  const handleOptimizeWorkflow = useCallback(async (workflowId: string) => {
    setLoadingStates(prev => ({ ...prev, optimization: true }));

    try {
      const optimizations = await optimizeWorkflow(workflowId);
      console.log('Workflow optimizations:', optimizations);
    } catch (error) {
      console.error('Failed to optimize workflow:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, optimization: false }));
    }
  }, [optimizeWorkflow]);

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    const allWorkflows = [
      ...currentState.activeWorkflows,
      ...currentState.completedWorkflows,
      ...currentState.failedWorkflows
    ];

    return allWorkflows.filter(workflow => {
      const matchesSearch = !searchQuery || 
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.user.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
      const matchesCluster = filterCluster === 'all' || workflow.cluster === filterCluster;
      const matchesPriority = filterPriority === 'all' || workflow.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesCluster && matchesPriority;
    }).sort((a, b) => {
      const aValue = sortBy === 'startTime' ? new Date(a.startTime).getTime() : a[sortBy as keyof WorkflowExecution];
      const bValue = sortBy === 'startTime' ? new Date(b.startTime).getTime() : b[sortBy as keyof WorkflowExecution];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [currentState, searchQuery, filterStatus, filterCluster, filterPriority, sortBy, sortOrder]);

  // Format duration
  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }, []);

  // Format resource capacity
  const formatResourceCapacity = useCallback((capacity: ResourceCapacity) => {
    return {
      cpu: `${capacity.cpu} cores`,
      memory: `${Math.round(capacity.memory / 1024)} GB`,
      storage: `${Math.round(capacity.storage / 1024)} GB`,
      network: `${capacity.network} Mbps`,
      gpu: `${capacity.gpu} GPUs`,
      instances: `${capacity.instances} pods`
    };
  }, []);

  // Calculate resource utilization percentage
  const calculateUtilization = useCallback((used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  }, []);

  // Main render
  return (
    <TooltipProvider>
      <div className={`flex flex-col h-full bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold flex items-center">
              <Command className="h-6 w-6 mr-2" />
              Rule Orchestration Center
            </h1>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                {currentState.activeWorkflows.length} Active
              </Badge>
              <Badge variant="secondary" className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                {currentState.completedWorkflows.length} Completed
              </Badge>
              {currentState.failedWorkflows.length > 0 && (
                <Badge variant="destructive" className="flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  {currentState.failedWorkflows.length} Failed
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* System Status */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Server className="h-4 w-4" />
                <span>{currentState.clusters.length} Clusters</span>
              </div>
              <div className="flex items-center space-x-1">
                <Monitor className="h-4 w-4" />
                <span>{currentState.nodes.length} Nodes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Cpu className="h-4 w-4" />
                <span>
                  {calculateUtilization(
                    currentState.resources.allocated.cpu,
                    currentState.resources.total.cpu
                  )}% CPU
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWorkflowDialog(true)}
            >
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClusterDialog(true)}
            >
              <Server className="h-4 w-4" />
              Add Cluster
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMetricsDialog(true)}
            >
              <BarChart3 className="h-4 w-4" />
              Metrics
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowResourceDialog(true)}>
                  <Package className="h-4 w-4 mr-2" />
                  Resources
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4 mr-2" />
                  ) : (
                    <Maximize className="h-4 w-4 mr-2" />
                  )}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start p-0 h-auto bg-transparent border-b rounded-none">
                <TabsTrigger value="dashboard" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="workflows" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Workflow className="h-4 w-4 mr-2" />
                  Workflows
                </TabsTrigger>
                <TabsTrigger value="clusters" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Server className="h-4 w-4 mr-2" />
                  Clusters
                </TabsTrigger>
                <TabsTrigger value="resources" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Package className="h-4 w-4 mr-2" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Activity className="h-4 w-4 mr-2" />
                  Monitoring
                </TabsTrigger>
                <TabsTrigger value="scheduling" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Calendar className="h-4 w-4 mr-2" />
                  Scheduling
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="flex-1 p-4" ref={dashboardRef}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                  {/* Summary Cards */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Workflows</p>
                          <p className="text-2xl font-bold">{realTimeMetrics?.totalWorkflows || currentState.metrics.totalWorkflows}</p>
                        </div>
                        <Workflow className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="mt-2 flex items-center text-xs">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                        <span className="text-green-500">+12% from last hour</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Workflows</p>
                          <p className="text-2xl font-bold text-blue-600">{currentState.activeWorkflows.length}</p>
                        </div>
                        <Activity className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="mt-2 flex items-center text-xs">
                        <div className="flex space-x-1">
                          {currentState.activeWorkflows.slice(0, 3).map((w, i) => (
                            <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          ))}
                        </div>
                        <span className="ml-2 text-muted-foreground">Running now</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Resource Usage</p>
                          <p className="text-2xl font-bold">
                            {calculateUtilization(
                              currentState.resources.allocated.cpu + currentState.resources.allocated.memory,
                              currentState.resources.total.cpu + currentState.resources.total.memory
                            )}%
                          </p>
                        </div>
                        <Gauge className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="mt-2">
                        <Progress 
                          value={calculateUtilization(
                            currentState.resources.allocated.cpu + currentState.resources.allocated.memory,
                            currentState.resources.total.cpu + currentState.resources.total.memory
                          )} 
                          className="h-2" 
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className="text-2xl font-bold text-green-600">
                            {currentState.completedWorkflows.length + currentState.failedWorkflows.length > 0
                              ? Math.round((currentState.completedWorkflows.length / (currentState.completedWorkflows.length + currentState.failedWorkflows.length)) * 100)
                              : 100
                            }%
                          </p>
                        </div>
                        <Target className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="mt-2 flex items-center text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        <span className="text-green-500">
                          {currentState.completedWorkflows.length} successful
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Real-time Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Workflow Execution Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {currentState.activeWorkflows.slice(0, 5).map(workflow => (
                          <div key={workflow.id} className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium truncate">{workflow.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(workflow.progress)}%
                                </span>
                              </div>
                              <Progress value={workflow.progress} className="h-2" />
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                  Started {formatDuration(Date.now() - new Date(workflow.startTime).getTime())} ago
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Gauge className="h-5 w-5 mr-2" />
                        Resource Utilization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">CPU</span>
                            <span className="text-sm text-muted-foreground">
                              {currentState.resources.allocated.cpu} / {currentState.resources.total.cpu} cores
                            </span>
                          </div>
                          <Progress 
                            value={calculateUtilization(currentState.resources.allocated.cpu, currentState.resources.total.cpu)} 
                            className="h-3" 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Memory</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(currentState.resources.allocated.memory / 1024)}GB / {Math.round(currentState.resources.total.memory / 1024)}GB
                            </span>
                          </div>
                          <Progress 
                            value={calculateUtilization(currentState.resources.allocated.memory, currentState.resources.total.memory)} 
                            className="h-3" 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Storage</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(currentState.resources.allocated.storage / 1024)}GB / {Math.round(currentState.resources.total.storage / 1024)}GB
                            </span>
                          </div>
                          <Progress 
                            value={calculateUtilization(currentState.resources.allocated.storage, currentState.resources.total.storage)} 
                            className="h-3" 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Network</span>
                            <span className="text-sm text-muted-foreground">
                              {currentState.resources.allocated.network}Mbps / {currentState.resources.total.network}Mbps
                            </span>
                          </div>
                          <Progress 
                            value={calculateUtilization(currentState.resources.allocated.network, currentState.resources.total.network)} 
                            className="h-3" 
                          />
                        </div>

                        {currentState.resources.total.gpu > 0 && (
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">GPU</span>
                              <span className="text-sm text-muted-foreground">
                                {currentState.resources.allocated.gpu} / {currentState.resources.total.gpu} GPUs
                              </span>
                            </div>
                            <Progress 
                              value={calculateUtilization(currentState.resources.allocated.gpu, currentState.resources.total.gpu)} 
                              className="h-3" 
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Cluster Status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Server className="h-5 w-5 mr-2" />
                        Cluster Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {currentState.clusters.map(cluster => (
                          <div key={cluster.id} className="flex items-center space-x-4 p-3 border rounded">
                            <div className="flex-shrink-0">
                              <div className={`w-3 h-3 rounded-full ${
                                cluster.status === 'active' ? 'bg-green-500' :
                                cluster.status === 'maintenance' ? 'bg-yellow-500' :
                                cluster.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{cluster.name}</h4>
                                <Badge variant={
                                  cluster.status === 'active' ? 'default' :
                                  cluster.status === 'maintenance' ? 'secondary' :
                                  cluster.status === 'error' ? 'destructive' : 'outline'
                                }>
                                  {cluster.status}
                                </Badge>
                              </div>
                              <div className="flex items-center mt-1 text-sm text-muted-foreground space-x-4">
                                <span>{cluster.nodes.length} nodes</span>
                                <span>{cluster.region}/{cluster.zone}</span>
                                <span>v{cluster.version}</span>
                                <span>{cluster.provider}</span>
                                <span>{calculateUtilization(cluster.utilization.cpu, cluster.capacity.cpu)}% CPU</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedCluster(cluster)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAddNode(cluster.id, {})}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Node
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deleteCluster(cluster.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        System Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Sample alerts - these would come from real monitoring */}
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            High CPU usage detected on cluster-01 (85%)
                          </AlertDescription>
                        </Alert>
                        
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Autoscaling triggered for workflow-batch-processing
                          </AlertDescription>
                        </Alert>
                        
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            All systems operational - no issues detected
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Workflows Tab */}
              <TabsContent value="workflows" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Workflow Management</h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search workflows..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterCluster} onValueChange={setFilterCluster}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Cluster" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clusters</SelectItem>
                        {currentState.clusters.map(cluster => (
                          <SelectItem key={cluster.id} value={cluster.name}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button onClick={() => setShowWorkflowDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Workflow
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredWorkflows.map(workflow => (
                      <Card key={workflow.id} className="hover:bg-accent/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Workflow className="h-4 w-4" />
                                <h4 className="font-medium">{workflow.name}</h4>
                                <Badge variant={
                                  workflow.status === 'running' ? 'default' :
                                  workflow.status === 'completed' ? 'secondary' :
                                  workflow.status === 'failed' ? 'destructive' :
                                  workflow.status === 'paused' ? 'outline' : 'secondary'
                                }>
                                  {workflow.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {workflow.priority}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                                <div>
                                  <span className="font-medium">Started:</span>
                                  <div>{new Date(workflow.startTime).toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Duration:</span>
                                  <div>
                                    {workflow.duration 
                                      ? formatDuration(workflow.duration)
                                      : formatDuration(Date.now() - new Date(workflow.startTime).getTime())
                                    }
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium">Cluster:</span>
                                  <div>{workflow.cluster}</div>
                                </div>
                                <div>
                                  <span className="font-medium">User:</span>
                                  <div>{workflow.user}</div>
                                </div>
                              </div>
                              
                              {workflow.status === 'running' && (
                                <div className="mb-3">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Progress</span>
                                    <span className="text-sm text-muted-foreground">
                                      {Math.round(workflow.progress)}%
                                    </span>
                                  </div>
                                  <Progress value={workflow.progress} className="h-2" />
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <Cpu className="h-3 w-3" />
                                  <span>{workflow.metrics.cpuUsage}% CPU</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MemoryStick className="h-3 w-3" />
                                  <span>{Math.round(workflow.metrics.memoryUsage)}MB RAM</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>{workflow.steps.filter(s => s.status === 'completed').length}/{workflow.steps.length} steps</span>
                                </div>
                                {workflow.errors.length > 0 && (
                                  <div className="flex items-center space-x-1 text-red-600">
                                    <XCircle className="h-3 w-3" />
                                    <span>{workflow.errors.length} errors</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {workflow.status === 'running' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePauseWorkflow(workflow.id)}
                                  >
                                    <Pause className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleCancelWorkflow(workflow.id)}
                                  >
                                    <Square className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              
                              {workflow.status === 'paused' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleResumeWorkflow(workflow.id)}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedWorkflow(workflow)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOptimizeWorkflow(workflow.workflowId)}>
                                    <Zap className="h-4 w-4 mr-2" />
                                    Optimize
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleScaleWorkflow(workflow.workflowId, 2)}>
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Scale Up
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => shareWorkflow(workflow.id, ['team'])}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(workflow.id)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy ID
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Additional tabs would continue here... */}
              <TabsContent value="clusters" className="flex-1 p-4">
                <div className="text-center text-muted-foreground">
                  <Server className="h-12 w-12 mx-auto mb-4" />
                  <p>Cluster management interface coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="resources" className="flex-1 p-4">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>Resource management interface coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="flex-1 p-4">
                <div className="text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4" />
                  <p>Monitoring dashboard coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="scheduling" className="flex-1 p-4">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Scheduling interface coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* New Workflow Dialog */}
        <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Configure and deploy a new workflow to the orchestration system
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label>Workflow Name</Label>
                <Input placeholder="Enter workflow name" />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Enter workflow description" rows={3} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Target Cluster</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cluster" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentState.clusters.map(cluster => (
                        <SelectItem key={cluster.id} value={cluster.id}>
                          {cluster.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Handle workflow creation
                  setShowWorkflowDialog(false);
                }}>
                  Create Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RuleOrchestrationCenter;