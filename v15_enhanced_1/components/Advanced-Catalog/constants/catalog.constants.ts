/**
 * Catalog Constants
 * Maps to: All backend service configurations, enums, and constants
 * 
 * Comprehensive constants for the Advanced Catalog system including
 * API endpoints, configuration values, UI constants, and mappings.
 */

import type {
  AssetType,
  AssetStatus,
  AssetCriticality,
  DataSensitivity,
  UsageFrequency,
  DataQuality,
  LineageDirection,
  LineageType,
  DiscoveryMethod,
} from '../types/catalog-core.types';

import type {
  QualityDimension,
  QualityRuleType,
} from '../types/quality.types';

import type {
  SearchType,
  QueryIntent,
  EntityType,
} from '../types/search.types';

// ===================== API ENDPOINTS =====================

export const API_ENDPOINTS = {
  // Core Catalog
  CATALOG: '/api/v1/catalog',
  ASSETS: '/api/v1/catalog/assets',
  DISCOVERY: '/api/v1/catalog/discovery',
  LINEAGE: '/api/v1/catalog/lineage',
  BUSINESS_GLOSSARY: '/api/v1/catalog/business-glossary',
  
  // Quality Management
  QUALITY: '/api/v1/catalog/quality',
  QUALITY_RULES: '/api/v1/catalog/quality/rules',
  QUALITY_ASSESSMENTS: '/api/v1/catalog/quality/assessments',
  QUALITY_MONITORS: '/api/v1/catalog/quality/monitors',
  QUALITY_ALERTS: '/api/v1/catalog/quality/alerts',
  
  // Intelligence & Analytics
  INTELLIGENCE: '/api/v1/catalog/intelligence',
  SEMANTIC_SEARCH: '/api/v1/catalog/search/semantic',
  RECOMMENDATIONS: '/api/v1/catalog/recommendations',
  ANALYTICS: '/api/v1/catalog/analytics',
  
  // Monitoring & Alerts
  MONITORING: '/api/v1/catalog/monitoring',
  ALERTS: '/api/v1/catalog/alerts',
  HEALTH: '/api/v1/catalog/health',
  
  // Real-time Updates
  WEBSOCKET: '/ws/v1/catalog',
  EVENTS: '/ws/v1/catalog/events',
} as const;

// ===================== ASSET TYPE CONFIGURATIONS =====================

