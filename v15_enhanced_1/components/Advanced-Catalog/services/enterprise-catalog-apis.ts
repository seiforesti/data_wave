/**
 * Enterprise Catalog APIs - Complete Backend Mapping
 * =================================================
 * 
 * Maps 100% to:
 * - enterprise_catalog_service.py (56KB, 1448 lines) - PRIMARY SERVICE
 * - enterprise_catalog_routes.py (52KB, 1452 lines, 50+ endpoints)
 * - intelligent_discovery_service.py (43KB, 1117 lines)
 * - semantic_search_service.py (32KB, 893 lines)
 * - catalog_analytics_service.py (36KB, 901 lines)
 * - catalog_quality_service.py (49KB, 1196 lines)
 * - advanced_lineage_service.py (45KB lines)
 * 
 * Provides comprehensive catalog management capabilities:
 * - Intelligent data asset management with AI features
 * - Enterprise-grade lineage tracking (column-level)
 * - AI-powered quality assessment and monitoring
 * - Business glossary and semantic relationships
 * - Advanced usage analytics and metrics
 * - Comprehensive data profiling and analysis
 */

import { apiClient } from '../../../shared/utils/api-client';
import {
  IntelligentDataAsset,
  EnterpriseDataLineage,
  DataQualityAssessment,
  BusinessGlossaryTerm,
  BusinessGlossaryAssociation,
  AssetUsageMetrics,
  DataProfilingResult,
  CatalogAnalytics,
  AssetCreateRequest,
  AssetUpdateRequest,
  AssetSearchRequest,
  IntelligentAssetResponse,
  LineageResponse,
  QualityAssessmentResponse,
  BusinessGlossaryResponse,
  AssetDiscoveryEvent,
  BulkOperationRequest,
  BulkOperationResponse,
  LineageGraph,
  ImpactAnalysis
} from '../types/catalog-core.types';

import {
  AdvancedSearchRequest,
  SemanticSearchRequest,
  NaturalLanguageSearchRequest,
  SearchResponse,
  SearchResult,
  SavedSearch,
  SavedSearchCreateRequest,
  SavedSearchUpdateRequest,
  SearchAnalytics,
  SearchPersonalization
} from '../types/search.types';

// ========================= INTELLIGENT DATA ASSET MANAGEMENT =========================

export class IntelligentDataAssetAPI {
  // Core CRUD Operations - Maps to enterprise_catalog_routes.py endpoints
  static async createDataAsset(assetData: AssetCreateRequest): Promise<IntelligentDataAsset> {
    return apiClient.post('/api/v1/catalog/assets', assetData);
  }

