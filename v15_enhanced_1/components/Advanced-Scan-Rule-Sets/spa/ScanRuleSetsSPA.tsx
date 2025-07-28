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
      description: 'AI insights and pattern analysis'
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: Users,
      description: 'Team workspace and sharing'
    },
    {
      id: 'reporting',
      label: 'Reporting',
      icon: BarChart3,
      description: 'Analytics and reports'
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

// Enhanced Error Boundary Component
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
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
      return (
        <Card className="p-6">
          <CardContent>
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Component Error</h3>
              <p className="text-muted-foreground mb-4">
                This component encountered an error and couldn't be rendered.
              </p>
              <Button onClick={() => this.setState({ hasError: false })}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Loading Skeleton Component
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4 p-6">
    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
);

// Enhanced Breadcrumb Component
const Breadcrumb: React.FC<{ items: Array<{ label: string; path?: string }> }> = ({ items }) => (
  <nav className="flex items-center space-x-2 text-sm">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
        <span
          className={
            index === items.length - 1
              ? "text-gray-900 font-medium"
              : "text-gray-500 hover:text-gray-700 cursor-pointer"
          }
        >
          {item.label}
        </span>
      </React.Fragment>
    ))}
  </nav>
);

// Real-time System Health Widget
const SystemHealthWidget: React.FC<{ health: SystemHealth | null }> = ({ health }) => {
  if (!health) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Loading system health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${getStatusColor(health.status)}`}></div>
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Overall Score</span>
            <span className="font-medium">{health.score}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>CPU</span>
              <span>{health.resources.cpu.usage}%</span>
            </div>
            <Progress value={health.resources.cpu.usage} className="h-1" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Memory</span>
              <span>{health.resources.memory.usage}%</span>
            </div>
            <Progress value={health.resources.memory.usage} className="h-1" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Storage</span>
              <span>{health.resources.storage.usage}%</span>
            </div>
            <Progress value={health.resources.storage.usage} className="h-1" />
          </div>

          {health.alerts && health.alerts.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {health.alerts.length} Alert{health.alerts.length > 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Workflow Queue Management Widget
const WorkflowQueueWidget: React.FC<{ 
  workflows: WorkflowState[], 
  onWorkflowAction: (action: string, workflowId: string) => void 
}> = ({ workflows, onWorkflowAction }) => {
  const activeWorkflows = workflows.filter(w => w.status === 'running');
  const queuedWorkflows = workflows.filter(w => w.status === 'queued');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Workflow Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">{activeWorkflows.length}</div>
              <div className="text-xs text-green-700">Active</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded">
              <div className="text-lg font-bold text-yellow-600">{queuedWorkflows.length}</div>
              <div className="text-xs text-yellow-700">Queued</div>
            </div>
          </div>

          {activeWorkflows.slice(0, 3).map((workflow) => (
            <div key={workflow.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{workflow.name}</div>
                <div className="text-xs text-gray-500">{workflow.progress}% complete</div>
                <Progress value={workflow.progress} className="h-1 mt-1" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onWorkflowAction('pause', workflow.id)}>
                    <PauseCircle className="h-3 w-3 mr-2" />
                    Pause
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onWorkflowAction('stop', workflow.id)}>
                    <StopCircle className="h-3 w-3 mr-2" />
                    Stop
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onWorkflowAction('details', workflow.id)}>
                    <Eye className="h-3 w-3 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {workflows.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No active workflows
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Activity Feed Component
const ActivityFeedWidget: React.FC<{ activities: any[] }> = ({ activities }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-2">
      <ScrollArea className="h-48">
        <div className="space-y-3">
          {activities.slice(0, 10).map((activity, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              <div className={`h-2 w-2 rounded-full mt-2 ${
                activity.type === 'success' ? 'bg-green-500' :
                activity.type === 'error' ? 'bg-red-500' :
                activity.type === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}></div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-900">{activity.message}</div>
                <div className="text-gray-500 text-xs">{activity.timestamp}</div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No recent activity
            </div>
          )}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

