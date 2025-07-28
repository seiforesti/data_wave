/**
 * Catalog Discovery Hooks - Complete Frontend State Management
 * ===========================================================
 * 
 * Comprehensive React hooks for catalog discovery functionality.
 * Provides state management, caching, and API integration.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  IntelligentDataAsset, 
  AssetSearchRequest, 
  IntelligentAssetResponse,
  AssetCreateRequest,
  AssetUpdateRequest,
  LineageResponse,
  QualityAssessmentResponse,
  CatalogAnalytics,
  AssetDiscoveryEvent,
  BulkOperationRequest,
  BulkOperationResponse
} from '../types/catalog-core.types';

import {
  DiscoveryJob,
  DiscoveryJobCreateRequest,
  DiscoveryJobUpdateRequest,
  DiscoverySearchRequest,
  DiscoverySearchResponse,
  DiscoveryAnalytics
} from '../types/discovery.types';

import { CatalogDiscoveryApiClient } from '../services/catalog-discovery-apis';

// ========================= CONFIGURATION =========================

const QUERY_KEYS = {
  // Asset queries
  asset: (id: string) => ['catalog', 'asset', id],
  assets: (filters?: any) => ['catalog', 'assets', filters],
  assetSearch: (query: AssetSearchRequest) => ['catalog', 'search', query],
  assetSuggestions: (userId?: string, context?: any) => ['catalog', 'suggestions', userId, context],
  recentAssets: (userId?: string) => ['catalog', 'recent', userId],
  popularAssets: (timeframe?: string) => ['catalog', 'popular', timeframe],
  
  // Lineage queries
  lineage: (assetId: string, params?: any) => ['catalog', 'lineage', assetId, params],
  impactAnalysis: (assetId: string, params?: any) => ['catalog', 'impact', assetId, params],
  
  // Quality queries
  quality: (assetId: string) => ['catalog', 'quality', assetId],
  qualityTrends: (assetId: string, timeframe?: string) => ['catalog', 'quality-trends', assetId, timeframe],
  
  // Analytics queries
  analytics: (timeframe?: string) => ['catalog', 'analytics', timeframe],
  usageAnalytics: (assetIds?: string[], timeframe?: string) => ['catalog', 'usage', assetIds, timeframe],
  
  // Discovery queries
  discoveryJob: (id: string) => ['discovery', 'job', id],
  discoveryJobs: (filters?: any) => ['discovery', 'jobs', filters],
  discoveryResults: (jobId: string, params?: any) => ['discovery', 'results', jobId, params],
  discoveryAnalytics: (timeframe?: string) => ['discovery', 'analytics', timeframe],
  
  // Events
  events: (filters?: any) => ['catalog', 'events', filters]
} as const;

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// ========================= API CLIENT INSTANCE =========================

const apiClient = new CatalogDiscoveryApiClient();

// ========================= ASSET MANAGEMENT HOOKS =========================

/**
 * Hook for managing a single asset
 */
export function useAsset(assetId: string, options?: {
  includeLineage?: boolean;
  includeQuality?: boolean;
  enabled?: boolean;
}) {
  const { includeLineage = false, includeQuality = false, enabled = true } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.asset(assetId),
    queryFn: () => apiClient.catalog.getAsset(assetId, includeLineage, includeQuality),
    enabled: enabled && !!assetId,
    staleTime: DEFAULT_STALE_TIME,
    cacheTime: DEFAULT_CACHE_TIME
  });

  return {
    asset: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isStale: query.isStale
  };
}

/**
 * Hook for asset search with advanced filtering
 */
export function useAssetSearch(request: AssetSearchRequest, options?: {
  enabled?: boolean;
  keepPreviousData?: boolean;
}) {
  const { enabled = true, keepPreviousData = true } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.assetSearch(request),
    queryFn: () => apiClient.catalog.searchAssets(request),
    enabled: enabled && (!!request.query || Object.keys(request).length > 1),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    cacheTime: 5 * 60 * 1000, // 5 minutes cache
    keepPreviousData
  });

  return {
    results: query.data,
    assets: query.data?.assets || [],
    totalCount: query.data?.total_count || 0,
    facets: query.data?.facets,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching
  };
}

/**
 * Hook for semantic search functionality
 */
export function useSemanticSearch() {
  const [searchResults, setSearchResults] = useState<IntelligentAssetResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);

  const performSemanticSearch = useCallback(async (
    query: string,
    options?: {
      similarityThreshold?: number;
      limit?: number;
      assetTypes?: string[];
    }
  ) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await apiClient.catalog.semanticSearch(
        query,
        options?.similarityThreshold,
        options?.limit,
        options?.assetTypes
      );
      setSearchResults(results);
      return results;
    } catch (error) {
      setSearchError(error as Error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults(null);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    performSemanticSearch,
    clearResults
  };
}

