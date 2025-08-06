/**
 * QuickActionsPanel - Advanced Quick Actions Subcomponent
 * ======================================================
 * 
 * Intelligent quick actions panel that provides contextual shortcuts and actions
 * for all Racine system components. Features AI-powered suggestions, contextual
 * actions based on current state, and seamless integration with all backend services.
 * 
 * Features:
 * - Context-aware quick actions based on current page/component
 * - AI-powered action suggestions and workflow recommendations
 * - Cross-group quick actions (create, navigate, execute)
 * - Recent actions history with smart prioritization
 * - Favorite actions with user customization
 * - Keyboard shortcuts and accessibility support
 * - Real-time status and progress indicators
 * - Drag-and-drop action organization
 * 
 * Backend Integration:
 * - All racine hooks for cross-group actions
 * - AI-powered recommendations
 * - User preference management
 * - Analytics and usage tracking
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  X, 
  Search, 
  Star, 
  Clock, 
  Zap, 
  Plus, 
  Play, 
  Settings, 
  Filter,
  SortAsc,
  Grid,
  List,
  Pin,
  PinOff,
  ExternalLink,
  ArrowRight,
  ChevronRight,
  Command,
  Keyboard,
  Activity,
  TrendingUp,
  Sparkles,
  Target,
  Layers,
  Workflow,
  Bot,
  RefreshCw,
  BookmarkPlus,
  History,
  Users,
  Database,
  Scan,
  Tags,
  Shield,
  FileText,
  BarChart3,
  MessageSquare,
  GitBranch,
  Home,
  Workspace
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
import {
  RacineState,
  QuickAction,
  SystemStatus,
  UUID
} from '../../../types/racine-core.types';

// Hooks
import { useAIAssistant } from '../../../hooks/useAIAssistant';
import { useActivityTracker } from '../../../hooks/useActivityTracker';
import { useUserManagement } from '../../../hooks/useUserManagement';

// ===================== INTERFACES AND TYPES =====================

interface QuickActionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarItems: any[];
  racineState: RacineState;
  onNavigate: (path: string, context?: any) => void;
  className?: string;
  maxActions?: number;
  showCategories?: boolean;
  showSearch?: boolean;
  showRecent?: boolean;
  showFavorites?: boolean;
  showAISuggestions?: boolean;
  allowCustomization?: boolean;
}

interface QuickActionCategory {
  id: string;
  name: string;
  icon: React.ComponentType;
  color: string;
  actions: EnhancedQuickAction[];
  isExpanded?: boolean;
  order: number;
}

interface EnhancedQuickAction extends QuickAction {
  id: string;
  name: string;
  icon: React.ComponentType;
  action?: () => void;
  path?: string;
  category: string;
  description?: string;
  shortcut?: string;
  isVisible?: boolean;
  isPinned?: boolean;
  isFavorite?: boolean;
  isRecent?: boolean;
  lastUsed?: Date;
  usage?: number;
  estimatedTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: SystemStatus;
  badge?: number | string;
  aiRecommended?: boolean;
  contextual?: boolean;
  dependencies?: string[];
  metadata?: {
    type: 'navigation' | 'creation' | 'execution' | 'configuration' | 'analysis';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tags: string[];
    group?: string;
  };
}

interface PanelState {
  searchQuery: string;
  selectedCategory: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'usage' | 'recent' | 'category' | 'priority';
  filterBy: string[];
  showOnlyFavorites: boolean;
  showOnlyRecent: boolean;
  showOnlyAI: boolean;
  pinnedActions: Set<string>;
  expandedCategories: Set<string>;
}

// ===================== ANIMATION VARIANTS =====================

const panelVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05
    }
  },
  closed: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const actionVariants = {
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2 }
  },
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const categoryVariants = {
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// ===================== MAIN COMPONENT =====================

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  isOpen,
  onClose,
  sidebarItems,
  racineState,
  onNavigate,
  className = '',
  maxActions = 50,
  showCategories = true,
  showSearch = true,
  showRecent = true,
  showFavorites = true,
  showAISuggestions = true,
  allowCustomization = true
}) => {
  // ===================== HOOKS AND STATE =====================

  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [panelState, setPanelState] = useState<PanelState>({
    searchQuery: '',
    selectedCategory: null,
    viewMode: 'grid',
    sortBy: 'priority',
    filterBy: [],
    showOnlyFavorites: false,
    showOnlyRecent: false,
    showOnlyAI: false,
    pinnedActions: new Set(['quick-search', 'create-workspace', 'system-health']),
    expandedCategories: new Set(['navigation', 'creation', 'ai'])
  });

  const [isLoading, setIsLoading] = useState(false);
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const [favoriteActions, setFavoriteActions] = useState<Set<string>>(new Set());

  // Custom hooks
  const {
    aiRecommendations,
    contextualInsights,
    getActionSuggestions,
    analyzeUserBehavior
  } = useAIAssistant();

  const {
    getRecentActivity,
    trackAction
  } = useActivityTracker();

  const {
    preferences,
    updatePreferences,
    checkPermission
  } = useUserManagement();

  // ===================== COMPUTED VALUES =====================

  // Generate comprehensive quick actions based on current context
  const quickActions = useMemo((): EnhancedQuickAction[] => {
    const baseActions: EnhancedQuickAction[] = [
      // Navigation Actions
      {
        id: 'nav-dashboard',
        name: 'Go to Dashboard',
        icon: Home,
        path: '/racine/dashboard',
        category: 'navigation',
        description: 'Navigate to main dashboard',
        shortcut: 'Ctrl+D',
        isVisible: true,
        metadata: {
          type: 'navigation',
          priority: 'high',
          tags: ['dashboard', 'overview', 'analytics']
        }
      },
      {
        id: 'nav-workspace',
        name: 'Workspace Manager',
        icon: Workspace,
        path: '/racine/workspace',
        category: 'navigation',
        description: 'Manage workspaces and environments',
        shortcut: 'Ctrl+W',
        isVisible: checkPermission('workspace.view'),
        metadata: {
          type: 'navigation',
          priority: 'high',
          tags: ['workspace', 'management']
        }
      },
      {
        id: 'nav-data-sources',
        name: 'Data Sources',
        icon: Database,
        path: '/racine/data-sources',
        category: 'navigation',
        description: 'Manage data source connections',
        isVisible: checkPermission('data_sources.view'),
        metadata: {
          type: 'navigation',
          priority: 'medium',
          tags: ['data-sources', 'connections'],
          group: 'data-governance'
        }
      },
      {
        id: 'nav-workflows',
        name: 'Job Workflows',
        icon: GitBranch,
        path: '/racine/workflows',
        category: 'navigation',
        description: 'Databricks-style workflow builder',
        isVisible: checkPermission('workflows.view'),
        metadata: {
          type: 'navigation',
          priority: 'medium',
          tags: ['workflows', 'orchestration']
        }
      },

      // Creation Actions
      {
        id: 'create-workspace',
        name: 'New Workspace',
        icon: Plus,
        action: () => onNavigate('/racine/workspace/create'),
        category: 'creation',
        description: 'Create new workspace with AI optimization',
        shortcut: 'Ctrl+N',
        isVisible: checkPermission('workspace.create'),
        estimatedTime: '5-10 min',
        difficulty: 'medium',
        aiRecommended: true,
        metadata: {
          type: 'creation',
          priority: 'high',
          tags: ['workspace', 'creation', 'ai-optimized']
        }
      },
      {
        id: 'create-data-source',
        name: 'Add Data Source',
        icon: Database,
        action: () => onNavigate('/racine/data-sources/create'),
        category: 'creation',
        description: 'Connect new data source',
        isVisible: checkPermission('data_sources.create'),
        estimatedTime: '3-5 min',
        difficulty: 'easy',
        metadata: {
          type: 'creation',
          priority: 'medium',
          tags: ['data-source', 'connection'],
          group: 'data-governance'
        }
      },
      {
        id: 'create-workflow',
        name: 'New Workflow',
        icon: GitBranch,
        action: () => onNavigate('/racine/workflows/create'),
        category: 'creation',
        description: 'Create new job workflow',
        isVisible: checkPermission('workflows.create'),
        estimatedTime: '10-15 min',
        difficulty: 'hard',
        metadata: {
          type: 'creation',
          priority: 'medium',
          tags: ['workflow', 'job', 'orchestration']
        }
      },
      {
        id: 'create-dashboard',
        name: 'Custom Dashboard',
        icon: BarChart3,
        action: () => onNavigate('/racine/dashboards/create'),
        category: 'creation',
        description: 'Build custom analytics dashboard',
        isVisible: checkPermission('dashboards.create'),
        estimatedTime: '15-20 min',
        difficulty: 'hard',
        metadata: {
          type: 'creation',
          priority: 'medium',
          tags: ['dashboard', 'analytics', 'visualization']
        }
      },

      // Execution Actions
      {
        id: 'run-scan',
        name: 'Run Data Scan',
        icon: Scan,
        action: () => onNavigate('/racine/scan-logic/execute'),
        category: 'execution',
        description: 'Execute data scanning workflow',
        isVisible: checkPermission('scan_logic.execute'),
        estimatedTime: '2-30 min',
        difficulty: 'medium',
        status: 'healthy',
        metadata: {
          type: 'execution',
          priority: 'medium',
          tags: ['scan', 'execution', 'data-quality'],
          group: 'data-governance'
        }
      },
      {
        id: 'test-connections',
        name: 'Test Connections',
        icon: Activity,
        action: () => onNavigate('/racine/data-sources/test'),
        category: 'execution',
        description: 'Test all data source connections',
        isVisible: checkPermission('data_sources.test'),
        estimatedTime: '1-5 min',
        difficulty: 'easy',
        metadata: {
          type: 'execution',
          priority: 'high',
          tags: ['test', 'connections', 'validation']
        }
      },
      {
        id: 'optimize-system',
        name: 'System Optimization',
        icon: Zap,
        action: () => onNavigate('/racine/system/optimize'),
        category: 'execution',
        description: 'AI-powered system optimization',
        isVisible: checkPermission('system.optimize'),
        estimatedTime: '5-10 min',
        difficulty: 'medium',
        aiRecommended: true,
        metadata: {
          type: 'execution',
          priority: 'medium',
          tags: ['optimization', 'performance', 'ai']
        }
      },

      // Configuration Actions
      {
        id: 'system-settings',
        name: 'System Settings',
        icon: Settings,
        path: '/racine/settings',
        category: 'configuration',
        description: 'Configure system preferences',
        isVisible: checkPermission('system.configure'),
        metadata: {
          type: 'configuration',
          priority: 'low',
          tags: ['settings', 'configuration']
        }
      },
      {
        id: 'user-preferences',
        name: 'User Preferences',
        icon: Users,
        path: '/racine/profile/preferences',
        category: 'configuration',
        description: 'Manage user preferences and settings',
        isVisible: true,
        metadata: {
          type: 'configuration',
          priority: 'low',
          tags: ['user', 'preferences', 'profile']
        }
      },
      {
        id: 'rbac-config',
        name: 'RBAC Configuration',
        icon: Shield,
        path: '/racine/rbac-system/config',
        category: 'configuration',
        description: 'Configure role-based access control',
        isVisible: checkPermission('rbac.admin'),
        metadata: {
          type: 'configuration',
          priority: 'medium',
          tags: ['rbac', 'security', 'access-control'],
          group: 'security'
        }
      },

      // Analysis Actions
      {
        id: 'system-health',
        name: 'System Health',
        icon: Activity,
        path: '/racine/monitoring/health',
        category: 'analysis',
        description: 'View comprehensive system health',
        shortcut: 'Ctrl+H',
        isVisible: checkPermission('system.monitor'),
        status: racineState.systemHealth?.overall || 'healthy',
        metadata: {
          type: 'analysis',
          priority: 'high',
          tags: ['health', 'monitoring', 'system']
        }
      },
      {
        id: 'activity-analytics',
        name: 'Activity Analytics',
        icon: TrendingUp,
        path: '/racine/activity-tracker/analytics',
        category: 'analysis',
        description: 'Analyze system and user activity',
        isVisible: checkPermission('activity.analytics'),
        metadata: {
          type: 'analysis',
          priority: 'medium',
          tags: ['analytics', 'activity', 'insights']
        }
      },
      {
        id: 'compliance-report',
        name: 'Compliance Report',
        icon: Shield,
        action: () => onNavigate('/racine/compliance-rules/report'),
        category: 'analysis',
        description: 'Generate compliance assessment report',
        isVisible: checkPermission('compliance.report'),
        estimatedTime: '5-15 min',
        difficulty: 'medium',
        metadata: {
          type: 'analysis',
          priority: 'medium',
          tags: ['compliance', 'report', 'audit'],
          group: 'data-governance'
        }
      },

      // AI Actions
      {
        id: 'ai-insights',
        name: 'AI Insights',
        icon: Bot,
        path: '/racine/ai-assistant/insights',
        category: 'ai',
        description: 'View AI-powered insights and recommendations',
        isVisible: checkPermission('ai.view'),
        aiRecommended: true,
        badge: aiRecommendations?.length || 0,
        metadata: {
          type: 'analysis',
          priority: 'high',
          tags: ['ai', 'insights', 'recommendations']
        }
      },
      {
        id: 'ai-chat',
        name: 'AI Assistant Chat',
        icon: MessageSquare,
        path: '/racine/ai-assistant/chat',
        category: 'ai',
        description: 'Chat with context-aware AI assistant',
        shortcut: 'Ctrl+I',
        isVisible: checkPermission('ai.chat'),
        contextual: true,
        metadata: {
          type: 'navigation',
          priority: 'high',
          tags: ['ai', 'chat', 'assistant']
        }
      },
      {
        id: 'ai-recommendations',
        name: 'Smart Recommendations',
        icon: Sparkles,
        action: () => getActionSuggestions(),
        category: 'ai',
        description: 'Get AI-powered action recommendations',
        isVisible: checkPermission('ai.recommendations'),
        aiRecommended: true,
        metadata: {
          type: 'analysis',
          priority: 'high',
          tags: ['ai', 'recommendations', 'smart']
        }
      }
    ];

    // Add AI-suggested actions if available
    if (showAISuggestions && aiRecommendations) {
      const aiActions = aiRecommendations.slice(0, 5).map((rec, index) => ({
        id: `ai-suggestion-${index}`,
        name: rec.title || 'AI Suggestion',
        icon: Sparkles,
        action: rec.action || (() => {}),
        category: 'ai',
        description: rec.description || 'AI-powered recommendation',
        isVisible: true,
        aiRecommended: true,
        contextual: true,
        metadata: {
          type: 'execution' as const,
          priority: 'high' as const,
          tags: ['ai', 'suggestion', 'contextual']
        }
      }));
      baseActions.push(...aiActions);
    }

    // Filter actions based on panel state and permissions
    return baseActions
      .filter(action => action.isVisible)
      .filter(action => {
        if (panelState.showOnlyFavorites && !favoriteActions.has(action.id)) return false;
        if (panelState.showOnlyRecent && !actionHistory.includes(action.id)) return false;
        if (panelState.showOnlyAI && !action.aiRecommended) return false;
        if (panelState.searchQuery) {
          const query = panelState.searchQuery.toLowerCase();
          return action.name.toLowerCase().includes(query) ||
                 action.description?.toLowerCase().includes(query) ||
                 action.metadata?.tags.some(tag => tag.includes(query));
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by pinned first
        const aPinned = panelState.pinnedActions.has(a.id);
        const bPinned = panelState.pinnedActions.has(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;

        // Then by sort criteria
        switch (panelState.sortBy) {
          case 'usage':
            return (b.usage || 0) - (a.usage || 0);
          case 'recent':
            const aIndex = actionHistory.indexOf(a.id);
            const bIndex = actionHistory.indexOf(b.id);
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          case 'priority':
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.metadata?.priority || 'medium'] - priorityOrder[b.metadata?.priority || 'medium'];
          case 'name':
            return a.name.localeCompare(b.name);
          case 'category':
            return a.category.localeCompare(b.category);
          default:
            return 0;
        }
      })
      .slice(0, maxActions);
  }, [
    sidebarItems,
    racineState,
    panelState,
    favoriteActions,
    actionHistory,
    aiRecommendations,
    checkPermission,
    showAISuggestions,
    maxActions,
    onNavigate,
    getActionSuggestions
  ]);

  // Group actions by category
  const actionCategories = useMemo((): QuickActionCategory[] => {
    const categories: Record<string, QuickActionCategory> = {
      navigation: {
        id: 'navigation',
        name: 'Navigation',
        icon: Target,
        color: 'blue',
        actions: [],
        isExpanded: panelState.expandedCategories.has('navigation'),
        order: 0
      },
      creation: {
        id: 'creation',
        name: 'Create New',
        icon: Plus,
        color: 'green',
        actions: [],
        isExpanded: panelState.expandedCategories.has('creation'),
        order: 1
      },
      execution: {
        id: 'execution',
        name: 'Execute',
        icon: Play,
        color: 'orange',
        actions: [],
        isExpanded: panelState.expandedCategories.has('execution'),
        order: 2
      },
      configuration: {
        id: 'configuration',
        name: 'Configure',
        icon: Settings,
        color: 'purple',
        actions: [],
        isExpanded: panelState.expandedCategories.has('configuration'),
        order: 3
      },
      analysis: {
        id: 'analysis',
        name: 'Analyze',
        icon: BarChart3,
        color: 'indigo',
        actions: [],
        isExpanded: panelState.expandedCategories.has('analysis'),
        order: 4
      },
      ai: {
        id: 'ai',
        name: 'AI Powered',
        icon: Bot,
        color: 'pink',
        actions: [],
        isExpanded: panelState.expandedCategories.has('ai'),
        order: 5
      }
    };

    // Group actions by category
    quickActions.forEach(action => {
      if (categories[action.category]) {
        categories[action.category].actions.push(action);
      }
    });

    // Filter out empty categories and sort
    return Object.values(categories)
      .filter(category => category.actions.length > 0)
      .sort((a, b) => a.order - b.order);
  }, [quickActions, panelState.expandedCategories]);

  // ===================== EVENT HANDLERS =====================

  const handleActionExecute = useCallback(async (action: EnhancedQuickAction) => {
    try {
      setIsLoading(true);

      // Track action usage
      setActionHistory(prev => [action.id, ...prev.filter(id => id !== action.id)].slice(0, 20));
      
      // Execute action
      if (action.action) {
        await action.action();
      } else if (action.path) {
        onNavigate(action.path, { actionId: action.id, category: action.category });
      }

      // Track in backend
      await trackAction({
        actionId: action.id,
        actionName: action.name,
        category: action.category,
        timestamp: new Date(),
        context: {
          source: 'quick-actions-panel',
          racineState
        }
      });

      // AI behavior analysis
      analyzeUserBehavior({
        action: 'quick_action_execute',
        target: action.id,
        category: action.category,
        metadata: action.metadata,
        timestamp: new Date()
      });

      toast.success(`Executed: ${action.name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Action failed';
      toast.error(`Failed to execute ${action.name}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [onNavigate, racineState, trackAction, analyzeUserBehavior]);

  const handleToggleFavorite = useCallback((actionId: string) => {
    setFavoriteActions(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(actionId)) {
        newFavorites.delete(actionId);
        toast.success('Removed from favorites');
      } else {
        newFavorites.add(actionId);
        toast.success('Added to favorites');
      }
      return newFavorites;
    });

    // Update user preferences
    if (preferences) {
      updatePreferences({
        ...preferences,
        favoriteQuickActions: Array.from(favoriteActions)
      });
    }
  }, [favoriteActions, preferences, updatePreferences]);

  const handleTogglePin = useCallback((actionId: string) => {
    setPanelState(prev => {
      const newPinnedActions = new Set(prev.pinnedActions);
      if (newPinnedActions.has(actionId)) {
        newPinnedActions.delete(actionId);
        toast.success('Unpinned action');
      } else {
        newPinnedActions.add(actionId);
        toast.success('Pinned action');
      }
      return {
        ...prev,
        pinnedActions: newPinnedActions
      };
    });
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setPanelState(prev => {
      const newExpandedCategories = new Set(prev.expandedCategories);
      if (newExpandedCategories.has(categoryId)) {
        newExpandedCategories.delete(categoryId);
      } else {
        newExpandedCategories.add(categoryId);
      }
      return {
        ...prev,
        expandedCategories: newExpandedCategories
      };
    });
  }, []);

  const handleSearch = useCallback((query: string) => {
    setPanelState(prev => ({
      ...prev,
      searchQuery: query
    }));
  }, []);

  // ===================== EFFECTS =====================

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Load user preferences
  useEffect(() => {
    if (preferences?.favoriteQuickActions) {
      setFavoriteActions(new Set(preferences.favoriteQuickActions));
    }
  }, [preferences]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      }

      // Number keys for quick action execution (1-9)
      if (event.key >= '1' && event.key <= '9' && !event.ctrlKey && !event.metaKey) {
        const actionIndex = parseInt(event.key) - 1;
        const visibleActions = quickActions.slice(0, 9);
        if (visibleActions[actionIndex]) {
          handleActionExecute(visibleActions[actionIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, quickActions, handleActionExecute, onClose]);

  // ===================== RENDER HELPERS =====================

  const renderActionCard = (action: EnhancedQuickAction, index: number) => {
    const isPinned = panelState.pinnedActions.has(action.id);
    const isFavorite = favoriteActions.has(action.id);
    const isRecent = actionHistory.includes(action.id);

    return (
      <motion.div
        key={action.id}
        variants={actionVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        layout
        className={cn(
          "group relative p-4 rounded-lg border cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600",
          "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          action.aiRecommended && "ring-2 ring-blue-200 dark:ring-blue-800",
          isPinned && "ring-2 ring-yellow-200 dark:ring-yellow-800"
        )}
        onClick={() => handleActionExecute(action)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg",
              action.aiRecommended ? "bg-blue-100 dark:bg-blue-900/20" :
              action.contextual ? "bg-purple-100 dark:bg-purple-900/20" :
              "bg-gray-100 dark:bg-gray-700"
            )}>
              <action.icon className={cn(
                "w-5 h-5",
                action.aiRecommended ? "text-blue-600 dark:text-blue-400" :
                action.contextual ? "text-purple-600 dark:text-purple-400" :
                "text-gray-600 dark:text-gray-400"
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {action.name}
              </h3>
              {action.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {action.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Number */}
          {index < 9 && (
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-500 dark:text-gray-400">
              {index + 1}
            </kbd>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {/* Category Badge */}
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              action.category === 'navigation' && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
              action.category === 'creation' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
              action.category === 'execution' && "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
              action.category === 'configuration' && "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
              action.category === 'analysis' && "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
              action.category === 'ai' && "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400"
            )}>
              {action.category}
            </span>

            {/* Status Indicators */}
            {action.aiRecommended && (
              <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-3 h-3" />
                <span>AI</span>
              </span>
            )}

            {action.estimatedTime && (
              <span className="flex items-center space-x-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{action.estimatedTime}</span>
              </span>
            )}

            {action.badge && (
              <span className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                {action.badge}
              </span>
            )}
          </div>

          {/* Keyboard Shortcut */}
          {action.shortcut && (
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-500 dark:text-gray-400">
              {action.shortcut}
            </kbd>
          )}
        </div>

        {/* Action Buttons (on hover) */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(action.id);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={cn(
              "w-3 h-3",
              isFavorite ? "text-yellow-500 fill-current" : "text-gray-400"
            )} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePin(action.id);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title={isPinned ? "Unpin action" : "Pin action"}
          >
            {isPinned ? (
              <PinOff className="w-3 h-3 text-yellow-600" />
            ) : (
              <Pin className="w-3 h-3 text-gray-400" />
            )}
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-2 left-2 flex items-center space-x-1">
          {isPinned && (
            <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Pinned" />
          )}
          {isFavorite && (
            <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Favorite" />
          )}
          {isRecent && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Recently used" />
          )}
        </div>
      </motion.div>
    );
  };

  const renderCategorySection = (category: QuickActionCategory) => {
    return (
      <div key={category.id} className="space-y-2">
        {/* Category Header */}
        <button
          onClick={() => handleCategoryToggle(category.id)}
          className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            <category.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {category.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({category.actions.length})
            </span>
          </div>
          
          <motion.div
            animate={{ rotate: category.isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </motion.div>
        </button>

        {/* Category Actions */}
        <AnimatePresence>
          {category.isExpanded && (
            <motion.div
              variants={categoryVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="grid gap-3"
              style={{
                gridTemplateColumns: panelState.viewMode === 'grid' ? 
                  'repeat(auto-fill, minmax(280px, 1fr))' : '1fr'
              }}
            >
              {category.actions.map((action, index) => 
                renderActionCard(action, index)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ===================== MAIN RENDER =====================

  if (!isOpen) return null;

  return (
    <motion.div
      ref={panelRef}
      variants={panelVariants}
      initial="closed"
      animate="open"
      exit="closed"
      className={cn(
        "h-full flex flex-col bg-white dark:bg-gray-900",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Quick Actions
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({quickActions.length})
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Search and Filters */}
      {showSearch && (
        <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search actions..."
              value={panelState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono text-gray-500">
              ⌘K
            </kbd>
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => setPanelState(prev => ({ ...prev, showOnlyFavorites: !prev.showOnlyFavorites }))}
              className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded transition-colors",
                panelState.showOnlyFavorites 
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
            >
              <Star className="w-3 h-3" />
              <span>Favorites</span>
            </button>

            <button
              onClick={() => setPanelState(prev => ({ ...prev, showOnlyRecent: !prev.showOnlyRecent }))}
              className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded transition-colors",
                panelState.showOnlyRecent 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
            >
              <History className="w-3 h-3" />
              <span>Recent</span>
            </button>

            {showAISuggestions && (
              <button
                onClick={() => setPanelState(prev => ({ ...prev, showOnlyAI: !prev.showOnlyAI }))}
                className={cn(
                  "flex items-center space-x-1 px-2 py-1 rounded transition-colors",
                  panelState.showOnlyAI 
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}
              >
                <Sparkles className="w-3 h-3" />
                <span>AI</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {showCategories ? (
          <div className="space-y-6">
            {actionCategories.map(category => renderCategorySection(category))}
          </div>
        ) : (
          <div 
            className="grid gap-3"
            style={{
              gridTemplateColumns: panelState.viewMode === 'grid' ? 
                'repeat(auto-fill, minmax(280px, 1fr))' : '1fr'
            }}
          >
            {quickActions.map((action, index) => renderActionCard(action, index))}
          </div>
        )}

        {quickActions.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No actions found matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Use 1-9 keys for quick access</span>
            <span>⌘K to search</span>
          </div>
          
          {isLoading && (
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Executing...</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuickActionsPanel;