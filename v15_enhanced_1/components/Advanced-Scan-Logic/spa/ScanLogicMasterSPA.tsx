/**
 * 🎯 Scan Logic Master SPA - Advanced Data Governance Orchestration Platform
 * ===========================================================================
 * 
 * Enterprise-grade master SPA that orchestrates and controls all components
 * within the Advanced-Scan-Logic group, providing unified workflow management,
 * intelligent automation, and comprehensive data governance capabilities.
 * 
 * Orchestrated Subgroups:
 * - scan-orchestration/: Centralized scan coordination and management
 * - scan-intelligence/: AI-powered scan analysis and insights
 * - performance-optimization/: System performance monitoring and optimization
 * - workflow-management/: Advanced workflow automation and control
 * - scan-coordination/: Multi-system scan coordination and synchronization
 * - real-time-monitoring/: Live monitoring and alerting systems
 * - security-compliance/: Security scanning and compliance management
 * - advanced-analytics/: Predictive analytics and business intelligence
 * 
 * Features:
 * - Unified orchestration dashboard with real-time monitoring
 * - Intelligent workflow automation and cross-component coordination
 * - Advanced analytics integration with predictive insights
 * - Comprehensive security and compliance management
 * - Real-time performance monitoring and optimization
 * - Cross-platform data synchronization and management
 * - Executive reporting and strategic decision support
 * - AI-powered recommendations and automated actions
 * 
 * Backend Integration:
 * - ScanOrchestrationService for centralized scan management
 * - WorkflowEngineService for automated workflow execution
 * - AnalyticsIntegrationService for cross-component data analysis
 * - SecurityComplianceService for unified security management
 * - PerformanceMonitoringService for system optimization
 * - RealTimeStreamingService for live data updates
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Command as CommandIcon,
  Crown,
  Database,
  Eye,
  Filter,
  Gauge,
  Globe,
  Grid,
  HelpCircle,
  Home,
  Info,
  Layout,
  LineChart,
  Lock,
  Monitor,
  Network,
  PieChart,
  Play,
  Radar,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Zap,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Layers,
  MoreHorizontal,
  Plus,
  Share,
  Timer,
  Upload,
  XCircle,
  Maximize,
  Minimize,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Archive,
  Bookmark,
  Copy,
  Edit,
  Flag,
  History,
  Mail,
  MessageSquare,
  Trash2,
  User,
  Award,
  Briefcase,
  Building,
  Calendar as CalendarIcon,
  Cloud,
  Code,
  Crosshair,
  DollarSign,
  Folder,
  GitBranch,
  Hash,
  Image,
  Key,
  Link,
  Map,
  Palette,
  Phone,
  Save,
  Server,
  Sliders,
  Tag,
  Terminal,
  Tool,
  Truck,
  Umbrella,
  Video,
  Wifi as WifiIcon,
  Wind,
  Wrench,
  X,
  Youtube,
  Zap as ZapIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Lazy load components for better performance
const SecurityOrchestrator = lazy(() => import('../components/security-compliance/SecurityOrchestrator'));
const ComplianceMonitor = lazy(() => import('../components/security-compliance/ComplianceMonitor'));
const SecurityScanEngine = lazy(() => import('../components/security-compliance/SecurityScanEngine'));
const VulnerabilityAssessment = lazy(() => import('../components/security-compliance/VulnerabilityAssessment'));
const AccessControlManager = lazy(() => import('../components/security-compliance/AccessControlManager'));
const AuditTrailManager = lazy(() => import('../components/security-compliance/AuditTrailManager'));
const ThreatIntelligence = lazy(() => import('../components/security-compliance/ThreatIntelligence'));
const SecurityReporting = lazy(() => import('../components/security-compliance/SecurityReporting'));

const AdvancedAnalyticsDashboard = lazy(() => import('../components/advanced-analytics/AdvancedAnalyticsDashboard'));
const PredictiveAnalyticsEngine = lazy(() => import('../components/advanced-analytics/PredictiveAnalyticsEngine'));
const MLInsightsGenerator = lazy(() => import('../components/advanced-analytics/MLInsightsGenerator'));
const BusinessIntelligence = lazy(() => import('../components/advanced-analytics/BusinessIntelligence'));
const DataVisualizationSuite = lazy(() => import('../components/advanced-analytics/DataVisualizationSuite'));

// ==================== Types and Interfaces ====================

interface SystemOverview {
  totalScans: number;
  activeScans: number;
  completedScans: number;
  failedScans: number;
  
  // Security Metrics
  securityAlerts: number;
  criticalVulnerabilities: number;
  complianceScore: number;
  threatLevel: ThreatLevel;
  
  // Performance Metrics
  systemPerformance: number;
  avgScanTime: number;
  resourceUtilization: number;
  uptime: number;
  
  // Analytics Metrics
  totalInsights: number;
  predictiveModels: number;
  dataQualityScore: number;
  businessImpact: number;
  
  // Workflow Metrics
  activeWorkflows: number;
  automatedActions: number;
  workflowEfficiency: number;
  
  // Real-time Status
  lastUpdated: string;
  systemHealth: SystemHealth;
  
  // Alerts and Notifications
  pendingAlerts: number;
  criticalAlerts: number;
  
  // Resource Management
  storageUsage: number;
  processingCapacity: number;
  networkLatency: number;
}

enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum SystemHealth {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  WARNING = 'warning',
  CRITICAL = 'critical',
  OFFLINE = 'offline'
}

interface ComponentGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  
  // Status
  status: ComponentStatus;
  health: SystemHealth;
  
  // Metrics
  activeComponents: number;
  totalComponents: number;
  
  // Performance
  performance: number;
  uptime: number;
  lastActivity: string;
  
  // Integration
  dependencies: string[];
  integrations: string[];
  
  // Configuration
  enabled: boolean;
  priority: Priority;
  
  // Components
  components: ComponentInfo[];
}

enum ComponentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOADING = 'loading',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface ComponentInfo {
  id: string;
  name: string;
  description: string;
  status: ComponentStatus;
  
  // Performance
  performance: number;
  uptime: number;
  lastActivity: string;
  
  // Resources
  cpuUsage: number;
  memoryUsage: number;
  
  // Metrics
  requestCount: number;
  errorRate: number;
  avgResponseTime: number;
  
  // Configuration
  enabled: boolean;
  version: string;
  
  // Health Check
  healthCheck: HealthCheck;
}

interface HealthCheck {
  status: SystemHealth;
  lastCheck: string;
  checks: HealthCheckItem[];
}

interface HealthCheckItem {
  name: string;
  status: boolean;
  message: string;
  timestamp: string;
}

interface WorkflowExecution {
  id: string;
  name: string;
  description: string;
  
  // Execution Details
  status: WorkflowStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  
  // Configuration
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  
  // Progress
  currentStep: number;
  completedSteps: number;
  totalSteps: number;
  progress: number;
  
  // Results
  results: WorkflowResult[];
  
  // Error Handling
  errors: WorkflowError[];
  retryCount: number;
  maxRetries: number;
  
  // Metadata
  createdBy: string;
  tags: string[];
  priority: Priority;
}

enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

interface WorkflowTrigger {
  type: TriggerType;
  condition: string;
  schedule?: string;
  event?: string;
}

enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  EVENT = 'event',
  CONDITIONAL = 'conditional'
}

interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  
  // Configuration
  component: string;
  action: string;
  parameters: Record<string, any>;
  
  // Execution
  status: StepStatus;
  startTime?: string;
  endTime?: string;
  duration?: number;
  
  // Dependencies
  dependencies: string[];
  
  // Error Handling
  retryOnFailure: boolean;
  maxRetries: number;
  timeout: number;
  
  // Output
  output?: any;
  error?: string;
}

enum StepType {
  SCAN = 'scan',
  ANALYSIS = 'analysis',
  NOTIFICATION = 'notification',
  INTEGRATION = 'integration',
  VALIDATION = 'validation',
  TRANSFORMATION = 'transformation',
  CUSTOM = 'custom'
}

enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

interface WorkflowResult {
  stepId: string;
  data: any;
  timestamp: string;
  success: boolean;
}

interface WorkflowError {
  stepId: string;
  message: string;
  details: string;
  timestamp: string;
  recoverable: boolean;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  
  // Source
  source: string;
  component: string;
  
  // Timing
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  
  // Status
  status: AlertStatus;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  
  // Actions
  actions: AlertAction[];
  
  // Metadata
  tags: string[];
  category: string;
  
  // Related Data
  relatedAlerts: string[];
  affectedSystems: string[];
}

enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

interface AlertAction {
  id: string;
  name: string;
  description: string;
  type: ActionType;
  
  // Configuration
  parameters: Record<string, any>;
  
  // Execution
  automated: boolean;
  executed: boolean;
  executedAt?: string;
  executedBy?: string;
  
  // Results
  success?: boolean;
  result?: any;
  error?: string;
}

enum ActionType {
  ACKNOWLEDGE = 'acknowledge',
  RESOLVE = 'resolve',
  ESCALATE = 'escalate',
  NOTIFY = 'notify',
  RESTART = 'restart',
  SCALE = 'scale',
  CUSTOM = 'custom'
}

interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  
  // Layout
  position: WidgetPosition;
  size: WidgetSize;
  
  // Configuration
  dataSource: string;
  refreshInterval: number;
  
  // Status
  status: WidgetStatus;
  lastUpdated: string;
  
  // Data
  data: any;
  
  // Styling
  theme: WidgetTheme;
  
  // Interaction
  interactive: boolean;
  drillDownEnabled: boolean;
}

enum WidgetType {
  METRIC_CARD = 'metric_card',
  CHART = 'chart',
  TABLE = 'table',
  ALERT_LIST = 'alert_list',
  STATUS_GRID = 'status_grid',
  PROGRESS_BAR = 'progress_bar',
  TIMELINE = 'timeline',
  MAP = 'map',
  CUSTOM = 'custom'
}

interface WidgetPosition {
  x: number;
  y: number;
  z: number;
}

interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

enum WidgetStatus {
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
  NO_DATA = 'no_data'
}

enum WidgetTheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  
  // Hierarchy
  parent?: string;
  children?: NavigationItem[];
  
  // Status
  enabled: boolean;
  visible: boolean;
  
  // Permissions
  requiredPermissions: string[];
  
  // Metadata
  description: string;
  tags: string[];
  
  // Badge
  badge?: NavigationBadge;
}

interface NavigationBadge {
  text: string;
  variant: BadgeVariant;
  pulse?: boolean;
}

enum BadgeVariant {
  DEFAULT = 'default',
  SECONDARY = 'secondary',
  DESTRUCTIVE = 'destructive',
  OUTLINE = 'outline'
}

// ==================== Scan Logic Master SPA Component ====================

export const ScanLogicMasterSPA: React.FC = () => {
  const { toast } = useToast();

  // ==================== State Management ====================

  const [activeView, setActiveView] = useState('overview');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [componentGroups, setComponentGroups] = useState<ComponentGroup[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowExecution[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);

  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const wsRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== Navigation Configuration ====================

  const navigationItems: NavigationItem[] = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      path: '/overview',
      enabled: true,
      visible: true,
      requiredPermissions: [],
      description: 'System overview and dashboard',
      tags: ['dashboard', 'overview']
    },
    {
      id: 'security-compliance',
      label: 'Security & Compliance',
      icon: Shield,
      path: '/security-compliance',
      enabled: true,
      visible: true,
      requiredPermissions: ['security:read'],
      description: 'Security scanning and compliance management',
      tags: ['security', 'compliance'],
      badge: {
        text: alerts.filter(a => a.category === 'security' && a.severity === AlertSeverity.CRITICAL).length.toString(),
        variant: BadgeVariant.DESTRUCTIVE,
        pulse: true
      },
      children: [
        {
          id: 'security-orchestrator',
          label: 'Security Orchestrator',
          icon: CommandIcon,
          path: '/security-compliance/orchestrator',
          enabled: true,
          visible: true,
          requiredPermissions: ['security:orchestrate'],
          description: 'Centralized security orchestration',
          tags: ['security', 'orchestration']
        },
        {
          id: 'compliance-monitor',
          label: 'Compliance Monitor',
          icon: CheckCircle,
          path: '/security-compliance/compliance',
          enabled: true,
          visible: true,
          requiredPermissions: ['compliance:read'],
          description: 'Regulatory compliance monitoring',
          tags: ['compliance', 'monitoring']
        },
        {
          id: 'security-scan-engine',
          label: 'Scan Engine',
          icon: Radar,
          path: '/security-compliance/scan-engine',
          enabled: true,
          visible: true,
          requiredPermissions: ['security:scan'],
          description: 'Advanced security scanning',
          tags: ['security', 'scanning']
        },
        {
          id: 'vulnerability-assessment',
          label: 'Vulnerability Assessment',
          icon: AlertTriangle,
          path: '/security-compliance/vulnerability',
          enabled: true,
          visible: true,
          requiredPermissions: ['security:assess'],
          description: 'Vulnerability detection and assessment',
          tags: ['vulnerability', 'assessment']
        },
        {
          id: 'access-control',
          label: 'Access Control',
          icon: Lock,
          path: '/security-compliance/access-control',
          enabled: true,
          visible: true,
          requiredPermissions: ['security:access'],
          description: 'Access control and identity management',
          tags: ['access', 'identity']
        },
        {
          id: 'audit-trail',
          label: 'Audit Trail',
          icon: History,
          path: '/security-compliance/audit',
          enabled: true,
          visible: true,
          requiredPermissions: ['audit:read'],
          description: 'Comprehensive audit trail management',
          tags: ['audit', 'trail']
        },
        {
          id: 'threat-intelligence',
          label: 'Threat Intelligence',
          icon: Brain,
          path: '/security-compliance/threat-intel',
          enabled: true,
          visible: true,
          requiredPermissions: ['security:intel'],
          description: 'AI-powered threat intelligence',
          tags: ['threat', 'intelligence']
        },
        {
          id: 'security-reporting',
          label: 'Security Reporting',
          icon: FileText,
          path: '/security-compliance/reporting',
          enabled: true,
          visible: true,
          requiredPermissions: ['security:report'],
          description: 'Executive security reporting',
          tags: ['security', 'reporting']
        }
      ]
    },
    {
      id: 'advanced-analytics',
      label: 'Advanced Analytics',
      icon: BarChart3,
      path: '/advanced-analytics',
      enabled: true,
      visible: true,
      requiredPermissions: ['analytics:read'],
      description: 'Predictive analytics and business intelligence',
      tags: ['analytics', 'intelligence'],
      children: [
        {
          id: 'analytics-dashboard',
          label: 'Analytics Dashboard',
          icon: Layout,
          path: '/advanced-analytics/dashboard',
          enabled: true,
          visible: true,
          requiredPermissions: ['analytics:dashboard'],
          description: 'Advanced analytics dashboard',
          tags: ['analytics', 'dashboard']
        },
        {
          id: 'predictive-analytics',
          label: 'Predictive Analytics',
          icon: TrendingUp,
          path: '/advanced-analytics/predictive',
          enabled: true,
          visible: true,
          requiredPermissions: ['analytics:predictive'],
          description: 'Predictive analytics engine',
          tags: ['predictive', 'forecasting']
        },
        {
          id: 'ml-insights',
          label: 'ML Insights',
          icon: Brain,
          path: '/advanced-analytics/ml-insights',
          enabled: true,
          visible: true,
          requiredPermissions: ['analytics:ml'],
          description: 'Machine learning insights',
          tags: ['ml', 'insights']
        },
        {
          id: 'business-intelligence',
          label: 'Business Intelligence',
          icon: Target,
          path: '/advanced-analytics/bi',
          enabled: true,
          visible: true,
          requiredPermissions: ['analytics:bi'],
          description: 'Business intelligence platform',
          tags: ['business', 'intelligence']
        },
        {
          id: 'data-visualization',
          label: 'Data Visualization',
          icon: PieChart,
          path: '/advanced-analytics/visualization',
          enabled: true,
          visible: true,
          requiredPermissions: ['analytics:viz'],
          description: 'Advanced data visualization',
          tags: ['visualization', 'charts']
        }
      ]
    },
    {
      id: 'workflow-management',
      label: 'Workflow Management',
      icon: Workflow,
      path: '/workflow',
      enabled: true,
      visible: true,
      requiredPermissions: ['workflow:read'],
      description: 'Automated workflow management',
      tags: ['workflow', 'automation'],
      badge: {
        text: activeWorkflows.filter(w => w.status === WorkflowStatus.RUNNING).length.toString(),
        variant: BadgeVariant.DEFAULT
      }
    },
    {
      id: 'real-time-monitoring',
      label: 'Real-time Monitoring',
      icon: Monitor,
      path: '/monitoring',
      enabled: true,
      visible: true,
      requiredPermissions: ['monitoring:read'],
      description: 'Real-time system monitoring',
      tags: ['monitoring', 'realtime']
    },
    {
      id: 'performance-optimization',
      label: 'Performance',
      icon: Gauge,
      path: '/performance',
      enabled: true,
      visible: true,
      requiredPermissions: ['performance:read'],
      description: 'System performance optimization',
      tags: ['performance', 'optimization']
    },
    {
      id: 'scan-coordination',
      label: 'Scan Coordination',
      icon: Network,
      path: '/scan-coordination',
      enabled: true,
      visible: true,
      requiredPermissions: ['scan:coordinate'],
      description: 'Multi-system scan coordination',
      tags: ['scan', 'coordination']
    },
    {
      id: 'scan-intelligence',
      label: 'Scan Intelligence',
      icon: Brain,
      path: '/scan-intelligence',
      enabled: true,
      visible: true,
      requiredPermissions: ['scan:intelligence'],
      description: 'AI-powered scan intelligence',
      tags: ['scan', 'intelligence']
    }
  ], [alerts, activeWorkflows]);

  // ==================== Backend Integration Functions ====================

  const fetchSystemOverview = useCallback(async () => {
    try {
      const response = await fetch('/api/scan-logic/overview', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSystemOverview(data);
    } catch (error) {
      console.error('Failed to fetch system overview:', error);
      // Initialize with mock data for development
      initializeMockData();
    }
  }, []);

  const fetchComponentGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/scan-logic/components', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setComponentGroups(data.groups || []);
    } catch (error) {
      console.error('Failed to fetch component groups:', error);
    }
  }, []);

  const fetchActiveWorkflows = useCallback(async () => {
    try {
      const response = await fetch('/api/scan-logic/workflows/active', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setActiveWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Failed to fetch active workflows:', error);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/scan-logic/alerts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  }, []);

  const executeWorkflow = useCallback(async (workflowId: string, parameters?: Record<string, any>) => {
    try {
      const response = await fetch(`/api/scan-logic/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parameters }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const execution = await response.json();
      setActiveWorkflows(prev => [execution, ...prev]);
      
      toast({
        title: "Workflow Started",
        description: `Workflow execution has been initiated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "Failed to start workflow execution. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/scan-logic/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? { ...alert, acknowledged: true, acknowledgedAt: new Date().toISOString() }
            : alert
        )
      );
      
      toast({
        title: "Alert Acknowledged",
        description: "Alert has been acknowledged successfully.",
      });
    } catch (error) {
      toast({
        title: "Acknowledgment Failed",
        description: "Failed to acknowledge alert. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // ==================== Mock Data Initialization ====================

  const initializeMockData = useCallback(() => {
    const mockOverview: SystemOverview = {
      totalScans: 15847,
      activeScans: 23,
      completedScans: 15782,
      failedScans: 42,
      
      securityAlerts: 8,
      criticalVulnerabilities: 3,
      complianceScore: 94.5,
      threatLevel: ThreatLevel.MEDIUM,
      
      systemPerformance: 87.3,
      avgScanTime: 145, // seconds
      resourceUtilization: 68.2,
      uptime: 99.97,
      
      totalInsights: 247,
      predictiveModels: 12,
      dataQualityScore: 91.8,
      businessImpact: 85.2,
      
      activeWorkflows: 18,
      automatedActions: 1247,
      workflowEfficiency: 92.1,
      
      lastUpdated: new Date().toISOString(),
      systemHealth: SystemHealth.GOOD,
      
      pendingAlerts: 15,
      criticalAlerts: 3,
      
      storageUsage: 73.5,
      processingCapacity: 82.1,
      networkLatency: 12.3
    };

    const mockComponentGroups: ComponentGroup[] = [
      {
        id: 'security-compliance',
        name: 'Security & Compliance',
        description: 'Comprehensive security scanning and compliance management',
        icon: Shield,
        status: ComponentStatus.ACTIVE,
        health: SystemHealth.GOOD,
        activeComponents: 7,
        totalComponents: 8,
        performance: 91.2,
        uptime: 99.8,
        lastActivity: new Date().toISOString(),
        dependencies: ['scan-orchestration', 'real-time-monitoring'],
        integrations: ['threat-intelligence', 'audit-management'],
        enabled: true,
        priority: Priority.CRITICAL,
        components: [
          {
            id: 'security-orchestrator',
            name: 'Security Orchestrator',
            description: 'Centralized security orchestration and management',
            status: ComponentStatus.ACTIVE,
            performance: 94.1,
            uptime: 99.9,
            lastActivity: new Date().toISOString(),
            cpuUsage: 23.5,
            memoryUsage: 67.2,
            requestCount: 2847,
            errorRate: 0.02,
            avgResponseTime: 145,
            enabled: true,
            version: '2.1.0',
            healthCheck: {
              status: SystemHealth.EXCELLENT,
              lastCheck: new Date().toISOString(),
              checks: [
                {
                  name: 'API Connectivity',
                  status: true,
                  message: 'All endpoints responding normally',
                  timestamp: new Date().toISOString()
                },
                {
                  name: 'Database Connection',
                  status: true,
                  message: 'Database connection healthy',
                  timestamp: new Date().toISOString()
                }
              ]
            }
          }
        ]
      },
      {
        id: 'advanced-analytics',
        name: 'Advanced Analytics',
        description: 'Predictive analytics and business intelligence platform',
        icon: BarChart3,
        status: ComponentStatus.ACTIVE,
        health: SystemHealth.EXCELLENT,
        activeComponents: 5,
        totalComponents: 8,
        performance: 88.7,
        uptime: 99.6,
        lastActivity: new Date().toISOString(),
        dependencies: ['data-sources', 'ml-services'],
        integrations: ['business-intelligence', 'reporting'],
        enabled: true,
        priority: Priority.HIGH,
        components: []
      }
    ];

    const mockWorkflows: WorkflowExecution[] = [
      {
        id: 'workflow-001',
        name: 'Daily Security Scan',
        description: 'Automated daily security scanning workflow',
        status: WorkflowStatus.RUNNING,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        trigger: {
          type: TriggerType.SCHEDULED,
          condition: 'daily at 02:00',
          schedule: '0 2 * * *'
        },
        steps: [
          {
            id: 'step-001',
            name: 'Initialize Scan',
            type: StepType.SCAN,
            component: 'security-scan-engine',
            action: 'initialize',
            parameters: { scope: 'full', priority: 'high' },
            status: StepStatus.COMPLETED,
            startTime: new Date(Date.now() - 3600000).toISOString(),
            endTime: new Date(Date.now() - 3500000).toISOString(),
            duration: 100000,
            dependencies: [],
            retryOnFailure: true,
            maxRetries: 3,
            timeout: 300000
          },
          {
            id: 'step-002',
            name: 'Vulnerability Assessment',
            type: StepType.ANALYSIS,
            component: 'vulnerability-assessment',
            action: 'assess',
            parameters: { depth: 'comprehensive' },
            status: StepStatus.RUNNING,
            startTime: new Date(Date.now() - 3500000).toISOString(),
            dependencies: ['step-001'],
            retryOnFailure: true,
            maxRetries: 2,
            timeout: 600000
          }
        ],
        currentStep: 1,
        completedSteps: 1,
        totalSteps: 5,
        progress: 20,
        results: [],
        errors: [],
        retryCount: 0,
        maxRetries: 3,
        createdBy: 'system',
        tags: ['security', 'daily', 'automated'],
        priority: Priority.HIGH
      }
    ];

    const mockAlerts: Alert[] = [
      {
        id: 'alert-001',
        title: 'Critical Vulnerability Detected',
        message: 'High-severity vulnerability found in production system',
        severity: AlertSeverity.CRITICAL,
        source: 'vulnerability-scanner',
        component: 'security-scan-engine',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        acknowledged: false,
        status: AlertStatus.NEW,
        resolved: false,
        actions: [
          {
            id: 'action-001',
            name: 'Immediate Patch',
            description: 'Apply security patch immediately',
            type: ActionType.CUSTOM,
            parameters: { patch_id: 'CVE-2024-001' },
            automated: false,
            executed: false
          }
        ],
        tags: ['security', 'vulnerability', 'critical'],
        category: 'security',
        relatedAlerts: [],
        affectedSystems: ['prod-web-01', 'prod-api-01']
      },
      {
        id: 'alert-002',
        title: 'Performance Degradation',
        message: 'System performance has degraded below acceptable thresholds',
        severity: AlertSeverity.WARNING,
        source: 'performance-monitor',
        component: 'performance-optimization',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        acknowledged: true,
        acknowledgedBy: 'admin@company.com',
        acknowledgedAt: new Date(Date.now() - 600000).toISOString(),
        status: AlertStatus.ACKNOWLEDGED,
        resolved: false,
        actions: [],
        tags: ['performance', 'degradation'],
        category: 'performance',
        relatedAlerts: [],
        affectedSystems: ['analytics-cluster']
      }
    ];

    setSystemOverview(mockOverview);
    setComponentGroups(mockComponentGroups);
    setActiveWorkflows(mockWorkflows);
    setAlerts(mockAlerts);
  }, []);

  // ==================== Utility Functions ====================

  const getHealthColor = (health: SystemHealth): string => {
    switch (health) {
      case SystemHealth.EXCELLENT:
        return 'text-green-600';
      case SystemHealth.GOOD:
        return 'text-blue-600';
      case SystemHealth.WARNING:
        return 'text-yellow-600';
      case SystemHealth.CRITICAL:
        return 'text-red-600';
      case SystemHealth.OFFLINE:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'text-red-600';
      case AlertSeverity.ERROR:
        return 'text-orange-600';
      case AlertSeverity.WARNING:
        return 'text-yellow-600';
      case AlertSeverity.INFO:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (dateTime: string): string => {
    if (!dateTime) return 'Never';
    const now = new Date();
    const date = new Date(dateTime);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // ==================== Event Handlers ====================

  const handleRefreshData = useCallback(() => {
    fetchSystemOverview();
    fetchComponentGroups();
    fetchActiveWorkflows();
    fetchAlerts();
  }, [fetchSystemOverview, fetchComponentGroups, fetchActiveWorkflows, fetchAlerts]);

  const handleNavigationClick = useCallback((item: NavigationItem) => {
    setActiveView(item.id);
    setSelectedComponent(item.id);
  }, []);

  const handleWorkflowAction = useCallback(async (workflowId: string, action: string) => {
    try {
      const response = await fetch(`/api/scan-logic/workflows/${workflowId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Action Completed",
        description: `Workflow ${action} completed successfully.`,
      });
      
      // Refresh workflows
      fetchActiveWorkflows();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to ${action} workflow. Please try again.`,
        variant: "destructive",
      });
    }
  }, [fetchActiveWorkflows, toast]);

  // ==================== Effects ====================

  useEffect(() => {
    // Initialize data
    fetchSystemOverview();
    fetchComponentGroups();
    fetchActiveWorkflows();
    fetchAlerts();
  }, [fetchSystemOverview, fetchComponentGroups, fetchActiveWorkflows, fetchAlerts]);

  useEffect(() => {
    // Set up auto-refresh
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        handleRefreshData();
      }, 30000); // Refresh every 30 seconds

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, handleRefreshData]);

  useEffect(() => {
    // Set up real-time WebSocket connection
    if (realTimeEnabled) {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/scan-logic/ws`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'system_overview_update':
            setSystemOverview(prev => ({ ...prev, ...data.data }));
            break;
          case 'component_status_update':
            setComponentGroups(prev =>
              prev.map(group =>
                group.id === data.groupId
                  ? { ...group, ...data.data }
                  : group
              )
            );
            break;
          case 'workflow_update':
            setActiveWorkflows(prev =>
              prev.map(workflow =>
                workflow.id === data.workflowId
                  ? { ...workflow, ...data.data }
                  : workflow
              )
            );
            break;
          case 'new_alert':
            setAlerts(prev => [data.alert, ...prev]);
            if (notificationsEnabled && data.alert.severity === AlertSeverity.CRITICAL) {
              toast({
                title: "Critical Alert",
                description: data.alert.title,
                variant: "destructive",
              });
            }
            break;
          case 'alert_update':
            setAlerts(prev =>
              prev.map(alert =>
                alert.id === data.alertId
                  ? { ...alert, ...data.data }
                  : alert
              )
            );
            break;
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Real-time connection lost. Some data may not be current.",
          variant: "destructive",
        });
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [realTimeEnabled, notificationsEnabled, toast]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            setCommandPaletteOpen(true);
            break;
          case 'r':
            event.preventDefault();
            handleRefreshData();
            break;
          case 'b':
            event.preventDefault();
            setSidebarCollapsed(prev => !prev);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleRefreshData]);

  // ==================== Dashboard Components ====================

  const SystemOverviewDashboard = () => (
    <div className="space-y-6">
      {/* System Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className={cn("h-4 w-4", getHealthColor(systemOverview?.systemHealth || SystemHealth.GOOD))} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getHealthColor(systemOverview?.systemHealth || SystemHealth.GOOD))}>
              {systemOverview?.systemHealth || 'Good'}
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {systemOverview?.uptime || 99.97}% Uptime
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Overall system status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
            <Radar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemOverview?.activeScans || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                {systemOverview?.totalScans || 0} Total
              </Badge>
              <Badge variant="outline" className="text-xs">
                {systemOverview?.failedScans || 0} Failed
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Scanning operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{systemOverview?.criticalAlerts || 0}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                {systemOverview?.criticalVulnerabilities || 0} Critical
              </Badge>
              <Badge variant="outline" className="text-xs">
                {systemOverview?.securityAlerts || 0} Total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Security incidents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(systemOverview?.systemPerformance || 0)}%
            </div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="default" className="text-xs">
                {Math.round(systemOverview?.resourceUtilization || 0)}% Usage
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              System performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Component Groups Status */}
      <Card>
        <CardHeader>
          <CardTitle>Component Groups</CardTitle>
          <CardDescription>
            Status and health of all system component groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {componentGroups.map((group) => (
              <Card key={group.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigationClick({ id: group.id } as NavigationItem)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <group.icon className="h-5 w-5" />
                      <CardTitle className="text-sm">{group.name}</CardTitle>
                    </div>
                    <Badge variant={group.status === ComponentStatus.ACTIVE ? 'default' : 'secondary'} className="text-xs">
                      {group.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health:</span>
                      <span className={getHealthColor(group.health)}>{group.health}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Components:</span>
                      <span>{group.activeComponents}/{group.totalComponents}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Performance:</span>
                      <span>{group.performance.toFixed(1)}%</span>
                    </div>
                    <Progress value={group.performance} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows and Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Workflows</CardTitle>
            <CardDescription>
              Currently running automated workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeWorkflows.slice(0, 5).map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      workflow.status === WorkflowStatus.RUNNING ? 'bg-blue-500 animate-pulse' :
                      workflow.status === WorkflowStatus.COMPLETED ? 'bg-green-500' :
                      workflow.status === WorkflowStatus.FAILED ? 'bg-red-500' : 'bg-gray-500'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{workflow.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Step {workflow.currentStep + 1} of {workflow.totalSteps} • {workflow.progress}% complete
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={workflow.progress} className="w-16 h-2" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleWorkflowAction(workflow.id, 'pause')}>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleWorkflowAction(workflow.id, 'stop')}>
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedComponent(workflow.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
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
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              Latest system alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={cn("h-4 w-4 mt-0.5", getSeverityColor(alert.severity))} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={
                          alert.severity === AlertSeverity.CRITICAL ? 'destructive' :
                          alert.severity === AlertSeverity.ERROR ? 'default' :
                          alert.severity === AlertSeverity.WARNING ? 'secondary' : 'outline'
                        } className="text-xs">
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Flag className="h-4 w-4 mr-2" />
                          Escalate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <XCircle className="h-4 w-4 mr-2" />
                          Dismiss
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderActiveComponent = () => {
    switch (activeView) {
      case 'overview':
        return <SystemOverviewDashboard />;
      case 'security-orchestrator':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <SecurityOrchestrator />
          </Suspense>
        );
      case 'compliance-monitor':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <ComplianceMonitor />
          </Suspense>
        );
      case 'security-scan-engine':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <SecurityScanEngine />
          </Suspense>
        );
      case 'vulnerability-assessment':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <VulnerabilityAssessment />
          </Suspense>
        );
      case 'access-control':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <AccessControlManager />
          </Suspense>
        );
      case 'audit-trail':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <AuditTrailManager />
          </Suspense>
        );
      case 'threat-intelligence':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <ThreatIntelligence />
          </Suspense>
        );
      case 'security-reporting':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <SecurityReporting />
          </Suspense>
        );
      case 'analytics-dashboard':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <AdvancedAnalyticsDashboard />
          </Suspense>
        );
      case 'predictive-analytics':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <PredictiveAnalyticsEngine />
          </Suspense>
        );
      case 'ml-insights':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <MLInsightsGenerator />
          </Suspense>
        );
      case 'business-intelligence':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <BusinessIntelligence />
          </Suspense>
        );
      case 'data-visualization':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-96"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
            <DataVisualizationSuite />
          </Suspense>
        );
      default:
        return (
          <div className="text-center py-12">
            <Construction className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Component Under Development</h3>
            <p className="text-muted-foreground">
              This component is currently being developed and will be available soon.
            </p>
          </div>
        );
    }
  };

  // ==================== Main Render ====================

  if (!systemOverview) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Scan Logic Master SPA...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex h-screen bg-background", darkMode ? 'dark' : '')}>
        {/* Sidebar */}
        <div className={cn(
          "border-r bg-card transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-2">
                  <Crown className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">Scan Logic</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(prev => !prev)}
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <div key={item.id}>
                    <Button
                      variant={activeView === item.id ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        sidebarCollapsed ? "px-2" : "px-3"
                      )}
                      onClick={() => handleNavigationClick(item)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-2">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant={item.badge.variant}
                              className={cn(
                                "ml-auto text-xs",
                                item.badge.pulse ? "animate-pulse" : ""
                              )}
                            >
                              {item.badge.text}
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                    {!sidebarCollapsed && item.children && activeView.startsWith(item.id) && (
                      <div className="ml-4 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Button
                            key={child.id}
                            variant={activeView === child.id ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-sm"
                            onClick={() => handleNavigationClick(child)}
                          >
                            <child.icon className="h-3 w-3" />
                            <span className="ml-2">{child.label}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-4">
              {!sidebarCollapsed && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Real-time</span>
                    <Switch
                      checked={realTimeEnabled}
                      onCheckedChange={setRealTimeEnabled}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Auto-refresh</span>
                    <Switch
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                      size="sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold">
                  {navigationItems.find(item => item.id === activeView)?.label || 'Scan Logic Master'}
                </h1>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Activity className={cn("h-3 w-3", getHealthColor(systemOverview.systemHealth))} />
                  <span>{systemOverview.systemHealth}</span>
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Status Indicators */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      realTimeEnabled ? "bg-green-500" : "bg-gray-500"
                    )} />
                    <span>{realTimeEnabled ? 'Live' : 'Static'}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <span>Last updated: {formatTimeAgo(systemOverview.lastUpdated)}</span>
                </div>

                {/* Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommandPaletteOpen(true)}
                >
                  <CommandIcon className="h-4 w-4 mr-2" />
                  Command
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDarkMode(prev => !prev)}>
                      {darkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNotificationsEnabled(prev => !prev)}>
                      {notificationsEnabled ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                      {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help & Support
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-6">
            {renderActiveComponent()}
          </main>
        </div>

        {/* Command Palette */}
        <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Command Palette</DialogTitle>
              <DialogDescription>
                Quick access to system functions and navigation
              </DialogDescription>
            </DialogHeader>
            <Command>
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                  {navigationItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        handleNavigationClick(item);
                        setCommandPaletteOpen(false);
                      }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Actions">
                  <CommandItem onSelect={() => { handleRefreshData(); setCommandPaletteOpen(false); }}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Refresh Data</span>
                  </CommandItem>
                  <CommandItem onSelect={() => { setSidebarCollapsed(prev => !prev); setCommandPaletteOpen(false); }}>
                    <Layout className="mr-2 h-4 w-4" />
                    <span>Toggle Sidebar</span>
                  </CommandItem>
                  <CommandItem onSelect={() => { setDarkMode(prev => !prev); setCommandPaletteOpen(false); }}>
                    {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ScanLogicMasterSPA;