/**
 * Catalog Intelligence API Client
 * Maps to: semantic_search_service.py, catalog_recommendation_service.py, ai_service.py, advanced_ai_service.py
 * 
 * Comprehensive API integration for AI-powered catalog intelligence including semantic search,
 * recommendations, pattern recognition, and advanced analytics.
 */

import { apiClient } from '@/shared/utils/api-client';
import type {
  SemanticSearchRequest,
  SemanticSearchResponse,
  RecommendationRequest,
  RecommendationResponse,
  IntelligenceAnalysisRequest,
  IntelligenceAnalysisResponse,
  SemanticEmbedding,
  SemanticRelationship,
  RecommendationEngine,
  AssetRecommendation,
  AssetUsagePattern,
  IntelligenceInsight,
  CollaborationInsight,
  CatalogIntelligenceMetrics,
  SemanticAnalytics
} from '../types/intelligence.types';

export class CatalogIntelligenceApiClient {
  private baseURL = '/api/catalog/intelligence';

  // ===================== SEMANTIC SEARCH APIs =====================

  /**
   * Perform semantic search across catalog assets
   * Maps to: semantic_search_service.py -> semantic_search()
   */
  async performSemanticSearch(request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    return apiClient.post<SemanticSearchResponse>(`${this.baseURL}/semantic-search`, request);
  }

  /**
   * Perform advanced semantic search with AI understanding
   * Maps to: semantic_search_service.py -> advanced_semantic_search()
   */
  async performAdvancedSemanticSearch(
    request: SemanticSearchRequest & {
      ai_enhancement: boolean;
      context_expansion: boolean;
      personalization: boolean;
    }
  ): Promise<SemanticSearchResponse> {
    return apiClient.post<SemanticSearchResponse>(`${this.baseURL}/advanced-semantic-search`, request);
  }

  /**
   * Get search suggestions and auto-complete
   * Maps to: semantic_search_service.py -> get_search_suggestions()
   */
  async getSearchSuggestions(
    query: string,
    context?: Record<string, any>
  ): Promise<{ suggestions: string[]; confidence_scores: number[] }> {
    return apiClient.get(`${this.baseURL}/search-suggestions`, {
      params: { query, context: JSON.stringify(context || {}) }
    });
  }

  /**
   * Analyze search query for intelligence
   * Maps to: semantic_search_service.py -> analyze_query()
   */
  async analyzeSearchQuery(query: string): Promise<{
    intent: string;
    entities: string[];
    filters: Record<string, any>;
    suggestions: string[];
    complexity_score: number;
  }> {
    return apiClient.post(`${this.baseURL}/analyze-query`, { query });
  }

  // ===================== SEMANTIC EMBEDDINGS APIs =====================

  /**
   * Generate semantic embeddings for assets
   * Maps to: semantic_search_service.py -> generate_embeddings()
   */
  async generateEmbeddings(
    asset_ids: string[],
    embedding_type: string = 'default'
  ): Promise<{ embeddings_created: number; processing_time: number }> {
    return apiClient.post(`${this.baseURL}/embeddings/generate`, {
      asset_ids,
      embedding_type
    });
  }

  /**
   * Get semantic embeddings for assets
   * Maps to: catalog_intelligence_models.py -> SemanticEmbedding
   */
  async getSemanticEmbeddings(
    asset_ids: string[],
    include_vectors: boolean = false
  ): Promise<SemanticEmbedding[]> {
    return apiClient.get(`${this.baseURL}/embeddings`, {
      params: { asset_ids: asset_ids.join(','), include_vectors }
    });
  }

  /**
   * Find similar assets using semantic embeddings
   * Maps to: semantic_search_service.py -> find_similar_assets()
   */
  async findSimilarAssets(
    asset_id: string,
    similarity_threshold: number = 0.7,
    max_results: number = 10
  ): Promise<{
    similar_assets: Array<{
      asset_id: string;
      similarity_score: number;
      relationship_context: string;
    }>;
    analysis_metadata: Record<string, any>;
  }> {
    return apiClient.get(`${this.baseURL}/embeddings/${asset_id}/similar`, {
      params: { similarity_threshold, max_results }
    });
  }

  // ===================== SEMANTIC RELATIONSHIPS APIs =====================

  /**
   * Get semantic relationships for assets
   * Maps to: catalog_intelligence_models.py -> SemanticRelationship
   */
  async getSemanticRelationships(
    asset_id: string,
    relationship_types?: string[],
    include_evidence: boolean = true
  ): Promise<SemanticRelationship[]> {
    return apiClient.get(`${this.baseURL}/relationships/${asset_id}`, {
      params: {
        relationship_types: relationship_types?.join(','),
        include_evidence
      }
    });
  }

