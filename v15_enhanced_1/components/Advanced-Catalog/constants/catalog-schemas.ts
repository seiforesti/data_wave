// 📋 **CATALOG SCHEMAS & CONSTANTS** - Configuration constants for Advanced Catalog
// Comprehensive constants supporting all catalog operations and UI components

import { 
  AssetType, 
  SensitivityLevel, 
  QualityGrade,
  ValidationStatus,
  ApprovalStatus 
} from '../types/catalog-core.types';

import {
  DiscoveryType,
  ScanDepth,
  ProfilingType,
  SamplingStrategy,
  PatternType
} from '../types/discovery.types';

import {
  QualityCategory,
  QualityRuleType,
  MonitoringFrequency,
  AlertType
} from '../types/quality.types';

// 🎯 ASSET TYPE CONFIGURATIONS
export const ASSET_TYPE_CONFIG = {
  [AssetType.TABLE]: {
    icon: '🏗️',
    label: 'Table',
    description: 'Database table with structured data',
    color: '#3B82F6',
    defaultActions: ['profile', 'classify', 'lineage', 'quality'],
    profilingSupported: true,
    lineageSupported: true,
    searchBoost: 1.2,
  },
  [AssetType.VIEW]: {
    icon: '👁️',
    label: 'View',
    description: 'Database view or virtual table',
    color: '#8B5CF6',
    defaultActions: ['profile', 'lineage', 'quality'],
    profilingSupported: true,
    lineageSupported: true,
    searchBoost: 1.0,
  },
  [AssetType.COLUMN]: {
    icon: '📊',
    label: 'Column',
    description: 'Database column or field',
    color: '#10B981',
    defaultActions: ['profile', 'classify', 'quality'],
    profilingSupported: true,
    lineageSupported: true,
    searchBoost: 0.8,
  },
  [AssetType.FILE]: {
    icon: '📄',
    label: 'File',
    description: 'Data file (CSV, JSON, Parquet, etc.)',
    color: '#F59E0B',
    defaultActions: ['profile', 'classify', 'quality'],
    profilingSupported: true,
    lineageSupported: false,
    searchBoost: 1.0,
  },
  [AssetType.API]: {
    icon: '🔌',
    label: 'API',
    description: 'REST API or web service endpoint',
    color: '#EF4444',
    defaultActions: ['monitor', 'quality'],
    profilingSupported: false,
    lineageSupported: true,
    searchBoost: 0.9,
  },
  [AssetType.STREAM]: {
    icon: '🌊',
    label: 'Stream',
    description: 'Real-time data stream',
    color: '#06B6D4',
    defaultActions: ['monitor', 'quality'],
    profilingSupported: true,
    lineageSupported: true,
    searchBoost: 1.1,
  },
  [AssetType.DASHBOARD]: {
    icon: '📈',
    label: 'Dashboard',
    description: 'Business intelligence dashboard',
    color: '#84CC16',
    defaultActions: ['lineage', 'usage'],
    profilingSupported: false,
    lineageSupported: true,
    searchBoost: 1.3,
  },
  [AssetType.REPORT]: {
    icon: '📋',
    label: 'Report',
    description: 'Business report or analysis',
    color: '#F97316',
    defaultActions: ['lineage', 'usage'],
    profilingSupported: false,
    lineageSupported: true,
    searchBoost: 1.2,
  },
  [AssetType.MODEL]: {
    icon: '🤖',
    label: 'ML Model',
    description: 'Machine learning model',
    color: '#A855F7',
    defaultActions: ['monitor', 'lineage', 'quality'],
    profilingSupported: false,
    lineageSupported: true,
    searchBoost: 1.4,
  },
  [AssetType.NOTEBOOK]: {
    icon: '📓',
    label: 'Notebook',
    description: 'Jupyter or analysis notebook',
    color: '#EC4899',
    defaultActions: ['lineage', 'usage'],
    profilingSupported: false,
    lineageSupported: true,
    searchBoost: 1.1,
  },
  [AssetType.PIPELINE]: {
    icon: '⚡',
    label: 'Pipeline',
    description: 'Data processing pipeline',
    color: '#14B8A6',
    defaultActions: ['monitor', 'lineage', 'quality'],
    profilingSupported: false,
    lineageSupported: true,
    searchBoost: 1.3,
  },
  [AssetType.DATASET]: {
    icon: '🗂️',
    label: 'Dataset',
    description: 'Collection of related data',
    color: '#6366F1',
    defaultActions: ['profile', 'classify', 'lineage', 'quality'],
    profilingSupported: true,
    lineageSupported: true,
    searchBoost: 1.5,
  },
} as const;

