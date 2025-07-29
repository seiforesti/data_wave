// ============================================================================
// INTELLIGENT CATALOG VIEWER - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Advanced AI-powered catalog browsing with intelligent navigation and insights
// Surpasses Databricks and Microsoft Purview with superior user experience
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Database, 
  Layers, 
  Network, 
  GitBranch, 
  Zap, 
  Search, 
  Filter, 
  Eye, 
  Settings, 
  RefreshCw, 
  Download, 
  Upload, 
  Share, 
  Copy, 
  Star, 
  Tag, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sparkles,
  Workflow,
  Map,
  Target,
  Lightbulb,
  Fingerprint,
  Shield,
  Key,
  Lock,
  Unlock,
  FileText,
  Code,
  Package,
  Link,
  Globe,
  Compass,
  Cpu,
  HardDrive,
  FolderTree,
  Grid3X3,
  List,
  Calendar,
  Users,
  Bookmark,
  Heart,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  Info,
  AlertCircle,
  Maximize,
  Minimize,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  MoreHorizontal
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Advanced Catalog Hooks and Services
import { useCatalogDiscovery } from '../../hooks/useCatalogDiscovery';
import { useCatalogAI } from '../../hooks/useCatalogAI';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';
import { useCatalogRecommendations } from '../../hooks/useCatalogRecommendations';

// Types
import {
  IntelligentDataAsset,
  AssetMetadata,
  AssetClassification,
  AssetUsageMetrics,
  DataQualityAssessment,
  BusinessGlossaryTerm,
  SmartRecommendation,
  AssetRelationship,
  UserInteraction,
  CatalogNavigationPath,
  AssetInsight
} from '../../types';

// Utils
import { 
  formatAssetType,
  calculateAssetScore,
  formatFileSize,
  formatDate,
  generateAssetUrl
} from '../../utils';

// Constants
import { 
  ASSET_TYPES,
  DATA_SOURCE_TYPES,
  QUALITY_RULE_TYPES,
  TIME_RANGES
} from '../../constants';

// ============================================================================
// INTERFACES
// ============================================================================

interface IntelligentCatalogViewerProps {
  className?: string;
  initialAssetId?: string;
  onAssetSelect?: (asset: IntelligentDataAsset) => void;
  enableAIInsights?: boolean;
  enableCollaboration?: boolean;
  showMetrics?: boolean;
  layout?: 'grid' | 'list' | 'tree' | 'graph';
}

interface ViewConfiguration {
  layout: 'grid' | 'list' | 'tree' | 'graph';
  groupBy: 'type' | 'source' | 'owner' | 'classification' | 'quality' | 'none';
  sortBy: 'name' | 'created' | 'updated' | 'quality' | 'usage' | 'popularity';
  sortOrder: 'asc' | 'desc';
  showPreview: boolean;
  showMetrics: boolean;
  showRelationships: boolean;
}

interface AssetFilter {
  types: string[];
  sources: string[];
  owners: string[];
  classifications: string[];
  qualityScores: { min: number; max: number };
  dateRange: { start: Date; end: Date };
  tags: string[];
  hasDescription: boolean;
  hasLineage: boolean;
  hasQualityRules: boolean;
}

interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'category' | 'asset' | 'folder';
  path: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const IntelligentCatalogViewer: React.FC<IntelligentCatalogViewerProps> = ({
  className = '',
  initialAssetId,
  onAssetSelect,
  enableAIInsights = true,
  enableCollaboration = true,
  showMetrics = true,
  layout = 'grid'
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedAsset, setSelectedAsset] = useState<IntelligentDataAsset | null>(null);
  const [navigationPath, setNavigationPath] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'Data Catalog', type: 'category', path: '/' }
  ]);
  const [viewConfig, setViewConfig] = useState<ViewConfiguration>({
    layout,
    groupBy: 'none',
    sortBy: 'name',
    sortOrder: 'asc',
    showPreview: true,
    showMetrics: true,
    showRelationships: false
  });

  const [filters, setFilters] = useState<AssetFilter>({
    types: [],
    sources: [],
    owners: [],
    classifications: [],
    qualityScores: { min: 0, max: 100 },
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    tags: [],
    hasDescription: false,
    hasLineage: false,
    hasQualityRules: false
  });

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isAssetDetailOpen, setIsAssetDetailOpen] = useState(false);
  const [favoriteAssets, setFavoriteAssets] = useState<Set<string>>(new Set());
  const [recentAssets, setRecentAssets] = useState<IntelligentDataAsset[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    assets: catalogAssets,
    isLoading: catalogLoading,
    error: catalogError,
    searchAssets,
    getAssetDetails,
    getAssetRelationships,
    refreshCatalog
  } = useCatalogDiscovery({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const {
    insights,
    recommendations,
    generateAssetInsights,
    getAssetRecommendations,
    isAnalyzing
  } = useCatalogAI();

  const {
    getAssetMetrics,
    getUsageAnalytics,
    getPopularityScores
  } = useCatalogAnalytics();

  const {
    getPersonalizedRecommendations,
    recordAssetInteraction
  } = useCatalogRecommendations();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredAssets = useMemo(() => {
    if (!catalogAssets) return [];

    return catalogAssets.filter(asset => {
      const matchesSearch = searchQuery === '' || 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilters = (
        (filters.types.length === 0 || filters.types.includes(asset.type)) &&
        (filters.sources.length === 0 || filters.sources.includes(asset.sourceId)) &&
        (filters.owners.length === 0 || filters.owners.includes(asset.owner)) &&
        (filters.classifications.length === 0 || asset.classifications?.some(c => filters.classifications.includes(c.name))) &&
        (asset.qualityScore >= filters.qualityScores.min && asset.qualityScore <= filters.qualityScores.max) &&
        (!filters.hasDescription || asset.description) &&
        (!filters.hasLineage || asset.hasLineage) &&
        (!filters.hasQualityRules || asset.qualityRules?.length > 0)
      );

      return matchesSearch && matchesFilters;
    });
  }, [catalogAssets, searchQuery, filters]);

  const groupedAssets = useMemo(() => {
    if (viewConfig.groupBy === 'none') {
      return { 'All Assets': filteredAssets };
    }

    const groups: Record<string, IntelligentDataAsset[]> = {};
    
    filteredAssets.forEach(asset => {
      let groupKey = '';
      
      switch (viewConfig.groupBy) {
        case 'type':
          groupKey = formatAssetType(asset.type);
          break;
        case 'source':
          groupKey = asset.sourceName || 'Unknown Source';
          break;
        case 'owner':
          groupKey = asset.owner || 'Unowned';
          break;
        case 'classification':
          groupKey = asset.classifications?.[0]?.name || 'Unclassified';
          break;
        case 'quality':
          groupKey = asset.qualityScore >= 80 ? 'High Quality' : 
                   asset.qualityScore >= 60 ? 'Medium Quality' : 'Low Quality';
          break;
        default:
          groupKey = 'All Assets';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(asset);
    });

    // Sort groups and assets within groups
    Object.keys(groups).forEach(key => {
      groups[key] = sortAssets(groups[key]);
    });

    return groups;
  }, [filteredAssets, viewConfig.groupBy, viewConfig.sortBy, viewConfig.sortOrder]);

  const sortAssets = (assets: IntelligentDataAsset[]) => {
    return [...assets].sort((a, b) => {
      let comparison = 0;
      
      switch (viewConfig.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'quality':
          comparison = a.qualityScore - b.qualityScore;
          break;
        case 'usage':
          comparison = (a.usageMetrics?.accessCount || 0) - (b.usageMetrics?.accessCount || 0);
          break;
        case 'popularity':
          comparison = (a.popularityScore || 0) - (b.popularityScore || 0);
          break;
      }
      
      return viewConfig.sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAssetSelect = useCallback(async (asset: IntelligentDataAsset) => {
    setSelectedAsset(asset);
    setIsAssetDetailOpen(true);
    
    // Record interaction
    await recordAssetInteraction({
      assetId: asset.id,
      type: 'view',
      timestamp: new Date()
    });
    
    // Update recent assets
    setRecentAssets(prev => {
      const filtered = prev.filter(a => a.id !== asset.id);
      return [asset, ...filtered].slice(0, 10);
    });
    
    // Generate insights if enabled
    if (enableAIInsights) {
      generateAssetInsights(asset.id);
    }
    
    onAssetSelect?.(asset);
  }, [recordAssetInteraction, generateAssetInsights, enableAIInsights, onAssetSelect]);

  const handleToggleFavorite = useCallback((assetId: string) => {
    setFavoriteAssets(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchAssets(query, filters);
    }
  }, [searchAssets, filters]);

  const handleFilterChange = useCallback((newFilters: Partial<AssetFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleViewConfigChange = useCallback((config: Partial<ViewConfiguration>) => {
    setViewConfig(prev => ({ ...prev, ...config }));
  }, []);

  const handleNavigate = useCallback((item: BreadcrumbItem) => {
    const index = navigationPath.findIndex(p => p.id === item.id);
    if (index >= 0) {
      setNavigationPath(prev => prev.slice(0, index + 1));
    }
  }, [navigationPath]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderAssetCard = (asset: IntelligentDataAsset) => (
    <motion.div
      key={asset.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group cursor-pointer"
      onClick={() => handleAssetSelect(asset)}
    >
      <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 group-hover:border-l-blue-600">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="outline" className="text-xs shrink-0">
                  {formatAssetType(asset.type)}
                </Badge>
                {asset.isVerified && (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                )}
                {asset.isSensitive && (
                  <Shield className="h-4 w-4 text-red-500 shrink-0" />
                )}
              </div>
              <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors truncate">
                {asset.name}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {asset.description || 'No description available'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(asset.id);
                    }}
                  >
                    <Heart className={`h-4 w-4 ${favoriteAssets.has(asset.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{favoriteAssets.has(asset.id) ? 'Remove from favorites' : 'Add to favorites'}</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Source
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Quality and Usage Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{asset.qualityScore || 0}%</div>
                <div className="text-xs text-blue-600">Quality</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{asset.usageMetrics?.accessCount || 0}</div>
                <div className="text-xs text-green-600">Views</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{asset.relationships?.length || 0}</div>
                <div className="text-xs text-purple-600">Links</div>
              </div>
            </div>

            {/* Owner and Source Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{asset.owner || 'Unowned'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>{asset.sourceName || 'Unknown'}</span>
              </div>
            </div>

            {/* Tags */}
            {asset.tags && asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {asset.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {asset.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{asset.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Updated Time */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Updated {formatDate(asset.updatedAt)}</span>
              {asset.isRecent && (
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAssetList = (asset: IntelligentDataAsset) => (
    <motion.div
      key={asset.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => handleAssetSelect(asset)}
    >
      <div className="flex items-center space-x-4">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors truncate">
              {asset.name}
            </h3>
            <Badge variant="outline" className="text-xs shrink-0">
              {formatAssetType(asset.type)}
            </Badge>
            {asset.isVerified && (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {asset.description || 'No description available'}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
            <span>Quality: {asset.qualityScore || 0}%</span>
            <span>Views: {asset.usageMetrics?.accessCount || 0}</span>
            <span>Owner: {asset.owner || 'Unowned'}</span>
            <span>Updated: {formatDate(asset.updatedAt)}</span>
          </div>
        </div>
        <div className="shrink-0 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(asset.id);
            }}
          >
            <Heart className={`h-4 w-4 ${favoriteAssets.has(asset.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );

  const renderBreadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      {navigationPath.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          <button
            onClick={() => handleNavigate(item)}
            className="hover:text-foreground transition-colors"
          >
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Intelligent Catalog</h1>
                <p className="text-muted-foreground">AI-powered data asset discovery and management</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCatalog}
              disabled={catalogLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${catalogLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            
            <Sheet open={isFilterPanelOpen} onOpenChange={setIsFilterPanelOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Assets</SheetTitle>
                  <SheetDescription>
                    Refine your catalog view with advanced filters
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="text-center text-muted-foreground">
                    Advanced filter panel goes here
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search data assets..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              value={viewConfig.layout}
              onValueChange={(value: any) => handleViewConfigChange({ layout: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">
                  <div className="flex items-center space-x-2">
                    <Grid3X3 className="h-4 w-4" />
                    <span>Grid</span>
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center space-x-2">
                    <List className="h-4 w-4" />
                    <span>List</span>
                  </div>
                </SelectItem>
                <SelectItem value="tree">
                  <div className="flex items-center space-x-2">
                    <FolderTree className="h-4 w-4" />
                    <span>Tree</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={viewConfig.sortBy}
              onValueChange={(value: any) => handleViewConfigChange({ sortBy: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="updated">Updated Date</SelectItem>
                <SelectItem value="quality">Quality Score</SelectItem>
                <SelectItem value="usage">Usage Count</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {renderBreadcrumb()}

        {/* Main Content */}
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
          <ResizablePanel defaultSize={75} minSize={60}>
            <div className="h-full p-6">
              {catalogLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading catalog assets...</p>
                  </div>
                </div>
              ) : catalogError ? (
                <div className="flex items-center justify-center h-full">
                  <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Catalog</AlertTitle>
                    <AlertDescription>
                      {catalogError.message || 'Failed to load catalog assets. Please try again.'}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : Object.keys(groupedAssets).length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No assets found</h3>
                    <p className="text-muted-foreground">
                      No data assets match your current search and filter criteria.
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-8">
                    {Object.entries(groupedAssets).map(([groupName, assets]) => (
                      <div key={groupName}>
                        {viewConfig.groupBy !== 'none' && (
                          <div className="flex items-center space-x-2 mb-4">
                            <h2 className="text-xl font-semibold">{groupName}</h2>
                            <Badge variant="secondary">{assets.length}</Badge>
                          </div>
                        )}
                        
                        {viewConfig.layout === 'grid' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <AnimatePresence>
                              {assets.map(renderAssetCard)}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <AnimatePresence>
                              {assets.map(renderAssetList)}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="h-full p-6 border-l bg-muted/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quick Access</h3>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Star className="mr-2 h-4 w-4" />
                      Favorites ({favoriteAssets.size})
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Clock className="mr-2 h-4 w-4" />
                      Recent ({recentAssets.length})
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Popular
                    </Button>
                  </div>
                </div>

                {enableAIInsights && recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">AI Recommendations</h3>
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <Alert key={index}>
                          <Sparkles className="h-4 w-4" />
                          <AlertTitle className="text-sm">{rec.title}</AlertTitle>
                          <AlertDescription className="text-xs">
                            {rec.description}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {recentAssets.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recently Viewed</h3>
                    <div className="space-y-2">
                      {recentAssets.slice(0, 5).map((asset) => (
                        <div
                          key={asset.id}
                          className="p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => handleAssetSelect(asset)}
                        >
                          <div className="flex items-center space-x-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{asset.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatAssetType(asset.type)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Asset Detail Dialog */}
        {selectedAsset && (
          <Dialog open={isAssetDetailOpen} onOpenChange={setIsAssetDetailOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span>{selectedAsset.name}</span>
                </DialogTitle>
                <DialogDescription>
                  Detailed information about this data asset
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8 text-muted-foreground">
                Detailed asset information component goes here
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
};

export default IntelligentCatalogViewer;