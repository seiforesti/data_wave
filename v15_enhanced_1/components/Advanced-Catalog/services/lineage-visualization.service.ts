// ============================================================================
// LINEAGE VISUALIZATION SERVICE - ADVANCED LINEAGE OPERATIONS
// ============================================================================
// Enterprise Data Governance System - Lineage Visualization Service
// Comprehensive lineage analysis, impact assessment, temporal tracking,
// and visualization configuration management
// ============================================================================

import { apiClient } from '../../../shared/services/api-client';
import {
  DataLineage,
  LineageNode,
  LineageEdge,
  LineageAnalysis,
  LineageVisualizationConfig,
  ImpactAnalysis,
  DependencyGraph,
  LineageMetrics,
  LineageFilter,
  LineageSearchCriteria,
  TemporalLineage,
  LineageChangeEvent,
  CatalogAsset,
  NetworkAnalysis,
  LineagePathAnalysis,
  GraphMetrics
} from '../types/catalog-core.types';

// ============================================================================
// LINEAGE VISUALIZATION SERVICE CLASS
// ============================================================================

class LineageVisualizationService {
  private readonly baseUrl = '/api/v1/catalog/lineage';

  // ========================================================================
  // CORE LINEAGE OPERATIONS
  // ========================================================================

  /**
   * Get complete data lineage for an asset
   */
  async getAssetLineage(
    assetId: string,
    config: LineageVisualizationConfig
  ): Promise<DataLineage> {
    const response = await apiClient.post(`${this.baseUrl}/asset/${assetId}`, {
      config,
      includeMetadata: config.includeMetadata,
      maxDepth: config.maxDepth,
      direction: config.direction
    });
    return response.data;
  }

  /**
   * Get lineage for multiple assets
   */
  async getMultiAssetLineage(
    assetIds: string[],
    config: LineageVisualizationConfig
  ): Promise<DataLineage> {
    const response = await apiClient.post(`${this.baseUrl}/multi-asset`, {
      assetIds,
      config
    });
    return response.data;
  }

  /**
   * Get lineage with advanced filtering
   */
  async getFilteredLineage(
    criteria: LineageSearchCriteria,
    filters: LineageFilter[]
  ): Promise<DataLineage> {
    const response = await apiClient.post(`${this.baseUrl}/filtered`, {
      criteria,
      filters
    });
    return response.data;
  }

  /**
   * Get lineage between two specific assets
   */
  async getLineagePath(
    sourceAssetId: string,
    targetAssetId: string,
    maxDepth?: number
  ): Promise<LineagePathAnalysis> {
    const response = await apiClient.get(`${this.baseUrl}/path`, {
      params: {
        source: sourceAssetId,
        target: targetAssetId,
        maxDepth: maxDepth || 10
      }
    });
    return response.data;
  }

  // ========================================================================
  // IMPACT ANALYSIS OPERATIONS
  // ========================================================================

  /**
   * Get impact analysis for an asset
   */
  async getImpactAnalysis(assetId: string): Promise<ImpactAnalysis> {
    const response = await apiClient.get(`${this.baseUrl}/impact/${assetId}`);
    return response.data;
  }

  /**
   * Run comprehensive impact analysis
   */
  async runImpactAnalysis(
    assetId: string,
    config: {
      analysisType: 'full' | 'downstream' | 'upstream' | 'business' | 'technical';
      includeDownstream: boolean;
      includeUpstream: boolean;
      maxDepth: number;
      includeBusinessImpact: boolean;
      includeDataQuality: boolean;
      includeCompliance: boolean;
    }
  ): Promise<LineageAnalysis> {
    const response = await apiClient.post(`${this.baseUrl}/impact/${assetId}/analyze`, {
      config
    });
    return response.data;
  }

  /**
   * Get change impact analysis
   */
  async getChangeImpactAnalysis(
    assetId: string,
    changeType: 'schema' | 'location' | 'access' | 'deletion'
  ): Promise<ImpactAnalysis> {
    const response = await apiClient.post(`${this.baseUrl}/impact/${assetId}/change`, {
      changeType
    });
    return response.data;
  }