// 🔒 SENSITIVITY LEVEL CONFIGURATIONS
export const SENSITIVITY_LEVEL_CONFIG = {
  [SensitivityLevel.PUBLIC]: {
    icon: '🌍',
    label: 'Public',
    description: 'Publicly available information',
    color: '#10B981',
    badgeVariant: 'default',
    riskLevel: 'low',
    accessRestrictions: [],
  },
  [SensitivityLevel.INTERNAL]: {
    icon: '🏢',
    label: 'Internal',
    description: 'Internal company information',
    color: '#3B82F6',
    badgeVariant: 'secondary',
    riskLevel: 'low',
    accessRestrictions: ['internal_users'],
  },
  [SensitivityLevel.CONFIDENTIAL]: {
    icon: '🔒',
    label: 'Confidential',
    description: 'Sensitive business information',
    color: '#F59E0B',
    badgeVariant: 'warning',
    riskLevel: 'medium',
    accessRestrictions: ['authorized_users', 'audit_log'],
  },
  [SensitivityLevel.RESTRICTED]: {
    icon: '⚠️',
    label: 'Restricted',
    description: 'Highly sensitive data requiring special handling',
    color: '#EF4444',
    badgeVariant: 'destructive',
    riskLevel: 'high',
    accessRestrictions: ['authorized_users', 'audit_log', 'multi_factor_auth'],
  },
  [SensitivityLevel.TOP_SECRET]: {
    icon: '🚫',
    label: 'Top Secret',
    description: 'Extremely sensitive data with maximum security',
    color: '#7C2D12',
    badgeVariant: 'destructive',
    riskLevel: 'critical',
    accessRestrictions: ['highest_clearance', 'audit_log', 'multi_factor_auth', 'encryption'],
  },
} as const;

// 📈 QUALITY GRADE CONFIGURATIONS
export const QUALITY_GRADE_CONFIG = {
  [QualityGrade.EXCELLENT]: {
    icon: '🏆',
    label: 'Excellent',
    description: 'Exceptional data quality (90-100%)',
    color: '#10B981',
    scoreRange: [90, 100],
    badgeVariant: 'default',
    actionRequired: false,
  },
  [QualityGrade.GOOD]: {
    icon: '✅',
    label: 'Good',
    description: 'Good data quality (75-89%)',
    color: '#84CC16',
    scoreRange: [75, 89],
    badgeVariant: 'secondary',
    actionRequired: false,
  },
  [QualityGrade.ACCEPTABLE]: {
    icon: '⚡',
    label: 'Acceptable',
    description: 'Acceptable data quality (60-74%)',
    color: '#F59E0B',
    scoreRange: [60, 74],
    badgeVariant: 'warning',
    actionRequired: true,
  },
  [QualityGrade.POOR]: {
    icon: '⚠️',
    label: 'Poor',
    description: 'Poor data quality (40-59%)',
    color: '#EF4444',
    scoreRange: [40, 59],
    badgeVariant: 'destructive',
    actionRequired: true,
  },
  [QualityGrade.CRITICAL]: {
    icon: '🚨',
    label: 'Critical',
    description: 'Critical data quality issues (0-39%)',
    color: '#DC2626',
    scoreRange: [0, 39],
    badgeVariant: 'destructive',
    actionRequired: true,
  },
} as const;

// 🔍 DISCOVERY TYPE CONFIGURATIONS
export const DISCOVERY_TYPE_CONFIG = {
  [DiscoveryType.FULL_SCAN]: {
    icon: '🔍',
    label: 'Full Scan',
    description: 'Complete discovery of all data assets',
    estimatedTime: 'Long (2-8 hours)',
    resourceUsage: 'High',
    accuracy: 'Highest',
    defaultDepth: ScanDepth.DEEP,
  },
  [DiscoveryType.INCREMENTAL]: {
    icon: '🔄',
    label: 'Incremental',
    description: 'Discover only new or changed assets',
    estimatedTime: 'Medium (30-120 minutes)',
    resourceUsage: 'Medium',
    accuracy: 'High',
    defaultDepth: ScanDepth.MEDIUM,
  },
  [DiscoveryType.TARGETED]: {
    icon: '🎯',
    label: 'Targeted',
    description: 'Focus on specific data sources or types',
    estimatedTime: 'Short (10-60 minutes)',
    resourceUsage: 'Low',
    accuracy: 'Medium',
    defaultDepth: ScanDepth.MEDIUM,
  },
  [DiscoveryType.SCHEMA_ONLY]: {
    icon: '🏗️',
    label: 'Schema Only',
    description: 'Discover only schema and structure',
    estimatedTime: 'Very Short (5-30 minutes)',
    resourceUsage: 'Very Low',
    accuracy: 'Medium',
    defaultDepth: ScanDepth.SHALLOW,
  },
  [DiscoveryType.METADATA_ONLY]: {
    icon: '📋',
    label: 'Metadata Only',
    description: 'Discover only metadata information',
    estimatedTime: 'Very Short (2-15 minutes)',
    resourceUsage: 'Very Low',
    accuracy: 'Low',
    defaultDepth: ScanDepth.SHALLOW,
  },
  [DiscoveryType.LINEAGE_DISCOVERY]: {
    icon: '🔗',
    label: 'Lineage Discovery',
    description: 'Focus on discovering data lineage relationships',
    estimatedTime: 'Medium (30-90 minutes)',
    resourceUsage: 'Medium',
    accuracy: 'High',
    defaultDepth: ScanDepth.DEEP,
  },
} as const;