export const ASSET_TYPE_CONFIG: Record<AssetType, {
  label: string;
  icon: string;
  color: string;
  description: string;
  category: string;
  discovery_priority: number;
  default_criticality: AssetCriticality;
  supported_operations: string[];
}> = {
  [AssetType.DATABASE]: {
    label: 'Database',
    icon: 'database',
    color: 'blue',
    description: 'Database instance or cluster',
    category: 'Infrastructure',
    discovery_priority: 9,
    default_criticality: AssetCriticality.HIGH,
    supported_operations: ['discovery', 'profiling', 'lineage', 'quality', 'monitoring'],
  },
  [AssetType.SCHEMA]: {
    label: 'Schema',
    icon: 'folder-tree',
    color: 'indigo',
    description: 'Database schema or namespace',
    category: 'Structure',
    discovery_priority: 8,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['discovery', 'profiling', 'lineage', 'quality'],
  },
  [AssetType.TABLE]: {
    label: 'Table',
    icon: 'table',
    color: 'green',
    description: 'Database table or collection',
    category: 'Data',
    discovery_priority: 10,
    default_criticality: AssetCriticality.HIGH,
    supported_operations: ['discovery', 'profiling', 'lineage', 'quality', 'monitoring', 'sampling'],
  },
  [AssetType.COLUMN]: {
    label: 'Column',
    icon: 'columns',
    color: 'emerald',
    description: 'Table column or field',
    category: 'Field',
    discovery_priority: 7,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['profiling', 'lineage', 'quality', 'classification'],
  },
  [AssetType.FILE]: {
    label: 'File',
    icon: 'file',
    color: 'orange',
    description: 'Data file or document',
    category: 'Storage',
    discovery_priority: 6,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['discovery', 'profiling', 'quality', 'indexing'],
  },
  [AssetType.API]: {
    label: 'API',
    icon: 'link',
    color: 'purple',
    description: 'REST API or web service',
    category: 'Service',
    discovery_priority: 8,
    default_criticality: AssetCriticality.HIGH,
    supported_operations: ['discovery', 'monitoring', 'lineage', 'testing'],
  },
  [AssetType.DASHBOARD]: {
    label: 'Dashboard',
    icon: 'layout-dashboard',
    color: 'pink',
    description: 'Business intelligence dashboard',
    category: 'Visualization',
    discovery_priority: 5,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['discovery', 'lineage', 'usage_tracking'],
  },
  [AssetType.REPORT]: {
    label: 'Report',
    icon: 'file-text',
    color: 'cyan',
    description: 'Business report or analysis',
    category: 'Analytics',
    discovery_priority: 4,
    default_criticality: AssetCriticality.LOW,
    supported_operations: ['discovery', 'lineage', 'usage_tracking'],
  },
  [AssetType.MODEL]: {
    label: 'Model',
    icon: 'brain',
    color: 'violet',
    description: 'Machine learning model',
    category: 'AI/ML',
    discovery_priority: 7,
    default_criticality: AssetCriticality.HIGH,
    supported_operations: ['discovery', 'monitoring', 'lineage', 'versioning'],
  },
  [AssetType.DATASET]: {
    label: 'Dataset',
    icon: 'database',
    color: 'teal',
    description: 'Curated dataset or data product',
    category: 'Data Product',
    discovery_priority: 9,
    default_criticality: AssetCriticality.HIGH,
    supported_operations: ['discovery', 'profiling', 'lineage', 'quality', 'versioning'],
  },
  [AssetType.STREAM]: {
    label: 'Stream',
    icon: 'waves',
    color: 'blue',
    description: 'Data stream or real-time feed',
    category: 'Streaming',
    discovery_priority: 8,
    default_criticality: AssetCriticality.HIGH,
    supported_operations: ['discovery', 'monitoring', 'lineage', 'quality'],
  },
  [AssetType.TOPIC]: {
    label: 'Topic',
    icon: 'message-circle',
    color: 'red',
    description: 'Message queue topic',
    category: 'Messaging',
    discovery_priority: 7,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['discovery', 'monitoring', 'lineage'],
  },
  [AssetType.QUEUE]: {
    label: 'Queue',
    icon: 'queue',
    color: 'amber',
    description: 'Message queue or buffer',
    category: 'Messaging',
    discovery_priority: 6,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['discovery', 'monitoring', 'lineage'],
  },
  [AssetType.APPLICATION]: {
    label: 'Application',
    icon: 'app-window',
    color: 'slate',
    description: 'Software application or system',
    category: 'Application',
    discovery_priority: 5,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['discovery', 'monitoring', 'lineage'],
  },
  [AssetType.SERVICE]: {
    label: 'Service',
    icon: 'server',
    color: 'zinc',
    description: 'Microservice or system service',
    category: 'Service',
    discovery_priority: 7,
    default_criticality: AssetCriticality.HIGH,
    supported_operations: ['discovery', 'monitoring', 'lineage', 'health_checks'],
  },
  [AssetType.FOLDER]: {
    label: 'Folder',
    icon: 'folder',
    color: 'yellow',
    description: 'Directory or folder structure',
    category: 'Organization',
    discovery_priority: 3,
    default_criticality: AssetCriticality.LOW,
    supported_operations: ['discovery', 'organization'],
  },
  [AssetType.VIEW]: {
    label: 'View',
    icon: 'eye',
    color: 'lime',
    description: 'Database view or virtual table',
    category: 'Derived',
    discovery_priority: 8,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['discovery', 'profiling', 'lineage', 'quality'],
  },
  [AssetType.STORED_PROCEDURE]: {
    label: 'Stored Procedure',
    icon: 'code',
    color: 'fuchsia',
    description: 'Database stored procedure',
    category: 'Logic',
    discovery_priority: 6,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['discovery', 'lineage', 'documentation'],
  },
  [AssetType.FUNCTION]: {
    label: 'Function',
    icon: 'function-square',
    color: 'rose',
    description: 'Database function or UDF',
    category: 'Logic',
    discovery_priority: 5,
    default_criticality: AssetCriticality.LOW,
    supported_operations: ['discovery', 'lineage', 'documentation'],
  },
  [AssetType.NOTEBOOK]: {
    label: 'Notebook',
    icon: 'book-open',
    color: 'sky',
    description: 'Jupyter notebook or analysis',
    category: 'Analytics',
    discovery_priority: 6,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['discovery', 'lineage', 'versioning'],
  },
  [AssetType.PIPELINE]: {
    label: 'Pipeline',
    icon: 'workflow',
    color: 'emerald',
    description: 'Data pipeline or ETL workflow',
    category: 'Processing',
    discovery_priority: 9,
    default_criticality: AssetCriticality.HIGH,
    supported_operations: ['discovery', 'monitoring', 'lineage', 'orchestration'],
  },
  [AssetType.JOB]: {
    label: 'Job',
    icon: 'play-circle',
    color: 'blue',
    description: 'Scheduled job or task',
    category: 'Automation',
    discovery_priority: 7,
    default_criticality: AssetCriticality.MEDIUM,
    supported_operations: ['discovery', 'monitoring', 'scheduling'],
  },
  [AssetType.OTHER]: {
    label: 'Other',
    icon: 'help-circle',
    color: 'gray',
    description: 'Other or unknown asset type',
    category: 'Miscellaneous',
    discovery_priority: 1,
    default_criticality: AssetCriticality.LOW,
    supported_operations: ['discovery'],
  },
} as const;

