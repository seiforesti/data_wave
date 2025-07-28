/**
 * Catalog Constants and Schemas - Complete Configuration
 * =====================================================
 * 
 * Comprehensive constants, schemas, and configuration values
 * for the Advanced Catalog system.
 */

import { 
  AssetType, 
  AssetStatus, 
  DataQuality, 
  AssetCriticality, 
  DataSensitivity, 
  UsageFrequency,
  LineageDirection,
  LineageType,
  DiscoveryMethod
} from '../types/catalog-core.types';

import { DiscoveryStatus, DiscoveryScope, ClassificationConfidence } from '../types/discovery.types';
import { QualityDimension, QualityRuleType, MonitoringLevel } from '../types/quality.types';

// ========================= ASSET TYPE CONFIGURATIONS =========================

export const ASSET_TYPE_CONFIG = {
  [AssetType.TABLE]: {
    label: 'Table',
    icon: 'table',
    color: '#3b82f6', // blue-500
    description: 'Database table with structured data',
    category: 'Database',
    supportedOperations: ['query', 'profile', 'lineage', 'quality'],
    defaultColumns: ['name', 'type', 'description', 'nullable'],
    profilingEnabled: true,
    lineageSupported: true
  },
  [AssetType.VIEW]: {
    label: 'View',
    icon: 'eye',
    color: '#06b6d4', // cyan-500
    description: 'Database view presenting transformed data',
    category: 'Database',
    supportedOperations: ['query', 'lineage'],
    defaultColumns: ['name', 'type', 'description'],
    profilingEnabled: false,
    lineageSupported: true
  },
  [AssetType.STORED_PROCEDURE]: {
    label: 'Stored Procedure',
    icon: 'code',
    color: '#8b5cf6', // violet-500
    description: 'Executable database procedure',
    category: 'Database',
    supportedOperations: ['lineage', 'usage'],
    defaultColumns: ['name', 'parameters', 'return_type'],
    profilingEnabled: false,
    lineageSupported: true
  },
  [AssetType.FUNCTION]: {
    label: 'Function',
    icon: 'function-square',
    color: '#a855f7', // purple-500
    description: 'Database or code function',
    category: 'Database',
    supportedOperations: ['lineage', 'usage'],
    defaultColumns: ['name', 'parameters', 'return_type'],
    profilingEnabled: false,
    lineageSupported: true
  },
  [AssetType.DATASET]: {
    label: 'Dataset',
    icon: 'database',
    color: '#10b981', // emerald-500
    description: 'Collection of related data',
    category: 'Data',
    supportedOperations: ['query', 'profile', 'lineage', 'quality'],
    defaultColumns: ['name', 'format', 'size', 'records'],
    profilingEnabled: true,
    lineageSupported: true
  },
  [AssetType.FILE]: {
    label: 'File',
    icon: 'file',
    color: '#f59e0b', // amber-500
    description: 'Data file in various formats',
    category: 'Files',
    supportedOperations: ['profile', 'lineage'],
    defaultColumns: ['name', 'format', 'size', 'modified'],
    profilingEnabled: true,
    lineageSupported: true
  },
  [AssetType.STREAM]: {
    label: 'Stream',
    icon: 'waves',
    color: '#ef4444', // red-500
    description: 'Real-time data stream',
    category: 'Streaming',
    supportedOperations: ['monitor', 'lineage'],
    defaultColumns: ['name', 'topic', 'throughput', 'lag'],
    profilingEnabled: false,
    lineageSupported: true
  },
  [AssetType.API]: {
    label: 'API',
    icon: 'api',
    color: '#6366f1', // indigo-500
    description: 'Application Programming Interface',
    category: 'Services',
    supportedOperations: ['monitor', 'lineage', 'usage'],
    defaultColumns: ['name', 'endpoint', 'method', 'status'],
    profilingEnabled: false,
    lineageSupported: true
  },
  [AssetType.REPORT]: {
    label: 'Report',
    icon: 'file-text',
    color: '#84cc16', // lime-500
    description: 'Business report or dashboard',
    category: 'Reports',
    supportedOperations: ['usage', 'lineage'],
    defaultColumns: ['name', 'type', 'schedule', 'recipients'],
    profilingEnabled: false,
    lineageSupported: true
  },
  [AssetType.DASHBOARD]: {
    label: 'Dashboard',
    icon: 'layout-dashboard',
    color: '#22c55e', // green-500
    description: 'Interactive data visualization dashboard',
    category: 'Reports',
    supportedOperations: ['usage', 'lineage'],
    defaultColumns: ['name', 'widgets', 'viewers', 'updated'],
    profilingEnabled: false,
    lineageSupported: true
  },
  [AssetType.MODEL]: {
    label: 'Model',
    icon: 'brain',
    color: '#ec4899', // pink-500
    description: 'Machine learning or analytical model',
    category: 'ML/AI',
    supportedOperations: ['lineage', 'quality', 'usage'],
    defaultColumns: ['name', 'algorithm', 'accuracy', 'version'],
    profilingEnabled: false,
    lineageSupported: true
  },
  [AssetType.PIPELINE]: {
    label: 'Pipeline',
    icon: 'git-branch',
    color: '#f97316', // orange-500
    description: 'Data processing pipeline',
    category: 'Processing',
    supportedOperations: ['monitor', 'lineage', 'usage'],
    defaultColumns: ['name', 'status', 'schedule', 'duration'],
    profilingEnabled: false,
    lineageSupported: true
  },
  [AssetType.SCHEMA]: {
    label: 'Schema',
    icon: 'layers',
    color: '#64748b', // slate-500
    description: 'Database schema or namespace',
    category: 'Database',
    supportedOperations: ['browse', 'lineage'],
    defaultColumns: ['name', 'tables', 'views', 'owner'],
    profilingEnabled: false,
    lineageSupported: false
  },
  [AssetType.DATABASE]: {
    label: 'Database',
    icon: 'server',
    color: '#475569', // slate-600
    description: 'Database instance or cluster',
    category: 'Database',
    supportedOperations: ['browse', 'monitor'],
    defaultColumns: ['name', 'type', 'version', 'size'],
    profilingEnabled: false,
    lineageSupported: false
  }
} as const;

// ========================= ASSET STATUS CONFIGURATIONS =========================

export const ASSET_STATUS_CONFIG = {
  [AssetStatus.ACTIVE]: {
    label: 'Active',
    color: '#10b981', // emerald-500
    bgColor: '#d1fae5', // emerald-100
    description: 'Asset is active and available for use',
    icon: 'check-circle',
    allowedTransitions: [AssetStatus.DEPRECATED, AssetStatus.ARCHIVED, AssetStatus.QUARANTINED]
  },
  [AssetStatus.DEPRECATED]: {
    label: 'Deprecated',
    color: '#f59e0b', // amber-500
    bgColor: '#fef3c7', // amber-100
    description: 'Asset is deprecated but still accessible',
    icon: 'alert-triangle',
    allowedTransitions: [AssetStatus.ACTIVE, AssetStatus.ARCHIVED]
  },
  [AssetStatus.ARCHIVED]: {
    label: 'Archived',
    color: '#6b7280', // gray-500
    bgColor: '#f3f4f6', // gray-100
    description: 'Asset is archived and not actively used',
    icon: 'archive',
    allowedTransitions: [AssetStatus.ACTIVE]
  },
  [AssetStatus.DRAFT]: {
    label: 'Draft',
    color: '#8b5cf6', // violet-500
    bgColor: '#ede9fe', // violet-100
    description: 'Asset is in draft state',
    icon: 'edit',
    allowedTransitions: [AssetStatus.ACTIVE, AssetStatus.UNDER_REVIEW]
  },
  [AssetStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    color: '#3b82f6', // blue-500
    bgColor: '#dbeafe', // blue-100
    description: 'Asset is under review for approval',
    icon: 'clock',
    allowedTransitions: [AssetStatus.ACTIVE, AssetStatus.DRAFT]
  },
  [AssetStatus.QUARANTINED]: {
    label: 'Quarantined',
    color: '#ef4444', // red-500
    bgColor: '#fee2e2', // red-100
    description: 'Asset is quarantined due to quality issues',
    icon: 'shield-alert',
    allowedTransitions: [AssetStatus.ACTIVE, AssetStatus.ARCHIVED]
  },
  [AssetStatus.MIGRATING]: {
    label: 'Migrating',
    color: '#06b6d4', // cyan-500
    bgColor: '#cffafe', // cyan-100
    description: 'Asset is being migrated',
    icon: 'refresh-cw',
    allowedTransitions: [AssetStatus.ACTIVE, AssetStatus.ARCHIVED]
  },
  [AssetStatus.DELETED]: {
    label: 'Deleted',
    color: '#dc2626', // red-600
    bgColor: '#fee2e2', // red-100
    description: 'Asset has been deleted',
    icon: 'trash',
    allowedTransitions: []
  }
} as const;

// ========================= DATA QUALITY CONFIGURATIONS =========================

export const DATA_QUALITY_CONFIG = {
  [DataQuality.EXCELLENT]: {
    label: 'Excellent',
    color: '#059669', // emerald-600
    bgColor: '#d1fae5', // emerald-100
    range: { min: 95, max: 100 },
    icon: 'award',
    description: '95-100% quality score'
  },
  [DataQuality.GOOD]: {
    label: 'Good',
    color: '#65a30d', // lime-600
    bgColor: '#ecfccb', // lime-100
    range: { min: 85, max: 94 },
    icon: 'thumbs-up',
    description: '85-94% quality score'
  },
  [DataQuality.FAIR]: {
    label: 'Fair',
    color: '#d97706', // amber-600
    bgColor: '#fef3c7', // amber-100
    range: { min: 70, max: 84 },
    icon: 'minus-circle',
    description: '70-84% quality score'
  },
  [DataQuality.POOR]: {
    label: 'Poor',
    color: '#dc2626', // red-600
    bgColor: '#fee2e2', // red-100
    range: { min: 50, max: 69 },
    icon: 'thumbs-down',
    description: '50-69% quality score'
  },
  [DataQuality.CRITICAL]: {
    label: 'Critical',
    color: '#991b1b', // red-800
    bgColor: '#fecaca', // red-200
    range: { min: 0, max: 49 },
    icon: 'alert-circle',
    description: 'Below 50% quality score'
  },
  [DataQuality.UNKNOWN]: {
    label: 'Unknown',
    color: '#6b7280', // gray-500
    bgColor: '#f3f4f6', // gray-100
    range: { min: 0, max: 0 },
    icon: 'help-circle',
    description: 'Quality not assessed'
  }
} as const;

// ========================= CRITICALITY CONFIGURATIONS =========================

export const CRITICALITY_CONFIG = {
  [AssetCriticality.CRITICAL]: {
    label: 'Critical',
    color: '#dc2626', // red-600
    bgColor: '#fee2e2', // red-100
    priority: 1,
    slaHours: 4,
    description: 'Mission-critical asset requiring immediate attention'
  },
  [AssetCriticality.HIGH]: {
    label: 'High',
    color: '#ea580c', // orange-600
    bgColor: '#fed7aa', // orange-100
    priority: 2,
    slaHours: 12,
    description: 'High-importance asset affecting business operations'
  },
  [AssetCriticality.MEDIUM]: {
    label: 'Medium',
    color: '#ca8a04', // yellow-600
    bgColor: '#fef3c7', // yellow-100
    priority: 3,
    slaHours: 24,
    description: 'Medium-importance asset with moderate business impact'
  },
  [AssetCriticality.LOW]: {
    label: 'Low',
    color: '#16a34a', // green-600
    bgColor: '#dcfce7', // green-100
    priority: 4,
    slaHours: 72,
    description: 'Low-importance asset with minimal business impact'
  },
  [AssetCriticality.UNKNOWN]: {
    label: 'Unknown',
    color: '#6b7280', // gray-500
    bgColor: '#f3f4f6', // gray-100
    priority: 5,
    slaHours: 168,
    description: 'Criticality not assessed'
  }
} as const;

// ========================= DISCOVERY CONFIGURATIONS =========================

export const DISCOVERY_METHOD_CONFIG = {
  [DiscoveryMethod.AUTOMATED_SCAN]: {
    label: 'Automated Scan',
    icon: 'scan',
    color: '#3b82f6',
    description: 'Systematic automated discovery scan',
    confidence: 'high',
    accuracy: 90
  },
  [DiscoveryMethod.AI_DETECTION]: {
    label: 'AI Detection',
    icon: 'brain',
    color: '#8b5cf6',
    description: 'AI-powered pattern detection',
    confidence: 'medium',
    accuracy: 85
  },
  [DiscoveryMethod.PATTERN_MATCHING]: {
    label: 'Pattern Matching',
    icon: 'search',
    color: '#06b6d4',
    description: 'Rule-based pattern matching',
    confidence: 'high',
    accuracy: 88
  },
  [DiscoveryMethod.METADATA_IMPORT]: {
    label: 'Metadata Import',
    icon: 'download',
    color: '#10b981',
    description: 'Imported from external metadata sources',
    confidence: 'high',
    accuracy: 95
  },
  [DiscoveryMethod.MANUAL_ENTRY]: {
    label: 'Manual Entry',
    icon: 'user',
    color: '#f59e0b',
    description: 'Manually entered by users',
    confidence: 'high',
    accuracy: 98
  },
  [DiscoveryMethod.API_INTEGRATION]: {
    label: 'API Integration',
    icon: 'link',
    color: '#ef4444',
    description: 'Discovered via API integration',
    confidence: 'high',
    accuracy: 92
  },
  [DiscoveryMethod.LINEAGE_INFERENCE]: {
    label: 'Lineage Inference',
    icon: 'git-branch',
    color: '#ec4899',
    description: 'Inferred from data lineage analysis',
    confidence: 'medium',
    accuracy: 75
  }
} as const;

// ========================= QUALITY DIMENSION CONFIGURATIONS =========================

export const QUALITY_DIMENSION_CONFIG = {
  [QualityDimension.COMPLETENESS]: {
    label: 'Completeness',
    icon: 'check-square',
    color: '#10b981',
    description: 'Percentage of non-null values',
    formula: '(non_null_values / total_values) * 100',
    weight: 20
  },
  [QualityDimension.ACCURACY]: {
    label: 'Accuracy',
    icon: 'target',
    color: '#3b82f6',
    description: 'Correctness of data values',
    formula: '(correct_values / total_values) * 100',
    weight: 25
  },
  [QualityDimension.CONSISTENCY]: {
    label: 'Consistency',
    icon: 'repeat',
    color: '#8b5cf6',
    description: 'Uniformity across data sources',
    formula: '(consistent_values / total_values) * 100',
    weight: 15
  },
  [QualityDimension.VALIDITY]: {
    label: 'Validity',
    icon: 'shield-check',
    color: '#06b6d4',
    description: 'Adherence to defined formats and rules',
    formula: '(valid_values / total_values) * 100',
    weight: 20
  },
  [QualityDimension.UNIQUENESS]: {
    label: 'Uniqueness',
    icon: 'hash',
    color: '#f59e0b',
    description: 'Absence of duplicate records',
    formula: '(unique_values / total_values) * 100',
    weight: 10
  },
  [QualityDimension.TIMELINESS]: {
    label: 'Timeliness',
    icon: 'clock',
    color: '#ef4444',
    description: 'Currency and age of data',
    formula: 'based_on_age_thresholds',
    weight: 10
  }
} as const;

// ========================= LINEAGE CONFIGURATIONS =========================

export const LINEAGE_TYPE_CONFIG = {
  [LineageType.TABLE_TO_TABLE]: {
    label: 'Table → Table',
    icon: 'arrow-right',
    color: '#3b82f6',
    description: 'Direct table-to-table relationship'
  },
  [LineageType.COLUMN_TO_COLUMN]: {
    label: 'Column → Column',
    icon: 'corner-down-right',
    color: '#06b6d4',
    description: 'Column-level data flow'
  },
  [LineageType.TRANSFORMATION]: {
    label: 'Transformation',
    icon: 'shuffle',
    color: '#8b5cf6',
    description: 'Data transformation process'
  },
  [LineageType.AGGREGATION]: {
    label: 'Aggregation',
    icon: 'layers',
    color: '#10b981',
    description: 'Data aggregation operation'
  },
  [LineageType.JOIN]: {
    label: 'Join',
    icon: 'merge',
    color: '#f59e0b',
    description: 'Data join operation'
  },
  [LineageType.FILTER]: {
    label: 'Filter',
    icon: 'filter',
    color: '#ef4444',
    description: 'Data filtering operation'
  },
  [LineageType.COMPUTED]: {
    label: 'Computed',
    icon: 'calculator',
    color: '#ec4899',
    description: 'Computed or derived field'
  },
  [LineageType.COPY]: {
    label: 'Copy',
    icon: 'copy',
    color: '#6b7280',
    description: 'Direct data copy'
  },
  [LineageType.ETL_PROCESS]: {
    label: 'ETL Process',
    icon: 'git-branch',
    color: '#84cc16',
    description: 'Extract, Transform, Load process'
  }
} as const;

// ========================= SEARCH AND FILTER CONFIGURATIONS =========================

export const SEARCH_OPERATORS = {
  TEXT: ['contains', 'equals', 'starts_with', 'ends_with', 'regex'],
  NUMERIC: ['equals', 'greater_than', 'less_than', 'between', 'in'],
  DATE: ['equals', 'before', 'after', 'between', 'relative'],
  BOOLEAN: ['equals'],
  LIST: ['contains', 'in', 'not_in']
} as const;

