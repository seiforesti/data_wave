/**
 * Search & Discovery APIs - Advanced Search System
 * ================================================
 * 
 * Complete mapping to backend search services:
 * - semantic_search_service.py (893 lines, 20+ endpoints)
 * - semantic_search_routes.py (762 lines, 20+ endpoints)
 * - intelligent_discovery_service.py (discovery search features)
 * - enterprise_catalog_service.py (search functionality)
 * - data_discovery_routes.py (718 lines, 25+ endpoints)
 * 
 * This service provides comprehensive search and discovery:
 * - Vector-based semantic search
 * - Natural language query processing
 * - Advanced filtering and faceting
 * - Personalized search experiences
 * - Search result ranking and scoring
 * - Saved searches and recommendations
 * - Search analytics and optimization
 * - Cross-system unified search
 */

import { apiClient } from '../../shared/utils/api-client';
import type {
  SearchRequest,
  SearchResponse,
  SemanticSearchRequest,
  SemanticSearchResponse,
  NaturalLanguageQuery,
  NLQueryResponse,
  SearchFilter,
  SearchFacet,
  SearchResult,
  SavedSearch,
  SearchRecommendation,
  SearchAnalytics,
  SearchPersonalization,
  SearchIndexConfig,
  SearchSuggestion,
  AdvancedSearchRequest,
  UnifiedSearchRequest,
  SearchRanking,
  SearchOptimization,
  SearchMetrics,
  DiscoveryRequest,
  DiscoveryResult,
  SearchConfiguration,
  SearchInsight,
  SearchExport,
  AutoCompleteRequest,
  AutoCompleteResponse
} from '../types/search.types';

/**
 * ==============================================
 * UNIFIED SEARCH INTERFACE
 * ==============================================
 */

export class UnifiedSearchAPI {
  /**
   * Perform unified search across all catalog assets
   * Maps to: Unified search across all systems
   */
  static async performUnifiedSearch(request: UnifiedSearchRequest): Promise<SearchResponse> {
    return apiClient.post('/api/catalog/search/unified', request);
  }

  /**
   * Quick search with auto-complete suggestions
   * Maps to: Quick search functionality
   */
  static async quickSearch(query: string, limit?: number): Promise<SearchResult[]> {
    return apiClient.get('/api/catalog/search/quick', {
      params: { query, limit }
    });
  }

  /**
   * Advanced search with multiple criteria
   * Maps to: Advanced search engine
   */
  static async advancedSearch(request: AdvancedSearchRequest): Promise<SearchResponse> {
    return apiClient.post('/api/catalog/search/advanced', request);
  }

  /**
   * Search with intelligent filters
   * Maps to: Smart filtering system
   */
  static async searchWithFilters(query: string, filters: SearchFilter[]): Promise<SearchResponse> {
    return apiClient.post('/api/catalog/search/filtered', { query, filters });
  }

  /**
   * Get search facets for query refinement
   * Maps to: Search faceting system
   */
  static async getSearchFacets(query: string, category?: string): Promise<SearchFacet[]> {
    return apiClient.get('/api/catalog/search/facets', {
      params: { query, category }
    });
  }

  /**
   * Refine search with facet selection
   * Maps to: Faceted search refinement
   */
  static async refineSearchWithFacets(query: string, selectedFacets: any[]): Promise<SearchResponse> {
    return apiClient.post('/api/catalog/search/refine', {
      query,
      selected_facets: selectedFacets
    });
  }

  /**
   * Search within specific context or scope
   * Maps to: Contextual search
   */
  static async contextualSearch(query: string, context: any): Promise<SearchResponse> {
    return apiClient.post('/api/catalog/search/contextual', { query, context });
  }

  /**
   * Get search suggestions and auto-complete
   * Maps to: Search suggestion engine
   */
  static async getSearchSuggestions(request: AutoCompleteRequest): Promise<AutoCompleteResponse> {
    return apiClient.post('/api/catalog/search/suggestions', request);
  }
}

/**
 * ==============================================
 * SEMANTIC SEARCH ENGINE
 * ==============================================
 */

export class SemanticSearchAPI {
  /**
   * Perform semantic search using vector embeddings
   * Maps to: SemanticSearchService.perform_semantic_search()
   */
  static async performSemanticSearch(request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    return apiClient.post('/api/catalog/search/semantic', request);
  }

