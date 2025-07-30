// ============================================================================
// BUSINESS GLOSSARY HOOKS - ADVANCED CATALOG ANALYTICS
// ============================================================================
// Custom React hooks for managing business glossary data, relationships, and search
// Integrates with comprehensive_business_glossary_service.py backend service
// ============================================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Services
import { 
  businessGlossaryService,
  catalogAnalyticsService,
  enterpriseCatalogService
} from '../services/catalog-apis';

// Types
import { 
  BusinessGlossaryTerm,
  TermRelationship,
  GlossaryCategory,
  TermUsage,
  GlossaryMetrics,
  TermApproval,
  GlossaryConfig,
  GlossarySearchQuery,
  GlossarySearchResult,
  ApiResponse
} from '../types/catalog-core.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UseBusinessGlossaryOptions {
  enableRealTime?: boolean;
  includeMetrics?: boolean;
  includeRelationships?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseGlossarySearchOptions {
  enableSuggestions?: boolean;
  enableFuzzySearch?: boolean;
  enableSemanticSearch?: boolean;
  maxResults?: number;
}

interface UseGlossaryRelationshipsOptions {
  enableNetworkAnalysis?: boolean;
  enableAutoSuggestions?: boolean;
  includeMetrics?: boolean;
}

interface GlossaryState {
  terms: BusinessGlossaryTerm[];
  categories: GlossaryCategory[];
  metrics: GlossaryMetrics | null;
  config: GlossaryConfig | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface SearchState {
  query: string;
  results: GlossarySearchResult[];
  suggestions: string[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  facets: Record<string, any>;
}

interface RelationshipState {
  relationships: TermRelationship[];
  networkData: {
    nodes: any[];
    links: any[];
  };
  loading: boolean;
  error: string | null;
  metrics: Record<string, any>;
}

// ============================================================================
// MAIN BUSINESS GLOSSARY HOOK
// ============================================================================

export const useBusinessGlossary = (options: UseBusinessGlossaryOptions = {}) => {
  const {
    enableRealTime = false,
    includeMetrics = true,
    includeRelationships = false,
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes
  } = options;

  const queryClient = useQueryClient();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<GlossaryState>({
    terms: [],
    categories: [],
    metrics: null,
    config: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Fetch all business terms
  const {
    data: termsData,
    isLoading: termsLoading,
    error: termsError,
    refetch: refetchTerms
  } = useQuery({
    queryKey: ['businessGlossary', 'terms'],
    queryFn: async () => {
      const response = await businessGlossaryService.getAllTerms();
      return response;
    },
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus: enableRealTime,
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['businessGlossary', 'categories'],
    queryFn: async () => {
      const response = await businessGlossaryService.getCategories();
      return response;
    },
    staleTime: 300000, // 5 minutes
    cacheTime: 600000 // 10 minutes
  });

  // Fetch metrics (optional)
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError
  } = useQuery({
    queryKey: ['businessGlossary', 'metrics'],
    queryFn: async () => {
      const response = await businessGlossaryService.getGlossaryMetrics();
      return response;
    },
    enabled: includeMetrics,
    staleTime: 120000, // 2 minutes
    cacheTime: 300000, // 5 minutes
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Fetch configuration
  const {
    data: configData,
    isLoading: configLoading,
    error: configError
  } = useQuery({
    queryKey: ['businessGlossary', 'config'],
    queryFn: async () => {
      const response = await businessGlossaryService.getGlossaryConfig();
      return response;
    },
    staleTime: 600000, // 10 minutes
    cacheTime: 1200000 // 20 minutes
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create term mutation
  const createTermMutation = useMutation({
    mutationFn: async (termData: Partial<BusinessGlossaryTerm>) => {
      const response = await businessGlossaryService.createTerm(termData);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'terms'] });
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'metrics'] });
    },
    onError: (error) => {
      console.error('Failed to create term:', error);
    }
  });

  // Update term mutation
  const updateTermMutation = useMutation({
    mutationFn: async ({ termId, termData }: { termId: string; termData: Partial<BusinessGlossaryTerm> }) => {
      const response = await businessGlossaryService.updateTerm(termId, termData);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'terms'] });
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'metrics'] });
    },
    onError: (error) => {
      console.error('Failed to update term:', error);
    }
  });

  // Delete term mutation
  const deleteTermMutation = useMutation({
    mutationFn: async (termId: string) => {
      const response = await businessGlossaryService.deleteTerm(termId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'terms'] });
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'metrics'] });
    },
    onError: (error) => {
      console.error('Failed to delete term:', error);
    }
  });

  // Approve/Reject term mutation
  const approveTermMutation = useMutation({
    mutationFn: async ({ termId, approved, comment }: { termId: string; approved: boolean; comment: string }) => {
      const response = await businessGlossaryService.approveTerm(termId, approved, comment);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'terms'] });
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'metrics'] });
    },
    onError: (error) => {
      console.error('Failed to approve/reject term:', error);
    }
  });

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async ({ operation, termIds, data }: { operation: string; termIds: string[]; data?: any }) => {
      const response = await businessGlossaryService.bulkOperation(operation, termIds, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'terms'] });
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'metrics'] });
    },
    onError: (error) => {
      console.error('Failed to perform bulk operation:', error);
    }
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Update state when data changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      terms: termsData?.data || [],
      categories: categoriesData?.data || [],
      metrics: metricsData?.data || null,
      config: configData?.data || null,
      loading: termsLoading || categoriesLoading || (includeMetrics && metricsLoading) || configLoading,
      error: termsError?.message || categoriesError?.message || metricsError?.message || configError?.message || null,
      lastUpdated: new Date()
    }));
  }, [
    termsData, categoriesData, metricsData, configData,
    termsLoading, categoriesLoading, metricsLoading, configLoading,
    termsError, categoriesError, metricsError, configError,
    includeMetrics
  ]);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refetchTerms();
        queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'metrics'] });
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refetchTerms, queryClient]);

  // ============================================================================
  // CALLBACK FUNCTIONS
  // ============================================================================

  const createTerm = useCallback(async (termData: Partial<BusinessGlossaryTerm>) => {
    try {
      const result = await createTermMutation.mutateAsync(termData);
      return result.data;
    } catch (error) {
      throw error;
    }
  }, [createTermMutation]);

  const updateTerm = useCallback(async (termId: string, termData: Partial<BusinessGlossaryTerm>) => {
    try {
      const result = await updateTermMutation.mutateAsync({ termId, termData });
      return result.data;
    } catch (error) {
      throw error;
    }
  }, [updateTermMutation]);

  const deleteTerm = useCallback(async (termId: string) => {
    try {
      await deleteTermMutation.mutateAsync(termId);
    } catch (error) {
      throw error;
    }
  }, [deleteTermMutation]);

  const approveTerm = useCallback(async (termId: string, approved: boolean, comment: string = '') => {
    try {
      const result = await approveTermMutation.mutateAsync({ termId, approved, comment });
      return result.data;
    } catch (error) {
      throw error;
    }
  }, [approveTermMutation]);

  const bulkOperation = useCallback(async (operation: string, termIds: string[], data?: any) => {
    try {
      const result = await bulkOperationMutation.mutateAsync({ operation, termIds, data });
      return result.data;
    } catch (error) {
      throw error;
    }
  }, [bulkOperationMutation]);

  const refreshGlossary = useCallback(async () => {
    try {
      await Promise.all([
        refetchTerms(),
        queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'categories'] }),
        queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'metrics'] })
      ]);
    } catch (error) {
      console.error('Failed to refresh glossary:', error);
    }
  }, [refetchTerms, queryClient]);

  const getTermById = useCallback((termId: string) => {
    return state.terms.find(term => term.id === termId);
  }, [state.terms]);

  const getTermsByCategory = useCallback((categoryId: string) => {
    return state.terms.filter(term => term.category === categoryId);
  }, [state.terms]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // Data
    terms: state.terms,
    categories: state.categories,
    metrics: state.metrics,
    config: state.config,
    
    // State
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Actions
    createTerm,
    updateTerm,
    deleteTerm,
    approveTerm,
    bulkOperation,
    refreshGlossary,
    
    // Utilities
    getTermById,
    getTermsByCategory,
    
    // Mutation states
    isCreating: createTermMutation.isLoading,
    isUpdating: updateTermMutation.isLoading,
    isDeleting: deleteTermMutation.isLoading,
    isApproving: approveTermMutation.isLoading,
    isBulkOperating: bulkOperationMutation.isLoading
  };
};

// ============================================================================
// GLOSSARY SEARCH HOOK
// ============================================================================

export const useGlossarySearch = (options: UseGlossarySearchOptions = {}) => {
  const {
    enableSuggestions = true,
    enableFuzzySearch = true,
    enableSemanticSearch = false,
    maxResults = 50
  } = options;

  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    suggestions: [],
    loading: false,
    error: null,
    totalResults: 0,
    facets: {}
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // SEARCH FUNCTION
  // ============================================================================

  const performSearch = useCallback(async (query: string, filters?: Record<string, any>) => {
    if (!query.trim()) {
      setSearchState(prev => ({
        ...prev,
        query: '',
        results: [],
        totalResults: 0,
        facets: {}
      }));
      return;
    }

    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null,
      query
    }));

    try {
      const searchParams: GlossarySearchQuery = {
        query,
        filters: filters || {},
        fuzzySearch: enableFuzzySearch,
        semanticSearch: enableSemanticSearch,
        maxResults,
        includeFacets: true,
        includeSuggestions: enableSuggestions
      };

      const response = await businessGlossaryService.searchTerms(searchParams);

      setSearchState(prev => ({
        ...prev,
        results: response.data.results || [],
        suggestions: response.data.suggestions || [],
        totalResults: response.data.totalResults || 0,
        facets: response.data.facets || {},
        loading: false
      }));
    } catch (error: any) {
      setSearchState(prev => ({
        ...prev,
        error: error.message || 'Search failed',
        loading: false
      }));
    }
  }, [enableFuzzySearch, enableSemanticSearch, enableSuggestions, maxResults]);

  // Debounced search
  const debouncedSearch = useCallback((query: string, filters?: Record<string, any>) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query, filters);
    }, 300);
  }, [performSearch]);

  // Get search suggestions
  const getSuggestions = useCallback(async (query: string) => {
    try {
      const response = await businessGlossaryService.getSearchSuggestions(query);
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchState({
      query: '',
      results: [],
      suggestions: [],
      loading: false,
      error: null,
      totalResults: 0,
      facets: {}
    });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    query: searchState.query,
    searchResults: searchState.results,
    suggestions: searchState.suggestions,
    totalResults: searchState.totalResults,
    facets: searchState.facets,
    loading: searchState.loading,
    error: searchState.error,
    
    // Actions
    performSearch,
    debouncedSearch,
    getSuggestions,
    clearSearch
  };
};

// ============================================================================
// GLOSSARY RELATIONSHIPS HOOK
// ============================================================================

export const useGlossaryRelationships = (options: UseGlossaryRelationshipsOptions = {}) => {
  const {
    enableNetworkAnalysis = true,
    enableAutoSuggestions = true,
    includeMetrics = true
  } = options;

  const queryClient = useQueryClient();

  const [relationshipState, setRelationshipState] = useState<RelationshipState>({
    relationships: [],
    networkData: { nodes: [], links: [] },
    loading: true,
    error: null,
    metrics: {}
  });

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Fetch all relationships
  const {
    data: relationshipsData,
    isLoading: relationshipsLoading,
    error: relationshipsError,
    refetch: refetchRelationships
  } = useQuery({
    queryKey: ['businessGlossary', 'relationships'],
    queryFn: async () => {
      const response = await businessGlossaryService.getAllRelationships();
      return response;
    },
    staleTime: 300000, // 5 minutes
    cacheTime: 600000 // 10 minutes
  });

  // Fetch network analysis data
  const {
    data: networkData,
    isLoading: networkLoading,
    error: networkError
  } = useQuery({
    queryKey: ['businessGlossary', 'networkAnalysis'],
    queryFn: async () => {
      const response = await businessGlossaryService.getNetworkAnalysis();
      return response;
    },
    enabled: enableNetworkAnalysis,
    staleTime: 600000, // 10 minutes
    cacheTime: 1200000 // 20 minutes
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create relationship mutation
  const createRelationshipMutation = useMutation({
    mutationFn: async (relationshipData: Partial<TermRelationship>) => {
      const response = await businessGlossaryService.createRelationship(relationshipData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'relationships'] });
      if (enableNetworkAnalysis) {
        queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'networkAnalysis'] });
      }
    },
    onError: (error) => {
      console.error('Failed to create relationship:', error);
    }
  });

  // Update relationship mutation
  const updateRelationshipMutation = useMutation({
    mutationFn: async ({ relationshipId, relationshipData }: { relationshipId: string; relationshipData: Partial<TermRelationship> }) => {
      const response = await businessGlossaryService.updateRelationship(relationshipId, relationshipData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'relationships'] });
      if (enableNetworkAnalysis) {
        queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'networkAnalysis'] });
      }
    },
    onError: (error) => {
      console.error('Failed to update relationship:', error);
    }
  });

  // Delete relationship mutation
  const deleteRelationshipMutation = useMutation({
    mutationFn: async (relationshipId: string) => {
      const response = await businessGlossaryService.deleteRelationship(relationshipId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'relationships'] });
      if (enableNetworkAnalysis) {
        queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'networkAnalysis'] });
      }
    },
    onError: (error) => {
      console.error('Failed to delete relationship:', error);
    }
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setRelationshipState(prev => ({
      ...prev,
      relationships: relationshipsData?.data || [],
      networkData: networkData?.data || { nodes: [], links: [] },
      loading: relationshipsLoading || (enableNetworkAnalysis && networkLoading),
      error: relationshipsError?.message || networkError?.message || null,
      metrics: includeMetrics ? (networkData?.data?.metrics || {}) : {}
    }));
  }, [
    relationshipsData, networkData,
    relationshipsLoading, networkLoading,
    relationshipsError, networkError,
    enableNetworkAnalysis, includeMetrics
  ]);

  // ============================================================================
  // CALLBACK FUNCTIONS
  // ============================================================================

  const createRelationship = useCallback(async (relationshipData: Partial<TermRelationship>) => {
    try {
      const result = await createRelationshipMutation.mutateAsync(relationshipData);
      return result.data;
    } catch (error) {
      throw error;
    }
  }, [createRelationshipMutation]);

  const updateRelationship = useCallback(async (relationshipId: string, relationshipData: Partial<TermRelationship>) => {
    try {
      const result = await updateRelationshipMutation.mutateAsync({ relationshipId, relationshipData });
      return result.data;
    } catch (error) {
      throw error;
    }
  }, [updateRelationshipMutation]);

  const deleteRelationship = useCallback(async (relationshipId: string) => {
    try {
      await deleteRelationshipMutation.mutateAsync(relationshipId);
    } catch (error) {
      throw error;
    }
  }, [deleteRelationshipMutation]);

  const getTermRelationships = useCallback((termId: string) => {
    return relationshipState.relationships.filter(
      rel => rel.sourceTermId === termId || rel.targetTermId === termId
    );
  }, [relationshipState.relationships]);

  const getRelationshipSuggestions = useCallback(async (termId: string) => {
    try {
      const response = await businessGlossaryService.getRelationshipSuggestions(termId);
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Failed to get relationship suggestions:', error);
      return [];
    }
  }, []);

  const refreshRelationships = useCallback(async () => {
    try {
      await refetchRelationships();
      if (enableNetworkAnalysis) {
        queryClient.invalidateQueries({ queryKey: ['businessGlossary', 'networkAnalysis'] });
      }
    } catch (error) {
      console.error('Failed to refresh relationships:', error);
    }
  }, [refetchRelationships, queryClient, enableNetworkAnalysis]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // Data
    relationships: relationshipState.relationships,
    networkData: relationshipState.networkData,
    metrics: relationshipState.metrics,
    
    // State
    loading: relationshipState.loading,
    error: relationshipState.error,
    
    // Actions
    createRelationship,
    updateRelationship,
    deleteRelationship,
    getTermRelationships,
    getRelationshipSuggestions,
    refreshRelationships,
    
    // Mutation states
    isCreating: createRelationshipMutation.isLoading,
    isUpdating: updateRelationshipMutation.isLoading,
    isDeleting: deleteRelationshipMutation.isLoading
  };
};

// ============================================================================
// EXPORT ALL HOOKS
// ============================================================================

export default {
  useBusinessGlossary,
  useGlossarySearch,
  useGlossaryRelationships
};