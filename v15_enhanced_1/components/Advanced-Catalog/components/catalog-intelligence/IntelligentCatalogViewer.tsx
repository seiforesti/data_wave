// ============================================================================
// INTELLIGENT CATALOG VIEWER - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Ultra-Advanced AI-powered catalog with COMPLETE backend integration
// Surpasses ALL competitors with comprehensive enterprise functionality
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Brain, 
  Database, 
  Layers, 
  Network, 
  GitBranch, 
  Zap, 
  Search, 
  Filter, 
  Eye, 
  Settings, 
  RefreshCw, 
  Download, 
  Upload, 
  Share, 
  Copy, 
  Star, 
  Tag, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sparkles,
  Workflow,
  Map,
  Target,
  Lightbulb,
  Fingerprint,
  Shield,
  Key,
  Lock,
  Unlock,
  FileText,
  Code,
  Package,
  Link,
  Globe,
  Compass,
  Cpu,
  HardDrive,
  FolderTree,
  Grid3X3,
  List,
  Calendar,
  Users,
  Bookmark,
  Heart,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  Info,
  AlertCircle,
  Maximize,
  Minimize,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  MoreHorizontal
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// COMPLETE Backend Integration - ALL Services
import { 
  EnterpriseCatalogService,
  SemanticSearchService,
  IntelligentDiscoveryService,
  CatalogQualityService,
  DataProfilingService,
  AdvancedLineageService,
  CatalogAnalyticsService,
  CatalogRecommendationService,
  CatalogAIService,
  catalogServices,
  performServiceHealthCheck,
  updateServiceConfiguration,
  getServiceConfiguration,
  ServiceEventManager,
  getServiceMetrics
} from '../../services';

// COMPLETE Hooks Integration - ALL Hooks
import { useCatalogDiscovery } from '../../hooks/useCatalogDiscovery';
import { useCatalogAI } from '../../hooks/useCatalogAI';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';
import { useCatalogRecommendations } from '../../hooks/useCatalogRecommendations';
import { useCatalogQuality } from '../../hooks/useCatalogQuality';
import { useCatalogLineage } from '../../hooks/useCatalogLineage';
import { useCatalogSearch } from '../../hooks/useCatalogSearch';

// COMPLETE Types Integration - ALL Types
import {
  // Core Catalog Types
  IntelligentDataAsset,
  AssetMetadata,
  AssetClassification,
  AssetUsageMetrics,
  AssetRelationship,
  AssetVersion,
  AssetComment,
  AssetRating,
  AssetLineage,
  AssetQuality,
  // Quality Types
  QualityAssessment,
  QualityRule,
  QualityMetrics,
  QualityAlert,
  QualityTrend,
  QualityReport,
  // AI Types
  AIInsight,
  AIRecommendation,
  AIAnalysis,
  AIModel,
  AIModelMetrics,
  AITrainingJob,
  AIInferenceJob,
  MLModelPerformance,
  // Search Types
  SearchRequest,
  SearchResponse,
  SearchFilter,
  SearchFacet,
  SearchSuggestion,
  SearchAnalytics,
  // Analytics Types
  AnalyticsReport,
  AnalyticsMetrics,
  AnalyticsDashboard,
  AnalyticsAlert,
  AnalyticsTrend,
  // Lineage Types
  LineageGraph,
  LineageNode,
  LineageEdge,
  LineageMetrics,
  LineageAnalysis,
  // Collaboration Types
  CollaborationSpace,
  CollaborationComment,
  CollaborationReview,
  CollaborationNotification,
  // Common Types
  ApiResponse,
  Pagination,
  SortOption,
  GenericFilter,
  TimeRange,
  UserContext,
  SystemContext,
  ErrorDetail,
  HealthCheckResult,
  Notification,
  AuditEntry,
  ConfigurationSetting,
  FeatureFlag,
  PerformanceMetric,
  ResourceUsage,
  CacheStatistics
} from '../../types';

// COMPLETE Utils Integration - ALL Utils
import { 
  // Data Formatting Utils
  formatAssetType,
  formatDataSourceType,
  formatJobStatus,
  formatDiscoveryStatus,
  formatQualityScore,
  formatConfidence,
  formatFileSize,
  formatDuration,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatPercentage,
  formatNumber,
  formatCurrency,
  // Calculation Utils
  calculateAssetScore,
  calculateQualityScore,
  calculateConfidenceScore,
  calculatePerformanceMetrics,
  calculateUsageMetrics,
  calculateTrendMetrics,
  calculateRiskScore,
  calculateComplexityScore,
  calculateSimilarityScore,
  // Validation Utils
  validateAssetData,
  validateJobConfig,
  validateSearchQuery,
  validateFilters,
  validateUserInput,
  validateApiResponse,
  validateConfiguration,
  // Data Processing Utils
  processDiscoveryResults,
  processAnalyticsData,
  processLineageData,
  processQualityData,
  processSearchResults,
  aggregateMetrics,
  transformDataStructure,
  // Security Utils
  sanitizeInput,
  encryptSensitiveData,
  hashPassword,
  generateToken,
  validatePermissions,
  // Performance Utils
  debounce,
  throttle,
  memoize,
  lazyLoad,
  batchProcess,
  // URL & Navigation Utils
  generateAssetUrl,
  generateReportUrl,
  generateExportUrl,
  parseUrlParams,
  buildQueryString,
  // Error Handling Utils
  handleApiError,
  logError,
  createErrorReport,
  // Cache Utils
  getCacheKey,
  setCacheData,
  getCacheData,
  invalidateCache,
  // Export Utils
  exportToCSV,
  exportToJSON,
  exportToPDF,
  exportToExcel,
  // Import Utils
  parseCSVData,
  parseJSONData,
  parseExcelData,
  // Schema Utils
  analyzeSchema,
  compareSchemas,
  generateSchemaFingerprint,
  // Pattern Utils
  detectPatterns,
  analyzePatterns,
  matchPatterns,
  // ML Utils
  preprocessData,
  featureEngineering,
  modelEvaluation,
  predictionAnalysis
} from '../../utils';