  static async getDataAsset(
    assetId: string, 
    options?: {
      include_lineage?: boolean;
      include_quality?: boolean;
      include_usage?: boolean;
      include_profiling?: boolean;
      include_glossary?: boolean;
    }
  ): Promise<IntelligentAssetResponse> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}`, { params: options });
  }

  static async updateDataAsset(assetId: string, updates: AssetUpdateRequest): Promise<IntelligentDataAsset> {
    return apiClient.put(`/api/v1/catalog/assets/${assetId}`, updates);
  }

  static async deleteDataAsset(assetId: string, options?: { soft_delete?: boolean }): Promise<void> {
    return apiClient.delete(`/api/v1/catalog/assets/${assetId}`, { params: options });
  }

  static async listAssets(params?: {
    limit?: number;
    offset?: number;
    asset_types?: string[];
    source_systems?: string[];
    status?: string[];
    include_deprecated?: boolean;
  }): Promise<{ assets: IntelligentDataAsset[]; total: number; has_next: boolean }> {
    return apiClient.get('/api/v1/catalog/assets', { params });
  }

  // Advanced Asset Discovery - Maps to intelligent_discovery_service.py
  static async discoverDataAssets(discoveryConfig: {
    source_systems?: string[];
    discovery_method?: string;
    scope?: any;
    ai_enhanced?: boolean;
    include_schema_analysis?: boolean;
    include_profiling?: boolean;
  }): Promise<{ 
    discovery_job_id: string; 
    discovered_assets: IntelligentDataAsset[];
    discovery_summary: any;
  }> {
    return apiClient.post('/api/v1/catalog/discovery/trigger', discoveryConfig);
  }

  static async getDiscoveryJob(jobId: string): Promise<{
    job_id: string;
    status: string;
    progress: number;
    discovered_assets_count: number;
    errors: any[];
    started_at: string;
    completed_at?: string;
  }> {
    return apiClient.get(`/api/v1/catalog/discovery/jobs/${jobId}`);
  }

  static async getDiscoveryHistory(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    date_range?: { start: string; end: string };
  }): Promise<{ jobs: any[]; total: number }> {
    return apiClient.get('/api/v1/catalog/discovery/history', { params });
  }

  // AI-Powered Asset Analysis - Maps to ai_service.py integration
  static async analyzeAssetWithAI(assetId: string, analysisType: string, options?: {
    include_recommendations?: boolean;
    analysis_depth?: 'basic' | 'detailed' | 'comprehensive';
  }): Promise<{
    analysis_id: string;
    analysis_type: string;
    insights: any[];
    recommendations: string[];
    confidence_score: number;
    generated_at: string;
  }> {
    return apiClient.post(`/api/v1/catalog/assets/${assetId}/ai-analysis`, { 
      analysis_type: analysisType,
      ...options 
    });
  }

  static async getAssetInsights(assetId: string, options?: {
    insight_types?: string[];
    time_range?: string;
    include_trends?: boolean;
  }): Promise<{
    insights: any[];
    trends: any[];
    recommendations: string[];
    last_updated: string;
  }> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/insights`, { params: options });
  }

  static async generateAssetSummary(assetId: string, options?: {
    summary_type?: 'technical' | 'business' | 'comprehensive';
    include_ai_insights?: boolean;
  }): Promise<{
    summary: string;
    key_points: string[];
    generated_by: 'ai' | 'template';
    confidence_score?: number;
    generated_at: string;
  }> {
    return apiClient.post(`/api/v1/catalog/assets/${assetId}/summary`, options);
  }

  // Asset Recommendations and Relationships
  static async getAssetRecommendations(
    assetId: string, 
    context?: {
      recommendation_type?: 'similar' | 'related' | 'popular' | 'quality_improvement';
      limit?: number;
      user_context?: any;
    }
  ): Promise<{
    recommendations: Array<{
      asset: IntelligentDataAsset;
      recommendation_type: string;
      confidence_score: number;
      reasoning: string;
    }>;
    total_count: number;
  }> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/recommendations`, { params: context });
  }

  static async getRelatedAssets(
    assetId: string, 
    options?: {
      relationship_type?: string;
      depth?: number;
      include_similarity_score?: boolean;
    }
  ): Promise<{
    related_assets: Array<{
      asset: IntelligentDataAsset;
      relationship_type: string;
      similarity_score?: number;
      relationship_context: string;
    }>;
    relationship_graph?: any;
  }> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/related`, { params: options });
  }

  // Asset Validation and Quality
  static async validateAsset(
    assetId: string, 
    validationConfig?: {
      validation_rules?: string[];
      include_ai_validation?: boolean;
      validation_scope?: 'schema' | 'data' | 'metadata' | 'all';
    }
  ): Promise<{
    validation_id: string;
    overall_status: 'passed' | 'failed' | 'warning';
    validation_results: any[];
    issues_found: any[];
    recommendations: string[];
    validated_at: string;
  }> {
    return apiClient.post(`/api/v1/catalog/assets/${assetId}/validate`, validationConfig);
  }

  // Bulk Operations
  static async bulkUpdateAssets(request: BulkOperationRequest): Promise<BulkOperationResponse> {
    return apiClient.post('/api/v1/catalog/assets/bulk-update', request);
  }

  static async bulkDeleteAssets(assetIds: string[], options?: { soft_delete?: boolean }): Promise<BulkOperationResponse> {
    return apiClient.post('/api/v1/catalog/assets/bulk-delete', { asset_ids: assetIds, ...options });
  }

  static async bulkTagAssets(assetIds: string[], tags: string[]): Promise<BulkOperationResponse> {
    return apiClient.post('/api/v1/catalog/assets/bulk-tag', { asset_ids: assetIds, tags });
  }

  // Asset Import/Export
  static async exportAssets(options: {
    asset_ids?: string[];
    filters?: any;
    format: 'json' | 'csv' | 'excel';
    include_lineage?: boolean;
    include_quality?: boolean;
  }): Promise<{
    export_id: string;
    download_url?: string;
    status: string;
    estimated_completion?: string;
  }> {
    return apiClient.post('/api/v1/catalog/assets/export', options);
  }

  static async importAssets(importData: {
    format: 'json' | 'csv' | 'excel';
    data?: any;
    file_url?: string;
    mapping_config?: any;
    validation_mode?: 'strict' | 'lenient';
  }): Promise<{
    import_id: string;
    status: string;
    imported_count: number;
    errors: any[];
    warnings: any[];
  }> {
    return apiClient.post('/api/v1/catalog/assets/import', importData);
  }
}