// 📊 PROFILING TYPE CONFIGURATIONS
export const PROFILING_TYPE_CONFIG = {
  [ProfilingType.BASIC]: {
    icon: '📊',
    label: 'Basic',
    description: 'Essential statistics and data types',
    features: ['null_count', 'unique_count', 'data_types', 'row_count'],
    estimatedTime: 'Fast (1-5 minutes)',
    accuracy: 'Medium',
  },
  [ProfilingType.COMPREHENSIVE]: {
    icon: '🔬',
    label: 'Comprehensive',
    description: 'Complete statistical analysis and patterns',
    features: ['all_basic', 'distributions', 'correlations', 'patterns', 'anomalies'],
    estimatedTime: 'Slow (10-60 minutes)',
    accuracy: 'Highest',
  },
  [ProfilingType.STATISTICAL]: {
    icon: '📈',
    label: 'Statistical',
    description: 'Advanced statistical analysis',
    features: ['all_basic', 'statistics', 'distributions', 'outliers'],
    estimatedTime: 'Medium (5-20 minutes)',
    accuracy: 'High',
  },
  [ProfilingType.QUALITY_FOCUSED]: {
    icon: '✅',
    label: 'Quality Focused',
    description: 'Data quality assessment focus',
    features: ['quality_metrics', 'completeness', 'validity', 'consistency'],
    estimatedTime: 'Medium (3-15 minutes)',
    accuracy: 'High',
  },
  [ProfilingType.PERFORMANCE_OPTIMIZED]: {
    icon: '⚡',
    label: 'Performance Optimized',
    description: 'Fast profiling with sampling',
    features: ['basic_stats', 'sampling', 'quick_patterns'],
    estimatedTime: 'Very Fast (30 seconds - 2 minutes)',
    accuracy: 'Medium',
  },
} as const;

// 🎨 UI THEME CONFIGURATIONS
export const UI_THEMES = {
  light: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  dark: {
    primary: '#60A5FA',
    secondary: '#A78BFA',
    accent: '#34D399',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
} as const;

// 📏 LAYOUT CONSTANTS
export const LAYOUT_CONSTANTS = {
  sidebar: {
    width: 280,
    collapsedWidth: 64,
    breakpoint: 1024,
  },
  header: {
    height: 64,
    mobileHeight: 56,
  },
  content: {
    maxWidth: 1440,
    padding: 24,
    mobilePadding: 16,
  },
  card: {
    borderRadius: 8,
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: 24,
  },
  modal: {
    maxWidth: 720,
    padding: 32,
  },
  toast: {
    duration: 5000,
    position: 'top-right',
  },
} as const;

// 📊 DATA VISUALIZATION DEFAULTS
export const CHART_DEFAULTS = {
  colors: [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ],
  animation: {
    duration: 300,
    easing: 'ease-in-out',
  },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#374151',
      borderWidth: 1,
    },
  },
} as const;

// 🔍 SEARCH CONFIGURATIONS
export const SEARCH_CONFIG = {
  debounceMs: 300,
  minQueryLength: 2,
  maxSuggestions: 10,
  maxResults: 50,
  highlightTags: {
    pre: '<mark class="search-highlight">',
    post: '</mark>',
  },
  filters: {
    assetTypes: Object.values(AssetType),
    sensitivityLevels: Object.values(SensitivityLevel),
    qualityGrades: Object.values(QualityGrade),
  },
  sorting: [
    { key: 'relevance', label: 'Relevance', default: true },
    { key: 'name', label: 'Name' },
    { key: 'created_at', label: 'Created Date' },
    { key: 'updated_at', label: 'Modified Date' },
    { key: 'popularity', label: 'Popularity' },
    { key: 'quality_score', label: 'Quality Score' },
  ],
} as const;

