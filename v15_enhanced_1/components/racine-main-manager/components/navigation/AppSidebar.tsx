/**
 * AppSidebar - Adaptive Sidebar with SPA Orchestration
 * ==================================================
 * 
 * Advanced sidebar component that serves as the master navigation orchestrator for all
 * SPA groups in the Racine data governance platform. Features adaptive UI, contextual
 * navigation, workspace management, and seamless integration with all backend services.
 * 
 * Key Features:
 * - Orchestrates navigation to all 7 core group SPAs + Racine manager components
 * - Adaptive layout with collapsible sections and intelligent grouping
 * - Context-aware navigation with role-based visibility (RBAC integration)
 * - Real-time status indicators and activity badges for each group
 * - Quick access subcomponents panel with right-side hidden sidebar
 * - Workspace-aware navigation with multi-workspace support
 * - Performance-optimized with lazy loading and caching
 * - Full accessibility compliance and keyboard navigation
 * 
 * SPA Orchestration:
 * - Data Sources SPA: Connection management and discovery orchestration
 * - Scan Rule Sets SPA: Rule execution and management orchestration
 * - Classifications SPA: Classification workflow orchestration
 * - Compliance Rules SPA: Compliance validation orchestration
 * - Advanced Catalog SPA: Catalog management orchestration
 * - Advanced Scan Logic SPA: Scan execution orchestration
 * - RBAC System SPA: Security and access orchestration (Admin only)
 * - Plus: Workspace, Workflow, Pipeline, AI, Activity, Dashboard, Collaboration management
 * 
 * Backend Integration:
 * - racine-orchestration-apis.ts: Master orchestration and system health
 * - workspace-management-apis.ts: Multi-workspace navigation
 * - cross-group-integration-apis.ts: Cross-group navigation and status
 * - user-management-apis.ts: RBAC-based navigation visibility
 */

import React, { useState, useCallback, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  Database,
  Scan,
  Tags,
  Shield,
  FileText,
  Activity,
  Users,
  Workspace,
  GitBranch,
  Layers,
  Bot,
  History,
  BarChart3,
  MessageSquare,
  Settings,
  Search,
  Plus,
  Star,
  Clock,
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Circle,
  Dot,
  ArrowRight,
  ExternalLink,
  Filter,
  SortAsc,
  Grid,
  List,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  RefreshCw,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  Navigation,
  Compass,
  Map,
  Target,
  Layers3,
  Network,
  Workflow,
  GitGraph,
  TreePine,
  FolderTree,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation, useDragControls } from 'framer-motion';
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
  PerformanceMetrics,
  ViewMode,
  LayoutMode,
  SystemStatus,
  IntegrationStatus,
  UUID,
  ISODateString
} from '../../types/racine-core.types';

// Utils and Constants
import { SUPPORTED_GROUPS, VIEW_MODES, LAYOUT_MODES } from '../../constants/cross-group-configs';
import { formatDistanceToNow, format } from 'date-fns';

// Lazy-loaded subcomponents for performance
const QuickActionsPanel = React.lazy(() => import('./subcomponents/QuickActionsPanel'));
const WorkspaceQuickSwitcher = React.lazy(() => import('./subcomponents/WorkspaceQuickSwitcher'));
const GroupStatusIndicator = React.lazy(() => import('./subcomponents/GroupStatusIndicator'));

// ===================== INTERFACES AND TYPES =====================

interface AppSidebarProps {
  className?: string;
  racineState: RacineState;
  onStateChange: (updates: Partial<RacineState>) => void;
  onNavigate: (path: string, context?: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  showQuickActions?: boolean;
  showWorkspaceInfo?: boolean;
  showGroupStatus?: boolean;
  customSections?: SidebarSection[];
  theme?: 'light' | 'dark' | 'system';
  debugMode?: boolean;
}

interface SidebarSection {
  id: string;
  name: string;
  icon: React.ComponentType;
  items: SidebarItem[];
  isCollapsible: boolean;
  isCollapsed?: boolean;
  order: number;
  permission?: string;
  isVisible?: boolean;
  badge?: number | string;
  status?: SystemStatus;
  description?: string;
  quickActions?: QuickAction[];
}

interface SidebarItem {
  id: string;
  name: string;
  icon: React.ComponentType;
  path: string;
  permission?: string;
  isActive?: boolean;
  isVisible?: boolean;
  badge?: number | string;
  status?: SystemStatus;
  description?: string;
  children?: SidebarItem[];
  isExpanded?: boolean;
  lastAccessed?: Date;
  usage?: number;
  isFavorite?: boolean;
  isBookmarked?: boolean;
  quickActions?: QuickAction[];
  metadata?: {
    type: 'spa' | 'component' | 'workflow' | 'dashboard' | 'tool';
    category: string;
    tags: string[];
    complexity: 'basic' | 'intermediate' | 'advanced';
    estimatedTime?: string;
    dependencies?: string[];
  };
}

interface SidebarState {
  isCollapsed: boolean;
  isPinned: boolean;
  activeSection: string | null;
  expandedItems: Set<string>;
  collapsedSections: Set<string>;
  favoriteItems: Set<string>;
  bookmarkedItems: Set<string>;
  recentItems: string[];
  searchQuery: string;
  viewMode: 'list' | 'grid' | 'tree';
  sortBy: 'name' | 'usage' | 'lastAccessed' | 'status';
  filterBy: string[];
  showHiddenItems: boolean;
  quickActionsVisible: boolean;
}

interface NavigationAnalytics {
  totalNavigations: number;
  sectionUsage: Record<string, number>;
  itemUsage: Record<string, number>;
  averageSessionTime: number;
  popularPaths: string[];
  searchQueries: string[];
  lastActivity: Date;
}

// ===================== ANIMATION VARIANTS =====================

const sidebarVariants = {
  expanded: {
    width: 280,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05
    }
  },
  collapsed: {
    width: 64,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 }
  },
  collapsed: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
};

