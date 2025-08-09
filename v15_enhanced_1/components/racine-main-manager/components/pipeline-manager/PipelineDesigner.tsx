'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Workflow, GitBranch, Database, Search, Shield, Users, Brain, Package,
  Activity, Play, Pause, Stop, Settings, Save, Download, Upload, Copy,
  Trash2, Edit3, Plus, Minus, ZoomIn, ZoomOut, Maximize2, Grid, Target,
  ArrowRight, ArrowDown, ArrowUp, ArrowLeft, CornerDownRight, Route,
  Layers, Code, Terminal, FileText, FolderOpen, Cpu, Memory, HardDrive,
  Network, Globe, Monitor, Server, Cloud, RefreshCw, AlertTriangle, 
  CheckCircle, XCircle, Clock, Eye, EyeOff, Filter, MoreHorizontal, X,
  Zap, TrendingUp, BarChart3, PieChart, LineChart, DollarSign, Award,
  Star, Crown, Diamond, Circle, Square, Triangle, Hexagon, Octagon,
  User, MessageSquare
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

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
  Scatter
} from 'recharts';

// Racine System Imports
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import { 
  executePipelineStage,
  orchestrateCrossSPAPipeline,
  validatePipelineConfiguration,
  optimizePipelinePerformance
} from '../../utils/pipeline-backend-integration';

// Types from racine-core.types
import { 
  Pipeline,
  PipelineStage,
  PipelineStep,
  StageConfiguration,
  PipelineTemplate,
  PipelineExecution,
  ResourceAllocation,
  PipelineMetrics,
  PipelineValidation,
  CrossSPAPipelineMapping,
  StageOrchestration,
  PipelineOptimization,
  ConditionalFlow,
  ParallelExecution,
  StageHealthStatus,
  PipelineResource,
  ExecutionPlan,
  StageTemplate,
  PipelineAnalytics,
  ResourceMonitoring,
  PerformanceProfile,
  CostAnalysis
} from '../../types/racine-core.types';

/**
 * Advanced Pipeline Designer Component
 * 
 * Enterprise-grade visual pipeline builder with capabilities surpassing Databricks:
 * - Advanced stage-based pipeline design with multi-level orchestration
 * - Cross-SPA integration with all 7 existing SPAs (data-sources, scan-rule-sets, etc.)
 * - Intelligent conditional logic and parallel execution frameworks
 * - Real-time resource management and optimization recommendations
 * - AI-powered pipeline optimization with ML-driven insights
 * - Advanced template system with community marketplace
 * - Comprehensive monitoring and analytics integration
 * - Version control with git-like branching and merging
 * - Enterprise security and compliance validation
 * - Advanced drag-and-drop canvas with infinite zoom and grid snapping
 * - Real-time collaborative editing with live user presence
 * - Advanced 3D pipeline topology visualization
 * - Intelligent auto-layout algorithms with force-directed positioning
 * - Advanced conditional logic builder with visual branching
 * - Performance prediction using ML models
 * - Cost optimization with resource analysis
 * - Advanced error handling and recovery mechanisms
 * - Cross-platform compatibility and export capabilities
 */

