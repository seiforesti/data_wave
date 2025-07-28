/**
 * Advanced Catalog Constants
 * ==========================
 * 
 * Comprehensive constants and configuration values for the Advanced Catalog system.
 * Maps to backend configuration and provides frontend-specific constants.
 * 
 * Backend Integration:
 * - Maps to enterprise_catalog_service.py configuration constants
 * - Provides UI-specific constants for components
 * - Maintains consistency with backend business rules
 */

import {
  AssetType,
  AssetStatus,
  DataQuality,
  LineageType,
  UsageFrequency,
  AssetCriticality,
  DataSensitivity,
  QualityDimension,
  ProfilingStatus,
  GlossaryTermStatus
} from '../types/catalog-core.types';

import {
  SearchType,
  SearchScope,
  SortBy,
  SortDirection
} from '../types/search.types';

// ========================= API CONFIGURATION =========================

export const API_CONFIG = {
  BASE_URL: '/api/v1/catalog',
  ENDPOINTS: {
    ASSETS: '/assets',
    SEARCH: '/search',
    LINEAGE: '/lineage',
    QUALITY: '/quality',
    PROFILING: '/profiling',
    GLOSSARY: '/glossary',
    ANALYTICS: '/analytics',
    EVENTS: '/events',
    DISCOVERY: '/discovery',
    HEALTH: '/health',
    METRICS: '/metrics',
    CONFIGURATION: '/configuration'
  },
  DEFAULT_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

// ========================= PAGINATION CONSTANTS =========================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  INFINITE_SCROLL_THRESHOLD: 0.8
} as const;

// ========================= CACHE CONFIGURATION =========================

export const CACHE_CONFIG = {
  DEFAULT_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  DEFAULT_CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  ASSET_CACHE_TIME: 15 * 60 * 1000, // 15 minutes
  SEARCH_CACHE_TIME: 2 * 60 * 1000, // 2 minutes
  ANALYTICS_CACHE_TIME: 30 * 60 * 1000, // 30 minutes
  EVENTS_CACHE_TIME: 30 * 1000, // 30 seconds
  MAX_CACHE_SIZE: 100
} as const;

// ========================= ASSET TYPE CONFIGURATIONS =========================

export const ASSET_TYPE_CONFIG: Record<AssetType, {
  icon: string;
  color: string;
  label: string;
  description: string;
  defaultColumns?: string[];
  supportedOperations: string[];
}> = {
  [AssetType.TABLE]: {
    icon: '🗃️',
    color: '#3B82F6',
    label: 'Table',
    description: 'Database table with structured data',
    defaultColumns: ['id', 'name', 'created_date', 'modified_date'],
    supportedOperations: ['query', 'profile', 'lineage', 'quality_check']
  },
  [AssetType.VIEW]: {
    icon: '👁️',
    color: '#8B5CF6',
    label: 'View',
    description: 'Database view or virtual table',
    supportedOperations: ['query', 'lineage', 'quality_check']
  },
  [AssetType.STORED_PROCEDURE]: {
    icon: '⚙️',
    color: '#F59E0B',
    label: 'Stored Procedure',
    description: 'Database stored procedure or function',
    supportedOperations: ['execute', 'lineage']
  },
  [AssetType.FUNCTION]: {
    icon: '🔧',
    color: '#10B981',
    label: 'Function',
    description: 'Database function or user-defined function',
    supportedOperations: ['execute', 'lineage']
  },
  [AssetType.DATASET]: {
    icon: '📊',
    color: '#EF4444',
    label: 'Dataset',
    description: 'Structured dataset or data collection',
    supportedOperations: ['profile', 'quality_check', 'export']
  },
  [AssetType.FILE]: {
    icon: '📄',
    color: '#6B7280',
    label: 'File',
    description: 'File-based data asset',
    supportedOperations: ['download', 'profile', 'preview']
  },
  [AssetType.STREAM]: {
    icon: '🌊',
    color: '#06B6D4',
    label: 'Stream',
    description: 'Real-time data stream',
    supportedOperations: ['monitor', 'subscribe']
  },
  [AssetType.API]: {
    icon: '🔌',
    color: '#84CC16',
    label: 'API',
    description: 'API endpoint or web service',
    supportedOperations: ['test', 'monitor', 'document']
  },
  [AssetType.REPORT]: {
    icon: '📈',
    color: '#F97316',
    label: 'Report',
    description: 'Business report or dashboard',
    supportedOperations: ['view', 'export', 'schedule']
  },
  [AssetType.DASHBOARD]: {
    icon: '📋',
    color: '#EC4899',
    label: 'Dashboard',
    description: 'Interactive dashboard or visualization',
    supportedOperations: ['view', 'embed', 'export']
  },
  [AssetType.MODEL]: {
    icon: '🤖',
    color: '#8B5CF6',
    label: 'Model',
    description: 'Machine learning model or algorithm',
    supportedOperations: ['predict', 'train', 'evaluate']
  },
  [AssetType.PIPELINE]: {
    icon: '🔄',
    color: '#059669',
    label: 'Pipeline',
    description: 'Data processing pipeline or workflow',
    supportedOperations: ['execute', 'monitor', 'schedule']
  },
  [AssetType.SCHEMA]: {
    icon: '🏗️',
    color: '#7C3AED',
    label: 'Schema',
    description: 'Database schema or data structure',
    supportedOperations: ['browse', 'document']
  },
  [AssetType.DATABASE]: {
    icon: '🗄️',
    color: '#1F2937',
    label: 'Database',
    description: 'Database instance or data store',
    supportedOperations: ['connect', 'browse', 'monitor']
  }
} as const;

