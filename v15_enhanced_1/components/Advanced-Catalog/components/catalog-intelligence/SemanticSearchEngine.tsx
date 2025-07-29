'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  Brain, 
  Zap, 
  History, 
  Bookmark, 
  Share2, 
  Download, 
  RefreshCw, 
  Settings, 
  X, 
  Plus, 
  Minus, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Star, 
  Clock, 
  TrendingUp, 
  Database, 
  Tag, 
  Users, 
  Globe, 
  MapPin, 
  BarChart3, 
  PieChart, 
  Activity, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Lightbulb, 
  ArrowRight, 
  ExternalLink,
  Copy,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreHorizontal,
  Grid,
  List,
  Layers
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Import hooks and services
import { useCatalogSearch } from '../../hooks/useCatalogSearch';
import { useCatalogRecommendations } from '../../hooks/useCatalogRecommendations';
import { useCatalogAI } from '../../hooks/useCatalogAI';

// Import types
import type {
  CatalogAsset,
  SearchFacet,
  SearchSuggestion,
  CatalogSearchResponse,
  GenericFilter,
  TimeRange,
  UserContext
} from '../../types';

import { format, formatDistanceToNow } from 'date-fns';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface SearchViewState {
  activeTab: 'search' | 'results' | 'analytics' | 'saved';
  viewMode: 'grid' | 'list' | 'detailed';
  selectedAssets: string[];
  showAdvancedFilters: boolean;
  showNLPInterface: boolean;
  showSemanticMode: boolean;
  showSuggestions: boolean;
  isFullscreen: boolean;
}

interface SearchInsight {
  type: 'trending' | 'popular' | 'recent' | 'recommended';
  title: string;
  description: string;
  queries: string[];
  score: number;
  assets: CatalogAsset[];
}

interface SearchPerformanceMetrics {
  avgResponseTime: number;
  successRate: number;
  totalQueries: number;
  uniqueUsers: number;
  popularTerms: string[];
  failedQueries: string[];
}

export const SemanticSearchEngine: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [viewState, setViewState] = useState<SearchViewState>({
    activeTab: 'search',
    viewMode: 'grid',
    selectedAssets: [],
    showAdvancedFilters: false,
    showNLPInterface: false,
    showSemanticMode: true,
    showSuggestions: true,
    isFullscreen: false
  });

  const [nlpQuery, setNlpQuery] = useState('');
  const [semanticThreshold, setSemanticThreshold] = useState([0.7]);
  const [searchInsights, setSearchInsights] = useState<SearchInsight[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<SearchPerformanceMetrics | null>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<'keyword' | 'semantic' | 'nlp' | 'hybrid'>('hybrid');
  
  // Refs for advanced functionality
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // HOOKS INTEGRATION
  // ============================================================================
  
  const {
    query,
    results,
    suggestions,
    facets,
    isLoading,
    isSearching,
    isSuggestionsLoading,
    error,
    hasResults,
    isEmpty,
    filters,
    searchConfig,
    recentSearches,
    savedSearches,
    updateQuery,
    search,
    naturalLanguageSearch,
    semanticSearch,
    clearQuery,
    clearResults,
    getSuggestions,
    updateFilters,
    clearFilters,
    saveSearch,
    loadSavedSearch,
    searchSimilar,
    shareSearch,
    exportResults
  } = useCatalogSearch({
    enableAutoSearch: true,
    enableHistory: true,
    searchOptions: {
      enableNLP: true,
      enableSemanticSearch: true,
      enableFacets: true,
      enableSuggestions: true,
      maxSuggestions: 8
    }
  });

  const {
    recommendations,
    getAssetRecommendations,
    getUsageRecommendations
  } = useCatalogRecommendations();

  const {
    aiInsights,
    generateInsights,
    getSmartSuggestions,
    getPatternAnalysis
  } = useCatalogAI();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const filteredResults = useMemo(() => {
    if (!results?.assets) return [];
    
    return results.assets.filter(asset => {
      // Apply additional filters based on view state
      if (viewState.selectedAssets.length > 0) {
        return viewState.selectedAssets.includes(asset.id);
      }
      return true;
    });
  }, [results?.assets, viewState.selectedAssets]);

  const searchSummary = useMemo(() => {
    if (!results) return null;
    
    return {
      totalResults: results.total,
      executionTime: results.executionTime,
      searchId: results.searchId,
      hasMore: results.assets.length < results.total,
      facetCounts: facets.reduce((acc, facet) => {
        acc[facet.field] = facet.values?.length || 0;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [results, facets]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleAdvancedSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    switch (selectedSearchType) {
      case 'semantic':
        await semanticSearch(query, semanticThreshold[0]);
        break;
      case 'nlp':
        await naturalLanguageSearch(query);
        break;
      case 'keyword':
        await search(query);
        break;
      case 'hybrid':
      default:
        // Hybrid approach: try semantic first, then fallback
        try {
          await semanticSearch(query, semanticThreshold[0]);
        } catch {
          await search(query);
        }
        break;
    }
  }, [query, selectedSearchType, semanticThreshold, semanticSearch, naturalLanguageSearch, search]);

  const handleNLPQuery = useCallback(async () => {
    if (!nlpQuery.trim()) return;
    
    updateQuery(nlpQuery);
    await naturalLanguageSearch(nlpQuery);
    setViewState(prev => ({ ...prev, activeTab: 'results' }));
  }, [nlpQuery, updateQuery, naturalLanguageSearch]);

  const handleAssetSelect = useCallback((assetId: string, isMultiSelect: boolean = false) => {
    setViewState(prev => {
      const currentSelected = prev.selectedAssets;
      
      if (isMultiSelect) {
        const newSelected = currentSelected.includes(assetId)
          ? currentSelected.filter(id => id !== assetId)
          : [...currentSelected, assetId];
        return { ...prev, selectedAssets: newSelected };
      } else {
        return { ...prev, selectedAssets: [assetId] };
      }
    });
  }, []);

  const handleFacetToggle = useCallback((facet: SearchFacet, value: string) => {
    const currentFilters = filters.customFilters || [];
    const existingFilter = currentFilters.find(f => f.field === facet.field);
    
    if (existingFilter) {
      const currentValues = Array.isArray(existingFilter.value) ? existingFilter.value : [existingFilter.value];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      updateFilters({
        customFilters: currentFilters.map(f => 
          f.field === facet.field 
            ? { ...f, value: newValues.length > 0 ? newValues : undefined }
            : f
        ).filter(f => f.value !== undefined)
      });
    } else {
      updateFilters({
        customFilters: [...currentFilters, {
          field: facet.field,
          operator: 'IN' as const,
          value: [value]
        }]
      });
    }
  }, [filters, updateFilters]);

  const handleSaveCurrentSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    const searchName = `Search: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}`;
    await saveSearch(searchName, false);
  }, [query, saveSearch]);

  const handleExploreAsset = useCallback(async (asset: CatalogAsset) => {
    // Get similar assets
    await searchSimilar(asset.id);
    setViewState(prev => ({ ...prev, activeTab: 'results' }));
  }, [searchSimilar]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    // Load search insights and performance metrics
    const loadSearchAnalytics = async () => {
      try {
        const insights = await getSmartSuggestions();
        if (insights) {
          const mappedInsights: SearchInsight[] = insights.map(insight => ({
            type: insight.type || 'recommended',
            title: insight.title,
            description: insight.description,
            queries: insight.relatedQueries || [],
            score: insight.confidence || 0.5,
            assets: insight.relatedAssets || []
          }));
          setSearchInsights(mappedInsights);
        }

        // Mock performance metrics - in real implementation, would come from analytics service
        setPerformanceMetrics({
          avgResponseTime: 145,
          successRate: 0.94,
          totalQueries: 12847,
          uniqueUsers: 1249,
          popularTerms: ['customer', 'order', 'product', 'user', 'transaction'],
          failedQueries: ['xyz123', 'invalid_query']
        });
      } catch (error) {
        console.error('Failed to load search analytics:', error);
      }
    };

    loadSearchAnalytics();
  }, [getSmartSuggestions]);

  useEffect(() => {
    // Auto-focus search input when component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // ============================================================================
  // COMPONENT RENDERS
  // ============================================================================
  
  const SearchInterface = () => (
    <div className="space-y-6">
      {/* Advanced Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Semantic Search Engine</h3>
          <p className="text-muted-foreground">
            AI-powered search with natural language processing and semantic understanding
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewState(prev => ({ ...prev, showNLPInterface: !prev.showNLPInterface }))}
          >
            <Brain className="h-4 w-4 mr-2" />
            NLP Mode
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
          >
            {viewState.isFullscreen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Search Interface */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Primary Search Bar */}
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search datasets, schemas, or ask a question in natural language..."
                  value={query}
                  onChange={(e) => updateQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdvancedSearch()}
                  className="pl-10 text-lg h-12"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={clearQuery}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Select value={selectedSearchType} onValueChange={(value) => setSelectedSearchType(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hybrid">
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Hybrid
                    </div>
                  </SelectItem>
                  <SelectItem value="semantic">
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      Semantic
                    </div>
                  </SelectItem>
                  <SelectItem value="nlp">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      NLP
                    </div>
                  </SelectItem>
                  <SelectItem value="keyword">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-2" />
                      Keyword
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAdvancedSearch} disabled={isSearching || !query.trim()}>
                {isSearching ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>

            {/* NLP Interface */}
            {viewState.showNLPInterface && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-blue-600" />
                    Natural Language Query
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Ask a question in plain English, e.g., 'Show me all customer data tables with email addresses updated in the last month'"
                      value={nlpQuery}
                      onChange={(e) => setNlpQuery(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Use natural language to describe what you're looking for
                      </div>
                      <Button size="sm" onClick={handleNLPQuery} disabled={!nlpQuery.trim()}>
                        <Zap className="h-4 w-4 mr-2" />
                        Ask AI
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced Filters */}
            {viewState.showAdvancedFilters && (
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Asset Types</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="table">Tables</SelectItem>
                          <SelectItem value="view">Views</SelectItem>
                          <SelectItem value="schema">Schemas</SelectItem>
                          <SelectItem value="dataset">Datasets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Quality Score</Label>
                      <div className="px-2">
                        <Slider
                          value={[filters.qualityScore?.min || 0]}
                          onValueChange={(value) => updateFilters({
                            qualityScore: { min: value[0], max: 100 }
                          })}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0%</span>
                          <span>{filters.qualityScore?.min || 0}%+</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Semantic Similarity</Label>
                      <div className="px-2">
                        <Slider
                          value={semanticThreshold}
                          onValueChange={setSemanticThreshold}
                          min={0.1}
                          max={1}
                          step={0.1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0.1</span>
                          <span>{semanticThreshold[0].toFixed(1)}</span>
                          <span>1.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleSaveCurrentSearch}>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save Search
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => shareSearch()}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Suggestions */}
            {viewState.showSuggestions && suggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Smart Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 6).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateQuery(suggestion.query);
                          handleAdvancedSearch();
                        }}
                        className="text-xs"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        {suggestion.query}
                        {suggestion.count && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {suggestion.count}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Insights */}
      {searchInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchInsights.slice(0, 3).map((insight, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center">
                    {insight.type === 'trending' && <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />}
                    {insight.type === 'popular' && <Star className="h-4 w-4 mr-2 text-yellow-500" />}
                    {insight.type === 'recent' && <Clock className="h-4 w-4 mr-2 text-blue-500" />}
                    {insight.type === 'recommended' && <Target className="h-4 w-4 mr-2 text-green-500" />}
                    {insight.title}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(insight.score * 100)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                <div className="space-y-2">
                  {insight.queries.slice(0, 3).map((query, qIndex) => (
                    <Button
                      key={qIndex}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        updateQuery(query);
                        handleAdvancedSearch();
                      }}
                    >
                      <ArrowRight className="h-3 w-3 mr-2" />
                      {query}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const SearchResults = () => (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">
            {searchSummary ? `${searchSummary.totalResults.toLocaleString()} results` : 'Search Results'}
          </h3>
          {searchSummary && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{searchSummary.executionTime}ms</span>
              {query && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>for "{query}"</span>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={viewState.viewMode} onValueChange={(value) => setViewState(prev => ({ ...prev, viewMode: value as any }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">
                <div className="flex items-center">
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </div>
              </SelectItem>
              <SelectItem value="list">
                <div className="flex items-center">
                  <List className="h-4 w-4 mr-2" />
                  List
                </div>
              </SelectItem>
              <SelectItem value="detailed">
                <div className="flex items-center">
                  <Layers className="h-4 w-4 mr-2" />
                  Detailed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={() => exportResults('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isSearching && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-medium mb-2">Searching...</h3>
              <p className="text-muted-foreground">
                Using AI to find the most relevant results
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Layout */}
      <div className="flex space-x-6">
        {/* Facets Sidebar */}
        {facets.length > 0 && (
          <div className="w-64 space-y-4">
            <h4 className="font-medium">Refine Results</h4>
            {facets.map((facet) => (
              <Card key={facet.field} className="p-4">
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <h5 className="font-medium capitalize">{facet.field.replace('_', ' ')}</h5>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="space-y-2">
                      {facet.values?.slice(0, 8).map((value) => (
                        <div key={value.value} className="flex items-center justify-between">
                          <Checkbox
                            checked={filters.customFilters?.some(f => 
                              f.field === facet.field && 
                              Array.isArray(f.value) && 
                              f.value.includes(value.value)
                            )}
                            onCheckedChange={() => handleFacetToggle(facet, value.value)}
                          />
                          <div className="flex-1 ml-2">
                            <Label className="text-sm">{value.value}</Label>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {value.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}

        {/* Main Results */}
        <div className="flex-1" ref={resultsRef}>
          {isEmpty && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button variant="outline" onClick={() => setViewState(prev => ({ ...prev, showNLPInterface: true }))}>
                    Try NLP Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Grid */}
          {hasResults && (
            <div className={
              viewState.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
              viewState.viewMode === 'list' ? 'space-y-3' :
              'space-y-6'
            }>
              {filteredResults.map((asset) => (
                <Card 
                  key={asset.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    viewState.selectedAssets.includes(asset.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleAssetSelect(asset.id)}
                >
                  <CardContent className={viewState.viewMode === 'detailed' ? 'p-6' : 'p-4'}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{asset.name}</h4>
                        {asset.isFavorite && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          checked={viewState.selectedAssets.includes(asset.id)}
                          onCheckedChange={() => handleAssetSelect(asset.id, true)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              handleExploreAsset(asset);
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Explore similar assets</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {asset.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">{asset.type}</Badge>
                        {asset.qualityScore && (
                          <Badge variant={asset.qualityScore > 80 ? 'default' : 'destructive'} className="text-xs">
                            {asset.qualityScore}% quality
                          </Badge>
                        )}
                      </div>
                      
                      {viewState.viewMode === 'detailed' && (
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {asset.usage?.viewCount || 0}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {asset.lastModified ? formatDistanceToNow(new Date(asset.lastModified), { addSuffix: true }) : 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {viewState.viewMode === 'detailed' && asset.tags && asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {asset.tags.slice(0, 5).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {asset.tags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{asset.tags.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SearchAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Search Analytics</h3>
      
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Average Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.avgResponseTime}ms</div>
              <Progress value={75} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(performanceMetrics.successRate * 100).toFixed(1)}%</div>
              <Progress value={performanceMetrics.successRate * 100} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.totalQueries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Unique Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.uniqueUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Active searchers</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const SavedSearches = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Searches</h3>
        <Button size="sm" onClick={handleSaveCurrentSearch} disabled={!query.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Save Current Search
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedSearches.map((savedSearch) => (
          <Card key={savedSearch.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{savedSearch.name}</span>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{savedSearch.query}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Saved {formatDistanceToNow(savedSearch.createdAt, { addSuffix: true })}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSavedSearch(savedSearch)}
                >
                  <Search className="h-3 w-3 mr-1" />
                  Load
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <TooltipProvider>
      <div className={`space-y-6 ${viewState.isFullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : ''}`}>
        {/* Navigation Tabs */}
        <Tabs value={viewState.activeTab} onValueChange={(value) => setViewState(prev => ({ ...prev, activeTab: value as any }))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="results">
              <Database className="h-4 w-4 mr-2" />
              Results {hasResults && `(${results?.total})`}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved ({savedSearches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <SearchInterface />
          </TabsContent>

          <TabsContent value="results">
            <SearchResults />
          </TabsContent>

          <TabsContent value="analytics">
            <SearchAnalytics />
          </TabsContent>

          <TabsContent value="saved">
            <SavedSearches />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default SemanticSearchEngine;