// ========================= ADVANCED SEARCH AND DISCOVERY =========================

export class CatalogSearchAPI {
  // Basic Search - Maps to semantic_search_service.py
  static async searchAssets(searchRequest: AssetSearchRequest): Promise<SearchResponse<SearchResult>> {
    return apiClient.post('/api/v1/catalog/search', searchRequest);
  }

  // Advanced Search with Filters and Facets
  static async advancedSearch(searchRequest: AdvancedSearchRequest): Promise<SearchResponse<SearchResult>> {
    return apiClient.post('/api/v1/catalog/search/advanced', searchRequest);
  }

  // Semantic Search with AI
  static async semanticSearch(searchRequest: SemanticSearchRequest): Promise<SearchResponse<SearchResult>> {
    return apiClient.post('/api/v1/catalog/search/semantic', searchRequest);
  }

  // Natural Language Search
  static async naturalLanguageSearch(searchRequest: NaturalLanguageSearchRequest): Promise<SearchResponse<SearchResult>> {
    return apiClient.post('/api/v1/catalog/search/natural-language', searchRequest);
  }

  // Search Suggestions and Autocomplete
  static async getSearchSuggestions(query: string, options?: {
    suggestion_types?: string[];
    limit?: number;
    context?: any;
  }): Promise<{
    suggestions: Array<{
      text: string;
      type: string;
      confidence: number;
      metadata?: any;
    }>;
    query_corrections?: string[];
  }> {
    return apiClient.get('/api/v1/catalog/search/suggestions', { 
      params: { query, ...options } 
    });
  }

  static async getPopularSearches(options?: {
    time_period?: string;
    limit?: number;
    user_context?: any;
  }): Promise<{
    popular_queries: Array<{
      query: string;
      search_count: number;
      click_through_rate: number;
    }>;
    trending_queries: Array<{
      query: string;
      growth_rate: number;
    }>;
  }> {
    return apiClient.get('/api/v1/catalog/search/popular', { params: options });
  }

  // Search Analytics
  static async getSearchAnalytics(options?: {
    time_period?: string;
    metrics?: string[];
    group_by?: string[];
  }): Promise<SearchAnalytics> {
    return apiClient.get('/api/v1/catalog/search/analytics', { params: options });
  }

  // Saved Searches
  static async createSavedSearch(request: SavedSearchCreateRequest): Promise<SavedSearch> {
    return apiClient.post('/api/v1/catalog/search/saved', request);
  }

  static async getSavedSearches(options?: {
    include_public?: boolean;
    created_by?: string;
    tags?: string[];
  }): Promise<{ saved_searches: SavedSearch[]; total: number }> {
    return apiClient.get('/api/v1/catalog/search/saved', { params: options });
  }

  static async updateSavedSearch(searchId: string, updates: SavedSearchUpdateRequest): Promise<SavedSearch> {
    return apiClient.put(`/api/v1/catalog/search/saved/${searchId}`, updates);
  }