// Cross-SPA Pipeline Stage Configurations - Dynamic from Backend
const useCrossSPAPipelineStages = () => {
  const [stages, setStages] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { getCrossGroupIntegrationPoints } = useCrossGroupIntegration();

  useEffect(() => {
    const loadStages = async () => {
      try {
        setLoading(true);
        const integrationPoints = await getCrossGroupIntegrationPoints();
        
        const dynamicStages = integrationPoints.reduce((acc: any, point: any) => {
          acc[point.id.toUpperCase()] = {
            id: point.id,
            name: point.name,
            icon: point.icon || Database,
            color: point.color || '#10b981',
            gradient: point.gradient || 'from-emerald-400 to-emerald-600',
            category: point.category || 'general',
            description: point.description,
            spa_integration: point.spa_integration,
            steps: point.steps || [],
            success_criteria: point.success_criteria || [],
            failure_conditions: point.failure_conditions || [],
            typical_duration: point.typical_duration || 300,
            complexity_score: point.complexity_score || 5.0
          };
          return acc;
        }, {});
        
        setStages(dynamicStages);
      } catch (error) {
        console.error('Failed to load pipeline stages:', error);
        // Fallback to essential stages if backend fails
        setStages({
          DATA_INGESTION: {
            id: 'data_ingestion',
            name: 'Data Ingestion & Connection',
            icon: Database,
            spa_integration: 'data-sources',
            steps: [],
            typical_duration: 300,
            complexity_score: 5.0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadStages();
  }, [getCrossGroupIntegrationPoints]);

  return { stages, loading };
};

// Pipeline Templates - Dynamic from Backend
const usePipelineTemplates = () => {
  const [templates, setTemplates] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { getPipelineTemplates } = usePipelineManagement();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const backendTemplates = await getPipelineTemplates();
        
        const dynamicTemplates = backendTemplates.reduce((acc: any, template: any) => {
          acc[template.id.toUpperCase()] = {
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            complexity: template.complexity,
            estimated_duration: template.estimated_duration,
            stages: template.stages,
            parallel_execution: template.parallel_execution || {},
            conditional_logic: template.conditional_logic || {}
          };
          return acc;
        }, {});
        
        setTemplates(dynamicTemplates);
      } catch (error) {
        console.error('Failed to load pipeline templates:', error);
        setTemplates({});
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [getPipelineTemplates]);

  return { templates, loading };
};

// Resource Types - Dynamic from Backend
const useResourceTypes = () => {
  const [resourceTypes, setResourceTypes] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { getWorkspaceResourceLimits } = useWorkspaceManagement();

  useEffect(() => {
    const loadResourceTypes = async () => {
      try {
        setLoading(true);
        const resourceConfig = await getWorkspaceResourceLimits();
        
        const dynamicTypes = resourceConfig.resource_types || {
          CPU: { name: 'CPU Cores', unit: 'cores', min: 0.5, max: 32, step: 0.5, default: 2 },
          MEMORY: { name: 'Memory', unit: 'GB', min: 1, max: 128, step: 1, default: 4 },
          STORAGE: { name: 'Storage', unit: 'GB', min: 0.1, max: 1000, step: 0.1, default: 10 },
          NETWORK: { name: 'Network', unit: 'Mbps', min: 10, max: 10000, step: 10, default: 100 }
        };
        
        setResourceTypes(dynamicTypes);
      } catch (error) {
        console.error('Failed to load resource types:', error);
        // Fallback to default values
        setResourceTypes({
          CPU: { name: 'CPU Cores', unit: 'cores', min: 0.5, max: 32, step: 0.5, default: 2 },
          MEMORY: { name: 'Memory', unit: 'GB', min: 1, max: 128, step: 1, default: 4 }
        });
      } finally {
        setLoading(false);
      }
    };

    loadResourceTypes();
  }, [getWorkspaceResourceLimits]);

  return { resourceTypes, loading };
};

// Conditional Flow Types - Dynamic from Backend
const useConditionalFlowTypes = () => {
  const [flowTypes, setFlowTypes] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlowTypes = async () => {
      try {
        setLoading(true);
        // Load from backend pipeline configuration service
        const response = await fetch('/api/pipeline-config/flow-types');
        const backendFlowTypes = await response.json();
        
        const dynamicFlowTypes = backendFlowTypes.reduce((acc: any, flow: any) => {
          acc[flow.type.toUpperCase()] = {
            type: flow.type,
            color: flow.color,
            label: flow.label
          };
          return acc;
        }, {});
        
        setFlowTypes(dynamicFlowTypes);
      } catch (error) {
        console.error('Failed to load flow types:', error);
        // Fallback to essential flow types
        setFlowTypes({
          SUCCESS: { type: 'success', color: '#10b981', label: 'On Success' },
          FAILURE: { type: 'failure', color: '#ef4444', label: 'On Failure' },
          CONDITIONAL: { type: 'conditional', color: '#f59e0b', label: 'Conditional' }
        });
      } finally {
        setLoading(false);
      }
    };

    loadFlowTypes();
  }, []);

  return { flowTypes, loading };
};

interface PipelineDesignerProps {
  pipelineId?: string;
  initialPipeline?: Pipeline;
  templates?: PipelineTemplate[];
  onPipelineChange?: (pipeline: Pipeline) => void;
  onPipelineExecute?: (pipeline: Pipeline) => void;
  onPipelineSave?: (pipeline: Pipeline) => void;
  readonly?: boolean;
  showAdvancedFeatures?: boolean;
  enableTemplates?: boolean;
  enableCollaboration?: boolean;
  enableAIAssistance?: boolean;
  enable3DVisualization?: boolean;
  enableVersionControl?: boolean;
  enableCostOptimization?: boolean;
  enablePerformancePrediction?: boolean;
  className?: string;
}

// Advanced AI Assistant Configuration
const AI_ASSISTANT_FEATURES = {
  STAGE_RECOMMENDATIONS: {
    id: 'stage_recommendations',
    name: 'Smart Stage Recommendations',
    description: 'AI suggests optimal stages based on data flow and requirements',
    enabled: true
  },
  LAYOUT_OPTIMIZATION: {
    id: 'layout_optimization', 
    name: 'Auto Layout Optimization',
    description: 'Automatically arranges stages for optimal readability and flow',
    enabled: true
  },
  PERFORMANCE_PREDICTION: {
    id: 'performance_prediction',
    name: 'Performance Prediction',
    description: 'Predicts pipeline execution time and resource usage',
    enabled: true
  },
  COST_ANALYSIS: {
    id: 'cost_analysis',
    name: 'Real-time Cost Analysis',
    description: 'Analyzes and predicts pipeline execution costs',
    enabled: true
  },
  ERROR_PREVENTION: {
    id: 'error_prevention',
    name: 'Intelligent Error Prevention',
    description: 'Identifies potential issues before pipeline execution',
    enabled: true
  },
  OPTIMIZATION_SUGGESTIONS: {
    id: 'optimization_suggestions',
    name: 'Optimization Suggestions',
    description: 'Provides suggestions for improving pipeline efficiency',
    enabled: true
  }
};

// Real-time Collaboration Features
const COLLABORATION_FEATURES = {
  LIVE_CURSORS: {
    id: 'live_cursors',
    name: 'Live User Cursors',
    description: 'See other users\' cursors in real-time',
    enabled: true
  },
  PRESENCE_INDICATORS: {
    id: 'presence_indicators',
    name: 'User Presence',
    description: 'Show who is currently viewing/editing the pipeline',
    enabled: true
  },
  REAL_TIME_COMMENTS: {
    id: 'real_time_comments',
    name: 'Real-time Comments',
    description: 'Add and discuss pipeline elements in real-time',
    enabled: true
  },
  CHANGE_TRACKING: {
    id: 'change_tracking',
    name: 'Live Change Tracking',
    description: 'Track and display changes as they happen',
    enabled: true
  },
  COLLABORATIVE_EDITING: {
    id: 'collaborative_editing',
    name: 'Collaborative Editing',
    description: 'Multiple users can edit simultaneously',
    enabled: true
  }
};

// Advanced Visualization Options
const VISUALIZATION_MODES = {
  CLASSIC_2D: {
    id: 'classic_2d',
    name: 'Classic 2D View',
    description: 'Traditional flowchart-style visualization',
    icon: 'Layout'
  },
  ADVANCED_3D: {
    id: 'advanced_3d',
    name: 'Advanced 3D Topology',
    description: 'Immersive 3D pipeline visualization with depth',
    icon: 'Box'
  },
  NETWORK_GRAPH: {
    id: 'network_graph',
    name: 'Network Graph',
    description: 'Force-directed network layout for complex pipelines',
    icon: 'Network'
  },
  TIMELINE_VIEW: {
    id: 'timeline_view',
    name: 'Timeline View',
    description: 'Chronological execution timeline visualization',
    icon: 'Clock'
  },
  RESOURCE_VIEW: {
    id: 'resource_view',
    name: 'Resource Allocation View',
    description: 'Visualize resource usage and allocation',
    icon: 'Cpu'
  }
};

const PipelineDesigner: React.FC<PipelineDesignerProps> = ({
  pipelineId,
  initialPipeline,
  templates = [],
  onPipelineChange,
  onPipelineExecute,
  onPipelineSave,
  readonly = false,
  showAdvancedFeatures = true,
  enableTemplates = true,
  enableCollaboration = true,
  enableAIAssistance = true,
  enable3DVisualization = true,
  enableVersionControl = true,
  enableCostOptimization = true,
  enablePerformancePrediction = true,
  className = ''
}) => {
  // Dynamic Backend Data Hooks
  const { stages: CROSS_SPA_PIPELINE_STAGES, loading: stagesLoading } = useCrossSPAPipelineStages();
  const { templates: PIPELINE_TEMPLATES, loading: templatesLoading } = usePipelineTemplates();
  const { resourceTypes: RESOURCE_TYPES, loading: resourceTypesLoading } = useResourceTypes();
  const { flowTypes: CONDITIONAL_FLOW_TYPES, loading: flowTypesLoading } = useConditionalFlowTypes();

  // Canvas and Drawing State
  const canvasRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  // Pipeline State with backend-generated ID
  const [pipeline, setPipeline] = useState<Pipeline>(() => initialPipeline || {
    id: pipelineId || `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'New Pipeline',
    description: '',
    stages: [],
    connections: [],
    configuration: {
      parallel_execution: true,
      error_handling: 'stop_on_error',
      retry_policy: { max_retries: 3, retry_delay: 5000 },
      timeout: 86400000, // 24 hours
      resource_allocation: 'auto'
    },
    metadata: {
      created_at: new Date().toISOString(),
      created_by: '',
      version: '1.0.0',
      tags: [],
      category: 'custom'
    },
    status: 'draft',
    estimated_duration: 0,
    complexity_score: 0
  });

  // UI State
  const [activeTab, setActiveTab] = useState('design');
  const [showStageLibrary, setShowStageLibrary] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [stageLibrarySearch, setStageLibrarySearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  // Advanced UI State for enhanced features
  const [visualizationMode, setVisualizationMode] = useState<keyof typeof VISUALIZATION_MODES>('CLASSIC_2D');
  const [showAIAssistant, setShowAIAssistant] = useState(enableAIAssistance);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(enableCollaboration);
  const [show3DControls, setShow3DControls] = useState(enable3DVisualization);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const [showPerformancePrediction, setShowPerformancePrediction] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [liveCursors, setLiveCursors] = useState<Map<string, any>>(new Map());
  const [realtimeComments, setRealtimeComments] = useState<any[]>([]);
  const [pipelineVersions, setPipelineVersions] = useState<any[]>([]);
  const [costPrediction, setCostPrediction] = useState<any>(null);
  const [performancePrediction, setPerformancePrediction] = useState<any>(null);
  const [autoLayoutEnabled, setAutoLayoutEnabled] = useState(false);
  const [gridSnapEnabled, setGridSnapEnabled] = useState(true);
  const [showGridLines, setShowGridLines] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [collaborativeMode, setCollaborativeMode] = useState('edit');
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [validationResults, setValidationResults] = useState<any>({});
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<any[]>([]);
  const [errorPredictions, setErrorPredictions] = useState<any[]>([]);
  const [resourcePredictions, setResourcePredictions] = useState<any>({});
  const [executionSimulation, setExecutionSimulation] = useState<any>(null);
  const [complianceChecks, setComplianceChecks] = useState<any>({});
  const [securityValidation, setSecurityValidation] = useState<any>({});
  const [crossGroupCompatibility, setCrossGroupCompatibility] = useState<any>({});
  const [templateSuggestions, setTemplateSuggestions] = useState<any[]>([]);
  const [stageRecommendations, setStageRecommendations] = useState<any[]>([]);
  const [workflowAnalytics, setWorkflowAnalytics] = useState<any>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [collaborationHistory, setCollaborationHistory] = useState<any[]>([]);
  const [exportOptions, setExportOptions] = useState<any>({});
  const [importPreview, setImportPreview] = useState<any>(null);
  const [stageDependencies, setStageDependencies] = useState<Map<string, string[]>>(new Map());
  const [parallelExecutionPlan, setParallelExecutionPlan] = useState<any>(null);
  const [resourceOptimization, setResourceOptimization] = useState<any>(null);
  const [dataLineage, setDataLineage] = useState<any>(null);
  const [governanceCompliance, setGovernanceCompliance] = useState<any>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);

  // Backend Integration Hooks
  const { 
    createPipeline,
    updatePipeline,
    executePipeline,
    validatePipeline,
    optimizePipeline,
    getPipelineTemplates,
    savePipelineTemplate,
    getPipelineMetrics,
    isExecuting,
    isValidating,
    error
  } = usePipelineManagement(pipeline);

  const {
    coordinateExecution,
    monitorResources,
    optimizeResourceAllocation,
    getSystemHealth
  } = useRacineOrchestration();

  const {
    validateCrossGroupPipeline,
    orchestrateCrossGroupExecution,
    getCrossGroupMetrics,
    testSPAConnectivity
  } = useCrossGroupIntegration();

  const { getCurrentUser, getUserPermissions } = useUserManagement();
  const { getActiveWorkspace, getWorkspaceResources } = useWorkspaceManagement();
  const { trackActivity } = useActivityTracker();
  const { 
    getOptimizationSuggestions,
    analyzePipelinePerformance,
    predictExecutionTime,
    generatePipelineInsights
  } = useAIAssistant();

  // Canvas manipulation functions
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !selectedStage) { // Left click and no stage selected
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasTransform.x, y: e.clientY - canvasTransform.y });
    }
  }, [selectedStage, canvasTransform]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setCanvasTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  }, [isDragging, dragStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, canvasTransform.scale * delta));
    
    setCanvasTransform(prev => ({
      ...prev,
      scale: newScale
    }));
  }, [canvasTransform.scale]);

  // Stage management functions
  const addStage = useCallback((stageConfig: any, position: { x: number, y: number }) => {
    // Generate stage ID using backend service
    const generateStageId = async () => {
      try {
        const response = await fetch('/api/pipeline-stages/generate-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            pipeline_id: pipeline.id,
            stage_type: stageConfig.id,
            workspace_id: currentWorkspace?.id 
          })
        });
        const { stage_id } = await response.json();
        return stage_id;
      } catch (error) {
        console.error('Failed to generate stage ID:', error);
        // Fallback to timestamp-based ID
        return `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    };

    const createStage = async () => {
      const stageId = await generateStageId();
      
      const newStage: PipelineStage = {
        id: stageId,
        type: stageConfig.id,
        name: stageConfig.name,
        description: stageConfig.description,
        position,
        configuration: {
          spa_integration: stageConfig.spa_integration,
          steps: stageConfig.steps,
          parallel_execution: true,
          timeout: stageConfig.typical_duration * 1000,
          retry_policy: { max_retries: 2, retry_delay: 3000 },
          resource_requirements: stageConfig.steps.reduce((acc: any, step: any) => ({
            cpu: acc.cpu + step.resource_requirements.cpu,
            memory: acc.memory + parseFloat(step.resource_requirements.memory.replace('GB', '')),
            storage: acc.storage + parseFloat(step.resource_requirements.storage.replace(/[GM]B/, ''))
          }), { cpu: 0, memory: 0, storage: 0 })
        },
        metadata: {
          category: stageConfig.category,
          complexity_score: stageConfig.complexity_score,
          estimated_duration: stageConfig.typical_duration,
          spa_api_endpoints: stageConfig.steps.map((step: any) => step.spa_api),
          created_by: currentUser?.id,
          created_at: new Date().toISOString()
        },
        status: 'pending',
        health: 'unknown'
      };

      setPipeline(prev => ({
        ...prev,
        stages: [...prev.stages, newStage],
        estimated_duration: prev.estimated_duration + stageConfig.typical_duration,
        complexity_score: prev.complexity_score + stageConfig.complexity_score
      }));

      if (onPipelineChange) {
        onPipelineChange({ ...pipeline, stages: [...pipeline.stages, newStage] });
      }

      trackActivity('pipeline_stage_added', { 
        stage_type: stageConfig.id, 
        pipeline_id: pipeline.id,
        stage_id: stageId
      });
    };

    createStage();
  }, [pipeline, onPipelineChange, trackActivity, currentUser, currentWorkspace]);

  const removeStage = useCallback((stageId: string) => {
    setPipeline(prev => ({
      ...prev,
      stages: prev.stages.filter(stage => stage.id !== stageId),
      connections: prev.connections.filter(conn => 
        conn.source_stage_id !== stageId && conn.target_stage_id !== stageId
      )
    }));

    if (selectedStage === stageId) {
      setSelectedStage(null);
    }

    trackActivity('pipeline_stage_removed', { stage_id: stageId, pipeline_id: pipeline.id });
  }, [selectedStage, trackActivity, pipeline.id]);

  const updateStagePosition = useCallback((stageId: string, position: { x: number, y: number }) => {
    setPipeline(prev => ({
      ...prev,
      stages: prev.stages.map(stage => 
        stage.id === stageId ? { ...stage, position } : stage
      )
    }));
  }, []);

  const connectStages = useCallback((sourceId: string, targetId: string, flowType: string = 'SUCCESS') => {
    // Generate connection ID using backend service
    const generateConnectionId = async () => {
      try {
        const response = await fetch('/api/pipeline-connections/generate-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            pipeline_id: pipeline.id,
            source_stage_id: sourceId,
            target_stage_id: targetId,
            flow_type: flowType
          })
        });
        const { connection_id } = await response.json();
        return connection_id;
      } catch (error) {
        console.error('Failed to generate connection ID:', error);
        return `conn_${sourceId}_${targetId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    };

    const createConnection = async () => {
      const connectionId = await generateConnectionId();
      const flowConfig = CONDITIONAL_FLOW_TYPES[flowType];
      
      const newConnection = {
        id: connectionId,
        source_stage_id: sourceId,
        target_stage_id: targetId,
        type: flowType,
        condition: flowType === 'CONDITIONAL' ? 'true' : undefined,
        metadata: {
          created_at: new Date().toISOString(),
          created_by: currentUser?.id,
          flow_type: flowConfig
        }
      };

      setPipeline(prev => ({
        ...prev,
        connections: [...prev.connections, newConnection]
      }));

      setIsConnecting(false);
      setConnectionStart(null);

      trackActivity('pipeline_connection_added', { 
        source_stage: sourceId, 
        target_stage: targetId, 
        flow_type: flowType,
        pipeline_id: pipeline.id,
        connection_id: connectionId
      });
    };

    createConnection();
  }, [CONDITIONAL_FLOW_TYPES, trackActivity, pipeline.id, currentUser]);

  // Template application with backend validation
  const applyTemplate = useCallback(async (templateId: string) => {
    const template = PIPELINE_TEMPLATES[templateId];
    if (!template) return;

    try {
      // Validate template compatibility with current workspace
      const validationResponse = await fetch('/api/pipeline-templates/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          workspace_id: currentWorkspace?.id,
          user_permissions: userPermissions
        })
      });
      
      const validation = await validationResponse.json();
      if (!validation.is_compatible) {
        console.error('Template not compatible:', validation.issues);
        return;
      }

      // Generate stage IDs through backend
      const stageIdsResponse = await fetch('/api/pipeline-stages/generate-batch-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipeline_id: pipeline.id,
          stage_count: template.stages.length,
          template_id: templateId
        })
      });
      
      const { stage_ids } = await stageIdsResponse.json();

      const templateStages: PipelineStage[] = template.stages.map((stageType: string, index: number) => {
        const stageConfig = CROSS_SPA_PIPELINE_STAGES[stageType.toUpperCase() as keyof typeof CROSS_SPA_PIPELINE_STAGES];
        return {
          id: stage_ids[index],
          type: stageConfig.id,
          name: stageConfig.name,
          description: stageConfig.description,
          position: { x: 200 + (index * 300), y: 200 },
          configuration: {
            spa_integration: stageConfig.spa_integration,
            steps: stageConfig.steps,
            parallel_execution: true,
            timeout: stageConfig.typical_duration * 1000,
            retry_policy: { max_retries: 2, retry_delay: 3000 },
            resource_requirements: stageConfig.steps?.reduce((acc: any, step: any) => ({
              cpu: acc.cpu + step.resource_requirements.cpu,
              memory: acc.memory + parseFloat(step.resource_requirements.memory.replace('GB', '')),
              storage: acc.storage + parseFloat(step.resource_requirements.storage.replace(/[GM]B/, ''))
            }), { cpu: 0, memory: 0, storage: 0 }) || { cpu: 1, memory: 2, storage: 1 }
          },
          metadata: {
            category: stageConfig.category,
            complexity_score: stageConfig.complexity_score,
            estimated_duration: stageConfig.typical_duration,
            spa_api_endpoints: stageConfig.steps?.map((step: any) => step.spa_api) || [],
            template_source: templateId,
            created_by: currentUser?.id,
            created_at: new Date().toISOString()
          },
          status: 'pending',
          health: 'unknown'
        };
      });

      // Generate connection IDs for sequential connections
      const connectionIdsResponse = await fetch('/api/pipeline-connections/generate-batch-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipeline_id: pipeline.id,
          connection_count: templateStages.length - 1,
          template_id: templateId
        })
      });
      
      const { connection_ids } = await connectionIdsResponse.json();

      const templateConnections = templateStages.slice(0, -1).map((stage, index) => ({
        id: connection_ids[index],
        source_stage_id: stage.id,
        target_stage_id: templateStages[index + 1].id,
        type: 'SUCCESS' as const,
        metadata: {
          created_at: new Date().toISOString(),
          created_by: currentUser?.id,
          template_source: templateId,
          flow_type: CONDITIONAL_FLOW_TYPES.SUCCESS
        }
      }));

      setPipeline(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        stages: templateStages,
        connections: templateConnections,
        estimated_duration: template.estimated_duration,
        complexity_score: templateStages.reduce((acc, stage) => acc + stage.metadata.complexity_score, 0),
        metadata: {
          ...prev.metadata,
          category: template.category,
          template_id: templateId,
          last_modified: new Date().toISOString(),
          modified_by: currentUser?.id
        }
      }));

      setShowTemplateDialog(false);
      trackActivity('pipeline_template_applied', { 
        template_id: templateId, 
        pipeline_id: pipeline.id,
        stages_added: templateStages.length,
        connections_added: templateConnections.length
      });

    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  }, [PIPELINE_TEMPLATES, CROSS_SPA_PIPELINE_STAGES, CONDITIONAL_FLOW_TYPES, pipeline.id, currentWorkspace, userPermissions, currentUser, trackActivity]);

  // Pipeline execution
  const handleExecutePipeline = useCallback(async () => {
    if (!pipeline.stages.length || readonly) return;

    try {
      setShowExecutionDialog(false);
      
      // Validate pipeline before execution
      const validation = await validatePipeline(pipeline.id);
      if (!validation.is_valid) {
        console.error('Pipeline validation failed:', validation.errors);
        return;
      }

      // Execute pipeline through backend
      const execution = await executePipeline(pipeline.id);
      
      if (onPipelineExecute) {
        onPipelineExecute(pipeline);
      }

      trackActivity('pipeline_execution_started', { 
        pipeline_id: pipeline.id, 
        execution_id: execution.id,
        stages_count: pipeline.stages.length 
      });
    } catch (error) {
      console.error('Failed to execute pipeline:', error);
    }
  }, [pipeline, readonly, validatePipeline, executePipeline, onPipelineExecute, trackActivity]);

  // Stage Library Filter
  const filteredStages = useMemo(() => {
    const stages = Object.values(CROSS_SPA_PIPELINE_STAGES);
    if (!stageLibrarySearch) return stages;
    
    return stages.filter(stage => 
      stage.name.toLowerCase().includes(stageLibrarySearch.toLowerCase()) ||
      stage.description.toLowerCase().includes(stageLibrarySearch.toLowerCase()) ||
      stage.category.toLowerCase().includes(stageLibrarySearch.toLowerCase())
    );
  }, [stageLibrarySearch]);

  // Stage drag handlers
  const handleStageDragStart = useCallback((stageConfig: any) => {
    // Store stage config for drop handling
    (window as any).draggedStageConfig = stageConfig;
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const stageConfig = (window as any).draggedStageConfig;
    if (!stageConfig) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = {
      x: (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale,
      y: (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale
    };

    addStage(stageConfig, position);
    (window as any).draggedStageConfig = null;
  }, [canvasTransform, addStage]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Load templates on component mount
  useEffect(() => {
    getPipelineTemplates();
  }, [getPipelineTemplates]);

  // Auto-save pipeline changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pipeline.id && !readonly) {
        updatePipeline(pipeline.id, pipeline);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [pipeline, readonly, updatePipeline]);

  // Advanced AI Assistant Functions
  const initializeAIAssistant = useCallback(async () => {
    if (!enableAIAssistance) return;
    
    try {
      setAiAssistantActive(true);
      
      // Get AI recommendations for pipeline optimization
      const aiRecommendations = await getOptimizationSuggestions({
        pipeline,
        context: {
          workspace: currentWorkspace,
          user: currentUser,
          recentActivity: await getActivityMetrics({ timeframe: '24h' })
        }
      });
      
      setAiSuggestions(aiRecommendations);
      
      // Predict performance metrics
      if (enablePerformancePrediction) {
        const performancePredict = await predictExecutionTime(pipeline);
        setPerformancePrediction(performancePredict);
      }
      
      // Analyze cost implications
      if (enableCostOptimization) {
        const costAnalysis = await analyzePipelinePerformance({
          pipeline,
          resourceConstraints: await getWorkspaceResourceLimits()
        });
        setCostPrediction(costAnalysis);
      }
      
      // Generate stage recommendations
      const stageRecs = await generatePipelineInsights({
        pipeline,
        availableStages: Object.values(CROSS_SPA_PIPELINE_STAGES),
        userPreferences: currentUser?.preferences
      });
      setStageRecommendations(stageRecs);
      
    } catch (error) {
      console.error('Failed to initialize AI assistant:', error);
    }
  }, [enableAIAssistance, pipeline, currentWorkspace, currentUser, enablePerformancePrediction, enableCostOptimization]);

  // Real-time Collaboration Functions
  const initializeCollaboration = useCallback(async () => {
    if (!enableCollaboration) return;
    
    try {
      // Setup WebSocket connection for real-time collaboration
      const collaborationSocket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/collaboration/pipeline/${pipeline.id}`);
      
      collaborationSocket.onopen = () => {
        // Join collaboration session
        collaborationSocket.send(JSON.stringify({
          type: 'join',
          pipelineId: pipeline.id,
          user: currentUser
        }));
      };
      
      collaborationSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'user_joined':
            setCollaborators(prev => [...prev, message.user]);
            break;
          case 'user_left':
            setCollaborators(prev => prev.filter(u => u.id !== message.user.id));
            break;
          case 'cursor_moved':
            setLiveCursors(prev => new Map(prev.set(message.userId, message.position)));
            break;
          case 'stage_updated':
            // Handle real-time stage updates from other users
            setPipeline(prev => ({
              ...prev,
              stages: prev.stages.map(stage => 
                stage.id === message.stageId ? { ...stage, ...message.updates } : stage
              )
            }));
            break;
          case 'comment_added':
            setRealtimeComments(prev => [...prev, message.comment]);
            break;
          case 'pipeline_changed':
            // Handle collaborative pipeline changes
            if (message.userId !== currentUser?.id) {
              setPipeline(prev => ({ ...prev, ...message.changes }));
            }
            break;
        }
      };
      
      // Track activity
      trackActivity('collaboration_session_started', {
        pipeline_id: pipeline.id,
        collaboration_enabled: true
      });
      
      return () => {
        collaborationSocket.close();
      };
      
    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
    }
  }, [enableCollaboration, pipeline.id, currentUser, trackActivity]);

  // Advanced Validation and Compliance Functions
  const performAdvancedValidation = useCallback(async () => {
    try {
      // Comprehensive pipeline validation
      const validation = await validatePipeline(pipeline.id);
      setValidationResults(validation);
      
      // Cross-group compatibility check
      const compatibility = await validateCrossGroupPipeline(pipeline, {
        workspaceId: currentWorkspace?.id,
        userPermissions,
        resourceConstraints: await getWorkspaceResourceLimits()
      });
      setCrossGroupCompatibility(compatibility);
      
      // Security validation
      const security = await validatePipelineCompatibility({
        pipeline,
        securityPolicies: workspaceResources?.securityPolicies,
        complianceRules: workspaceResources?.complianceRules
      });
      setSecurityValidation(security);
      
      // Governance compliance check
      const governance = await validateCrossGroupCompatibility(pipeline, {
        workspaceId: currentWorkspace?.id,
        userPermissions,
        currentResources: workspaceResources
      });
      setGovernanceCompliance(governance);
      
    } catch (error) {
      console.error('Advanced validation failed:', error);
    }
  }, [pipeline, currentWorkspace, userPermissions, workspaceResources, validatePipeline, validateCrossGroupPipeline]);

  // Intelligent Auto-Layout Algorithm
  const applyAutoLayout = useCallback(async () => {
    if (!autoLayoutEnabled || !pipeline.stages.length) return;
    
    try {
      // Force-directed layout algorithm
      const simulation = d3.forceSimulation(pipeline.stages)
        .force('link', d3.forceLink(pipeline.connections).id((d: any) => d.id))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(400, 300))
        .force('collision', d3.forceCollide().radius(50));
      
      // Apply layout over time
      for (let i = 0; i < 300; ++i) simulation.tick();
      
      // Update stage positions
      setPipeline(prev => ({
        ...prev,
        stages: prev.stages.map(stage => {
          const node = simulation.nodes().find((n: any) => n.id === stage.id);
          return node ? { ...stage, position: { x: node.x, y: node.y } } : stage;
        })
      }));
      
      trackActivity('auto_layout_applied', {
        pipeline_id: pipeline.id,
        stages_count: pipeline.stages.length
      });
      
    } catch (error) {
      console.error('Auto-layout failed:', error);
    }
  }, [autoLayoutEnabled, pipeline, trackActivity]);

  // Advanced Resource Optimization
  const optimizeResources = useCallback(async () => {
    try {
      const optimization = await optimizeResourceAllocation({
        pipeline,
        constraints: {
          maxCost: costPrediction?.budget,
          minPerformance: 0.85,
          maxLatency: 10000
        },
        strategy: 'balanced'
      });
      
      setResourceOptimization(optimization);
      setOptimizationSuggestions(optimization.recommendations);
      
      trackActivity('resource_optimization_performed', {
        pipeline_id: pipeline.id,
        optimization_score: optimization.score
      });
      
    } catch (error) {
      console.error('Resource optimization failed:', error);
    }
  }, [pipeline, costPrediction, trackActivity]);

  // Parallel Execution Planning
  const generateExecutionPlan = useCallback(async () => {
    try {
      const executionPlan = await generateOrchestrationPlan({
        pipeline_id: pipeline.id,
        strategy: 'PARALLEL',
        optimize_for: 'performance',
        resource_constraints: await getWorkspaceResourceLimits()
      });
      
      setParallelExecutionPlan(executionPlan);
      
      // Simulate execution to predict bottlenecks
      const simulation = await coordinateExecution({
        plan: executionPlan,
        simulate: true
      });
      setExecutionSimulation(simulation);
      
    } catch (error) {
      console.error('Execution planning failed:', error);
    }
  }, [pipeline.id, getWorkspaceResourceLimits, generateOrchestrationPlan, coordinateExecution]);

  // Data Lineage Tracking
  const trackDataLineage = useCallback(async () => {
    try {
      const lineage = await getCrossGroupMetrics({
        pipeline,
        includeLineage: true,
        traceDataFlow: true
      });
      setDataLineage(lineage);
      
    } catch (error) {
      console.error('Data lineage tracking failed:', error);
    }
  }, [pipeline, getCrossGroupMetrics]);

  // Version Control with backend integration
  const createPipelineVersion = useCallback(async (commitMessage: string) => {
    if (!enableVersionControl) return;
    
    try {
      const versionResponse = await fetch('/api/pipeline-versions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipeline_id: pipeline.id,
          pipeline_data: pipeline,
          commit_message: commitMessage,
          author_id: currentUser?.id,
          workspace_id: currentWorkspace?.id
        })
      });
      
      const versionData = await versionResponse.json();
      
      const version = {
        id: versionData.version_id,
        pipeline: { ...pipeline },
        message: commitMessage,
        author: currentUser?.name || 'Unknown',
        timestamp: new Date(versionData.created_at),
        hash: versionData.commit_hash
      };
      
      setPipelineVersions(prev => [version, ...prev]);
      
      trackActivity('pipeline_version_created', {
        pipeline_id: pipeline.id,
        version_id: version.id,
        message: commitMessage,
        commit_hash: versionData.commit_hash
      });
      
    } catch (error) {
      console.error('Version creation failed:', error);
    }
  }, [enableVersionControl, pipeline, currentUser, currentWorkspace, trackActivity]);

  // Error Prediction and Prevention
  const predictErrors = useCallback(async () => {
    try {
      const predictions = await predictResourceNeeds({
        pipeline,
        historicalData: workspaceResources?.metrics,
        currentLoad: realTimeMetrics
      });
      
      setErrorPredictions(predictions.potentialIssues || []);
      
    } catch (error) {
      console.error('Error prediction failed:', error);
    }
  }, [pipeline, workspaceResources, realTimeMetrics, predictResourceNeeds]);

  // Initialize all advanced features
  useEffect(() => {
    if (pipeline.stages.length > 0) {
      initializeAIAssistant();
      initializeCollaboration();
      performAdvancedValidation();
      trackDataLineage();
      predictErrors();
    }
  }, [pipeline.stages.length, initializeAIAssistant, initializeCollaboration, performAdvancedValidation, trackDataLineage, predictErrors]);

  // Auto-layout when enabled
  useEffect(() => {
    if (autoLayoutEnabled) {
      applyAutoLayout();
    }
  }, [autoLayoutEnabled, applyAutoLayout]);

  // Real-time metrics updates
  useEffect(() => {
    if (!enablePerformancePrediction) return;
    
    const interval = setInterval(async () => {
      try {
        const metrics = await getResourceOrchestrationMetrics({
          pipeline_id: pipeline.id,
          real_time: true
        });
        setRealTimeMetrics(metrics);
      } catch (error) {
        console.error('Failed to fetch real-time metrics:', error);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [enablePerformancePrediction, pipeline.id, getResourceOrchestrationMetrics]);

  return (
    <TooltipProvider>
      <div className={`flex h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${className}`}>
        {/* Stage Library */}
        {showStageLibrary && (
          <div className="w-80 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-y-auto">
            <div className="sticky top-0 bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Pipeline Stages</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search stages..."
                  value={stageLibrarySearch}
                  onChange={(e) => setStageLibrarySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {stagesLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-2">Loading stages...</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {filteredStages.map((stage) => {
                  const Icon = stage.icon;
                  return (
                    <Card
                      key={stage.id}
                      className="p-3 cursor-grab hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-600"
                      draggable
                      onDragStart={() => handleStageDragStart(stage)}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${stage.gradient})` }}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                            {stage.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {stage.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {stage.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(stage.typical_duration / 60)}m</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!showStageLibrary && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStageLibrary(true)}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Stages
                  </Button>
                )}
                
                <div className="flex items-center space-x-2">
                  <Input
                    value={pipeline.name}
                    onChange={(e) => setPipeline(prev => ({ ...prev, name: e.target.value }))}
                    className="w-64"
                    placeholder="Pipeline name..."
                  />
                  <Badge variant={pipeline.status === 'draft' ? 'secondary' : 'default'}>
                    {pipeline.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>

                <span className="text-sm text-slate-500 min-w-[4rem] text-center">
                  {Math.round(canvasTransform.scale * 100)}%
                </span>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-6" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowTemplateDialog(true)}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Templates</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save Pipeline</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowExecutionDialog(true)}
                      disabled={!pipeline.stages.length || isExecuting}
                    >
                      {isExecuting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Execute Pipeline</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowAdvancedConfig(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Configuration
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowResourceDialog(true)}>
                      <Cpu className="h-4 w-4 mr-2" />
                      Resource Management
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Export Pipeline
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Pipeline
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Pipeline Canvas */}
          <div 
            ref={containerRef}
            className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-900"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onWheel={handleCanvasWheel}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
          >
            {/* Grid Background */}
            <svg
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `
                  radial-gradient(circle, #e2e8f0 1px, transparent 1px)
                `,
                backgroundSize: `${20 * canvasTransform.scale}px ${20 * canvasTransform.scale}px`,
                backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`
              }}
            />

            {/* Pipeline Canvas */}
            <svg
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            >
              <g transform={`translate(${canvasTransform.x}, ${canvasTransform.y}) scale(${canvasTransform.scale})`}>
                {/* Render Connections */}
                {pipeline.connections.map((connection) => {
                  const sourceStage = pipeline.stages.find(s => s.id === connection.source_stage_id);
                  const targetStage = pipeline.stages.find(s => s.id === connection.target_stage_id);
                  
                  if (!sourceStage || !targetStage) return null;

                  const flowConfig = CONDITIONAL_FLOW_TYPES[connection.type] || CONDITIONAL_FLOW_TYPES.SUCCESS;
                  
                  return (
                    <g key={connection.id}>
                      <defs>
                        <marker
                          id={`arrowhead-${connection.id}`}
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill={flowConfig?.color || '#10b981'}
                          />
                        </marker>
                      </defs>
                      <line
                        x1={sourceStage.position.x + 100}
                        y1={sourceStage.position.y + 40}
                        x2={targetStage.position.x}
                        y2={targetStage.position.y + 40}
                        stroke={flowConfig?.color || '#10b981'}
                        strokeWidth="2"
                        markerEnd={`url(#arrowhead-${connection.id})`}
                        className={`cursor-pointer transition-opacity ${
                          selectedConnection === connection.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                        }`}
                        onClick={() => setSelectedConnection(connection.id)}
                      />
                      <text
                        x={(sourceStage.position.x + targetStage.position.x + 100) / 2}
                        y={(sourceStage.position.y + targetStage.position.y + 80) / 2}
                        fill={flowConfig?.color || '#10b981'}
                        fontSize="10"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {flowConfig?.label || 'Success'}
                      </text>
                    </g>
                  );
                })}

                {/* Render Stages */}
                {pipeline.stages.map((stage) => {
                  const stageConfig = CROSS_SPA_PIPELINE_STAGES[stage.type.toUpperCase()];
                  if (!stageConfig) return null;

                  const Icon = stageConfig.icon;
                  const isSelected = selectedStage === stage.id;
                  const isHovered = hoveredStage === stage.id;

                  return (
                    <g key={stage.id}>
                      <foreignObject
                        x={stage.position.x}
                        y={stage.position.y}
                        width="200"
                        height="80"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredStage(stage.id)}
                        onMouseLeave={() => setHoveredStage(null)}
                        onClick={() => setSelectedStage(stage.id)}
                      >
                        <div className={`w-full h-full rounded-lg p-3 border-2 transition-all duration-200 ${
                          isSelected 
                            ? 'border-blue-500 shadow-lg bg-white dark:bg-slate-800' 
                            : isHovered
                              ? 'border-blue-300 shadow-md bg-white dark:bg-slate-800'
                              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-6 h-6 rounded flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, ${stageConfig.gradient})` }}
                            >
                              <Icon className="h-3 w-3 text-white" />
                            </div>
                            <h4 className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate flex-1">
                              {stage.name}
                            </h4>
                            <div className={`w-2 h-2 rounded-full ${
                              stage.status === 'running' ? 'bg-blue-500 animate-pulse' :
                              stage.status === 'completed' ? 'bg-green-500' :
                              stage.status === 'failed' ? 'bg-red-500' :
                              'bg-slate-300'
                            }`} />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                            {stage.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(stage.metadata.estimated_duration / 60)}m</span>
                            </div>
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {stage.metadata.category}
                            </Badge>
                          </div>
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Empty State */}
            {pipeline.stages.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <Workflow className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Start Building Your Pipeline
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Drag stages from the library or use a template to get started with your data governance pipeline.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowTemplateDialog(true)}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button
                      onClick={() => setShowStageLibrary(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stage
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pipeline Stats Footer */}
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6 text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-1">
                  <Layers className="h-4 w-4" />
                  <span>{pipeline.stages.length} stages</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitBranch className="h-4 w-4" />
                  <span>{pipeline.connections.length} connections</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>~{Math.round(pipeline.estimated_duration / 60)} minutes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>Complexity: {pipeline.complexity_score.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isValidating && (
                  <Badge variant="secondary" className="text-xs">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mr-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </motion.div>
                    Validating
                  </Badge>
                )}
                
                <Badge variant={pipeline.status === 'valid' ? 'default' : 'secondary'}>
                  {pipeline.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <AnimatePresence>
          {showProperties && selectedStage && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {(() => {
                const stage = pipeline.stages.find(s => s.id === selectedStage);
                if (!stage) return null;

                const stageConfig = CROSS_SPA_PIPELINE_STAGES[stage.type.toUpperCase() as keyof typeof CROSS_SPA_PIPELINE_STAGES];

                return (
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Stage Properties</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${stageConfig.gradient}`}>
                          <stageConfig.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">{stage.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{stageConfig.spa_integration}</p>
                        </div>
                      </div>
                    </div>

                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-6">
                        {/* Basic Information */}
                        <div>
                          <Label htmlFor="stage-name" className="text-sm font-medium">Stage Name</Label>
                          <Input
                            id="stage-name"
                            value={stage.name}
                            onChange={(e) => setPipeline(prev => ({
                              ...prev,
                              stages: prev.stages.map(s => 
                                s.id === selectedStage ? { ...s, name: e.target.value } : s
                              )
                            }))}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="stage-description" className="text-sm font-medium">Description</Label>
                          <Textarea
                            id="stage-description"
                            value={stage.description}
                            onChange={(e) => setPipeline(prev => ({
                              ...prev,
                              stages: prev.stages.map(s => 
                                s.id === selectedStage ? { ...s, description: e.target.value } : s
                              )
                            }))}
                            className="mt-1"
                            rows={3}
                          />
                        </div>

                        {/* Resource Requirements */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">Resource Requirements</h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-slate-600 dark:text-slate-400">CPU Cores</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Slider
                                  value={[stage.configuration.resource_requirements.cpu]}
                                  onValueChange={([value]) => setPipeline(prev => ({
                                    ...prev,
                                    stages: prev.stages.map(s => 
                                      s.id === selectedStage ? {
                                        ...s,
                                        configuration: {
                                          ...s.configuration,
                                          resource_requirements: {
                                            ...s.configuration.resource_requirements,
                                            cpu: value
                                          }
                                        }
                                      } : s
                                    )
                                  }))}
                                  max={16}
                                  min={0.5}
                                  step={0.5}
                                  className="flex-1"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[3rem]">
                                  {stage.configuration.resource_requirements.cpu}
                                </span>
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs text-slate-600 dark:text-slate-400">Memory (GB)</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Slider
                                  value={[stage.configuration.resource_requirements.memory]}
                                  onValueChange={([value]) => setPipeline(prev => ({
                                    ...prev,
                                    stages: prev.stages.map(s => 
                                      s.id === selectedStage ? {
                                        ...s,
                                        configuration: {
                                          ...s.configuration,
                                          resource_requirements: {
                                            ...s.configuration.resource_requirements,
                                            memory: value
                                          }
                                        }
                                      } : s
                                    )
                                  }))}
                                  max={64}
                                  min={1}
                                  step={1}
                                  className="flex-1"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[3rem]">
                                  {stage.configuration.resource_requirements.memory}GB
                                </span>
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs text-slate-600 dark:text-slate-400">Storage (GB)</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Slider
                                  value={[stage.configuration.resource_requirements.storage]}
                                  onValueChange={([value]) => setPipeline(prev => ({
                                    ...prev,
                                    stages: prev.stages.map(s => 
                                      s.id === selectedStage ? {
                                        ...s,
                                        configuration: {
                                          ...s.configuration,
                                          resource_requirements: {
                                            ...s.configuration.resource_requirements,
                                            storage: value
                                          }
                                        }
                                      } : s
                                    )
                                  }))}
                                  max={100}
                                  min={0.1}
                                  step={0.1}
                                  className="flex-1"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[3rem]">
                                  {stage.configuration.resource_requirements.storage}GB
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Execution Settings */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">Execution Settings</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Parallel Execution</Label>
                              <Switch
                                checked={stage.configuration.parallel_execution}
                                onCheckedChange={(checked) => setPipeline(prev => ({
                                  ...prev,
                                  stages: prev.stages.map(s => 
                                    s.id === selectedStage ? {
                                      ...s,
                                      configuration: {
                                        ...s.configuration,
                                        parallel_execution: checked
                                      }
                                    } : s
                                  )
                                }))}
                              />
                            </div>

                            <div>
                              <Label className="text-sm">Timeout (minutes)</Label>
                              <Input
                                type="number"
                                value={Math.round(stage.configuration.timeout / 60000)}
                                onChange={(e) => setPipeline(prev => ({
                                  ...prev,
                                  stages: prev.stages.map(s => 
                                    s.id === selectedStage ? {
                                      ...s,
                                      configuration: {
                                        ...s.configuration,
                                        timeout: parseInt(e.target.value) * 60000
                                      }
                                    } : s
                                  )
                                }))}
                                className="mt-1"
                                min="1"
                              />
                            </div>

                            <div>
                              <Label className="text-sm">Max Retries</Label>
                              <Input
                                type="number"
                                value={stage.configuration.retry_policy.max_retries}
                                onChange={(e) => setPipeline(prev => ({
                                  ...prev,
                                  stages: prev.stages.map(s => 
                                    s.id === selectedStage ? {
                                      ...s,
                                      configuration: {
                                        ...s.configuration,
                                        retry_policy: {
                                          ...s.configuration.retry_policy,
                                          max_retries: parseInt(e.target.value)
                                        }
                                      }
                                    } : s
                                  )
                                }))}
                                className="mt-1"
                                min="0"
                                max="10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Stage Steps */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">Pipeline Steps</h4>
                          <div className="space-y-2">
                            {stage.configuration.steps.map((step, index) => (
                              <Card key={step.id} className="p-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                      {step.name}
                                    </h5>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                      {step.description}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(step.estimated_duration / 60)}m
                                  </Badge>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Health Status */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">Health Status</h4>
                          <div className="flex items-center space-x-2">
                            {stage.health === 'healthy' && (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
                              </>
                            )}
                            {stage.health === 'degraded' && (
                              <>
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-yellow-600 dark:text-yellow-400">Degraded</span>
                              </>
                            )}
                            {stage.health === 'failed' && (
                              <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-red-600 dark:text-red-400">Failed</span>
                              </>
                            )}
                            {stage.health === 'unknown' && (
                              <>
                                <Circle className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">Unknown</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pipeline Templates Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Pipeline Templates</DialogTitle>
              <DialogDescription>
                Choose from pre-built pipeline templates to get started quickly.
              </DialogDescription>
            </DialogHeader>

            {templatesLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-4">Loading templates...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {Object.values(PIPELINE_TEMPLATES).map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant={template.complexity === 'high' ? 'destructive' : template.complexity === 'medium' ? 'default' : 'secondary'}>
                          {template.complexity}
                        </Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {template.stages.slice(0, 4).map((stageType) => {
                            const stageConfig = CROSS_SPA_PIPELINE_STAGES[stageType.toUpperCase()];
                            return stageConfig ? (
                              <Badge key={stageType} variant="outline" className="text-xs">
                                {stageConfig.name}
                              </Badge>
                            ) : null;
                          })}
                          {template.stages.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.stages.length - 4} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Category:</span>
                            <span className="font-medium">{template.category}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Estimated Duration:</span>
                            <span className="font-medium">{Math.round(template.estimated_duration / 3600)} hours</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        onClick={() => applyTemplate(template.id)}
                        className="w-full"
                      >
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Pipeline Execution Dialog */}
        <Dialog open={showExecutionDialog} onOpenChange={setShowExecutionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Execute Pipeline</DialogTitle>
              <DialogDescription>
                Review pipeline configuration and start execution.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">Pipeline Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Stages:</span>
                    <span className="ml-2 font-medium">{pipeline.stages.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Connections:</span>
                    <span className="ml-2 font-medium">{pipeline.connections.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Est. Duration:</span>
                    <span className="ml-2 font-medium">{Math.round(pipeline.estimated_duration / 60)} minutes</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Complexity:</span>
                    <span className="ml-2 font-medium">{pipeline.complexity_score.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {pipeline.stages.length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Stages</AlertTitle>
                  <AlertDescription>
                    Add at least one stage to the pipeline before execution.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowExecutionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExecutePipeline}
                disabled={!pipeline.stages.length || isExecuting}
              >
                {isExecuting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </motion.div>
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Pipeline
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Resource Management Dialog */}
        <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Resource Management</DialogTitle>
              <DialogDescription>
                Configure resource allocation and monitoring for the pipeline.
              </DialogDescription>
            </DialogHeader>

            {resourceTypesLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-2">Loading resource configuration...</p>
              </div>
            ) : (
              <Tabs defaultValue="allocation" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="allocation">Allocation</TabsTrigger>
                  <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                  <TabsTrigger value="optimization">Optimization</TabsTrigger>
                </TabsList>
                
                <TabsContent value="allocation" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(RESOURCE_TYPES).map(([key, config]) => {
                      const totalUsage = pipeline.stages.reduce((acc, stage) => {
                        const requirement = stage.configuration.resource_requirements[key.toLowerCase() as keyof typeof stage.configuration.resource_requirements];
                        return acc + (typeof requirement === 'number' ? requirement : parseFloat(requirement as string) || 0);
                      }, 0);
                      
                      return (
                        <Card key={key} className="p-4">
                          <h4 className="font-medium mb-2">{config.name}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Current Usage:</span>
                              <span className="font-medium">{totalUsage.toFixed(1)} {config.unit}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Maximum:</span>
                              <span className="font-medium">{config.max} {config.unit}</span>
                            </div>
                            <Progress 
                              value={(totalUsage / config.max) * 100} 
                              className="h-2"
                            />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="monitoring" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Real-time Monitoring</span>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Resource Alerts</span>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Performance Metrics</span>
                      <Switch checked={true} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="optimization" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Auto-scaling</span>
                      <Switch checked={pipeline.configuration.resource_allocation === 'auto'} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cost Optimization</span>
                      <Switch checked={enableCostOptimization} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Performance Optimization</span>
                      <Switch checked={enablePerformancePrediction} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Advanced AI Assistant Panel */}
        <AnimatePresence>
          {showAIAssistant && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    AI Assistant
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIAssistant(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${aiAssistantActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-slate-600 dark:text-slate-400">
                    {aiAssistantActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="p-4 space-y-6">
                  {/* Stage Recommendations */}
                  {stageRecommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Stage Recommendations
                      </h4>
                      <div className="space-y-2">
                        {stageRecommendations.slice(0, 3).map((rec, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">{rec.stageName}</h5>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                  {rec.reason}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {rec.confidence}% match
                                  </Badge>
                                  <Button size="sm" variant="outline" className="h-6 text-xs">
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optimization Suggestions */}
                  {optimizationSuggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Optimization Suggestions
                      </h4>
                      <div className="space-y-2">
                        {optimizationSuggestions.slice(0, 3).map((suggestion, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">{suggestion.title}</h5>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                  {suggestion.description}
                                </p>
                                {suggestion.impact && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {suggestion.impact.performance}% faster
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      ${suggestion.impact.cost} saved
                                    </Badge>
                                  </div>
                                )}
                                <Button size="sm" variant="outline" className="h-6 text-xs mt-2">
                                  Apply
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Predictions */}
                  {errorPredictions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Potential Issues
                      </h4>
                      <div className="space-y-2">
                        {errorPredictions.slice(0, 3).map((error, index) => (
                          <Card key={index} className="p-3 border-red-200 dark:border-red-800">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-sm">{error.issue}</h5>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                  {error.description}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge variant="destructive" className="text-xs">
                                    {error.severity}
                                  </Badge>
                                  <Button size="sm" variant="outline" className="h-6 text-xs">
                                    Fix
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Prediction */}
                  {performancePrediction && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Performance Prediction
                      </h4>
                      <Card className="p-3">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Estimated Duration:</span>
                            <span className="font-medium">{performancePrediction.duration}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Resource Usage:</span>
                            <span className="font-medium">{performancePrediction.resourceUsage}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Success Probability:</span>
                            <span className="font-medium text-green-600">{performancePrediction.successRate}%</span>
                          </div>
                          <Progress value={performancePrediction.successRate} className="h-2" />
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Cost Analysis */}
                  {costPrediction && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cost Analysis
                      </h4>
                      <Card className="p-3">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Estimated Cost:</span>
                            <span className="font-medium">${costPrediction.estimatedCost}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Budget Impact:</span>
                            <span className={`font-medium ${costPrediction.budgetImpact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {costPrediction.budgetImpact > 0 ? '+' : ''}{costPrediction.budgetImpact}%
                            </span>
                          </div>
                          {costPrediction.costBreakdown && (
                            <div className="space-y-1">
                              {Object.entries(costPrediction.costBreakdown).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">{key}:</span>
                                  <span>${value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time Collaboration Panel */}
        <AnimatePresence>
          {showCollaborationPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Collaboration
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCollaborationPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {collaborators.length} active collaborators
                  </span>
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="p-4 space-y-6">
                  {/* Active Collaborators */}
                  <div>
                    <h4 className="font-medium mb-3">Active Users</h4>
                    <div className="space-y-2">
                      {collaborators.map((collaborator) => (
                        <div key={collaborator.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{collaborator.name}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">{collaborator.role}</div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${collaborator.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Comments */}
                  <div>
                    <h4 className="font-medium mb-3">Recent Comments</h4>
                    <div className="space-y-2">
                      {realtimeComments.slice(0, 5).map((comment) => (
                        <Card key={comment.id} className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-3 w-3 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
                                <span className="font-medium">{comment.author}</span>
                                <span>•</span>
                                <span>{new Date(comment.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-sm">{comment.text}</p>
                              {comment.stageId && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  Stage: {comment.stageName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Collaboration History */}
                  <div>
                    <h4 className="font-medium mb-3">Recent Changes</h4>
                    <div className="space-y-2">
                      {collaborationHistory.slice(0, 5).map((change) => (
                        <div key={change.id} className="flex items-center gap-3 p-2 text-sm">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <Edit3 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{change.action}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              by {change.author} • {new Date(change.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Input
                    placeholder="Add a comment..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        // Handle comment submission
                        const newComment = {
                          id: Date.now().toString(),
                          text: e.currentTarget.value,
                          author: currentUser?.name || 'Anonymous',
                          timestamp: new Date(),
                          stageId: selectedStage
                        };
                        setRealtimeComments(prev => [newComment, ...prev]);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <Label>Collaborative Mode:</Label>
                  <Select value={collaborativeMode} onValueChange={setCollaborativeMode}>
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edit">Edit</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="comment">Comment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Version Control Panel */}
        <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Version History
              </DialogTitle>
              <DialogDescription>
                View and manage pipeline versions
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-4">
              <div className="flex-1">
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {pipelineVersions.map((version) => (
                      <Card key={version.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{version.id}</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">{version.message}</div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-600 dark:text-slate-400">
                            <div>{version.author}</div>
                            <div>{new Date(version.timestamp).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {version.hash}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {version.pipeline.stages.length} stages
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="w-80 border-l pl-4">
                <h4 className="font-medium mb-3">Create New Version</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="commit-message">Commit Message</Label>
                    <Textarea
                      id="commit-message"
                      placeholder="Describe your changes..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={() => createPipelineVersion('Manual commit')} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Create Version
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Pipeline
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Pipeline
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Pipeline
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Advanced Settings Panel */}
        <Dialog open={showAdvancedConfig} onOpenChange={setShowAdvancedConfig}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Advanced Pipeline Configuration</DialogTitle>
              <DialogDescription>
                Configure advanced pipeline settings and features
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="visualization" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
                <TabsTrigger value="ai">AI Features</TabsTrigger>
                <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="visualization" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Visualization Mode</Label>
                    <Select value={visualizationMode} onValueChange={setVisualizationMode}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(VISUALIZATION_MODES).map(([key, mode]) => (
                          <SelectItem key={key} value={key}>
                            {mode.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Auto-layout</Label>
                      <Switch checked={autoLayoutEnabled} onCheckedChange={setAutoLayoutEnabled} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Grid snap</Label>
                      <Switch checked={gridSnapEnabled} onCheckedChange={setGridSnapEnabled} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Show grid</Label>
                      <Switch checked={showGridLines} onCheckedChange={setShowGridLines} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Mini-map</Label>
                      <Switch checked={showMiniMap} onCheckedChange={setShowMiniMap} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(AI_ASSISTANT_FEATURES).map(([key, feature]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{feature.name}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{feature.description}</p>
                      </div>
                      <Switch defaultChecked={feature.enabled} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="collaboration" className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(COLLABORATION_FEATURES).map(([key, feature]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{feature.name}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{feature.description}</p>
                      </div>
                      <Switch defaultChecked={feature.enabled} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Performance Prediction</Label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Enable ML-based performance prediction</p>
                    </div>
                    <Switch checked={enablePerformancePrediction} onCheckedChange={() => {}} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Cost Optimization</Label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Enable real-time cost analysis</p>
                    </div>
                    <Switch checked={enableCostOptimization} onCheckedChange={() => {}} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Resource Monitoring</Label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Monitor resource usage in real-time</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PipelineDesigner;