// ========================= STATUS CONFIGURATIONS =========================

export const ASSET_STATUS_CONFIG: Record<AssetStatus, {
  color: string;
  label: string;
  description: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  allowedTransitions: AssetStatus[];
}> = {
  [AssetStatus.ACTIVE]: {
    color: '#10B981',
    label: 'Active',
    description: 'Asset is active and available for use',
    variant: 'default',
    allowedTransitions: [AssetStatus.DEPRECATED, AssetStatus.UNDER_REVIEW, AssetStatus.QUARANTINED]
  },
  [AssetStatus.DEPRECATED]: {
    color: '#F59E0B',
    label: 'Deprecated',
    description: 'Asset is deprecated but still available',
    variant: 'secondary',
    allowedTransitions: [AssetStatus.ACTIVE, AssetStatus.ARCHIVED]
  },
  [AssetStatus.ARCHIVED]: {
    color: '#6B7280',
    label: 'Archived',
    description: 'Asset is archived and read-only',
    variant: 'outline',
    allowedTransitions: [AssetStatus.ACTIVE]
  },
  [AssetStatus.DRAFT]: {
    color: '#3B82F6',
    label: 'Draft',
    description: 'Asset is in draft state',
    variant: 'outline',
    allowedTransitions: [AssetStatus.UNDER_REVIEW, AssetStatus.ACTIVE]
  },
  [AssetStatus.UNDER_REVIEW]: {
    color: '#8B5CF6',
    label: 'Under Review',
    description: 'Asset is under review',
    variant: 'secondary',
    allowedTransitions: [AssetStatus.ACTIVE, AssetStatus.DRAFT]
  },
  [AssetStatus.QUARANTINED]: {
    color: '#EF4444',
    label: 'Quarantined',
    description: 'Asset is quarantined due to issues',
    variant: 'destructive',
    allowedTransitions: [AssetStatus.ACTIVE, AssetStatus.DELETED]
  },
  [AssetStatus.MIGRATING]: {
    color: '#06B6D4',
    label: 'Migrating',
    description: 'Asset is being migrated',
    variant: 'secondary',
    allowedTransitions: [AssetStatus.ACTIVE]
  },
  [AssetStatus.DELETED]: {
    color: '#DC2626',
    label: 'Deleted',
    description: 'Asset is marked for deletion',
    variant: 'destructive',
    allowedTransitions: []
  }
} as const;

// ========================= QUALITY CONFIGURATIONS =========================