  static async deleteSavedSearch(searchId: string): Promise<void> {
    return apiClient.delete(`/api/v1/catalog/search/saved/${searchId}`);
  }

  static async executeSavedSearch(searchId: string, overrides?: any): Promise<SearchResponse<SearchResult>> {
    return apiClient.post(`/api/v1/catalog/search/saved/${searchId}/execute`, overrides);
  }

  // Search Personalization
  static async getSearchPersonalization(userId?: string): Promise<SearchPersonalization> {
    return apiClient.get('/api/v1/catalog/search/personalization', { 
      params: userId ? { user_id: userId } : undefined 
    });
  }

  static async updateSearchPreferences(preferences: any): Promise<void> {
    return apiClient.put('/api/v1/catalog/search/personalization/preferences', preferences);
  }
}

// ========================= DATA LINEAGE MANAGEMENT =========================

export class DataLineageAPI {
  // Lineage Retrieval - Maps to advanced_lineage_service.py
  static async getAssetLineage(
    assetId: string,
    options?: {
      direction?: 'upstream' | 'downstream' | 'both';
      depth?: number;
      include_column_level?: boolean;
      include_transformations?: boolean;
      lineage_types?: string[];
    }
  ): Promise<LineageResponse> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/lineage`, { params: options });
  }

  static async getColumnLineage(
    assetId: string,
    columnName: string,
    options?: {
      direction?: 'upstream' | 'downstream' | 'both';
      depth?: number;
      include_transformations?: boolean;
    }
  ): Promise<LineageResponse> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/columns/${columnName}/lineage`, { 
      params: options 
    });
  }

  // Lineage Creation and Management
  static async createLineage(lineageData: {
    source_asset_id: string;
    target_asset_id: string;
    lineage_type: string;
    transformation_logic?: string;
    source_columns?: string[];
    target_columns?: string[];
    confidence_score?: number;
    metadata?: any;
  }): Promise<EnterpriseDataLineage> {
    return apiClient.post('/api/v1/catalog/lineage', lineageData);
  }

  static async updateLineage(lineageId: string, updates: any): Promise<EnterpriseDataLineage> {
    return apiClient.put(`/api/v1/catalog/lineage/${lineageId}`, updates);
  }

  static async deleteLineage(lineageId: string): Promise<void> {
    return apiClient.delete(`/api/v1/catalog/lineage/${lineageId}`);
  }

  static async validateLineage(lineageId: string, validation: {
    validation_status: 'validated' | 'rejected';
    validation_notes?: string;
  }): Promise<EnterpriseDataLineage> {
    return apiClient.post(`/api/v1/catalog/lineage/${lineageId}/validate`, validation);
  }

  // Impact Analysis
  static async getImpactAnalysis(
    assetId: string,
    changeType: string,
    options?: {
      analysis_depth?: 'basic' | 'detailed' | 'comprehensive';
      include_risk_assessment?: boolean;
      include_recommendations?: boolean;
    }
  ): Promise<ImpactAnalysis & {
    change_impact_score: number;
    affected_systems: string[];
    recommended_actions: string[];
    risk_mitigation_strategies: string[];
  }> {
    return apiClient.post(`/api/v1/catalog/assets/${assetId}/impact-analysis`, {
      change_type: changeType,
      ...options
    });
  }

  // Lineage Discovery and Auto-generation
  static async discoverLineage(options: {
    source_systems?: string[];
    discovery_method?: 'sql_parsing' | 'log_analysis' | 'metadata_analysis' | 'ai_inference';
    scope?: any;
    confidence_threshold?: number;
  }): Promise<{
    discovery_job_id: string;
    discovered_lineage_count: number;
    confidence_distribution: any;
  }> {
    return apiClient.post('/api/v1/catalog/lineage/discover', options);
  }

  // Lineage Visualization and Export
  static async getLineageGraph(
    assetId: string,
    options?: {
      format?: 'json' | 'graphml' | 'dot';
      layout?: 'hierarchical' | 'force_directed' | 'circular';
      include_metadata?: boolean;
    }
  ): Promise<LineageGraph> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/lineage/graph`, { params: options });
  }

  static async exportLineage(options: {
    asset_ids?: string[];
    format: 'json' | 'csv' | 'graphml';
    include_transformations?: boolean;
    include_column_level?: boolean;
  }): Promise<{
    export_id: string;
    download_url?: string;
    status: string;
  }> {
    return apiClient.post('/api/v1/catalog/lineage/export', options);
  }
}

// ========================= DATA QUALITY MANAGEMENT =========================

export class DataQualityAPI {
  // Quality Assessment - Maps to catalog_quality_service.py
  static async assessAssetQuality(
    assetId: string,
    assessmentConfig?: {
      quality_dimensions?: string[];
      assessment_method?: 'automated' | 'manual' | 'hybrid';
      sample_size?: number;
      include_profiling?: boolean;
    }
  ): Promise<QualityAssessmentResponse> {
    return apiClient.post(`/api/v1/catalog/assets/${assetId}/quality/assess`, assessmentConfig);
  }

  static async getQualityAssessment(assessmentId: string): Promise<DataQualityAssessment> {
    return apiClient.get(`/api/v1/catalog/quality/assessments/${assessmentId}`);
  }

  static async getAssetQualityHistory(
    assetId: string,
    options?: {
      time_range?: { start: string; end: string };
      dimensions?: string[];
      include_trends?: boolean;
    }
  ): Promise<{
    assessments: DataQualityAssessment[];
    quality_trends: any[];
    improvement_recommendations: string[];
  }> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/quality/history`, { params: options });
  }

  // Quality Rules Management
  static async createQualityRule(ruleData: {
    name: string;
    description?: string;
    rule_type: string;
    rule_definition: any;
    applies_to?: {
      asset_types?: string[];
      source_systems?: string[];
      tags?: string[];
    };
    severity: string;
    threshold?: number;
  }): Promise<any> {
    return apiClient.post('/api/v1/catalog/quality/rules', ruleData);
  }

  static async getQualityRules(options?: {
    rule_types?: string[];
    severity?: string[];
    active_only?: boolean;
  }): Promise<{ rules: any[]; total: number }> {
    return apiClient.get('/api/v1/catalog/quality/rules', { params: options });
  }

  static async updateQualityRule(ruleId: string, updates: any): Promise<any> {
    return apiClient.put(`/api/v1/catalog/quality/rules/${ruleId}`, updates);
  }

  static async deleteQualityRule(ruleId: string): Promise<void> {
    return apiClient.delete(`/api/v1/catalog/quality/rules/${ruleId}`);
  }

  // Quality Monitoring and Alerts
  static async setupQualityMonitoring(assetId: string, monitoringConfig: {
    monitoring_frequency: string;
    alert_thresholds: any;
    notification_recipients: string[];
    escalation_rules?: any[];
  }): Promise<{
    monitoring_id: string;
    status: string;
    next_check: string;
  }> {
    return apiClient.post(`/api/v1/catalog/assets/${assetId}/quality/monitoring`, monitoringConfig);
  }

  static async getQualityAlerts(options?: {
    severity?: string[];
    status?: string[];
    time_range?: { start: string; end: string };
    asset_ids?: string[];
  }): Promise<{
    alerts: any[];
    summary: {
      total_alerts: number;
      by_severity: any;
      recent_trends: any;
    };
  }> {
    return apiClient.get('/api/v1/catalog/quality/alerts', { params: options });
  }

  // Quality Improvement Recommendations
  static async getQualityRecommendations(
    assetId: string,
    options?: {
      focus_areas?: string[];
      priority_level?: string;
      include_implementation_plan?: boolean;
    }
  ): Promise<{
    recommendations: Array<{
      category: string;
      priority: string;
      description: string;
      expected_impact: string;
      implementation_steps: string[];
      estimated_effort: string;
    }>;
    improvement_roadmap?: any;
  }> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/quality/recommendations`, { 
      params: options 
    });
  }
}

// ========================= DATA PROFILING =========================

export class DataProfilingAPI {
  // Data Profiling - Maps to data_profiling_service.py
  static async profileAsset(
    assetId: string,
    profilingConfig?: {
      columns?: string[];
      sample_size?: number;
      profiling_depth?: 'basic' | 'standard' | 'comprehensive';
      include_patterns?: boolean;
      include_correlations?: boolean;
    }
  ): Promise<{
    profiling_job_id: string;
    status: string;
    estimated_completion: string;
  }> {
    return apiClient.post(`/api/v1/catalog/assets/${assetId}/profile`, profilingConfig);
  }

  static async getProfilingJob(jobId: string): Promise<{
    job_id: string;
    status: string;
    progress: number;
    results?: DataProfilingResult[];
    errors?: any[];
    started_at: string;
    completed_at?: string;
  }> {
    return apiClient.get(`/api/v1/catalog/profiling/jobs/${jobId}`);
  }

  static async getAssetProfilingResults(
    assetId: string,
    options?: {
      columns?: string[];
      latest_only?: boolean;
      include_historical?: boolean;
    }
  ): Promise<{
    results: DataProfilingResult[];
    summary: {
      total_columns: number;
      profiled_columns: number;
      last_profiled: string;
      data_quality_score: number;
    };
  }> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/profiling/results`, { 
      params: options 
    });
  }

  static async getColumnProfile(
    assetId: string,
    columnName: string,
    options?: {
      include_distribution?: boolean;
      include_patterns?: boolean;
      include_outliers?: boolean;
    }
  ): Promise<DataProfilingResult> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/columns/${columnName}/profile`, {
      params: options
    });
  }

  // Profiling History and Trends
  static async getProfilingHistory(
    assetId: string,
    options?: {
      time_range?: { start: string; end: string };
      columns?: string[];
      metrics?: string[];
    }
  ): Promise<{
    profiling_history: any[];
    trends: any[];
    anomalies_detected: any[];
  }> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/profiling/history`, { 
      params: options 
    });
  }
}

