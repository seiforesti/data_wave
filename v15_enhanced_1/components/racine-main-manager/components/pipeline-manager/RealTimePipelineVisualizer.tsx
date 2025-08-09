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
  Volume2, VolumeX, Share2, Copy, Edit3, Save, Layers, Route, MapPin,
  Gauge, Brain, Radar, Zoomln, ZoomOut, RotateCcw, Maximize, Minimize,
  Thermometer, Wifi, Signal, Battery, Power, FlashIcon, Flame, Waves,
  Crosshair, Compass, Navigation, Scan, Telescope, Microscope, Focus,
  Aperture, Camera, Video, Film, Image, Palette, Brush, Wand2, Sparkles
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  Radar,
  ComposedChart,
  Treemap,
  Sankey,
  Funnel,
  FunnelChart
} from 'recharts';

// Three.js for 3D visualization
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line as ThreeLine } from '@react-three/drei';

// Racine System Imports
import { usePipelineManager } from '../../hooks/usePipelineManager';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Pipeline Management APIs
import { pipelineManagementAPI, PipelineEventType } from '../../services/pipeline-management-apis';

// Types from racine-core.types
import { 
  PipelineDefinition,
  PipelineExecution,
  PipelineStageExecution,
  PipelineStatus,
  PipelineStageType,
  PipelineMetrics,
  PerformanceMetrics,
  ResourceUsage,
  UUID,
  ISODateString
} from '../../types/racine-core.types';

/**
 * Advanced Real-Time Pipeline Visualizer Component
 * 
 * Enterprise-grade live visualization system with advanced monitoring capabilities:
 * - Real-time 3D pipeline topology visualization
 * - AI-powered bottleneck detection and optimization suggestions
 * - Multi-dimensional performance monitoring with predictive analytics
 * - Advanced anomaly detection with machine learning insights
 * - Comprehensive resource utilization tracking across all 7 groups
 * - Interactive performance optimization recommendations
 * - Real-time collaboration and monitoring across teams
 * - Advanced drill-down capabilities with detailed stage-level metrics
 * 
 * Surpasses Databricks capabilities with:
 * - 3D immersive visualization environment
 * - AI-driven predictive performance analytics
 * - Cross-group pipeline orchestration visualization
 * - Real-time collaborative monitoring and optimization
 * - Advanced resource optimization with cost tracking
 * - Intelligent alerting with contextualized recommendations
 */

interface RealTimePipelineVisualizerProps {
  pipelineId?: UUID;
  executionId?: UUID;
  className?: string;
  onStageSelect?: (stageId: UUID) => void;
  onMetricSelect?: (metric: string, value: number) => void;
  onOptimizationSuggestion?: (suggestion: OptimizationSuggestion) => void;
}

interface VisualizationNode {
  id: UUID;
  name: string;
  type: PipelineStageType;
  group: string;
  status: PipelineStatus;
  position: { x: number; y: number; z: number };
  metrics: StageMetrics;
  dependencies: UUID[];
  resources: ResourceAllocation;
  performance: PerformanceIndicators;
}

interface VisualizationEdge {
  id: UUID;
  source: UUID;
  target: UUID;
  type: 'data_flow' | 'dependency' | 'conditional';
  status: 'active' | 'idle' | 'error';
  throughput: number;
  latency: number;
  dataVolume: number;
}

interface StageMetrics {
  recordsProcessed: number;
  dataVolume: number;
  processingTime: number;
  errorRate: number;
  throughput: number;
  queueDepth: number;
  resourceUtilization: ResourceUtilization;
}

interface ResourceUtilization {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  gpu?: number;
}

interface PerformanceIndicators {
  efficiency: number;
  reliability: number;
  scalability: number;
  costEffectiveness: number;
  predictedBottlenecks: BottleneckPrediction[];
}

interface BottleneckPrediction {
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'algorithm' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  estimatedImpact: number;
  recommendation: string;
  timeToOccurrence: number;
}

interface OptimizationSuggestion {
  id: UUID;
  type: 'performance' | 'cost' | 'reliability' | 'scalability';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  expectedImprovement: number;
  implementation: string[];
  risks: string[];
}