export const QUALITY_CONFIG = {
  THRESHOLDS: {
    EXCELLENT: { min: 95, max: 100 },
    GOOD: { min: 85, max: 94 },
    FAIR: { min: 70, max: 84 },
    POOR: { min: 50, max: 69 },
    CRITICAL: { min: 0, max: 49 }
  },
  DEFAULT_DIMENSIONS: [
    QualityDimension.COMPLETENESS,
    QualityDimension.ACCURACY,
    QualityDimension.CONSISTENCY,
    QualityDimension.VALIDITY,
    QualityDimension.UNIQUENESS
  ],
  DIMENSION_WEIGHTS: {
    [QualityDimension.COMPLETENESS]: 0.25,
    [QualityDimension.ACCURACY]: 0.25,
    [QualityDimension.CONSISTENCY]: 0.15,
    [QualityDimension.VALIDITY]: 0.15,
    [QualityDimension.UNIQUENESS]: 0.10,
    [QualityDimension.TIMELINESS]: 0.05,
    [QualityDimension.INTEGRITY]: 0.05
  }
} as const;

// ========================= SEARCH CONFIGURATIONS =========================

export const SEARCH_CONFIG = {
  DEFAULT_SEARCH_TYPE: SearchType.KEYWORD,
  DEFAULT_SCOPE: SearchScope.ALL,
  DEFAULT_SORT: {
    field: SortBy.RELEVANCE,
    direction: SortDirection.DESC
  },
  MAX_QUERY_LENGTH: 500,
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  SUGGESTION_LIMIT: 10,
  FACET_LIMIT: 20,
  HIGHLIGHT_TAGS: {
    pre: '<mark>',
    post: '</mark>'
  },
  SEMANTIC_SIMILARITY_THRESHOLD: 0.7,
  SEARCH_HISTORY_LIMIT: 50
} as const;

// ========================= LINEAGE CONFIGURATIONS =========================

export const LINEAGE_CONFIG = {
  DEFAULT_DEPTH: 3,
  MAX_DEPTH: 10,
  DEFAULT_DIRECTION: 'both' as const,
  GRAPH_LAYOUT: {
    DEFAULT: 'hierarchical' as const,
    OPTIONS: ['hierarchical', 'force_directed', 'circular'] as const
  },
  VISUALIZATION: {
    NODE_SIZE: { min: 20, max: 80 },
    EDGE_WIDTH: { min: 1, max: 5 },
    COLORS: {
      PRIMARY: '#3B82F6',
      SECONDARY: '#8B5CF6',
      SUCCESS: '#10B981',
      WARNING: '#F59E0B',
      DANGER: '#EF4444'
    }
  }
} as const;

// ========================= PROFILING CONFIGURATIONS =========================

export const PROFILING_CONFIG = {
  DEFAULT_SAMPLE_SIZE: 10000,
  MAX_SAMPLE_SIZE: 1000000,
  MIN_SAMPLE_SIZE: 100,
  SAMPLE_STRATEGIES: ['random', 'systematic', 'stratified'] as const,
  PROFILING_DEPTHS: ['basic', 'standard', 'comprehensive'] as const,
  DEFAULT_DEPTH: 'standard' as const,
  STATISTICAL_THRESHOLDS: {
    OUTLIER_THRESHOLD: 2.5,
    CORRELATION_THRESHOLD: 0.7,
    UNIQUENESS_THRESHOLD: 0.95
  }
} as const;

// ========================= DISCOVERY CONFIGURATIONS =========================

export const DISCOVERY_CONFIG = {
  DEFAULT_METHODS: ['automated_scan', 'pattern_matching'] as const,
  AI_CONFIDENCE_THRESHOLD: 0.8,
  BATCH_SIZE: 100,
  MAX_CONCURRENT_JOBS: 5,
  JOB_TIMEOUT: 3600000, // 1 hour
  RETRY_ATTEMPTS: 3,
  POLLING_INTERVAL: 5000 // 5 seconds
} as const;

// ========================= ANALYTICS CONFIGURATIONS =========================

export const ANALYTICS_CONFIG = {
  DEFAULT_TIME_PERIODS: ['1d', '7d', '30d', '90d', '1y'] as const,
  DEFAULT_TIME_PERIOD: '30d' as const,
  CHART_COLORS: [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ],
  METRICS_REFRESH_INTERVAL: 300000, // 5 minutes
  TREND_CALCULATION_WINDOW: 30 // days
} as const;

// ========================= UI CONSTANTS =========================

