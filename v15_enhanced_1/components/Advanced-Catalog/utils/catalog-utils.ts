/**
 * Advanced Catalog Utilities
 * ==========================
 * 
 * Comprehensive utility functions for catalog operations, data transformations,
 * and business logic. Maps to backend utility functions and business rules.
 * 
 * Backend Integration:
 * - Mirrors logic from enterprise_catalog_service.py utility methods
 * - Implements frontend-specific transformations and calculations
 * - Provides helper functions for UI components
 */

import {
  IntelligentDataAsset,
  EnterpriseDataLineage,
  DataQualityAssessment,
  BusinessGlossaryTerm,
  AssetUsageMetrics,
  DataProfilingResult,
  AssetType,
  AssetStatus,
  DataQuality,
  LineageType,
  UsageFrequency,
  AssetCriticality,
  DataSensitivity,
  QualityDimension
} from '../types/catalog-core.types';

import {
  SearchResult,
  SearchResponse,
  SearchFilters
} from '../types/search.types';

// ========================= ASSET UTILITIES =========================

/**
 * Calculate asset health score based on multiple factors
 */
export function calculateAssetHealthScore(asset: IntelligentDataAsset): number {
  let score = 0;
  let factors = 0;

  // Quality score (40% weight)
  if (asset.data_quality_score !== undefined) {
    score += asset.data_quality_score * 0.4;
    factors += 0.4;
  }

  // Usage frequency (20% weight)
  if (asset.usage_frequency) {
    const usageScore = getUsageFrequencyScore(asset.usage_frequency);
    score += usageScore * 0.2;
    factors += 0.2;
  }

  // Documentation completeness (20% weight)
  const docScore = calculateDocumentationCompleteness(asset);
  score += docScore * 0.2;
  factors += 0.2;

  // Governance completeness (20% weight)
  const govScore = calculateGovernanceCompleteness(asset);
  score += govScore * 0.2;
  factors += 0.2;

  return factors > 0 ? score / factors : 0;
}

/**
 * Get numeric score for usage frequency
 */
function getUsageFrequencyScore(frequency: UsageFrequency): number {
  const scoreMap: Record<UsageFrequency, number> = {
    [UsageFrequency.VERY_HIGH]: 100,
    [UsageFrequency.HIGH]: 80,
    [UsageFrequency.MEDIUM]: 60,
    [UsageFrequency.LOW]: 40,
    [UsageFrequency.VERY_LOW]: 20,
    [UsageFrequency.UNKNOWN]: 0
  };
  return scoreMap[frequency] || 0;
}

/**
 * Calculate documentation completeness score
 */
function calculateDocumentationCompleteness(asset: IntelligentDataAsset): number {
  let score = 0;
  let maxScore = 0;

  // Name and description
  if (asset.name) { score += 20; }
  maxScore += 20;

  if (asset.description) { score += 30; }
  maxScore += 30;

  // Business metadata
  if (asset.business_metadata && Object.keys(asset.business_metadata).length > 0) {
    score += 25;
  }
  maxScore += 25;

  // Tags
  if (asset.tags && asset.tags.length > 0) { score += 15; }
  maxScore += 15;

  // Column documentation (if applicable)
  if (asset.columns && asset.columns.length > 0) {
    const documentedColumns = asset.columns.filter(col => col.description).length;
    const columnScore = (documentedColumns / asset.columns.length) * 10;
    score += columnScore;
  }
  maxScore += 10;

  return maxScore > 0 ? (score / maxScore) * 100 : 0;
}

/**
 * Calculate governance completeness score
 */
function calculateGovernanceCompleteness(asset: IntelligentDataAsset): number {
  let score = 0;
  let maxScore = 0;

  // Owner assignment
  if (asset.owner) { score += 30; }
  maxScore += 30;

  // Steward assignment
  if (asset.steward) { score += 20; }
  maxScore += 20;

  // Governance policies
  if (asset.governance_policies && asset.governance_policies.length > 0) {
    score += 25;
  }
  maxScore += 25;

  // Compliance status
  if (asset.compliance_status) { score += 15; }
  maxScore += 15;

  // Sensitivity classification
  if (asset.sensitivity_level && asset.sensitivity_level !== DataSensitivity.UNKNOWN) {
    score += 10;
  }
  maxScore += 10;

  return maxScore > 0 ? (score / maxScore) * 100 : 0;
}

/**
 * Determine asset criticality based on usage and business importance
 */
export function inferAssetCriticality(asset: IntelligentDataAsset): AssetCriticality {
  let criticalityScore = 0;

  // Usage frequency impact
  if (asset.usage_frequency === UsageFrequency.VERY_HIGH) criticalityScore += 3;
  else if (asset.usage_frequency === UsageFrequency.HIGH) criticalityScore += 2;
  else if (asset.usage_frequency === UsageFrequency.MEDIUM) criticalityScore += 1;

  // Access count impact
  if (asset.access_count && asset.access_count > 1000) criticalityScore += 2;
  else if (asset.access_count && asset.access_count > 100) criticalityScore += 1;

  // Data quality impact
  if (asset.data_quality_score && asset.data_quality_score > 90) criticalityScore += 1;
  else if (asset.data_quality_score && asset.data_quality_score < 70) criticalityScore -= 1;

  // Business context impact
  if (asset.business_context?.business_owner) criticalityScore += 1;

  // Determine final criticality
  if (criticalityScore >= 5) return AssetCriticality.CRITICAL;
  if (criticalityScore >= 3) return AssetCriticality.HIGH;
  if (criticalityScore >= 1) return AssetCriticality.MEDIUM;
  if (criticalityScore >= 0) return AssetCriticality.LOW;
  return AssetCriticality.UNKNOWN;
}

/**
 * Format asset display name with fallbacks
 */
export function getAssetDisplayName(asset: IntelligentDataAsset): string {
  return asset.display_name || asset.name || asset.fully_qualified_name || 'Unnamed Asset';
}

/**
 * Get asset type icon/color mapping
 */
export function getAssetTypeInfo(assetType: AssetType): {
  icon: string;
  color: string;
  label: string;
} {
  const typeMap: Record<AssetType, { icon: string; color: string; label: string }> = {
    [AssetType.TABLE]: { icon: '🗃️', color: '#3B82F6', label: 'Table' },
    [AssetType.VIEW]: { icon: '👁️', color: '#8B5CF6', label: 'View' },
    [AssetType.STORED_PROCEDURE]: { icon: '⚙️', color: '#F59E0B', label: 'Stored Procedure' },
    [AssetType.FUNCTION]: { icon: '🔧', color: '#10B981', label: 'Function' },
    [AssetType.DATASET]: { icon: '📊', color: '#EF4444', label: 'Dataset' },
    [AssetType.FILE]: { icon: '📄', color: '#6B7280', label: 'File' },
    [AssetType.STREAM]: { icon: '🌊', color: '#06B6D4', label: 'Stream' },
    [AssetType.API]: { icon: '🔌', color: '#84CC16', label: 'API' },
    [AssetType.REPORT]: { icon: '📈', color: '#F97316', label: 'Report' },
    [AssetType.DASHBOARD]: { icon: '📋', color: '#EC4899', label: 'Dashboard' },
    [AssetType.MODEL]: { icon: '🤖', color: '#8B5CF6', label: 'Model' },
    [AssetType.PIPELINE]: { icon: '🔄', color: '#059669', label: 'Pipeline' },
    [AssetType.SCHEMA]: { icon: '🏗️', color: '#7C3AED', label: 'Schema' },
    [AssetType.DATABASE]: { icon: '🗄️', color: '#1F2937', label: 'Database' }
  };

  return typeMap[assetType] || { icon: '❓', color: '#9CA3AF', label: 'Unknown' };
}

/**
 * Get status color and label
 */
