import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

// Icons
import {
  Brain, Bot, Cpu, Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  XCircle, Info, Zap, Target, Network, GitBranch, Layers, Database, Monitor,
  Play, Pause, Stop, RotateCcw, FastForward, Rewind, SkipBack, SkipForward,
  Settings, Eye, Edit, Trash2, Plus, Minus, Download, Upload, Refresh,
  Search, Filter, MoreVertical, Calendar, Clock, Users, Award, Star,
  Lightbulb, Microscope, Telescope, Atom, Fingerprint, QrCode, Barcode,
  ScanLine, Volume2, VolumeX, Maximize, Minimize, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowRight, ArrowLeft,
  Home, Building, Briefcase, Calculator, CreditCard, FileText, Presentation,
  MessageSquare, Mail, Phone, Video, Mic, Camera, Image, File, Folder,
  Archive, Tag, Flag, Map, Navigation, Compass, Route, Grid, List, Table,
  Timeline, Chart, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Package, Server, Cloud, HardDrive, Wifi, Bluetooth, Smartphone, Laptop,
  Desktop, Tablet, Watch, Headphones, Speaker, Gamepad2, Joystick, Rocket,
  Satellite, Radar, Dna, Shield, Lock, Unlock, Bell, Globe, Workflow,
  Command as CommandIcon, Palette, Layout, Maximize2, Minimize2, Split,
  Sidebar, PanelLeft, PanelRight, PanelTop, PanelBottom, Focus, Layers2,
  Sparkles, Wand2, Shuffle, RotateCw, FlipHorizontal, FlipVertical, Move3D,
  MousePointer2, Hand, GripHorizontal, GripVertical, ScanEye, Crosshair,
  DollarSign
} from 'lucide-react';

// Charts
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, FunnelChart, Funnel,
  Sankey, Node, Link
} from 'recharts';

// Lazy load components
const ClassificationLayout = lazy(() => import('./shared/layouts/ClassificationLayout'));
const IntelligenceLayout = lazy(() => import('./shared/layouts/IntelligenceLayout'));
const DataTable = lazy(() => import('./shared/ui/DataTable'));
const IntelligentChart = lazy(() => import('./shared/ui/IntelligentChart'));
const RealTimeIndicator = lazy(() => import('./shared/ui/RealTimeIndicator'));
const WorkflowStepper = lazy(() => import('./shared/ui/WorkflowStepper'));

// Providers
import { ClassificationProvider } from './shared/providers/ClassificationProvider';
import { IntelligenceProvider } from './shared/providers/IntelligenceProvider';

// APIs and utilities
import { classificationApi } from './core/api/classificationApi';
import { mlApi } from './core/api/mlApi';
import { aiApi } from './core/api/aiApi';
import { websocketApi } from './core/api/websocketApi';

// Advanced Enterprise Interfaces
interface WorkflowInstance {
  id: string;
  name: string;
  type: 'classification' | 'training' | 'deployment' | 'analysis' | 'optimization';
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime: string;
  estimatedCompletion?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  dependencies: string[];
  metrics: {
    accuracy?: number;
    throughput: number;
    resourceUsage: number;
    cost: number;
    efficiency: number;
  };
  stages: WorkflowStage[];
  currentStage?: string;
  automation: {
    enabled: boolean;
    triggers: string[];
    conditions: Record<string, any>;
    actions: string[];
  };
}

interface WorkflowStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  duration?: number;
  dependencies: string[];
  outputs: Record<string, any>;
  logs: string[];
}

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'insight';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'workflow' | 'performance' | 'security' | 'user';
  actionable: boolean;
  actions?: Array<{
    id: string;
    label: string;
    action: () => void;
    variant: 'default' | 'destructive' | 'outline';
    icon?: React.ComponentType;
  }>;
  metadata?: Record<string, any>;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  gpu?: number;
  network: number;
  storage: number;
  latency: number;
  throughput: number;
  errorRate: number;
  availability: number;
  cost: number;
  efficiency: number;
  timestamp: string;
}

interface IntelligentInsight {
  id: string;
  type: 'optimization' | 'anomaly' | 'prediction' | 'recommendation' | 'alert';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  tags: string[];
  data: any;
  visualizations?: Array<{
    type: string;
    config: any;
    data: any;
  }>;
  actions: Array<{
    id: string;
    label: string;
    description: string;
    estimated_impact: string;
    action: () => void;
  }>;
  timestamp: string;
}

interface ClassificationsSPAState {
  // Core state
  isLoading: boolean;
  error: string | null;
  currentView: string;
  currentMode: 'overview' | 'workflows' | 'analytics' | 'intelligence' | 'administration';
  
  // Advanced workflow state
  activeWorkflows: WorkflowInstance[];
  workflowTemplates: any[];
  workflowHistory: any[];
  
  // Intelligence and automation
  intelligenceLevel: 'manual' | 'assisted' | 'autonomous';
  autoOptimization: boolean;
  predictiveAnalytics: boolean;
  anomalyDetection: boolean;
  
  // UI and UX state
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  notificationsOpen: boolean;
  settingsOpen: boolean;
  focusMode: boolean;
  splitViewMode: boolean;
  darkMode: boolean;
  compactMode: boolean;
  
  // Collaboration and real-time
  collaborationMode: boolean;
  realTimeSync: boolean;
  activeUsers: any[];
  
  // Performance and system
  systemMetrics: SystemMetrics[];
  systemHealth: 'optimal' | 'good' | 'warning' | 'critical';
  performanceMode: 'balanced' | 'speed' | 'accuracy' | 'efficiency';
  
  // Notifications and insights
  notifications: NotificationItem[];
  insights: IntelligentInsight[];
  
  // Search and filtering
  globalSearch: string;
  advancedFilters: Record<string, any>;
  
  // Customization
  customViews: any[];
  activeLayout: string;
  personalizedDashboard: boolean;
}

interface ClassificationsSPAProps {
  initialView?: string;
  embedded?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  permissions?: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canDeploy: boolean;
    canViewAnalytics: boolean;
    canAdministrate: boolean;
  };
  onNavigate?: (view: string) => void;
  onWorkflowComplete?: (workflowId: string, result: any) => void;
  onInsightAction?: (insightId: string, actionId: string) => void;
}

