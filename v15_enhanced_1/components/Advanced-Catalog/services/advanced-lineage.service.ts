// ============================================================================
// ADVANCED LINEAGE SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: advanced_lineage_service.py (1114 lines)
// Maps to: advanced_lineage_routes.py (998 lines)
// Maps to: data_lineage_models.py (447 lines)
// Column-level lineage tracking and advanced lineage management
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  EnterpriseDataLineage,
  DataLineageNode,
  DataLineageEdge,
  LineageVisualizationConfig,
  LineageMetrics,
  LineageImpactAnalysis,
  LineageQuery,
  CatalogApiResponse,
  PaginationRequest,
  LineageVisualization,
  LineageAnalysisResult,
  LineageRiskAssessment,
  LineageCostAnalysis,
  LineageBusinessImpact,
  LineageROIMetrics,
  LineageEfficiencyMetrics,
  LineageUsageStatistics,
  LineageHealthMetrics,
  LineageReliabilityMetrics,
  LineageAvailabilityMetrics,
  LineageScalabilityMetrics,
  LineagePerformanceMetrics,
  LineageQualityContext,
  LineageSecurityContext,
  LineageComplianceContext,
  LineageOperationalContext,
  LineageBusinessContext,
  LineageDataContext,
  LineageTechnicalContext,
  LineageGovernanceContext,
  LineageMetadata,
  LineageValidationResult,
  LineageOptimizationSuggestion,
  LineageComplianceStatus,
  LineageSecurityClassification,
  TimeRange,
  // Backend API Types
  LineageQueryRequest,
  ImpactAnalysisRequest,
  LineageUpdateRequest,
  LineageVisualizationRequest,
  LineageMetricsRequest,
  LineageSearchRequest,
  LineageGraphResponse,
  ImpactAnalysisResponse,
  LineageDirection,
  LineageType,
  TransformationType,
  LineageConfidence,
  ImpactSeverity,
  GraphAlgorithm,
  LineageUpdateType
} from '../types';
import { 
  ADVANCED_LINEAGE_ENDPOINTS, 
  API_CONFIG,
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// ============================================================================
// REQUEST TYPES FOR ADVANCED LINEAGE OPERATIONS
// ============================================================================

export interface ImpactAnalysisRequest {
  assetIds: string[];
  analysisType: 'IMPACT' | 'DEPENDENCY' | 'CHANGE' | 'RISK';
  includeMetrics?: boolean;
  timeRange?: TimeRange;
  depth?: number;
  includeDownstream?: boolean;
  includeUpstream?: boolean;
  includeCrossDomain?: boolean;
  changeType?: 'schema_change' | 'data_change' | 'process_change' | 'system_change';
  changeDetails?: Record<string, any>;
}

export interface RiskAssessmentRequest {
  assetIds: string[];
  riskFactors?: string[];
  assessmentType?: 'OPERATIONAL' | 'SECURITY' | 'COMPLIANCE' | 'BUSINESS';
  timeHorizon?: number; // days
  includeHistoricalData?: boolean;
  mitigationStrategy?: 'PROACTIVE' | 'REACTIVE' | 'PREVENTIVE';
}

export interface CostAnalysisRequest {
  assetIds: string[];
  analysisScope: 'DIRECT' | 'INDIRECT' | 'COMPREHENSIVE';
  currency?: string;
  timeHorizon?: number; // months
  includeOpportunityCost?: boolean;
  includeRiskCost?: boolean;
  costCategories?: string[];
}

export interface BusinessImpactRequest {
  assetIds: string[];
  businessProcesses?: string[];
  stakeholders?: string[];
  impactCategories?: string[];
  severityThreshold?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timeframe?: TimeRange;
}

export interface ROICalculationRequest {
  assetIds: string[];
  investmentAmount?: number;
  currency?: string;
  timeHorizon?: number; // months
  discountRate?: number;
  benefitCategories?: string[];
  costCategories?: string[];
}

// ============================================================================
// LINEAGE REQUEST INTERFACES
// ============================================================================

export interface CreateLineageRequest {
  sourceAssetId: string;
  targetAssetId: string;
  lineageType: 'COLUMN' | 'TABLE' | 'SCHEMA' | 'DATABASE';
  transformationLogic?: string;
  metadata?: Record<string, any>;
  columnMappings?: ColumnMapping[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  transformationType: 'DIRECT' | 'CALCULATED' | 'AGGREGATED' | 'DERIVED';
  transformationFunction?: string;
  confidence: number;
}

export interface LineageTrackingRequest {
  assetId: string;
  direction: 'UPSTREAM' | 'DOWNSTREAM' | 'BOTH';
  depth: number;
  includeColumns: boolean;
  includeTransformations: boolean;
  filterTypes?: string[];
}

export interface LineageAnalysisRequest {
  assetIds: string[];
  analysisType: 'IMPACT' | 'DEPENDENCY' | 'COVERAGE' | 'QUALITY';
  timeRange?: {
    start: Date;
    end: Date;
  };
  includeMetrics: boolean;
}

export interface LineageVisualizationRequest {
  assetId: string;
  config: LineageVisualizationConfig;
  direction: 'UPSTREAM' | 'DOWNSTREAM' | 'BOTH';
  maxDepth: number;
  includeLabels: boolean;
  layoutType: 'HIERARCHICAL' | 'FORCE_DIRECTED' | 'CIRCULAR' | 'TREE';
}

export interface LineageSearchRequest {
  query: string;
  searchType: 'ASSET_NAME' | 'COLUMN_NAME' | 'TRANSFORMATION' | 'METADATA';
  filters?: {
    assetTypes?: string[];
    lineageTypes?: string[];
    confidenceThreshold?: number;
  };
  pagination: PaginationRequest;
}

export interface BulkLineageUpdateRequest {
  lineageUpdates: LineageUpdate[];
  updateMode: 'INCREMENTAL' | 'REPLACE' | 'MERGE';
  validateBeforeUpdate: boolean;
}

export interface LineageUpdate {
  id?: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  lineageData: Partial<EnterpriseDataLineage>;
}

// ============================================================================
// ADVANCED LINEAGE SERVICE CLASS
// ============================================================================

export class AdvancedLineageService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // ============================================================================
  // LINEAGE MANAGEMENT
  // ============================================================================

  /**
   * Query lineage with advanced graph algorithms
   * Maps to: POST /api/v1/lineage/query
   */
  async queryLineage(request: LineageQueryRequest): Promise<CatalogApiResponse<LineageGraphResponse>> {
    const response = await axios.post<CatalogApiResponse<LineageGraphResponse>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.QUERY_LINEAGE),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Create new lineage relationship
   */
  async createLineage(request: CreateLineageRequest): Promise<CatalogApiResponse<EnterpriseDataLineage>> {
    const response = await axios.post<CatalogApiResponse<EnterpriseDataLineage>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.CREATE_LINEAGE),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get lineage by ID
   */
  async getLineage(lineageId: string): Promise<CatalogApiResponse<EnterpriseDataLineage>> {
    const response = await axios.get<CatalogApiResponse<EnterpriseDataLineage>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_LINEAGE, { lineageId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Update lineage relationship
   * Maps to: POST /api/v1/lineage/update
   */
  async updateLineage(request: LineageUpdateRequest): Promise<CatalogApiResponse<EnterpriseDataLineage>> {
    const response = await axios.post<CatalogApiResponse<EnterpriseDataLineage>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.UPDATE_LINEAGE),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Delete lineage relationship
   * Maps to: DELETE /api/v1/lineage/assets/{asset_id}
   */
  async deleteLineage(
    assetId: string,
    cascadeDelete: boolean = false,
    backupBeforeDelete: boolean = true
  ): Promise<CatalogApiResponse<void>> {
    const response = await axios.delete<CatalogApiResponse<void>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.DELETE_LINEAGE, { assetId }),
      { 
        params: { 
          cascade_delete: cascadeDelete,
          backup_before_delete: backupBeforeDelete
        },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Bulk update lineage relationships
   */
  async bulkUpdateLineage(request: BulkLineageUpdateRequest): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.post<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.BULK_UPDATE),
      request,
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE TRACKING & DISCOVERY
  // ============================================================================

  /**
   * Track lineage for an asset
   */
  async trackLineage(request: LineageTrackingRequest): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.post<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.TRACK_LINEAGE),
      request,
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Get upstream lineage
   */
  async getUpstreamLineage(
    assetId: string, 
    depth: number = 5,
    includeColumns: boolean = true
  ): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.get<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_UPSTREAM, { assetId }),
      { 
        params: { depth, includeColumns },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get downstream lineage
   */
  async getDownstreamLineage(
    assetId: string, 
    depth: number = 5,
    includeColumns: boolean = true
  ): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.get<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_DOWNSTREAM, { assetId }),
      { 
        params: { depth, includeColumns },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get column-level lineage
   */
  async getColumnLineage(
    assetId: string, 
    columnName: string
  ): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.get<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_COLUMN_LINEAGE, { assetId, columnName }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Discover automatic lineage
   * Maps to: POST /api/v1/lineage/discover
   */
  async discoverLineage(
    dataSourceIds: number[],
    discoveryConfig?: Record<string, any>
  ): Promise<CatalogApiResponse<{ discovery_id: string }>> {
    const response = await axios.post<CatalogApiResponse<{ discovery_id: string }>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.DISCOVER_LINEAGE),
      {
        data_source_ids: dataSourceIds,
        discovery_config: discoveryConfig || {}
      },
      { timeout: this.timeout * 3 }
    );
    return response.data;
  }

  /**
   * Get discovery status
   * Maps to: GET /api/v1/lineage/discover/{discovery_id}/status
   */
  async getDiscoveryStatus(discoveryId: string): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_DISCOVERY_STATUS, { discoveryId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Stream lineage updates
   * Maps to: GET /api/v1/lineage/assets/{asset_id}/lineage/stream
   */
  async streamLineageUpdates(
    assetId: string,
    includeDownstream: boolean = true,
    includeUpstream: boolean = true
  ): Promise<ReadableStream<any>> {
    const response = await axios.get(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.STREAM_LINEAGE_UPDATES, { assetId }),
      { 
        params: { 
          include_downstream: includeDownstream,
          include_upstream: includeUpstream
        },
        responseType: 'stream',
        timeout: this.timeout * 5
      }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE VISUALIZATION
  // ============================================================================

  /**
   * Generate lineage visualization
   * Maps to: POST /api/v1/lineage/visualization
   */
  async generateLineageVisualization(request: LineageVisualizationRequest): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GENERATE_VISUALIZATION),
      request,
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Get interactive lineage visualization
   * Maps to: GET /api/v1/lineage/visualization/interactive/{asset_id}
   */
  async getInteractiveLineageVisualization(
    assetId: string,
    depth: number = 3,
    theme: string = 'light'
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_INTERACTIVE_VISUALIZATION, { assetId }),
      { 
        params: { depth, theme },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get lineage graph data
   */
  async getLineageGraph(
    assetId: string,
    config: LineageVisualizationConfig
  ): Promise<CatalogApiResponse<{ nodes: DataLineageNode[]; edges: DataLineageEdge[] }>> {
    const response = await axios.post<CatalogApiResponse<{ nodes: DataLineageNode[]; edges: DataLineageEdge[] }>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_GRAPH, { assetId }),
      config,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Update visualization configuration
   */
  async updateVisualizationConfig(
    assetId: string,
    config: LineageVisualizationConfig
  ): Promise<CatalogApiResponse<LineageVisualizationConfig>> {
    const response = await axios.put<CatalogApiResponse<LineageVisualizationConfig>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.UPDATE_VIZ_CONFIG, { assetId }),
      config,
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // IMPACT ANALYSIS
  // ============================================================================

  /**
   * Perform impact analysis
   * Maps to: POST /api/v1/lineage/impact-analysis
   */
  async performImpactAnalysis(request: ImpactAnalysisRequest): Promise<CatalogApiResponse<ImpactAnalysisResponse>> {
    const response = await axios.post<CatalogApiResponse<ImpactAnalysisResponse>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.IMPACT_ANALYSIS),
      request,
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Get impact analysis by ID
   * Maps to: GET /api/v1/lineage/impact-analysis/{analysis_id}
   */
  async getImpactAnalysis(analysisId: string): Promise<CatalogApiResponse<ImpactAnalysisResponse>> {
    const response = await axios.get<CatalogApiResponse<ImpactAnalysisResponse>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_IMPACT_ANALYSIS, { analysisId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Batch impact analysis
   * Maps to: POST /api/v1/lineage/impact-analysis/batch
   */
  async batchImpactAnalysis(
    assetIds: string[],
    changeType: string,
    analysisConfig?: Record<string, any>
  ): Promise<CatalogApiResponse<ImpactAnalysisResponse[]>> {
    const response = await axios.post<CatalogApiResponse<ImpactAnalysisResponse[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.BATCH_IMPACT_ANALYSIS),
      {
        asset_ids: assetIds,
        change_type: changeType,
        analysis_config: analysisConfig || {}
      },
      { timeout: this.timeout * 3 }
    );
    return response.data;
  }

  /**
   * Get change impact analysis
   */
  async getChangeImpactAnalysis(
    assetId: string,
    changeType: 'SCHEMA_CHANGE' | 'DATA_CHANGE' | 'LOGIC_CHANGE' | 'DELETION'
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.CHANGE_IMPACT, { assetId }),
      { changeType },
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get dependency analysis
   */
  async getDependencyAnalysis(assetId: string): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.DEPENDENCY_ANALYSIS, { assetId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get lineage coverage analysis
   */
  async getLineageCoverageAnalysis(): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.COVERAGE_ANALYSIS),
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE SEARCH & QUERY
  // ============================================================================

  /**
   * Search lineage relationships
   * Maps to: POST /api/v1/lineage/search
   */
  async searchLineage(request: LineageSearchRequest): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.post<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.SEARCH_LINEAGE),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get search suggestions
   * Maps to: GET /api/v1/lineage/search/suggestions
   */
  async getSearchSuggestions(
    query: string,
    maxSuggestions: number = 10
  ): Promise<CatalogApiResponse<string[]>> {
    const response = await axios.get<CatalogApiResponse<string[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_SEARCH_SUGGESTIONS),
      { 
        params: { query, max_suggestions: maxSuggestions },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Execute lineage query
   */
  async executeLineageQuery(query: LineageQuery): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.EXECUTE_QUERY),
      query,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get asset dependencies
   * Maps to: GET /api/v1/lineage/assets/{asset_id}/dependencies
   */
  async getAssetDependencies(
    assetId: string,
    dependencyType: 'upstream' | 'downstream' | 'all' = 'all',
    includeIndirect: boolean = true,
    maxDepth: number = 5
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_DEPENDENCIES, { assetId }),
      { 
        params: { 
          dependency_type: dependencyType,
          include_indirect: includeIndirect,
          max_depth: maxDepth
        },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get lineage path between assets
   */
  async getLineagePath(
    sourceAssetId: string,
    targetAssetId: string
  ): Promise<CatalogApiResponse<EnterpriseDataLineage[]>> {
    const response = await axios.get<CatalogApiResponse<EnterpriseDataLineage[]>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_PATH),
      { 
        params: { sourceAssetId, targetAssetId },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE METRICS & ANALYTICS
  // ============================================================================

  /**
   * Get lineage metrics
   * Maps to: GET /api/v1/lineage/metrics
   */
  async getLineageMetrics(request: LineageMetricsRequest): Promise<CatalogApiResponse<LineageMetrics>> {
    const response = await axios.get<CatalogApiResponse<LineageMetrics>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_METRICS),
      { 
        params: request,
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get lineage coverage analytics
   * Maps to: GET /api/v1/lineage/analytics/coverage
   */
  async getLineageCoverageAnalytics(
    timeRange: string = '30d',
    includeRecommendations: boolean = true
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_COVERAGE_ANALYTICS),
      { 
        params: { 
          time_range: timeRange,
          include_recommendations: includeRecommendations
        },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get lineage performance analytics
   * Maps to: GET /api/v1/lineage/analytics/performance
   */
  async getLineagePerformanceAnalytics(
    timeWindow: string = '24h',
    includeBottlenecks: boolean = true
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_PERFORMANCE_ANALYTICS),
      { 
        params: { 
          time_window: timeWindow,
          include_bottlenecks: includeBottlenecks
        },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get lineage quality metrics
   */
  async getLineageQualityMetrics(): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.QUALITY_METRICS),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get lineage statistics
   */
  async getLineageStatistics(
    timeRange?: { start: Date; end: Date }
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_STATISTICS),
      { 
        params: timeRange,
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE VALIDATION & GOVERNANCE
  // ============================================================================

  /**
   * Validate lineage consistency
   */
  async validateLineageConsistency(assetId?: string): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.VALIDATE_CONSISTENCY),
      { assetId },
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Validate lineage completeness
   */
  async validateLineageCompleteness(assetId: string): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.VALIDATE_COMPLETENESS, { assetId }),
      {},
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get lineage governance policies
   */
  async getLineageGovernancePolicies(): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GOVERNANCE_POLICIES),
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // LINEAGE EXPORT & REPORTING
  // ============================================================================

  /**
   * Export lineage data
   */
  async exportLineageData(
    assetId: string,
    format: 'JSON' | 'CSV' | 'GRAPHML' | 'DOT',
    includeColumns: boolean = true
  ): Promise<Blob> {
    const response = await axios.get(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.EXPORT_LINEAGE, { assetId }),
      { 
        params: { format, includeColumns },
        responseType: 'blob',
        timeout: this.timeout * 2
      }
    );
    return response.data;
  }

  /**
   * Generate lineage report
   */
  async generateLineageReport(
    assetId: string,
    reportType: 'SUMMARY' | 'DETAILED' | 'IMPACT' | 'COMPLIANCE'
  ): Promise<CatalogApiResponse<string>> {
    const response = await axios.post<CatalogApiResponse<string>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GENERATE_REPORT, { assetId }),
      { reportType },
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Schedule lineage tracking job
   */
  async scheduleLineageTracking(
    assetId: string,
    schedule: {
      frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
      cronExpression?: string;
    }
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.SCHEDULE_TRACKING, { assetId }),
      schedule,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get change requests for impact analysis
   */
  async getChangeRequests(): Promise<any[]> {
    try {
      const response = await axios.get<CatalogApiResponse<any[]>>(
        buildUrl(this.baseURL, '/change-requests'),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch change requests:', error);
      return [];
    }
  }

  /**
   * Get predictive models for impact analysis
   */
  async getPredictiveModels(): Promise<any[]> {
    try {
      const response = await axios.get<CatalogApiResponse<any[]>>(
        buildUrl(this.baseURL, '/predictive-models'),
        { timeout: this.timeout }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch predictive models:', error);
      return [];
    }
  }

  /**
   * Get lineage by ID
   */
  async getLineageById(lineageId: string): Promise<any> {
    try {
      const response = await axios.get<CatalogApiResponse<any>>(
        buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.GET_LINEAGE, { assetId: lineageId }),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch lineage by ID:', error);
      return null;
    }
  }

  /**
   * Update lineage
   */
  async updateLineage(id: string, updates: any): Promise<any> {
    try {
      const response = await axios.put<CatalogApiResponse<any>>(
        buildUrl(this.baseURL, `/lineage/${id}`),
        updates,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update lineage:', error);
      throw error;
    }
  }

  /**
   * Delete lineage
   */
  async deleteLineage(id: string): Promise<void> {
    try {
      await axios.delete(
        buildUrl(this.baseURL, `/lineage/${id}`),
        { timeout: this.timeout }
      );
    } catch (error) {
      console.error('Failed to delete lineage:', error);
      throw error;
    }
  }

  /**
   * Validate lineage
   */
  async validateLineage(lineageId: string): Promise<any> {
    try {
      const response = await axios.post<CatalogApiResponse<any>>(
        buildUrl(this.baseURL, `/lineage/${lineageId}/validate`),
        {},
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to validate lineage:', error);
      throw error;
    }
  }

  /**
   * Get lineage metrics
   */
  async getLineageMetrics(lineageId: string): Promise<any> {
    try {
      const response = await axios.get<CatalogApiResponse<any>>(
        buildUrl(this.baseURL, `/lineage/${lineageId}/metrics`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch lineage metrics:', error);
      return null;
    }
  }

  /**
   * Perform comprehensive impact analysis
   */
  async performImpactAnalysis(request: ImpactAnalysisRequest): Promise<LineageImpactAnalysis> {
    try {
      const response = await axios.post<CatalogApiResponse<LineageImpactAnalysis>>(
        buildUrl(this.baseURL, '/lineage/impact-analysis'),
        request,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to perform impact analysis:', error);
      throw error;
    }
  }

  /**
   * Assess lineage risks
   */
  async assessLineageRisk(request: RiskAssessmentRequest): Promise<LineageRiskAssessment> {
    try {
      const response = await axios.post<CatalogApiResponse<LineageRiskAssessment>>(
        buildUrl(this.baseURL, '/lineage/risk-assessment'),
        request,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to assess lineage risk:', error);
      throw error;
    }
  }

  /**
   * Analyze lineage costs
   */
  async analyzeLineageCost(request: CostAnalysisRequest): Promise<LineageCostAnalysis> {
    try {
      const response = await axios.post<CatalogApiResponse<LineageCostAnalysis>>(
        buildUrl(this.baseURL, '/lineage/cost-analysis'),
        request,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to analyze lineage cost:', error);
      throw error;
    }
  }

  /**
   * Generate business impact assessment
   */
  async generateBusinessImpact(request: BusinessImpactRequest): Promise<LineageBusinessImpact> {
    try {
      const response = await axios.post<CatalogApiResponse<LineageBusinessImpact>>(
        buildUrl(this.baseURL, '/lineage/business-impact'),
        request,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to generate business impact assessment:', error);
      throw error;
    }
  }

  /**
   * Calculate ROI metrics for lineage changes
   */
  async calculateROIMetrics(request: ROICalculationRequest): Promise<LineageROIMetrics> {
    try {
      const response = await axios.post<CatalogApiResponse<LineageROIMetrics>>(
        buildUrl(this.baseURL, '/lineage/roi-metrics'),
        request,
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to calculate ROI metrics:', error);
      throw error;
    }
  }

  /**
   * Get efficiency metrics
   */
  async getEfficiencyMetrics(assetId: string, timeRange?: TimeRange): Promise<LineageEfficiencyMetrics> {
    try {
      const params = timeRange ? { 
        start: timeRange.start.toISOString(), 
        end: timeRange.end.toISOString() 
      } : {};
      
      const response = await axios.get<CatalogApiResponse<LineageEfficiencyMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/efficiency-metrics`),
        { 
          params,
          timeout: this.timeout 
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get efficiency metrics:', error);
      throw error;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStatistics(assetId: string, timeRange?: TimeRange): Promise<LineageUsageStatistics> {
    try {
      const params = timeRange ? { 
        start: timeRange.start.toISOString(), 
        end: timeRange.end.toISOString() 
      } : {};
      
      const response = await axios.get<CatalogApiResponse<LineageUsageStatistics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/usage-statistics`),
        { 
          params,
          timeout: this.timeout 
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get usage statistics:', error);
      throw error;
    }
  }

  /**
   * Get health metrics
   */
  async getHealthMetrics(assetId: string): Promise<LineageHealthMetrics> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageHealthMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/health-metrics`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get health metrics:', error);
      throw error;
    }
  }

  /**
   * Get reliability metrics
   */
  async getReliabilityMetrics(assetId: string, timeRange?: TimeRange): Promise<LineageReliabilityMetrics> {
    try {
      const params = timeRange ? { 
        start: timeRange.start.toISOString(), 
        end: timeRange.end.toISOString() 
      } : {};
      
      const response = await axios.get<CatalogApiResponse<LineageReliabilityMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/reliability-metrics`),
        { 
          params,
          timeout: this.timeout 
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get reliability metrics:', error);
      throw error;
    }
  }

  /**
   * Get availability metrics
   */
  async getAvailabilityMetrics(assetId: string, timeRange?: TimeRange): Promise<LineageAvailabilityMetrics> {
    try {
      const params = timeRange ? { 
        start: timeRange.start.toISOString(), 
        end: timeRange.end.toISOString() 
      } : {};
      
      const response = await axios.get<CatalogApiResponse<LineageAvailabilityMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/availability-metrics`),
        { 
          params,
          timeout: this.timeout 
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get availability metrics:', error);
      throw error;
    }
  }

  /**
   * Get scalability metrics
   */
  async getScalabilityMetrics(assetId: string): Promise<LineageScalabilityMetrics> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageScalabilityMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/scalability-metrics`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get scalability metrics:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(assetId: string, timeRange?: TimeRange): Promise<LineagePerformanceMetrics> {
    try {
      const params = timeRange ? { 
        start: timeRange.start.toISOString(), 
        end: timeRange.end.toISOString() 
      } : {};
      
      const response = await axios.get<CatalogApiResponse<LineagePerformanceMetrics>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/performance-metrics`),
        { 
          params,
          timeout: this.timeout 
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get quality context
   */
  async getQualityContext(assetId: string): Promise<LineageQualityContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageQualityContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/quality-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get quality context:', error);
      throw error;
    }
  }

  /**
   * Get security context
   */
  async getSecurityContext(assetId: string): Promise<LineageSecurityContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageSecurityContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/security-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get security context:', error);
      throw error;
    }
  }

  /**
   * Get compliance context
   */
  async getComplianceContext(assetId: string): Promise<LineageComplianceContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageComplianceContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/compliance-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get compliance context:', error);
      throw error;
    }
  }

  /**
   * Get operational context
   */
  async getOperationalContext(assetId: string): Promise<LineageOperationalContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageOperationalContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/operational-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get operational context:', error);
      throw error;
    }
  }

  /**
   * Get business context
   */
  async getBusinessContext(assetId: string): Promise<LineageBusinessContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageBusinessContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/business-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get business context:', error);
      throw error;
    }
  }

  /**
   * Get data context
   */
  async getDataContext(assetId: string): Promise<LineageDataContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageDataContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/data-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get data context:', error);
      throw error;
    }
  }

  /**
   * Get technical context
   */
  async getTechnicalContext(assetId: string): Promise<LineageTechnicalContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageTechnicalContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/technical-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get technical context:', error);
      throw error;
    }
  }

  /**
   * Get governance context
   */
  async getGovernanceContext(assetId: string): Promise<LineageGovernanceContext> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageGovernanceContext>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/governance-context`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get governance context:', error);
      throw error;
    }
  }

  /**
   * Get optimization suggestions
   */
  async getOptimizationSuggestions(assetId: string): Promise<LineageOptimizationSuggestion[]> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageOptimizationSuggestion[]>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/optimization-suggestions`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get optimization suggestions:', error);
      return [];
    }
  }

  /**
   * Get compliance status
   */
  async getComplianceStatus(assetId: string): Promise<LineageComplianceStatus> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageComplianceStatus>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/compliance-status`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get compliance status:', error);
      throw error;
    }
  }

  /**
   * Get security classification
   */
  async getSecurityClassification(assetId: string): Promise<LineageSecurityClassification> {
    try {
      const response = await axios.get<CatalogApiResponse<LineageSecurityClassification>>(
        buildUrl(this.baseURL, `/lineage/${assetId}/security-classification`),
        { timeout: this.timeout }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get security classification:', error);
      throw error;
    }
  }

  /**
   * Health check for lineage service
   * Maps to: GET /api/v1/lineage/health
   */
  async healthCheck(): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, ADVANCED_LINEAGE_ENDPOINTS.HEALTH_CHECK),
      { timeout: this.timeout }
    );
    return response.data;
  }
}

// Create and export singleton instance
export const advancedLineageService = new AdvancedLineageService();
export default advancedLineageService;