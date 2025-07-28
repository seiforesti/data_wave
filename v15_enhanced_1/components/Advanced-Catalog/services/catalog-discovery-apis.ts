// 🔍 **CATALOG DISCOVERY API SERVICE**
// 100% Backend Integration: intelligent_discovery_service.py, data_profiling_service.py, semantic_search_service.py

import { 
  ApiResponse, 
  DiscoveryJob, 
  DiscoveryConfiguration,
  ProfilingJob,
  ProfilingResults,
  AutoClassificationResult,
  SchemaAnalysisResult,
  SearchResult,
  CatalogSearchRequest,
  CatalogSearchResponse
} from '../types/catalog-core.types';

import { 
  DiscoveryType,
  ProfilingType,
  ScanDepth,
  SamplingStrategy 
} from '../types/discovery.types';

// 🎯 BASE API CONFIGURATION
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';
const DISCOVERY_BASE = `${API_BASE_URL}/catalog/discovery`;
const PROFILING_BASE = `${API_BASE_URL}/catalog/profiling`;
const SEARCH_BASE = `${API_BASE_URL}/catalog/search`;
const CLASSIFICATION_BASE = `${API_BASE_URL}/catalog/classification`;

// 🔧 HTTP CLIENT CONFIGURATION
class CatalogDiscoveryAPI {
  private baseHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.baseHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 🤖 INTELLIGENT DISCOVERY METHODS
  
