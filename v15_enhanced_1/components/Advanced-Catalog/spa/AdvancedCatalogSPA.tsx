'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { DatePicker } from '@/components/ui/date-picker';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, Settings, Bell, User, Menu, X, MoreHorizontal, 
  Filter, Sort, Download, Upload, Refresh, Play, Pause, 
  Stop, FastForward, Rewind, SkipForward, SkipBack,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Database, Server, Cloud, Shield, Lock, Unlock,
  Eye, EyeOff, Heart, Star, Bookmark, Share,
  Copy, Edit, Delete, Archive, Restore, Move,
  Plus, Minus, Check, AlertTriangle, Info, HelpCircle,
  Calendar as CalendarIcon, Clock, Timer, Stopwatch,
  Target, Zap, Cpu, Memory, HardDrive, Network,
  TrendingUp, TrendingDown, BarChart, LineChart, PieChart,
  Activity, Pulse, Battery, Wifi, Signal, Volume,
  Maximize, Minimize, RotateCcw, RotateCw, ZoomIn, ZoomOut,
  Layers, Grid, List, Map, Globe, Navigation,
  Camera, Mic, Video, Phone, MessageSquare, Mail,
  FileText, File, Folder, FolderOpen, Image, Music,
  Film, Code, Terminal, Command, Hash, Tag,
  Link, ExternalLink, Paperclip, Scissors, Clipboard,
  Save, Undo, Redo, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, Quote, Heading, List as ListIcon, CheckSquare,
  Monitor, Smartphone, Tablet, Laptop, Watch, Tv,
  Car, Plane, Train, Ship, Bike, Walk,
  Home, Building, Store, Factory, School, Hospital
} from 'lucide-react';

// Import all Advanced-Catalog components
import { IntelligentDiscoveryEngine } from '../components/intelligent-discovery/IntelligentDiscoveryEngine';
import { SemanticSearchEngine } from '../components/search-discovery/SemanticSearchEngine';
import { AdvancedSearchInterface } from '../components/search-discovery/AdvancedSearchInterface';
import { CatalogIntelligence } from '../components/catalog-intelligence/CatalogIntelligence';
import { SmartCategorization } from '../components/catalog-intelligence/SmartCategorization';
import { DataLineageVisualizer } from '../components/data-lineage/DataLineageVisualizer';
import { LineageImpactAnalysis } from '../components/data-lineage/LineageImpactAnalysis';
import { QualityTrendsAnalyzer } from '../components/quality-management/QualityTrendsAnalyzer';
import { DataValidationFramework } from '../components/quality-management/DataValidationFramework';
import { QualityMetricsCalculator } from '../components/quality-management/QualityMetricsCalculator';
import { DataHealthMonitor } from '../components/quality-management/DataHealthMonitor';
import { QualityReportGenerator } from '../components/quality-management/QualityReportGenerator';
import { AnomalyDetector } from '../components/quality-management/AnomalyDetector';
import { DataQualityDashboard } from '../components/quality-management/DataQualityDashboard';
import { QualityRulesEngine } from '../components/quality-management/QualityRulesEngine';

// Import services
import { CatalogQualityService } from '../services/catalog-quality.service';
import { CatalogAnalyticsService } from '../services/catalog-analytics.service';
import { IntelligentDiscoveryService } from '../services/intelligent-discovery.service';
import { SemanticSearchService } from '../services/semantic-search.service';
import { DataLineageService } from '../services/data-lineage.service';
import { DataProfilingService } from '../services/data-profiling.service';
import { EnterpriseCatalogService } from '../services/enterprise-catalog.service';
import { AIService } from '../services/ai.service';
import { MLService } from '../services/ml.service';

// Import types
import type {
  CatalogAsset,
  DataAsset,
  CatalogMetrics,
  CatalogAnalytics,
  CatalogInsight,
  CatalogRecommendation,
  WorkflowExecution,
  WorkflowStep,
  WorkflowStatus,
  OrchestrationJob,
  OrchestrationMetrics,
  SystemStatus,
  PerformanceMetrics,
  ResourceUtilization,
  UserSession,
  ActivityLog,
  AuditTrail,
  SecurityEvent,
  ConfigurationSettings,
  AdvancedCatalogConfig
} from '../types/catalog-core.types';

import type {
  QualityDashboard,
  QualityAssessmentJob,
  QualityAssessmentResult,
  QualityMetric,
  QualityIssue,
  QualityTrend,
  QualityInsight
} from '../types/quality.types';

import type {
  AnalyticsDashboard,
  UsageAnalytics,
  DataProfile,
  BusinessGlossary,
  CatalogMetricsData,
  TrendAnalysis,
  PopularityAnalysis,
  ImpactAnalysis,
  PredictiveInsight
} from '../types/analytics.types';

import type {
  DiscoveryJob,
  DiscoveryResult,
  SemanticSearchResult,
  SearchQuery,
  SearchFilter,
  LineageGraph,
  LineageNode,
  LineageEdge,
  CollaborationSpace,
  UserCollaboration
} from '../types/discovery.types';

// Import hooks
import { useWebSocket } from '../hooks/useWebSocket';
import { useCatalogWorkflow } from '../hooks/useCatalogWorkflow';
import { useOrchestration } from '../hooks/useOrchestration';
import { useRealtimeMetrics } from '../hooks/useRealtimeMetrics';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import { useDataLineage } from '../hooks/useDataLineage';
import { useQualityMonitoring } from '../hooks/useQualityMonitoring';
import { useAnalyticsDashboard } from '../hooks/useAnalyticsDashboard';
import { useIntelligentDiscovery } from '../hooks/useIntelligentDiscovery';
import { useCollaboration } from '../hooks/useCollaboration';

// Import constants
import {
  CATALOG_MODULES,
  WORKFLOW_TYPES,
  ORCHESTRATION_MODES,
  SYSTEM_THRESHOLDS,
  PERFORMANCE_TARGETS,
  QUALITY_STANDARDS,
  ANALYTICS_DIMENSIONS,
  DISCOVERY_STRATEGIES,
  SEARCH_ALGORITHMS,
  LINEAGE_DEPTHS,
  COLLABORATION_LEVELS,
  SECURITY_POLICIES,
  API_ENDPOINTS,
  WEBSOCKET_EVENTS,
  NOTIFICATION_TYPES,
  EXPORT_FORMATS,
  IMPORT_FORMATS,
  CACHE_STRATEGIES,
  OPTIMIZATION_MODES
} from '../constants/catalog.constants';