  /**
   * Get business impact assessment
   */
  async getBusinessImpactAssessment(
    assetId: string,
    includeDownstream: boolean = true
  ): Promise<{
    businessProcesses: Array<{
      id: string;
      name: string;
      criticality: 'low' | 'medium' | 'high' | 'critical';
      impactScore: number;
      affectedUsers: number;
    }>;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigation: Array<{
      action: string;
      priority: number;
      effort: string;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/impact/${assetId}/business`, {
      params: { includeDownstream }
    });
    return response.data;
  }

  // ========================================================================
  // TEMPORAL LINEAGE OPERATIONS
  // ========================================================================

  /**
   * Get temporal lineage data
   */
  async getTemporalLineage(
    assetId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<TemporalLineage> {
    const response = await apiClient.get(`${this.baseUrl}/temporal/${assetId}`, {
      params: {
        startDate: timeRange.start.toISOString(),
        endDate: timeRange.end.toISOString()
      }
    });
    return response.data;
  }

  /**
   * Get lineage evolution over time
   */
  async getLineageEvolution(
    assetId: string,
    timePoints: Date[]
  ): Promise<{
    snapshots: Array<{
      timestamp: Date;
      lineage: DataLineage;
      metrics: LineageMetrics;
    }>;
    changes: LineageChangeEvent[];
  }> {
    const response = await apiClient.post(`${this.baseUrl}/temporal/${assetId}/evolution`, {
      timePoints: timePoints.map(t => t.toISOString())
    });
    return response.data;
  }

  /**
   * Get lineage change events
   */
  async getLineageChangeEvents(
    assetId: string,
    timeRange: { start: Date; end: Date },
    eventTypes?: string[]
  ): Promise<LineageChangeEvent[]> {
    const response = await apiClient.get(`${this.baseUrl}/temporal/${assetId}/changes`, {
      params: {
        startDate: timeRange.start.toISOString(),
        endDate: timeRange.end.toISOString(),
        eventTypes: eventTypes?.join(',')
      }
    });
    return response.data;
  }

  // ========================================================================
  // NETWORK ANALYSIS OPERATIONS
  // ========================================================================

  /**
   * Get network analysis metrics
   */
  async getNetworkAnalysis(
    assetIds: string[]
  ): Promise<NetworkAnalysis> {
    const response = await apiClient.post(`${this.baseUrl}/network/analyze`, {
      assetIds
    });
    return response.data;
  }

  /**
   * Get dependency graph metrics
   */
  async getDependencyGraphMetrics(
    rootAssetId: string,
    maxDepth: number = 5
  ): Promise<GraphMetrics> {
    const response = await apiClient.get(`${this.baseUrl}/network/${rootAssetId}/metrics`, {
      params: { maxDepth }
    });
    return response.data;
  }

  /**
   * Find critical paths in lineage
   */
  async findCriticalPaths(
    assetId: string,
    criteria: {
      minPathLength?: number;
      maxPathLength?: number;
      includeBusinessCritical?: boolean;
      includeHighVolume?: boolean;
    }
  ): Promise<Array<{
    path: LineageNode[];
    criticality: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    metrics: {
      length: number;
      dataVolume: number;
      updateFrequency: number;
      businessImpact: number;
    };
  }>> {
    const response = await apiClient.post(`${this.baseUrl}/network/${assetId}/critical-paths`, {
      criteria
    });
    return response.data;
  }

  /**
   * Detect lineage anomalies
   */
  async detectLineageAnomalies(
    assetId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<Array<{
    type: 'missing_dependency' | 'unexpected_dependency' | 'broken_lineage' | 'circular_dependency';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedAssets: string[];
    detectedAt: Date;
    recommendations: string[];
  }>> {
    const response = await apiClient.post(`${this.baseUrl}/network/${assetId}/anomalies`, {
      timeRange: {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      }
    });
    return response.data;
  }

  // ========================================================================
  // LINEAGE DISCOVERY OPERATIONS
  // ========================================================================

  /**
   * Discover lineage automatically
   */
  async discoverLineage(
    assetId: string,
    discoveryConfig: {
      methods: ('schema' | 'metadata' | 'query_logs' | 'job_logs' | 'api_calls')[];
      maxDepth: number;
      confidence_threshold: number;
      includeInferred: boolean;
    }
  ): Promise<{
    discoveredLineage: DataLineage;
    confidence: number;
    method: string;
    discoveryMetrics: {
      nodesDiscovered: number;
      edgesDiscovered: number;
      confidence: number;
      executionTime: number;
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/discovery/${assetId}`, {
      config: discoveryConfig
    });
    return response.data;
  }

