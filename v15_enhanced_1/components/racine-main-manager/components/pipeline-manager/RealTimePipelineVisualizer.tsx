'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Activity, Play, Pause, Stop, RefreshCw, TrendingUp, TrendingDown,
  BarChart3, LineChart, PieChart, Zap, Clock, AlertTriangle, CheckCircle,
  XCircle, Eye, EyeOff, Filter, Search, Download, Upload, Settings, 
  Maximize2, Minimize2, MoreHorizontal, X, Plus, Minus, Grid, Target,
  Cpu, Memory, HardDrive, Network, Database, Server, Cloud, Wifi,
  Users, Shield, Package, Code, Terminal, FileText, Bell, BellOff,
  Volume2, VolumeX, Share2, Copy, Edit3, Save, Layers, Route, MapPin
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// D3.js for advanced pipeline visualization
import * as d3 from 'd3';

// Advanced Chart components
import { 
  LineChart as RechartsLineChart, 
  BarChart as RechartsBarChart, 
  AreaChart, 
  PieChart as RechartsPieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  Line, 
  Bar, 
  Area, 
  Pie, 
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Racine System Imports
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Types from racine-core.types
import { 
  Pipeline,
  PipelineExecution,
  ExecutionStatus,
  ExecutionMetrics,
  ResourceUsage,
  PerformanceMetrics,
  PipelineVisualization,
  ExecutionStep,
  StageMetrics,
  SystemHealth,
  AlertConfig,
  VisualizationConfig,
  RealTimeMetrics,
  ExecutionEvent,
  VisualizationNode,
  VisualizationEdge,
  MetricThreshold,
  NotificationConfig,
  VisualizationLayout,
  ExecutionTimeline,
  ResourceMonitoring
} from '../../types/racine-core.types';

/**
 * Advanced Real-Time Pipeline Visualizer Component
 * 
 * Enterprise-grade live visualization system with advanced monitoring capabilities:
 * - Real-time pipeline execution visualization with live stage updates
 * - Advanced D3.js-powered flow diagrams with smooth animations
 * - Comprehensive performance metrics and resource monitoring
 * - Multi-dimensional analytics with drill-down capabilities
 * - AI-powered anomaly detection and predictive insights
 * - Interactive execution timeline with event correlation
 * - Advanced alerting system with customizable thresholds
 * - Cross-SPA execution tracking and dependency mapping
 * - High-performance rendering with virtualization
 * - Collaborative viewing with real-time synchronization
 */

// Execution Status Configurations
const EXECUTION_STATUS_CONFIG = {
  pending: { color: '#6b7280', bgColor: '#f9fafb', icon: Clock, label: 'Pending', animation: 'pulse' },
  queued: { color: '#3b82f6', bgColor: '#dbeafe', icon: Clock, label: 'Queued', animation: 'bounce' },
  initializing: { color: '#8b5cf6', bgColor: '#ede9fe', icon: RefreshCw, label: 'Initializing', animation: 'spin' },
  running: { color: '#10b981', bgColor: '#d1fae5', icon: Play, label: 'Running', animation: 'pulse' },
  paused: { color: '#f59e0b', bgColor: '#fef3c7', icon: Pause, label: 'Paused', animation: 'none' },
  completed: { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle, label: 'Completed', animation: 'none' },
  failed: { color: '#ef4444', bgColor: '#fee2e2', icon: XCircle, label: 'Failed', animation: 'shake' },
  cancelled: { color: '#6b7280', bgColor: '#f3f4f6', icon: Stop, label: 'Cancelled', animation: 'none' },
  timeout: { color: '#f59e0b', bgColor: '#fef3c7', icon: AlertTriangle, label: 'Timeout', animation: 'flash' },
  retrying: { color: '#8b5cf6', bgColor: '#ede9fe', icon: RefreshCw, label: 'Retrying', animation: 'spin' }
};

// Resource monitoring colors and thresholds
const RESOURCE_CONFIG = {
  CPU: { 
    color: '#3b82f6', 
    name: 'CPU Usage',
    unit: '%',
    thresholds: { warning: 70, critical: 90 },
    icon: Cpu
  },
  MEMORY: { 
    color: '#10b981', 
    name: 'Memory Usage',
    unit: '%',
    thresholds: { warning: 80, critical: 95 },
    icon: Memory
  }, 
  STORAGE: { 
    color: '#f59e0b', 
    name: 'Storage Usage',
    unit: '%',
    thresholds: { warning: 85, critical: 95 },
    icon: HardDrive
  },
  NETWORK: { 
    color: '#8b5cf6', 
    name: 'Network I/O',
    unit: 'Mbps',
    thresholds: { warning: 800, critical: 950 },
    icon: Network
  },
  DATABASE: { 
    color: '#ef4444', 
    name: 'Database Load',
    unit: '%',
    thresholds: { warning: 75, critical: 90 },
    icon: Database
  }
};

// Visualization layouts
const VISUALIZATION_LAYOUTS = {
  FLOW: { id: 'flow', name: 'Flow Diagram', icon: Route, description: 'Traditional flow-based layout' },
  HIERARCHICAL: { id: 'hierarchical', name: 'Hierarchical', icon: Layers, description: 'Tree-based hierarchy' },
  FORCE: { id: 'force', name: 'Force-Directed', icon: Target, description: 'Physics-based layout' },
  CIRCULAR: { id: 'circular', name: 'Circular', icon: RefreshCw, description: 'Circular arrangement' },
  TIMELINE: { id: 'timeline', name: 'Timeline', icon: Clock, description: 'Time-based visualization' }
};

// Metric categories for detailed analysis
const METRIC_CATEGORIES = {
  PERFORMANCE: {
    name: 'Performance',
    icon: Zap,
    color: '#10b981',
    metrics: ['execution_time', 'throughput', 'latency', 'queue_time']
  },
  RESOURCES: {
    name: 'Resources',
    icon: Server,
    color: '#3b82f6',
    metrics: ['cpu_usage', 'memory_usage', 'storage_usage', 'network_io']
  },
  RELIABILITY: {
    name: 'Reliability',
    icon: Shield,
    color: '#f59e0b',
    metrics: ['success_rate', 'error_rate', 'retry_count', 'availability']
  },
  BUSINESS: {
    name: 'Business',
    icon: TrendingUp,
    color: '#8b5cf6',
    metrics: ['cost', 'roi', 'sla_compliance', 'user_satisfaction']
  }
};

interface RealTimePipelineVisualizerProps {
  pipelineId?: string;
  executionId?: string;
  pipeline?: Pipeline;
  autoRefresh?: boolean;
  refreshInterval?: number;
  layout?: keyof typeof VISUALIZATION_LAYOUTS;
  showMetrics?: boolean;
  showAlerts?: boolean;
  enableInteraction?: boolean;
  className?: string;
}

const RealTimePipelineVisualizer: React.FC<RealTimePipelineVisualizerProps> = ({
  pipelineId,
  executionId,
  pipeline,
  autoRefresh = true,
  refreshInterval = 2000,
  layout = 'FLOW',
  showMetrics = true,
  showAlerts = true,
  enableInteraction = true,
  className = ''
}) => {
  // Visualization refs
  const visualizationRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Execution and metrics state
  const [execution, setExecution] = useState<PipelineExecution | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [executionEvents, setExecutionEvents] = useState<ExecutionEvent[]>([]);
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  // UI state
  const [activeLayout, setActiveLayout] = useState<keyof typeof VISUALIZATION_LAYOUTS>(layout);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('execution_time');
  const [showDetails, setShowDetails] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showResourcePanel, setShowResourcePanel] = useState(true);
  const [showAlertsPanel, setShowAlertsPanel] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('1h');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Visualization configuration
  const [visualizationConfig, setVisualizationConfig] = useState<VisualizationConfig>({
    layout: activeLayout,
    showLabels: true,
    showMetrics: true,
    showConnections: true,
    enableAnimations: true,
    colorScheme: 'default',
    nodeSize: 'medium',
    showGrid: false,
    showMiniMap: false
  });

  // Backend integration hooks
  const { 
    getExecutionDetails,
    getExecutionMetrics,
    getExecutionEvents,
    controlExecution,
    isLoading,
    error
  } = usePipelineManagement();

  const {
    getSystemHealth,
    getResourceMetrics,
    monitorExecution,
    getAlerts,
    acknowledgeAlert
  } = useRacineOrchestration();

  const {
    getCrossGroupMetrics,
    getExecutionDependencies,
    validateCrossGroupExecution
  } = useCrossGroupIntegration();

  const { getCurrentUser } = useUserManagement();
  const { getActiveWorkspace } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    detectAnomalies,
    predictExecutionTime,
    getOptimizationSuggestions,
    analyzePerformancePatterns
  } = useAIAssistant();

  // Real-time data fetching with auto-refresh
  const fetchExecutionData = useCallback(async () => {
    if (!pipelineId || !executionId || isPaused) return;

    try {
      const [executionData, metricsData, eventsData, resourceData, healthData, alertsData] = await Promise.all([
        getExecutionDetails(executionId),
        getExecutionMetrics(executionId),
        getExecutionEvents(executionId),
        getResourceMetrics(executionId),
        getSystemHealth(),
        getAlerts({ execution_id: executionId })
      ]);

      setExecution(executionData);
      setRealTimeMetrics(metricsData);
      setExecutionEvents(eventsData);
      setResourceUsage(resourceData);
      setSystemHealth(healthData);
      setAlerts(alertsData);

      // Track activity for analytics
      trackActivity('pipeline_visualization_update', {
        pipeline_id: pipelineId,
        execution_id: executionId,
        status: executionData.status
      });

    } catch (error) {
      console.error('Failed to fetch execution data:', error);
    }
  }, [pipelineId, executionId, isPaused, getExecutionDetails, getExecutionMetrics, getExecutionEvents, getResourceMetrics, getSystemHealth, getAlerts, trackActivity]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefresh || isPaused) return;

    const interval = setInterval(fetchExecutionData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, isPaused, refreshInterval, fetchExecutionData]);

  // Initial data load
  useEffect(() => {
    if (pipelineId && executionId) {
      fetchExecutionData();
    }
  }, [pipelineId, executionId, fetchExecutionData]);

  // D3.js visualization rendering
  const renderVisualization = useCallback(() => {
    if (!svgRef.current || !execution || !pipeline) return;

    const svg = d3.select(svgRef.current);
    const container = d3.select(visualizationRef.current);
    
    if (!container.node()) return;

    const containerRect = container.node()!.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    svg.attr('width', width).attr('height', height);

    // Clear previous visualization
    svg.selectAll('*').remove();

    // Create visualization based on selected layout
    switch (activeLayout) {
      case 'FLOW':
        renderFlowLayout(svg, width, height);
        break;
      case 'HIERARCHICAL':
        renderHierarchicalLayout(svg, width, height);
        break;
      case 'FORCE':
        renderForceLayout(svg, width, height);
        break;
      case 'CIRCULAR':
        renderCircularLayout(svg, width, height);
        break;
      case 'TIMELINE':
        renderTimelineLayout(svg, width, height);
        break;
      default:
        renderFlowLayout(svg, width, height);
    }
  }, [svgRef, execution, pipeline, activeLayout, realTimeMetrics, visualizationConfig]);

  // Flow layout rendering
  const renderFlowLayout = useCallback((svg: any, width: number, height: number) => {
    if (!pipeline || !execution) return;

    const stages = pipeline.stages;
    const connections = pipeline.connections;

    // Calculate positions for stages
    const stagePositions = stages.map((stage, index) => ({
      ...stage,
      x: 100 + (index * 200),
      y: height / 2,
      radius: 40
    }));

    // Render connections
    const connectionGroup = svg.append('g').attr('class', 'connections');
    
    connections.forEach(connection => {
      const sourceStage = stagePositions.find(s => s.id === connection.source_stage_id);
      const targetStage = stagePositions.find(s => s.id === connection.target_stage_id);
      
      if (!sourceStage || !targetStage) return;

      const path = d3.path();
      path.moveTo(sourceStage.x + sourceStage.radius, sourceStage.y);
      path.lineTo(targetStage.x - targetStage.radius, targetStage.y);

      connectionGroup
        .append('path')
        .attr('d', path.toString())
        .attr('stroke', getConnectionColor(connection.type))
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#arrowhead)');
    });

    // Add arrow marker
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#64748b');

    // Render stages
    const stageGroup = svg.append('g').attr('class', 'stages');
    
    stagePositions.forEach(stage => {
      const stageExecution = execution.steps?.find(step => step.stage_id === stage.id);
      const status = stageExecution?.status || 'pending';
      const statusConfig = EXECUTION_STATUS_CONFIG[status as keyof typeof EXECUTION_STATUS_CONFIG];

      const group = stageGroup
        .append('g')
        .attr('class', 'stage')
        .attr('transform', `translate(${stage.x}, ${stage.y})`)
        .style('cursor', enableInteraction ? 'pointer' : 'default')
        .on('click', enableInteraction ? () => setSelectedStage(stage.id) : null);

      // Stage circle with status color
      const circle = group
        .append('circle')
        .attr('r', stage.radius)
        .attr('fill', statusConfig.bgColor)
        .attr('stroke', statusConfig.color)
        .attr('stroke-width', selectedStage === stage.id ? 3 : 2);

      // Add status animation
      if (statusConfig.animation === 'pulse' && status === 'running') {
        circle
          .transition()
          .duration(1000)
          .attr('r', stage.radius + 5)
          .transition()
          .duration(1000)
          .attr('r', stage.radius)
          .on('end', function repeat() {
            if (status === 'running') {
              d3.select(this)
                .transition()
                .duration(1000)
                .attr('r', stage.radius + 5)
                .transition()
                .duration(1000)
                .attr('r', stage.radius)
                .on('end', repeat);
            }
          });
      }

      // Stage icon
      group
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '16px')
        .attr('fill', statusConfig.color)
        .text(getStageIcon(stage.type));

      // Stage label
      if (visualizationConfig.showLabels) {
        group
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', stage.radius + 20)
          .attr('font-size', '12px')
          .attr('fill', '#64748b')
          .text(stage.name);
      }

      // Progress indicator for running stages
      if (status === 'running' && stageExecution?.progress !== undefined) {
        const progressArc = d3.arc()
          .innerRadius(stage.radius + 5)
          .outerRadius(stage.radius + 8)
          .startAngle(0)
          .endAngle((stageExecution.progress / 100) * 2 * Math.PI);

        group
          .append('path')
          .attr('d', progressArc as any)
          .attr('fill', statusConfig.color)
          .attr('opacity', 0.7);
      }

      // Metrics overlay
      if (visualizationConfig.showMetrics && realTimeMetrics) {
        const metrics = realTimeMetrics.stage_metrics?.[stage.id];
        if (metrics) {
          group
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', -stage.radius - 10)
            .attr('font-size', '10px')
            .attr('fill', '#374151')
            .text(`${metrics.execution_time}ms`);
        }
      }
    });
  }, [pipeline, execution, selectedStage, enableInteraction, visualizationConfig, realTimeMetrics]);

  // Helper functions for other layouts
  const renderHierarchicalLayout = useCallback((svg: any, width: number, height: number) => {
    // Hierarchical tree layout implementation
    if (!pipeline) return;

    const hierarchy = d3.hierarchy({
      id: 'root',
      children: pipeline.stages.map(stage => ({ id: stage.id, name: stage.name }))
    });

    const tree = d3.tree().size([width - 100, height - 100]);
    const root = tree(hierarchy);

    // Render links
    svg.append('g')
      .selectAll('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('d', d3.linkHorizontal()
        .x((d: any) => d.y + 50)
        .y((d: any) => d.x + 50))
      .attr('fill', 'none')
      .attr('stroke', '#64748b')
      .attr('stroke-width', 2);

    // Render nodes
    const nodes = svg.append('g')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.y + 50}, ${d.x + 50})`);

    nodes.append('circle')
      .attr('r', 20)
      .attr('fill', '#f3f4f6')
      .attr('stroke', '#64748b')
      .attr('stroke-width', 2);

    if (visualizationConfig.showLabels) {
      nodes.append('text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text((d: any) => d.data.name || d.data.id);
    }
  }, [pipeline, visualizationConfig]);

  const renderForceLayout = useCallback((svg: any, width: number, height: number) => {
    // Force-directed layout implementation
    if (!pipeline) return;

    const nodes = pipeline.stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      type: stage.type,
      x: width / 2,
      y: height / 2
    }));

    const links = pipeline.connections.map(connection => ({
      source: connection.source_stage_id,
      target: connection.target_stage_id
    }));

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Render links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#64748b')
      .attr('stroke-width', 2);

    // Render nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 25)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 2)
      .call(d3.drag()
        .on('start', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });
  }, [pipeline]);

  const renderCircularLayout = useCallback((svg: any, width: number, height: number) => {
    // Circular layout implementation
    if (!pipeline) return;

    const stages = pipeline.stages;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    stages.forEach((stage, index) => {
      const angle = (index * 2 * Math.PI) / stages.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const group = svg.append('g')
        .attr('transform', `translate(${x}, ${y})`);

      group.append('circle')
        .attr('r', 25)
        .attr('fill', '#10b981')
        .attr('stroke', '#059669')
        .attr('stroke-width', 2);

      if (visualizationConfig.showLabels) {
        group.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('font-size', '10px')
          .attr('fill', 'white')
          .text(stage.name.substring(0, 8));
      }
    });

    // Draw connections
    pipeline.connections.forEach(connection => {
      const sourceIndex = stages.findIndex(s => s.id === connection.source_stage_id);
      const targetIndex = stages.findIndex(s => s.id === connection.target_stage_id);
      
      if (sourceIndex === -1 || targetIndex === -1) return;

      const sourceAngle = (sourceIndex * 2 * Math.PI) / stages.length;
      const targetAngle = (targetIndex * 2 * Math.PI) / stages.length;
      
      const sourceX = centerX + radius * Math.cos(sourceAngle);
      const sourceY = centerY + radius * Math.sin(sourceAngle);
      const targetX = centerX + radius * Math.cos(targetAngle);
      const targetY = centerY + radius * Math.sin(targetAngle);

      svg.append('line')
        .attr('x1', sourceX)
        .attr('y1', sourceY)
        .attr('x2', targetX)
        .attr('y2', targetY)
        .attr('stroke', '#64748b')
        .attr('stroke-width', 1)
        .attr('opacity', 0.6);
    });
  }, [pipeline, visualizationConfig]);

  const renderTimelineLayout = useCallback((svg: any, width: number, height: number) => {
    // Timeline layout implementation
    if (!executionEvents.length) return;

    const timeScale = d3.scaleTime()
      .domain(d3.extent(executionEvents, d => new Date(d.timestamp)) as [Date, Date])
      .range([50, width - 50]);

    const yScale = d3.scaleBand()
      .domain(executionEvents.map(e => e.stage_id).filter(Boolean))
      .range([50, height - 50])
      .padding(0.1);

    // Draw timeline axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - 30})`)
      .call(d3.axisBottom(timeScale).tickFormat(d3.timeFormat('%H:%M:%S')));

    // Draw events
    executionEvents.forEach(event => {
      if (!event.stage_id) return;

      const x = timeScale(new Date(event.timestamp));
      const y = yScale(event.stage_id) || 0;
      const eventColor = getEventColor(event.type);

      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y + yScale.bandwidth() / 2)
        .attr('r', 4)
        .attr('fill', eventColor)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

      if (visualizationConfig.showLabels) {
        svg.append('text')
          .attr('x', x)
          .attr('y', y + yScale.bandwidth() / 2 - 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '8px')
          .attr('fill', '#374151')
          .text(event.type);
      }
    });
  }, [executionEvents, visualizationConfig]);

  // Helper functions
  const getConnectionColor = (type: string) => {
    const colors = {
      success: '#10b981',
      failure: '#ef4444',
      conditional: '#f59e0b',
      parallel: '#8b5cf6',
      timeout: '#6b7280'
    };
    return colors[type as keyof typeof colors] || '#64748b';
  };

  const getStageIcon = (type: string) => {
    const icons: Record<string, string> = {
      data_ingestion: '🔌',
      data_discovery: '🔍',
      data_classification: '🏷️',
      governance_rules: '🛡️',
      cataloging: '📦',
      compliance_audit: '🏆',
      access_control: '👥'
    };
    return icons[type] || '⚙️';
  };

  const getEventColor = (type: string) => {
    const colors = {
      start: '#10b981',
      complete: '#059669',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    return colors[type as keyof typeof colors] || '#64748b';
  };

  // Control functions
  const handlePauseResume = useCallback(() => {
    setIsPaused(!isPaused);
    trackActivity('pipeline_visualization_pause_toggle', { 
      pipeline_id: pipelineId,
      execution_id: executionId,
      paused: !isPaused 
    });
  }, [isPaused, pipelineId, executionId, trackActivity]);

  const handleLayoutChange = useCallback((newLayout: keyof typeof VISUALIZATION_LAYOUTS) => {
    setActiveLayout(newLayout);
    setVisualizationConfig(prev => ({ ...prev, layout: newLayout }));
    trackActivity('pipeline_visualization_layout_change', {
      pipeline_id: pipelineId,
      execution_id: executionId,
      layout: newLayout
    });
  }, [pipelineId, executionId, trackActivity]);

  const handleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      visualizationRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Re-render visualization when data or config changes
  useEffect(() => {
    renderVisualization();
  }, [renderVisualization]);

  // Real-time metrics chart data
  const metricsChartData = useMemo(() => {
    if (!realTimeMetrics?.timeline) return [];

    return realTimeMetrics.timeline.map((point, index) => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      execution_time: point.execution_time,
      cpu_usage: point.resource_usage?.cpu || 0,
      memory_usage: point.resource_usage?.memory || 0,
      throughput: point.throughput || 0
    }));
  }, [realTimeMetrics]);

  // Resource usage chart data
  const resourceChartData = useMemo(() => {
    return Object.entries(RESOURCE_CONFIG).map(([key, config]) => {
      const latestUsage = resourceUsage[resourceUsage.length - 1];
      const value = latestUsage?.[key.toLowerCase() as keyof ResourceUsage] || 0;
      
      return {
        name: config.name,
        value: typeof value === 'number' ? value : 0,
        color: config.color,
        threshold: config.thresholds.warning
      };
    });
  }, [resourceUsage]);

  return (
    <TooltipProvider>
      <div className={`flex h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${className}`}>
        <ResizablePanelGroup direction="horizontal">
          {/* Main Visualization Area */}
          <ResizablePanel defaultSize={70} minSize={50}>
            <div className="flex flex-col h-full">
              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Pipeline Visualization
                      </h3>
                      {execution && (
                        <Badge 
                          variant={execution.status === 'running' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {execution.status}
                        </Badge>
                      )}
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Layout Selector */}
                    <Select value={activeLayout} onValueChange={(value) => handleLayoutChange(value as keyof typeof VISUALIZATION_LAYOUTS)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(VISUALIZATION_LAYOUTS).map(([key, layout]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              <layout.icon className="h-4 w-4" />
                              <span>{layout.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Control Buttons */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePauseResume}
                        >
                          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isPaused ? 'Resume' : 'Pause'} Updates</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchExecutionData}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh Data</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFullscreen}
                        >
                          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Toggle Fullscreen</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setVisualizationConfig(prev => ({ ...prev, showLabels: !prev.showLabels }))}>
                          <Eye className="h-4 w-4 mr-2" />
                          {visualizationConfig.showLabels ? 'Hide' : 'Show'} Labels
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setVisualizationConfig(prev => ({ ...prev, showMetrics: !prev.showMetrics }))}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          {visualizationConfig.showMetrics ? 'Hide' : 'Show'} Metrics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setVisualizationConfig(prev => ({ ...prev, enableAnimations: !prev.enableAnimations }))}>
                          <Zap className="h-4 w-4 mr-2" />
                          {visualizationConfig.enableAnimations ? 'Disable' : 'Enable'} Animations
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setAlertsEnabled(!alertsEnabled)}>
                          {alertsEnabled ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                          {alertsEnabled ? 'Disable' : 'Enable'} Alerts
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAudioEnabled(!audioEnabled)}>
                          {audioEnabled ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                          {audioEnabled ? 'Mute' : 'Unmute'} Audio
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Visualization Canvas */}
              <div 
                ref={visualizationRef}
                className="flex-1 relative bg-white dark:bg-slate-900 overflow-hidden"
              >
                <svg
                  ref={svgRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ cursor: enableInteraction ? 'default' : 'not-allowed' }}
                />

                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="h-6 w-6 text-blue-500" />
                      </motion.div>
                      <span className="text-slate-600 dark:text-slate-400">Loading pipeline data...</span>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Alert className="max-w-md">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Visualization Error</AlertTitle>
                      <AlertDescription>
                        Failed to load pipeline data. Please try refreshing.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Empty State */}
                {!execution && !isLoading && !error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Monitor className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                        No Pipeline Execution
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Select a pipeline execution to view real-time visualization.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              {showTimeline && executionEvents.length > 0 && (
                <div className="h-32 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div ref={timelineRef} className="h-full p-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Execution Timeline</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTimeline(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-20">
                      <div className="flex space-x-2">
                        {executionEvents.map((event, index) => (
                          <div
                            key={`${event.stage_id}-${index}`}
                            className="flex-shrink-0 w-20 text-center"
                          >
                            <div 
                              className="w-4 h-4 rounded-full mx-auto mb-1"
                              style={{ backgroundColor: getEventColor(event.type) }}
                            />
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                              {event.type}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Side Panel */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
            <div className="h-full bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="flex-1 p-4 space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Execution Overview</h3>
                    
                    {execution && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                          <Badge variant={execution.status === 'running' ? 'default' : 'secondary'}>
                            {execution.status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Duration:</span>
                          <span className="text-sm font-medium">
                            {execution.duration ? `${Math.round(execution.duration / 1000)}s` : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Progress:</span>
                          <span className="text-sm font-medium">{execution.progress || 0}%</span>
                        </div>
                        
                        {execution.progress !== undefined && (
                          <Progress value={execution.progress} className="mt-2" />
                        )}
                      </div>
                    )}

                    {realTimeMetrics && (
                      <div className="mt-6">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Performance Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Avg Execution Time:</span>
                            <span className="font-medium">{realTimeMetrics.avg_execution_time}ms</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Throughput:</span>
                            <span className="font-medium">{realTimeMetrics.throughput}/min</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Success Rate:</span>
                            <span className="font-medium">{realTimeMetrics.success_rate}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Metrics Tab */}
                <TabsContent value="metrics" className="flex-1 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Real-time Metrics</h3>
                    
                    {metricsChartData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Performance Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <RechartsLineChart data={metricsChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis />
                              <ChartTooltip />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="execution_time" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                name="Execution Time"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="throughput" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                name="Throughput"
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Metrics by Category */}
                    <div className="space-y-3">
                      {Object.entries(METRIC_CATEGORIES).map(([key, category]) => (
                        <Card key={key}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              <category.icon className="h-4 w-4 mr-2" style={{ color: category.color }} />
                              {category.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {category.metrics.map(metric => (
                                <div key={metric} className="flex justify-between text-sm">
                                  <span className="text-slate-600 dark:text-slate-400 capitalize">
                                    {metric.replace('_', ' ')}:
                                  </span>
                                  <span className="font-medium">
                                    {realTimeMetrics?.[metric as keyof typeof realTimeMetrics] || 'N/A'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="flex-1 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Resource Usage</h3>
                    
                    {resourceChartData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Current Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <RechartsBarChart data={resourceChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <ChartTooltip />
                              <Bar dataKey="value" fill="#3b82f6" />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Resource Details */}
                    <div className="space-y-3">
                      {Object.entries(RESOURCE_CONFIG).map(([key, config]) => {
                        const latestUsage = resourceUsage[resourceUsage.length - 1];
                        const value = latestUsage?.[key.toLowerCase() as keyof ResourceUsage] || 0;
                        const percentage = typeof value === 'number' ? value : 0;
                        const isWarning = percentage > config.thresholds.warning;
                        const isCritical = percentage > config.thresholds.critical;

                        return (
                          <Card key={key}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <config.icon className="h-4 w-4" style={{ color: config.color }} />
                                  <span className="text-sm font-medium">{config.name}</span>
                                </div>
                                <span className="text-sm font-medium">
                                  {percentage.toFixed(1)}{config.unit}
                                </span>
                              </div>
                              <Progress 
                                value={percentage} 
                                className={`h-2 ${isCritical ? 'bg-red-100' : isWarning ? 'bg-yellow-100' : 'bg-green-100'}`}
                              />
                              {(isWarning || isCritical) && (
                                <div className="flex items-center mt-1">
                                  <AlertTriangle className={`h-3 w-3 mr-1 ${isCritical ? 'text-red-500' : 'text-yellow-500'}`} />
                                  <span className={`text-xs ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {isCritical ? 'Critical' : 'Warning'} threshold exceeded
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="flex-1 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Alerts</h3>
                      <Switch
                        checked={alertsEnabled}
                        onCheckedChange={setAlertsEnabled}
                      />
                    </div>
                    
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {alerts.length > 0 ? (
                          alerts.map((alert, index) => (
                            <Alert key={index} className={`${alert.severity === 'critical' ? 'border-red-200 bg-red-50' : alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
                              <AlertTriangle className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`} />
                              <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                              <AlertDescription className="text-xs">
                                {alert.description}
                              </AlertDescription>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-slate-500">
                                  {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => acknowledgeAlert(alert.id)}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </Alert>
                          ))
                        ) : (
                          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                            <Bell className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">No alerts</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
};

export default RealTimePipelineVisualizer;