  /**
   * Create and start an intelligent discovery job
   * Maps to: intelligent_discovery_service.py -> create_discovery_job()
   */
  async createDiscoveryJob(config: DiscoveryConfiguration): Promise<ApiResponse<DiscoveryJob>> {
    return this.makeRequest<DiscoveryJob>(`${DISCOVERY_BASE}/jobs`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /**
   * Start AI-powered asset discovery
   * Maps to: intelligent_discovery_service.py -> discover_assets_with_ai()
   */
  async startAIDiscovery(
    dataSourceId: string, 
    discoveryType: DiscoveryType = DiscoveryType.COMPREHENSIVE,
    scanDepth: ScanDepth = ScanDepth.DEEP
  ): Promise<ApiResponse<DiscoveryJob>> {
    return this.makeRequest<DiscoveryJob>(`${DISCOVERY_BASE}/ai-discovery`, {
      method: 'POST',
      body: JSON.stringify({
        data_source_id: dataSourceId,
        discovery_type: discoveryType,
        scan_depth: scanDepth,
        ai_enabled: true,
        auto_classification: true,
        profiling_enabled: true
      }),
    });
  }

  /**
   * Get discovery job status and results
   * Maps to: intelligent_discovery_service.py -> get_discovery_job_status()
   */
  async getDiscoveryJobStatus(jobId: string): Promise<ApiResponse<DiscoveryJob>> {
    return this.makeRequest<DiscoveryJob>(`${DISCOVERY_BASE}/jobs/${jobId}`);
  }

  /**
   * Get all discovery jobs with filtering
   * Maps to: intelligent_discovery_service.py -> list_discovery_jobs()
   */
  async getDiscoveryJobs(
    status?: string,
    dataSourceId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<DiscoveryJob[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (status) params.append('status', status);
    if (dataSourceId) params.append('data_source_id', dataSourceId);

    return this.makeRequest<DiscoveryJob[]>(`${DISCOVERY_BASE}/jobs?${params}`);
  }

  /**
   * Cancel a running discovery job
   * Maps to: intelligent_discovery_service.py -> cancel_discovery_job()
   */
  async cancelDiscoveryJob(jobId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.makeRequest<{ success: boolean }>(`${DISCOVERY_BASE}/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * Perform incremental discovery
   * Maps to: intelligent_discovery_service.py -> perform_incremental_discovery()
   */
  async performIncrementalDiscovery(
    dataSourceId: string,
    lastDiscoveryDate: Date
  ): Promise<ApiResponse<DiscoveryJob>> {
    return this.makeRequest<DiscoveryJob>(`${DISCOVERY_BASE}/incremental`, {
      method: 'POST',
      body: JSON.stringify({
        data_source_id: dataSourceId,
        last_discovery_date: lastDiscoveryDate.toISOString(),
        discovery_type: DiscoveryType.INCREMENTAL
      }),
    });
  }

  /**
   * Discover schema relationships
   * Maps to: intelligent_discovery_service.py -> discover_schema_relationships()
   */
  async discoverSchemaRelationships(
    schemaId: string
  ): Promise<ApiResponse<SchemaAnalysisResult>> {
    return this.makeRequest<SchemaAnalysisResult>(`${DISCOVERY_BASE}/schema/${schemaId}/relationships`, {
      method: 'POST',
    });
  }

  /**
   * Analyze schema evolution
   * Maps to: intelligent_discovery_service.py -> analyze_schema_evolution()
   */
  async analyzeSchemaEvolution(
    schemaId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<ApiResponse<SchemaAnalysisResult>> {
    return this.makeRequest<SchemaAnalysisResult>(`${DISCOVERY_BASE}/schema/${schemaId}/evolution`, {
      method: 'POST',
      body: JSON.stringify({
        start_date: timeRange.start.toISOString(),
        end_date: timeRange.end.toISOString()
      }),
    });
  }

  // 📊 DATA PROFILING METHODS

  /**
   * Create and start data profiling job
   * Maps to: data_profiling_service.py -> create_profiling_job()
   */
  async createProfilingJob(
    assetId: string,
    profilingType: ProfilingType = ProfilingType.COMPREHENSIVE,
    samplingStrategy: SamplingStrategy = SamplingStrategy.REPRESENTATIVE
  ): Promise<ApiResponse<ProfilingJob>> {
    return this.makeRequest<ProfilingJob>(`${PROFILING_BASE}/jobs`, {
      method: 'POST',
      body: JSON.stringify({
        asset_id: assetId,
        profiling_type: profilingType,
        sampling_strategy: samplingStrategy,
        statistical_analysis: true,
        pattern_detection: true,
        anomaly_detection: true,
        correlation_analysis: true
      }),
    });
  }

  /**
   * Get profiling job results
   * Maps to: data_profiling_service.py -> get_profiling_results()
   */
  async getProfilingResults(jobId: string): Promise<ApiResponse<ProfilingResults>> {
    return this.makeRequest<ProfilingResults>(`${PROFILING_BASE}/jobs/${jobId}/results`);
  }

  /**
   * Perform quick profiling for preview
   * Maps to: data_profiling_service.py -> quick_profile()
   */
  async quickProfile(assetId: string): Promise<ApiResponse<ProfilingResults>> {
    return this.makeRequest<ProfilingResults>(`${PROFILING_BASE}/assets/${assetId}/quick-profile`, {
      method: 'POST',
    });
  }

  /**
   * Get column-level profiling statistics
   * Maps to: data_profiling_service.py -> get_column_profile()
   */
  async getColumnProfile(
    assetId: string, 
    columnName: string
  ): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`${PROFILING_BASE}/assets/${assetId}/columns/${columnName}/profile`);
  }

  /**
   * Detect data patterns across columns
   * Maps to: data_profiling_service.py -> detect_patterns()
   */
  async detectDataPatterns(assetId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`${PROFILING_BASE}/assets/${assetId}/patterns`, {
      method: 'POST',
    });
  }

  /**
   * Analyze data correlations
   * Maps to: data_profiling_service.py -> analyze_correlations()
   */
  async analyzeCorrelations(assetId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`${PROFILING_BASE}/assets/${assetId}/correlations`, {
      method: 'POST',
    });
  }

  /**
   * Detect data anomalies
   * Maps to: data_profiling_service.py -> detect_anomalies()
   */
  async detectAnomalies(assetId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`${PROFILING_BASE}/assets/${assetId}/anomalies`, {
      method: 'POST',
    });
  }

  // 🔍 SEMANTIC SEARCH METHODS

  /**
   * Perform semantic search across catalog
   * Maps to: semantic_search_service.py -> semantic_search()
   */
  async performSemanticSearch(request: CatalogSearchRequest): Promise<CatalogSearchResponse> {
    const response = await this.makeRequest<CatalogSearchResponse>(`${SEARCH_BASE}/semantic`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.data;
  }

  /**
   * Get search suggestions and auto-complete
   * Maps to: semantic_search_service.py -> get_search_suggestions()
   */
  async getSearchSuggestions(
    query: string,
    maxSuggestions: number = 10
  ): Promise<ApiResponse<string[]>> {
    const params = new URLSearchParams({
      q: query,
      max_suggestions: maxSuggestions.toString(),
    });
    
    return this.makeRequest<string[]>(`${SEARCH_BASE}/suggestions?${params}`);
  }

  /**
   * Find similar assets using semantic similarity
   * Maps to: semantic_search_service.py -> find_similar_assets()
   */
  async findSimilarAssets(
    assetId: string,
    similarityThreshold: number = 0.7,
    maxResults: number = 20
  ): Promise<ApiResponse<SearchResult[]>> {
    const params = new URLSearchParams({
      similarity_threshold: similarityThreshold.toString(),
      max_results: maxResults.toString(),
    });

    return this.makeRequest<SearchResult[]>(`${SEARCH_BASE}/assets/${assetId}/similar?${params}`);
  }

  /**
   * Search by natural language query
   * Maps to: semantic_search_service.py -> natural_language_search()
   */
  async naturalLanguageSearch(
    naturalQuery: string,
    userContext?: any
  ): Promise<ApiResponse<SearchResult[]>> {
    return this.makeRequest<SearchResult[]>(`${SEARCH_BASE}/natural-language`, {
      method: 'POST',
      body: JSON.stringify({
        query: naturalQuery,
        user_context: userContext
      }),
    });
  }

  /**
   * Get personalized asset recommendations
   * Maps to: semantic_search_service.py -> get_personalized_recommendations()
   */
  async getPersonalizedRecommendations(
    userId: string,
    maxRecommendations: number = 15
  ): Promise<ApiResponse<SearchResult[]>> {
    const params = new URLSearchParams({
      max_recommendations: maxRecommendations.toString(),
    });

    return this.makeRequest<SearchResult[]>(`${SEARCH_BASE}/users/${userId}/recommendations?${params}`);
  }

  /**
   * Build and update search indexes
   * Maps to: semantic_search_service.py -> rebuild_search_index()
   */
  async rebuildSearchIndex(assetIds?: string[]): Promise<ApiResponse<{ success: boolean }>> {
    return this.makeRequest<{ success: boolean }>(`${SEARCH_BASE}/index/rebuild`, {
      method: 'POST',
      body: JSON.stringify({ asset_ids: assetIds }),
    });
  }

  // 🏷️ AUTO-CLASSIFICATION METHODS

  /**
   * Perform automatic data classification
   * Maps to: classification_service.py -> classify_asset()
   */
  async classifyAsset(assetId: string): Promise<ApiResponse<AutoClassificationResult>> {
    return this.makeRequest<AutoClassificationResult>(`${CLASSIFICATION_BASE}/assets/${assetId}/classify`, {
      method: 'POST',
    });
  }

  /**
   * Batch classify multiple assets
   * Maps to: classification_service.py -> batch_classify_assets()
   */
  async batchClassifyAssets(assetIds: string[]): Promise<ApiResponse<AutoClassificationResult[]>> {
    return this.makeRequest<AutoClassificationResult[]>(`${CLASSIFICATION_BASE}/batch-classify`, {
      method: 'POST',
      body: JSON.stringify({ asset_ids: assetIds }),
    });
  }

  /**
   * Get classification model performance metrics
   * Maps to: classification_service.py -> get_model_metrics()
   */
  async getClassificationMetrics(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`${CLASSIFICATION_BASE}/model/metrics`);
  }

  /**
   * Train classification model with feedback
   * Maps to: classification_service.py -> train_with_feedback()
   */
  async trainWithFeedback(
    feedbackData: any[]
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.makeRequest<{ success: boolean }>(`${CLASSIFICATION_BASE}/model/train`, {
      method: 'POST',
      body: JSON.stringify({ feedback_data: feedbackData }),
    });
  }

  /**
   * Detect sensitive data patterns
   * Maps to: classification_service.py -> detect_sensitive_data()
   */
  async detectSensitiveData(assetId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`${CLASSIFICATION_BASE}/assets/${assetId}/sensitive-data`, {
      method: 'POST',
    });
  }

  // 📈 DISCOVERY ANALYTICS METHODS

  /**
   * Get discovery job analytics and trends
   * Maps to: intelligent_discovery_service.py -> get_discovery_analytics()
   */
  async getDiscoveryAnalytics(
    timeRange?: { start: Date; end: Date }
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (timeRange) {
      params.append('start_date', timeRange.start.toISOString());
      params.append('end_date', timeRange.end.toISOString());
    }

    return this.makeRequest<any>(`${DISCOVERY_BASE}/analytics?${params}`);
  }

  /**
   * Get asset discovery coverage report
   * Maps to: intelligent_discovery_service.py -> get_coverage_report()
   */
  async getDiscoveryCoverage(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`${DISCOVERY_BASE}/coverage`);
  }

  /**
   * Get profiling job statistics
   * Maps to: data_profiling_service.py -> get_profiling_statistics()
   */
  async getProfilingStatistics(
    timeRange?: { start: Date; end: Date }
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (timeRange) {
      params.append('start_date', timeRange.start.toISOString());
      params.append('end_date', timeRange.end.toISOString());
    }

    return this.makeRequest<any>(`${PROFILING_BASE}/statistics?${params}`);
  }

  /**
   * Get search analytics and usage patterns
   * Maps to: semantic_search_service.py -> get_search_analytics()
   */
  async getSearchAnalytics(
    timeRange?: { start: Date; end: Date }
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (timeRange) {
      params.append('start_date', timeRange.start.toISOString());
      params.append('end_date', timeRange.end.toISOString());
    }

    return this.makeRequest<any>(`${SEARCH_BASE}/analytics?${params}`);
  }

  // 🔧 CONFIGURATION METHODS

  /**
   * Update discovery configuration
   * Maps to: intelligent_discovery_service.py -> update_discovery_config()
   */
  async updateDiscoveryConfig(
    dataSourceId: string,
    config: Partial<DiscoveryConfiguration>
  ): Promise<ApiResponse<DiscoveryConfiguration>> {
    return this.makeRequest<DiscoveryConfiguration>(`${DISCOVERY_BASE}/data-sources/${dataSourceId}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  /**
   * Get discovery configuration for data source
   * Maps to: intelligent_discovery_service.py -> get_discovery_config()
   */
  async getDiscoveryConfig(dataSourceId: string): Promise<ApiResponse<DiscoveryConfiguration>> {
    return this.makeRequest<DiscoveryConfiguration>(`${DISCOVERY_BASE}/data-sources/${dataSourceId}/config`);
  }

  /**
   * Test discovery connection and configuration
   * Maps to: intelligent_discovery_service.py -> test_discovery_connection()
   */
  async testDiscoveryConnection(
    dataSourceId: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.makeRequest<{ success: boolean; message: string }>(`${DISCOVERY_BASE}/data-sources/${dataSourceId}/test`, {
      method: 'POST',
    });
  }
}

// 🎯 EXPORT SINGLETON INSTANCE
export const catalogDiscoveryAPI = new CatalogDiscoveryAPI();
export default catalogDiscoveryAPI;