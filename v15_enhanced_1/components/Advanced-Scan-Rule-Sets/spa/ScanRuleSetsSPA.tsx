import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { 
  Zap,
  Settings,
  Activity,
  BarChart3,
  Brain,
  Users,
  FileText,
  GitBranch,
  Target,
  Layers,
  Code,
  Terminal,
  Scan,
  TestTube,
  BookOpen,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Save,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  RotateCcw,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Database,
  Server,
  Cpu,
  Memory,
  HardDrive,
  Network,
  TrendingUp,
  TrendingDown,
  PieChart,
  LineChart,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Phone,
  Video,
  Share,
  Link,
  ExternalLink,
  Folder,
  FolderOpen,
  File,
  Archive,
  Package,
  Box,
  Cube,
  Star,
  Heart,
  Bookmark,
  Flag,
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Globe,
  Wifi,
  WifiOff,
  Power,
  PowerOff,
  Home,
  Menu,
  MoreHorizontal,
  MoreVertical
} from 'lucide-react';

// Hooks
import { useScanRules } from '../hooks/useScanRules';
import { useOrchestration } from '../hooks/useOrchestration';
import { useOptimization } from '../hooks/useOptimization';
import { useIntelligence } from '../hooks/useIntelligence';
import { useCollaboration } from '../hooks/useCollaboration';
import { useReporting } from '../hooks/useReporting';
import { useValidation } from '../hooks/useValidation';
import { usePatternLibrary } from '../hooks/usePatternLibrary';

// Types
import {
  ScanRuleSet,
  WorkflowDefinition,
  ResourceAllocation,
  OptimizationResult,
  IntelligenceInsight,
  CollaborationSession,
  ReportTemplate,
  ValidationResult,
  PatternLibraryItem,
  SystemMetrics,
  UserPreferences,
  NotificationSettings,
  SecurityProfile,
  AuditLog,
  PerformanceMetrics,
  AlertConfiguration,
  DashboardLayout,
  ComponentConfiguration
} from '../types/scan-rules.types';

// Lazy load components for better performance
const IntelligentRuleDesigner = React.lazy(() => import('../components/rule-designer/IntelligentRuleDesigner'));
const PatternLibraryManager = React.lazy(() => import('../components/rule-designer/PatternLibraryManager'));
const RuleValidationEngine = React.lazy(() => import('../components/rule-designer/RuleValidationEngine'));
const AIPatternSuggestions = React.lazy(() => import('../components/ai-enhancement/AIPatternSuggestions'));
const RuleTemplateLibrary = React.lazy(() => import('../components/template-management/RuleTemplateLibrary'));
const AdvancedRuleEditor = React.lazy(() => import('../components/advanced-editor/AdvancedRuleEditor'));
const RuleTestingFramework = React.lazy(() => import('../components/testing-framework/RuleTestingFramework'));
const RuleVersionControl = React.lazy(() => import('../components/version-control/RuleVersionControl'));
const RuleOrchestrationCenter = React.lazy(() => import('../components/rule-orchestration/RuleOrchestrationCenter'));
const WorkflowDesigner = React.lazy(() => import('../components/rule-orchestration/WorkflowDesigner'));
const ResourceAllocationManager = React.lazy(() => import('../components/rule-orchestration/ResourceAllocationManager'));
// Import all new components from rule-intelligence, collaboration, and reporting
const IntelligentPatternDetector = React.lazy(() => import('../components/rule-intelligence/IntelligentPatternDetector'));
const SemanticRuleAnalyzer = React.lazy(() => import('../components/rule-intelligence/SemanticRuleAnalyzer'));
const RuleImpactAnalyzer = React.lazy(() => import('../components/rule-intelligence/RuleImpactAnalyzer'));
const ComplianceIntegrator = React.lazy(() => import('../components/rule-intelligence/ComplianceIntegrator'));
const AnomalyDetector = React.lazy(() => import('../components/rule-intelligence/AnomalyDetector'));
const PredictiveAnalyzer = React.lazy(() => import('../components/rule-intelligence/PredictiveAnalyzer'));
const ContextualAssistant = React.lazy(() => import('../components/rule-intelligence/ContextualAssistant'));
const BusinessRuleMapper = React.lazy(() => import('../components/rule-intelligence/BusinessRuleMapper'));
const TeamCollaborationHub = React.lazy(() => import('../components/collaboration/TeamCollaborationHub'));
const RuleReviewWorkflow = React.lazy(() => import('../components/collaboration/RuleReviewWorkflow'));
const CommentingSystem = React.lazy(() => import('../components/collaboration/CommentingSystem'));
const ApprovalWorkflow = React.lazy(() => import('../components/collaboration/ApprovalWorkflow'));
const KnowledgeSharing = React.lazy(() => import('../components/collaboration/KnowledgeSharing'));
const ExpertConsultation = React.lazy(() => import('../components/collaboration/ExpertConsultation'));
const ExecutiveDashboard = React.lazy(() => import('../components/reporting/ExecutiveDashboard'));
const PerformanceReports = React.lazy(() => import('../components/reporting/PerformanceReports'));
const ComplianceReporting = React.lazy(() => import('../components/reporting/ComplianceReporting'));
const UsageAnalytics = React.lazy(() => import('../components/reporting/UsageAnalytics'));
const TrendAnalysis = React.lazy(() => import('../components/reporting/TrendAnalysis'));
const ROICalculator = React.lazy(() => import('../components/reporting/ROICalculator'));