// Quick Actions Panel Component
const QuickActionsPanel: React.FC<{
  actions: QuickAction[],
  isOpen: boolean,
  onClose: () => void
}> = ({ actions, isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {actions.filter(a => a.visible).map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => {
                    action.action();
                    onClose();
                  }}
                  disabled={action.disabled}
                >
                  <action.icon className="h-6 w-6" />
                  <span className="text-xs text-center">{action.label}</span>
                  {action.shortcut && (
                    <span className="text-xs text-gray-400">{action.shortcut}</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Notifications Panel Component
const NotificationsPanel: React.FC<{
  notifications: NotificationItem[],
  onNotificationAction: (id: string, action: string) => void
}> = ({ notifications, onNotificationAction }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => notifications.filter(n => !n.read).forEach(n => 
                  onNotificationAction(n.id, 'mark_read')
                )}
              >
                Mark all read
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {notification.type === 'error' && <XCircle className="h-3 w-3 text-red-500" />}
                        {notification.type === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                        {notification.type === 'success' && <CheckCircle className="h-3 w-3 text-green-500" />}
                        {notification.type === 'info' && <Info className="h-3 w-3 text-blue-500" />}
                        <span className="text-sm font-medium">{notification.title}</span>
                      </div>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {!notification.read && (
                          <DropdownMenuItem onClick={() => onNotificationAction(notification.id, 'mark_read')}>
                            Mark as read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onNotificationAction(notification.id, 'dismiss')}>
                          Dismiss
                        </DropdownMenuItem>
                        {notification.actions && notification.actions.map((action, index) => (
                          <DropdownMenuItem 
                            key={index}
                            onClick={() => onNotificationAction(notification.id, action.label)}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No notifications
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Enhanced Command Palette Component
const CommandPalette: React.FC<{
  open: boolean,
  onOpenChange: (open: boolean) => void,
  items: CommandItem[],
  searchValue: string,
  onSearchChange: (value: string) => void
}> = ({ open, onOpenChange, items, searchValue, onSearchChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <Command>
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Type a command or search..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
          />
        </div>
        <CommandList className="max-h-96">
          <CommandEmpty>No results found.</CommandEmpty>
          
          {Object.entries(
            items.reduce((groups, item) => {
              const group = item.group || 'other';
              if (!groups[group]) groups[group] = [];
              groups[group].push(item);
              return groups;
            }, {} as Record<string, CommandItem[]>)
          ).map(([group, groupItems]) => (
            <CommandGroup key={group} heading={group.charAt(0).toUpperCase() + group.slice(1)}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    item.action();
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <item.icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                  {item.shortcut && (
                    <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {item.shortcut}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>
);

// Performance Metrics Widget
const PerformanceMetricsWidget: React.FC<{ metrics: any }> = ({ metrics }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Gauge className="h-4 w-4" />
        Performance
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-2">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Render Time</span>
          <span className="font-medium">{metrics.renderTime || 0}ms</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Memory Usage</span>
          <span className="font-medium">{Math.round((metrics.memoryUsage || 0) / 1024 / 1024)}MB</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Network Latency</span>
          <span className="font-medium">{metrics.networkLatency || 0}ms</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Error Rate</span>
          <span className={`font-medium ${metrics.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.errorRate || 0}%
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Connection Status Indicator
const ConnectionStatusIndicator: React.FC<{ 
  status: 'connecting' | 'connected' | 'disconnected' | 'error',
  lastHeartbeat: Date | null 
}> = ({ status, lastHeartbeat }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { color: 'bg-green-500', text: 'Connected', icon: Wifi };
      case 'connecting':
        return { color: 'bg-yellow-500', text: 'Connecting', icon: Wifi };
      case 'disconnected':
        return { color: 'bg-gray-500', text: 'Disconnected', icon: WifiOff };
      case 'error':
        return { color: 'bg-red-500', text: 'Error', icon: WifiOff };
      default:
        return { color: 'bg-gray-500', text: 'Unknown', icon: WifiOff };
    }
  };

  const { color, text, icon: Icon } = getStatusInfo();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 text-xs">
          <div className={`h-2 w-2 rounded-full ${color} ${status === 'connecting' ? 'animate-pulse' : ''}`}></div>
          <Icon className="h-3 w-3" />
          <span>{text}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <div>Status: {text}</div>
          {lastHeartbeat && (
            <div>Last update: {lastHeartbeat.toLocaleTimeString()}</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

// Enhanced Overview Dashboard Layout
const OverviewDashboard: React.FC<{
  metrics: DashboardMetrics,
  systemHealth: SystemHealth | null,
  workflows: WorkflowState[],
  notifications: NotificationItem[],
  performanceMetrics: any,
  onWorkflowAction: (action: string, workflowId: string) => void,
  onNotificationAction: (id: string, action: string) => void
}> = ({
  metrics,
  systemHealth,
  workflows,
  notifications,
  performanceMetrics,
  onWorkflowAction,
  onNotificationAction
}) => (
  <div className="space-y-6">
    {/* Top Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Rules</p>
              <p className="text-2xl font-bold">{metrics.totalRules}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Executions</p>
              <p className="text-2xl font-bold">{metrics.activeExecutions}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Execution Time</p>
              <p className="text-2xl font-bold">{metrics.averageExecutionTime.toFixed(0)}ms</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Secondary Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resource Utilization</p>
              <p className="text-2xl font-bold">{metrics.resourceUtilization.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Cpu className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <Progress value={metrics.resourceUtilization} className="mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <p className="text-2xl font-bold">{metrics.complianceScore.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <Progress value={metrics.complianceScore} className="mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cost Efficiency</p>
              <p className="text-2xl font-bold">{metrics.costEfficiency.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <Progress value={metrics.costEfficiency} className="mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Security Score</p>
              <p className="text-2xl font-bold">{metrics.securityScore.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <Progress value={metrics.securityScore} className="mt-2" />
        </CardContent>
      </Card>
    </div>

    {/* Widgets Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SystemHealthWidget health={systemHealth} />
      <WorkflowQueueWidget workflows={workflows} onWorkflowAction={onWorkflowAction} />
      <PerformanceMetricsWidget metrics={performanceMetrics} />
    </div>

    {/* Activity Feed */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ActivityFeedWidget activities={[]} />
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            System Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 text-sm">
            Trend visualization would be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Advanced Workflow Designer Modal
const WorkflowDesignerModal: React.FC<{
  open: boolean,
  onOpenChange: (open: boolean) => void,
  workflow?: WorkflowState,
  onSave: (workflow: WorkflowState) => void
}> = ({ open, onOpenChange, workflow, onSave }) => {
  const [workflowData, setWorkflowData] = useState<Partial<WorkflowState>>(
    workflow || {
      name: '',
      category: 'designer',
      status: 'idle',
      progress: 0,
      priority: 'medium',
      resourceRequirements: { cpu: 50, memory: 512, storage: 1024, network: 100 },
      tags: [],
      dependencies: [],
      errors: [],
      warnings: [],
      metrics: {},
      notifications: true,
      createdBy: 'current_user',
      assignedTo: [],
      approvers: []
    }
  );

  const handleSave = () => {
    if (workflowData.name && workflowData.category) {
      const newWorkflow: WorkflowState = {
        id: workflow?.id || `workflow_${Date.now()}`,
        name: workflowData.name!,
        category: workflowData.category!,
        status: workflowData.status || 'idle',
        progress: workflowData.progress || 0,
        priority: workflowData.priority || 'medium',
        resourceRequirements: workflowData.resourceRequirements!,
        tags: workflowData.tags || [],
        dependencies: workflowData.dependencies || [],
        errors: workflowData.errors || [],
        warnings: workflowData.warnings || [],
        metrics: workflowData.metrics || {},
        notifications: workflowData.notifications ?? true,
        createdBy: workflowData.createdBy || 'current_user',
        assignedTo: workflowData.assignedTo || [],
        approvers: workflowData.approvers || []
      };
      
      onSave(newWorkflow);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workflow ? 'Edit Workflow' : 'Create New Workflow'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowData.name || ''}
                onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <Label htmlFor="workflow-category">Category</Label>
              <Select
                value={workflowData.category || 'designer'}
                onValueChange={(value) => setWorkflowData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKFLOW_CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow-priority">Priority</Label>
              <Select
                value={workflowData.priority || 'medium'}
                onValueChange={(value) => setWorkflowData(prev => ({ ...prev, priority: value as any }))}
              >
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
            <div className="flex items-center space-x-2">
              <Switch
                checked={workflowData.notifications ?? true}
                onCheckedChange={(checked) => setWorkflowData(prev => ({ ...prev, notifications: checked }))}
              />
              <Label>Enable Notifications</Label>
            </div>
          </div>

          <div>
            <Label>Resource Requirements</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="cpu-req" className="text-sm">CPU (%)</Label>
                <Input
                  id="cpu-req"
                  type="number"
                  min="1"
                  max="100"
                  value={workflowData.resourceRequirements?.cpu || 50}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    resourceRequirements: {
                      ...prev.resourceRequirements!,
                      cpu: Number(e.target.value)
                    }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="memory-req" className="text-sm">Memory (MB)</Label>
                <Input
                  id="memory-req"
                  type="number"
                  min="128"
                  max="8192"
                  value={workflowData.resourceRequirements?.memory || 512}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    resourceRequirements: {
                      ...prev.resourceRequirements!,
                      memory: Number(e.target.value)
                    }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="storage-req" className="text-sm">Storage (MB)</Label>
                <Input
                  id="storage-req"
                  type="number"
                  min="100"
                  max="10240"
                  value={workflowData.resourceRequirements?.storage || 1024}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    resourceRequirements: {
                      ...prev.resourceRequirements!,
                      storage: Number(e.target.value)
                    }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="network-req" className="text-sm">Network (Mbps)</Label>
                <Input
                  id="network-req"
                  type="number"
                  min="10"
                  max="1000"
                  value={workflowData.resourceRequirements?.network || 100}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    resourceRequirements: {
                      ...prev.resourceRequirements!,
                      network: Number(e.target.value)
                    }
                  }))}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="workflow-tags">Tags (comma-separated)</Label>
            <Input
              id="workflow-tags"
              value={workflowData.tags?.join(', ') || ''}
              onChange={(e) => setWorkflowData(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div>
            <Label htmlFor="workflow-assignees">Assigned To (comma-separated emails)</Label>
            <Input
              id="workflow-assignees"
              value={workflowData.assignedTo?.join(', ') || ''}
              onChange={(e) => setWorkflowData(prev => ({
                ...prev,
                assignedTo: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
              }))}
              placeholder="user1@company.com, user2@company.com"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!workflowData.name || !workflowData.category}>
              {workflow ? 'Update Workflow' : 'Create Workflow'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Advanced System Settings Modal
const SystemSettingsModal: React.FC<{
  open: boolean,
  onOpenChange: (open: boolean) => void,
  preferences: UserPreferences,
  onPreferencesChange: (preferences: UserPreferences) => void
}> = ({ open, onOpenChange, preferences, onPreferencesChange }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleSave = () => {
    onPreferencesChange(localPreferences);
    localStorage.setItem('user_preferences', JSON.stringify(localPreferences));
    onOpenChange(false);
    
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>System Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={localPreferences.theme}
                onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, theme: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={localPreferences.language}
                onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={localPreferences.timezone}
                onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London Time</SelectItem>
                  <SelectItem value="Europe/Paris">Paris Time</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={localPreferences.sidebarCollapsed}
                onCheckedChange={(checked) => setLocalPreferences(prev => ({ ...prev, sidebarCollapsed: checked }))}
              />
              <Label>Start with sidebar collapsed</Label>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={localPreferences.notifications.enabled}
                onCheckedChange={(checked) => setLocalPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, enabled: checked }
                }))}
              />
              <Label>Enable notifications</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={localPreferences.notifications.sound}
                onCheckedChange={(checked) => setLocalPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, sound: checked }
                }))}
              />
              <Label>Sound notifications</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={localPreferences.notifications.desktop}
                onCheckedChange={(checked) => setLocalPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, desktop: checked }
                }))}
              />
              <Label>Desktop notifications</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={localPreferences.notifications.email}
                onCheckedChange={(checked) => setLocalPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: checked }
                }))}
              />
              <Label>Email notifications</Label>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <div>
              <Label htmlFor="refresh-interval">Auto-refresh interval (seconds)</Label>
              <Input
                id="refresh-interval"
                type="number"
                min="10"
                max="300"
                value={localPreferences.dashboard.refreshInterval / 1000}
                onChange={(e) => setLocalPreferences(prev => ({
                  ...prev,
                  dashboard: { ...prev.dashboard, refreshInterval: Number(e.target.value) * 1000 }
                }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={localPreferences.dashboard.autoRefresh}
                onCheckedChange={(checked) => setLocalPreferences(prev => ({
                  ...prev,
                  dashboard: { ...prev.dashboard, autoRefresh: checked }
                }))}
              />
              <Label>Enable auto-refresh</Label>
            </div>

            <div>
              <Label>Dashboard Layout</Label>
              <Select
                value={localPreferences.dashboard.layout}
                onValueChange={(value) => setLocalPreferences(prev => ({
                  ...prev,
                  dashboard: { ...prev.dashboard, layout: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="date-format">Date Format</Label>
              <Select
                value={localPreferences.dateFormat}
                onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, dateFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                  <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                  <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                  <SelectItem value="dd MMM yyyy">dd MMM yyyy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="number-format">Number Format</Label>
              <Select
                value={localPreferences.numberFormat}
                onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, numberFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">US (1,234.56)</SelectItem>
                  <SelectItem value="en-GB">UK (1,234.56)</SelectItem>
                  <SelectItem value="de-DE">German (1.234,56)</SelectItem>
                  <SelectItem value="fr-FR">French (1 234,56)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Keyboard Shortcuts</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Open Command Palette</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-200 rounded">Ctrl+K</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Quick Actions</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-200 rounded">Ctrl+/</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Toggle Fullscreen</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-200 rounded">Ctrl+Shift+F</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Toggle Sidebar</span>
                  <kbd className="px-2 py-1 text-xs bg-gray-200 rounded">Ctrl+Shift+S</kbd>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Advanced Analytics Dashboard Component
const AnalyticsDashboard: React.FC<{
  metrics: DashboardMetrics,
  timeRange: string,
  onTimeRangeChange: (range: string) => void
}> = ({ metrics, timeRange, onTimeRangeChange }) => {
  const [selectedMetric, setSelectedMetric] = useState('performance');

  const metricCards = [
    {
      id: 'performance',
      title: 'Performance Index',
      value: metrics.performanceIndex,
      change: '+12.5%',
      trend: 'up',
      color: 'blue'
    },
    {
      id: 'reliability',
      title: 'Reliability Score',
      value: metrics.reliabilityScore,
      change: '+8.2%',
      trend: 'up',
      color: 'green'
    },
    {
      id: 'scalability',
      title: 'Scalability Index',
      value: metrics.scalabilityIndex,
      change: '-2.1%',
      trend: 'down',
      color: 'orange'
    },
    {
      id: 'cost',
      title: 'Cost Efficiency',
      value: metrics.costEfficiency,
      change: '+15.7%',
      trend: 'up',
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <Card 
            key={metric.id}
            className={`cursor-pointer transition-all ${
              selectedMetric === metric.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedMetric(metric.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                <div className={`p-1 rounded ${
                  metric.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{metric.value.toFixed(1)}%</span>
                <span className={`text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              <Progress value={metric.value} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be implemented here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-2" />
                <p>Resource monitoring charts would be here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Metric</th>
                  <th className="text-left p-2">Current</th>
                  <th className="text-left p-2">Previous</th>
                  <th className="text-left p-2">Change</th>
                  <th className="text-left p-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Total Rules</td>
                  <td className="p-2">{metrics.totalRules}</td>
                  <td className="p-2">842</td>
                  <td className="p-2 text-green-600">+{metrics.totalRules - 842}</td>
                  <td className="p-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Success Rate</td>
                  <td className="p-2">{metrics.successRate.toFixed(1)}%</td>
                  <td className="p-2">94.2%</td>
                  <td className="p-2 text-green-600">+{(metrics.successRate - 94.2).toFixed(1)}%</td>
                  <td className="p-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Error Rate</td>
                  <td className="p-2">{metrics.errorRate.toFixed(1)}%</td>
                  <td className="p-2">3.8%</td>
                  <td className="p-2 text-red-600">{(metrics.errorRate - 3.8).toFixed(1)}%</td>
                  <td className="p-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Avg Execution Time</td>
                  <td className="p-2">{metrics.averageExecutionTime.toFixed(0)}ms</td>
                  <td className="p-2">245ms</td>
                  <td className="p-2 text-green-600">-{(245 - metrics.averageExecutionTime).toFixed(0)}ms</td>
                  <td className="p-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Comprehensive User Profile Component
const UserProfilePanel: React.FC<{
  user: any,
  onSettingsOpen: () => void,
  onLogout: () => void
}> = ({ user, onSettingsOpen, onLogout }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-80" align="end">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="font-medium">{user?.name || 'Current User'}</div>
            <div className="text-sm text-gray-500">{user?.email || 'user@company.com'}</div>
            <div className="text-xs text-gray-400">{user?.role || 'Data Analyst'}</div>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <DropdownMenuItem className="flex items-center gap-3 p-3">
          <User className="h-4 w-4" />
          <div>
            <div className="font-medium">Profile</div>
            <div className="text-xs text-gray-500">Manage your account</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-3 p-3" onClick={onSettingsOpen}>
          <Settings className="h-4 w-4" />
          <div>
            <div className="font-medium">Settings</div>
            <div className="text-xs text-gray-500">Preferences and configuration</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-3 p-3">
          <HelpCircle className="h-4 w-4" />
          <div>
            <div className="font-medium">Help & Support</div>
            <div className="text-xs text-gray-500">Documentation and assistance</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center gap-3 p-3 text-red-600" onClick={onLogout}>
          <Power className="h-4 w-4" />
          <div>
            <div className="font-medium">Sign Out</div>
            <div className="text-xs">End your session</div>
          </div>
        </DropdownMenuItem>
      </div>
      
      <div className="p-3 border-t bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Scan Rule Sets Enterprise v2.1.0
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Export the main ScanRuleSetsSPA component with all enhancements
export default ScanRuleSetsSPA;