  /**
   * Create semantic relationship
   * Maps to: semantic_search_service.py -> create_semantic_relationship()
   */
  async createSemanticRelationship(
    relationship: Omit<SemanticRelationship, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SemanticRelationship> {
    return apiClient.post(`${this.baseURL}/relationships`, relationship);
  }

  /**
   * Validate semantic relationships
   * Maps to: semantic_search_service.py -> validate_relationships()
   */
  async validateSemanticRelationships(
    relationship_ids: string[]
  ): Promise<{
    validated_count: number;
    validation_results: Array<{
      relationship_id: string;
      is_valid: boolean;
      confidence_score: number;
      validation_evidence: Record<string, any>;
    }>;
  }> {
    return apiClient.post(`${this.baseURL}/relationships/validate`, { relationship_ids });
  }

  // ===================== RECOMMENDATION ENGINE APIs =====================

  /**
   * Get asset recommendations
   * Maps to: catalog_recommendation_service.py -> get_recommendations()
   */
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    return apiClient.post<RecommendationResponse>(`${this.baseURL}/recommendations`, request);
  }

  /**
   * Get personalized recommendations
   * Maps to: catalog_recommendation_service.py -> get_personalized_recommendations()
   */
  async getPersonalizedRecommendations(
    user_id: string,
    context?: Record<string, any>,
    max_recommendations: number = 10
  ): Promise<RecommendationResponse> {
    return apiClient.post<RecommendationResponse>(`${this.baseURL}/recommendations/personalized`, {
      user_id,
      context,
      max_recommendations
    });
  }

  /**
   * Get recommendation engines
   * Maps to: catalog_intelligence_models.py -> RecommendationEngine
   */
  async getRecommendationEngines(
    engine_type?: string,
    is_active?: boolean
  ): Promise<RecommendationEngine[]> {
    return apiClient.get(`${this.baseURL}/recommendation-engines`, {
      params: { engine_type, is_active }
    });
  }

  /**
   * Create recommendation engine
   * Maps to: catalog_recommendation_service.py -> create_recommendation_engine()
   */
  async createRecommendationEngine(
    engine: Omit<RecommendationEngine, 'id' | 'created_at' | 'updated_at'>
  ): Promise<RecommendationEngine> {
    return apiClient.post(`${this.baseURL}/recommendation-engines`, engine);
  }

  /**
   * Train recommendation engine
   * Maps to: catalog_recommendation_service.py -> train_recommendation_engine()
   */
  async trainRecommendationEngine(
    engine_id: string,
    training_config?: Record<string, any>
  ): Promise<{
    training_job_id: string;
    estimated_completion: string;
    training_status: string;
  }> {
    return apiClient.post(`${this.baseURL}/recommendation-engines/${engine_id}/train`, {
      training_config
    });
  }

  /**
   * Get recommendation engine performance
   * Maps to: catalog_recommendation_service.py -> get_engine_performance()
   */
  async getEnginePerformance(
    engine_id: string,
    time_range?: string
  ): Promise<{
    performance_metrics: Record<string, number>;
    trend_analysis: Record<string, any>;
    recommendations_served: number;
    acceptance_rate: number;
    user_feedback_scores: number[];
  }> {
    return apiClient.get(`${this.baseURL}/recommendation-engines/${engine_id}/performance`, {
      params: { time_range }
    });
  }

  // ===================== USAGE PATTERNS APIs =====================

  /**
   * Get asset usage patterns
   * Maps to: catalog_intelligence_models.py -> AssetUsagePattern
   */
  async getUsagePatterns(
    asset_id?: string,
    user_id?: string,
    pattern_types?: string[],
    time_range?: string
  ): Promise<AssetUsagePattern[]> {
    return apiClient.get(`${this.baseURL}/usage-patterns`, {
      params: {
        asset_id,
        user_id,
        pattern_types: pattern_types?.join(','),
        time_range
      }
    });
  }

  /**
   * Analyze usage patterns
   * Maps to: catalog_recommendation_service.py -> analyze_usage_patterns()
   */
  async analyzeUsagePatterns(
    analysis_config: {
      asset_ids?: string[];
      user_ids?: string[];
      time_range: string;
      pattern_types?: string[];
      include_predictions?: boolean;
    }
  ): Promise<{
    patterns_identified: AssetUsagePattern[];
    pattern_insights: IntelligenceInsight[];
    optimization_recommendations: string[];
    anomalies_detected: Array<{
      pattern_id: string;
      anomaly_type: string;
      severity: string;
      description: string;
    }>;
  }> {
    return apiClient.post(`${this.baseURL}/usage-patterns/analyze`, analysis_config);
  }