/**
 * Hook for asset creation
 */
export function useCreateAsset() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: AssetCreateRequest) => apiClient.catalog.createAsset(request),
    onSuccess: (newAsset) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'analytics'] });
      
      // Add to cache
      queryClient.setQueryData(QUERY_KEYS.asset(newAsset.id), newAsset);
    }
  });

  return {
    createAsset: mutation.mutate,
    createAssetAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
    error: mutation.error,
    createdAsset: mutation.data
  };
}

/**
 * Hook for asset updates
 */
export function useUpdateAsset(assetId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: AssetUpdateRequest) => apiClient.catalog.updateAsset(assetId, request),
    onSuccess: (updatedAsset) => {
      // Update cache
      queryClient.setQueryData(QUERY_KEYS.asset(assetId), updatedAsset);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'search'] });
    }
  });

  return {
    updateAsset: mutation.mutate,
    updateAssetAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
    error: mutation.error,
    updatedAsset: mutation.data
  };
}

/**
 * Hook for asset deletion
 */
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (assetId: string) => apiClient.catalog.deleteAsset(assetId),
    onSuccess: (_, assetId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.asset(assetId) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'analytics'] });
    }
  });

  return {
    deleteAsset: mutation.mutate,
    deleteAssetAsync: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
    error: mutation.error
  };
}

// ========================= ASSET SUGGESTIONS & RECOMMENDATIONS =========================

/**
 * Hook for asset suggestions
 */
export function useAssetSuggestions(
  userId?: string,
  context?: Record<string, any>,
  options?: { enabled?: boolean; limit?: number }
) {
  const { enabled = true, limit = 10 } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.assetSuggestions(userId, context),
    queryFn: () => apiClient.catalog.getAssetSuggestions(userId, context, limit),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000
  });

  return {
    suggestions: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for recent assets
 */
export function useRecentAssets(userId?: string, limit?: number) {
  const query = useQuery({
    queryKey: QUERY_KEYS.recentAssets(userId),
    queryFn: () => apiClient.catalog.getRecentAssets(userId, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000
  });

  return {
    recentAssets: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for popular assets
 */
export function usePopularAssets(timeframe?: string, assetTypes?: string[], limit?: number) {
  const query = useQuery({
    queryKey: QUERY_KEYS.popularAssets(timeframe),
    queryFn: () => apiClient.catalog.getPopularAssets(timeframe, assetTypes, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000
  });

  return {
    popularAssets: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

// ========================= LINEAGE HOOKS =========================

/**
 * Hook for asset lineage
 */
export function useAssetLineage(
  assetId: string,
  options?: {
    depthUpstream?: number;
    depthDownstream?: number;
    includeColumnLineage?: boolean;
    enabled?: boolean;
  }
) {
  const { 
    depthUpstream = 3, 
    depthDownstream = 3, 
    includeColumnLineage = false, 
    enabled = true 
  } = options || {};

  const params = { depthUpstream, depthDownstream, includeColumnLineage };

  const query = useQuery({
    queryKey: QUERY_KEYS.lineage(assetId, params),
    queryFn: () => apiClient.catalog.getAssetLineage(assetId, depthUpstream, depthDownstream, includeColumnLineage),
    enabled: enabled && !!assetId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });

  return {
    lineage: query.data,
    lineageGraph: query.data?.lineage_graph,
    impactAnalysis: query.data?.impact_analysis,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for impact analysis
 */
export function useImpactAnalysis() {
  const mutation = useMutation({
    mutationFn: ({ assetId, changeDescription, analysisDepth }: {
      assetId: string;
      changeDescription?: string;
      analysisDepth?: number;
    }) => apiClient.catalog.performImpactAnalysis(assetId, changeDescription, analysisDepth)
  });

  return {
    performImpactAnalysis: mutation.mutate,
    performImpactAnalysisAsync: mutation.mutateAsync,
    isAnalyzing: mutation.isLoading,
    error: mutation.error,
    analysis: mutation.data
  };
}

// ========================= QUALITY HOOKS =========================

/**
 * Hook for asset quality
 */
export function useAssetQuality(assetId: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.quality(assetId),
    queryFn: () => apiClient.catalog.getAssetQuality(assetId),
    enabled: enabled && !!assetId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 10 * 60 * 1000
  });

  return {
    quality: query.data,
    assessments: query.data?.assessments || [],
    scorecard: query.data?.scorecard,
    trends: query.data?.trends,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for triggering quality assessment
 */
export function useQualityAssessment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ assetId, assessmentType }: {
      assetId: string;
      assessmentType?: string;
    }) => apiClient.catalog.triggerQualityAssessment(assetId, assessmentType),
    onSuccess: (_, { assetId }) => {
      // Invalidate quality queries for this asset
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quality(assetId) });
    }
  });

  return {
    triggerAssessment: mutation.mutate,
    triggerAssessmentAsync: mutation.mutateAsync,
    isTriggering: mutation.isLoading,
    error: mutation.error,
    result: mutation.data
  };
}

// ========================= DISCOVERY HOOKS =========================

/**
 * Hook for discovery jobs management
 */
export function useDiscoveryJobs(filters?: any) {
  const query = useQuery({
    queryKey: QUERY_KEYS.discoveryJobs(filters),
    queryFn: () => apiClient.discovery.listDiscoveryJobs(
      filters?.status,
      filters?.limit,
      filters?.offset
    ),
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000
  });

  return {
    jobs: query.data?.jobs || [],
    totalCount: query.data?.total_count || 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for managing a single discovery job
 */
export function useDiscoveryJob(jobId: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  const query = useQuery({
    queryKey: QUERY_KEYS.discoveryJob(jobId),
    queryFn: () => apiClient.discovery.getDiscoveryJob(jobId),
    enabled: enabled && !!jobId,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000,
    refetchInterval: (data) => {
      // Auto-refresh if job is running
      return data?.job?.status === 'running' ? 5000 : false;
    }
  });

  return {
    job: query.data?.job,
    executionHistory: query.data?.execution_history || [],
    recentResults: query.data?.recent_results || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for creating discovery jobs
 */
export function useCreateDiscoveryJob() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: DiscoveryJobCreateRequest) => apiClient.discovery.createDiscoveryJob(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovery', 'jobs'] });
    }
  });

  return {
    createJob: mutation.mutate,
    createJobAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
    error: mutation.error,
    createdJob: mutation.data
  };
}

/**
 * Hook for starting/stopping discovery jobs
 */
export function useDiscoveryJobControl() {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: (jobId: string) => apiClient.discovery.startDiscoveryJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discoveryJob(jobId) });
    }
  });

  const stopMutation = useMutation({
    mutationFn: (jobId: string) => apiClient.discovery.stopDiscoveryJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discoveryJob(jobId) });
    }
  });

  return {
    startJob: startMutation.mutate,
    stopJob: stopMutation.mutate,
    isStarting: startMutation.isLoading,
    isStopping: stopMutation.isLoading,
    startError: startMutation.error,
    stopError: stopMutation.error
  };
}

// ========================= ANALYTICS HOOKS =========================

/**
 * Hook for catalog analytics
 */
export function useCatalogAnalytics(timeframe?: string, includeDetailed?: boolean) {
  const query = useQuery({
    queryKey: QUERY_KEYS.analytics(timeframe),
    queryFn: () => apiClient.catalog.getCatalogAnalytics(timeframe, includeDetailed),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000 // 15 minutes
  });

  return {
    analytics: query.data,
    overview: query.data ? {
      totalAssets: query.data.total_assets,
      assetsByType: query.data.assets_by_type,
      assetsByStatus: query.data.assets_by_status,
      assetsByQuality: query.data.assets_by_quality
    } : null,
    usageStats: query.data?.usage_statistics,
    qualityMetrics: query.data?.quality_metrics,
    governanceMetrics: query.data?.governance_metrics,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

/**
 * Hook for discovery analytics
 */
export function useDiscoveryAnalytics(timeframe?: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.discoveryAnalytics(timeframe),
    queryFn: () => apiClient.discovery.getDiscoveryAnalytics(timeframe),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000
  });

  return {
    analytics: query.data,
    jobStats: query.data ? {
      totalJobs: query.data.total_jobs,
      completedJobs: query.data.completed_jobs,
      failedJobs: query.data.failed_jobs,
      avgDiscoveryTime: query.data.avg_discovery_time
    } : null,
    discoveryMetrics: query.data ? {
      totalAssetsDiscovered: query.data.total_assets_discovered,
      assetsByType: query.data.assets_by_type,
      assetsByMethod: query.data.assets_by_method
    } : null,
    qualityMetrics: query.data ? {
      avgClassificationConfidence: query.data.avg_classification_confidence,
      highConfidenceClassifications: query.data.high_confidence_classifications,
      qualityIssuesDetected: query.data.quality_issues_detected
    } : null,
    trends: query.data?.discovery_trends || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

// ========================= BULK OPERATIONS HOOKS =========================

/**
 * Hook for bulk operations
 */
export function useBulkOperations() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: BulkOperationRequest) => apiClient.catalog.performBulkOperation(request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', 'analytics'] });
    }
  });

  return {
    performBulkOperation: mutation.mutate,
    performBulkOperationAsync: mutation.mutateAsync,
    isProcessing: mutation.isLoading,
    error: mutation.error,
    result: mutation.data
  };
}

/**
 * Hook for monitoring bulk operation status
 */
export function useBulkOperationStatus(operationId?: string) {
  const query = useQuery({
    queryKey: ['catalog', 'bulk-operation', operationId],
    queryFn: () => apiClient.catalog.getBulkOperationStatus(operationId!),
    enabled: !!operationId,
    refetchInterval: (data) => {
      // Auto-refresh if operation is in progress
      return data?.status === 'in_progress' ? 2000 : false;
    },
    staleTime: 0 // Always fresh for status queries
  });

  return {
    operation: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

// ========================= REAL-TIME EVENTS HOOKS =========================

/**
 * Hook for real-time catalog events
 */
export function useCatalogEvents(eventTypes: string[], enabled: boolean = true) {
  const [events, setEvents] = useState<AssetDiscoveryEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || eventTypes.length === 0) return;

    let ws: WebSocket;

    try {
      ws = apiClient.catalog.subscribeToEvents(
        eventTypes,
        (event) => {
          setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
        },
        (error) => {
          setConnectionError(error);
          setIsConnected(false);
        }
      );

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

    } catch (error) {
      setConnectionError(error as Error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [eventTypes, enabled]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isConnected,
    connectionError,
    clearEvents
  };
}

// ========================= COMPOSITE HOOKS =========================

/**
 * Comprehensive hook for asset management
 */
export function useAssetManagement(assetId?: string) {
  const asset = useAsset(assetId!, { enabled: !!assetId });
  const lineage = useAssetLineage(assetId!, { enabled: !!assetId });
  const quality = useAssetQuality(assetId!, { enabled: !!assetId });
  
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset(assetId!);
  const deleteAsset = useDeleteAsset();

  const isLoading = asset.isLoading || lineage.isLoading || quality.isLoading;
  const hasError = asset.error || lineage.error || quality.error;

  return {
    // Asset data
    asset: asset.asset,
    lineage: lineage.lineageGraph,
    quality: quality.scorecard,
    
    // Loading states
    isLoading,
    hasError,
    
    // Actions
    createAsset: createAsset.createAsset,
    updateAsset: updateAsset.updateAsset,
    deleteAsset: deleteAsset.deleteAsset,
    
    // Action states
    isCreating: createAsset.isCreating,
    isUpdating: updateAsset.isUpdating,
    isDeleting: deleteAsset.isDeleting,
    
    // Refresh
    refresh: () => {
      asset.refetch();
      lineage.refetch();
      quality.refetch();
    }
  };
}

/**
 * Hook for comprehensive catalog dashboard data
 */
export function useCatalogDashboard() {
  const analytics = useCatalogAnalytics();
  const discoveryAnalytics = useDiscoveryAnalytics();
  const recentAssets = useRecentAssets(undefined, 10);
  const popularAssets = usePopularAssets('week', undefined, 10);

  const isLoading = analytics.isLoading || discoveryAnalytics.isLoading || 
                   recentAssets.isLoading || popularAssets.isLoading;

  return {
    // Analytics data
    catalogAnalytics: analytics.analytics,
    discoveryAnalytics: discoveryAnalytics.analytics,
    
    // Asset lists
    recentAssets: recentAssets.recentAssets,
    popularAssets: popularAssets.popularAssets,
    
    // Loading state
    isLoading,
    
    // Refresh all data
    refresh: () => {
      analytics.refetch();
      discoveryAnalytics.refetch();
      recentAssets.refetch();
      popularAssets.refetch();
    }
  };
}

export default {
  useAsset,
  useAssetSearch,
  useSemanticSearch,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
  useAssetSuggestions,
  useRecentAssets,
  usePopularAssets,
  useAssetLineage,
  useImpactAnalysis,
  useAssetQuality,
  useQualityAssessment,
  useDiscoveryJobs,
  useDiscoveryJob,
  useCreateDiscoveryJob,
  useDiscoveryJobControl,
  useCatalogAnalytics,
  useDiscoveryAnalytics,
  useBulkOperations,
  useBulkOperationStatus,
  useCatalogEvents,
  useAssetManagement,
  useCatalogDashboard
};