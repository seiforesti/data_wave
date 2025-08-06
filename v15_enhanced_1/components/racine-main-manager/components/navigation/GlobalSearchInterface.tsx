/**
 * GlobalSearchInterface - Advanced Cross-Group Search System
 * =========================================================
 * 
 * Intelligent search interface that provides unified search across all Racine system
 * components and groups. Features AI-powered ranking, contextual results, advanced
 * filtering, and seamless integration with all backend services.
 * 
 * Key Features:
 * - AI-powered search with contextual ranking and relevance scoring
 * - Cross-group unified search across all 7 core groups + Racine components
 * - Advanced filtering by group, type, status, date, and custom criteria
 * - Real-time search suggestions and auto-completion
 * - Recent searches history with intelligent recommendations
 * - Saved searches with alerts and monitoring capabilities
 * - Search analytics and performance optimization
 * - Keyboard navigation and accessibility compliance
 * - Export and sharing of search results
 * - Integration with workflow and pipeline creation
 * 
 * Backend Integration:
 * - cross-group-integration-apis.ts: Unified search across all groups
 * - ai-assistant-apis.ts: AI-powered ranking and suggestions
 * - activity-tracker-apis.ts: Search history and analytics
 * - user-management-apis.ts: Personalized search preferences
 */

import React, { useState, useCallback, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Search,
  X,
  Filter,
  SortAsc,
  Clock,
  Star,
  Bookmark,
  History,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Download,
  Share2,
  Plus,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Circle,
  Database,
  Scan,
  Tags,
  Shield,
  FileText,
  Activity,
  Users,
  BarChart3,
  MessageSquare,
  GitBranch,
  Bot,
  Layers,
  Home,
  Workspace,
  Target,
  Zap,
  Command,
  Enter,
  ArrowUp,
  ArrowDown,
  Calendar,
  MapPin,
  User,
  Globe,
  Eye,
  EyeOff,
  Save,
  Bell,
  BellOff,
  Copy,
  Link,
  FileDown,
  Grid,
  List,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Hash,
  Type,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

// Hooks and Services
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';

// Types
import {
  RacineState,
  SearchResult,
  SearchFilter,
  SystemStatus,
  UUID,
  ISODateString
} from '../../types/racine-core.types';

// Constants
import { SUPPORTED_GROUPS } from '../../constants/cross-group-configs';

// ===================== INTERFACES AND TYPES =====================

interface GlobalSearchInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  searchConfig: SearchConfig;
  racineState: RacineState;
  onNavigate: (path: string, context?: any) => void;
  className?: string;
  placeholder?: string;
  maxResults?: number;
  enableAdvancedFilters?: boolean;
  enableSavedSearches?: boolean;
  enableSearchHistory?: boolean;
  enableAISuggestions?: boolean;
  enableExport?: boolean;
  debugMode?: boolean;
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

interface EnhancedSearchResult extends SearchResult {
  id: string;
  title: string;
  description?: string;
  type: string;
  group: string;
  path?: string;
  url?: string;
  status?: SystemStatus;
  relevanceScore: number;
  aiRanking?: number;
  contextualScore?: number;
  lastModified?: Date;
  createdBy?: string;
  tags?: string[];
  metadata?: {
    category: string;
    subcategory?: string;
    complexity?: 'basic' | 'intermediate' | 'advanced';
    estimatedTime?: string;
    dependencies?: string[];
    permissions?: string[];
  };
  preview?: {
    content: string;
    highlights: string[];
    thumbnail?: string;
  };
  actions?: SearchResultAction[];
}

interface SearchResultAction {
  id: string;
  name: string;
  icon: React.ComponentType;
  action: () => void;
  shortcut?: string;
  isVisible?: boolean;
  isPrimary?: boolean;
}

interface SearchState {
  query: string;
  isSearching: boolean;
  results: EnhancedSearchResult[];
  filteredResults: EnhancedSearchResult[];
  selectedIndex: number;
  activeFilters: Set<string>;
  sortBy: 'relevance' | 'date' | 'name' | 'type' | 'group';
  sortOrder: 'asc' | 'desc';
  viewMode: 'list' | 'grid' | 'compact';
  showFilters: boolean;
  showHistory: boolean;
  showSuggestions: boolean;
  showPreview: boolean;
  selectedResult: EnhancedSearchResult | null;
  searchHistory: SearchHistoryItem[];
  savedSearches: SavedSearch[];
  suggestions: SearchSuggestion[];
  recentQueries: string[];
  totalResults: number;
  searchTime: number;
  hasMore: boolean;
  page: number;
  error: string | null;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  filters: string[];
  executionTime: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: string[];
  alertsEnabled: boolean;
  lastRun?: Date;
  resultCount?: number;
  createdAt: Date;
  description?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'completion' | 'suggestion' | 'recent' | 'ai';
  score: number;
  context?: string;
  action?: () => void;
}

interface SearchAnalytics {
  totalSearches: number;
  averageSearchTime: number;
  popularQueries: string[];
  clickThroughRate: number;
  searchSuccessRate: number;
  lastSearchTime: Date;
}

// ===================== ANIMATION VARIANTS =====================

const overlayVariants = {
  open: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  closed: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const modalVariants = {
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05
    }
  },
  closed: {
    opacity: 0,
    scale: 0.95,
    y: -50,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const resultVariants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 }
  },
  hidden: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2 }
  }
};

const suggestionVariants = {
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 }
  },
  hidden: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.2 }
  }
};

// ===================== MAIN COMPONENT =====================

const GlobalSearchInterface: React.FC<GlobalSearchInterfaceProps> = ({
  isOpen,
  onClose,
  onSearch,
  searchConfig,
  racineState,
  onNavigate,
  className = '',
  placeholder = 'Search across all groups with AI...',
  maxResults = 100,
  enableAdvancedFilters = true,
  enableSavedSearches = true,
  enableSearchHistory = true,
  enableAISuggestions = true,
  enableExport = true,
  debugMode = false
}) => {
  // ===================== HOOKS AND STATE =====================

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    isSearching: false,
    results: [],
    filteredResults: [],
    selectedIndex: -1,
    activeFilters: new Set(),
    sortBy: 'relevance',
    sortOrder: 'desc',
    viewMode: 'list',
    showFilters: false,
    showHistory: false,
    showSuggestions: true,
    showPreview: false,
    selectedResult: null,
    searchHistory: [],
    savedSearches: [],
    suggestions: [],
    recentQueries: [],
    totalResults: 0,
    searchTime: 0,
    hasMore: false,
    page: 1,
    error: null
  });

  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics>({
    totalSearches: 0,
    averageSearchTime: 0,
    popularQueries: [],
    clickThroughRate: 0,
    searchSuccessRate: 0,
    lastSearchTime: new Date()
  });

  // Custom hooks for comprehensive backend integration
  const {
    searchAllGroups,
    getGroupNavigation,
    getCrossGroupMetrics,
    isLoading: isCrossGroupLoading,
    error: crossGroupError
  } = useCrossGroupIntegration();

  const {
    aiRecommendations,
    contextualInsights,
    getSearchSuggestions,
    analyzeSearchBehavior,
    rankSearchResults,
    isLoading: isAILoading,
    error: aiError
  } = useAIAssistant();

  const {
    getRecentActivity,
    trackSearchActivity,
    getSearchAnalytics,
    isLoading: isActivityLoading
  } = useActivityTracker();

  const {
    preferences,
    updatePreferences,
    checkPermission,
    isLoading: isUserLoading
  } = useUserManagement();

  const {
    systemHealth,
    performanceMetrics,
    isLoading: isOrchestrationLoading
  } = useRacineOrchestration(racineState.activeWorkspaceId || '', racineState);

  // ===================== COMPUTED VALUES =====================

  // Enhanced search filters with dynamic options
  const searchFilters = useMemo(() => {
    const baseFilters = [
      {
        id: 'groups',
        name: 'Groups',
        type: 'multiselect',
        options: SUPPORTED_GROUPS.map(group => ({
          id: group.id,
          name: group.name,
          icon: group.icon,
          count: searchState.results.filter(r => r.group === group.id).length
        }))
      },
      {
        id: 'types',
        name: 'Types',
        type: 'multiselect',
        options: [
          { id: 'component', name: 'Components', icon: Target, count: 0 },
          { id: 'workflow', name: 'Workflows', icon: GitBranch, count: 0 },
          { id: 'dashboard', name: 'Dashboards', icon: BarChart3, count: 0 },
          { id: 'data-source', name: 'Data Sources', icon: Database, count: 0 },
          { id: 'rule', name: 'Rules', icon: Shield, count: 0 },
          { id: 'classification', name: 'Classifications', icon: Tags, count: 0 },
          { id: 'catalog', name: 'Catalog Items', icon: FileText, count: 0 },
          { id: 'user', name: 'Users', icon: Users, count: 0 }
        ]
      },
      {
        id: 'status',
        name: 'Status',
        type: 'multiselect',
        options: [
          { id: 'healthy', name: 'Healthy', icon: CheckCircle, count: 0 },
          { id: 'degraded', name: 'Degraded', icon: AlertCircle, count: 0 },
          { id: 'failed', name: 'Failed', icon: XCircle, count: 0 },
          { id: 'initializing', name: 'Initializing', icon: RefreshCw, count: 0 }
        ]
      },
      {
        id: 'modified',
        name: 'Last Modified',
        type: 'daterange',
        options: [
          { id: 'today', name: 'Today', count: 0 },
          { id: 'week', name: 'This Week', count: 0 },
          { id: 'month', name: 'This Month', count: 0 },
          { id: 'year', name: 'This Year', count: 0 }
        ]
      },
      {
        id: 'complexity',
        name: 'Complexity',
        type: 'multiselect',
        options: [
          { id: 'basic', name: 'Basic', count: 0 },
          { id: 'intermediate', name: 'Intermediate', count: 0 },
          { id: 'advanced', name: 'Advanced', count: 0 }
        ]
      }
    ];

    // Update counts based on current results
    baseFilters.forEach(filter => {
      filter.options.forEach(option => {
        option.count = searchState.results.filter(result => {
          switch (filter.id) {
            case 'groups':
              return result.group === option.id;
            case 'types':
              return result.type === option.id;
            case 'status':
              return result.status === option.id;
            case 'complexity':
              return result.metadata?.complexity === option.id;
            default:
              return false;
          }
        }).length;
      });
    });

    return baseFilters;
  }, [searchState.results]);

  // AI-powered search suggestions
  const enhancedSuggestions = useMemo((): SearchSuggestion[] => {
    const baseSuggestions: SearchSuggestion[] = [];

    // Recent queries
    searchState.recentQueries.slice(0, 5).forEach((query, index) => {
      baseSuggestions.push({
        id: `recent-${index}`,
        text: query,
        type: 'recent',
        score: 1.0 - (index * 0.1),
        context: 'Recent search'
      });
    });

    // AI suggestions based on context
    if (enableAISuggestions && contextualInsights) {
      contextualInsights.suggestions?.slice(0, 3).forEach((suggestion, index) => {
        baseSuggestions.push({
          id: `ai-${index}`,
          text: suggestion.text || '',
          type: 'ai',
          score: suggestion.confidence || 0.8,
          context: 'AI suggestion',
          action: suggestion.action
        });
      });
    }

    // Popular queries from analytics
    searchAnalytics.popularQueries.slice(0, 3).forEach((query, index) => {
      if (!baseSuggestions.find(s => s.text === query)) {
        baseSuggestions.push({
          id: `popular-${index}`,
          text: query,
          type: 'suggestion',
          score: 0.9 - (index * 0.1),
          context: 'Popular search'
        });
      }
    });

    // Auto-completion based on current query
    if (searchState.query.length > 1) {
      const completions = generateAutoCompletions(searchState.query, searchState.results);
      completions.forEach((completion, index) => {
        baseSuggestions.push({
          id: `completion-${index}`,
          text: completion,
          type: 'completion',
          score: 0.7,
          context: 'Auto-complete'
        });
      });
    }

    return baseSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [
    searchState.query,
    searchState.recentQueries,
    searchState.results,
    contextualInsights,
    searchAnalytics.popularQueries,
    enableAISuggestions
  ]);

  // Filtered and sorted results
  const processedResults = useMemo(() => {
    let filtered = [...searchState.results];

    // Apply filters
    if (searchState.activeFilters.size > 0) {
      filtered = filtered.filter(result => {
        return Array.from(searchState.activeFilters).every(filterId => {
          // Parse filter ID (format: "filterType:value")
          const [filterType, value] = filterId.split(':');
          
          switch (filterType) {
            case 'groups':
              return result.group === value;
            case 'types':
              return result.type === value;
            case 'status':
              return result.status === value;
            case 'complexity':
              return result.metadata?.complexity === value;
            case 'modified':
              return checkDateFilter(result.lastModified, value);
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (searchState.sortBy) {
        case 'relevance':
          comparison = (b.relevanceScore || 0) - (a.relevanceScore || 0);
          if (comparison === 0) {
            comparison = (b.aiRanking || 0) - (a.aiRanking || 0);
          }
          break;
        case 'date':
          comparison = (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0);
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'group':
          comparison = a.group.localeCompare(b.group);
          break;
      }
      
      return searchState.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [
    searchState.results,
    searchState.activeFilters,
    searchState.sortBy,
    searchState.sortOrder
  ]);

  // ===================== EVENT HANDLERS =====================

  // Advanced search execution with AI enhancement
  const handleSearch = useCallback(async (query: string, options: any = {}) => {
    if (!query.trim()) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        filteredResults: [],
        selectedIndex: -1,
        error: null
      }));
      return;
    }

    try {
      setSearchState(prev => ({
        ...prev,
        isSearching: true,
        error: null
      }));

      const startTime = Date.now();

      // Execute cross-group search
      const searchResults = await searchAllGroups({
        query: query.trim(),
        filters: Array.from(searchState.activeFilters),
        limit: maxResults,
        aiRanking: enableAISuggestions,
        includeContext: true,
        userContext: {
          currentWorkspace: racineState.activeWorkspaceId,
          recentActivity: await getRecentActivity(),
          preferences: preferences
        },
        ...options
      });

      const searchTime = Date.now() - startTime;

      // Enhance results with AI ranking if enabled
      let enhancedResults = searchResults;
      if (enableAISuggestions && rankSearchResults) {
        enhancedResults = await rankSearchResults(searchResults, {
          query,
          userContext: racineState,
          searchHistory: searchState.searchHistory
        });
      }

      // Transform to enhanced search results
      const processedResults: EnhancedSearchResult[] = enhancedResults.map((result, index) => ({
        ...result,
        id: result.id || `result-${index}`,
        relevanceScore: result.relevanceScore || (1.0 - index * 0.01),
        aiRanking: result.aiRanking || index,
        actions: generateResultActions(result)
      }));

      // Update state
      setSearchState(prev => ({
        ...prev,
        results: processedResults,
        filteredResults: processedResults,
        totalResults: processedResults.length,
        searchTime,
        isSearching: false,
        recentQueries: [query, ...prev.recentQueries.filter(q => q !== query)].slice(0, 10)
      }));

      // Track search activity
      const historyItem: SearchHistoryItem = {
        id: `search-${Date.now()}`,
        query,
        timestamp: new Date(),
        resultCount: processedResults.length,
        filters: Array.from(searchState.activeFilters),
        executionTime: searchTime
      };

      setSearchState(prev => ({
        ...prev,
        searchHistory: [historyItem, ...prev.searchHistory].slice(0, 50)
      }));

      // Update analytics
      setSearchAnalytics(prev => ({
        ...prev,
        totalSearches: prev.totalSearches + 1,
        averageSearchTime: (prev.averageSearchTime + searchTime) / 2,
        lastSearchTime: new Date(),
        searchSuccessRate: processedResults.length > 0 ? 
          (prev.searchSuccessRate * prev.totalSearches + 1) / (prev.totalSearches + 1) :
          prev.searchSuccessRate
      }));

      // Track in backend
      await trackSearchActivity({
        query,
        resultCount: processedResults.length,
        searchTime,
        filters: Array.from(searchState.activeFilters),
        timestamp: new Date(),
        context: {
          source: 'global-search',
          racineState
        }
      });

      // AI behavior analysis
      analyzeSearchBehavior({
        query,
        results: processedResults,
        searchTime,
        filters: Array.from(searchState.activeFilters),
        timestamp: new Date()
      });

      if (debugMode) {
        console.log('GlobalSearch: Search completed', {
          query,
          resultCount: processedResults.length,
          searchTime,
          filters: Array.from(searchState.activeFilters)
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        error: errorMessage
      }));
      toast.error(`Search failed: ${errorMessage}`);
    }
  }, [
    searchAllGroups,
    maxResults,
    enableAISuggestions,
    rankSearchResults,
    racineState,
    getRecentActivity,
    preferences,
    searchState.activeFilters,
    searchState.searchHistory,
    trackSearchActivity,
    analyzeSearchBehavior,
    debugMode
  ]);

  // Debounced search for real-time results
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 2) {
        handleSearch(query);
      }
    }, 300),
    [handleSearch]
  );

  // Handle input changes with suggestions
  const handleInputChange = useCallback((value: string) => {
    setSearchState(prev => ({
      ...prev,
      query: value,
      selectedIndex: -1,
      showSuggestions: value.length > 0
    }));

    // Trigger debounced search
    debouncedSearch(value);

    // Get AI suggestions if enabled
    if (enableAISuggestions && value.length > 1) {
      getSearchSuggestions(value, {
        context: racineState,
        recentSearches: searchState.recentQueries
      });
    }
  }, [debouncedSearch, enableAISuggestions, getSearchSuggestions, racineState, searchState.recentQueries]);

  // Handle result selection and navigation
  const handleResultSelect = useCallback((result: EnhancedSearchResult, action?: string) => {
    // Track click-through
    setSearchAnalytics(prev => ({
      ...prev,
      clickThroughRate: (prev.clickThroughRate * prev.totalSearches + 1) / (prev.totalSearches + 1)
    }));

    // Execute action or navigate
    if (action === 'preview') {
      setSearchState(prev => ({
        ...prev,
        selectedResult: result,
        showPreview: true
      }));
    } else if (result.path) {
      onNavigate(result.path, {
        searchQuery: searchState.query,
        resultId: result.id,
        source: 'global-search'
      });
      onClose();
    } else if (result.url) {
      window.open(result.url, '_blank');
      onClose();
    }

    // Track selection
    analyzeSearchBehavior({
      action: 'result_select',
      query: searchState.query,
      selectedResult: result,
      timestamp: new Date()
    });
  }, [searchState.query, onNavigate, onClose, analyzeSearchBehavior]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterId: string, enabled: boolean) => {
    setSearchState(prev => {
      const newActiveFilters = new Set(prev.activeFilters);
      if (enabled) {
        newActiveFilters.add(filterId);
      } else {
        newActiveFilters.delete(filterId);
      }
      
      return {
        ...prev,
        activeFilters: newActiveFilters
      };
    });

    // Re-run search with new filters
    if (searchState.query) {
      handleSearch(searchState.query);
    }
  }, [searchState.query, handleSearch]);

  // Handle saved search creation
  const handleSaveSearch = useCallback((name: string, enableAlerts: boolean = false) => {
    const savedSearch: SavedSearch = {
      id: `saved-${Date.now()}`,
      name,
      query: searchState.query,
      filters: Array.from(searchState.activeFilters),
      alertsEnabled: enableAlerts,
      createdAt: new Date(),
      resultCount: searchState.results.length
    };

    setSearchState(prev => ({
      ...prev,
      savedSearches: [savedSearch, ...prev.savedSearches]
    }));

    // Update user preferences
    if (preferences) {
      updatePreferences({
        ...preferences,
        savedSearches: [savedSearch, ...(preferences.savedSearches || [])]
      });
    }

    toast.success(`Search saved: ${name}`);
  }, [searchState.query, searchState.activeFilters, searchState.results.length, preferences, updatePreferences]);

  // ===================== KEYBOARD NAVIGATION =====================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          if (searchState.showPreview) {
            setSearchState(prev => ({ ...prev, showPreview: false, selectedResult: null }));
          } else {
            onClose();
          }
          break;

        case 'ArrowDown':
          event.preventDefault();
          setSearchState(prev => ({
            ...prev,
            selectedIndex: Math.min(prev.selectedIndex + 1, processedResults.length - 1),
            showSuggestions: false
          }));
          break;

        case 'ArrowUp':
          event.preventDefault();
          setSearchState(prev => ({
            ...prev,
            selectedIndex: Math.max(prev.selectedIndex - 1, -1),
            showSuggestions: prev.selectedIndex === 0
          }));
          break;

        case 'Enter':
          event.preventDefault();
          if (searchState.selectedIndex >= 0 && processedResults[searchState.selectedIndex]) {
            handleResultSelect(processedResults[searchState.selectedIndex]);
          } else if (searchState.query) {
            handleSearch(searchState.query);
          }
          break;

        case 'Tab':
          if (enhancedSuggestions.length > 0 && searchState.showSuggestions) {
            event.preventDefault();
            const firstSuggestion = enhancedSuggestions[0];
            setSearchState(prev => ({
              ...prev,
              query: firstSuggestion.text,
              showSuggestions: false
            }));
            handleSearch(firstSuggestion.text);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    searchState.selectedIndex,
    searchState.showPreview,
    searchState.query,
    searchState.showSuggestions,
    processedResults,
    enhancedSuggestions,
    handleResultSelect,
    handleSearch,
    onClose
  ]);

  // ===================== EFFECTS =====================

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Load user preferences and search history
  useEffect(() => {
    if (preferences) {
      setSearchState(prev => ({
        ...prev,
        recentQueries: preferences.recentSearches || [],
        savedSearches: preferences.savedSearches || []
      }));
    }
  }, [preferences]);

  // Auto-scroll selected result into view
  useLayoutEffect(() => {
    if (searchState.selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[searchState.selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [searchState.selectedIndex]);

  // ===================== RENDER HELPERS =====================

  const renderSearchInput = () => (
    <div className="relative">
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchState.query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full pl-11 pr-12 py-3 bg-transparent text-lg",
              "focus:outline-none focus:ring-0",
              "placeholder-gray-400 dark:placeholder-gray-500",
              "text-gray-900 dark:text-gray-100"
            )}
            autoComplete="off"
            spellCheck={false}
          />
          
          {/* Search shortcuts */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {searchState.isSearching && (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            )}
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-500">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {enableAdvancedFilters && (
            <button
              onClick={() => setSearchState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              className={cn(
                "p-2 rounded-lg transition-colors",
                searchState.showFilters 
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              )}
              title="Advanced filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          )}

          {enableSearchHistory && (
            <button
              onClick={() => setSearchState(prev => ({ ...prev, showHistory: !prev.showHistory }))}
              className={cn(
                "p-2 rounded-lg transition-colors",
                searchState.showHistory 
                  ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              )}
              title="Search history"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
            title="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search suggestions */}
      <AnimatePresence>
        {searchState.showSuggestions && enhancedSuggestions.length > 0 && (
          <motion.div
            variants={suggestionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="p-2 space-y-1">
              {enhancedSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => {
                    if (suggestion.action) {
                      suggestion.action();
                    } else {
                      setSearchState(prev => ({ ...prev, query: suggestion.text, showSuggestions: false }));
                      handleSearch(suggestion.text);
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    {suggestion.type === 'ai' && <Sparkles className="w-4 h-4 text-blue-500" />}
                    {suggestion.type === 'recent' && <Clock className="w-4 h-4 text-gray-400" />}
                    {suggestion.type === 'suggestion' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {suggestion.type === 'completion' && <Type className="w-4 h-4 text-purple-500" />}
                    
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {suggestion.text}
                    </span>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {suggestion.context}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderFilters = () => {
    if (!searchState.showFilters) return null;

    return (
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Filters</h3>
            <button
              onClick={() => setSearchState(prev => ({ ...prev, activeFilters: new Set() }))}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchFilters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filter.name}
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filter.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-white dark:hover:bg-gray-700 px-2 py-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={searchState.activeFilters.has(`${filter.id}:${option.id}`)}
                        onChange={(e) => handleFilterChange(`${filter.id}:${option.id}`, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        {option.icon && <option.icon className="w-3 h-3 text-gray-400" />}
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {option.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({option.count})
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSearchResults = () => {
    if (searchState.isSearching) {
      return (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Searching across all groups...</p>
            {debugMode && (
              <p className="text-xs text-gray-400 mt-2">
                AI-powered ranking enabled
              </p>
            )}
          </div>
        </div>
      );
    }

    if (searchState.error) {
      return (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-2">Search Error</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{searchState.error}</p>
            <button
              onClick={() => handleSearch(searchState.query)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry Search
            </button>
          </div>
        </div>
      );
    }

    if (!searchState.query) {
      return (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Search across all groups
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Find components, workflows, data sources, rules, and more with AI-powered search
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span>⌘K to focus</span>
              <span>↑↓ to navigate</span>
              <span>Enter to select</span>
            </div>
          </div>
        </div>
      );
    }

    if (processedResults.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No results found</p>
            <p className="text-sm text-gray-400">
              Try adjusting your search terms or filters
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-hidden">
        {/* Results header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {processedResults.length} results
              {searchState.searchTime > 0 && (
                <span className="ml-2">({searchState.searchTime}ms)</span>
              )}
            </span>
            
            {searchState.activeFilters.size > 0 && (
              <div className="flex items-center space-x-2">
                {Array.from(searchState.activeFilters).slice(0, 3).map(filterId => {
                  const [type, value] = filterId.split(':');
                  return (
                    <span
                      key={filterId}
                      className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs"
                    >
                      {value}
                    </span>
                  );
                })}
                {searchState.activeFilters.size > 3 && (
                  <span className="text-xs text-gray-500">
                    +{searchState.activeFilters.size - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Sort controls */}
            <select
              value={searchState.sortBy}
              onChange={(e) => setSearchState(prev => ({ 
                ...prev, 
                sortBy: e.target.value as any 
              }))}
              className="text-sm bg-transparent border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="group">Group</option>
            </select>

            {/* View mode toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setSearchState(prev => ({ ...prev, viewMode: 'list' }))}
                className={cn(
                  "p-1 rounded transition-colors",
                  searchState.viewMode === 'list' 
                    ? "bg-white dark:bg-gray-600 shadow-sm" 
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSearchState(prev => ({ ...prev, viewMode: 'grid' }))}
                className={cn(
                  "p-1 rounded transition-colors",
                  searchState.viewMode === 'grid' 
                    ? "bg-white dark:bg-gray-600 shadow-sm" 
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Save search */}
            {enableSavedSearches && searchState.query && (
              <button
                onClick={() => {
                  const name = prompt('Save search as:', searchState.query);
                  if (name) handleSaveSearch(name);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Save search"
              >
                <Bookmark className="w-4 h-4 text-gray-500" />
              </button>
            )}

            {/* Export results */}
            {enableExport && processedResults.length > 0 && (
              <button
                onClick={() => exportSearchResults(processedResults, searchState.query)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Export results"
              >
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Results list */}
        <div
          ref={resultsRef}
          className="flex-1 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
          <div className={cn(
            "p-4",
            searchState.viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"
          )}>
            <AnimatePresence>
              {processedResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  variants={resultVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                  className={cn(
                    "group cursor-pointer rounded-lg border transition-all duration-200",
                    "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600",
                    searchState.selectedIndex === index 
                      ? "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-600"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  )}
                  onClick={() => handleResultSelect(result)}
                >
                  {searchState.viewMode === 'grid' ? 
                    renderGridResult(result, index) : 
                    renderListResult(result, index)
                  }
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  const renderListResult = (result: EnhancedSearchResult, index: number) => (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            {/* Group icon */}
            {getGroupIcon(result.group) && (
              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                {React.createElement(getGroupIcon(result.group)!, { className: "w-4 h-4 text-gray-600 dark:text-gray-400" })}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {highlightText(result.title, searchState.query)}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="capitalize">{result.type}</span>
                <span>•</span>
                <span className="capitalize">{result.group.replace('-', ' ')}</span>
                {result.lastModified && (
                  <>
                    <span>•</span>
                    <span>{formatDistanceToNow(result.lastModified, { addSuffix: true })}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {result.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
              {highlightText(result.description, searchState.query)}
            </p>
          )}

          <div className="flex items-center space-x-4">
            {/* Relevance score */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400">Relevance:</span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1 h-3 rounded-full",
                      i < Math.floor(result.relevanceScore * 5) 
                        ? "bg-blue-500" 
                        : "bg-gray-200 dark:bg-gray-600"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* AI ranking indicator */}
            {result.aiRanking !== undefined && enableAISuggestions && (
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400">AI Ranked</span>
              </div>
            )}

            {/* Status indicator */}
            {result.status && result.status !== 'healthy' && (
              <div className="flex items-center space-x-1">
                {result.status === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
                {result.status === 'degraded' && <AlertCircle className="w-3 h-3 text-yellow-500" />}
                {result.status === 'initializing' && <RefreshCw className="w-3 h-3 text-gray-500 animate-spin" />}
                <span className="text-xs text-gray-500 capitalize">{result.status}</span>
              </div>
            )}

            {/* Tags */}
            {result.tags && result.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                {result.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {result.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{result.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {/* Quick actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResultSelect(result, 'preview');
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Preview"
            >
              <Eye className="w-3 h-3 text-gray-500" />
            </button>
            
            {result.url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(result.url, '_blank');
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>

          {/* Keyboard shortcut indicator */}
          {index < 9 && (
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-500">
              {index + 1}
            </kbd>
          )}
        </div>
      </div>
    </div>
  );

  const renderGridResult = (result: EnhancedSearchResult, index: number) => (
    <div className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getGroupIcon(result.group) && (
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {React.createElement(getGroupIcon(result.group)!, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" })}
            </div>
          )}
          {index < 9 && (
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-500">
              {index + 1}
            </kbd>
          )}
        </div>
        
        {result.aiRanking !== undefined && enableAISuggestions && (
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
          </div>
        )}
      </div>

      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
        {highlightText(result.title, searchState.query)}
      </h3>

      {result.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
          {highlightText(result.description, searchState.query)}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <span className="capitalize">{result.type}</span>
          <span>•</span>
          <span className="capitalize">{result.group.replace('-', ' ')}</span>
        </div>
        
        {result.lastModified && (
          <span>{formatDistanceToNow(result.lastModified, { addSuffix: true })}</span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 h-2 rounded-full",
                i < Math.floor(result.relevanceScore * 5) 
                  ? "bg-blue-500" 
                  : "bg-gray-200 dark:bg-gray-600"
              )}
            />
          ))}
        </div>

        {result.status && result.status !== 'healthy' && (
          <div className="flex items-center space-x-1">
            {result.status === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
            {result.status === 'degraded' && <AlertCircle className="w-3 h-3 text-yellow-500" />}
            {result.status === 'initializing' && <RefreshCw className="w-3 h-3 text-gray-500 animate-spin" />}
          </div>
        )}
      </div>
    </div>
  );

  // ===================== UTILITY FUNCTIONS =====================

  const generateAutoCompletions = (query: string, results: EnhancedSearchResult[]): string[] => {
    const completions = new Set<string>();
    const words = query.toLowerCase().split(' ');
    const lastWord = words[words.length - 1];

    // Generate completions from result titles
    results.forEach(result => {
      const titleWords = result.title.toLowerCase().split(' ');
      titleWords.forEach(word => {
        if (word.startsWith(lastWord) && word !== lastWord) {
          const completion = [...words.slice(0, -1), word].join(' ');
          completions.add(completion);
        }
      });
    });

    return Array.from(completions).slice(0, 5);
  };

  const getGroupIcon = (groupId: string): React.ComponentType | null => {
    const group = SUPPORTED_GROUPS.find(g => g.id === groupId);
    return group?.icon || null;
  };

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const checkDateFilter = (date: Date | undefined, filter: string): boolean => {
    if (!date) return false;
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (filter) {
      case 'today': return diffDays <= 1;
      case 'week': return diffDays <= 7;
      case 'month': return diffDays <= 30;
      case 'year': return diffDays <= 365;
      default: return true;
    }
  };

  const generateResultActions = (result: EnhancedSearchResult): SearchResultAction[] => {
    const actions: SearchResultAction[] = [
      {
        id: 'open',
        name: 'Open',
        icon: ArrowRight,
        action: () => handleResultSelect(result),
        isPrimary: true
      }
    ];

    if (result.url) {
      actions.push({
        id: 'open-new-tab',
        name: 'Open in New Tab',
        icon: ExternalLink,
        action: () => window.open(result.url, '_blank')
      });
    }

    actions.push({
      id: 'preview',
      name: 'Preview',
      icon: Eye,
      action: () => handleResultSelect(result, 'preview')
    });

    return actions;
  };

  const exportSearchResults = (results: EnhancedSearchResult[], query: string) => {
    const data = results.map(result => ({
      title: result.title,
      description: result.description,
      type: result.type,
      group: result.group,
      relevanceScore: result.relevanceScore,
      lastModified: result.lastModified?.toISOString(),
      tags: result.tags?.join(', '),
      url: result.url || result.path
    }));

    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search-results-${query}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Search results exported');
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  // Debounce utility
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // ===================== MAIN RENDER =====================

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="closed"
        animate="open"
        exit="closed"
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          ref={modalRef}
          variants={modalVariants}
          className={cn(
            "w-full max-w-4xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl",
            "border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {renderSearchInput()}
          {renderFilters()}
          {renderSearchResults()}

          {/* Footer with stats */}
          {debugMode && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>Total searches: {searchAnalytics.totalSearches}</span>
                  <span>Avg time: {Math.round(searchAnalytics.averageSearchTime)}ms</span>
                  <span>Success rate: {Math.round(searchAnalytics.searchSuccessRate * 100)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  {(isCrossGroupLoading || isAILoading || isActivityLoading || isUserLoading || isOrchestrationLoading) && (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Loading...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalSearchInterface;