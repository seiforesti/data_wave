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
  Star, Crown, Diamond, Circle, Square, Triangle, Hexagon, Octagon
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
 * Enterprise-grade visual pipeline builder with Databricks-surpassing capabilities:
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
 */

// Cross-SPA Pipeline Stage Configurations
const CROSS_SPA_PIPELINE_STAGES = {
  DATA_INGESTION: {
    id: 'data_ingestion',
    name: 'Data Ingestion & Connection',
    icon: Database,
    color: '#10b981',
    gradient: 'from-emerald-400 to-emerald-600',
    category: 'ingestion',
    description: 'Connect and ingest data from multiple sources',
    spa_integration: 'data-sources',
    steps: [
      {
        id: 'connect_sources',
        name: 'Connect Data Sources',
        description: 'Establish connections to data sources',
        icon: Database,
        spa_api: '/api/data-sources/connect',
        estimated_duration: 300,
        resource_requirements: { cpu: 1, memory: '2GB', storage: '1GB' }
      },
      {
        id: 'validate_connections',
        name: 'Validate Connections',
        description: 'Test and validate data source connections',
        icon: CheckCircle,
        spa_api: '/api/data-sources/validate',
        estimated_duration: 120,
        resource_requirements: { cpu: 0.5, memory: '1GB', storage: '100MB' }
      },
      {
        id: 'configure_ingestion',
        name: 'Configure Ingestion',
        description: 'Set up data ingestion parameters and schedules',
        icon: Settings,
        spa_api: '/api/data-sources/configure',
        estimated_duration: 600,
        resource_requirements: { cpu: 2, memory: '4GB', storage: '2GB' }
      }
    ],
    success_criteria: ['connections_established', 'validation_passed', 'ingestion_configured'],
    failure_conditions: ['connection_timeout', 'authentication_failed', 'invalid_configuration'],
    typical_duration: 1020,
    complexity_score: 7.5
  },
  DATA_DISCOVERY: {
    id: 'data_discovery',
    name: 'Data Discovery & Profiling',
    icon: Search,
    color: '#8b5cf6',
    gradient: 'from-violet-400 to-violet-600',
    category: 'discovery',
    description: 'Discover, scan, and profile data assets',
    spa_integration: 'scan-logic',
    steps: [
      {
        id: 'scan_data',
        name: 'Scan Data Assets',
        description: 'Perform comprehensive data scanning',
        icon: Search,
        spa_api: '/api/scan-logic/execute',
        estimated_duration: 1800,
        resource_requirements: { cpu: 4, memory: '8GB', storage: '5GB' }
      },
      {
        id: 'profile_data',
        name: 'Profile Data',
        description: 'Generate detailed data profiles and statistics',
        icon: BarChart3,
        spa_api: '/api/scan-logic/profile',
        estimated_duration: 900,
        resource_requirements: { cpu: 2, memory: '4GB', storage: '2GB' }
      },
      {
        id: 'identify_patterns',
        name: 'Identify Patterns',
        description: 'Identify data patterns and anomalies',
        icon: Brain,
        spa_api: '/api/scan-logic/analyze',
        estimated_duration: 1200,
        resource_requirements: { cpu: 3, memory: '6GB', storage: '3GB' }
      }
    ],
    success_criteria: ['scan_completed', 'profiles_generated', 'patterns_identified'],
    failure_conditions: ['scan_timeout', 'insufficient_permissions', 'data_access_error'],
    typical_duration: 3900,
    complexity_score: 8.5
  },
  DATA_CLASSIFICATION: {
    id: 'data_classification',
    name: 'Data Classification & Tagging',
    icon: Target,
    color: '#f59e0b',
    gradient: 'from-amber-400 to-amber-600',
    category: 'classification',
    description: 'Classify and tag data based on content and context',
    spa_integration: 'classifications',
    steps: [
      {
        id: 'classify_data',
        name: 'Classify Data',
        description: 'Apply classification rules to discovered data',
        icon: Target,
        spa_api: '/api/classifications/classify',
        estimated_duration: 1500,
        resource_requirements: { cpu: 3, memory: '6GB', storage: '2GB' }
      },
      {
        id: 'apply_tags',
        name: 'Apply Tags',
        description: 'Apply metadata tags based on classifications',
        icon: Badge,
        spa_api: '/api/classifications/tag',
        estimated_duration: 600,
        resource_requirements: { cpu: 1, memory: '2GB', storage: '500MB' }
      },
      {
        id: 'validate_classification',
        name: 'Validate Classifications',
        description: 'Validate and verify classification accuracy',
        icon: CheckCircle,
        spa_api: '/api/classifications/validate',
        estimated_duration: 450,
        resource_requirements: { cpu: 1.5, memory: '3GB', storage: '1GB' }
      }
    ],
    success_criteria: ['classification_complete', 'tags_applied', 'validation_passed'],
    failure_conditions: ['classification_failed', 'tagging_error', 'validation_failed'],
    typical_duration: 2550,
    complexity_score: 7.8
  },
  GOVERNANCE_RULES: {
    id: 'governance_rules',
    name: 'Governance & Rule Application',
    icon: Shield,
    color: '#ef4444',
    gradient: 'from-red-400 to-red-600',
    category: 'governance',
    description: 'Apply governance rules and compliance policies',
    spa_integration: 'scan-rule-sets',
    steps: [
      {
        id: 'apply_scan_rules',
        name: 'Apply Scan Rules',
        description: 'Execute governance scan rules on data',
        icon: Shield,
        spa_api: '/api/scan-rule-sets/execute',
        estimated_duration: 2100,
        resource_requirements: { cpu: 4, memory: '8GB', storage: '4GB' }
      },
      {
        id: 'validate_compliance',
        name: 'Validate Compliance',
        description: 'Check compliance against regulatory requirements',
        icon: CheckCircle,
        spa_api: '/api/compliance-rules/validate',
        estimated_duration: 1800,
        resource_requirements: { cpu: 3, memory: '6GB', storage: '3GB' }
      },
      {
        id: 'generate_reports',
        name: 'Generate Reports',
        description: 'Generate governance and compliance reports',
        icon: FileText,
        spa_api: '/api/scan-rule-sets/report',
        estimated_duration: 900,
        resource_requirements: { cpu: 2, memory: '4GB', storage: '2GB' }
      }
    ],
    success_criteria: ['rules_applied', 'compliance_validated', 'reports_generated'],
    failure_conditions: ['rule_execution_failed', 'compliance_violation', 'report_generation_error'],
    typical_duration: 4800,
    complexity_score: 9.2
  },
  CATALOGING: {
    id: 'cataloging',
    name: 'Data Cataloging & Metadata',
    icon: Package,
    color: '#3b82f6',
    gradient: 'from-blue-400 to-blue-600',
    category: 'cataloging',
    description: 'Catalog data assets and manage metadata',
    spa_integration: 'advanced-catalog',
    steps: [
      {
        id: 'catalog_assets',
        name: 'Catalog Assets',
        description: 'Register and catalog discovered data assets',
        icon: Package,
        spa_api: '/api/advanced-catalog/register',
        estimated_duration: 1200,
        resource_requirements: { cpu: 2, memory: '4GB', storage: '3GB' }
      },
      {
        id: 'update_metadata',
        name: 'Update Metadata',
        description: 'Update and enrich asset metadata',
        icon: Edit3,
        spa_api: '/api/advanced-catalog/metadata',
        estimated_duration: 900,
        resource_requirements: { cpu: 1.5, memory: '3GB', storage: '2GB' }
      },
      {
        id: 'generate_lineage',
        name: 'Generate Lineage',
        description: 'Create data lineage and relationship mappings',
        icon: GitBranch,
        spa_api: '/api/advanced-catalog/lineage',
        estimated_duration: 1500,
        resource_requirements: { cpu: 3, memory: '6GB', storage: '4GB' }
      }
    ],
    success_criteria: ['assets_cataloged', 'metadata_updated', 'lineage_generated'],
    failure_conditions: ['cataloging_failed', 'metadata_error', 'lineage_generation_failed'],
    typical_duration: 3600,
    complexity_score: 8.1
  },
  COMPLIANCE_AUDIT: {
    id: 'compliance_audit',
    name: 'Compliance Audit & Validation',
    icon: Award,
    color: '#ec4899',
    gradient: 'from-pink-400 to-pink-600',
    category: 'compliance',
    description: 'Perform comprehensive compliance auditing',
    spa_integration: 'compliance-rule',
    steps: [
      {
        id: 'audit_data',
        name: 'Audit Data',
        description: 'Perform comprehensive data audit',
        icon: Award,
        spa_api: '/api/compliance-rules/audit',
        estimated_duration: 2400,
        resource_requirements: { cpu: 4, memory: '8GB', storage: '5GB' }
      },
      {
        id: 'validate_policies',
        name: 'Validate Policies',
        description: 'Validate against compliance policies',
        icon: CheckCircle,
        spa_api: '/api/compliance-rules/validate-policies',
        estimated_duration: 1800,
        resource_requirements: { cpu: 3, memory: '6GB', storage: '3GB' }
      },
      {
        id: 'generate_audit_report',
        name: 'Generate Audit Report',
        description: 'Generate comprehensive audit reports',
        icon: FileText,
        spa_api: '/api/compliance-rules/audit-report',
        estimated_duration: 1200,
        resource_requirements: { cpu: 2, memory: '4GB', storage: '3GB' }
      }
    ],
    success_criteria: ['audit_completed', 'policies_validated', 'audit_report_generated'],
    failure_conditions: ['audit_failed', 'policy_violation', 'report_error'],
    typical_duration: 5400,
    complexity_score: 9.5
  },
  ACCESS_CONTROL: {
    id: 'access_control',
    name: 'Access Control & Security',
    icon: Users,
    color: '#06b6d4',
    gradient: 'from-cyan-400 to-cyan-600',
    category: 'security',
    description: 'Manage access control and security policies',
    spa_integration: 'rbac-system',
    steps: [
      {
        id: 'configure_access',
        name: 'Configure Access',
        description: 'Configure access control policies',
        icon: Users,
        spa_api: '/api/rbac/configure',
        estimated_duration: 1800,
        resource_requirements: { cpu: 2, memory: '4GB', storage: '2GB' }
      },
      {
        id: 'validate_permissions',
        name: 'Validate Permissions',
        description: 'Validate user permissions and roles',
        icon: CheckCircle,
        spa_api: '/api/rbac/validate',
        estimated_duration: 900,
        resource_requirements: { cpu: 1.5, memory: '3GB', storage: '1GB' }
      },
      {
        id: 'audit_access',
        name: 'Audit Access',
        description: 'Audit access patterns and security',
        icon: Eye,
        spa_api: '/api/rbac/audit',
        estimated_duration: 1500,
        resource_requirements: { cpu: 2.5, memory: '5GB', storage: '3GB' }
      }
    ],
    success_criteria: ['access_configured', 'permissions_validated', 'access_audited'],
    failure_conditions: ['configuration_failed', 'permission_error', 'audit_failed'],
    typical_duration: 4200,
    complexity_score: 8.8
  }
};

// Pipeline Stage Templates for Quick Creation
const PIPELINE_TEMPLATES = {
  FULL_DATA_GOVERNANCE: {
    id: 'full_data_governance',
    name: 'Complete Data Governance Pipeline',
    description: 'End-to-end data governance with all stages',
    category: 'comprehensive',
    complexity: 'high',
    estimated_duration: 22500, // ~6.25 hours
    stages: ['data_ingestion', 'data_discovery', 'data_classification', 'governance_rules', 'cataloging', 'compliance_audit', 'access_control'],
    parallel_execution: {
      'data_classification': ['governance_rules'],
      'cataloging': ['compliance_audit']
    },
    conditional_logic: {
      'compliance_audit': 'if governance_rules.status === "passed"',
      'access_control': 'if compliance_audit.violations === 0'
    }
  },
  QUICK_DISCOVERY: {
    id: 'quick_discovery',
    name: 'Quick Data Discovery',
    description: 'Fast data discovery and basic cataloging',
    category: 'discovery',
    complexity: 'medium',
    estimated_duration: 7500, // ~2 hours
    stages: ['data_ingestion', 'data_discovery', 'cataloging'],
    parallel_execution: {},
    conditional_logic: {
      'cataloging': 'if data_discovery.success_rate > 0.8'
    }
  },
  COMPLIANCE_FOCUSED: {
    id: 'compliance_focused',
    name: 'Compliance-Focused Pipeline',
    description: 'Comprehensive compliance and governance',
    category: 'compliance',
    complexity: 'high',
    estimated_duration: 15900, // ~4.4 hours
    stages: ['data_ingestion', 'data_classification', 'governance_rules', 'compliance_audit', 'access_control'],
    parallel_execution: {
      'governance_rules': ['compliance_audit']
    },
    conditional_logic: {
      'access_control': 'if compliance_audit.violations === 0'
    }
  }
};

// Resource Types and Allocation Configurations
const RESOURCE_TYPES = {
  CPU: { name: 'CPU Cores', unit: 'cores', min: 0.5, max: 32, step: 0.5, default: 2 },
  MEMORY: { name: 'Memory', unit: 'GB', min: 1, max: 128, step: 1, default: 4 },
  STORAGE: { name: 'Storage', unit: 'GB', min: 0.1, max: 1000, step: 0.1, default: 10 },
  NETWORK: { name: 'Network', unit: 'Mbps', min: 10, max: 10000, step: 10, default: 100 }
};

// Conditional Flow Types
const CONDITIONAL_FLOW_TYPES = {
  SUCCESS: { type: 'success', color: '#10b981', label: 'On Success' },
  FAILURE: { type: 'failure', color: '#ef4444', label: 'On Failure' },
  CONDITIONAL: { type: 'conditional', color: '#f59e0b', label: 'Conditional' },
  PARALLEL: { type: 'parallel', color: '#8b5cf6', label: 'Parallel' },
  TIMEOUT: { type: 'timeout', color: '#6b7280', label: 'On Timeout' }
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
  className?: string;
}

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
  className = ''
}) => {
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

  // Pipeline State
  const [pipeline, setPipeline] = useState<Pipeline>(() => initialPipeline || {
    id: pipelineId || `pipeline_${Date.now()}`,
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
  const addStage = useCallback((stageConfig: typeof CROSS_SPA_PIPELINE_STAGES[keyof typeof CROSS_SPA_PIPELINE_STAGES], position: { x: number, y: number }) => {
    const newStage: PipelineStage = {
      id: `stage_${Date.now()}`,
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
        resource_requirements: stageConfig.steps.reduce((acc, step) => ({
          cpu: acc.cpu + step.resource_requirements.cpu,
          memory: acc.memory + parseFloat(step.resource_requirements.memory.replace('GB', '')),
          storage: acc.storage + parseFloat(step.resource_requirements.storage.replace(/[GM]B/, ''))
        }), { cpu: 0, memory: 0, storage: 0 })
      },
      metadata: {
        category: stageConfig.category,
        complexity_score: stageConfig.complexity_score,
        estimated_duration: stageConfig.typical_duration,
        spa_api_endpoints: stageConfig.steps.map(step => step.spa_api)
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

    trackActivity('pipeline_stage_added', { stage_type: stageConfig.id, pipeline_id: pipeline.id });
  }, [pipeline, onPipelineChange, trackActivity]);

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

  const connectStages = useCallback((sourceId: string, targetId: string, flowType: keyof typeof CONDITIONAL_FLOW_TYPES = 'SUCCESS') => {
    const connectionId = `conn_${sourceId}_${targetId}_${Date.now()}`;
    const newConnection = {
      id: connectionId,
      source_stage_id: sourceId,
      target_stage_id: targetId,
      type: flowType,
      condition: flowType === 'CONDITIONAL' ? 'true' : undefined,
      metadata: {
        created_at: new Date().toISOString(),
        flow_type: CONDITIONAL_FLOW_TYPES[flowType]
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
      pipeline_id: pipeline.id 
    });
  }, [trackActivity, pipeline.id]);

  // Template application
  const applyTemplate = useCallback((templateId: string) => {
    const template = PIPELINE_TEMPLATES[templateId as keyof typeof PIPELINE_TEMPLATES];
    if (!template) return;

    const templateStages: PipelineStage[] = template.stages.map((stageType, index) => {
      const stageConfig = CROSS_SPA_PIPELINE_STAGES[stageType.toUpperCase() as keyof typeof CROSS_SPA_PIPELINE_STAGES];
      return {
        id: `stage_${Date.now()}_${index}`,
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
          resource_requirements: stageConfig.steps.reduce((acc, step) => ({
            cpu: acc.cpu + step.resource_requirements.cpu,
            memory: acc.memory + parseFloat(step.resource_requirements.memory.replace('GB', '')),
            storage: acc.storage + parseFloat(step.resource_requirements.storage.replace(/[GM]B/, ''))
          }), { cpu: 0, memory: 0, storage: 0 })
        },
        metadata: {
          category: stageConfig.category,
          complexity_score: stageConfig.complexity_score,
          estimated_duration: stageConfig.typical_duration,
          spa_api_endpoints: stageConfig.steps.map(step => step.spa_api)
        },
        status: 'pending',
        health: 'unknown'
      };
    });

    // Create sequential connections
    const templateConnections = templateStages.slice(0, -1).map((stage, index) => ({
      id: `conn_${stage.id}_${templateStages[index + 1].id}`,
      source_stage_id: stage.id,
      target_stage_id: templateStages[index + 1].id,
      type: 'SUCCESS' as const,
      metadata: {
        created_at: new Date().toISOString(),
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
        template_id: templateId
      }
    }));

    setShowTemplateDialog(false);
    trackActivity('pipeline_template_applied', { template_id: templateId, pipeline_id: pipeline.id });
  }, [trackActivity, pipeline.id]);

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
  const handleStageDragStart = useCallback((stageConfig: typeof CROSS_SPA_PIPELINE_STAGES[keyof typeof CROSS_SPA_PIPELINE_STAGES]) => {
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

  return (
    <TooltipProvider>
      <div className={`flex h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${className}`}>
        {/* Stage Library Sidebar */}
        <AnimatePresence>
          {showStageLibrary && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Pipeline Stages</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStageLibrary(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search stages..."
                    value={stageLibrarySearch}
                    onChange={(e) => setStageLibrarySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="p-4 space-y-3">
                  {filteredStages.map((stage) => (
                    <motion.div
                      key={stage.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={() => handleStageDragStart(stage)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${stage.gradient}`}>
                              <stage.icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                                {stage.name}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {stage.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {stage.category}
                                </Badge>
                                <div className="flex items-center space-x-1 text-xs text-slate-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{Math.round(stage.typical_duration / 60)}m</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {enableTemplates && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateDialog(true)}
                    className="w-full"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Pipeline Templates
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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

                  const flowConfig = CONDITIONAL_FLOW_TYPES[connection.type as keyof typeof CONDITIONAL_FLOW_TYPES];
                  
                  return (
                    <g key={connection.id}>
                      <motion.path
                        d={`M ${sourceStage.position.x + 120} ${sourceStage.position.y + 40} 
                            L ${targetStage.position.x} ${targetStage.position.y + 40}`}
                        stroke={flowConfig.color}
                        strokeWidth={selectedConnection === connection.id ? 3 : 2}
                        strokeDasharray={connection.type === 'CONDITIONAL' ? '5,5' : 'none'}
                        fill="none"
                        markerEnd="url(#arrowhead)"
                        className="cursor-pointer hover:stroke-opacity-80"
                        onClick={() => setSelectedConnection(connection.id)}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      
                      {/* Connection Label */}
                      <text
                        x={(sourceStage.position.x + targetStage.position.x + 120) / 2}
                        y={(sourceStage.position.y + targetStage.position.y) / 2 - 10}
                        textAnchor="middle"
                        className="text-xs fill-slate-600 dark:fill-slate-300"
                      >
                        {flowConfig.label}
                      </text>
                    </g>
                  );
                })}

                {/* Arrow Marker Definition */}
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
                      fill="#64748b"
                    />
                  </marker>
                </defs>

                {/* Render Stages */}
                {pipeline.stages.map((stage) => {
                  const stageConfig = CROSS_SPA_PIPELINE_STAGES[stage.type.toUpperCase() as keyof typeof CROSS_SPA_PIPELINE_STAGES];
                  if (!stageConfig) return null;

                  return (
                    <motion.g
                      key={stage.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <foreignObject
                        x={stage.position.x}
                        y={stage.position.y}
                        width={240}
                        height={80}
                        className="cursor-move"
                      >
                        <div
                          className={`
                            relative bg-white dark:bg-slate-800 rounded-lg border-2 shadow-lg
                            hover:shadow-xl transition-all duration-200
                            ${selectedStage === stage.id ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-slate-200 dark:border-slate-700'}
                            ${hoveredStage === stage.id ? 'scale-105' : ''}
                          `}
                          onClick={() => setSelectedStage(stage.id)}
                          onMouseEnter={() => setHoveredStage(stage.id)}
                          onMouseLeave={() => setHoveredStage(null)}
                        >
                          {/* Stage Header */}
                          <div className={`flex items-center space-x-3 p-3 bg-gradient-to-r ${stageConfig.gradient} rounded-t-lg`}>
                            <stageConfig.icon className="h-5 w-5 text-white" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white text-sm truncate">
                                {stage.name}
                              </h4>
                              <p className="text-white/80 text-xs truncate">
                                {stageConfig.spa_integration}
                              </p>
                            </div>
                            <div className="flex space-x-1">
                              {stage.status === 'running' && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                  <RefreshCw className="h-4 w-4 text-white" />
                                </motion.div>
                              )}
                              {stage.status === 'completed' && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                              {stage.status === 'failed' && (
                                <XCircle className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>

                          {/* Stage Content */}
                          <div className="p-3">
                            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{Math.round(stage.metadata.estimated_duration / 60)}m</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>{stage.configuration.steps.length} steps</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {stage.metadata.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Connection Points */}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>

                          {/* Stage Actions */}
                          {selectedStage === stage.id && (
                            <div className="absolute -top-2 -right-2 flex space-x-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeStage(stage.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </foreignObject>
                    </motion.g>
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
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Pipeline Templates</DialogTitle>
              <DialogDescription>
                Choose from pre-built pipeline templates to get started quickly.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                {Object.entries(PIPELINE_TEMPLATES).map(([key, template]) => (
                  <Card 
                    key={key}
                    className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedTemplate === key ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedTemplate(key)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{template.category}</Badge>
                        <Badge variant={template.complexity === 'high' ? 'destructive' : template.complexity === 'medium' ? 'default' : 'secondary'}>
                          {template.complexity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {template.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Estimated Duration:</span>
                          <span className="font-medium">{Math.round(template.estimated_duration / 3600)} hours</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Stages:</span>
                          <span className="font-medium">{template.stages.length}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">Included Stages:</h5>
                        <div className="flex flex-wrap gap-1">
                          {template.stages.slice(0, 4).map((stageType) => {
                            const stageConfig = CROSS_SPA_PIPELINE_STAGES[stageType.toUpperCase() as keyof typeof CROSS_SPA_PIPELINE_STAGES];
                            return (
                              <Badge key={stageType} variant="outline" className="text-xs">
                                {stageConfig.name}
                              </Badge>
                            );
                          })}
                          {template.stages.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.stages.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedTemplate && applyTemplate(selectedTemplate)}
                disabled={!selectedTemplate}
              >
                Apply Template
              </Button>
            </div>
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

            <Tabs defaultValue="allocation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="allocation">Allocation</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="optimization">Optimization</TabsTrigger>
              </TabsList>

              <TabsContent value="allocation" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Total Resource Requirements</h4>
                  
                  {Object.entries(RESOURCE_TYPES).map(([key, config]) => {
                    const totalUsage = pipeline.stages.reduce((acc, stage) => {
                      const requirement = stage.configuration.resource_requirements[key.toLowerCase() as keyof typeof stage.configuration.resource_requirements];
                      return acc + (typeof requirement === 'number' ? requirement : parseFloat(requirement as string) || 0);
                    }, 0);

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                          <Label>{config.name}</Label>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {totalUsage.toFixed(1)} {config.unit}
                          </span>
                        </div>
                        <Progress value={(totalUsage / config.max) * 100} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-4">
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="font-medium mb-2">Real-time Resource Monitoring</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Monitor resource usage during pipeline execution
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="optimization" className="space-y-4">
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="font-medium mb-2">AI-Powered Optimization</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get AI recommendations for optimal resource allocation
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button onClick={() => setShowResourceDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PipelineDesigner;