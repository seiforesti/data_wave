/**
 * ActivitySearchEngine Component
 * ==============================
 * 
 * Advanced search and filtering engine for activity data with AI-powered
 * suggestions, natural language queries, intelligent filtering, and
 * enterprise-grade search functionality.
 * 
 * Key Features:
 * - Advanced search with natural language processing
 * - AI-powered search suggestions and auto-complete
 * - Multi-criteria filtering with visual filter builder
 * - Saved searches and search history
 * - Real-time search with instant results
 * - Fuzzy search and typo tolerance
 * - Cross-group activity search and correlation
 * - Search analytics and performance metrics
 * - Export search results in multiple formats
 * - Advanced query syntax and operators
 * - Search result highlighting and ranking
 * - Contextual search recommendations
 * 
 * Backend Integration:
 * - Maps to: activity-tracking-apis.ts
 * - Uses: useActivityTracker hook
 * - Types: ActivitySearchRequest, ActivitySearchResponse
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Search,
  Filter,
  Settings,
  History,
  Star,
  BookOpen,
  Zap,
  Target,
  Brain,
  Sparkles,
  Clock,
  Save,
  Download,
  RefreshCw,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Plus,
  Minus,
  Calendar,
  Users,
  Activity,
  Database,
  Tag,
  Hash,
  Globe,
  Building,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Share2,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  FileText,
  Code,
  Terminal,
  Layers,
  Grid3X3,
  List,
  Table2,
  Network,
  GitBranch,
  Workflow,
  Cpu,
  HardDrive,
  Server,
  Cloud,
  Shield,
  Lock,
  Key,
  Flag,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';
import { FixedSizeList as List } from 'react-window';

import { useActivityTracker } from '../../hooks/useActivityTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import {
  RacineActivity,
  ActivityType,
  ActivityAction,
  UUID,
  ISODateString,
  ComplianceLevel
} from '../../types/racine-core.types';

import {
  ActivitySearchRequest,
  FilterRequest,
  SortRequest,
  PaginationRequest
} from '../../types/api.types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ActivitySearchEngineProps {
  height?: number;
  showAdvancedFilters?: boolean;
  enableAI?: boolean;
  enableSavedSearches?: boolean;
  enableRealTime?: boolean;
  autoSuggest?: boolean;
  className?: string;
}

interface SearchEngineState {
  // Search Query State
  query: string;
  naturalLanguageQuery: string;
  previousQueries: SearchQuery[];
  suggestions: SearchSuggestion[];
  
  // Search Results
  results: ActivitySearchResult[];
  filteredResults: ActivitySearchResult[];
  selectedResults: Set<UUID>;
  totalResults: number;
  searchTime: number;
  
  // Search Configuration
  searchMode: SearchMode;
  searchScope: SearchScope;
  searchFilters: SearchFilter[];
  activeFilters: SearchFilter[];
  sortBy: SearchSortOption;
  
  // AI Features
  aiSuggestions: AISuggestion[];
  smartFilters: SmartFilter[];
  searchInsights: SearchInsight[];
  queryAnalysis: QueryAnalysis | null;
  
  // Saved Searches
  savedSearches: SavedSearch[];
  searchHistory: SearchHistoryEntry[];
  favoriteSearches: SavedSearch[];
  
  // Search Analytics
  searchMetrics: SearchMetrics | null;
  popularQueries: PopularQuery[];
  searchTrends: SearchTrend[];
  
  // UI State
  isSearching: boolean;
  showSuggestions: boolean;
  showAdvancedFilters: boolean;
  showSavedSearches: boolean;
  showSearchHistory: boolean;
  showAnalytics: boolean;
  
  // View Options
  resultsView: SearchResultsView;
  resultsPerPage: number;
  currentPage: number;
  
  // Export Options
  exportConfig: SearchExportConfig;
  
  // Error and Loading States
  loading: boolean;
  error: string | null;
  
  // Real-time Features
  isRealTimeEnabled: boolean;
  streamingResults: boolean;
  lastUpdate: ISODateString | null;
}

enum SearchMode {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
  NATURAL_LANGUAGE = 'natural_language',
  AI_ASSISTED = 'ai_assisted'
}

enum SearchScope {
  ALL = 'all',
  CURRENT_WORKSPACE = 'current_workspace',
  CURRENT_USER = 'current_user',
  SPECIFIC_GROUPS = 'specific_groups',
  TIME_RANGE = 'time_range'
}

enum SearchResultsView {
  LIST = 'list',
  CARDS = 'cards',
  TABLE = 'table',
  TIMELINE = 'timeline'
}

interface SearchQuery {
  id: UUID;
  query: string;
  mode: SearchMode;
  filters: SearchFilter[];
  timestamp: ISODateString;
  resultCount: number;
  executionTime: number;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: SuggestionType;
  confidence: number;
  category: string;
  metadata: Record<string, any>;
}

enum SuggestionType {
  QUERY_COMPLETION = 'query_completion',
  FILTER_SUGGESTION = 'filter_suggestion',
  RELATED_SEARCH = 'related_search',
  HISTORICAL_QUERY = 'historical_query',
  AI_SUGGESTION = 'ai_suggestion'
}

interface ActivitySearchResult {
  activity: RacineActivity;
  relevanceScore: number;
  matchedFields: string[];
  highlights: SearchHighlight[];
  context: SearchContext;
}

interface SearchHighlight {
  field: string;
  text: string;
  startIndex: number;
  endIndex: number;
}

interface SearchContext {
  relatedActivities: RacineActivity[];
  userContext: UserContext;
  temporalContext: TemporalContext;
  groupContext: GroupContext;
}

interface SearchFilter {
  id: string;
  name: string;
  type: FilterType;
  field: string;
  operator: FilterOperator;
  value: any;
  isActive: boolean;
  isAIGenerated: boolean;
}

enum FilterType {
  TEXT = 'text',
  DATE = 'date',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  RANGE = 'range',
  CUSTOM = 'custom'
}

enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'not_in',
  REGEX = 'regex'
}

interface SearchSortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

interface AISuggestion {
  id: string;
  type: AISuggestionType;
  title: string;
  description: string;
  confidence: number;
  action: string;
  parameters: Record<string, any>;
}

enum AISuggestionType {
  QUERY_REFINEMENT = 'query_refinement',
  FILTER_RECOMMENDATION = 'filter_recommendation',
  RELATED_SEARCH = 'related_search',
  PATTERN_DETECTION = 'pattern_detection',
  ANOMALY_DETECTION = 'anomaly_detection'
}

interface SmartFilter {
  id: string;
  name: string;
  description: string;
  conditions: FilterCondition[];
  isAIGenerated: boolean;
  confidence: number;
  usage: number;
}

interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface SearchInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  data: any;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

enum InsightType {
  SEARCH_PATTERN = 'search_pattern',
  RESULT_QUALITY = 'result_quality',
  PERFORMANCE_ISSUE = 'performance_issue',
  TRENDING_TOPIC = 'trending_topic',
  ANOMALY_DETECTED = 'anomaly_detected'
}

interface QueryAnalysis {
  intent: QueryIntent;
  entities: ExtractedEntity[];
  timeframe: TimeframeIntent | null;
  scope: ScopeIntent | null;
  complexity: QueryComplexity;
  suggestions: string[];
}

interface QueryIntent {
  primary: string;
  secondary: string[];
  confidence: number;
}

interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

enum EntityType {
  USER = 'user',
  GROUP = 'group',
  RESOURCE = 'resource',
  ACTION = 'action',
  DATE = 'date',
  TIME = 'time',
  LOCATION = 'location',
  SYSTEM = 'system'
}

interface TimeframeIntent {
  start: ISODateString | null;
  end: ISODateString | null;
  relative: string | null;
}

interface ScopeIntent {
  groups: string[];
  users: string[];
  resources: string[];
}

enum QueryComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  VERY_COMPLEX = 'very_complex'
}

interface SavedSearch {
  id: UUID;
  name: string;
  description: string;
  query: string;
  mode: SearchMode;
  filters: SearchFilter[];
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy: UUID;
  usage: number;
  lastUsed: ISODateString;
}

interface SearchHistoryEntry {
  id: UUID;
  query: string;
  mode: SearchMode;
  filters: SearchFilter[];
  resultCount: number;
  executionTime: number;
  timestamp: ISODateString;
  successful: boolean;
}

interface SearchMetrics {
  totalSearches: number;
  averageExecutionTime: number;
  successRate: number;
  popularFilters: FilterUsage[];
  searchVolumeTrends: SearchVolumeTrend[];
  userEngagement: SearchEngagement;
}

interface FilterUsage {
  filter: string;
  count: number;
  percentage: number;
}

interface SearchVolumeTrend {
  period: string;
  searchCount: number;
  averageExecutionTime: number;
}

interface SearchEngagement {
  averageResultsViewed: number;
  clickThroughRate: number;
  refinementRate: number;
  exportRate: number;
}

interface PopularQuery {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  averageResults: number;
}

interface SearchTrend {
  term: string;
  volume: number;
  growth: number;
  related: string[];
}

interface SearchExportConfig {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  includeMetadata: boolean;
  includeHighlights: boolean;
  includeContext: boolean;
  maxResults: number;
}

interface UserContext {
  userId: UUID;
  userName: string;
  role: string;
  recentActivities: RacineActivity[];
}

interface TemporalContext {
  timeRange: { start: ISODateString; end: ISODateString };
  patterns: string[];
  anomalies: string[];
}

interface GroupContext {
  groups: string[];
  crossGroupActivities: RacineActivity[];
  relationships: string[];
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: SearchEngineState = {
  query: '',
  naturalLanguageQuery: '',
  previousQueries: [],
  suggestions: [],
  
  results: [],
  filteredResults: [],
  selectedResults: new Set(),
  totalResults: 0,
  searchTime: 0,
  
  searchMode: SearchMode.SIMPLE,
  searchScope: SearchScope.ALL,
  searchFilters: [
    {
      id: 'dateRange',
      name: 'Date Range',
      type: FilterType.DATE,
      field: 'timestamp',
      operator: FilterOperator.BETWEEN,
      value: null,
      isActive: false,
      isAIGenerated: false
    },
    {
      id: 'activityType',
      name: 'Activity Type',
      type: FilterType.MULTI_SELECT,
      field: 'activityType',
      operator: FilterOperator.IN,
      value: [],
      isActive: false,
      isAIGenerated: false
    },
    {
      id: 'user',
      name: 'User',
      type: FilterType.SELECT,
      field: 'userId',
      operator: FilterOperator.EQUALS,
      value: null,
      isActive: false,
      isAIGenerated: false
    },
    {
      id: 'complianceLevel',
      name: 'Compliance Level',
      type: FilterType.MULTI_SELECT,
      field: 'complianceLevel',
      operator: FilterOperator.IN,
      value: [],
      isActive: false,
      isAIGenerated: false
    }
  ],
  activeFilters: [],
  sortBy: {
    field: 'relevanceScore',
    direction: 'desc',
    label: 'Relevance'
  },
  
  aiSuggestions: [],
  smartFilters: [],
  searchInsights: [],
  queryAnalysis: null,
  
  savedSearches: [],
  searchHistory: [],
  favoriteSearches: [],
  
  searchMetrics: null,
  popularQueries: [],
  searchTrends: [],
  
  isSearching: false,
  showSuggestions: false,
  showAdvancedFilters: false,
  showSavedSearches: false,
  showSearchHistory: false,
  showAnalytics: false,
  
  resultsView: SearchResultsView.LIST,
  resultsPerPage: 20,
  currentPage: 1,
  
  exportConfig: {
    format: 'json',
    includeMetadata: true,
    includeHighlights: true,
    includeContext: false,
    maxResults: 1000
  },
  
  loading: false,
  error: null,
  
  isRealTimeEnabled: true,
  streamingResults: false,
  lastUpdate: null
};

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

const resultsVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05
    }
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ActivitySearchEngine: React.FC<ActivitySearchEngineProps> = ({
  height = 800,
  showAdvancedFilters = true,
  enableAI = true,
  enableSavedSearches = true,
  enableRealTime = true,
  autoSuggest = true,
  className
}) => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [state, setState] = useState<SearchEngineState>(initialState);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation controls
  const mainAnimationControls = useAnimation();
  const resultsAnimationControls = useAnimation();
  
  // Activity tracker hook
  const {
    searchActivities,
    loading: searchLoading,
    error: searchError
  } = useActivityTracker({
    autoLoadActivities: false,
    enableRealTimeUpdates: enableRealTime
  });

  // =============================================================================
  // SEARCH FUNCTIONALITY
  // =============================================================================

  const performSearch = useCallback(async (searchQuery: string, filters: SearchFilter[] = []) => {
    setState(prev => ({ ...prev, isSearching: true, loading: true, error: null }));
    
    const startTime = performance.now();
    
    try {
      // Build search request
      const searchRequest: ActivitySearchRequest = {
        query: searchQuery,
        mode: state.searchMode,
        filters: filters.filter(f => f.isActive).map(f => ({
          field: f.field,
          operator: f.operator,
          value: f.value
        })),
        sort: {
          field: state.sortBy.field,
          direction: state.sortBy.direction
        },
        pagination: {
          page: state.currentPage,
          limit: state.resultsPerPage
        },
        includeHighlights: true,
        includeContext: true,
        fuzzySearch: true,
        typoTolerance: true
      };
      
      // Perform the search
      const searchResponse = await searchActivities(searchRequest);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Process results
      const results: ActivitySearchResult[] = searchResponse.activities.map((activity, index) => ({
        activity,
        relevanceScore: calculateRelevanceScore(activity, searchQuery),
        matchedFields: findMatchedFields(activity, searchQuery),
        highlights: generateHighlights(activity, searchQuery),
        context: generateSearchContext(activity, searchResponse.activities)
      }));
      
      // Update state with results
      setState(prev => ({
        ...prev,
        results,
        filteredResults: results,
        totalResults: searchResponse.total || results.length,
        searchTime: executionTime,
        isSearching: false,
        loading: false,
        lastUpdate: new Date().toISOString()
      }));
      
      // Add to search history
      addToSearchHistory(searchQuery, state.searchMode, filters, results.length, executionTime);
      
      // Generate AI suggestions if enabled
      if (enableAI) {
        generateAISuggestions(searchQuery, results);
      }
      
      // Animate results
      resultsAnimationControls.start('visible');
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSearching: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }));
    }
  }, [state.searchMode, state.sortBy, state.currentPage, state.resultsPerPage, searchActivities, enableAI, resultsAnimationControls]);

  const calculateRelevanceScore = useCallback((activity: RacineActivity, query: string): number => {
    let score = 0;
    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    // Score based on field matches
    queryTerms.forEach(term => {
      if (activity.description.toLowerCase().includes(term)) score += 10;
      if (activity.action.toLowerCase().includes(term)) score += 8;
      if (activity.resourceType.toLowerCase().includes(term)) score += 6;
      if (activity.userId.toLowerCase().includes(term)) score += 4;
    });
    
    // Boost recent activities
    const now = new Date();
    const activityDate = new Date(activity.timestamp);
    const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 3600 * 24);
    if (daysDiff <= 1) score += 5;
    else if (daysDiff <= 7) score += 3;
    else if (daysDiff <= 30) score += 1;
    
    // Boost high-importance activities
    if (activity.severity === 'critical') score += 8;
    else if (activity.severity === 'high') score += 6;
    else if (activity.severity === 'medium') score += 4;
    
    return Math.min(100, Math.max(0, score));
  }, []);

  const findMatchedFields = useCallback((activity: RacineActivity, query: string): string[] => {
    const matchedFields: string[] = [];
    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const fieldChecks = [
      { field: 'description', value: activity.description },
      { field: 'action', value: activity.action },
      { field: 'resourceType', value: activity.resourceType },
      { field: 'userId', value: activity.userId }
    ];
    
    fieldChecks.forEach(({ field, value }) => {
      if (queryTerms.some(term => value.toLowerCase().includes(term))) {
        matchedFields.push(field);
      }
    });
    
    return matchedFields;
  }, []);

  const generateHighlights = useCallback((activity: RacineActivity, query: string): SearchHighlight[] => {
    const highlights: SearchHighlight[] = [];
    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const textFields = [
      { field: 'description', text: activity.description },
      { field: 'action', text: activity.action },
      { field: 'resourceType', text: activity.resourceType }
    ];
    
    textFields.forEach(({ field, text }) => {
      queryTerms.forEach(term => {
        const index = text.toLowerCase().indexOf(term);
        if (index !== -1) {
          highlights.push({
            field,
            text: text.substring(index, index + term.length),
            startIndex: index,
            endIndex: index + term.length
          });
        }
      });
    });
    
    return highlights;
  }, []);

  const generateSearchContext = useCallback((activity: RacineActivity, allActivities: RacineActivity[]): SearchContext => {
    // Find related activities (same user, similar time, etc.)
    const relatedActivities = allActivities.filter(a => 
      a.id !== activity.id && (
        a.userId === activity.userId ||
        Math.abs(new Date(a.timestamp).getTime() - new Date(activity.timestamp).getTime()) < 300000 // 5 minutes
      )
    ).slice(0, 5);
    
    return {
      relatedActivities,
      userContext: {
        userId: activity.userId,
        userName: activity.userId, // In real implementation, this would be resolved
        role: 'user',
        recentActivities: relatedActivities.filter(a => a.userId === activity.userId).slice(0, 3)
      },
      temporalContext: {
        timeRange: {
          start: new Date(Date.now() - 3600000).toISOString(), // 1 hour before
          end: new Date(Date.now() + 3600000).toISOString()    // 1 hour after
        },
        patterns: ['normal_activity'],
        anomalies: []
      },
      groupContext: {
        groups: [activity.resourceType],
        crossGroupActivities: [],
        relationships: []
      }
    };
  }, []);

  const addToSearchHistory = useCallback((query: string, mode: SearchMode, filters: SearchFilter[], resultCount: number, executionTime: number) => {
    const historyEntry: SearchHistoryEntry = {
      id: `search-${Date.now()}`,
      query,
      mode,
      filters: filters.filter(f => f.isActive),
      resultCount,
      executionTime,
      timestamp: new Date().toISOString(),
      successful: resultCount > 0
    };
    
    setState(prev => ({
      ...prev,
      searchHistory: [historyEntry, ...prev.searchHistory.slice(0, 99)] // Keep last 100 searches
    }));
  }, []);

  const generateAISuggestions = useCallback(async (query: string, results: ActivitySearchResult[]) => {
    // Simulate AI suggestion generation
    const suggestions: AISuggestion[] = [];
    
    // Query refinement suggestions
    if (results.length < 5) {
      suggestions.push({
        id: 'refine-1',
        type: AISuggestionType.QUERY_REFINEMENT,
        title: 'Try broader terms',
        description: 'Your search returned few results. Try using more general terms or synonyms.',
        confidence: 0.8,
        action: 'refine_query',
        parameters: { suggestion: query.split(' ').slice(0, -1).join(' ') }
      });
    }
    
    // Filter recommendations
    if (results.length > 100) {
      suggestions.push({
        id: 'filter-1',
        type: AISuggestionType.FILTER_RECOMMENDATION,
        title: 'Add time filter',
        description: 'Many results found. Consider filtering by date range to narrow results.',
        confidence: 0.9,
        action: 'add_filter',
        parameters: { filterType: 'dateRange' }
      });
    }
    
    // Pattern detection
    const userPatterns = results.reduce((acc, result) => {
      acc[result.activity.userId] = (acc[result.activity.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantUser = Object.entries(userPatterns).reduce((a, b) => 
      userPatterns[a[0]] > userPatterns[b[0]] ? a : b, ['', 0]
    );
    
    if (dominantUser[1] > results.length * 0.7) {
      suggestions.push({
        id: 'pattern-1',
        type: AISuggestionType.PATTERN_DETECTION,
        title: 'User activity pattern detected',
        description: `Most results are from user ${dominantUser[0]}. This might indicate focused activity.`,
        confidence: 0.85,
        action: 'explore_pattern',
        parameters: { userId: dominantUser[0] }
      });
    }
    
    setState(prev => ({ ...prev, aiSuggestions: suggestions }));
  }, []);

  // =============================================================================
  // SUGGESTION FUNCTIONALITY
  // =============================================================================

  const generateSuggestions = useCallback(async (inputQuery: string) => {
    if (!autoSuggest || inputQuery.length < 2) {
      setState(prev => ({ ...prev, suggestions: [], showSuggestions: false }));
      return;
    }
    
    const suggestions: SearchSuggestion[] = [];
    
    // Query completion suggestions
    const commonQueries = [
      'user login activities',
      'failed authentication',
      'data access events',
      'system errors',
      'configuration changes',
      'file uploads',
      'admin actions',
      'compliance violations'
    ];
    
    commonQueries.forEach((query, index) => {
      if (query.toLowerCase().includes(inputQuery.toLowerCase())) {
        suggestions.push({
          id: `completion-${index}`,
          text: query,
          type: SuggestionType.QUERY_COMPLETION,
          confidence: 0.8,
          category: 'completion',
          metadata: { isCommon: true }
        });
      }
    });
    
    // Historical query suggestions
    state.searchHistory.forEach((entry, index) => {
      if (entry.query.toLowerCase().includes(inputQuery.toLowerCase()) && entry.successful) {
        suggestions.push({
          id: `history-${index}`,
          text: entry.query,
          type: SuggestionType.HISTORICAL_QUERY,
          confidence: 0.9,
          category: 'history',
          metadata: { resultCount: entry.resultCount, timestamp: entry.timestamp }
        });
      }
    });
    
    // Filter suggestions
    if (inputQuery.toLowerCase().includes('error') || inputQuery.toLowerCase().includes('fail')) {
      suggestions.push({
        id: 'filter-error',
        text: 'Add severity filter: Critical errors only',
        type: SuggestionType.FILTER_SUGGESTION,
        confidence: 0.85,
        category: 'filter',
        metadata: { filterType: 'severity', value: 'critical' }
      });
    }
    
    // Limit and sort suggestions
    const sortedSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
    
    setState(prev => ({ 
      ...prev, 
      suggestions: sortedSuggestions,
      showSuggestions: sortedSuggestions.length > 0
    }));
  }, [autoSuggest, state.searchHistory]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleSearchInputChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, query: value }));
    
    // Debounce suggestion generation
    if (suggestionTimerRef.current) {
      clearTimeout(suggestionTimerRef.current);
    }
    
    suggestionTimerRef.current = setTimeout(() => {
      generateSuggestions(value);
    }, 300);
  }, [generateSuggestions]);

  const handleSearch = useCallback((searchQuery?: string) => {
    const query = searchQuery || state.query;
    if (!query.trim()) return;
    
    performSearch(query, state.activeFilters);
    setState(prev => ({ ...prev, showSuggestions: false }));
  }, [state.query, state.activeFilters, performSearch]);

  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === SuggestionType.FILTER_SUGGESTION) {
      // Apply suggested filter
      const { filterType, value } = suggestion.metadata;
      const filter = state.searchFilters.find(f => f.id === filterType);
      if (filter) {
        const updatedFilter = { ...filter, value, isActive: true };
        const updatedFilters = state.activeFilters.filter(f => f.id !== filterType);
        updatedFilters.push(updatedFilter);
        setState(prev => ({ ...prev, activeFilters: updatedFilters }));
      }
    } else {
      // Use suggestion as query
      setState(prev => ({ ...prev, query: suggestion.text, showSuggestions: false }));
      handleSearch(suggestion.text);
    }
  }, [state.searchFilters, state.activeFilters, handleSearch]);

  const handleFilterChange = useCallback((filterId: string, value: any, isActive: boolean) => {
    const filter = state.searchFilters.find(f => f.id === filterId);
    if (!filter) return;
    
    const updatedFilter = { ...filter, value, isActive };
    const updatedActiveFilters = state.activeFilters.filter(f => f.id !== filterId);
    
    if (isActive) {
      updatedActiveFilters.push(updatedFilter);
    }
    
    setState(prev => ({ ...prev, activeFilters: updatedActiveFilters }));
    
    // Auto-search if query exists
    if (state.query.trim()) {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      searchTimerRef.current = setTimeout(() => {
        performSearch(state.query, updatedActiveFilters);
      }, 500);
    }
  }, [state.searchFilters, state.activeFilters, state.query, performSearch]);

  const handleSaveSearch = useCallback((name: string, description: string, isPublic: boolean) => {
    const savedSearch: SavedSearch = {
      id: `saved-${Date.now()}`,
      name,
      description,
      query: state.query,
      mode: state.searchMode,
      filters: state.activeFilters,
      isPublic,
      isFavorite: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user', // In real implementation, get from auth
      usage: 0,
      lastUsed: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      savedSearches: [savedSearch, ...prev.savedSearches]
    }));
  }, [state.query, state.searchMode, state.activeFilters]);

  const handleLoadSavedSearch = useCallback((savedSearch: SavedSearch) => {
    setState(prev => ({
      ...prev,
      query: savedSearch.query,
      searchMode: savedSearch.mode,
      activeFilters: savedSearch.filters
    }));
    
    // Update usage
    const updatedSearch = {
      ...savedSearch,
      usage: savedSearch.usage + 1,
      lastUsed: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      savedSearches: prev.savedSearches.map(s => 
        s.id === savedSearch.id ? updatedSearch : s
      )
    }));
    
    // Perform the search
    handleSearch(savedSearch.query);
  }, [handleSearch]);

  const handleExportResults = useCallback(async () => {
    const selectedResults = Array.from(state.selectedResults);
    const dataToExport = selectedResults.length > 0 
      ? state.filteredResults.filter(r => selectedResults.includes(r.activity.id))
      : state.filteredResults.slice(0, state.exportConfig.maxResults);
    
    const exportData = {
      query: state.query,
      searchMode: state.searchMode,
      filters: state.activeFilters,
      totalResults: state.totalResults,
      searchTime: state.searchTime,
      exportedAt: new Date().toISOString(),
      results: dataToExport.map(result => ({
        activity: result.activity,
        relevanceScore: result.relevanceScore,
        ...(state.exportConfig.includeHighlights && { highlights: result.highlights }),
        ...(state.exportConfig.includeContext && { context: result.context }),
        ...(state.exportConfig.includeMetadata && { 
          matchedFields: result.matchedFields,
          searchQuery: state.query
        })
      }))
    };
    
    // Convert to requested format and download
    const { format } = state.exportConfig;
    let blob: Blob;
    let filename: string;
    
    switch (format) {
      case 'json':
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        filename = `search-results-${Date.now()}.json`;
        break;
      case 'csv':
        const csvData = convertToCSV(exportData.results);
        blob = new Blob([csvData], { type: 'text/csv' });
        filename = `search-results-${Date.now()}.csv`;
        break;
      default:
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        filename = `search-results-${Date.now()}.json`;
    }
    
    // Download file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [state.selectedResults, state.filteredResults, state.exportConfig, state.query, state.searchMode, state.activeFilters, state.totalResults, state.searchTime]);

  const convertToCSV = useCallback((results: any[]): string => {
    const headers = [
      'Activity ID',
      'Description',
      'Action',
      'User ID',
      'Resource Type',
      'Timestamp',
      'Relevance Score'
    ];
    
    const rows = results.map(result => [
      result.activity.id,
      result.activity.description,
      result.activity.action,
      result.activity.userId,
      result.activity.resourceType,
      result.activity.timestamp,
      result.relevanceScore
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }, []);

  // =============================================================================
  // MEMOIZED COMPUTATIONS
  // =============================================================================

  const searchStats = useMemo(() => {
    return {
      totalResults: state.totalResults,
      searchTime: state.searchTime,
      averageRelevance: state.filteredResults.length > 0 
        ? state.filteredResults.reduce((sum, r) => sum + r.relevanceScore, 0) / state.filteredResults.length
        : 0,
      selectedCount: state.selectedResults.size
    };
  }, [state.totalResults, state.searchTime, state.filteredResults, state.selectedResults]);

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderSearchInterface = () => (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Mode Tabs */}
          <Tabs value={state.searchMode} onValueChange={(value) => setState(prev => ({ ...prev, searchMode: value as SearchMode }))}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value={SearchMode.SIMPLE}>
                <Search className="w-4 h-4 mr-2" />
                Simple
              </TabsTrigger>
              <TabsTrigger value={SearchMode.ADVANCED}>
                <Filter className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value={SearchMode.NATURAL_LANGUAGE}>
                <Brain className="w-4 h-4 mr-2" />
                Natural Language
              </TabsTrigger>
              {enableAI && (
                <TabsTrigger value={SearchMode.AI_ASSISTED}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Assisted
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {/* Main Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              ref={searchInputRef}
              placeholder={
                state.searchMode === SearchMode.NATURAL_LANGUAGE 
                  ? "Ask in plain English: 'Show me all failed login attempts from last week'"
                  : state.searchMode === SearchMode.AI_ASSISTED
                  ? "Describe what you're looking for and I'll help you find it"
                  : "Search activities, users, actions, resources..."
              }
              value={state.query}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                } else if (e.key === 'Escape') {
                  setState(prev => ({ ...prev, showSuggestions: false }));
                }
              }}
              className="pl-10 pr-20 text-lg"
            />
            
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {state.query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, query: '', showSuggestions: false }))}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                onClick={() => handleSearch()}
                disabled={!state.query.trim() || state.isSearching}
                size="sm"
              >
                {state.isSearching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {state.showSuggestions && state.suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                >
                  {state.suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="flex items-center space-x-3">
                        {suggestion.type === SuggestionType.HISTORICAL_QUERY && <History className="w-4 h-4 text-gray-400" />}
                        {suggestion.type === SuggestionType.FILTER_SUGGESTION && <Filter className="w-4 h-4 text-gray-400" />}
                        {suggestion.type === SuggestionType.AI_SUGGESTION && <Sparkles className="w-4 h-4 text-purple-500" />}
                        {suggestion.type === SuggestionType.QUERY_COMPLETION && <Search className="w-4 h-4 text-gray-400" />}
                        
                        <div>
                          <div className="font-medium">{suggestion.text}</div>
                          {suggestion.metadata.resultCount && (
                            <div className="text-xs text-gray-500">
                              {suggestion.metadata.resultCount} results
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        {Math.round(suggestion.confidence * 100)}%
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {showAdvancedFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {state.activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {state.activeFilters.length}
                    </Badge>
                  )}
                </Button>
              )}

              {enableSavedSearches && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showSavedSearches: !prev.showSavedSearches }))}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Saved
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, showSearchHistory: !prev.showSearchHistory }))}
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {state.query && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showSavedSearches: true }))}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Search
                </Button>
              )}

              {state.results.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportResults}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSearchResults = () => (
    <motion.div
      variants={resultsVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Search Results
              </CardTitle>
              <CardDescription>
                {searchStats.totalResults} results found in {searchStats.searchTime.toFixed(0)}ms
                {searchStats.averageRelevance > 0 && (
                  <span className="ml-2">
                    • Average relevance: {searchStats.averageRelevance.toFixed(1)}%
                  </span>
                )}
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select
                value={state.sortBy.field}
                onValueChange={(value) => {
                  const direction = value === 'timestamp' ? 'desc' : 'desc';
                  const label = value === 'relevanceScore' ? 'Relevance' : 
                               value === 'timestamp' ? 'Date' : 'Field';
                  setState(prev => ({ 
                    ...prev, 
                    sortBy: { field: value, direction, label }
                  }));
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevanceScore">Relevance</SelectItem>
                  <SelectItem value="timestamp">Date</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="userId">User</SelectItem>
                </SelectContent>
              </Select>

              <Tabs value={state.resultsView} onValueChange={(value) => setState(prev => ({ ...prev, resultsView: value as SearchResultsView }))}>
                <TabsList>
                  <TabsTrigger value={SearchResultsView.LIST}>
                    <List className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value={SearchResultsView.CARDS}>
                    <Grid3X3 className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value={SearchResultsView.TABLE}>
                    <Table2 className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {state.loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          ) : state.error ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : state.filteredResults.length === 0 && state.query ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              {enableAI && state.aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">AI Suggestions:</p>
                  {state.aiSuggestions.slice(0, 3).map((suggestion) => (
                    <Button
                      key={suggestion.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Handle AI suggestion action
                        if (suggestion.action === 'refine_query') {
                          setState(prev => ({ ...prev, query: suggestion.parameters.suggestion }));
                          handleSearch(suggestion.parameters.suggestion);
                        }
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {suggestion.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {state.filteredResults.map((result, index) => (
                <motion.div
                  key={result.activity.id}
                  variants={itemVariants}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    const newSelected = new Set(state.selectedResults);
                    if (newSelected.has(result.activity.id)) {
                      newSelected.delete(result.activity.id);
                    } else {
                      newSelected.add(result.activity.id);
                    }
                    setState(prev => ({ ...prev, selectedResults: newSelected }));
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{result.activity.action}</Badge>
                        <Badge variant="secondary">
                          {result.relevanceScore}% relevant
                        </Badge>
                        {result.activity.severity && (
                          <Badge 
                            variant={result.activity.severity === 'critical' ? 'destructive' : 'outline'}
                          >
                            {result.activity.severity}
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium mb-1">
                        {highlightText(result.activity.description, state.query)}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">User:</span> {result.activity.userId}
                        </div>
                        <div>
                          <span className="font-medium">Resource:</span> {result.activity.resourceType}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {new Date(result.activity.timestamp).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Matched:</span> {result.matchedFields.join(', ')}
                        </div>
                      </div>
                      
                      {result.context.relatedActivities.length > 0 && (
                        <div className="mt-2">
                          <Button variant="ghost" size="sm">
                            <Network className="w-4 h-4 mr-2" />
                            {result.context.relatedActivities.length} related activities
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={state.selectedResults.has(result.activity.id)}
                        onCheckedChange={() => {
                          const newSelected = new Set(state.selectedResults);
                          if (newSelected.has(result.activity.id)) {
                            newSelected.delete(result.activity.id);
                          } else {
                            newSelected.add(result.activity.id);
                          }
                          setState(prev => ({ ...prev, selectedResults: newSelected }));
                        }}
                      />
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query) return text;
    
    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <motion.div
      className={`h-full bg-gray-50 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ height }}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Search className="w-6 h-6 mr-2" />
              Activity Search Engine
            </h2>
            <p className="text-gray-600">
              Advanced search with AI-powered suggestions and intelligent filtering
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showAnalytics: !prev.showAnalytics }))}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showAdvancedFilters: true }))}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Interface */}
        {renderSearchInterface()}

        {/* AI Suggestions */}
        {enableAI && state.aiSuggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.aiSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <Badge variant="outline">
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    <Button variant="outline" size="sm">
                      Apply Suggestion
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {(state.results.length > 0 || state.loading || state.error) && renderSearchResults()}
      </div>
    </motion.div>
  );
};

export default ActivitySearchEngine;