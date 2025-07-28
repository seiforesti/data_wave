/**
 * Catalog Utility Functions
 * Maps to: All backend utility functions and data processing logic
 * 
 * Comprehensive utility functions for the Advanced Catalog system including
 * data transformations, validations, formatters, and helper functions.
 */

import type {
  IntelligentDataAsset,
  AssetType,
  AssetStatus,
  AssetCriticality,
  DataSensitivity,
  DataQuality,
  BusinessGlossaryTerm,
  EnterpriseDataLineage,
  LineageNode,
  LineageEdge,
  LineageGraph,
} from '../types/catalog-core.types';

import type {
  QualityDimension,
  QualityRule,
  QualityAssessment,
  QualityIssue,
} from '../types/quality.types';

import type {
  SearchResult,
  SearchFilters,
  MatchHighlight,
} from '../types/search.types';

import { 
  ASSET_TYPE_CONFIG,
  QUALITY_DIMENSION_CONFIG,
  UI_CONFIG,
  VALIDATION_RULES,
  MONITORING_THRESHOLDS,
} from '../constants/catalog.constants';

// ===================== ASSET UTILITIES =====================

/**
 * Get asset type configuration
 */
export const getAssetTypeConfig = (assetType: AssetType) => {
  return ASSET_TYPE_CONFIG[assetType];
};

/**
 * Get asset display name with fallback
 */
export const getAssetDisplayName = (asset: IntelligentDataAsset): string => {
  return asset.display_name || asset.name || asset.qualified_name || 'Unnamed Asset';
};

/**
 * Get asset icon based on type
 */
export const getAssetIcon = (assetType: AssetType): string => {
  return ASSET_TYPE_CONFIG[assetType]?.icon || 'help-circle';
};

/**
 * Get asset color based on type
 */
export const getAssetColor = (assetType: AssetType): string => {
  return ASSET_TYPE_CONFIG[assetType]?.color || 'gray';
};

/**
 * Get asset category
 */
export const getAssetCategory = (assetType: AssetType): string => {
  return ASSET_TYPE_CONFIG[assetType]?.category || 'Unknown';
};

/**
 * Check if asset supports operation
 */
export const assetSupportsOperation = (assetType: AssetType, operation: string): boolean => {
  const config = ASSET_TYPE_CONFIG[assetType];
  return config?.supported_operations.includes(operation) || false;
};

/**
 * Get asset status color
 */
export const getAssetStatusColor = (status: AssetStatus): string => {
  return UI_CONFIG.STATUS_COLORS[status] || 'gray';
};

/**
 * Get asset criticality color
 */
export const getAssetCriticalityColor = (criticality: AssetCriticality): string => {
  return UI_CONFIG.CRITICALITY_COLORS[criticality] || 'gray';
};

/**
 * Get asset sensitivity color
 */
export const getAssetSensitivityColor = (sensitivity: DataSensitivity): string => {
  return UI_CONFIG.SENSITIVITY_COLORS[sensitivity] || 'gray';
};

/**
 * Calculate asset health score based on multiple factors
 */
export const calculateAssetHealthScore = (asset: IntelligentDataAsset): {
  score: number;
  factors: Array<{ name: string; score: number; weight: number }>;
} => {
  const factors = [
    {
      name: 'Data Quality',
      score: asset.data_quality_score || 0,
      weight: 0.4,
    },
    {
      name: 'Usage Frequency',
      score: calculateUsageScore(asset.usage_metrics?.access_frequency || 'never'),
      weight: 0.2,
    },
    {
      name: 'Documentation',
      score: calculateDocumentationScore(asset),
      weight: 0.15,
    },
    {
      name: 'Lineage Coverage',
      score: calculateLineageCoverageScore(asset.lineage_info),
      weight: 0.15,
    },
    {
      name: 'Freshness',
      score: calculateFreshnessScore(asset.last_scanned_at, asset.updated_at),
      weight: 0.1,
    },
  ];

  const weightedScore = factors.reduce((sum, factor) => {
    return sum + (factor.score * factor.weight);
  }, 0);

  return {
    score: Math.round(weightedScore),
    factors,
  };
};

/**
 * Calculate usage score from frequency
 */
const calculateUsageScore = (frequency: string): number => {
  const scores: Record<string, number> = {
    'multiple_daily': 100,
    'daily': 90,
    'weekly': 70,
    'monthly': 50,
    'quarterly': 30,
    'rarely': 10,
    'never': 0,
  };
  return scores[frequency] || 0;
};

/**
 * Calculate documentation score
 */
const calculateDocumentationScore = (asset: IntelligentDataAsset): number => {
  let score = 0;
  
  if (asset.description && asset.description.length > 20) score += 40;
  if (asset.tags && asset.tags.length > 0) score += 20;
  if (asset.business_glossary_terms && asset.business_glossary_terms.length > 0) score += 20;
  if (asset.owner) score += 10;
  if (asset.stewards && asset.stewards.length > 0) score += 10;

  return Math.min(score, 100);
};

/**
 * Calculate lineage coverage score
 */
const calculateLineageCoverageScore = (lineage?: EnterpriseDataLineage): number => {
  if (!lineage) return 0;
  
  let score = 0;
  if (lineage.upstream_assets && lineage.upstream_assets.length > 0) score += 30;
  if (lineage.downstream_assets && lineage.downstream_assets.length > 0) score += 30;
  if (lineage.column_mappings && lineage.column_mappings.length > 0) score += 20;
  if (lineage.transformation_logic) score += 20;

  return Math.min(score, 100);
};

/**
 * Calculate freshness score
 */
const calculateFreshnessScore = (lastScanned?: string, lastUpdated?: string): number => {
  const now = new Date();
  const scanDate = lastScanned ? new Date(lastScanned) : null;
  const updateDate = lastUpdated ? new Date(lastUpdated) : null;
  
  const mostRecent = scanDate && updateDate 
    ? new Date(Math.max(scanDate.getTime(), updateDate.getTime()))
    : scanDate || updateDate;

  if (!mostRecent) return 0;

  const hoursSinceUpdate = (now.getTime() - mostRecent.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate <= 1) return 100;
  if (hoursSinceUpdate <= 24) return 90;
  if (hoursSinceUpdate <= 168) return 70; // 1 week
  if (hoursSinceUpdate <= 720) return 50; // 1 month
  if (hoursSinceUpdate <= 2160) return 30; // 3 months
  
  return 10;
};

// ===================== QUALITY UTILITIES =====================

/**
 * Get quality dimension configuration
 */
export const getQualityDimensionConfig = (dimension: QualityDimension) => {
  return QUALITY_DIMENSION_CONFIG[dimension];
};

/**
 * Calculate overall quality score from dimension scores
 */
export const calculateOverallQualityScore = (
  dimensionScores: Record<QualityDimension, number>
): number => {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(dimensionScores).forEach(([dimension, score]) => {
    const config = QUALITY_DIMENSION_CONFIG[dimension as QualityDimension];
    if (config) {
      weightedSum += score * config.weight;
      totalWeight += config.weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
};

/**
 * Get quality score color and label
 */
export const getQualityScoreDisplay = (score: number): {
  color: string;
  label: string;
  level: DataQuality;
} => {
  if (score >= 90) return { color: 'green', label: 'Excellent', level: DataQuality.EXCELLENT };
  if (score >= 80) return { color: 'lime', label: 'Good', level: DataQuality.GOOD };
  if (score >= 70) return { color: 'yellow', label: 'Fair', level: DataQuality.FAIR };
  if (score >= 60) return { color: 'orange', label: 'Poor', level: DataQuality.POOR };
  if (score > 0) return { color: 'red', label: 'Critical', level: DataQuality.CRITICAL };
  return { color: 'gray', label: 'Unknown', level: DataQuality.UNKNOWN };
};

/**
 * Categorize quality issues by severity
 */
export const categorizeQualityIssues = (issues: QualityIssue[]): {
  critical: QualityIssue[];
  high: QualityIssue[];
  medium: QualityIssue[];
  low: QualityIssue[];
  counts: Record<string, number>;
} => {
  const categorized = {
    critical: issues.filter(issue => issue.issue_severity === 'critical'),
    high: issues.filter(issue => issue.issue_severity === 'high'),
    medium: issues.filter(issue => issue.issue_severity === 'medium'),
    low: issues.filter(issue => issue.issue_severity === 'low'),
    counts: { critical: 0, high: 0, medium: 0, low: 0 },
  };

  categorized.counts = {
    critical: categorized.critical.length,
    high: categorized.high.length,
    medium: categorized.medium.length,
    low: categorized.low.length,
  };

  return categorized;
};

/**
 * Generate quality improvement recommendations
 */
export const generateQualityRecommendations = (
  assessment: QualityAssessment,
  issues: QualityIssue[]
): Array<{
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: number;
}> => {
  const recommendations = [];
  const issuesByType = groupBy(issues, 'issue_type');
  
  // High priority recommendations
  if (assessment.overall_quality_score < MONITORING_THRESHOLDS.QUALITY.SCORE_CRITICAL) {
    recommendations.push({
      priority: 'high' as const,
      title: 'Immediate Quality Intervention Required',
      description: 'Overall quality score is below critical threshold. Immediate action needed.',
      effort: 'high' as const,
      impact: 30,
    });
  }

  // Missing values recommendations
  if (issuesByType.missing_values?.length > 0) {
    recommendations.push({
      priority: 'high' as const,
      title: 'Address Missing Values',
      description: `${issuesByType.missing_values.length} missing value issues found. Implement data validation rules.`,
      effort: 'medium' as const,
      impact: 25,
    });
  }

  // Consistency recommendations
  if (issuesByType.inconsistent_format?.length > 0) {
    recommendations.push({
      priority: 'medium' as const,
      title: 'Standardize Data Formats',
      description: `${issuesByType.inconsistent_format.length} format inconsistencies found. Implement format validation.`,
      effort: 'medium' as const,
      impact: 20,
    });
  }

  // Duplicate recommendations
  if (issuesByType.duplicate_values?.length > 0) {
    recommendations.push({
      priority: 'medium' as const,
      title: 'Remove Duplicate Records',
      description: `${issuesByType.duplicate_values.length} duplicate value issues found. Implement deduplication process.`,
      effort: 'low' as const,
      impact: 15,
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority] || b.impact - a.impact;
  });
};

// ===================== SEARCH UTILITIES =====================

/**
 * Highlight search matches in text
 */
export const highlightSearchMatches = (
  text: string,
  highlights: MatchHighlight[]
): string => {
  if (!highlights || highlights.length === 0) return text;

  let highlightedText = text;
  
  highlights.forEach(highlight => {
    highlight.fragments.forEach(fragment => {
      const regex = new RegExp(`(${escapeRegExp(fragment)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
  });

  return highlightedText;
};

/**
 * Parse search filters from query string
 */
export const parseSearchFilters = (query: string): {
  cleanQuery: string;
  filters: SearchFilters;
} => {
  const filters: SearchFilters = {};
  let cleanQuery = query;

  // Extract type filters: type:table
  const typeMatches = query.match(/type:(\w+)/gi);
  if (typeMatches) {
    filters.asset_types = typeMatches.map(match => 
      match.replace(/type:/i, '') as AssetType
    );
    cleanQuery = cleanQuery.replace(/type:\w+/gi, '').trim();
  }

  // Extract owner filters: owner:john
  const ownerMatches = query.match(/owner:(\w+)/gi);
  if (ownerMatches) {
    filters.owners = ownerMatches.map(match => 
      match.replace(/owner:/i, '')
    );
    cleanQuery = cleanQuery.replace(/owner:\w+/gi, '').trim();
  }

  // Extract tag filters: tag:finance
  const tagMatches = query.match(/tag:(\w+)/gi);
  if (tagMatches) {
    filters.tags = tagMatches.map(match => 
      match.replace(/tag:/i, '')
    );
    cleanQuery = cleanQuery.replace(/tag:\w+/gi, '').trim();
  }

  // Extract quality filters: quality:>80
  const qualityMatches = query.match(/quality:([><=])(\d+)/gi);
  if (qualityMatches) {
    const qualityFilter = qualityMatches[0];
    const operator = qualityFilter.match(/[><=]/)?.[0];
    const value = parseInt(qualityFilter.match(/\d+/)?.[0] || '0');
    
    filters.quality_thresholds = {
      [operator === '>' ? 'min' : operator === '<' ? 'max' : 'exact']: value
    };
    
    cleanQuery = cleanQuery.replace(/quality:[><=]\d+/gi, '').trim();
  }

  return { cleanQuery, filters };
};

/**
 * Build search query from filters
 */
export const buildSearchQuery = (
  baseQuery: string,
  filters: SearchFilters
): string => {
  let query = baseQuery;

  if (filters.asset_types?.length) {
    query += ` ${filters.asset_types.map(type => `type:${type}`).join(' ')}`;
  }

  if (filters.owners?.length) {
    query += ` ${filters.owners.map(owner => `owner:${owner}`).join(' ')}`;
  }

  if (filters.tags?.length) {
    query += ` ${filters.tags.map(tag => `tag:${tag}`).join(' ')}`;
  }

  if (filters.business_domains?.length) {
    query += ` ${filters.business_domains.map(domain => `domain:${domain}`).join(' ')}`;
  }

  return query.trim();
};

// ===================== LINEAGE UTILITIES =====================

/**
 * Build lineage graph from lineage data
 */
export const buildLineageGraph = (lineages: EnterpriseDataLineage[]): LineageGraph => {
  const nodes = new Map<string, LineageNode>();
  const edges: LineageEdge[] = [];

  lineages.forEach(lineage => {
    // Add source node
    if (!nodes.has(lineage.source_asset_id)) {
      nodes.set(lineage.source_asset_id, {
        id: lineage.source_asset_id,
        asset_id: lineage.source_asset_id,
        asset_name: lineage.source_asset_name || lineage.source_asset_id,
        asset_type: lineage.source_asset_type || AssetType.OTHER,
        level: 0, // Will be calculated later
        position: { x: 0, y: 0 }, // Will be calculated later
      });
    }

    // Add target node
    if (!nodes.has(lineage.target_asset_id)) {
      nodes.set(lineage.target_asset_id, {
        id: lineage.target_asset_id,
        asset_id: lineage.target_asset_id,
        asset_name: lineage.target_asset_name || lineage.target_asset_id,
        asset_type: lineage.target_asset_type || AssetType.OTHER,
        level: 0, // Will be calculated later
        position: { x: 0, y: 0 }, // Will be calculated later
      });
    }

    // Add edge
    edges.push({
      id: lineage.lineage_id || `${lineage.source_asset_id}-${lineage.target_asset_id}`,
      source_id: lineage.source_asset_id,
      target_id: lineage.target_asset_id,
      lineage_type: lineage.lineage_type,
      confidence_score: lineage.confidence_score || 1.0,
      relationship_strength: lineage.relationship_strength || 'strong',
    });
  });

  // Calculate node levels and positions
  const graphWithLayout = calculateLineageLayout(Array.from(nodes.values()), edges);

  return {
    nodes: graphWithLayout.nodes,
    edges,
    metadata: {
      total_nodes: nodes.size,
      total_edges: edges.length,
      max_depth: Math.max(...graphWithLayout.nodes.map(n => n.level)),
      generated_at: new Date().toISOString(),
    },
  };
};

/**
 * Calculate lineage layout positions
 */
const calculateLineageLayout = (
  nodes: LineageNode[],
  edges: LineageEdge[]
): { nodes: LineageNode[] } => {
  // Simple hierarchical layout algorithm
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));
  const visited = new Set<string>();
  const levels = new Map<number, string[]>();

  // Find root nodes (nodes with no incoming edges)
  const incomingEdges = new Set(edges.map(e => e.target_id));
  const rootNodes = nodes.filter(n => !incomingEdges.has(n.id));

  // BFS to assign levels
  const queue = rootNodes.map(n => ({ nodeId: n.id, level: 0 }));
  
  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!;
    
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    
    const node = nodeMap.get(nodeId)!;
    node.level = level;
    
    if (!levels.has(level)) levels.set(level, []);
    levels.get(level)!.push(nodeId);
    
    // Add children to queue
    const outgoingEdges = edges.filter(e => e.source_id === nodeId);
    outgoingEdges.forEach(edge => {
      if (!visited.has(edge.target_id)) {
        queue.push({ nodeId: edge.target_id, level: level + 1 });
      }
    });
  }

  // Assign positions
  levels.forEach((nodeIds, level) => {
    nodeIds.forEach((nodeId, index) => {
      const node = nodeMap.get(nodeId)!;
      node.position = {
        x: (index - nodeIds.length / 2) * 200,
        y: level * 150,
      };
    });
  });

  return { nodes: Array.from(nodeMap.values()) };
};

/**
 * Find impact of asset changes in lineage
 */
export const findLineageImpact = (
  assetId: string,
  lineageGraph: LineageGraph,
  direction: 'upstream' | 'downstream' | 'both' = 'downstream'
): {
  impacted_assets: string[];
  impact_levels: Record<string, number>;
  critical_paths: Array<{ path: string[]; risk_level: 'high' | 'medium' | 'low' }>;
} => {
  const impactedAssets = new Set<string>();
  const impactLevels: Record<string, number> = {};
  const criticalPaths: Array<{ path: string[]; risk_level: 'high' | 'medium' | 'low' }> = [];

  const traverse = (nodeId: string, level: number, path: string[]) => {
    if (level > 5) return; // Prevent infinite loops
    
    impactedAssets.add(nodeId);
    impactLevels[nodeId] = Math.min(impactLevels[nodeId] || Infinity, level);

    const edges = lineageGraph.edges.filter(e => 
      direction === 'upstream' ? e.target_id === nodeId :
      direction === 'downstream' ? e.source_id === nodeId :
      e.source_id === nodeId || e.target_id === nodeId
    );

    edges.forEach(edge => {
      const nextNodeId = edge.source_id === nodeId ? edge.target_id : edge.source_id;
      const newPath = [...path, nextNodeId];
      
      // Determine risk level based on confidence and relationship strength
      const riskLevel = edge.confidence_score > 0.8 && edge.relationship_strength === 'strong' 
        ? 'high' : edge.confidence_score > 0.5 ? 'medium' : 'low';
      
      if (level <= 3) { // Only track paths up to 3 levels deep
        criticalPaths.push({ path: newPath, risk_level: riskLevel });
      }
      
      if (!impactedAssets.has(nextNodeId)) {
        traverse(nextNodeId, level + 1, newPath);
      }
    });
  };

  traverse(assetId, 0, [assetId]);
  impactedAssets.delete(assetId); // Remove the starting asset

  return {
    impacted_assets: Array.from(impactedAssets),
    impact_levels: impactLevels,
    critical_paths: criticalPaths.filter(cp => cp.risk_level === 'high').slice(0, 10),
  };
};

// ===================== FORMATTING UTILITIES =====================

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Format duration in human readable format
 */
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
  if (milliseconds < 3600000) return `${Math.floor(milliseconds / 60000)}m ${Math.floor((milliseconds % 60000) / 1000)}s`;
  
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

/**
 * Format timestamp to relative time
 */
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  
  return `${Math.floor(diffDays / 365)}y ago`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = UI_CONFIG.TRUNCATE_LENGTH): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format percentage with proper rounding
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

// ===================== VALIDATION UTILITIES =====================

/**
 * Validate asset name
 */
export const validateAssetName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Asset name is required' };
  }
  
  if (name.length < VALIDATION_RULES.ASSET_NAME.MIN_LENGTH) {
    return { isValid: false, error: `Asset name must be at least ${VALIDATION_RULES.ASSET_NAME.MIN_LENGTH} characters` };
  }
  
  if (name.length > VALIDATION_RULES.ASSET_NAME.MAX_LENGTH) {
    return { isValid: false, error: `Asset name must be less than ${VALIDATION_RULES.ASSET_NAME.MAX_LENGTH} characters` };
  }
  
  if (!VALIDATION_RULES.ASSET_NAME.PATTERN.test(name)) {
    return { isValid: false, error: 'Asset name contains invalid characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate search query
 */
export const validateSearchQuery = (query: string): { isValid: boolean; error?: string } => {
  if (!query || query.trim().length === 0) {
    return { isValid: false, error: 'Search query is required' };
  }
  
  if (query.length < VALIDATION_RULES.SEARCH_QUERY.MIN_LENGTH) {
    return { isValid: false, error: 'Search query is too short' };
  }
  
  if (query.length > VALIDATION_RULES.SEARCH_QUERY.MAX_LENGTH) {
    return { isValid: false, error: 'Search query is too long' };
  }
  
  return { isValid: true };
};

/**
 * Validate quality threshold
 */
export const validateQualityThreshold = (threshold: number): { isValid: boolean; error?: string } => {
  if (threshold < VALIDATION_RULES.QUALITY_THRESHOLD.MIN || threshold > VALIDATION_RULES.QUALITY_THRESHOLD.MAX) {
    return { 
      isValid: false, 
      error: `Quality threshold must be between ${VALIDATION_RULES.QUALITY_THRESHOLD.MIN} and ${VALIDATION_RULES.QUALITY_THRESHOLD.MAX}` 
    };
  }
  
  return { isValid: true };
};

// ===================== HELPER UTILITIES =====================

/**
 * Group array by key
 */
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups: Record<string, T[]>, item: T) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

/**
 * Escape regex special characters
 */
export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as { [key: string]: any };
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned as T;
  }
  return obj;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if value is empty
 */
export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Sort array by multiple criteria
 */
export const sortBy = <T>(
  array: T[],
  criteria: Array<{ key: keyof T; direction: 'asc' | 'desc' }>
): T[] => {
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      const aValue = a[criterion.key];
      const bValue = b[criterion.key];
      
      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;
      
      if (comparison !== 0) {
        return criterion.direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
};

// Export all utilities as a single object
export const catalogUtils = {
  // Asset utilities
  getAssetTypeConfig,
  getAssetDisplayName,
  getAssetIcon,
  getAssetColor,
  getAssetCategory,
  assetSupportsOperation,
  getAssetStatusColor,
  getAssetCriticalityColor,
  getAssetSensitivityColor,
  calculateAssetHealthScore,
  
  // Quality utilities
  getQualityDimensionConfig,
  calculateOverallQualityScore,
  getQualityScoreDisplay,
  categorizeQualityIssues,
  generateQualityRecommendations,
  
  // Search utilities
  highlightSearchMatches,
  parseSearchFilters,
  buildSearchQuery,
  
  // Lineage utilities
  buildLineageGraph,
  findLineageImpact,
  
  // Formatting utilities
  formatFileSize,
  formatDuration,
  formatRelativeTime,
  truncateText,
  formatPercentage,
  formatNumber,
  
  // Validation utilities
  validateAssetName,
  validateSearchQuery,
  validateQualityThreshold,
  
  // Helper utilities
  groupBy,
  escapeRegExp,
  deepClone,
  debounce,
  generateId,
  isEmpty,
  sortBy,
};