export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 200,
  TABLE_ROW_HEIGHT: 48,
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  MAX_TAG_DISPLAY: 3,
  MAX_DESCRIPTION_LENGTH: 200,
  SKELETON_ANIMATION_DURATION: 1500
} as const;

// ========================= VALIDATION RULES =========================

export const VALIDATION_RULES = {
  ASSET_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255,
    PATTERN: /^[a-zA-Z0-9_\-\s\.]+$/,
    INVALID_CHARS: /[<>:"/\\|?*]/
  },
  DESCRIPTION: {
    MAX_LENGTH: 2000
  },
  TAG: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    MAX_COUNT: 20,
    PATTERN: /^[a-zA-Z0-9_\-]+$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
} as const;

// ========================= NOTIFICATION SETTINGS =========================

export const NOTIFICATION_CONFIG = {
  DEFAULT_POSITION: 'top-right' as const,
  AUTO_DISMISS_DELAY: 5000,
  MAX_NOTIFICATIONS: 5,
  TYPES: {
    SUCCESS: { icon: '✅', color: '#10B981' },
    ERROR: { icon: '❌', color: '#EF4444' },
    WARNING: { icon: '⚠️', color: '#F59E0B' },
    INFO: { icon: 'ℹ️', color: '#3B82F6' }
  }
} as const;

// ========================= PERMISSIONS =========================

export const PERMISSIONS = {
  ASSETS: {
    CREATE: 'assets:create',
    READ: 'assets:read',
    UPDATE: 'assets:update',
    DELETE: 'assets:delete',
    BULK_OPERATIONS: 'assets:bulk'
  },
  QUALITY: {
    ASSESS: 'quality:assess',
    MANAGE_RULES: 'quality:manage_rules',
    VIEW_REPORTS: 'quality:view_reports'
  },
  LINEAGE: {
    VIEW: 'lineage:view',
    CREATE: 'lineage:create',
    VALIDATE: 'lineage:validate'
  },
  GLOSSARY: {
    CREATE_TERMS: 'glossary:create_terms',
    MANAGE_TERMS: 'glossary:manage_terms',
    ASSOCIATE: 'glossary:associate'
  },
  DISCOVERY: {
    TRIGGER: 'discovery:trigger',
    CONFIGURE: 'discovery:configure'
  },
  ANALYTICS: {
    VIEW: 'analytics:view',
    EXPORT: 'analytics:export'
  }
} as const;

// ========================= ERROR CODES =========================

export const ERROR_CODES = {
  ASSET_NOT_FOUND: 'ASSET_NOT_FOUND',
  INVALID_ASSET_TYPE: 'INVALID_ASSET_TYPE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DISCOVERY_FAILED: 'DISCOVERY_FAILED',
  QUALITY_CHECK_FAILED: 'QUALITY_CHECK_FAILED',
  LINEAGE_CREATION_FAILED: 'LINEAGE_CREATION_FAILED',
  SEARCH_ERROR: 'SEARCH_ERROR',
  PROFILING_ERROR: 'PROFILING_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR',
  IMPORT_ERROR: 'IMPORT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
} as const;

// ========================= FEATURE FLAGS =========================

export const FEATURE_FLAGS = {
  AI_RECOMMENDATIONS: true,
  SEMANTIC_SEARCH: true,
  REAL_TIME_UPDATES: true,
  BULK_OPERATIONS: true,
  ADVANCED_ANALYTICS: true,
  COLLABORATION_FEATURES: true,
  EXPORT_IMPORT: true,
  GOVERNANCE_POLICIES: true,
  AUTOMATED_DISCOVERY: true,
  QUALITY_MONITORING: true
} as const;

// ========================= EXPORT =========================

export {
  API_CONFIG,
  PAGINATION,
  CACHE_CONFIG,
  ASSET_TYPE_CONFIG,
  ASSET_STATUS_CONFIG,
  QUALITY_CONFIG,
  SEARCH_CONFIG,
  LINEAGE_CONFIG,
  PROFILING_CONFIG,
  DISCOVERY_CONFIG,
  ANALYTICS_CONFIG,
  UI_CONFIG,
  VALIDATION_RULES,
  NOTIFICATION_CONFIG,
  PERMISSIONS,
  ERROR_CODES,
  FEATURE_FLAGS
};