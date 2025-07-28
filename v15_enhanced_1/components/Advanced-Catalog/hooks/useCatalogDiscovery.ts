// 🎣 **CATALOG DISCOVERY HOOKS** - React hooks for intelligent discovery operations
// Provides state management, caching, and real-time updates for discovery functionality

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { catalogDiscoveryAPI } from '../services/catalog-discovery-apis';
import { 
  DiscoveryJob,
  DiscoveryConfiguration,
  ProfilingJob,
  ProfilingResults,
  AutoClassificationResult,
  SearchResult,
  CatalogSearchRequest
} from '../types/catalog-core.types';

import {
  DiscoveryType,
  DiscoveryStatus,
  ProfilingType,
  ScanDepth,
  SamplingStrategy
} from '../types/discovery.types';

// 🎯 QUERY KEYS
export const DISCOVERY_QUERY_KEYS = {
  discoveryJobs: ['discovery', 'jobs'] as const,
  discoveryJob: (id: string) => ['discovery', 'job', id] as const,
  discoveryConfig: (dataSourceId: string) => ['discovery', 'config', dataSourceId] as const,
  discoveryAnalytics: ['discovery', 'analytics'] as const,
  profilingJobs: ['profiling', 'jobs'] as const,
  profilingJob: (id: string) => ['profiling', 'job', id] as const,
  profilingResults: (id: string) => ['profiling', 'results', id] as const,
  searchResults: (query: string) => ['search', 'results', query] as const,
  searchSuggestions: (query: string) => ['search', 'suggestions', query] as const,
  classificationResults: (assetId: string) => ['classification', 'results', assetId] as const,
} as const;

// 🔍 DISCOVERY JOBS HOOK
export const useDiscoveryJobs = (
  filters?: {
    status?: DiscoveryStatus;
    dataSourceId?: string;
    limit?: number;
    offset?: number;
  }
) => {
  return useQuery({
    queryKey: [...DISCOVERY_QUERY_KEYS.discoveryJobs, filters],
    queryFn: () => catalogDiscoveryAPI.getDiscoveryJobs(
      filters?.status,
      filters?.dataSourceId,
      filters?.limit,
      filters?.offset
    ),
    staleTime: 30000, // 30 seconds
    refetchInterval: (data) => {
      // Auto-refresh if any jobs are running
      const hasRunningJobs = data?.data?.some(
        (job: DiscoveryJob) => job.status === DiscoveryStatus.RUNNING
      );
      return hasRunningJobs ? 5000 : false; // 5 seconds if running jobs
    },
  });
};