  /**
   * Validate existing lineage
   */
  async validateLineage(
    assetId: string,
    validationConfig: {
      checkSchemaConsistency: boolean;
      checkDataFlow: boolean;
      checkTemporalConsistency: boolean;
      strictMode: boolean;
    }
  ): Promise<{
    isValid: boolean;
    issues: Array<{
      type: 'schema_mismatch' | 'missing_dependency' | 'temporal_inconsistency' | 'data_flow_error';
      severity: 'warning' | 'error' | 'critical';
      description: string;
      affectedNodes: string[];
      recommendation: string;
    }>;
    validationScore: number;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/discovery/${assetId}/validate`, {
      config: validationConfig
    });
    return response.data;
  }

  // ========================================================================
  // VISUALIZATION CONFIGURATION
  // ========================================================================

  /**
   * Save visualization configuration
   */
  async saveVisualizationConfig(
    name: string,
    config: LineageVisualizationConfig,
    isDefault: boolean = false
  ): Promise<{ id: string; name: string }> {
    const response = await apiClient.post(`${this.baseUrl}/config`, {
      name,
      config,
      isDefault
    });
    return response.data;
  }

  /**
   * Get saved visualization configurations
   */
  async getVisualizationConfigs(): Promise<Array<{
    id: string;
    name: string;
    config: LineageVisualizationConfig;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/config`);
    return response.data;
  }

  /**
   * Get default visualization configuration
   */
  async getDefaultVisualizationConfig(): Promise<LineageVisualizationConfig> {
    const response = await apiClient.get(`${this.baseUrl}/config/default`);
    return response.data;
  }

  // ========================================================================
  // LINEAGE METRICS AND STATISTICS
  // ========================================================================

  /**
   * Get lineage metrics for an asset
   */
  async getLineageMetrics(assetId: string): Promise<LineageMetrics> {
    const response = await apiClient.get(`${this.baseUrl}/metrics/${assetId}`);
    return response.data;
  }

  /**
   * Get aggregated lineage statistics
   */
  async getLineageStatistics(
    filters?: {
      assetTypes?: string[];
      dateRange?: { start: Date; end: Date };
      schemas?: string[];
    }
  ): Promise<{
    totalAssets: number;
    totalDependencies: number;
    averageDepth: number;
    maxDepth: number;
    circularDependencies: number;
    orphanedAssets: number;
    complexityScore: number;
    topConnectedAssets: Array<{
      assetId: string;
      assetName: string;
      connectionCount: number;
      complexityScore: number;
    }>;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/metrics/statistics`, {
      filters
    });
    return response.data;
  }

  // ========================================================================
  // EXPORT AND IMPORT OPERATIONS
  // ========================================================================

  /**
   * Export lineage data
   */
  async exportLineage(
    assetId: string,
    format: 'json' | 'graphml' | 'csv' | 'png' | 'svg',
    config?: LineageVisualizationConfig
  ): Promise<{
    downloadUrl: string;
    filename: string;
    size: number;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/export/${assetId}`, {
      format,
      config
    });
    return response.data;
  }

  /**
   * Import lineage data
   */
  async importLineage(
    file: File,
    format: 'json' | 'graphml' | 'csv',
    mergeStrategy: 'replace' | 'merge' | 'append'
  ): Promise<{
    importedAssets: number;
    importedDependencies: number;
    conflicts: Array<{
      assetId: string;
      issue: string;
      resolution: string;
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('mergeStrategy', mergeStrategy);

    const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // ========================================================================
  // REAL-TIME LINEAGE OPERATIONS
  // ========================================================================

  /**
   * Subscribe to lineage changes
   */
  subscribeToLineageChanges(
    assetId: string,
    callback: (event: LineageChangeEvent) => void
  ): () => void {
    // Implementation would use WebSocket or SSE
    const eventSource = new EventSource(`${this.baseUrl}/subscribe/${assetId}`);
    
    eventSource.onmessage = (event) => {
      const changeEvent = JSON.parse(event.data) as LineageChangeEvent;
      callback(changeEvent);
    };

    return () => {
      eventSource.close();
    };
  }

  /**
   * Get real-time lineage status
   */
  async getLineageStatus(assetId: string): Promise<{
    status: 'healthy' | 'warning' | 'error' | 'unknown';
    lastUpdated: Date;
    upstreamHealth: number;
    downstreamHealth: number;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/status/${assetId}`);
    return response.data;
  }

  // ========================================================================
  // LINEAGE RECOMMENDATIONS
  // ========================================================================

  /**
   * Get lineage optimization recommendations
   */
  async getLineageRecommendations(
    assetId: string
  ): Promise<Array<{
    type: 'performance' | 'structure' | 'governance' | 'quality';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    implementation: string;
    estimatedImpact: string;
    effort: 'low' | 'medium' | 'high';
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/recommendations/${assetId}`);
    return response.data;
  }

  /**
   * Get data quality recommendations based on lineage
   */
  async getDataQualityRecommendations(
    assetId: string
  ): Promise<Array<{
    assetId: string;
    assetName: string;
    qualityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      suggestedFix: string;
    }>;
    impactOnDownstream: number;
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/recommendations/${assetId}/quality`);
    return response.data;
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const lineageVisualizationService = new LineageVisualizationService();
export default lineageVisualizationService;