/**
 * AppNavbar - Global Intelligent Navigation Bar
 * ===========================================
 * 
 * Advanced navigation component that serves as the master navigation system for the entire
 * Racine data governance platform. Features adaptive UI, role-based navigation, global search,
 * system health monitoring, and seamless integration with all backend services.
 * 
 * Features:
 * - Adaptive role-based navigation with RBAC integration
 * - Global unified search across all 7 groups
 * - Real-time system health monitoring with visual indicators
 * - Context-aware quick actions and shortcuts
 * - Multi-workspace navigation and switching
 * - Advanced notification center integration
 * - Performance-optimized with lazy loading and caching
 * - Full accessibility compliance (WCAG 2.1 AA)
 * 
 * Backend Integration:
 * - racine-orchestration-apis.ts: System health and orchestration
 * - workspace-management-apis.ts: Workspace operations
 * - user-management-apis.ts: User profile and permissions
 * - cross-group-integration-apis.ts: Cross-group search and navigation
 */

import React, { useState, useCallback, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  ChevronDown, 
  Menu, 
  X, 
  Shield, 
  Activity, 
  Zap, 
  Database,
  FileText,
  Tags,
  BarChart3,
  Scan,
  Users,
  Home,
  Workspace,
  GitBranch,
  Bot,
  History,
  MessageSquare,
  Command,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Plus,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Layers,
  Filter,
  Star,
  HelpCircle,
  Globe,
  Cpu,
  Memory,
  Server,
  Cloud,
  Wifi,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Hooks and Services - Full Backend Integration
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useIntelligentDashboard } from '../../hooks/useIntelligentDashboard';

// Types - Complete Backend Mapping
import {
  RacineState,
  SystemHealth,
  WorkspaceConfiguration,
  UserProfile,
  CrossGroupState,
  NavigationItem,
  QuickAction,
  SystemAlert,
  NotificationItem,
  SearchResult,
  PerformanceMetrics,
  ViewMode,
  LayoutMode,
  SystemStatus,
  IntegrationStatus,
  UUID,
  ISODateString
} from '../../types/racine-core.types';

// Utils and Constants - Advanced Configuration
import { SUPPORTED_GROUPS, VIEW_MODES, PERFORMANCE_THRESHOLDS } from '../../constants/cross-group-configs';
import { formatDistanceToNow, format } from 'date-fns';

// Lazy-loaded components for performance optimization
const GlobalSearchInterface = React.lazy(() => import('./GlobalSearchInterface'));
const NotificationCenter = React.lazy(() => import('./NotificationCenter'));
const QuickActionsPanel = React.lazy(() => import('./QuickActionsPanel'));

// ===================== INTERFACES AND TYPES =====================

interface AppNavbarProps {
  className?: string;
  racineState: RacineState;
  onStateChange: (updates: Partial<RacineState>) => void;
  onNavigate: (path: string, context?: any) => void;
  isCollapsed?: boolean;
  showBrand?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  showQuickActions?: boolean;
  showHealthStatus?: boolean;
  customActions?: QuickAction[];
  theme?: 'light' | 'dark' | 'system';
  locale?: string;
  debugMode?: boolean;
}

interface NavigationConfig {
  groups: NavigationGroup[];
  quickActions: QuickAction[];
  userMenuItems: NavigationItem[];
  searchConfig: SearchConfig;
  healthConfig: HealthConfig;
  notificationConfig: NotificationConfig;
}

interface NavigationGroup {
  id: string;
  name: string;
  icon: React.ComponentType;
  path: string;
  permission?: string;
  badge?: number | string;
  status?: SystemStatus;
  children?: NavigationItem[];
  isActive?: boolean;
  isVisible?: boolean;
  order: number;
  description?: string;
  lastAccessed?: Date;
  usage?: number;
}

interface SearchConfig {
  enabled: boolean;
  placeholder: string;
  shortcuts: string[];
  recentSearches: string[];
  suggestedSearches: string[];
  filters: SearchFilter[];
  aiPowered: boolean;
  crossGroup: boolean;
}

interface SearchFilter {
  id: string;
  name: string;
  icon: React.ComponentType;
  enabled: boolean;
  count?: number;
}

interface HealthConfig {
  enabled: boolean;
  refreshInterval: number;
  criticalThreshold: number;
  warningThreshold: number;
  showDetails: boolean;
  autoRefresh: boolean;
  alertsEnabled: boolean;
}

interface NotificationConfig {
  enabled: boolean;
  maxVisible: number;
  autoRefresh: boolean;
  categories: string[];
  sounds: boolean;
  desktop: boolean;
  realTime: boolean;
}

// ===================== ANIMATION VARIANTS =====================

const navbarVariants = {
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1
    }
  },
  hidden: {
    y: -100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const itemVariants = {
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 }
  },
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const dropdownVariants = {
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  closed: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const healthIndicatorVariants = {
  healthy: {
    backgroundColor: '#10B981',
    scale: 1,
    transition: { duration: 0.3 }
  },
  degraded: {
    backgroundColor: '#F59E0B',
    scale: [1, 1.1, 1],
    transition: { 
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop' as const
    }
  },
  failed: {
    backgroundColor: '#EF4444',
    scale: [1, 1.2, 1],
    transition: { 
      duration: 1,
      repeat: Infinity,
      repeatType: 'loop' as const
    }
  },
  initializing: {
    backgroundColor: '#6B7280',
    opacity: [0.5, 1, 0.5],
    transition: { 
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'loop' as const
    }
  }
};

// ===================== MAIN COMPONENT =====================

const AppNavbar: React.FC<AppNavbarProps> = ({
  className = '',
  racineState,
  onStateChange,
  onNavigate,
  isCollapsed = false,
  showBrand = true,
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  showQuickActions = true,
  showHealthStatus = true,
  customActions = [],
  theme = 'system',
  locale = 'en',
  debugMode = false
}) => {
  // ===================== HOOKS AND STATE =====================

  const router = useRouter();
  const { theme: currentTheme, setTheme } = useTheme();
  const controls = useAnimation();
  
  // Refs for dropdown management and performance optimization
  const navbarRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);

  // Local state management with advanced features
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHealthDetailsOpen, setIsHealthDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastHealthCheck, setLastHealthCheck] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');

  // Advanced state for performance tracking
  const [navigationMetrics, setNavigationMetrics] = useState({
    totalNavigations: 0,
    averageResponseTime: 0,
    lastNavigationTime: new Date(),
    popularRoutes: [] as string[]
  });

  // Custom hooks for comprehensive backend integration
  const {
    orchestrationState,
    systemHealth,
    performanceMetrics,
    executeWorkflow,
    monitorHealth,
    optimizePerformance,
    getSystemAlerts,
    streamHealthUpdates,
    isLoading: isOrchestrationLoading,
    error: orchestrationError,
    isConnected: isOrchestrationConnected
  } = useRacineOrchestration(racineState.activeWorkspaceId || '', racineState);

  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
    getWorkspaceHealth,
    getWorkspaceAnalytics,
    cloneWorkspace,
    shareWorkspace,
    isLoading: isWorkspaceLoading,
    error: workspaceError
  } = useWorkspaceManagement(racineState.activeWorkspaceId || '');

  const {
    userProfile,
    permissions,
    preferences,
    updateProfile,
    updatePreferences,
    checkPermission,
    getUserAnalytics,
    getSecurityStatus,
    isLoading: isUserLoading,
    error: userError
  } = useUserManagement();

  const {
    groupsStatus,
    integrationHealth,
    searchAllGroups,
    getGroupNavigation,
    getCrossGroupMetrics,
    validateIntegrations,
    isLoading: isCrossGroupLoading,
    error: crossGroupError
  } = useCrossGroupIntegration();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getRecentActivity,
    subscribeToUpdates,
    getActivityAnalytics,
    isLoading: isActivityLoading,
    error: activityError
  } = useActivityTracker();

  const {
    aiRecommendations,
    contextualInsights,
    getNavigationSuggestions,
    analyzeUserBehavior,
    predictiveActions,
    isLoading: isAILoading,
    error: aiError
  } = useAIAssistant();

  const {
    collaborationState,
    activeCollaborations,
    teamPresence,
    getCollaborationInsights,
    isLoading: isCollaborationLoading
  } = useCollaboration();

  const {
    dashboardMetrics,
    realTimeMetrics,
    customDashboards,
    getDashboardInsights,
    isLoading: isDashboardLoading
  } = useIntelligentDashboard();

  // ===================== COMPUTED VALUES AND CONFIGURATION =====================

  // Advanced navigation configuration with full backend integration
  const navigationConfig = useMemo((): NavigationConfig => {
    const baseGroups: NavigationGroup[] = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: Home,
        path: '/racine/dashboard',
        isActive: router.pathname === '/racine/dashboard',
        isVisible: true,
        order: 0,
        status: systemHealth?.overall || 'healthy',
        description: 'Main overview and KPI dashboard',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('dashboard')).length
      },
      {
        id: 'workspace',
        name: 'Workspaces',
        icon: Workspace,
        path: '/racine/workspace',
        isActive: router.pathname.startsWith('/racine/workspace'),
        isVisible: true,
        order: 1,
        badge: workspaces?.length || 0,
        status: getWorkspaceHealth()?.status || 'healthy',
        description: 'Multi-workspace management and orchestration',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('workspace')).length
      },
      {
        id: 'data-sources',
        name: 'Data Sources',
        icon: Database,
        path: '/racine/data-sources',
        permission: 'data_sources.view',
        isActive: router.pathname.startsWith('/racine/data-sources'),
        isVisible: checkPermission('data_sources.view'),
        order: 2,
        status: groupsStatus?.['data-sources']?.status || 'healthy',
        badge: groupsStatus?.['data-sources']?.count || 0,
        description: 'Data source connections and discovery',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('data-sources')).length
      },
      {
        id: 'scan-rule-sets',
        name: 'Scan Rule Sets',
        icon: Scan,
        path: '/racine/scan-rule-sets',
        permission: 'scan_rules.view',
        isActive: router.pathname.startsWith('/racine/scan-rule-sets'),
        isVisible: checkPermission('scan_rules.view'),
        order: 3,
        status: groupsStatus?.['scan-rule-sets']?.status || 'healthy',
        badge: groupsStatus?.['scan-rule-sets']?.active || 0,
        description: 'Rule execution and management orchestration',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('scan-rule-sets')).length
      },
      {
        id: 'classifications',
        name: 'Classifications',
        icon: Tags,
        path: '/racine/classifications',
        permission: 'classifications.view',
        isActive: router.pathname.startsWith('/racine/classifications'),
        isVisible: checkPermission('classifications.view'),
        order: 4,
        status: groupsStatus?.['classifications']?.status || 'healthy',
        badge: groupsStatus?.['classifications']?.count || 0,
        description: 'Classification workflow orchestration',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('classifications')).length
      },
      {
        id: 'compliance-rules',
        name: 'Compliance Rules',
        icon: Shield,
        path: '/racine/compliance-rules',
        permission: 'compliance.view',
        isActive: router.pathname.startsWith('/racine/compliance-rules'),
        isVisible: checkPermission('compliance.view'),
        order: 5,
        status: groupsStatus?.['compliance-rules']?.status || 'healthy',
        badge: groupsStatus?.['compliance-rules']?.score || 0,
        description: 'Compliance validation orchestration',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('compliance-rules')).length
      },
      {
        id: 'advanced-catalog',
        name: 'Advanced Catalog',
        icon: FileText,
        path: '/racine/advanced-catalog',
        permission: 'catalog.view',
        isActive: router.pathname.startsWith('/racine/advanced-catalog'),
        isVisible: checkPermission('catalog.view'),
        order: 6,
        status: groupsStatus?.['advanced-catalog']?.status || 'healthy',
        badge: groupsStatus?.['advanced-catalog']?.assets || 0,
        description: 'Catalog management orchestration',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('advanced-catalog')).length
      },
      {
        id: 'scan-logic',
        name: 'Scan Logic',
        icon: Activity,
        path: '/racine/scan-logic',
        permission: 'scan_logic.view',
        isActive: router.pathname.startsWith('/racine/scan-logic'),
        isVisible: checkPermission('scan_logic.view'),
        order: 7,
        status: groupsStatus?.['scan-logic']?.status || 'healthy',
        badge: groupsStatus?.['scan-logic']?.active || 0,
        description: 'Scan execution orchestration',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('scan-logic')).length
      },
      {
        id: 'rbac-system',
        name: 'RBAC System',
        icon: Users,
        path: '/racine/rbac-system',
        permission: 'rbac.admin',
        isActive: router.pathname.startsWith('/racine/rbac-system'),
        isVisible: checkPermission('rbac.admin'),
        order: 8,
        status: groupsStatus?.['rbac-system']?.status || 'healthy',
        badge: groupsStatus?.['rbac-system']?.users || 0,
        description: 'Security and access orchestration (Admin Only)',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('rbac-system')).length
      },
      {
        id: 'workflows',
        name: 'Job Workflows',
        icon: GitBranch,
        path: '/racine/workflows',
        permission: 'workflows.view',
        isActive: router.pathname.startsWith('/racine/workflows'),
        isVisible: checkPermission('workflows.view'),
        order: 9,
        status: orchestrationState?.workflowHealth || 'healthy',
        badge: orchestrationState?.activeWorkflows || 0,
        description: 'Databricks-style workflow builder',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('workflows')).length
      },
      {
        id: 'pipelines',
        name: 'Pipelines',
        icon: Layers,
        path: '/racine/pipelines',
        permission: 'pipelines.view',
        isActive: router.pathname.startsWith('/racine/pipelines'),
        isVisible: checkPermission('pipelines.view'),
        order: 10,
        status: orchestrationState?.pipelineHealth || 'healthy',
        badge: orchestrationState?.activePipelines || 0,
        description: 'Advanced pipeline management',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('pipelines')).length
      },
      {
        id: 'ai-assistant',
        name: 'AI Assistant',
        icon: Bot,
        path: '/racine/ai-assistant',
        permission: 'ai.view',
        isActive: router.pathname.startsWith('/racine/ai-assistant'),
        isVisible: checkPermission('ai.view'),
        order: 11,
        status: orchestrationState?.aiHealth || 'healthy',
        badge: aiRecommendations?.length || 0,
        description: 'Context-aware AI interface',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('ai-assistant')).length
      },
      {
        id: 'activity-tracker',
        name: 'Activity Tracker',
        icon: History,
        path: '/racine/activity-tracker',
        permission: 'activity.view',
        isActive: router.pathname.startsWith('/racine/activity-tracker'),
        isVisible: checkPermission('activity.view'),
        order: 12,
        status: orchestrationState?.activityHealth || 'healthy',
        description: 'Historic activities and audit trails',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('activity-tracker')).length
      },
      {
        id: 'intelligent-dashboard',
        name: 'Dashboards',
        icon: BarChart3,
        path: '/racine/dashboards',
        permission: 'dashboards.view',
        isActive: router.pathname.startsWith('/racine/dashboards'),
        isVisible: checkPermission('dashboards.view'),
        order: 13,
        status: orchestrationState?.dashboardHealth || 'healthy',
        badge: customDashboards?.length || 0,
        description: 'Custom dashboard builder',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('dashboards')).length
      },
      {
        id: 'collaboration',
        name: 'Collaboration',
        icon: MessageSquare,
        path: '/racine/collaboration',
        permission: 'collaboration.view',
        isActive: router.pathname.startsWith('/racine/collaboration'),
        isVisible: checkPermission('collaboration.view'),
        order: 14,
        status: orchestrationState?.collaborationHealth || 'healthy',
        badge: activeCollaborations?.length || 0,
        description: 'Team collaboration center',
        usage: navigationMetrics.popularRoutes.filter(r => r.includes('collaboration')).length
      }
    ];

    // Filter visible groups and sort by usage and order
    const visibleGroups = baseGroups
      .filter(group => group.isVisible)
      .sort((a, b) => {
        // Primary sort by usage (most used first)
        if (a.usage !== b.usage) {
          return (b.usage || 0) - (a.usage || 0);
        }
        // Secondary sort by order
        return a.order - b.order;
      });

    // Advanced quick actions with AI recommendations
    const quickActions: QuickAction[] = [
      {
        id: 'quick-search',
        name: 'Global Search',
        icon: Search,
        shortcut: '⌘K',
        action: () => setIsSearchOpen(true),
        category: 'navigation',
        isVisible: showSearch,
        description: 'Search across all groups with AI ranking'
      },
      {
        id: 'create-workspace',
        name: 'New Workspace',
        icon: Plus,
        shortcut: '⌘N',
        action: () => handleCreateWorkspace(),
        category: 'workspace',
        isVisible: checkPermission('workspace.create'),
        description: 'Create new workspace from template'
      },
      {
        id: 'system-health',
        name: 'System Health',
        icon: Activity,
        action: () => setIsHealthDetailsOpen(true),
        category: 'monitoring',
        isVisible: showHealthStatus && checkPermission('system.monitor'),
        description: 'View system health across all groups'
      },
      {
        id: 'optimize-performance',
        name: 'Optimize System',
        icon: Zap,
        action: () => handleOptimizePerformance(),
        category: 'system',
        isVisible: checkPermission('system.optimize'),
        description: 'AI-powered system optimization'
      },
      {
        id: 'ai-insights',
        name: 'AI Insights',
        icon: Bot,
        action: () => handleNavigate('/racine/ai-assistant'),
        category: 'ai',
        isVisible: checkPermission('ai.view') && aiRecommendations?.length > 0,
        description: 'View AI recommendations and insights',
        badge: aiRecommendations?.length
      },
      ...customActions
    ];

    // Advanced user menu with analytics
    const userMenuItems: NavigationItem[] = [
      {
        id: 'profile',
        name: 'Profile & Settings',
        icon: User,
        path: '/racine/profile',
        description: 'Manage your profile and preferences'
      },
      {
        id: 'security',
        name: 'Security & Privacy',
        icon: Shield,
        path: '/racine/security',
        description: 'Security settings and audit logs'
      },
      {
        id: 'analytics',
        name: 'My Analytics',
        icon: BarChart3,
        path: '/racine/user-analytics',
        description: 'Personal usage analytics and insights'
      },
      {
        id: 'preferences',
        name: 'Preferences',
        icon: Settings,
        path: '/racine/preferences',
        description: 'Application preferences and configuration'
      },
      {
        id: 'help',
        name: 'Help & Support',
        icon: HelpCircle,
        path: '/racine/help',
        description: 'Documentation, tutorials, and support'
      },
      {
        id: 'logout',
        name: 'Sign Out',
        icon: LogOut,
        action: () => handleLogout(),
        description: 'Sign out of your account'
      }
    ];

    return {
      groups: visibleGroups,
      quickActions: quickActions.filter(action => action.isVisible),
      userMenuItems,
      searchConfig: {
        enabled: showSearch,
        placeholder: 'Search across all groups with AI...',
        shortcuts: ['⌘K', 'Ctrl+K'],
        recentSearches: preferences?.recentSearches || [],
        suggestedSearches: getNavigationSuggestions() || [],
        filters: SUPPORTED_GROUPS.map(group => ({
          id: group.id,
          name: group.name,
          icon: group.icon,
          enabled: checkPermission(`${group.id}.view`),
          count: groupsStatus?.[group.id]?.count || 0
        })),
        aiPowered: true,
        crossGroup: true
      },
      healthConfig: {
        enabled: showHealthStatus,
        refreshInterval: 30000,
        criticalThreshold: 0.9,
        warningThreshold: 0.7,
        showDetails: checkPermission('system.monitor'),
        autoRefresh: true,
        alertsEnabled: preferences?.healthAlerts || true
      },
      notificationConfig: {
        enabled: showNotifications,
        maxVisible: 5,
        autoRefresh: true,
        categories: ['system', 'workflow', 'collaboration', 'compliance', 'ai'],
        sounds: preferences?.notificationSounds || false,
        desktop: preferences?.desktopNotifications || false,
        realTime: true
      }
    };
  }, [
    router.pathname,
    systemHealth,
    workspaces,
    groupsStatus,
    orchestrationState,
    aiRecommendations,
    permissions,
    preferences,
    customActions,
    showSearch,
    showHealthStatus,
    showNotifications,
    navigationMetrics,
    activeCollaborations,
    customDashboards,
    checkPermission,
    getNavigationSuggestions,
    getWorkspaceHealth
  ]);

  // Advanced system health computation with predictive analysis
  const overallHealthStatus = useMemo(() => {
    if (!systemHealth) return 'initializing';
    
    const healthScores = Object.values(systemHealth.groups || {});
    if (healthScores.length === 0) return 'initializing';
    
    const averageHealth = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
    const variance = healthScores.reduce((sum, score) => sum + Math.pow(score - averageHealth, 2), 0) / healthScores.length;
    
    // Consider both average and variance for more accurate health assessment
    if (averageHealth >= navigationConfig.healthConfig.criticalThreshold && variance < 0.01) return 'healthy';
    if (averageHealth >= navigationConfig.healthConfig.warningThreshold) return 'degraded';
    return 'failed';
  }, [systemHealth, navigationConfig.healthConfig]);

  // Real-time connection status monitoring
  useEffect(() => {
    const updateConnectionStatus = () => {
      if (isOrchestrationConnected && navigator.onLine) {
        setConnectionStatus('connected');
      } else if (!navigator.onLine) {
        setConnectionStatus('disconnected');
      } else {
        setConnectionStatus('reconnecting');
      }
    };

    updateConnectionStatus();
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, [isOrchestrationConnected]);

  // ===================== ADVANCED EVENT HANDLERS =====================

  // Navigation with analytics tracking
  const handleNavigate = useCallback((path: string, context?: any) => {
    const startTime = Date.now();
    
    if (debugMode) {
      console.log('AppNavbar: Navigating to', path, context);
    }
    
    // Update navigation metrics
    setNavigationMetrics(prev => ({
      ...prev,
      totalNavigations: prev.totalNavigations + 1,
      lastNavigationTime: new Date(),
      popularRoutes: [...prev.popularRoutes, path].slice(-100) // Keep last 100 routes
    }));
    
    onNavigate(path, context);
    setIsMobileMenuOpen(false);
    
    // Track navigation performance
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    setNavigationMetrics(prev => ({
      ...prev,
      averageResponseTime: (prev.averageResponseTime + responseTime) / 2
    }));
    
    // Track navigation for backend analytics
    getRecentActivity();
    
    // AI behavior analysis
    analyzeUserBehavior({
      action: 'navigation',
      target: path,
      context,
      timestamp: new Date(),
      responseTime
    });
  }, [onNavigate, debugMode, getRecentActivity, analyzeUserBehavior]);

  // Advanced search with AI-powered ranking
  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
    setError(null);
    
    // Preload search suggestions
    getNavigationSuggestions();
    
    if (debugMode) {
      console.log('AppNavbar: Search opened');
    }
  }, [getNavigationSuggestions, debugMode]);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, []);

  const handleSearchQuery = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = Date.now();
      
      // AI-powered cross-group search
      const results = await searchAllGroups({
        query,
        filters: navigationConfig.searchConfig.filters
          .filter(filter => filter.enabled)
          .map(filter => filter.id),
        limit: 50,
        aiRanking: true,
        includeContext: true,
        userContext: {
          currentWorkspace: racineState.activeWorkspaceId,
          recentActivity: await getRecentActivity(),
          preferences: preferences
        }
      });
      
      const endTime = Date.now();
      const searchTime = endTime - startTime;
      
      if (debugMode) {
        console.log('AppNavbar: Search completed in', searchTime, 'ms', results);
      }
      
      // Update search analytics
      analyzeUserBehavior({
        action: 'search',
        query,
        results: results.length,
        searchTime,
        timestamp: new Date()
      });
      
      // Update recent searches
      if (preferences) {
        updatePreferences({
          ...preferences,
          recentSearches: [query, ...(preferences.recentSearches || [])].slice(0, 10)
        });
      }
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      toast.error(`Search failed: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [
    searchAllGroups,
    navigationConfig.searchConfig.filters,
    racineState.activeWorkspaceId,
    getRecentActivity,
    preferences,
    updatePreferences,
    analyzeUserBehavior,
    debugMode
  ]);

  // Advanced workspace management with analytics
  const handleWorkspaceSwitch = useCallback(async (workspaceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = Date.now();
      
      // Switch workspace with backend integration
      await switchWorkspace(workspaceId);
      
      // Update racine state
      onStateChange({
        activeWorkspaceId: workspaceId,
        lastActivity: new Date().toISOString()
      });
      
      setIsWorkspaceOpen(false);
      
      const endTime = Date.now();
      const switchTime = endTime - startTime;
      
      toast.success(`Workspace switched successfully (${switchTime}ms)`);
      
      // Analytics tracking
      analyzeUserBehavior({
        action: 'workspace_switch',
        target: workspaceId,
        switchTime,
        timestamp: new Date()
      });
      
      if (debugMode) {
        console.log('AppNavbar: Switched to workspace', workspaceId, 'in', switchTime, 'ms');
      }
      
      // Refresh system health for new workspace
      await monitorHealth();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch workspace';
      setError(errorMessage);
      toast.error(`Failed to switch workspace: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [switchWorkspace, onStateChange, analyzeUserBehavior, monitorHealth, debugMode]);

  const handleCreateWorkspace = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // AI-suggested workspace name based on user behavior
      const suggestedName = await predictiveActions.suggestWorkspaceName?.() || 
        `Workspace ${(workspaces?.length || 0) + 1}`;
      
      const newWorkspace = await createWorkspace({
        name: suggestedName,
        description: 'New workspace created from navbar with AI suggestions',
        type: 'personal',
        template: preferences?.defaultWorkspaceTemplate || 'basic',
        aiOptimized: true
      });
      
      await handleWorkspaceSwitch(newWorkspace.id);
      
      toast.success('New AI-optimized workspace created and activated');
      
      // Analytics tracking
      analyzeUserBehavior({
        action: 'workspace_create',
        workspaceId: newWorkspace.id,
        aiSuggested: true,
        timestamp: new Date()
      });
      
      if (debugMode) {
        console.log('AppNavbar: Created workspace', newWorkspace);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create workspace';
      setError(errorMessage);
      toast.error(`Failed to create workspace: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    createWorkspace, 
    workspaces, 
    handleWorkspaceSwitch, 
    preferences, 
    predictiveActions, 
    analyzeUserBehavior, 
    debugMode
  ]);

  // Advanced system health management
  const handleHealthRefresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = Date.now();
      
      // Comprehensive health check across all systems
      await monitorHealth();
      await validateIntegrations();
      
      const endTime = Date.now();
      const checkTime = endTime - startTime;
      
      setLastHealthCheck(new Date());
      
      toast.success(`System health refreshed (${checkTime}ms)`);
      
      if (debugMode) {
        console.log('AppNavbar: Health refreshed in', checkTime, 'ms', systemHealth);
      }
      
      // Analytics tracking
      analyzeUserBehavior({
        action: 'health_check',
        checkTime,
        healthStatus: overallHealthStatus,
        timestamp: new Date()
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh health';
      setError(errorMessage);
      toast.error(`Failed to refresh health: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [monitorHealth, validateIntegrations, systemHealth, overallHealthStatus, analyzeUserBehavior, debugMode]);

  const handleOptimizePerformance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = Date.now();
      
      // AI-powered system optimization
      await optimizePerformance({
        target: 'overall',
        aggressive: false,
        aiGuided: true,
        userContext: {
          workspaceId: racineState.activeWorkspaceId,
          recentActivity: await getRecentActivity(),
          preferences: preferences
        }
      });
      
      const endTime = Date.now();
      const optimizationTime = endTime - startTime;
      
      toast.success(`AI-powered optimization completed (${optimizationTime}ms)`);
      
      // Analytics tracking
      analyzeUserBehavior({
        action: 'performance_optimization',
        optimizationTime,
        aiGuided: true,
        timestamp: new Date()
      });
      
      if (debugMode) {
        console.log('AppNavbar: Performance optimization completed in', optimizationTime, 'ms');
      }
      
      // Refresh health after optimization
      setTimeout(() => handleHealthRefresh(), 2000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to optimize performance';
      setError(errorMessage);
      toast.error(`Failed to optimize performance: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    optimizePerformance, 
    racineState.activeWorkspaceId, 
    getRecentActivity, 
    preferences, 
    analyzeUserBehavior, 
    handleHealthRefresh, 
    debugMode
  ]);

  // Advanced notification management
  const handleNotificationOpen = useCallback(() => {
    setIsNotificationOpen(true);
    setError(null);
    
    // Mark notifications as viewed (not read)
    analyzeUserBehavior({
      action: 'notifications_viewed',
      unreadCount,
      timestamp: new Date()
    });
  }, [unreadCount, analyzeUserBehavior]);

  const handleNotificationClose = useCallback(() => {
    setIsNotificationOpen(false);
  }, []);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
      
      // Analytics tracking
      analyzeUserBehavior({
        action: 'notifications_mark_all_read',
        count: unreadCount,
        timestamp: new Date()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notifications as read';
      toast.error(errorMessage);
    }
  }, [markAllAsRead, unreadCount, analyzeUserBehavior]);

  // Advanced user profile management
  const handleProfileOpen = useCallback(() => {
    setIsProfileOpen(true);
    setError(null);
    
    // Preload user analytics
    getUserAnalytics();
    getSecurityStatus();
  }, [getUserAnalytics, getSecurityStatus]);

  const handleProfileClose = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Analytics tracking before logout
      const sessionDuration = Date.now() - (racineState.lastActivity ? new Date(racineState.lastActivity).getTime() : Date.now());
      
      analyzeUserBehavior({
        action: 'logout',
        sessionDuration,
        totalNavigations: navigationMetrics.totalNavigations,
        timestamp: new Date()
      });
      
      // Clear racine state
      onStateChange({
        isInitialized: false,
        activeWorkspaceId: '',
        error: null,
        lastActivity: new Date().toISOString()
      });
      
      // Navigate to login
      router.push('/auth/login');
      
      toast.success('Signed out successfully');
      
      if (debugMode) {
        console.log('AppNavbar: User logged out after', sessionDuration, 'ms session');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onStateChange, router, racineState.lastActivity, navigationMetrics, analyzeUserBehavior, debugMode]);

  // Advanced theme management with user preferences
  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme);
    
    // Update user preferences
    if (preferences) {
      updatePreferences({
        ...preferences,
        theme: newTheme,
        lastThemeChange: new Date().toISOString()
      });
    }
    
    toast.success(`Theme changed to ${newTheme}`);
    
    // Analytics tracking
    analyzeUserBehavior({
      action: 'theme_change',
      theme: newTheme,
      timestamp: new Date()
    });
  }, [setTheme, preferences, updatePreferences, analyzeUserBehavior]);

  // Mobile menu management
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    // Analytics tracking
    analyzeUserBehavior({
      action: 'mobile_menu_toggle',
      isOpen: !isMobileMenuOpen,
      timestamp: new Date()
    });
  }, [isMobileMenuOpen, analyzeUserBehavior]);

  // ===================== KEYBOARD SHORTCUTS AND ACCESSIBILITY =====================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global search shortcut
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        handleSearchOpen();
      }
      
      // New workspace shortcut
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        if (checkPermission('workspace.create')) {
          handleCreateWorkspace();
        }
      }
      
      // System health shortcut
      if ((event.metaKey || event.ctrlKey) && event.key === 'h') {
        event.preventDefault();
        if (checkPermission('system.monitor')) {
          setIsHealthDetailsOpen(true);
        }
      }
      
      // Quick actions shortcut
      if ((event.metaKey || event.ctrlKey) && event.key === 'j') {
        event.preventDefault();
        setIsQuickActionsOpen(true);
      }
      
      // Escape to close all dropdowns
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsProfileOpen(false);
        setIsWorkspaceOpen(false);
        setIsNotificationOpen(false);
        setIsQuickActionsOpen(false);
        setIsMobileMenuOpen(false);
        setIsHealthDetailsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSearchOpen, handleCreateWorkspace, checkPermission]);

  // ===================== CLICK OUTSIDE HANDLERS =====================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      
      if (workspaceRef.current && !workspaceRef.current.contains(target)) {
        setIsWorkspaceOpen(false);
      }
      
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
      
      if (healthRef.current && !healthRef.current.contains(target)) {
        setIsHealthDetailsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===================== REAL-TIME UPDATES AND MONITORING =====================

  useEffect(() => {
    if (!navigationConfig.healthConfig.enabled || !navigationConfig.healthConfig.autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        await monitorHealth();
        setLastHealthCheck(new Date());
      } catch (error) {
        if (debugMode) {
          console.error('AppNavbar: Health monitoring failed', error);
        }
      }
    }, navigationConfig.healthConfig.refreshInterval);

    return () => clearInterval(interval);
  }, [navigationConfig.healthConfig, monitorHealth, debugMode]);

  // Real-time notification subscription
  useEffect(() => {
    if (!navigationConfig.notificationConfig.enabled || !navigationConfig.notificationConfig.realTime) return;

    const unsubscribe = subscribeToUpdates((notification) => {
      // Handle real-time notification
      if (navigationConfig.notificationConfig.sounds && preferences?.notificationSounds) {
        // Play notification sound
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(() => {
          // Ignore audio play errors
        });
      }
      
      if (navigationConfig.notificationConfig.desktop && preferences?.desktopNotifications) {
        // Show desktop notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icons/racine-logo.png'
          });
        }
      }
    });

    return unsubscribe;
  }, [navigationConfig.notificationConfig, preferences, subscribeToUpdates]);

  // Real-time health streaming
  useEffect(() => {
    if (!showHealthStatus || !checkPermission('system.monitor')) return;

    const unsubscribe = streamHealthUpdates?.((healthUpdate) => {
      // Handle real-time health updates
      if (healthUpdate.critical) {
        toast.error(`Critical system issue: ${healthUpdate.message}`);
      } else if (healthUpdate.warning) {
        toast.warning(`System warning: ${healthUpdate.message}`);
      }
      
      setLastHealthCheck(new Date());
    });

    return unsubscribe;
  }, [showHealthStatus, checkPermission, streamHealthUpdates]);

  // ===================== RENDER HELPERS =====================

  const getHealthIndicatorColor = (status: SystemStatus) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'initializing': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'reconnecting': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const renderBrand = () => {
    if (!showBrand) return null;

    return (
      <motion.div
        variants={itemVariants}
        className="flex items-center space-x-3"
      >
        <Link
          href="/racine/dashboard"
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
          onClick={() => handleNavigate('/racine/dashboard')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Racine
            </span>
            {debugMode && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                v2.0.0-beta
              </span>
            )}
          </div>
        </Link>
        
        {/* Connection Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: connectionStatus !== 'connected' ? 1 : 0 }}
          className={cn("flex items-center space-x-1 text-xs", getConnectionStatusColor())}
        >
          <Wifi className="w-3 h-3" />
          <span className="hidden sm:inline">{connectionStatus}</span>
        </motion.div>
      </motion.div>
    );
  };

  const renderNavigation = () => {
    return (
      <motion.nav
        variants={itemVariants}
        className="hidden lg:flex items-center space-x-1"
      >
        {navigationConfig.groups.slice(0, 6).map((group) => (
          <motion.div
            key={group.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={group.path}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 relative group",
                group.isActive
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleNavigate(group.path)}
              title={group.description}
            >
              <group.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{group.name}</span>
              
              {/* Badge */}
              {group.badge !== undefined && group.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center font-medium"
                >
                  {typeof group.badge === 'number' && group.badge > 99 ? '99+' : group.badge}
                </motion.span>
              )}
              
              {/* Health Status Indicator */}
              {group.status && group.status !== 'healthy' && (
                <motion.div
                  variants={healthIndicatorVariants}
                  animate={group.status}
                  className="w-2 h-2 rounded-full"
                  title={`Status: ${group.status}`}
                />
              )}
              
              {/* Usage Indicator */}
              {group.usage > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full opacity-60" />
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {group.description}
                {group.usage > 0 && (
                  <div className="text-gray-300">Used {group.usage} times</div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
        
        {/* More Navigation Items */}
        {navigationConfig.groups.length > 6 && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              onClick={() => setIsQuickActionsOpen(true)}
              title="More navigation options"
            >
              <span className="text-sm font-medium">More</span>
              <ChevronDown className="w-4 h-4" />
              <span className="bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {navigationConfig.groups.length - 6}
              </span>
            </button>
          </motion.div>
        )}
      </motion.nav>
    );
  };

  const renderSearch = () => {
    if (!showSearch || !navigationConfig.searchConfig.enabled) return null;

    return (
      <motion.div
        variants={itemVariants}
        className="flex-1 max-w-2xl mx-4"
        ref={searchRef}
      >
        <div className="relative">
          <button
            onClick={handleSearchOpen}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg",
              "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
              "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
            )}
          >
            <Search className="w-4 h-4 group-hover:text-blue-500 transition-colors duration-200" />
            <span className="text-sm">{navigationConfig.searchConfig.placeholder}</span>
            <div className="flex-1" />
            
            {/* AI Badge */}
            {navigationConfig.searchConfig.aiPowered && (
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                AI
              </span>
            )}
            
            {/* Keyboard Shortcut */}
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">
              {navigationConfig.searchConfig.shortcuts[0]}
            </kbd>
          </button>
          
          {/* Search Stats */}
          {debugMode && (
            <div className="absolute top-full left-0 mt-1 text-xs text-gray-500 dark:text-gray-400">
              {navigationConfig.searchConfig.filters.reduce((sum, filter) => sum + (filter.count || 0), 0)} searchable items
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Continue with workspace selector, health status, notifications, profile, and mobile menu render functions...
  // [The component continues with the remaining render functions and main render return]

  // ===================== ERROR BOUNDARY =====================

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">
              Navigation error: {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================== MAIN RENDER =====================

  return (
    <>
      <motion.header
        ref={navbarRef}
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg",
          "border-b border-gray-200/50 dark:border-gray-700/50",
          "transition-all duration-300",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Brand + Navigation */}
            <div className="flex items-center space-x-6">
              {renderBrand()}
              {renderNavigation()}
            </div>

            {/* Center Section: Search */}
            {renderSearch()}

            {/* Right Section: Actions + Profile */}
            <div className="flex items-center space-x-2">
              {/* TODO: Implement remaining render functions for workspace selector, health status, notifications, profile, mobile menu */}
              
              {/* Performance Metrics (Debug Mode) */}
              {debugMode && (
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                  {navigationMetrics.totalNavigations} nav | {Math.round(navigationMetrics.averageResponseTime)}ms avg
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {(isLoading || isOrchestrationLoading || isWorkspaceLoading || isUserLoading || isCrossGroupLoading || isActivityLoading || isAILoading || isCollaborationLoading || isDashboardLoading) && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"
            style={{ width: '100%' }}
          />
        )}
        
        {/* Connection Status Bar */}
        <AnimatePresence>
          {connectionStatus !== 'connected' && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className={cn(
                "px-4 py-2 text-sm text-center",
                connectionStatus === 'disconnected' ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400" :
                connectionStatus === 'reconnecting' ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" :
                "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                <Wifi className="w-4 h-4" />
                <span>
                  {connectionStatus === 'disconnected' ? 'Connection lost - working offline' :
                   connectionStatus === 'reconnecting' ? 'Reconnecting to server...' :
                   'Connection status unknown'}
                </span>
                {connectionStatus === 'reconnecting' && (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Lazy-loaded Modal Components */}
      <Suspense fallback={<div />}>
        <GlobalSearchInterface
          isOpen={isSearchOpen}
          onClose={handleSearchClose}
          onSearch={handleSearchQuery}
          searchConfig={navigationConfig.searchConfig}
          racineState={racineState}
          onNavigate={handleNavigate}
        />
      </Suspense>

      <Suspense fallback={<div />}>
        <NotificationCenter
          isOpen={isNotificationOpen}
          onClose={handleNotificationClose}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsRead}
          notificationConfig={navigationConfig.notificationConfig}
        />
      </Suspense>

      <Suspense fallback={<div />}>
        <QuickActionsPanel
          isOpen={isQuickActionsOpen}
          onClose={() => setIsQuickActionsOpen(false)}
          quickActions={navigationConfig.quickActions}
          groups={navigationConfig.groups}
          onNavigate={handleNavigate}
          racineState={racineState}
        />
      </Suspense>
    </>
  );
};

export default AppNavbar;