// 🤖 AI DISCOVERY HOOK
export const useAIDiscovery = () => {
  const queryClient = useQueryClient();
  const [currentJob, setCurrentJob] = useState<DiscoveryJob | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const startDiscovery = useMutation({
    mutationFn: async (params: {
      dataSourceId: string;
      discoveryType?: DiscoveryType;
      scanDepth?: ScanDepth;
    }) => {
      const result = await catalogDiscoveryAPI.startAIDiscovery(
        params.dataSourceId,
        params.discoveryType,
        params.scanDepth
      );
      setCurrentJob(result.data);
      return result;
    },
    onSuccess: (data) => {
      toast.success('AI Discovery started successfully');
      // Start progress monitoring
      startProgressMonitoring(data.data.id);
      // Invalidate discovery jobs query
      queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.discoveryJobs });
    },
    onError: (error) => {
      toast.error('Failed to start AI Discovery');
      console.error('Discovery error:', error);
    },
  });

  const createDiscoveryJob = useMutation({
    mutationFn: (config: DiscoveryConfiguration) => 
      catalogDiscoveryAPI.createDiscoveryJob(config),
    onSuccess: (data) => {
      toast.success('Discovery job created successfully');
      setCurrentJob(data.data);
      startProgressMonitoring(data.data.id);
      queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.discoveryJobs });
    },
    onError: (error) => {
      toast.error('Failed to create discovery job');
      console.error('Discovery job creation error:', error);
    },
  });

  const cancelDiscovery = useMutation({
    mutationFn: (jobId: string) => catalogDiscoveryAPI.cancelDiscoveryJob(jobId),
    onSuccess: () => {
      toast.success('Discovery job cancelled');
      stopProgressMonitoring();
      queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.discoveryJobs });
    },
    onError: (error) => {
      toast.error('Failed to cancel discovery job');
      console.error('Discovery cancellation error:', error);
    },
  });

  const startProgressMonitoring = useCallback((jobId: string) => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(async () => {
      try {
        const response = await catalogDiscoveryAPI.getDiscoveryJobStatus(jobId);
        const job = response.data;
        
        setCurrentJob(job);
        setProgress(job.progress_percentage);

        // Stop monitoring if job is completed or failed
        if (job.status === DiscoveryStatus.COMPLETED || 
            job.status === DiscoveryStatus.FAILED ||
            job.status === DiscoveryStatus.CANCELLED) {
          stopProgressMonitoring();
          
          if (job.status === DiscoveryStatus.COMPLETED) {
            toast.success(`Discovery completed! Found ${job.assets_discovered} assets`);
          } else if (job.status === DiscoveryStatus.FAILED) {
            toast.error('Discovery job failed');
          }

          // Refresh discovery jobs list
          queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.discoveryJobs });
        }
      } catch (error) {
        console.error('Error monitoring discovery progress:', error);
        stopProgressMonitoring();
      }
    }, 2000); // Check every 2 seconds
  }, [queryClient]);

  const stopProgressMonitoring = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressMonitoring();
    };
  }, [stopProgressMonitoring]);

  return {
    startDiscovery,
    createDiscoveryJob,
    cancelDiscovery,
    currentJob,
    progress,
    isDiscovering: startDiscovery.isPending || createDiscoveryJob.isPending,
    error: startDiscovery.error || createDiscoveryJob.error || cancelDiscovery.error,
  };
};

// 📊 DATA PROFILING HOOK
export const useDataProfiling = () => {
  const queryClient = useQueryClient();
  const [currentJob, setCurrentJob] = useState<ProfilingJob | null>(null);

  const createProfilingJob = useMutation({
    mutationFn: async (params: {
      assetId: string;
      profilingType?: ProfilingType;
      samplingStrategy?: SamplingStrategy;
    }) => {
      const result = await catalogDiscoveryAPI.createProfilingJob(
        params.assetId,
        params.profilingType,
        params.samplingStrategy
      );
      setCurrentJob(result.data);
      return result;
    },
    onSuccess: (data) => {
      toast.success('Data profiling started');
      queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.profilingJobs });
    },
    onError: (error) => {
      toast.error('Failed to start data profiling');
      console.error('Profiling error:', error);
    },
  });

  const quickProfile = useMutation({
    mutationFn: (assetId: string) => catalogDiscoveryAPI.quickProfile(assetId),
    onSuccess: () => {
      toast.success('Quick profiling completed');
    },
    onError: (error) => {
      toast.error('Quick profiling failed');
      console.error('Quick profiling error:', error);
    },
  });

  const detectPatterns = useMutation({
    mutationFn: (assetId: string) => catalogDiscoveryAPI.detectDataPatterns(assetId),
    onSuccess: () => {
      toast.success('Pattern detection completed');
    },
    onError: (error) => {
      toast.error('Pattern detection failed');
      console.error('Pattern detection error:', error);
    },
  });

  const analyzeCorrelations = useMutation({
    mutationFn: (assetId: string) => catalogDiscoveryAPI.analyzeCorrelations(assetId),
    onSuccess: () => {
      toast.success('Correlation analysis completed');
    },
    onError: (error) => {
      toast.error('Correlation analysis failed');
      console.error('Correlation analysis error:', error);
    },
  });

  return {
    createProfilingJob,
    quickProfile,
    detectPatterns,
    analyzeCorrelations,
    currentJob,
    isProfiling: createProfilingJob.isPending || quickProfile.isPending,
    error: createProfilingJob.error || quickProfile.error,
  };
};

// 🔍 SEMANTIC SEARCH HOOK
export const useSemanticSearch = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<CatalogSearchRequest[]>([]);

  const performSearch = useMutation({
    mutationFn: (request: CatalogSearchRequest) => {
      // Add to search history
      if (!searchHistory.includes(request.query)) {
        setSearchHistory(prev => [request.query, ...prev.slice(0, 9)]); // Keep last 10
      }
      
      // Add to recent searches
      setRecentSearches(prev => [request, ...prev.slice(0, 4)]); // Keep last 5
      
      return catalogDiscoveryAPI.performSemanticSearch(request);
    },
    onError: (error) => {
      toast.error('Search failed');
      console.error('Search error:', error);
    },
  });

  const naturalLanguageSearch = useMutation({
    mutationFn: (params: { query: string; userContext?: any }) =>
      catalogDiscoveryAPI.naturalLanguageSearch(params.query, params.userContext),
    onError: (error) => {
      toast.error('Natural language search failed');
      console.error('NL search error:', error);
    },
  });

  const findSimilarAssets = useMutation({
    mutationFn: (params: {
      assetId: string;
      similarityThreshold?: number;
      maxResults?: number;
    }) => catalogDiscoveryAPI.findSimilarAssets(
      params.assetId,
      params.similarityThreshold,
      params.maxResults
    ),
    onError: (error) => {
      toast.error('Similar assets search failed');
      console.error('Similar assets error:', error);
    },
  });

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    setRecentSearches([]);
  }, []);

  return {
    performSearch,
    naturalLanguageSearch,
    findSimilarAssets,
    searchHistory,
    recentSearches,
    clearSearchHistory,
    isSearching: performSearch.isPending || naturalLanguageSearch.isPending || findSimilarAssets.isPending,
    searchResults: performSearch.data,
    nlSearchResults: naturalLanguageSearch.data,
    similarAssets: findSimilarAssets.data,
    error: performSearch.error || naturalLanguageSearch.error || findSimilarAssets.error,
  };
};

// 🏷️ AUTO-CLASSIFICATION HOOK
export const useAutoClassification = () => {
  const queryClient = useQueryClient();

  const classifyAsset = useMutation({
    mutationFn: (assetId: string) => catalogDiscoveryAPI.classifyAsset(assetId),
    onSuccess: (data, assetId) => {
      toast.success('Asset classification completed');
      // Update classification results cache
      queryClient.setQueryData(
        DISCOVERY_QUERY_KEYS.classificationResults(assetId),
        data
      );
    },
    onError: (error) => {
      toast.error('Asset classification failed');
      console.error('Classification error:', error);
    },
  });

  const batchClassify = useMutation({
    mutationFn: (assetIds: string[]) => catalogDiscoveryAPI.batchClassifyAssets(assetIds),
    onSuccess: (data) => {
      toast.success(`Batch classification completed for ${data.data.length} assets`);
      // Invalidate all classification queries
      queryClient.invalidateQueries({ 
        queryKey: ['classification'] 
      });
    },
    onError: (error) => {
      toast.error('Batch classification failed');
      console.error('Batch classification error:', error);
    },
  });

  const detectSensitiveData = useMutation({
    mutationFn: (assetId: string) => catalogDiscoveryAPI.detectSensitiveData(assetId),
    onSuccess: () => {
      toast.success('Sensitive data detection completed');
    },
    onError: (error) => {
      toast.error('Sensitive data detection failed');
      console.error('Sensitive data detection error:', error);
    },
  });

  const trainWithFeedback = useMutation({
    mutationFn: (feedbackData: any[]) => catalogDiscoveryAPI.trainWithFeedback(feedbackData),
    onSuccess: () => {
      toast.success('Model training with feedback completed');
    },
    onError: (error) => {
      toast.error('Model training failed');
      console.error('Training error:', error);
    },
  });

  return {
    classifyAsset,
    batchClassify,
    detectSensitiveData,
    trainWithFeedback,
    isClassifying: classifyAsset.isPending || batchClassify.isPending,
    classificationResult: classifyAsset.data,
    batchResults: batchClassify.data,
    sensitiveDataResults: detectSensitiveData.data,
    error: classifyAsset.error || batchClassify.error || detectSensitiveData.error,
  };
};

// 📈 DISCOVERY ANALYTICS HOOK
export const useDiscoveryAnalytics = () => {
  const getAnalytics = useQuery({
    queryKey: DISCOVERY_QUERY_KEYS.discoveryAnalytics,
    queryFn: () => catalogDiscoveryAPI.getDiscoveryAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getCoverage = useQuery({
    queryKey: ['discovery', 'coverage'],
    queryFn: () => catalogDiscoveryAPI.getDiscoveryCoverage(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const getProfilingStats = useQuery({
    queryKey: ['profiling', 'statistics'],
    queryFn: () => catalogDiscoveryAPI.getProfilingStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getSearchAnalytics = useQuery({
    queryKey: ['search', 'analytics'],
    queryFn: () => catalogDiscoveryAPI.getSearchAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    analytics: getAnalytics.data,
    coverage: getCoverage.data,
    profilingStats: getProfilingStats.data,
    searchAnalytics: getSearchAnalytics.data,
    isLoading: getAnalytics.isLoading || getCoverage.isLoading || 
                getProfilingStats.isLoading || getSearchAnalytics.isLoading,
    error: getAnalytics.error || getCoverage.error || 
           getProfilingStats.error || getSearchAnalytics.error,
    refetch: () => {
      getAnalytics.refetch();
      getCoverage.refetch();
      getProfilingStats.refetch();
      getSearchAnalytics.refetch();
    },
  };
};

// 🔧 DISCOVERY CONFIGURATION HOOK
export const useDiscoveryConfiguration = (dataSourceId: string) => {
  const queryClient = useQueryClient();

  const getConfig = useQuery({
    queryKey: DISCOVERY_QUERY_KEYS.discoveryConfig(dataSourceId),
    queryFn: () => catalogDiscoveryAPI.getDiscoveryConfig(dataSourceId),
    enabled: !!dataSourceId,
  });

  const updateConfig = useMutation({
    mutationFn: (config: Partial<DiscoveryConfiguration>) =>
      catalogDiscoveryAPI.updateDiscoveryConfig(dataSourceId, config),
    onSuccess: () => {
      toast.success('Discovery configuration updated');
      queryClient.invalidateQueries({ 
        queryKey: DISCOVERY_QUERY_KEYS.discoveryConfig(dataSourceId) 
      });
    },
    onError: (error) => {
      toast.error('Failed to update discovery configuration');
      console.error('Config update error:', error);
    },
  });

  const testConnection = useMutation({
    mutationFn: () => catalogDiscoveryAPI.testDiscoveryConnection(dataSourceId),
    onSuccess: (data) => {
      if (data.data.success) {
        toast.success('Connection test successful');
      } else {
        toast.error(`Connection test failed: ${data.data.message}`);
      }
    },
    onError: (error) => {
      toast.error('Connection test failed');
      console.error('Connection test error:', error);
    },
  });

  return {
    config: getConfig.data,
    updateConfig,
    testConnection,
    isLoading: getConfig.isLoading,
    isUpdating: updateConfig.isPending,
    isTesting: testConnection.isPending,
    error: getConfig.error || updateConfig.error || testConnection.error,
  };
};

// 🎯 SEARCH SUGGESTIONS HOOK
export const useSearchSuggestions = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: DISCOVERY_QUERY_KEYS.searchSuggestions(query),
    queryFn: () => catalogDiscoveryAPI.getSearchSuggestions(query),
    enabled: enabled && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 30000, // 30 seconds
    debounceMs: 300, // Debounce to avoid too many requests
  });
};

// 🎯 PERSONALIZED RECOMMENDATIONS HOOK
export const usePersonalizedRecommendations = (userId: string) => {
  return useQuery({
    queryKey: ['recommendations', userId],
    queryFn: () => catalogDiscoveryAPI.getPersonalizedRecommendations(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// 🔄 SEARCH INDEX MANAGEMENT HOOK
export const useSearchIndexManagement = () => {
  const queryClient = useQueryClient();

  const rebuildIndex = useMutation({
    mutationFn: (assetIds?: string[]) => catalogDiscoveryAPI.rebuildSearchIndex(assetIds),
    onSuccess: () => {
      toast.success('Search index rebuild started');
      // Invalidate all search-related queries
      queryClient.invalidateQueries({ queryKey: ['search'] });
    },
    onError: (error) => {
      toast.error('Failed to rebuild search index');
      console.error('Index rebuild error:', error);
    },
  });

  return {
    rebuildIndex,
    isRebuilding: rebuildIndex.isPending,
    error: rebuildIndex.error,
  };
};