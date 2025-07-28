/**
 * Catalog Assets Hooks - Complete Asset Management
 * ==============================================
 * 
 * Comprehensive React hooks for intelligent data asset management.
 * Maps 100% to backend enterprise catalog service functionality.
 * 
 * Backend Integration:
 * - enterprise_catalog_service.py (EnterpriseIntelligentCatalogService)
 * - intelligent_discovery_service.py (IntelligentDiscoveryService)
 * - enterprise_catalog_routes.py (50+ endpoints)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { 
  IntelligentDataAsset,
  AssetCreateRequest,
  AssetUpdateRequest,
  AssetSearchRequest,
  IntelligentAssetResponse,
  BulkOperationRequest,
  BulkOperationResponse,
  AssetDiscoveryEvent
} from '../types/catalog-core.types';

import { EnterpriseCatalogAPI } from '../services/enterprise-catalog-apis';

// ========================= CONFIGURATION =========================

const QUERY_KEYS = {
  // Asset queries
  asset: (id: string) => ['catalog', 'asset', id],
  assets: (filters?: any) => ['catalog', 'assets', filters],
  assetSearch: (query: AssetSearchRequest) => ['catalog', 'search', query],
  assetRecommendations: (assetId: string, context?: any) => ['catalog', 'recommendations', assetId, context],
  relatedAssets: (assetId: string, options?: any) => ['catalog', 'related', assetId, options],
  
  // Discovery queries
  discoveryJob: (jobId: string) => ['catalog', 'discovery', 'job', jobId],
  discoveryHistory: (params?: any) => ['catalog', 'discovery', 'history', params],
  
  // AI and Analysis
  assetInsights: (assetId: string, options?: any) => ['catalog', 'insights', assetId, options],
  aiAnalysis: (assetId: string, analysisType: string) => ['catalog', 'ai-analysis', assetId, analysisType],
  assetSummary: (assetId: string, options?: any) => ['catalog', 'summary', assetId, options],
  
  // Validation and Health
  assetValidation: (assetId: string, config?: any) => ['catalog', 'validation', assetId, config],
  
  // Events
  assetEvents: (assetId: string, options?: any) => ['catalog', 'events', assetId, options],
  
  // Bulk Operations
  bulkOperation: (operationId: string) => ['catalog', 'bulk', operationId]
} as const;

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// ========================= ASSET MANAGEMENT HOOKS =========================

/**
 * Hook for managing a single asset with full backend integration
 */
export function useAsset(assetId: string, options?: {
  include_lineage?: boolean;
  include_quality?: boolean;
  include_usage?: boolean;
  include_profiling?: boolean;
  include_glossary?: boolean;
  enabled?: boolean;
}) {
  const { enabled = true, ...includeOptions } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.asset(assetId),
    queryFn: () => EnterpriseCatalogAPI.assets.getDataAsset(assetId, includeOptions),
    enabled: enabled && !!assetId,
    staleTime: DEFAULT_STALE_TIME,
    cacheTime: DEFAULT_CACHE_TIME
  });

  return {
    asset: query.data?.asset,
    lineage: query.data?.lineage,
    quality: query.data?.quality_assessment,
    profiling: query.data?.profiling_results,
    usage: query.data?.usage_metrics,
    glossary: query.data?.glossary_associations,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isStale: query.isStale
  };
}

/**
 * Hook for listing and searching assets with pagination
 */
