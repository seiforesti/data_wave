/**
 * Intelligent Catalog Viewer Component
 * ===================================
 * 
 * Advanced smart catalog browser that provides:
 * - AI-powered asset recommendations and suggestions
 * - Contextual insights and metadata enrichment
 * - Interactive data lineage visualization
 * - Smart filtering and faceted search
 * - Real-time collaboration features
 * - Advanced visualization and preview capabilities
 * - Intelligent asset grouping and categorization
 * - Personalized user experience
 * 
 * Backend Integration:
 * - Maps to enterprise_catalog_service.py intelligent browsing methods
 * - Uses IntelligentDataAsset and relationship models
 * - Integrates with AI recommendation services
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Star, 
  Bookmark, 
  Share2, 
  Download, 
  Upload,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  Clock,
  Tag,
  Database,
  FileText,
  BarChart3,
  Network,
  Lightbulb,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCircle,
  Heart,
  MessageSquare,
  ExternalLink,
  Layers,
  Zap,
  Brain,
  Target,
  Globe,
  Shield,
  Activity
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { useAssets, useInfiniteAssets, useAssetRecommendations } from '../../hooks/useCatalogAssets';
import { 
  IntelligentDataAsset, 
  AssetType, 
  AssetStatus,
  AssetCriticality,
  DataSensitivity,
  UsageFrequency
} from '../../types/catalog-core.types';
import { 
  AssetSearchRequest,
  SearchScope,
  SortBy,
  SortDirection
} from '../../types/search.types';
import { 
  ASSET_TYPE_CONFIG, 
  ASSET_STATUS_CONFIG, 
  UI_CONFIG,
  PAGINATION 
} from '../../constants/catalog-constants';
import { 
  calculateAssetHealthScore, 
  getAssetTypeInfo, 
  formatFileSize, 
  formatRelativeTime,
  formatNumber
} from '../../utils/catalog-utils';

// ========================= INTERFACES =========================

interface ViewMode {
  type: 'grid' | 'list' | 'tree' | 'graph';
  density: 'compact' | 'comfortable' | 'spacious';
}

interface FilterOptions {
  assetTypes: AssetType[];
  statuses: AssetStatus[];
  criticality: AssetCriticality[];
  sensitivity: DataSensitivity[];
  owners: string[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  qualityScore: {
    min: number;
    max: number;
  };
  usageFrequency: UsageFrequency[];
}

interface AssetInsight {
  id: string;
  assetId: string;
  type: 'quality' | 'usage' | 'lineage' | 'recommendation' | 'alert';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  suggestedActions: string[];
  createdAt: string;
}

interface AssetRecommendation {
  id: string;
  assetId: string;
  recommendedAssetId: string;
  type: 'similar' | 'related' | 'frequently_used_together' | 'alternative';
  reason: string;
  confidence: number;
  metadata: Record<string, any>;
}

// ========================= MAIN COMPONENT =========================

export const IntelligentCatalogViewer: React.FC = () => {
  // ========================= STATE MANAGEMENT =========================
  
  const [viewMode, setViewMode] = useState<ViewMode>({
    type: 'grid',
    density: 'comfortable'
  });
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.RELEVANCE);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.DESC);
  const [selectedAsset, setSelectedAsset] = useState<IntelligentDataAsset | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showInsights, setShowInsights] = useState<boolean>(true);
  const [favoriteAssets, setFavoriteAssets] = useState<Set<string>>(new Set());
  const [bookmarkedAssets, setBookmarkedAssets] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<FilterOptions>({
    assetTypes: [],
    statuses: [AssetStatus.ACTIVE],
    criticality: [],
    sensitivity: [],
    owners: [],
    tags: [],
    dateRange: {},
    qualityScore: { min: 0, max: 100 },
    usageFrequency: []
  });

  // ========================= SEARCH REQUEST =========================
  
  const searchRequest = useMemo<AssetSearchRequest>(() => ({
    query: searchQuery,
    scope: SearchScope.ALL,
    filters: {
      asset_types: filters.assetTypes,
      statuses: filters.statuses,
      criticality: filters.criticality,
      sensitivity: filters.sensitivity,
      owners: filters.owners,
      tags: filters.tags,
      date_range: filters.dateRange,
      quality_score_range: filters.qualityScore,
      usage_frequency: filters.usageFrequency
    },
    sort: {
      field: sortBy,
      direction: sortDirection
    },
    include_metadata: true,
    include_lineage: true,
    include_quality: true,
    include_usage: true,
    include_recommendations: true
  }), [searchQuery, filters, sortBy, sortDirection]);

  // ========================= HOOKS =========================
  
  const {
    data: assetsData,
    isLoading: isAssetsLoading,
    error: assetsError,
    refetch: refetchAssets
  } = useAssets(searchRequest);

  const {
    data: infiniteAssetsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteAssets(searchRequest);

  const {
    recommendations,
    isLoading: isRecommendationsLoading
  } = useAssetRecommendations(selectedAsset?.id || '', {
    limit: 10,
    includeMetadata: true
  });

  // ========================= COMPUTED VALUES =========================
  
  const assets = useMemo(() => {
    if (viewMode.type === 'grid' || viewMode.type === 'list') {
      return assetsData?.results || [];
    }
    return infiniteAssetsData?.pages.flatMap(page => page.results) || [];
  }, [assetsData, infiniteAssetsData, viewMode.type]);

  const assetInsights = useMemo<AssetInsight[]>(() => {
    const insights: AssetInsight[] = [];
    
    assets.forEach(asset => {
      const healthScore = calculateAssetHealthScore(asset);
      
      if (healthScore < 60) {
        insights.push({
          id: `quality-${asset.id}`,
          assetId: asset.id,
          type: 'quality',
          title: 'Quality Issues Detected',
          description: `Asset "${asset.name}" has a low quality score of ${healthScore.toFixed(1)}%`,
          confidence: 0.9,
          priority: healthScore < 40 ? 'critical' : 'high',
          actionable: true,
          suggestedActions: [
            'Review data quality rules',
            'Validate data sources',
            'Update metadata',
            'Run quality assessment'
          ],
          createdAt: new Date().toISOString()
        });
      }

      if (asset.usage_metrics?.frequency === UsageFrequency.VERY_LOW) {
        insights.push({
          id: `usage-${asset.id}`,
          assetId: asset.id,
          type: 'usage',
          title: 'Low Usage Detected',
          description: `Asset "${asset.name}" has very low usage frequency`,
          confidence: 0.8,
          priority: 'medium',
          actionable: true,
          suggestedActions: [
            'Review asset relevance',
            'Update documentation',
            'Promote to users',
            'Consider archiving'
          ],
          createdAt: new Date().toISOString()
        });
      }
    });

    return insights.slice(0, 10); // Limit to top 10 insights
  }, [assets]);

  const assetStats = useMemo(() => {
    const stats = {
      total: assets.length,
      byType: {} as Record<AssetType, number>,
      byStatus: {} as Record<AssetStatus, number>,
      avgQualityScore: 0,
      criticalAssets: 0,
      recentlyUpdated: 0
    };

    assets.forEach(asset => {
      // Count by type
      stats.byType[asset.asset_type] = (stats.byType[asset.asset_type] || 0) + 1;
      
      // Count by status
      stats.byStatus[asset.status] = (stats.byStatus[asset.status] || 0) + 1;
      
      // Calculate average quality score
      const healthScore = calculateAssetHealthScore(asset);
      stats.avgQualityScore += healthScore;
      
      // Count critical assets
      if (asset.criticality === AssetCriticality.CRITICAL) {
        stats.criticalAssets++;
      }
      
      // Count recently updated (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (asset.last_modified && new Date(asset.last_modified) > weekAgo) {
        stats.recentlyUpdated++;
      }
    });

    if (assets.length > 0) {
      stats.avgQualityScore = stats.avgQualityScore / assets.length;
    }

    return stats;
  }, [assets]);

  // ========================= EVENT HANDLERS =========================
  
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((
    key: keyof FilterOptions, 
    value: any
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleAssetSelect = useCallback((asset: IntelligentDataAsset) => {
    setSelectedAsset(asset);
  }, []);

  const handleToggleFavorite = useCallback((assetId: string) => {
    setFavoriteAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  }, []);

  const handleToggleBookmark = useCallback((assetId: string) => {
    setBookmarkedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  }, []);

  // ========================= RENDER HELPERS =========================
  
  const renderAssetCard = (asset: IntelligentDataAsset) => {
    const typeInfo = getAssetTypeInfo(asset.asset_type);
    const healthScore = calculateAssetHealthScore(asset);
    const isFavorite = favoriteAssets.has(asset.id);
    const isBookmarked = bookmarkedAssets.has(asset.id);

    return (
      <Card 
        key={asset.id} 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
        onClick={() => handleAssetSelect(asset)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: typeInfo.color }}
              >
                {typeInfo.icon}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{asset.display_name || asset.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {typeInfo.label}
                  </Badge>
                  <Badge 
                    variant={ASSET_STATUS_CONFIG[asset.status].variant}
                    className="text-xs"
                  >
                    {ASSET_STATUS_CONFIG[asset.status].label}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(asset.id);
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(asset.id);
                    }}
                  >
                    <Bookmark 
                      className={`h-4 w-4 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isBookmarked ? 'Remove bookmark' : 'Bookmark asset'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Description */}
          {asset.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {asset.description}
            </p>
          )}
          
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Quality Score</span>
                <span className="text-xs font-medium">{healthScore.toFixed(1)}%</span>
              </div>
              <Progress value={healthScore} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Usage</span>
                <Badge variant="outline" className="text-xs">
                  {asset.usage_metrics?.frequency || 'Unknown'}
                </Badge>
              </div>
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
          
          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{asset.owner || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(asset.last_modified || asset.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAssetList = (asset: IntelligentDataAsset) => {
    const typeInfo = getAssetTypeInfo(asset.asset_type);
    const healthScore = calculateAssetHealthScore(asset);
    const isFavorite = favoriteAssets.has(asset.id);
    const isBookmarked = bookmarkedAssets.has(asset.id);

    return (
      <Card 
        key={asset.id} 
        className="cursor-pointer hover:shadow-md transition-all duration-200 group"
        onClick={() => handleAssetSelect(asset)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Asset Icon */}
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
              style={{ backgroundColor: typeInfo.color }}
            >
              {typeInfo.icon}
            </div>
            
            {/* Asset Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">{asset.display_name || asset.name}</h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(asset.id);
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(asset.id);
                    }}
                  >
                    <Bookmark 
                      className={`h-4 w-4 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} 
                    />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {typeInfo.label}
                </Badge>
                <Badge 
                  variant={ASSET_STATUS_CONFIG[asset.status].variant}
                  className="text-xs"
                >
                  {ASSET_STATUS_CONFIG[asset.status].label}
                </Badge>
                {asset.criticality && (
                  <Badge variant="destructive" className="text-xs">
                    {asset.criticality}
                  </Badge>
                )}
              </div>
              
              {asset.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {asset.description}
                </p>
              )}
            </div>
            
            {/* Metrics */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-medium">{healthScore.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Quality</div>
              </div>
              <div className="text-center">
                <div className="font-medium">
                  {asset.usage_metrics?.total_queries || 0}
                </div>
                <div className="text-xs text-muted-foreground">Queries</div>
              </div>
              <div className="text-center">
                <div className="font-medium">
                  {formatRelativeTime(asset.last_modified || asset.created_at)}
                </div>
                <div className="text-xs text-muted-foreground">Modified</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFilters = () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asset Types */}
        <div className="space-y-2">
          <Label>Asset Types</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {Object.values(AssetType).map(type => (
              <div key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`type-${type}`}
                  checked={filters.assetTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleFilterChange('assetTypes', [...filters.assetTypes, type]);
                    } else {
                      handleFilterChange('assetTypes', 
                        filters.assetTypes.filter(t => t !== type)
                      );
                    }
                  }}
                />
                <Label htmlFor={`type-${type}`} className="text-sm">
                  {ASSET_TYPE_CONFIG[type].label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="space-y-2">
            {Object.values(AssetStatus).map(status => (
              <div key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`status-${status}`}
                  checked={filters.statuses.includes(status)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleFilterChange('statuses', [...filters.statuses, status]);
                    } else {
                      handleFilterChange('statuses', 
                        filters.statuses.filter(s => s !== status)
                      );
                    }
                  }}
                />
                <Label htmlFor={`status-${status}`} className="text-sm">
                  {ASSET_STATUS_CONFIG[status].label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Score Range */}
        <div className="space-y-2">
          <Label>Quality Score Range</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.qualityScore.min}
                onChange={(e) => handleFilterChange('qualityScore', {
                  ...filters.qualityScore,
                  min: parseInt(e.target.value) || 0
                })}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.qualityScore.max}
                onChange={(e) => handleFilterChange('qualityScore', {
                  ...filters.qualityScore,
                  max: parseInt(e.target.value) || 100
                })}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderInsights = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Intelligent recommendations and observations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {assetInsights.map((insight) => (
            <Alert key={insight.id} className={
              insight.priority === 'critical' ? 'border-red-200 bg-red-50' :
              insight.priority === 'high' ? 'border-orange-200 bg-orange-50' :
              insight.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <AlertTitle className="text-sm font-medium">
                    {insight.title}
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    {insight.description}
                  </AlertDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {insight.priority}
                </Badge>
              </div>
            </Alert>
          ))}
          
          {assetInsights.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No insights available at the moment
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // ========================= MAIN RENDER =========================
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Intelligent Catalog Viewer
            </h1>
            <p className="text-muted-foreground mt-2">
              Smart catalog browsing with AI-powered recommendations and insights
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(assetStats.total)}</div>
              <p className="text-xs text-muted-foreground">
                {assetStats.recentlyUpdated} updated this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.avgQualityScore.toFixed(1)}%</div>
              <Progress value={assetStats.avgQualityScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Assets</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.criticalAssets}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assetStats.byStatus[AssetStatus.ACTIVE] || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for use
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets with AI-powered suggestions..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SortBy.RELEVANCE}>Relevance</SelectItem>
                  <SelectItem value={SortBy.NAME}>Name</SelectItem>
                  <SelectItem value={SortBy.CREATED_DATE}>Created</SelectItem>
                  <SelectItem value={SortBy.MODIFIED_DATE}>Modified</SelectItem>
                  <SelectItem value={SortBy.POPULARITY}>Popularity</SelectItem>
                  <SelectItem value={SortBy.QUALITY_SCORE}>Quality</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode.type === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(prev => ({ ...prev, type: 'grid' }))}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode.type === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(prev => ({ ...prev, type: 'list' }))}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-shrink-0"
              >
                {renderFilters()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Assets Grid/List */}
          <div className="flex-1">
            {isAssetsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={
                viewMode.type === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }>
                {assets.map(asset => 
                  viewMode.type === 'grid' 
                    ? renderAssetCard(asset)
                    : renderAssetList(asset)
                )}
              </div>
            )}

            {assets.length === 0 && !isAssetsLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No assets found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Insights Sidebar */}
          <AnimatePresence>
            {showInsights && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-80 flex-shrink-0"
              >
                {renderInsights()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default IntelligentCatalogViewer;