// ===================== QUALITY DIMENSION CONFIGURATIONS =====================

export const QUALITY_DIMENSION_CONFIG: Record<QualityDimension, {
  label: string;
  description: string;
  icon: string;
  color: string;
  weight: number;
  measurement_type: string;
  target_threshold: number;
  critical_threshold: number;
}> = {
  [QualityDimension.ACCURACY]: {
    label: 'Accuracy',
    description: 'Correctness and precision of data values',
    icon: 'target',
    color: 'green',
    weight: 0.2,
    measurement_type: 'percentage',
    target_threshold: 95,
    critical_threshold: 80,
  },
  [QualityDimension.COMPLETENESS]: {
    label: 'Completeness',
    description: 'Presence of required data values',
    icon: 'check-circle',
    color: 'blue',
    weight: 0.2,
    measurement_type: 'percentage',
    target_threshold: 98,
    critical_threshold: 85,
  },
  [QualityDimension.CONSISTENCY]: {
    label: 'Consistency',
    description: 'Uniformity of data formats and values',
    icon: 'align-center',
    color: 'purple',
    weight: 0.15,
    measurement_type: 'percentage',
    target_threshold: 90,
    critical_threshold: 75,
  },
  [QualityDimension.TIMELINESS]: {
    label: 'Timeliness',
    description: 'Freshness and currency of data',
    icon: 'clock',
    color: 'orange',
    weight: 0.15,
    measurement_type: 'hours',
    target_threshold: 24,
    critical_threshold: 72,
  },
  [QualityDimension.VALIDITY]: {
    label: 'Validity',
    description: 'Adherence to defined formats and rules',
    icon: 'shield-check',
    color: 'emerald',
    weight: 0.1,
    measurement_type: 'percentage',
    target_threshold: 95,
    critical_threshold: 80,
  },
  [QualityDimension.UNIQUENESS]: {
    label: 'Uniqueness',
    description: 'Absence of duplicate records',
    icon: 'fingerprint',
    color: 'cyan',
    weight: 0.1,
    measurement_type: 'percentage',
    target_threshold: 99,
    critical_threshold: 95,
  },
  [QualityDimension.INTEGRITY]: {
    label: 'Integrity',
    description: 'Referential and structural integrity',
    icon: 'link',
    color: 'indigo',
    weight: 0.05,
    measurement_type: 'percentage',
    target_threshold: 100,
    critical_threshold: 95,
  },
  [QualityDimension.CONFORMITY]: {
    label: 'Conformity',
    description: 'Adherence to standards and specifications',
    icon: 'check-square',
    color: 'teal',
    weight: 0.025,
    measurement_type: 'percentage',
    target_threshold: 95,
    critical_threshold: 85,
  },
  [QualityDimension.RELEVANCE]: {
    label: 'Relevance',
    description: 'Usefulness for business purposes',
    icon: 'star',
    color: 'yellow',
    weight: 0.025,
    measurement_type: 'score',
    target_threshold: 8,
    critical_threshold: 6,
  },
  [QualityDimension.RELIABILITY]: {
    label: 'Reliability',
    description: 'Dependability and trustworthiness',
    icon: 'shield',
    color: 'red',
    weight: 0.05,
    measurement_type: 'percentage',
    target_threshold: 99,
    critical_threshold: 95,
  },
} as const;

// ===================== SEARCH CONFIGURATIONS =====================

export const SEARCH_CONFIG = {
  DEFAULT_RESULTS_LIMIT: 20,
  MAX_RESULTS_LIMIT: 100,
  AUTOCOMPLETE_DEBOUNCE_MS: 300,
  SEARCH_DEBOUNCE_MS: 500,
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  SEMANTIC_SIMILARITY_THRESHOLD: 0.7,
  MAX_SEARCH_HISTORY: 10,
  
  SEARCH_TYPES: {
    [SearchType.KEYWORD]: {
      label: 'Keyword Search',
      description: 'Traditional keyword-based search',
      icon: 'search',
      boost_factor: 1.0,
    },
    [SearchType.SEMANTIC]: {
      label: 'Semantic Search',
      description: 'AI-powered semantic understanding',
      icon: 'brain',
      boost_factor: 1.2,
    },
    [SearchType.HYBRID]: {
      label: 'Hybrid Search',
      description: 'Combined keyword and semantic search',
      icon: 'zap',
      boost_factor: 1.5,
    },
    [SearchType.FUZZY]: {
      label: 'Fuzzy Search',
      description: 'Tolerant to typos and variations',
      icon: 'tilde',
      boost_factor: 0.9,
    },
    [SearchType.EXACT]: {
      label: 'Exact Match',
      description: 'Precise text matching',
      icon: 'quote',
      boost_factor: 2.0,
    },
    [SearchType.NATURAL_LANGUAGE]: {
      label: 'Natural Language',
      description: 'Conversational queries',
      icon: 'message-circle',
      boost_factor: 1.3,
    },
    [SearchType.ADVANCED]: {
      label: 'Advanced Search',
      description: 'Complex queries with operators',
      icon: 'settings',
      boost_factor: 1.1,
    },
  },
} as const;

// ===================== UI CONSTANTS =====================

