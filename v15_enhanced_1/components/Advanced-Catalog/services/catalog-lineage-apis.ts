/**
 * Catalog Lineage API Service
 * ===========================
 * 
 * Maps to backend services:
 * - advanced_lineage_service.py (45KB, AdvancedLineageService)
 * - lineage_service.py (29KB, 704 lines, LineageService)
 * - advanced_lineage_routes.py (37KB, 998 lines, 25+ endpoints)
 * - data_lineage_models.py (18KB, 5+ classes)
 * 
 * Provides comprehensive lineage capabilities including column-level tracking,
 * impact analysis, visualization, validation, and real-time updates.
 */

import { apiClient } from '@/shared/utils/api-client'
import type {
  // Core lineage types
  LineageGraph,
  LineageNode,
  LineageEdge,
  LineageDirection,
  LineageType,
  
  // Advanced lineage types
  ColumnLineage,
  TransformationLineage,
  LineageMetrics,
  ImpactAnalysis,
  ChangeImpactAssessment,
  LineageValidation,
  
  // Visualization types
  LineageVisualization,
  LineageLayout,
  GraphFilterOptions,
  VisualizationConfig,
  
  // Request/Response types
  LineageRequest,
  LineageTraversalRequest,
  ImpactAnalysisRequest,
  LineageValidationRequest,
  LineageExportRequest
} from '../types/lineage.types'

import type {
  IntelligentDataAsset,
  EnterpriseDataLineage
} from '../types/catalog-core.types'

const API_BASE_URL = '/api/v1/catalog/lineage'

export class CatalogLineageApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // ===================== CORE LINEAGE OPERATIONS =====================

  /**
   * Get complete lineage graph for an asset
   * Maps to: AdvancedLineageService.get_complete_lineage()
   */
  async getAssetLineage(
    assetId: string,
    direction: LineageDirection = 'bidirectional',
    depth: number = 5,
    includeColumns: boolean = true
  ): Promise<LineageGraph> {
    const params = new URLSearchParams({
      direction,
      depth: depth.toString(),
      include_columns: includeColumns.toString()
    })
    
    return apiClient.get(`${this.baseUrl}/assets/${assetId}?${params.toString()}`)
  }

  /**
   * Get column-level lineage
   * Maps to: AdvancedLineageService.get_column_lineage()
   */
  async getColumnLineage(
    assetId: string,
    columnName: string,
    direction: LineageDirection = 'bidirectional',
    depth: number = 3
  ): Promise<ColumnLineage> {
    const params = new URLSearchParams({
      direction,
      depth: depth.toString()
    })
    
    return apiClient.get(`${this.baseUrl}/assets/${assetId}/columns/${columnName}?${params.toString()}`)
  }

  /**
   * Get transformation lineage
   * Maps to: AdvancedLineageService.get_transformation_lineage()
   */
  async getTransformationLineage(transformationId: string): Promise<TransformationLineage> {
    return apiClient.get(`${this.baseUrl}/transformations/${transformationId}`)
  }

  /**
   * Trace lineage path between two assets
   * Maps to: AdvancedLineageService.trace_lineage_path()
   */
  async traceLineagePath(
    sourceAssetId: string,
    targetAssetId: string,
    maxDepth: number = 10
  ): Promise<{
    paths: Array<{
      nodes: LineageNode[]
      edges: LineageEdge[]
      confidence: number
      transformations: string[]
    }>
    shortestPath: {
      length: number
      nodes: string[]
    }
    alternatives: number
  }> {
    return apiClient.post(`${this.baseUrl}/trace-path`, {
      source_asset_id: sourceAssetId,
      target_asset_id: targetAssetId,
      max_depth: maxDepth
    })
  }

  // ===================== ADVANCED LINEAGE ANALYSIS =====================

  /**
   * Perform impact analysis
   * Maps to: AdvancedLineageService.analyze_change_impact()
   */
  async analyzeImpact(request: ImpactAnalysisRequest): Promise<ImpactAnalysis> {
    return apiClient.post(`${this.baseUrl}/impact-analysis`, request)
  }

  /**
   * Get downstream impact analysis
   * Maps to: AdvancedLineageService.get_downstream_impact()
   */
  async getDownstreamImpact(
    assetId: string,
    changeType: 'schema' | 'data' | 'transformation' | 'deletion',
    depth: number = 5
  ): Promise<{
    impactedAssets: Array<{
      assetId: string
      assetName: string
      assetType: string
      impactLevel: 'high' | 'medium' | 'low'
      impactType: string[]
      distance: number
      riskScore: number
    }>
    riskAssessment: {
      overallRisk: 'high' | 'medium' | 'low'
      criticalAssets: number
      businessImpact: string
      recommendations: string[]
    }
    affectedUsers: Array<{
      userId: string
      userName: string
      role: string
      assets: string[]
    }>
  }> {
    return apiClient.post(`${this.baseUrl}/impact/downstream`, {
      asset_id: assetId,
      change_type: changeType,
      depth
    })
  }

  /**
   * Get upstream dependency analysis
   * Maps to: AdvancedLineageService.get_upstream_dependencies()
   */
  async getUpstreamDependencies(
    assetId: string,
    depth: number = 5
  ): Promise<{
    dependencies: Array<{
      assetId: string
      assetName: string
      assetType: string
      dependencyType: string
      criticality: 'high' | 'medium' | 'low'
      distance: number
      lastUpdated: string
    }>
    criticalPath: {
      assets: string[]
      riskFactors: string[]
      recommendations: string[]
    }
    healthStatus: {
      overall: 'healthy' | 'warning' | 'critical'
      issues: Array<{
        type: string
        severity: string
        description: string
        assetId: string
      }>
    }
  }> {
    return apiClient.get(`${this.baseUrl}/dependencies/upstream/${assetId}?depth=${depth}`)
  }

  /**
   * Analyze lineage complexity
   * Maps to: AdvancedLineageService.calculate_lineage_complexity()
   */
  async analyzeLineageComplexity(assetId?: string): Promise<{
    complexityScore: number
    metrics: {
      depth: number
      breadth: number
      fanIn: number
      fanOut: number
      cyclicalDependencies: number
      transformationComplexity: number
    }
    hotspots: Array<{
      assetId: string
      assetName: string
      complexityScore: number
      issues: string[]
      recommendations: string[]
    }>
    trends: Array<{
      date: string
      complexity: number
      change: number
    }>
  }> {
    const params = new URLSearchParams()
    if (assetId) params.append('asset_id', assetId)
    
    return apiClient.get(`${this.baseUrl}/complexity?${params.toString()}`)
  }

  // ===================== LINEAGE VALIDATION =====================

  /**
   * Validate lineage accuracy
   * Maps to: AdvancedLineageService.validate_lineage_accuracy()
   */
  async validateLineage(request: LineageValidationRequest): Promise<LineageValidation> {
    return apiClient.post(`${this.baseUrl}/validate`, request)
  }

  /**
   * Detect lineage anomalies
   * Maps to: AdvancedLineageService.detect_lineage_anomalies()
   */
  async detectLineageAnomalies(assetId?: string): Promise<{
    anomalies: Array<{
      id: string
      type: 'missing_lineage' | 'incorrect_relationship' | 'orphaned_asset' | 'circular_dependency'
      severity: 'high' | 'medium' | 'low'
      description: string
      affectedAssets: string[]
      suggestedFix: string
      confidence: number
    }>
    healthScore: number
    recommendations: string[]
  }> {
    const params = new URLSearchParams()
    if (assetId) params.append('asset_id', assetId)
    
    return apiClient.get(`${this.baseUrl}/anomalies?${params.toString()}`)
  }

  /**
   * Validate data freshness through lineage
   * Maps to: AdvancedLineageService.validate_data_freshness()
   */
  async validateDataFreshness(assetId: string): Promise<{
    freshnessScore: number
    lastUpdated: string
    staleDependencies: Array<{
      assetId: string
      assetName: string
      lastUpdated: string
      staleness: number
      impact: string
    }>
    refreshRecommendations: Array<{
      assetId: string
      priority: string
      effort: string
      impact: string
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/validate/freshness/${assetId}`)
  }

  // ===================== LINEAGE VISUALIZATION =====================

  /**
   * Get lineage visualization data
   * Maps to: AdvancedLineageService.get_lineage_visualization()
   */
  async getLineageVisualization(
    assetId: string,
    config: VisualizationConfig
  ): Promise<LineageVisualization> {
    return apiClient.post(`${this.baseUrl}/visualization/${assetId}`, config)
  }

  /**
   * Get optimized graph layout
   * Maps to: Graph layout algorithms in backend
   */
  async getGraphLayout(
    nodeIds: string[],
    layout: LineageLayout = 'hierarchical',
    options?: Record<string, any>
  ): Promise<{
    nodes: Array<{
      id: string
      x: number
      y: number
      width: number
      height: number
    }>
    edges: Array<{
      id: string
      source: string
      target: string
      points: Array<{ x: number; y: number }>
    }>
    bounds: {
      minX: number
      minY: number
      maxX: number
      maxY: number
    }
  }> {
    return apiClient.post(`${this.baseUrl}/visualization/layout`, {
      node_ids: nodeIds,
      layout,
      options: options || {}
    })
  }

  /**
   * Generate lineage diagram
   * Maps to: Diagram generation services
   */
  async generateLineageDiagram(
    assetId: string,
    format: 'svg' | 'png' | 'pdf' | 'json',
    options?: {
      width?: number
      height?: number
      includeLabels?: boolean
      colorScheme?: string
      layout?: string
    }
  ): Promise<Blob | string> {
    const response = await fetch(`${this.baseUrl}/visualization/diagram/${assetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format,
        options: options || {}
      })
    })
    
    if (!response.ok) {
      throw new Error(`Diagram generation failed: ${response.statusText}`)
    }
    
    if (format === 'json') {
      return response.text()
    }
    
    return response.blob()
  }

  // ===================== LINEAGE SEARCH AND DISCOVERY =====================

  /**
   * Search lineage graph
   * Maps to: LineageService.search_lineage()
   */
  async searchLineage(
    query: string,
    filters?: GraphFilterOptions
  ): Promise<{
    assets: Array<{
      id: string
      name: string
      type: string
      relevanceScore: number
      lineageContext: string[]
    }>
    paths: Array<{
      nodes: string[]
      relevance: number
      description: string
    }>
    totalResults: number
  }> {
    return apiClient.post(`${this.baseUrl}/search`, {
      query,
      filters: filters || {}
    })
  }

  /**
   * Find assets by lineage pattern
   * Maps to: Pattern matching in lineage service
   */
  async findByLineagePattern(
    pattern: {
      sourceType?: string
      targetType?: string
      transformationType?: string
      pathLength?: number
      hasColumns?: boolean
    }
  ): Promise<{
    matches: Array<{
      assetId: string
      assetName: string
      assetType: string
      pattern: string
      confidence: number
    }>
    patterns: Array<{
      description: string
      frequency: number
      examples: string[]
    }>
  }> {
    return apiClient.post(`${this.baseUrl}/search/patterns`, { pattern })
  }

  /**
   * Get lineage recommendations
   * Maps to: AI-powered lineage recommendations
   */
  async getLineageRecommendations(assetId: string): Promise<{
    missingConnections: Array<{
      sourceAsset: string
      targetAsset: string
      confidence: number
      reasoning: string
      evidence: string[]
    }>
    optimizations: Array<{
      type: string
      description: string
      impact: string
      effort: string
    }>
    qualityImprovements: Array<{
      area: string
      suggestion: string
      priority: string
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/recommendations/${assetId}`)
  }

  // ===================== LINEAGE MANAGEMENT =====================

  /**
   * Create lineage relationship
   * Maps to: LineageService.create_lineage_relationship()
   */
  async createLineageRelationship(
    sourceAssetId: string,
    targetAssetId: string,
    relationship: {
      type: LineageType
      description?: string
      columnMappings?: Array<{
        sourceColumn: string
        targetColumn: string
        transformationLogic?: string
      }>
      transformationId?: string
      metadata?: Record<string, any>
    }
  ): Promise<EnterpriseDataLineage> {
    return apiClient.post(`${this.baseUrl}/relationships`, {
      source_asset_id: sourceAssetId,
      target_asset_id: targetAssetId,
      ...relationship
    })
  }

  /**
   * Update lineage relationship
   * Maps to: LineageService.update_lineage_relationship()
   */
  async updateLineageRelationship(
    relationshipId: string,
    updates: {
      type?: LineageType
      description?: string
      columnMappings?: Array<{
        sourceColumn: string
        targetColumn: string
        transformationLogic?: string
      }>
      metadata?: Record<string, any>
      isActive?: boolean
    }
  ): Promise<EnterpriseDataLineage> {
    return apiClient.put(`${this.baseUrl}/relationships/${relationshipId}`, updates)
  }

  /**
   * Delete lineage relationship
   * Maps to: LineageService.delete_lineage_relationship()
   */
  async deleteLineageRelationship(relationshipId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/relationships/${relationshipId}`)
  }

  /**
   * Bulk import lineage relationships
   * Maps to: Bulk lineage import services
   */
  async bulkImportLineage(
    relationships: Array<{
      sourceAssetId: string
      targetAssetId: string
      type: LineageType
      description?: string
      columnMappings?: Array<{
        sourceColumn: string
        targetColumn: string
        transformationLogic?: string
      }>
      metadata?: Record<string, any>
    }>
  ): Promise<{
    imported: number
    failed: number
    errors: Array<{
      relationship: number
      error: string
    }>
    warnings: string[]
  }> {
    return apiClient.post(`${this.baseUrl}/bulk-import`, { relationships })
  }

  // ===================== LINEAGE MONITORING =====================

  /**
   * Get lineage health status
   * Maps to: LineageService.get_lineage_health()
   */
  async getLineageHealth(assetId?: string): Promise<{
    overallHealth: 'healthy' | 'warning' | 'critical'
    healthScore: number
    metrics: {
      completeness: number
      accuracy: number
      freshness: number
      consistency: number
    }
    issues: Array<{
      type: string
      severity: string
      count: number
      description: string
    }>
    trends: Array<{
      date: string
      healthScore: number
      change: number
    }>
  }> {
    const params = new URLSearchParams()
    if (assetId) params.append('asset_id', assetId)
    
    return apiClient.get(`${this.baseUrl}/health?${params.toString()}`)
  }

  /**
   * Get lineage metrics
   * Maps to: AdvancedLineageService.calculate_lineage_metrics()
   */
  async getLineageMetrics(timeRange?: string): Promise<LineageMetrics> {
    const params = new URLSearchParams()
    if (timeRange) params.append('time_range', timeRange)
    
    return apiClient.get(`${this.baseUrl}/metrics?${params.toString()}`)
  }

  /**
   * Monitor lineage changes
   * Maps to: Real-time lineage monitoring
   */
  async getLineageChanges(
    assetId?: string,
    since?: string,
    changeTypes?: string[]
  ): Promise<{
    changes: Array<{
      id: string
      type: 'created' | 'updated' | 'deleted'
      assetId: string
      assetName: string
      changeDetails: Record<string, any>
      timestamp: string
      userId: string
      impact: string
    }>
    summary: {
      totalChanges: number
      byType: Record<string, number>
      impactLevel: Record<string, number>
    }
  }> {
    const params = new URLSearchParams()
    if (assetId) params.append('asset_id', assetId)
    if (since) params.append('since', since)
    if (changeTypes) params.append('change_types', changeTypes.join(','))
    
    return apiClient.get(`${this.baseUrl}/changes?${params.toString()}`)
  }

  // ===================== LINEAGE EXPORT AND INTEGRATION =====================

  /**
   * Export lineage data
   * Maps to: Lineage export services
   */
  async exportLineage(request: LineageExportRequest): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }
    
    return response.blob()
  }

  /**
   * Get lineage API for external systems
   * Maps to: API generation for lineage data
   */
  async getLineageAPI(assetId: string, format: 'graphql' | 'rest' | 'json'): Promise<{
    endpoint: string
    schema: string
    documentation: string
    examples: string[]
  }> {
    return apiClient.get(`${this.baseUrl}/api/${assetId}?format=${format}`)
  }

  /**
   * Sync lineage with external systems
   * Maps to: External system synchronization
   */
  async syncWithExternalSystem(
    systemId: string,
    syncOptions?: {
      bidirectional?: boolean
      includeMetadata?: boolean
      conflictResolution?: 'local' | 'remote' | 'merge'
    }
  ): Promise<{
    status: 'success' | 'partial' | 'failed'
    synchronized: number
    conflicts: number
    errors: string[]
    summary: {
      added: number
      updated: number
      deleted: number
    }
  }> {
    return apiClient.post(`${this.baseUrl}/sync/${systemId}`, syncOptions || {})
  }

  // ===================== REAL-TIME LINEAGE =====================

  /**
   * Subscribe to lineage updates
   * Maps to: WebSocket real-time lineage updates
   */
  subscribeToLineageUpdates(
    assetId: string,
    callback: (update: {
      type: 'relationship_added' | 'relationship_updated' | 'relationship_deleted' | 'asset_updated'
      data: any
      timestamp: string
    }) => void
  ): () => void {
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/subscribe/${assetId}`)
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      callback(update)
    }
    
    return () => {
      ws.close()
    }
  }

  /**
   * Get real-time lineage status
   * Maps to: Real-time lineage monitoring
   */
  async getRealTimeLineageStatus(assetIds: string[]): Promise<Record<string, {
    status: 'active' | 'stale' | 'error'
    lastUpdate: string
    issues: string[]
    metrics: {
      upstreamCount: number
      downstreamCount: number
      healthScore: number
    }
  }>> {
    return apiClient.post(`${this.baseUrl}/real-time/status`, { asset_ids: assetIds })
  }
}

// Create singleton instance
export const catalogLineageApiClient = new CatalogLineageApiClient()

// Export default
export default catalogLineageApiClient