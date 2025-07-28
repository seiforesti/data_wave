/**
 * Advanced Catalog Intelligence Hooks
 * Maps to: intelligent_discovery_service.py, semantic_search_service.py, 
 *          catalog_recommendation_service.py, catalog_intelligence_models.py
 * 
 * Comprehensive React hooks for intelligence operations with React Query,
 * intelligent discovery, semantic search, and recommendation systems.
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { catalogIntelligenceApiClient } from '../services/catalog-intelligence-apis';
import type {
  IntelligentDiscoveryRequest,
  IntelligentDiscoveryResult,
  DiscoveryJob,
  DiscoveryConfiguration,
  AutomatedDiscovery,
  SchemaInferenceResult,
  MetadataInferenceResult,
  SemanticSearchRequest,
  SemanticSearchResult,
  SearchContext,
  SearchPersonalization,
  SearchAnalytics,
  NaturalLanguageQuery,
  QueryInterpretation,
  RecommendationRequest,
  Recommendation,
  RecommendationEngine,
  PersonalizedRecommendation,
  RecommendationFeedback,
  UsagePatternAnalysis,
  IntelligenceInsight,
  PatternRecognition,
  TrendAnalysis,
  PredictiveRecommendation,
  ContextualRecommendation,
  SmartSuggestion,
  IntelligenceMetrics,
  DiscoveryMetrics,
  SearchMetrics,
  RecommendationMetrics,
} from '../types/intelligence.types';

import type {
  SemanticEmbedding,
  SemanticRelationship,
  IntelligentDataAsset,
} from '../types/catalog-core.types';

import { useToast } from '@/components/ui/use-toast';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useDebounce } from 'use-debounce';

// ===================== INTELLIGENT DISCOVERY HOOKS =====================

/**
 * Hook for intelligent discovery operations
 */
export function useIntelligentDiscovery(
  request: IntelligentDiscoveryRequest | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<IntelligentDiscoveryResult, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'discovery', request],
    queryFn: () => catalogIntelligenceApiClient.performIntelligentDiscovery(request!),
    enabled: !!request && (options?.enabled !== false),
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for getting discovery jobs
 */
export function useDiscoveryJobs(
  filters?: {
    status?: string;
    type?: string;
    dataSourceId?: string;
  },
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<DiscoveryJob[], Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'discovery-jobs', filters],
    queryFn: () => catalogIntelligenceApiClient.getDiscoveryJobs(filters),
    enabled: options?.enabled !== false,
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  });
}

/**
 * Hook for getting a specific discovery job
 */
export function useDiscoveryJob(
  jobId: string | null,
  options?: {
    enabled?: boolean;
    includeResults?: boolean;
  }
): UseQueryResult<DiscoveryJob, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'discovery-job', jobId, options?.includeResults],
    queryFn: () => catalogIntelligenceApiClient.getDiscoveryJob(jobId!, options?.includeResults),
    enabled: !!jobId && (options?.enabled !== false),
    staleTime: 60000,
  });
}

/**
 * Hook for discovery configuration
 */
export function useDiscoveryConfiguration(
  dataSourceId: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<DiscoveryConfiguration, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'discovery-config', dataSourceId],
    queryFn: () => catalogIntelligenceApiClient.getDiscoveryConfiguration(dataSourceId!),
    enabled: !!dataSourceId && (options?.enabled !== false),
    staleTime: 600000, // 10 minutes
  });
}

/**
 * Hook for automated discovery
 */
export function useAutomatedDiscovery(
  config: AutomatedDiscovery | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'automated-discovery', config],
    queryFn: () => catalogIntelligenceApiClient.configureAutomatedDiscovery(config!),
    enabled: !!config && (options?.enabled !== false),
    staleTime: 300000,
  });
}

/**
 * Hook for schema inference
 */