  // ===================== INTELLIGENCE INSIGHTS APIs =====================

  /**
   * Generate intelligence insights
   * Maps to: ai_service.py -> generate_intelligence_insights()
   */
  async generateIntelligenceInsights(
    request: IntelligenceAnalysisRequest
  ): Promise<IntelligenceAnalysisResponse> {
    return apiClient.post<IntelligenceAnalysisResponse>(`${this.baseURL}/insights/generate`, request);
  }

  /**
   * Get intelligence insights
   * Maps to: catalog_intelligence_models.py -> IntelligenceInsight
   */
  async getIntelligenceInsights(
    asset_id?: string,
    insight_types?: string[],
    confidence_threshold?: number,
    limit?: number
  ): Promise<IntelligenceInsight[]> {
    return apiClient.get(`${this.baseURL}/insights`, {
      params: {
        asset_id,
        insight_types: insight_types?.join(','),
        confidence_threshold,
        limit
      }
    });
  }

  /**
   * Validate intelligence insights
   * Maps to: ai_service.py -> validate_insights()
   */
  async validateInsights(
    insight_ids: string[],
    validation_feedback: Record<string, any>
  ): Promise<{
    validated_insights: number;
    validation_results: Array<{
      insight_id: string;
      validation_status: string;
      confidence_adjustment: number;
      feedback_impact: string;
    }>;
  }> {
    return apiClient.post(`${this.baseURL}/insights/validate`, {
      insight_ids,
      validation_feedback
    });
  }

  // ===================== COLLABORATION INTELLIGENCE APIs =====================

  /**
   * Get collaboration insights
   * Maps to: catalog_intelligence_models.py -> CollaborationInsight
   */
  async getCollaborationInsights(
    asset_id?: string,
    time_range?: string,
    collaboration_types?: string[]
  ): Promise<CollaborationInsight[]> {
    return apiClient.get(`${this.baseURL}/collaboration-insights`, {
      params: {
        asset_id,
        time_range,
        collaboration_types: collaboration_types?.join(',')
      }
    });
  }

  /**
   * Analyze collaboration patterns
   * Maps to: advanced_ai_service.py -> analyze_collaboration_patterns()
   */
  async analyzeCollaborationPatterns(
    analysis_config: {
      asset_ids?: string[];
      user_groups?: string[];
      time_range: string;
      collaboration_types?: string[];
    }
  ): Promise<{
    collaboration_insights: CollaborationInsight[];
    team_effectiveness_metrics: Record<string, number>;
    knowledge_sharing_analysis: Record<string, any>;
    collaboration_recommendations: string[];
    network_analysis: Record<string, any>;
  }> {
    return apiClient.post(`${this.baseURL}/collaboration-insights/analyze`, analysis_config);
  }

  // ===================== AI/ML INTEGRATION APIs =====================

  /**
   * Get AI model predictions
   * Maps to: ai_service.py -> get_predictions()
   */
  async getAIPredictions(
    model_type: string,
    input_data: Record<string, any>,
    prediction_config?: Record<string, any>
  ): Promise<{
    predictions: Array<{
      prediction_id: string;
      prediction_value: any;
      confidence_score: number;
      prediction_metadata: Record<string, any>;
    }>;
    model_metadata: Record<string, any>;
    processing_time: number;
  }> {
    return apiClient.post(`${this.baseURL}/ai/predictions`, {
      model_type,
      input_data,
      prediction_config
    });
  }

  /**
   * Train custom AI models
   * Maps to: advanced_ai_service.py -> train_custom_model()
   */
  async trainCustomModel(
    model_config: {
      model_type: string;
      training_data_config: Record<string, any>;
      model_parameters: Record<string, any>;
      validation_split: number;
      training_schedule?: string;
    }
  ): Promise<{
    training_job_id: string;
    estimated_completion: string;
    model_id: string;
    training_status: string;
  }> {
    return apiClient.post(`${this.baseURL}/ai/models/train`, model_config);
  }

  /**
   * Get ML model performance
   * Maps to: ml_service.py -> get_model_performance()
   */
  async getMLModelPerformance(
    model_id: string,
    evaluation_metrics?: string[]
  ): Promise<{
    performance_metrics: Record<string, number>;
    confusion_matrix?: number[][];
    feature_importance?: Record<string, number>;
    model_accuracy: number;
    training_history: Record<string, any>;
    validation_results: Record<string, any>;
  }> {
    return apiClient.get(`${this.baseURL}/ml/models/${model_id}/performance`, {
      params: { evaluation_metrics: evaluation_metrics?.join(',') }
    });
  }