// 📋 TABLE CONFIGURATIONS
export const TABLE_CONFIG = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
  maxHeight: 600,
  stickyHeader: true,
  showPagination: true,
  showSearch: true,
  showColumnToggle: true,
  showExport: true,
  exportFormats: ['csv', 'excel', 'json'],
  density: {
    compact: { rowHeight: 36, padding: 8 },
    normal: { rowHeight: 48, padding: 12 },
    comfortable: { rowHeight: 56, padding: 16 },
  },
} as const;

// 🎯 QUALITY RULE TEMPLATES
export const QUALITY_RULE_TEMPLATES = {
  completeness: {
    [QualityCategory.COMPLETENESS]: [
      {
        name: 'Non-null Check',
        description: 'Ensure column has no null values',
        expression: 'COUNT(*) WHERE {column} IS NULL = 0',
        threshold: 100,
        operator: 'equals',
      },
      {
        name: 'Completeness Threshold',
        description: 'Ensure minimum completeness percentage',
        expression: '(COUNT(*) - COUNT(*) WHERE {column} IS NULL) / COUNT(*) * 100',
        threshold: 95,
        operator: 'greater_than_or_equal',
      },
    ],
  },
  uniqueness: {
    [QualityCategory.UNIQUENESS]: [
      {
        name: 'Unique Values',
        description: 'Ensure all values are unique',
        expression: 'COUNT(DISTINCT {column}) = COUNT({column})',
        threshold: true,
        operator: 'equals',
      },
      {
        name: 'Duplicate Threshold',
        description: 'Ensure duplicate percentage is below threshold',
        expression: '(COUNT({column}) - COUNT(DISTINCT {column})) / COUNT({column}) * 100',
        threshold: 5,
        operator: 'less_than',
      },
    ],
  },
  validity: {
    [QualityCategory.VALIDITY]: [
      {
        name: 'Email Format',
        description: 'Validate email address format',
        expression: "REGEXP_LIKE({column}, '^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')",
        threshold: 100,
        operator: 'equals',
      },
      {
        name: 'Date Range',
        description: 'Ensure dates are within valid range',
        expression: '{column} BETWEEN {start_date} AND {end_date}',
        threshold: 100,
        operator: 'equals',
      },
    ],
  },
} as const;

// 🚨 ALERT CONFIGURATIONS
export const ALERT_CONFIG = {
  [AlertType.THRESHOLD_BREACH]: {
    icon: '⚠️',
    label: 'Threshold Breach',
    color: '#F59E0B',
    priority: 'high',
    autoResolve: false,
  },
  [AlertType.ANOMALY_DETECTED]: {
    icon: '🔍',
    label: 'Anomaly Detected',
    color: '#EF4444',
    priority: 'medium',
    autoResolve: false,
  },
  [AlertType.DATA_FRESHNESS]: {
    icon: '⏰',
    label: 'Data Freshness',
    color: '#3B82F6',
    priority: 'medium',
    autoResolve: true,
  },
  [AlertType.COMPLIANCE_VIOLATION]: {
    icon: '🚫',
    label: 'Compliance Violation',
    color: '#DC2626',
    priority: 'critical',
    autoResolve: false,
  },
} as const;

// 📱 RESPONSIVE BREAKPOINTS
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// 🎭 ANIMATION PRESETS
export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
  },
} as const;

// 🔄 REFRESH INTERVALS
export const REFRESH_INTERVALS = {
  realTime: 1000,       // 1 second
  frequent: 5000,       // 5 seconds
  normal: 30000,        // 30 seconds
  slow: 60000,          // 1 minute
  background: 300000,   // 5 minutes
} as const;

// 📊 DEFAULT PAGINATION
export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 25,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: true,
  pageSizeOptions: ['10', '25', '50', '100'],
} as const;

// 🎯 FEATURE FLAGS
export const FEATURE_FLAGS = {
  enableAIRecommendations: true,
  enableRealTimeUpdates: true,
  enableAdvancedAnalytics: true,
  enableCollaboration: true,
  enableMachineLearning: true,
  enableDataLineage: true,
  enableQualityMonitoring: true,
  enableSemanticSearch: true,
  enableAutoClassification: true,
  enableDataProfiling: true,
} as const;