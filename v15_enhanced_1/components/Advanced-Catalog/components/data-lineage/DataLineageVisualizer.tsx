// ============================================================================
// DATA LINEAGE VISUALIZER - INTERACTIVE LINEAGE VISUALIZATION (2600+ LINES)
// ============================================================================
// Enterprise Data Governance System - Advanced Data Lineage Component
// Interactive network visualization, real-time lineage tracking, impact analysis,
// automated lineage discovery, temporal lineage evolution, and collaborative annotations
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import * as d3 from 'd3';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';

// ============================================================================
// SHADCN/UI IMPORTS
// ============================================================================
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { AlertCircle, Activity, BarChart3, Brain, ChevronDown, ChevronRight, Clock, Database, Download, Eye, Filter, GitBranch, Globe, Home, Info, Layers, LineChart, MapPin, Network, Play, Plus, RefreshCw, Save, Search, Settings, Share2, Target, Trash2, TrendingUp, Users, Zap, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Move, Square, Circle, Triangle, Hexagon, Star, Bookmark, Bell, MessageCircle, Tag, Link, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronUp, MoreHorizontal, Edit, Copy, ExternalLink, FileText, Image, Video, Music, Archive, Code, Table, PieChart, TreePine, Workflow } from 'lucide-react';

// ============================================================================
// TYPE IMPORTS AND INTERFACES
// ============================================================================
import {
  // Core Types
  DataAsset,
  AssetMetadata,
  AssetType,
  DataSourceConfig,
  LineageRelationship,
  LineageNode,
  LineageEdge,
  LineageGraph,
  ImpactAnalysis,
  LineageVisualizationConfig,
  
  // Search and Discovery
  SearchQuery,
  SearchResult,
  SearchFilters,
  
  // Quality and Compliance
  QualityMetrics,
  ComplianceStatus,
  
  // Collaboration
  Annotation,
  Comment,
  Tag,
  
  // Temporal
  TemporalLineage,
  LineageSnapshot,
  ChangeEvent,
  
  // Advanced Features
  AIRecommendation,
  SmartInsight,
  AutomatedDiscovery,
  
  // API Response Types
  ApiResponse,
  PaginatedResponse,
  ErrorResponse
} from '../../types/catalog-core.types';

// ============================================================================
// SERVICE IMPORTS
// ============================================================================
import {
  enterpriseCatalogService,
  lineageService,
  searchService,
  qualityService,
  collaborationService,
  analyticsService,
  aiService
} from '../../services/enterprise-catalog.service';

// ============================================================================
// CONSTANTS AND CONFIGURATIONS
// ============================================================================
const LINEAGE_VISUALIZATION_TYPES = {
  NETWORK: 'network',
  HIERARCHICAL: 'hierarchical',
  FORCE_DIRECTED: 'force-directed',
  LAYERED: 'layered',
  CIRCULAR: 'circular',
  RADIAL: 'radial'
} as const;

const NODE_TYPES = {
  TABLE: 'table',
  VIEW: 'view',
  STORED_PROCEDURE: 'stored_procedure',
  FUNCTION: 'function',
  DATASET: 'dataset',
  REPORT: 'report',
  DASHBOARD: 'dashboard',
  ML_MODEL: 'ml_model',
  API: 'api',
  FILE: 'file',
  STREAM: 'stream',
  QUEUE: 'queue'
} as const;

const EDGE_TYPES = {
  DIRECT: 'direct',
  TRANSFORMATION: 'transformation',
  AGGREGATION: 'aggregation',
  JOIN: 'join',
  UNION: 'union',
  FILTER: 'filter',
  SORT: 'sort',
  GROUP_BY: 'group_by',
  PIVOT: 'pivot',
  UNPIVOT: 'unpivot',
  WINDOW_FUNCTION: 'window_function',
  SUBQUERY: 'subquery'
} as const;

const IMPACT_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  MINIMAL: 'minimal'
} as const;

const LINEAGE_DEPTH_OPTIONS = [1, 2, 3, 4, 5, 10, 'unlimited'] as const;

const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  layout: 1000
} as const;

// ============================================================================
// EXTENDED INTERFACES FOR LINEAGE VISUALIZATION
// ============================================================================
interface LineageVisualizationProps {
  assetId?: string;
  initialView?: keyof typeof LINEAGE_VISUALIZATION_TYPES;
  maxDepth?: number;
  showImpactAnalysis?: boolean;
  enableRealTimeUpdates?: boolean;
  enableCollaboration?: boolean;
  onNodeSelect?: (node: LineageNode) => void;
  onEdgeSelect?: (edge: LineageEdge) => void;
  onImpactAnalysis?: (analysis: ImpactAnalysis) => void;
  className?: string;
}

interface LineageGraphState {
  nodes: LineageNode[];
  edges: LineageEdge[];
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  hoveredNode: string | null;
  hoveredEdge: string | null;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  layoutAlgorithm: keyof typeof LINEAGE_VISUALIZATION_TYPES;
  filterState: LineageFilterState;
  temporalState: TemporalLineageState;
}

interface LineageFilterState {
  nodeTypes: Set<keyof typeof NODE_TYPES>;
  edgeTypes: Set<keyof typeof EDGE_TYPES>;
  impactLevels: Set<keyof typeof IMPACT_LEVELS>;
  timeRange: { start: Date; end: Date };
  searchQuery: string;
  showOnlyChanged: boolean;
  hideOrphanNodes: boolean;
}

interface TemporalLineageState {
  enabled: boolean;
  currentTimestamp: Date;
  availableSnapshots: LineageSnapshot[];
  selectedSnapshot: string | null;
  autoPlay: boolean;
  playbackSpeed: number;
}

interface NodeClusterData {
  id: string;
  label: string;
  nodes: LineageNode[];
  color: string;
  size: number;
  position: { x: number; y: number };
}

interface LineageMetrics {
  totalNodes: number;
  totalEdges: number;
  longestPath: number;
  complexityScore: number;
  clusteringCoefficient: number;
  centralityMetrics: {
    betweenness: Record<string, number>;
    closeness: Record<string, number>;
    degree: Record<string, number>;
    eigenvector: Record<string, number>;
  };
}

// ============================================================================
// D3.JS GRAPH VISUALIZATION COMPONENT
// ============================================================================
const D3LineageGraph = forwardRef<any, {
  data: LineageGraph;
  config: LineageVisualizationConfig;
  onNodeClick: (node: LineageNode) => void;
  onEdgeClick: (edge: LineageEdge) => void;
  onNodeHover: (node: LineageNode | null) => void;
  onEdgeHover: (edge: LineageEdge | null) => void;
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  className?: string;
}>((props, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<LineageNode, LineageEdge> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // D3 Scales and Layout
  const colorScale = useMemo(() => {
    return d3.scaleOrdinal()
      .domain(Object.values(NODE_TYPES))
      .range(d3.schemeCategory10);
  }, []);

  const sizeScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, d3.max(props.data.nodes, d => d.importance || 1) || 1])
      .range([8, 32]);
  }, [props.data.nodes]);

  // Initialize D3 Visualization
  useEffect(() => {
    if (!svgRef.current || !props.data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create main group for zoom/pan
    const g = svg.append('g').attr('class', 'zoom-group');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Create force simulation
    const simulation = d3.forceSimulation<LineageNode>(props.data.nodes)
      .force('link', d3.forceLink<LineageNode, LineageEdge>(props.data.edges)
        .id(d => d.id)
        .distance(d => 100 + (d.strength || 1) * 50))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => sizeScale(d.importance || 1) + 5));

    simulationRef.current = simulation;

    // Create arrow markers for directed edges
    const defs = g.append('defs');
    
    Object.values(EDGE_TYPES).forEach(edgeType => {
      defs.append('marker')
        .attr('id', `arrow-${edgeType}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('class', `arrow arrow-${edgeType}`);
    });

    // Create edge groups
    const edgeGroup = g.append('g').attr('class', 'edges');
    const edges = edgeGroup
      .selectAll('.edge')
      .data(props.data.edges)
      .enter()
      .append('g')
      .attr('class', 'edge-group');

    // Edge paths
    const edgePaths = edges
      .append('path')
      .attr('class', d => `edge edge-${d.type}`)
      .attr('marker-end', d => `url(#arrow-${d.type})`)
      .style('stroke', d => d.color || '#999')
      .style('stroke-width', d => Math.max(1, (d.strength || 1) * 2))
      .style('fill', 'none')
      .style('opacity', 0.6);

    // Edge labels
    const edgeLabels = edges
      .append('text')
      .attr('class', 'edge-label')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(d => d.label || d.type);

    // Create node groups
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodes = nodeGroup
      .selectAll('.node')
      .data(props.data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .call(d3.drag<SVGGElement, LineageNode>()
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

    // Node circles
    const nodeCircles = nodes
      .append('circle')
      .attr('class', d => `node node-${d.type}`)
      .attr('r', d => sizeScale(d.importance || 1))
      .style('fill', d => colorScale(d.type) as string)
      .style('stroke', '#fff')
      .style('stroke-width', '2px');

    // Node labels
    const nodeLabels = nodes
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(d => d.label || d.name);

    // Node icons (based on type)
    const nodeIcons = nodes
      .append('text')
      .attr('class', 'node-icon')
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('font-family', 'FontAwesome')
      .style('font-size', '14px')
      .style('fill', '#fff')
      .text(d => getNodeIcon(d.type));

    // Event handlers
    nodes
      .on('click', (event, d) => {
        event.stopPropagation();
        props.onNodeClick(d);
      })
      .on('mouseenter', (event, d) => {
        props.onNodeHover(d);
      })
      .on('mouseleave', () => {
        props.onNodeHover(null);
      });

    edges
      .on('click', (event, d) => {
        event.stopPropagation();
        props.onEdgeClick(d);
      })
      .on('mouseenter', (event, d) => {
        props.onEdgeHover(d);
      })
      .on('mouseleave', () => {
        props.onEdgeHover(null);
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      edgePaths
        .attr('d', d => {
          const dx = (d.target as LineageNode).x! - (d.source as LineageNode).x!;
          const dy = (d.target as LineageNode).y! - (d.source as LineageNode).y!;
          const dr = Math.sqrt(dx * dx + dy * dy);
          return `M${(d.source as LineageNode).x},${(d.source as LineageNode).y}A${dr},${dr} 0 0,1 ${(d.target as LineageNode).x},${(d.target as LineageNode).y}`;
        });

      edgeLabels
        .attr('x', d => ((d.source as LineageNode).x! + (d.target as LineageNode).x!) / 2)
        .attr('y', d => ((d.source as LineageNode).y! + (d.target as LineageNode).y!) / 2);

      nodes
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Update selections
    nodeCircles
      .classed('selected', d => props.selectedNodes.has(d.id))
      .style('stroke-width', d => props.selectedNodes.has(d.id) ? '4px' : '2px');

    edgePaths
      .classed('selected', d => props.selectedEdges.has(d.id))
      .style('stroke-width', d => props.selectedEdges.has(d.id) ? 
        Math.max(3, (d.strength || 1) * 3) : 
        Math.max(1, (d.strength || 1) * 2));

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [props.data, dimensions, props.selectedNodes, props.selectedEdges, colorScale, sizeScale]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Imperative methods
  useImperativeHandle(ref, () => ({
    fitToView: () => {
      if (!svgRef.current || !zoomRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const bounds = svg.select('.zoom-group').node()?.getBBox();
      
      if (bounds) {
        const { width, height } = dimensions;
        const scale = Math.min(width / bounds.width, height / bounds.height) * 0.9;
        const translate = [
          (width - scale * (bounds.x + bounds.width / 2)) / scale,
          (height - scale * (bounds.y + bounds.height / 2)) / scale
        ];
        
        svg.transition().duration(750).call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
      }
    },
    
    centerOnNode: (nodeId: string) => {
      const node = props.data.nodes.find(n => n.id === nodeId);
      if (!node || !svgRef.current || !zoomRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const { width, height } = dimensions;
      const scale = 1.5;
      const translate = [
        (width / 2 - scale * (node.x || 0)) / scale,
        (height / 2 - scale * (node.y || 0)) / scale
      ];
      
      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
    },
    
    highlightPath: (nodeIds: string[]) => {
      const svg = d3.select(svgRef.current);
      
      // Reset all elements
      svg.selectAll('.node').classed('highlighted', false).classed('dimmed', true);
      svg.selectAll('.edge').classed('highlighted', false).classed('dimmed', true);
      
      // Highlight path nodes
      svg.selectAll('.node')
        .filter((d: any) => nodeIds.includes(d.id))
        .classed('highlighted', true)
        .classed('dimmed', false);
      
      // Highlight path edges
      svg.selectAll('.edge')
        .filter((d: any) => {
          const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
          const targetId = typeof d.target === 'object' ? d.target.id : d.target;
          return nodeIds.includes(sourceId) && nodeIds.includes(targetId);
        })
        .classed('highlighted', true)
        .classed('dimmed', false);
    },
    
    resetHighlight: () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll('.node, .edge')
        .classed('highlighted', false)
        .classed('dimmed', false);
    }
  }));

  // Helper function to get node icon
  const getNodeIcon = (nodeType: keyof typeof NODE_TYPES): string => {
    const iconMap = {
      [NODE_TYPES.TABLE]: '📊',
      [NODE_TYPES.VIEW]: '👁️',
      [NODE_TYPES.STORED_PROCEDURE]: '⚙️',
      [NODE_TYPES.FUNCTION]: '🔧',
      [NODE_TYPES.DATASET]: '📈',
      [NODE_TYPES.REPORT]: '📋',
      [NODE_TYPES.DASHBOARD]: '📊',
      [NODE_TYPES.ML_MODEL]: '🤖',
      [NODE_TYPES.API]: '🔌',
      [NODE_TYPES.FILE]: '📄',
      [NODE_TYPES.STREAM]: '🌊',
      [NODE_TYPES.QUEUE]: '📬'
    };
    return iconMap[nodeType] || '📦';
  };

  return (
    <div className={`relative w-full h-full ${props.className || ''}`}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="border border-gray-200 rounded-lg bg-gray-50"
      />
    </div>
  );
});

D3LineageGraph.displayName = 'D3LineageGraph';

// ============================================================================
// LINEAGE CONTROL PANEL COMPONENT
// ============================================================================
const LineageControlPanel: React.FC<{
  config: LineageVisualizationConfig;
  onConfigChange: (config: Partial<LineageVisualizationConfig>) => void;
  graphRef: React.RefObject<any>;
  onResetView: () => void;
  onExport: (format: string) => void;
}> = ({ config, onConfigChange, graphRef, onResetView, onExport }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Visualization Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Layout Algorithm */}
        <div className="space-y-2">
          <Label>Layout Algorithm</Label>
          <Select
            value={config.layoutAlgorithm}
            onValueChange={(value) => onConfigChange({ layoutAlgorithm: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="force-directed">Force Directed</SelectItem>
              <SelectItem value="hierarchical">Hierarchical</SelectItem>
              <SelectItem value="circular">Circular</SelectItem>
              <SelectItem value="layered">Layered</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Zoom and Pan Controls */}
        <div className="space-y-2">
          <Label>View Controls</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => graphRef.current?.fitToView()}
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Fit to View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetView}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Node Filtering */}
        <div className="space-y-2">
          <Label>Node Types</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(NODE_TYPES).map(nodeType => (
              <div key={nodeType} className="flex items-center space-x-2">
                <Checkbox
                  id={`node-${nodeType}`}
                  checked={config.visibleNodeTypes?.includes(nodeType)}
                  onCheckedChange={(checked) => {
                    const current = config.visibleNodeTypes || [];
                    const updated = checked
                      ? [...current, nodeType]
                      : current.filter(t => t !== nodeType);
                    onConfigChange({ visibleNodeTypes: updated });
                  }}
                />
                <Label htmlFor={`node-${nodeType}`} className="text-sm">
                  {nodeType.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Edge Filtering */}
        <div className="space-y-2">
          <Label>Edge Types</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(EDGE_TYPES).map(edgeType => (
              <div key={edgeType} className="flex items-center space-x-2">
                <Checkbox
                  id={`edge-${edgeType}`}
                  checked={config.visibleEdgeTypes?.includes(edgeType)}
                  onCheckedChange={(checked) => {
                    const current = config.visibleEdgeTypes || [];
                    const updated = checked
                      ? [...current, edgeType]
                      : current.filter(t => t !== edgeType);
                    onConfigChange({ visibleEdgeTypes: updated });
                  }}
                />
                <Label htmlFor={`edge-${edgeType}`} className="text-sm">
                  {edgeType.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Depth Control */}
        <div className="space-y-2">
          <Label>Lineage Depth</Label>
          <Select
            value={config.maxDepth?.toString() || 'unlimited'}
            onValueChange={(value) => onConfigChange({ 
              maxDepth: value === 'unlimited' ? undefined : parseInt(value) 
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LINEAGE_DEPTH_OPTIONS.map(depth => (
                <SelectItem key={depth} value={depth.toString()}>
                  {depth === 'unlimited' ? 'Unlimited' : `${depth} levels`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Animation Speed */}
        <div className="space-y-2">
          <Label>Animation Speed</Label>
          <Slider
            value={[config.animationSpeed || 1]}
            onValueChange={([value]) => onConfigChange({ animationSpeed: value })}
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
          />
          <div className="text-sm text-gray-500">
            {((config.animationSpeed || 1) * 100).toFixed(0)}%
          </div>
        </div>

        {/* Export Options */}
        <Separator />
        <div className="space-y-2">
          <Label>Export</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('svg')}
            >
              <Download className="h-4 w-4 mr-1" />
              SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('png')}
            >
              <Download className="h-4 w-4 mr-1" />
              PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('json')}
            >
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// IMPACT ANALYSIS PANEL COMPONENT
// ============================================================================
const ImpactAnalysisPanel: React.FC<{
  analysis: ImpactAnalysis | null;
  isLoading: boolean;
  onAnalyzeImpact: (nodeId: string, changeType: string) => void;
  selectedNode: LineageNode | null;
}> = ({ analysis, isLoading, onAnalyzeImpact, selectedNode }) => {
  const [changeType, setChangeType] = useState('schema_change');

  return (
    <Card className="w-full">
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
        {selectedNode ? (
          <>
            <div className="space-y-2">
              <Label>Selected Asset</Label>
              <div className="p-2 bg-gray-50 rounded border">
                <div className="font-medium">{selectedNode.label}</div>
                <div className="text-sm text-gray-500">{selectedNode.type}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Change Type</Label>
              <Select value={changeType} onValueChange={setChangeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="schema_change">Schema Change</SelectItem>
                  <SelectItem value="data_type_change">Data Type Change</SelectItem>
                  <SelectItem value="column_removal">Column Removal</SelectItem>
                  <SelectItem value="table_removal">Table Removal</SelectItem>
                  <SelectItem value="permission_change">Permission Change</SelectItem>
                  <SelectItem value="location_change">Location Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => onAnalyzeImpact(selectedNode.id, changeType)}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Analyze Impact
            </Button>

            {analysis && (
              <div className="space-y-4 mt-4">
                <Separator />
                
                {/* Impact Summary */}
                <div className="space-y-2">
                  <Label>Impact Summary</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-3">
                      <div className="text-2xl font-bold text-red-600">
                        {analysis.affectedAssets?.length || 0}
                      </div>
                      <div className="text-sm text-gray-500">Affected Assets</div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-2xl font-bold text-orange-600">
                        {analysis.impactLevel}
                      </div>
                      <div className="text-sm text-gray-500">Impact Level</div>
                    </Card>
                  </div>
                </div>

                {/* Affected Assets */}
                {analysis.affectedAssets && analysis.affectedAssets.length > 0 && (
                  <div className="space-y-2">
                    <Label>Affected Assets</Label>
                    <ScrollArea className="h-48 border rounded">
                      <div className="p-2 space-y-2">
                        {analysis.affectedAssets.map((asset, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium">{asset.name}</div>
                              <div className="text-sm text-gray-500">{asset.type}</div>
                            </div>
                            <Badge variant={
                              asset.impactLevel === 'critical' ? 'destructive' :
                              asset.impactLevel === 'high' ? 'default' :
                              'secondary'
                            }>
                              {asset.impactLevel}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <Label>Recommendations</Label>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="font-medium text-blue-900">{rec.title}</div>
                          <div className="text-sm text-blue-700">{rec.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Select a node in the lineage graph to analyze its impact
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// TEMPORAL LINEAGE COMPONENT
// ============================================================================
const TemporalLineageControl: React.FC<{
  temporalState: TemporalLineageState;
  onTemporalStateChange: (state: Partial<TemporalLineageState>) => void;
  onLoadSnapshot: (snapshotId: string) => void;
}> = ({ temporalState, onTemporalStateChange, onLoadSnapshot }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (temporalState.autoPlay && isPlaying && temporalState.availableSnapshots.length > 0) {
      const currentIndex = temporalState.availableSnapshots.findIndex(
        s => s.id === temporalState.selectedSnapshot
      );
      
      playIntervalRef.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % temporalState.availableSnapshots.length;
        const nextSnapshot = temporalState.availableSnapshots[nextIndex];
        onLoadSnapshot(nextSnapshot.id);
      }, 1000 / temporalState.playbackSpeed);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, temporalState, onLoadSnapshot]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    onTemporalStateChange({ autoPlay: !isPlaying });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Temporal Lineage
        </CardTitle>
        <CardDescription>
          View lineage evolution over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Temporal Mode */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={temporalState.enabled}
            onCheckedChange={(enabled) => onTemporalStateChange({ enabled })}
          />
          <Label>Enable Temporal View</Label>
        </div>

        {temporalState.enabled && (
          <>
            {/* Timeline Control */}
            <div className="space-y-2">
              <Label>Timeline</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex-1">
                  <Slider
                    value={[temporalState.availableSnapshots.findIndex(
                      s => s.id === temporalState.selectedSnapshot
                    )]}
                    onValueChange={([index]) => {
                      const snapshot = temporalState.availableSnapshots[index];
                      if (snapshot) {
                        onLoadSnapshot(snapshot.id);
                      }
                    }}
                    min={0}
                    max={temporalState.availableSnapshots.length - 1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Playback Speed */}
            <div className="space-y-2">
              <Label>Playback Speed</Label>
              <Slider
                value={[temporalState.playbackSpeed]}
                onValueChange={([speed]) => onTemporalStateChange({ playbackSpeed: speed })}
                min={0.25}
                max={4}
                step={0.25}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                {temporalState.playbackSpeed}x speed
              </div>
            </div>

            {/* Current Timestamp */}
            {temporalState.selectedSnapshot && (
              <div className="space-y-2">
                <Label>Current Snapshot</Label>
                <div className="p-2 bg-gray-50 rounded border text-sm">
                  {new Date(temporalState.currentTimestamp).toLocaleString()}
                </div>
              </div>
            )}

            {/* Snapshot List */}
            <div className="space-y-2">
              <Label>Available Snapshots</Label>
              <ScrollArea className="h-32 border rounded">
                <div className="p-2 space-y-1">
                  {temporalState.availableSnapshots.map((snapshot) => (
                    <Button
                      key={snapshot.id}
                      variant={snapshot.id === temporalState.selectedSnapshot ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onLoadSnapshot(snapshot.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">
                          {new Date(snapshot.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {snapshot.description || 'No description'}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// LINEAGE METRICS DASHBOARD
// ============================================================================
const LineageMetricsDashboard: React.FC<{
  metrics: LineageMetrics | null;
  isLoading: boolean;
}> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Lineage Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Lineage Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-500 py-8">
          No metrics available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Lineage Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-3">
            <div className="text-2xl font-bold">{metrics.totalNodes}</div>
            <div className="text-sm text-gray-500">Total Nodes</div>
          </Card>
          <Card className="p-3">
            <div className="text-2xl font-bold">{metrics.totalEdges}</div>
            <div className="text-sm text-gray-500">Total Edges</div>
          </Card>
          <Card className="p-3">
            <div className="text-2xl font-bold">{metrics.longestPath}</div>
            <div className="text-sm text-gray-500">Longest Path</div>
          </Card>
          <Card className="p-3">
            <div className="text-2xl font-bold">{metrics.complexityScore.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Complexity Score</div>
          </Card>
        </div>

        {/* Centrality Metrics */}
        <div className="space-y-2">
          <Label>Top Nodes by Centrality</Label>
          <Tabs defaultValue="degree" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="degree">Degree</TabsTrigger>
              <TabsTrigger value="betweenness">Betweenness</TabsTrigger>
              <TabsTrigger value="closeness">Closeness</TabsTrigger>
              <TabsTrigger value="eigenvector">Eigenvector</TabsTrigger>
            </TabsList>
            
            {Object.entries(metrics.centralityMetrics).map(([type, values]) => (
              <TabsContent key={type} value={type} className="space-y-2">
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {Object.entries(values)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([nodeId, value]) => (
                        <div key={nodeId} className="flex justify-between items-center p-2 border rounded">
                          <span className="font-medium truncate">{nodeId}</span>
                          <Badge variant="outline">{value.toFixed(3)}</Badge>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Clustering Coefficient */}
        <div className="space-y-2">
          <Label>Network Analysis</Label>
          <div className="p-3 border rounded">
            <div className="flex justify-between items-center">
              <span>Clustering Coefficient</span>
              <Badge variant="outline">{metrics.clusteringCoefficient.toFixed(3)}</Badge>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Measures how connected nodes are to their neighbors
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// NODE DETAILS PANEL
// ============================================================================
const NodeDetailsPanel: React.FC<{
  node: LineageNode | null;
  onClose: () => void;
  onAddAnnotation: (nodeId: string, annotation: Partial<Annotation>) => void;
}> = ({ node, onClose, onAddAnnotation }) => {
  const [newAnnotation, setNewAnnotation] = useState('');
  const [annotationType, setAnnotationType] = useState<'note' | 'warning' | 'issue'>('note');

  if (!node) return null;

  const handleAddAnnotation = () => {
    if (newAnnotation.trim()) {
      onAddAnnotation(node.id, {
        content: newAnnotation,
        type: annotationType,
        timestamp: new Date()
      });
      setNewAnnotation('');
    }
  };

  return (
    <Sheet open={!!node} onOpenChange={() => onClose()}>
      <SheetContent className="w-96 sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {node.label || node.name}
          </SheetTitle>
          <SheetDescription>
            {node.type} • {node.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Basic Information</Label>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Type</span>
                <Badge>{node.type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Importance</span>
                <Badge variant="outline">{node.importance || 1}</Badge>
              </div>
              {node.description && (
                <div>
                  <span className="text-sm text-gray-500">Description</span>
                  <p className="text-sm mt-1">{node.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          {node.metadata && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Metadata</Label>
              <div className="space-y-2">
                {Object.entries(node.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {node.tags && node.tags.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {node.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quality Metrics */}
          {node.qualityMetrics && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Quality Metrics</Label>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Quality Score</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={node.qualityMetrics.overallScore * 100}
                      className="w-16 h-2"
                    />
                    <span className="text-sm font-medium">
                      {(node.qualityMetrics.overallScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                {node.qualityMetrics.completeness !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Completeness</span>
                    <Badge variant="outline">
                      {(node.qualityMetrics.completeness * 100).toFixed(1)}%
                    </Badge>
                  </div>
                )}
                {node.qualityMetrics.accuracy !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Accuracy</span>
                    <Badge variant="outline">
                      {(node.qualityMetrics.accuracy * 100).toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Annotations */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Annotations</Label>
            
            {/* Existing Annotations */}
            {node.annotations && node.annotations.length > 0 && (
              <ScrollArea className="h-32 border rounded p-2">
                <div className="space-y-2">
                  {node.annotations.map((annotation, index) => (
                    <div key={index} className={`p-2 rounded border-l-4 ${
                      annotation.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                      annotation.type === 'issue' ? 'border-l-red-500 bg-red-50' :
                      'border-l-blue-500 bg-blue-50'
                    }`}>
                      <div className="text-sm">{annotation.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(annotation.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Add New Annotation */}
            <div className="space-y-2">
              <Select value={annotationType} onValueChange={(value: any) => setAnnotationType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="issue">Issue</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Add an annotation..."
                value={newAnnotation}
                onChange={(e) => setNewAnnotation(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddAnnotation} size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Annotation
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// MAIN DATA LINEAGE VISUALIZER COMPONENT
// ============================================================================
const DataLineageVisualizer: React.FC<LineageVisualizationProps> = ({
  assetId,
  initialView = 'force-directed',
  maxDepth = 3,
  showImpactAnalysis = true,
  enableRealTimeUpdates = true,
  enableCollaboration = true,
  onNodeSelect,
  onEdgeSelect,
  onImpactAnalysis,
  className
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const queryClient = useQueryClient();
  const graphRef = useRef<any>(null);

  // Core State
  const [graphState, setGraphState] = useState<LineageGraphState>({
    nodes: [],
    edges: [],
    selectedNodes: new Set(),
    selectedEdges: new Set(),
    hoveredNode: null,
    hoveredEdge: null,
    zoomLevel: 1,
    panOffset: { x: 0, y: 0 },
    layoutAlgorithm: initialView,
    filterState: {
      nodeTypes: new Set(Object.values(NODE_TYPES)),
      edgeTypes: new Set(Object.values(EDGE_TYPES)),
      impactLevels: new Set(Object.values(IMPACT_LEVELS)),
      timeRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      searchQuery: '',
      showOnlyChanged: false,
      hideOrphanNodes: false
    },
    temporalState: {
      enabled: false,
      currentTimestamp: new Date(),
      availableSnapshots: [],
      selectedSnapshot: null,
      autoPlay: false,
      playbackSpeed: 1
    }
  });

  // UI State
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<LineageEdge | null>(null);
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [showImpactPanel, setShowImpactPanel] = useState(showImpactAnalysis);
  const [showTemporalPanel, setShowTemporalPanel] = useState(false);
  const [showMetricsPanel, setShowMetricsPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useDebounce('', 300);

  // Configuration
  const [visualizationConfig, setVisualizationConfig] = useState<LineageVisualizationConfig>({
    layoutAlgorithm: initialView,
    maxDepth,
    showLabels: true,
    showIcons: true,
    enableAnimations: true,
    animationSpeed: 1,
    nodeSize: 'importance',
    edgeWidth: 'strength',
    colorScheme: 'type',
    visibleNodeTypes: Object.values(NODE_TYPES),
    visibleEdgeTypes: Object.values(EDGE_TYPES)
  });

  // ============================================================================
  // DATA FETCHING WITH REACT QUERY
  // ============================================================================

  // Fetch main lineage data
  const {
    data: lineageData,
    isLoading: isLoadingLineage,
    error: lineageError,
    refetch: refetchLineage
  } = useQuery({
    queryKey: ['lineage', assetId, visualizationConfig.maxDepth, graphState.filterState],
    queryFn: async () => {
      if (!assetId) return { nodes: [], edges: [] };
      
      const response = await lineageService.getAssetLineage(assetId, {
        maxDepth: visualizationConfig.maxDepth,
        includeUpstream: true,
        includeDownstream: true,
        nodeTypes: Array.from(graphState.filterState.nodeTypes),
        edgeTypes: Array.from(graphState.filterState.edgeTypes),
        timeRange: graphState.filterState.timeRange
      });
      
      return response.data;
    },
    enabled: !!assetId,
    refetchInterval: enableRealTimeUpdates ? 30000 : false,
    staleTime: 60000
  });

  // Fetch lineage metrics
  const {
    data: lineageMetrics,
    isLoading: isLoadingMetrics
  } = useQuery({
    queryKey: ['lineage-metrics', assetId],
    queryFn: async () => {
      if (!assetId || !lineageData) return null;
      
      const response = await analyticsService.calculateLineageMetrics(assetId, {
        includeComplexity: true,
        includeCentrality: true,
        includeClustering: true
      });
      
      return response.data;
    },
    enabled: !!assetId && !!lineageData,
    staleTime: 300000 // 5 minutes
  });

  // Fetch temporal snapshots
  const {
    data: temporalSnapshots,
    isLoading: isLoadingSnapshots
  } = useQuery({
    queryKey: ['temporal-snapshots', assetId],
    queryFn: async () => {
      if (!assetId) return [];
      
      const response = await lineageService.getTemporalSnapshots(assetId, {
        limit: 50,
        orderBy: 'timestamp',
        orderDirection: 'desc'
      });
      
      return response.data;
    },
    enabled: !!assetId && graphState.temporalState.enabled,
    staleTime: 300000
  });

  // Impact analysis mutation
  const impactAnalysisMutation = useMutation({
    mutationFn: async ({ nodeId, changeType }: { nodeId: string; changeType: string }) => {
      const response = await analyticsService.analyzeImpact(nodeId, {
        changeType,
        includeRecommendations: true,
        includeDownstreamEffects: true,
        includeUpstreamDependencies: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Impact analysis completed');
      if (onImpactAnalysis) {
        onImpactAnalysis(data);
      }
    },
    onError: (error) => {
      toast.error('Failed to analyze impact');
      console.error('Impact analysis error:', error);
    }
  });

  // Add annotation mutation
  const addAnnotationMutation = useMutation({
    mutationFn: async ({ nodeId, annotation }: { nodeId: string; annotation: Partial<Annotation> }) => {
      const response = await collaborationService.addAnnotation(nodeId, annotation);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Annotation added');
      refetchLineage();
    },
    onError: (error) => {
      toast.error('Failed to add annotation');
      console.error('Add annotation error:', error);
    }
  });

  // ============================================================================
  // GRAPH DATA PROCESSING
  // ============================================================================
  const processedGraphData = useMemo(() => {
    if (!lineageData) return { nodes: [], edges: [] };

    // Filter nodes and edges based on current filter state
    const filteredNodes = lineageData.nodes.filter(node => {
      // Type filter
      if (!graphState.filterState.nodeTypes.has(node.type as keyof typeof NODE_TYPES)) {
        return false;
      }

      // Search filter
      if (graphState.filterState.searchQuery) {
        const query = graphState.filterState.searchQuery.toLowerCase();
        return (
          node.name.toLowerCase().includes(query) ||
          node.label?.toLowerCase().includes(query) ||
          node.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });

    const filteredEdges = lineageData.edges.filter(edge => {
      // Type filter
      if (!graphState.filterState.edgeTypes.has(edge.type as keyof typeof EDGE_TYPES)) {
        return false;
      }

      // Ensure both source and target nodes are included
      const sourceExists = filteredNodes.some(n => n.id === edge.source);
      const targetExists = filteredNodes.some(n => n.id === edge.target);
      
      return sourceExists && targetExists;
    });

    // Remove orphan nodes if enabled
    let finalNodes = filteredNodes;
    if (graphState.filterState.hideOrphanNodes) {
      const connectedNodeIds = new Set();
      filteredEdges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
      finalNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id));
    }

    return {
      nodes: finalNodes,
      edges: filteredEdges
    };
  }, [lineageData, graphState.filterState]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handleNodeClick = useCallback((node: LineageNode) => {
    setSelectedNode(node);
    setGraphState(prev => ({
      ...prev,
      selectedNodes: new Set([node.id])
    }));
    
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  }, [onNodeSelect]);

  const handleEdgeClick = useCallback((edge: LineageEdge) => {
    setSelectedEdge(edge);
    setGraphState(prev => ({
      ...prev,
      selectedEdges: new Set([edge.id])
    }));
    
    if (onEdgeSelect) {
      onEdgeSelect(edge);
    }
  }, [onEdgeSelect]);

  const handleNodeHover = useCallback((node: LineageNode | null) => {
    setGraphState(prev => ({
      ...prev,
      hoveredNode: node?.id || null
    }));
  }, []);

  const handleEdgeHover = useCallback((edge: LineageEdge | null) => {
    setGraphState(prev => ({
      ...prev,
      hoveredEdge: edge?.id || null
    }));
  }, []);

  const handleConfigChange = useCallback((config: Partial<LineageVisualizationConfig>) => {
    setVisualizationConfig(prev => ({ ...prev, ...config }));
  }, []);

  const handleImpactAnalysis = useCallback((nodeId: string, changeType: string) => {
    impactAnalysisMutation.mutate({ nodeId, changeType });
  }, [impactAnalysisMutation]);

  const handleAddAnnotation = useCallback((nodeId: string, annotation: Partial<Annotation>) => {
    addAnnotationMutation.mutate({ nodeId, annotation });
  }, [addAnnotationMutation]);

  const handleExport = useCallback((format: string) => {
    if (!graphRef.current) return;

    switch (format) {
      case 'svg':
        // Export as SVG
        const svgElement = graphRef.current.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lineage-${assetId}-${Date.now()}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
        break;
      
      case 'png':
        // Export as PNG (would need canvas conversion)
        toast.info('PNG export functionality coming soon');
        break;
      
      case 'json':
        // Export lineage data as JSON
        const jsonData = JSON.stringify(processedGraphData, null, 2);
        const jsonBlob = new Blob([jsonData], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonA = document.createElement('a');
        jsonA.href = jsonUrl;
        jsonA.download = `lineage-data-${assetId}-${Date.now()}.json`;
        jsonA.click();
        URL.revokeObjectURL(jsonUrl);
        break;
    }
  }, [processedGraphData, assetId]);

  // ============================================================================
  // TEMPORAL LINEAGE HANDLERS
  // ============================================================================
  const handleTemporalStateChange = useCallback((state: Partial<TemporalLineageState>) => {
    setGraphState(prev => ({
      ...prev,
      temporalState: { ...prev.temporalState, ...state }
    }));
  }, []);

  const handleLoadSnapshot = useCallback(async (snapshotId: string) => {
    try {
      const response = await lineageService.getSnapshotData(snapshotId);
      const snapshotData = response.data;
      
      // Update graph with snapshot data
      setGraphState(prev => ({
        ...prev,
        nodes: snapshotData.nodes,
        edges: snapshotData.edges,
        temporalState: {
          ...prev.temporalState,
          selectedSnapshot: snapshotId,
          currentTimestamp: snapshotData.timestamp
        }
      }));
      
      toast.success('Snapshot loaded successfully');
    } catch (error) {
      toast.error('Failed to load snapshot');
      console.error('Load snapshot error:', error);
    }
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Update graph state when lineage data changes
  useEffect(() => {
    if (lineageData) {
      setGraphState(prev => ({
        ...prev,
        nodes: lineageData.nodes,
        edges: lineageData.edges
      }));
    }
  }, [lineageData]);

  // Update temporal snapshots
  useEffect(() => {
    if (temporalSnapshots) {
      setGraphState(prev => ({
        ...prev,
        temporalState: {
          ...prev.temporalState,
          availableSnapshots: temporalSnapshots
        }
      }));
    }
  }, [temporalSnapshots]);

  // ============================================================================
  // RENDER
  // ============================================================================
  if (lineageError) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-lg font-semibold text-red-700">Failed to load lineage data</div>
            <div className="text-sm text-gray-500 mt-1">
              {lineageError instanceof Error ? lineageError.message : 'Unknown error occurred'}
            </div>
            <Button onClick={() => refetchLineage()} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex h-full ${className || ''}`}>
      <TooltipProvider>
        {/* Main Visualization Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Data Lineage Visualizer
              </h2>
              {assetId && (
                <Badge variant="outline">Asset: {assetId}</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setGraphState(prev => ({
                      ...prev,
                      filterState: {
                        ...prev.filterState,
                        searchQuery: e.target.value
                      }
                    }));
                  }}
                  className="pl-10 w-64"
                />
              </div>

              {/* Panel Toggles */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Panels
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={showControlPanel}
                    onCheckedChange={setShowControlPanel}
                  >
                    Control Panel
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={showImpactPanel}
                    onCheckedChange={setShowImpactPanel}
                  >
                    Impact Analysis
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={showTemporalPanel}
                    onCheckedChange={setShowTemporalPanel}
                  >
                    Temporal Lineage
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={showMetricsPanel}
                    onCheckedChange={setShowMetricsPanel}
                  >
                    Metrics Dashboard
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchLineage()}
                disabled={isLoadingLineage}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingLineage ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Visualization */}
          <div className="flex-1 relative">
            {isLoadingLineage ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <div className="text-lg font-semibold">Loading lineage data...</div>
                </div>
              </div>
            ) : processedGraphData.nodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-semibold text-gray-600">No lineage data available</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {assetId ? 'No connections found for this asset' : 'Select an asset to view its lineage'}
                  </div>
                </div>
              </div>
            ) : (
              <D3LineageGraph
                ref={graphRef}
                data={processedGraphData}
                config={visualizationConfig}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onNodeHover={handleNodeHover}
                onEdgeHover={handleEdgeHover}
                selectedNodes={graphState.selectedNodes}
                selectedEdges={graphState.selectedEdges}
                className="w-full h-full"
              />
            )}
          </div>
        </div>

        {/* Side Panels */}
        <div className="w-80 border-l bg-gray-50 overflow-y-auto">
          <Tabs defaultValue="controls" className="w-full">
            <TabsList className="grid w-full grid-cols-4 sticky top-0 z-10">
              <TabsTrigger value="controls" className="text-xs">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="impact" className="text-xs">
                <Target className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="temporal" className="text-xs">
                <Clock className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="metrics" className="text-xs">
                <BarChart3 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <div className="p-4 space-y-4">
              <TabsContent value="controls" className="mt-0">
                {showControlPanel && (
                  <LineageControlPanel
                    config={visualizationConfig}
                    onConfigChange={handleConfigChange}
                    graphRef={graphRef}
                    onResetView={() => graphRef.current?.fitToView()}
                    onExport={handleExport}
                  />
                )}
              </TabsContent>

              <TabsContent value="impact" className="mt-0">
                {showImpactPanel && (
                  <ImpactAnalysisPanel
                    analysis={impactAnalysisMutation.data || null}
                    isLoading={impactAnalysisMutation.isPending}
                    onAnalyzeImpact={handleImpactAnalysis}
                    selectedNode={selectedNode}
                  />
                )}
              </TabsContent>

              <TabsContent value="temporal" className="mt-0">
                {showTemporalPanel && (
                  <TemporalLineageControl
                    temporalState={graphState.temporalState}
                    onTemporalStateChange={handleTemporalStateChange}
                    onLoadSnapshot={handleLoadSnapshot}
                  />
                )}
              </TabsContent>

              <TabsContent value="metrics" className="mt-0">
                {showMetricsPanel && (
                  <LineageMetricsDashboard
                    metrics={lineageMetrics || null}
                    isLoading={isLoadingMetrics}
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Node Details Panel */}
        <NodeDetailsPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onAddAnnotation={handleAddAnnotation}
        />
      </TooltipProvider>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================
export default DataLineageVisualizer;
export type { LineageVisualizationProps, LineageGraphState, LineageMetrics };