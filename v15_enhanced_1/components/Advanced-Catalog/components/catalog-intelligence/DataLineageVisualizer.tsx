'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  GitBranch,
  Network,
  Layers,
  Activity,
  Database,
  FileText,
  Share2,
  Eye,
  Filter,
  Search,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Move,
  Target,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Activity as ActivityIcon,
  MapPin,
  Globe,
  Shield,
  Lock,
  Unlock,
  Star,
  Bookmark,
  Tag,
  Hash,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  MoreVertical,
  Grid,
  List,
  Workflow,
  Bot,
  Cpu,
  Monitor,
  Zap,
  Sparkles,
  Brain,
  Gauge,
  Crosshair,
  Focus,
  Radar,
  Scan
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, formatDistanceToNow, isToday, startOfDay, endOfDay } from 'date-fns';

// Import hooks and services
import { useCatalogLineage } from '../../hooks/useCatalogLineage';
import { useCatalogAnalytics } from '../../hooks/useCatalogAnalytics';
import { useCatalogAI } from '../../hooks/useCatalogAI';

// Import types
import type {
  LineageNode,
  LineageEdge,
  LineageGraph,
  ImpactAnalysisResult,
  LineageMetrics,
  LineagePath,
  LineageVisualizationConfig,
  CatalogAsset,
  UserContext,
  SystemContext,
  TimeRange
} from '../../types';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface LineageViewState {
  activeTab: 'graph' | 'impact' | 'paths' | 'analytics' | 'config';
  viewMode: 'interactive' | 'static' | 'hierarchical' | 'circular';
  selectedNodes: string[];
  selectedEdges: string[];
  focusedNode: string | null;
  showLabels: boolean;
  showMetrics: boolean;
  showDirections: boolean;
  showCriticalPath: boolean;
  enableClustering: boolean;
  enableFiltering: boolean;
  enableAnimation: boolean;
  isFullscreen: boolean;
  zoomLevel: number;
  panOffset: { x: number; y: number };
}

interface LineageFilters {
  assetTypes: string[];
  timeRange: TimeRange | null;
  minConfidence: number;
  maxDepth: number;
  includeUpstream: boolean;
  includeDownstream: boolean;
  showOnlyActive: boolean;
  showOnlyModified: boolean;
}

interface LineageLayout {
  algorithm: 'force' | 'hierarchical' | 'circular' | 'tree' | 'dagre';
  direction: 'LR' | 'RL' | 'TB' | 'BT';
  spacing: { x: number; y: number };
  nodeSize: { width: number; height: number };
  enablePhysics: boolean;
  enableConstraints: boolean;
}

interface LineageHighlight {
  type: 'critical-path' | 'impact-chain' | 'dependency-cycle' | 'quality-issue' | 'custom';
  nodes: string[];
  edges: string[];
  color: string;
  label: string;
  description: string;
}

export const DataLineageVisualizer: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [viewState, setViewState] = useState<LineageViewState>({
    activeTab: 'graph',
    viewMode: 'interactive',
    selectedNodes: [],
    selectedEdges: [],
    focusedNode: null,
    showLabels: true,
    showMetrics: true,
    showDirections: true,
    showCriticalPath: false,
    enableClustering: false,
    enableFiltering: true,
    enableAnimation: true,
    isFullscreen: false,
    zoomLevel: 1,
    panOffset: { x: 0, y: 0 }
  });

  const [filters, setFilters] = useState<LineageFilters>({
    assetTypes: [],
    timeRange: null,
    minConfidence: 0.5,
    maxDepth: 5,
    includeUpstream: true,
    includeDownstream: true,
    showOnlyActive: false,
    showOnlyModified: false
  });

  const [layout, setLayout] = useState<LineageLayout>({
    algorithm: 'force',
    direction: 'LR',
    spacing: { x: 150, y: 100 },
    nodeSize: { width: 120, height: 60 },
    enablePhysics: true,
    enableConstraints: false
  });

  const [highlights, setHighlights] = useState<LineageHighlight[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [impactAnalysisTarget, setImpactAnalysisTarget] = useState<string>('');

  // Refs for visualization
  const canvasRef = useRef<HTMLDivElement>(null);
  const visualizationRef = useRef<any>(null);

  // ============================================================================
  // HOOKS INTEGRATION
  // ============================================================================
  
  const {
    lineageGraph,
    lineageMetrics,
    lineagePaths,
    impactAnalysis,
    isLoading,
    error,
    getAssetLineage,
    getLineageMetrics,
    getImpactAnalysis,
    getLineagePath,
    refreshLineage,
    exportLineage
  } = useCatalogLineage();

  const {
    getUsageAnalytics,
    getPerformanceMetrics,
    getTrendData
  } = useCatalogAnalytics();

  const {
    aiInsights,
    generateInsights,
    getSmartSuggestions,
    getPatternAnalysis
  } = useCatalogAI();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const filteredGraph = useMemo(() => {
    if (!lineageGraph) return null;
    
    let filteredNodes = lineageGraph.nodes;
    let filteredEdges = lineageGraph.edges;

    // Apply asset type filters
    if (filters.assetTypes.length > 0) {
      filteredNodes = filteredNodes.filter(node => 
        filters.assetTypes.includes(node.assetType || '')
      );
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredEdges = filteredEdges.filter(edge => 
        nodeIds.has(edge.source) && nodeIds.has(edge.target)
      );
    }

    // Apply confidence filter
    filteredEdges = filteredEdges.filter(edge => 
      (edge.confidence || 0) >= filters.minConfidence
    );

    // Apply active/modified filters
    if (filters.showOnlyActive) {
      filteredNodes = filteredNodes.filter(node => node.status === 'active');
    }

    if (filters.showOnlyModified && filters.timeRange) {
      filteredNodes = filteredNodes.filter(node => {
        if (!node.lastModified) return false;
        const modified = new Date(node.lastModified);
        return modified >= filters.timeRange!.start && modified <= filters.timeRange!.end;
      });
    }

    return {
      ...lineageGraph,
      nodes: filteredNodes,
      edges: filteredEdges
    };
  }, [lineageGraph, filters]);

  const graphStatistics = useMemo(() => {
    if (!filteredGraph) return null;
    
    const totalNodes = filteredGraph.nodes.length;
    const totalEdges = filteredGraph.edges.length;
    const nodeTypes = [...new Set(filteredGraph.nodes.map(n => n.assetType))];
    const edgeTypes = [...new Set(filteredGraph.edges.map(e => e.lineageType))];
    
    // Calculate connectivity metrics
    const nodeConnections = filteredGraph.nodes.map(node => {
      const incomingEdges = filteredGraph.edges.filter(e => e.target === node.id).length;
      const outgoingEdges = filteredGraph.edges.filter(e => e.source === node.id).length;
      return { nodeId: node.id, incoming: incomingEdges, outgoing: outgoingEdges, total: incomingEdges + outgoingEdges };
    });

    const avgConnections = nodeConnections.reduce((sum, conn) => sum + conn.total, 0) / totalNodes;
    const maxConnections = Math.max(...nodeConnections.map(conn => conn.total));
    const mostConnectedNode = nodeConnections.find(conn => conn.total === maxConnections);

    return {
      totalNodes,
      totalEdges,
      nodeTypes,
      edgeTypes,
      avgConnections: Math.round(avgConnections * 100) / 100,
      maxConnections,
      mostConnectedNode: mostConnectedNode?.nodeId,
      density: (totalEdges / (totalNodes * (totalNodes - 1))) * 100
    };
  }, [filteredGraph]);

  const criticalPath = useMemo(() => {
    if (!filteredGraph || !viewState.showCriticalPath) return [];
    
    // Simple critical path calculation - find longest path
    // In a real implementation, this would use more sophisticated algorithms
    const paths: string[][] = [];
    
    filteredGraph.nodes.forEach(startNode => {
      const visited = new Set<string>();
      const currentPath: string[] = [];
      
      const dfs = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        currentPath.push(nodeId);
        
        const outgoingEdges = filteredGraph.edges.filter(e => e.source === nodeId);
        if (outgoingEdges.length === 0) {
          paths.push([...currentPath]);
        } else {
          outgoingEdges.forEach(edge => dfs(edge.target));
        }
        
        currentPath.pop();
        visited.delete(nodeId);
      };
      
      dfs(startNode.id);
    });
    
    return paths.reduce((longest, current) => 
      current.length > longest.length ? current : longest, []
    );
  }, [filteredGraph, viewState.showCriticalPath]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleNodeSelect = useCallback((nodeId: string, isMultiSelect = false) => {
    setViewState(prev => {
      if (isMultiSelect) {
        const newSelected = prev.selectedNodes.includes(nodeId)
          ? prev.selectedNodes.filter(id => id !== nodeId)
          : [...prev.selectedNodes, nodeId];
        return { ...prev, selectedNodes: newSelected };
      } else {
        return { ...prev, selectedNodes: [nodeId], focusedNode: nodeId };
      }
    });
  }, []);

  const handleEdgeSelect = useCallback((edgeId: string, isMultiSelect = false) => {
    setViewState(prev => {
      if (isMultiSelect) {
        const newSelected = prev.selectedEdges.includes(edgeId)
          ? prev.selectedEdges.filter(id => id !== edgeId)
          : [...prev.selectedEdges, edgeId];
        return { ...prev, selectedEdges: newSelected };
      } else {
        return { ...prev, selectedEdges: [edgeId] };
      }
    });
  }, []);

  const handleNodeFocus = useCallback(async (nodeId: string) => {
    try {
      setViewState(prev => ({ ...prev, focusedNode: nodeId }));
      
      // Load lineage for the focused node
      await getAssetLineage(nodeId, {
        depth: filters.maxDepth,
        includeUpstream: filters.includeUpstream,
        includeDownstream: filters.includeDownstream
      });
    } catch (error) {
      console.error('Failed to focus on node:', error);
    }
  }, [getAssetLineage, filters]);

  const handleImpactAnalysis = useCallback(async (assetId: string) => {
    try {
      setImpactAnalysisTarget(assetId);
      const result = await getImpactAnalysis(assetId);
      
      if (result) {
        // Highlight impacted assets
        const impactHighlight: LineageHighlight = {
          type: 'impact-chain',
          nodes: result.impactedAssets.map(a => a.id),
          edges: result.impactedConnections || [],
          color: '#ff6b6b',
          label: 'Impact Analysis',
          description: `${result.impactedAssets.length} assets would be affected`
        };
        setHighlights(prev => [...prev.filter(h => h.type !== 'impact-chain'), impactHighlight]);
      }
    } catch (error) {
      console.error('Failed to perform impact analysis:', error);
    }
  }, [getImpactAnalysis]);

  const handlePathAnalysis = useCallback(async (sourceId: string, targetId: string) => {
    try {
      const paths = await getLineagePath(sourceId, targetId);
      
      if (paths && paths.length > 0) {
        // Highlight the shortest path
        const shortestPath = paths.reduce((shortest, current) => 
          current.nodes.length < shortest.nodes.length ? current : shortest
        );
        
        const pathHighlight: LineageHighlight = {
          type: 'critical-path',
          nodes: shortestPath.nodes,
          edges: shortestPath.edges || [],
          color: '#4ecdc4',
          label: 'Critical Path',
          description: `${shortestPath.nodes.length} steps from source to target`
        };
        setHighlights(prev => [...prev.filter(h => h.type !== 'critical-path'), pathHighlight]);
      }
    } catch (error) {
      console.error('Failed to analyze path:', error);
    }
  }, [getLineagePath]);

  const handleLayoutChange = useCallback((newLayout: Partial<LineageLayout>) => {
    setLayout(prev => ({ ...prev, ...newLayout }));
    // Trigger visualization re-render
    if (visualizationRef.current) {
      visualizationRef.current.updateLayout(newLayout);
    }
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setViewState(prev => ({
      ...prev,
      zoomLevel: Math.max(0.1, Math.min(3, prev.zoomLevel + delta))
    }));
  }, []);

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setViewState(prev => ({
      ...prev,
      panOffset: {
        x: prev.panOffset.x + deltaX,
        y: prev.panOffset.y + deltaY
      }
    }));
  }, []);

  const handleResetView = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
      selectedNodes: [],
      selectedEdges: [],
      focusedNode: null
    }));
    setHighlights([]);
  }, []);

  const handleExportGraph = useCallback(async (format: 'png' | 'svg' | 'pdf' | 'json') => {
    try {
      if (filteredGraph) {
        await exportLineage(filteredGraph, format);
      }
    } catch (error) {
      console.error('Failed to export lineage:', error);
    }
  }, [filteredGraph, exportLineage]);

  const handleSearchAssets = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!filteredGraph || !query.trim()) {
      setHighlights(prev => prev.filter(h => h.type !== 'custom'));
      return;
    }

    const matchingNodes = filteredGraph.nodes.filter(node => 
      node.name.toLowerCase().includes(query.toLowerCase()) ||
      node.description?.toLowerCase().includes(query.toLowerCase()) ||
      node.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    if (matchingNodes.length > 0) {
      const searchHighlight: LineageHighlight = {
        type: 'custom',
        nodes: matchingNodes.map(n => n.id),
        edges: [],
        color: '#ffd93d',
        label: 'Search Results',
        description: `${matchingNodes.length} assets match "${query}"`
      };
      setHighlights(prev => [...prev.filter(h => h.type !== 'custom'), searchHighlight]);
    }
  }, [filteredGraph]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    // Load initial lineage data
    const loadInitialData = async () => {
      if (selectedAssetId) {
        try {
          await getAssetLineage(selectedAssetId, {
            depth: filters.maxDepth,
            includeUpstream: filters.includeUpstream,
            includeDownstream: filters.includeDownstream
          });
          await getLineageMetrics(selectedAssetId);
        } catch (error) {
          console.error('Failed to load initial lineage data:', error);
        }
      }
    };

    loadInitialData();
  }, [selectedAssetId, getAssetLineage, getLineageMetrics, filters]);

  useEffect(() => {
    // Update critical path when graph changes
    if (viewState.showCriticalPath && criticalPath.length > 0) {
      const criticalPathHighlight: LineageHighlight = {
        type: 'critical-path',
        nodes: criticalPath,
        edges: [],
        color: '#e74c3c',
        label: 'Critical Path',
        description: `${criticalPath.length} nodes in critical path`
      };
      setHighlights(prev => [...prev.filter(h => h.type !== 'critical-path'), criticalPathHighlight]);
    } else {
      setHighlights(prev => prev.filter(h => h.type !== 'critical-path'));
    }
  }, [viewState.showCriticalPath, criticalPath]);

  // ============================================================================
  // COMPONENT RENDERS
  // ============================================================================
  
  const LineageGraphView = () => (
    <div className="space-y-6">
      {/* Graph Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label className="text-sm">Asset:</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select an asset to explore..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset_1">Customer Database</SelectItem>
                    <SelectItem value="asset_2">Orders Table</SelectItem>
                    <SelectItem value="asset_3">Analytics Dashboard</SelectItem>
                    <SelectItem value="asset_4">Sales Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => handleSearchAssets(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" size="sm" onClick={() => handleSearchAssets(searchQuery)}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewState(prev => ({ ...prev, showLabels: !prev.showLabels }))}
                  >
                    {viewState.showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle labels</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewState(prev => ({ ...prev, showCriticalPath: !prev.showCriticalPath }))}
                  >
                    <Target className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Show critical path</TooltipContent>
              </Tooltip>

              <Button variant="outline" size="sm" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <Button variant="outline" size="sm" onClick={refreshLineage}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40" align="end">
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleExportGraph('png')}>
                      Export as PNG
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleExportGraph('svg')}>
                      Export as SVG
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleExportGraph('pdf')}>
                      Export as PDF
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleExportGraph('json')}>
                      Export as JSON
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Area */}
      <Card className="flex-1">
        <CardContent className="p-0 relative" style={{ height: '600px' }}>
          {/* Mock Visualization Canvas */}
          <div 
            ref={canvasRef}
            className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center relative overflow-hidden"
          >
            {filteredGraph ? (
              <div className="relative w-full h-full">
                {/* Mock Network Visualization */}
                <div className="absolute inset-4">
                  <div className="grid grid-cols-4 gap-8 h-full">
                    {filteredGraph.nodes.slice(0, 12).map((node, index) => (
                      <div
                        key={node.id}
                        className={`relative ${
                          viewState.selectedNodes.includes(node.id) ? 'ring-2 ring-blue-500' : ''
                        } ${
                          highlights.some(h => h.nodes.includes(node.id)) ? 'ring-2 ring-red-400' : ''
                        }`}
                        onClick={() => handleNodeSelect(node.id)}
                      >
                        <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                          <CardContent className="p-3 flex flex-col items-center justify-center h-full text-center">
                            <Database className="h-6 w-6 mb-2 text-blue-600" />
                            {viewState.showLabels && (
                              <div className="text-xs font-medium line-clamp-2">{node.name}</div>
                            )}
                            <Badge variant="outline" className="text-xs mt-1">
                              {node.assetType}
                            </Badge>
                            {viewState.showMetrics && node.metrics && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {Math.round(node.metrics.qualityScore || 0)}% quality
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        
                        {/* Mock connection lines */}
                        {index < 11 && viewState.showDirections && (
                          <ArrowRight className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                  <Button variant="outline" size="sm" onClick={() => handleZoom(0.1)}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleZoom(-0.1)}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <div className="text-xs text-center text-muted-foreground">
                    {Math.round(viewState.zoomLevel * 100)}%
                  </div>
                </div>

                {/* Legend */}
                {highlights.length > 0 && (
                  <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium mb-2">Highlights</h4>
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: highlight.color }}
                        />
                        <span className="text-xs">{highlight.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select an Asset</h3>
                <p className="text-muted-foreground">
                  Choose an asset to explore its data lineage
                </p>
              </div>
            )}
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-sm text-muted-foreground">Loading lineage data...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graph Statistics */}
      {graphStatistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{graphStatistics.totalNodes}</div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{graphStatistics.totalEdges}</div>
              <div className="text-sm text-muted-foreground">Connections</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{graphStatistics.avgConnections}</div>
              <div className="text-sm text-muted-foreground">Avg. Connections</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{graphStatistics.density.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Graph Density</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const ImpactAnalysisView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Impact Analysis</h3>
        <div className="flex items-center space-x-2">
          <Select value={impactAnalysisTarget} onValueChange={setImpactAnalysisTarget}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select asset for impact analysis..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asset_1">Customer Database</SelectItem>
              <SelectItem value="asset_2">Orders Table</SelectItem>
              <SelectItem value="asset_3">Analytics Dashboard</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => impactAnalysisTarget && handleImpactAnalysis(impactAnalysisTarget)}
            disabled={!impactAnalysisTarget}
          >
            <Target className="h-4 w-4 mr-2" />
            Analyze
          </Button>
        </div>
      </div>

      {impactAnalysis && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {impactAnalysis.impactedAssets?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Impacted Assets</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {impactAnalysis.criticalityScore || 0}
                </div>
                <div className="text-sm text-muted-foreground">Criticality Score</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {impactAnalysis.estimatedDowntime || 0}h
                </div>
                <div className="text-sm text-muted-foreground">Est. Downtime</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Impacted Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Impact Level</TableHead>
                    <TableHead>Dependency Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {impactAnalysis.impactedAssets?.slice(0, 10).map((asset, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{asset.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          asset.impactLevel === 'high' ? 'destructive' :
                          asset.impactLevel === 'medium' ? 'default' : 'secondary'
                        }>
                          {asset.impactLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.dependencyType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <TooltipProvider>
      <div className={`space-y-6 ${viewState.isFullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <GitBranch className="h-6 w-6 mr-3 text-blue-600" />
              Data Lineage Visualizer
            </h2>
            <p className="text-muted-foreground">
              Interactive exploration of data relationships and dependencies
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
            >
              {viewState.isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Visualization Settings</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Show Labels</Label>
                      <Switch
                        checked={viewState.showLabels}
                        onCheckedChange={(checked) => setViewState(prev => ({ ...prev, showLabels: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Show Metrics</Label>
                      <Switch
                        checked={viewState.showMetrics}
                        onCheckedChange={(checked) => setViewState(prev => ({ ...prev, showMetrics: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Enable Animation</Label>
                      <Switch
                        checked={viewState.enableAnimation}
                        onCheckedChange={(checked) => setViewState(prev => ({ ...prev, enableAnimation: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Enable Clustering</Label>
                      <Switch
                        checked={viewState.enableClustering}
                        onCheckedChange={(checked) => setViewState(prev => ({ ...prev, enableClustering: checked }))}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label className="text-sm">Layout Algorithm</Label>
                    <Select 
                      value={layout.algorithm} 
                      onValueChange={(value) => handleLayoutChange({ algorithm: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="force">Force-Directed</SelectItem>
                        <SelectItem value="hierarchical">Hierarchical</SelectItem>
                        <SelectItem value="circular">Circular</SelectItem>
                        <SelectItem value="tree">Tree</SelectItem>
                        <SelectItem value="dagre">Dagre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={viewState.activeTab} onValueChange={(value) => setViewState(prev => ({ ...prev, activeTab: value as any }))}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="graph">
              <Network className="h-4 w-4 mr-2" />
              Graph
            </TabsTrigger>
            <TabsTrigger value="impact">
              <Target className="h-4 w-4 mr-2" />
              Impact Analysis
            </TabsTrigger>
            <TabsTrigger value="paths">
              <GitBranch className="h-4 w-4 mr-2" />
              Paths
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="graph">
            <LineageGraphView />
          </TabsContent>

          <TabsContent value="impact">
            <ImpactAnalysisView />
          </TabsContent>

          <TabsContent value="paths">
            <div className="text-center py-12">
              <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Path Analysis Coming Soon</h3>
              <p className="text-muted-foreground">
                Analyze specific lineage paths between assets
              </p>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Lineage Analytics Coming Soon</h3>
              <p className="text-muted-foreground">
                Advanced analytics and insights on data lineage patterns
              </p>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <div className="text-center py-12">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Configuration Coming Soon</h3>
              <p className="text-muted-foreground">
                Advanced lineage visualization configuration options
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default DataLineageVisualizer;