export function useAssets(params?: {
  limit?: number;
  offset?: number;
  asset_types?: string[];
  source_systems?: string[];
  status?: string[];
  include_deprecated?: boolean;
  enabled?: boolean;
}) {
  const { enabled = true, ...queryParams } = params || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.assets(queryParams),
    queryFn: () => EnterpriseCatalogAPI.assets.listAssets(queryParams),
    enabled,
    staleTime: DEFAULT_STALE_TIME,
    cacheTime: DEFAULT_CACHE_TIME
  });

  return {
    assets: query.data?.assets || [],
    total: query.data?.total || 0,
    hasNext: query.data?.has_next || false,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for infinite scrolling asset list
 */
export function useInfiniteAssets(params?: {
  limit?: number;
  asset_types?: string[];
  source_systems?: string[];
  status?: string[];
}) {
  const query = useInfiniteQuery({
    queryKey: ['catalog', 'assets', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => 
      EnterpriseCatalogAPI.assets.listAssets({ 
        ...params, 
        offset: pageParam 
      }),
    getNextPageParam: (lastPage, pages) => 
      lastPage.has_next ? pages.length * (params?.limit || 20) : undefined,
    staleTime: DEFAULT_STALE_TIME
  });

  const allAssets = useMemo(() => 
    query.data?.pages.flatMap(page => page.assets) || [], 
    [query.data]
  );

  return {
    assets: allAssets,
    totalAssets: query.data?.pages[0]?.total || 0,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for creating assets
 */
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetData: AssetCreateRequest) => 
      EnterpriseCatalogAPI.assets.createDataAsset(assetData),
    onSuccess: (newAsset) => {
      // Invalidate assets list
      queryClient.invalidateQueries(['catalog', 'assets']);
      
      // Add to cache
      queryClient.setQueryData(
        QUERY_KEYS.asset(newAsset.id), 
        { asset: newAsset }
      );
    }
  });
}

/**
 * Hook for updating assets
 */
export function useUpdateAsset(assetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: AssetUpdateRequest) => 
      EnterpriseCatalogAPI.assets.updateDataAsset(assetId, updates),
    onSuccess: (updatedAsset) => {
      // Update asset cache
      queryClient.setQueryData(
        QUERY_KEYS.asset(assetId),
        (old: any) => ({
          ...old,
          asset: updatedAsset
        })
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries(['catalog', 'assets']);
    }
  });
}

/**
 * Hook for deleting assets
 */
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, options }: { 
      assetId: string; 
      options?: { soft_delete?: boolean } 
    }) => EnterpriseCatalogAPI.assets.deleteDataAsset(assetId, options),
    onSuccess: (_, { assetId }) => {
      // Remove from cache
      queryClient.removeQueries(QUERY_KEYS.asset(assetId));
      
      // Invalidate assets list
      queryClient.invalidateQueries(['catalog', 'assets']);
    }
  });
}

// ========================= ASSET DISCOVERY HOOKS =========================

/**
 * Hook for triggering asset discovery
 */
export function useAssetDiscovery() {
  const queryClient = useQueryClient();

  const triggerDiscovery = useMutation({
    mutationFn: (discoveryConfig: {
      source_systems?: string[];
      discovery_method?: string;
      scope?: any;
      ai_enhanced?: boolean;
      include_schema_analysis?: boolean;
      include_profiling?: boolean;
    }) => EnterpriseCatalogAPI.assets.discoverDataAssets(discoveryConfig),
    onSuccess: () => {
      // Invalidate discovery history
      queryClient.invalidateQueries(['catalog', 'discovery']);
    }
  });

  return {
    triggerDiscovery: triggerDiscovery.mutate,
    triggerDiscoveryAsync: triggerDiscovery.mutateAsync,
    isDiscovering: triggerDiscovery.isLoading,
    discoveryError: triggerDiscovery.error,
    discoveryResult: triggerDiscovery.data
  };
}

/**
 * Hook for monitoring discovery job
 */
export function useDiscoveryJob(jobId: string, options?: { 
  enabled?: boolean;
  refetchInterval?: number;
}) {
  const { enabled = true, refetchInterval = 5000 } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.discoveryJob(jobId),
    queryFn: () => EnterpriseCatalogAPI.assets.getDiscoveryJob(jobId),
    enabled: enabled && !!jobId,
    refetchInterval: (data) => {
      // Stop polling when job is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return refetchInterval;
    },
    staleTime: 0 // Always fresh for real-time updates
  });

  return {
    job: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isCompleted: query.data?.status === 'completed',
    isFailed: query.data?.status === 'failed',
    progress: query.data?.progress || 0
  };
}

/**
 * Hook for discovery history
 */
export function useDiscoveryHistory(params?: {
  limit?: number;
  offset?: number;
  status?: string;
  date_range?: { start: string; end: string };
}) {
  const query = useQuery({
    queryKey: QUERY_KEYS.discoveryHistory(params),
    queryFn: () => EnterpriseCatalogAPI.assets.getDiscoveryHistory(params),
    staleTime: DEFAULT_STALE_TIME
  });

  return {
    jobs: query.data?.jobs || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

// ========================= AI AND ANALYSIS HOOKS =========================

/**
 * Hook for AI-powered asset analysis
 */
export function useAssetAIAnalysis(assetId: string) {
  const analyzeAsset = useMutation({
    mutationFn: ({ analysisType, options }: {
      analysisType: string;
      options?: {
        include_recommendations?: boolean;
        analysis_depth?: 'basic' | 'detailed' | 'comprehensive';
      };
    }) => EnterpriseCatalogAPI.assets.analyzeAssetWithAI(assetId, analysisType, options)
  });

  return {
    analyzeAsset: analyzeAsset.mutate,
    analyzeAssetAsync: analyzeAsset.mutateAsync,
    isAnalyzing: analyzeAsset.isLoading,
    analysisError: analyzeAsset.error,
    analysisResult: analyzeAsset.data
  };
}

/**
 * Hook for asset insights
 */
export function useAssetInsights(assetId: string, options?: {
  insight_types?: string[];
  time_range?: string;
  include_trends?: boolean;
  enabled?: boolean;
}) {
  const { enabled = true, ...queryOptions } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.assetInsights(assetId, queryOptions),
    queryFn: () => EnterpriseCatalogAPI.assets.getAssetInsights(assetId, queryOptions),
    enabled: enabled && !!assetId,
    staleTime: DEFAULT_STALE_TIME
  });

  return {
    insights: query.data?.insights || [],
    trends: query.data?.trends || [],
    recommendations: query.data?.recommendations || [],
    lastUpdated: query.data?.last_updated,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for generating asset summaries
 */
export function useAssetSummary(assetId: string) {
  const generateSummary = useMutation({
    mutationFn: (options?: {
      summary_type?: 'technical' | 'business' | 'comprehensive';
      include_ai_insights?: boolean;
    }) => EnterpriseCatalogAPI.assets.generateAssetSummary(assetId, options)
  });

  return {
    generateSummary: generateSummary.mutate,
    generateSummaryAsync: generateSummary.mutateAsync,
    isGenerating: generateSummary.isLoading,
    summaryError: generateSummary.error,
    summary: generateSummary.data
  };
}

// ========================= ASSET RELATIONSHIPS HOOKS =========================

/**
 * Hook for asset recommendations
 */
export function useAssetRecommendations(assetId: string, context?: {
  recommendation_type?: 'similar' | 'related' | 'popular' | 'quality_improvement';
  limit?: number;
  user_context?: any;
  enabled?: boolean;
}) {
  const { enabled = true, ...contextOptions } = context || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.assetRecommendations(assetId, contextOptions),
    queryFn: () => EnterpriseCatalogAPI.assets.getAssetRecommendations(assetId, contextOptions),
    enabled: enabled && !!assetId,
    staleTime: DEFAULT_STALE_TIME
  });

  return {
    recommendations: query.data?.recommendations || [],
    totalCount: query.data?.total_count || 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for related assets
 */
export function useRelatedAssets(assetId: string, options?: {
  relationship_type?: string;
  depth?: number;
  include_similarity_score?: boolean;
  enabled?: boolean;
}) {
  const { enabled = true, ...queryOptions } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.relatedAssets(assetId, queryOptions),
    queryFn: () => EnterpriseCatalogAPI.assets.getRelatedAssets(assetId, queryOptions),
    enabled: enabled && !!assetId,
    staleTime: DEFAULT_STALE_TIME
  });

  return {
    relatedAssets: query.data?.related_assets || [],
    relationshipGraph: query.data?.relationship_graph,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

// ========================= ASSET VALIDATION HOOKS =========================

/**
 * Hook for asset validation
 */
export function useAssetValidation(assetId: string) {
  const validateAsset = useMutation({
    mutationFn: (validationConfig?: {
      validation_rules?: string[];
      include_ai_validation?: boolean;
      validation_scope?: 'schema' | 'data' | 'metadata' | 'all';
    }) => EnterpriseCatalogAPI.assets.validateAsset(assetId, validationConfig)
  });

  return {
    validateAsset: validateAsset.mutate,
    validateAssetAsync: validateAsset.mutateAsync,
    isValidating: validateAsset.isLoading,
    validationError: validateAsset.error,
    validationResult: validateAsset.data
  };
}

// ========================= BULK OPERATIONS HOOKS =========================

/**
 * Hook for bulk asset operations
 */
export function useBulkAssetOperations() {
  const queryClient = useQueryClient();

  const bulkUpdate = useMutation({
    mutationFn: (request: BulkOperationRequest) => 
      EnterpriseCatalogAPI.assets.bulkUpdateAssets(request),
    onSuccess: () => {
      queryClient.invalidateQueries(['catalog', 'assets']);
    }
  });

  const bulkDelete = useMutation({
    mutationFn: ({ assetIds, options }: { 
      assetIds: string[]; 
      options?: { soft_delete?: boolean } 
    }) => EnterpriseCatalogAPI.assets.bulkDeleteAssets(assetIds, options),
    onSuccess: () => {
      queryClient.invalidateQueries(['catalog', 'assets']);
    }
  });

  const bulkTag = useMutation({
    mutationFn: ({ assetIds, tags }: { assetIds: string[]; tags: string[] }) => 
      EnterpriseCatalogAPI.assets.bulkTagAssets(assetIds, tags),
    onSuccess: () => {
      queryClient.invalidateQueries(['catalog', 'assets']);
    }
  });

  return {
    bulkUpdate: {
      execute: bulkUpdate.mutate,
      executeAsync: bulkUpdate.mutateAsync,
      isLoading: bulkUpdate.isLoading,
      error: bulkUpdate.error,
      result: bulkUpdate.data
    },
    bulkDelete: {
      execute: bulkDelete.mutate,
      executeAsync: bulkDelete.mutateAsync,
      isLoading: bulkDelete.isLoading,
      error: bulkDelete.error,
      result: bulkDelete.data
    },
    bulkTag: {
      execute: bulkTag.mutate,
      executeAsync: bulkTag.mutateAsync,
      isLoading: bulkTag.isLoading,
      error: bulkTag.error,
      result: bulkTag.data
    }
  };
}

// ========================= IMPORT/EXPORT HOOKS =========================

/**
 * Hook for asset import/export operations
 */
export function useAssetImportExport() {
  const exportAssets = useMutation({
    mutationFn: (options: {
      asset_ids?: string[];
      filters?: any;
      format: 'json' | 'csv' | 'excel';
      include_lineage?: boolean;
      include_quality?: boolean;
    }) => EnterpriseCatalogAPI.assets.exportAssets(options)
  });

  const importAssets = useMutation({
    mutationFn: (importData: {
      format: 'json' | 'csv' | 'excel';
      data?: any;
      file_url?: string;
      mapping_config?: any;
      validation_mode?: 'strict' | 'lenient';
    }) => EnterpriseCatalogAPI.assets.importAssets(importData)
  });

  return {
    exportAssets: {
      execute: exportAssets.mutate,
      executeAsync: exportAssets.mutateAsync,
      isExporting: exportAssets.isLoading,
      exportError: exportAssets.error,
      exportResult: exportAssets.data
    },
    importAssets: {
      execute: importAssets.mutate,
      executeAsync: importAssets.mutateAsync,
      isImporting: importAssets.isLoading,
      importError: importAssets.error,
      importResult: importAssets.data
    }
  };
}

// ========================= ASSET EVENTS HOOKS =========================

/**
 * Hook for asset events
 */
export function useAssetEvents(assetId: string, options?: {
  event_types?: string[];
  time_range?: { start: string; end: string };
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  const { enabled = true, ...queryOptions } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.assetEvents(assetId, queryOptions),
    queryFn: () => EnterpriseCatalogAPI.events.getAssetEvents(assetId, queryOptions),
    enabled: enabled && !!assetId,
    staleTime: 30 * 1000 // 30 seconds for events
  });

  return {
    events: query.data?.events || [],
    total: query.data?.total || 0,
    eventSummary: query.data?.event_summary,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

// ========================= REAL-TIME SUBSCRIPTIONS =========================

/**
 * Hook for real-time asset event subscriptions
 */
export function useAssetEventSubscription(assetId: string, eventTypes: string[]) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [events, setEvents] = useState<AssetDiscoveryEvent[]>([]);

  const subscribe = useCallback(async () => {
    try {
      const subscription = await EnterpriseCatalogAPI.events.subscribeToAssetEvents(
        assetId, 
        eventTypes
      );
      setSubscriptionId(subscription.subscription_id);
      setIsSubscribed(true);

      // TODO: Implement WebSocket connection for real-time events
      // This would connect to subscription.websocket_url
      
    } catch (error) {
      console.error('Failed to subscribe to asset events:', error);
    }
  }, [assetId, eventTypes]);

  const unsubscribe = useCallback(async () => {
    if (subscriptionId) {
      try {
        await EnterpriseCatalogAPI.events.unsubscribeFromEvents(subscriptionId);
        setSubscriptionId(null);
        setIsSubscribed(false);
        setEvents([]);
      } catch (error) {
        console.error('Failed to unsubscribe from asset events:', error);
      }
    }
  }, [subscriptionId]);

  useEffect(() => {
    return () => {
      if (subscriptionId) {
        unsubscribe();
      }
    };
  }, [subscriptionId, unsubscribe]);

  return {
    isSubscribed,
    events,
    subscribe,
    unsubscribe,
    subscriptionId
  };
}

// ========================= COMPOSITE HOOKS =========================

/**
 * Comprehensive hook that combines multiple asset-related queries
 */
export function useAssetDetails(assetId: string, options?: {
  includeRecommendations?: boolean;
  includeRelated?: boolean;
  includeInsights?: boolean;
  includeEvents?: boolean;
  enabled?: boolean;
}) {
  const { 
    includeRecommendations = true,
    includeRelated = true,
    includeInsights = true,
    includeEvents = false,
    enabled = true
  } = options || {};

  const asset = useAsset(assetId, {
    include_lineage: true,
    include_quality: true,
    include_usage: true,
    include_profiling: true,
    include_glossary: true,
    enabled
  });

  const recommendations = useAssetRecommendations(assetId, {
    enabled: enabled && includeRecommendations
  });

  const related = useRelatedAssets(assetId, {
    enabled: enabled && includeRelated
  });

  const insights = useAssetInsights(assetId, {
    enabled: enabled && includeInsights
  });

  const events = useAssetEvents(assetId, {
    enabled: enabled && includeEvents,
    limit: 50
  });

  const isLoading = asset.isLoading || 
    (includeRecommendations && recommendations.isLoading) ||
    (includeRelated && related.isLoading) ||
    (includeInsights && insights.isLoading) ||
    (includeEvents && events.isLoading);

  const error = asset.error || recommendations.error || related.error || 
    insights.error || events.error;

  return {
    // Asset data
    asset: asset.asset,
    lineage: asset.lineage,
    quality: asset.quality,
    profiling: asset.profiling,
    usage: asset.usage,
    glossary: asset.glossary,
    
    // Related data
    recommendations: recommendations.recommendations,
    relatedAssets: related.relatedAssets,
    insights: insights.insights,
    events: events.events,
    
    // Status
    isLoading,
    error,
    
    // Refetch functions
    refetch: () => {
      asset.refetch();
      if (includeRecommendations) recommendations.refetch();
      if (includeRelated) related.refetch();
      if (includeInsights) insights.refetch();
      if (includeEvents) events.refetch();
    }
  };
}

// ========================= EXPORT =========================

export type {
  IntelligentDataAsset,
  AssetCreateRequest,
  AssetUpdateRequest,
  AssetSearchRequest,
  IntelligentAssetResponse,
  BulkOperationRequest,
  BulkOperationResponse
};