// Loading Skeleton Component
const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = "h-96" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg h-full"></div>
  </div>
);

// Error Boundary Component
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Component Error</span>
            </div>
            <p className="text-sm text-red-600 mt-2">
              Something went wrong loading this component. Please try again.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Navigation Breadcrumb Component
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav className="flex items-center space-x-2 text-sm text-gray-600">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <ChevronRight className="w-4 h-4" />}
        <div className="flex items-center gap-1">
          {item.icon && <item.icon className="w-4 h-4" />}
          <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : 'hover:text-gray-900'}>
            {item.label}
          </span>
        </div>
      </React.Fragment>
    ))}
  </nav>
);

// System Status Component
const SystemStatus: React.FC<{ metrics: SystemMetrics }> = ({ metrics }) => {
  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return XCircle;
    if (value >= thresholds.warning) return AlertTriangle;
    return CheckCircle;
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">CPU Usage</div>
            <div className={`text-lg font-semibold ${getStatusColor(metrics.cpu, { warning: 70, critical: 90 })}`}>
              {metrics.cpu}%
            </div>
          </div>
          {React.createElement(getStatusIcon(metrics.cpu, { warning: 70, critical: 90 }), {
            className: `w-5 h-5 ${getStatusColor(metrics.cpu, { warning: 70, critical: 90 })}`
          })}
        </div>
        <Progress value={metrics.cpu} className="mt-2" />
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Memory</div>
            <div className={`text-lg font-semibold ${getStatusColor(metrics.memory, { warning: 80, critical: 95 })}`}>
              {metrics.memory}%
            </div>
          </div>
          {React.createElement(getStatusIcon(metrics.memory, { warning: 80, critical: 95 }), {
            className: `w-5 h-5 ${getStatusColor(metrics.memory, { warning: 80, critical: 95 })}`
          })}
        </div>
        <Progress value={metrics.memory} className="mt-2" />
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Active Rules</div>
            <div className="text-lg font-semibold text-blue-600">{metrics.activeRules}</div>
          </div>
          <Zap className="w-5 h-5 text-blue-600" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Executions/min</div>
            <div className="text-lg font-semibold text-purple-600">{metrics.executionsPerMinute}</div>
          </div>
          <Activity className="w-5 h-5 text-purple-600" />
        </div>
      </Card>
    </div>
  );
};

