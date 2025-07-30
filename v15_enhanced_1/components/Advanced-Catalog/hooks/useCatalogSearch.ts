import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

// Import services
import { 
  semanticSearchService,
  enterpriseCatalogService 
} from '../services';

// Import types
import type {
  CatalogSearchRequest,
  CatalogSearchResponse,
  SearchFacet,
  SearchSuggestion,
  NaturalLanguageSearchRequest,
  FacetedSearchRequest,
  CatalogAsset,
  GenericFilter,
  SortOption,
  Pagination
} from '../types';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface SearchState {
  query: string;
  results: CatalogSearchResponse | null;
  suggestions: SearchSuggestion[];
  facets: SearchFacet[];
  isLoading: boolean;
  isSearching: boolean;
  isSuggestionsLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  totalResults: number;
  executionTime: number;
  searchId: string | null;
  recentSearches: string[];
  popularSearches: string[];
  savedSearches: SavedSearch[];
}

export interface SearchFilters {
  assetTypes: string[];
  dataSources: string[];
  qualityScore: { min: number; max: number } | null;
  lastModified: { start: Date; end: Date } | null;
  createdBy: string[];
  tags: string[];
  departments: string[];
  customFilters: GenericFilter[];
}

export interface SearchOptions {
  enableNLP: boolean;
  enableSemanticSearch: boolean;
  enableFacets: boolean;
  enableSuggestions: boolean;
  enableAutoComplete: boolean;
  maxSuggestions: number;
  searchDelay: number;
  includeMetadata: boolean;
  highlightResults: boolean;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: Date;
  lastUsed: Date;
  isShared: boolean;
  createdBy: string;
}

export interface SearchOperations {
  // Core search operations
  search: (query: string, options?: Partial<CatalogSearchRequest>) => Promise<void>;
  searchWithFilters: (query: string, filters: SearchFilters) => Promise<void>;
  naturalLanguageSearch: (query: string) => Promise<void>;
  semanticSearch: (query: string, threshold?: number) => Promise<void>;
  facetedSearch: (facets: SearchFacet[]) => Promise<void>;
  
  // Query management
  updateQuery: (query: string) => void;
  clearQuery: () => void;
  clearResults: () => void;
  
  // Suggestions and autocomplete
  getSuggestions: (query: string) => Promise<void>;
  getAutoComplete: (query: string) => Promise<string[]>;
  
  // Filter management
  updateFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  addFilter: (filter: GenericFilter) => void;
  removeFilter: (fieldName: string) => void;
  
  // Facet operations
  applyFacet: (facet: SearchFacet, value: string) => void;
  removeFacet: (facet: SearchFacet, value: string) => void;
  clearFacets: () => void;
  
  // Saved searches
  saveSearch: (name: string, isShared?: boolean) => Promise<void>;
  loadSavedSearch: (savedSearch: SavedSearch) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  updateSavedSearch: (id: string, updates: Partial<SavedSearch>) => Promise<void>;
  
  // Search history
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  getRecentSearches: () => string[];
  
  // Result operations
  selectResult: (asset: CatalogAsset) => void;
  bookmarkResult: (assetId: string) => void;
  shareSearch: () => string;
  exportResults: (format: 'csv' | 'excel' | 'json') => Promise<void>;
  
  // Advanced operations
  searchSimilar: (assetId: string) => Promise<void>;
  searchByExample: (asset: CatalogAsset) => Promise<void>;
  explainSearch: (query: string) => Promise<string>;
}

export interface UseCatalogSearchOptions {
  enableAutoSearch?: boolean;
  enableHistory?: boolean;
  maxHistoryItems?: number;
  defaultFilters?: Partial<SearchFilters>;
  searchOptions?: Partial<SearchOptions>;
  onSearchComplete?: (results: CatalogSearchResponse) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useCatalogSearch = (options: UseCatalogSearchOptions = {}) => {
  const {
    enableAutoSearch = true,
    enableHistory = true,
    maxHistoryItems = 10,
    defaultFilters = {},
    searchOptions = {},
    onSearchComplete,
    onError
  } = options;

  // ============================================================================
  // STATE
  // ============================================================================
  
  const [state, setState] = useState<SearchState>({
    query: '',
    results: null,
    suggestions: [],
    facets: [],
    isLoading: false,
    isSearching: false,
    isSuggestionsLoading: false,
    error: null,
    hasSearched: false,
    totalResults: 0,
    executionTime: 0,
    searchId: null,
    recentSearches: [],
    popularSearches: [],
    savedSearches: []
  });

  const [filters, setFilters] = useState<SearchFilters>({
    assetTypes: [],
    dataSources: [],
    qualityScore: null,
    lastModified: null,
    createdBy: [],
    tags: [],
    departments: [],
    customFilters: [],
    ...defaultFilters
  });

  const [searchConfig, setSearchConfig] = useState<SearchOptions>({
    enableNLP: true,
    enableSemanticSearch: true,
    enableFacets: true,
    enableSuggestions: true,
    enableAutoComplete: true,
    maxSuggestions: 5,
    searchDelay: 300,
    includeMetadata: true,
    highlightResults: true,
    ...searchOptions
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  const [sortOptions, setSortOptions] = useState<SortOption[]>([
    { field: 'relevance', direction: 'DESC' }
  ]);

  // Refs for debouncing and caching
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSearchRef = useRef<string>('');
  const searchCacheRef = useRef<Map<string, CatalogSearchResponse>>(new Map());

  // ============================================================================
  // CORE SEARCH OPERATIONS
  // ============================================================================
  
  const search = useCallback(async (
    query: string, 
    requestOptions?: Partial<CatalogSearchRequest>
  ) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, results: null, hasSearched: false }));
      return;
    }

    const searchKey = `${query}_${JSON.stringify(filters)}_${JSON.stringify(sortOptions)}`;
    
    // Check cache first
    if (searchCacheRef.current.has(searchKey)) {
      const cachedResults = searchCacheRef.current.get(searchKey)!;
      setState(prev => ({
        ...prev,
        results: cachedResults,
        totalResults: cachedResults.total,
        hasSearched: true,
        isLoading: false,
        isSearching: false,
        error: null
      }));
      return;
    }

    setState(prev => ({ ...prev, isSearching: true, error: null }));

    try {
      const searchRequest: CatalogSearchRequest = {
        query: query.trim(),
        filters: Object.entries(filters).reduce((acc, [key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            acc.push({ field: key, operator: 'IN', value });
          } else if (value && typeof value === 'object' && 'min' in value) {
            acc.push({ field: key, operator: 'BETWEEN', value: [value.min, value.max] });
          } else if (value && typeof value === 'object' && 'start' in value) {
            acc.push({ field: key, operator: 'BETWEEN', value: [value.start, value.end] });
          }
          return acc;
        }, [] as GenericFilter[]),
        pagination,
        sortOptions,
        includeMetadata: searchConfig.includeMetadata,
        highlightResults: searchConfig.highlightResults,
        enableFacets: searchConfig.enableFacets,
        ...requestOptions
      };

      const startTime = Date.now();
      const results = await semanticSearchService.searchAssets(searchRequest);
      const executionTime = Date.now() - startTime;

      // Cache results
      searchCacheRef.current.set(searchKey, results);
      
      // Limit cache size
      if (searchCacheRef.current.size > 50) {
        const firstKey = searchCacheRef.current.keys().next().value;
        searchCacheRef.current.delete(firstKey);
      }

      setState(prev => ({
        ...prev,
        results,
        totalResults: results.total,
        executionTime,
        searchId: results.searchId,
        facets: results.facets || [],
        hasSearched: true,
        isSearching: false,
        error: null
      }));

      // Add to history
      if (enableHistory && query !== lastSearchRef.current) {
        addToHistory(query);
        lastSearchRef.current = query;
      }

      onSearchComplete?.(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: errorMessage
      }));
      onError?.(errorMessage);
    }
  }, [filters, pagination, sortOptions, searchConfig, enableHistory, onSearchComplete, onError]);

  // Debounced search for auto-search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (enableAutoSearch && query.trim().length > 2) {
        search(query);
      }
    }, searchConfig.searchDelay),
    [search, enableAutoSearch, searchConfig.searchDelay]
  );

  const naturalLanguageSearch = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, isSearching: true, error: null }));

    try {
      const nlpRequest: NaturalLanguageSearchRequest = {
        query: query.trim(),
        includeIntent: true,
        includeEntities: true,
        includeSuggestions: true
      };

      const results = await semanticSearchService.naturalLanguageSearch(nlpRequest);
      
      setState(prev => ({
        ...prev,
        results,
        totalResults: results.total,
        searchId: results.searchId,
        hasSearched: true,
        isSearching: false,
        error: null
      }));

      onSearchComplete?.(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'NLP search failed';
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: errorMessage
      }));
      onError?.(errorMessage);
    }
  }, [onSearchComplete, onError]);

  const semanticSearch = useCallback(async (query: string, threshold = 0.7) => {
    setState(prev => ({ ...prev, isSearching: true, error: null }));

    try {
      const results = await semanticSearchService.semanticSimilaritySearch({
        query: query.trim(),
        similarityThreshold: threshold,
        maxResults: pagination.size,
        includeScore: true
      });

      setState(prev => ({
        ...prev,
        results,
        totalResults: results.total,
        searchId: results.searchId,
        hasSearched: true,
        isSearching: false,
        error: null
      }));

      onSearchComplete?.(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Semantic search failed';
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: errorMessage
      }));
      onError?.(errorMessage);
    }
  }, [pagination.size, onSearchComplete, onError]);

  // ============================================================================
  // SUGGESTIONS AND AUTOCOMPLETE
  // ============================================================================
  
  const getSuggestions = useCallback(async (query: string) => {
    if (!searchConfig.enableSuggestions || query.length < 2) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    setState(prev => ({ ...prev, isSuggestionsLoading: true }));

    try {
      const suggestions = await semanticSearchService.getSearchSuggestions({
        query: query.trim(),
        maxSuggestions: searchConfig.maxSuggestions,
        includePopular: true,
        includeRecent: enableHistory
      });

      setState(prev => ({
        ...prev,
        suggestions,
        isSuggestionsLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        suggestions: [],
        isSuggestionsLoading: false
      }));
    }
  }, [searchConfig.enableSuggestions, searchConfig.maxSuggestions, enableHistory]);

  const getAutoComplete = useCallback(async (query: string): Promise<string[]> => {
    if (!searchConfig.enableAutoComplete || query.length < 2) {
      return [];
    }

    try {
      const results = await semanticSearchService.getAutoComplete({
        query: query.trim(),
        maxSuggestions: 10
      });
      return results.suggestions;
    } catch (error) {
      return [];
    }
  }, [searchConfig.enableAutoComplete]);

  // ============================================================================
  // QUERY AND FILTER MANAGEMENT
  // ============================================================================
  
  const updateQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Get suggestions immediately
    if (searchConfig.enableSuggestions) {
      getSuggestions(query);
    }

    // Debounced search
    debouncedSearch(query);
  }, [getSuggestions, debouncedSearch, searchConfig.enableSuggestions]);

  const clearQuery = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: null,
      suggestions: [],
      hasSearched: false,
      error: null
    }));
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Clear cache when filters change
    searchCacheRef.current.clear();
    
    // Re-search if we have a query and have searched before
    if (state.query && state.hasSearched) {
      search(state.query);
    }
  }, [state.query, state.hasSearched, search]);

  const clearFilters = useCallback(() => {
    setFilters({
      assetTypes: [],
      dataSources: [],
      qualityScore: null,
      lastModified: null,
      createdBy: [],
      tags: [],
      departments: [],
      customFilters: []
    });
    searchCacheRef.current.clear();
  }, []);

  // ============================================================================
  // HISTORY MANAGEMENT
  // ============================================================================
  
  const addToHistory = useCallback((query: string) => {
    if (!enableHistory || !query.trim()) return;

    setState(prev => {
      const newHistory = [query, ...prev.recentSearches.filter(q => q !== query)]
        .slice(0, maxHistoryItems);
      
      // Persist to localStorage
      try {
        localStorage.setItem('catalog-search-history', JSON.stringify(newHistory));
      } catch (error) {
        // Ignore localStorage errors
      }
      
      return { ...prev, recentSearches: newHistory };
    });
  }, [enableHistory, maxHistoryItems]);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, recentSearches: [] }));
    try {
      localStorage.removeItem('catalog-search-history');
    } catch (error) {
      // Ignore localStorage errors
    }
  }, []);

  // ============================================================================
  // SAVED SEARCHES
  // ============================================================================
  
  const saveSearch = useCallback(async (name: string, isShared = false) => {
    if (!state.query.trim()) return;

    try {
      const savedSearch: SavedSearch = {
        id: `search_${Date.now()}`,
        name,
        query: state.query,
        filters,
        createdAt: new Date(),
        lastUsed: new Date(),
        isShared,
        createdBy: 'current_user' // This would come from auth context
      };

      // In real implementation, this would save to backend
      setState(prev => ({
        ...prev,
        savedSearches: [...prev.savedSearches, savedSearch]
      }));
    } catch (error) {
      onError?.('Failed to save search');
    }
  }, [state.query, filters, onError]);

  const loadSavedSearch = useCallback(async (savedSearch: SavedSearch) => {
    setState(prev => ({ ...prev, query: savedSearch.query }));
    setFilters(savedSearch.filters);
    await search(savedSearch.query);
  }, [search]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    // Load search history from localStorage
    if (enableHistory) {
      try {
        const history = localStorage.getItem('catalog-search-history');
        if (history) {
          const parsedHistory = JSON.parse(history);
          setState(prev => ({ ...prev, recentSearches: parsedHistory }));
        }
      } catch (error) {
        // Ignore localStorage errors
      }
    }
  }, [enableHistory]);

  useEffect(() => {
    // Load saved searches and popular searches
    const loadInitialData = async () => {
      try {
        // In real implementation, these would come from backend
        const popularSearches = [
          'customer data',
          'user profiles',
          'order history',
          'product catalog',
          'financial data'
        ];
        
        setState(prev => ({ ...prev, popularSearches }));
      } catch (error) {
        // Handle error silently
      }
    };

    loadInitialData();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================
  
  const operations: SearchOperations = {
    // Core search operations
    search,
    searchWithFilters: useCallback((query: string, searchFilters: SearchFilters) => {
      setFilters(searchFilters);
      return search(query);
    }, [search]),
    naturalLanguageSearch,
    semanticSearch,
    facetedSearch: useCallback(async (facets: SearchFacet[]) => {
      // Implementation for faceted search
      const facetFilters = facets.reduce((acc, facet) => {
        if (facet.selectedValues?.length) {
          acc.push({
            field: facet.field,
            operator: 'IN' as const,
            value: facet.selectedValues
          });
        }
        return acc;
      }, [] as GenericFilter[]);
      
      const newFilters = { ...filters, customFilters: facetFilters };
      setFilters(newFilters);
      return search(state.query);
    }, [filters, state.query, search]),
    
    // Query management
    updateQuery,
    clearQuery,
    clearResults: useCallback(() => {
      setState(prev => ({ ...prev, results: null, hasSearched: false }));
    }, []),
    
    // Suggestions and autocomplete
    getSuggestions,
    getAutoComplete,
    
    // Filter management
    updateFilters,
    clearFilters,
    addFilter: useCallback((filter: GenericFilter) => {
      const newFilters = {
        ...filters,
        customFilters: [...filters.customFilters, filter]
      };
      updateFilters(newFilters);
    }, [filters, updateFilters]),
    removeFilter: useCallback((fieldName: string) => {
      const newFilters = {
        ...filters,
        customFilters: filters.customFilters.filter(f => f.field !== fieldName)
      };
      updateFilters(newFilters);
    }, [filters, updateFilters]),
    
    // Facet operations
    applyFacet: useCallback((facet: SearchFacet, value: string) => {
      // Implementation for applying facet
    }, []),
    removeFacet: useCallback((facet: SearchFacet, value: string) => {
      // Implementation for removing facet
    }, []),
    clearFacets: useCallback(() => {
      setState(prev => ({ ...prev, facets: [] }));
    }, []),
    
    // Saved searches
    saveSearch,
    loadSavedSearch,
    deleteSavedSearch: useCallback(async (id: string) => {
      setState(prev => ({
        ...prev,
        savedSearches: prev.savedSearches.filter(s => s.id !== id)
      }));
    }, []),
    updateSavedSearch: useCallback(async (id: string, updates: Partial<SavedSearch>) => {
      setState(prev => ({
        ...prev,
        savedSearches: prev.savedSearches.map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      }));
    }, []),
    
    // Search history
    addToHistory,
    clearHistory,
    getRecentSearches: useCallback(() => state.recentSearches, [state.recentSearches]),
    
    // Result operations
    selectResult: useCallback((asset: CatalogAsset) => {
      // Implementation for selecting a result
    }, []),
    bookmarkResult: useCallback((assetId: string) => {
      // Implementation for bookmarking
    }, []),
    shareSearch: useCallback(() => {
      // Implementation for sharing search
      const searchParams = new URLSearchParams({
        q: state.query,
        filters: JSON.stringify(filters)
      });
      return `${window.location.origin}/search?${searchParams.toString()}`;
    }, [state.query, filters]),
    exportResults: useCallback(async (format: 'csv' | 'excel' | 'json') => {
      if (!state.results) return;
      // Implementation for exporting results
    }, [state.results]),
    
    // Advanced operations
    searchSimilar: useCallback(async (assetId: string) => {
      try {
        const asset = await enterpriseCatalogService.getAsset(assetId);
        if (asset) {
          await semanticSearch(asset.name);
        }
      } catch (error) {
        onError?.('Failed to search similar assets');
      }
    }, [semanticSearch, onError]),
    searchByExample: useCallback(async (asset: CatalogAsset) => {
      const exampleQuery = `${asset.name} ${asset.type} ${asset.tags?.join(' ') || ''}`;
      await search(exampleQuery);
    }, [search]),
    explainSearch: useCallback(async (query: string): Promise<string> => {
      // Implementation for explaining search
      return `Search explanation for: "${query}"`;
    }, [])
  };

  return {
    // State
    ...state,
    filters,
    searchConfig,
    pagination,
    sortOptions,
    
    // Operations
    ...operations,
    
    // Additional utilities
    isLoading: state.isLoading || state.isSearching,
    hasResults: state.results?.assets?.length > 0,
    isEmpty: state.hasSearched && (!state.results?.assets?.length),
    
    // Configuration
    updateSearchConfig: setSearchConfig,
    updatePagination: setPagination,
    updateSortOptions: setSortOptions
  };
};

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  SearchState,
  SearchFilters,
  SearchOptions,
  SavedSearch,
  SearchOperations,
  UseCatalogSearchOptions
};