export function useSchemaInference(
  dataSourceId: string | null,
  tableName?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<SchemaInferenceResult, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'schema-inference', dataSourceId, tableName],
    queryFn: () => catalogIntelligenceApiClient.inferSchema(dataSourceId!, tableName),
    enabled: !!dataSourceId && (options?.enabled !== false),
    staleTime: 600000,
  });
}

/**
 * Hook for metadata inference
 */
export function useMetadataInference(
  assetId: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<MetadataInferenceResult, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'metadata-inference', assetId],
    queryFn: () => catalogIntelligenceApiClient.inferMetadata(assetId!),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

// ===================== SEMANTIC SEARCH HOOKS =====================

/**
 * Hook for semantic search
 */
export function useSemanticSearch(
  request: SemanticSearchRequest | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<SemanticSearchResult, Error> {
  const [debouncedRequest] = useDebounce(request, 300);

  return useQuery({
    queryKey: ['catalog', 'intelligence', 'semantic-search', debouncedRequest],
    queryFn: () => catalogIntelligenceApiClient.performSemanticSearch(debouncedRequest!),
    enabled: !!debouncedRequest && (options?.enabled !== false),
    staleTime: 120000, // 2 minutes
  });
}

/**
 * Hook for natural language query processing
 */
export function useNaturalLanguageQuery(
  query: NaturalLanguageQuery | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<QueryInterpretation, Error> {
  const [debouncedQuery] = useDebounce(query, 500);

  return useQuery({
    queryKey: ['catalog', 'intelligence', 'nlq', debouncedQuery],
    queryFn: () => catalogIntelligenceApiClient.processNaturalLanguageQuery(debouncedQuery!),
    enabled: !!debouncedQuery && (options?.enabled !== false),
    staleTime: 180000,
  });
}

/**
 * Hook for search personalization
 */
export function useSearchPersonalization(
  userId: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<SearchPersonalization, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'search-personalization', userId],
    queryFn: () => catalogIntelligenceApiClient.getSearchPersonalization(userId!),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: 600000,
  });
}

/**
 * Hook for search analytics
 */
export function useSearchAnalytics(
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<SearchAnalytics, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'search-analytics', timeRange],
    queryFn: () => catalogIntelligenceApiClient.getSearchAnalytics(timeRange),
    enabled: options?.enabled !== false,
    refetchInterval: 300000, // 5 minutes
    staleTime: 180000,
  });
}

/**
 * Hook for search context
 */
export function useSearchContext(
  contextId: string | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<SearchContext, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'search-context', contextId],
    queryFn: () => catalogIntelligenceApiClient.getSearchContext(contextId!),
    enabled: !!contextId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

// ===================== RECOMMENDATION HOOKS =====================

/**
 * Hook for getting recommendations
 */
export function useRecommendations(
  request: RecommendationRequest | null,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<Recommendation[], Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'recommendations', request],
    queryFn: () => catalogIntelligenceApiClient.getRecommendations(request!),
    enabled: !!request && (options?.enabled !== false),
    refetchInterval: 300000,
    staleTime: 180000,
  });
}

/**
 * Hook for personalized recommendations
 */
export function usePersonalizedRecommendations(
  userId: string | null,
  context?: any,
  options?: {
    enabled?: boolean;
    limit?: number;
  }
): UseQueryResult<PersonalizedRecommendation[], Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'personalized-recommendations', userId, context],
    queryFn: () => catalogIntelligenceApiClient.getPersonalizedRecommendations(userId!, context, options?.limit),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: 300000,
  });
}

/**
 * Hook for contextual recommendations
 */
export function useContextualRecommendations(
  context: any,
  options?: {
    enabled?: boolean;
    limit?: number;
  }
): UseQueryResult<ContextualRecommendation[], Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'contextual-recommendations', context],
    queryFn: () => catalogIntelligenceApiClient.getContextualRecommendations(context, options?.limit),
    enabled: !!context && (options?.enabled !== false),
    staleTime: 180000,
  });
}

/**
 * Hook for predictive recommendations
 */
export function usePredictiveRecommendations(
  assetId: string | null,
  options?: {
    enabled?: boolean;
    horizon?: string;
  }
): UseQueryResult<PredictiveRecommendation[], Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'predictive-recommendations', assetId, options?.horizon],
    queryFn: () => catalogIntelligenceApiClient.getPredictiveRecommendations(assetId!, options?.horizon),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 600000,
  });
}

/**
 * Hook for smart suggestions
 */
export function useSmartSuggestions(
  query: string | null,
  context?: any,
  options?: {
    enabled?: boolean;
    limit?: number;
  }
): UseQueryResult<SmartSuggestion[], Error> {
  const [debouncedQuery] = useDebounce(query, 300);

  return useQuery({
    queryKey: ['catalog', 'intelligence', 'smart-suggestions', debouncedQuery, context],
    queryFn: () => catalogIntelligenceApiClient.getSmartSuggestions(debouncedQuery!, context, options?.limit),
    enabled: !!debouncedQuery && (options?.enabled !== false),
    staleTime: 120000,
  });
}

// ===================== PATTERN ANALYSIS HOOKS =====================

/**
 * Hook for usage pattern analysis
 */
export function useUsagePatternAnalysis(
  assetId: string | null,
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<UsagePatternAnalysis, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'usage-patterns', assetId, timeRange],
    queryFn: () => catalogIntelligenceApiClient.analyzeUsagePatterns(assetId!, timeRange),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 600000,
  });
}

/**
 * Hook for pattern recognition
 */
export function usePatternRecognition(
  config: any,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<PatternRecognition, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'pattern-recognition', config],
    queryFn: () => catalogIntelligenceApiClient.recognizePatterns(config),
    enabled: !!config && (options?.enabled !== false),
    staleTime: 600000,
  });
}

/**
 * Hook for trend analysis
 */
export function useTrendAnalysis(
  assetId: string | null,
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<TrendAnalysis, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'trend-analysis', assetId, timeRange],
    queryFn: () => catalogIntelligenceApiClient.analyzeTrends(assetId!, timeRange),
    enabled: !!assetId && (options?.enabled !== false),
    staleTime: 600000,
  });
}

/**
 * Hook for intelligence insights
 */
export function useIntelligenceInsights(
  filters?: {
    type?: string;
    assetId?: string;
    timeRange?: string;
  },
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<IntelligenceInsight[], Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'insights', filters],
    queryFn: () => catalogIntelligenceApiClient.getIntelligenceInsights(filters),
    enabled: options?.enabled !== false,
    refetchInterval: 300000,
    staleTime: 180000,
  });
}

// ===================== METRICS HOOKS =====================

/**
 * Hook for intelligence metrics
 */
export function useIntelligenceMetrics(
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<IntelligenceMetrics, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'metrics', timeRange],
    queryFn: () => catalogIntelligenceApiClient.getIntelligenceMetrics(timeRange),
    enabled: options?.enabled !== false,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook for discovery metrics
 */
export function useDiscoveryMetrics(
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<DiscoveryMetrics, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'discovery-metrics', timeRange],
    queryFn: () => catalogIntelligenceApiClient.getDiscoveryMetrics(timeRange),
    enabled: options?.enabled !== false,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook for search metrics
 */
export function useSearchMetrics(
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<SearchMetrics, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'search-metrics', timeRange],
    queryFn: () => catalogIntelligenceApiClient.getSearchMetrics(timeRange),
    enabled: options?.enabled !== false,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook for recommendation metrics
 */
export function useRecommendationMetrics(
  timeRange?: string,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<RecommendationMetrics, Error> {
  return useQuery({
    queryKey: ['catalog', 'intelligence', 'recommendation-metrics', timeRange],
    queryFn: () => catalogIntelligenceApiClient.getRecommendationMetrics(timeRange),
    enabled: options?.enabled !== false,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

// ===================== INTELLIGENCE MUTATION HOOKS =====================

/**
 * Hook for starting discovery jobs
 */
export function useStartDiscoveryJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogIntelligenceApiClient.startDiscoveryJob,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'intelligence', 'discovery-jobs'] });
      
      toast({
        title: "Discovery Job Started",
        description: `Discovery job initiated for data source: ${variables.dataSourceId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Starting Discovery Job",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for updating discovery configuration
 */
export function useUpdateDiscoveryConfiguration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogIntelligenceApiClient.updateDiscoveryConfiguration,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'intelligence', 'discovery-config'] });
      
      toast({
        title: "Discovery Configuration Updated",
        description: `Configuration updated for data source: ${variables.dataSourceId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Discovery Configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for providing recommendation feedback
 */
export function useProvideRecommendationFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogIntelligenceApiClient.provideRecommendationFeedback,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'intelligence', 'recommendations'] });
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback on the recommendation",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Submitting Feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for updating search personalization
 */
export function useUpdateSearchPersonalization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: catalogIntelligenceApiClient.updateSearchPersonalization,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['catalog', 'intelligence', 'search-personalization'] });
      
      toast({
        title: "Search Personalization Updated",
        description: "Your search preferences have been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Search Personalization",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ===================== REAL-TIME INTELLIGENCE HOOKS =====================

/**
 * Hook for real-time intelligence updates
 */
export function useRealTimeIntelligenceUpdates() {
  const [insights, setInsights] = useState<IntelligenceInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const wsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to real-time intelligence updates
    const unsubscribe = catalogIntelligenceApiClient.subscribeToIntelligenceUpdates(
      (update: any) => {
        if (update.type === 'insight') {
          setInsights(prev => [update.data, ...prev.slice(0, 99)]); // Keep last 100 insights
        } else if (update.type === 'recommendation') {
          setRecommendations(prev => [update.data, ...prev.slice(0, 49)]); // Keep last 50 recommendations
        }
      }
    );

    wsRef.current = unsubscribe;

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const clearInsights = useCallback(() => {
    setInsights([]);
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
  }, []);

  return {
    insights,
    recommendations,
    clearInsights,
    clearRecommendations,
    isConnected: !!wsRef.current,
  };
}

/**
 * Comprehensive hook combining all intelligence operations
 */
export function useCatalogIntelligence() {
  const queryClient = useQueryClient();

  // Core mutations
  const startDiscoveryJob = useStartDiscoveryJob();
  const updateDiscoveryConfig = useUpdateDiscoveryConfiguration();
  const provideFeedback = useProvideRecommendationFeedback();
  const updatePersonalization = useUpdateSearchPersonalization();

  // Utility functions
  const invalidateIntelligenceQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['catalog', 'intelligence'] });
  }, [queryClient]);

  const prefetchRecommendations = useCallback(
    (userId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['catalog', 'intelligence', 'personalized-recommendations', userId],
        queryFn: () => catalogIntelligenceApiClient.getPersonalizedRecommendations(userId),
        staleTime: 300000,
      });
    },
    [queryClient]
  );

  return {
    // Mutations
    startDiscoveryJob,
    updateDiscoveryConfig,
    provideFeedback,
    updatePersonalization,

    // Utilities
    invalidateIntelligenceQueries,
    prefetchRecommendations,

    // Status checks
    isStartingDiscovery: startDiscoveryJob.isPending,
    isUpdatingConfig: updateDiscoveryConfig.isPending,
    isProvidingFeedback: provideFeedback.isPending,
    isUpdatingPersonalization: updatePersonalization.isPending,
    hasError: startDiscoveryJob.isError || updateDiscoveryConfig.isError || 
             provideFeedback.isError || updatePersonalization.isError,
  };
}

export default useCatalogIntelligence;