// Quick Actions Component
const QuickActions: React.FC<{
  onCreateRule: () => void;
  onRunWorkflow: () => void;
  onViewReports: () => void;
  onOptimizeSystem: () => void;
}> = ({ onCreateRule, onRunWorkflow, onViewReports, onOptimizeSystem }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Quick Actions
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onCreateRule} className="h-16 flex flex-col gap-1">
          <Plus className="w-5 h-5" />
          <span className="text-sm">Create Rule</span>
        </Button>
        <Button onClick={onRunWorkflow} variant="outline" className="h-16 flex flex-col gap-1">
          <Play className="w-5 h-5" />
          <span className="text-sm">Run Workflow</span>
        </Button>
        <Button onClick={onViewReports} variant="outline" className="h-16 flex flex-col gap-1">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm">View Reports</span>
        </Button>
        <Button onClick={onOptimizeSystem} variant="outline" className="h-16 flex flex-col gap-1">
          <Target className="w-5 h-5" />
          <span className="text-sm">Optimize</span>
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Recent Activity Component
const RecentActivity: React.FC<{ activities: any[] }> = ({ activities }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-64">
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="p-1 bg-blue-100 rounded-full">
                <activity.icon className="w-3 h-3 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{activity.title}</div>
                <div className="text-xs text-gray-600">{activity.description}</div>
                <div className="text-xs text-gray-500 mt-1">{activity.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

// Notification Center Component
const NotificationCenter: React.FC<{ notifications: any[] }> = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Stay updated with system alerts and updates
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <Card key={index} className={notification.read ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded-full ${
                      notification.type === 'error' ? 'bg-red-100' :
                      notification.type === 'warning' ? 'bg-yellow-100' :
                      notification.type === 'success' ? 'bg-green-100' :
                      'bg-blue-100'
                    }`}>
                      {notification.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                      {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                      {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-xs text-gray-600">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{notification.timestamp}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// Main SPA Component
interface ScanRuleSetsSPAProps {
  initialView?: string;
  workspaceId?: string;
  userId?: string;
  permissions?: string[];
}

const ScanRuleSetsSPA: React.FC<ScanRuleSetsSPAProps> = ({
  initialView = 'dashboard',
  workspaceId,
  userId,
  permissions = []
}) => {
  // Hooks
  const {
    scanRules,
    activeScanRules,
    isLoading: scanRulesLoading,
    error: scanRulesError,
    createScanRule,
    updateScanRule,
    deleteScanRule,
    executeScanRule,
    getScanRuleMetrics
  } = useScanRules();

  const {
    workflows,
    resourcePools,
    isLoading: orchestrationLoading,
    error: orchestrationError,
    executeWorkflow,
    getOrchestrationMetrics
  } = useOrchestration();

  const {
    optimizationResults,
    recommendations,
    isOptimizing,
    optimizeSystem,
    getOptimizationHistory
  } = useOptimization();

  const {
    insights,
    patterns,
    anomalies,
    generateInsights,
    analyzePatterns,
    detectAnomalies
  } = useIntelligence();

  const {
    collaborationSessions,
    teamMembers,
    shareWorkspace,
    inviteTeamMember,
    getCollaborationHistory
  } = useCollaboration();

  const {
    reports,
    dashboards,
    generateReport,
    createDashboard,
    getReportingMetrics
  } = useReporting();

  const {
    validationResults,
    validateSystem,
    validateConfiguration,
    getValidationHistory
  } = useValidation();

  const {
    patternLibrary,
    categories,
    searchPatterns,
    createPattern,
    updatePattern
  } = usePatternLibrary();

  // State Management
  const [currentView, setCurrentView] = useState(initialView);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications: true,
    autoSave: true,
    compactMode: false
  });
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>({
    layout: 'grid',
    columns: 3,
    rowHeight: 200
  });
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: '1',
      type: 'info',
      title: 'System Update',
      message: 'Scan rules engine updated to v2.1.0',
      timestamp: '2 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Optimization Complete',
      message: 'System performance improved by 15%',
      timestamp: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage is at 85% capacity',
      timestamp: '3 hours ago',
      read: true
    }
  ]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 68,
    activeRules: 127,
    executionsPerMinute: 342
  });
  const [recentActivities, setRecentActivities] = useState([
    {
      icon: Plus,
      title: 'New scan rule created',
      description: 'PII Detection Rule v1.2',
      timestamp: '5 minutes ago'
    },
    {
      icon: Play,
      title: 'Workflow executed',
      description: 'Data Classification Workflow',
      timestamp: '12 minutes ago'
    },
    {
      icon: CheckCircle,
      title: 'Validation completed',
      description: 'All rules passed validation',
      timestamp: '1 hour ago'
    }
  ]);

  // Navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and system status'
    },
    {
      id: 'rule-designer',
      label: 'Rule Designer',
      icon: Code,
      description: 'Create and edit scan rules',
      subItems: [
        { id: 'intelligent-designer', label: 'Intelligent Designer', icon: Brain },
        { id: 'pattern-library', label: 'Pattern Library', icon: BookOpen },
        { id: 'rule-validation', label: 'Validation Engine', icon: CheckCircle },
        { id: 'ai-suggestions', label: 'AI Suggestions', icon: Zap }
      ]
    },
    {
      id: 'orchestration',
      label: 'Orchestration',
      icon: GitBranch,
      description: 'Workflow and resource management',
      subItems: [
        { id: 'orchestration-center', label: 'Orchestration Center', icon: Settings },
        { id: 'workflow-designer', label: 'Workflow Designer', icon: GitBranch },
        { id: 'resource-allocation', label: 'Resource Allocation', icon: Server }
      ]
    },
    {
      id: 'optimization',
      label: 'Optimization',
      icon: Target,
      description: 'Performance and cost optimization'
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      icon: Brain,
      description: 'AI insights and pattern analysis',
      subItems: [
        { id: 'pattern-detector', label: 'Pattern Detector', icon: Brain },
        { id: 'semantic-analyzer', label: 'Semantic Analyzer', icon: Brain },
        { id: 'rule-impact', label: 'Rule Impact', icon: Brain },
        { id: 'compliance-integrator', label: 'Compliance Integrator', icon: Brain },
        { id: 'anomaly-detector', label: 'Anomaly Detector', icon: Brain },
        { id: 'predictive-analyzer', label: 'Predictive Analyzer', icon: Brain },
        { id: 'contextual-assistant', label: 'Contextual Assistant', icon: Brain },
        { id: 'business-rule-mapper', label: 'Business Rule Mapper', icon: Brain }
      ]
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: Users,
      description: 'Team workspace and sharing',
      subItems: [
        { id: 'team-hub', label: 'Team Hub', icon: Users },
        { id: 'rule-review', label: 'Rule Review', icon: Users },
        { id: 'commenting', label: 'Commenting', icon: Users },
        { id: 'approval', label: 'Approval', icon: Users },
        { id: 'knowledge-sharing', label: 'Knowledge Sharing', icon: Users },
        { id: 'expert-consultation', label: 'Expert Consultation', icon: Users }
      ]
    },
    {
      id: 'reporting',
      label: 'Reporting',
      icon: BarChart3,
      description: 'Analytics and reports',
      subItems: [
        { id: 'executive-dashboard', label: 'Executive Dashboard', icon: BarChart3 },
        { id: 'performance-reports', label: 'Performance Reports', icon: BarChart3 },
        { id: 'compliance-reporting', label: 'Compliance Reporting', icon: BarChart3 },
        { id: 'usage-analytics', label: 'Usage Analytics', icon: BarChart3 },
        { id: 'trend-analysis', label: 'Trend Analysis', icon: BarChart3 },
        { id: 'roi-calculator', label: 'ROI Calculator', icon: BarChart3 }
      ]
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FileText,
      description: 'Rule templates and library'
    },
    {
      id: 'testing',
      label: 'Testing',
      icon: TestTube,
      description: 'Testing framework and validation'
    },
    {
      id: 'editor',
      label: 'Advanced Editor',
      icon: Terminal,
      description: 'Code editor with IntelliSense'
    },
    {
      id: 'version-control',
      label: 'Version Control',
      icon: GitBranch,
      description: 'Git-like version management'
    }
  ];

  // Update system metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        executionsPerMinute: Math.floor(Math.random() * 100) + 300
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            setShowCommandPalette(true);
            break;
          case 'b':
            event.preventDefault();
            setSidebarCollapsed(!sidebarCollapsed);
            break;
          case 'f':
            event.preventDefault();
            setFullscreen(!fullscreen);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, fullscreen]);

  // Breadcrumb generation
  const generateBreadcrumb = useCallback((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Scan Rule Sets', icon: Zap }
    ];

    const currentItem = navigationItems.find(item => item.id === currentView);
    if (currentItem) {
      items.push({ label: currentItem.label, icon: currentItem.icon });
    }

    if (selectedComponent) {
      const parentItem = navigationItems.find(item => 
        item.subItems?.some(sub => sub.id === selectedComponent)
      );
      if (parentItem) {
        const subItem = parentItem.subItems?.find(sub => sub.id === selectedComponent);
        if (subItem) {
          items.push({ label: subItem.label, icon: subItem.icon });
        }
      }
    }

    return items;
  }, [currentView, selectedComponent, navigationItems]);

  // Quick action handlers
  const handleCreateRule = useCallback(() => {
    setCurrentView('rule-designer');
    setSelectedComponent('intelligent-designer');
  }, []);

  const handleRunWorkflow = useCallback(() => {
    setCurrentView('orchestration');
    setSelectedComponent('workflow-designer');
  }, []);

  const handleViewReports = useCallback(() => {
    setCurrentView('reporting');
  }, []);

  const handleOptimizeSystem = useCallback(async () => {
    try {
      await optimizeSystem();
      setCurrentView('optimization');
    } catch (error) {
      console.error('Failed to optimize system:', error);
    }
  }, [optimizeSystem]);

  // Render main content based on current view
  const renderMainContent = () => {
    const view = selectedComponent || currentView;

    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Scan Rule Sets Dashboard</h1>
                <p className="text-gray-600">Comprehensive rule management and orchestration platform</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setFullscreen(!fullscreen)}>
                  {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
                <NotificationCenter notifications={notifications} />
              </div>
            </div>

            <SystemStatus metrics={systemMetrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <QuickActions
                  onCreateRule={handleCreateRule}
                  onRunWorkflow={handleRunWorkflow}
                  onViewReports={handleViewReports}
                  onOptimizeSystem={handleOptimizeSystem}
                />
                
                {/* Active Rules Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Active Scan Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{activeScanRules.length}</div>
                        <div className="text-sm text-blue-700">Active Rules</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{scanRules.filter(r => r.status === 'validated').length}</div>
                        <div className="text-sm text-green-700">Validated</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{systemMetrics.executionsPerMinute}</div>
                        <div className="text-sm text-purple-700">Executions/min</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <RecentActivity activities={recentActivities} />
              </div>
            </div>
          </div>
        );

      case 'intelligent-designer':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <IntelligentRuleDesigner />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'pattern-library':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <PatternLibraryManager />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'rule-validation':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <RuleValidationEngine />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'ai-suggestions':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <AIPatternSuggestions />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'orchestration-center':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <RuleOrchestrationCenter />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'workflow-designer':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <WorkflowDesigner />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'resource-allocation':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <ResourceAllocationManager />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'templates':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <RuleTemplateLibrary />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'editor':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <AdvancedRuleEditor />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'testing':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <RuleTestingFramework />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'version-control':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <RuleVersionControl />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'pattern-detector':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <IntelligentPatternDetector />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'semantic-analyzer':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <SemanticRuleAnalyzer />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'rule-impact':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <RuleImpactAnalyzer />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'compliance-integrator':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <ComplianceIntegrator />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'anomaly-detector':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <AnomalyDetector />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'predictive-analyzer':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <PredictiveAnalyzer />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'contextual-assistant':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <ContextualAssistant />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'business-rule-mapper':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <BusinessRuleMapper />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'team-hub':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <TeamCollaborationHub />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'rule-review':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <RuleReviewWorkflow />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'commenting':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <CommentingSystem />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'approval':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <ApprovalWorkflow />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'knowledge-sharing':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <KnowledgeSharing />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'expert-consultation':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <ExpertConsultation />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'executive-dashboard':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <ExecutiveDashboard />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'performance-reports':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <PerformanceReports />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'compliance-reporting':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <ComplianceReporting />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'usage-analytics':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <UsageAnalytics />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'trend-analysis':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <TrendAnalysis />
            </Suspense>
          </ComponentErrorBoundary>
        );

      case 'roi-calculator':
        return (
          <ComponentErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <ROICalculator />
            </Suspense>
          </ComponentErrorBoundary>
        );

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
              <p className="text-gray-600">This feature is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`h-screen flex bg-gray-50 ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="font-semibold">Scan Rule Sets</div>
                <div className="text-xs text-gray-500">Enterprise Platform</div>
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <nav className="p-2">
            {navigationItems.map((item) => (
              <div key={item.id} className="mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentView === item.id ? "secondary" : "ghost"}
                        className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
                        onClick={() => {
                          setCurrentView(item.id);
                          setSelectedComponent(null);
                        }}
                      >
                        <item.icon className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-2'}`} />
                        {!sidebarCollapsed && item.label}
                      </Button>
                    </TooltipTrigger>
                    {sidebarCollapsed && (
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {!sidebarCollapsed && item.subItems && currentView === item.id && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Button
                        key={subItem.id}
                        variant={selectedComponent === subItem.id ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedComponent(subItem.id)}
                      >
                        <subItem.icon className="h-3 w-3 mr-2" />
                        {subItem.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumb items={generateBreadcrumb()} />
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search or press Ctrl+K..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowCommandPalette(true)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderMainContent()}
        </main>
      </div>

      {/* Command Palette */}
      <CommandDialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  setCurrentView(item.id);
                  setSelectedComponent(null);
                  setShowCommandPalette(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { handleCreateRule(); setShowCommandPalette(false); }}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Rule</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => { handleRunWorkflow(); setShowCommandPalette(false); }}>
              <Play className="mr-2 h-4 w-4" />
              <span>Run Workflow</span>
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => { handleOptimizeSystem(); setShowCommandPalette(false); }}>
              <Target className="mr-2 h-4 w-4" />
              <span>Optimize System</span>
              <CommandShortcut>⌘O</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default ScanRuleSetsSPA;