export function getAssetStatusInfo(status: AssetStatus): {
  color: string;
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  const statusMap: Record<AssetStatus, { color: string; label: string; variant: any }> = {
    [AssetStatus.ACTIVE]: { color: '#10B981', label: 'Active', variant: 'default' },
    [AssetStatus.DEPRECATED]: { color: '#F59E0B', label: 'Deprecated', variant: 'secondary' },
    [AssetStatus.ARCHIVED]: { color: '#6B7280', label: 'Archived', variant: 'outline' },
    [AssetStatus.DRAFT]: { color: '#3B82F6', label: 'Draft', variant: 'outline' },
    [AssetStatus.UNDER_REVIEW]: { color: '#8B5CF6', label: 'Under Review', variant: 'secondary' },
    [AssetStatus.QUARANTINED]: { color: '#EF4444', label: 'Quarantined', variant: 'destructive' },
    [AssetStatus.MIGRATING]: { color: '#06B6D4', label: 'Migrating', variant: 'secondary' },
    [AssetStatus.DELETED]: { color: '#DC2626', label: 'Deleted', variant: 'destructive' }
  };

  return statusMap[status] || { color: '#9CA3AF', label: 'Unknown', variant: 'outline' };
}

// ========================= QUALITY UTILITIES =========================

/**
 * Get quality level color and info
 */
export function getQualityInfo(quality: DataQuality): {
  color: string;
  label: string;
  description: string;
} {
  const qualityMap: Record<DataQuality, { color: string; label: string; description: string }> = {
    [DataQuality.EXCELLENT]: { 
      color: '#10B981', 
      label: 'Excellent', 
      description: 'High quality data (95-100%)' 
    },
    [DataQuality.GOOD]: { 
      color: '#84CC16', 
      label: 'Good', 
      description: 'Good quality data (85-94%)' 
    },
    [DataQuality.FAIR]: { 
      color: '#F59E0B', 
      label: 'Fair', 
      description: 'Fair quality data (70-84%)' 
    },
    [DataQuality.POOR]: { 
      color: '#F97316', 
      label: 'Poor', 
      description: 'Poor quality data (50-69%)' 
    },
    [DataQuality.CRITICAL]: { 
      color: '#EF4444', 
      label: 'Critical', 
      description: 'Critical quality issues (<50%)' 
    },
    [DataQuality.UNKNOWN]: { 
      color: '#6B7280', 
      label: 'Unknown', 
      description: 'Quality not assessed' 
    }
  };

  return qualityMap[quality];
}

/**
 * Calculate overall quality score from dimension scores
 */
export function calculateOverallQualityScore(assessment: DataQualityAssessment): number {
  if (assessment.dimension_scores.length === 0) {
    return assessment.overall_score;
  }

  const weightedSum = assessment.dimension_scores.reduce((sum, dim) => {
    return sum + (dim.weighted_score || dim.score * dim.weight);
  }, 0);

  const totalWeight = assessment.dimension_scores.reduce((sum, dim) => sum + dim.weight, 0);

  return totalWeight > 0 ? weightedSum / totalWeight : assessment.overall_score;
}

/**
 * Get quality dimension info
 */
export function getQualityDimensionInfo(dimension: QualityDimension): {
  label: string;
  description: string;
  icon: string;
} {
  const dimensionMap: Record<QualityDimension, { label: string; description: string; icon: string }> = {
    [QualityDimension.COMPLETENESS]: {
      label: 'Completeness',
      description: 'Percentage of non-null values',
      icon: '📊'
    },
    [QualityDimension.ACCURACY]: {
      label: 'Accuracy',
      description: 'Correctness of data values',
      icon: '🎯'
    },
    [QualityDimension.CONSISTENCY]: {
      label: 'Consistency',
      description: 'Data format and value consistency',
      icon: '🔄'
    },
    [QualityDimension.VALIDITY]: {
      label: 'Validity',
      description: 'Data conforms to defined rules',
      icon: '✅'
    },
    [QualityDimension.UNIQUENESS]: {
      label: 'Uniqueness',
      description: 'Absence of duplicate records',
      icon: '🔑'
    },
    [QualityDimension.TIMELINESS]: {
      label: 'Timeliness',
      description: 'Data freshness and currency',
      icon: '⏰'
    },
    [QualityDimension.INTEGRITY]: {
      label: 'Integrity',
      description: 'Referential and structural integrity',
      icon: '🔗'
    }
  };

  return dimensionMap[dimension];
}

// ========================= LINEAGE UTILITIES =========================

/**
 * Build lineage graph from lineage data
 */
export function buildLineageGraph(lineageData: EnterpriseDataLineage[]): {
  nodes: Array<{ id: string; label: string; type: string; level: number }>;
  edges: Array<{ id: string; source: string; target: string; type: string }>;
} {
  const nodes = new Map();
  const edges: Array<{ id: string; source: string; target: string; type: string }> = [];

  lineageData.forEach((lineage, index) => {
    // Add source node
    if (!nodes.has(lineage.source_asset_id)) {
      nodes.set(lineage.source_asset_id, {
        id: lineage.source_asset_id,
        label: `Asset ${lineage.source_asset_id}`,
        type: 'asset',
        level: 0
      });
    }

    // Add target node
    if (!nodes.has(lineage.target_asset_id)) {
      nodes.set(lineage.target_asset_id, {
        id: lineage.target_asset_id,
        label: `Asset ${lineage.target_asset_id}`,
        type: 'asset',
        level: 1
      });
    }

    // Add edge
    edges.push({
      id: lineage.id,
      source: lineage.source_asset_id,
      target: lineage.target_asset_id,
      type: lineage.lineage_type
    });
  });

  return {
    nodes: Array.from(nodes.values()),
    edges
  };
}

/**
 * Get lineage type info
 */
export function getLineageTypeInfo(lineageType: LineageType): {
  label: string;
  color: string;
  icon: string;
} {
  const typeMap: Record<LineageType, { label: string; color: string; icon: string }> = {
    [LineageType.TABLE_TO_TABLE]: { label: 'Table to Table', color: '#3B82F6', icon: '🔗' },
    [LineageType.COLUMN_TO_COLUMN]: { label: 'Column to Column', color: '#8B5CF6', icon: '📊' },
    [LineageType.TRANSFORMATION]: { label: 'Transformation', color: '#10B981', icon: '🔄' },
    [LineageType.AGGREGATION]: { label: 'Aggregation', color: '#F59E0B', icon: '📈' },
    [LineageType.JOIN]: { label: 'Join', color: '#EF4444', icon: '🔀' },
    [LineageType.FILTER]: { label: 'Filter', color: '#06B6D4', icon: '🔍' },
    [LineageType.COMPUTED]: { label: 'Computed', color: '#84CC16', icon: '🧮' },
    [LineageType.DERIVED]: { label: 'Derived', color: '#F97316', icon: '🎯' },
    [LineageType.COPY]: { label: 'Copy', color: '#6B7280', icon: '📋' },
    [LineageType.ETL_PROCESS]: { label: 'ETL Process', color: '#8B5CF6', icon: '⚙️' }
  };

  return typeMap[lineageType] || { label: 'Unknown', color: '#9CA3AF', icon: '❓' };
}

// ========================= SEARCH UTILITIES =========================

/**
 * Build search filters from UI state
 */
export function buildSearchFilters(filterState: any): SearchFilters {
  const filters: SearchFilters = {};

  if (filterState.assetTypes?.length > 0) {
    filters.asset_types = filterState.assetTypes;
  }

  if (filterState.status?.length > 0) {
    filters.asset_status = filterState.status;
  }

  if (filterState.sourceSystems?.length > 0) {
    filters.source_systems = filterState.sourceSystems;
  }

  if (filterState.tags?.length > 0) {
    filters.tags = filterState.tags;
  }

  if (filterState.owners?.length > 0) {
    filters.owners = filterState.owners;
  }

  if (filterState.qualityRange) {
    filters.numeric_ranges = {
      quality_score: {
        min: filterState.qualityRange.min,
        max: filterState.qualityRange.max
      }
    };
  }

  if (filterState.dateRange) {
    filters.date_ranges = {
      created_date: {
        start: filterState.dateRange.start,
        end: filterState.dateRange.end
      }
    };
  }

  return filters;
}