  /**
   * Find similar assets using semantic similarity
   * Maps to: Semantic similarity search
   */
  static async findSimilarAssets(assetId: string, threshold?: number, limit?: number): Promise<SearchResult[]> {
    return apiClient.get(`/api/catalog/search/semantic/similar/${assetId}`, {
      params: { threshold, limit }
    });
  }

  /**
   * Search by concept or theme
   * Maps to: Conceptual search capabilities
   */
  static async searchByConcept(concept: string, filters?: SearchFilter[]): Promise<SearchResponse> {
    return apiClient.post('/api/catalog/search/semantic/concept', { concept, filters });
  }

  /**
   * Semantic search with context awareness
   * Maps to: Context-aware semantic search
   */
  static async contextAwareSemanticSearch(query: string, context: any): Promise<SemanticSearchResponse> {
    return apiClient.post('/api/catalog/search/semantic/context-aware', { query, context });
  }

  /**
   * Build semantic search index
   * Maps to: SemanticSearchService.index_catalog_content()
   */
  static async buildSemanticIndex(assetIds?: string[], config?: SearchIndexConfig): Promise<any> {
    return apiClient.post('/api/catalog/search/semantic/index/build', {
      asset_ids: assetIds,
      config
    });
  }

  /**
   * Update semantic embeddings
   * Maps to: Embedding update and refresh
   */
  static async updateSemanticEmbeddings(assetIds: string[]): Promise<any> {
    return apiClient.post('/api/catalog/search/semantic/embeddings/update', { asset_ids: assetIds });
  }

  /**
   * Get semantic search analytics
   * Maps to: Semantic search performance metrics
   */
  static async getSemanticSearchAnalytics(timeframe?: string): Promise<SearchAnalytics> {
    return apiClient.get('/api/catalog/search/semantic/analytics', {
      params: { timeframe }
    });
  }
}

/**
 * ==============================================
 * NATURAL LANGUAGE QUERY PROCESSOR
 * ==============================================
 */

export class NaturalLanguageQueryAPI {
  /**
   * Process natural language queries
   * Maps to: NLP query processing
   */
  static async processNaturalLanguageQuery(query: NaturalLanguageQuery): Promise<NLQueryResponse> {
    return apiClient.post('/api/catalog/search/nlp/process', query);
  }

  /**
   * Convert natural language to structured query
   * Maps to: Query translation and parsing
   */
  static async translateToStructuredQuery(naturalLanguageQuery: string): Promise<any> {
    return apiClient.post('/api/catalog/search/nlp/translate', {
      natural_language_query: naturalLanguageQuery
    });
  }

  /**
   * Get query intent analysis
   * Maps to: Query intent recognition
   */
  static async analyzeQueryIntent(query: string): Promise<any> {
    return apiClient.post('/api/catalog/search/nlp/intent', { query });
  }

  /**
   * Extract entities from natural language query
   * Maps to: Named entity recognition
   */
  static async extractQueryEntities(query: string): Promise<any[]> {
    return apiClient.post('/api/catalog/search/nlp/entities', { query });
  }

  /**
   * Get query suggestions based on intent
   * Maps to: Intent-based query suggestions
   */
  static async getIntentBasedSuggestions(query: string, intent?: string): Promise<SearchSuggestion[]> {
    return apiClient.post('/api/catalog/search/nlp/suggestions', { query, intent });
  }

  /**
   * Process conversational queries
   * Maps to: Conversational search interface
   */
  static async processConversationalQuery(query: string, conversationContext?: any): Promise<any> {
    return apiClient.post('/api/catalog/search/nlp/conversational', {
      query,
      conversation_context: conversationContext
    });
  }
}

/**
 * ==============================================
 * SEARCH PERSONALIZATION
 * ==============================================
 */

export class SearchPersonalizationAPI {
  /**
   * Configure personalized search preferences
   * Maps to: SemanticSearchService.personalize_search_experience()
   */
  static async configurePersonalization(userId: string, preferences: SearchPersonalization): Promise<any> {
    return apiClient.put(`/api/catalog/search/personalization/${userId}`, preferences);
  }

  /**
   * Get personalized search results
   * Maps to: Personalized search ranking
   */
  static async getPersonalizedResults(userId: string, query: string, filters?: SearchFilter[]): Promise<SearchResponse> {
    return apiClient.post(`/api/catalog/search/personalized/${userId}`, { query, filters });
  }

  /**
   * Get user's search history
   * Maps to: Search history tracking
   */
  static async getUserSearchHistory(userId: string, limit?: number): Promise<any[]> {
    return apiClient.get(`/api/catalog/search/history/${userId}`, {
      params: { limit }
    });
  }

  /**
   * Get personalized recommendations
   * Maps to: Personalized search recommendations
   */
  static async getPersonalizedRecommendations(userId: string, category?: string): Promise<SearchRecommendation[]> {
    return apiClient.get(`/api/catalog/search/recommendations/${userId}`, {
      params: { category }
    });
  }

  /**
   * Update user search preferences based on behavior
   * Maps to: Behavioral learning and adaptation
   */
  static async updatePreferencesFromBehavior(userId: string, searchBehavior: any): Promise<any> {
    return apiClient.post(`/api/catalog/search/personalization/${userId}/learn`, searchBehavior);
  }

  /**
   * Get trending searches for user's domain
   * Maps to: Domain-specific trending
   */
  static async getTrendingSearches(userId: string, timeframe?: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/search/trending/${userId}`, {
      params: { timeframe }
    });
  }
}

/**
 * ==============================================
 * SAVED SEARCHES & ALERTS
 * ==============================================
 */

export class SavedSearchAPI {
  /**
   * Create saved search
   * Maps to: Saved search management
   */
  static async createSavedSearch(savedSearch: SavedSearch): Promise<SavedSearch> {
    return apiClient.post('/api/catalog/search/saved', savedSearch);
  }

  /**
   * Get user's saved searches
   * Maps to: Saved search retrieval
   */
  static async getSavedSearches(userId: string, category?: string): Promise<SavedSearch[]> {
    return apiClient.get(`/api/catalog/search/saved/user/${userId}`, {
      params: { category }
    });
  }

  /**
   * Execute saved search
   * Maps to: Saved search execution
   */
  static async executeSavedSearch(savedSearchId: string): Promise<SearchResponse> {
    return apiClient.post(`/api/catalog/search/saved/${savedSearchId}/execute`);
  }

  /**
   * Update saved search
   * Maps to: Saved search modification
   */
  static async updateSavedSearch(savedSearchId: string, updates: Partial<SavedSearch>): Promise<SavedSearch> {
    return apiClient.put(`/api/catalog/search/saved/${savedSearchId}`, updates);
  }

  /**
   * Delete saved search
   * Maps to: Saved search deletion
   */
  static async deleteSavedSearch(savedSearchId: string): Promise<void> {
    return apiClient.delete(`/api/catalog/search/saved/${savedSearchId}`);
  }

  /**
   * Create search alert
   * Maps to: Search alerting system
   */
  static async createSearchAlert(alertConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/search/alerts', alertConfig);
  }

  /**
   * Get search alerts
   * Maps to: Alert management
   */
  static async getSearchAlerts(userId: string, status?: string): Promise<any[]> {
    return apiClient.get(`/api/catalog/search/alerts/user/${userId}`, {
      params: { status }
    });
  }

  /**
   * Share saved search with team
   * Maps to: Search sharing capabilities
   */
  static async shareSavedSearch(savedSearchId: string, shareConfig: any): Promise<any> {
    return apiClient.post(`/api/catalog/search/saved/${savedSearchId}/share`, shareConfig);
  }
}

/**
 * ==============================================
 * SEARCH ANALYTICS & OPTIMIZATION
 * ==============================================
 */

export class SearchAnalyticsAPI {
  /**
   * Get comprehensive search analytics
   * Maps to: SemanticSearchService.analyze_search_patterns()
   */
  static async getSearchAnalytics(timeframe?: string, userId?: string): Promise<SearchAnalytics> {
    return apiClient.get('/api/catalog/search/analytics', {
      params: { timeframe, user_id: userId }
    });
  }

  /**
   * Get search performance metrics
   * Maps to: Search performance tracking
   */
  static async getSearchPerformanceMetrics(): Promise<SearchMetrics> {
    return apiClient.get('/api/catalog/search/metrics/performance');
  }

  /**
   * Analyze search result relevance
   * Maps to: Relevance analysis and optimization
   */
  static async analyzeSearchRelevance(query: string, results: SearchResult[]): Promise<any> {
    return apiClient.post('/api/catalog/search/analytics/relevance', { query, results });
  }

  /**
   * Get popular search terms
   * Maps to: Popular searches tracking
   */
  static async getPopularSearchTerms(timeframe?: string, limit?: number): Promise<any[]> {
    return apiClient.get('/api/catalog/search/analytics/popular-terms', {
      params: { timeframe, limit }
    });
  }

  /**
   * Get search conversion metrics
   * Maps to: Search success rate tracking
   */
  static async getSearchConversionMetrics(timeframe?: string): Promise<any> {
    return apiClient.get('/api/catalog/search/analytics/conversion', {
      params: { timeframe }
    });
  }

  /**
   * Analyze search abandonment patterns
   * Maps to: Search abandonment analysis
   */
  static async analyzeSearchAbandonment(): Promise<any> {
    return apiClient.get('/api/catalog/search/analytics/abandonment');
  }

  /**
   * Get search quality scores
   * Maps to: Search quality assessment
   */
  static async getSearchQualityScores(queries?: string[]): Promise<any> {
    return apiClient.post('/api/catalog/search/analytics/quality', { queries });
  }

  /**
   * Generate search insights report
   * Maps to: Search insights generation
   */
  static async generateSearchInsightsReport(reportConfig: any): Promise<SearchInsight> {
    return apiClient.post('/api/catalog/search/analytics/insights', reportConfig);
  }
}

/**
 * ==============================================
 * SEARCH OPTIMIZATION & RANKING
 * ==============================================
 */

export class SearchOptimizationAPI {
  /**
   * Optimize search rankings using ML
   * Maps to: SemanticSearchService.rank_search_results()
   */
  static async optimizeSearchRankings(optimizationConfig: SearchOptimization): Promise<any> {
    return apiClient.post('/api/catalog/search/optimization/rankings', optimizationConfig);
  }

  /**
   * A/B test search algorithms
   * Maps to: Search algorithm testing
   */
  static async runSearchABTest(testConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/search/optimization/ab-test', testConfig);
  }

  /**
   * Optimize search index performance
   * Maps to: Index optimization
   */
  static async optimizeSearchIndex(optimizationOptions?: any): Promise<any> {
    return apiClient.post('/api/catalog/search/optimization/index', optimizationOptions);
  }

  /**
   * Update search ranking models
   * Maps to: Ranking model management
   */
  static async updateRankingModels(modelUpdates: any): Promise<any> {
    return apiClient.put('/api/catalog/search/optimization/ranking-models', modelUpdates);
  }

  /**
   * Calibrate search relevance scores
   * Maps to: Relevance score calibration
   */
  static async calibrateRelevanceScores(calibrationData: any): Promise<any> {
    return apiClient.post('/api/catalog/search/optimization/calibrate', calibrationData);
  }

  /**
   * Get search optimization recommendations
   * Maps to: Search improvement recommendations
   */
  static async getOptimizationRecommendations(): Promise<any[]> {
    return apiClient.get('/api/catalog/search/optimization/recommendations');
  }

  /**
   * Monitor search performance in real-time
   * Maps to: Real-time search monitoring
   */
  static async monitorSearchPerformance(): Promise<any> {
    return apiClient.get('/api/catalog/search/optimization/monitor');
  }
}

/**
 * ==============================================
 * DATA DISCOVERY ENGINE
 * ==============================================
 */

export class DataDiscoveryAPI {
  /**
   * Discover data assets automatically
   * Maps to: data_discovery_routes.py functionality
   */
  static async discoverDataAssets(request: DiscoveryRequest): Promise<DiscoveryResult> {
    return apiClient.post('/api/catalog/discovery/assets', request);
  }

  /**
   * Scan for new or updated assets
   * Maps to: Asset scanning and discovery
   */
  static async scanForAssets(scanConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/discovery/scan', scanConfig);
  }

  /**
   * Analyze data asset relationships
   * Maps to: Relationship discovery
   */
  static async analyzeAssetRelationships(assetIds: string[]): Promise<any> {
    return apiClient.post('/api/catalog/discovery/relationships', { asset_ids: assetIds });
  }

  /**
   * Discover hidden patterns in data
   * Maps to: Pattern discovery engine
   */
  static async discoverDataPatterns(assetId: string, analysisType?: string): Promise<any> {
    return apiClient.post('/api/catalog/discovery/patterns', {
      asset_id: assetId,
      analysis_type: analysisType
    });
  }

  /**
   * Get discovery recommendations
   * Maps to: Discovery-based recommendations
   */
  static async getDiscoveryRecommendations(userId?: string, context?: any): Promise<any[]> {
    return apiClient.get('/api/catalog/discovery/recommendations', {
      params: { user_id: userId, context }
    });
  }

  /**
   * Schedule automated discovery jobs
   * Maps to: Discovery job scheduling
   */
  static async scheduleDiscoveryJob(jobConfig: any): Promise<any> {
    return apiClient.post('/api/catalog/discovery/jobs/schedule', jobConfig);
  }

  /**
   * Get discovery job status
   * Maps to: Discovery job monitoring
   */
  static async getDiscoveryJobStatus(jobId: string): Promise<any> {
    return apiClient.get(`/api/catalog/discovery/jobs/${jobId}/status`);
  }
}

/**
 * ==============================================
 * SEARCH CONFIGURATION & MANAGEMENT
 * ==============================================
 */

export class SearchConfigurationAPI {
  /**
   * Configure search system settings
   * Maps to: Search system configuration
   */
  static async configureSearchSystem(config: SearchConfiguration): Promise<any> {
    return apiClient.put('/api/catalog/search/configuration', config);
  }

  /**
   * Get current search configuration
   * Maps to: Configuration retrieval
   */
  static async getSearchConfiguration(): Promise<SearchConfiguration> {
    return apiClient.get('/api/catalog/search/configuration');
  }

  /**
   * Update search field mappings
   * Maps to: Field mapping management
   */
  static async updateFieldMappings(mappings: any): Promise<any> {
    return apiClient.put('/api/catalog/search/configuration/field-mappings', mappings);
  }

  /**
   * Configure search synonyms and thesaurus
   * Maps to: Synonym management
   */
  static async configureSynonyms(synonymConfig: any): Promise<any> {
    return apiClient.put('/api/catalog/search/configuration/synonyms', synonymConfig);
  }

  /**
   * Set search boost factors
   * Maps to: Search boosting configuration
   */
  static async setSearchBoostFactors(boostConfig: any): Promise<any> {
    return apiClient.put('/api/catalog/search/configuration/boost-factors', boostConfig);
  }

  /**
   * Configure search filters and facets
   * Maps to: Filter and facet configuration
   */
  static async configureFiltersAndFacets(filtersConfig: any): Promise<any> {
    return apiClient.put('/api/catalog/search/configuration/filters-facets', filtersConfig);
  }

  /**
   * Reset search configuration to defaults
   * Maps to: Configuration reset
   */
  static async resetSearchConfiguration(): Promise<any> {
    return apiClient.post('/api/catalog/search/configuration/reset');
  }
}

/**
 * ==============================================
 * COMPREHENSIVE SEARCH API
 * ==============================================
 */

export class SearchAPI {
  // Combine all search APIs
  static readonly UnifiedSearch = UnifiedSearchAPI;
  static readonly SemanticSearch = SemanticSearchAPI;
  static readonly NaturalLanguageQuery = NaturalLanguageQueryAPI;
  static readonly Personalization = SearchPersonalizationAPI;
  static readonly SavedSearches = SavedSearchAPI;
  static readonly Analytics = SearchAnalyticsAPI;
  static readonly Optimization = SearchOptimizationAPI;
  static readonly DataDiscovery = DataDiscoveryAPI;
  static readonly Configuration = SearchConfigurationAPI;

  /**
   * Get comprehensive search system overview
   * Maps to: Complete search system status
   */
  static async getSearchSystemOverview(): Promise<any> {
    return apiClient.get('/api/catalog/search/overview');
  }

  /**
   * Perform health check on search system
   * Maps to: Search system health monitoring
   */
  static async performSearchHealthCheck(): Promise<any> {
    return apiClient.get('/api/catalog/search/health-check');
  }

  /**
   * Export search data and configurations
   * Maps to: Search data export
   */
  static async exportSearchData(exportConfig: SearchExport): Promise<Blob> {
    return apiClient.post('/api/catalog/search/export', exportConfig, {
      responseType: 'blob'
    });
  }

  /**
   * Rebuild search index
   * Maps to: Index rebuilding
   */
  static async rebuildSearchIndex(rebuildOptions?: any): Promise<any> {
    return apiClient.post('/api/catalog/search/index/rebuild', rebuildOptions);
  }

  /**
   * Get search system statistics
   * Maps to: System-wide search statistics
   */
  static async getSearchSystemStats(): Promise<any> {
    return apiClient.get('/api/catalog/search/system/stats');
  }

  /**
   * Clear search cache
   * Maps to: Search cache management
   */
  static async clearSearchCache(cacheType?: string): Promise<any> {
    return apiClient.post('/api/catalog/search/cache/clear', { cache_type: cacheType });
  }
}

// Default export with all search APIs
export default SearchAPI;