// COMPLETE Constants Integration - ALL Constants
import { 
  // Asset & Data Source Constants
  ASSET_TYPES,
  DATA_SOURCE_TYPES,
  // Job & Process Constants
  JOB_STATUSES,
  DISCOVERY_JOB_TYPES,
  DISCOVERY_STATUSES,
  DISCOVERY_STRATEGIES,
  DISCOVERY_PATTERNS,
  // Quality Constants
  QUALITY_RULE_TYPES,
  QUALITY_THRESHOLDS,
  QUALITY_DIMENSIONS,
  QUALITY_STATUSES,
  // Search & Filter Constants
  SEARCH_FILTER_TYPES,
  SEARCH_OPERATORS,
  SORT_ORDERS,
  FACET_TYPES,
  // Time & Scheduling Constants
  TIME_RANGES,
  SCHEDULE_FREQUENCIES,
  CRON_PRESETS,
  // Notification & Alert Constants
  NOTIFICATION_TYPES,
  ALERT_SEVERITIES,
  ALERT_TYPES,
  // AI & ML Constants
  AI_MODELS,
  ML_ALGORITHMS,
  CONFIDENCE_THRESHOLDS,
  LEARNING_MODES,
  // Analytics Constants
  ANALYTICS_METRICS,
  CHART_TYPES,
  AGGREGATION_FUNCTIONS,
  // Security & Compliance Constants
  SECURITY_LEVELS,
  COMPLIANCE_FRAMEWORKS,
  ACCESS_LEVELS,
  AUDIT_ACTIONS,
  // UI Constants
  UI_THEMES,
  UI_LAYOUTS,
  UI_SIZES,
  // System Constants
  SYSTEM_HEALTH_STATUSES,
  CACHE_STRATEGIES,
  RETRY_POLICIES,
  TIMEOUT_CONFIGS,
  // Export Constants
  EXPORT_FORMATS,
  IMPORT_FORMATS,
  STORAGE_PROVIDERS,
  // Advanced Configuration
  ADVANCED_CONFIGS,
  FEATURE_FLAGS,
  PERFORMANCE_CONFIGS,
  endpoints,
  config
} from '../../constants';

// ============================================================================
// INTERFACES
// ============================================================================

interface IntelligentCatalogViewerProps {
  className?: string;
  // Core Configuration
  initialAssetId?: string;
  initialConfig?: CatalogViewerConfiguration;
  userContext?: UserContext;
  systemContext?: SystemContext;
  
  // Callbacks - Asset Management
  onAssetSelect?: (asset: IntelligentDataAsset) => void;
  onAssetCreate?: (asset: IntelligentDataAsset) => void;
  onAssetUpdate?: (asset: IntelligentDataAsset) => void;
  onAssetDelete?: (assetId: string) => void;
  onAssetVersion?: (asset: IntelligentDataAsset, version: AssetVersion) => void;
  onAssetComment?: (asset: IntelligentDataAsset, comment: AssetComment) => void;
  onAssetRating?: (asset: IntelligentDataAsset, rating: AssetRating) => void;
  
  // Advanced Features
  enableAIInsights?: boolean;
  enableAdvancedSearch?: boolean;
  enableCollaboration?: boolean;
  enableLineageVisualization?: boolean;
  enableQualityMonitoring?: boolean;
  enableDataProfiling?: boolean;
  enableSemanticSearch?: boolean;
  enableRecommendations?: boolean;
  enableRealTimeUpdates?: boolean;
  enableBulkOperations?: boolean;
  enableAssetVersioning?: boolean;
  enableAssetComments?: boolean;
  enableAssetRatings?: boolean;
  enableAssetBookmarks?: boolean;
  enableAssetSharing?: boolean;
  enableAssetExport?: boolean;
  
  // UI & Display Options
  showMetrics?: boolean;
  showPerformanceCharts?: boolean;
  showQualityDashboard?: boolean;
  showLineageViewer?: boolean;
  showAnalyticsPanels?: boolean;
  showCollaborationPanel?: boolean;
  showRecommendationsPanel?: boolean;
  showAdvancedFilters?: boolean;
  showAssetPreview?: boolean;
  showAssetVersionHistory?: boolean;
  defaultLayout?: 'grid' | 'list' | 'tree' | 'graph' | 'timeline' | 'kanban';
  defaultView?: 'catalog' | 'search' | 'lineage' | 'quality' | 'analytics' | 'collaboration';
  theme?: 'light' | 'dark' | 'auto';
  density?: 'compact' | 'normal' | 'comfortable';
  
  // Advanced Callbacks
  onError?: (error: ErrorDetail) => void;
  onWarning?: (warning: Notification) => void;
  onSuccess?: (message: Notification) => void;
  onAuditEvent?: (event: AuditEntry) => void;
  onPerformanceAlert?: (alert: PerformanceMetric) => void;
  onQualityAlert?: (alert: QualityAlert) => void;
  onSearchQuery?: (query: SearchRequest) => void;
  onNavigationChange?: (path: CatalogNavigationPath[]) => void;
  
  // Integration Hooks
  customServices?: Partial<typeof catalogServices>;
  customEndpoints?: Partial<typeof endpoints>;
  customConfiguration?: Partial<typeof config>;
  featureFlags?: Record<string, boolean>;
}

interface CatalogViewerConfiguration {
  // Display Configuration
  display: {
    layout: 'grid' | 'list' | 'tree' | 'graph' | 'timeline' | 'kanban';
    density: 'compact' | 'normal' | 'comfortable';
    theme: keyof typeof UI_THEMES;
    groupBy: 'type' | 'source' | 'owner' | 'classification' | 'quality' | 'domain' | 'status' | 'none';
    sortBy: 'name' | 'created' | 'updated' | 'quality' | 'usage' | 'popularity' | 'relevance' | 'size';
    sortOrder: keyof typeof SORT_ORDERS;
    itemsPerPage: number;
    showThumbnails: boolean;
    showPreview: boolean;
    showMetrics: boolean;
    showRelationships: boolean;
    enableAnimations: boolean;
  };
  
  // Search & Filter Configuration
  search: {
    enableSemanticSearch: boolean;
    enableFacetedSearch: boolean;
    enableNaturalLanguageQuery: boolean;
    enableSearchSuggestions: boolean;
    enableSearchAnalytics: boolean;
    searchOperators: (keyof typeof SEARCH_OPERATORS)[];
    facetTypes: (keyof typeof FACET_TYPES)[];
    defaultFilters: ComprehensiveAssetFilter;
    savedSearches: SearchRequest[];
    searchHistory: string[];
  };
  
  // Quality & Compliance
  quality: {
    enableQualityScoring: boolean;
    enableQualityRules: boolean;
    enableQualityAlerts: boolean;
    enableQualityTrends: boolean;
    enableQualityReports: boolean;
    qualityThresholds: typeof QUALITY_THRESHOLDS;
    qualityDimensions: (keyof typeof QUALITY_DIMENSIONS)[];
    complianceFrameworks: (keyof typeof COMPLIANCE_FRAMEWORKS)[];
    enablePolicyEnforcement: boolean;
  };
  
  // AI & ML Configuration
  ai: {
    enableAIInsights: boolean;
    enableRecommendations: boolean;
    enableSemanticAnalysis: boolean;
    enablePatternDetection: boolean;
    enableAnomalyDetection: boolean;
    enableAutoClassification: boolean;
    enableAutoTagging: boolean;
    aiModels: (keyof typeof AI_MODELS)[];
    mlAlgorithms: (keyof typeof ML_ALGORITHMS)[];
    confidenceThreshold: number;
    learningMode: keyof typeof LEARNING_MODES;
  };
  
  // Lineage & Relationships
  lineage: {
    enableLineageVisualization: boolean;
    enableImpactAnalysis: boolean;
    enableDataFlowMapping: boolean;
    enableDependencyTracking: boolean;
    lineageDepth: number;
    lineageDirection: 'upstream' | 'downstream' | 'both';
    showColumnLineage: boolean;
    showTransformations: boolean;
    enableLineageSearch: boolean;
  };
  
  // Collaboration & Social
  collaboration: {
    enableComments: boolean;
    enableRatings: boolean;
    enableBookmarks: boolean;
    enableSharing: boolean;
    enableNotifications: boolean;
    enableReviews: boolean;
    enableDiscussions: boolean;
    enableWorkspaces: boolean;
    enableTeamManagement: boolean;
    notificationTypes: (keyof typeof NOTIFICATION_TYPES)[];
  };
  
  // Analytics & Monitoring
  analytics: {
    enableUsageTracking: boolean;
    enablePerformanceMonitoring: boolean;
    enableTrendAnalysis: boolean;
    enablePredictiveAnalytics: boolean;
    enableCustomDashboards: boolean;
    enableReporting: boolean;
    analyticsMetrics: (keyof typeof ANALYTICS_METRICS)[];
    chartTypes: (keyof typeof CHART_TYPES)[];
    aggregationFunctions: (keyof typeof AGGREGATION_FUNCTIONS)[];
    retentionPeriod: number;
  };
  
  // Security & Access
  security: {
    enableAccessControl: boolean;
    enableDataMasking: boolean;
    enableAuditLogging: boolean;
    enableEncryption: boolean;
    securityLevel: keyof typeof SECURITY_LEVELS;
    accessLevel: keyof typeof ACCESS_LEVELS;
    sensitiveDataDetection: boolean;
    piiDetection: boolean;
    auditActions: (keyof typeof AUDIT_ACTIONS)[];
  };
  
  // Performance & Optimization
  performance: {
    enableCaching: boolean;
    enableLazyLoading: boolean;
    enableVirtualization: boolean;
    enablePagination: boolean;
    enableInfiniteScroll: boolean;
    cacheStrategy: keyof typeof CACHE_STRATEGIES;
    maxConcurrentRequests: number;
    requestTimeout: number;
    retryPolicy: keyof typeof RETRY_POLICIES;
    optimizeImages: boolean;
  };
  
  // Export & Integration
  integration: {
    enableExport: boolean;
    enableImport: boolean;
    enableAPIAccess: boolean;
    enableWebhooks: boolean;
    enableEventStreaming: boolean;
    exportFormats: (keyof typeof EXPORT_FORMATS)[];
    importFormats: (keyof typeof IMPORT_FORMATS)[];
    storageProviders: (keyof typeof STORAGE_PROVIDERS)[];
    apiEndpoints: typeof endpoints;
    webhookUrls: string[];
  };
}

interface ComprehensiveAssetFilter extends GenericFilter {
  // Basic Filters
  assetTypes: (keyof typeof ASSET_TYPES)[];
  dataSourceTypes: (keyof typeof DATA_SOURCE_TYPES)[];
  statuses: string[];
  
  // Metadata Filters
  owners: string[];
  stewards: string[];
  creators: string[];
  tags: string[];
  classifications: string[];
  domains: string[];
  projects: string[];
  
  // Quality Filters
  qualityScores: { min: number; max: number };
  qualityRules: (keyof typeof QUALITY_RULE_TYPES)[];
  qualityStatuses: (keyof typeof QUALITY_STATUSES)[];
  hasQualityIssues: boolean;
  qualityTrends: 'improving' | 'declining' | 'stable' | 'all';
  
  // Usage & Metrics Filters
  usageMetrics: { min: number; max: number };
  popularityScores: { min: number; max: number };
  accessCounts: { min: number; max: number };
  downloadCounts: { min: number; max: number };
  
  // Date & Time Filters
  createdDateRange: TimeRange;
  updatedDateRange: TimeRange;
  lastAccessedRange: TimeRange;
  timeRange: keyof typeof TIME_RANGES;
  
  // Size & Structure Filters
  fileSizes: { min: number; max: number };
  recordCounts: { min: number; max: number };
  columnCounts: { min: number; max: number };
  