export const UI_CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  
  // Data Display
  MAX_DESCRIPTION_LENGTH: 200,
  MAX_TAG_DISPLAY: 5,
  TRUNCATE_LENGTH: 50,
  
  // Refresh Intervals (milliseconds)
  REAL_TIME_REFRESH: 5000,
  FAST_REFRESH: 30000,
  NORMAL_REFRESH: 60000,
  SLOW_REFRESH: 300000,
  
  // Animation Durations
  QUICK_ANIMATION: 150,
  NORMAL_ANIMATION: 300,
  SLOW_ANIMATION: 500,
  
  // Colors and Themes
  STATUS_COLORS: {
    [AssetStatus.ACTIVE]: 'green',
    [AssetStatus.INACTIVE]: 'gray',
    [AssetStatus.DEPRECATED]: 'orange',
    [AssetStatus.ARCHIVED]: 'yellow',
    [AssetStatus.DRAFT]: 'blue',
    [AssetStatus.PENDING_APPROVAL]: 'purple',
    [AssetStatus.UNDER_REVIEW]: 'cyan',
    [AssetStatus.DELETED]: 'red',
  },
  
  CRITICALITY_COLORS: {
    [AssetCriticality.CRITICAL]: 'red',
    [AssetCriticality.HIGH]: 'orange',
    [AssetCriticality.MEDIUM]: 'yellow',
    [AssetCriticality.LOW]: 'green',
    [AssetCriticality.UNKNOWN]: 'gray',
  },
  
  SENSITIVITY_COLORS: {
    [DataSensitivity.PUBLIC]: 'green',
    [DataSensitivity.INTERNAL]: 'blue',
    [DataSensitivity.CONFIDENTIAL]: 'orange',
    [DataSensitivity.RESTRICTED]: 'red',
    [DataSensitivity.TOP_SECRET]: 'purple',
  },
  
  QUALITY_COLORS: {
    [DataQuality.EXCELLENT]: 'green',
    [DataQuality.GOOD]: 'lime',
    [DataQuality.FAIR]: 'yellow',
    [DataQuality.POOR]: 'orange',
    [DataQuality.CRITICAL]: 'red',
    [DataQuality.UNKNOWN]: 'gray',
  },
} as const;

// ===================== MONITORING THRESHOLDS =====================

export const MONITORING_THRESHOLDS = {
  PERFORMANCE: {
    RESPONSE_TIME_WARNING: 1000, // ms
    RESPONSE_TIME_CRITICAL: 5000, // ms
    THROUGHPUT_WARNING: 100, // requests/second
    THROUGHPUT_CRITICAL: 50, // requests/second
    ERROR_RATE_WARNING: 0.05, // 5%
    ERROR_RATE_CRITICAL: 0.1, // 10%
  },
  
  QUALITY: {
    SCORE_WARNING: 80,
    SCORE_CRITICAL: 60,
    COMPLETENESS_WARNING: 95,
    COMPLETENESS_CRITICAL: 85,
    ACCURACY_WARNING: 90,
    ACCURACY_CRITICAL: 75,
  },
  
  USAGE: {
    ZERO_USAGE_DAYS: 30,
    LOW_USAGE_THRESHOLD: 10, // queries per week
    HIGH_USAGE_THRESHOLD: 1000, // queries per week
  },
  
  DISCOVERY: {
    JOB_TIMEOUT_MINUTES: 60,
    MAX_RETRY_ATTEMPTS: 3,
    BATCH_SIZE: 1000,
  },
} as const;

// ===================== VALIDATION RULES =====================

export const VALIDATION_RULES = {
  ASSET_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 255,
    PATTERN: /^[a-zA-Z0-9_\-\s\.]+$/,
  },
  
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000,
  },
  
  TAGS: {
    MAX_COUNT: 20,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_\-]+$/,
  },
  
  QUALITY_THRESHOLD: {
    MIN: 0,
    MAX: 100,
  },
  
  SEARCH_QUERY: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
  },
} as const;

// ===================== FEATURE FLAGS =====================

export const FEATURE_FLAGS = {
  // Core Features
  ENABLE_AI_RECOMMENDATIONS: true,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_IMPACT_ANALYSIS: true,
  
  // Discovery Features
  ENABLE_AUTO_DISCOVERY: true,
  ENABLE_PATTERN_DETECTION: true,
  ENABLE_SCHEMA_INFERENCE: true,
  
  // Quality Features
  ENABLE_AUTO_QUALITY_RULES: true,
  ENABLE_ANOMALY_DETECTION: true,
  ENABLE_QUALITY_MONITORING: true,
  
  // Analytics Features
  ENABLE_USAGE_ANALYTICS: true,
  ENABLE_LINEAGE_VISUALIZATION: true,
  ENABLE_PERFORMANCE_METRICS: true,
  
  // Experimental Features
  ENABLE_ML_PREDICTIONS: false,
  ENABLE_NATURAL_LANGUAGE_QUERIES: true,
  ENABLE_COLLABORATIVE_FEATURES: true,
} as const;

// ===================== DEFAULT CONFIGURATIONS =====================

export const DEFAULT_CONFIG = {
  ASSET_DISCOVERY: {
    BATCH_SIZE: 1000,
    PARALLEL_WORKERS: 4,
    TIMEOUT_MINUTES: 30,
    RETRY_ATTEMPTS: 3,
    ENABLE_AI_ENHANCEMENT: true,
    PROFILING_SAMPLE_SIZE: 10000,
  },
  
  QUALITY_ASSESSMENT: {
    DEFAULT_RULES_ENABLED: true,
    ASSESSMENT_FREQUENCY: 'daily',
    CRITICAL_THRESHOLD: 70,
    WARNING_THRESHOLD: 85,
    AUTO_REMEDIATION: false,
  },
  
  SEARCH_INDEX: {
    REFRESH_INTERVAL: '30s',
    SHARD_COUNT: 5,
    REPLICA_COUNT: 1,
    MAX_RESULT_WINDOW: 10000,
  },
  
  CACHING: {
    ASSETS_TTL: 300, // 5 minutes
    SEARCH_TTL: 600, // 10 minutes
    LINEAGE_TTL: 900, // 15 minutes
    QUALITY_TTL: 1800, // 30 minutes
  },
} as const;

// ===================== ERROR MESSAGES =====================

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  
  ASSET: {
    NOT_FOUND: 'Asset not found or you do not have access.',
    CREATE_FAILED: 'Failed to create asset. Please check your inputs.',
    UPDATE_FAILED: 'Failed to update asset. Please try again.',
    DELETE_FAILED: 'Failed to delete asset. It may be referenced by other assets.',
  },
  
  SEARCH: {
    QUERY_TOO_SHORT: 'Search query must be at least 2 characters.',
    NO_RESULTS: 'No assets found matching your search criteria.',
    SEARCH_FAILED: 'Search failed. Please try again.',
  },
  
  QUALITY: {
    ASSESSMENT_FAILED: 'Quality assessment failed. Please check the asset.',
    RULE_CREATION_FAILED: 'Failed to create quality rule. Please check your configuration.',
    THRESHOLD_INVALID: 'Quality threshold must be between 0 and 100.',
  },
  
  DISCOVERY: {
    JOB_FAILED: 'Discovery job failed. Please check the data source configuration.',
    SOURCE_UNREACHABLE: 'Data source is unreachable. Please check connectivity.',
    PERMISSIONS_INSUFFICIENT: 'Insufficient permissions to discover assets.',
  },
} as const;

// ===================== SUCCESS MESSAGES =====================

export const SUCCESS_MESSAGES = {
  ASSET: {
    CREATED: 'Asset created successfully with AI enhancement.',
    UPDATED: 'Asset updated successfully.',
    DELETED: 'Asset deleted successfully.',
  },
  
  QUALITY: {
    ASSESSMENT_STARTED: 'Quality assessment started successfully.',
    RULE_CREATED: 'Quality rule created successfully.',
    MONITOR_ENABLED: 'Quality monitoring enabled.',
  },
  
  DISCOVERY: {
    JOB_STARTED: 'Discovery job started successfully.',
    JOB_COMPLETED: 'Discovery completed successfully.',
  },
  
  LINEAGE: {
    RELATIONSHIP_CREATED: 'Lineage relationship created successfully.',
    IMPACT_ANALYSIS_COMPLETED: 'Impact analysis completed.',
  },
} as const;

// Export all constants as a single object for easy importing
export const CATALOG_CONSTANTS = {
  API_ENDPOINTS,
  ASSET_TYPE_CONFIG,
  QUALITY_DIMENSION_CONFIG,
  SEARCH_CONFIG,
  UI_CONFIG,
  MONITORING_THRESHOLDS,
  VALIDATION_RULES,
  FEATURE_FLAGS,
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} as const;