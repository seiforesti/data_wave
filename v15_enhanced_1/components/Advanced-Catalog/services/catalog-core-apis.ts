/**
 * Core Catalog API Service
 * Maps to: enterprise_catalog_service.py, enterprise_catalog_routes.py
 * 
 * Comprehensive API client for core catalog operations including CRUD,
 * advanced search, metadata management, and enterprise features.
 */

import { apiClient } from '@/shared/utils/api-client';
import type {
  IntelligentDataAsset,
  AssetType,
  AssetStatus,
  AssetCriticality,
  DataSensitivity,
  DiscoveryMethod,
  EnterpriseDataLineage,
  DataQualityAssessment,
  BusinessGlossaryTerm,
  AssetUsageMetrics,
  DataProfilingResult,
  LineageGraph,
  QualityRule,
  QualityRecommendation,
  ActionItem,
} from '../types/catalog-core.types';

import type {
  SearchRequest,
  SearchResponse,
  AutoCompleteRequest,
  AutoCompleteResponse,
  SavedSearch,
  SearchAlert,
  PersonalizedSearch,
} from '../types/search.types';

import type {
  DataProfile,
  MetadataEnrichment,
  MetadataManagementConfig,
} from '../types/metadata.types';

const API_BASE_URL = '/api/v1/catalog'; // Base URL for catalog APIs