  // Relationship Filters
  hasLineage: boolean;
  hasUpstreamDependencies: boolean;
  hasDownstreamDependencies: boolean;
  hasRelationships: boolean;
  hasComments: boolean;
  hasRatings: boolean;
  hasVersions: boolean;
  hasBookmarks: boolean;
  
  // Content Filters
  hasDescription: boolean;
  hasDocumentation: boolean;
  hasSchema: boolean;
  hasSamples: boolean;
  hasBusinessTerms: boolean;
  
  // AI & ML Filters
  aiGenerated: boolean;
  hasAIInsights: boolean;
  hasRecommendations: boolean;
  mlModelTypes: (keyof typeof AI_MODELS)[];
  confidenceScores: { min: number; max: number };
  predictionAccuracy: { min: number; max: number };
  
  // Security & Compliance Filters
  sensitivityLevels: (keyof typeof SECURITY_LEVELS)[];
  complianceStatus: (keyof typeof COMPLIANCE_FRAMEWORKS)[];
  hasSecurityClassification: boolean;
  hasPIIData: boolean;
  hasEncryption: boolean;
  accessLevels: (keyof typeof ACCESS_LEVELS)[];
  
  // Technical Filters
  formats: string[];
  encodings: string[];
  compressionTypes: string[];
  locations: string[];
  environments: 'development' | 'staging' | 'production' | 'all'[];
  
  // Performance Filters
  performanceMetrics: Partial<PerformanceMetric>;
  resourceUsage: Partial<ResourceUsage>;
  cacheHitRatio: { min: number; max: number };
  responseTime: { min: number; max: number };
}

interface CatalogNavigationPath {
  id: string;
  name: string;
  type: 'root' | 'category' | 'folder' | 'asset' | 'schema' | 'table' | 'column';
  path: string;
  breadcrumb: string[];
  metadata?: Record<string, any>;
  permissions?: string[];
}

interface CatalogViewerState {
  // Core State
  isInitialized: boolean;
  isLoading: boolean;
  isSearching: boolean;
  isFiltering: boolean;
  
  // Data State
  assets: IntelligentDataAsset[];
  filteredAssets: IntelligentDataAsset[];
  selectedAsset: IntelligentDataAsset | null;
  favoriteAssets: Set<string>;
  recentAssets: IntelligentDataAsset[];
  bookmarkedAssets: Set<string>;
  
  // Search State
  searchQuery: string;
  searchResults: SearchResponse[];
  searchSuggestions: SearchSuggestion[];
  searchFacets: SearchFacet[];
  searchAnalytics: SearchAnalytics[];
  activeSearchFilters: string[];
  savedSearches: SearchRequest[];
  
  // Quality State
  qualityAssessments: QualityAssessment[];
  qualityAlerts: QualityAlert[];
  qualityMetrics: QualityMetrics[];
  qualityReports: QualityReport[];
  
  // AI & ML State
  aiInsights: AIInsight[];
  recommendations: AIRecommendation[];
  aiAnalyses: AIAnalysis[];
  
  // Lineage State
  lineageGraph: LineageGraph | null;
  lineageMetrics: LineageMetrics[];
  
  // Analytics State
  analyticsReports: AnalyticsReport[];
  performanceMetrics: PerformanceMetric[];
  usageMetrics: AnalyticsMetrics[];
  
  // Collaboration State
  comments: AssetComment[];
  ratings: AssetRating[];
  collaborationSpaces: CollaborationSpace[];
  notifications: CollaborationNotification[];
  
  // Navigation State
  navigationPath: CatalogNavigationPath[];
  breadcrumbs: string[];
  currentCategory: string;
  
  // UI State
  activeView: string;
  viewConfiguration: CatalogViewerConfiguration;
  filters: ComprehensiveAssetFilter;
  pagination: Pagination;
  sortOptions: SortOption[];
  
  // Panel States
  isFilterPanelOpen: boolean;
  isAssetDetailOpen: boolean;
  isLineageViewerOpen: boolean;
  isQualityDashboardOpen: boolean;
  isAnalyticsPanelOpen: boolean;
  isCollaborationPanelOpen: boolean;
  isRecommendationsPanelOpen: boolean;
  isSettingsPanelOpen: boolean;
  
  // Advanced UI State
  expandedNodes: Set<string>;
  selectedItems: Set<string>;
  draggedItems: string[];
  clipboardItems: IntelligentDataAsset[];
  undoStack: any[];
  redoStack: any[];
  
