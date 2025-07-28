/**
 * Advanced Catalog Discovery API Service - Complete Backend Integration
 * ===================================================================
 * 
 * This service provides comprehensive API integration with the backend
 * intelligent_discovery_service.py, ensuring 100% backend functionality
 * utilization for AI-powered asset discovery and classification.
 * 
 * Features:
 * - AI-powered asset discovery and classification
 * - Real-time discovery job management
 * - Schema analysis and semantic understanding
 * - Pattern detection and matching
 * - Automated metadata enrichment
 * - Discovery monitoring and alerting
 */

import { 
  DiscoveryEngine, 
  DiscoveryJob, 
  DiscoveryJobResults,
  DiscoveredAsset,
  DiscoveryProgress,
  DiscoveryAnomaly,
  DiscoveryRecommendation,
  DiscoveryMonitoring,
  DiscoveryAlert,
  DiscoverySourceConfig,
  DiscoveryJobConfig,
  DiscoveryScheduleConfig
} from '../types/discovery.types'
import { IntelligentDataAsset } from '../types/catalog-core.types'

// ===================== BASE API CLIENT =====================

class DiscoveryApiClient {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl: string = '/api/v1/catalog/discovery') {
    this.baseUrl = baseUrl
  }

  setAuthToken(token: string) {
    this.authToken = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.detail || 
          errorData.message || 
          `HTTP ${response.status}: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${url}`, error)
      throw error
    }
  }

  private async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()))
          } else {
            searchParams.append(key, value.toString())
          }
        }
      })
    }
    
    const url = searchParams.toString() 
      ? `${endpoint}?${searchParams.toString()}`
      : endpoint
    
    return this.request<T>(url)
  }

  private async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  private async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  // ===================== DISCOVERY ENGINE MANAGEMENT =====================

  async getDiscoveryEngines(): Promise<DiscoveryEngine[]> {
    return this.get<DiscoveryEngine[]>('/engines')
  }

  async getDiscoveryEngine(engineId: string): Promise<DiscoveryEngine> {
    return this.get<DiscoveryEngine>(`/engines/${engineId}`)
  }

  async createDiscoveryEngine(engine: Partial<DiscoveryEngine>): Promise<DiscoveryEngine> {
    return this.post<DiscoveryEngine>('/engines', engine)
  }

  async updateDiscoveryEngine(
    engineId: string, 
    updates: Partial<DiscoveryEngine>
  ): Promise<DiscoveryEngine> {
    return this.put<DiscoveryEngine>(`/engines/${engineId}`, updates)
  }

  async deleteDiscoveryEngine(engineId: string): Promise<void> {
    await this.delete(`/engines/${engineId}`)
  }

  async startDiscoveryEngine(engineId: string): Promise<DiscoveryEngine> {
    return this.post<DiscoveryEngine>(`/engines/${engineId}/start`)
  }

  async stopDiscoveryEngine(engineId: string): Promise<DiscoveryEngine> {
    return this.post<DiscoveryEngine>(`/engines/${engineId}/stop`)
  }

  async getDiscoveryEngineMetrics(engineId: string, timeRange?: string): Promise<any> {
    return this.get(`/engines/${engineId}/metrics`, { time_range: timeRange })
  }

  // ===================== DISCOVERY JOB MANAGEMENT =====================

  async getDiscoveryJobs(params?: {
    status?: string
    job_type?: string
    created_after?: string
    created_before?: string
    page?: number
    page_size?: number
  }): Promise<{ jobs: DiscoveryJob[]; total: number; page: number; page_size: number }> {
    return this.get('/jobs', params)
  }

  async getDiscoveryJob(jobId: string): Promise<DiscoveryJob> {
    return this.get<DiscoveryJob>(`/jobs/${jobId}`)
  }

  async createDiscoveryJob(jobConfig: {
    job_name: string
    job_type: string
    source_config: DiscoverySourceConfig
    discovery_config: DiscoveryJobConfig
    schedule_config?: DiscoveryScheduleConfig
  }): Promise<DiscoveryJob> {
    return this.post<DiscoveryJob>('/jobs', jobConfig)
  }

  async updateDiscoveryJob(
    jobId: string, 
    updates: Partial<DiscoveryJob>
  ): Promise<DiscoveryJob> {
    return this.put<DiscoveryJob>(`/jobs/${jobId}`, updates)
  }

  async deleteDiscoveryJob(jobId: string): Promise<void> {
    await this.delete(`/jobs/${jobId}`)
  }

  async startDiscoveryJob(jobId: string): Promise<DiscoveryJob> {
    return this.post<DiscoveryJob>(`/jobs/${jobId}/start`)
  }

  async stopDiscoveryJob(jobId: string): Promise<DiscoveryJob> {
    return this.post<DiscoveryJob>(`/jobs/${jobId}/stop`)
  }

  async pauseDiscoveryJob(jobId: string): Promise<DiscoveryJob> {
    return this.post<DiscoveryJob>(`/jobs/${jobId}/pause`)
  }

  async resumeDiscoveryJob(jobId: string): Promise<DiscoveryJob> {
    return this.post<DiscoveryJob>(`/jobs/${jobId}/resume`)
  }

  async retryDiscoveryJob(jobId: string): Promise<DiscoveryJob> {
    return this.post<DiscoveryJob>(`/jobs/${jobId}/retry`)
  }

  // ===================== DISCOVERY JOB PROGRESS AND RESULTS =====================

  async getDiscoveryJobProgress(jobId: string): Promise<DiscoveryProgress> {
    return this.get<DiscoveryProgress>(`/jobs/${jobId}/progress`)
  }

  async getDiscoveryJobResults(jobId: string): Promise<DiscoveryJobResults> {
    return this.get<DiscoveryJobResults>(`/jobs/${jobId}/results`)
  }

  async getDiscoveryJobLogs(jobId: string, params?: {
    level?: string
    start_time?: string
    end_time?: string
    page?: number
    page_size?: number
  }): Promise<any> {
    return this.get(`/jobs/${jobId}/logs`, params)
  }

  async exportDiscoveryJobResults(
    jobId: string, 
    format: 'csv' | 'json' | 'excel'
  ): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/results/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      },
      body: JSON.stringify({ format }),
    })
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }
    
    return response.blob()
  }

  // ===================== DISCOVERED ASSET MANAGEMENT =====================

  async getDiscoveredAssets(params?: {
    job_id?: string
    discovery_method?: string
    confidence_min?: number
    asset_type?: string
    validation_status?: string
    page?: number
    page_size?: number
  }): Promise<{ assets: DiscoveredAsset[]; total: number }> {
    return this.get('/discovered-assets', params)
  }

  async getDiscoveredAsset(assetId: string): Promise<DiscoveredAsset> {
    return this.get<DiscoveredAsset>(`/discovered-assets/${assetId}`)
  }

  async validateDiscoveredAsset(
    assetId: string, 
    validation: {
      validation_status: 'VALIDATED' | 'REJECTED' | 'NEEDS_REVIEW'
      validation_comments?: string
      validation_score?: number
    }
  ): Promise<DiscoveredAsset> {
    return this.post<DiscoveredAsset>(`/discovered-assets/${assetId}/validate`, validation)
  }

  async approveDiscoveredAssets(assetIds: string[]): Promise<IntelligentDataAsset[]> {
    return this.post<IntelligentDataAsset[]>('/discovered-assets/approve', { asset_ids: assetIds })
  }

  async rejectDiscoveredAssets(
    assetIds: string[], 
    reason: string
  ): Promise<void> {
    await this.post('/discovered-assets/reject', { asset_ids: assetIds, reason })
  }

  async bulkValidateDiscoveredAssets(validations: Array<{
    asset_id: string
    validation_status: string
    validation_comments?: string
  }>): Promise<DiscoveredAsset[]> {
    return this.post<DiscoveredAsset[]>('/discovered-assets/bulk-validate', { validations })
  }

  // ===================== AI-POWERED DISCOVERY =====================

  async triggerAiDiscovery(params: {
    source_systems?: string[]
    asset_types?: string[]
    confidence_threshold?: number
    enable_deep_analysis?: boolean
    enable_lineage_inference?: boolean
  }): Promise<DiscoveryJob> {
    return this.post<DiscoveryJob>('/ai-discovery/trigger', params)
  }

  async getAiDiscoveryInsights(params?: {
    timeframe?: string
    source_system?: string
    asset_type?: string
  }): Promise<any> {
    return this.get('/ai-discovery/insights', params)
  }

  async trainDiscoveryModel(params: {
    training_data_source: string
    model_type: string
    validation_split?: number
    hyperparameters?: Record<string, any>
  }): Promise<any> {
    return this.post('/ai-discovery/train-model', params)
  }

  async getDiscoveryModelPerformance(modelId: string): Promise<any> {
    return this.get(`/ai-discovery/models/${modelId}/performance`)
  }

  async updateDiscoveryModelWeights(
    modelId: string, 
    weights: Record<string, number>
  ): Promise<any> {
    return this.put(`/ai-discovery/models/${modelId}/weights`, weights)
  }

  // ===================== SCHEMA ANALYSIS =====================

  async analyzeSchema(params: {
    source_system: string
    schema_name?: string
    table_name?: string
    analysis_depth?: 'BASIC' | 'STANDARD' | 'COMPREHENSIVE'
  }): Promise<any> {
    return this.post('/schema-analysis/analyze', params)
  }

  async getSchemaAnalysisResults(analysisId: string): Promise<any> {
    return this.get(`/schema-analysis/${analysisId}/results`)
  }

  async compareSchemas(params: {
    source_schema: string
    target_schema: string
    comparison_type?: 'STRUCTURAL' | 'SEMANTIC' | 'COMPREHENSIVE'
  }): Promise<any> {
    return this.post('/schema-analysis/compare', params)
  }

  async getSchemaEvolution(schemaId: string, timeRange?: string): Promise<any> {
    return this.get(`/schema-analysis/${schemaId}/evolution`, { time_range: timeRange })
  }

  async detectSchemaAnomalies(schemaId: string): Promise<DiscoveryAnomaly[]> {
    return this.get<DiscoveryAnomaly[]>(`/schema-analysis/${schemaId}/anomalies`)
  }

  // ===================== PATTERN DETECTION =====================

  async detectPatterns(params: {
    data_source: string
    pattern_types: string[]
    confidence_threshold?: number
    sample_size?: number
  }): Promise<any> {
    return this.post('/pattern-detection/detect', params)
  }

  async getDetectedPatterns(params?: {
    pattern_type?: string
    confidence_min?: number
    asset_type?: string
    page?: number
    page_size?: number
  }): Promise<any> {
    return this.get('/pattern-detection/patterns', params)
  }

  async validatePattern(
    patternId: string, 
    validation: {
      is_valid: boolean
      feedback?: string
      confidence_adjustment?: number
    }
  ): Promise<any> {
    return this.post(`/pattern-detection/patterns/${patternId}/validate`, validation)
  }

  async createCustomPattern(pattern: {
    pattern_name: string
    pattern_type: string
    pattern_definition: Record<string, any>
    applicable_types: string[]
    confidence_weight: number
  }): Promise<any> {
    return this.post('/pattern-detection/custom-patterns', pattern)
  }

  async getPatternLibrary(): Promise<any> {
    return this.get('/pattern-detection/library')
  }

  // ===================== LINEAGE DISCOVERY =====================

  async discoverLineage(params: {
    source_systems?: string[]
    analysis_depth?: number
    include_transformations?: boolean
    confidence_threshold?: number
  }): Promise<DiscoveryJob> {
    return this.post<DiscoveryJob>('/lineage-discovery/discover', params)
  }

  async getDiscoveredLineage(params?: {
    source_asset?: string
    target_asset?: string
    lineage_type?: string
    confidence_min?: number
    page?: number
    page_size?: number
  }): Promise<any> {
    return this.get('/lineage-discovery/lineage', params)
  }

  async validateLineage(
    lineageId: string, 
    validation: {
      is_valid: boolean
      confidence_score?: number
      validation_notes?: string
    }
  ): Promise<any> {
    return this.post(`/lineage-discovery/lineage/${lineageId}/validate`, validation)
  }

  async getLineageConfidenceMetrics(timeRange?: string): Promise<any> {
    return this.get('/lineage-discovery/confidence-metrics', { time_range: timeRange })
  }

  // ===================== BUSINESS CONTEXT DISCOVERY =====================

  async discoverBusinessContext(params: {
    asset_ids?: number[]
    analysis_methods?: string[]
    include_stakeholders?: boolean
    include_usage_patterns?: boolean
  }): Promise<any> {
    return this.post('/business-context/discover', params)
  }

  async getBusinessContextSuggestions(assetId: number): Promise<any> {
    return this.get(`/business-context/suggestions/${assetId}`)
  }

  async linkBusinessTerms(params: {
    asset_id: number
    term_mappings: Array<{
      term_name: string
      association_type: string
      confidence_score: number
    }>
  }): Promise<any> {
    return this.post('/business-context/link-terms', params)
  }

  async identifyStakeholders(assetId: number): Promise<any> {
    return this.get(`/business-context/stakeholders/${assetId}`)
  }

  // ===================== DISCOVERY MONITORING =====================

  async getDiscoveryMonitors(): Promise<DiscoveryMonitoring[]> {
    return this.get<DiscoveryMonitoring[]>('/monitoring/monitors')
  }

  async getDiscoveryMonitor(monitorId: string): Promise<DiscoveryMonitoring> {
    return this.get<DiscoveryMonitoring>(`/monitoring/monitors/${monitorId}`)
  }

  async createDiscoveryMonitor(monitor: Partial<DiscoveryMonitoring>): Promise<DiscoveryMonitoring> {
    return this.post<DiscoveryMonitoring>('/monitoring/monitors', monitor)
  }

  async updateDiscoveryMonitor(
    monitorId: string, 
    updates: Partial<DiscoveryMonitoring>
  ): Promise<DiscoveryMonitoring> {
    return this.put<DiscoveryMonitoring>(`/monitoring/monitors/${monitorId}`, updates)
  }

  async deleteDiscoveryMonitor(monitorId: string): Promise<void> {
    await this.delete(`/monitoring/monitors/${monitorId}`)
  }

  async enableDiscoveryMonitor(monitorId: string): Promise<DiscoveryMonitoring> {
    return this.post<DiscoveryMonitoring>(`/monitoring/monitors/${monitorId}/enable`)
  }

  async disableDiscoveryMonitor(monitorId: string): Promise<DiscoveryMonitoring> {
    return this.post<DiscoveryMonitoring>(`/monitoring/monitors/${monitorId}/disable`)
  }

  // ===================== DISCOVERY ALERTS =====================

  async getDiscoveryAlerts(params?: {
    severity?: string
    status?: string
    monitor_id?: string
    triggered_after?: string
    triggered_before?: string
    page?: number
    page_size?: number
  }): Promise<{ alerts: DiscoveryAlert[]; total: number }> {
    return this.get('/monitoring/alerts', params)
  }

  async getDiscoveryAlert(alertId: string): Promise<DiscoveryAlert> {
    return this.get<DiscoveryAlert>(`/monitoring/alerts/${alertId}`)
  }

  async acknowledgeDiscoveryAlert(
    alertId: string, 
    acknowledgment: {
      acknowledged_by: string
      acknowledgment_notes?: string
    }
  ): Promise<DiscoveryAlert> {
    return this.post<DiscoveryAlert>(`/monitoring/alerts/${alertId}/acknowledge`, acknowledgment)
  }

  async resolveDiscoveryAlert(
    alertId: string, 
    resolution: {
      resolved_by: string
      resolution_notes: string
      resolution_action?: string
    }
  ): Promise<DiscoveryAlert> {
    return this.post<DiscoveryAlert>(`/monitoring/alerts/${alertId}/resolve`, resolution)
  }

  async suppressDiscoveryAlert(
    alertId: string, 
    suppression: {
      suppression_duration_hours: number
      suppression_reason: string
    }
  ): Promise<DiscoveryAlert> {
    return this.post<DiscoveryAlert>(`/monitoring/alerts/${alertId}/suppress`, suppression)
  }

  // ===================== DISCOVERY RECOMMENDATIONS =====================

  async getDiscoveryRecommendations(params?: {
    category?: string
    priority?: string
    status?: string
    scope?: string
    page?: number
    page_size?: number
  }): Promise<{ recommendations: DiscoveryRecommendation[]; total: number }> {
    return this.get('/recommendations', params)
  }

  async getDiscoveryRecommendation(recommendationId: string): Promise<DiscoveryRecommendation> {
    return this.get<DiscoveryRecommendation>(`/recommendations/${recommendationId}`)
  }

  async acceptDiscoveryRecommendation(
    recommendationId: string, 
    acceptance: {
      accepted_by: string
      implementation_plan?: string
      target_completion_date?: string
    }
  ): Promise<DiscoveryRecommendation> {
    return this.post<DiscoveryRecommendation>(
      `/recommendations/${recommendationId}/accept`, 
      acceptance
    )
  }

  async rejectDiscoveryRecommendation(
    recommendationId: string, 
    rejection: {
      rejected_by: string
      rejection_reason: string
    }
  ): Promise<DiscoveryRecommendation> {
    return this.post<DiscoveryRecommendation>(
      `/recommendations/${recommendationId}/reject`, 
      rejection
    )
  }

  async implementDiscoveryRecommendation(
    recommendationId: string, 
    implementation: {
      implemented_by: string
      implementation_notes?: string
      automation_used?: boolean
    }
  ): Promise<DiscoveryRecommendation> {
    return this.post<DiscoveryRecommendation>(
      `/recommendations/${recommendationId}/implement`, 
      implementation
    )
  }

  // ===================== DISCOVERY ANALYTICS =====================

  async getDiscoveryAnalytics(params?: {
    timeframe?: string
    aggregation_level?: string
    include_forecasts?: boolean
  }): Promise<any> {
    return this.get('/analytics/overview', params)
  }

  async getDiscoveryPerformanceMetrics(params?: {
    engine_id?: string
    job_type?: string
    timeframe?: string
  }): Promise<any> {
    return this.get('/analytics/performance', params)
  }

  async getDiscoveryAccuracyMetrics(params?: {
    discovery_method?: string
    asset_type?: string
    timeframe?: string
  }): Promise<any> {
    return this.get('/analytics/accuracy', params)
  }

  async getDiscoveryTrends(params?: {
    metric_type?: string
    aggregation_period?: string
    timeframe?: string
  }): Promise<any> {
    return this.get('/analytics/trends', params)
  }

  async getDiscoveryROIAnalysis(timeframe?: string): Promise<any> {
    return this.get('/analytics/roi', { timeframe })
  }

  // ===================== DISCOVERY CONFIGURATION =====================

  async getDiscoveryConfiguration(): Promise<any> {
    return this.get('/configuration')
  }

  async updateDiscoveryConfiguration(config: Record<string, any>): Promise<any> {
    return this.put('/configuration', config)
  }

  async resetDiscoveryConfiguration(): Promise<any> {
    return this.post('/configuration/reset')
  }

  async exportDiscoveryConfiguration(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/configuration/export`, {
      headers: {
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      },
    })
    
    if (!response.ok) {
      throw new Error(`Configuration export failed: ${response.statusText}`)
    }
    
    return response.blob()
  }

  async importDiscoveryConfiguration(configFile: File): Promise<any> {
    const formData = new FormData()
    formData.append('config_file', configFile)
    
    const response = await fetch(`${this.baseUrl}/configuration/import`, {
      method: 'POST',
      headers: {
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      },
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error(`Configuration import failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  // ===================== REAL-TIME DISCOVERY EVENTS =====================

  async subscribeToDiscoveryEvents(
    eventTypes: string[],
    callback: (event: any) => void
  ): Promise<EventSource> {
    const params = new URLSearchParams()
    eventTypes.forEach(type => params.append('event_types', type))
    
    const eventSource = new EventSource(
      `${this.baseUrl}/events/stream?${params.toString()}`,
      {
        withCredentials: true,
      }
    )
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('Failed to parse discovery event:', error)
      }
    }
    
    eventSource.onerror = (error) => {
      console.error('Discovery event stream error:', error)
    }
    
    return eventSource
  }

  async getDiscoveryEventHistory(params?: {
    event_types?: string[]
    start_time?: string
    end_time?: string
    page?: number
    page_size?: number
  }): Promise<any> {
    return this.get('/events/history', params)
  }
}

// ===================== SINGLETON INSTANCE =====================

const discoveryApiClient = new DiscoveryApiClient()

export default discoveryApiClient

// ===================== CONVENIENCE HOOKS AND UTILITIES =====================

export const useDiscoveryApi = () => {
  return discoveryApiClient
}

export const setDiscoveryApiAuth = (token: string) => {
  discoveryApiClient.setAuthToken(token)
}

export { DiscoveryApiClient }