/**
 * Extract facets from search response
 */
export function extractSearchFacets(response: SearchResponse): Record<string, Array<{ value: string; count: number }>> {
  const facets: Record<string, Array<{ value: string; count: number }>> = {};

  if (response.facets) {
    Object.entries(response.facets).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        facets[key] = values.map(v => ({
          value: v.value,
          count: v.count
        }));
      }
    });
  }

  return facets;
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, terms: string[]): string {
  if (!terms.length) return text;

  let highlightedText = text;
  terms.forEach(term => {
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });

  return highlightedText;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ========================= FORMATTING UTILITIES =========================

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format number with appropriate suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Format percentage with proper precision
 */
export function formatPercentage(value: number, precision: number = 1): string {
  return `${value.toFixed(precision)}%`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return targetDate.toLocaleDateString();
}

// ========================= VALIDATION UTILITIES =========================

/**
 * Validate asset name
 */
export function validateAssetName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Asset name is required' };
  }

  if (name.length > 255) {
    return { isValid: false, error: 'Asset name must be less than 255 characters' };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    return { isValid: false, error: 'Asset name contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ========================= EXPORT UTILITIES =========================

/**
 * Convert assets to CSV format
 */
export function convertAssetsToCSV(assets: IntelligentDataAsset[]): string {
  if (assets.length === 0) return '';

  const headers = [
    'Name',
    'Type',
    'Status',
    'Source System',
    'Quality Score',
    'Owner',
    'Created Date',
    'Last Updated'
  ];

  const rows = assets.map(asset => [
    asset.name,
    asset.asset_type,
    asset.status,
    asset.source_system,
    asset.data_quality_score?.toString() || '',
    asset.owner || '',
    asset.created_at,
    asset.updated_at
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Generate asset summary statistics
 */
export function generateAssetSummary(assets: IntelligentDataAsset[]): {
  totalAssets: number;
  assetsByType: Record<string, number>;
  assetsByStatus: Record<string, number>;
  averageQualityScore: number;
  assetsWithOwners: number;
} {
  const summary = {
    totalAssets: assets.length,
    assetsByType: {} as Record<string, number>,
    assetsByStatus: {} as Record<string, number>,
    averageQualityScore: 0,
    assetsWithOwners: 0
  };

  let qualityScoreSum = 0;
  let qualityScoreCount = 0;

  assets.forEach(asset => {
    // Count by type
    summary.assetsByType[asset.asset_type] = (summary.assetsByType[asset.asset_type] || 0) + 1;

    // Count by status
    summary.assetsByStatus[asset.status] = (summary.assetsByStatus[asset.status] || 0) + 1;

    // Quality score calculation
    if (asset.data_quality_score !== undefined) {
      qualityScoreSum += asset.data_quality_score;
      qualityScoreCount++;
    }

    // Owner count
    if (asset.owner) {
      summary.assetsWithOwners++;
    }
  });

  summary.averageQualityScore = qualityScoreCount > 0 ? qualityScoreSum / qualityScoreCount : 0;

  return summary;
}

// ========================= EXPORT =========================

export {
  calculateAssetHealthScore,
  inferAssetCriticality,
  getAssetDisplayName,
  getAssetTypeInfo,
  getAssetStatusInfo,
  getQualityInfo,
  calculateOverallQualityScore,
  getQualityDimensionInfo,
  buildLineageGraph,
  getLineageTypeInfo,
  buildSearchFilters,
  extractSearchFacets,
  highlightSearchTerms,
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  validateAssetName,
  validateEmail,
  convertAssetsToCSV,
  generateAssetSummary
};