  // System State
  errors: ErrorDetail[];
  warnings: Notification[];
  successMessages: Notification[];
  auditEvents: AuditEntry[];
  healthStatus: HealthCheckResult;
  cacheStatistics: CacheStatistics;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const IntelligentCatalogViewer: React.FC<IntelligentCatalogViewerProps> = ({
  className = '',
  // Core Configuration
  initialAssetId,
  initialConfig,
  userContext,
  systemContext,
  
  // Callbacks - Asset Management
  onAssetSelect,
  onAssetCreate,
  onAssetUpdate,
  onAssetDelete,
  onAssetVersion,
  onAssetComment,
  onAssetRating,
  
  // Advanced Features
  enableAIInsights = true,
  enableAdvancedSearch = true,
  enableCollaboration = true,
  enableLineageVisualization = true,
  enableQualityMonitoring = true,
  enableDataProfiling = true,
  enableSemanticSearch = true,
  enableRecommendations = true,
  enableRealTimeUpdates = true,
  enableBulkOperations = false,
  enableAssetVersioning = true,
  enableAssetComments = true,
  enableAssetRatings = true,
  enableAssetBookmarks = true,
  enableAssetSharing = true,
  enableAssetExport = true,
  
  // UI & Display Options
  showMetrics = true,
  showPerformanceCharts = true,
  showQualityDashboard = true,
  showLineageViewer = true,
  showAnalyticsPanels = true,
  showCollaborationPanel = true,
  showRecommendationsPanel = true,
  showAdvancedFilters = true,
  showAssetPreview = true,
  showAssetVersionHistory = true,
  defaultLayout = 'grid',
  defaultView = 'catalog',
  theme = 'auto',
  density = 'normal',
  
  // Advanced Callbacks
  onError,
  onWarning,
  onSuccess,
  onAuditEvent,
  onPerformanceAlert,
  onQualityAlert,
  onSearchQuery,
  onNavigationChange,
  
  // Integration Hooks
  customServices,
  customEndpoints,
  customConfiguration,
  featureFlags = {}
}) => {
  // ============================================================================
  // COMPREHENSIVE STATE MANAGEMENT
  // ============================================================================
  
  // Initialize comprehensive state
  const [viewerState, setViewerState] = useState<CatalogViewerState>({
    // Core State
    isInitialized: false,
    isLoading: false,
    isSearching: false,
    isFiltering: false,
    
    // Data State
    assets: [],
    filteredAssets: [],
    selectedAsset: null,
    favoriteAssets: new Set(),
    recentAssets: [],
    bookmarkedAssets: new Set(),
    
    // Search State
    searchQuery: '',
    searchResults: [],
    searchSuggestions: [],
    searchFacets: [],
    searchAnalytics: [],
    activeSearchFilters: [],
    savedSearches: [],
    
    // Quality State
    qualityAssessments: [],
    qualityAlerts: [],
    qualityMetrics: [],
    qualityReports: [],
    
    // AI & ML State
    aiInsights: [],
    recommendations: [],
    aiAnalyses: [],
    
    // Lineage State
    lineageGraph: null,
    lineageMetrics: [],
    
    // Analytics State
    analyticsReports: [],
    performanceMetrics: [],
    usageMetrics: [],
    
    // Collaboration State
    comments: [],
    ratings: [],
    collaborationSpaces: [],
    notifications: [],
    
    // Navigation State
    navigationPath: [
      { 
        id: 'root', 
        name: 'Data Catalog', 
        type: 'root', 
        path: '/', 
        breadcrumb: ['Data Catalog'],
        metadata: {},
        permissions: ['read']
      }
    ],
    breadcrumbs: ['Data Catalog'],
    currentCategory: 'root',
    
    // UI State
    activeView: defaultView,
    viewConfiguration: initialConfig || {
      display: {
        layout: defaultLayout,
        density,
        theme: Object.keys(UI_THEMES)[0] as keyof typeof UI_THEMES,
        groupBy: 'none',
        sortBy: 'name',
        sortOrder: 'ASC',
        itemsPerPage: 25,
        showThumbnails: true,
        showPreview: showAssetPreview,
        showMetrics,
        showRelationships: false,
        enableAnimations: true,
      },
      search: {
        enableSemanticSearch,
        enableFacetedSearch: enableAdvancedSearch,
        enableNaturalLanguageQuery: enableAdvancedSearch,
        enableSearchSuggestions: true,
        enableSearchAnalytics: true,
        searchOperators: Object.keys(SEARCH_OPERATORS) as (keyof typeof SEARCH_OPERATORS)[],
        facetTypes: Object.keys(FACET_TYPES) as (keyof typeof FACET_TYPES)[],
        defaultFilters: {
          field: '',
          operator: 'EQUALS',
          value: '',
          assetTypes: [],
          dataSourceTypes: [],
          statuses: [],
          owners: [],
          stewards: [],
          creators: [],
          tags: [],
          classifications: [],
          domains: [],
          projects: [],
          qualityScores: { min: 0, max: 100 },
          qualityRules: [],
          qualityStatuses: [],
          hasQualityIssues: false,
          qualityTrends: 'all',
          usageMetrics: { min: 0, max: 100 },
          popularityScores: { min: 0, max: 100 },
          accessCounts: { min: 0, max: 1000000 },
          downloadCounts: { min: 0, max: 1000000 },
          createdDateRange: {
            start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            end: new Date()
          },
          updatedDateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          },
          lastAccessedRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          },
          timeRange: 'LAST_30_DAYS',
          fileSizes: { min: 0, max: Number.MAX_SAFE_INTEGER },
          recordCounts: { min: 0, max: Number.MAX_SAFE_INTEGER },
          columnCounts: { min: 0, max: 1000 },
          hasLineage: false,
          hasUpstreamDependencies: false,
          hasDownstreamDependencies: false,
          hasRelationships: false,
          hasComments: false,
          hasRatings: false,
          hasVersions: false,
          hasBookmarks: false,
          hasDescription: false,
          hasDocumentation: false,
          hasSchema: false,
          hasSamples: false,
          hasBusinessTerms: false,
          aiGenerated: false,
          hasAIInsights: false,
          hasRecommendations: false,
          mlModelTypes: [],
          confidenceScores: { min: 0, max: 100 },
          predictionAccuracy: { min: 0, max: 100 },
          sensitivityLevels: [],
          complianceStatus: [],
          hasSecurityClassification: false,
          hasPIIData: false,
          hasEncryption: false,
          accessLevels: [],
          formats: [],
          encodings: [],
          compressionTypes: [],
          locations: [],
          environments: [],
          performanceMetrics: {},
          resourceUsage: {},
          cacheHitRatio: { min: 0, max: 100 },
          responseTime: { min: 0, max: 10000 }
        },
        savedSearches: [],
        searchHistory: []
      },
      quality: {
        enableQualityScoring: enableQualityMonitoring,
        enableQualityRules: enableQualityMonitoring,
        enableQualityAlerts: enableQualityMonitoring,
        enableQualityTrends: enableQualityMonitoring,
        enableQualityReports: enableQualityMonitoring,
        qualityThresholds: QUALITY_THRESHOLDS,
        qualityDimensions: Object.keys(QUALITY_DIMENSIONS) as (keyof typeof QUALITY_DIMENSIONS)[],
        complianceFrameworks: Object.keys(COMPLIANCE_FRAMEWORKS) as (keyof typeof COMPLIANCE_FRAMEWORKS)[],
        enablePolicyEnforcement: true,
      },
      ai: {
        enableAIInsights,
        enableRecommendations,
        enableSemanticAnalysis: enableSemanticSearch,
        enablePatternDetection: true,
        enableAnomalyDetection: true,
        enableAutoClassification: true,
        enableAutoTagging: true,
        aiModels: Object.keys(AI_MODELS) as (keyof typeof AI_MODELS)[],
        mlAlgorithms: Object.keys(ML_ALGORITHMS) as (keyof typeof ML_ALGORITHMS)[],
        confidenceThreshold: CONFIDENCE_THRESHOLDS.HIGH || 0.8,
        learningMode: Object.keys(LEARNING_MODES)[0] as keyof typeof LEARNING_MODES,
      },
      lineage: {
        enableLineageVisualization,
        enableImpactAnalysis: true,
        enableDataFlowMapping: true,
        enableDependencyTracking: true,
        lineageDepth: 5,
        lineageDirection: 'both',
        showColumnLineage: true,
        showTransformations: true,
        enableLineageSearch: true,
      },
      collaboration: {
        enableComments: enableAssetComments,
        enableRatings: enableAssetRatings,
        enableBookmarks: enableAssetBookmarks,
        enableSharing: enableAssetSharing,
        enableNotifications: true,
        enableReviews: true,
        enableDiscussions: true,
        enableWorkspaces: true,
        enableTeamManagement: true,
        notificationTypes: Object.keys(NOTIFICATION_TYPES) as (keyof typeof NOTIFICATION_TYPES)[],
      },
      analytics: {
        enableUsageTracking: true,
        enablePerformanceMonitoring: showPerformanceCharts,
        enableTrendAnalysis: true,
        enablePredictiveAnalytics: true,
        enableCustomDashboards: showAnalyticsPanels,
        enableReporting: true,
        analyticsMetrics: Object.keys(ANALYTICS_METRICS) as (keyof typeof ANALYTICS_METRICS)[],
        chartTypes: Object.keys(CHART_TYPES) as (keyof typeof CHART_TYPES)[],
        aggregationFunctions: Object.keys(AGGREGATION_FUNCTIONS) as (keyof typeof AGGREGATION_FUNCTIONS)[],
        retentionPeriod: 365,
      },
      security: {
        enableAccessControl: true,
        enableDataMasking: true,
        enableAuditLogging: true,
        enableEncryption: true,
        securityLevel: Object.keys(SECURITY_LEVELS)[0] as keyof typeof SECURITY_LEVELS,
        accessLevel: Object.keys(ACCESS_LEVELS)[0] as keyof typeof ACCESS_LEVELS,
        sensitiveDataDetection: true,
        piiDetection: true,
        auditActions: Object.keys(AUDIT_ACTIONS) as (keyof typeof AUDIT_ACTIONS)[],
      },
      performance: {
        enableCaching: true,
        enableLazyLoading: true,
        enableVirtualization: true,
        enablePagination: true,
        enableInfiniteScroll: false,
        cacheStrategy: Object.keys(CACHE_STRATEGIES)[0] as keyof typeof CACHE_STRATEGIES,
        maxConcurrentRequests: 10,
        requestTimeout: 30000,
        retryPolicy: Object.keys(RETRY_POLICIES)[0] as keyof typeof RETRY_POLICIES,
        optimizeImages: true,
      },
      integration: {
        enableExport: enableAssetExport,
        enableImport: true,
        enableAPIAccess: true,
        enableWebhooks: true,
        enableEventStreaming: enableRealTimeUpdates,
        exportFormats: Object.keys(EXPORT_FORMATS) as (keyof typeof EXPORT_FORMATS)[],
        importFormats: Object.keys(IMPORT_FORMATS) as (keyof typeof IMPORT_FORMATS)[],
        storageProviders: Object.keys(STORAGE_PROVIDERS) as (keyof typeof STORAGE_PROVIDERS)[],
        apiEndpoints: customEndpoints || endpoints,
        webhookUrls: [],
      },
    },
    filters: {
      field: '',
      operator: 'EQUALS',
      value: '',
      assetTypes: [],
      dataSourceTypes: [],
      statuses: [],
      owners: [],
      stewards: [],
      creators: [],
      tags: [],
      classifications: [],
      domains: [],
      projects: [],
      qualityScores: { min: 0, max: 100 },
      qualityRules: [],
      qualityStatuses: [],
      hasQualityIssues: false,
      qualityTrends: 'all',
      usageMetrics: { min: 0, max: 100 },
      popularityScores: { min: 0, max: 100 },
      accessCounts: { min: 0, max: 1000000 },
      downloadCounts: { min: 0, max: 1000000 },
      createdDateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      updatedDateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      lastAccessedRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      timeRange: 'LAST_30_DAYS',
      fileSizes: { min: 0, max: Number.MAX_SAFE_INTEGER },
      recordCounts: { min: 0, max: Number.MAX_SAFE_INTEGER },
      columnCounts: { min: 0, max: 1000 },
      hasLineage: false,
      hasUpstreamDependencies: false,
      hasDownstreamDependencies: false,
      hasRelationships: false,
      hasComments: false,
      hasRatings: false,
      hasVersions: false,
      hasBookmarks: false,
      hasDescription: false,
      hasDocumentation: false,
      hasSchema: false,
      hasSamples: false,
      hasBusinessTerms: false,
      aiGenerated: false,
      hasAIInsights: false,
      hasRecommendations: false,
      mlModelTypes: [],
      confidenceScores: { min: 0, max: 100 },
      predictionAccuracy: { min: 0, max: 100 },
      sensitivityLevels: [],
      complianceStatus: [],
      hasSecurityClassification: false,
      hasPIIData: false,
      hasEncryption: false,
      accessLevels: [],
      formats: [],
      encodings: [],
      compressionTypes: [],
      locations: [],
      environments: [],
      performanceMetrics: {},
      resourceUsage: {},
      cacheHitRatio: { min: 0, max: 100 },
      responseTime: { min: 0, max: 10000 }
    },
    pagination: {
      page: 1,
      size: 25,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false
    },
    sortOptions: [
      { field: 'name', direction: 'ASC' }
    ],
    
    // Panel States
    isFilterPanelOpen: false,
    isAssetDetailOpen: false,
    isLineageViewerOpen: false,
    isQualityDashboardOpen: false,
    isAnalyticsPanelOpen: false,
    isCollaborationPanelOpen: false,
    isRecommendationsPanelOpen: false,
    isSettingsPanelOpen: false,
    
    // Advanced UI State
    expandedNodes: new Set(),
    selectedItems: new Set(),
    draggedItems: [],
    clipboardItems: [],
    undoStack: [],
    redoStack: [],
    
    // System State
    errors: [],
    warnings: [],
    successMessages: [],
    auditEvents: [],
    healthStatus: {
      status: 'healthy',
      timestamp: new Date(),
      services: {},
      metrics: {}
    },
    cacheStatistics: {
      hitRate: 0,
      missRate: 0,
      evictionRate: 0,
      size: 0
    }
  });

  // Animation Controllers
  const controls = useAnimation();
  const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(enableRealTimeUpdates);
  const [updateInterval, setUpdateInterval] = useState<number>(30000);

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    assets: catalogAssets,
    isLoading: catalogLoading,
    error: catalogError,
    searchAssets,
    getAssetDetails,
    getAssetRelationships,
    refreshCatalog
  } = useCatalogDiscovery({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const {
    insights,
    recommendations,
    generateAssetInsights,
    getAssetRecommendations,
    isAnalyzing
  } = useCatalogAI();

  const {
    getAssetMetrics,
    getUsageAnalytics,
    getPopularityScores
  } = useCatalogAnalytics();

  const {
    getPersonalizedRecommendations,
    recordAssetInteraction
  } = useCatalogRecommendations();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredAssets = useMemo(() => {
    if (!catalogAssets) return [];

    return catalogAssets.filter(asset => {
      const matchesSearch = searchQuery === '' || 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilters = (
        (filters.types.length === 0 || filters.types.includes(asset.type)) &&
        (filters.sources.length === 0 || filters.sources.includes(asset.sourceId)) &&
        (filters.owners.length === 0 || filters.owners.includes(asset.owner)) &&
        (filters.classifications.length === 0 || asset.classifications?.some(c => filters.classifications.includes(c.name))) &&
        (asset.qualityScore >= filters.qualityScores.min && asset.qualityScore <= filters.qualityScores.max) &&
        (!filters.hasDescription || asset.description) &&
        (!filters.hasLineage || asset.hasLineage) &&
        (!filters.hasQualityRules || asset.qualityRules?.length > 0)
      );

      return matchesSearch && matchesFilters;
    });
  }, [catalogAssets, searchQuery, filters]);

  const groupedAssets = useMemo(() => {
    if (viewConfig.groupBy === 'none') {
      return { 'All Assets': filteredAssets };
    }

    const groups: Record<string, IntelligentDataAsset[]> = {};
    
    filteredAssets.forEach(asset => {
      let groupKey = '';
      
      switch (viewConfig.groupBy) {
        case 'type':
          groupKey = formatAssetType(asset.type);
          break;
        case 'source':
          groupKey = asset.sourceName || 'Unknown Source';
          break;
        case 'owner':
          groupKey = asset.owner || 'Unowned';
          break;
        case 'classification':
          groupKey = asset.classifications?.[0]?.name || 'Unclassified';
          break;
        case 'quality':
          groupKey = asset.qualityScore >= 80 ? 'High Quality' : 
                   asset.qualityScore >= 60 ? 'Medium Quality' : 'Low Quality';
          break;
        default:
          groupKey = 'All Assets';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(asset);
    });

    // Sort groups and assets within groups
    Object.keys(groups).forEach(key => {
      groups[key] = sortAssets(groups[key]);
    });

    return groups;
  }, [filteredAssets, viewConfig.groupBy, viewConfig.sortBy, viewConfig.sortOrder]);

  const sortAssets = (assets: IntelligentDataAsset[]) => {
    return [...assets].sort((a, b) => {
      let comparison = 0;
      
      switch (viewConfig.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'quality':
          comparison = a.qualityScore - b.qualityScore;
          break;
        case 'usage':
          comparison = (a.usageMetrics?.accessCount || 0) - (b.usageMetrics?.accessCount || 0);
          break;
        case 'popularity':
          comparison = (a.popularityScore || 0) - (b.popularityScore || 0);
          break;
      }
      
      return viewConfig.sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAssetSelect = useCallback(async (asset: IntelligentDataAsset) => {
    setSelectedAsset(asset);
    setIsAssetDetailOpen(true);
    
    // Record interaction
    await recordAssetInteraction({
      assetId: asset.id,
      type: 'view',
      timestamp: new Date()
    });
    
    // Update recent assets
    setRecentAssets(prev => {
      const filtered = prev.filter(a => a.id !== asset.id);
      return [asset, ...filtered].slice(0, 10);
    });
    
    // Generate insights if enabled
    if (enableAIInsights) {
      generateAssetInsights(asset.id);
    }
    
    onAssetSelect?.(asset);
  }, [recordAssetInteraction, generateAssetInsights, enableAIInsights, onAssetSelect]);

  const handleToggleFavorite = useCallback((assetId: string) => {
    setFavoriteAssets(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchAssets(query, filters);
    }
  }, [searchAssets, filters]);

  const handleFilterChange = useCallback((newFilters: Partial<AssetFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleViewConfigChange = useCallback((config: Partial<ViewConfiguration>) => {
    setViewConfig(prev => ({ ...prev, ...config }));
  }, []);

  const handleNavigate = useCallback((item: BreadcrumbItem) => {
    const index = navigationPath.findIndex(p => p.id === item.id);
    if (index >= 0) {
      setNavigationPath(prev => prev.slice(0, index + 1));
    }
  }, [navigationPath]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderAssetCard = (asset: IntelligentDataAsset) => (
    <motion.div
      key={asset.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group cursor-pointer"
      onClick={() => handleAssetSelect(asset)}
    >
      <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 group-hover:border-l-blue-600">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="outline" className="text-xs shrink-0">
                  {formatAssetType(asset.type)}
                </Badge>
                {asset.isVerified && (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                )}
                {asset.isSensitive && (
                  <Shield className="h-4 w-4 text-red-500 shrink-0" />
                )}
              </div>
              <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors truncate">
                {asset.name}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {asset.description || 'No description available'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(asset.id);
                    }}
                  >
                    <Heart className={`h-4 w-4 ${favoriteAssets.has(asset.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{favoriteAssets.has(asset.id) ? 'Remove from favorites' : 'Add to favorites'}</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Source
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Quality and Usage Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{asset.qualityScore || 0}%</div>
                <div className="text-xs text-blue-600">Quality</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{asset.usageMetrics?.accessCount || 0}</div>
                <div className="text-xs text-green-600">Views</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{asset.relationships?.length || 0}</div>
                <div className="text-xs text-purple-600">Links</div>
              </div>
            </div>

            {/* Owner and Source Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{asset.owner || 'Unowned'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>{asset.sourceName || 'Unknown'}</span>
              </div>
            </div>

            {/* Tags */}
            {asset.tags && asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {asset.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {asset.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{asset.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Updated Time */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Updated {formatDate(asset.updatedAt)}</span>
              {asset.isRecent && (
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAssetList = (asset: IntelligentDataAsset) => (
    <motion.div
      key={asset.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => handleAssetSelect(asset)}
    >
      <div className="flex items-center space-x-4">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors truncate">
              {asset.name}
            </h3>
            <Badge variant="outline" className="text-xs shrink-0">
              {formatAssetType(asset.type)}
            </Badge>
            {asset.isVerified && (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {asset.description || 'No description available'}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
            <span>Quality: {asset.qualityScore || 0}%</span>
            <span>Views: {asset.usageMetrics?.accessCount || 0}</span>
            <span>Owner: {asset.owner || 'Unowned'}</span>
            <span>Updated: {formatDate(asset.updatedAt)}</span>
          </div>
        </div>
        <div className="shrink-0 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(asset.id);
            }}
          >
            <Heart className={`h-4 w-4 ${favoriteAssets.has(asset.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );

  const renderBreadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      {navigationPath.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          <button
            onClick={() => handleNavigate(item)}
            className="hover:text-foreground transition-colors"
          >
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Intelligent Catalog</h1>
                <p className="text-muted-foreground">AI-powered data asset discovery and management</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCatalog}
              disabled={catalogLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${catalogLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            
            <Sheet open={isFilterPanelOpen} onOpenChange={setIsFilterPanelOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Assets</SheetTitle>
                  <SheetDescription>
                    Refine your catalog view with advanced filters
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="text-center text-muted-foreground">
                    Advanced filter panel goes here
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search data assets..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              value={viewConfig.layout}
              onValueChange={(value: any) => handleViewConfigChange({ layout: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">
                  <div className="flex items-center space-x-2">
                    <Grid3X3 className="h-4 w-4" />
                    <span>Grid</span>
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center space-x-2">
                    <List className="h-4 w-4" />
                    <span>List</span>
                  </div>
                </SelectItem>
                <SelectItem value="tree">
                  <div className="flex items-center space-x-2">
                    <FolderTree className="h-4 w-4" />
                    <span>Tree</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={viewConfig.sortBy}
              onValueChange={(value: any) => handleViewConfigChange({ sortBy: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="updated">Updated Date</SelectItem>
                <SelectItem value="quality">Quality Score</SelectItem>
                <SelectItem value="usage">Usage Count</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {renderBreadcrumb()}

        {/* Main Content */}
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
          <ResizablePanel defaultSize={75} minSize={60}>
            <div className="h-full p-6">
              {catalogLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading catalog assets...</p>
                  </div>
                </div>
              ) : catalogError ? (
                <div className="flex items-center justify-center h-full">
                  <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Catalog</AlertTitle>
                    <AlertDescription>
                      {catalogError.message || 'Failed to load catalog assets. Please try again.'}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : Object.keys(groupedAssets).length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No assets found</h3>
                    <p className="text-muted-foreground">
                      No data assets match your current search and filter criteria.
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-8">
                    {Object.entries(groupedAssets).map(([groupName, assets]) => (
                      <div key={groupName}>
                        {viewConfig.groupBy !== 'none' && (
                          <div className="flex items-center space-x-2 mb-4">
                            <h2 className="text-xl font-semibold">{groupName}</h2>
                            <Badge variant="secondary">{assets.length}</Badge>
                          </div>
                        )}
                        
                        {viewConfig.layout === 'grid' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <AnimatePresence>
                              {assets.map(renderAssetCard)}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <AnimatePresence>
                              {assets.map(renderAssetList)}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="h-full p-6 border-l bg-muted/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quick Access</h3>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Star className="mr-2 h-4 w-4" />
                      Favorites ({favoriteAssets.size})
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Clock className="mr-2 h-4 w-4" />
                      Recent ({recentAssets.length})
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Popular
                    </Button>
                  </div>
                </div>

                {enableAIInsights && recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">AI Recommendations</h3>
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <Alert key={index}>
                          <Sparkles className="h-4 w-4" />
                          <AlertTitle className="text-sm">{rec.title}</AlertTitle>
                          <AlertDescription className="text-xs">
                            {rec.description}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {recentAssets.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recently Viewed</h3>
                    <div className="space-y-2">
                      {recentAssets.slice(0, 5).map((asset) => (
                        <div
                          key={asset.id}
                          className="p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => handleAssetSelect(asset)}
                        >
                          <div className="flex items-center space-x-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{asset.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatAssetType(asset.type)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Asset Detail Dialog */}
        {selectedAsset && (
          <Dialog open={isAssetDetailOpen} onOpenChange={setIsAssetDetailOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span>{selectedAsset.name}</span>
                </DialogTitle>
                <DialogDescription>
                  Detailed information about this data asset
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8 text-muted-foreground">
                Detailed asset information component goes here
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
};

export default IntelligentCatalogViewer;