export const DATE_RANGES = {
  TODAY: { label: 'Today', value: 'today' },
  YESTERDAY: { label: 'Yesterday', value: 'yesterday' },
  LAST_7_DAYS: { label: 'Last 7 days', value: 'last_7_days' },
  LAST_30_DAYS: { label: 'Last 30 days', value: 'last_30_days' },
  LAST_90_DAYS: { label: 'Last 90 days', value: 'last_90_days' },
  LAST_YEAR: { label: 'Last year', value: 'last_year' },
  CUSTOM: { label: 'Custom range', value: 'custom' }
} as const;

export const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance', direction: 'desc' },
  { label: 'Name (A-Z)', value: 'asset_name', direction: 'asc' },
  { label: 'Name (Z-A)', value: 'asset_name', direction: 'desc' },
  { label: 'Created (Newest)', value: 'created_at', direction: 'desc' },
  { label: 'Created (Oldest)', value: 'created_at', direction: 'asc' },
  { label: 'Updated (Recent)', value: 'updated_at', direction: 'desc' },
  { label: 'Updated (Oldest)', value: 'updated_at', direction: 'asc' },
  { label: 'Quality (High)', value: 'quality_score', direction: 'desc' },
  { label: 'Quality (Low)', value: 'quality_score', direction: 'asc' },
  { label: 'Usage (High)', value: 'access_count', direction: 'desc' },
  { label: 'Usage (Low)', value: 'access_count', direction: 'asc' }
] as const;

// ========================= VALIDATION SCHEMAS =========================

export const ASSET_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
export const TAG_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
export const COLUMN_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const VALIDATION_RULES = {
  ASSET_NAME: {
    minLength: 3,
    maxLength: 100,
    regex: ASSET_NAME_REGEX,
    message: 'Asset name must start with a letter and contain only letters, numbers, underscores, and hyphens'
  },
  DESCRIPTION: {
    maxLength: 1000,
    message: 'Description cannot exceed 1000 characters'
  },
  TAG_NAME: {
    minLength: 2,
    maxLength: 50,
    regex: TAG_NAME_REGEX,
    message: 'Tag name must start with a letter and contain only letters, numbers, underscores, and hyphens'
  },
  EMAIL: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  }
} as const;

// ========================= UI CONFIGURATION =========================

export const PAGINATION_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

export const CARD_LAYOUTS = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table'
} as const;

export const THEME_COLORS = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4'
} as const;

// ========================= DASHBOARD CONFIGURATIONS =========================

export const DASHBOARD_WIDGETS = {
  METRICS_OVERVIEW: {
    id: 'metrics_overview',
    title: 'Metrics Overview',
    type: 'metrics',
    size: 'large',
    refreshInterval: 300000 // 5 minutes
  },
  ASSET_DISTRIBUTION: {
    id: 'asset_distribution',
    title: 'Asset Distribution',
    type: 'chart',
    chartType: 'pie',
    size: 'medium',
    refreshInterval: 600000 // 10 minutes
  },
  QUALITY_TRENDS: {
    id: 'quality_trends',
    title: 'Quality Trends',
    type: 'chart',
    chartType: 'line',
    size: 'large',
    refreshInterval: 900000 // 15 minutes
  },
  RECENT_ACTIVITIES: {
    id: 'recent_activities',
    title: 'Recent Activities',
    type: 'list',
    size: 'medium',
    refreshInterval: 30000 // 30 seconds
  },
  TOP_ASSETS: {
    id: 'top_assets',
    title: 'Most Accessed Assets',
    type: 'list',
    size: 'medium',
    refreshInterval: 600000 // 10 minutes
  }
} as const;

// ========================= EXPORT CONFIGURATIONS =========================

export const EXPORT_FORMATS = {
  JSON: { value: 'json', label: 'JSON', mimeType: 'application/json', extension: '.json' },
  CSV: { value: 'csv', label: 'CSV', mimeType: 'text/csv', extension: '.csv' },
  EXCEL: { value: 'excel', label: 'Excel', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: '.xlsx' },
  XML: { value: 'xml', label: 'XML', mimeType: 'application/xml', extension: '.xml' }
} as const;

// ========================= API CONFIGURATION =========================

export const API_ENDPOINTS = {
  CATALOG: '/enterprise-catalog',
  DISCOVERY: '/intelligent-discovery',
  QUALITY: '/catalog-quality',
  LINEAGE: '/advanced-lineage',
  ANALYTICS: '/catalog-analytics',
  SEARCH: '/semantic-search'
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  SEARCH: 5000,   // 5 seconds
  UPLOAD: 60000,  // 1 minute
  DISCOVERY: 300000 // 5 minutes
} as const;

// ========================= KEYBOARD SHORTCUTS =========================

export const KEYBOARD_SHORTCUTS = {
  SEARCH: 'Ctrl+K',
  NEW_ASSET: 'Ctrl+N',
  REFRESH: 'F5',
  HELP: 'F1',
  TOGGLE_SIDEBAR: 'Ctrl+B',
  QUICK_ACTIONS: 'Ctrl+Shift+P'
} as const;

// ========================= DEFAULT VALUES =========================

export const DEFAULT_VALUES = {
  ASSET_TYPE: AssetType.TABLE,
  ASSET_STATUS: AssetStatus.DRAFT,
  DATA_QUALITY: DataQuality.UNKNOWN,
  CRITICALITY: AssetCriticality.MEDIUM,
  SENSITIVITY: DataSensitivity.INTERNAL,
  USAGE_FREQUENCY: UsageFrequency.MEDIUM,
  DISCOVERY_SCOPE: DiscoveryScope.INCREMENTAL,
  QUALITY_THRESHOLD: 80,
  CONFIDENCE_THRESHOLD: 0.8,
  SIMILARITY_THRESHOLD: 0.7
} as const;

// ========================= FEATURE FLAGS =========================

export const FEATURE_FLAGS = {
  SEMANTIC_SEARCH: true,
  AI_RECOMMENDATIONS: true,
  REAL_TIME_MONITORING: true,
  ADVANCED_LINEAGE: true,
  QUALITY_PREDICTIONS: true,
  COLLABORATIVE_EDITING: true,
  CUSTOM_CLASSIFIERS: false, // Beta feature
  FEDERATED_SEARCH: false    // Coming soon
} as const;

// Helper function to get configuration by value
export function getAssetTypeConfig(type: AssetType) {
  return ASSET_TYPE_CONFIG[type];
}

export function getStatusConfig(status: AssetStatus) {
  return ASSET_STATUS_CONFIG[status];
}

export function getQualityConfig(quality: DataQuality) {
  return DATA_QUALITY_CONFIG[quality];
}

export function getCriticalityConfig(criticality: AssetCriticality) {
  return CRITICALITY_CONFIG[criticality];
}

export function getQualityLevel(score: number): DataQuality {
  if (score >= 95) return DataQuality.EXCELLENT;
  if (score >= 85) return DataQuality.GOOD;
  if (score >= 70) return DataQuality.FAIR;
  if (score >= 50) return DataQuality.POOR;
  if (score > 0) return DataQuality.CRITICAL;
  return DataQuality.UNKNOWN;
}

export function getQualityColor(score: number): string {
  const level = getQualityLevel(score);
  return DATA_QUALITY_CONFIG[level].color;
}

export function getCriticalityFromSLA(slaHours: number): AssetCriticality {
  if (slaHours <= 4) return AssetCriticality.CRITICAL;
  if (slaHours <= 12) return AssetCriticality.HIGH;
  if (slaHours <= 24) return AssetCriticality.MEDIUM;
  if (slaHours <= 72) return AssetCriticality.LOW;
  return AssetCriticality.UNKNOWN;
}

export default {
  ASSET_TYPE_CONFIG,
  ASSET_STATUS_CONFIG,
  DATA_QUALITY_CONFIG,
  CRITICALITY_CONFIG,
  DISCOVERY_METHOD_CONFIG,
  QUALITY_DIMENSION_CONFIG,
  LINEAGE_TYPE_CONFIG,
  SEARCH_OPERATORS,
  DATE_RANGES,
  SORT_OPTIONS,
  VALIDATION_RULES,
  PAGINATION_SIZES,
  DEFAULT_PAGE_SIZE,
  CARD_LAYOUTS,
  THEME_COLORS,
  DASHBOARD_WIDGETS,
  EXPORT_FORMATS,
  API_ENDPOINTS,
  API_TIMEOUTS,
  KEYBOARD_SHORTCUTS,
  DEFAULT_VALUES,
  FEATURE_FLAGS,
  getAssetTypeConfig,
  getStatusConfig,
  getQualityConfig,
  getCriticalityConfig,
  getQualityLevel,
  getQualityColor,
  getCriticalityFromSLA
};