/**
 * Core Catalog Hooks
 * Maps to: enterprise_catalog_service.py, enterprise_catalog_routes.py
 * 
 * Comprehensive React hooks for core catalog operations with React Query,
 * real-time updates, caching, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { catalogCoreApiClient } from '../services/catalog-core-apis';
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
} from '../types/catalog-core.types';

import type {
  SearchRequest,
  SearchResponse,
  AutoCompleteRequest,
  AutoCompleteResponse,
  SavedSearch,
} from '../types/search.types';

import type {
  DataProfile,
  MetadataEnrichment,
  MetadataManagementConfig,
} from '../types/metadata.types';

import { useToast } from '@/components/ui/use-toast';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useDebounce } from 'use-debounce';

// ===================== ASSET MANAGEMENT HOOKS =====================

/**
 * Hook for managing intelligent data assets
 */
export const useIntelligentAssets = (filters: {
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
} = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounce search query for better performance
  const [debouncedSearchQuery] = useDebounce(filters.search_query, 300);
  const finalFilters = { ...filters, search_query: debouncedSearchQuery };

  // Assets query with caching and real-time updates
  const assetsQuery = useQuery({
    queryKey: ['assets', finalFilters],
    queryFn: () => catalogCoreApiClient.getAssets(finalFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: Error) => {
      toast({
        title: "Error fetching assets",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: ({ assetData, enhancementConfig }: {
      assetData: Partial<IntelligentDataAsset>;
      enhancementConfig?: Record<string, any>;
    }) => catalogCoreApiClient.createIntelligentAsset(assetData, enhancementConfig),
    onSuccess: (newAsset) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.setQueryData(['assets', newAsset.id], newAsset);
      toast({
        title: "Asset created successfully",
        description: `Asset "${newAsset.name}" has been created with AI enhancement.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating asset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update asset mutation with optimistic updates
  const updateAssetMutation = useMutation({
    mutationFn: ({ assetId, updates, enhancementConfig }: {
      assetId: string;
      updates: Partial<IntelligentDataAsset>;
      enhancementConfig?: Record<string, any>;
    }) => catalogCoreApiClient.updateAsset(assetId, updates, enhancementConfig),
    onMutate: async ({ assetId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['assets', assetId] });
      
      // Snapshot the previous value
      const previousAsset = queryClient.getQueryData<IntelligentDataAsset>(['assets', assetId]);
      
      // Optimistically update the cache
      if (previousAsset) {
        queryClient.setQueryData(['assets', assetId], { ...previousAsset, ...updates });
      }
      
      return { previousAsset };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousAsset) {
        queryClient.setQueryData(['assets', variables.assetId], context.previousAsset);
      }
      toast({
        title: "Error updating asset",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (updatedAsset) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.setQueryData(['assets', updatedAsset.id], updatedAsset);
      toast({
        title: "Asset updated successfully",
        description: `Asset "${updatedAsset.name}" has been updated.`,
      });
    },
  });

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: ({ assetId, cascadeDelete, preserveLineage }: {
      assetId: string;
      cascadeDelete?: boolean;
      preserveLineage?: boolean;
    }) => catalogCoreApiClient.deleteAsset(assetId, cascadeDelete, preserveLineage),
    onSuccess: (result, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.removeQueries({ queryKey: ['assets', assetId] });
      toast({
        title: "Asset deleted successfully",
        description: result.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting asset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk operations
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ assetIds, updates }: {
      assetIds: string[];
      updates: Partial<IntelligentDataAsset>;
    }) => catalogCoreApiClient.bulkUpdateAssets(assetIds, updates),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: "Bulk update completed",
        description: `${result.updated_assets.length} assets updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error in bulk update",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    assets: assetsQuery.data?.assets || [],
    totalCount: assetsQuery.data?.total_count || 0,
    pagination: {
      page: assetsQuery.data?.page || 1,
      limit: assetsQuery.data?.limit || 20,
      hasNext: assetsQuery.data?.has_next || false,
      hasPrevious: assetsQuery.data?.has_previous || false,
    },
    
    // Loading states
    isLoading: assetsQuery.isLoading,
    isFetching: assetsQuery.isFetching,
    isError: assetsQuery.isError,
    error: assetsQuery.error,
    
    // Mutations
    createAsset: createAssetMutation.mutate,
    updateAsset: updateAssetMutation.mutate,
    deleteAsset: deleteAssetMutation.mutate,
    bulkUpdate: bulkUpdateMutation.mutate,
    
    // Mutation states
    isCreating: createAssetMutation.isPending,
    isUpdating: updateAssetMutation.isPending,
    isDeleting: deleteAssetMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    
    // Utilities
    refetch: assetsQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
  };
};

/**
 * Hook for individual asset management
 */
export const useIntelligentAsset = (
  assetId: string | null,
  options: {
    includeLineage?: boolean;
    includeQuality?: boolean;
    includeUsage?: boolean;
    enabled?: boolean;
  } = {}
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assetQuery = useQuery({
    queryKey: ['assets', assetId, options],
    queryFn: () => {
      if (!assetId) throw new Error('Asset ID is required');
      return catalogCoreApiClient.getAssetById(
        assetId,
        options.includeLineage,
        options.includeQuality,
        options.includeUsage
      );
    },
    enabled: !!assetId && (options.enabled !== false),
    staleTime: 5 * 60 * 1000,
    onError: (error: Error) => {
      toast({
        title: "Error fetching asset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    asset: assetQuery.data,
    isLoading: assetQuery.isLoading,
    isFetching: assetQuery.isFetching,
    isError: assetQuery.isError,
    error: assetQuery.error,
    refetch: assetQuery.refetch,
  };
};

// ===================== DISCOVERY HOOKS =====================

/**
 * Hook for asset discovery operations
 */
export const useAssetDiscovery = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Trigger discovery mutation
  const triggerDiscoveryMutation = useMutation({
    mutationFn: ({ dataSourceId, discoveryConfig }: {
      dataSourceId: string;
      discoveryConfig: any;
    }) => catalogCoreApiClient.discoverAssets(dataSourceId, discoveryConfig),
    onSuccess: (result) => {
      toast({
        title: "Discovery job started",
        description: `Discovery job ${result.discovery_job_id} started. Estimated duration: ${result.estimated_duration} minutes.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error starting discovery",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Discovery job status with polling
  const useDiscoveryJobStatus = (jobId: string | null, pollInterval: number = 5000) => {
    return useQuery({
      queryKey: ['discoveryJobStatus', jobId],
      queryFn: () => {
        if (!jobId) throw new Error('Job ID is required');
        return catalogCoreApiClient.getDiscoveryJobStatus(jobId);
      },
      enabled: !!jobId,
      refetchInterval: (data) => {
        // Stop polling when job is completed, failed, or cancelled
        if (data && ['completed', 'failed', 'cancelled'].includes(data.status)) {
          return false;
        }
        return pollInterval;
      },
      onError: (error: Error) => {
        toast({
          title: "Error fetching discovery status",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Discovery results
  const useDiscoveryResults = (jobId: string | null) => {
    return useQuery({
      queryKey: ['discoveryResults', jobId],
      queryFn: () => {
        if (!jobId) throw new Error('Job ID is required');
        return catalogCoreApiClient.getDiscoveryJobResults(jobId);
      },
      enabled: !!jobId,
      staleTime: Infinity, // Results don't change once job is complete
      onError: (error: Error) => {
        toast({
          title: "Error fetching discovery results",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return {
    triggerDiscovery: triggerDiscoveryMutation.mutate,
    isTriggeringDiscovery: triggerDiscoveryMutation.isPending,
    useDiscoveryJobStatus,
    useDiscoveryResults,
  };
};

// ===================== LINEAGE HOOKS =====================

/**
 * Hook for asset lineage management
 */
export const useAssetLineage = (assetId: string | null, options: {
  direction?: 'upstream' | 'downstream' | 'both';
  depth?: number;
  includeImpactAnalysis?: boolean;
  enabled?: boolean;
} = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const lineageQuery = useQuery({
    queryKey: ['lineage', assetId, options],
    queryFn: () => {
      if (!assetId) throw new Error('Asset ID is required');
      return catalogCoreApiClient.getAssetLineage(
        assetId,
        options.direction,
        options.depth,
        options.includeImpactAnalysis
      );
    },
    enabled: !!assetId && (options.enabled !== false),
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: (error: Error) => {
      toast({
        title: "Error fetching lineage",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create lineage relationship
  const createLineageMutation = useMutation({
    mutationFn: ({ sourceAssetId, targetAssetId, lineageData }: {
      sourceAssetId: string;
      targetAssetId: string;
      lineageData: Partial<EnterpriseDataLineage>;
    }) => catalogCoreApiClient.createLineageRelationship(sourceAssetId, targetAssetId, lineageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineage'] });
      toast({
        title: "Lineage relationship created",
        description: "The lineage relationship has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating lineage",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Impact analysis
  const performImpactAnalysis = useMutation({
    mutationFn: ({ assetId, changeType, changeDetails }: {
      assetId: string;
      changeType: 'schema_change' | 'data_type_change' | 'removal' | 'transformation_change';
      changeDetails: Record<string, any>;
    }) => catalogCoreApiClient.performImpactAnalysis(assetId, changeType, changeDetails),
    onError: (error: Error) => {
      toast({
        title: "Error performing impact analysis",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    lineageGraph: lineageQuery.data,
    isLoading: lineageQuery.isLoading,
    isFetching: lineageQuery.isFetching,
    isError: lineageQuery.isError,
    error: lineageQuery.error,
    createLineage: createLineageMutation.mutate,
    performImpactAnalysis: performImpactAnalysis.mutate,
    isCreatingLineage: createLineageMutation.isPending,
    isPerformingImpactAnalysis: performImpactAnalysis.isPending,
    refetch: lineageQuery.refetch,
  };
};

// ===================== QUALITY HOOKS =====================

/**
 * Hook for asset quality management
 */
export const useAssetQuality = (assetId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Quality assessment query
  const qualityQuery = useQuery({
    queryKey: ['assetQuality', assetId],
    queryFn: () => {
      if (!assetId) throw new Error('Asset ID is required');
      return catalogCoreApiClient.getAssetQualityAssessment(assetId);
    },
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000,
    onError: (error: Error) => {
      toast({
        title: "Error fetching quality assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Trigger quality assessment
  const triggerAssessmentMutation = useMutation({
    mutationFn: ({ assetId, assessmentConfig }: {
      assetId: string;
      assessmentConfig: any;
    }) => catalogCoreApiClient.triggerQualityAssessment(assetId, assessmentConfig),
    onSuccess: (result) => {
      toast({
        title: "Quality assessment started",
        description: `Assessment job ${result.assessment_job_id} started. Estimated duration: ${result.estimated_duration} minutes.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error triggering assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Quality rules query
  const qualityRulesQuery = useQuery({
    queryKey: ['assetQualityRules', assetId],
    queryFn: () => {
      if (!assetId) throw new Error('Asset ID is required');
      return catalogCoreApiClient.getAssetQualityRules(assetId);
    },
    enabled: !!assetId,
    staleTime: 10 * 60 * 1000,
  });

  // Quality recommendations query
  const recommendationsQuery = useQuery({
    queryKey: ['qualityRecommendations', assetId],
    queryFn: () => {
      if (!assetId) throw new Error('Asset ID is required');
      return catalogCoreApiClient.getQualityRecommendations(assetId);
    },
    enabled: !!assetId,
    staleTime: 15 * 60 * 1000,
  });

  return {
    qualityAssessment: qualityQuery.data,
    qualityRules: qualityRulesQuery.data || [],
    recommendations: recommendationsQuery.data || [],
    
    isLoadingQuality: qualityQuery.isLoading,
    isLoadingRules: qualityRulesQuery.isLoading,
    isLoadingRecommendations: recommendationsQuery.isLoading,
    
    triggerAssessment: triggerAssessmentMutation.mutate,
    isTriggeringAssessment: triggerAssessmentMutation.isPending,
    
    refetchQuality: qualityQuery.refetch,
    refetchRules: qualityRulesQuery.refetch,
    refetchRecommendations: recommendationsQuery.refetch,
  };
};

// ===================== SEARCH HOOKS =====================

/**
 * Hook for semantic search functionality
 */
export const useSemanticSearch = () => {
  const { toast } = useToast();
  const [searchHistory, setSearchHistory] = useState<SearchRequest[]>([]);

  // Search mutation with history tracking
  const searchMutation = useMutation({
    mutationFn: (searchRequest: SearchRequest) => catalogCoreApiClient.semanticSearch(searchRequest),
    onSuccess: (response, request) => {
      // Add to search history
      setSearchHistory(prev => [request, ...prev.slice(0, 9)]); // Keep last 10 searches
    },
    onError: (error: Error) => {
      toast({
        title: "Search error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Autocomplete with debouncing
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [debouncedAutocompleteQuery] = useDebounce(autocompleteQuery, 300);

  const autocompleteQuery_ = useQuery({
    queryKey: ['searchAutocomplete', debouncedAutocompleteQuery],
    queryFn: () => catalogCoreApiClient.getSearchAutocomplete({
      partial_query: debouncedAutocompleteQuery,
      max_suggestions: 10,
    }),
    enabled: debouncedAutocompleteQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const search = useCallback((searchRequest: SearchRequest) => {
    searchMutation.mutate(searchRequest);
  }, [searchMutation]);

  const updateAutocompleteQuery = useCallback((query: string) => {
    setAutocompleteQuery(query);
  }, []);

  return {
    search,
    searchResults: searchMutation.data,
    isSearching: searchMutation.isPending,
    searchError: searchMutation.error,
    searchHistory,
    
    updateAutocompleteQuery,
    autocompleteSuggestions: autocompleteQuery_.data?.suggestions || [],
    isLoadingAutocomplete: autocompleteQuery_.isLoading,
    
    clearHistory: () => setSearchHistory([]),
  };
};

// ===================== BUSINESS GLOSSARY HOOKS =====================

/**
 * Hook for business glossary management
 */
export const useBusinessGlossary = (filters: {
  category?: string;
  domain?: string;
  search_query?: string;
  status?: 'draft' | 'approved' | 'deprecated';
  page?: number;
  limit?: number;
} = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [debouncedSearchQuery] = useDebounce(filters.search_query, 300);
  const finalFilters = { ...filters, search_query: debouncedSearchQuery };

  const termsQuery = useQuery({
    queryKey: ['businessGlossaryTerms', finalFilters],
    queryFn: () => catalogCoreApiClient.getBusinessGlossaryTerms(finalFilters),
    staleTime: 10 * 60 * 1000,
    onError: (error: Error) => {
      toast({
        title: "Error fetching glossary terms",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createTermMutation = useMutation({
    mutationFn: (termData: Partial<BusinessGlossaryTerm>) => 
      catalogCoreApiClient.createBusinessGlossaryTerm(termData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessGlossaryTerms'] });
      toast({
        title: "Term created successfully",
        description: "The business glossary term has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating term",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    terms: termsQuery.data?.terms || [],
    totalCount: termsQuery.data?.total_count || 0,
    isLoading: termsQuery.isLoading,
    isError: termsQuery.isError,
    error: termsQuery.error,
    
    createTerm: createTermMutation.mutate,
    isCreatingTerm: createTermMutation.isPending,
    
    refetch: termsQuery.refetch,
  };
};

// ===================== USAGE ANALYTICS HOOKS =====================

/**
 * Hook for asset usage analytics
 */
export const useAssetUsage = (assetId: string | null, timeRange: string = '30d') => {
  const { toast } = useToast();

  const usageQuery = useQuery({
    queryKey: ['assetUsage', assetId, timeRange],
    queryFn: () => {
      if (!assetId) throw new Error('Asset ID is required');
      return catalogCoreApiClient.getAssetUsageMetrics(assetId, timeRange);
    },
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000,
    onError: (error: Error) => {
      toast({
        title: "Error fetching usage metrics",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Record usage event
  const recordUsageMutation = useMutation({
    mutationFn: ({ assetId, usageData }: {
      assetId: string;
      usageData: any;
    }) => catalogCoreApiClient.recordAssetUsage(assetId, usageData),
  });

  return {
    usageMetrics: usageQuery.data,
    isLoading: usageQuery.isLoading,
    recordUsage: recordUsageMutation.mutate,
    refetch: usageQuery.refetch,
  };
};

// ===================== CONSOLIDATED CATALOG STATE HOOK =====================

/**
 * Consolidated hook for managing catalog state across multiple domains
 */
export const useCatalogState = (assetId: string | null) => {
  const assets = useIntelligentAssets();
  const asset = useIntelligentAsset(assetId);
  const lineage = useAssetLineage(assetId);
  const quality = useAssetQuality(assetId);
  const usage = useAssetUsage(assetId);
  const discovery = useAssetDiscovery();
  const search = useSemanticSearch();
  const glossary = useBusinessGlossary();

  const isLoading = asset.isLoading || lineage.isLoading || quality.isLoadingQuality;
  const hasError = asset.isError || lineage.isError || quality.isLoadingQuality;

  return {
    // Asset management
    assets,
    asset: asset.asset,
    isLoadingAsset: asset.isLoading,
    
    // Lineage
    lineageGraph: lineage.lineageGraph,
    isLoadingLineage: lineage.isLoading,
    createLineage: lineage.createLineage,
    performImpactAnalysis: lineage.performImpactAnalysis,
    
    // Quality
    qualityAssessment: quality.qualityAssessment,
    qualityRules: quality.qualityRules,
    recommendations: quality.recommendations,
    triggerQualityAssessment: quality.triggerAssessment,
    
    // Usage
    usageMetrics: usage.usageMetrics,
    recordUsage: usage.recordUsage,
    
    // Discovery
    triggerDiscovery: discovery.triggerDiscovery,
    
    // Search
    search: search.search,
    searchResults: search.searchResults,
    searchHistory: search.searchHistory,
    
    // Glossary
    glossaryTerms: glossary.terms,
    createGlossaryTerm: glossary.createTerm,
    
    // Global states
    isLoading,
    hasError,
    
    // Utilities
    refetchAll: () => {
      asset.refetch();
      lineage.refetch();
      quality.refetchQuality();
      usage.refetch();
    },
  };
};