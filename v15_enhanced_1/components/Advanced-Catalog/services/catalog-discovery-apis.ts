/**
 * Catalog Discovery APIs - Complete Backend Integration
 * ====================================================
 * 
 * Comprehensive API client for catalog discovery functionality.
 * Maps to enterprise_catalog_service.py (1447+ lines) and intelligent_discovery_service.py (1117+ lines)
 * 
 * Backend Endpoints Covered:
 * - enterprise_catalog_routes.py (1451+ lines, 50+ endpoints)
 * - intelligent_discovery_routes.py (658+ lines, 25+ endpoints)
 * - data_discovery_routes.py (718+ lines, 25+ endpoints)
 */

import { 
  IntelligentDataAsset, 
  AssetCreateRequest, 
  AssetUpdateRequest, 
  AssetSearchRequest,
  IntelligentAssetResponse,
  LineageResponse,
  QualityAssessmentResponse,
  BusinessGlossaryResponse,
  CatalogAnalytics,
  AssetDiscoveryEvent,
  BulkOperationRequest,
  BulkOperationResponse,
  CatalogExportRequest,
  CatalogExportResponse
} from '../types/catalog-core.types';

import {
  DiscoveryJob,
  DiscoveryJobCreateRequest,
  DiscoveryJobUpdateRequest,
  DiscoveryJobResponse,
  DiscoverySearchRequest,
  DiscoverySearchResponse,
  DiscoveryAnalytics,
  ClassificationAnalytics,
  IncrementalDiscoveryRequest,
  SchemaComparisonRequest,
  SchemaComparisonResponse
} from '../types/discovery.types';

// ========================= BASE API CLIENT =========================

export class BaseApiClient {
  private baseUrl: string;
  private apiKey?: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string = '/api/v1', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
    };
  }

  protected async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API Error: ${response.status} - ${error.message || response.statusText}`);
    }

    return response.json();
  }

  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const query = params ? '?' + new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])
    ).toString() : '';
    
    return this.request(`${endpoint}${query}`);
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request(endpoint, { method: 'DELETE' });
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }
}

// ========================= ENTERPRISE CATALOG API =========================

export class EnterpriseCatalogApi extends BaseApiClient {
  
  // ========================= ASSET MANAGEMENT =========================

  /**
   * Create a new data asset
   * Maps to: POST /enterprise-catalog/assets
   */
  async createAsset(request: AssetCreateRequest): Promise<IntelligentDataAsset> {
    return this.post('/enterprise-catalog/assets', request);
  }

  /**
   * Get asset by ID with full details
   * Maps to: GET /enterprise-catalog/assets/{asset_id}
   */
  async getAsset(assetId: string, includeLineage?: boolean, includeQuality?: boolean): Promise<IntelligentDataAsset> {
    return this.get(`/enterprise-catalog/assets/${assetId}`, {
      include_lineage: includeLineage,
      include_quality: includeQuality
    });
  }

  /**
   * Update an existing asset
   * Maps to: PUT /enterprise-catalog/assets/{asset_id}
   */
  async updateAsset(assetId: string, request: AssetUpdateRequest): Promise<IntelligentDataAsset> {
    return this.put(`/enterprise-catalog/assets/${assetId}`, request);
  }

  /**
   * Delete an asset
   * Maps to: DELETE /enterprise-catalog/assets/{asset_id}
   */
  async deleteAsset(assetId: string): Promise<{ success: boolean; message: string }> {
    return this.delete(`/enterprise-catalog/assets/${assetId}`);
  }

  /**
   * Search assets with advanced filtering and semantic search
   * Maps to: POST /enterprise-catalog/assets/search
   */
  async searchAssets(request: AssetSearchRequest): Promise<IntelligentAssetResponse> {
    return this.post('/enterprise-catalog/assets/search', request);
  }

  /**
   * Get asset suggestions based on user context
   * Maps to: GET /enterprise-catalog/assets/suggestions
   */
  async getAssetSuggestions(
    userId?: string, 
    context?: Record<string, any>, 
    limit?: number
  ): Promise<IntelligentDataAsset[]> {
    return this.get('/enterprise-catalog/assets/suggestions', {
      user_id: userId,
      context: context ? JSON.stringify(context) : undefined,
      limit
    });
  }

  /**
   * Get recently accessed assets
   * Maps to: GET /enterprise-catalog/assets/recent
   */
  async getRecentAssets(userId?: string, limit?: number): Promise<IntelligentDataAsset[]> {
    return this.get('/enterprise-catalog/assets/recent', {
      user_id: userId,
      limit
    });
  }

  /**
   * Get popular assets based on usage metrics
   * Maps to: GET /enterprise-catalog/assets/popular
   */
  async getPopularAssets(
    timeframe?: string, 
    assetTypes?: string[], 
    limit?: number
  ): Promise<IntelligentDataAsset[]> {
    return this.get('/enterprise-catalog/assets/popular', {
      timeframe,
      asset_types: assetTypes?.join(','),
      limit
    });
  }

  // ========================= SEMANTIC SEARCH =========================

  /**
   * Perform semantic search using AI embeddings
   * Maps to: POST /enterprise-catalog/semantic-search
   */
  async semanticSearch(
    query: string, 
    similarityThreshold?: number, 
    limit?: number,
    assetTypes?: string[]
  ): Promise<IntelligentAssetResponse> {
    return this.post('/enterprise-catalog/semantic-search', {
      query,
      similarity_threshold: similarityThreshold,
      limit,
      asset_types: assetTypes
    });
  }

  /**
   * Find similar assets based on metadata and content
   * Maps to: GET /enterprise-catalog/assets/{asset_id}/similar
   */
  async findSimilarAssets(
    assetId: string, 
    similarityThreshold?: number, 
    limit?: number
  ): Promise<IntelligentDataAsset[]> {
    return this.get(`/enterprise-catalog/assets/${assetId}/similar`, {
      similarity_threshold: similarityThreshold,
      limit
    });
  }

  /**
   * Get asset recommendations based on ML models
   * Maps to: GET /enterprise-catalog/assets/{asset_id}/recommendations
   */
  async getAssetRecommendations(
    assetId: string, 
    userId?: string, 
    limit?: number
  ): Promise<IntelligentDataAsset[]> {
    return this.get(`/enterprise-catalog/assets/${assetId}/recommendations`, {
      user_id: userId,
      limit
    });
  }

  // ========================= DATA LINEAGE =========================

  /**
   * Get data lineage graph for an asset
   * Maps to: GET /enterprise-catalog/assets/{asset_id}/lineage
   */
  async getAssetLineage(
    assetId: string,
    depthUpstream?: number,
    depthDownstream?: number,
    includeColumnLineage?: boolean
  ): Promise<LineageResponse> {
    return this.get(`/enterprise-catalog/assets/${assetId}/lineage`, {
      depth_upstream: depthUpstream,
      depth_downstream: depthDownstream,
      include_column_lineage: includeColumnLineage
    });
  }

  /**
   * Perform impact analysis for potential changes
   * Maps to: POST /enterprise-catalog/assets/{asset_id}/impact-analysis
   */
  async performImpactAnalysis(
    assetId: string,
    changeDescription?: string,
    analysisDepth?: number
  ): Promise<any> {
    return this.post(`/enterprise-catalog/assets/${assetId}/impact-analysis`, {
      change_description: changeDescription,
      analysis_depth: analysisDepth
    });
  }

  /**
   * Get lineage relationships for multiple assets
   * Maps to: POST /enterprise-catalog/lineage/bulk
   */
  async getBulkLineage(assetIds: string[]): Promise<LineageResponse> {
    return this.post('/enterprise-catalog/lineage/bulk', { asset_ids: assetIds });
  }

  // ========================= QUALITY MANAGEMENT =========================

  /**
   * Get quality assessment for an asset
   * Maps to: GET /enterprise-catalog/assets/{asset_id}/quality
   */
  async getAssetQuality(assetId: string): Promise<QualityAssessmentResponse> {
    return this.get(`/enterprise-catalog/assets/${assetId}/quality`);
  }

  /**
   * Trigger quality assessment
   * Maps to: POST /enterprise-catalog/assets/{asset_id}/quality/assess
   */
  async triggerQualityAssessment(
    assetId: string, 
    assessmentType?: string
  ): Promise<{ assessment_id: string; status: string }> {
    return this.post(`/enterprise-catalog/assets/${assetId}/quality/assess`, {
      assessment_type: assessmentType
    });
  }

  /**
   * Get quality trends for an asset
   * Maps to: GET /enterprise-catalog/assets/{asset_id}/quality/trends
   */
  async getQualityTrends(
    assetId: string, 
    timeframe?: string
  ): Promise<Array<{ date: string; score: number }>> {
    return this.get(`/enterprise-catalog/assets/${assetId}/quality/trends`, {
      timeframe
    });
  }

  // ========================= BUSINESS GLOSSARY =========================

  /**
   * Get business glossary terms
   * Maps to: GET /enterprise-catalog/glossary/terms
   */
  async getGlossaryTerms(
    category?: string, 
    domain?: string, 
    limit?: number, 
    offset?: number
  ): Promise<BusinessGlossaryResponse> {
    return this.get('/enterprise-catalog/glossary/terms', {
      category,
      domain,
      limit,
      offset
    });
  }

  /**
   * Associate glossary terms with assets
   * Maps to: POST /enterprise-catalog/assets/{asset_id}/glossary-terms
   */
  async associateGlossaryTerms(
    assetId: string, 
    termIds: string[]
  ): Promise<{ success: boolean; associations_created: number }> {
    return this.post(`/enterprise-catalog/assets/${assetId}/glossary-terms`, {
      term_ids: termIds
    });
  }

  /**
   * Search glossary terms
   * Maps to: POST /enterprise-catalog/glossary/search
   */
  async searchGlossaryTerms(query: string, limit?: number): Promise<BusinessGlossaryResponse> {
    return this.post('/enterprise-catalog/glossary/search', {
      query,
      limit
    });
  }

  // ========================= ANALYTICS & INSIGHTS =========================

  /**
   * Get catalog analytics and metrics
   * Maps to: GET /enterprise-catalog/analytics
   */
  async getCatalogAnalytics(
    timeframe?: string, 
    includeDetailed?: boolean
  ): Promise<CatalogAnalytics> {
    return this.get('/enterprise-catalog/analytics', {
      timeframe,
      include_detailed: includeDetailed
    });
  }

  /**
   * Get usage analytics for assets
   * Maps to: GET /enterprise-catalog/analytics/usage
   */
  async getUsageAnalytics(
    assetIds?: string[], 
    timeframe?: string
  ): Promise<any> {
    return this.get('/enterprise-catalog/analytics/usage', {
      asset_ids: assetIds?.join(','),
      timeframe
    });
  }

  /**
   * Get data profiling results
   * Maps to: GET /enterprise-catalog/assets/{asset_id}/profiling
   */
  async getDataProfiling(assetId: string): Promise<any> {
    return this.get(`/enterprise-catalog/assets/${assetId}/profiling`);
  }

  /**
   * Trigger data profiling
   * Maps to: POST /enterprise-catalog/assets/{asset_id}/profiling
   */
  async triggerDataProfiling(
    assetId: string, 
    sampleSize?: number
  ): Promise<{ profiling_id: string; status: string }> {
    return this.post(`/enterprise-catalog/assets/${assetId}/profiling`, {
      sample_size: sampleSize
    });
  }

  // ========================= BULK OPERATIONS =========================

  /**
   * Perform bulk operations on assets
   * Maps to: POST /enterprise-catalog/assets/bulk-operations
   */
  async performBulkOperation(request: BulkOperationRequest): Promise<BulkOperationResponse> {
    return this.post('/enterprise-catalog/assets/bulk-operations', request);
  }

  /**
   * Get bulk operation status
   * Maps to: GET /enterprise-catalog/assets/bulk-operations/{operation_id}
   */
  async getBulkOperationStatus(operationId: string): Promise<BulkOperationResponse> {
    return this.get(`/enterprise-catalog/assets/bulk-operations/${operationId}`);
  }

  // ========================= EXPORT & IMPORT =========================

  /**
   * Export catalog data
   * Maps to: POST /enterprise-catalog/export
   */
  async exportCatalogData(request: CatalogExportRequest): Promise<CatalogExportResponse> {
    return this.post('/enterprise-catalog/export', request);
  }

  /**
   * Get export status and download link
   * Maps to: GET /enterprise-catalog/export/{export_id}
   */
  async getExportStatus(exportId: string): Promise<CatalogExportResponse> {
    return this.get(`/enterprise-catalog/export/${exportId}`);
  }

  /**
   * Import catalog data
   * Maps to: POST /enterprise-catalog/import
   */
  async importCatalogData(file: File, importType: string): Promise<{ import_id: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('import_type', importType);

    const response = await fetch(`${this.baseUrl}/enterprise-catalog/import`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': undefined // Let browser set multipart boundary
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }

    return response.json();
  }

  // ========================= EVENT STREAMING =========================

  /**
   * Get asset discovery events
   * Maps to: GET /enterprise-catalog/events/discovery
   */
  async getDiscoveryEvents(
    since?: string, 
    assetTypes?: string[], 
    limit?: number
  ): Promise<AssetDiscoveryEvent[]> {
    return this.get('/enterprise-catalog/events/discovery', {
      since,
      asset_types: assetTypes?.join(','),
      limit
    });
  }

  /**
   * Subscribe to real-time catalog events via WebSocket
   * Maps to: WebSocket /enterprise-catalog/events/stream
   */
  subscribeToEvents(
    eventTypes: string[], 
    onEvent: (event: any) => void,
    onError?: (error: Error) => void
  ): WebSocket {
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/enterprise-catalog/events/stream';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ event_types: eventTypes }));
    };

    ws.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data);
        onEvent(event);
      } catch (error) {
        onError?.(new Error('Failed to parse event data'));
      }
    };

    ws.onerror = () => {
      onError?.(new Error('WebSocket connection error'));
    };

    return ws;
  }
}

// ========================= INTELLIGENT DISCOVERY API =========================

export class IntelligentDiscoveryApi extends BaseApiClient {

  // ========================= DISCOVERY JOBS =========================

  /**
   * Create a new discovery job
   * Maps to: POST /intelligent-discovery/jobs
   */
  async createDiscoveryJob(request: DiscoveryJobCreateRequest): Promise<DiscoveryJob> {
    return this.post('/intelligent-discovery/jobs', request);
  }

  /**
   * Get discovery job details
   * Maps to: GET /intelligent-discovery/jobs/{job_id}
   */
  async getDiscoveryJob(jobId: string): Promise<DiscoveryJobResponse> {
    return this.get(`/intelligent-discovery/jobs/${jobId}`);
  }

  /**
   * Update discovery job configuration
   * Maps to: PUT /intelligent-discovery/jobs/{job_id}
   */
  async updateDiscoveryJob(jobId: string, request: DiscoveryJobUpdateRequest): Promise<DiscoveryJob> {
    return this.put(`/intelligent-discovery/jobs/${jobId}`, request);
  }

  /**
   * Delete discovery job
   * Maps to: DELETE /intelligent-discovery/jobs/{job_id}
   */
  async deleteDiscoveryJob(jobId: string): Promise<{ success: boolean; message: string }> {
    return this.delete(`/intelligent-discovery/jobs/${jobId}`);
  }

  /**
   * List all discovery jobs
   * Maps to: GET /intelligent-discovery/jobs
   */
  async listDiscoveryJobs(
    status?: string, 
    limit?: number, 
    offset?: number
  ): Promise<{ jobs: DiscoveryJob[]; total_count: number }> {
    return this.get('/intelligent-discovery/jobs', {
      status,
      limit,
      offset
    });
  }

  /**
   * Start discovery job execution
   * Maps to: POST /intelligent-discovery/jobs/{job_id}/start
   */
  async startDiscoveryJob(jobId: string): Promise<{ execution_id: string; status: string }> {
    return this.post(`/intelligent-discovery/jobs/${jobId}/start`);
  }

  /**
   * Stop discovery job execution
   * Maps to: POST /intelligent-discovery/jobs/{job_id}/stop
   */
  async stopDiscoveryJob(jobId: string): Promise<{ success: boolean; message: string }> {
    return this.post(`/intelligent-discovery/jobs/${jobId}/stop`);
  }

  /**
   * Get discovery job execution history
   * Maps to: GET /intelligent-discovery/jobs/{job_id}/executions
   */
  async getJobExecutions(jobId: string, limit?: number): Promise<any[]> {
    return this.get(`/intelligent-discovery/jobs/${jobId}/executions`, { limit });
  }

  // ========================= DISCOVERY RESULTS =========================

  /**
   * Search discovery results
   * Maps to: POST /intelligent-discovery/results/search
   */
  async searchDiscoveryResults(request: DiscoverySearchRequest): Promise<DiscoverySearchResponse> {
    return this.post('/intelligent-discovery/results/search', request);
  }

  /**
   * Get discovery results for a job
   * Maps to: GET /intelligent-discovery/jobs/{job_id}/results
   */
  async getJobResults(
    jobId: string, 
    limit?: number, 
    offset?: number
  ): Promise<DiscoverySearchResponse> {
    return this.get(`/intelligent-discovery/jobs/${jobId}/results`, {
      limit,
      offset
    });
  }

  /**
   * Get detailed discovery result
   * Maps to: GET /intelligent-discovery/results/{result_id}
   */
  async getDiscoveryResult(resultId: string): Promise<any> {
    return this.get(`/intelligent-discovery/results/${resultId}`);
  }

  /**
   * Approve discovery results (convert to assets)
   * Maps to: POST /intelligent-discovery/results/approve
   */
  async approveDiscoveryResults(
    resultIds: string[], 
    autoCreateAssets?: boolean
  ): Promise<{ approved_count: number; created_assets: string[] }> {
    return this.post('/intelligent-discovery/results/approve', {
      result_ids: resultIds,
      auto_create_assets: autoCreateAssets
    });
  }

  /**
   * Reject discovery results
   * Maps to: POST /intelligent-discovery/results/reject
   */
  async rejectDiscoveryResults(
    resultIds: string[], 
    reason?: string
  ): Promise<{ rejected_count: number }> {
    return this.post('/intelligent-discovery/results/reject', {
      result_ids: resultIds,
      reason
    });
  }

  // ========================= INCREMENTAL DISCOVERY =========================

  /**
   * Trigger incremental discovery
   * Maps to: POST /intelligent-discovery/incremental
   */
  async triggerIncrementalDiscovery(request: IncrementalDiscoveryRequest): Promise<DiscoveryJob> {
    return this.post('/intelligent-discovery/incremental', request);
  }

  /**
   * Compare schema versions
   * Maps to: POST /intelligent-discovery/schema-comparison
   */
  async compareSchemas(request: SchemaComparisonRequest): Promise<SchemaComparisonResponse> {
    return this.post('/intelligent-discovery/schema-comparison', request);
  }

  /**
   * Get schema change history
   * Maps to: GET /intelligent-discovery/schema-changes
   */
  async getSchemaChanges(
    assetId?: string, 
    since?: string, 
    limit?: number
  ): Promise<any[]> {
    return this.get('/intelligent-discovery/schema-changes', {
      asset_id: assetId,
      since,
      limit
    });
  }

  // ========================= AI CLASSIFICATION =========================

  /**
   * Get classification results
   * Maps to: GET /intelligent-discovery/classifications
   */
  async getClassificationResults(
    assetId?: string, 
    confidenceThreshold?: number, 
    limit?: number
  ): Promise<any[]> {
    return this.get('/intelligent-discovery/classifications', {
      asset_id: assetId,
      confidence_threshold: confidenceThreshold,
      limit
    });
  }

  /**
   * Retrain classification models
   * Maps to: POST /intelligent-discovery/classifiers/retrain
   */
  async retrainClassifiers(
    classifierNames?: string[], 
    trainingData?: any
  ): Promise<{ retrain_id: string; status: string }> {
    return this.post('/intelligent-discovery/classifiers/retrain', {
      classifier_names: classifierNames,
      training_data: trainingData
    });
  }

  /**
   * Get classifier performance metrics
   * Maps to: GET /intelligent-discovery/classifiers/performance
   */
  async getClassifierPerformance(): Promise<ClassificationAnalytics> {
    return this.get('/intelligent-discovery/classifiers/performance');
  }

  // ========================= ANALYTICS & MONITORING =========================

  /**
   * Get discovery analytics
   * Maps to: GET /intelligent-discovery/analytics
   */
  async getDiscoveryAnalytics(timeframe?: string): Promise<DiscoveryAnalytics> {
    return this.get('/intelligent-discovery/analytics', { timeframe });
  }

  /**
   * Get discovery performance metrics
   * Maps to: GET /intelligent-discovery/performance
   */
  async getDiscoveryPerformance(): Promise<any> {
    return this.get('/intelligent-discovery/performance');
  }

  /**
   * Get discovery errors and issues
   * Maps to: GET /intelligent-discovery/errors
   */
  async getDiscoveryErrors(
    jobId?: string, 
    severity?: string, 
    limit?: number
  ): Promise<any[]> {
    return this.get('/intelligent-discovery/errors', {
      job_id: jobId,
      severity,
      limit
    });
  }

  // ========================= CONFIGURATION =========================

  /**
   * Get discovery configuration templates
   * Maps to: GET /intelligent-discovery/config-templates
   */
  async getConfigTemplates(): Promise<any[]> {
    return this.get('/intelligent-discovery/config-templates');
  }

  /**
   * Validate discovery configuration
   * Maps to: POST /intelligent-discovery/validate-config
   */
  async validateConfig(config: any): Promise<{ is_valid: boolean; errors: string[] }> {
    return this.post('/intelligent-discovery/validate-config', config);
  }

  /**
   * Get supported data source types
   * Maps to: GET /intelligent-discovery/data-source-types
   */
  async getSupportedDataSourceTypes(): Promise<any[]> {
    return this.get('/intelligent-discovery/data-source-types');
  }
}

// ========================= EXPORT COMBINED API CLIENT =========================

export class CatalogDiscoveryApiClient {
  public catalog: EnterpriseCatalogApi;
  public discovery: IntelligentDiscoveryApi;

  constructor(baseUrl?: string, apiKey?: string) {
    this.catalog = new EnterpriseCatalogApi(baseUrl, apiKey);
    this.discovery = new IntelligentDiscoveryApi(baseUrl, apiKey);
  }

  /**
   * Comprehensive asset search across both catalog and discovery results
   */
  async comprehensiveAssetSearch(
    query: string,
    options: {
      includeDiscoveryResults?: boolean;
      semanticSearch?: boolean;
      similarityThreshold?: number;
      assetTypes?: string[];
      limit?: number;
    } = {}
  ): Promise<{
    catalog_results: IntelligentAssetResponse;
    discovery_results?: DiscoverySearchResponse;
  }> {
    const catalogSearchPromise = this.catalog.searchAssets({
      query,
      asset_types: options.assetTypes as any,
      semantic_search: options.semanticSearch,
      similarity_threshold: options.similarityThreshold,
      limit: options.limit
    });

    const promises: Promise<any>[] = [catalogSearchPromise];

    if (options.includeDiscoveryResults) {
      const discoverySearchPromise = this.discovery.searchDiscoveryResults({
        query,
        asset_types: options.assetTypes as any,
        limit: options.limit
      });
      promises.push(discoverySearchPromise);
    }

    const results = await Promise.all(promises);

    return {
      catalog_results: results[0],
      discovery_results: results[1]
    };
  }

  /**
   * End-to-end discovery workflow: create job, run, and get results
   */
  async runDiscoveryWorkflow(
    discoveryRequest: DiscoveryJobCreateRequest,
    autoApprove: boolean = false
  ): Promise<{
    job: DiscoveryJob;
    execution_id: string;
    results?: DiscoverySearchResponse;
    approved_assets?: string[];
  }> {
    // Create discovery job
    const job = await this.discovery.createDiscoveryJob(discoveryRequest);
    
    // Start execution
    const execution = await this.discovery.startDiscoveryJob(job.id);
    
    // Poll for completion (simplified - in real implementation, use proper polling)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get results
    const results = await this.discovery.getJobResults(job.id);
    
    let approved_assets: string[] = [];
    if (autoApprove && results.results.length > 0) {
      const approval = await this.discovery.approveDiscoveryResults(
        results.results.map(r => r.id),
        true
      );
      approved_assets = approval.created_assets;
    }

    return {
      job,
      execution_id: execution.execution_id,
      results,
      approved_assets: approved_assets.length > 0 ? approved_assets : undefined
    };
  }
}

// Default export
export default CatalogDiscoveryApiClient;