  // ===================== ANALYTICS & METRICS APIs =====================

  /**
   * Get catalog intelligence metrics
   * Maps to: comprehensive_analytics_service.py -> get_intelligence_metrics()
   */
  async getCatalogIntelligenceMetrics(
    time_range?: string,
    metric_types?: string[]
  ): Promise<CatalogIntelligenceMetrics> {
    return apiClient.get(`${this.baseURL}/metrics`, {
      params: { time_range, metric_types: metric_types?.join(',') }
    });
  }

  /**
   * Get semantic analytics
   * Maps to: semantic_search_service.py -> get_semantic_analytics()
   */
  async getSemanticAnalytics(
    analysis_period?: string,
    include_trends?: boolean
  ): Promise<SemanticAnalytics> {
    return apiClient.get(`${this.baseURL}/analytics/semantic`, {
      params: { analysis_period, include_trends }
    });
  }

  /**
   * Get intelligence performance dashboard
   * Maps to: ai_service.py -> get_performance_dashboard()
   */
  async getIntelligencePerformanceDashboard(
    dashboard_config?: {
      time_range?: string;
      metric_categories?: string[];
      granularity?: string;
      include_forecasts?: boolean;
    }
  ): Promise<{
    dashboard_data: Record<string, any>;
    key_insights: IntelligenceInsight[];
    performance_trends: Record<string, any>;
    recommendations: string[];
    alert_summary: Record<string, any>;
  }> {
    return apiClient.post(`${this.baseURL}/analytics/dashboard`, dashboard_config || {});
  }

  // ===================== REAL-TIME & STREAMING APIs =====================

  /**
   * Subscribe to intelligence events
   * Maps to: real-time intelligence updates
   */
  subscribeToIntelligenceEvents(
    event_types: string[],
    filters?: Record<string, any>
  ): EventSource {
    const params = new URLSearchParams({
      event_types: event_types.join(','),
      ...(filters && { filters: JSON.stringify(filters) })
    });
    
    return new EventSource(`${this.baseURL}/events/stream?${params}`);
  }

  /**
   * Get real-time intelligence status
   * Maps to: real-time system monitoring
   */
  async getRealTimeIntelligenceStatus(): Promise<{
    active_processes: Array<{
      process_id: string;
      process_type: string;
      status: string;
      progress: number;
      estimated_completion?: string;
    }>;
    system_health: Record<string, any>;
    active_users: number;
    processing_queue_size: number;
    recent_alerts: Array<{
      alert_id: string;
      alert_type: string;
      severity: string;
      message: string;
      timestamp: string;
    }>;
  }> {
    return apiClient.get(`${this.baseURL}/status/real-time`);
  }

  // ===================== CONFIGURATION & ADMIN APIs =====================

  /**
   * Update intelligence configuration
   * Maps to: system configuration management
   */
  async updateIntelligenceConfiguration(
    config_updates: {
      search_config?: Record<string, any>;
      recommendation_config?: Record<string, any>;
      ai_model_config?: Record<string, any>;
      performance_config?: Record<string, any>;
    }
  ): Promise<{
    configuration_updated: boolean;
    restart_required: boolean;
    validation_results: Record<string, any>;
  }> {
    return apiClient.put(`${this.baseURL}/configuration`, config_updates);
  }

  /**
   * Get intelligence system health
   * Maps to: system health monitoring
   */
  async getIntelligenceSystemHealth(): Promise<{
    overall_health: string;
    component_health: Record<string, string>;
    performance_metrics: Record<string, number>;
    error_rates: Record<string, number>;
    resource_utilization: Record<string, number>;
    recommendations: string[];
  }> {
    return apiClient.get(`${this.baseURL}/health`);
  }

  /**
   * Trigger intelligence refresh
   * Maps to: manual system refresh
   */
  async triggerIntelligenceRefresh(
    refresh_config: {
      refresh_embeddings?: boolean;
      refresh_relationships?: boolean;
      refresh_recommendations?: boolean;
      refresh_patterns?: boolean;
      force_full_refresh?: boolean;
    }
  ): Promise<{
    refresh_job_id: string;
    estimated_completion: string;
    refresh_status: string;
    components_refreshing: string[];
  }> {
    return apiClient.post(`${this.baseURL}/refresh`, refresh_config);
  }
}