interface ResourceAllocation {
  allocated: ResourceUtilization;
  used: ResourceUtilization;
  available: ResourceUtilization;
  costs: ResourceCosts;
}

interface ResourceCosts {
  compute: number;
  storage: number;
  network: number;
  total: number;
  currency: string;
}

interface MonitoringAlert {
  id: UUID;
  type: 'performance' | 'resource' | 'error' | 'cost' | 'security';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: ISODateString;
  acknowledged: boolean;
  stageId?: UUID;
  metric?: string;
  threshold?: number;
  currentValue?: number;
}

interface VisualizationSettings {
  viewMode: '2d' | '3d' | 'hybrid';
  layout: 'hierarchical' | 'force_directed' | 'circular' | 'layered';
  showMetrics: boolean;
  showResources: boolean;
  showPredictions: boolean;
  animationSpeed: number;
  colorScheme: 'default' | 'performance' | 'cost' | 'status';
  detailLevel: 'minimal' | 'standard' | 'detailed' | 'comprehensive';
}

const RealTimePipelineVisualizer: React.FC<RealTimePipelineVisualizerProps> = ({
  pipelineId,
  executionId,
  className,
  onStageSelect,
  onMetricSelect,
  onOptimizationSuggestion
}) => {
  // Core state management
  const [currentPipeline, setCurrentPipeline] = useState<PipelineDefinition | null>(null);
  const [currentExecution, setCurrentExecution] = useState<PipelineExecution | null>(null);
  const [visualizationNodes, setVisualizationNodes] = useState<VisualizationNode[]>([]);
  const [visualizationEdges, setVisualizationEdges] = useState<VisualizationEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<UUID | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<UUID | null>(null);
  
  // Monitoring and metrics state
  const [realTimeMetrics, setRealTimeMetrics] = useState<Map<UUID, StageMetrics>>(new Map());
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetrics[]>([]);
  const [resourceUsageHistory, setResourceUsageHistory] = useState<ResourceUsage[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  
  // Visualization settings and controls
  const [settings, setSettings] = useState<VisualizationSettings>({
    viewMode: '3d',
    layout: 'hierarchical',
    showMetrics: true,
    showResources: true,
    showPredictions: true,
    animationSpeed: 1.0,
    colorScheme: 'performance',
    detailLevel: 'standard'
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showOptimizations, setShowOptimizations] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [selectedMetricType, setSelectedMetricType] = useState<string>('performance');
  
  // Refs for D3 and Three.js integration
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const d3SimulationRef = useRef<d3.Simulation<VisualizationNode, undefined> | null>(null);
  
  // Racine hooks for backend integration
  const {
    currentPipeline: pipelineState,
    currentExecution: executionState,
    metrics,
    health,
    loadPipeline,
    loadPipelineMetrics,
    loadPipelineHealth,
    executePipeline,
    controlExecution
  } = usePipelineManager({
    enableRealTimeUpdates: true,
    enableAutoOptimization: true,
    onExecutionUpdate: handleExecutionUpdate,
    onOptimizationComplete: handleOptimizationComplete
  });
  
  const {
    systemHealth,
    performanceMetrics,
    orchestrateExecution,
    getSystemInsights
  } = useRacineOrchestration();
  
  const {
    crossGroupData,
    coordinateExecution,
    getIntegrationStatus
  } = useCrossGroupIntegration();
  
  const {
    generateInsights,
    getRecommendations,
    analyzePerformance
  } = useAIAssistant();

  // Load pipeline and setup real-time monitoring
  useEffect(() => {
    if (pipelineId) {
      initializePipelineVisualization();
      setupRealTimeMonitoring();
    }
    
    return () => {
      cleanupRealTimeMonitoring();
    };
  }, [pipelineId, executionId]);

  // Initialize pipeline visualization
  const initializePipelineVisualization = useCallback(async () => {
    if (!pipelineId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load pipeline definition
      const pipeline = await loadPipeline(pipelineId);
      if (pipeline) {
        setCurrentPipeline(pipeline);
        await generateVisualizationNodes(pipeline);
      }
      
      // Load current execution if provided
      if (executionId) {
        const execution = await pipelineManagementAPI.getExecutionStatus(pipelineId, executionId);
        setCurrentExecution(execution.execution);
      }
      
      // Load metrics and health data
      await Promise.all([
        loadPipelineMetrics(pipelineId),
        loadPipelineHealth(pipelineId),
        loadOptimizationSuggestions(pipelineId)
      ]);
      
    } catch (error) {
      console.error('Failed to initialize pipeline visualization:', error);
      setError('Failed to load pipeline visualization data');
    } finally {
      setIsLoading(false);
    }
  }, [pipelineId, executionId, loadPipeline, loadPipelineMetrics, loadPipelineHealth]);

  // Generate visualization nodes from pipeline definition
  const generateVisualizationNodes = useCallback(async (pipeline: PipelineDefinition) => {
    const nodes: VisualizationNode[] = [];
    const edges: VisualizationEdge[] = [];
    
    // Create nodes for each stage
    pipeline.stages?.forEach((stage, index) => {
      const node: VisualizationNode = {
        id: stage.id,
        name: stage.stage_name,
        type: stage.stage_type,
        group: stage.target_group,
        status: 'active',
        position: calculateNodePosition(index, pipeline.stages?.length || 0, settings.layout),
        metrics: {
          recordsProcessed: 0,
          dataVolume: 0,
          processingTime: 0,
          errorRate: 0,
          throughput: 0,
          queueDepth: 0,
          resourceUtilization: { cpu: 0, memory: 0, disk: 0, network: 0 }
        },
        dependencies: stage.depends_on || [],
        resources: {
          allocated: { cpu: 0, memory: 0, disk: 0, network: 0 },
          used: { cpu: 0, memory: 0, disk: 0, network: 0 },
          available: { cpu: 0, memory: 0, disk: 0, network: 0 },
          costs: { compute: 0, storage: 0, network: 0, total: 0, currency: 'USD' }
        },
        performance: {
          efficiency: 0,
          reliability: 0,
          scalability: 0,
          costEffectiveness: 0,
          predictedBottlenecks: []
        }
      };
      nodes.push(node);
      
      // Create edges for dependencies
      stage.depends_on?.forEach(depId => {
        const edge: VisualizationEdge = {
          id: crypto.randomUUID(),
          source: depId,
          target: stage.id,
          type: 'dependency',
          status: 'idle',
          throughput: 0,
          latency: 0,
          dataVolume: 0
        };
        edges.push(edge);
      });
    });
    
    setVisualizationNodes(nodes);
    setVisualizationEdges(edges);
    
    // Initialize D3 force simulation for dynamic layout
    if (settings.layout === 'force_directed') {
      initializeD3Simulation(nodes, edges);
    }
  }, [settings.layout]);

  // Calculate node position based on layout algorithm
  const calculateNodePosition = useCallback((
    index: number, 
    total: number, 
    layout: VisualizationSettings['layout']
  ): { x: number; y: number; z: number } => {
    switch (layout) {
      case 'hierarchical':
        return {
          x: (index % 4) * 200,
          y: Math.floor(index / 4) * 150,
          z: 0
        };
      
      case 'circular':
        const angle = (index / total) * 2 * Math.PI;
        const radius = 300;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: 0
        };
      
      case 'layered':
        return {
          x: index * 250,
          y: (index % 2) * 100,
          z: Math.floor(index / 8) * 100
        };
      
      default:
        return { x: index * 200, y: 0, z: 0 };
    }
  }, []);

  // Initialize D3 force simulation
  const initializeD3Simulation = useCallback((nodes: VisualizationNode[], edges: VisualizationEdge[]) => {
    if (!svgRef.current) return;
    
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(400, 300))
      .force('collision', d3.forceCollide().radius(50));
    
    simulation.on('tick', () => {
      // Update node positions
      setVisualizationNodes([...nodes]);
    });
    
    d3SimulationRef.current = simulation;
  }, []);

  // Setup real-time monitoring with WebSocket connections
  const setupRealTimeMonitoring = useCallback(() => {
    if (!pipelineId) return;
    
    // Subscribe to pipeline events
    const subscriptions = [
      pipelineManagementAPI.subscribeToEvents(
        PipelineEventType.STAGE_STARTED,
        handleStageEvent,
        pipelineId
      ),
      pipelineManagementAPI.subscribeToEvents(
        PipelineEventType.STAGE_COMPLETED,
        handleStageEvent,
        pipelineId
      ),
      pipelineManagementAPI.subscribeToEvents(
        PipelineEventType.BOTTLENECK_DETECTED,
        handleBottleneckEvent,
        pipelineId
      ),
      pipelineManagementAPI.subscribeToEvents(
        PipelineEventType.OPTIMIZATION_APPLIED,
        handleOptimizationEvent,
        pipelineId
      )
    ];
    
    // Start metric collection interval
    const metricsInterval = setInterval(collectRealTimeMetrics, 5000);
    const alertsInterval = setInterval(checkAlerts, 10000);
    const optimizationInterval = setInterval(generateOptimizationSuggestions, 30000);
    
    return () => {
      subscriptions.forEach(id => pipelineManagementAPI.unsubscribeFromEvents(id));
      clearInterval(metricsInterval);
      clearInterval(alertsInterval);
      clearInterval(optimizationInterval);
    };
  }, [pipelineId]);

  // Cleanup real-time monitoring
  const cleanupRealTimeMonitoring = useCallback(() => {
    if (d3SimulationRef.current) {
      d3SimulationRef.current.stop();
    }
  }, []);

  // Handle stage events from WebSocket
  const handleStageEvent = useCallback((event: any) => {
    const { stageId, data } = event;
    
    setVisualizationNodes(nodes => 
      nodes.map(node => 
        node.id === stageId 
          ? { ...node, status: data.status, metrics: data.metrics }
          : node
      )
    );
    
    // Update real-time metrics
    if (data.metrics) {
      setRealTimeMetrics(prev => new Map(prev.set(stageId, data.metrics)));
    }
  }, []);

  // Handle bottleneck detection events
  const handleBottleneckEvent = useCallback((event: any) => {
    const { stageId, data } = event;
    
    const alert: MonitoringAlert = {
      id: crypto.randomUUID(),
      type: 'performance',
      severity: data.severity,
      title: 'Bottleneck Detected',
      message: `Performance bottleneck detected in stage ${data.stageName}: ${data.description}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      stageId,
      metric: data.metric,
      threshold: data.threshold,
      currentValue: data.currentValue
    };
    
    setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
  }, []);

  // Handle optimization events
  const handleOptimizationEvent = useCallback((event: any) => {
    const { data } = event;
    
    const alert: MonitoringAlert = {
      id: crypto.randomUUID(),
      type: 'performance',
      severity: 'info',
      title: 'Optimization Applied',
      message: `Pipeline optimization applied: ${data.description}`,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    
    setAlerts(prev => [alert, ...prev.slice(0, 49)]);
    
    // Refresh optimization suggestions
    generateOptimizationSuggestions();
  }, []);

  // Handle execution updates
  const handleExecutionUpdate = useCallback((execution: PipelineExecution) => {
    setCurrentExecution(execution);
    
    // Update visualization with execution data
    if (execution.pipeline_stage_executions) {
      execution.pipeline_stage_executions.forEach(stageExecution => {
        setVisualizationNodes(nodes => 
          nodes.map(node => 
            node.id === stageExecution.pipeline_stage_id
              ? { 
                  ...node, 
                  status: stageExecution.status,
                  metrics: {
                    ...node.metrics,
                    recordsProcessed: stageExecution.records_processed,
                    processingTime: stageExecution.duration_seconds || 0,
                    errorRate: stageExecution.records_failed / Math.max(stageExecution.records_processed, 1)
                  }
                }
              : node
          )
        );
      });
    }
  }, []);

  // Handle optimization completion
  const handleOptimizationComplete = useCallback((optimization: any) => {
    const suggestion: OptimizationSuggestion = {
      id: optimization.id,
      type: optimization.optimization_type,
      title: 'AI Optimization Available',
      description: optimization.recommendation_data?.description || 'Performance optimization suggested',
      impact: optimization.expected_improvement?.impact || 'medium',
      effort: optimization.expected_improvement?.effort || 'medium',
      expectedImprovement: optimization.expected_improvement?.percentage || 0,
      implementation: optimization.recommendation_data?.steps || [],
      risks: optimization.recommendation_data?.risks || []
    };
    
    setOptimizationSuggestions(prev => [suggestion, ...prev.slice(0, 9)]); // Keep last 10 suggestions
    
    if (onOptimizationSuggestion) {
      onOptimizationSuggestion(suggestion);
    }
  }, [onOptimizationSuggestion]);

  // Collect real-time metrics from all stages
  const collectRealTimeMetrics = useCallback(async () => {
    if (!currentPipeline || isPaused) return;
    
    try {
      const metrics = await loadPipelineMetrics(currentPipeline.id);
      if (metrics) {
        setPerformanceHistory(prev => [...prev.slice(-99), metrics]); // Keep last 100 points
        
        // Update resource usage history
        const resourceUsage: ResourceUsage = {
          peakMemory: metrics.resource_usage?.memory || 0,
          avgCpuUsage: metrics.resource_usage?.cpu || 0,
          diskIO: metrics.resource_usage?.disk || 0,
          networkIO: metrics.resource_usage?.network || 0,
          duration: metrics.execution_time || 0
        };
        setResourceUsageHistory(prev => [...prev.slice(-99), resourceUsage]);
      }
    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  }, [currentPipeline, isPaused, loadPipelineMetrics]);

  // Check for performance alerts
  const checkAlerts = useCallback(async () => {
    if (!currentPipeline) return;
    
    visualizationNodes.forEach(node => {
      const metrics = node.metrics;
      
      // Check CPU utilization
      if (metrics.resourceUtilization.cpu > 90) {
        const alert: MonitoringAlert = {
          id: crypto.randomUUID(),
          type: 'resource',
          severity: 'warning',
          title: 'High CPU Utilization',
          message: `Stage ${node.name} is using ${metrics.resourceUtilization.cpu}% CPU`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          stageId: node.id,
          metric: 'cpu',
          threshold: 90,
          currentValue: metrics.resourceUtilization.cpu
        };
        setAlerts(prev => [alert, ...prev.slice(0, 49)]);
      }
      
      // Check error rate
      if (metrics.errorRate > 5) {
        const alert: MonitoringAlert = {
          id: crypto.randomUUID(),
          type: 'error',
          severity: 'error',
          title: 'High Error Rate',
          message: `Stage ${node.name} has error rate of ${metrics.errorRate.toFixed(2)}%`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          stageId: node.id,
          metric: 'error_rate',
          threshold: 5,
          currentValue: metrics.errorRate
        };
        setAlerts(prev => [alert, ...prev.slice(0, 49)]);
      }
    });
  }, [currentPipeline, visualizationNodes]);

  // Generate AI-powered optimization suggestions
  const generateOptimizationSuggestions = useCallback(async () => {
    if (!currentPipeline) return;
    
    try {
      const suggestions = await analyzePerformance(currentPipeline.id, {
        includeResourceOptimization: true,
        includeCostOptimization: true,
        includePerformanceOptimization: true
      });
      
      const optimizationSuggestions: OptimizationSuggestion[] = suggestions.map((suggestion: any) => ({
        id: suggestion.id,
        type: suggestion.type,
        title: suggestion.title,
        description: suggestion.description,
        impact: suggestion.impact,
        effort: suggestion.effort,
        expectedImprovement: suggestion.expectedImprovement,
        implementation: suggestion.implementation,
        risks: suggestion.risks
      }));
      
      setOptimizationSuggestions(optimizationSuggestions);
    } catch (error) {
      console.error('Failed to generate optimization suggestions:', error);
    }
  }, [currentPipeline, analyzePerformance]);

  // Load optimization suggestions
  const loadOptimizationSuggestions = useCallback(async (pipelineId: UUID) => {
    try {
      const recommendations = await pipelineManagementAPI.getOptimizationRecommendations(pipelineId);
      const suggestions: OptimizationSuggestion[] = recommendations.map((rec: any) => ({
        id: rec.id,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        impact: rec.impact,
        effort: rec.effort,
        expectedImprovement: rec.expectedImprovement,
        implementation: rec.implementation || [],
        risks: rec.risks || []
      }));
      setOptimizationSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load optimization suggestions:', error);
    }
  }, []);

  // Control functions
  const handleNodeClick = useCallback((nodeId: UUID) => {
    setSelectedNode(nodeId);
    if (onStageSelect) {
      onStageSelect(nodeId);
    }
  }, [onStageSelect]);

  const handleExecutionControl = useCallback(async (action: 'pause' | 'resume' | 'cancel') => {
    if (!currentPipeline || !currentExecution) return;
    
    try {
      await controlExecution(currentPipeline.id, currentExecution.id, action);
    } catch (error) {
      console.error(`Failed to ${action} execution:`, error);
    }
  }, [currentPipeline, currentExecution, controlExecution]);

  const togglePause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const acknowledgeAlert = useCallback((alertId: UUID) => {
    setAlerts(alerts => 
      alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const applyOptimization = useCallback(async (suggestionId: UUID) => {
    if (!currentPipeline) return;
    
    try {
      await pipelineManagementAPI.applyOptimization(currentPipeline.id, suggestionId);
      
      // Remove applied suggestion
      setOptimizationSuggestions(suggestions => 
        suggestions.filter(s => s.id !== suggestionId)
      );
      
      // Refresh visualization
      await initializePipelineVisualization();
    } catch (error) {
      console.error('Failed to apply optimization:', error);
    }
  }, [currentPipeline, initializePipelineVisualization]);

  // Render 3D visualization component
  const render3DVisualization = () => (
    <Canvas camera={{ position: [0, 0, 1000], fov: 60 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[100, 100, 100]} intensity={1} />
      <OrbitControls enableZoom enablePan enableRotate />
      
      {visualizationNodes.map(node => (
        <group key={node.id} position={[node.position.x, node.position.y, node.position.z]}>
          <Box
            args={[50, 30, 20]}
            onClick={() => handleNodeClick(node.id)}
          >
            <meshStandardMaterial 
              color={getNodeColor(node)} 
              transparent 
              opacity={0.8}
            />
          </Box>
          <Text
            position={[0, -25, 0]}
            fontSize={12}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {node.name}
          </Text>
        </group>
      ))}
      
      {visualizationEdges.map(edge => {
        const sourceNode = visualizationNodes.find(n => n.id === edge.source);
        const targetNode = visualizationNodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return null;
        
        return (
          <ThreeLine
            key={edge.id}
            points={[
              [sourceNode.position.x, sourceNode.position.y, sourceNode.position.z],
              [targetNode.position.x, targetNode.position.y, targetNode.position.z]
            ]}
            color={getEdgeColor(edge)}
            lineWidth={2}
          />
        );
      })}
    </Canvas>
  );

  // Get node color based on status and metrics
  const getNodeColor = useCallback((node: VisualizationNode): string => {
    switch (settings.colorScheme) {
      case 'performance':
        if (node.metrics.errorRate > 5) return '#ef4444'; // red
        if (node.metrics.resourceUtilization.cpu > 90) return '#f59e0b'; // amber
        if (node.metrics.throughput > 1000) return '#10b981'; // green
        return '#6b7280'; // gray
      
      case 'cost':
        const cost = node.resources.costs.total;
        if (cost > 100) return '#ef4444';
        if (cost > 50) return '#f59e0b';
        return '#10b981';
      
      case 'status':
        switch (node.status) {
          case 'running': return '#10b981';
          case 'failed': return '#ef4444';
          case 'paused': return '#f59e0b';
          default: return '#6b7280';
        }
      
      default:
        return '#3b82f6';
    }
  }, [settings.colorScheme]);

  // Get edge color based on status and throughput
  const getEdgeColor = useCallback((edge: VisualizationEdge): string => {
    switch (edge.status) {
      case 'active': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  }, []);

  // Memoized charts for performance
  const performanceChart = useMemo(() => (
    <ResponsiveContainer width="100%" height={200}>
      <RechartsLineChart data={performanceHistory}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <ChartTooltip />
        <Legend />
        <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} />
        <Line type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} />
      </RechartsLineChart>
    </ResponsiveContainer>
  ), [performanceHistory]);

  const resourceChart = useMemo(() => (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={resourceUsageHistory}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <ChartTooltip />
        <Legend />
        <Area type="monotone" dataKey="avgCpuUsage" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
        <Area type="monotone" dataKey="peakMemory" stackId="1" stroke="#10b981" fill="#10b981" />
        <Area type="monotone" dataKey="diskIO" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
        <Area type="monotone" dataKey="networkIO" stackId="1" stroke="#ef4444" fill="#ef4444" />
      </AreaChart>
    </ResponsiveContainer>
  ), [resourceUsageHistory]);

  // Main render
  return (
    <TooltipProvider>
      <div className={`h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${className}`}>
        {/* Header with controls */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Real-Time Pipeline Visualizer
            </h2>
            {currentPipeline && (
              <Badge variant="outline">
                {currentPipeline.name}
              </Badge>
            )}
            {currentExecution && (
              <Badge variant={currentExecution.status === 'running' ? 'default' : 'secondary'}>
                {currentExecution.status}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePause}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPaused ? 'Resume monitoring' : 'Pause monitoring'}
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => initializePipelineVisualization()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh visualization</TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSettings(s => ({ ...s, viewMode: s.viewMode === '2d' ? '3d' : '2d' }))}>
                  Switch to {settings.viewMode === '2d' ? '3D' : '2D'} View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSettings(s => ({ ...s, showMetrics: !s.showMetrics }))}>
                  {settings.showMetrics ? 'Hide' : 'Show'} Metrics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSettings(s => ({ ...s, showPredictions: !s.showPredictions }))}>
                  {settings.showPredictions ? 'Hide' : 'Show'} Predictions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? 'Exit' : 'Enter'} Fullscreen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main content area */}
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100%-4rem)]">
          {/* Main visualization panel */}
          <ResizablePanel defaultSize={70} minSize={50}>
            <div className="h-full p-4">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Pipeline Topology</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Select value={settings.layout} onValueChange={(value) => setSettings(s => ({ ...s, layout: value as VisualizationSettings['layout'] }))}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hierarchical">Hierarchical</SelectItem>
                          <SelectItem value="force_directed">Force Directed</SelectItem>
                          <SelectItem value="circular">Circular</SelectItem>
                          <SelectItem value="layered">Layered</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={settings.colorScheme} onValueChange={(value) => setSettings(s => ({ ...s, colorScheme: value as VisualizationSettings['colorScheme'] }))}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="cost">Cost</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-4rem)]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                    </div>
                  ) : error ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : settings.viewMode === '3d' ? (
                    <div ref={canvasRef} className="h-full w-full">
                      {render3DVisualization()}
                    </div>
                  ) : (
                    <svg
                      ref={svgRef}
                      className="h-full w-full"
                      viewBox="0 0 800 600"
                    >
                      {/* 2D visualization with D3.js */}
                      {visualizationNodes.map(node => (
                        <g key={node.id}>
                          <circle
                            cx={node.position.x}
                            cy={node.position.y}
                            r={25}
                            fill={getNodeColor(node)}
                            stroke="#fff"
                            strokeWidth={2}
                            className="cursor-pointer hover:opacity-75"
                            onClick={() => handleNodeClick(node.id)}
                          />
                          <text
                            x={node.position.x}
                            y={node.position.y + 40}
                            textAnchor="middle"
                            className="text-xs font-medium fill-slate-600 dark:fill-slate-300"
                          >
                            {node.name}
                          </text>
                        </g>
                      ))}
                      
                      {visualizationEdges.map(edge => {
                        const sourceNode = visualizationNodes.find(n => n.id === edge.source);
                        const targetNode = visualizationNodes.find(n => n.id === edge.target);
                        
                        if (!sourceNode || !targetNode) return null;
                        
                        return (
                          <line
                            key={edge.id}
                            x1={sourceNode.position.x}
                            y1={sourceNode.position.y}
                            x2={targetNode.position.x}
                            y2={targetNode.position.y}
                            stroke={getEdgeColor(edge)}
                            strokeWidth={2}
                            markerEnd="url(#arrowhead)"
                          />
                        );
                      })}
                      
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill="#6b7280"
                          />
                        </marker>
                      </defs>
                    </svg>
                  )}
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right panel with metrics and controls */}
          <ResizablePanel defaultSize={30} minSize={25}>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {/* Performance metrics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceChart}
                  </CardContent>
                </Card>

                {/* Resource utilization */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {resourceChart}
                  </CardContent>
                </Card>

                {/* Alerts panel */}
                {showAlerts && alerts.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Alerts ({alerts.filter(a => !a.acknowledged).length})
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllAlerts}
                        >
                          Clear All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {alerts.slice(0, 10).map(alert => (
                            <div
                              key={alert.id}
                              className={`p-3 rounded-lg border ${
                                alert.acknowledged ? 'opacity-50' : ''
                              } ${
                                alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                                alert.severity === 'error' ? 'border-orange-200 bg-orange-50' :
                                alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                                'border-blue-200 bg-blue-50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-slate-900">
                                    {alert.title}
                                  </h4>
                                  <p className="text-xs text-slate-600 mt-1">
                                    {alert.message}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                                {!alert.acknowledged && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => acknowledgeAlert(alert.id)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Optimization suggestions */}
                {showOptimizations && optimizationSuggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        AI Optimization Suggestions ({optimizationSuggestions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {optimizationSuggestions.map(suggestion => (
                            <div
                              key={suggestion.id}
                              className="p-3 rounded-lg border border-slate-200 bg-slate-50"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-slate-900">
                                    {suggestion.title}
                                  </h4>
                                  <p className="text-xs text-slate-600 mt-1">
                                    {suggestion.description}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {suggestion.impact} impact
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {suggestion.effort} effort
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      +{suggestion.expectedImprovement}%
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => applyOptimization(suggestion.id)}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Selected node details */}
                {selectedNode && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Stage Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const node = visualizationNodes.find(n => n.id === selectedNode);
                        if (!node) return null;
                        
                        return (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs font-medium">Name</Label>
                              <p className="text-sm">{node.name}</p>
                            </div>
                            
                            <div>
                              <Label className="text-xs font-medium">Type</Label>
                              <p className="text-sm">{node.type}</p>
                            </div>
                            
                            <div>
                              <Label className="text-xs font-medium">Group</Label>
                              <p className="text-sm">{node.group}</p>
                            </div>
                            
                            <div>
                              <Label className="text-xs font-medium">Status</Label>
                              <Badge variant={node.status === 'running' ? 'default' : 'secondary'}>
                                {node.status}
                              </Badge>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Resource Utilization</Label>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>CPU</span>
                                  <span>{node.metrics.resourceUtilization.cpu.toFixed(1)}%</span>
                                </div>
                                <Progress value={node.metrics.resourceUtilization.cpu} className="h-1" />
                                
                                <div className="flex justify-between text-xs">
                                  <span>Memory</span>
                                  <span>{node.metrics.resourceUtilization.memory.toFixed(1)}%</span>
                                </div>
                                <Progress value={node.metrics.resourceUtilization.memory} className="h-1" />
                                
                                <div className="flex justify-between text-xs">
                                  <span>Disk I/O</span>
                                  <span>{node.metrics.resourceUtilization.disk.toFixed(1)}%</span>
                                </div>
                                <Progress value={node.metrics.resourceUtilization.disk} className="h-1" />
                                
                                <div className="flex justify-between text-xs">
                                  <span>Network</span>
                                  <span>{node.metrics.resourceUtilization.network.toFixed(1)}%</span>
                                </div>
                                <Progress value={node.metrics.resourceUtilization.network} className="h-1" />
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Performance Metrics</Label>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-600">Records Processed</span>
                                  <p className="font-medium">{node.metrics.recordsProcessed.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="text-slate-600">Throughput</span>
                                  <p className="font-medium">{node.metrics.throughput.toFixed(1)}/s</p>
                                </div>
                                <div>
                                  <span className="text-slate-600">Error Rate</span>
                                  <p className="font-medium">{node.metrics.errorRate.toFixed(2)}%</p>
                                </div>
                                <div>
                                  <span className="text-slate-600">Processing Time</span>
                                  <p className="font-medium">{node.metrics.processingTime.toFixed(1)}s</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
};

export default RealTimePipelineVisualizer;