// ========================= BUSINESS GLOSSARY MANAGEMENT =========================

export class BusinessGlossaryAPI {
  // Glossary Terms Management
  static async createGlossaryTerm(termData: {
    name: string;
    definition: string;
    description?: string;
    category: string;
    domain: string;
    synonyms?: string[];
    related_terms?: string[];
    business_owner: string;
    tags?: string[];
  }): Promise<BusinessGlossaryTerm> {
    return apiClient.post('/api/v1/catalog/glossary/terms', termData);
  }

  static async getGlossaryTerm(termId: string, options?: {
    include_associations?: boolean;
    include_related_terms?: boolean;
    include_usage_stats?: boolean;
  }): Promise<BusinessGlossaryResponse> {
    return apiClient.get(`/api/v1/catalog/glossary/terms/${termId}`, { params: options });
  }

  static async updateGlossaryTerm(termId: string, updates: any): Promise<BusinessGlossaryTerm> {
    return apiClient.put(`/api/v1/catalog/glossary/terms/${termId}`, updates);
  }

  static async deleteGlossaryTerm(termId: string): Promise<void> {
    return apiClient.delete(`/api/v1/catalog/glossary/terms/${termId}`);
  }

  static async searchGlossaryTerms(searchRequest: {
    query?: string;
    categories?: string[];
    domains?: string[];
    status?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{
    terms: BusinessGlossaryTerm[];
    total: number;
    facets: any;
  }> {
    return apiClient.post('/api/v1/catalog/glossary/search', searchRequest);
  }

  // Term Associations
  static async createTermAssociation(associationData: {
    term_id: string;
    asset_id: string;
    column_id?: string;
    association_type: string;
    confidence_score?: number;
  }): Promise<BusinessGlossaryAssociation> {
    return apiClient.post('/api/v1/catalog/glossary/associations', associationData);
  }

  static async getTermAssociations(termId: string, options?: {
    association_types?: string[];
    validated_only?: boolean;
  }): Promise<{
    associations: BusinessGlossaryAssociation[];
    total: number;
  }> {
    return apiClient.get(`/api/v1/catalog/glossary/terms/${termId}/associations`, { 
      params: options 
    });
  }

  static async validateTermAssociation(associationId: string, validation: {
    validation_status: 'validated' | 'rejected';
    validation_notes?: string;
  }): Promise<BusinessGlossaryAssociation> {
    return apiClient.post(`/api/v1/catalog/glossary/associations/${associationId}/validate`, validation);
  }

  // Glossary Analytics
  static async getGlossaryAnalytics(options?: {
    time_period?: string;
    include_usage_trends?: boolean;
    include_coverage_stats?: boolean;
  }): Promise<{
    overview: {
      total_terms: number;
      active_terms: number;
      total_associations: number;
      coverage_percentage: number;
    };
    usage_trends: any[];
    popular_terms: any[];
    coverage_by_domain: any;
  }> {
    return apiClient.get('/api/v1/catalog/glossary/analytics', { params: options });
  }

  // Auto-suggestion and AI Enhancement
  static async suggestTermsForAsset(assetId: string, options?: {
    suggestion_method?: 'ai' | 'pattern_matching' | 'similarity';
    confidence_threshold?: number;
    max_suggestions?: number;
  }): Promise<{
    suggestions: Array<{
      term: BusinessGlossaryTerm;
      confidence_score: number;
      reasoning: string;
      suggested_association_type: string;
    }>;
  }> {
    return apiClient.post(`/api/v1/catalog/assets/${assetId}/glossary/suggestions`, options);
  }
}

// ========================= CATALOG ANALYTICS AND INSIGHTS =========================

export class CatalogAnalyticsAPI {
  // Catalog Overview Analytics - Maps to catalog_analytics_service.py
  static async getCatalogOverview(options?: {
    time_period?: string;
    scope?: {
      source_systems?: string[];
      asset_types?: string[];
      tags?: string[];
    };
  }): Promise<CatalogAnalytics> {
    return apiClient.get('/api/v1/catalog/analytics/overview', { params: options });
  }

  static async getUsageAnalytics(options?: {
    time_period?: string;
    asset_ids?: string[];
    group_by?: string[];
    include_trends?: boolean;
  }): Promise<{
    usage_summary: any;
    top_assets: any[];
    usage_trends: any[];
    user_activity: any[];
  }> {
    return apiClient.get('/api/v1/catalog/analytics/usage', { params: options });
  }

  static async getQualityMetrics(options?: {
    time_period?: string;
    scope?: any;
    include_trends?: boolean;
    group_by?: string[];
  }): Promise<{
    overall_quality_score: number;
    quality_distribution: any;
    quality_trends: any[];
    improvement_opportunities: any[];
  }> {
    return apiClient.get('/api/v1/catalog/analytics/quality', { params: options });
  }

  static async getGovernanceMetrics(options?: {
    time_period?: string;
    include_compliance?: boolean;
    include_coverage?: boolean;
  }): Promise<{
    governance_score: number;
    coverage_metrics: any;
    compliance_status: any;
    policy_violations: any[];
  }> {
    return apiClient.get('/api/v1/catalog/analytics/governance', { params: options });
  }

  // Advanced Analytics and Insights
  static async getDataInsights(options?: {
    insight_types?: string[];
    time_period?: string;
    confidence_threshold?: number;
  }): Promise<{
    insights: Array<{
      insight_type: string;
      title: string;
      description: string;
      confidence_score: number;
      impact_level: string;
      recommended_actions: string[];
      supporting_data: any;
    }>;
    trending_insights: any[];
  }> {
    return apiClient.get('/api/v1/catalog/analytics/insights', { params: options });
  }

  static async getPredictiveAnalytics(options?: {
    prediction_types?: string[];
    time_horizon?: string;
    include_scenarios?: boolean;
  }): Promise<{
    predictions: Array<{
      prediction_type: string;
      forecast_data: any[];
      confidence_interval: any;
      key_drivers: string[];
      scenarios?: any[];
    }>;
    recommendations: string[];
  }> {
    return apiClient.get('/api/v1/catalog/analytics/predictive', { params: options });
  }

  // Custom Reports and Dashboards
  static async createCustomReport(reportConfig: {
    name: string;
    description?: string;
    report_type: string;
    parameters: any;
    schedule?: {
      frequency: string;
      recipients: string[];
    };
  }): Promise<{
    report_id: string;
    status: string;
    estimated_completion?: string;
  }> {
    return apiClient.post('/api/v1/catalog/analytics/reports', reportConfig);
  }

  static async getCustomReports(options?: {
    report_types?: string[];
    created_by?: string;
    include_scheduled?: boolean;
  }): Promise<{ reports: any[]; total: number }> {
    return apiClient.get('/api/v1/catalog/analytics/reports', { params: options });
  }

  static async executeCustomReport(reportId: string, parameters?: any): Promise<{
    execution_id: string;
    status: string;
    download_url?: string;
  }> {
    return apiClient.post(`/api/v1/catalog/analytics/reports/${reportId}/execute`, parameters);
  }
}

// ========================= CATALOG EVENTS AND MONITORING =========================

export class CatalogEventsAPI {
  // Event Management
  static async getAssetEvents(
    assetId: string,
    options?: {
      event_types?: string[];
      time_range?: { start: string; end: string };
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    events: AssetDiscoveryEvent[];
    total: number;
    event_summary: any;
  }> {
    return apiClient.get(`/api/v1/catalog/assets/${assetId}/events`, { params: options });
  }

  static async getCatalogEvents(options?: {
    event_types?: string[];
    source_systems?: string[];
    time_range?: { start: string; end: string };
    severity?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{
    events: AssetDiscoveryEvent[];
    total: number;
    event_trends: any[];
  }> {
    return apiClient.get('/api/v1/catalog/events', { params: options });
  }

  // Real-time Monitoring
  static async subscribeToAssetEvents(assetId: string, eventTypes: string[]): Promise<{
    subscription_id: string;
    websocket_url: string;
    status: string;
  }> {
    return apiClient.post(`/api/v1/catalog/assets/${assetId}/events/subscribe`, {
      event_types: eventTypes
    });
  }

  static async unsubscribeFromEvents(subscriptionId: string): Promise<void> {
    return apiClient.delete(`/api/v1/catalog/events/subscriptions/${subscriptionId}`);
  }

  // Event Notifications
  static async createEventNotification(notificationConfig: {
    name: string;
    event_filters: any;
    notification_channels: string[];
    recipients: string[];
    template?: string;
  }): Promise<{
    notification_id: string;
    status: string;
  }> {
    return apiClient.post('/api/v1/catalog/events/notifications', notificationConfig);
  }

  static async getEventNotifications(): Promise<{ notifications: any[]; total: number }> {
    return apiClient.get('/api/v1/catalog/events/notifications');
  }
}

// ========================= UNIFIED CATALOG API CLIENT =========================

export class EnterpriseCatalogAPI {
  static assets = IntelligentDataAssetAPI;
  static search = CatalogSearchAPI;
  static lineage = DataLineageAPI;
  static quality = DataQualityAPI;
  static profiling = DataProfilingAPI;
  static glossary = BusinessGlossaryAPI;
  static analytics = CatalogAnalyticsAPI;
  static events = CatalogEventsAPI;

  // Health and Status
  static async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, { status: string; last_check: string; details?: any }>;
    uptime: number;
    version: string;
  }> {
    return apiClient.get('/api/v1/catalog/health');
  }

  static async getSystemMetrics(): Promise<{
    performance_metrics: any;
    resource_usage: any;
    error_rates: any;
    throughput: any;
  }> {
    return apiClient.get('/api/v1/catalog/metrics');
  }

  // Configuration and Settings
  static async getSystemConfiguration(): Promise<{
    discovery_settings: any;
    quality_settings: any;
    search_settings: any;
    notification_settings: any;
  }> {
    return apiClient.get('/api/v1/catalog/configuration');
  }

  static async updateSystemConfiguration(config: any): Promise<void> {
    return apiClient.put('/api/v1/catalog/configuration', config);
  }
}

// Default export
export default EnterpriseCatalogAPI;