// Import utilities
import {
  formatCatalogMetrics,
  validateWorkflowConfig,
  optimizePerformance,
  calculateResourceUsage,
  generateInsights,
  predictTrends,
  detectAnomalies,
  recommendActions,
  orchestrateWorkflows,
  manageResources,
  handleErrors,
  logActivities,
  auditOperations,
  secureOperations,
  cacheResults,
  exportData,
  importData,
  transformData,
  aggregateMetrics
} from '../utils/catalog.utils';

// Real-time WebSocket connection for live updates
const useRealtimeConnection = () => {
  const { data: wsData, isConnected, sendMessage } = useWebSocket('/ws/catalog', {
    onMessage: (message) => {
      console.log('Real-time catalog update:', message);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    onClose: () => {
      console.log('WebSocket connection closed');
    }
  });

  return { wsData, isConnected, sendMessage };
};

// Advanced workflow orchestration system
interface WorkflowOrchestrator {
  id: string;
  name: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  metrics: OrchestrationMetrics;
  configuration: AdvancedCatalogConfig;
  dependencies: string[];
  resources: ResourceUtilization;
  performance: PerformanceMetrics;
  logs: ActivityLog[];
  audit: AuditTrail[];
  security: SecurityEvent[];
}

// Master orchestration state management
interface CatalogOrchestrationState {
  // Core system state
  systemStatus: SystemStatus;
  activeWorkflows: WorkflowOrchestrator[];
  completedWorkflows: WorkflowOrchestrator[];
  failedWorkflows: WorkflowOrchestrator[];
  
  // Module states
  discoveryState: any;
  searchState: any;
  intelligenceState: any;
  lineageState: any;
  qualityState: any;
  analyticsState: any;
  collaborationState: any;
  
  // Performance tracking
  performanceMetrics: PerformanceMetrics;
  resourceUtilization: ResourceUtilization;
  systemHealth: number;
  
  // User interaction
  userSessions: UserSession[];
  activeUsers: number;
  userFeedback: any[];
  
  // Data management
  catalogAssets: CatalogAsset[];
  recentAssets: CatalogAsset[];
  popularAssets: CatalogAsset[];
  recommendedAssets: CatalogAsset[];
  
  // Analytics and insights
  dashboardMetrics: CatalogMetrics;
  qualityInsights: QualityInsight[];
  usageAnalytics: UsageAnalytics;
  predictiveInsights: PredictiveInsight[];
  
  // Configuration and settings
  systemConfig: AdvancedCatalogConfig;
  userPreferences: any;
  securitySettings: any;
  integrationSettings: any;
}

// Component state management
interface ComponentViewState {
  activeModule: string;
  selectedComponent: string;
  viewMode: 'dashboard' | 'detailed' | 'workflow' | 'analytics';
  layoutMode: 'grid' | 'list' | 'kanban' | 'timeline';
  filterCriteria: any;
  sortOptions: any;
  searchQuery: string;
  selectedItems: string[];
  expandedSections: string[];
  pinnedItems: string[];
  bookmarkedViews: string[];
  customLayouts: any[];
  notifications: any[];
  alerts: any[];
  contextMenu: any;
  quickActions: any[];
}

// Advanced notification system
interface NotificationSystem {
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    timestamp: Date;
    source: string;
    action?: any;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    tags: string[];
    read: boolean;
    archived: boolean;
    persistent: boolean;
  }>;
  unreadCount: number;
  criticalCount: number;
  settings: {
    enableSound: boolean;
    enableDesktop: boolean;
    enableEmail: boolean;
    autoArchive: boolean;
    groupByCategory: boolean;
    showPreview: boolean;
  };
}

// Real-time metrics tracking
interface RealtimeMetricsTracker {
  systemMetrics: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
    database: number;
    api: number;
  };
  catalogMetrics: {
    totalAssets: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    qualityScore: number;
    coverageScore: number;
    usageScore: number;
    healthScore: number;
  };
  userMetrics: {
    activeUsers: number;
    totalSessions: number;
    avgSessionDuration: number;
    searchQueries: number;
    dataAccess: number;
    collaborations: number;
  };
  performanceMetrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
    latency: number;
    saturation: number;
  };
}

// Advanced filtering and search system
interface AdvancedFilterSystem {
  globalFilters: {
    dateRange: { start: Date; end: Date };
    assetTypes: string[];
    qualityLevels: string[];
    owners: string[];
    tags: string[];
    status: string[];
    categories: string[];
    departments: string[];
    projects: string[];
    sensitivity: string[];
  };
  searchFilters: {
    semantic: boolean;
    fuzzy: boolean;
    exact: boolean;
    regex: boolean;
    wildcard: boolean;
    contextual: boolean;
    multilingual: boolean;
    synonyms: boolean;
  };
  advancedOptions: {
    includeMetadata: boolean;
    includeContent: boolean;
    includeComments: boolean;
    includeLineage: boolean;
    includeQuality: boolean;
    includeUsage: boolean;
    includePredictions: boolean;
    includeRecommendations: boolean;
  };
}

// Theme and customization system
interface ThemeCustomization {
  theme: 'light' | 'dark' | 'auto' | 'high-contrast';
  colorScheme: 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'custom';
  layout: 'default' | 'compact' | 'spacious' | 'minimal';
  density: 'comfortable' | 'standard' | 'compact';
  animations: boolean;
  transitions: boolean;
  effects: boolean;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
  customizations: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    borderColor: string;
    shadowColor: string;
  };
}