export class CatalogCoreApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ===================== ASSET MANAGEMENT =====================

  /**
   * Create a new intelligent data asset with AI-powered enrichment
   */
  async createIntelligentAsset(
    assetData: Partial<IntelligentDataAsset>,
    enhancementConfig?: Record<string, any>
  ): Promise<IntelligentDataAsset> {
    const payload = {
      ...assetData,
      enhancement_config: enhancementConfig,
    };
    return apiClient.post<IntelligentDataAsset>(`${this.baseUrl}/assets`, payload);
  }

  /**
   * Get asset by ID with comprehensive metadata
   */
  async getAssetById(
    assetId: string,
    includeLineage: boolean = false,
    includeQuality: boolean = false,
    includeUsage: boolean = false
  ): Promise<IntelligentDataAsset> {
    const params = new URLSearchParams({
      include_lineage: includeLineage.toString(),
      include_quality: includeQuality.toString(),
      include_usage: includeUsage.toString(),
    });
    return apiClient.get<IntelligentDataAsset>(`${this.baseUrl}/assets/${assetId}?${params}`);
  }

  /**
   * Get assets with advanced filtering and pagination
   */
  async getAssets(filters: {
    asset_types?: AssetType[];
    status?: AssetStatus[];
    criticality?: AssetCriticality[];
    sensitivity?: DataSensitivity[];
    owners?: string[];
    business_domains?: string[];
    tags?: string[];
    quality_threshold?: number;
    discovery_method?: DiscoveryMethod[];
    search_query?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}): Promise<{
    assets: IntelligentDataAsset[];
    total_count: number;
    page: number;
    limit: number;
    has_next: boolean;
    has_previous: boolean;
  }> {
    const params = new URLSearchParams();
    
    // Add array filters
    if (filters.asset_types?.length) {
      filters.asset_types.forEach(type => params.append('asset_types', type));
    }
    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters.criticality?.length) {
      filters.criticality.forEach(crit => params.append('criticality', crit));
    }
    if (filters.sensitivity?.length) {
      filters.sensitivity.forEach(sens => params.append('sensitivity', sens));
    }
    if (filters.owners?.length) {
      filters.owners.forEach(owner => params.append('owners', owner));
    }
    if (filters.business_domains?.length) {
      filters.business_domains.forEach(domain => params.append('business_domains', domain));
    }
    if (filters.tags?.length) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }
    if (filters.discovery_method?.length) {
      filters.discovery_method.forEach(method => params.append('discovery_method', method));
    }

    // Add scalar filters
    if (filters.quality_threshold !== undefined) {
      params.append('quality_threshold', filters.quality_threshold.toString());
    }
    if (filters.search_query) {
      params.append('search_query', filters.search_query);
    }
    if (filters.page !== undefined) {
      params.append('page', filters.page.toString());
    }
    if (filters.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.sort_by) {
      params.append('sort_by', filters.sort_by);
    }
    if (filters.sort_order) {
      params.append('sort_order', filters.sort_order);
    }

    return apiClient.get(`${this.baseUrl}/assets?${params}`);
  }

  /**
   * Update asset with intelligent validation and enhancement
   */
  async updateAsset(
    assetId: string,
    updates: Partial<IntelligentDataAsset>,
    enhancementConfig?: Record<string, any>
  ): Promise<IntelligentDataAsset> {
    const payload = {
      ...updates,
      enhancement_config: enhancementConfig,
    };
    return apiClient.put<IntelligentDataAsset>(`${this.baseUrl}/assets/${assetId}`, payload);
  }

  /**
   * Delete asset with cascade options
   */
  async deleteAsset(
    assetId: string,
    cascadeDelete: boolean = false,
    preserveLineage: boolean = true
  ): Promise<{ success: boolean; message: string; affected_assets?: string[] }> {
    const params = new URLSearchParams({
      cascade_delete: cascadeDelete.toString(),
      preserve_lineage: preserveLineage.toString(),
    });
    return apiClient.delete(`${this.baseUrl}/assets/${assetId}?${params}`);
  }

  /**
   * Bulk operations on assets
   */
  async bulkUpdateAssets(
    assetIds: string[],
    updates: Partial<IntelligentDataAsset>
  ): Promise<{
    updated_assets: IntelligentDataAsset[];
    failed_updates: Array<{ asset_id: string; error: string }>;
  }> {
    const payload = {
      asset_ids: assetIds,
      updates,
    };
    return apiClient.post(`${this.baseUrl}/assets/bulk-update`, payload);
  }

  async bulkDeleteAssets(
    assetIds: string[],
    cascadeDelete: boolean = false
  ): Promise<{
    deleted_count: number;
    failed_deletes: Array<{ asset_id: string; error: string }>;
  }> {
    const payload = {
      asset_ids: assetIds,
      cascade_delete: cascadeDelete,
    };
    return apiClient.post(`${this.baseUrl}/assets/bulk-delete`, payload);
  }

  // ===================== ASSET DISCOVERY =====================

  /**
   * Trigger intelligent asset discovery
   */
  async discoverAssets(
    dataSourceId: string,
    discoveryConfig: {
      discovery_type?: 'full' | 'incremental' | 'targeted';
      ai_enhancement?: boolean;
      pattern_recognition?: boolean;
      lineage_detection?: boolean;
      quality_assessment?: boolean;
      business_context_inference?: boolean;
      target_paths?: string[];
      exclusion_patterns?: string[];
    }
  ): Promise<{
    discovery_job_id: string;
    estimated_duration: number;
    assets_to_discover: number;
    discovery_config: Record<string, any>;
  }> {
    const payload = {
      data_source_id: dataSourceId,
      discovery_config: discoveryConfig,
    };
    return apiClient.post(`${this.baseUrl}/discovery/trigger`, payload);
  }

  /**
   * Get discovery job status and progress
   */
  async getDiscoveryJobStatus(jobId: string): Promise<{
    job_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress_percentage: number;
    discovered_assets_count: number;
    processed_items: number;
    total_items: number;
    current_operation: string;
    estimated_completion: string;
    error_message?: string;
  }> {
    return apiClient.get(`${this.baseUrl}/discovery/jobs/${jobId}/status`);
  }

  /**
   * Get discovery job results
   */
  async getDiscoveryJobResults(jobId: string): Promise<{
    job_id: string;
    discovered_assets: IntelligentDataAsset[];
    lineage_discovered: EnterpriseDataLineage[];
    quality_assessments: DataQualityAssessment[];
    recommendations: string[];
    insights: Record<string, any>;
  }> {
    return apiClient.get(`${this.baseUrl}/discovery/jobs/${jobId}/results`);
  }

  // ===================== LINEAGE MANAGEMENT =====================

  /**
   * Get asset lineage graph
   */
  async getAssetLineage(
    assetId: string,
    direction: 'upstream' | 'downstream' | 'both' = 'both',
    depth: number = 3,
    includeImpactAnalysis: boolean = false
  ): Promise<LineageGraph> {
    const params = new URLSearchParams({
      direction,
      depth: depth.toString(),
      include_impact_analysis: includeImpactAnalysis.toString(),
    });
    return apiClient.get<LineageGraph>(`${this.baseUrl}/assets/${assetId}/lineage?${params}`);
  }

  /**
   * Create lineage relationship
   */
  async createLineageRelationship(
    sourceAssetId: string,
    targetAssetId: string,
    lineageData: Partial<EnterpriseDataLineage>
  ): Promise<EnterpriseDataLineage> {
    const payload = {
      source_asset_id: sourceAssetId,
      target_asset_id: targetAssetId,
      ...lineageData,
    };
    return apiClient.post<EnterpriseDataLineage>(`${this.baseUrl}/lineage`, payload);
  }

  /**
   * Update lineage relationship
   */
  async updateLineageRelationship(
    lineageId: string,
    updates: Partial<EnterpriseDataLineage>
  ): Promise<EnterpriseDataLineage> {
    return apiClient.put<EnterpriseDataLineage>(`${this.baseUrl}/lineage/${lineageId}`, updates);
  }

  /**
   * Delete lineage relationship
   */
  async deleteLineageRelationship(lineageId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`${this.baseUrl}/lineage/${lineageId}`);
  }

  /**
   * Perform impact analysis
   */
  async performImpactAnalysis(
    assetId: string,
    changeType: 'schema_change' | 'data_type_change' | 'removal' | 'transformation_change',
    changeDetails: Record<string, any>
  ): Promise<{
    impact_summary: {
      affected_assets_count: number;
      high_impact_assets: number;
      medium_impact_assets: number;
      low_impact_assets: number;
    };
    affected_assets: Array<{
      asset_id: string;
      asset_name: string;
      impact_level: 'high' | 'medium' | 'low';
      impact_description: string;
      recommended_actions: string[];
    }>;
    change_propagation_path: Array<{
      hop: number;
      asset_id: string;
      asset_name: string;
      relationship_type: string;
    }>;
  }> {
    const payload = {
      change_type: changeType,
      change_details: changeDetails,
    };
    return apiClient.post(`${this.baseUrl}/assets/${assetId}/impact-analysis`, payload);
  }

  // ===================== QUALITY MANAGEMENT =====================

  /**
   * Get asset quality assessment
   */
  async getAssetQualityAssessment(assetId: string): Promise<DataQualityAssessment> {
    return apiClient.get<DataQualityAssessment>(`${this.baseUrl}/assets/${assetId}/quality`);
  }

  /**
   * Trigger quality assessment
   */
  async triggerQualityAssessment(
    assetId: string,
    assessmentConfig: {
      assessment_type?: 'full' | 'quick' | 'custom';
      rules_to_execute?: string[];
      include_profiling?: boolean;
      include_anomaly_detection?: boolean;
      custom_rules?: QualityRule[];
    }
  ): Promise<{
    assessment_job_id: string;
    estimated_duration: number;
    rules_count: number;
  }> {
    const payload = {
      assessment_config: assessmentConfig,
    };
    return apiClient.post(`${this.baseUrl}/assets/${assetId}/quality/assess`, payload);
  }

  /**
   * Get quality rules for asset
   */
  async getAssetQualityRules(assetId: string): Promise<QualityRule[]> {
    return apiClient.get<QualityRule[]>(`${this.baseUrl}/assets/${assetId}/quality/rules`);
  }

  /**
   * Create quality rule
   */
  async createQualityRule(rule: Partial<QualityRule>): Promise<QualityRule> {
    return apiClient.post<QualityRule>(`${this.baseUrl}/quality/rules`, rule);
  }

  /**
   * Update quality rule
   */
  async updateQualityRule(ruleId: string, updates: Partial<QualityRule>): Promise<QualityRule> {
    return apiClient.put<QualityRule>(`${this.baseUrl}/quality/rules/${ruleId}`, updates);
  }

  /**
   * Get quality recommendations for asset
   */
  async getQualityRecommendations(assetId: string): Promise<QualityRecommendation[]> {
    return apiClient.get<QualityRecommendation[]>(`${this.baseUrl}/assets/${assetId}/quality/recommendations`);
  }

  // ===================== BUSINESS GLOSSARY =====================

  /**
   * Get business glossary terms
   */
  async getBusinessGlossaryTerms(filters: {
    category?: string;
    domain?: string;
    search_query?: string;
    status?: 'draft' | 'approved' | 'deprecated';
    page?: number;
    limit?: number;
  } = {}): Promise<{
    terms: BusinessGlossaryTerm[];
    total_count: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return apiClient.get(`${this.baseUrl}/business-glossary/terms?${params}`);
  }

  /**
   * Create business glossary term
   */
  async createBusinessGlossaryTerm(term: Partial<BusinessGlossaryTerm>): Promise<BusinessGlossaryTerm> {
    return apiClient.post<BusinessGlossaryTerm>(`${this.baseUrl}/business-glossary/terms`, term);
  }

  /**
   * Update business glossary term
   */
  async updateBusinessGlossaryTerm(
    termId: string,
    updates: Partial<BusinessGlossaryTerm>
  ): Promise<BusinessGlossaryTerm> {
    return apiClient.put<BusinessGlossaryTerm>(`${this.baseUrl}/business-glossary/terms/${termId}`, updates);
  }

  /**
   * Associate term with asset
   */
  async associateTermWithAsset(
    termId: string,
    assetId: string,
    associationType: 'tagged' | 'classified' | 'defined_by' = 'tagged'
  ): Promise<{ success: boolean; message: string }> {
    const payload = {
      asset_id: assetId,
      association_type: associationType,
    };
    return apiClient.post(`${this.baseUrl}/business-glossary/terms/${termId}/associate`, payload);
  }

  // ===================== USAGE ANALYTICS =====================

  /**
   * Get asset usage metrics
   */
  async getAssetUsageMetrics(
    assetId: string,
    timeRange: string = '30d'
  ): Promise<AssetUsageMetrics> {
    const params = new URLSearchParams({ time_range: timeRange });
    return apiClient.get<AssetUsageMetrics>(`${this.baseUrl}/assets/${assetId}/usage?${params}`);
  }

  /**
   * Record asset usage event
   */
  async recordAssetUsage(
    assetId: string,
    usageData: {
      usage_type: 'view' | 'download' | 'query' | 'transform' | 'copy';
      user_id: string;
      session_id?: string;
      tool_used?: string;
      query_details?: Record<string, any>;
      duration_seconds?: number;
      bytes_transferred?: number;
    }
  ): Promise<{ success: boolean; usage_id: string }> {
    return apiClient.post(`${this.baseUrl}/assets/${assetId}/usage`, usageData);
  }

  /**
   * Get popular assets
   */
  async getPopularAssets(
    timeRange: string = '7d',
    limit: number = 20,
    assetTypes?: AssetType[]
  ): Promise<Array<{
    asset: IntelligentDataAsset;
    usage_score: number;
    view_count: number;
    unique_users: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    const params = new URLSearchParams({
      time_range: timeRange,
      limit: limit.toString(),
    });
    if (assetTypes?.length) {
      assetTypes.forEach(type => params.append('asset_types', type));
    }
    return apiClient.get(`${this.baseUrl}/analytics/popular-assets?${params}`);
  }

  // ===================== DATA PROFILING =====================

  /**
   * Get asset profiling results
   */
  async getAssetProfilingResults(assetId: string): Promise<DataProfilingResult> {
    return apiClient.get<DataProfilingResult>(`${this.baseUrl}/assets/${assetId}/profiling`);
  }

  /**
   * Trigger asset profiling
   */
  async triggerAssetProfiling(
    assetId: string,
    profilingConfig: {
      profiling_type?: 'full' | 'statistical' | 'pattern' | 'quality' | 'semantic';
      sample_size?: number;
      sample_strategy?: 'random' | 'systematic' | 'stratified';
      include_column_profiling?: boolean;
      include_anomaly_detection?: boolean;
      custom_rules?: Record<string, any>[];
    }
  ): Promise<{
    profiling_job_id: string;
    estimated_duration: number;
    sample_size: number;
  }> {
    const payload = {
      profiling_config: profilingConfig,
    };
    return apiClient.post(`${this.baseUrl}/assets/${assetId}/profiling/trigger`, payload);
  }

  // ===================== METADATA ENRICHMENT =====================

  /**
   * Get asset metadata enrichments
   */
  async getAssetMetadataEnrichments(assetId: string): Promise<MetadataEnrichment[]> {
    return apiClient.get<MetadataEnrichment[]>(`${this.baseUrl}/assets/${assetId}/enrichments`);
  }

  /**
   * Trigger metadata enrichment
   */
  async triggerMetadataEnrichment(
    assetId: string,
    enrichmentTypes: Array<'semantic_tagging' | 'business_context' | 'quality_assessment' | 'relationship_discovery' | 'classification'>
  ): Promise<{
    enrichment_job_id: string;
    enrichment_types: string[];
    estimated_duration: number;
  }> {
    const payload = {
      enrichment_types: enrichmentTypes,
    };
    return apiClient.post(`${this.baseUrl}/assets/${assetId}/enrichments/trigger`, payload);
  }

  // ===================== ADVANCED SEARCH =====================

  /**
   * Perform semantic search
   */
  async semanticSearch(searchRequest: SearchRequest): Promise<SearchResponse> {
    return apiClient.post<SearchResponse>(`${this.baseUrl}/search/semantic`, searchRequest);
  }

  /**
   * Get search autocomplete suggestions
   */
  async getSearchAutocomplete(request: AutoCompleteRequest): Promise<AutoCompleteResponse> {
    return apiClient.post<AutoCompleteResponse>(`${this.baseUrl}/search/autocomplete`, request);
  }

  /**
   * Save search query
   */
  async saveSearch(searchData: Partial<SavedSearch>): Promise<SavedSearch> {
    return apiClient.post<SavedSearch>(`${this.baseUrl}/search/saved`, searchData);
  }

  /**
   * Get saved searches
   */
  async getSavedSearches(userId?: string): Promise<SavedSearch[]> {
    const params = userId ? new URLSearchParams({ user_id: userId }) : '';
    return apiClient.get<SavedSearch[]>(`${this.baseUrl}/search/saved?${params}`);
  }

  // ===================== CATALOG CONFIGURATION =====================

  /**
   * Get catalog configuration
   */
  async getCatalogConfiguration(): Promise<MetadataManagementConfig> {
    return apiClient.get<MetadataManagementConfig>(`${this.baseUrl}/configuration`);
  }

  /**
   * Update catalog configuration
   */
  async updateCatalogConfiguration(config: Partial<MetadataManagementConfig>): Promise<MetadataManagementConfig> {
    return apiClient.put<MetadataManagementConfig>(`${this.baseUrl}/configuration`, config);
  }

  // ===================== HEALTH AND STATUS =====================

  /**
   * Get catalog health status
   */
  async getCatalogHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Array<{
      service_name: string;
      status: 'healthy' | 'unhealthy';
      response_time_ms: number;
      last_check: string;
    }>;
    statistics: {
      total_assets: number;
      discovery_jobs_running: number;
      quality_assessments_pending: number;
      search_index_size: string;
      last_backup: string;
    };
  }> {
    return apiClient.get(`${this.baseUrl}/health`);
  }
}

// Export singleton instance
export const catalogCoreApiClient = new CatalogCoreApiClient();