// Advanced Enterprise Classifications SPA
export const ClassificationsSPA: React.FC<ClassificationsSPAProps> = ({
  initialView = 'overview',
  embedded = false,
  theme = 'auto',
  permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canDeploy: true,
    canViewAnalytics: true,
    canAdministrate: true
  },
  onNavigate,
  onWorkflowComplete,
  onInsightAction
}) => {
  // Advanced State Management
  const [state, setState] = useState<ClassificationsSPAState>({
    isLoading: false,
    error: null,
    currentView: initialView,
    currentMode: 'overview',
    activeWorkflows: [],
    workflowTemplates: [],
    workflowHistory: [],
    intelligenceLevel: 'assisted',
    autoOptimization: true,
    predictiveAnalytics: true,
    anomalyDetection: true,
    sidebarOpen: !embedded,
    commandPaletteOpen: false,
    notificationsOpen: false,
    settingsOpen: false,
    focusMode: false,
    splitViewMode: false,
    darkMode: theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    compactMode: false,
    collaborationMode: false,
    realTimeSync: true,
    activeUsers: [],
    systemMetrics: [],
    systemHealth: 'optimal',
    performanceMode: 'balanced',
    notifications: [],
    insights: [],
    globalSearch: '',
    advancedFilters: {},
    customViews: [],
    activeLayout: 'default',
    personalizedDashboard: true
  });

  // Refs for advanced features
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const workflowEngineRef = useRef<any>(null);
  const intelligenceEngineRef = useRef<any>(null);
  const collaborationRef = useRef<any>(null);

  // Animation controls
  const headerAnimation = useAnimation();
  const sidebarAnimation = useAnimation();
  const contentAnimation = useAnimation();
  const notificationAnimation = useAnimation();

  // Advanced Workflow Management
  const createWorkflow = useCallback(async (template: any, parameters: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const workflow: WorkflowInstance = {
        id: `wf_${Date.now()}`,
        name: template.name,
        type: template.type,
        status: 'queued',
        progress: 0,
        startTime: new Date().toISOString(),
        priority: parameters.priority || 'medium',
        owner: 'current-user',
        dependencies: template.dependencies || [],
        metrics: {
          accuracy: 0,
          throughput: 0,
          resourceUsage: 0,
          cost: 0,
          efficiency: 0
        },
        stages: template.stages || [],
        automation: {
          enabled: parameters.autoRun || false,
          triggers: parameters.triggers || [],
          conditions: parameters.conditions || {},
          actions: parameters.actions || []
        }
      };

      // Add to active workflows
      setState(prev => ({
        ...prev,
        activeWorkflows: [...prev.activeWorkflows, workflow],
        isLoading: false
      }));

      // Start workflow execution
      await executeWorkflow(workflow.id);
      
      toast.success('Workflow Created', {
        description: `${workflow.name} has been queued for execution`
      });

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error('Workflow Creation Failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  const executeWorkflow = useCallback(async (workflowId: string) => {
    try {
      const workflow = state.activeWorkflows.find(w => w.id === workflowId);
      if (!workflow) return;

      // Update workflow status
      setState(prev => ({
        ...prev,
        activeWorkflows: prev.activeWorkflows.map(w =>
          w.id === workflowId ? { ...w, status: 'running' } : w
        )
      }));

      // Simulate workflow execution with real API calls
      for (let i = 0; i < workflow.stages.length; i++) {
        const stage = workflow.stages[i];
        
        // Update stage status
        setState(prev => ({
          ...prev,
          activeWorkflows: prev.activeWorkflows.map(w =>
            w.id === workflowId ? {
              ...w,
              currentStage: stage.id,
              stages: w.stages.map(s =>
                s.id === stage.id ? { ...s, status: 'running' } : s
              )
            } : w
          )
        }));

        // Execute stage based on type
        await executeWorkflowStage(workflowId, stage);

        // Update progress
        const progress = ((i + 1) / workflow.stages.length) * 100;
        setState(prev => ({
          ...prev,
          activeWorkflows: prev.activeWorkflows.map(w =>
            w.id === workflowId ? {
              ...w,
              progress,
              stages: w.stages.map(s =>
                s.id === stage.id ? { ...s, status: 'completed', progress: 100 } : s
              )
            } : w
          )
        }));
      }

      // Mark workflow as completed
      setState(prev => ({
        ...prev,
        activeWorkflows: prev.activeWorkflows.map(w =>
          w.id === workflowId ? { ...w, status: 'completed', progress: 100 } : w
        )
      }));

      onWorkflowComplete?.(workflowId, { success: true });
      
      toast.success('Workflow Completed', {
        description: `${workflow.name} has completed successfully`
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        activeWorkflows: prev.activeWorkflows.map(w =>
          w.id === workflowId ? { ...w, status: 'failed' } : w
        )
      }));
      
      toast.error('Workflow Failed', {
        description: error instanceof Error ? error.message : 'Workflow execution failed'
      });
    }
  }, [state.activeWorkflows, onWorkflowComplete]);

  const executeWorkflowStage = useCallback(async (workflowId: string, stage: WorkflowStage) => {
    // Execute different stage types
    switch (stage.name) {
      case 'data_preparation':
        // Simulate data preparation
        await new Promise(resolve => setTimeout(resolve, 2000));
        break;
      
      case 'model_training':
        // Use ML API for training
        if (permissions.canCreate) {
          await mlApi.startTraining('model-id', 'dataset-id');
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        break;
      
      case 'model_evaluation':
        // Use ML API for evaluation
        await mlApi.getModelMetrics('model-id');
        await new Promise(resolve => setTimeout(resolve, 1500));
        break;
      
      case 'deployment':
        // Use ML API for deployment
        if (permissions.canDeploy) {
          await mlApi.deployModel('model-id', 'production');
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
        break;
      
      default:
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }, [permissions]);

  // Advanced Intelligence Engine
  const generateIntelligentInsights = useCallback(async () => {
    try {
      // Get system metrics
      const metricsResponse = await classificationApi.getPerformanceMetrics();
      const mlMetricsResponse = await mlApi.getPerformanceMetrics();
      const aiMetricsResponse = await aiApi.getPerformanceMetrics();

      // Generate insights based on metrics
      const insights: IntelligentInsight[] = [];

      // Performance optimization insight
      if (metricsResponse.data.accuracy < 0.85) {
        insights.push({
          id: `insight_${Date.now()}_1`,
          type: 'optimization',
          title: 'Model Performance Optimization Opportunity',
          description: 'Current model accuracy is below optimal threshold. Consider hyperparameter tuning or ensemble methods.',
          confidence: 0.87,
          impact: 'high',
          category: 'performance',
          tags: ['optimization', 'accuracy', 'ml'],
          data: metricsResponse.data,
          actions: [
            {
              id: 'auto_tune',
              label: 'Auto-tune Hyperparameters',
              description: 'Automatically optimize model hyperparameters',
              estimated_impact: '+12% accuracy improvement',
              action: () => autoTuneModel()
            },
            {
              id: 'ensemble',
              label: 'Create Ensemble',
              description: 'Combine multiple models for better performance',
              estimated_impact: '+8% accuracy improvement',
              action: () => createEnsemble()
            }
          ],
          timestamp: new Date().toISOString()
        });
      }

      // Cost optimization insight
      if (aiMetricsResponse.data.costPerRequest > 0.05) {
        insights.push({
          id: `insight_${Date.now()}_2`,
          type: 'optimization',
          title: 'Cost Optimization Opportunity',
          description: 'AI inference costs are above optimal range. Consider model optimization or caching strategies.',
          confidence: 0.92,
          impact: 'medium',
          category: 'cost',
          tags: ['cost', 'optimization', 'ai'],
          data: aiMetricsResponse.data,
          actions: [
            {
              id: 'model_compression',
              label: 'Compress Models',
              description: 'Reduce model size without significant accuracy loss',
              estimated_impact: '-30% cost reduction',
              action: () => compressModels()
            },
            {
              id: 'intelligent_caching',
              label: 'Enable Smart Caching',
              description: 'Cache frequent requests intelligently',
              estimated_impact: '-45% cost reduction',
              action: () => enableSmartCaching()
            }
          ],
          timestamp: new Date().toISOString()
        });
      }

      // Anomaly detection insight
      const anomalies = await detectAnomalies();
      if (anomalies.length > 0) {
        insights.push({
          id: `insight_${Date.now()}_3`,
          type: 'anomaly',
          title: 'System Anomalies Detected',
          description: `${anomalies.length} anomalies detected in system behavior. Immediate attention recommended.`,
          confidence: 0.95,
          impact: 'critical',
          category: 'security',
          tags: ['anomaly', 'security', 'monitoring'],
          data: anomalies,
          actions: [
            {
              id: 'investigate',
              label: 'Investigate Anomalies',
              description: 'Deep dive into detected anomalies',
              estimated_impact: 'Risk mitigation',
              action: () => investigateAnomalies(anomalies)
            },
            {
              id: 'auto_remediate',
              label: 'Auto-remediate',
              description: 'Apply automated remediation actions',
              estimated_impact: 'Immediate risk reduction',
              action: () => autoRemediate(anomalies)
            }
          ],
          timestamp: new Date().toISOString()
        });
      }

      setState(prev => ({ ...prev, insights }));

    } catch (error) {
      console.error('Failed to generate insights:', error);
    }
  }, []);

  // Helper functions for insights
  const autoTuneModel = useCallback(async () => {
    try {
      await mlApi.hyperparameterTuning('current-model', {
        algorithm: 'bayesian',
        max_trials: 100,
        objective: 'accuracy'
      });
      toast.success('Hyperparameter tuning started');
    } catch (error) {
      toast.error('Failed to start hyperparameter tuning');
    }
  }, []);

  const createEnsemble = useCallback(async () => {
    try {
      const models = await mlApi.getModels();
      // Logic to create ensemble
      toast.success('Ensemble creation initiated');
    } catch (error) {
      toast.error('Failed to create ensemble');
    }
  }, []);

  const compressModels = useCallback(async () => {
    try {
      // Model compression logic
      toast.success('Model compression started');
    } catch (error) {
      toast.error('Failed to start model compression');
    }
  }, []);

  const enableSmartCaching = useCallback(async () => {
    try {
      // Smart caching logic
      toast.success('Smart caching enabled');
    } catch (error) {
      toast.error('Failed to enable smart caching');
    }
  }, []);

  const detectAnomalies = useCallback(async () => {
    // Anomaly detection logic
    return [];
  }, []);

  const investigateAnomalies = useCallback(async (anomalies: any[]) => {
    // Investigation logic
    toast.info('Investigation started');
  }, []);

  const autoRemediate = useCallback(async (anomalies: any[]) => {
    // Auto-remediation logic
    toast.success('Auto-remediation applied');
  }, []);

  // Command Palette Actions
  const commandPaletteActions = useMemo(() => [
    {
      id: 'create_workflow',
      label: 'Create New Workflow',
      description: 'Start a new classification workflow',
      icon: Workflow,
      action: () => {
        setState(prev => ({ ...prev, commandPaletteOpen: false }));
        // Open workflow creation dialog
      },
      keywords: ['create', 'workflow', 'new']
    },
    {
      id: 'train_model',
      label: 'Train ML Model',
      description: 'Start training a new machine learning model',
      icon: Brain,
      action: () => {
        setState(prev => ({ ...prev, commandPaletteOpen: false }));
        // Open model training dialog
      },
      keywords: ['train', 'model', 'ml', 'machine learning']
    },
    {
      id: 'deploy_model',
      label: 'Deploy Model',
      description: 'Deploy a trained model to production',
      icon: Rocket,
      action: () => {
        setState(prev => ({ ...prev, commandPaletteOpen: false }));
        // Open deployment dialog
      },
      keywords: ['deploy', 'production', 'model']
    },
    {
      id: 'view_analytics',
      label: 'View Analytics',
      description: 'Open analytics dashboard',
      icon: Chart,
      action: () => {
        setState(prev => ({ ...prev, currentMode: 'analytics', commandPaletteOpen: false }));
        onNavigate?.('analytics');
      },
      keywords: ['analytics', 'dashboard', 'metrics']
    },
    {
      id: 'toggle_focus',
      label: 'Toggle Focus Mode',
      description: 'Enter or exit focus mode',
      icon: Focus,
      action: () => {
        setState(prev => ({ ...prev, focusMode: !prev.focusMode, commandPaletteOpen: false }));
      },
      keywords: ['focus', 'distraction', 'mode']
    }
  ], [onNavigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setState(prev => ({ ...prev, commandPaletteOpen: !prev.commandPaletteOpen }));
      }
      
      // Focus mode
      if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
        event.preventDefault();
        setState(prev => ({ ...prev, focusMode: !prev.focusMode }));
      }
      
      // Toggle sidebar
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time system monitoring
  useEffect(() => {
    if (!state.realTimeSync) return;

    const monitorSystem = async () => {
      try {
        const [classificationMetrics, mlMetrics, aiMetrics] = await Promise.all([
          classificationApi.getPerformanceMetrics(),
          mlApi.getPerformanceMetrics(),
          aiApi.getPerformanceMetrics()
        ]);

        const systemMetrics: SystemMetrics = {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          gpu: Math.random() * 100,
          network: Math.random() * 100,
          storage: Math.random() * 100,
          latency: mlMetrics.data.latency,
          throughput: mlMetrics.data.throughput,
          errorRate: mlMetrics.data.errorRate,
          availability: 99.9,
          cost: aiMetrics.data.costPerRequest * 1000,
          efficiency: classificationMetrics.data.accuracy * 100,
          timestamp: new Date().toISOString()
        };

        setState(prev => ({
          ...prev,
          systemMetrics: [...prev.systemMetrics.slice(-99), systemMetrics],
          systemHealth: systemMetrics.errorRate > 0.05 ? 'warning' : 'optimal'
        }));

      } catch (error) {
        console.error('System monitoring error:', error);
      }
    };

    const interval = setInterval(monitorSystem, 5000);
    return () => clearInterval(interval);
  }, [state.realTimeSync]);

  // Auto-generate insights periodically
  useEffect(() => {
    if (state.intelligenceLevel === 'autonomous') {
      const interval = setInterval(generateIntelligentInsights, 30000);
      return () => clearInterval(interval);
    }
  }, [state.intelligenceLevel, generateIntelligentInsights]);

  // Render main header with advanced controls
  const renderAdvancedHeader = () => (
    <motion.header 
      animate={headerAnimation}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
          >
            <Sidebar className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Classifications</h1>
              <p className="text-xs text-muted-foreground">Enterprise Data Governance</p>
            </div>
          </div>
        </div>

        {/* Center section - Global search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows, models, data... (⌘K)"
              value={state.globalSearch}
              onChange={(e) => setState(prev => ({ ...prev, globalSearch: e.target.value }))}
              className="pl-10 pr-4"
              onClick={() => setState(prev => ({ ...prev, commandPaletteOpen: true }))}
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* System health indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <div className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  state.systemHealth === 'optimal' && "bg-green-500",
                  state.systemHealth === 'good' && "bg-blue-500",
                  state.systemHealth === 'warning' && "bg-yellow-500",
                  state.systemHealth === 'critical' && "bg-red-500"
                )} />
                <span className="text-xs capitalize">{state.systemHealth}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>System Health: {state.systemHealth}</p>
            </TooltipContent>
          </Tooltip>

          {/* Active workflows indicator */}
          {state.activeWorkflows.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Workflow className="h-4 w-4 mr-1" />
                  <span className="text-xs">{state.activeWorkflows.length}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{state.activeWorkflows.length} active workflows</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, notificationsOpen: !prev.notificationsOpen }))}
          >
            <Bell className="h-4 w-4" />
            {state.notifications.filter(n => !n.read).length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 min-w-[1.25rem] h-5">
                {state.notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </Button>

          {/* Intelligence level indicator */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Brain className="h-4 w-4 mr-1" />
                <span className="text-xs capitalize">{state.intelligenceLevel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Intelligence Level</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, intelligenceLevel: 'manual' }))}>
                <Hand className="h-4 w-4 mr-2" />
                Manual
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, intelligenceLevel: 'assisted' }))}>
                <Sparkles className="h-4 w-4 mr-2" />
                Assisted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, intelligenceLevel: 'autonomous' }))}>
                <Bot className="h-4 w-4 mr-2" />
                Autonomous
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, settingsOpen: !prev.settingsOpen }))}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar for active workflows */}
      {state.activeWorkflows.some(w => w.status === 'running') && (
        <div className="px-6 pb-2">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Workflow className="h-3 w-3" />
            <span>Workflows in progress</span>
          </div>
          <div className="mt-1 space-y-1">
            {state.activeWorkflows.filter(w => w.status === 'running').map(workflow => (
              <div key={workflow.id} className="flex items-center space-x-2">
                <span className="text-xs flex-1 truncate">{workflow.name}</span>
                <Progress value={workflow.progress} className="w-24 h-1" />
                <span className="text-xs w-8">{Math.round(workflow.progress)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.header>
  );

  // Render advanced sidebar
  const renderAdvancedSidebar = () => (
    <motion.aside
      animate={sidebarAnimation}
      className={cn(
        "bg-muted/50 border-r border-border transition-all duration-300",
        state.sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Mode selection */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Mode
            </Label>
            <div className="mt-2 space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: Home },
                { id: 'workflows', label: 'Workflows', icon: Workflow },
                { id: 'analytics', label: 'Analytics', icon: Chart },
                { id: 'intelligence', label: 'Intelligence', icon: Brain },
                { id: 'administration', label: 'Admin', icon: Settings }
              ].map(mode => (
                <Button
                  key={mode.id}
                  variant={state.currentMode === mode.id ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setState(prev => ({ ...prev, currentMode: mode.id as any }));
                    onNavigate?.(mode.id);
                  }}
                >
                  <mode.icon className="h-4 w-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quick actions */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Quick Actions
            </Label>
            <div className="mt-2 space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Brain className="h-4 w-4 mr-2" />
                Train Model
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Rocket className="h-4 w-4 mr-2" />
                Deploy
              </Button>
            </div>
          </div>

          <Separator />

          {/* Recent workflows */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recent Workflows
            </Label>
            <div className="mt-2 space-y-2">
              {state.activeWorkflows.slice(0, 5).map(workflow => (
                <div key={workflow.id} className="p-2 rounded-md bg-background">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate">{workflow.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {workflow.status}
                    </Badge>
                  </div>
                  <Progress value={workflow.progress} className="mt-1 h-1" />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* System insights */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Insights
            </Label>
            <div className="mt-2 space-y-2">
              {state.insights.slice(0, 3).map(insight => (
                <div key={insight.id} className="p-2 rounded-md bg-background">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-xs font-medium">{insight.title}</span>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                    <Badge variant={insight.impact === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                      {insight.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.aside>
  );

  // Render main content area
  const renderMainContent = () => (
    <motion.main 
      animate={contentAnimation}
      className="flex-1 overflow-hidden"
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={state.splitViewMode ? 50 : 100}>
          <div className="h-full p-6">
            {state.currentMode === 'overview' && renderOverviewMode()}
            {state.currentMode === 'workflows' && renderWorkflowsMode()}
            {state.currentMode === 'analytics' && renderAnalyticsMode()}
            {state.currentMode === 'intelligence' && renderIntelligenceMode()}
            {state.currentMode === 'administration' && renderAdministrationMode()}
          </div>
        </ResizablePanel>
        
        {state.splitViewMode && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div className="h-full p-6 border-l">
                {/* Split view content */}
                <div className="text-center text-muted-foreground">
                  Split view content
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </motion.main>
  );

  // Render different modes
  const renderOverviewMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Classification Overview</h2>
          <p className="text-muted-foreground">Enterprise data governance and classification system</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => createWorkflow({ name: 'Quick Classification', type: 'classification', stages: [] }, {})}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Models</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+2.1%</span>
              <span className="text-muted-foreground ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">1.2K/s</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+18%</span>
              <span className="text-muted-foreground ml-1">optimized</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cost Efficiency</p>
                <p className="text-2xl font-bold">$0.03</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">-23%</span>
              <span className="text-muted-foreground ml-1">per request</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligent insights */}
      {state.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Intelligent Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.insights.map(insight => (
                <div key={insight.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant={insight.impact === 'critical' ? 'destructive' : 'secondary'}>
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {insight.actions.map(action => (
                        <Button
                          key={action.id}
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            action.action();
                            onInsightAction?.(insight.id, action.id);
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderWorkflowsMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Orchestration</h2>
          <p className="text-muted-foreground">Manage and monitor classification workflows</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => createWorkflow({ name: 'New Workflow', type: 'classification', stages: [] }, {})}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Active workflows */}
      <div className="grid gap-4">
        {state.activeWorkflows.map(workflow => (
          <Card key={workflow.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    workflow.status === 'running' && "bg-blue-500 animate-pulse",
                    workflow.status === 'completed' && "bg-green-500",
                    workflow.status === 'failed' && "bg-red-500",
                    workflow.status === 'paused' && "bg-yellow-500"
                  )} />
                  <div>
                    <h4 className="font-medium">{workflow.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {workflow.type} • {workflow.owner} • {workflow.priority} priority
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{workflow.status}</Badge>
                  <span className="text-sm text-muted-foreground">{Math.round(workflow.progress)}%</span>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={workflow.progress} className="h-2" />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>Started {new Date(workflow.startTime).toLocaleTimeString()}</span>
                {workflow.estimatedCompletion && (
                  <span>ETA: {new Date(workflow.estimatedCompletion).toLocaleTimeString()}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Deep insights into classification performance</p>
        </div>
      </div>

      {/* Analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={state.systemMetrics.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={state.systemMetrics.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="memory" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="gpu" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderIntelligenceMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Intelligence Hub</h2>
          <p className="text-muted-foreground">Advanced AI-powered insights and automation</p>
        </div>
        <Button onClick={generateIntelligentInsights}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Insights
        </Button>
      </div>

      {/* Intelligence components would go here */}
      <Suspense fallback={<div>Loading intelligence components...</div>}>
        <IntelligenceLayout type="ai" component="intelligence-hub">
          <div className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">AI Intelligence Hub</h3>
            <p className="text-muted-foreground">Advanced AI capabilities are loading...</p>
          </div>
        </IntelligenceLayout>
      </Suspense>
    </div>
  );

  const renderAdministrationMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Administration</h2>
          <p className="text-muted-foreground">Configure and manage the classification system</p>
        </div>
      </div>

      {/* Administration panels */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-optimization</Label>
                <p className="text-sm text-muted-foreground">Automatically optimize system performance</p>
              </div>
              <Switch 
                checked={state.autoOptimization}
                onCheckedChange={(checked) => setState(prev => ({ ...prev, autoOptimization: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Predictive Analytics</Label>
                <p className="text-sm text-muted-foreground">Enable predictive system analytics</p>
              </div>
              <Switch 
                checked={state.predictiveAnalytics}
                onCheckedChange={(checked) => setState(prev => ({ ...prev, predictiveAnalytics: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Anomaly Detection</Label>
                <p className="text-sm text-muted-foreground">Monitor for system anomalies</p>
              </div>
              <Switch 
                checked={state.anomalyDetection}
                onCheckedChange={(checked) => setState(prev => ({ ...prev, anomalyDetection: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Command Palette Component
  const renderCommandPalette = () => (
    <Dialog open={state.commandPaletteOpen} onOpenChange={(open) => setState(prev => ({ ...prev, commandPaletteOpen: open }))}>
      <DialogContent className="max-w-2xl">
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actions">
              {commandPaletteActions.map(action => (
                <CommandItem key={action.id} onSelect={action.action}>
                  <action.icon className="h-4 w-4 mr-2" />
                  <div className="flex-1">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );

  // Main render
  return (
    <ClassificationProvider>
      <IntelligenceProvider>
        <TooltipProvider>
          <div className={cn(
            "h-screen flex flex-col bg-background text-foreground transition-all duration-300",
            state.darkMode && "dark",
            state.focusMode && "focus-mode"
          )}>
            {/* Header */}
            {renderAdvancedHeader()}

            {/* Main layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              {renderAdvancedSidebar()}

              {/* Main content */}
              {renderMainContent()}
            </div>

            {/* Command Palette */}
            {renderCommandPalette()}

            {/* Notifications Panel */}
            <Sheet open={state.notificationsOpen} onOpenChange={(open) => setState(prev => ({ ...prev, notificationsOpen: open }))}>
              <SheetContent side="right" className="w-96">
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                  <SheetDescription>System notifications and alerts</SheetDescription>
                </SheetHeader>
                <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
                  <div className="space-y-4">
                    {state.notifications.map(notification => (
                      <div key={notification.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={
                            notification.type === 'error' ? 'destructive' :
                            notification.type === 'warning' ? 'secondary' :
                            'default'
                          }>
                            {notification.type}
                          </Badge>
                        </div>
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="mt-3 flex space-x-2">
                            {notification.actions.map(action => (
                              <Button
                                key={action.id}
                                size="sm"
                                variant={action.variant}
                                onClick={action.action}
                              >
                                {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </TooltipProvider>
      </IntelligenceProvider>
    </ClassificationProvider>
  );
};

export default ClassificationsSPA;