// Main SPA Component
export const AdvancedCatalogSPA: React.FC = () => {
  // Real-time connection
  const { wsData, isConnected, sendMessage } = useRealtimeConnection();

  // Core state management
  const [orchestrationState, setOrchestrationState] = useState<CatalogOrchestrationState>({
    systemStatus: 'healthy',
    activeWorkflows: [],
    completedWorkflows: [],
    failedWorkflows: [],
    discoveryState: null,
    searchState: null,
    intelligenceState: null,
    lineageState: null,
    qualityState: null,
    analyticsState: null,
    collaborationState: null,
    performanceMetrics: {} as PerformanceMetrics,
    resourceUtilization: {} as ResourceUtilization,
    systemHealth: 100,
    userSessions: [],
    activeUsers: 0,
    userFeedback: [],
    catalogAssets: [],
    recentAssets: [],
    popularAssets: [],
    recommendedAssets: [],
    dashboardMetrics: {} as CatalogMetrics,
    qualityInsights: [],
    usageAnalytics: {} as UsageAnalytics,
    predictiveInsights: [],
    systemConfig: {} as AdvancedCatalogConfig,
    userPreferences: {},
    securitySettings: {},
    integrationSettings: {}
  });

  // Component view state
  const [viewState, setViewState] = useState<ComponentViewState>({
    activeModule: 'overview',
    selectedComponent: '',
    viewMode: 'dashboard',
    layoutMode: 'grid',
    filterCriteria: {},
    sortOptions: { field: 'name', direction: 'asc' },
    searchQuery: '',
    selectedItems: [],
    expandedSections: ['overview'],
    pinnedItems: [],
    bookmarkedViews: [],
    customLayouts: [],
    notifications: [],
    alerts: [],
    contextMenu: null,
    quickActions: []
  });

  // Notification system state
  const [notificationSystem, setNotificationSystem] = useState<NotificationSystem>({
    notifications: [],
    unreadCount: 0,
    criticalCount: 0,
    settings: {
      enableSound: true,
      enableDesktop: true,
      enableEmail: false,
      autoArchive: true,
      groupByCategory: true,
      showPreview: true
    }
  });

  // Real-time metrics state
  const [metricsTracker, setMetricsTracker] = useState<RealtimeMetricsTracker>({
    systemMetrics: {
      cpu: 0,
      memory: 0,
      storage: 0,
      network: 0,
      database: 0,
      api: 0
    },
    catalogMetrics: {
      totalAssets: 0,
      activeJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      qualityScore: 0,
      coverageScore: 0,
      usageScore: 0,
      healthScore: 0
    },
    userMetrics: {
      activeUsers: 0,
      totalSessions: 0,
      avgSessionDuration: 0,
      searchQueries: 0,
      dataAccess: 0,
      collaborations: 0
    },
    performanceMetrics: {
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      availability: 0,
      latency: 0,
      saturation: 0
    }
  });

  // Advanced filter system state
  const [filterSystem, setFilterSystem] = useState<AdvancedFilterSystem>({
    globalFilters: {
      dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      assetTypes: [],
      qualityLevels: [],
      owners: [],
      tags: [],
      status: [],
      categories: [],
      departments: [],
      projects: [],
      sensitivity: []
    },
    searchFilters: {
      semantic: true,
      fuzzy: true,
      exact: false,
      regex: false,
      wildcard: true,
      contextual: true,
      multilingual: false,
      synonyms: true
    },
    advancedOptions: {
      includeMetadata: true,
      includeContent: true,
      includeComments: false,
      includeLineage: true,
      includeQuality: true,
      includeUsage: true,
      includePredictions: false,
      includeRecommendations: true
    }
  });

  // Theme and customization state
  const [themeCustomization, setThemeCustomization] = useState<ThemeCustomization>({
    theme: 'light',
    colorScheme: 'default',
    layout: 'default',
    density: 'standard',
    animations: true,
    transitions: true,
    effects: true,
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true
    },
    customizations: {
      primaryColor: '#0066cc',
      secondaryColor: '#6b7280',
      accentColor: '#059669',
      backgroundColor: '#ffffff',
      surfaceColor: '#f9fafb',
      textColor: '#111827',
      borderColor: '#e5e7eb',
      shadowColor: '#00000010'
    }
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);

  // Refs for advanced interactions
  const mainContentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Command palette state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  // Advanced hooks
  const workflowHook = useCatalogWorkflow();
  const orchestrationHook = useOrchestration();
  const metricsHook = useRealtimeMetrics();
  const searchHook = useAdvancedSearch();
  const lineageHook = useDataLineage();
  const qualityHook = useQualityMonitoring();
  const analyticsHook = useAnalyticsDashboard();
  const discoveryHook = useIntelligentDiscovery();
  const collaborationHook = useCollaboration();

  // Service instances
  const catalogQualityService = useMemo(() => new CatalogQualityService(), []);
  const catalogAnalyticsService = useMemo(() => new CatalogAnalyticsService(), []);
  const intelligentDiscoveryService = useMemo(() => new IntelligentDiscoveryService(), []);
  const semanticSearchService = useMemo(() => new SemanticSearchService(), []);
  const dataLineageService = useMemo(() => new DataLineageService(), []);
  const dataProfilingService = useMemo(() => new DataProfilingService(), []);
  const enterpriseCatalogService = useMemo(() => new EnterpriseCatalogService(), []);
  const aiService = useMemo(() => new AIService(), []);
  const mlService = useMemo(() => new MLService(), []);

  // Initialize system on mount
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        setIsLoading(true);
        
        // Initialize all services
        await Promise.all([
          initializeCatalogServices(),
          loadSystemConfiguration(),
          loadUserPreferences(),
          initializeWorkflowOrchestration(),
          startMetricsTracking(),
          loadCatalogAssets(),
          setupSecurityContext(),
          initializeCollaboration()
        ]);
        
        setIsLoading(false);
        
        // Send notification about successful initialization
        addNotification({
          type: 'success',
          title: 'Advanced Catalog Initialized',
          message: 'All systems are operational and ready for use.',
          source: 'system',
          priority: 'medium',
          category: 'system'
        });
        
      } catch (error) {
        console.error('Failed to initialize Advanced Catalog:', error);
        setErrors(prev => [...prev, error]);
        setIsLoading(false);
        
        addNotification({
          type: 'error',
          title: 'Initialization Failed',
          message: 'Failed to initialize some catalog components. Please check system logs.',
          source: 'system',
          priority: 'high',
          category: 'error'
        });
      }
    };

    initializeSystem();
  }, []);

  // Initialize catalog services
  const initializeCatalogServices = async () => {
    try {
      // Initialize all service connections
      await Promise.all([
        catalogQualityService.initialize(),
        catalogAnalyticsService.initialize(),
        intelligentDiscoveryService.initialize(),
        semanticSearchService.initialize(),
        dataLineageService.initialize(),
        dataProfilingService.initialize(),
        enterpriseCatalogService.initialize(),
        aiService.initialize(),
        mlService.initialize()
      ]);
      
      console.log('All catalog services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize catalog services:', error);
      throw error;
    }
  };

  // Load system configuration
  const loadSystemConfiguration = async () => {
    try {
      const config = await enterpriseCatalogService.getSystemConfiguration();
      setOrchestrationState(prev => ({
        ...prev,
        systemConfig: config
      }));
    } catch (error) {
      console.error('Failed to load system configuration:', error);
    }
  };

  // Load user preferences
  const loadUserPreferences = async () => {
    try {
      const preferences = await enterpriseCatalogService.getUserPreferences();
      setOrchestrationState(prev => ({
        ...prev,
        userPreferences: preferences
      }));
      
      // Apply theme preferences
      if (preferences.theme) {
        setThemeCustomization(prev => ({
          ...prev,
          ...preferences.theme
        }));
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  // Initialize workflow orchestration
  const initializeWorkflowOrchestration = async () => {
    try {
      const activeWorkflows = await orchestrationHook.getActiveWorkflows();
      setOrchestrationState(prev => ({
        ...prev,
        activeWorkflows
      }));
    } catch (error) {
      console.error('Failed to initialize workflow orchestration:', error);
    }
  };

  // Start metrics tracking
  const startMetricsTracking = async () => {
    try {
      // Start real-time metrics collection
      const metricsInterval = setInterval(async () => {
        try {
          const metrics = await metricsHook.getCurrentMetrics();
          setMetricsTracker(prev => ({
            ...prev,
            ...metrics
          }));
        } catch (error) {
          console.error('Failed to fetch metrics:', error);
        }
      }, 5000); // Update every 5 seconds

      // Store interval for cleanup
      return () => clearInterval(metricsInterval);
    } catch (error) {
      console.error('Failed to start metrics tracking:', error);
    }
  };

  // Load catalog assets
  const loadCatalogAssets = async () => {
    try {
      const [assets, recentAssets, popularAssets, recommendedAssets] = await Promise.all([
        enterpriseCatalogService.getCatalogAssets({ limit: 100 }),
        enterpriseCatalogService.getRecentAssets({ limit: 10 }),
        enterpriseCatalogService.getPopularAssets({ limit: 10 }),
        enterpriseCatalogService.getRecommendedAssets({ limit: 10 })
      ]);

      setOrchestrationState(prev => ({
        ...prev,
        catalogAssets: assets,
        recentAssets,
        popularAssets,
        recommendedAssets
      }));
    } catch (error) {
      console.error('Failed to load catalog assets:', error);
    }
  };

  // Setup security context
  const setupSecurityContext = async () => {
    try {
      const securitySettings = await enterpriseCatalogService.getSecuritySettings();
      setOrchestrationState(prev => ({
        ...prev,
        securitySettings
      }));
    } catch (error) {
      console.error('Failed to setup security context:', error);
    }
  };

  // Initialize collaboration
  const initializeCollaboration = async () => {
    try {
      const collaborationState = await collaborationHook.initialize();
      setOrchestrationState(prev => ({
        ...prev,
        collaborationState
      }));
    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
    }
  };

  // Handle real-time updates
  useEffect(() => {
    if (wsData) {
      handleRealtimeUpdate(wsData);
    }
  }, [wsData]);

  // Handle real-time update processing
  const handleRealtimeUpdate = (data: any) => {
    switch (data.type) {
      case 'workflow_update':
        updateWorkflowState(data.payload);
        break;
      case 'metrics_update':
        updateMetricsState(data.payload);
        break;
      case 'quality_alert':
        handleQualityAlert(data.payload);
        break;
      case 'discovery_result':
        handleDiscoveryResult(data.payload);
        break;
      case 'lineage_update':
        handleLineageUpdate(data.payload);
        break;
      case 'collaboration_event':
        handleCollaborationEvent(data.payload);
        break;
      case 'security_event':
        handleSecurityEvent(data.payload);
        break;
      case 'system_notification':
        handleSystemNotification(data.payload);
        break;
      default:
        console.log('Unknown real-time update type:', data.type);
    }
  };

  // Update workflow state
  const updateWorkflowState = (payload: any) => {
    setOrchestrationState(prev => {
      const updatedWorkflows = prev.activeWorkflows.map(workflow =>
        workflow.id === payload.workflowId 
          ? { ...workflow, ...payload.updates }
          : workflow
      );
      
      return {
        ...prev,
        activeWorkflows: updatedWorkflows
      };
    });
  };

  // Update metrics state
  const updateMetricsState = (payload: any) => {
    setMetricsTracker(prev => ({
      ...prev,
      ...payload
    }));
  };

  // Handle quality alerts
  const handleQualityAlert = (payload: any) => {
    addNotification({
      type: payload.severity === 'high' ? 'error' : 'warning',
      title: 'Data Quality Alert',
      message: payload.message,
      source: 'quality-monitoring',
      priority: payload.severity,
      category: 'quality'
    });
  };

  // Handle discovery results
  const handleDiscoveryResult = (payload: any) => {
    // Update discovery state with new results
    setOrchestrationState(prev => ({
      ...prev,
      discoveryState: {
        ...prev.discoveryState,
        latestResults: payload.results
      }
    }));
  };

  // Handle lineage updates
  const handleLineageUpdate = (payload: any) => {
    // Update lineage state
    setOrchestrationState(prev => ({
      ...prev,
      lineageState: {
        ...prev.lineageState,
        ...payload
      }
    }));
  };

  // Handle collaboration events
  const handleCollaborationEvent = (payload: any) => {
    // Update collaboration state
    setOrchestrationState(prev => ({
      ...prev,
      collaborationState: {
        ...prev.collaborationState,
        ...payload
      }
    }));
  };

  // Handle security events
  const handleSecurityEvent = (payload: any) => {
    addNotification({
      type: 'warning',
      title: 'Security Event',
      message: payload.message,
      source: 'security',
      priority: 'high',
      category: 'security'
    });
  };

  // Handle system notifications
  const handleSystemNotification = (payload: any) => {
    addNotification({
      type: payload.type,
      title: payload.title,
      message: payload.message,
      source: 'system',
      priority: payload.priority,
      category: payload.category
    });
  };

  // Add notification function
  const addNotification = (notification: Omit<NotificationSystem['notifications'][0], 'id' | 'timestamp' | 'read' | 'archived' | 'persistent' | 'tags'>) => {
    const newNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      archived: false,
      persistent: notification.priority === 'critical',
      tags: []
    };

    setNotificationSystem(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1,
      criticalCount: notification.priority === 'critical' ? prev.criticalCount + 1 : prev.criticalCount
    }));

    // Play sound notification if enabled
    if (notificationSystem.settings.enableSound) {
      playNotificationSound(notification.type);
    }

    // Show desktop notification if enabled
    if (notificationSystem.settings.enableDesktop) {
      showDesktopNotification(newNotification);
    }
  };

  // Play notification sound
  const playNotificationSound = (type: string) => {
    try {
      const audio = new Audio(`/sounds/notification-${type}.mp3`);
      audio.volume = 0.3;
      audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
      });
    } catch (error) {
      console.warn('Notification sound not available:', error);
    }
  };

  // Show desktop notification
  const showDesktopNotification = (notification: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/catalog-icon.png',
        badge: '/icons/catalog-badge.png',
        tag: notification.id
      });
    }
  };

  // Advanced command palette system
  const commandPaletteCommands = useMemo(() => {
    return [
      // Navigation commands
      { id: 'nav-overview', label: 'Go to Overview', action: () => setViewState(prev => ({ ...prev, activeModule: 'overview' })) },
      { id: 'nav-discovery', label: 'Go to Discovery', action: () => setViewState(prev => ({ ...prev, activeModule: 'discovery' })) },
      { id: 'nav-search', label: 'Go to Search', action: () => setViewState(prev => ({ ...prev, activeModule: 'search' })) },
      { id: 'nav-intelligence', label: 'Go to Intelligence', action: () => setViewState(prev => ({ ...prev, activeModule: 'intelligence' })) },
      { id: 'nav-lineage', label: 'Go to Lineage', action: () => setViewState(prev => ({ ...prev, activeModule: 'lineage' })) },
      { id: 'nav-quality', label: 'Go to Quality', action: () => setViewState(prev => ({ ...prev, activeModule: 'quality' })) },
      { id: 'nav-analytics', label: 'Go to Analytics', action: () => setViewState(prev => ({ ...prev, activeModule: 'analytics' })) },
      { id: 'nav-collaboration', label: 'Go to Collaboration', action: () => setViewState(prev => ({ ...prev, activeModule: 'collaboration' })) },
      
      // Action commands
      { id: 'action-refresh', label: 'Refresh All Data', action: () => refreshAllData() },
      { id: 'action-export', label: 'Export Current View', action: () => exportCurrentView() },
      { id: 'action-settings', label: 'Open Settings', action: () => openSettings() },
      { id: 'action-help', label: 'Show Help', action: () => showHelp() },
      
      // Quick access commands
      { id: 'quick-search', label: 'Quick Search Assets', action: () => focusSearchBox() },
      { id: 'quick-quality', label: 'Quick Quality Check', action: () => runQuickQualityCheck() },
      { id: 'quick-lineage', label: 'Trace Data Lineage', action: () => openLineageTracer() },
      
      // Workflow commands
      { id: 'workflow-new', label: 'Create New Workflow', action: () => createNewWorkflow() },
      { id: 'workflow-pause', label: 'Pause All Workflows', action: () => pauseAllWorkflows() },
      { id: 'workflow-resume', label: 'Resume All Workflows', action: () => resumeAllWorkflows() },
      
      // System commands
      { id: 'system-health', label: 'Check System Health', action: () => checkSystemHealth() },
      { id: 'system-optimize', label: 'Optimize Performance', action: () => optimizeSystemPerformance() },
      { id: 'system-backup', label: 'Create System Backup', action: () => createSystemBackup() }
    ];
  }, []);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!commandQuery) return commandPaletteCommands;
    
    return commandPaletteCommands.filter(command =>
      command.label.toLowerCase().includes(commandQuery.toLowerCase())
    );
  }, [commandQuery, commandPaletteCommands]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command palette shortcut (Cmd/Ctrl + K)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      // Quick search shortcut (Cmd/Ctrl + /)
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        focusSearchBox();
      }
      
      // Refresh shortcut (Cmd/Ctrl + R)
      if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
        event.preventDefault();
        refreshAllData();
      }
      
      // Settings shortcut (Cmd/Ctrl + ,)
      if ((event.metaKey || event.ctrlKey) && event.key === ',') {
        event.preventDefault();
        openSettings();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Command palette action handlers
  const refreshAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadCatalogAssets(),
        metricsHook.refreshMetrics(),
        qualityHook.refreshQualityData(),
        analyticsHook.refreshAnalytics()
      ]);
      
      addNotification({
        type: 'success',
        title: 'Data Refreshed',
        message: 'All catalog data has been refreshed successfully.',
        source: 'system',
        priority: 'low',
        category: 'action'
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh some data. Please try again.',
        source: 'system',
        priority: 'medium',
        category: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [metricsHook, qualityHook, analyticsHook]);

  const exportCurrentView = useCallback(async () => {
    try {
      const exportData = await generateExportData();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `catalog-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Export Complete',
        message: 'Current view data has been exported successfully.',
        source: 'system',
        priority: 'low',
        category: 'action'
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export data. Please try again.',
        source: 'system',
        priority: 'medium',
        category: 'error'
      });
    }
  }, [viewState]);

  const generateExportData = async () => {
    return {
      timestamp: new Date().toISOString(),
      module: viewState.activeModule,
      component: viewState.selectedComponent,
      viewMode: viewState.viewMode,
      filters: filterSystem.globalFilters,
      metrics: metricsTracker,
      assets: orchestrationState.catalogAssets.slice(0, 100), // Limit for performance
      workflows: orchestrationState.activeWorkflows,
      quality: orchestrationState.qualityInsights,
      analytics: orchestrationState.usageAnalytics
    };
  };

  const openSettings = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      activeModule: 'settings',
      selectedComponent: 'general'
    }));
  }, []);

  const showHelp = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      activeModule: 'help',
      selectedComponent: 'getting-started'
    }));
  }, []);

  const focusSearchBox = useCallback(() => {
    const searchBox = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    if (searchBox) {
      searchBox.focus();
      searchBox.select();
    }
  }, []);

  const runQuickQualityCheck = useCallback(async () => {
    try {
      const qualityCheck = await catalogQualityService.runQuickAssessment();
      
      addNotification({
        type: qualityCheck.overallScore > 80 ? 'success' : 'warning',
        title: 'Quick Quality Check',
        message: `Overall quality score: ${qualityCheck.overallScore}%`,
        source: 'quality',
        priority: 'medium',
        category: 'quality'
      });
    } catch (error) {
      console.error('Failed to run quality check:', error);
    }
  }, [catalogQualityService]);

  const openLineageTracer = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      activeModule: 'lineage',
      selectedComponent: 'visualizer',
      viewMode: 'detailed'
    }));
  }, []);

  const createNewWorkflow = useCallback(async () => {
    try {
      const workflow = await orchestrationHook.createWorkflow({
        name: 'New Workflow',
        type: 'data-processing',
        steps: []
      });
      
      setOrchestrationState(prev => ({
        ...prev,
        activeWorkflows: [...prev.activeWorkflows, workflow]
      }));
      
      addNotification({
        type: 'success',
        title: 'Workflow Created',
        message: 'New workflow has been created successfully.',
        source: 'workflow',
        priority: 'low',
        category: 'action'
      });
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  }, [orchestrationHook]);

  const pauseAllWorkflows = useCallback(async () => {
    try {
      await Promise.all(
        orchestrationState.activeWorkflows.map(workflow =>
          orchestrationHook.pauseWorkflow(workflow.id)
        )
      );
      
      addNotification({
        type: 'info',
        title: 'Workflows Paused',
        message: 'All active workflows have been paused.',
        source: 'workflow',
        priority: 'medium',
        category: 'action'
      });
    } catch (error) {
      console.error('Failed to pause workflows:', error);
    }
  }, [orchestrationState.activeWorkflows, orchestrationHook]);

  const resumeAllWorkflows = useCallback(async () => {
    try {
      await Promise.all(
        orchestrationState.activeWorkflows.map(workflow =>
          orchestrationHook.resumeWorkflow(workflow.id)
        )
      );
      
      addNotification({
        type: 'success',
        title: 'Workflows Resumed',
        message: 'All workflows have been resumed.',
        source: 'workflow',
        priority: 'medium',
        category: 'action'
      });
    } catch (error) {
      console.error('Failed to resume workflows:', error);
    }
  }, [orchestrationState.activeWorkflows, orchestrationHook]);

  const checkSystemHealth = useCallback(async () => {
    try {
      const health = await enterpriseCatalogService.getSystemHealth();
      
      addNotification({
        type: health.status === 'healthy' ? 'success' : 'warning',
        title: 'System Health Check',
        message: `System status: ${health.status} (${health.score}%)`,
        source: 'system',
        priority: 'medium',
        category: 'system'
      });
    } catch (error) {
      console.error('Failed to check system health:', error);
    }
  }, [enterpriseCatalogService]);

  const optimizeSystemPerformance = useCallback(async () => {
    try {
      const optimization = await enterpriseCatalogService.optimizePerformance();
      
      addNotification({
        type: 'success',
        title: 'Performance Optimized',
        message: `System performance improved by ${optimization.improvement}%`,
        source: 'system',
        priority: 'medium',
        category: 'optimization'
      });
    } catch (error) {
      console.error('Failed to optimize performance:', error);
    }
  }, [enterpriseCatalogService]);

  const createSystemBackup = useCallback(async () => {
    try {
      const backup = await enterpriseCatalogService.createBackup();
      
      addNotification({
        type: 'success',
        title: 'Backup Created',
        message: `System backup created: ${backup.id}`,
        source: 'system',
        priority: 'low',
        category: 'backup'
      });
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }, [enterpriseCatalogService]);

  // Module configuration
  const moduleConfigs = useMemo(() => ({
    overview: {
      title: 'Catalog Overview',
      icon: Database,
      description: 'Comprehensive view of your data catalog',
      components: ['dashboard', 'metrics', 'recent-activity', 'recommendations']
    },
    discovery: {
      title: 'Intelligent Discovery',
      icon: Search,
      description: 'AI-powered data discovery and cataloging',
      components: ['discovery-engine', 'auto-cataloging', 'schema-inference', 'content-analysis']
    },
    search: {
      title: 'Advanced Search',
      icon: Search,
      description: 'Semantic and advanced search capabilities',
      components: ['semantic-search', 'advanced-search', 'saved-searches', 'search-analytics']
    },
    intelligence: {
      title: 'Catalog Intelligence',
      icon: Cpu,
      description: 'AI-driven insights and recommendations',
      components: ['smart-categorization', 'auto-tagging', 'relationship-detection', 'usage-patterns']
    },
    lineage: {
      title: 'Data Lineage',
      icon: Network,
      description: 'End-to-end data lineage and impact analysis',
      components: ['lineage-visualizer', 'impact-analysis', 'column-lineage', 'dependency-tracking']
    },
    quality: {
      title: 'Quality Management',
      icon: Shield,
      description: 'Data quality monitoring and management',
      components: ['quality-dashboard', 'rules-engine', 'trends-analyzer', 'validation-framework', 'metrics-calculator', 'health-monitor', 'anomaly-detector', 'report-generator']
    },
    analytics: {
      title: 'Catalog Analytics',
      icon: BarChart,
      description: 'Usage analytics and insights',
      components: ['usage-dashboard', 'data-profiler', 'glossary-manager', 'metrics-center', 'trend-analysis', 'popularity-analyzer', 'impact-analysis', 'predictive-insights']
    },
    collaboration: {
      title: 'Collaboration',
      icon: User,
      description: 'Team collaboration and knowledge sharing',
      components: ['collaboration-spaces', 'knowledge-sharing', 'team-insights', 'expert-networks']
    },
    workflows: {
      title: 'Workflow Management',
      icon: Settings,
      description: 'Manage and orchestrate catalog workflows',
      components: ['workflow-designer', 'execution-monitor', 'schedule-manager', 'automation-rules']
    },
    settings: {
      title: 'System Settings',
      icon: Settings,
      description: 'Configure system preferences and settings',
      components: ['general', 'security', 'integrations', 'notifications', 'performance', 'backup']
    },
    help: {
      title: 'Help & Documentation',
      icon: HelpCircle,
      description: 'Help documentation and support',
      components: ['getting-started', 'user-guide', 'api-docs', 'troubleshooting', 'support']
    }
  }), []);

  // Render module navigation
  const renderModuleNavigation = () => (
    <div className="flex flex-col space-y-2 p-4">
      {Object.entries(moduleConfigs).map(([moduleKey, config]) => {
        const Icon = config.icon;
        const isActive = viewState.activeModule === moduleKey;
        
        return (
          <TooltipProvider key={moduleKey}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`justify-start w-full transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setViewState(prev => ({ 
                    ...prev, 
                    activeModule: moduleKey,
                    selectedComponent: config.components[0]
                  }))}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="font-medium">{config.title}</span>
                  {moduleKey === 'quality' && (
                    <Badge variant="secondary" className="ml-auto">
                      {orchestrationState.qualityInsights.length}
                    </Badge>
                  )}
                  {moduleKey === 'workflows' && (
                    <Badge variant="secondary" className="ml-auto">
                      {orchestrationState.activeWorkflows.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{config.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );

  // Render system status bar
  const renderSystemStatusBar = () => (
    <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <div className={`h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center space-x-1">
          <Activity className="h-3 w-3" />
          <span>Health: {orchestrationState.systemHealth}%</span>
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center space-x-1">
          <User className="h-3 w-3" />
          <span>{metricsTracker.userMetrics.activeUsers} users</span>
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center space-x-1">
          <Database className="h-3 w-3" />
          <span>{metricsTracker.catalogMetrics.totalAssets} assets</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="text-xs"
        >
          <Command className="h-3 w-3 mr-1" />
          ⌘K
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshAllData}
          disabled={isLoading}
          className="text-xs"
        >
          <Refresh className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );

  // Render header
  const renderHeader = () => (
    <header ref={headerRef} className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Catalog</h1>
              <p className="text-sm text-gray-500">Enterprise Data Governance Hub</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Global search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assets, workflows, or documentation..."
              className="pl-10 w-96"
              value={viewState.searchQuery}
              onChange={(e) => setViewState(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notificationSystem.unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {notificationSystem.unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-64">
                {notificationSystem.notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b last:border-b-0 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`h-2 w-2 rounded-full mt-2 ${
                        notification.type === 'error' ? 'bg-red-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        notification.type === 'success' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                User
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewState(prev => ({ ...prev, activeModule: 'settings' }))}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewState(prev => ({ ...prev, activeModule: 'help' }))}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );

  // Render main content based on active module
  const renderMainContent = () => {
    const moduleConfig = moduleConfigs[viewState.activeModule];
    
    if (!moduleConfig) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Module Not Found</h3>
            <p className="text-gray-600">The requested module could not be found.</p>
          </div>
        </div>
      );
    }

    switch (viewState.activeModule) {
      case 'overview':
        return renderOverviewModule();
      case 'discovery':
        return renderDiscoveryModule();
      case 'search':
        return renderSearchModule();
      case 'intelligence':
        return renderIntelligenceModule();
      case 'lineage':
        return renderLineageModule();
      case 'quality':
        return renderQualityModule();
      case 'analytics':
        return renderAnalyticsModule();
      case 'collaboration':
        return renderCollaborationModule();
      case 'workflows':
        return renderWorkflowsModule();
      case 'settings':
        return renderSettingsModule();
      case 'help':
        return renderHelpModule();
      default:
        return renderOverviewModule();
    }
  };

  // Render overview module
  const renderOverviewModule = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Catalog Overview</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={refreshAllData}>
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-3xl font-bold text-gray-900">
                  {metricsTracker.catalogMetrics.totalAssets.toLocaleString()}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quality Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {metricsTracker.catalogMetrics.qualityScore}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress value={metricsTracker.catalogMetrics.qualityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {metricsTracker.userMetrics.activeUsers}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+8%</span>
                <span className="text-gray-500 ml-1">vs yesterday</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orchestrationState.systemHealth}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Progress value={orchestrationState.systemHealth} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent activity and recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assets</CardTitle>
            <CardDescription>Recently discovered or updated data assets</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {orchestrationState.recentAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <Database className="h-4 w-4 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{asset.name}</p>
                      <p className="text-xs text-gray-500">{asset.type} • {asset.source}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {asset.qualityScore}%
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>Intelligent suggestions to improve your catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {orchestrationState.recommendedAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{asset.recommendation}</p>
                      <p className="text-xs text-gray-500">{asset.reason}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render quality module
  const renderQualityModule = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Quality Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Run Assessment
          </Button>
        </div>
      </div>
      
      <Tabs value={viewState.selectedComponent} onValueChange={(value) => 
        setViewState(prev => ({ ...prev, selectedComponent: value }))
      }>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rules-engine">Rules</TabsTrigger>
          <TabsTrigger value="trends-analyzer">Trends</TabsTrigger>
          <TabsTrigger value="validation-framework">Validation</TabsTrigger>
          <TabsTrigger value="metrics-calculator">Metrics</TabsTrigger>
          <TabsTrigger value="health-monitor">Health</TabsTrigger>
          <TabsTrigger value="anomaly-detector">Anomalies</TabsTrigger>
          <TabsTrigger value="report-generator">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <DataQualityDashboard />
        </TabsContent>
        
        <TabsContent value="rules-engine" className="mt-6">
          <QualityRulesEngine />
        </TabsContent>
        
        <TabsContent value="trends-analyzer" className="mt-6">
          <QualityTrendsAnalyzer />
        </TabsContent>
        
        <TabsContent value="validation-framework" className="mt-6">
          <DataValidationFramework />
        </TabsContent>
        
        <TabsContent value="metrics-calculator" className="mt-6">
          <QualityMetricsCalculator />
        </TabsContent>
        
        <TabsContent value="health-monitor" className="mt-6">
          <DataHealthMonitor />
        </TabsContent>
        
        <TabsContent value="anomaly-detector" className="mt-6">
          <AnomalyDetector />
        </TabsContent>
        
        <TabsContent value="report-generator" className="mt-6">
          <QualityReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );

  // Render other modules (simplified for brevity)
  const renderDiscoveryModule = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Intelligent Discovery</h2>
      <IntelligentDiscoveryEngine />
    </div>
  );

  const renderSearchModule = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Search</h2>
      <Tabs defaultValue="semantic-search">
        <TabsList>
          <TabsTrigger value="semantic-search">Semantic Search</TabsTrigger>
          <TabsTrigger value="advanced-search">Advanced Search</TabsTrigger>
        </TabsList>
        <TabsContent value="semantic-search">
          <SemanticSearchEngine />
        </TabsContent>
        <TabsContent value="advanced-search">
          <AdvancedSearchInterface />
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderIntelligenceModule = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Catalog Intelligence</h2>
      <Tabs defaultValue="catalog-intelligence">
        <TabsList>
          <TabsTrigger value="catalog-intelligence">Intelligence Engine</TabsTrigger>
          <TabsTrigger value="smart-categorization">Smart Categorization</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog-intelligence">
          <CatalogIntelligence />
        </TabsContent>
        <TabsContent value="smart-categorization">
          <SmartCategorization />
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderLineageModule = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Lineage</h2>
      <Tabs defaultValue="lineage-visualizer">
        <TabsList>
          <TabsTrigger value="lineage-visualizer">Lineage Visualizer</TabsTrigger>
          <TabsTrigger value="impact-analysis">Impact Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="lineage-visualizer">
          <DataLineageVisualizer />
        </TabsContent>
        <TabsContent value="impact-analysis">
          <LineageImpactAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderAnalyticsModule = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Catalog Analytics</h2>
      <div className="text-center py-12">
        <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Components</h3>
        <p className="text-gray-600">Analytics components will be loaded here.</p>
      </div>
    </div>
  );

  const renderCollaborationModule = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Collaboration</h2>
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Collaboration Hub</h3>
        <p className="text-gray-600">Collaboration components will be loaded here.</p>
      </div>
    </div>
  );

  const renderWorkflowsModule = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Workflow Management</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Workflows</CardTitle>
            <CardDescription>Currently running workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orchestrationState.activeWorkflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{workflow.name}</h4>
                    <p className="text-sm text-gray-600">{workflow.status}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={workflow.status === 'running' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Workflow Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active</span>
                  <span>{orchestrationState.activeWorkflows.length}</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completed</span>
                  <span>{orchestrationState.completedWorkflows.length}</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Failed</span>
                  <span>{orchestrationState.failedWorkflows.length}</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettingsModule = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">System Settings</h2>
      <div className="text-center py-12">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel</h3>
        <p className="text-gray-600">Settings components will be loaded here.</p>
      </div>
    </div>
  );

  const renderHelpModule = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Help & Documentation</h2>
      <div className="text-center py-12">
        <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Help Center</h3>
        <p className="text-gray-600">Help and documentation will be loaded here.</p>
      </div>
    </div>
  );

  // Command palette component
  const renderCommandPalette = () => (
    <CommandDialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={commandQuery}
        onValueChange={setCommandQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {filteredCommands.filter(cmd => cmd.id.startsWith('nav-')).map((command) => (
            <CommandItem 
              key={command.id}
              onSelect={() => {
                command.action();
                setIsCommandPaletteOpen(false);
                setCommandQuery('');
              }}
            >
              {command.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          {filteredCommands.filter(cmd => cmd.id.startsWith('action-')).map((command) => (
            <CommandItem 
              key={command.id}
              onSelect={() => {
                command.action();
                setIsCommandPaletteOpen(false);
                setCommandQuery('');
              }}
            >
              {command.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Access">
          {filteredCommands.filter(cmd => cmd.id.startsWith('quick-')).map((command) => (
            <CommandItem 
              key={command.id}
              onSelect={() => {
                command.action();
                setIsCommandPaletteOpen(false);
                setCommandQuery('');
              }}
            >
              {command.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Workflows">
          {filteredCommands.filter(cmd => cmd.id.startsWith('workflow-')).map((command) => (
            <CommandItem 
              key={command.id}
              onSelect={() => {
                command.action();
                setIsCommandPaletteOpen(false);
                setCommandQuery('');
              }}
            >
              {command.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="System">
          {filteredCommands.filter(cmd => cmd.id.startsWith('system-')).map((command) => (
            <CommandItem 
              key={command.id}
              onSelect={() => {
                command.action();
                setIsCommandPaletteOpen(false);
                setCommandQuery('');
              }}
            >
              {command.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Initializing Advanced Catalog</h3>
          <p className="text-gray-600">Loading system components and establishing connections...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      {renderHeader()}
      
      {/* Main layout */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside ref={sidebarRef} className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <ScrollArea className="flex-1">
            {renderModuleNavigation()}
          </ScrollArea>
          {renderSystemStatusBar()}
        </aside>
        
        {/* Main content */}
        <main ref={mainContentRef} className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewState.activeModule}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Command palette */}
      {renderCommandPalette()}
      
      {/* Error boundary for alerts */}
      {errors.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          {errors.slice(0, 3).map((error, index) => (
            <Alert key={index} variant="destructive" className="mb-2 max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error.message || 'An unexpected error occurred'}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedCatalogSPA;