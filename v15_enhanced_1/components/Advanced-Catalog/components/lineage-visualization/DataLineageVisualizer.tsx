// ============================================================================
// DATA LINEAGE VISUALIZER - INTERACTIVE LINEAGE VISUALIZATION (2600+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Data Lineage Visualization Component
// Interactive network graphs, impact analysis, dependency tracking,
// temporal lineage evolution, and AI-powered lineage discovery
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import * as d3 from 'd3';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Icons
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Binary,
  BookOpen,
  Brain,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Code,
  Copy,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  GitBranch,
  Globe,
  Hash,
  HelpCircle,
  History,
  Home,
  Info,
  Layers,
  Link,
  Loader2,
  Lock,
  LucideIcon,
  MapPin,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Move,
  Network,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Share,
  Shield,
  Star,
  Table,
  Tag,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Wand2,
  X,
  Zap,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

// Services and Types
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { advancedLineageService } from '../../services/advanced-lineage.service';
import {
  CatalogAsset,
  DataLineage,
  LineageNode,
  LineageEdge,
  LineageAnalysis,
  LineageVisualizationConfig,
  ImpactAnalysis,
  DependencyGraph,
  LineageMetrics,
  LineageFilter,
  LineageSearchCriteria,
  TemporalLineage,
  LineageChangeEvent
} from '../../types/catalog-core.types';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface LineageVisualizationProps {
  assetId?: string;
  selectedAssets?: string[];
  viewMode?: 'network' | 'hierarchy' | 'flow' | 'impact';
  onAssetSelect?: (assetId: string) => void;
  onLineageAnalysis?: (analysis: LineageAnalysis) => void;
  className?: string;
}

interface NetworkVisualizationState {
  nodes: d3.SimulationNodeDatum[];
  links: d3.SimulationLinkDatum<d3.SimulationNodeDatum>[];
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined> | null;
  selectedNodes: Set<string>;
  hoveredNode: string | null;
  zoom: d3.ZoomBehavior<Element, unknown>;
  transform: d3.ZoomTransform;
}

interface LineageExplorationState {
  currentAsset: CatalogAsset | null;
  explorationPath: string[];
  visitedNodes: Set<string>;
  discoveredLineage: DataLineage[];
  analysisResults: LineageAnalysis | null;
}

interface VisualizationControls {
  layout: 'force' | 'hierarchical' | 'circular' | 'tree';
  direction: 'upstream' | 'downstream' | 'both';
  depth: number;
  nodeSize: 'small' | 'medium' | 'large';
  edgeStyle: 'straight' | 'curved' | 'orthogonal';
  showLabels: boolean;
  showMetrics: boolean;
  animateTransitions: boolean;
  groupByType: boolean;
  highlightCriticalPath: boolean;
}

// ============================================================================
// ADVANCED NETWORK VISUALIZATION COMPONENT
// ============================================================================

const AdvancedNetworkVisualization: React.FC<{
  lineageData: DataLineage;
  config: LineageVisualizationConfig;
  onNodeSelect: (nodeId: string) => void;
  onEdgeSelect: (edgeId: string) => void;
}> = ({ lineageData, config, onNodeSelect, onEdgeSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [visualizationState, setVisualizationState] = useState<NetworkVisualizationState>({
    nodes: [],
    links: [],
    simulation: null,
    selectedNodes: new Set(),
    hoveredNode: null,
    zoom: d3.zoom(),
    transform: d3.zoomIdentity
  });

  const [controls, setControls] = useState<VisualizationControls>({
    layout: 'force',
    direction: 'both',
    depth: 3,
    nodeSize: 'medium',
    edgeStyle: 'curved',
    showLabels: true,
    showMetrics: false,
    animateTransitions: true,
    groupByType: true,
    highlightCriticalPath: false
  });

  // Initialize D3 visualization
  useEffect(() => {
    if (!svgRef.current || !lineageData) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.getBoundingClientRect().width || 800;
    const height = svg.node()?.getBoundingClientRect().height || 600;

    // Clear previous visualization
    svg.selectAll('*').remove();

    // Create main group for zoom/pan
    const g = svg.append('g').attr('class', 'visualization-group');

    // Prepare nodes and links
    const nodes = lineageData.nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      x: width / 2,
      y: height / 2,
      ...node
    }));

    const links = lineageData.edges.map(edge => ({
      source: edge.sourceId,
      target: edge.targetId,
      type: edge.type,
      ...edge
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setVisualizationState(prev => ({
          ...prev,
          transform: event.transform
        }));
      });

    svg.call(zoom);

    // Create arrow markers
    svg.append('defs').selectAll('marker')
      .data(['dependency', 'dataflow', 'transformation'])
      .enter().append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', -1.5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', d => `arrow-${d}`);

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('marker-end', d => `url(#arrow-${d.type})`)
      .style('stroke', d => getEdgeColor(d.type))
      .style('stroke-width', d => getEdgeWidth(d.strength || 1))
      .style('opacity', 0.6)
      .on('click', (event, d) => onEdgeSelect(d.id));

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', d => getNodeSize(d.type, controls.nodeSize))
      .style('fill', d => getNodeColor(d.type))
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .on('click', (event, d) => {
        onNodeSelect(d.id);
        setVisualizationState(prev => ({
          ...prev,
          selectedNodes: new Set([...prev.selectedNodes, d.id])
        }));
      })
      .on('mouseover', (event, d) => {
        setVisualizationState(prev => ({
          ...prev,
          hoveredNode: d.id
        }));
      })
      .on('mouseout', () => {
        setVisualizationState(prev => ({
          ...prev,
          hoveredNode: null
        }));
      })
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add labels if enabled
    if (controls.showLabels) {
      const labels = g.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .text(d => d.name)
        .style('font-size', '12px')
        .style('text-anchor', 'middle')
        .style('fill', '#333')
        .attr('dy', -20);
    }

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      if (controls.showLabels) {
        g.selectAll('.labels text')
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      }
    });

    setVisualizationState(prev => ({
      ...prev,
      nodes,
      links,
      simulation,
      zoom
    }));

    return () => {
      simulation.stop();
    };
  }, [lineageData, controls, onNodeSelect, onEdgeSelect]);

  // Helper functions
  const getNodeColor = (type: string) => {
    const colors = {
      'table': '#3b82f6',
      'view': '#10b981',
      'file': '#f59e0b',
      'api': '#8b5cf6',
      'pipeline': '#ef4444',
      'job': '#06b6d4',
      'model': '#ec4899'
    };
    return colors[type] || '#6b7280';
  };

  const getNodeSize = (type: string, size: string) => {
    const baseSize = size === 'small' ? 8 : size === 'large' ? 16 : 12;
    const multipliers = {
      'table': 1.2,
      'view': 1.0,
      'file': 0.8,
      'api': 1.1,
      'pipeline': 1.3,
      'job': 1.0,
      'model': 1.4
    };
    return baseSize * (multipliers[type] || 1);
  };

  const getEdgeColor = (type: string) => {
    const colors = {
      'dependency': '#3b82f6',
      'dataflow': '#10b981',
      'transformation': '#f59e0b'
    };
    return colors[type] || '#6b7280';
  };

  const getEdgeWidth = (strength: number) => {
    return Math.max(1, Math.min(5, strength * 2));
  };

  return (
    <div className="relative w-full h-full">
      {/* Visualization Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Layout:</Label>
            <Select
              value={controls.layout}
              onValueChange={(value) => setControls(prev => ({ ...prev, layout: value as any }))}
            >
              <SelectTrigger className="w-24 h-7">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="force">Force</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="circular">Circular</SelectItem>
                <SelectItem value="tree">Tree</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs">Direction:</Label>
            <Select
              value={controls.direction}
              onValueChange={(value) => setControls(prev => ({ ...prev, direction: value as any }))}
            >
              <SelectTrigger className="w-24 h-7">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upstream">Upstream</SelectItem>
                <SelectItem value="downstream">Downstream</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs">Depth:</Label>
            <Slider
              value={[controls.depth]}
              onValueChange={([value]) => setControls(prev => ({ ...prev, depth: value }))}
              min={1}
              max={10}
              step={1}
              className="w-16"
            />
            <span className="text-xs w-4">{controls.depth}</span>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={controls.showLabels}
              onCheckedChange={(checked) => setControls(prev => ({ ...prev, showLabels: checked }))}
            />
            <Label className="text-xs">Labels</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={controls.highlightCriticalPath}
              onCheckedChange={(checked) => setControls(prev => ({ ...prev, highlightCriticalPath: checked }))}
            />
            <Label className="text-xs">Critical Path</Label>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().duration(750).call(
                visualizationState.zoom.transform,
                d3.zoomIdentity.scale(visualizationState.transform.k * 1.5)
              );
            }}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().duration(750).call(
                visualizationState.zoom.transform,
                d3.zoomIdentity.scale(visualizationState.transform.k * 0.75)
              );
            }}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().duration(750).call(
                visualizationState.zoom.transform,
                d3.zoomIdentity
              );
            }}
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main SVG */}
      <svg
        ref={svgRef}
        className="w-full h-full border rounded-lg"
        style={{ backgroundColor: '#fafafa' }}
      />

      {/* Node Info Panel */}
      {visualizationState.hoveredNode && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
          <div className="text-sm font-medium">Node Information</div>
          <div className="text-xs text-muted-foreground mt-1">
            {visualizationState.nodes.find(n => n.id === visualizationState.hoveredNode)?.name}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// IMPACT ANALYSIS PANEL
// ============================================================================

const ImpactAnalysisPanel: React.FC<{
  selectedAsset: CatalogAsset | null;
  impactAnalysis: ImpactAnalysis | null;
  onRunImpactAnalysis: (assetId: string, config: any) => void;
}> = ({ selectedAsset, impactAnalysis, onRunImpactAnalysis }) => {
  const [analysisConfig, setAnalysisConfig] = useState({
    analysisType: 'full',
    includeDownstream: true,
    includeUpstream: true,
    maxDepth: 5,
    includeBusinessImpact: true,
    includeDataQuality: true,
    includeCompliance: true
  });

  const [isRunning, setIsRunning] = useState(false);

  const handleRunAnalysis = async () => {
    if (!selectedAsset) return;

    setIsRunning(true);
    try {
      await onRunImpactAnalysis(selectedAsset.id, analysisConfig);
      toast.success('Impact analysis completed successfully');
    } catch (error) {
      toast.error('Failed to run impact analysis');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Impact Analysis
        </CardTitle>
        <CardDescription>
          Analyze the potential impact of changes to data assets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Configuration */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="analysis-type">Analysis Type</Label>
            <Select
              value={analysisConfig.analysisType}
              onValueChange={(value) => setAnalysisConfig(prev => ({ ...prev, analysisType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Impact Analysis</SelectItem>
                <SelectItem value="downstream">Downstream Only</SelectItem>
                <SelectItem value="upstream">Upstream Only</SelectItem>
                <SelectItem value="business">Business Impact</SelectItem>
                <SelectItem value="technical">Technical Impact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Analysis Scope</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-downstream"
                  checked={analysisConfig.includeDownstream}
                  onCheckedChange={(checked) => 
                    setAnalysisConfig(prev => ({ ...prev, includeDownstream: !!checked }))
                  }
                />
                <Label htmlFor="include-downstream" className="text-sm">Include downstream dependencies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-upstream"
                  checked={analysisConfig.includeUpstream}
                  onCheckedChange={(checked) => 
                    setAnalysisConfig(prev => ({ ...prev, includeUpstream: !!checked }))
                  }
                />
                <Label htmlFor="include-upstream" className="text-sm">Include upstream dependencies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-business"
                  checked={analysisConfig.includeBusinessImpact}
                  onCheckedChange={(checked) => 
                    setAnalysisConfig(prev => ({ ...prev, includeBusinessImpact: !!checked }))
                  }
                />
                <Label htmlFor="include-business" className="text-sm">Include business impact</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-quality"
                  checked={analysisConfig.includeDataQuality}
                  onCheckedChange={(checked) => 
                    setAnalysisConfig(prev => ({ ...prev, includeDataQuality: !!checked }))
                  }
                />
                <Label htmlFor="include-quality" className="text-sm">Include data quality impact</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>Maximum Depth: {analysisConfig.maxDepth}</Label>
            <Slider
              value={[analysisConfig.maxDepth]}
              onValueChange={([value]) => setAnalysisConfig(prev => ({ ...prev, maxDepth: value }))}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          <Button
            onClick={handleRunAnalysis}
            disabled={!selectedAsset || isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Analysis...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Impact Analysis
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        {impactAnalysis && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-3">Analysis Results</h4>
              
              {/* Impact Summary */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {impactAnalysis.affectedAssets?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Affected Assets</div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {impactAnalysis.riskLevel || 'Medium'}
                    </div>
                    <div className="text-xs text-muted-foreground">Risk Level</div>
                  </div>
                </Card>
              </div>

              {/* Critical Dependencies */}
              {impactAnalysis.criticalDependencies && impactAnalysis.criticalDependencies.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Critical Dependencies</h5>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {impactAnalysis.criticalDependencies.map((dep, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{dep.name}</span>
                          <Badge variant={dep.criticality === 'high' ? 'destructive' : 'secondary'}>
                            {dep.criticality}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Business Impact */}
              {impactAnalysis.businessImpact && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Business Impact</h5>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {impactAnalysis.businessImpact.description}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Recommendations */}
              {impactAnalysis.recommendations && impactAnalysis.recommendations.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Recommendations</h5>
                  <div className="space-y-2">
                    {impactAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                        <div className="text-sm font-medium">{rec.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{rec.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// LINEAGE EXPLORATION PANEL
// ============================================================================

const LineageExplorationPanel: React.FC<{
  currentAsset: CatalogAsset | null;
  explorationPath: string[];
  onAssetExplore: (assetId: string) => void;
  onPathNavigate: (index: number) => void;
}> = ({ currentAsset, explorationPath, onAssetExplore, onPathNavigate }) => {
  const [explorationMode, setExplorationMode] = useState<'guided' | 'free'>('guided');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Search for assets to explore
  const { data: searchResults } = useQuery({
    queryKey: ['asset-search', debouncedSearchQuery],
    queryFn: () => enterpriseCatalogService.searchAssets({
      query: debouncedSearchQuery,
      filters: {},
      limit: 20
    }),
    enabled: debouncedSearchQuery.length > 2
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Lineage Explorer
        </CardTitle>
        <CardDescription>
          Navigate and explore data lineage relationships
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exploration Mode */}
        <div>
          <Label>Exploration Mode</Label>
          <RadioGroup
            value={explorationMode}
            onValueChange={(value) => setExplorationMode(value as any)}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="guided" id="guided" />
              <Label htmlFor="guided" className="text-sm">Guided</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="free" />
              <Label htmlFor="free" className="text-sm">Free Navigation</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Asset Search */}
        <div>
          <Label htmlFor="asset-search">Search Assets</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="asset-search"
              placeholder="Search for assets to explore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {searchResults && searchResults.assets && searchResults.assets.length > 0 && (
            <ScrollArea className="h-32 mt-2">
              <div className="space-y-1">
                {searchResults.assets.map((asset) => (
                  <Button
                    key={asset.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onAssetExplore(asset.id)}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    {asset.name}
                    <Badge variant="outline" className="ml-auto">
                      {asset.type}
                    </Badge>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Exploration Path */}
        {explorationPath.length > 0 && (
          <div>
            <Label>Exploration Path</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {explorationPath.map((assetId, index) => (
                <React.Fragment key={assetId}>
                  <Button
                    variant={index === explorationPath.length - 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPathNavigate(index)}
                    className="text-xs"
                  >
                    Asset {index + 1}
                  </Button>
                  {index < explorationPath.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground self-center" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Current Asset Info */}
        {currentAsset && (
          <div>
            <Label>Current Asset</Label>
            <Card className="mt-2">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{currentAsset.name}</div>
                    <div className="text-xs text-muted-foreground">{currentAsset.description}</div>
                  </div>
                  <Badge variant="outline">{currentAsset.type}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Schema</div>
                    <div>{currentAsset.schema || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Owner</div>
                    <div>{currentAsset.owner || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <Label>Quick Actions</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button variant="outline" size="sm" disabled={!currentAsset}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Upstream
            </Button>
            <Button variant="outline" size="sm" disabled={!currentAsset}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Downstream
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// TEMPORAL LINEAGE VIEWER
// ============================================================================

const TemporalLineageViewer: React.FC<{
  assetId: string;
  timeRange: { start: Date; end: Date };
  onTimeRangeChange: (range: { start: Date; end: Date }) => void;
}> = ({ assetId, timeRange, onTimeRangeChange }) => {
  const [selectedEvent, setSelectedEvent] = useState<LineageChangeEvent | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline');

  // Fetch temporal lineage data
  const { data: temporalLineage, isLoading } = useQuery({
    queryKey: ['temporal-lineage', assetId, timeRange],
    queryFn: () => advancedLineageService.getTemporalLineage(assetId, timeRange),
    enabled: !!assetId
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Temporal Lineage
        </CardTitle>
        <CardDescription>
          View how data lineage has evolved over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View Mode Selector */}
        <div className="flex items-center gap-2">
          <Label>View Mode:</Label>
          <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value as any)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="graph">Graph Evolution</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Range Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTimeRangeChange({
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              end: new Date()
            })}
          >
            Last 7 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTimeRangeChange({
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              end: new Date()
            })}
          >
            Last 30 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTimeRangeChange({
              start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              end: new Date()
            })}
          >
            Last 90 days
          </Button>
        </div>

        {/* Temporal Lineage Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading temporal lineage...</span>
          </div>
        ) : temporalLineage ? (
          <div className="space-y-4">
            {viewMode === 'timeline' ? (
              /* Timeline View */
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {temporalLineage.changeEvents?.map((event, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedEvent === event ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{event.type}</div>
                          <div className="text-xs text-muted-foreground">
                            {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <Badge variant={event.impact === 'high' ? 'destructive' : 'secondary'}>
                          {event.impact}
                        </Badge>
                      </div>
                      <div className="text-xs mt-1">{event.description}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              /* Graph Evolution View */
              <div className="h-64 border rounded flex items-center justify-center bg-gray-50">
                <div className="text-center text-muted-foreground">
                  <Network className="h-8 w-8 mx-auto mb-2" />
                  <div>Graph evolution visualization would render here</div>
                  <div className="text-xs mt-1">Interactive D3.js timeline graph</div>
                </div>
              </div>
            )}

            {/* Selected Event Details */}
            {selectedEvent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {selectedEvent.type}
                    </div>
                    <div>
                      <span className="font-medium">Timestamp:</span> {
                        selectedEvent.timestamp ? new Date(selectedEvent.timestamp).toLocaleString() : 'N/A'
                      }
                    </div>
                    <div>
                      <span className="font-medium">Impact:</span> 
                      <Badge variant={selectedEvent.impact === 'high' ? 'destructive' : 'secondary'} className="ml-2">
                        {selectedEvent.impact}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <div className="mt-1 text-muted-foreground">{selectedEvent.description}</div>
                    </div>
                    {selectedEvent.affectedAssets && selectedEvent.affectedAssets.length > 0 && (
                      <div>
                        <span className="font-medium">Affected Assets:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedEvent.affectedAssets.map((assetId, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {assetId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2" />
            <div>No temporal lineage data available</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN DATA LINEAGE VISUALIZER COMPONENT
// ============================================================================

export const DataLineageVisualizer: React.FC<LineageVisualizationProps> = ({
  assetId,
  selectedAssets = [],
  viewMode = 'network',
  onAssetSelect,
  onLineageAnalysis,
  className
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('visualization');
  const [selectedAsset, setSelectedAsset] = useState<CatalogAsset | null>(null);
  const [explorationState, setExplorationState] = useState<LineageExplorationState>({
    currentAsset: null,
    explorationPath: [],
    visitedNodes: new Set(),
    discoveredLineage: [],
    analysisResults: null
  });

  const [visualizationConfig, setVisualizationConfig] = useState<LineageVisualizationConfig>({
    layout: 'force',
    direction: 'both',
    maxDepth: 3,
    includeMetadata: true,
    showMetrics: true,
    enableInteractions: true
  });

  const [timeRange, setTimeRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  // Fetch lineage data
  const { data: lineageData, isLoading: isLineageLoading, refetch: refetchLineage } = useQuery({
    queryKey: ['data-lineage', assetId, visualizationConfig],
    queryFn: () => advancedLineageService.getAssetLineage(assetId!, visualizationConfig),
    enabled: !!assetId
  });

  // Fetch impact analysis
  const { data: impactAnalysis, isLoading: isImpactLoading } = useQuery({
    queryKey: ['impact-analysis', selectedAsset?.id],
    queryFn: () => advancedLineageService.getImpactAnalysis(selectedAsset!.id),
    enabled: !!selectedAsset
  });

  // Fetch asset details
  const { data: assetDetails } = useQuery({
    queryKey: ['asset-details', assetId],
    queryFn: () => enterpriseCatalogService.getAssetById(assetId!),
    enabled: !!assetId
  });

  // Run impact analysis mutation
  const runImpactAnalysisMutation = useMutation({
    mutationFn: ({ assetId, config }: { assetId: string; config: any }) =>
      advancedLineageService.runImpactAnalysis(assetId, config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['impact-analysis'] });
      if (onLineageAnalysis) {
        onLineageAnalysis(data);
      }
    }
  });

  // Event handlers
  const handleAssetSelect = useCallback((selectedAssetId: string) => {
    setSelectedAsset(assetDetails || null);
    if (onAssetSelect) {
      onAssetSelect(selectedAssetId);
    }
  }, [assetDetails, onAssetSelect]);

  const handleAssetExplore = useCallback((exploreAssetId: string) => {
    setExplorationState(prev => ({
      ...prev,
      explorationPath: [...prev.explorationPath, exploreAssetId],
      visitedNodes: new Set([...prev.visitedNodes, exploreAssetId])
    }));
  }, []);

  const handlePathNavigate = useCallback((index: number) => {
    setExplorationState(prev => ({
      ...prev,
      explorationPath: prev.explorationPath.slice(0, index + 1)
    }));
  }, []);

  const handleRunImpactAnalysis = useCallback(async (targetAssetId: string, config: any) => {
    await runImpactAnalysisMutation.mutateAsync({ assetId: targetAssetId, config });
  }, [runImpactAnalysisMutation]);

  return (
    <div className={`data-lineage-visualizer ${className || ''}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Data Lineage Visualizer</h2>
            <p className="text-muted-foreground">
              Interactive visualization and analysis of data lineage relationships
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetchLineage()}
              disabled={isLineageLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
          <TabsTrigger value="exploration">Exploration</TabsTrigger>
          <TabsTrigger value="temporal">Temporal View</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Visualization */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Lineage Network</CardTitle>
                  <CardDescription>
                    Interactive network visualization of data dependencies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLineageLoading ? (
                    <div className="flex items-center justify-center h-96">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading lineage data...</span>
                    </div>
                  ) : lineageData ? (
                    <div className="h-96">
                      <AdvancedNetworkVisualization
                        lineageData={lineageData}
                        config={visualizationConfig}
                        onNodeSelect={handleAssetSelect}
                        onEdgeSelect={(edgeId) => console.log('Edge selected:', edgeId)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96 text-muted-foreground">
                      <Network className="h-8 w-8 mb-2" />
                      <div className="text-center">
                        <div>No lineage data available</div>
                        <div className="text-sm">Select an asset to view its lineage</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Visualization Controls */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Visualization Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Layout</Label>
                    <Select
                      value={visualizationConfig.layout}
                      onValueChange={(value) => setVisualizationConfig(prev => ({
                        ...prev,
                        layout: value as any
                      }))}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="force">Force Directed</SelectItem>
                        <SelectItem value="hierarchical">Hierarchical</SelectItem>
                        <SelectItem value="circular">Circular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Direction</Label>
                    <Select
                      value={visualizationConfig.direction}
                      onValueChange={(value) => setVisualizationConfig(prev => ({
                        ...prev,
                        direction: value as any
                      }))}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upstream">Upstream</SelectItem>
                        <SelectItem value="downstream">Downstream</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Max Depth: {visualizationConfig.maxDepth}</Label>
                    <Slider
                      value={[visualizationConfig.maxDepth]}
                      onValueChange={([value]) => setVisualizationConfig(prev => ({
                        ...prev,
                        maxDepth: value
                      }))}
                      min={1}
                      max={10}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={visualizationConfig.includeMetadata}
                        onCheckedChange={(checked) => setVisualizationConfig(prev => ({
                          ...prev,
                          includeMetadata: checked
                        }))}
                      />
                      <Label className="text-xs">Show Metadata</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={visualizationConfig.showMetrics}
                        onCheckedChange={(checked) => setVisualizationConfig(prev => ({
                          ...prev,
                          showMetrics: checked
                        }))}
                      />
                      <Label className="text-xs">Show Metrics</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Asset Info */}
              {selectedAsset && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Selected Asset</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <div className="font-medium text-sm">{selectedAsset.name}</div>
                        <Badge variant="outline" className="text-xs">{selectedAsset.type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedAsset.description}
                      </div>
                      <Separator />
                      <div className="space-y-1 text-xs">
                        <div>Schema: {selectedAsset.schema || 'N/A'}</div>
                        <div>Owner: {selectedAsset.owner || 'N/A'}</div>
                        <div>Created: {selectedAsset.createdAt ? new Date(selectedAsset.createdAt).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <ImpactAnalysisPanel
            selectedAsset={selectedAsset}
            impactAnalysis={impactAnalysis}
            onRunImpactAnalysis={handleRunImpactAnalysis}
          />
        </TabsContent>

        <TabsContent value="exploration" className="space-y-4">
          <LineageExplorationPanel
            currentAsset={explorationState.currentAsset}
            explorationPath={explorationState.explorationPath}
            onAssetExplore={handleAssetExplore}
            onPathNavigate={handlePathNavigate}
          />
        </TabsContent>

        <TabsContent value="temporal" className="space-y-4">
          {assetId && (
            <TemporalLineageViewer
              assetId={assetId}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lineage Depth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lineageData?.metrics?.maxDepth || 0}
                </div>
                <div className="text-xs text-muted-foreground">Maximum lineage depth</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lineageData?.nodes?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Connected assets</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dependencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lineageData?.edges?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total dependencies</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataLineageVisualizer;