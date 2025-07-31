'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';

// Core UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Advanced UI Components
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

// Recharts for Advanced Analytics
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';

// Lucide Icons
import {
  // Navigation & Layout
  Layout,
  Sidebar as SidebarIcon,
  Menu,
  MoreHorizontal,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  
  // Core Features
  Search,
  Filter,
  Settings,
  Database,
  FileText,
  Folder,
  FolderOpen,
  Tag,
  Bookmark,
  Star,
  Heart,
  Eye,
  EyeOff,
  
  // Analytics & Intelligence
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  Brain,
  Sparkles,
  Lightbulb,
  Bot,
  Cpu,
  
  // User & Collaboration
  Users,
  User,
  UserPlus,
  Share,
  MessageSquare,
  Bell,
  BellRing,
  
  // Actions & Controls
  Play,
  Pause,
  Stop,
  RefreshCw,
  Download,
  Upload,
  Save,
  Copy,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  
  // Status & Indicators
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Clock,
  Calendar,
  Timer,
  
  // Advanced Features
  Workflow,
  Network,
  Layers,
  Globe,
  Map,
  Compass,
  Route,
  Navigation,
  MapPin,
  
  // System & Technical
  Server,
  Shield,
  Lock,
  Unlock,
  Key,
  Terminal,
  Code,
  GitBranch,
  Hash,
  
  // Data & Quality
  Gauge,
  BarChart2,
  LineChart,
  Percent,
  DollarSign,
  Archive,
  HardDrive,
  
  // UI Controls
  Maximize,
  Minimize,
  Expand,
  Shrink,
  ToggleLeft,
  ToggleRight,
  Sliders,
  
  // Communication
  Mail,
  Phone,
  ExternalLink,
  Link,
  
  // Time & Scheduling
  History,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  
  // Quality & Validation
  Award,
  Medal,
  Trophy,
  Flag,
  Verified,
  
  // Advanced Analytics
  Binary,
  Boxes,
  Command as CommandIcon,
  Crosshair,
  Focus,
  Scan,
  ScanLine,
  
  // Enterprise Features
  Building,
  Building2,
  Factory,
  Warehouse,
  Store,
  
  // AI & ML
  Beaker,
  FlaskConical,
  Microscope,
  TestTube,
  Atom,
  
  // Notifications & Alerts
  Volume2,
  VolumeX,
  Vibrate,
  
  // Miscellaneous
  Puzzle,
  Wrench,
  Tool,
  Cog,
  Gear
} from 'lucide-react';

// Hooks and Services
import { useCatalogAnalytics } from '../hooks/useCatalogAnalytics';
import { useCatalogDiscovery } from '../hooks/useCatalogDiscovery';
import { useCatalogLineage } from '../hooks/useCatalogLineage';
import { useCatalogCollaboration } from '../hooks/useCatalogCollaboration';
import { useCatalogRecommendations } from '../hooks/useCatalogRecommendations';
import { useCatalogProfiling } from '../hooks/useCatalogProfiling';
import { useCatalogAI } from '../hooks/useCatalogAI';

// Services
import { catalogAnalyticsService } from '../services/catalog-analytics.service';
import { enterpriseCatalogService } from '../services/enterprise-catalog.service';
import { semanticSearchService } from '../services/semantic-search.service';
import { intelligentDiscoveryService } from '../services/intelligent-discovery.service';
import { catalogAIService } from '../services/catalog-ai.service';
import { catalogQualityService } from '../services/catalog-quality.service';
import { advancedLineageService } from '../services/advanced-lineage.service';
import { catalogRecommendationService } from '../services/catalog-recommendation.service';
import { collaborationService } from '../services/collaboration.service';
import { dataProfilingService } from '../services/data-profiling.service';

// Types
import {
  IntelligentDataAsset,
  SearchRequest,
  SearchResponse,
  SearchFilter,
  CatalogAnalyticsDashboard,
  DataLineageGraph,
  DataQualityMetrics,
  SearchHistoryItem,
  CollaborationSession,
  DataProfileSummary,
  AssetRecommendation
} from '../types';

// ============================================================================
// LAZY LOADED COMPONENTS (FOR PERFORMANCE)
// ============================================================================

// Catalog Analytics Components
const UsageAnalyticsDashboard = lazy(() => import('../components/catalog-analytics/UsageAnalyticsDashboard'));
const DataProfiler = lazy(() => import('../components/catalog-analytics/DataProfiler'));
const PredictiveInsights = lazy(() => import('../components/catalog-analytics/PredictiveInsights'));
const BusinessGlossaryManager = lazy(() => import('../components/catalog-analytics/BusinessGlossaryManager'));
const CatalogMetricsCenter = lazy(() => import('../components/catalog-analytics/CatalogMetricsCenter'));
const ImpactAnalysisEngine = lazy(() => import('../components/catalog-analytics/ImpactAnalysisEngine'));
const PopularityAnalyzer = lazy(() => import('../components/catalog-analytics/PopularityAnalyzer'));
const TrendAnalysisDashboard = lazy(() => import('../components/catalog-analytics/TrendAnalysisDashboard'));

// Search Discovery Components
const SearchPersonalization = lazy(() => import('../components/search-discovery/SearchPersonalization'));
const SearchRecommendations = lazy(() => import('../components/search-discovery/SearchRecommendations'));
const AdvancedFiltering = lazy(() => import('../components/search-discovery/AdvancedFiltering'));
const SavedSearches = lazy(() => import('../components/search-discovery/SavedSearches'));
const SearchAnalytics = lazy(() => import('../components/search-discovery/SearchAnalytics'));
const NaturalLanguageQuery = lazy(() => import('../components/search-discovery/NaturalLanguageQuery'));
const SearchResultsAnalyzer = lazy(() => import('../components/search-discovery/SearchResultsAnalyzer'));
const UnifiedSearchInterface = lazy(() => import('../components/search-discovery/UnifiedSearchInterface'));

// Data Lineage Components (Placeholder for future components)
// const AdvancedLineageViewer = lazy(() => import('../components/data-lineage/AdvancedLineageViewer'));
// const LineageImpactAnalysis = lazy(() => import('../components/data-lineage/LineageImpactAnalysis'));
// const CrossSystemLineage = lazy(() => import('../components/data-lineage/CrossSystemLineage'));

// Intelligent Discovery Components (Placeholder for future components)
// const AIAssetDiscovery = lazy(() => import('../components/intelligent-discovery/AIAssetDiscovery'));
// const SmartCatalogBuilder = lazy(() => import('../components/intelligent-discovery/SmartCatalogBuilder'));
// const AutoMetadataGeneration = lazy(() => import('../components/intelligent-discovery/AutoMetadataGeneration'));

// Quality Management Components (Placeholder for future components)
// const QualityRulesEngine = lazy(() => import('../components/quality-management/QualityRulesEngine'));
// const DataValidationSuite = lazy(() => import('../components/quality-management/DataValidationSuite'));
// const QualityMetricsDashboard = lazy(() => import('../components/quality-management/QualityMetricsDashboard'));

// Collaboration Components (Placeholder for future components)
// const CollaborativeWorkspace = lazy(() => import('../components/collaboration/CollaborativeWorkspace'));
// const AssetReviewWorkflow = lazy(() => import('../components/collaboration/AssetReviewWorkflow'));
// const CommunityInsights = lazy(() => import('../components/collaboration/CommunityInsights'));

// Catalog Intelligence Components (Placeholder for future components)
// const IntelligentRecommendations = lazy(() => import('../components/catalog-intelligence/IntelligentRecommendations'));
// const SemanticEnrichment = lazy(() => import('../components/catalog-intelligence/SemanticEnrichment'));
// const PredictiveAnalytics = lazy(() => import('../components/catalog-intelligence/PredictiveAnalytics'));

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface AdvancedCatalogSPAProps {
  userId?: string;
  organizationId?: string;
  theme?: 'light' | 'dark' | 'system';
  onNavigate?: (route: string, context?: any) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: CatalogState) => void;
}

interface CatalogState {
  currentRoute: string;
  activeComponent: string;
  breadcrumbs: BreadcrumbItem[];
  searchContext: SearchContext;
  userPreferences: UserPreferences;
  workflowState: WorkflowState;
  collaborationState: CollaborationState;
  systemHealth: SystemHealth;
  notifications: Notification[];
  recentActivity: ActivityItem[];
}

interface SearchContext {
  query: string;
  filters: SearchFilter[];
  results: IntelligentDataAsset[];
  totalResults: number;
  facets: SearchFacet[];
  suggestions: string[];
  isLoading: boolean;
  lastSearchTime: Date;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dashboardLayout: DashboardLayout;
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  accessibilitySettings: AccessibilitySettings;
}

interface DashboardLayout {
  layout: 'grid' | 'list' | 'masonry';
  columns: number;
  density: 'compact' | 'comfortable' | 'spacious';
  widgets: DashboardWidget[];
}

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
  isVisible: boolean;
  permissions: string[];
}

interface NotificationSettings {
  enablePush: boolean;
  enableEmail: boolean;
  enableInApp: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  categories: string[];
}

interface PrivacySettings {
  showActivity: boolean;
  allowAnalytics: boolean;
  shareUsageData: boolean;
  publicProfile: boolean;
}

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

interface WorkflowState {
  activeWorkflows: WorkflowInstance[];
  completedTasks: number;
  pendingTasks: number;
  workflowTemplates: WorkflowTemplate[];
  automationRules: AutomationRule[];
}

interface WorkflowInstance {
  id: string;
  templateId: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  config: Record<string, any>;
  dependencies: string[];
  outputs: Record<string, any>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStepTemplate[];
  triggers: WorkflowTrigger[];
  isPublic: boolean;
  usageCount: number;
}

interface WorkflowStepTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  config: Record<string, any>;
  inputs: WorkflowInput[];
  outputs: WorkflowOutput[];
}

interface WorkflowInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
}

interface WorkflowOutput {
  name: string;
  type: string;
  description: string;
}

interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'webhook';
  config: Record<string, any>;
  isEnabled: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  actions: AutomationAction[];
  isEnabled: boolean;
  executionCount: number;
  lastExecuted: Date;
}

interface AutomationAction {
  type: string;
  config: Record<string, any>;
  order: number;
}

interface CollaborationState {
  activeSessions: CollaborationSession[];
  sharedAssets: IntelligentDataAsset[];
  teamMembers: TeamMember[];
  discussions: Discussion[];
  announcements: Announcement[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  isOnline: boolean;
  lastSeen: Date;
  permissions: string[];
}

interface Discussion {
  id: string;
  title: string;
  assetId?: string;
  participants: string[];
  messages: DiscussionMessage[];
  tags: string[];
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DiscussionMessage {
  id: string;
  userId: string;
  content: string;
  attachments: Attachment[];
  reactions: Reaction[];
  createdAt: Date;
  isEdited: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: string[];
  isSticky: boolean;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  services: ServiceHealth[];
  alerts: SystemAlert[];
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
}

interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  service: string;
  timestamp: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: NotificationAction;
  isRead: boolean;
  isPersistent: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

interface NotificationAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}

interface ActivityItem {
  id: string;
  type: 'search' | 'view' | 'edit' | 'share' | 'collaborate' | 'workflow';
  description: string;
  assetId?: string;
  userId: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

interface SearchFacet {
  name: string;
  values: FacetValue[];
  type: 'checkbox' | 'radio' | 'range' | 'date';
}

interface FacetValue {
  value: string;
  count: number;
  isSelected: boolean;
}

interface ComponentRegistry {
  [key: string]: {
    component: React.ComponentType<any>;
    title: string;
    description: string;
    category: string;
    icon: React.ComponentType;
    permissions: string[];
    dependencies: string[];
    config: Record<string, any>;
  };
}

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType;
  route: string;
  component: string;
  children?: NavigationItem[];
  permissions: string[];
  badge?: string | number;
  isNew?: boolean;
  isDeprecated?: boolean;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const COMPONENT_REGISTRY: ComponentRegistry = {
  // Catalog Analytics
  'usage-analytics-dashboard': {
    component: UsageAnalyticsDashboard,
    title: 'Usage Analytics Dashboard',
    description: 'Comprehensive usage analytics and metrics visualization',
    category: 'Analytics',
    icon: BarChart3,
    permissions: ['analytics:read'],
    dependencies: ['catalog-analytics-service'],
    config: { refreshInterval: 30000 }
  },
  'data-profiler': {
    component: DataProfiler,
    title: 'Data Profiler',
    description: 'Advanced data profiling and quality assessment',
    category: 'Analytics',
    icon: Gauge,
    permissions: ['profiling:read'],
    dependencies: ['data-profiling-service'],
    config: { autoProfile: true }
  },
  'predictive-insights': {
    component: PredictiveInsights,
    title: 'Predictive Insights',
    description: 'AI-powered predictive analytics and machine learning insights',
    category: 'AI/ML',
    icon: Brain,
    permissions: ['insights:read'],
    dependencies: ['catalog-ai-service'],
    config: { enablePredictions: true }
  },
  'business-glossary-manager': {
    component: BusinessGlossaryManager,
    title: 'Business Glossary Manager',
    description: 'Manage business terms and definitions',
    category: 'Management',
    icon: BookOpen,
    permissions: ['glossary:read', 'glossary:write'],
    dependencies: ['enterprise-catalog-service'],
    config: {}
  },
  'catalog-metrics-center': {
    component: CatalogMetricsCenter,
    title: 'Catalog Metrics Center',
    description: 'Central hub for catalog metrics and KPIs',
    category: 'Analytics',
    icon: Target,
    permissions: ['metrics:read'],
    dependencies: ['catalog-analytics-service'],
    config: {}
  },
  'impact-analysis-engine': {
    component: ImpactAnalysisEngine,
    title: 'Impact Analysis Engine',
    description: 'Analyze impact of changes across the data ecosystem',
    category: 'Analysis',
    icon: Network,
    permissions: ['analysis:read'],
    dependencies: ['advanced-lineage-service'],
    config: {}
  },
  'popularity-analyzer': {
    component: PopularityAnalyzer,
    title: 'Popularity Analyzer',
    description: 'Analyze and track asset popularity and usage patterns',
    category: 'Analytics',
    icon: TrendingUp,
    permissions: ['analytics:read'],
    dependencies: ['catalog-analytics-service'],
    config: {}
  },
  'trend-analysis-dashboard': {
    component: TrendAnalysisDashboard,
    title: 'Trend Analysis Dashboard',
    description: 'Comprehensive trend analysis and forecasting',
    category: 'Analytics',
    icon: LineChart,
    permissions: ['trends:read'],
    dependencies: ['catalog-analytics-service'],
    config: {}
  },

  // Search Discovery
  'search-personalization': {
    component: SearchPersonalization,
    title: 'Search Personalization',
    description: 'AI-powered personalized search experiences',
    category: 'Search',
    icon: User,
    permissions: ['search:read'],
    dependencies: ['semantic-search-service'],
    config: { enablePersonalization: true }
  },
  'search-recommendations': {
    component: SearchRecommendations,
    title: 'Search Recommendations',
    description: 'Intelligent search suggestions and recommendations',
    category: 'Search',
    icon: Lightbulb,
    permissions: ['search:read'],
    dependencies: ['catalog-recommendation-service'],
    config: {}
  },
  'advanced-filtering': {
    component: AdvancedFiltering,
    title: 'Advanced Filtering',
    description: 'Powerful search filtering with complex logic',
    category: 'Search',
    icon: Filter,
    permissions: ['search:read'],
    dependencies: ['semantic-search-service'],
    config: {}
  },
  'saved-searches': {
    component: SavedSearches,
    title: 'Saved Searches',
    description: 'Manage and organize saved search queries',
    category: 'Search',
    icon: Bookmark,
    permissions: ['search:read', 'search:write'],
    dependencies: ['semantic-search-service'],
    config: {}
  },
  'search-analytics': {
    component: SearchAnalytics,
    title: 'Search Analytics',
    description: 'Search performance analytics and insights',
    category: 'Analytics',
    icon: Activity,
    permissions: ['analytics:read'],
    dependencies: ['catalog-analytics-service'],
    config: {}
  },
  'natural-language-query': {
    component: NaturalLanguageQuery,
    title: 'Natural Language Query',
    description: 'Query data using natural language',
    category: 'Search',
    icon: MessageSquare,
    permissions: ['search:read'],
    dependencies: ['catalog-ai-service'],
    config: {}
  },
  'search-results-analyzer': {
    component: SearchResultsAnalyzer,
    title: 'Search Results Analyzer',
    description: 'Analyze and optimize search results',
    category: 'Analysis',
    icon: Search,
    permissions: ['analysis:read'],
    dependencies: ['semantic-search-service'],
    config: {}
  },
  'unified-search-interface': {
    component: UnifiedSearchInterface,
    title: 'Unified Search Interface',
    description: 'Unified interface for all search capabilities',
    category: 'Search',
    icon: Search,
    permissions: ['search:read'],
    dependencies: ['semantic-search-service'],
    config: {}
  }
};

const NAVIGATION_STRUCTURE: NavigationItem[] = [
  {
    id: 'home',
    title: 'Home',
    icon: Layout,
    route: '/catalog',
    component: 'dashboard',
    permissions: ['catalog:read']
  },
  {
    id: 'search',
    title: 'Search & Discovery',
    icon: Search,
    route: '/catalog/search',
    component: 'unified-search-interface',
    permissions: ['search:read'],
    children: [
      {
        id: 'unified-search',
        title: 'Unified Search',
        icon: Search,
        route: '/catalog/search/unified',
        component: 'unified-search-interface',
        permissions: ['search:read']
      },
      {
        id: 'natural-language',
        title: 'Natural Language Query',
        icon: MessageSquare,
        route: '/catalog/search/natural-language',
        component: 'natural-language-query',
        permissions: ['search:read'],
        isNew: true
      },
      {
        id: 'advanced-filtering',
        title: 'Advanced Filtering',
        icon: Filter,
        route: '/catalog/search/filtering',
        component: 'advanced-filtering',
        permissions: ['search:read']
      },
      {
        id: 'saved-searches',
        title: 'Saved Searches',
        icon: Bookmark,
        route: '/catalog/search/saved',
        component: 'saved-searches',
        permissions: ['search:read']
      },
      {
        id: 'search-personalization',
        title: 'Personalization',
        icon: User,
        route: '/catalog/search/personalization',
        component: 'search-personalization',
        permissions: ['search:read']
      },
      {
        id: 'search-recommendations',
        title: 'Recommendations',
        icon: Lightbulb,
        route: '/catalog/search/recommendations',
        component: 'search-recommendations',
        permissions: ['search:read']
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    icon: BarChart3,
    route: '/catalog/analytics',
    component: 'usage-analytics-dashboard',
    permissions: ['analytics:read'],
    children: [
      {
        id: 'usage-analytics',
        title: 'Usage Analytics',
        icon: BarChart3,
        route: '/catalog/analytics/usage',
        component: 'usage-analytics-dashboard',
        permissions: ['analytics:read']
      },
      {
        id: 'predictive-insights',
        title: 'Predictive Insights',
        icon: Brain,
        route: '/catalog/analytics/predictive',
        component: 'predictive-insights',
        permissions: ['insights:read'],
        isNew: true
      },
      {
        id: 'trend-analysis',
        title: 'Trend Analysis',
        icon: TrendingUp,
        route: '/catalog/analytics/trends',
        component: 'trend-analysis-dashboard',
        permissions: ['trends:read']
      },
      {
        id: 'catalog-metrics',
        title: 'Catalog Metrics',
        icon: Target,
        route: '/catalog/analytics/metrics',
        component: 'catalog-metrics-center',
        permissions: ['metrics:read']
      },
      {
        id: 'popularity-analysis',
        title: 'Popularity Analysis',
        icon: Star,
        route: '/catalog/analytics/popularity',
        component: 'popularity-analyzer',
        permissions: ['analytics:read']
      },
      {
        id: 'search-analytics',
        title: 'Search Analytics',
        icon: Activity,
        route: '/catalog/analytics/search',
        component: 'search-analytics',
        permissions: ['analytics:read']
      }
    ]
  },
  {
    id: 'quality',
    title: 'Data Quality',
    icon: Gauge,
    route: '/catalog/quality',
    component: 'data-profiler',
    permissions: ['quality:read'],
    children: [
      {
        id: 'data-profiler',
        title: 'Data Profiler',
        icon: Gauge,
        route: '/catalog/quality/profiler',
        component: 'data-profiler',
        permissions: ['profiling:read']
      },
      {
        id: 'quality-rules',
        title: 'Quality Rules',
        icon: Shield,
        route: '/catalog/quality/rules',
        component: 'quality-rules-engine',
        permissions: ['quality:write']
      },
      {
        id: 'validation-suite',
        title: 'Validation Suite',
        icon: CheckCircle,
        route: '/catalog/quality/validation',
        component: 'data-validation-suite',
        permissions: ['quality:read']
      }
    ]
  },
  {
    id: 'lineage',
    title: 'Data Lineage',
    icon: Network,
    route: '/catalog/lineage',
    component: 'advanced-lineage-viewer',
    permissions: ['lineage:read'],
    children: [
      {
        id: 'lineage-viewer',
        title: 'Lineage Viewer',
        icon: Network,
        route: '/catalog/lineage/viewer',
        component: 'advanced-lineage-viewer',
        permissions: ['lineage:read']
      },
      {
        id: 'impact-analysis',
        title: 'Impact Analysis',
        icon: Target,
        route: '/catalog/lineage/impact',
        component: 'impact-analysis-engine',
        permissions: ['analysis:read']
      },
      {
        id: 'cross-system-lineage',
        title: 'Cross-System Lineage',
        icon: Globe,
        route: '/catalog/lineage/cross-system',
        component: 'cross-system-lineage',
        permissions: ['lineage:read']
      }
    ]
  },
  {
    id: 'discovery',
    title: 'Intelligent Discovery',
    icon: Brain,
    route: '/catalog/discovery',
    component: 'ai-asset-discovery',
    permissions: ['discovery:read'],
    isNew: true,
    children: [
      {
        id: 'ai-discovery',
        title: 'AI Asset Discovery',
        icon: Bot,
        route: '/catalog/discovery/ai',
        component: 'ai-asset-discovery',
        permissions: ['discovery:read'],
        isNew: true
      },
      {
        id: 'smart-catalog-builder',
        title: 'Smart Catalog Builder',
        icon: Zap,
        route: '/catalog/discovery/builder',
        component: 'smart-catalog-builder',
        permissions: ['discovery:write']
      },
      {
        id: 'auto-metadata',
        title: 'Auto Metadata Generation',
        icon: Sparkles,
        route: '/catalog/discovery/metadata',
        component: 'auto-metadata-generation',
        permissions: ['metadata:write']
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: Users,
    route: '/catalog/collaboration',
    component: 'collaborative-workspace',
    permissions: ['collaboration:read'],
    children: [
      {
        id: 'workspace',
        title: 'Workspace',
        icon: Users,
        route: '/catalog/collaboration/workspace',
        component: 'collaborative-workspace',
        permissions: ['collaboration:read']
      },
      {
        id: 'review-workflow',
        title: 'Review Workflow',
        icon: Workflow,
        route: '/catalog/collaboration/review',
        component: 'asset-review-workflow',
        permissions: ['review:read']
      },
      {
        id: 'community-insights',
        title: 'Community Insights',
        icon: MessageSquare,
        route: '/catalog/collaboration/insights',
        component: 'community-insights',
        permissions: ['collaboration:read']
      }
    ]
  },
  {
    id: 'intelligence',
    title: 'Catalog Intelligence',
    icon: Lightbulb,
    route: '/catalog/intelligence',
    component: 'intelligent-recommendations',
    permissions: ['intelligence:read'],
    isNew: true,
    children: [
      {
        id: 'recommendations',
        title: 'Intelligent Recommendations',
        icon: Lightbulb,
        route: '/catalog/intelligence/recommendations',
        component: 'intelligent-recommendations',
        permissions: ['intelligence:read']
      },
      {
        id: 'semantic-enrichment',
        title: 'Semantic Enrichment',
        icon: Tag,
        route: '/catalog/intelligence/semantic',
        component: 'semantic-enrichment',
        permissions: ['enrichment:read']
      },
      {
        id: 'predictive-analytics',
        title: 'Predictive Analytics',
        icon: TrendingUp,
        route: '/catalog/intelligence/predictive',
        component: 'predictive-analytics',
        permissions: ['prediction:read']
      }
    ]
  },
  {
    id: 'management',
    title: 'Management',
    icon: Settings,
    route: '/catalog/management',
    component: 'business-glossary-manager',
    permissions: ['management:read'],
    children: [
      {
        id: 'business-glossary',
        title: 'Business Glossary',
        icon: BookOpen,
        route: '/catalog/management/glossary',
        component: 'business-glossary-manager',
        permissions: ['glossary:read']
      },
      {
        id: 'data-governance',
        title: 'Data Governance',
        icon: Shield,
        route: '/catalog/management/governance',
        component: 'data-governance-center',
        permissions: ['governance:read']
      },
      {
        id: 'access-control',
        title: 'Access Control',
        icon: Lock,
        route: '/catalog/management/access',
        component: 'access-control-manager',
        permissions: ['access:admin']
      }
    ]
  }
];

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Something went wrong</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            An error occurred while loading this component. Please try again.
          </p>
          <details className="text-xs">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
          <Button onClick={resetErrorBoundary} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// LOADING COMPONENT
// ============================================================================

function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN SPA COMPONENT
// ============================================================================

const AdvancedCatalogSPA: React.FC<AdvancedCatalogSPAProps> = ({
  userId = 'current_user',
  organizationId = 'default_org',
  theme = 'system',
  onNavigate,
  onError,
  onStateChange
}) => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  // Core Hooks
  const analyticsHook = useCatalogAnalytics({
    userId,
    enableRealTimeUpdates: true
  });

  const discoveryHook = useCatalogDiscovery({
    userId,
    enableRealTimeUpdates: true
  });

  const lineageHook = useCatalogLineage({
    userId,
    enableRealTimeUpdates: true
  });

  const collaborationHook = useCatalogCollaboration({
    userId,
    enableRealTimeUpdates: true
  });

  const recommendationsHook = useCatalogRecommendations({
    userId,
    enableRealTimeUpdates: true
  });

  const profilingHook = useCatalogProfiling({
    userId,
    enableRealTimeUpdates: true
  });

  const aiHook = useCatalogAI({
    userId,
    enableRealTimeUpdates: true
  });

  // Main State
  const [catalogState, setCatalogState] = useState<CatalogState>({
    currentRoute: '/catalog',
    activeComponent: 'dashboard',
    breadcrumbs: [
      { title: 'Catalog', href: '/catalog' }
    ],
    searchContext: {
      query: '',
      filters: [],
      results: [],
      totalResults: 0,
      facets: [],
      suggestions: [],
      isLoading: false,
      lastSearchTime: new Date()
    },
    userPreferences: {
      theme: theme,
      language: 'en',
      timezone: 'UTC',
      dashboardLayout: {
        layout: 'grid',
        columns: 3,
        density: 'comfortable',
        widgets: []
      },
      notificationSettings: {
        enablePush: true,
        enableEmail: true,
        enableInApp: true,
        frequency: 'realtime',
        categories: ['system', 'collaboration', 'quality']
      },
      privacySettings: {
        showActivity: true,
        allowAnalytics: true,
        shareUsageData: false,
        publicProfile: false
      },
      accessibilitySettings: {
        highContrast: false,
        reducedMotion: false,
        fontSize: 'medium',
        screenReader: false,
        keyboardNavigation: true
      }
    },
    workflowState: {
      activeWorkflows: [],
      completedTasks: 0,
      pendingTasks: 0,
      workflowTemplates: [],
      automationRules: []
    },
    collaborationState: {
      activeSessions: [],
      sharedAssets: [],
      teamMembers: [],
      discussions: [],
      announcements: []
    },
    systemHealth: {
      status: 'healthy',
      uptime: 99.9,
      responseTime: 120,
      errorRate: 0.01,
      throughput: 1250,
      services: [],
      alerts: []
    },
    notifications: [],
    recentActivity: []
  });

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkflowPanelOpen, setIsWorkflowPanelOpen] = useState(false);
  const [isCollaborationPanelOpen, setIsCollaborationPanelOpen] = useState(false);

  // Component State
  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(new Set());
  const [errorComponents, setErrorComponents] = useState<Set<string>>(new Set());

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const activeNavigationItem = useMemo(() => {
    return findNavigationItemByRoute(NAVIGATION_STRUCTURE, catalogState.currentRoute);
  }, [catalogState.currentRoute]);

  const currentComponent = useMemo(() => {
    return COMPONENT_REGISTRY[catalogState.activeComponent];
  }, [catalogState.activeComponent]);

  const unreadNotificationsCount = useMemo(() => {
    return catalogState.notifications.filter(n => !n.isRead).length;
  }, [catalogState.notifications]);

  const systemHealthColor = useMemo(() => {
    switch (catalogState.systemHealth.status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'maintenance': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }, [catalogState.systemHealth.status]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function findNavigationItemByRoute(items: NavigationItem[], route: string): NavigationItem | null {
    for (const item of items) {
      if (item.route === route) return item;
      if (item.children) {
        const found = findNavigationItemByRoute(item.children, route);
        if (found) return found;
      }
    }
    return null;
  }

  function generateBreadcrumbs(route: string): BreadcrumbItem[] {
    const parts = route.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    for (const part of parts) {
      currentPath += `/${part}`;
      const item = findNavigationItemByRoute(NAVIGATION_STRUCTURE, currentPath);
      if (item) {
        breadcrumbs.push({
          title: item.title,
          href: currentPath
        });
      }
    }

    return breadcrumbs;
  }

  function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}`,
      createdAt: new Date()
    };

    setCatalogState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications]
    }));

    // Show toast for immediate notifications
    if (!notification.isPersistent) {
      toast[notification.type](notification.title, {
        description: notification.message,
        action: notification.action ? {
          label: notification.action.label,
          onClick: notification.action.action
        } : undefined
      });
    }

    // Auto-remove non-persistent notifications
    if (!notification.isPersistent && notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    if (!notification.isPersistent) {
      notificationTimeoutRef.current = setTimeout(() => {
        setCatalogState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== newNotification.id)
        }));
      }, 5000);
    }
  }

  function addActivityItem(activity: Omit<ActivityItem, 'id' | 'timestamp'>) {
    const newActivity: ActivityItem = {
      ...activity,
      id: `activity_${Date.now()}`,
      timestamp: new Date()
    };

    setCatalogState(prev => ({
      ...prev,
      recentActivity: [newActivity, ...prev.recentActivity.slice(0, 99)] // Keep last 100 items
    }));
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleNavigate = useCallback((route: string, component?: string, context?: any) => {
    const targetComponent = component || findNavigationItemByRoute(NAVIGATION_STRUCTURE, route)?.component || 'dashboard';
    
    setCatalogState(prev => ({
      ...prev,
      currentRoute: route,
      activeComponent: targetComponent,
      breadcrumbs: generateBreadcrumbs(route)
    }));

    addActivityItem({
      type: 'view',
      description: `Navigated to ${route}`,
      userId,
      metadata: { route, component: targetComponent, context }
    });

    onNavigate?.(route, context);
  }, [userId, onNavigate]);

  const handleSearch = useCallback(async (query: string, filters: SearchFilter[] = []) => {
    setCatalogState(prev => ({
      ...prev,
      searchContext: {
        ...prev.searchContext,
        query,
        filters,
        isLoading: true
      }
    }));

    try {
      const searchRequest: SearchRequest = {
        query,
        filters,
        facets: ['type', 'department', 'tags', 'qualityScore'],
        limit: 50,
        offset: 0
      };

      const response = await semanticSearchService.performSemanticSearch(searchRequest);

      setCatalogState(prev => ({
        ...prev,
        searchContext: {
          ...prev.searchContext,
          results: response.results,
          totalResults: response.total,
          facets: response.facets || [],
          suggestions: response.suggestions || [],
          isLoading: false,
          lastSearchTime: new Date()
        }
      }));

      addActivityItem({
        type: 'search',
        description: `Searched for "${query}"`,
        userId,
        metadata: { query, filters, resultCount: response.total }
      });

    } catch (error) {
      console.error('Search error:', error);
      onError?.(error as Error);
      
      setCatalogState(prev => ({
        ...prev,
        searchContext: {
          ...prev.searchContext,
          isLoading: false
        }
      }));

      addNotification({
        type: 'error',
        title: 'Search Error',
        message: 'Failed to perform search. Please try again.',
        isRead: false,
        isPersistent: false
      });
    }
  }, [userId, onError]);

  const handleComponentLoad = useCallback((componentId: string) => {
    setLoadingComponents(prev => new Set(prev).add(componentId));
  }, []);

  const handleComponentReady = useCallback((componentId: string) => {
    setLoadingComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentId);
      return newSet;
    });
    
    setErrorComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentId);
      return newSet;
    });
  }, []);

  const handleComponentError = useCallback((componentId: string, error: Error) => {
    setErrorComponents(prev => new Set(prev).add(componentId));
    setLoadingComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentId);
      return newSet;
    });

    console.error(`Component ${componentId} error:`, error);
    onError?.(error);

    addNotification({
      type: 'error',
      title: 'Component Error',
      message: `Failed to load ${componentId}. Please refresh and try again.`,
      isRead: false,
      isPersistent: true,
      action: {
        label: 'Retry',
        action: () => window.location.reload(),
        type: 'primary'
      }
    });
  }, [onError]);

  const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
    // Command palette (Cmd/Ctrl + K)
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      setIsCommandPaletteOpen(true);
    }

    // Search focus (Cmd/Ctrl + /)
    if ((event.metaKey || event.ctrlKey) && event.key === '/') {
      event.preventDefault();
      searchInputRef.current?.focus();
    }

    // Sidebar toggle (Cmd/Ctrl + B)
    if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
      event.preventDefault();
      setIsSidebarOpen(prev => !prev);
    }

    // Settings (Cmd/Ctrl + ,)
    if ((event.metaKey || event.ctrlKey) && event.key === ',') {
      event.preventDefault();
      setIsSettingsOpen(true);
    }
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  useEffect(() => {
    onStateChange?.(catalogState);
  }, [catalogState, onStateChange]);

  useEffect(() => {
    // Initialize system health monitoring
    const healthCheckInterval = setInterval(async () => {
      try {
        // Simulate health check
        const healthData = {
          status: 'healthy' as const,
          uptime: 99.9,
          responseTime: Math.random() * 200 + 50,
          errorRate: Math.random() * 0.1,
          throughput: Math.random() * 500 + 1000,
          services: [
            { name: 'Search Service', status: 'healthy' as const, responseTime: 120, errorRate: 0.01, lastCheck: new Date() },
            { name: 'Analytics Service', status: 'healthy' as const, responseTime: 95, errorRate: 0.005, lastCheck: new Date() },
            { name: 'Lineage Service', status: 'healthy' as const, responseTime: 180, errorRate: 0.02, lastCheck: new Date() }
          ],
          alerts: []
        };

        setCatalogState(prev => ({
          ...prev,
          systemHealth: healthData
        }));
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => (
    <SidebarMenuItem key={item.id}>
      <SidebarMenuButton
        onClick={() => handleNavigate(item.route, item.component)}
        isActive={catalogState.currentRoute === item.route}
        className={`w-full justify-start ${level > 0 ? 'pl-6' : ''}`}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.title}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto h-5 text-xs">
            {item.badge}
          </Badge>
        )}
        {item.isNew && (
          <Badge variant="default" className="ml-auto h-5 text-xs">
            New
          </Badge>
        )}
      </SidebarMenuButton>
      {item.children && (
        <SidebarMenuSub>
          {item.children.map(child => (
            <SidebarMenuSubItem key={child.id}>
              <SidebarMenuSubButton
                onClick={() => handleNavigate(child.route, child.component)}
                isActive={catalogState.currentRoute === child.route}
              >
                <child.icon className="h-4 w-4" />
                <span>{child.title}</span>
                {child.isNew && (
                  <Badge variant="default" className="ml-auto h-4 text-xs">
                    New
                  </Badge>
                )}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );

  const renderCurrentComponent = () => {
    const componentConfig = COMPONENT_REGISTRY[catalogState.activeComponent];
    
    if (!componentConfig) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span>Component Not Found</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                The requested component "{catalogState.activeComponent}" could not be found.
              </p>
              <Button 
                onClick={() => handleNavigate('/catalog', 'dashboard')} 
                className="w-full mt-4"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const Component = componentConfig.component;
    const isLoading = loadingComponents.has(catalogState.activeComponent);
    const hasError = errorComponents.has(catalogState.activeComponent);

    if (hasError) {
      return (
        <ErrorFallback 
          error={new Error(`Failed to load ${componentConfig.title}`)}
          resetErrorBoundary={() => {
            setErrorComponents(prev => {
              const newSet = new Set(prev);
              newSet.delete(catalogState.activeComponent);
              return newSet;
            });
          }}
        />
      );
    }

    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => handleComponentError(catalogState.activeComponent, error)}
        resetKeys={[catalogState.activeComponent]}
      >
        <Suspense fallback={<LoadingSpinner message={`Loading ${componentConfig.title}...`} />}>
          <div className="w-full h-full">
            <Component
              userId={userId}
              organizationId={organizationId}
              searchContext={catalogState.searchContext}
              onSearch={handleSearch}
              onNavigate={handleNavigate}
              onError={onError}
              analyticsData={analyticsHook.data}
              discoveryData={discoveryHook.data}
              lineageData={lineageHook.data}
              collaborationData={collaborationHook.data}
              recommendationsData={recommendationsHook.data}
              profilingData={profilingHook.data}
              aiData={aiHook.data}
              {...componentConfig.config}
            />
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Assets</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {analyticsHook.data?.totalAssets?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Search Queries</CardTitle>
            <Search className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {analyticsHook.data?.totalSearches?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-green-600 mt-1">
              +8% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Active Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {collaborationHook.data?.activeUsers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Data Quality</CardTitle>
            <Gauge className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {Math.round(profilingHook.data?.overallQualityScore || 0)}%
            </div>
            <Progress value={profilingHook.data?.overallQualityScore || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleNavigate('/catalog/search/unified', 'unified-search-interface')}
            >
              <Search className="h-6 w-6" />
              <span className="text-sm">Search Assets</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleNavigate('/catalog/analytics/usage', 'usage-analytics-dashboard')}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">View Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleNavigate('/catalog/quality/profiler', 'data-profiler')}
            >
              <Gauge className="h-6 w-6" />
              <span className="text-sm">Data Quality</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleNavigate('/catalog/lineage/viewer', 'advanced-lineage-viewer')}
            >
              <Network className="h-6 w-6" />
              <span className="text-sm">Data Lineage</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {catalogState.recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="flex-1">{activity.description}</span>
                  <span className="text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {catalogState.recentActivity.length === 0 && (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={isSidebarOpen}>
        <div className="min-h-screen flex w-full bg-gray-50">
          {/* Sidebar */}
          <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Database className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Advanced Catalog</h2>
                  <p className="text-xs text-gray-600">Data Governance Platform</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {NAVIGATION_STRUCTURE.map(item => renderNavigationItem(item))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>System Status</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Health</span>
                      <Badge variant={catalogState.systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                        {catalogState.systemHealth.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Response Time</span>
                      <span className="text-gray-600">
                        {Math.round(catalogState.systemHealth.responseTime)}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Uptime</span>
                      <span className="text-gray-600">
                        {catalogState.systemHealth.uptime.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
              <div className="px-3 py-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.png" />
                    <AvatarFallback>
                      {userId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userId}</p>
                    <p className="text-xs text-gray-600">Administrator</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <SidebarInset className="flex-1">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center px-4">
                <div className="flex items-center space-x-4 flex-1">
                  <SidebarTrigger />
                  
                  {/* Breadcrumbs */}
                  <Separator orientation="vertical" className="h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      {catalogState.breadcrumbs.map((item, index) => (
                        <React.Fragment key={index}>
                          <BreadcrumbItem>
                            {index === catalogState.breadcrumbs.length - 1 ? (
                              <BreadcrumbPage>{item.title}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink href={item.href}>
                                {item.title}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {index < catalogState.breadcrumbs.length - 1 && (
                            <BreadcrumbSeparator />
                          )}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-2">
                  {/* Global Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search assets..."
                      className="w-64 pl-10"
                      value={catalogState.searchContext.query}
                      onChange={(e) => {
                        setCatalogState(prev => ({
                          ...prev,
                          searchContext: {
                            ...prev.searchContext,
                            query: e.target.value
                          }
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(catalogState.searchContext.query);
                        }
                      }}
                    />
                  </div>

                  {/* Command Palette */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="hidden md:flex"
                  >
                    <CommandIcon className="h-4 w-4 mr-2" />
                    <span className="text-xs">⌘K</span>
                  </Button>

                  {/* Notifications */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNotificationsOpen(true)}
                    className="relative"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadNotificationsCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0">
                        {unreadNotificationsCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Workflow Panel */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWorkflowPanelOpen(true)}
                  >
                    <Workflow className="h-4 w-4" />
                  </Button>

                  {/* Collaboration Panel */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCollaborationPanelOpen(true)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-6">
                {catalogState.activeComponent === 'dashboard' ? 
                  renderDashboard() : 
                  renderCurrentComponent()
                }
              </div>
            </main>
          </SidebarInset>
        </div>

        {/* Command Palette */}
        <CommandDialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {NAVIGATION_STRUCTURE.map(item => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    handleNavigate(item.route, item.component);
                    setIsCommandPaletteOpen(false);
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => setIsSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Open Settings</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setIsSidebarOpen(prev => !prev)}>
                <SidebarIcon className="mr-2 h-4 w-4" />
                <span>Toggle Sidebar</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Notifications Panel */}
        <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                Stay updated with system alerts and activities
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-full mt-6">
              <div className="space-y-4">
                {catalogState.notifications.map((notification) => (
                  <Card key={notification.id} className={`${!notification.isRead ? 'border-blue-200 bg-blue-50' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{notification.title}</CardTitle>
                        <Badge variant={
                          notification.type === 'error' ? 'destructive' :
                          notification.type === 'warning' ? 'secondary' :
                          notification.type === 'success' ? 'default' :
                          'outline'
                        }>
                          {notification.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.createdAt.toLocaleString()}
                      </p>
                      {notification.action && (
                        <Button 
                          size="sm" 
                          className="mt-2"
                          variant={notification.action.type === 'primary' ? 'default' : 'outline'}
                          onClick={notification.action.action}
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {catalogState.notifications.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No notifications</p>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Configure your catalog preferences and system settings
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="general" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={catalogState.userPreferences.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={catalogState.userPreferences.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={catalogState.userPreferences.theme}>
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
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select value={catalogState.userPreferences.accessibilitySettings.fontSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xlarge">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="high-contrast"
                    checked={catalogState.userPreferences.accessibilitySettings.highContrast}
                  />
                  <Label htmlFor="high-contrast">High Contrast</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="reduced-motion"
                    checked={catalogState.userPreferences.accessibilitySettings.reducedMotion}
                  />
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="push-notifications"
                    checked={catalogState.userPreferences.notificationSettings.enablePush}
                  />
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="email-notifications"
                    checked={catalogState.userPreferences.notificationSettings.enableEmail}
                  />
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={catalogState.userPreferences.notificationSettings.frequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="show-activity"
                    checked={catalogState.userPreferences.privacySettings.showActivity}
                  />
                  <Label htmlFor="show-activity">Show Activity Status</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="allow-analytics"
                    checked={catalogState.userPreferences.privacySettings.allowAnalytics}
                  />
                  <Label htmlFor="allow-analytics">Allow Analytics Collection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="share-usage-data"
                    checked={catalogState.userPreferences.privacySettings.shareUsageData}
                  />
                  <Label htmlFor="share-usage-data">Share Usage Data</Label>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsSettingsOpen(false)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AdvancedCatalogSPA;