const sectionVariants = {
  open: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05
    }
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const statusIndicatorVariants = {
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

const quickActionsVariants = {
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hidden: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// ===================== MAIN COMPONENT =====================

const AppSidebar: React.FC<AppSidebarProps> = ({
  className = '',
  racineState,
  onStateChange,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  showQuickActions = true,
  showWorkspaceInfo = true,
  showGroupStatus = true,
  customSections = [],
  theme = 'system',
  debugMode = false
}) => {
  // ===================== HOOKS AND STATE =====================

  const router = useRouter();
  const controls = useAnimation();
  const dragControls = useDragControls();
  
  // Refs for performance optimization and interactions
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Local state management with advanced features
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isCollapsed,
    isPinned: true,
    activeSection: null,
    expandedItems: new Set(['dashboard', 'workspace']),
    collapsedSections: new Set(),
    favoriteItems: new Set(['dashboard', 'data-sources']),
    bookmarkedItems: new Set(),
    recentItems: [],
    searchQuery: '',
    viewMode: 'tree',
    sortBy: 'usage',
    filterBy: [],
    showHiddenItems: false,
    quickActionsVisible: false
  });

  const [navigationAnalytics, setNavigationAnalytics] = useState<NavigationAnalytics>({
    totalNavigations: 0,
    sectionUsage: {},
    itemUsage: {},
    averageSessionTime: 0,
    popularPaths: [],
    searchQueries: [],
    lastActivity: new Date()
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Custom hooks for comprehensive backend integration
  const {
    orchestrationState,
    systemHealth,
    performanceMetrics,
    executeWorkflow,
    monitorHealth,
    optimizePerformance,
    getSystemAlerts,
    isLoading: isOrchestrationLoading,
    error: orchestrationError
  } = useRacineOrchestration(racineState.activeWorkspaceId || '', racineState);

  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
    getWorkspaceHealth,
    getWorkspaceAnalytics,
    isLoading: isWorkspaceLoading,
    error: workspaceError
  } = useWorkspaceManagement(racineState.activeWorkspaceId || '');

  const {
    userProfile,
    permissions,
    preferences,
    checkPermission,
    getUserAnalytics,
    isLoading: isUserLoading,
    error: userError
  } = useUserManagement();

  const {
    groupsStatus,
    integrationHealth,
    getGroupNavigation,
    getCrossGroupMetrics,
    validateIntegrations,
    isLoading: isCrossGroupLoading,
    error: crossGroupError
  } = useCrossGroupIntegration();

  const {
    notifications,
    unreadCount,
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

  // Advanced sidebar configuration with full SPA orchestration
  const sidebarConfiguration = useMemo(() => {
    const coreSections: SidebarSection[] = [
      {
        id: 'overview',
        name: 'Overview',
        icon: Home,
        order: 0,
        isCollapsible: false,
        isVisible: true,
        items: [
          {
            id: 'dashboard',
            name: 'Dashboard',
            icon: BarChart3,
            path: '/racine/dashboard',
            isActive: router.pathname === '/racine/dashboard',
            isVisible: true,
            status: systemHealth?.overall || 'healthy',
            description: 'Main overview and KPI dashboard',
            usage: navigationAnalytics.itemUsage['dashboard'] || 0,
            isFavorite: sidebarState.favoriteItems.has('dashboard'),
            isBookmarked: sidebarState.bookmarkedItems.has('dashboard'),
            metadata: {
              type: 'dashboard',
              category: 'overview',
              tags: ['analytics', 'kpi', 'monitoring'],
              complexity: 'basic',
              estimatedTime: '< 1 min'
            },
            quickActions: [
              {
                id: 'refresh-dashboard',
                name: 'Refresh Data',
                icon: RefreshCw,
                action: () => getDashboardInsights(),
                category: 'data'
              }
            ]
          }
        ]
      },
      {
        id: 'workspace',
        name: 'Workspace Management',
        icon: Workspace,
        order: 1,
        isCollapsible: true,
        isCollapsed: sidebarState.collapsedSections.has('workspace'),
        isVisible: true,
        badge: workspaces?.length || 0,
        status: getWorkspaceHealth()?.status || 'healthy',
        description: 'Multi-workspace orchestration and management',
        items: [
          {
            id: 'workspace-overview',
            name: 'Workspace Overview',
            icon: Grid,
            path: '/racine/workspace',
            isActive: router.pathname === '/racine/workspace',
            isVisible: true,
            badge: workspaces?.length || 0,
            description: 'Current workspace overview and management',
            usage: navigationAnalytics.itemUsage['workspace-overview'] || 0,
            metadata: {
              type: 'spa',
              category: 'workspace',
              tags: ['management', 'overview', 'orchestration'],
              complexity: 'intermediate'
            }
          },
          {
            id: 'workspace-switcher',
            name: 'Switch Workspace',
            icon: Target,
            path: '/racine/workspace/switcher',
            isActive: router.pathname.startsWith('/racine/workspace/switcher'),
            isVisible: checkPermission('workspace.switch'),
            description: 'Switch between available workspaces',
            usage: navigationAnalytics.itemUsage['workspace-switcher'] || 0,
            metadata: {
              type: 'tool',
              category: 'workspace',
              tags: ['switching', 'management'],
              complexity: 'basic'
            }
          },
          {
            id: 'workspace-create',
            name: 'Create Workspace',
            icon: Plus,
            path: '/racine/workspace/create',
            isActive: router.pathname.startsWith('/racine/workspace/create'),
            isVisible: checkPermission('workspace.create'),
            description: 'Create new workspace with AI optimization',
            usage: navigationAnalytics.itemUsage['workspace-create'] || 0,
            metadata: {
              type: 'workflow',
              category: 'workspace',
              tags: ['creation', 'ai-optimized'],
              complexity: 'intermediate',
              estimatedTime: '5-10 min'
            }
          }
        ]
      },
      {
        id: 'core-groups',
        name: 'Data Governance Groups',
        icon: Database,
        order: 2,
        isCollapsible: true,
        isCollapsed: sidebarState.collapsedSections.has('core-groups'),
        isVisible: true,
        description: 'Core data governance SPA orchestration',
        items: [
          {
            id: 'data-sources-spa',
            name: 'Data Sources',
            icon: Database,
            path: '/racine/data-sources',
            permission: 'data_sources.view',
            isActive: router.pathname.startsWith('/racine/data-sources'),
            isVisible: checkPermission('data_sources.view'),
            status: groupsStatus?.['data-sources']?.status || 'healthy',
            badge: groupsStatus?.['data-sources']?.count || 0,
            description: 'Data source connections and discovery orchestration',
            usage: navigationAnalytics.itemUsage['data-sources-spa'] || 0,
            isFavorite: sidebarState.favoriteItems.has('data-sources-spa'),
            metadata: {
              type: 'spa',
              category: 'data-governance',
              tags: ['connections', 'discovery', 'orchestration'],
              complexity: 'advanced',
              dependencies: ['workspace', 'rbac']
            },
            quickActions: [
              {
                id: 'add-data-source',
                name: 'Add Data Source',
                icon: Plus,
                action: () => onNavigate('/racine/data-sources/create'),
                category: 'creation'
              },
              {
                id: 'test-connections',
                name: 'Test Connections',
                icon: Activity,
                action: () => onNavigate('/racine/data-sources/test'),
                category: 'validation'
              }
            ]
          },
          {
            id: 'scan-rule-sets-spa',
            name: 'Scan Rule Sets',
            icon: Scan,
            path: '/racine/scan-rule-sets',
            permission: 'scan_rules.view',
            isActive: router.pathname.startsWith('/racine/scan-rule-sets'),
            isVisible: checkPermission('scan_rules.view'),
            status: groupsStatus?.['scan-rule-sets']?.status || 'healthy',
            badge: groupsStatus?.['scan-rule-sets']?.active || 0,
            description: 'Rule execution and management orchestration',
            usage: navigationAnalytics.itemUsage['scan-rule-sets-spa'] || 0,
            metadata: {
              type: 'spa',
              category: 'data-governance',
              tags: ['rules', 'execution', 'management'],
              complexity: 'advanced',
              dependencies: ['data-sources', 'classifications']
            },
            quickActions: [
              {
                id: 'create-rule-set',
                name: 'Create Rule Set',
                icon: Plus,
                action: () => onNavigate('/racine/scan-rule-sets/create'),
                category: 'creation'
              }
            ]
          },
          {
            id: 'classifications-spa',
            name: 'Classifications',
            icon: Tags,
            path: '/racine/classifications',
            permission: 'classifications.view',
            isActive: router.pathname.startsWith('/racine/classifications'),
            isVisible: checkPermission('classifications.view'),
            status: groupsStatus?.['classifications']?.status || 'healthy',
            badge: groupsStatus?.['classifications']?.count || 0,
            description: 'Classification workflow orchestration',
            usage: navigationAnalytics.itemUsage['classifications-spa'] || 0,
            metadata: {
              type: 'spa',
              category: 'data-governance',
              tags: ['classification', 'workflow', 'ai-powered'],
              complexity: 'advanced',
              dependencies: ['data-sources', 'scan-rule-sets']
            }
          },
          {
            id: 'compliance-rules-spa',
            name: 'Compliance Rules',
            icon: Shield,
            path: '/racine/compliance-rules',
            permission: 'compliance.view',
            isActive: router.pathname.startsWith('/racine/compliance-rules'),
            isVisible: checkPermission('compliance.view'),
            status: groupsStatus?.['compliance-rules']?.status || 'healthy',
            badge: groupsStatus?.['compliance-rules']?.score || 0,
            description: 'Compliance validation orchestration',
            usage: navigationAnalytics.itemUsage['compliance-rules-spa'] || 0,
            metadata: {
              type: 'spa',
              category: 'data-governance',
              tags: ['compliance', 'validation', 'audit'],
              complexity: 'advanced',
              dependencies: ['classifications', 'rbac']
            }
          },
          {
            id: 'advanced-catalog-spa',
            name: 'Advanced Catalog',
            icon: FileText,
            path: '/racine/advanced-catalog',
            permission: 'catalog.view',
            isActive: router.pathname.startsWith('/racine/advanced-catalog'),
            isVisible: checkPermission('catalog.view'),
            status: groupsStatus?.['advanced-catalog']?.status || 'healthy',
            badge: groupsStatus?.['advanced-catalog']?.assets || 0,
            description: 'Catalog management orchestration',
            usage: navigationAnalytics.itemUsage['advanced-catalog-spa'] || 0,
            metadata: {
              type: 'spa',
              category: 'data-governance',
              tags: ['catalog', 'metadata', 'lineage'],
              complexity: 'advanced',
              dependencies: ['data-sources', 'classifications']
            }
          },
          {
            id: 'scan-logic-spa',
            name: 'Advanced Scan Logic',
            icon: Activity,
            path: '/racine/scan-logic',
            permission: 'scan_logic.view',
            isActive: router.pathname.startsWith('/racine/scan-logic'),
            isVisible: checkPermission('scan_logic.view'),
            status: groupsStatus?.['scan-logic']?.status || 'healthy',
            badge: groupsStatus?.['scan-logic']?.active || 0,
            description: 'Scan execution orchestration',
            usage: navigationAnalytics.itemUsage['scan-logic-spa'] || 0,
            metadata: {
              type: 'spa',
              category: 'data-governance',
              tags: ['scanning', 'execution', 'orchestration'],
              complexity: 'advanced',
              dependencies: ['scan-rule-sets', 'data-sources']
            }
          }
        ]
      },
      {
        id: 'security-admin',
        name: 'Security & Administration',
        icon: Shield,
        order: 3,
        isCollapsible: true,
        isCollapsed: sidebarState.collapsedSections.has('security-admin'),
        isVisible: checkPermission('rbac.admin') || checkPermission('system.admin'),
        description: 'Security and administrative orchestration (Admin Only)',
        items: [
          {
            id: 'rbac-system-spa',
            name: 'RBAC System',
            icon: Users,
            path: '/racine/rbac-system',
            permission: 'rbac.admin',
            isActive: router.pathname.startsWith('/racine/rbac-system'),
            isVisible: checkPermission('rbac.admin'),
            status: groupsStatus?.['rbac-system']?.status || 'healthy',
            badge: groupsStatus?.['rbac-system']?.users || 0,
            description: 'Security and access orchestration (Admin Only)',
            usage: navigationAnalytics.itemUsage['rbac-system-spa'] || 0,
            metadata: {
              type: 'spa',
              category: 'security',
              tags: ['rbac', 'security', 'access-control'],
              complexity: 'advanced',
              dependencies: ['user-management']
            }
          }
        ]
      },
      {
        id: 'advanced-features',
        name: 'Advanced Features',
        icon: Zap,
        order: 4,
        isCollapsible: true,
        isCollapsed: sidebarState.collapsedSections.has('advanced-features'),
        isVisible: true,
        description: 'Advanced workflow and pipeline orchestration',
        items: [
          {
            id: 'job-workflows',
            name: 'Job Workflows',
            icon: GitBranch,
            path: '/racine/workflows',
            permission: 'workflows.view',
            isActive: router.pathname.startsWith('/racine/workflows'),
            isVisible: checkPermission('workflows.view'),
            status: orchestrationState?.workflowHealth || 'healthy',
            badge: orchestrationState?.activeWorkflows || 0,
            description: 'Databricks-style workflow builder with cross-group orchestration',
            usage: navigationAnalytics.itemUsage['job-workflows'] || 0,
            metadata: {
              type: 'spa',
              category: 'workflow',
              tags: ['workflows', 'databricks-style', 'orchestration'],
              complexity: 'advanced',
              dependencies: ['all-groups']
            }
          },
          {
            id: 'pipeline-manager',
            name: 'Pipeline Manager',
            icon: Layers,
            path: '/racine/pipelines',
            permission: 'pipelines.view',
            isActive: router.pathname.startsWith('/racine/pipelines'),
            isVisible: checkPermission('pipelines.view'),
            status: orchestrationState?.pipelineHealth || 'healthy',
            badge: orchestrationState?.activePipelines || 0,
            description: 'Advanced pipeline management with AI optimization',
            usage: navigationAnalytics.itemUsage['pipeline-manager'] || 0,
            metadata: {
              type: 'spa',
              category: 'pipeline',
              tags: ['pipelines', 'ai-optimization', 'management'],
              complexity: 'advanced',
              dependencies: ['workflows', 'ai-assistant']
            }
          },
          {
            id: 'ai-assistant',
            name: 'AI Assistant',
            icon: Bot,
            path: '/racine/ai-assistant',
            permission: 'ai.view',
            isActive: router.pathname.startsWith('/racine/ai-assistant'),
            isVisible: checkPermission('ai.view'),
            status: orchestrationState?.aiHealth || 'healthy',
            badge: aiRecommendations?.length || 0,
            description: 'Context-aware AI interface with cross-group intelligence',
            usage: navigationAnalytics.itemUsage['ai-assistant'] || 0,
            metadata: {
              type: 'spa',
              category: 'ai',
              tags: ['ai', 'context-aware', 'intelligence'],
              complexity: 'advanced',
              dependencies: ['all-groups']
            }
          }
        ]
      },
      {
        id: 'monitoring-analytics',
        name: 'Monitoring & Analytics',
        icon: BarChart3,
        order: 5,
        isCollapsible: true,
        isCollapsed: sidebarState.collapsedSections.has('monitoring-analytics'),
        isVisible: true,
        description: 'System monitoring and analytics orchestration',
        items: [
          {
            id: 'activity-tracker',
            name: 'Activity Tracker',
            icon: History,
            path: '/racine/activity-tracker',
            permission: 'activity.view',
            isActive: router.pathname.startsWith('/racine/activity-tracker'),
            isVisible: checkPermission('activity.view'),
            status: orchestrationState?.activityHealth || 'healthy',
            badge: unreadCount || 0,
            description: 'Historic activities and audit trails',
            usage: navigationAnalytics.itemUsage['activity-tracker'] || 0,
            metadata: {
              type: 'spa',
              category: 'monitoring',
              tags: ['activity', 'audit', 'tracking'],
              complexity: 'intermediate',
              dependencies: ['all-groups']
            }
          },
          {
            id: 'intelligent-dashboard',
            name: 'Dashboards',
            icon: BarChart3,
            path: '/racine/dashboards',
            permission: 'dashboards.view',
            isActive: router.pathname.startsWith('/racine/dashboards'),
            isVisible: checkPermission('dashboards.view'),
            status: orchestrationState?.dashboardHealth || 'healthy',
            badge: customDashboards?.length || 0,
            description: 'Custom dashboard builder with real-time analytics',
            usage: navigationAnalytics.itemUsage['intelligent-dashboard'] || 0,
            metadata: {
              type: 'spa',
              category: 'analytics',
              tags: ['dashboards', 'analytics', 'real-time'],
              complexity: 'advanced',
              dependencies: ['all-groups']
            }
          }
        ]
      },
      {
        id: 'collaboration',
        name: 'Collaboration',
        icon: MessageSquare,
        order: 6,
        isCollapsible: true,
        isCollapsed: sidebarState.collapsedSections.has('collaboration'),
        isVisible: checkPermission('collaboration.view'),
        description: 'Team collaboration and communication',
        items: [
          {
            id: 'collaboration-center',
            name: 'Collaboration Center',
            icon: MessageSquare,
            path: '/racine/collaboration',
            permission: 'collaboration.view',
            isActive: router.pathname.startsWith('/racine/collaboration'),
            isVisible: checkPermission('collaboration.view'),
            status: orchestrationState?.collaborationHealth || 'healthy',
            badge: activeCollaborations?.length || 0,
            description: 'Master collaboration system with real-time features',
            usage: navigationAnalytics.itemUsage['collaboration-center'] || 0,
            metadata: {
              type: 'spa',
              category: 'collaboration',
              tags: ['collaboration', 'real-time', 'team'],
              complexity: 'intermediate',
              dependencies: ['user-management']
            }
          }
        ]
      }
    ];

    // Add custom sections if provided
    const allSections = [...coreSections, ...customSections];

    // Filter sections based on visibility and permissions
    const visibleSections = allSections
      .filter(section => section.isVisible !== false)
      .map(section => ({
        ...section,
        items: section.items
          .filter(item => item.isVisible !== false)
          .sort((a, b) => {
            // Sort by usage, favorites, then name
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            if (sidebarState.sortBy === 'usage') {
              return (b.usage || 0) - (a.usage || 0);
            }
            if (sidebarState.sortBy === 'name') {
              return a.name.localeCompare(b.name);
            }
            return 0;
          })
      }))
      .sort((a, b) => a.order - b.order);

    return visibleSections;
  }, [
    router.pathname,
    systemHealth,
    workspaces,
    groupsStatus,
    orchestrationState,
    aiRecommendations,
    unreadCount,
    customDashboards,
    activeCollaborations,
    checkPermission,
    getWorkspaceHealth,
    sidebarState,
    navigationAnalytics,
    customSections
  ]);

  // ===================== EVENT HANDLERS =====================

  // Navigation with advanced analytics tracking
  const handleNavigate = useCallback((path: string, context?: any) => {
    const startTime = Date.now();
    
    if (debugMode) {
      console.log('AppSidebar: Navigating to', path, context);
    }
    
    // Update navigation analytics
    setNavigationAnalytics(prev => ({
      ...prev,
      totalNavigations: prev.totalNavigations + 1,
      itemUsage: {
        ...prev.itemUsage,
        [context?.itemId || path]: (prev.itemUsage[context?.itemId || path] || 0) + 1
      },
      popularPaths: [...prev.popularPaths, path].slice(-50),
      lastActivity: new Date()
    }));
    
    // Update recent items
    if (context?.itemId) {
      setSidebarState(prev => ({
        ...prev,
        recentItems: [context.itemId, ...prev.recentItems.filter(id => id !== context.itemId)].slice(0, 10)
      }));
    }
    
    onNavigate(path, context);
    
    // Track navigation performance
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // AI behavior analysis
    analyzeUserBehavior({
      action: 'sidebar_navigation',
      target: path,
      context,
      timestamp: new Date(),
      responseTime,
      section: context?.sectionId,
      itemType: context?.itemType
    });
  }, [onNavigate, analyzeUserBehavior, debugMode]);

  // Section collapse/expand with state persistence
  const handleSectionToggle = useCallback((sectionId: string) => {
    setSidebarState(prev => {
      const newCollapsedSections = new Set(prev.collapsedSections);
      if (newCollapsedSections.has(sectionId)) {
        newCollapsedSections.delete(sectionId);
      } else {
        newCollapsedSections.add(sectionId);
      }
      
      return {
        ...prev,
        collapsedSections: newCollapsedSections,
        activeSection: newCollapsedSections.has(sectionId) ? null : sectionId
      };
    });
    
    // Analytics tracking
    setNavigationAnalytics(prev => ({
      ...prev,
      sectionUsage: {
        ...prev.sectionUsage,
        [sectionId]: (prev.sectionUsage[sectionId] || 0) + 1
      }
    }));
  }, []);

  // Item expansion for hierarchical navigation
  const handleItemExpand = useCallback((itemId: string) => {
    setSidebarState(prev => {
      const newExpandedItems = new Set(prev.expandedItems);
      if (newExpandedItems.has(itemId)) {
        newExpandedItems.delete(itemId);
      } else {
        newExpandedItems.add(itemId);
      }
      
      return {
        ...prev,
        expandedItems: newExpandedItems
      };
    });
  }, []);

  // Favorite management with persistence
  const handleToggleFavorite = useCallback((itemId: string) => {
    setSidebarState(prev => {
      const newFavoriteItems = new Set(prev.favoriteItems);
      if (newFavoriteItems.has(itemId)) {
        newFavoriteItems.delete(itemId);
        toast.success('Removed from favorites');
      } else {
        newFavoriteItems.add(itemId);
        toast.success('Added to favorites');
      }
      
      return {
        ...prev,
        favoriteItems: newFavoriteItems
      };
    });
    
    // Analytics tracking
    analyzeUserBehavior({
      action: 'toggle_favorite',
      target: itemId,
      timestamp: new Date()
    });
  }, [analyzeUserBehavior]);

  // Bookmark management
  const handleToggleBookmark = useCallback((itemId: string) => {
    setSidebarState(prev => {
      const newBookmarkedItems = new Set(prev.bookmarkedItems);
      if (newBookmarkedItems.has(itemId)) {
        newBookmarkedItems.delete(itemId);
        toast.success('Bookmark removed');
      } else {
        newBookmarkedItems.add(itemId);
        toast.success('Bookmarked');
      }
      
      return {
        ...prev,
        bookmarkedItems: newBookmarkedItems
      };
    });
  }, []);

  // Sidebar collapse/expand with animation
  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !sidebarState.isCollapsed;
    
    setSidebarState(prev => ({
      ...prev,
      isCollapsed: newCollapsed
    }));
    
    onToggleCollapse?.();
    
    // Analytics tracking
    analyzeUserBehavior({
      action: 'sidebar_toggle',
      collapsed: newCollapsed,
      timestamp: new Date()
    });
  }, [sidebarState.isCollapsed, onToggleCollapse, analyzeUserBehavior]);

  // Quick actions panel toggle
  const handleToggleQuickActions = useCallback(() => {
    setSidebarState(prev => ({
      ...prev,
      quickActionsVisible: !prev.quickActionsVisible
    }));
  }, []);

  // Search functionality with AI-powered suggestions
  const handleSearch = useCallback((query: string) => {
    setSidebarState(prev => ({
      ...prev,
      searchQuery: query
    }));
    
    if (query.trim()) {
      setNavigationAnalytics(prev => ({
        ...prev,
        searchQueries: [...prev.searchQueries, query].slice(-20)
      }));
      
      // AI-powered search suggestions
      getNavigationSuggestions();
    }
  }, [getNavigationSuggestions]);

  // ===================== RENDER HELPERS =====================

  const renderSectionHeader = (section: SidebarSection) => {
    const isCollapsed = sidebarState.collapsedSections.has(section.id);
    const isActive = sidebarState.activeSection === section.id;
    
    return (
      <motion.div
        initial={false}
        animate={isActive ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}}
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group",
          "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200",
          isActive && "bg-blue-50 dark:bg-blue-900/20"
        )}
        onClick={() => section.isCollapsible && handleSectionToggle(section.id)}
      >
        <div className="flex items-center space-x-3">
          <section.icon className={cn(
            "w-5 h-5",
            isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
          )} />
          
          <AnimatePresence>
            {!sidebarState.isCollapsed && (
              <motion.div
                variants={itemVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex items-center space-x-2"
              >
                <span className={cn(
                  "font-medium text-sm",
                  isActive ? "text-blue-900 dark:text-blue-100" : "text-gray-700 dark:text-gray-300"
                )}>
                  {section.name}
                </span>
                
                {section.badge !== undefined && section.badge > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {typeof section.badge === 'number' && section.badge > 99 ? '99+' : section.badge}
                  </span>
                )}
                
                {section.status && section.status !== 'healthy' && (
                  <motion.div
                    variants={statusIndicatorVariants}
                    animate={section.status}
                    className="w-2 h-2 rounded-full"
                    title={`Status: ${section.status}`}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {!sidebarState.isCollapsed && section.isCollapsible && (
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderSidebarItem = (item: SidebarItem, sectionId: string, depth: number = 0) => {
    const isActive = item.isActive;
    const isFavorite = item.isFavorite;
    const isBookmarked = item.isBookmarked;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = sidebarState.expandedItems.has(item.id);
    
    return (
      <motion.div
        key={item.id}
        variants={itemVariants}
        initial="collapsed"
        animate="expanded"
        exit="collapsed"
        className={cn("relative", depth > 0 && "ml-4")}
      >
        {/* Main Item */}
        <div className={cn(
          "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group relative",
          "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200",
          isActive && "bg-blue-500/20 text-blue-600 dark:text-blue-400",
          depth > 0 && "border-l-2 border-gray-200 dark:border-gray-700 ml-2 pl-4"
        )}>
          <div 
            className="flex items-center space-x-3 flex-1"
            onClick={() => handleNavigate(item.path, { 
              itemId: item.id, 
              sectionId, 
              itemType: item.metadata?.type 
            })}
          >
            <item.icon className={cn(
              "w-4 h-4",
              isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
            )} />
            
            <AnimatePresence>
              {!sidebarState.isCollapsed && (
                <motion.div
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="flex items-center space-x-2 flex-1"
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-blue-900 dark:text-blue-100" : "text-gray-700 dark:text-gray-300"
                  )}>
                    {item.name}
                  </span>
                  
                  {/* Badges and Indicators */}
                  <div className="flex items-center space-x-1">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    
                    {item.status && item.status !== 'healthy' && (
                      <motion.div
                        variants={statusIndicatorVariants}
                        animate={item.status}
                        className="w-2 h-2 rounded-full"
                        title={`Status: ${item.status}`}
                      />
                    )}
                    
                    {isFavorite && (
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    )}
                    
                    {isBookmarked && (
                      <Bookmark className="w-3 h-3 text-blue-500 fill-current" />
                    )}
                    
                    {item.metadata?.complexity === 'advanced' && (
                      <span className="text-xs text-orange-500 font-medium">ADV</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Action Buttons */}
          {!sidebarState.isCollapsed && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Favorite Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(item.id);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={cn(
                  "w-3 h-3",
                  isFavorite ? "text-yellow-500 fill-current" : "text-gray-400"
                )} />
              </button>
              
              {/* Bookmark Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBookmark(item.id);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <Bookmark className={cn(
                  "w-3 h-3",
                  isBookmarked ? "text-blue-500 fill-current" : "text-gray-400"
                )} />
              </button>
              
              {/* Quick Actions */}
              {item.quickActions && item.quickActions.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleQuickActions();
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Quick actions"
                >
                  <Menu className="w-3 h-3 text-gray-400" />
                </button>
              )}
              
              {/* Expand/Collapse for items with children */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemExpand(item.id);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </motion.div>
                </button>
              )}
            </div>
          )}
          
          {/* Usage Indicator */}
          {item.usage && item.usage > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full opacity-60" />
          )}
        </div>
        
        {/* Children Items */}
        <AnimatePresence>
          {hasChildren && isExpanded && !sidebarState.isCollapsed && (
            <motion.div
              variants={sectionVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="mt-1 space-y-1"
            >
              {item.children?.map(childItem => 
                renderSidebarItem(childItem, sectionId, depth + 1)
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tooltip for collapsed sidebar */}
        {sidebarState.isCollapsed && (
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.name}
            {item.description && (
              <div className="text-gray-300 text-xs mt-1">{item.description}</div>
            )}
            {item.metadata && (
              <div className="text-gray-400 text-xs mt-1">
                {item.metadata.type} • {item.metadata.complexity}
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  // ===================== EFFECTS =====================

  // Sync collapsed state with prop
  useEffect(() => {
    setSidebarState(prev => ({
      ...prev,
      isCollapsed
    }));
  }, [isCollapsed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sidebar with Ctrl+B or Cmd+B
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        handleToggleCollapse();
      }
      
      // Focus search with Ctrl+F or Cmd+F in sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'f' && sidebarRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      
      // Quick actions with Ctrl+J or Cmd+J
      if ((event.ctrlKey || event.metaKey) && event.key === 'j') {
        event.preventDefault();
        handleToggleQuickActions();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleCollapse, handleToggleQuickActions]);

  // ===================== ERROR BOUNDARY =====================

  if (error) {
    return (
      <div className="w-64 bg-red-50 dark:bg-red-900/20 border-r border-red-200 dark:border-red-800 p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Sidebar Error
            </p>
            <p className="text-xs text-red-600 dark:text-red-500">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===================== MAIN RENDER =====================

  return (
    <>
      <motion.aside
        ref={sidebarRef}
        variants={sidebarVariants}
        animate={sidebarState.isCollapsed ? "collapsed" : "expanded"}
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg",
          "border-r border-gray-200/50 dark:border-gray-700/50",
          "transition-all duration-300",
          className
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <AnimatePresence>
              {!sidebarState.isCollapsed && (
                <motion.div
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="flex items-center space-x-2"
                >
                  <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Navigation
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              onClick={handleToggleCollapse}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={sidebarState.isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarState.isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>

          {/* Search */}
          <AnimatePresence>
            {!sidebarState.isCollapsed && (
              <motion.div
                variants={itemVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="p-4"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search navigation..."
                    value={sidebarState.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {sidebarConfiguration.map((section) => (
                <div key={section.id} className="space-y-1">
                  {renderSectionHeader(section)}
                  
                  <AnimatePresence>
                    {!sidebarState.collapsedSections.has(section.id) && (
                      <motion.div
                        variants={sectionVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="ml-2 space-y-1"
                      >
                        {section.items.map(item => 
                          renderSidebarItem(item, section.id)
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <AnimatePresence>
              {!sidebarState.isCollapsed && (
                <motion.div
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="space-y-2"
                >
                  {/* Quick Actions Button */}
                  {showQuickActions && (
                    <button
                      onClick={handleToggleQuickActions}
                      className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Quick Actions</span>
                    </button>
                  )}
                  
                  {/* Debug Info */}
                  {debugMode && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                      {navigationAnalytics.totalNavigations} nav • {Object.keys(navigationAnalytics.itemUsage).length} items used
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Loading indicator */}
        {(isLoading || isOrchestrationLoading || isWorkspaceLoading || isUserLoading || isCrossGroupLoading || isActivityLoading || isAILoading || isCollaborationLoading || isDashboardLoading) && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-600 origin-top"
          />
        )}
      </motion.aside>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {sidebarState.quickActionsVisible && showQuickActions && (
          <Suspense fallback={<div />}>
            <motion.div
              variants={quickActionsVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed right-0 top-16 bottom-0 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-l border-gray-200 dark:border-gray-700 z-30"
            >
              <QuickActionsPanel
                isOpen={sidebarState.quickActionsVisible}
                onClose={() => setSidebarState(prev => ({ ...prev, quickActionsVisible: false }))}
                sidebarItems={sidebarConfiguration.flatMap(section => section.items)}
                racineState={racineState}
                onNavigate={handleNavigate}
              />
            </motion.div>
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppSidebar;